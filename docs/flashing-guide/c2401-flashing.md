---
title: C2401 刷入系统
outline: deep
---

# C2401 刷入系统

::: tip 刷机环境与供电准备
- 建议在原生 x86_64 Ubuntu 系统或 VMware Ubuntu 虚拟机下进行刷机操作。虚拟机与 SDK Manager 安装方法请参考 [安装 Ubuntu 虚拟机和 SDK Manager](/flashing-guide/ubuntu-sdkmanager)；若已具备 JetPack 6.x（`≥ 36.0`）固件并计划升级至 JetPack 7，亦可参考 [JetPack 7 刷入系统](/flashing-guide/jetpack7-flashing)。
- **供电注意**：C2401 正面的 USB Type-C 接口仅用于数据传输与固件烧录，不支持供电；刷机时必须通过 **XT30 电源接口**接入外部直流电源（推荐 `12V`，支持 `10V–30V`）。
:::

## 1. 使用 NVIDIA SDK Manager 进行刷机

### 1.1 设置 VMware 的 USB 模式

在 VMware Workstation 菜单中打开 **编辑 → 首选项 → USB**，将 USB 连接模式设置为 **「将设备连接到前台虚拟机」**，点击确定后启动 Ubuntu 虚拟机并打开 SDK Manager，避免刷机中途载板重启重连时脱离虚拟机导致失败。

![打开 VMware 首选项菜单](/img/wiki-4.png)

![将 USB 连接模式设为连接到前台虚拟机](/img/wiki-5.png)

### 1.2 进入恢复模式

刷机前请确认已在 C2401 背面 M.2 Key M 插槽安装好 **2230 规格单面 NVMe SSD**。C2401 提供两种进入恢复模式（Force Recovery）的方式：

#### 方式一：按键法（推荐单次刷机使用）

1. 确保 C2401 处于断电状态，**先使用支持数据传输的 USB Type-C 数据线连接载板的 Type-C 接口（`#3`）与宿主机电脑**。
2. **按住载板正面的 `REC` 按钮不放**，再接通 XT30 电源，即可进入恢复模式。
3. 待 SDK Manager 识别到恢复模式设备后松开 `REC` 按钮。

::: info 60 秒自动退出机制
通过 `REC` 按钮触发的恢复模式仅维持约 **60 秒**；若超时未检测到宿主机刷机通信，载板会自动退出恢复模式并转入正常开机时序。
:::

![C2401 正面 REC 恢复按钮位置](/img/wiki-0q7a2475-1.webp)

*C2401 正面 `REC` 恢复按钮位置（断电先连 Type-C 数据线，再按住红框内 `REC` 按钮接通 XT30 电源）*

#### 方式二：拨码开关法

1. 在断电状态下，将载板背面 4 位拨码开关中的 **拨码开关 3** 拨动至 **`ON`** 一侧，使每次上电自动进入恢复模式。
2. 先连接 **USB Type-C** 数据线至宿主机电脑，再接通 XT30 电源。

![C2401 背面拨码开关 3 位置示意图](/img/c2401-switch-rec.png)

*C2401 背面拨码开关 3（拨至右侧 `ON` 可使每次上电自动进入恢复模式）*

::: warning 使用拨码开关 3 后务必及时拨回 OFF（关键）
若您使用背面**拨码开关 3** 进入恢复模式，**在 SDK Manager 识别到开发板开始烧录后（或整个烧录完成断电重启前），务必将拨码开关 3 拨回 `OFF` 位置！**
烧录外部 NVMe 存储时，载板会在中途自动重启进入 `initrd` 阶段；若拨码开关 3 仍停留在 `ON` 位置，载板重启后会再次锁死在恢复模式，导致烧录超时失败或刷完无法进入正常系统。
:::

成功进入恢复模式后，SDK Manager 会自动识别核心卡并弹出硬件选择框。选择带 **`developer kit version`** 字样的选项并点击 **OK**，随后点击右下角 **CONTINUE**：

![SDK Manager 识别恢复模式核心卡并选择套件版本](/img/wiki-14.png)

### 1.3 配置 SDK 组件

- 在 **STEP 01** 取消勾选 **Host Machine**，点击 **CONTINUE**：

![取消勾选 Host Machine](/img/flash-jp721-cancel-host-machine.png)

- 在 **STEP 02** 建议只勾选 **Jetson Linux**（CUDA、TensorRT 等组件可在开机联网后按需安装，大幅缩短烧录耗时），勾选底部协议后点击 **CONTINUE**：

![只勾选 Jetson Linux 系统镜像](/img/flash-jp721-jetson-linux-only.png)

### 1.4 等待下载完成

等待 SDK Manager 自动下载并解压固件包。

![等待固件包下载与解压完成](/img/flash-jp721-wait-download.png)

### 1.5 配置刷机参数

下载完成后，在弹出的烧录配置窗口中设置：

- **OEM Configuration**：
  - **Pre-Config**：预设系统用户名与密码（无 Mini HDMI 转接线时推荐使用此项）。
  - **Runtime**：首次开机通过 Mini HDMI 连接显示器并接键盘自行完成初始化向导。
- **Storage Device**：选择 **`NVMe`**（2230 NVMe SSD）或 **`USB`**。

![配置账号模式与目标存储介质](/img/wiki-XjOimage.png)

若再次弹出硬件版本确认框，继续选择 **`developer kit version`**：

![确认选择 developer kit version](/img/wiki-JBF12.png)

点击 **Flash** 开始烧录，全程约需 10～20 分钟。

::: warning 刷机期间保持连接与拨码复位确认
- 烧录过程中载板会多次与宿主机重新连接，**请勿拔开 USB Type-C 数据线或断开 XT30 电源**。
- 若此前使用了背面**拨码开关 3**，请再次确认已将其拨回 **`OFF`** 位置。
:::

当界面显示 **INSTALLATION COMPLETED SUCCESSFULLY** 时点击 **FINISH**，载板正常启动进入桌面或初始化页面即刷机成功。刷机完成后请继续阅读本文第 4 节安装 2.5G 网卡驱动与 USB 设备树。

![SDK Manager 显示烧录完成（详情页）](/img/wiki-ftEimage.png)

![SDK Manager 显示烧录完成（终端日志页）](/img/wiki-6.png)

![成功启动进入 Jetson Linux 系统桌面](/img/wiki-7.webp)

## 2. 使用命令行刷入 SUPER 固件

::: warning 前置条件与 Orin Nano SUPER 兼容说明
- 此操作依赖官方固件缓存目录，请先按第 1 节通过 SDK Manager 完成至少一次烧录（或下载）以创建 `Linux_for_Tegra` 目录。
- **C2401 仅支持为 Jetson Orin Nano（4GB / 8GB）刷入并开启 SUPER 模式（`25W` / `MAXN SUPER`）**。若在 C2401 上安装的是 **Jetson Orin NX（8GB / 16GB）** 核心卡，请使用第 1 节的标准固件（`10W / 15W / 25W`），不支持 Orin NX `40W` SUPER 模式。
:::

### 2.1 进入恢复模式

在断电状态下，**先使用 USB Type-C 数据线连接 C2401 与宿主机电脑**，再按住正面 **`REC` 按钮**并接通 XT30 电源进入恢复模式（若使用背面拨码开关 3，请在宿主机 `lsusb | grep 0955` 识别后立即将其拨回 `OFF`）。

### 2.2 使用官方固件执行命令行烧录

::: warning 关闭 SDK Manager
执行命令行烧录前**请先关闭正在运行的 SDK Manager 软件**；烧录过程约需 10～20 分钟。
:::

请将下方 `cd` 路径中的 **JetPack 版本号**（如 `JetPack_6.2.1_...` 或 `JetPack_7.2_...`）替换为 `~/nvidia/nvidia_sdk/` 下的实际目录名。

- **JetPack 6 / JetPack 7 通用刷入指令**（以下以 `JetPack_7.2` 为例）：

**在 Ubuntu 宿主机终端执行：**

```bash
cd ~/nvidia/nvidia_sdk/JetPack_7.2_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra
sudo ./tools/kernel_flash/l4t_initrd_flash.sh --external-device nvme0n1p1 \
  -c tools/kernel_flash/flash_l4t_t234_nvme.xml -p "-c bootloader/generic/cfg/flash_t234_qspi.xml" \
  --showlogs --network usb0 jetson-orin-nano-devkit-super internal
```

- **JetPack 5.1.5 版本刷入指令**：

**在 Ubuntu 宿主机终端执行：**

```bash
cd ~/nvidia/nvidia_sdk/JetPack_5.1.5_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra
sudo ./tools/kernel_flash/l4t_initrd_flash.sh --external-device nvme0n1p1 \
  -c tools/kernel_flash/flash_l4t_external.xml -p "-c bootloader/t186ref/cfg/flash_t234_qspi.xml" \
  --showlogs --network usb0 jetson-orin-nano-devkit-super internal
```

![命令行烧录 SUPER 固件成功输出](/img/wiki-8.png)

### 2.3 验证是否处于 SUPER 模式

载板上电开机完成用户配置后，点击桌面右上角的电源图标查看 **Power Mode**：

- **Orin Nano 标准模式**：仅有 **`7W`** 与 **`15W`** 两档；
- **Orin Nano SUPER 模式**：新增 **`25W`** 与 **`MAXN SUPER`** 档位。

![桌面右上角验证 25W 与 MAXN SUPER 电源模式](/img/wiki-9.png)

若电源模式列表中出现 **`25W`** 和 **`MAXN SUPER`**，说明 SUPER 固件已生效；若仍只有 **`7W`** 和 **`15W`**，请确认刷机命令使用了 `jetson-orin-nano-devkit-super` 配置，重新完整刷入后重启检查。

## 3. 备份与恢复现有固件

::: tip 磁盘空间与路径提示
整机备份需要充足的宿主机剩余空间（虚拟机建议 **`≥ 200 GB`**）。请按实际 JetPack 版本及核心卡目录（`JETSON_ORIN_NANO_TARGETS` 或 `JETSON_ORIN_NX_TARGETS`）调整下方 `cd` 路径。
:::

### 3.1 备份固件

1. 让 C2401 进入恢复模式并通过 USB Type-C 连接宿主机：
   - **硬件方式**：断电状态下先连好 Type-C 数据线，再按住正面 **`REC` 按钮**接通 XT30 电源；
   - **软件方式**：在正常开机且已连接 Type-C 数据线的状态下，直接重启至恢复模式。

**在 Jetson 开发板终端执行：**

```bash
sudo reboot -f forced-recovery
```

::: warning 请核对终端所属设备
`sudo reboot -f forced-recovery` 必须在 **Jetson 开发板**终端执行，切勿误输入到 Ubuntu 宿主机终端中。
:::

2. 进入宿主机固件缓存目录，安装依赖包并执行备份命令：

**在 Ubuntu 宿主机终端执行：**

```bash
cd ~/nvidia/nvidia_sdk/JetPack_7.2_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra
sudo apt-get update
sudo apt-get install -y qemu-user-static libxml2-utils abootimg sshpass nfs-kernel-server binutils
sudo ./tools/backup_restore/l4t_backup_restore.sh -b -e nvme0n1 jetson-orin-nano-devkit-nvme
```

### 3.2 恢复固件

1. 将目标 C2401 载板置于恢复模式（同 3.1 节）并通过 USB Type-C 连接宿主机。

::: warning 第三方载板恢复备份必做修改
在 C2401 载板上恢复备份前，必须编辑 `tools/backup_restore/nvrestore_partitions.sh`，注释掉约第 **292～296 行** 的 `BOARD_MATCH` 板卡匹配校验代码（如下图所示），否则会因板卡校验不一致而中止恢复。
:::

![注释 nvrestore_partitions.sh 第 292 至 296 行的板卡匹配校验](/img/wiki-VXwimage.png)

2. 执行以下命令将备份恢复至目标 NVMe SSD：

**在 Ubuntu 宿主机终端执行：**

```bash
cd ~/nvidia/nvidia_sdk/JetPack_7.2_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra
sudo ./tools/backup_restore/l4t_backup_restore.sh -r -e nvme0n1 jetson-orin-nano-devkit-nvme
```

## 4. 刷机后必做配置

C2401 刷入 NVIDIA 原厂固件后，请务必按需完成以下驱动与设备树配置：

- **板载 2.5G 有线网卡驱动（必读）**：C2401 配备千兆（RTL8111，系统自带免驱）与 **2.5G（Realtek RTL8125）** 双 RJ45 网口。要启用 2.5G 网口（或启用 M.2 Key E 上的 Intel AX200 / AX210 无线网卡），请按照 [网卡驱动](/orin-nano-series/network-driver) 安装 `r8125` 驱动。
- **USB 3.2 与背面扩展接口设备树**：如需启用全部 USB 3.2 通道、背面 30-pin 扩展排母上的 USB 3.0（Pin 13 / 15 / 19 / 21）或从 M.2 Key E 引出的 `UART1`，请参考 [Orin Nano / NX USB 配置](/orin-nano-series/usb-config) 与 [C2401 产品介绍](/c2401/c2401) 替换匹配的设备树文件。
