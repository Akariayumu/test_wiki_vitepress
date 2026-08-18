---
title: Install CUDA
outline: deep
---

# Install CUDA

**Jetson CUDA** is NVIDIA's parallel computing platform designed for edge AI. Based on the ARM-powered Jetson hardware series, it supports **GPU-accelerated** deep learning and **real-time inference**, delivering high performance with low **power consumption**.

## Install the CUDA JETSON SDK

```bash
sudo apt update
sudo apt install nvidia-jetpack
```

![image.png](/img/cuda-install.png)

## Stress test the development board

::: info
The following tests have only been verified on **JetPack 6.1 (rev1)** and **JetPack 5.1.5**
:::

Adjust the power limit:

```bash
sudo nvpmodel -m 2 #mode 2 is super mode for nano
sudo jetson_clocks --fan
```

CPU stress test:

```bash
sudo apt install stress
stress --cpu 8 --io 4 --vm 2 --vm-bytes 128M --hdd 1 --hdd-bytes 1024M
```

GPU stress test:

```bash
git clone https://github.com/anseeto/jetson-gpu-burn/
cd jetson-gpu-burn
make
./gpu_burn 100000
```

Check status:

```bash
sudo jtop
```

![image.png](/img/cuda-jtop.png)

> The maximum total power of the Orin Nano board is **30W**.
>
> The maximum total power of the Orin NX board is **40W**.
