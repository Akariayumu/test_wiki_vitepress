---
title: 摄像头
---

# 摄像头

接入摄像头后，可使用以下指令查看现有摄像头的编号：

```bash
ls /dev/video*
# /dev/video0  /dev/video1
```

## 1. CSI 摄像头

> 尽量避免带电操作，接入 CSI 摄像头时注意 FPC 排线金属触点一面朝下。

### 1.1 使用 gst-launch 打开摄像头

确认 CSI 摄像头正确连接后，分别在两个命令行窗口运行以下命令打开摄像头：

```bash
# 摄像头 0
gst-launch-1.0 nvarguscamerasrc sensor-id=0 ! "video/x-raw(memory:NVMM), width=(int)1920, height=(int)1080,format=(string)NV12, framerate=(fraction)30/1" ! nvvidconv ! xvimagesink sync=false

# 摄像头 1（另一个命令行窗口运行）
gst-launch-1.0 nvarguscamerasrc sensor-id=1 ! "video/x-raw(memory:NVMM), width=(int)1920, height=(int)1080,format=(string)NV12, framerate=(fraction)30/1" ! nvvidconv ! xvimagesink sync=false
```

**参数说明：**

| 参数 | 说明 |
|------|------|
| `sensor-id` | 指定摄像头物理接口 ID，双摄使用 0 和 1 |
| `memory:NVMM` | 使用 NVIDIA GPU 内存，减少延迟 |
| `width, height` | 分辨率，需硬件支持（如 1080p） |
| `format:NV12` | 像素格式，NVIDIA 编码器原生支持 |
| `framerate` | 帧率，例如 30/1（30 FPS） |
| `sync=false` | 禁用音视频同步，减少延迟 |

![1.1 使用 gst-launch 打开摄像头](/img/wiki-fXv4.png)

## 2. USB 摄像头

![2. USB 摄像头](/img/wiki-IVR1.png)

![2. USB 摄像头](/img/wiki-Goj3.png)

![2. USB 摄像头](/img/wiki-HZH7.png)

![2. USB 摄像头](/img/wiki-FWh8.png)

![2. USB 摄像头](/img/wiki-avd6.png)

### 使用 Cheese

Cheese 是一款简单易用的摄像头应用，支持拍照、录像和连拍：

```bash
sudo apt install cheese
```

将 USB 摄像头连接至开发板 USB 接口，打开 Cheese 软件即可使用。

### 使用 Guvcview

Guvcview 是一款开源的图形界面摄像头工具：

```bash
sudo apt install guvcview
```

### 使用 nvgstcapture

也可使用 `nvgstcapture` 打开 USB 摄像头：

```bash
# V4L2 USB camera（<N> 替换为 /dev/videoN 节点）
sudo nvgstcapture --cap-dev-node 2   # 0,1 默认为 CSI 摄像头
```

> 更详细的说明可参考 [NVIDIA Developer](https://developer.nvidia.com/)
