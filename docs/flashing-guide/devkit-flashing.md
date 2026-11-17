---
title: 官方开发者套件刷入系统
outline: deep
---

# 官方开发者套件刷入系统

::: tip 刷机环境准备
建议在原生 x86_64 Ubuntu 系统或 VMware Ubuntu 虚拟机下进行刷机操作。虚拟机与 SDK Manager 的安装步骤请参考 [安装 Ubuntu 虚拟机和 SDK Manager](/flashing-guide/ubuntu-sdkmanager)。若套件已具备 JetPack 6.x（`≥ 36.0`）固件并计划升级至 JetPack 7，亦可参考 [JetPack 7 刷入系统](/flashing-guide/jetpack7-flashing) 使用 U 盘直接安装。
:::

## 1. 使用 NVIDIA SDK Manager 进行刷机

### 1.1 设置 VMware 的 USB 模式

在 VMware Workstation 菜单中打开 **编辑 → 首选项 → USB**，将新 USB 设备连接规则设置为 **「将设备连接到前台虚拟机」**，点击确定后启动 Ubuntu 虚拟机并打开 SDK Manager，避免刷机中途载板重启重连时设备脱离虚拟机导致刷机失败。

![打开 VMware 首选项菜单](/img/wiki-4.png)

![将 USB 连接模式设为连接到前台虚拟机](/img/wiki-5.png)

### 1.2 进入恢复模式

1. 确保官方开发者套件完全断电。找到位于**核心卡正下方**载板边缘的 **12-pin 按钮/调试排针（Button Header）**（翻转至载板背面可看到清晰的丝印标注），使用跳线帽或母对母杜邦线短接 **`FC REC`（Pin 10）** 与相邻的 **`GND`（Pin 9 或 Pin 11）** 针脚。
2. 使用支持数据传输的 **USB Type-C** 数据线连接套件的 Type-C 接口与宿主机电脑。
3. 接通套件的 19V DC 电源适配器。

成功进入恢复模式（Force Recovery）后，散热器风扇默认不会转动，SDK Manager 会自动识别到连接的核心卡并弹出套件类型选择框。

::: warning 注意恢复模式操作时机
进入恢复模式后若长时间无刷机通信，部分固件版本会自动超时重启进入正常启动流程，请在识别弹窗出现后及时继续操作。
:::

![官方开发者套件背面 12-pin 排针丝印位置](/img/wiki-0q7a9030.webp)

*官方开发者套件核心卡下方 12-pin Button Header 背面丝印（含 `FC REC` 与 `GND`）*

![12-pin Button Header 引脚定义](/img/c1901-12pin.png)

*12-pin Button Header 引脚定义（短接 Pin 10 `Force Recovery` 与 Pin 9 / Pin 11 `GND`）*

在 SDK Manager 弹窗中选择带 **`developer kit version`** 字样的目标设备并点击 **OK**，再点击右下角 **CONTINUE**：

![SDK Manager 识别恢复模式核心卡并选择套件版本](/img/wiki-14.png)

### 1.3 配置 SDK 组件

- 在 **STEP 01** 取消勾选 **Host Machine**，点击 **CONTINUE** 进入下一步：

![取消勾选 Host Machine](/img/flash-jp721-cancel-host-machine.png)

- 在 **STEP 02** 建议只勾选 **Jetson Linux**（CUDA、TensorRT 等组件可在系统装好联网后按需通过 `apt` 安装，以大幅缩短刷机耗时并降低超时风险），勾选底部协议后点击 **CONTINUE**：

![只勾选 Jetson Linux 系统镜像](/img/flash-jp721-jetson-linux-only.png)

### 1.4 等待下载完成

等待 SDK Manager 自动下载并解压固件包，下载完成后会自动弹出烧录参数配置窗口。

![等待固件包下载与解压完成](/img/flash-jp721-wait-download.png)

### 1.5 配置刷机参数

在弹出的烧录配置窗口中按需设置：

- **OEM Configuration**：
  - **Pre-Config**：预设系统用户名与登录密码，首次开机直接进入桌面。
  - **Runtime**：首次开机连接显示器与键盘自行完成初始化向导。
- **Storage Device**：选择系统刷入的目标存储介质。Orin Nano 官方套件核心卡支持 **`NVMe`（推荐）**、**`SDCard`（microSD 卡）** 或 **`USB`**；若插入的是 Orin NX 或量产版 Orin Nano 核心卡（无 microSD 卡槽），请选择 **`NVMe`** 或 **`USB`**。

![配置账号模式与目标存储介质](/img/wiki-XjOimage.png)

若中途再次弹出硬件版本确认框，继续选择 **`developer kit version`**：

![确认选择 developer kit version](/img/wiki-JBF12.png)

点击 **Flash** 开始烧录，整个过程约需 10～20 分钟。

::: warning 及时取下跳线帽并保持供电稳定
- **在 SDK Manager 识别到开发板并开始烧录后，请及时拔掉 `FC REC` 与 `GND` 上的跳线帽**（或杜邦线），避免刷机中途自动重启时再次卡在恢复模式。
- 烧录期间开发板会与宿主机多次断开并重新枚举连接，属正常现象，**切勿拔开 USB Type-C 数据线或切断 DC 电源**。
:::

当界面显示 **INSTALLATION COMPLETED SUCCESSFULLY** 时点击 **FINISH**，确认跳线帽已取下，开发板将自动启动进入 Ubuntu 桌面或初始化向导，即表示刷机成功。

![SDK Manager 显示烧录完成（详情页）](/img/wiki-ftEimage.png)

![SDK Manager 显示烧录完成（终端日志页）](/img/wiki-6.png)

![成功启动进入 Jetson Linux 系统桌面](/img/wiki-7.webp)

## 2. 使用命令行刷入 SUPER 固件

::: warning 前置条件与供电兼容性说明
- 命令行刷机依赖 SDK Manager 下载生成的官方 `Linux_for_Tegra` 固件缓存目录，请先按第 1 节完成至少一次烧录（或仅下载镜像）以生成缓存。
- **官方开发者套件载板仅支持 Jetson Orin Nano 系列开启 SUPER 模式（`25W` / `MAXN SUPER`）**。若在该载板上安装的是 **Jetson Orin NX** 核心卡，受原厂载板供电限额影响不支持 `40W` SUPER 模式，请使用第 1 节的标准固件。
:::

### 2.1 进入恢复模式

确保开发板断电，使用跳线帽短接核心卡下方 12-pin 排针的 **`FC REC`（Pin 10）** 与 **`GND`（Pin 9 或 Pin 11）**，连接 **USB Type-C** 数据线至宿主机电脑，再接通 DC 电源进入恢复模式（通过 `lsusb | grep 0955` 确认宿主机识别后即可取下跳线帽）。

### 2.2 使用官方固件执行命令行烧录

::: warning 关闭 SDK Manager
执行命令行烧录前**请先关闭正在运行的 SDK Manager 软件**，以免占用 USB 恢复设备；烧录全程约需 10～20 分钟。
:::

请根据实际缓存目录中的 **JetPack 版本号**（如 `JetPack_6.2.1_...` 或 `JetPack_7.2_...`）调整下方 `cd` 路径。

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

开发板上电开机完成初始化配置后，点击桌面右上角状态栏的电源图标查看 **Power Mode**：

- **Orin Nano 标准模式**：仅有 **`7W`** 与 **`15W`** 两档；
- **Orin Nano SUPER 模式**：新增 **`25W`** 与 **`MAXN SUPER`** 档位。

![桌面右上角验证 25W 与 MAXN SUPER 电源模式](/img/wiki-9.png)

若电源模式列表中出现 **`25W`** 和 **`MAXN SUPER`**，说明 SUPER 固件已生效；若仍只有 **`7W`** 和 **`15W`**，请确认刷机命令末尾使用了 `jetson-orin-nano-devkit-super` 配置，重新完整刷入后重启检查。

## 3. 备份与恢复现有固件

::: tip 磁盘空间要求
整机固件备份会在宿主机 `Linux_for_Tegra/tools/backup_restore/images` 目录下生成与分区数据量相当的镜像文件，请确保 Ubuntu 宿主机剩余磁盘空间充足（建议虚拟机磁盘总容量 **`≥ 200 GB`**）。路径中的 JetPack 版本与 `JETSON_ORIN_NANO_TARGETS` / `JETSON_ORIN_NX_TARGETS` 请按实际目录名调整。
:::

### 3.1 备份固件

1. 先让开发板进入恢复模式并保持 USB Type-C 与宿主机连接：
   - **硬件方式**：断电短接 **`FC REC`** 与 **`GND`** 针脚，连接 Type-C 数据线并接通电源（识别后取下跳线帽）；
   - **软件方式**：若开发板当前正处于正常开机状态且已连好 Type-C 数据线，可直接重启进入恢复模式。

**在 Jetson 开发板终端执行：**

```bash
sudo reboot -f forced-recovery
```

::: warning 请核对终端所属设备
上方的 `sudo reboot -f forced-recovery` 必须在 **Jetson 开发板**上执行，切勿误输入到 Ubuntu 宿主机终端中导致宿主机重启。
:::

2. 进入宿主机上的原刷机固件缓存目录，安装备份工具依赖并执行备份脚本：

**在 Ubuntu 宿主机终端执行：**

```bash
cd ~/nvidia/nvidia_sdk/JetPack_7.2_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra
sudo apt-get update
sudo apt-get install -y qemu-user-static libxml2-utils abootimg sshpass nfs-kernel-server binutils
sudo ./tools/backup_restore/l4t_backup_restore.sh -b -e nvme0n1 jetson-orin-nano-devkit-nvme
```

### 3.2 恢复固件

1. 将目标开发板置于恢复模式（同 3.1 节），并通过 USB Type-C 连接至 Ubuntu 宿主机。

::: warning 跨第三方载板恢复备份时的脚本修改
若您需要将备份镜像恢复到第三方载板（或跨不同板卡恢复），请先打开 `tools/backup_restore/nvrestore_partitions.sh`，注释掉约第 **292～296 行** 的 `BOARD_MATCH` 校验退出逻辑（如下图所示），否则会因板卡 EEPROM 信息校验不一致而中止恢复。
:::

![注释 nvrestore_partitions.sh 第 292 至 296 行的板卡匹配校验](/img/wiki-VXwimage.png)

2. 执行以下命令将备份镜像写入目标设备的 NVMe SSD：

**在 Ubuntu 宿主机终端执行：**

```bash
cd ~/nvidia/nvidia_sdk/JetPack_7.2_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra
sudo ./tools/backup_restore/l4t_backup_restore.sh -r -e nvme0n1 jetson-orin-nano-devkit-nvme
```
