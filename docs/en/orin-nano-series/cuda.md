---
title: Install CUDA
outline: deep
---

# Install CUDA

**CUDA** is NVIDIA's parallel computing platform and programming model. On Arm-based Jetson Orin edge computing devices, CUDA enables **GPU-accelerated** deep learning and **real-time inference**, combining high compute performance with low power consumption.

## 1. Install JetPack CUDA Components

After flashing the base L4T system, install the `nvidia-jetpack` meta-package to pull in the matching CUDA, cuDNN, TensorRT, and multimedia SDK components:

```bash
sudo apt update
sudo apt install -y nvidia-jetpack
```

![Installing the nvidia-jetpack meta-package](/img/cuda-install.png)

## 2. Configure Environment Variables and Verify

`nvidia-jetpack` installs the CUDA toolkit under `/usr/local/cuda`. Add its binary and shared library directories to `~/.bashrc` so `nvcc` and CUDA runtime libraries are available in your shell.

Run the commands below (idempotent check prevents duplicate entries) and reload `~/.bashrc`:

```bash
grep -qxF 'export PATH=/usr/local/cuda/bin:$PATH' ~/.bashrc || \
  echo 'export PATH=/usr/local/cuda/bin:$PATH' >> ~/.bashrc
grep -qxF 'export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH' ~/.bashrc || \
  echo 'export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH' >> ~/.bashrc
source ~/.bashrc
```

Verify the `nvcc` compiler version:

```bash
nvcc --version
```

Expected output (exact version varies by JetPack release):

```text
nvcc: NVIDIA (R) Cuda compiler driver
Copyright (c) 2005-2024 NVIDIA Corporation
Built on Tue_Oct_29_23:53:06_PDT_2024
Cuda compilation tools, release 12.6, V12.6.85
Build cuda_12.6.r12.6/compiler.35059454_0
```

## 3. Stress Test the Device (Optional)

::: info Version Note
The stress test workflow below has been verified on **JetPack 5.1.5** and **JetPack 6.x**. Before running sustained load tests, verify that the cooling fan is properly connected and your power supply has sufficient wattage headroom.
:::

### 3.1 Enable Maximum Power Mode

`nvpmodel` mode IDs differ across modules (Orin Nano vs. Orin NX) and between standard and SUPER firmware (for example, `-m 2` is `MAXN SUPER` on Orin Nano SUPER firmware, whereas on **Orin NX** the highest power mode is **`-m 0`** while `-m 2` caps power at `15W`).

Query all available power profiles on your board first:

```bash
sudo nvpmodel -q --verbose
```

Replace `<ID>` below with the highest performance mode ID listed for your module (for example, `2` on Orin Nano SUPER or `0` on Orin NX), and lock clocks and fan speed to maximum:

```bash
sudo nvpmodel -m <ID>
sudo jetson_clocks --fan
```

### 3.2 CPU and Memory Stress Test

Install `stress` and run a 300-second (5-minute) CPU and memory test across all available cores (`--hdd` is intentionally omitted to avoid unnecessary write wear on the NVMe SSD):

```bash
sudo apt install -y stress
stress --cpu $(nproc) --io 4 --vm 2 --vm-bytes 128M --timeout 300s
```

### 3.3 GPU Stress Test

Clone and build `jetson-gpu-burn`, passing the test duration in **seconds** (`300` runs for 5 minutes; increase the value if conducting extended burn-in tests):

```bash
git clone https://github.com/anseeto/jetson-gpu-burn.git
cd jetson-gpu-burn
make
./gpu_burn 300
```

### 3.4 Monitor Temperatures and Power Draw

While the stress test is running, open a second terminal and launch [`jtop`](/en/orin-nano-series/jtop) to monitor clock speeds, temperatures, and power draw in real time:

```bash
jtop
```

![Monitoring stress test status and power with jtop](/img/cuda-jtop.png)

::: info Peak Power Reference
Under full CPU + GPU load in SUPER mode, total system power draw can reach up to **~30W** on **Orin Nano** and **~40W** on **Orin NX** (depending on attached peripherals and carrier board power design).
:::
