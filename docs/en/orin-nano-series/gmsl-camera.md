---
title: GMSL Camera Guide
outline: deep
---

# GMSL Camera Guide

This guide explains how to deploy the GMSL camera driver, install runtime dependencies, and launch live camera preview on carrier boards equipped with the **MAX96724** 4-channel GMSL2 deserializer adapter board (such as the [C2402](/en/c2402/c2402)).

::: danger Hardware Connection Safety Warning
The GMSL2 adapter board and Mini-FAKRA coaxial ports carry **PoC (Power over Coax)** voltage. **Always power off the carrier board completely before installing the adapter board, tightening the mounting screws, or connecting/disconnecting coaxial camera cables. Never hot-plug** while powered on, as voltage surges can damage the PoC filter circuitry, the MAX96724 deserializer, or the camera serializer.
:::

## 1. Check System Version and Obtain the Driver

GMSL camera drivers are strictly matched to the **Jetson module type (Orin Nano / Orin NX)**, the **JetPack (L4T kernel) version**, and the specific **GMSL camera model (serializer + image sensor)**.

First, check your active L4T and JetPack versions in a **Jetson terminal**, then **contact customer support** with your module model, system version, and camera model to obtain the matching GMSL driver package:

```bash
cat /etc/nv_tegra_release
sudo apt-cache show nvidia-jetpack
```

## 2. Install Runtime Dependencies

The camera preview utility requires NVIDIA OpenCV and DeepStream runtime libraries. Run the following commands in a **Jetson terminal** (replace `6.x` with the DeepStream version corresponding to your JetPack release, such as `deepstream-6.3` or `deepstream-7.0`):

```bash
sudo apt update
sudo apt install -y nvidia-opencv
sudo apt install -y deepstream-6.x
```

## 3. Deploy the Driver Files

Upload the prebuilt driver package obtained from customer support to the Jetson board and extract it to locate the `bin_copy` directory.

::: warning Back Up Before Overwriting
Deploying `bin_copy` updates kernel images, device trees, and camera driver files in the root filesystem. Backing up your existing `/boot/Image`, DTB files, and `/boot/extlinux/extlinux.conf` beforehand is recommended.
:::

In the **Jetson terminal**, copy all files under `bin_copy/` to the root directory `/` and reboot for the driver to take effect:

```bash
sudo cp -rfvp ./bin_copy/* /
sudo reboot
```

::: details Optional: Build the Driver from Source (Run on Ubuntu Host PC)
If you received an offline driver source archive (for source-based workflows such as JetPack 5.x), cross-compile the `bin_copy` package on an **x86_64 Ubuntu host PC** as follows:

1. Install host build tools:
   ```bash
   sudo apt update
   sudo apt install -y build-essential flex bison libssl-dev python3
   ```
2. Extract the driver source archive and download required build binaries (replace the archive filename with your actual file):
   ```bash
   tar xvf jetson_rXX.X.X_xxxxx.tar.gz
   cd jetson_rXX.X.X_xxxxx/binaries
   ./get.sh
   ```
3. Set the `MY_BOARD` environment variable in your active build terminal according to your Jetson module (re-export if you open a new terminal, or append to `~/.bashrc`):
   ```bash
   # For Jetson Orin Nano:
   export MY_BOARD=orin_nano

   # For Jetson Orin NX:
   export MY_BOARD=orin_nx
   ```
4. Compile and sign the kernel and driver modules:
   ```bash
   cd ../Linux_for_Tegra/source/public/kernel/mybuild
   ./mybuild_all.sh
   ./mysign.sh
   ```
5. Transfer the generated `bin_copy/` directory to your Jetson board running the matching JetPack version, then copy it to `/` with `sudo cp -rfvp ./bin_copy/* /` and reboot as described in Section 3.
:::

## 4. Detect and Launch the Cameras

1. **Hardware check**: With power disconnected, verify that the GMSL2 adapter board is firmly seated and secured with screws, and that the Mini-FAKRA coaxial cables are locked into place. Apply power to boot the system.
2. **Verify video device nodes**: Open a **desktop terminal on the Jetson** (connected to an HDMI/DP monitor or remote desktop) and confirm that `/dev/video*` nodes are present:
   ```bash
   ls /dev/video*
   ```
3. **Launch camera preview**: Run the bundled `run_camera` utility to view live camera streams:
   ```bash
   # No arguments: open all connected GMSL cameras simultaneously
   run_camera

   # Specify a single channel (0–3 selects camera 1–4; e.g., open camera 0)
   run_camera 0

   # Specify a custom preview window size (e.g., 960×540)
   WIDTH=960 HEIGHT=540 run_camera
   ```

## 5. Troubleshooting

- **No `/dev/video*` nodes appear**:
  1. Confirm that `cat /etc/nv_tegra_release` matches the target L4T version of the driver package;
  2. Power off completely and verify that the board-to-board connector on the GMSL2 adapter board is fully seated and the Mini-FAKRA coaxial connector is latched;
  3. Ensure your power supply (12V recommended) has sufficient power headroom when powering multiple PoC cameras simultaneously.
- **`run_camera` fails with missing libraries or display errors**:
  1. Confirm that `nvidia-opencv` and the matching `deepstream-6.x` package from Section 2 are installed;
  2. `run_camera` opens a graphical preview window — run it from a local desktop terminal or remote desktop session rather than a headless SSH session without X11/display forwarding.
