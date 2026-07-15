---
title: C2401 刷入系统
---

# C2401 刷入系统

> 建议在 Linux 系统或 Linux 虚拟机下进行刷机操作，虚拟机和 SDK Manager 安装方法可参考 [VMware 虚拟机安装说明](/flashing-guide/ubuntu-sdkmanager)。

## 1. 使用 NVIDIA SDK Manager 进行刷机

### 1.1 设置 VMware 的 USB 模式

将 USB 连接模式设置为「将设备连接到前台虚拟机」，避免刷机中途开发板重启导致失败。

![1.1 设置 VMware 的 USB 模式](/img/wiki-4.png)

![1.1 设置 VMware 的 USB 模式](/img/wiki-5.png)

### 1.2 进入恢复模式

C2401 有两种方式进入恢复模式：

**方式一（按键法）：** 在断电的情况下，按住 **REC 按钮**不放，再接通电源，即可进入恢复模式。

**方式二（拨码法）：** 将载板背面的**拨码开关 3** 拨动至 ON，每次上电时系统都将自动进入恢复模式。

> 恢复模式仅持续 60 秒，系统检测到无刷机操作后会自动进入正常开机时序。

![1.2 进入恢复模式](/img/wiki-0q7a2475-1.jpg)

![1.2 进入恢复模式](/img/wiki-14.png)

### 1.3 配置 SDK

- 取消 **Host Machine**，并点击 **CONTINUE**
- 只勾选 **Jetson Linux**

![1.3 配置 SDK](/img/wiki-B3Uimage.png)

![1.3 配置 SDK](/img/wiki-15.png)

### 1.4 等待下载完成

![1.4 等待下载完成](/img/wiki-3k6image.png)

### 1.5 配置刷机参数

- **Pre-Config**：预设账号密码
- **Runtime**：开机后自行配置账号密码
- **Storage Device**：系统刷入的介质（固态硬盘）
- 选择 **Developer Kit Version**

> 耐心等待刷机完成，大约 10~20 分钟。刷入过程中开发板可能会多次与主机重新连接，请勿途中拔开数据线或切断开发板电源。
>
> 刷入完成后，上电正常进入系统桌面或初始化设置页面即刷机成功。

![1.5 配置刷机参数](/img/wiki-XjOimage.png)

![1.5 配置刷机参数](/img/wiki-JBF12.png)

![1.5 配置刷机参数](/img/wiki-ftEimage.png)

![1.5 配置刷机参数](/img/wiki-6.png)

![1.5 配置刷机参数](/img/wiki-7.png)

## 2. 使用命令行刷入 SUPER 固件

> 此操作需依赖官方固件环境，请先通过 SDK Manager 完成至少一次完整的烧录以创建固件缓存。

### 2.1 进入恢复模式

按住 REC 按钮，使用 Type-C 数据线连接至电脑并接通开发板电源，使开发板进入恢复模式。

### 2.2 使用官方固件进行命令行刷机

> 操作前请关闭正在运行的 SDK Manager 软件，刷入过程约为 10~20 分钟。

**JetPack 6.2 版本刷入指令：**

```bash
cd /home/ubuntu/nvidia/nvidia_sdk/JetPack_6.2.1_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra
sudo ./tools/kernel_flash/l4t_initrd_flash.sh --external-device nvme0n1p1 \
  -c tools/kernel_flash/flash_l4t_t234_nvme.xml -p "-c bootloader/generic/cfg/flash_t234_qspi.xml" \
  --showlogs --network usb0 jetson-orin-nano-devkit-super internal
```

**JetPack 5.1.5 版本刷入指令：**

```bash
cd /home/ubuntu/nvidia/nvidia_sdk/JetPack_5.1.5_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra
sudo ./tools/kernel_flash/l4t_initrd_flash.sh --external-device nvme0n1p1 \
  -c tools/kernel_flash/flash_l4t_external.xml -p "-c bootloader/t186ref/cfg/flash_t234_qspi.xml" \
  --showlogs --network usb0 jetson-orin-nano-devkit-super internal
```

![2.2 使用官方固件进行命令行刷机](/img/wiki-8.png)

### 2.3 验证是否处于 SUPER 模式

开发板上电开机完成用户配置后，在桌面右上角可以选择电源模式。**25W & MAXN SUPER** 为 SUPER 模式独有，普通模式只有 7W 和 15W 两档。

![2.3 验证是否处于 SUPER 模式](/img/wiki-9.png)

## 3. 备份与恢复现有固件

### 3.1 备份固件

按住 REC 按钮，Type-C 连接电脑，接通电源进入恢复模式。

或在正常开机状态下连接到主机，输入以下命令重启到恢复模式：

```bash
sudo reboot -f forced-recovery
```

进入原刷机固件缓存下的命令行目录：

```bash
cd /home/ubuntu/nvidia/nvidia_sdk/JetPack_6.2.1_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra
```

安装依赖包：

```bash
sudo apt-get install qemu-user-static libxml2-utils abootimg sshpass nfs-kernel-server binutils
```

**备份命令：**

```bash
sudo ./tools/backup_restore/l4t_backup_restore.sh -b -e nvme0n1 jetson-orin-nano-devkit-nvme
```

**恢复命令：**

```bash
sudo ./tools/backup_restore/l4t_backup_restore.sh -r -e nvme0n1 jetson-orin-nano-devkit-nvme
```

> 若使用第三方载板恢复备份，需要修改 `nvrestore_partitions.sh` 注释掉 292~296 行的内容。

![3.1 备份固件](/img/wiki-VXwimage.png)
