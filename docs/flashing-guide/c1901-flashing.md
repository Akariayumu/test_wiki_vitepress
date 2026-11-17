---
title: C1901 刷入系统
outline: deep
---

# C1901 刷入系统

::: tip 刷机环境准备
建议在原生 x86_64 Ubuntu 系统或 VMware Ubuntu 虚拟机下进行刷机操作。虚拟机与 SDK Manager 的安装步骤请参考 [安装 Ubuntu 虚拟机和 SDK Manager](/flashing-guide/ubuntu-sdkmanager)。若设备已具备 JetPack 6.x（`≥ 36.0`）固件并计划升级至 JetPack 7，亦可参考 [JetPack 7 刷入系统](/flashing-guide/jetpack7-flashing) 通过 U 盘安装。
:::

## 1. 使用 NVIDIA SDK Manager 进行刷机

### 1.1 设置 VMware 的 USB 模式

在 VMware Workstation 菜单中打开 **编辑 → 首选项 → USB**，将 USB 连接模式设置为 **「将设备连接到前台虚拟机」**，点击确定后启动 Ubuntu 虚拟机并打开 SDK Manager，避免刷机中途载板重启重连时脱离虚拟机导致失败。

![打开 VMware 首选项菜单](/img/wiki-4.png)

![将 USB 连接模式设为连接到前台虚拟机](/img/wiki-5.png)

### 1.2 进入恢复模式

1. 确保 C1901 载板处于断电状态，并已在背面 M.2 Key M 插槽安装**单面 NVMe SSD**。
2. 找到 C1901 载板边缘的 **12-pin 按钮/调试排针**（板面丝印标有 `FC REC` 与 `GND`），对照下方引脚定义图，使用跳线帽短接 **Pin 10（`Force Recovery` / `FC REC`）** 与相邻的 **Pin 9 或 Pin 11（`GND`）** 针脚。
3. 使用支持数据传输的 **USB Type-C** 数据线连接载板的 Type-C 接口（`#6`）与宿主机电脑。
4. 接通载板的 12V DC 电源（DC5521 接口，兼容 DC5525 插头）。

成功进入恢复模式（Force Recovery）后，散热器风扇默认不转，SDK Manager 会自动识别到核心卡类型并弹出选择窗口。

::: warning 注意恢复模式操作时机
进入恢复模式后若长时间无刷机通信，部分固件版本会自动超时重启进入正常系统，请在识别弹窗出现后及时继续操作。
:::

![C1901 12-pin 按钮调试排针引脚定义](/img/c1901-12pin.png)

*C1901 12-pin 排针定义（使用跳线帽短接 Pin 10 `Force Recovery` 与 Pin 9 / Pin 11 `GND`）*

在 SDK Manager 弹窗中选择带 **`developer kit version`** 字样的选项并点击 **OK**，随后点击右下角 **CONTINUE**：

![SDK Manager 识别恢复模式核心卡并选择套件版本](/img/wiki-14.png)

### 1.3 配置 SDK 组件

- 在 **STEP 01** 取消勾选 **Host Machine**，点击 **CONTINUE**：

![取消勾选 Host Machine](/img/flash-jp721-cancel-host-machine.png)

- 在 **STEP 02** 建议只勾选 **Jetson Linux**（CUDA、TensorRT 等 SDK 组件可在开机联网后按需安装，大幅缩短烧录时间），勾选底部许可协议后点击 **CONTINUE**：

![只勾选 Jetson Linux 系统镜像](/img/flash-jp721-jetson-linux-only.png)

### 1.4 等待下载完成

等待 SDK Manager 自动下载并解压系统固件包。

![等待固件包下载与解压完成](/img/flash-jp721-wait-download.png)

### 1.5 配置刷机参数

下载完成后，在弹出的烧录配置窗口中设置：

- **OEM Configuration**：
  - **Pre-Config**：预设系统用户名与密码。
  - **Runtime**：首次开机连接显示器（C1901 为标准 HDMI 接口，原厂固件下支持 1080P 输出）与键盘自行完成初始化设置。
- **Storage Device**：C1901 无载板 microSD 卡槽，请选择 **`NVMe`**（推荐单面 M.2 NVMe SSD）或 **`USB`**（U 盘）。

![配置账号模式与目标存储介质](/img/wiki-XjOimage.png)

若再次弹出硬件版本确认框，继续选择 **`developer kit version`**：

![确认选择 developer kit version](/img/wiki-JBF12.png)

点击 **Flash** 开始烧录，全程约需 10～20 分钟。

::: warning 及时取下跳线帽并保持供电稳定
- **在 SDK Manager 识别到开发板并开始烧录后，请及时拔掉 `FC REC` 与 `GND` 上的跳线帽**，防止刷机中途载板自动重启时再次停留在恢复模式。
- 烧录期间载板会与宿主机多次重新枚举连接，**请勿拔开 USB Type-C 数据线或断开 DC 电源**。
:::

当界面显示 **INSTALLATION COMPLETED SUCCESSFULLY** 时点击 **FINISH**，确认跳线帽已取下，载板正常启动进入桌面或初始化设置向导即表示刷机成功。

![SDK Manager 显示烧录完成（详情页）](/img/wiki-ftEimage.png)

![SDK Manager 显示烧录完成（终端日志页）](/img/wiki-6.png)

![成功启动进入 Jetson Linux 系统桌面](/img/wiki-7.webp)

## 2. 使用命令行刷入 SUPER 固件

::: warning 前置条件与 Orin Nano SUPER 兼容说明
- 此操作依赖官方固件缓存目录，请先按第 1 节通过 SDK Manager 完成至少一次烧录（或下载）以生成 `Linux_for_Tegra` 目录。
- **C1901 仅支持为 Jetson Orin Nano（4GB / 8GB）刷入并开启 SUPER 模式（`25W` / `MAXN SUPER`）**。若在 C1901 上安装的是 **Jetson Orin NX（8GB / 16GB）** 核心卡，请刷入第 1 节的标准固件（`10W / 15W / 25W`），切勿刷入 Orin NX SUPER 固件。
:::

### 2.1 进入恢复模式

在断电状态下，使用跳线帽短接 C1901 12-pin 排针的 **`FC REC`（Pin 10）** 与 **`GND`（Pin 9 或 Pin 11）**，连接 **USB Type-C** 数据线至宿主机电脑，再接通 DC 电源进入恢复模式（宿主机 `lsusb | grep 0955` 识别后即可取下跳线帽）。

### 2.2 使用官方固件执行命令行烧录

::: warning 关闭 SDK Manager
执行命令行烧录前**请先关闭正在运行的 SDK Manager 软件**；烧录过程约需 10～20 分钟。
:::

请将下方 `cd` 路径中的 **JetPack 版本号**（如 `JetPack_6.2.1_...` 或 `JetPack_7.2_...`）替换为 `~/nvidia/nvidia_sdk/` 下的实际目录名。

- **JetPack 6 / JetPack 7 通用刷入指令**（以下以 `JetPack_7.2` 写入 NVMe SSD 为例）：

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

载板上电开机完成初始化配置后，点击桌面右上角的电源图标查看 **Power Mode**：

- **Orin Nano 标准模式**：仅有 **`7W`** 与 **`15W`** 两档；
- **Orin Nano SUPER 模式**：新增 **`25W`** 与 **`MAXN SUPER`** 档位。

![桌面右上角验证 25W 与 MAXN SUPER 电源模式](/img/wiki-9.png)

若电源模式列表中出现 **`25W`** 和 **`MAXN SUPER`**，说明 SUPER 固件已生效；若仍只有 **`7W`** 和 **`15W`**，请确认刷机命令使用了 `jetson-orin-nano-devkit-super` 配置，并重新完整刷入后重启检查。

## 3. 备份与恢复现有固件

::: tip 磁盘空间与路径提示
整机备份会在宿主机生成与 NVMe 已用分区对应的镜像文件，建议宿主机预留充足磁盘空间（虚拟机建议 **`≥ 200 GB`**）。请按实际 JetPack 版本及核心卡目录（`JETSON_ORIN_NANO_TARGETS` 或 `JETSON_ORIN_NX_TARGETS`）调整下方 `cd` 路径。
:::

### 3.1 备份固件

1. 让 C1901 进入恢复模式并通过 USB Type-C 连接至宿主机：
   - **硬件方式**：断电短接 **`FC REC`** 与 **`GND`**，连好 Type-C 数据线后接通 DC 电源（识别后取下跳线帽）；
   - **软件方式**：在正常开机且连好 Type-C 数据线的状态下，直接重启进入恢复模式。

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

1. 将目标 C1901 载板置于恢复模式（同 3.1 节）并通过 USB Type-C 连接宿主机。

::: warning 第三方载板恢复备份必做修改
在 C1901 等第三方载板上恢复备份前，必须编辑 `tools/backup_restore/nvrestore_partitions.sh`，注释掉约第 **292～296 行** 的 `BOARD_MATCH` 板卡匹配校验代码（如下图所示），否则脚本会报型号不匹配并退出。
:::

![注释 nvrestore_partitions.sh 第 292 至 296 行的板卡匹配校验](/img/wiki-VXwimage.png)

2. 执行以下命令将备份恢复至目标 NVMe SSD：

**在 Ubuntu 宿主机终端执行：**

```bash
cd ~/nvidia/nvidia_sdk/JetPack_7.2_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra
sudo ./tools/backup_restore/l4t_backup_restore.sh -r -e nvme0n1 jetson-orin-nano-devkit-nvme
```

## 4. 刷机后配置（必读）

完成官方固件烧录后，请根据您手中的 C1901 硬件版本号完成后续设备树与驱动配置：

- **USB 3.2 与 C1901 V1.3 专用设备树**：刷入 NVIDIA 原厂固件后，请参考 [Orin Nano / NX USB 配置](/orin-nano-series/usb-config) 安装与当前 JetPack 版本、核心卡型号严格匹配的设备树（DTB）以启用全部 USB 3.2 端口。其中 **C1901 V1.3** 调整了 CSI 与部分引脚电路，需使用匹配的专用设备树文件；若使用 **C1901 V1.2** 搭配 JetPack 5 系列，推荐选用 **JetPack 5.1.4** 固件与对应设备树。详情参见 [C1901 产品介绍](/c1901/c1901) 与 [硬件资源下载](/resources/downloads)。
- **无线网卡驱动**：若在 JetPack 6 / 7 下加装 M.2 Key E 接口的 Intel AX200 / AX210 无线网卡，请参考 [网卡驱动](/orin-nano-series/network-driver) 安装 `backport-iwlwifi-dkms`。
