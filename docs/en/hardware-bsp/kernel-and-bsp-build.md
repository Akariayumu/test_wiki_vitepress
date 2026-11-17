---
title: Kernel & Base Image Build
outline: deep
---

# Kernel & Base Image Build

This guide covers syncing L4T sources, customizing drivers and device trees, cross-compiling the kernel and out-of-tree modules, and flashing a custom base image on **JetPack 6.x (Jetson Linux R36)** for **Jetson Orin Nano / Orin NX** carrier boards (`C1901` / `C1902` / `C1902 V2` / `C1903` / `C2401` / `C2402`).

::: warning Execution Environment
Unless a step is explicitly labeled "On the Jetson board terminal", **all toolchain setup, cross-compilation, and flashing commands in this guide must be executed on an x86_64 Ubuntu host PC (Ubuntu 22.04 recommended)** where SDK Manager has already downloaded and prepared the matching `Linux_for_Tegra` directory (see [Install Ubuntu VM and SDK Manager](/en/flashing-guide/ubuntu-sdkmanager)).
:::

## 1. Environment Preparation

### 1.1 Install Build Dependencies

On the Ubuntu host PC terminal:

```bash
sudo apt update
sudo apt install -y build-essential bc git bison flex libssl-dev zip libncurses-dev make
```

### 1.2 Download the Cross-Compilation Toolchain

Create a toolchain directory and extract NVIDIA's official Bootlin `aarch64` toolchain for L4T R36 / JetPack 6.x. On the Ubuntu host PC terminal:

```bash
mkdir -p $HOME/l4t-gcc-toolchain
cd $HOME/l4t-gcc-toolchain
wget https://developer.nvidia.com/downloads/embedded/l4t/r36_release_v3.0/toolchain/aarch64--glibc--stable-2022.08-1.tar.bz2
tar xf aarch64--glibc--stable-2022.08-1.tar.bz2
```

### 1.3 Sync Kernel and Device Tree Sources

Set `L4T_DIR` to your cached `Linux_for_Tegra` directory (the example below uses **JetPack 6.2.1 / L4T R36.4.3**; adjust the path and tag to match your release), then run `source_sync.sh`. On the Ubuntu host PC terminal:

```bash
export L4T_DIR=$HOME/nvidia/nvidia_sdk/JetPack_6.2.1_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra
cd "$L4T_DIR/source"

# Replace jetson_36.4.3 with the exact tag matching your L4T release (e.g. jetson_36.4.4)
./source_sync.sh -k -t jetson_36.4.3
```

## 2. Customize Drivers and Device Trees

Before compiling, merge any required wireless, Ethernet, cellular, display, or USB changes into `rootfs` or the BSP source tree according to your carrier board hardware.

### 2.1 Intel Wireless NIC Driver

If your carrier board uses an Intel M.2 Wi-Fi card requiring `backport-iwlwifi`, first build and install the driver on a reference Jetson board running the same kernel release as described in [Network Card Driver](/en/orin-nano-series/network-driver). Then extract the generated `.ko` modules from `/usr/lib/modules/$(uname -r)/updates/` on the Jetson board and copy them into the host `rootfs` directory:

```text
$L4T_DIR/rootfs/lib/modules/5.15.148-tegra/updates/
```

### 2.2 Realtek RTL8125 2.5GbE Driver

For carrier boards equipped with an onboard Realtek RTL8125 2.5GbE controller (such as `C2401`), build `r8125.ko` following [Network Card Driver](/en/orin-nano-series/network-driver) and copy it into the host `rootfs` directory:

```text
$L4T_DIR/rootfs/lib/modules/5.15.148-tegra/updates/dkms/
```

After flashing and booting into the Jetson system for the first time, run the following commands on the Jetson board terminal to update module dependencies and load `r8125`:

```bash
sudo depmod -a
sudo modprobe r8125
```

### 2.3 4G Cellular Module Kernel Driver

To build in USB serial (`option.c`) and QMI WWAN networking support for Quectel 4G LTE modules, patch `$L4T_DIR/source/kernel/kernel-jammy-src/drivers/usb/serial/option.c` and `drivers/net/usb/` prior to building the kernel. For detailed source changes, see [4G Module Guide](/en/orin-nano-series/4g-module).

### 2.4 HDMI 4K Display Configuration (DCB)

While the official NVIDIA Orin Nano Developer Kit uses DisplayPort (DP), KYtech carrier boards such as `C1901`, `C1903`, `C2401`, and `C2402` feature native HDMI ports.

In the L4T R36 source tree, **Orin Nano / Orin NX modules and reference carrier boards use the `p3767` (SoM) and `p3768` (carrier board) identifiers** (do not edit `p3737` files, which belong to AGX Orin). To enable HDMI 4K display output in the base device tree, apply the HDMI DCB overlay or copy its `nvidia,dcb-image` property from:

```text
$L4T_DIR/source/hardware/nvidia/t23x/nv-public/overlay/tegra234-dcb-p3767-0000-hdmi.dts
```

### 2.5 USB 3.2 Port Device Tree Configuration

When a custom carrier board routes additional USB 3.2 SuperSpeed lanes (such as `usb3-2`), update both `padctl@3520000` (`pads` and `ports`) and `usb@3610000` in `$L4T_DIR/source/hardware/nvidia/t23x/nv-public/tegra234-p3768-0000.dtsi` (or your board-specific DTSI). Below is a complete, properly closed structural example enabling `usb3-2` under `padctl@3520000`:

```c
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
                    nvidia,function = "xusb";
                    status = "okay";
                };
            };
        };
    };

    /* Pair usb2-X / usb3-X companion ports and vbus-supply under ports and usb@3610000 per board schematic */
};
```

::: tip Prebuilt DTBs & Design Guidelines
- For standard KYtech carrier boards (`C1901` / `C1902` / `C1902 V2` / `C1903` / `C2401`), you do not need to recompile from source — install the verified prebuilt DTBs in [USB Configuration](/en/orin-nano-series/usb-config).
- For Pinmux spreadsheet workflows, node lookup, and overlay rules, see [Pinmux & Device Tree](/en/hardware-bsp/pinmux-device-tree).
:::

## 3. Cross-Compile Kernel, Modules, and DTBs

::: info Build Time
Building the full Linux kernel and NVIDIA out-of-tree modules typically takes 20–40 minutes depending on host CPU core count.
:::

::: danger Always Export INSTALL_MOD_PATH First
Before running `sudo -E make install -C kernel` or `sudo -E make modules_install`, **you must export `INSTALL_MOD_PATH="$L4T_DIR/rootfs"` in the active shell**! Running `make install` without `INSTALL_MOD_PATH` (or without `-E`) will install `arm64` kernel modules into the x86_64 host PC's `/lib/modules` directory and can corrupt your host OS.
:::

### 3.1 Export Build Environment Variables

Stay inside `$L4T_DIR/source` (do **not** run `cd ../../` out of the source directory). On the Ubuntu host PC terminal:

```bash
export L4T_DIR=$HOME/nvidia/nvidia_sdk/JetPack_6.2.1_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra
cd "$L4T_DIR/source"

export CROSS_COMPILE=$HOME/l4t-gcc-toolchain/aarch64--glibc--stable-2022.08-1/bin/aarch64-buildroot-linux-gnu-
export INSTALL_MOD_PATH=$L4T_DIR/rootfs
export KERNEL_HEADERS=$PWD/kernel/kernel-jammy-src

# Verify that the target rootfs module directory exists before proceeding
test -d "$INSTALL_MOD_PATH/lib/modules" || echo "Check that L4T_DIR points to a valid Linux_for_Tegra directory!"
```

### 3.2 Build and Install the Kernel and In-Tree Modules

On the Ubuntu host PC terminal (inside `$L4T_DIR/source`):

```bash
# 1. Build the Jetson Linux kernel image and in-tree modules
make -C kernel

# 2. Install in-tree modules into $L4T_DIR/rootfs
sudo -E make install -C kernel

# 3. Copy the compiled kernel Image to Linux_for_Tegra/kernel/
cp kernel/kernel-jammy-src/arch/arm64/boot/Image "$L4T_DIR/kernel/"
```

### 3.3 Build and Install NVIDIA Out-of-Tree (OOT) Modules

On the Ubuntu host PC terminal (inside `$L4T_DIR/source`):

```bash
make modules
sudo -E make modules_install
```

### 3.4 Build Device Trees (DTBs) and Update initrd

On the Ubuntu host PC terminal (inside `$L4T_DIR/source`):

```bash
# Build DTBs and copy them to Linux_for_Tegra/kernel/dtb/
make dtbs
cp kernel-devicetree/generic-dts/dtbs/* "$L4T_DIR/kernel/dtb/"

# Return to Linux_for_Tegra and update initrd so NVMe boot modules stay in sync
cd "$L4T_DIR"
sudo ./tools/l4t_update_initrd.sh
```

## 4. Flash the Customized Image

Put the Jetson carrier board into **Force Recovery Mode** (short `FC REC` and `GND` on `C1901` / `C1902`, or hold the `REC` button while powering on for `C1902 V2` / `C1903` / `C2401`), connect it to the host PC via USB Type-C, and verify that your working directory is back at **`Linux_for_Tegra/`** (`cd ..` from `source/` or `cd "$L4T_DIR"`).

### 4.1 Flash Full System to NVMe SSD

On the Ubuntu host PC terminal (inside `$L4T_DIR`):

- **Standard power mode**:

```bash
cd "$L4T_DIR"
sudo ./tools/kernel_flash/l4t_initrd_flash.sh --external-device nvme0n1p1 \
  -c tools/kernel_flash/flash_l4t_t234_nvme.xml \
  -p "-c bootloader/generic/cfg/flash_t234_qspi.xml" \
  --showlogs --network usb0 jetson-orin-nano-devkit internal
```

- **SUPER mode** (confirm that your carrier board and module combination supports SUPER mode power budgets first; see [Product Comparison](/en/products/compare)):

```bash
cd "$L4T_DIR"
sudo ./tools/kernel_flash/l4t_initrd_flash.sh --external-device nvme0n1p1 \
  -c tools/kernel_flash/flash_l4t_t234_nvme.xml \
  -p "-c bootloader/generic/cfg/flash_t234_qspi.xml" \
  --showlogs --network usb0 jetson-orin-nano-devkit-super internal
```

### 4.2 Flash QSPI Bootloader Only

To update only the QSPI bootloader on the module without formatting or overwriting the root filesystem on the NVMe SSD, run on the Ubuntu host PC terminal (inside `$L4T_DIR`):

::: info R36 Configuration Path Change
In JetPack 6 (L4T R36), the T234 QSPI partition layout resides at `bootloader/generic/cfg/flash_t234_qspi.xml` (replacing the deprecated `bootloader/t186ref/cfg/...` path from JetPack 5 / R35).
:::

- **Standard power mode**:

```bash
cd "$L4T_DIR"
sudo ./flash.sh -c bootloader/generic/cfg/flash_t234_qspi.xml \
  --no-systemimg jetson-orin-nano-devkit nvme0n1p1
```

- **SUPER mode**:

```bash
cd "$L4T_DIR"
sudo ./flash.sh -c bootloader/generic/cfg/flash_t234_qspi.xml \
  --no-systemimg jetson-orin-nano-devkit-super nvme0n1p1
```

## 5. References

- [Pinmux & Device Tree](/en/hardware-bsp/pinmux-device-tree)
- [USB Configuration](/en/orin-nano-series/usb-config)
- [NVIDIA Jetson Linux Developer Guide — Kernel Customization (R36)](https://docs.nvidia.com/jetson/archives/r36.4.3/DeveloperGuide/SD/Kernel/KernelCustomization.html)
