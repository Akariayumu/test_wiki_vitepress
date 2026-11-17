---
title: 内核与基础镜像构建
outline: deep
---

# 内核与基础镜像构建

本文介绍面向 **Jetson Orin Nano / Orin NX** 系列载板（`C1901` / `C1902` / `C1902 V2` / `C1903` / `C2401` / `C2402`）的 **JetPack 6.x（Jetson Linux R36）** 内核源码同步、驱动与设备树定制、交叉编译及基础镜像刷写流程。

::: warning 执行环境声明
除明确标注“在 Jetson 开发板终端执行”的步骤外，本文所有工具链配置、源码编译与固件刷写命令**均须在 x86_64 架构的 Ubuntu 宿主机（Host PC，推荐 Ubuntu 22.04）上交叉编译执行**，且宿主机需已通过 SDK Manager 下载并生成对应的 `Linux_for_Tegra` 目录（参见 [安装 Ubuntu 虚拟机和 SDK Manager](/flashing-guide/ubuntu-sdkmanager)）。
:::

## 1. 环境准备

### 1.1 安装编译依赖

在 Ubuntu 宿主机终端执行：

```bash
sudo apt update
sudo apt install -y build-essential bc git bison flex libssl-dev zip libncurses-dev make
```

### 1.2 下载交叉编译工具链

创建工具链目录并下载解压 NVIDIA 官方提供的 Bootlin `aarch64` 交叉编译工具链（适用于 L4T R36 / JetPack 6.x）。在 Ubuntu 宿主机终端执行：

```bash
mkdir -p $HOME/l4t-gcc-toolchain
cd $HOME/l4t-gcc-toolchain
wget https://developer.nvidia.com/downloads/embedded/l4t/r36_release_v3.0/toolchain/aarch64--glibc--stable-2022.08-1.tar.bz2
tar xf aarch64--glibc--stable-2022.08-1.tar.bz2
```

### 1.3 同步内核与设备树源码

设置 `L4T_DIR` 指向宿主机上已缓存的 `Linux_for_Tegra` 目录（以下以 **JetPack 6.2.1 / L4T R36.4.3** 为例，请根据实际目录与发行标签调整），并调用 `source_sync.sh` 拉取源码。在 Ubuntu 宿主机终端执行：

```bash
export L4T_DIR=$HOME/nvidia/nvidia_sdk/JetPack_6.2.1_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra
cd "$L4T_DIR/source"

# 将 jetson_36.4.3 替换为与当前 L4T 严格一致的发行标签（如 jetson_36.4.4）
./source_sync.sh -k -t jetson_36.4.3
```

## 2. 定制驱动与设备树

在正式编译前，可按目标载板的硬件外设需求向 `rootfs` 或源码树合入驱动与设备树修改。

### 2.1 Intel 无线网卡驱动

若载板装配了需要 `backport-iwlwifi` 驱动的 Intel M.2 无线网卡，可先参考 [网卡驱动](/orin-nano-series/network-driver) 在同内核版本的参考开发板上完成编译安装，随后从开发板 `/usr/lib/modules/$(uname -r)/updates/` 目录提取生成的 `.ko` 模块，复制到宿主机镜像缓存目录：

```text
$L4T_DIR/rootfs/lib/modules/5.15.148-tegra/updates/
```

### 2.2 Realtek RTL8125 2.5G 有线网卡驱动

对于板载 Realtek RTL8125 2.5GbE 网卡的载板（如 `C2401`），可参考 [网卡驱动](/orin-nano-series/network-driver) 获取编译好的 `r8125.ko` 模块，并放入宿主机的以下目录：

```text
$L4T_DIR/rootfs/lib/modules/5.15.148-tegra/updates/dkms/
```

镜像刷入开发板并首次启动进入系统后，在 Jetson 开发板终端执行以下命令更新模块依赖并加载驱动：

```bash
sudo depmod -a
sudo modprobe r8125
```

### 2.3 4G 通信模组内核驱动

若需内置移远（Quectel）等 4G LTE 模组的 USB 串口与拨号网卡支持，需在编译内核前修改 `$L4T_DIR/source/kernel/kernel-jammy-src/drivers/usb/serial/option.c` 及 `drivers/net/usb/` 下的驱动源码。详细补丁步骤参见 [4G 模块使用说明](/orin-nano-series/4g-module)。

### 2.4 HDMI 4K 显示配置（DCB）

NVIDIA 公版 Orin Nano 开发套件默认采用 DisplayPort（DP）输出，而控元 `C1901`、`C1903`、`C2401`、`C2402` 等载板采用原生 HDMI 接口。

在 L4T R36 源码树中，**Orin Nano / Orin NX 核心卡与参考载板对应代号为 `p3767`（核心卡）与 `p3768`（载板）**（注意请勿误改属于 AGX Orin 的 `p3737` 文件）。如需在底层设备树固化 HDMI 4K 显示支持，可参考以下路径中的 HDMI DCB 配置覆盖层或提取其 `nvidia,dcb-image` 字段合入板级设备树：

```text
$L4T_DIR/source/hardware/nvidia/t23x/nv-public/overlay/tegra234-dcb-p3767-0000-hdmi.dts
```

### 2.5 USB 3.2 端口设备树配置

第三方载板若在 UPHY 上扩展了额外的 USB 3.2 通道（如 `usb3-2`），需在 `$L4T_DIR/source/hardware/nvidia/t23x/nv-public/tegra234-p3768-0000.dtsi`（或载板专属 DTSI）中同步配置 `padctl@3520000` 的 `pads` / `ports` 与 `usb@3610000` 控制器节点。以下为 `padctl@3520000` 中 `pads` 通道启用的闭合结构示意：

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

    /* 同时需在 ports 子节点与 usb@3610000 中按载板原理图配对 usb2-X / usb3-X 伴随端口与供电 vbus-supply */
};
```

::: tip 现成设备树与设计规范
- 若使用控元标准载板（`C1901` / `C1902` / `C1902 V2` / `C1903` / `C2401`），无需手动修改源码，直接参阅 [USB 配置说明](/orin-nano-series/usb-config) 安装已验证的预编译 DTB 即可。
- 关于 Pinmux 表格、设备树节点定位与 Overlay 设计规范，请参阅 [Pinmux 与设备树](/hardware-bsp/pinmux-device-tree)。
:::

## 3. 交叉编译内核、模块与设备树

::: info 编译耗时提示
完整编译 Linux 内核与 NVIDIA 树外模块通常需要 20–40 分钟（取决于宿主机 CPU 核数）。
:::

::: danger 严禁漏设 INSTALL_MOD_PATH
执行 `sudo -E make install -C kernel` 与 `sudo -E make modules_install` 前，**必须在当前终端导出 `INSTALL_MOD_PATH="$L4T_DIR/rootfs"`**！若未设置该变量或未带 `-E` 保留环境变量，`arm64` 内核模块会被错误安装进宿主机自身的 `/lib/modules` 目录，导致宿主机系统损坏。
:::

### 3.1 配置编译环境变量

确保当前工作目录位于 `$L4T_DIR/source`（切勿执行 `cd ../../` 跳出该目录）。在 Ubuntu 宿主机终端执行：

```bash
export L4T_DIR=$HOME/nvidia/nvidia_sdk/JetPack_6.2.1_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra
cd "$L4T_DIR/source"

export CROSS_COMPILE=$HOME/l4t-gcc-toolchain/aarch64--glibc--stable-2022.08-1/bin/aarch64-buildroot-linux-gnu-
export INSTALL_MOD_PATH=$L4T_DIR/rootfs
export KERNEL_HEADERS=$PWD/kernel/kernel-jammy-src

# 校验目标 rootfs 路径存在后再继续
test -d "$INSTALL_MOD_PATH/lib/modules" || echo "请检查 L4T_DIR 路径是否正确！"
```

### 3.2 编译并安装内核与树内模块

在 Ubuntu 宿主机终端（`$L4T_DIR/source` 目录下）执行：

```bash
# 1. 编译 Linux 内核镜像与树内模块
make -C kernel

# 2. 将树内模块安装至目标 rootfs
sudo -E make install -C kernel

# 3. 将新生成的内核 Image 拷贝至 Linux_for_Tegra/kernel/
cp kernel/kernel-jammy-src/arch/arm64/boot/Image "$L4T_DIR/kernel/"
```

### 3.3 编译并安装 NVIDIA 树外模块（OOT）

在 Ubuntu 宿主机终端（`$L4T_DIR/source` 目录下）执行：

```bash
make modules
sudo -E make modules_install
```

### 3.4 编译设备树（DTB）并更新 initrd

在 Ubuntu 宿主机终端（`$L4T_DIR/source` 目录下）执行：

```bash
# 编译设备树并拷贝至 Linux_for_Tegra/kernel/dtb/
make dtbs
cp kernel-devicetree/generic-dts/dtbs/* "$L4T_DIR/kernel/dtb/"

# 回到 Linux_for_Tegra 目录更新 initrd，确保 NVMe 启动阶段模块一致
cd "$L4T_DIR"
sudo ./tools/l4t_update_initrd.sh
```

## 4. 刷写定制镜像

编译拷贝完成后，先将 Jetson 载板进入 **Recovery 恢复模式**（`C1901` / `C1902` 短接 `FC REC` 与 `GND`；`C1902 V2` / `C1903` / `C2401` 按住 `REC` 键上电），通过 USB Type-C 连接至宿主机，并确认当前终端已通过 `cd ..`（或 `cd "$L4T_DIR"`）回到 **`Linux_for_Tegra/`** 根目录。

### 4.1 完整刷写系统至 NVMe SSD

在 Ubuntu 宿主机终端（`$L4T_DIR` 目录下）执行：

- **标准功耗模式**：

```bash
cd "$L4T_DIR"
sudo ./tools/kernel_flash/l4t_initrd_flash.sh --external-device nvme0n1p1 \
  -c tools/kernel_flash/flash_l4t_t234_nvme.xml \
  -p "-c bootloader/generic/cfg/flash_t234_qspi.xml" \
  --showlogs --network usb0 jetson-orin-nano-devkit internal
```

- **SUPER 模式**（请先确认所用载板与核心卡组合支持 SUPER 供电，详见 [产品选型对比](/products/compare)）：

```bash
cd "$L4T_DIR"
sudo ./tools/kernel_flash/l4t_initrd_flash.sh --external-device nvme0n1p1 \
  -c tools/kernel_flash/flash_l4t_t234_nvme.xml \
  -p "-c bootloader/generic/cfg/flash_t234_qspi.xml" \
  --showlogs --network usb0 jetson-orin-nano-devkit-super internal
```

### 4.2 仅刷写 QSPI Bootloader

若仅需更新核心卡上的 QSPI 引导固件（不重新格式化与擦写 NVMe SSD 上的根文件系统），在 Ubuntu 宿主机终端（`$L4T_DIR` 目录下）执行：

::: info R36 配置文件路径变更
在 JetPack 6（L4T R36）中，T234 QSPI 分区表位于 `bootloader/generic/cfg/flash_t234_qspi.xml`（旧版 JetPack 5 / R35 的 `bootloader/t186ref/cfg/...` 路径已废弃）。
:::

- **标准功耗模式**：

```bash
cd "$L4T_DIR"
sudo ./flash.sh -c bootloader/generic/cfg/flash_t234_qspi.xml \
  --no-systemimg jetson-orin-nano-devkit nvme0n1p1
```

- **SUPER 模式**：

```bash
cd "$L4T_DIR"
sudo ./flash.sh -c bootloader/generic/cfg/flash_t234_qspi.xml \
  --no-systemimg jetson-orin-nano-devkit-super nvme0n1p1
```

## 5. 参考

- [Pinmux 与设备树](/hardware-bsp/pinmux-device-tree)
- [USB 配置说明](/orin-nano-series/usb-config)
- [NVIDIA Jetson Linux Developer Guide — Kernel Customization (R36)](https://docs.nvidia.com/jetson/archives/r36.4.3/DeveloperGuide/SD/Kernel/KernelCustomization.html)
