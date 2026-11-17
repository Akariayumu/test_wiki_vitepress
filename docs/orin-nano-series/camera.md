---
title: 摄像头
outline: deep
---

# 摄像头

本文介绍如何在 Jetson Orin 系列开发板上连接与测试 **MIPI CSI 摄像头**及 **USB 免驱（UVC）摄像头**。除另有说明外，以下命令均在 **Jetson 开发板桌面终端**中执行（预览窗口需连接物理显示器或通过 [NoMachine 远程桌面](/orin-nano-series/connect-jetson) 打开）。

接入摄像头后，可执行以下命令查看系统已识别的视频设备节点：

```bash
ls /dev/video*
```

预期输出示例：

```text
/dev/video0  /dev/video1
```

若同时接入了多个摄像头，也可安装 `v4l-utils` 并通过 `v4l2-ctl --list-devices` 区分各摄像头对应的 `/dev/videoN` 节点编号。

## 1. CSI 摄像头

::: danger 严禁带电插拔 CSI 排线
**严禁在开发板通电状态下插拔 CSI 摄像头 FPC 排线！** 操作前必须先关机并彻底断开电源线，否则瞬间浪涌或触点错位极易永久烧毁摄像头模组或 Jetson 核心卡的 MIPI CSI 引脚。
:::

接线前请核对所用载板的 CSI 接口规格与排线朝向：

- **接口路数差异**：官方开发者套件、`C1901`、`C1902`、`C1902 V2`、`C1903` 均提供 **2 路** 22-pin（0.5 mm 间距）CSI 接口（`CAM0`、`CAM1`）；紧凑型 **`C2401` 仅提供 1 路** 22-pin CSI 接口；`C2402` 采用 GMSL2 扩展方案。
- **排线触点方向与旧版兼容说明**：在公版及现售控元载板（C1901 V1.3、C1902、C1902 V2、C1903、C2401）上安装 22-pin 软排线时，请轻挑翻盖锁扣，确保排线**金属触点面朝向 PCB 板面**（背向黑色锁扣舌片）插入到底后再扣紧锁扣。
  - **注意**：若使用早期 **C1901 V1.2 及更早硬件版本**，其 CSI 座线序与原厂载板存在差异（V1.3 已统一为原厂线序），请先核对板面丝印版本及 [C1901 产品介绍](/c1901/c1901)。

### 1.1 启用 CSI 摄像头设备树配置（Jetson-IO）

在 **JetPack 6 / 7** 默认系统下，接入 **IMX219**（如树莓派 V2 相机）或 **IMX477**（树莓派 HQ 相机）后，需先通过 `jetson-io.py` 启用对应的 CSI 相机叠加层（Overlay）方可识别出 `/dev/video*` 节点：

1. 在 Jetson 开发板终端启动配置工具：

   ```bash
   sudo /opt/nvidia/jetson-io/jetson-io.py
   ```

2. 使用方向键与回车依次选择：
   - **Configure Jetson 24pin CSI Connector**（工具菜单沿用此通用名称，同样适用于 Orin Nano / NX 的 22-pin CSI 座）
   - **Configure for compatible hardware**
   - 选择实际接入的相机传感器型号（例如双路 IMX219 选 **`Camera IMX219 Dual`**，单路选 `Camera IMX219 - CAM0`；IMX477 同理选 `Camera IMX477 Dual` 等）
   - **Save pin changes** → **Save and reboot to reconfigure pins**
3. 系统重启后执行 `ls /dev/video*`，确认已生成 `/dev/video0`（及双摄下的 `/dev/video1`）。

::: tip 自定义 DTB 覆盖提醒
若您此前已手动修改 `/boot/extlinux/extlinux.conf` 替换了整包设备树（如 [USB 配置说明](/orin-nano-series/usb-config)），请确认当前生效的启动项同时加载了相机叠加层或对应定制设备树。
:::

### 1.2 使用 gst-launch-1.0 打开摄像头

确认系统已识别出 CSI 摄像头后，在桌面终端执行以下 GStreamer 命令即可调用硬件 ISP 打开实时预览窗口：

打开 `CAM0`（`sensor-id=0`）：

```bash
gst-launch-1.0 nvarguscamerasrc sensor-id=0 ! \
  "video/x-raw(memory:NVMM), width=(int)1920, height=(int)1080, format=(string)NV12, framerate=(fraction)30/1" ! \
  nvvidconv ! xvimagesink sync=false
```

若载板具备双路 CSI 且已接入第二路摄像头（`CAM1`），可在另一个终端窗口运行（C2401 仅单路 CSI，仅支持 `sensor-id=0`）：

```bash
gst-launch-1.0 nvarguscamerasrc sensor-id=1 ! \
  "video/x-raw(memory:NVMM), width=(int)1920, height=(int)1080, format=(string)NV12, framerate=(fraction)30/1" ! \
  nvvidconv ! xvimagesink sync=false
```

**常用管道参数说明：**

| 参数 | 说明 |
|------|------|
| `sensor-id` | 指定物理 CSI 通道编号，双摄分别使用 `0`（`CAM0`）与 `1`（`CAM1`） |
| `memory:NVMM` | 使用 NVIDIA 零拷贝硬件内存缓冲区，显著降低 CPU 占用与延迟 |
| `width=(int)1920, height=(int)1080` | 采集分辨率，需传感器硬件模式支持（如 `1920×1080`） |
| `format=(string)NV12` | 像素格式，NVIDIA 硬件编解码与视觉加速原生支持 |
| `framerate=(fraction)30/1` | 采集帧率，例如 `30/1` 表示 30 FPS |
| `sync=false` | 关闭时钟同步直出预览画面，降低实时显示延迟 |

![使用 gst-launch-1.0 同时预览双路 CSI 摄像头画面](/img/wiki-fXv4.webp)

## 2. USB 摄像头

免驱 UVC（USB Video Class）摄像头插入载板 USB Type-A 接口后即插即用，无需配置 `jetson-io.py`。以下介绍三种常用的预览与调试工具。

### 2.1 使用 Cheese

`Cheese` 是 GNOME 桌面轻量易用的图形相机软件，支持拍照、录像与连拍测试：

1. 安装 `Cheese`：

   ```bash
   sudo apt update
   sudo apt install -y cheese
   ```

2. 将 USB 摄像头接入开发板 USB 接口，在 Ubuntu 桌面左下角应用列表中点击打开 **Cheese**（或在桌面终端执行 `cheese`）即可看到实时画面：

   ![在 Ubuntu 桌面应用菜单中打开 Cheese](/img/wiki-IVR1.webp)

   ![Cheese 实时预览 USB 摄像头画面](/img/wiki-Goj3.webp)

### 2.2 使用 Guvcview

`Guvcview` 是一款功能全面的开源 V4L2 图形调试工具，适合查看帧率并精细调节亮度、对比度、白平衡、曝光与输出格式：

1. 安装 `Guvcview`：

   ```bash
   sudo apt update
   sudo apt install -y guvcview
   ```

2. 在应用列表中点击打开 **guvcview**（若同时连接了多路摄像头，可在终端通过 `guvcview -d /dev/video2` 指定设备节点）：

   ![在 Ubuntu 桌面应用菜单中打开 Guvcview](/img/wiki-HZH7.webp)

   ![Guvcview 视频预览窗口与图像参数控制面板](/img/wiki-FWh8.webp)

### 2.3 使用 nvgstcapture

也可使用 NVIDIA 预装的命令行测试程序 `nvgstcapture-1.0` 预览 USB 摄像头。

::: info 参数说明
`nvgstcapture-1.0` 默认将信号源设为 CSI 相机（`--camsrc=1`）。用于 V4L2 USB 摄像头时，**必须显式传入 `--camsrc=0`**，并将 `--cap-dev-node=<N>` 中的 `<N>` 替换为实际 USB 摄像头对应的 `/dev/video<N>` 数字编号（例如未接 CSI 相机时通常为 `0`；已接两路 CSI 相机占用 `video0`、`video1` 时，USB 摄像头通常为 `2`）。
:::

在桌面终端执行（此处以 `/dev/video2` 为例，请按 `ls /dev/video*` 实际结果替换数字）：

```bash
# 语法：nvgstcapture-1.0 --camsrc=0 --cap-dev-node=<N>
nvgstcapture-1.0 --camsrc=0 --cap-dev-node=2
```

按 `q` 回车可退出预览程序：

![使用 nvgstcapture-1.0 预览 USB 摄像头画面](/img/wiki-avd6.webp)

更多多媒体与相机采集开发接口，可参阅 [NVIDIA Jetson Linux Multimedia API 文档](https://docs.nvidia.com/jetson/archives/r36.4/DeveloperGuide/SD/Multimedia.html)。
