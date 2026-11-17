---
title: 安装 CUDA
outline: deep
---

# 安装 CUDA

**CUDA** 是 NVIDIA 推出的并行计算平台与编程模型。在基于 Arm 架构的 Jetson Orin 系列边缘计算设备上，CUDA 支持 **GPU 加速**深度学习与**实时推理**，兼顾低功耗与高算力。

## 1. 安装 JetPack CUDA 组件

刷入基础 L4T 系统后，可通过 `nvidia-jetpack` 元软件包一次性安装与当前系统匹配的 CUDA、cuDNN、TensorRT 等完整 SDK 组件：

```bash
sudo apt update
sudo apt install -y nvidia-jetpack
```

![安装 nvidia-jetpack 软件包](/img/cuda-install.png)

## 2. 配置环境变量并验证

`nvidia-jetpack` 默认将 CUDA 工具链安装在 `/usr/local/cuda` 目录下，需将其可执行文件与动态库目录加入 `~/.bashrc` 才能在终端直接调用 `nvcc`。

执行以下命令写入环境变量（自动去重避免重复追加）并立即生效：

```bash
grep -qxF 'export PATH=/usr/local/cuda/bin:$PATH' ~/.bashrc || \
  echo 'export PATH=/usr/local/cuda/bin:$PATH' >> ~/.bashrc
grep -qxF 'export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH' ~/.bashrc || \
  echo 'export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH' >> ~/.bashrc
source ~/.bashrc
```

验证 `nvcc` 编译器版本：

```bash
nvcc --version
```

正常输出示例（版本号随所用 JetPack 发行版变化）：

```text
nvcc: NVIDIA (R) Cuda compiler driver
Copyright (c) 2005-2024 NVIDIA Corporation
Built on Tue_Oct_29_23:53:06_PDT_2024
Cuda compilation tools, release 12.6, V12.6.85
Build cuda_12.6.r12.6/compiler.35059454_0
```

## 3. 整机压力测试（可选）

::: info 版本说明
以下压力测试方法已在 **JetPack 5.1.5** 与 **JetPack 6.x** 环境中验证通过。压测前请确保散热风扇连接正常且电源适配器功率充足。
:::

### 3.1 开启最高性能功耗模式

不同核心卡型号（Orin Nano 与 Orin NX）及标准/SUPER 固件的 `nvpmodel` 模式编号并不相同（例如在 Orin Nano SUPER 固件中 `-m 2` 为 `MAXN SUPER`，而在 **Orin NX** 上最高性能档通常为 **`-m 0`**，`-m 2` 反而是 `15W` 降频档）。

请先查询当前设备支持的所有功耗档位与编号：

```bash
sudo nvpmodel -q --verbose
```

根据查询结果，将 `<ID>` 替换为目标最高性能模式编号（例如 Orin Nano SUPER 填 `2`，Orin NX 填 `0`），并开启最高频率与风扇满速运行：

```bash
sudo nvpmodel -m <ID>
sudo jetson_clocks --fan
```

### 3.2 CPU 与内存压力测试

安装 `stress` 并根据当前核心卡 CPU 线程数运行 300 秒（5 分钟）负载测试（不附带 `--hdd` 参数，避免高频擦写损伤 NVMe SSD 寿命）：

```bash
sudo apt install -y stress
stress --cpu $(nproc) --io 4 --vm 2 --vm-bytes 128M --timeout 300s
```

### 3.3 GPU 压力测试

拉取并编译 `jetson-gpu-burn`，传入压测持续秒数（以下以 `300` 秒即 5 分钟为例；如需长时间烤机可按需增大秒数）：

```bash
git clone https://github.com/anseeto/jetson-gpu-burn.git
cd jetson-gpu-burn
make
./gpu_burn 300
```

### 3.4 监控压测状态与功耗

压测进行期间，可另开一个终端窗口运行 [`jtop`](/orin-nano-series/jtop) 实时观察频率、温度与整机功耗：

```bash
jtop
```

![使用 jtop 监控压测状态与功耗](/img/cuda-jtop.png)

::: info 整机峰值功耗参考
在 SUPER 固件最高性能满载工况下，**Orin Nano** 整机峰值功耗最高可达约 **30W**，**Orin NX** 整机峰值功耗最高可达约 **40W**（具体取决于外接外设数量与载板供电设计）。
:::
