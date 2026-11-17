---
title: C1903 刷入系统
outline: deep
---

# C1903 刷入系统

**[C1903](/c1903/c1903)** 是一款面向工业宽温场景设计的载板与整机套件，供电架构经过全面强化，完整支持 **Jetson Orin Nano（4GB / 8GB）** 与 **Jetson Orin NX（8GB / 16GB）** 全系列核心卡直接烧录官方开发者套件固件及开启 **SUPER 模式**。

::: tip 刷机环境准备
建议在原生 x86_64 Ubuntu 系统或 VMware Ubuntu 虚拟机下进行刷机操作。虚拟机与 SDK Manager 的安装步骤请参考 [安装 Ubuntu 虚拟机和 SDK Manager](/flashing-guide/ubuntu-sdkmanager)。若设备已具备 JetPack 6.x（`≥ 36.0`）固件并计划升级至 JetPack 7，亦可参考 [JetPack 7 刷入系统](/flashing-guide/jetpack7-flashing) 通过 U 盘直接安装。
:::

## 1. 使用 NVIDIA SDK Manager 进行刷机

### 1.1 设置 VMware 的 USB 模式

在 VMware Workstation 菜单中打开 **编辑 → 首选项 → USB**，将 USB 连接模式设置为 **「将设备连接到前台虚拟机」**，点击确定后启动 Ubuntu 虚拟机并打开 SDK Manager，防止刷机中途载板自动重启重连时脱离虚拟机导致失败。

![打开 VMware 首选项菜单](/img/wiki-4.png)

![将 USB 连接模式设为连接到前台虚拟机](/img/wiki-5.png)

### 1.2 进入恢复模式

刷机前请确认已在 C1903 背面 M.2 Key M 插槽（支持 2280 或 2230 规格）安装好**单面 NVMe SSD**。C1903 提供以下两种进入恢复模式（Force Recovery）的方式，任选其一即可：

#### 方式一：按键法（推荐单次刷机使用）

1. 确保 C1903 处于断电状态，先使用支持数据传输的 **USB Type-C** 数据线连接载板背侧的 Type-C 接口（`#18`）与宿主机电脑。
2. **按住载板正面的 `REC` 按钮**（位于 DC5525 电源座与 HDMI 接口之间的右侧微动按钮）不放，再接通 12V DC 电源（Orin Nano 推荐 `≥ 45W`，Orin NX 推荐 `≥ 60W`）。
3. 待 SDK Manager 识别到恢复模式设备后即可松开 `REC` 按钮。

![C1903 正面 Power 与 REC 按钮位置](/img/c1903-buttons.webp)

*C1903 正面 Power 与 REC 按钮位置（断电先连 Type-C 线，再按住右侧 `REC` 按钮上电）*

#### 方式二：拨码开关法

1. 在断电状态下，找到载板背面的 4 位功能拨码开关（`#23`），将 **拨码开关 3（丝印 `REC`）** 拨至 **`ON`** 一侧，使载板每次上电自动进入恢复模式。
2. 使用 **USB Type-C** 数据线连接载板与宿主机电脑，再接通 12V DC 电源。

![C1903 背面功能拨码开关](/img/c1903-switch.webp)

*C1903 背面功能拨码开关（拨码开关 3 丝印 `REC` 拨至右侧 `ON` 可自动进入恢复模式）*

::: warning 使用拨码开关 3 后务必及时拨回 OFF（关键）
若您通过**拨码开关 3** 进入恢复模式，**在 SDK Manager 识别到开发板开始烧录后（或整个烧录结束断电重启前），务必将拨码开关 3 拨回 `OFF` 位置！**
刷机过程中载板会自动重启以进入 `initrd` 烧录阶段；若拨码开关 3 仍处于 `ON` 状态，载板重启后会再次被强制锁死在恢复模式，导致烧录中途超时失败或刷完无法进入系统。
:::

成功进入恢复模式后，散热风扇不会转动，SDK Manager 会自动识别核心卡并弹出套件类型选择框。选择带 **`developer kit version`** 字样的选项并点击 **OK**，随后点击右下角 **CONTINUE**：

![SDK Manager 识别恢复模式核心卡并选择套件版本](/img/wiki-14.png)

### 1.3 配置 SDK 组件

- 在 **STEP 01** 取消勾选 **Host Machine**，点击 **CONTINUE**：

![取消勾选 Host Machine](/img/flash-jp721-cancel-host-machine.png)

- 在 **STEP 02** 建议只勾选 **Jetson Linux**（CUDA、TensorRT 等组件可在进入系统联网后按需通过 `apt` 安装，大幅缩短烧录耗时），勾选底部协议后点击 **CONTINUE**：

![只勾选 Jetson Linux 系统镜像](/img/flash-jp721-jetson-linux-only.png)

### 1.4 等待下载完成

等待 SDK Manager 自动下载并解压固件包。

![等待固件包下载与解压完成](/img/flash-jp721-wait-download.png)

### 1.5 配置刷机参数

下载完成后，在弹出的烧录配置窗口中设置：

- **OEM Configuration**：
  - **Pre-Config**：预设系统用户名与密码。
  - **Runtime**：首次开机连接标准 HDMI 显示器与键盘自行完成初始化向导。
- **Storage Device**：C1903 无 microSD 卡槽，请选择 **`NVMe`**（推荐单面 M.2 NVMe SSD）或 **`USB`**（U 盘）。

![配置账号模式与目标存储介质](/img/wiki-XjOimage.png)

若再次弹出硬件版本确认框，继续选择 **`developer kit version`**：

![确认选择 developer kit version](/img/wiki-JBF12.png)

点击 **Flash** 开始烧录，全程约需 10～20 分钟。

::: warning 刷机期间保持连接与拨码复位确认
- 烧录过程中载板会与宿主机多次断开并重新枚举连接，属正常现象，**请勿拔开 USB Type-C 数据线或切断 DC 电源**。
- 若此前使用了背面**拨码开关 3**，请再次确认已将其拨回 **`OFF`** 位置。
:::

当界面显示 **INSTALLATION COMPLETED SUCCESSFULLY** 时点击 **FINISH**，载板正常启动进入 Ubuntu 桌面或初始化设置页面即表示刷机成功。刷机完成后请务必阅读本文末尾第 4 节配置 USB 设备树。

![SDK Manager 显示烧录完成（详情页）](/img/wiki-ftEimage.png)

![SDK Manager 显示烧录完成（终端日志页）](/img/wiki-6.png)

![成功启动进入 Jetson Linux 系统桌面](/img/wiki-7.webp)

## 2. 使用命令行刷入 SUPER 固件

::: warning 前置条件与全系列 SUPER 支持说明
- 命令行刷机依赖官方固件缓存目录，请先按第 1 节通过 SDK Manager 完成至少一次烧录（或仅下载镜像）以生成 `Linux_for_Tegra` 目录。
- **C1903 完整支持 Jetson Orin Nano（4GB / 8GB）与 Jetson Orin NX（8GB / 16GB）全系列核心卡开启 SUPER 模式**。搭配 Orin NX 开启 `40W` SUPER 模式时，请使用 **`≥ 60W`** 的 12V DC 电源并确认散热风扇正常连接。
:::

### 2.1 进入恢复模式

确保载板断电，先用 **USB Type-C** 数据线连接 C1903 与宿主机电脑，再按住正面 **`REC` 按钮**并接通 DC 电源进入恢复模式（若改用背面拨码开关 3，请在宿主机 `lsusb | grep 0955` 识别到设备后立即将拨码开关 3 拨回 `OFF`）。

### 2.2 使用官方固件执行命令行烧录

::: warning 关闭 SDK Manager
执行命令行烧录前**请先关闭正在运行的 SDK Manager 软件**；烧录过程约需 10～20 分钟。
:::

请根据 `~/nvidia/nvidia_sdk/` 下的实际目录名称，调整下方命令中的 **JetPack 版本号**（如 `JetPack_6.2.1_...` 或 `JetPack_7.2_...`）以及**核心卡目标目录**（Orin Nano 通常为 `JETSON_ORIN_NANO_TARGETS`，Orin NX 通常为 `JETSON_ORIN_NX_TARGETS`；命令末尾板级配置名统一保持 `jetson-orin-nano-devkit-super`）。

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

载板上电开机完成初始化设置后，点击桌面右上角电源图标查看 **Power Mode**：

- **Jetson Orin Nano**：出现 **`25W`** 与 **`MAXN SUPER`** 即生效（标准模式仅有 `7W` / `15W`）；
- **Jetson Orin NX**：出现 **`40W`** 与 **`MAXN SUPER`** 即生效（标准模式仅有 `10W` / `15W` / `25W`）。

![桌面右上角验证 SUPER 电源模式](/img/wiki-9.png)

若未出现上述 SUPER 档位，请确认刷机命令末尾使用了 `jetson-orin-nano-devkit-super` 配置，重新完整刷入后重启检查。

## 3. 备份与恢复现有固件

::: tip 磁盘空间与路径提示
整机备份需要充足的宿主机剩余空间（虚拟机建议 **`≥ 200 GB`**）。请按实际 JetPack 版本及核心卡目录（`JETSON_ORIN_NANO_TARGETS` 或 `JETSON_ORIN_NX_TARGETS`）调整下方 `cd` 路径。
:::

### 3.1 备份固件

1. 让 C1903 进入恢复模式并通过 USB Type-C 连接宿主机：
   - **硬件方式**：断电先连好 Type-C 数据线，按住正面 **`REC` 按钮**并接通 DC 电源；
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

1. 将目标 C1903 载板置于恢复模式（同 3.1 节）并通过 USB Type-C 连接宿主机。

::: warning 第三方载板恢复备份必做修改
在 C1903 载板上恢复备份前，必须编辑 `tools/backup_restore/nvrestore_partitions.sh`，注释掉约第 **292～296 行** 的 `BOARD_MATCH` 板卡匹配校验代码（如下图所示），否则会因板卡 EEPROM 信息校验不一致而中止恢复。
:::

![注释 nvrestore_partitions.sh 第 292 至 296 行的板卡匹配校验](/img/wiki-VXwimage.png)

2. 执行以下命令将备份恢复至目标 NVMe SSD：

**在 Ubuntu 宿主机终端执行：**

```bash
cd ~/nvidia/nvidia_sdk/JetPack_7.2_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra
sudo ./tools/backup_restore/l4t_backup_restore.sh -r -e nvme0n1 jetson-orin-nano-devkit-nvme
```

## 4. 刷机后必做配置

- **启用正面 `#6` 号 10Gbps USB 3.2 接口（必读）**：C1903 正面的 **`#6` 号 USB 3.2 Type-A 接口（10Gbps）** 由核心卡原生高速通道直接引出，刷入 NVIDIA 原厂固件后默认未启用，**必须替换匹配的设备树（DTB）方可正常工作**。请务必按照 [Orin Nano / NX USB 配置](/orin-nano-series/usb-config) 安装与当前核心卡型号及 JetPack 版本对应的设备树文件。
- **无线网卡驱动**：若在 JetPack 6 / 7 下加装 M.2 Key E 接口的 Intel AX200 / AX210 无线网卡（千兆有线网口 RTL8111 免驱），请参考 [网卡驱动](/orin-nano-series/network-driver) 安装驱动。
- **硬件接口与 GH1.25 线序说明**：关于 CAN、UART、I2C、SPI、GPIO 等 GH1.25 外设连接器线序（信号引脚为 3.3V 电平），请查阅 [C1903 产品介绍](/c1903/c1903)。
