---
title: Building a Base Image
outline: deep
---

# Building a Base Image

## Environment Setup

- Install the build dependencies

```bash
sudo apt install build-essential bc git bison flex libssl-dev zip libncurses-dev make git
```

Create a directory for the toolchain

```bash
mkdir $HOME/l4t-gcc-toolchain
cd $HOME/l4t-gcc-toolchain
```

- Download and extract the cross-compilation toolchain

```bash
wget https://developer.nvidia.com/downloads/embedded/l4t/r36_release_v3.0/toolchain/aarch64--glibc--stable-2022.08-1.tar.bz2
tar xf aarch64--glibc--stable-2022.08-1.tar.bz2
```

- Enter the cached flashing firmware directory

```bash
cd $HOME/nvidia/nvidia_sdk/JetPack_6.2.1_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra/source  # adjust to your actual directory
```

- Sync the source code

```bash
./source_sync.sh -k -t <release-tag> # replace <release-tag> with your release, e.g. jetson_36.4.3
```

## Modify and Add Device Trees and Drivers

### Intel Wireless Network Card

Refer to the [network card guide](https://www.linkzeelabs.com/wiki/books/jetson-orin-nano/page/1f0e3). After installing the driver on the development board, go to `/usr/lib/modules/$(uname -r)/updates` to extract the ko driver,

and copy it to the `Linux_for_Tegra/rootfs/lib/modules/5.15.148-tegra/updates/` folder in the firmware cache directory

### Realtek 8125 Network Card

Place the ko driver compiled and installed on the development board into `Linux_for_Tegra/rootfs/lib/modules/5.15.148-tegra/updates/dkms`

After flashing is complete and you have entered the system, run the following commands to enable **r8125.ko**

```bash
sudo depmod -a
sudo modprobe r8125
```

### 4G Module

Refer to [4G Module Usage Guide, section 2.2](https://www.linkzeelabs.com/wiki/books/jetson-orin-nano/page/4g)

The kernel image needs to be modified

### HDMI 4K Support

Modify `tegra234-dcb-p3737-0000.dtsi`

Replace the `nvidia,dcb-image` field. The corresponding HDMI-dcb binary string can be found in the source code at `source/hardware/nvidia/t23x/nv-public/overlay/tegra234-dcb-p3767-0000-hdmi.dts`.

### USB Device Tree

Modify the `padctl@3520000` node in `tegra234-p3768-0000.dtsi`

Add the usb3-2 related settings

```
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

## Compile the Kernel, Device Trees, and Out-of-Tree Devices

### 2.3 Compile the Kernel

::: info
This step may take more than half an hour
:::

- Create the output directory

```bash
cd ../../
mkdir kernel_out
```

- Compile and install the kernel

```bash
export CROSS_COMPILE=$HOME/l4t-gcc-toolchain/aarch64--glibc--stable-2022.08-1/bin/aarch64-buildroot-linux-gnu- # set up the cross-compilation toolchain
make -C kernel # build the Jetson Linux kernel image
sudo -E make install -C kernel # install kernel modules and in-tree modules
```

- Copy the kernel image to the flashing directory

```bash
cp kernel/kernel-jammy-src/arch/arm64/boot/Image ../kernel/
```

- Build the NVIDIA out-of-tree modules (drivers)

```bash
export CROSS_COMPILE=$HOME/l4t-gcc-toolchain/aarch64--glibc--stable-2022.08-1/bin/aarch64-buildroot-linux-gnu-
export KERNEL_HEADERS=$PWD/kernel/kernel-jammy-src
make modules
```

- Install into the flashing directory

```bash
export INSTALL_MOD_PATH=$HOME/nvidia/nvidia_sdk/JetPack_6.2.1_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra/rootfs/ # adjust to your actual directory
sudo -E make modules_install
```

- Start building the DTB

```bash
export CROSS_COMPILE=$HOME/l4t-gcc-toolchain/aarch64--glibc--stable-2022.08-1/bin/aarch64-buildroot-linux-gnu-
export KERNEL_HEADERS=$PWD/kernel/kernel-jammy-src
make dtbs
```

- Copy the generated dtb files to the flashing directory

```bash
cp kernel-devicetree/generic-dts/dtbs/* ../kernel/dtb/
```

### System Flashing Commands:

- Normal mode

```bash
sudo ./tools/kernel_flash/l4t_initrd_flash.sh --external-device nvme0n1p1 \
-c tools/kernel_flash/flash_l4t_t234_nvme.xml -p "-c bootloader/generic/cfg/flash_t234_qspi.xml" \
--showlogs --network usb0 jetson-orin-nano-devkit internal
```

- Super mode

```bash
sudo ./tools/kernel_flash/l4t_initrd_flash.sh --external-device nvme0n1p1 \
-c tools/kernel_flash/flash_l4t_t234_nvme.xml -p "-c bootloader/generic/cfg/flash_t234_qspi.xml" \
--showlogs --network usb0 jetson-orin-nano-devkit-super internal
```

### QSPI-Only Flashing Commands:

- Normal mode

```bash
sudo ./flash.sh -c bootloader/t186ref/cfg/flash_t234_qspi.xml --no-systemimg jetson-orin-nano-devkit nvme0n1p1
```

- Super mode

```bash
sudo ./flash.sh -c bootloader/t186ref/cfg/flash_t234_qspi.xml --no-systemimg jetson-orin-nano-devkit-super nvme0n1p1
```
