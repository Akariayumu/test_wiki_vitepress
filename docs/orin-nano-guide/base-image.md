---
title: 基础镜像制作
outline: deep
---

## 环境准备

- 安装编译依赖工具

```shell
sudo apt install build-essential bc git bison flex libssl-dev zip libncurses-dev make git
```

- 创建工具链放置目录

```shell
mkdir $HOME/l4t-gcc-toolchain
cd $HOME/l4t-gcc-toolchain
```

- 下载并解压交叉编译工具链

```shell
wget https://developer.nvidia.com/downloads/embedded/l4t/r36_release_v3.0/toolchain/aarch64--glibc--stable-2022.08-1.tar.bz2
tar xf aarch64--glibc--stable-2022.08-1.tar.bz2
```

- 进入到缓存好的刷机固件目录

```shell
cd $HOME/nvidia/nvidia_sdk/JetPack_6.2.1_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra/source  #根据实际目录进行修改
```

- 同步源码

```shell
 ./source_sync.sh -k -t <release-tag> #<release-tag>替换为你自己的发行版本如 jetson_36.4.3
```

## 修改添加设备树和驱动

### Intel无线网卡

参考 [网卡说明](https://www.linkzeelabs.com/wiki/books/jetson-orin-nano/page/1f0e3) 在开发板安装驱动后进入 `/usr/lib/modules/$(uname -r)/updates`提取 ko驱动，

复制到固件缓存目录 `Linux_for_Tegra/rootfs/lib/modules/5.15.148-tegra/updates/` 文件夹

### realtek 8125网卡

将在开发板上编译安装好的ko驱动放入 `Linux_for_Tegra/rootfs/lib/modules/5.15.148-tegra/updates/dkms`

烧录完成进入系统后需要运行命令使能 **r8125.ko**

```shell
sudo depmod -a
sudo modprobe r8125
```

### 4G模块

参考[4G模块使用说明 2.2](https://www.linkzeelabs.com/wiki/books/jetson-orin-nano/page/4g)

需要改动内核镜像

### 支持HDMI 4K

修改 tegra234-dcb-p3737-0000.dtsi
替换 nvidia,dcb-image 字段，对应的HDMI-dcb二进制串可在源码的 source/hardware/nvidia/t23x/nv-public/overlay/tegra234-dcb-p3767-0000-hdmi.dts 中找到。

### USB设备树

修改tegra234-p3768-0000.dtsi的 padctl@3520000 节点 
添加usb3-2相关设置

```dts
padctl@3520000 {
			status = "okay";

			pads {
				usb2 {
					lanes {
						usb2-0 {
							nvidia,function = "xusb";
							status = "okay";
						};

						usb2-1 {
							nvidia,function = "xusb";
							status = "okay";
						};

						usb2-2 {
							nvidia,function = "xusb";
							status = "okay";
						};
					};
				};

				usb3 {
					lanes {
						usb3-0 {
							nvidia,function = "xusb";
							status = "okay";
						};

						usb3-1 {
							nvidia,function = "xusb";
							status = "okay";
						};
						
						usb3-2 {
```

## 编译内核、设备树和树外设备

### 2.3 编译内核

此步骤可能需要进行半个小时以上

- 创建输出目录

```shell
cd ../../                    
mkdir kernel_out
```

- 编译安装内核

```shell
export CROSS_COMPILE=$HOME/l4t-gcc-toolchain/aarch64--glibc--stable-2022.08-1/bin/aarch64-buildroot-linux-gnu- #设置交叉编译工具
make -C kernel #构建 Jetson Linux 内核镜像
sudo -E make install -C kernel #安装内核模块和树内模块
```

- 将内核镜像复制到刷机目录下

```shell
cp kernel/kernel-jammy-src/arch/arm64/boot/Image ../kernel/
```

- 构建NVIDIA树外模块（驱动程序）

```shell
export CROSS_COMPILE=$HOME/l4t-gcc-toolchain/aarch64--glibc--stable-2022.08-1/bin/aarch64-buildroot-linux-gnu-
export KERNEL_HEADERS=$PWD/kernel/kernel-jammy-src
make modules
```

- 安装到刷机目录下

```shell
export INSTALL_MOD_PATH=$HOME/nvidia/nvidia_sdk/JetPack_6.2.1_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra/rootfs/ #根据实际目录进行修改
sudo -E make modules_install
```

- 开始构建DTB

```shell
export CROSS_COMPILE=$HOME/l4t-gcc-toolchain/aarch64--glibc--stable-2022.08-1/bin/aarch64-buildroot-linux-gnu-
export KERNEL_HEADERS=$PWD/kernel/kernel-jammy-src
make dtbs
```

- 将生成的dtb文件拷贝到刷机目录

```shell
cp kernel-devicetree/generic-dts/dtbs/* ../kernel/dtb/
```

### 刷写系统命令：

- 普通模式

```shell
sudo ./tools/kernel_flash/l4t_initrd_flash.sh --external-device nvme0n1p1 \
-c tools/kernel_flash/flash_l4t_t234_nvme.xml -p "-c bootloader/generic/cfg/flash_t234_qspi.xml" \
--showlogs --network usb0 jetson-orin-nano-devkit internal
```

- super模式

```shell
sudo ./tools/kernel_flash/l4t_initrd_flash.sh --external-device nvme0n1p1 \
-c tools/kernel_flash/flash_l4t_t234_nvme.xml -p "-c bootloader/generic/cfg/flash_t234_qspi.xml" \
--showlogs --network usb0 jetson-orin-nano-devkit-super internal
```

### 仅刷写QSPI命令：

- 普通模式

```shell
sudo ./flash.sh -c bootloader/t186ref/cfg/flash_t234_qspi.xml --no-systemimg jetson-orin-nano-devkit nvme0n1p1
```

- super模式

```shell
sudo ./flash.sh -c bootloader/t186ref/cfg/flash_t234_qspi.xml --no-systemimg jetson-orin-nano-devkit-super nvme0n1p1
```
