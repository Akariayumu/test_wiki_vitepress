---
title: 自定义启动 Logo
outline: deep
---

# 自定义启动 Logo

设备上电启动时，会先由核心卡 QSPI 中的 **UEFI** 固件完成硬件初始化与引导，期间屏幕默认显示 NVIDIA 启动 Logo。如需更换为自定义品牌画面，可在宿主机上拉取 NVIDIA EDK2（UEFI）源码，替换 Logo 资源文件后重新编译 UEFI 固件并刷入载板。

::: warning 执行环境声明
本文所有源码拉取、Docker 容器编译及固件刷写操作**均须在 x86_64 架构的 Ubuntu 宿主机（Host PC，推荐 Ubuntu 22.04）上执行**，切勿在 Jetson 开发板上直接运行。操作前请确认宿主机已缓存对应版本的 `Linux_for_Tegra` 刷机包目录（参见 [安装 Ubuntu 虚拟机和 SDK Manager](/flashing-guide/ubuntu-sdkmanager)）。
:::

## 1. 安装并配置 Docker 环境

NVIDIA 官方推荐使用 TianoCore 提供的 Docker 容器编译 EDK2 源码，以避免宿主机工具链版本冲突。若宿主机已安装 Docker，可跳过软件包安装步骤，仅确认当前用户已加入 `docker` 用户组。

在 Ubuntu 宿主机终端安装 Docker 并将当前用户加入 `docker` 组（使用 `newgrp docker` 立即在当前终端生效，无需执行 `sudo reboot` 重启宿主机）：

```bash
sudo apt update
sudo apt install -y docker.io
sudo usermod -aG docker "${USER}"
newgrp docker
```

创建工作目录与容器构建挂载目录 `/build`，并在当前终端配置 `edk2_docker` 环境变量与命令别名。在 Ubuntu 宿主机终端执行：

```bash
mkdir -p ~/uefi-workspace
cd ~/uefi-workspace
sudo mkdir -p /build
sudo chown "${USER}:${USER}" /build

export EDK2_DEV_IMAGE="ghcr.io/tianocore/containers/ubuntu-22-dev:latest"
export EDK2_USER_ARGS="-v \"${HOME}\":\"${HOME}\" -e EDK2_DOCKER_USER_HOME=\"${HOME}\""
export EDK2_BUILD_ROOT="/build"
export EDK2_BUILDROOT_ARGS="-v \"${EDK2_BUILD_ROOT}\":\"${EDK2_BUILD_ROOT}\""
alias edk2_docker="docker run -it --rm -w \"\$(pwd)\" ${EDK2_BUILDROOT_ARGS} ${EDK2_USER_ARGS} \"${EDK2_DEV_IMAGE}\""
```

::: info 会话提示
`export` 变量与 `alias edk2_docker` 仅在当前终端窗口有效。若后续新开了终端窗口，请重新执行上方环境配置段。
:::

拉取容器镜像并验证运行环境：

```bash
edk2_docker echo hello
```

首次执行会自动拉取 `ubuntu-22-dev` 镜像，验证成功将输出：

```text
hello
```

## 2. 获取源码并替换 Logo

### 2.1 拉取 NVIDIA UEFI 源码

初始化 `edkrepo` 配置并添加 NVIDIA Manifest 仓库。在 Ubuntu 宿主机终端（`~/uefi-workspace` 目录下）执行：

```bash
edk2_docker init_edkrepo_conf
edk2_docker edkrepo manifest-repos add nvidia https://github.com/NVIDIA/edk2-edkrepo-manifest.git main nvidia
```

根据目标系统所用的 JetPack / L4T 版本拉取匹配的 UEFI 源码（以下以 **JetPack 6.2.1 / L4T R36.4.4** 为例，该步骤需同步多个 Git 子仓库，耗时较长）：

```bash
edk2_docker edkrepo clone nvidia-uefi-r36.4.4 NVIDIA-Platforms r36.4.4-updates
export UEFI_DIR="$PWD/nvidia-uefi-r36.4.4"
```

### 2.2 准备并替换 Logo 图片

同步完成后，默认启动 Logo 资源位于 `$UEFI_DIR/edk2-nvidia/Silicon/NVIDIA/Assets/` 目录中：

```text
nvidia-uefi-r36.4.4/edk2-nvidia/Silicon/NVIDIA/Assets/
├── nvidiagray480.bmp    # 对应 640 × 480 分辨率输出
├── nvidiagray720.bmp    # 对应 1280 × 720 分辨率输出
└── nvidiagray1080.bmp   # 对应 1920 × 1080 分辨率输出
```

::: warning Logo 图片格式与体积硬性限制
1. **必须使用未压缩的 24 位或 32 位 `.bmp` 位图格式**：切勿直接将 `.png` 或 `.jpg` 文件修改后缀名为 `.bmp`，否则 UEFI 解析失败会导致无显示或卡死。可通过 GIMP 导出（关闭 RLE 压缩），或使用 ImageMagick 转换：
   `convert logo.png -resize 1920x1080! -type truecolor BMP3:nvidiagray1080.bmp`
2. **严格控制文件体积**：三种分辨率对应 `1920×1080`、`1280×720`、`640×480`（建议优先使用 24 位色深控制大小）。最终编译产出的 UEFI 固件二进制文件**总大小不得超过 3.5 MB**，否则超出 QSPI 分区上限会导致载板无法启动！
:::

可任选以下两种方式之一完成替换：

- **方式一：同名覆盖默认文件（推荐）**  
  将制作好的三张 `.bmp` 图片分别命名为 `nvidiagray1080.bmp`、`nvidiagray720.bmp`、`nvidiagray480.bmp`，直接覆盖放入 Assets 目录：

```bash
cp -f /path/to/your/nvidiagray1080.bmp "$UEFI_DIR/edk2-nvidia/Silicon/NVIDIA/Assets/nvidiagray1080.bmp"
cp -f /path/to/your/nvidiagray720.bmp "$UEFI_DIR/edk2-nvidia/Silicon/NVIDIA/Assets/nvidiagray720.bmp"
cp -f /path/to/your/nvidiagray480.bmp "$UEFI_DIR/edk2-nvidia/Silicon/NVIDIA/Assets/nvidiagray480.bmp"
```

- **方式二：修改固件描述文件指向自定义文件名**  
  若希望保留自定义文件名（先将 `.bmp` 放入 `$UEFI_DIR/edk2-nvidia/Silicon/NVIDIA/Assets/`），可使用文本编辑器打开 `$UEFI_DIR/edk2-nvidia/Platform/NVIDIA/NVIDIA.fvmain.fdf.inc`：

```bash
vim "$UEFI_DIR/edk2-nvidia/Platform/NVIDIA/NVIDIA.fvmain.fdf.inc"
```

定位到 Logo 资源引用段，将 `SECTION RAW` 路径改为您放入 `Assets/` 下的文件名：

```ini
FILE FREEFORM = gNvidiaGray1080BmpGuid {
  SECTION RAW = Silicon/NVIDIA/Assets/nvidiagray1080.bmp
}
FILE FREEFORM = gNvidiaGray720BmpGuid {
  SECTION RAW = Silicon/NVIDIA/Assets/nvidiagray720.bmp
}
FILE FREEFORM = gNvidiaGray480BmpGuid {
  SECTION RAW = Silicon/NVIDIA/Assets/nvidiagray480.bmp
}
```

## 3. 编译 UEFI 固件

回到 `$UEFI_DIR` 源码根目录，调用容器执行 Jetson UEFI 构建脚本。在 Ubuntu 宿主机终端执行：

```bash
cd "$UEFI_DIR"
edk2_docker edk2-nvidia/Platform/NVIDIA/Jetson/build.sh
```

编译完成后，构建产物会输出到 `$UEFI_DIR/images/` 目录。请检查 Release 版固件 `uefi_Jetson_RELEASE.bin` 是否生成且文件体积小于 **3.5 MB**：

```bash
ls -lh "$UEFI_DIR/images/uefi_Jetson_RELEASE.bin"
```

正常输出示例：

```text
-rw-r--r-- 1 ubuntu ubuntu 2.9M Nov 17 16:20 /home/ubuntu/uefi-workspace/nvidia-uefi-r36.4.4/images/uefi_Jetson_RELEASE.bin
```

## 4. 替换 UEFI 固件

在宿主机的 `Linux_for_Tegra` 刷机目录中，默认引导固件位于 `bootloader/uefi_jetson.bin`。先备份原厂固件，再用编译生成的 `uefi_Jetson_RELEASE.bin` 覆盖替换。

在 Ubuntu 宿主机终端执行（请将 `L4T_DIR` 替换为实际的刷机包路径）：

```bash
export L4T_DIR=$HOME/nvidia/nvidia_sdk/JetPack_6.2.1_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra

# 1. 备份原厂默认 UEFI 固件（以便异常时回退）
cp -a "$L4T_DIR/bootloader/uefi_jetson.bin" "$L4T_DIR/bootloader/uefi_jetson.bin.bak"

# 2. 替换为新编译的 Release 版自定义 Logo 固件
cp -f "$UEFI_DIR/images/uefi_Jetson_RELEASE.bin" "$L4T_DIR/bootloader/uefi_jetson.bin"
```

## 5. 刷入开发板

1. **进入 Recovery 恢复模式**：将载板断电，通过跳线帽短接 `FC REC` 与 `GND`（适用于 `C1901` / `C1902`）或按住 `REC` 按键（适用于 `C1902 V2` / `C1903` / `C2401`），连接 USB Type-C 数据线至宿主机后接通电源。在宿主机执行 `lsusb | grep -i nvidia` 确认已识别到设备。
2. **仅刷写 QSPI 引导分区（推荐，保留 NVMe 系统数据）**：  
   若开发板 NVMe SSD 中已安装好匹配版本的系统，仅需刷写核心卡 QSPI Flash 即可更新 UEFI 启动 Logo（耗时约 1–2 分钟，不会擦除 NVMe 用户数据）。在 Ubuntu 宿主机终端执行：

```bash
cd "$L4T_DIR"

# 标准模式配置（若使用 SUPER 固件，请将板型改为 jetson-orin-nano-devkit-super）
sudo ./flash.sh -c bootloader/generic/cfg/flash_t234_qspi.xml \
  --no-systemimg jetson-orin-nano-devkit nvme0n1p1
```

3. **随完整系统一并刷入（全新装机场景）**：  
   若需连同 NVMe SSD 系统镜像一起重新烧录，在 Ubuntu 宿主机终端执行：

```bash
cd "$L4T_DIR"
sudo ./tools/kernel_flash/l4t_initrd_flash.sh --external-device nvme0n1p1 \
  -c tools/kernel_flash/flash_l4t_t234_nvme.xml \
  -p "-c bootloader/generic/cfg/flash_t234_qspi.xml" \
  --showlogs --network usb0 jetson-orin-nano-devkit-super internal
```

刷写完成后开发板会自动重启（若使用了 `FC REC` 跳线帽或拨码开关，请先取下跳线帽或复位拨码），外接显示器即可看到替换后的自定义启动 Logo。

::: tip 异常恢复
若刷入后因图片格式不合规或体积超限导致无法正常引导，只需执行 `cp -f "$L4T_DIR/bootloader/uefi_jetson.bin.bak" "$L4T_DIR/bootloader/uefi_jetson.bin"` 恢复备份文件，重新进入 Recovery 模式刷写 QSPI 即可恢复。更多刷机说明参见 [C1902 刷入系统](/flashing-guide/c1902-flashing)。
:::
