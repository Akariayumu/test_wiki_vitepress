---
title: PyTorch and Torchvision
outline: deep
---

# PyTorch and Torchvision

PyTorch is a widely used deep-learning framework. On Jetson, it can use CUDA acceleration for model development, inference, and deployment.

:::tip Prefer JetPack 7 for new projects
If your project needs AI frameworks such as PyTorch, TensorRT, and CUDA, and your Jetson model and peripherals support JetPack 7, prefer the **JetPack 7 series**. It uses newer Ubuntu, kernel, and NVIDIA AI computing stacks, and future frameworks and tools will target this platform first.

Continue using JetPack 6 only when an existing project depends on JetPack 6-specific wheels, older CUDA/TensorRT, particular drivers, or peripherals not yet supported on JetPack 7. Check hardware support and software compatibility before upgrading.
:::

## 1. Understand the SBSA Change in JetPack 7

Starting with JetPack 7, the Jetson software stack conforms to the Server Base System Architecture (SBSA). SBSA standardizes key hardware and firmware interfaces, making OS support, software portability, and deployment more consistent between Arm servers and Jetson.

In practical terms, JetPack 7 can install PyTorch with `pip` directly from upstream PyTorch repositories, just like an Arm server; JetPack-specific wheels are no longer required. Jetson uses Arm64/SBSA packages, not x86 packages.

See NVIDIA's [JetPack SDK Downloads and Notes](https://developer.nvidia.com/embedded/jetpack/downloads).

## 2. Choose an Installation Method

| Use case | Recommended approach |
| --- | --- |
| New JetPack 7 project | Install Arm64/SBSA packages directly from upstream PyTorch repositories |
| Existing JetPack 6.2.1 project | Use Jetson wheels matching CUDA 12.6 and Python 3.10 |
| Multiple Python/framework versions | Use containers; otherwise isolate with `venv` or Conda |
| Production deployment | Pin JetPack, CUDA, PyTorch, Torchvision, and image/package versions; do not use a floating `latest` tag |

:::warning All versions must match
A mismatch among JetPack, CUDA, Python, PyTorch, and Torchvision can cause installation failures, missing shared libraries during import, or `torch.cuda.is_available()` returning `False`. Do not install x86 packages on Jetson.
:::

## 3. Pre-installation Checks

Check the system and CUDA environment:

```bash
head -1 /etc/nv_tegra_release
python3 --version
nvcc --version
nvidia-smi
```

Install the basic dependencies:

```bash
sudo apt update
sudo apt install -y python3-pip python3-venv libopenblas-dev
python3 -m pip install --upgrade pip
```

If `nvcc` is unavailable, complete [CUDA installation](/en/orin-nano-series/cuda) before installing PyTorch.

## 4. JetPack 7: Install with pip

For example, JetPack 7.2 includes CUDA 13.2. Create a virtual environment, then install from the upstream PyTorch CUDA 13.2 repository:

```bash
python3 -m venv ~/venvs/jetson-ai
source ~/venvs/jetson-ai/bin/activate
python -m pip install --upgrade pip
python -m pip install torch torchvision \
  --index-url https://download.pytorch.org/whl/cu132
```

For other JetPack 7 releases, replace `cu132` with the repository matching the system CUDA version. After installation, run the CUDA tensor test in “Verify the Installation.”

## 5. JetPack 6.2.1: Install Verified Wheels

The commands below apply only to **JetPack 6.2.1, CUDA 12.6, and Python 3.10**. Do not use them on JetPack 7.

Create an isolated environment first:

```bash
python3 -m venv ~/venvs/jetson-ai
source ~/venvs/jetson-ai/bin/activate
python -m pip install --upgrade pip
```

Download and install matching PyTorch and Torchvision wheels:

```bash
wget https://pypi.jetson-ai-lab.io/jp6/cu126/+f/62a/1beee9f2f1470/torch-2.8.0-cp310-cp310-linux_aarch64.whl
wget https://pypi.jetson-ai-lab.io/jp6/cu126/+f/907/c4c1933789645/torchvision-0.23.0-cp310-cp310-linux_aarch64.whl
python -m pip install \
  torch-2.8.0-cp310-cp310-linux_aarch64.whl \
  torchvision-0.23.0-cp310-cp310-linux_aarch64.whl
```

:::info
These wheels come from the Jetson AI Lab repository; they are not JetPack 7 SBSA packages. For production projects, retain the wheels or lock dependencies so upstream changes do not affect reproducible deployments.
:::

## 6. Verify the Installation

Run the following to check versions, CUDA availability, and a minimal GPU operation:

```bash
python - <<'PY'
import torch

print("PyTorch:", torch.__version__)
print("CUDA runtime:", torch.version.cuda)
print("CUDA available:", torch.cuda.is_available())

if not torch.cuda.is_available():
    raise SystemExit("CUDA is unavailable; check that JetPack, CUDA, and PyTorch match")

x = torch.tensor([1.0, 2.0, 3.0], device="cuda")
print("Device:", x.device)
print("Result:", (x * 2).cpu().tolist())
PY
```

Expected results include:

- `CUDA available: True`
- `Device: cuda:0`
- `Result: [2.0, 4.0, 6.0]`

Example verified on JetPack 7.2.1:

![Verify PyTorch CUDA availability](/img/pytorch-01-cuda-verification.webp)

## 7. Run YOLO11 Camera Inference

After the PyTorch CUDA test passes, install Ultralytics in the same environment:

```bash
python -m pip install ultralytics
```

Connect a camera and run:

```python
import time

import cv2
from ultralytics import YOLO

model = YOLO("yolo11s.pt")
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    raise RuntimeError("Unable to open the camera")

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

Ultralytics downloads the model weights on the first run, so keep the device online. Press `q` to close the window.

![YOLO camera inference](/img/wiki-bEUimage.webp)

See the [Ultralytics YOLO11 documentation](https://docs.ultralytics.com/models/yolo11/) for more examples.

## 8. Troubleshooting

### `torch.cuda.is_available()` Returns `False`

Check `nvcc --version` and `nvidia-smi`, then confirm that the PyTorch package matches the current JetPack/CUDA version. Accidentally installing a `jp6` wheel on JetPack 7 is a common cause.

### The Wheel Is Reported as Unsupported

Check the Python version and CPU architecture:

```bash
python3 --version
uname -m
```

`cp310` in the filename supports only CPython 3.10, while `linux_aarch64` supports only 64-bit Arm Linux.

### PyTorch Works but Torchvision Fails to Import

PyTorch and Torchvision versions must also match. Remove conflicting versions and reinstall a compatible pair:

```bash
python -m pip uninstall -y torch torchvision
```

### The Camera Cannot Be Opened

Use `ls /dev/video*` and `v4l2-ctl --list-devices` to confirm that the camera is detected, then see the [Camera Tutorial](/en/orin-nano-series/camera).
