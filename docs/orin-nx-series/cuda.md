---
title: 安装CUDA
outline: deep
---

# 安装CUDA

Jetson CUDA是NVIDIA为边缘AI设计的并行计算平台，基于ARM的Jetson系列硬件，支持GPU加速深度学习与实时推理，低功耗高性能。

##### 安装CUDA JETSON SDK

```
sudo apt update
sudo apt install nvidia-jetpack
```

![image.png](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/scaled-1680-/rUKimage.png)

##### 对开发板进行压力测试

以下测试仅在 JetPack 6.1 (rev1) 和 JetPack 5.1.5 版本中通过验证

调整功耗上限：

```shell
sudo nvpmodel -m 2 #nano 模式2为super
sudo jetson_clocks --fan
```

cpu压力测试：

```shell
sudo apt install stress
stress --cpu 8 --io 4 --vm 2 --vm-bytes 128M --hdd 1 --hdd-bytes 1024M
```

gpu压力测试：

```shell
git clone https://github.com/anseeto/jetson-gpu-burn/
cd jetson-gpu-burn
make
./gpu_burn 100000
```

状态查询：

```shell
sudo jtop
```

![image.png](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/scaled-1680-/f1dimage.png)

> Orin Nano 整机最大功率为30W.
> Orin NX  整机最大功率为40W.
