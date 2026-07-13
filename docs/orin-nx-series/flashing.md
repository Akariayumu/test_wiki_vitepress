---
title: 刷机教程
---

---
title: 刷机教程
---

# 刷机教程

## 1. 安装 Ubuntu 虚拟机

详见 [安装 Ubuntu 虚拟机和 SDK Manager](/flashing-guide/ubuntu-sdkmanager)。

### 1.1 下载 VMware Workstation

百度网盘：`VMware-workstation-full-16.2.5-20904516.exe`
链接: https://pan.baidu.com/s/1xopblFgG29dYZXoNfwa5ZA 提取码: frjy

### 1.2 安装 VMware

选项保持默认，输入激活码（自行搜索：vmware16密钥）。

### 1.3 安装 Ubuntu 系统

推荐使用 **20.04** 或 **22.04** 版本。下载 `ubuntu20.04_desktop_amd64.iso`，若下载速度较慢推荐使用 [清华源](https://mirrors.tuna.tsinghua.edu.cn/) 或 [中科大源](https://mirrors.ustc.edu.cn/)。

1. 打开 VMware → 新建虚拟机 → 典型配置
2. 选择下载的 ISO 镜像
3. 输入用户名与密码
4. 选择存放路径，建议最少 300G 存储空间
5. 等待安装完成

---

## 2. 安装 NVIDIA SDK Manager

### 2.1 下载安装包

进入虚拟机浏览器，访问 [Jetson SDK](https://developer.nvidia.com/sdk-manager)，下载 `.deb` Ubuntu 安装包。

### 2.2 安装 SDK Manager

```bash
sudo apt update
sudo dpkg -i sdkmanager_2.3.0-12617_amd64.deb  # 根据实际版本修改包名
sudo apt install --fix-broken
```

---

## 3. 使用 NVIDIA SDK Manager 进行刷机

### 3.1 设置 VMware 的 USB 模式

将 USB 连接模式设置为「将设备连接到前台虚拟机」，避免刷机中途开发板重启导致失败。

### 3.2 进入恢复模式

- 使用跳线帽短接开发板上的 **FC REC** 和 **GND** 针脚
- 使用 USB to Type-C 数据线将开发板连接到电脑
- 接通开发板的 DC 电源
- 成功进入恢复模式后，SDK Manager 会自动检测到核心卡类型

> 进入恢复模式后一段时间内不操作会重启进入系统，请注意操作时机。

### 3.3 配置 SDK

- 取消 **Host Machine**，点击 **CONTINUE**
- 只勾选 **Jetson Linux**

### 3.4 等待下载完成

### 3.5 配置刷机参数

- **Pre-Config**：预设账号密码
- **Runtime**：开机后自行配置账号密码
- **Storage Device**：系统刷入的介质（内存卡 / 固态硬盘 / U盘）
- 选择 **Developer Kit Version**

> 耐心等待刷机完成（10~20 分钟），请勿途中拔开数据线或切断开发板电源。

---

## 4. 使用命令行刷入 SUPER 固件

> 需先通过 SDK Manager 完成至少一次完整烧录以创建固件缓存。

### 4.1 进入恢复模式

跳线帽短接 FC REC 和 GND，Type-C 连接电脑，接通电源。

### 4.2 命令行刷机

> 关闭正在运行的 SDK Manager 软件，刷入过程约 10~20 分钟。

**JetPack 6.2：**

```bash
cd ~/nvidia/nvidia_sdk/JetPack_6.2.1_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra
sudo ./tools/kernel_flash/l4t_initrd_flash.sh --external-device nvme0n1p1   -c tools/kernel_flash/flash_l4t_t234_nvme.xml -p "-c bootloader/generic/cfg/flash_t234_qspi.xml"   --showlogs --network usb0 jetson-orin-nano-devkit-super internal
```

**JetPack 5.1.5：**

```bash
cd ~/nvidia/nvidia_sdk/JetPack_5.1.5_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra
sudo ./tools/kernel_flash/l4t_initrd_flash.sh --external-device nvme0n1p1   -c tools/kernel_flash/flash_l4t_external.xml -p "-c bootloader/t186ref/cfg/flash_t234_qspi.xml"   --showlogs --network usb0 jetson-orin-nano-devkit-super internal
```

### 4.3 验证 SUPER 模式

开机后在桌面右上角选择电源模式。**25W & MAXN SUPER** 为 SUPER 模式独有，普通模式只有 7W 和 15W 两档。

---

## 5. 备份与恢复现有固件

### 5.1 备份固件

进入恢复模式（跳线帽短接 FC REC + GND，Type-C 连接），或在系统中执行：

```bash
sudo reboot -f forced-recovery
```

```bash
cd ~/nvidia/nvidia_sdk/JetPack_6.2.1_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra
sudo apt-get install qemu-user-static libxml2-utils abootimg sshpass nfs-kernel-server binutils
```

**备份：**
```bash
sudo ./tools/backup_restore/l4t_backup_restore.sh -b -e nvme0n1 jetson-orin-nano-devkit-nvme
```

**恢复：**
```bash
sudo ./tools/backup_restore/l4t_backup_restore.sh -r -e nvme0n1 jetson-orin-nano-devkit-nvme
```

> 若使用第三方载板恢复备份，需修改 `nvrestore_partitions.sh` 注释掉 292~296 行。
