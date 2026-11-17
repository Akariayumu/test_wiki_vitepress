---
title: Custom Boot Logo
outline: deep
---

# Custom Boot Logo

At power-on, the **UEFI** firmware stored in the Jetson module's QSPI flash initializes hardware and boots the operating system while displaying the default NVIDIA boot logo. To display a custom brand splash screen, fetch the NVIDIA EDK2 (UEFI) source code on a host PC, replace the logo bitmap assets, rebuild the UEFI binary, and flash it to the device.

::: warning Execution Environment
All source fetching, Docker-based EDK2 builds, and flashing commands in this guide **must be executed on an x86_64 Ubuntu host PC (Ubuntu 22.04 recommended)** — never directly on the Jetson board. Before starting, confirm that the matching `Linux_for_Tegra` directory is already prepared on your host PC (see [Install Ubuntu VM and SDK Manager](/en/flashing-guide/ubuntu-sdkmanager)).
:::

## 1. Set Up the Docker Environment

NVIDIA recommends building EDK2 inside the official TianoCore Docker container to avoid host toolchain mismatches. If Docker is already installed on your host PC, skip package installation and verify that your user belongs to the `docker` group.

On the Ubuntu host PC terminal, install Docker and add the current user to the `docker` group (`newgrp docker` activates group membership immediately in the current shell without requiring `sudo reboot`):

```bash
sudo apt update
sudo apt install -y docker.io
sudo usermod -aG docker "${USER}"
newgrp docker
```

Create a workspace directory and the `/build` mount directory, then configure the `edk2_docker` environment variables and alias in your current terminal:

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

::: info Shell Session Note
The `export` variables and `alias edk2_docker` apply only to the current terminal session. Re-run the block above if you open a new terminal window later.
:::

Pull the container image and verify the build environment:

```bash
edk2_docker echo hello
```

Once the `ubuntu-22-dev` container is pulled, the command prints:

```text
hello
```

## 2. Fetch Source Code and Replace the Logo

### 2.1 Clone NVIDIA UEFI Source Code

Initialize `edkrepo` and register the NVIDIA manifest repository. On the Ubuntu host PC terminal (inside `~/uefi-workspace`):

```bash
edk2_docker init_edkrepo_conf
edk2_docker edkrepo manifest-repos add nvidia https://github.com/NVIDIA/edk2-edkrepo-manifest.git main nvidia
```

Clone the UEFI source tree matching your target JetPack / L4T release (the example below uses **JetPack 6.2.1 / L4T R36.4.4**; syncing multiple Git repositories may take several minutes):

```bash
edk2_docker edkrepo clone nvidia-uefi-r36.4.4 NVIDIA-Platforms r36.4.4-updates
export UEFI_DIR="$PWD/nvidia-uefi-r36.4.4"
```

### 2.2 Prepare and Replace Logo Bitmaps

After synchronization finishes, the default boot logo files are located in `$UEFI_DIR/edk2-nvidia/Silicon/NVIDIA/Assets/`:

```text
nvidia-uefi-r36.4.4/edk2-nvidia/Silicon/NVIDIA/Assets/
├── nvidiagray480.bmp    # Used for 640 × 480 display output
├── nvidiagray720.bmp    # Used for 1280 × 720 display output
└── nvidiagray1080.bmp   # Used for 1920 × 1080 display output
```

::: warning Mandatory Logo Format and Size Limits
1. **Uncompressed 24-bit or 32-bit `.bmp` format is required**: Do **not** simply rename a `.png` or `.jpg` file to `.bmp` — UEFI will fail to decode compressed formats. Export an uncompressed BMP via GIMP (disable RLE compression) or convert with ImageMagick:
   `convert logo.png -resize 1920x1080! -type truecolor BMP3:nvidiagray1080.bmp`
2. **Strict 3.5 MB binary limit**: Prepare matching `1920×1080`, `1280×720`, and `640×480` bitmaps (24-bit color depth is recommended to save space). The final compiled UEFI binary **must not exceed 3.5 MB**, or QSPI partition overflow will prevent the device from booting!
:::

Choose one of the two methods below to replace the boot logo:

- **Option A: Overwrite the default bitmap files in place (Recommended)**  
  Name your custom BMP images `nvidiagray1080.bmp`, `nvidiagray720.bmp`, and `nvidiagray480.bmp`, and copy them into the `Assets` directory:

```bash
cp -f /path/to/your/nvidiagray1080.bmp "$UEFI_DIR/edk2-nvidia/Silicon/NVIDIA/Assets/nvidiagray1080.bmp"
cp -f /path/to/your/nvidiagray720.bmp "$UEFI_DIR/edk2-nvidia/Silicon/NVIDIA/Assets/nvidiagray720.bmp"
cp -f /path/to/your/nvidiagray480.bmp "$UEFI_DIR/edk2-nvidia/Silicon/NVIDIA/Assets/nvidiagray480.bmp"
```

- **Option B: Point the firmware description file to custom filenames**  
  If you prefer custom filenames (placed inside `$UEFI_DIR/edk2-nvidia/Silicon/NVIDIA/Assets/`), open `$UEFI_DIR/edk2-nvidia/Platform/NVIDIA/NVIDIA.fvmain.fdf.inc` in a text editor:

```bash
vim "$UEFI_DIR/edk2-nvidia/Platform/NVIDIA/NVIDIA.fvmain.fdf.inc"
```

Locate the logo `FILE FREEFORM` entries and update the `SECTION RAW` paths:

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

## 3. Build the UEFI Firmware

Return to the root of `$UEFI_DIR` and invoke the Jetson UEFI build script via `edk2_docker`. On the Ubuntu host PC terminal:

```bash
cd "$UEFI_DIR"
edk2_docker edk2-nvidia/Platform/NVIDIA/Jetson/build.sh
```

When compilation finishes, build artifacts are written to `$UEFI_DIR/images/`. Confirm that the release binary `uefi_Jetson_RELEASE.bin` exists and is **under 3.5 MB**:

```bash
ls -lh "$UEFI_DIR/images/uefi_Jetson_RELEASE.bin"
```

Expected output:

```text
-rw-r--r-- 1 ubuntu ubuntu 2.9M Nov 17 16:20 /home/ubuntu/uefi-workspace/nvidia-uefi-r36.4.4/images/uefi_Jetson_RELEASE.bin
```

## 4. Replace the UEFI Binary

Inside your host PC's `Linux_for_Tegra` directory, the target UEFI firmware binary is `bootloader/uefi_jetson.bin`. Back up the stock binary first, then overwrite it with your newly built `uefi_Jetson_RELEASE.bin`.

On the Ubuntu host PC terminal (adjust `L4T_DIR` to match your actual installation path):

```bash
export L4T_DIR=$HOME/nvidia/nvidia_sdk/JetPack_6.2.1_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra

# 1. Back up the stock UEFI firmware binary
cp -a "$L4T_DIR/bootloader/uefi_jetson.bin" "$L4T_DIR/bootloader/uefi_jetson.bin.bak"

# 2. Replace it with the newly built release UEFI binary
cp -f "$UEFI_DIR/images/uefi_Jetson_RELEASE.bin" "$L4T_DIR/bootloader/uefi_jetson.bin"
```

## 5. Flash to the Device

1. **Enter Force Recovery Mode**: Power off the carrier board, short `FC REC` and `GND` with a jumper cap (`C1901` / `C1902`) or hold down the `REC` button (`C1902 V2` / `C1903` / `C2401`), connect the USB Type-C cable to the host PC, and apply power. Run `lsusb | grep -i nvidia` on the host PC to verify detection.
2. **Flash QSPI Bootloader Only (Recommended — preserves NVMe system data)**:  
   If a matching OS is already installed on the NVMe SSD, flash only the module's QSPI flash to update UEFI and the boot logo in ~1–2 minutes without wiping NVMe user data. On the Ubuntu host PC terminal:

```bash
cd "$L4T_DIR"

# Standard mode (replace board name with jetson-orin-nano-devkit-super if running SUPER firmware)
sudo ./flash.sh -c bootloader/generic/cfg/flash_t234_qspi.xml \
  --no-systemimg jetson-orin-nano-devkit nvme0n1p1
```

3. **Flash Full System Image (Fresh installation)**:  
   If flashing a full OS image onto the NVMe SSD at the same time, run on the Ubuntu host PC terminal:

```bash
cd "$L4T_DIR"
sudo ./tools/kernel_flash/l4t_initrd_flash.sh --external-device nvme0n1p1 \
  -c tools/kernel_flash/flash_l4t_t234_nvme.xml \
  -p "-c bootloader/generic/cfg/flash_t234_qspi.xml" \
  --showlogs --network usb0 jetson-orin-nano-devkit-super internal
```

Once flashing completes, the board reboots automatically (remember to remove any `FC REC` jumper cap or reset the recovery DIP switch), and your custom boot logo will appear on the connected display.

::: tip Rollback Recovery
If the device fails to boot due to an invalid BMP format or oversized UEFI binary, restore the backup (`cp -f "$L4T_DIR/bootloader/uefi_jetson.bin.bak" "$L4T_DIR/bootloader/uefi_jetson.bin"`), re-enter Recovery Mode, and re-flash QSPI. For carrier-specific flashing details, see [Flash the C1902](/en/flashing-guide/c1902-flashing).
:::
