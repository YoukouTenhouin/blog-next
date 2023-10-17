---
title: "Mostly Flatpak"
date: "2023-10-02"
---

Recently I've been working on building flatpaks; more precisely, building flatpaks automatically from all the binary packages we already have.

By recently, I mean "the past half year". And since all the research finally come to fruition few days ago, I figured it is probably time to write a blog about some of the findings I got during the process.

But before that, I should probably give you some background information.

## What is flatpak, and why?

The lazy way to provide an answer is to simply cite the Wikipedia:

> Flatpak, formerly known as xdg-app, is a utility for software deployment and package management for Linux. It is advertised as offering a sandbox environment in which users can run application software in isolation from the rest of the system.

But that isn't very helpful, so let me give you an introduction in human language:

Basically, it's something like containers, but tweaked for desktop application.

You remember that time your application crash on startup because you updated Qt but forgot to recompile qt-styleplugins, right? Flatpak attempt to solve this by an approach similar to containers: instead of shipping just an application, we ships an entire environment. This means everything required by the application is bundled together, with the exception of kernel itself; and since linux kernel has a very stable interface (so far), it's very unlikely that you'll run into any dependency issues.

Also, since we are shipping applications with its own environment, it also makes sense to run them in a isolated environment as well -- aka sandboxing. This also provides better security. Since the application is running inside a sandbox, we can restrict its access to the "outer" system more precisely, so the process inside the sandbox can't just turn your files outside into a salt pillar.

With those measures in place, there comes an additional benefic: we don't need to modify system root when installing applications. Since the application runs in a sandbox anyway, it won't matter where we store it in the "outer" filesystem. This can be especially useful for read-only root systems, or systems wishing to allow users install their own systems but don't want everyone to have root access.

Now you know what is flatpak and why we want it, there comes the next question:

## How?

So how does flatpak achieve those goals?

There's roughly two aspect to this question: a. How does flatpak construct the application's filesystem? b. How does flatpak create a sandbox for application on runtime?

The second aspect isn't quite related to my research so I won't go deep into it. Hint: take a look at [bubblewrap](https://github.com/containers/bubblewrap).

The first aspect, however, do have something I can elaborate.

## How to store applications on disk

So we need to figure out how to store application on disk, along with its environments.

The most straight forward way is of course to simply dump it somewhere on the filesystem. However, sinces flatpaks ships the entire environment (like containers), this would cause a huge waste of disk spaces.

Container runtimes usually have some kind of layered filesystem for this. Docker for example, have aufs and overlayfs for that, which will "overlay" the application on top of a shared base file system, thus the environment is only stored once, and applications only need to the "diff" relative to the base image, which will provide everything we need to "reassemble" the actual container filesystem on the fly.

And OS with a more advanced filesystem can even just let FS to do the job. Solaris Zones, for example, relies on the CoW features of ZFS to save space.

Flatpak's solution to this is, at face value, seemly much less sophiscated. Flatpaks are divided into two parts: The "application" part, which contains the application files, and the "runtime" part, which is the environment depended on by the application. At runtime, the application is "mounted"[^1] under `/app`, and the latter is mounted under `/usr`, with some tricks to provide things like /etc from contents within those paths.

But there's a little more to that. Behind flatpak is [ostree](https://github.com/ostreedev/ostree), which can be roughly thought as "git but for binary files". It store files as checksumed objects, and filesystem states as commits. When you need to construct a filesystem, it will create hard-links from the repo storage. Therefore, if you have multiple applications depending on the same runtime, the runtime can be "mounted" multiple times, but will only take up disk space once, since all the copies are just hard-links.

"Nice", I heard you say, "so how can we build a flatpak"?


## Building a flatpak: a fancier approach

There is plenty of resources on how to build flatpak the standard way, so again I'm not gonna go too deep into it. Basically you write a manifest specifying what runtime you want, how to get the source and compile it, then let `flatpak-builder` to do the job for you.

But since on [openSUSE](https://www.opensuse.org/) we already have lots of softwares already built as rpms, it seems an awful waste of time and energy to build them again just so we can have them as flatpaks. Is there a way to convert them into flatpaks directly?

And even better, since we are using rpms built on [Open Build Service](https://build.opensuse.org/), is it possible if we let OBS also take over the job for building flatpaks?

Let's give it a thought. Flatpak applications are "mounted" under `/app` at runtime, but most rpms are built with a prefix of `/usr`. There might be hardcoded paths in the binaries, so simply `mv`-ing them might not work. Which means we can't just take the files and shovel them into a flatpak application bundle.

But instead of shovel binaries into `/app`, we can reverse the thought: change the `/usr` of the flatpak. And there is a concept exactly for this: the runtimes.

In other words, we can build the flatpak like this:

1. Build a base system image. This will serve as the foundation for the flatpaks we build. And since we are building from the flatpak from rpms (build originally for a common system), it very much makes sense that we will be using the same base image for all the flatpaks.

2. On top of that, install all the rpms we need into that base image, and turn it into a flatpak runtime. Since runtimes will be "mounted" under `/usr`, there's no prefix issue and most binaries should work.

3. Create a dummy application depending on the previously built runtime. The sore purpose of the application is to carry metadatas necessary for flatpak to run the program, since the runtime can not be executed directly.

With openSUSE, Step 1 and part of step 2 can be managed by [kiwi](https://github.com/OSInside/kiwi). And since OBS have support for kiwi, it's trivial to get a system image with application ready. All there's left is to convert the image we have into a flatpak runtime.

For this, we utilize an OBS feature called post build hooks. This allows us to execute a script after the image is created, and in the script we can manually build an ostree commit containing the filesystem; and since flatpaks are essentially ostree commits with some metadata, this means we now have a flatpak runtime inside the ostree repo, and we can simply `flatpak export-bundle` it.

For step 3, OBS already have enough support for creating an dummy application so it's also trivial -- just create a flatpak project and drop a yaml file in it.

You can find an actual implementation [here](https://build.opensuse.org/project/show/home:yudaike:flatpak-research).

The [runtime-build-rpm](https://build.opensuse.org/package/show/home:yudaike:flatpak-research/runtime-build-rpm) project will bundle the hook scripts into rpm, which will then get pulled in as dependencies when we bulid runtimes, so we will have them in the right place of runtime building environments[^2].

The [org.openSUSE.BasePlatform-v20230516](https://build.opensuse.org/package/show/home:yudaike:flatpak-research/org.openSUSE.BasePlatform-v20230516) project is where the actual runtime image are built. It will pull in the hooks as dependency, so after kiwi have built the filesystem it can be executed to convert that into the base image. We will have to name the project like this (with the version in it) so OBS knows where to pull dependency for the flatpak application building process.

The [org.openSUSE.App.gedit](https://build.opensuse.org/package/show/home:yudaike:flatpak-research/org.openSUSE.App.gedit) and [org.openSUSE.App.Firefox](https://build.opensuse.org/package/show/home:yudaike:flatpak-research/org.openSUSE.App.Firefox) are two examples of application built by this method. You might have noticed that they are derived from two seemly unrelated base runtime. Don't worry, even though the relation between two base images are not explicitly specified, they are still sharing the same binary files so ostree will take care of the deduplication.

## Container, you said?

The fore-mentioned approach can indeed create a flatpak for us, albeit still have some downsides:

1. We will have to create a lot of kiwi profiles with large part of their content copy-pasted. If you have any experience in the industry, you know it's a recipe for maintenance nightmare.

2. OBS is exporting build results as flatpak bundle files. That means if users wants to install our product, they will have to manually download the bundle file for runtime *and* the dummy app, and then manually install them in the correct order.

3. Although ostree can deduplicate the binary files for us on disk, the fact that we still need to download the runtime for each application means the are still tons of duplications during transfer.

Addressing those issues straghtly will need lots of work in both OBS and flatpak. Isn't there something existing that solves those issues for us?

There is: OCI containers.

FYI, OCI containers are the format being used by container runtimes like dockers. Why do I mention that? Well, you see:

1. kiwi already have support for building derived containers, which means we can create a common config for a base runtime, and derive all the specialized runtimes from that one base.

2. There is something called OCI registry, which is basically a repository for containers. And OBS already have support for that.

3. The OCI containers are *layered*. Which means a container is formed by multiple filesystem layers, and multiple containers might share same layers. OCI registries have the ability to let client pull by layer, so if you already have a layer locally you can just skip the transfer.

Whoa! Looks like it perfectly fits into our requirements. There's only one remaining issue: OCI containers are not flatpaks. And even if we somehow convert it into flatpak on OBS, it's no longer a OCI containers, so that will defeat all the purpose.

But who said we must build the flatpak on OBS?

The actual heavy-lifting of flatpak building process is the process of constructing the filesystem for application and its environment. This includes pulling in the rpms, installing it into the filesystem, running scripts to configure the result system. Also in our case rpms are provided by OBS, so we'll want to keep that part on OBS and get the image updated automatically. But this process is actually common for both flatpaks and OCI containers. Therefore, by building an OCI container, even though we does not have a flatpak already, we still got ourselves a solid base. Only thing left here is to commit them into ostree, which is simply a job of unpacking files and recording metadats.

So I decided to try just build an OCI container, and then delay the process of flatpak conversion onto the user machine.

[Here](https://github.com/MosakujiHokuto/flatpak-oci-tools) you can see the demo. It's written in rust because I think it would be cool.

The program will do exactly what we said before: pulling in a OCI container (tailored for converting into flatpak), commit it into ostree locally, and then install it from the local ostree repo. You can try the examples in readme to see it in action.

## Which way is better?

With some prelimitary test, the install process of the container way is about 2x slower than directly installing from flatpak bundles. This is probably due to the extra commit process. However, this is only the final install process; it doesn't count in the transfer slowdown due to duplications. And counting in the user experience difference, currently I believe the container way is actually better.

Of course this is just a early conclusion draw from what we currently have. I'll keep doing research and see what direction we can push even further, so stay turned!

[^1]: It's not an actual mount as in UNIX context, we are just using the word as a metaphor.

[^2]: Inspired by [containment-rpm](https://github.com/SUSE/containment-rpm)
