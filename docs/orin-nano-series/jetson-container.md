---
title: 使用 Jetson Containers 部署 ComfyUI
outline: deep
---

# 使用 Jetson Containers 部署 ComfyUI

**`jetson-containers`** 是由 NVIDIA Jetson AI Lab 维护的模块化 Docker 容器工具集，面向 Jetson 系列边缘计算设备预配置了匹配的 CUDA、cuDNN 与 TensorRT 运行环境，便于快速部署各类生成式 AI 与视觉应用。

**ComfyUI** 是一款节点式 Stable Diffusion 图形化工作流界面，通过拖拽与连接节点即可构建文生图、图生图工作流，支持 LoRA、ControlNet 及视频生成模型，具备低代码与易扩展等特性。

本教程以 **Jetson Orin NX 16GB**（运行 **JetPack 6.2.1**）部署 **ComfyUI** 为例进行演示，更多容器参数也可参考 [`jetson-containers` 官方 ComfyUI 示例](https://github.com/dusty-nv/jetson-containers/tree/master/packages/diffusion/comfyui)。

::: info 网络准备
开始前请确认 Jetson 开发板已具备稳定的互联网连接，能够正常访问 GitHub 并拉取 Docker 镜像。
:::

::: warning 存储空间要求
ComfyUI 容器镜像及扩散模型权重（Checkpoints）体积较大，建议将系统与 Docker 数据目录部署在 **NVMe SSD** 上，并至少预留 **20–40 GB 以上的可用存储空间**。
:::

![ComfyUI 节点式工作流界面](/img/jetson-container-comfyui.png)

## 1. 安装 jetson-containers 环境

在 Jetson 开发板终端执行以下命令，克隆仓库并安装 `jetson-containers` 命令行工具（含 `autotag`）：

```bash
git clone https://github.com/dusty-nv/jetson-containers.git
cd jetson-containers
bash install.sh
```

## 2. 拉取并运行 ComfyUI 镜像

推荐使用 `$(autotag comfyui)` 自动匹配与当前系统 JetPack / L4T 版本兼容的镜像标签并启动容器：

```bash
jetson-containers run $(autotag comfyui)
```

::: tip 指定固定镜像版本
若需固定镜像标签（例如在 **JetPack 6.2.1 / L4T R36.4.3** 环境下复现部署），可直接指定版本号运行：

```bash
jetson-containers run dustynv/comfyui:r36.4.3
```
:::

## 3. 查看终端启动状态

镜像拉取完成并成功启动服务后，终端会输出 `To see the GUI go to: http://0.0.0.0:8188` 提示信息：

![ComfyUI 容器启动终端输出](/img/jetson-container-run.png)

## 4. 访问 ComfyUI 网页界面

保持容器终端运行，在浏览器中打开 ComfyUI 网页端：

- **在 Jetson 本机桌面浏览器打开**：访问 `http://127.0.0.1:8188`。
- **在局域网内其他电脑浏览器打开**：访问 `http://<Jetson-IP>:8188`（将 `<Jetson-IP>` 替换为开发板实际的局域网 IP 地址）。

![浏览器访问 ComfyUI 网页界面](/img/jetson-container-webui.png)

## 5. 挂载本地模型目录

默认启动方式下，容器退出后内部文件不会保留。建议提前将下载好的模型权重（`.safetensors` / `.ckpt`）存放在宿主机目录（如 `~/models`），并通过 **`-v`** 参数挂载到容器内的 `checkpoints` 目录：

```bash
mkdir -p ~/models
jetson-containers run \
  -v ~/models/:/opt/ComfyUI/models/checkpoints \
  $(autotag comfyui)
```

若使用固定标签镜像（如 `r36.4.3`），可将末尾的 `$(autotag comfyui)` 替换为 `dustynv/comfyui:r36.4.3`。

## 6. 搭建工作流生成图像

刷新或重新打开 ComfyUI 网页界面后，即可在 `Load Checkpoint` 节点中选择已挂载的模型权重，按需搭建节点工作流并点击 **Queue Prompt** 生成图像：

![ComfyUI 文生图工作流生成效果](/img/jetson-container-workflow.png)

## 参考

- [ComfyUI 官方网站](https://www.comfy.org/zh-cn/)
- [jetson-containers GitHub 仓库](https://github.com/dusty-nv/jetson-containers)
