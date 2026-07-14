---
title: 通过Jetson-container使用Comfy-UI
outline: deep
---

开始本节内容前请确定您的网络环境能正常拉取docker镜像

Jetson-container是NVIDIA为Jetson设备打造的轻量Docker环境，预装CUDA、cuDNN、TensorRT，快速部署AI边缘应用。

本节以 **Jetson Orin NX 16GB**，**JetPack6.2.1** 运行 **Comfy-UI** 为例进行展示。您也可以参考[官方示例](https://github.com/dusty-nv/jetson-containers/tree/master/packages/diffusion/comfyui)

**Comfy-UI** 是一款专业的节点式Stable Diffusion图形界面，拖拽连接即可构建文生图工作流，支持LoRA、ControlNet、视频扩散，低代码、易扩展等应用及特性。

![image](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-08/1uQimage.png)

## 1. 下载编译jetson-container环境

```shell
git clone https://github.com/dusty-nv/jetson-containers.git
cd jetson-containers
jetson-containers/install.sh
```

## 2. 拉取docker镜像并运行

```shell
jetson-containers run dustynv/comfyui:r36.4.3
```

## 3. 成功运行后命令行窗口输出如下

![image](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-08/wDnimage.png)

## 4. 打开对应服务的GUI网页

若在Jetson设备上打开则访问 [http://0.0.0.0:8188](http://0.0.0.0:8188)

若在局域网内的其他设备则输入 `http://<jetson设备IP>:8188`

![image](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-08/52qimage.png)

## 5. 设定映射路径

将开发板里下载好的模型映射到容器内部目录

```shell
jetson-containers run ~/models/:/opt/ComfyUI/models/checkpoints dustynv/comfyui:r36.4.3
```

## 6. 按照需求搭建工作流并调整参数生成图像

![image](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-08/1Naimage.png)

关于ComfyUI的使用教程请参考其官网 [ComfyUI | 用AI生成视频、图像、音频](https://www.comfy.org/zh-cn/)
