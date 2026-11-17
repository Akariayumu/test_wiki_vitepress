---
title: C1902 / C1902 V2 刷入系统
outline: deep
---

# C1902 / C1902 V2 刷入系统

本文同时适用于工业级升级款 **[C1902 V2](/c1902v2/c1902v2)** 与 **[C1902（V1.x）](/c1902/c1902)** 载板。两款载板均完全兼容官方开发者套件固件，主要区别在于进入恢复模式（Force Recovery）的硬件触发方式。

::: tip 刷机环境准备
建议在原生 x86_64 Ubuntu 系统或 VMware Ubuntu 虚拟机下进行刷机操作。虚拟机与 SDK Manager 的安装步骤请参考 [安装 Ubuntu 虚拟机和 SDK Manager](/flashing-guide/ubuntu-sdkmanager)。若设备已具备 JetPack 6.x（`≥ 36.0`）固件并计划升级至 JetPack 7，亦可参考 [JetPack 7 刷入系统](/flashing-guide/jetpack7-flashing) 通过 U 盘直接安装。
:::

## 1. 使用 NVIDIA SDK Manager 进行刷机

### 1.1 设置 VMware 的 USB 模式

在 VMware Workstation 菜单中打开 **编辑 → 首选项 → USB**，将 USB 连接模式设置为 **「将设备连接到前台虚拟机」**，点击确定后启动 Ubuntu 虚拟机并打开 SDK Manager，避免刷机中途载板重启重连时脱离虚拟机导致失败。

![打开 VMware 首选项菜单](/img/wiki-4.png)

![将 USB 连接模式设为连接到前台虚拟机](/img/wiki-5.png)

### 1.2 进入恢复模式

刷机前请确保已在载板背面 M.2 Key M 插槽装好**单面 NVMe SSD**，并根据手中的载板版本进入恢复模式：

#### C1902 V2（独立 REC 按键法）

1. 确保载板处于断电状态，先使用支持数据传输的 **USB Type-C** 数据线连接载板的 Type-C 接口（`#6`）与宿主机电脑。
2. **按住载板左上角的独立 `REC` 按钮不放**，再接通 12V DC 电源（DC5525 接口）。
3. 待 SDK Manager 识别到恢复模式设备后松开 `REC` 按钮（C1902 V2 同时保留了 12-pin 排针上的 `FC REC` 与 `GND` 引脚，亦兼容下方的跳线帽短接法）。

![C1902 V2 左上角独立 REC 恢复按钮](/img/c1902v2-rec-button.webp)

*C1902 V2 独立 REC 按钮位置（断电按住 REC 按钮再上电）*

#### C1902 V1.x（跳线帽短接法）

1. 确保载板处于断电状态，使用跳线帽短接载板顶部 12-pin 排针上的 **`FC REC`（Pin 10）** 与相邻的 **`GND`（Pin 9 或 Pin 11）** 针脚。
2. 使用 **USB Type-C** 数据线连接载板与宿主机电脑。
3. 接通载板的 12V DC 电源。

![C1902 V1.x 短接顶部 12-pin 排针的 FC REC 与 GND](/img/wiki-0q7a9416.webp)

*C1902 V1.x 使用跳线帽短接顶部 12-pin 排针的 `FC REC` 与 `GND` 针脚*

成功进入恢复模式后，散热器风扇不会工作，SDK Manager 会自动识别核心卡并弹出硬件选择框。

::: warning 注意恢复模式操作时机
进入恢复模式后若长时间无刷机操作，部分固件版本会自动超时重启进入正常启动流程，请在识别弹窗出现后及时继续。
:::

在弹窗中选择带 **`developer kit version`** 字样的选项并点击 **OK**，随后点击右下角 **CONTINUE**：

![SDK Manager 识别恢复模式核心卡并选择套件版本](/img/wiki-14.png)

### 1.3 配置 SDK 组件

- 在 **STEP 01** 取消勾选 **Host Machine**，点击 **CONTINUE**：

![取消勾选 Host Machine](/img/flash-jp721-cancel-host-machine.png)

- 在 **STEP 02** 建议只勾选 **Jetson Linux**（CUDA、TensorRT 等组件可在进入系统联网后按需安装，缩短烧录时间），勾选底部协议后点击 **CONTINUE**：

![只勾选 Jetson Linux 系统镜像](/img/flash-jp721-jetson-linux-only.png)

### 1.4 等待下载完成

等待 SDK Manager 自动下载并解压固件包。

![等待固件包下载与解压完成](/img/flash-jp721-wait-download.png)

### 1.5 配置刷机参数

下载完成后，在弹出的烧录配置窗口中设置：

- **OEM Configuration**：
  - **Pre-Config**：预设系统用户名与密码。
  - **Runtime**：首次开机连接 DisplayPort 显示器与键盘自行完成初始化设置。
- **Storage Device**：C1902 / C1902 V2 无载板 microSD 卡槽，请选择 **`NVMe`**（推荐单面 M.2 NVMe SSD）或 **`USB`**（U 盘）。

![配置账号模式与目标存储介质](/img/wiki-XjOimage.png)

若再次弹出硬件版本确认框，继续选择 **`developer kit version`**：

![确认选择 developer kit version](/img/wiki-JBF12.png)

点击 **Flash** 开始烧录，全程约需 10～20 分钟。

::: warning 及时取下跳线帽并保持供电稳定
- 若您使用的是 **C1902 V1.x 跳线帽短接法**，**在 SDK Manager 识别到开发板并开始烧录后，请及时拔掉 `FC REC` 与 `GND` 上的跳线帽**，防止刷机中途重启时再次停留在恢复模式。
- 烧录期间载板会与宿主机多次重新连接，**请勿拔开 USB Type-C 数据线或切断 DC 电源**。
:::

当界面显示 **INSTALLATION COMPLETED SUCCESSFULLY** 时点击 **FINISH**，载板正常启动进入系统桌面或初始化向导即表示刷机成功。

![SDK Manager 显示烧录完成（详情页）](/img/wiki-ftEimage.png)

![SDK Manager 显示烧录完成（终端日志页）](/img/wiki-6.png)

![成功启动进入 Jetson Linux 系统桌面](/img/wiki-7.webp)

## 2. 使用命令行刷入 SUPER 固件

::: warning 前置条件与版本支持说明
- 此操作依赖官方固件缓存环境，请先按第 1 节通过 SDK Manager 完成至少一次烧录（或下载）以创建 `Linux_for_Tegra` 目录。
- **`C1902 V2` 与 `C1902（V1.1 及以上）` 完整支持 Jetson Orin Nano（4GB / 8GB）与 Jetson Orin NX（8GB / 16GB）全系列开启 SUPER 模式**（搭配 Orin NX 开启 `40W` SUPER 时请使用 `≥ 60W` 电源并确保散热良好；早期 `C1902 V1.0` 仅支持 Orin Nano 开启 SUPER 模式）。
:::

### 2.1 进入恢复模式

- **C1902 V2**：断电状态下先连好 **USB Type-C** 数据线至宿主机，按住 **`REC` 按钮**再接通 DC 电源，识别后松开按钮。
- **C1902 V1.x**：断电状态下用跳线帽短接 **`FC REC`** 与 **`GND`** 针脚，连好 **USB Type-C** 数据线后接通 DC 电源（宿主机 `lsusb | grep 0955` 识别后即可拔掉跳线帽）。

### 2.2 使用官方固件执行命令行烧录

::: warning 关闭 SDK Manager
执行命令行烧录前**请先关闭正在运行的 SDK Manager 软件**；烧录过程约需 10～20 分钟。
:::

请根据 `~/nvidia/nvidia_sdk/` 下的实际目录名称，调整下方命令中的 **JetPack 版本号**（如 `JetPack_6.2.1_...` 或 `JetPack_7.2_...`）以及**核心卡目标目录**（Orin Nano 通常为 `JETSON_ORIN_NANO_TARGETS`，Orin NX 通常为 `JETSON_ORIN_NX_TARGETS`；命令末尾的板级配置名统一保持 `jetson-orin-nano-devkit-super` 不变）。

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

载板上电开机完成初始化配置后，在桌面右上角点击电源图标查看 **Power Mode**：

- **Jetson Orin Nano**：出现 **`25W`** 与 **`MAXN SUPER`** 即生效（标准模式仅有 `7W` / `15W`）；
- **Jetson Orin NX**：出现 **`40W`** 与 **`MAXN SUPER`** 即生效（标准模式仅有 `10W` / `15W` / `25W`）。

![桌面右上角验证 SUPER 电源模式](/img/wiki-9.png)

若未出现上述 SUPER 档位，请确认刷机命令末尾使用了 `jetson-orin-nano-devkit-super` 配置，重新完整刷入后重启检查。

## 3. 备份与恢复现有固件

::: tip 磁盘空间与路径提示
整机备份需要充足的宿主机剩余空间（虚拟机建议 **`≥ 200 GB`**）。请按实际 JetPack 版本及核心卡目录（`JETSON_ORIN_NANO_TARGETS` 或 `JETSON_ORIN_NX_TARGETS`）调整下方 `cd` 路径。
:::

### 3.1 备份固件

1. 让载板进入恢复模式并通过 USB Type-C 连接至宿主机：
   - **硬件方式**：按 2.1 节操作（C1902 V2 断电按住 `REC` 键上电；C1902 V1.x 短接 `FC REC` + `GND` 上电并在识别后取下跳线帽）；
   - **软件方式**：在正常开机且已连好 Type-C 数据线的状态下，直接执行命令重启至恢复模式。

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

1. 将目标 C1902 / C1902 V2 载板置于恢复模式（同 3.1 节）并通过 USB Type-C 连接宿主机。

::: warning 第三方载板恢复备份必做修改
在 C1902 / C1902 V2 等第三方载板上恢复备份前，必须编辑 `tools/backup_restore/nvrestore_partitions.sh`，注释掉约第 **292～296 行** 的 `BOARD_MATCH` 板卡匹配校验代码（如下图所示），否则脚本会因板卡校验不一致而中止。
:::

![注释 nvrestore_partitions.sh 第 292 至 296 行的板卡匹配校验](/img/wiki-VXwimage.png)

2. 执行以下命令将备份恢复至目标 NVMe SSD：

**在 Ubuntu 宿主机终端执行：**

```bash
cd ~/nvidia/nvidia_sdk/JetPack_7.2_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra
sudo ./tools/backup_restore/l4t_backup_restore.sh -r -e nvme0n1 jetson-orin-nano-devkit-nvme
```

## 4. 刷机后配置指引

- **USB 3.2 设备树配置**：刷入官方固件后，如需确保全部 USB 3.2 Type-A 与 Type-C 接口正常工作，请参考 [Orin Nano / NX USB 配置](/orin-nano-series/usb-config) 安装对应版本的设备树。
- **无线网卡驱动**：若在 JetPack 6 / 7 下安装了 Intel AX200 / AX210 无线网卡，请参考 [网卡驱动](/orin-nano-series/network-driver) 安装驱动。
- **硬件规格参考**：详见 [C1902 V2 产品介绍](/c1902v2/c1902v2) 与 [C1902 产品介绍](/c1902/c1902)。
