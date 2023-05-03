---
title: "Coming to Wayland: Sway move note"
date: "2023-05-03"
---

Wayland has been around for years, and as a person who re-reads _Unix Haters Handbook_ every few occasion I've never been a fan of X11. That being said, due to the afraid of breaking my current setup I'm still stuck with X until this holiday.

What happened this holiday? I've finally dropped X and moved to the wayland. This post is a collection of things I think worth noting in the process.

## Original Setup

Before moving on, let's review the setup I had with X, and why I was reluctant to move to wayland.

On my main workstation I have three 1080p monitors: one in the center, placed horizontally, for **writing** codes and place terminals to see the result. The other two are placed left and right, both vertically, for **modifying** codes, and looking at documents.

With this setup, I need a window manager that deals with multi-head nicely, and don't require me to move my hands off the keyboard a lot to arrange windows. I've been hoping around all kinds of wms in the past years, and lastly settled on [i3](https://i3wm.org).

i3 is wonderful.

It manages multiple monitors well: I can bind a workspace to a specific monitor, and switch to that monitor by pressing a key combination. Also it's a tilling wm, which means I can do most of window positioning simply by moving window up/down/let/right with keyboard, and don't require intervention with a mouse. In fact, on my desk-side FreeBSD server I'm running another i3 setup. This server doesn't have a mouse connected at all, and I've never felt any inconvience. It's also perfectly configurable, and based on a IPC model just like wmii (it's wmii-i, hence named i3), which suits me well as I was that kind of kid who will tear down every toy I got.

Another thing is that I have been an emacs user since the day I first coded Hello world in C++. What further complexes the problem is that I'm the kind of heretic who uses [evil](https://github.com/emacs-evil/evil). What? I like the vim style mode switching and edit commands. This setup means I need to access both CTRL and ESC very, very frequently. My answer to this is two commands: `setxkbmap -option 'ctrl:swapcaps'` and `xcape -e 'Control_L=Escape` (hell, I can even recite those two commands when writing this blog). This enable me to use CAPSLOCK as **both** CTRL and ESC, which reduced a significant amount of hand movement while coding.

Unfortunately, this wonderful setup that has been working for me for years is now also blocking me from moving to wayland. I would hate having to configure my wm all from scratch. wayland does not use xinput (since it's not an X11 server), so `setxkbmap` and `xcape` is useless.

## Sway: A drop-in replacement for i3

As stated in the last paragraph, one of the things that blocking me from moving to wayland is I don't want to reconfigure my wm all from scratch.

Luckily, I found out that I don't have to. Introducing [Sway](https://swaywm.org), a drop-in replacement for i3 on wayland.

To be honest, when I first attempted it I expected to ran into all sorts of compatibility issues. After all, it's a transition to a whole new different graphical stack, you can't really expect it to run with an config file for i3, right?

WRONG.

I was astonished when I switch to a tty and typed `sway`, and **it was literally running on my `~/.config/i3/config` with no visible issue**. This drastically improved my confidence on the plan.

Of course, there's a few more things needs addressing before announcing the transition complete. When using Xorg the monitor and input device is managed by X server, so you use `xrandr` to layout displays and `xinput` to tweak input settings. However, wayland is not a **display server**, rather it's a **protocol**. So all those things are now being handled by the **compositor**, or sway in our case. Obviously, that means we need to tell sway how to layout displays and setup inputs.

Luckily, this was easy enough: just a few more lines in sway config file. For my setup it looks like this:

```
output DP-1 {
	pos 1080 315
	bg $HOME/Images/backgrounds/central.jpg fill
}

output DP-4 {
	pos 3000 0
	transform 90
	bg $HOME/Images/backgrounds/right.jpg fill
}

output DP-5 {
	pos 0 0
	transform 270
	bg $HOME/Images/backgrounds/left.jpg fill
}
```

This is just a literal translation from my original xrandr commands.

## Interception tools: works even better than setxkbmap & xcape

Now that we've got a perfect replacement for i3, let's deal with another issue: the CAPSLOCK on my keyboard. Like I said earlier, on wayland it uses a different input model than X, so `setxkbmap` and `xcape` no longer works for us.

This actually is the main reason that blocked the switch for me, since under the model of wayland this feature has to be implmented by the compositor, and hardly any upstream will be willing to implement such a weird feature. So this means we'll have to patch the compositor.

Or is it really?

There's actually another way to solve the issue: deal with it on a lower level of abstruction, before X server or wayland compositor comes to play. More specifically, deal with it on the level of `libevdev`.

There is a tool designed exactly for this job: [Interception Tools](https://gitlab.com/interception/linux/tools). Check it out, it's even in the community repo of archlinux.

It works by intercepting libevdev events, modify it, and then feed the modified event to X server or wayland compositor. And it comes with an official plugin called `caps2esc`, which you can tell from the name, does exactly what we want.

To achieve our intention, we need to write a `udevmon` configuration, which will monitor events for us, and dispatch them to interception tools for alteration when desired. My config is as follows:

```
- JOB: "intercept -g $DEVNODE | caps2esc -m 3 | uinput -d $DEVNODE"
  DEVICE:
    EVENTS:
      EV_KEY: [KEY_CAPSLOCK, KEY_ESC]
```

If you are familiar with the syntax of piping in sh (you uses linux so I assume you do), you can probably tell what this does: it intercepts events from keyboard, send it to `caps2esc`, then send the result back to upper applications. Pretty easy to understand, right?

Except you've copied this config and found out it doesn't really work.

That's because the offical version of caps2esc doesn't have a `-m 3`. It's a customized mode patched into it by myself: CAPSLOCK works as both ESC and CTRL, and **Right CTRL** as CAPSLOCK.

The reason for this patch is that I need both Left CTRL and ESC untouched for gaming (yes, there exists a [game](https://www.finalfantasyxiv.com) in which you need to spam ESC), and I need CAPSLOCK when entering my passwords. I'm not going into detail on how I've done the patch since it's pretty straightforward (check the [commit](https://github.com/MosakujiHokuto/caps2esc/commit/6a9aa6aca7e46a73e295a0c252e83b2ed84efdf4), you'll get it if you have almost any experience in C), and it's just a customization for my own setup.

Switching to interception tools have another benefic: The key swap now works even with the display manager, unlike previously it only works after I've logined into desktop, so it's actually more of an improvement than replacement.

## Finishing the switch

For me there's only one small imperfection left: lightdm somehow doesn't work with sway, or wayland sessions in general. Instead of doing some crazy patching to make lightdm work, I choosed to replace it with SDDM instead.

I've never been a fan of KDE or QT ecosystem. I've been using Archlinux and Gentoo as my daily drive for almost ten years, so obviously I don't like things that are considered bloated, and by my standard KDE is pretty bloated.

Lucky for me, SDDM actually don't have that much dependency on KDE Plasma, so I can accept that. There's plenty of documentation on how to setup SDDM, so I won't go to detail here, other than announcing **it works**.

And now I finally got rid of X11 completely (well not really, if you take xwayland into account), and embraced the future of Linux Desktop!