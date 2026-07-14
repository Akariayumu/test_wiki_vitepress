---
title: 官方开发者套件刷入系统
outline: deep
---

# 官方开发者套件刷入系统

> 建议在Linux系统或Linux虚拟机下进行刷机操作，虚拟机和SDK manager安装方法可参考 [vmware虚拟机安装说明](https://www.linkzeelabs.com/wiki/books/68839/page/ubuntusdk-manager)

### 1.使用NVIDIA SDK Manager进行刷机

##### 1.1 设置VMware的USB模式

- 将USB连接模式设置为 **`将设备连接到前台虚拟机`**，避免刷机中途开发板重启导致失败。

##### [![4.png](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/scaled-1680-/4.png)](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/4.png)

设置USB总是连接到虚拟机，然后打开SDK Manager。

[![5.png](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/scaled-1680-/5.png)](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/5.png)

##### 1.2 进入恢复模式

1. 使用跳线帽短接开发板上的 **<u>FC REC</u>** 和 **<u>GND</u>** 针脚。
2. 使用 **USB to Type-C** 数据线将开发板连接到电脑。
3. 接通开发板的 DC 电源。

成功进入恢复模式后，SDK Manager 会自动检测到核心卡类型，并提示选择套件类型，同时散热器风扇不会工作。

::: warning
进入恢复模式后一段时间内不操作会重启进入系统，请注意操作时机。
:::

[![0Q7A9416 拷贝.jpg](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/scaled-1680-/0q7a9416.jpg)](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/0q7a9416.jpg)

[![14.png](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/scaled-1680-/14.png)](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/14.png)

##### 1.3 配置SDK

- 取消Host Machine，并点击CONTINUE

[![image.png](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/scaled-1680-/B3Uimage.png)](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/B3Uimage.png)

- 只勾选Jetson Linux

[![15.png](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/scaled-1680-/15.png)](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/15.png)

##### 1.4 等待下载完成

[![image.png](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/scaled-1680-/3k6image.png)](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/3k6image.png)

##### 1.5 配置刷机参数

Pre-Config，预设账号密码

Runtime，开机后自行配置账号密码

Storage Device，系统刷入的介质，根据不同设备自行选择 (内存卡/固态硬盘/U盘)。

[![image.png](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/scaled-1680-/XjOimage.png)](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/XjOimage.png)

- 选择 `developer kit version`。

[![12.png](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/scaled-1680-/JBF12.png)](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/JBF12.png)

- 耐心等待刷机完成，大约10~20分钟。

::: warning
刷入过程中开发板可能会多次与主机重新连接，请勿途中拔开数据线或切断开发板电源，可以在识别到开发板类型以后就拔掉跳线帽。
:::

[![image.png](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/scaled-1680-/ftEimage.png)](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/ftEimage.png)

- 刷入完成后，拔掉跳线帽，上电正常进入系统桌面或初始化设置页面即刷机成功。

[![6.png](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/scaled-1680-/6.png)](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/6.png)

[![7.png](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/scaled-1680-/7.png)](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/7.png)

### 2.使用命令行刷入super固件

::: warning
此操作需依赖官方固件环境，请先通过SDK Manager完成至少一次完整的烧录以创建固件缓存。
:::

##### 2.1 进入恢复模式

- 使用跳线帽短接**<u>FC REC</u>**和**<u>GND</u>**针脚，使用**Type-C**型数据线连接至电脑并接通开发板电源，使开发板进入恢复模式。

##### 2.2 使用官方固件进行命令行刷机

::: warning
操作前请关闭正在运行的SDK Manager软件，刷入过程约为10~20分钟
:::

- JetPack6.2版本刷入指令：

```shell
cd /home/ubuntu/nvidia/nvidia_sdk/JetPack_6.2.1_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra #仅供参考，需要根据实际版本和路径进行修改
sudo ./tools/kernel_flash/l4t_initrd_flash.sh --external-device nvme0n1p1 \
  -c tools/kernel_flash/flash_l4t_t234_nvme.xml -p "-c bootloader/generic/cfg/flash_t234_qspi.xml" \
  --showlogs --network usb0 jetson-orin-nano-devkit-super internal
```

- JetPack5.1.5版本刷入指令：

```shell
cd /home/ubuntu/nvidia/nvidia_sdk/JetPack_5.1.5_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra #仅供参考，需要根据实际版本和路径进行修改
sudo ./tools/kernel_flash/l4t_initrd_flash.sh --external-device nvme0n1p1\
  -c tools/kernel_flash/flash_l4t_external.xml -p "-c bootloader/t186ref/cfg/flash_t234_qspi.xml"\
  --showlogs --network usb0 jetson-orin-nano-devkit-super internal
```

[![8.png](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/scaled-1680-/8.png)](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/8.png)

##### 2.3 验证是否处于super模式

- 开发板上电开机完成用户配置后在桌面右上角可以选择电源模式，**25W** & **MAXN** **SUPER**为super模式独有，普通模式只有 **7W** 和 **15W** 两档。

[![9.png](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/scaled-1680-/9.png)](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/9.png)

### 3.备份与恢复现有固件

##### 3.1备份固件

- 使用跳线帽短接**<u>FC REC</u>**和**<u>GND</u>**针脚，使用**Type-C**型数据线连接至电脑并接通开发板电源，使开发板进入恢复模式。

或者在正常开机状态下连接到主机，输入以下命令重启到恢复模式

```shell
sudo reboot -f forced-recovery
```

- 进入到原刷机固件缓存下的命令行目录。

```shell
cd /home/ubuntu/nvidia/nvidia_sdk/JetPack_6.2.1_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra #仅供参考，需要根据实际版本和路径进行修改
```

- 主机上安装依赖包

```shell
sudo apt-get install qemu-user-static libxml2-utils abootimg sshpass nfs-kernel-server binutils
```

- 备份命令

```shell
sudo ./tools/backup_restore/l4t_backup_restore.sh -b -e nvme0n1 jetson-orin-nano-devkit-nvme
```

- 恢复命令

```shell
sudo ./tools/backup_restore/l4t_backup_restore.sh -r -e nvme0n1 jetson-orin-nano-devkit-nvme
```

若您使用第三方载板恢复备份需要修改 `nvrestore_partitions.sh` 注释掉 **292~296行** 的内容

[![image.png](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-08/scaled-1680-/VXwimage.png)](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-08/VXwimage.png)
