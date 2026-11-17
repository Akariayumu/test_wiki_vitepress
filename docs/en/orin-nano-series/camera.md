---
title: Camera
outline: deep
---

# Camera

This guide explains how to connect and test **MIPI CSI cameras** and **UVC USB cameras** on Jetson Orin series boards. Unless otherwise noted, run all commands in a **desktop terminal on the Jetson board** (live video preview requires either a connected monitor or a [NoMachine remote desktop session](/en/orin-nano-series/connect-jetson)).

After attaching a camera, list the detected video device nodes:

```bash
ls /dev/video*
```

Expected output:

```text
/dev/video0  /dev/video1
```

When multiple cameras are connected, you can install `v4l-utils` and run `v4l2-ctl --list-devices` to identify which `/dev/videoN` node belongs to each camera.

## 1. CSI Camera

::: danger Never Hot-Plug CSI Ribbon Cables
**Never connect or disconnect CSI FPC ribbon cables while the board is powered on!** Always shut down the system and unplug the main power cable first. Hot-plugging a CSI cable can permanently damage the camera sensor or the Jetson module's MIPI CSI pins.
:::

Before wiring, verify the CSI connector count and ribbon cable orientation for your carrier board:

- **CSI connector count**: The Official Developer Kit, `C1901`, `C1902`, `C1902 V2`, and `C1903` provide **two** 22-pin (0.5 mm pitch) CSI connectors (`CAM0` and `CAM1`). The compact **`C2401` provides one** 22-pin CSI connector (`CAM0` only), while `C2402` uses a GMSL2 expansion header.
- **Cable orientation & legacy board revisions**: On the Official DevKit and current KYtech boards (C1901 V1.3, C1902, C1902 V2, C1903, C2401), gently lift the connector latch, insert the 22-pin FPC cable with the **exposed metal contacts facing down toward the PCB** (away from the black latch actuator), and press the latch closed.
  - **Note**: Early **C1901 V1.2 and older** revisions used a different CSI pinout from the reference board (updated to match the reference pinout starting in C1901 V1.3). Check your PCB silkscreen revision and [C1901 Introduction](/en/c1901/c1901) before connecting.

### 1.1 Enable the CSI Camera Overlay (Jetson-IO)

Under default **JetPack 6 / 7** firmware, before using an **IMX219** (e.g., Raspberry Pi Camera Module V2) or **IMX477** (Raspberry Pi HQ Camera), enable the matching device tree overlay with `jetson-io.py` so the kernel probes `/dev/video*`:

1. Launch `jetson-io.py` in the Jetson terminal:

   ```bash
   sudo /opt/nvidia/jetson-io/jetson-io.py
   ```

2. Navigate through the menu using the arrow keys and `Enter`:
   - **Configure Jetson 24pin CSI Connector** (Jetson-IO uses this menu label for the 22-pin CSI connectors on Orin Nano / NX as well)
   - **Configure for compatible hardware**
   - Select your camera sensor model (for example, **`Camera IMX219 Dual`** for dual IMX219 cameras, `Camera IMX219 - CAM0` for a single camera, or `Camera IMX477 Dual` for IMX477)
   - **Save pin changes** → **Save and reboot to reconfigure pins**
3. After rebooting, run `ls /dev/video*` to confirm that `/dev/video0` (and `/dev/video1` for dual cameras) is present.

::: tip Custom Device Tree Notice
If you previously replaced the full `FDT` entry in `/boot/extlinux/extlinux.conf` (for example per [USB Configuration](/en/orin-nano-series/usb-config)), ensure that your active boot entry retains the `FDTOVERLAYS` camera overlay line or uses a combined DTB.
:::

### 1.2 Open the Camera with gst-launch-1.0

Once the CSI camera is detected, open a live hardware-ISP preview stream using GStreamer:

Preview `CAM0` (`sensor-id=0`):

```bash
gst-launch-1.0 nvarguscamerasrc sensor-id=0 ! \
  "video/x-raw(memory:NVMM), width=(int)1920, height=(int)1080, format=(string)NV12, framerate=(fraction)30/1" ! \
  nvvidconv ! xvimagesink sync=false
```

To preview a second CSI camera on `CAM1` simultaneously, run the following in a second terminal window (not applicable to single-CSI boards such as C2401):

```bash
gst-launch-1.0 nvarguscamerasrc sensor-id=1 ! \
  "video/x-raw(memory:NVMM), width=(int)1920, height=(int)1080, format=(string)NV12, framerate=(fraction)30/1" ! \
  nvvidconv ! xvimagesink sync=false
```

**Pipeline parameter reference:**

| Parameter | Description |
|------|------|
| `sensor-id` | Physical CSI port index (`0` for `CAM0`, `1` for `CAM1`) |
| `memory:NVMM` | Uses zero-copy NVIDIA GPU memory buffers to minimize latency and CPU load |
| `width=(int)1920, height=(int)1080` | Capture resolution; must match a mode supported by the camera sensor |
| `format=(string)NV12` | Pixel format natively supported by NVIDIA hardware encoders and converters |
| `framerate=(fraction)30/1` | Capture frame rate (e.g., `30/1` = 30 FPS) |
| `sync=false` | Disables sink clock synchronization for lowest live-preview latency |

![Dual CSI camera live preview using gst-launch-1.0](/img/wiki-fXv4.webp)

## 2. USB Camera

Standard UVC (USB Video Class) webcams work plug-and-play when connected to a USB Type-A port without requiring `jetson-io.py`. Below are three common tools for previewing and tuning USB cameras.

### 2.1 Use Cheese

`Cheese` is a lightweight GNOME webcam application for quick photo capture, video recording, and burst testing:

1. Install `Cheese`:

   ```bash
   sudo apt update
   sudo apt install -y cheese
   ```

2. Plug the USB camera into a USB Type-A port and launch **Cheese** from the Ubuntu Applications grid (or run `cheese` in a desktop terminal):

   ![Open Cheese from the Ubuntu Applications menu](/img/wiki-IVR1.webp)

   ![Live USB camera preview in Cheese](/img/wiki-Goj3.webp)

### 2.2 Use Guvcview

`Guvcview` is an open-source V4L2 graphical utility that provides real-time frame rate monitoring alongside granular controls for brightness, contrast, white balance, exposure, and pixel formats:

1. Install `Guvcview`:

   ```bash
   sudo apt update
   sudo apt install -y guvcview
   ```

2. Open **guvcview** from the Applications menu (if multiple cameras are attached, specify the target node in a terminal, e.g., `guvcview -d /dev/video2`):

   ![Open Guvcview from the Ubuntu Applications menu](/img/wiki-HZH7.webp)

   ![Guvcview live video window and image controls panel](/img/wiki-FWh8.webp)

### 2.3 Use nvgstcapture

You can also test a V4L2 USB camera from the command line using NVIDIA's pre-installed `nvgstcapture-1.0` tool.

::: info Required Flags for USB Cameras
By default, `nvgstcapture-1.0` expects a CSI camera (`--camsrc=1`). To open a V4L2 USB camera, **you must pass `--camsrc=0`** and set `--cap-dev-node=<N>` to the numeric suffix of your USB camera's `/dev/video<N>` node (for example, `0` when no CSI cameras are attached, or `2` when two CSI cameras already occupy `video0` and `video1`).
:::

Run the following command in a desktop terminal (replace `2` with your actual `/dev/video<N>` index):

```bash
# Syntax: nvgstcapture-1.0 --camsrc=0 --cap-dev-node=<N>
nvgstcapture-1.0 --camsrc=0 --cap-dev-node=2
```

Type `q` and press `Enter` in the terminal to close the preview:

![Live USB camera preview with nvgstcapture-1.0](/img/wiki-avd6.webp)

For advanced GStreamer pipelines and V4L2/Argus programming, refer to the [NVIDIA Jetson Linux Multimedia Guide](https://docs.nvidia.com/jetson/archives/r36.4/DeveloperGuide/SD/Multimedia.html).
