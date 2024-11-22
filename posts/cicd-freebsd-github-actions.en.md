---
title: "CI/CD with Github Actions on FreeBSD"
date: "2024-11-22"
---

Recently (Nov. 2024) I've been working on some internal projects. They are mainly written in the wonderful language of Elixir, and deployed on some Azure VMs running FreeBSD. Why FreeBSD? Because _I'm too cool to work with pleb operating systems like Windows or Linux; only niche and elegant OSes such as FreeBSD or illumos can match my nobility._

I'm joking. It's simply because they're my own projects this time, so I have the freedom of choosing which environment to deploy, and I'm abusing my freedom to it's limit. Also because those projects are in Elixir, so if eventually we found out that won't work, it will be easy enough to migrate.

(Actually I would die for kind of OS akin to the architecture of NT, but FOSS (or at least open source) and without all the GUI bloats. But I'm not aware of any (mature) such existence yet. Maybe I'l l try to roll one myself sometime.)

Anyhow, now I have a bunch of Elixir codes that are supposed to get built as releases and go to various FreeBSD VMs. It is possible to simply pull down the code on the VMs, manually run `mix release` on each machine, and start a tmux session to start the release. However, anyone can probably tell there are some slight issues with this approach:

- It's tedious.

- It's error-prone since you have to manually type in all the commands every time.

- Building a release typically takes much more resource than running the release. One of the projects uses about 200M when idea, and takes only a little bit more while pumping out tens of thousands of records to the client, yet building it (and all the C stubs coming with all the dependencies) require GBs of RAM. And RAM costs money (even more so in the cloud).

- It kinda defeat the purpose to have a release if you need to install all the building tools on the production machine anyways.

So naturally we would prefer some more elegant solutions.

Since it's already 2024, I'm pretty sure that majority of the people have already heard of the magic phrase "CI/CD". Basically it means the automation of building releases and deploy them onto production servers. Almost all major platforms right now have many ready-to-go solutions for all kind of tech stacks.

But who cares about major platforms? Remember, we're the chosen ones who runs Elixir on FreeBSD.

So naturally I started looking into how to put together some kind of CI/CD solution for our projects. It essentially breaks down into two jobs:

## Building the release

To deploy a release, you first need to build it so you have a release.

Since our codes are all hosted on GitHub, natually I'm thinking of utilizing GitHub Actions, which means to either:

- Use the runners provided by GitHub;

- Or, set up some self-hosted runners.

My first instinct was to go with self-hosted runners, as I certainly won't expect GitHub to provide FreeBSD runners, and self-hosting seems to be a reasonable choice in this situaion. Turns out it's not. GitHub Actions not only doesn't provide FreeBSD runners, they also don't support self-hosted FreeBSD runners as well.

So are we f*cked?

Not really. While GitHub Actions doesn't provide FreeBSD runners directly, you can however spin up a VM insde a runner, and run whatever you like in it. Obviously it's not gonna run at the same performance as a native runner, but for our situation performance is not a big issue. So all we need is to spin up a FreeBSD VM inside a runner, and have the VM do the build.

Actually someone have already done that for us: [this action](https://github.com/vmactions/freebsd-vm) can spin up a FreeBSD vm and take care all the chores like syncing files in and out VM for us. 

I managed to cook up something like this: 

```yaml
name: Build Mix release on FreeBSD

on:
  push:
    branches:
      - dev
      - master

jobs:
  build-and-upload:
    runs-on: ubuntu-latest
    name: Build Mix release on FreeBSD
    steps:
      - uses: actions/checkout@v4
      - name: Set up environment based on brnach
        id: setenvs
        run: |
          if [[ $GITHUB_REF_NAME == 'master' ]]; then
              echo "MIX_ENV=prod" >> "$GITHUB_ENV"
              echo "mix_env=prod" >> "$GITHUB_OUTPUT"
          else
              echo "MIX_ENV=dev" >> "$GITHUB_ENV"
              echo "mix_env=dev" >> "$GITHUB_OUTPUT"
          fi
      - name: Build with FreeBSD
        id: build
        uses: vmactions/freebsd-vm@v1
        with:
          envs: 'MIX_ENV'
          usesh: true
		  # Install necessary build tools
          prepare: |
            pkg install -y elixir-devel erlang-runtime27 ca_root_nss gmake
          run: |
		    # With elixir-devel and erlang-runtime27, we need to setup $PATH so `erl` binary can be found
            export PATH="/usr/local/lib/erlang27/bin:$PATH"
			# Install dependencies
            mix local.hex --force
            mix deps.get
			# This project uses Phoenix, so generate Phoenix release overlays
            mix phx.gen.release
			# Build the release
            mix release
			# Pack the release into a tarball
            cd _build/${MIX_ENV}/rel
            export FILENAME=<project_name>_${GITHUB_REF_NAME}_$(date +"%Y%m%d%H%M%S").tar.zst
            tar -cv --zstd -f $FILENAME <project_name>/*
            echo filename=$FILENAME >> $GITHUB_OUTPUT
      - name: Upload build result
        id: upload
        uses: gemwalletcom/r2-upload@main
        with:
          endpoint: ${{ secrets.R2_ENDPOINT }}
          access_key_id: ${{ secrets.R2_ACCESS_KEY_ID }}
          secret_access_key: ${{ secrets.R2_SECRET_ACCESS_KEY }}
          bucket: ${{ secrets.R2_BUCKET }}
          file: ./_build/${{ steps.setenvs.outputs.mix_env }}/rel/${{ steps.build.outputs.filename }}
          destination: '/<project_name>/${{ github.head_ref || github.ref_name }}/${{ steps.build.outputs.filename }}'
```

It basically just checkout the source, build the release within a FreeBSD VM, then upload the result tarball to our Cloudflare R2 bucket with some random action I found with Google.

Why Cloudflare R2? Well because in our case, a result tarball's size is a little under 10MB, and we might produce at most 100 tarballs every month. In such scenario R2 is essentially free (as in free beer). And I like free thingies.

Now we got our tarball sitting comfortably in R2, we need to deploy them to production server automatically.

## Automated Deployment

This is actually the easier part.

Since we already have the release, all we need to do is just:

1. Get notified when tarball is ready.

2. Fetch the tarball.

3. Unpack the tarball.

4. Issue a `service <service_name> restart`.

All except the first is pretty straightforward and can be handled with a single shell script. The only thing lacking is something to trigger the shell script when there's a new release.

And there's all sorts of solutions for the first one as well. You can have a Node.js or Python script listening to a webhook, you can implement an elaborated serverless infrastructure that perform some kind of acrobat, or you can even make your shell script idempotent and just trigger it with a cron job every 10 minutes.

In my case I don't really need all those fancy features, so I'm going with `webhook` package which you can just `pkg install` on FreeBSD. With a bit help from ChatGPT, I got some JSON like this:

```json
[
  {
    "id": "deploy",
    "execute-command": "/opt/webhook/deploy.sh",
    "command-working-directory": "/opt",
    "response-message": "Deployment started",
    "trigger-rule": {
      "and": [
        {
          "match": {
            "type": "payload-hmac-sha256",
            "secret": "moWB61tSzGUMY9pw5TLmFwNCVJK1eZup3KSs5k4LTV4hK2b5",
            "parameter": {
              "source": "header",
              "name": "X-Hub-Signature-256"
            }
          }
        },
	{
          "match": {
            "type": "value",
            "value": "completed",
            "parameter": {
              "source": "payload",
              "name": "workflow_run.status"
            }
          }
        },
        {
          "match": {
            "type": "value",
            "value": "success",
            "parameter": {
              "source": "payload",
              "name": "workflow_run.conclusion"
            }
          }
        }
      ]
    }
  }
]
```

You can also add some rule and match the branch name as well.

Then I just fired up a tmux session and feed the JSON to the `webhook` within. The proper way to do this is probably to write a service unit under `/usr/local/etc/rc.d`, but I don't really bother doing that yet so that can wait.

Now you just setup an webhook in GitHub settings, set it to fire on "Workflow run" et voilà!
