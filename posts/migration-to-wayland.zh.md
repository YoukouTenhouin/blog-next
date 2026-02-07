---
title: "Wayland 迁移笔记"
date: "2023-05-03"
---

身为一个时不时就把《Unix 痛恨者手册》翻出来读一遍的人，我自然不是什么 X 的过激厨。不过尽管如此，Wayland 出来了这么多年，我也一直没勇气尝试迁移过去。毕竟现有配置用得好好的，何必冒风险去折腾呢？

所以我也不知道为什么这个假期我突发奇想，决定把这项一直以来搁置的任务重新搞起来。这边文章便是我折腾过程中的一点拾遗。

## 起点：X 下的配置

在进行迁移之前，我们自然要先回顾一下原本的配置，毕竟这样我们才知道我们要做什么，以及我为什么拖了这么久才来做这件事。

我的主力工作站用的是三屏幕配置：中间的显示器横放，用来**写**代码以及进行编译查看运行结果。省下两个显示器一左一右竖放，用来**改**代码以及看文档。所以我自然需求一个能完美处理多显示器的 WM。同时考虑到这个配置的显示面积，我还需要这个 WM 能少让我用鼠标调整窗口位置，不然我会需要反复把手从键盘上挪开。

以往我尝试过不少窗口管理器，比如说中规中矩的 openbox，还有前几年流行过一阵的 awesome。不过近期我还是选择了 i3 —— 毕竟 i3 真的很好用。

i3 可以完美地解决多显示器问题：你可以把某个工作区绑到特定的显示器上，这样只要切换工作区同时也便切换了显示器；而且身为平铺式的 WM，绝大部分窗口布局操作都只需要用键盘把窗口上下左右移动，完全不需要鼠标介入。实际上我桌子底下就摆着一台 FreeBSD 服务器，上面跑着的就是 i3。这个服务器只接了键盘而没有接鼠标，也并没有什么不便。身为 wmii 的精神后继 (wmii-i，所以有 3 个 i)，这套基于 IPC 的配置也很对我的口味。

我的另一个需求则同我的编辑器选择相关。自从十数年前我用 C++ 写下第一行 Hello world 以来，我便是一个忠诚的 emacs 用户。当然或许在 emacs 原教旨主义者看来，我其实算是异端，毕竟我还用了 [evil](https://github.com/emacs-evil/evil) 来模拟 vim 的多模式编辑（没办法，hjkl 移动光标实在太方便了）。这自然意味着双重的折磨——我需要反复按下 CTRL **和** ESC 键。考虑到我并不打算添置一个脚踏板，我对这个问题采取了一个比较怪异的解决方式：用 `setxkbmap -option 'ctrl:swapcaps'` 和 `xcape -e 'Control_L=Escape'` (我甚至能把这两个命令背下来)把两个按键都绑定到 CAPSLOCK 上。

不幸地，这套配置虽然极大地方便了我在 X 下的开发工作，引入的依赖却也让迁移到 Wayland 麻烦了很多。我实在懒得重头学习和配置一个新的 WM，而且 Wayland 下 `setxkbmap` 和 `xcape` 也并没什么卵用。

## Sway: i3 的 drop-in 替代

上一段提到了，我不愿意切到 Wayland 的一个主要原因是实在懒得重新配置 WM 了。不过如果其实不需要完全从头配置呢？

还是看看远处的 [Sway](https://swaywm.org) 吧家人们。

老实说虽然官网将 Sway 吹成了 i3 的 drop-in 替代，不过我其实没指望这玩意真的能拿来就用。Wayland 和 X11 毕竟是差别极大的两套模型，这种情况下大概率还是会“请以实物为准”吧？

这就是为什么当我第一次启动 Sway，然后发现它开开心心地把 `~/.config/i3/config` 拿来用时感到无比震惊。它居然真的拿着 **i3** 的配置毫无鸭梨的跑了起来！

当然 Wayland 和 X 之间的模型差别决定了我们还是需要做一小点收尾工作。在 X 下，显示器和输入设备是由 X server 管理的，所以我们通常使用 `xrandr` 和 `xinput` 来配置这些东西。然而 Wayland 的模型和 X 不同：Wayland 是一个**协议**而非**显示服务器**，在 Wayland 模型下这些设备是由 **Compositor**，也就是 Sway 来管理的。所以我们需要告诉 Sway 如何管理这些设备。

不过这并不是什么麻烦事。我现在用的配置如下：

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

这基本上就只是把 xrandr 的配置一直一句翻译过来。

## Interception tools: 比原先的配置更好用

既然 i3 的替代品找到了，现在我们可以去处理另一个问题了：大写锁定键。如前所述，因为 Wayland 和 X 的模型区别，`setxkbmap` 和 `xcape` 在 Wayland 下是用不了的。

其实这才是一直以来阻止我切到 Wayland 的主要原因。毕竟在 Wayland 下，这些设备都由 compositor 管理，所以要实现同样的效果，我们需要在 compositor 里实现这个 feature。这样的小众需求少有 compositor 愿意维护，指望上游提供自然是痴人说梦。难不成我们只能自己去 patch？

其实也未必。

我们可以调转一下思路：这个问题或许可以在 X 和 Wayland 以下更底层的地方解决。更准确地说，在 libevdev 的层面上解决。实际上有一个工具专为此而生：[Interception Tools](https://gitlab.com/interception/linux/tools)。这玩意甚至进了 archlinux 的 community 源。

这个工具可以在 libevdev 的层面上拦截输入事件，将其变换以后再喂给上层的应用。而且它甚至还有个官方插件叫做 `caps2esc`，从名字就能看出这个插件正是我们想要的。

要让这个工具跑起来，我们需要先配置一下 `udevmon`。`udevmon` 会监听 libevdev 的事件，将其传给插件做修改。我的配置如下：

```
- JOB: "intercept -g $DEVNODE | caps2esc -m 3 | uinput -d $DEVNODE"
  DEVICE:
    EVENTS:
      EV_KEY: [KEY_CAPSLOCK, KEY_ESC]
```

如果你熟悉 shell 的 pipe 语法的话（你都用 Linux 了，总该知道这个吧？），你应该能一眼看出这个配置的源里：拦截 libevdev 事件，丢给 `caps2esc` 处理，然后再喂给上层应用。浅显易懂吧？

然后你把配置抄了过去，发现并不能用。这是因为我的 `caps2esc` 其实是一个改过的版本。原版并没有 `-m 3` 这个选项，这个模式是我的自定义配置：CAPSLOCK 同时当作 ESC 和 CTRL用，而**右边 CTRL** 当作大写锁定。

之所以要费这一道事，是因为我需要保持左边 CTRL 和 ESC 不动，防止在游戏时按错键（离谱的是，真的有[游戏](https://adsrff.web.sdo.com/web1/)要你狂敲 ESC）。而且我在敲密码的时候也会用到大写锁定。我不打算展开讲解这个 patch ，毕竟这也不是个多复杂的修改（你只要有一点 C 的基础就能轻易地看懂这个 [commit](https://github.com/MosakujiHokuto/caps2esc/commit/6a9aa6aca7e46a73e295a0c252e83b2ed84efdf4)），而且反正这只是我的个人设置。

切到 Interception Tools 还有另一个好处：现在我的登录界面也可以用上这套按键配置了，而不用等到登录进了桌面才生效。

## 收尾工作

对我来说还有一小点额外的工作要处理：不知为何 lightdm 并不能很好地启动 Sway，还有其他基于 Wayland 的桌面。调研以后发现这个问题似乎并非特例，所以我也懒得花功夫去研究解决方案了，而是直接切到了 SDDM。

老实说我从来都不怎么喜欢 Qt 和 KDE 的生态。身为 Archlinux 和 Gentoo 的十年老粉，显然我不会太喜欢臃肿的软件栈；而在我眼里 KDE 足以称为臃肿。不过好在 SDDM 现在似乎对 KDE Plasma 并没有多少依赖，所以这个解决方案对我来说可以接受。SDDM 的配置教程在网上已经满天飞了，所以我并不打算再详细展开：总之，能用。

于是我终于完成了搁置已久的 Wayland 迁移，搭上了通往未来的新干线。不知道这个未来将去向何方？