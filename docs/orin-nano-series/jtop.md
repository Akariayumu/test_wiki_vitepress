---
title: 安装 jtop
outline: deep
---

# 安装 jtop

**`jtop`** 是开源社区项目 **[`jetson-stats`](https://github.com/rbonghi/jetson_stats)** 提供的**交互式系统监控与管理工具**，专为 NVIDIA Jetson 系列边缘计算设备设计，可实时查看 CPU、GPU、内存、功耗、温度、风扇转速以及 JetPack 组件版本信息。

## 1. 安装 jtop

### 1.1 一键脚本安装（推荐）

`jetson-stats` 官方仓库提供了一键安装脚本，会自动安装 `jetson-stats`、启用 `jtop.service` 后台服务，并将当前用户加入 `jtop` 用户组以支持免 `sudo` 运行。

在 Jetson 开发板终端执行：

```bash
sudo -v
curl -LsSf https://raw.githubusercontent.com/rbonghi/jetson_stats/master/scripts/install_jtop_torun_without_sudo.sh | bash
```

安装完成后，**重新登录终端会话**（或在当前终端执行 `newgrp jtop` 刷新用户组权限），即可直接免 `sudo` 启动 `jtop`：

```bash
newgrp jtop
jtop
```

### 1.2 使用 pip 手动安装

1. 安装 Python 包管理依赖：

```bash
sudo apt update
sudo apt install -y python3 python3-pip
```

2. 安装 `jetson-stats` 并重启系统服务（国内网络环境可附带清华 PyPI 镜像源加速）：

```bash
sudo pip3 install jetson-stats -i https://pypi.tuna.tsinghua.edu.cn/simple
sudo systemctl restart jtop.service
```

::: warning JetPack 7（Ubuntu 24.04）安装说明
Ubuntu 24.04 默认启用了 PEP 668 外部环境管理保护（`externally-managed-environment`）。由于 `jtop.service` 作为系统级守护进程运行，在 **JetPack 7** 上通过 `pip3` 全局安装时需附加 `--break-system-packages` 参数（切勿执行 `sudo pip3 install -U pip` 以免覆盖系统 `apt` 维护的 `pip`）：

```bash
sudo pip3 install --break-system-packages jetson-stats -i https://pypi.tuna.tsinghua.edu.cn/simple
sudo systemctl restart jtop.service
```
:::

::: tip 免 sudo 运行配置
通过 `pip` 手动安装后，默认需执行 `sudo jtop` 打开界面；若希望直接输入 `jtop` 免密启动，可将当前用户加入 `jtop` 组并重新登录（或执行 `newgrp jtop`）：

```bash
sudo usermod -aG jtop "$USER"
newgrp jtop
```
:::

## 2. 使用 jtop

在终端输入 `jtop`（若未配置用户组权限则输入 `sudo jtop`）即可进入交互式主界面。可使用键盘数字键 `1`–`7`、左右方向键或鼠标点击底部标签栏切换页面，按 `q` 键退出。

### 2.1 监视各个模块的工作信息

默认的 **`1ALL`** 总览页（以及细分的 `2GPU`、`3CPU`、`4MEM` 页面）集中展示了核心硬件的实时负载与传感器读数，包括各 CPU 核心占用率与主频、GPU 负载频率、统一内存（RAM）与交换空间（Swap）占用、NVMe 磁盘状态、核心温度以及当前 `nvpmodel` 功耗模式与整板输入功率：

![jtop 主界面系统资源总览](/img/jtop-main.png)

### 2.2 控制风扇与功耗模式

切换到 **`5CTRL`** 控制页面，可交互式调节散热风扇转速策略（如 `auto` 自动温控或 `manual` 手动设定 PWM 百分比）、切换 `nvpmodel` 功耗上限档位，以及一键开启或关闭 `jetson_clocks` 定频加速：

![jtop CTRL 风扇与功耗控制界面](/img/jtop-fan.png)

### 2.3 查看内置软件信息

切换到 **`6INFO`** 信息页面，可一目了然地核对当前设备的硬件型号、序列号、JetPack / L4T 版本、Linux 内核版本，以及预装的 CUDA、cuDNN、TensorRT、OpenCV、VPI、Vulkan 等关键软件库版本：

![jtop INFO 软件与硬件版本信息界面](/img/jtop-info.png)
