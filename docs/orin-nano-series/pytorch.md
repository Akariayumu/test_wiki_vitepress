---
title: PyTorch 与 Torchvision
outline: deep
---

# PyTorch 与 Torchvision

PyTorch 是常用的深度学习框架，可在 Jetson 上使用 CUDA 加速完成模型开发、推理和部署。

:::tip 新项目建议优先使用 JetPack 7
如果项目需要 PyTorch、TensorRT、CUDA 等 AI 框架，并且所用 Jetson 型号及外设已支持 JetPack 7，建议优先选择 **JetPack 7 系列**。它采用更新的 Ubuntu、内核和 NVIDIA AI 计算栈，后续框架与工具也会优先围绕新平台更新。

只有在现有项目依赖 JetPack 6 专用 wheel、旧版 CUDA/TensorRT、特定驱动或尚未适配的外设时，才建议继续使用 JetPack 6。升级前应先核对硬件支持和软件兼容性。
:::

## 1. 先理解 JetPack 7 的 SBSA 变化

从 JetPack 7 系列开始，Jetson 软件与服务器基础系统架构（Server Base System Architecture，SBSA）保持一致。SBSA 统一关键硬件与固件接口，使 Arm 服务器与 Jetson 之间的操作系统支持、软件移植和部署方式更加一致。

简单来说，JetPack 7 可以像 Arm 服务器一样，直接通过 PyTorch 上游软件源使用 `pip` 安装 PyTorch，不再需要 JetPack 专用 wheel。需要注意，Jetson 使用的是 Arm64/SBSA 软件包，并不是 x86 软件包。

NVIDIA 说明：[JetPack SDK Downloads and Notes](https://developer.nvidia.com/embedded/jetpack/downloads)。

## 2. 选择安装方式

| 使用场景 | 建议方案 |
| --- | --- |
| JetPack 7 新项目 | 直接通过 PyTorch 上游软件源安装 Arm64/SBSA 软件包 |
| JetPack 6.2.1 现有项目 | 使用与 CUDA 12.6、Python 3.10 匹配的 Jetson wheel |
| 需要多个 Python/框架版本 | 使用容器；其次使用 `venv` 或 Conda 隔离环境 |
| 生产部署 | 固定 JetPack、CUDA、PyTorch、Torchvision 和镜像/包版本，不使用浮动的 `latest` |

:::warning 版本必须成套匹配
JetPack、CUDA、Python、PyTorch 和 Torchvision 任一项不匹配，都可能出现无法安装、导入时报缺少动态库，或 `torch.cuda.is_available()` 返回 `False`。Jetson 不能安装 x86 软件包。
:::

## 3. 安装前检查

先确认系统和 CUDA 环境：

```bash
head -1 /etc/nv_tegra_release
python3 --version
nvcc --version
nvidia-smi
```

安装基础依赖：

```bash
sudo apt update
sudo apt install -y python3-pip python3-venv libopenblas-dev
python3 -m pip install --upgrade pip
```

如果系统没有 `nvcc`，先完成 [CUDA 安装](/orin-nano-series/cuda)，再安装 PyTorch。

## 4. JetPack 7：使用 pip 安装

以配套 CUDA 13.2 的 JetPack 7.2 为例，先创建虚拟环境，再从 PyTorch 上游 CUDA 13.2 软件源安装：

```bash
python3 -m venv ~/venvs/jetson-ai
source ~/venvs/jetson-ai/bin/activate
python -m pip install --upgrade pip
python -m pip install torch torchvision \
  --index-url https://download.pytorch.org/whl/cu132
```

其他 JetPack 7 版本应将 `cu132` 换成与系统 CUDA 匹配的软件源。安装后执行本文“验证安装”中的 CUDA 张量测试。

## 5. JetPack 6.2.1：安装已验证 wheel

以下命令仅适用于 **JetPack 6.2.1、CUDA 12.6、Python 3.10**。不要用于 JetPack 7。

建议先创建独立环境：

```bash
python3 -m venv ~/venvs/jetson-ai
source ~/venvs/jetson-ai/bin/activate
python -m pip install --upgrade pip
```

下载并安装匹配的 PyTorch 与 Torchvision：

```bash
wget https://pypi.jetson-ai-lab.io/jp6/cu126/+f/62a/1beee9f2f1470/torch-2.8.0-cp310-cp310-linux_aarch64.whl
wget https://pypi.jetson-ai-lab.io/jp6/cu126/+f/907/c4c1933789645/torchvision-0.23.0-cp310-cp310-linux_aarch64.whl
python -m pip install \
  torch-2.8.0-cp310-cp310-linux_aarch64.whl \
  torchvision-0.23.0-cp310-cp310-linux_aarch64.whl
```

:::info
上述 wheel 来自 Jetson AI Lab 软件源，不是 JetPack 7 的 SBSA 安装包。用于正式项目时，应保存 wheel 或锁定依赖，避免上游文件变化影响重复部署。
:::

## 6. 验证安装

执行以下命令同时检查版本、CUDA 可用性和最小 GPU 运算：

```bash
python - <<'PY'
import torch

print("PyTorch:", torch.__version__)
print("CUDA runtime:", torch.version.cuda)
print("CUDA available:", torch.cuda.is_available())

if not torch.cuda.is_available():
    raise SystemExit("CUDA 不可用，请检查 JetPack、CUDA 与 PyTorch 是否匹配")

x = torch.tensor([1.0, 2.0, 3.0], device="cuda")
print("Device:", x.device)
print("Result:", (x * 2).cpu().tolist())
PY
```

正常结果应满足：

- `CUDA available: True`
- `Device: cuda:0`
- `Result: [2.0, 4.0, 6.0]`

JetPack 7.2.1 实机验证示例：

![PyTorch CUDA 可用性验证](/img/pytorch-01-cuda-verification.webp)

## 7. 运行 YOLO11 摄像头推理

确认 PyTorch CUDA 测试通过后，在同一环境中安装 Ultralytics：

```bash
python -m pip install ultralytics
```

接入摄像头后运行以下示例：

```python
import time

import cv2
from ultralytics import YOLO

model = YOLO("yolo11s.pt")
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    raise RuntimeError("无法打开摄像头")

while True:
    success, frame = cap.read()
    if not success:
        break

    start = time.perf_counter()
    results = model(frame)
    elapsed = time.perf_counter() - start

    annotated_frame = results[0].plot()
    fps = 1.0 / elapsed if elapsed > 0 else 0.0
    cv2.putText(
        annotated_frame,
        f"FPS: {fps:.2f}",
        (10, 30),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 255, 0),
        2,
    )
    cv2.imshow("YOLO11 Inference", annotated_frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
```

首次运行时 Ultralytics 会下载模型权重，需要保持网络连接。按 `q` 退出窗口。

![YOLO 摄像头推理](/img/wiki-bEUimage.webp)

更多用法见 [Ultralytics YOLO11 文档](https://docs.ultralytics.com/zh/models/yolo11/)。

## 8. 常见问题

### `torch.cuda.is_available()` 返回 `False`

先检查 `nvcc --version` 和 `nvidia-smi`，再核对 PyTorch 包是否对应当前 JetPack/CUDA。JetPack 7 上误装 `jp6` wheel 是常见原因之一。

### 安装时提示 wheel 不受支持

检查 Python 版本和 CPU 架构：

```bash
python3 --version
uname -m
```

文件名中的 `cp310` 只支持 CPython 3.10，`linux_aarch64` 只支持 64 位 Arm Linux。

### PyTorch 可用，但 Torchvision 导入失败

PyTorch 与 Torchvision 也必须版本匹配。卸载冲突版本后，按同一兼容组合重新安装：

```bash
python -m pip uninstall -y torch torchvision
```

### 摄像头无法打开

先用 `ls /dev/video*` 和 `v4l2-ctl --list-devices` 确认系统识别了摄像头，再参考 [摄像头教程](/orin-nano-series/camera)。
