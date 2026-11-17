---
title: Deploy ComfyUI with Jetson Containers
outline: deep
---

# Deploy ComfyUI with Jetson Containers

**`jetson-containers`** is a modular Docker container toolkit maintained by NVIDIA Jetson AI Lab for Jetson edge computing devices. It comes preconfigured with matching CUDA, cuDNN, and TensorRT environments for rapid deployment of generative AI and computer vision workloads.

**ComfyUI** is a node-based graphical workflow interface for Stable Diffusion. You can build text-to-image and image-to-image pipelines by dragging and connecting nodes, with support for LoRA, ControlNet, and video diffusion models.

This guide demonstrates deploying **ComfyUI** on a **Jetson Orin NX 16GB** running **JetPack 6.2.1**. For additional container options, see the [official `jetson-containers` ComfyUI package](https://github.com/dusty-nv/jetson-containers/tree/master/packages/diffusion/comfyui).

::: info Network Prerequisite
Before starting, ensure that your Jetson board has a stable internet connection capable of accessing GitHub and pulling Docker images.
:::

::: warning Storage Space Requirement
ComfyUI container images and diffusion model checkpoints are large. Store your OS and Docker data root on an **NVMe SSD** and reserve at least **20–40 GB+ of free disk space**.
:::

![ComfyUI node-based workflow interface](/img/jetson-container-comfyui.png)

## 1. Install jetson-containers

On the Jetson terminal, clone the repository and install the `jetson-containers` CLI utilities (including `autotag`):

```bash
git clone https://github.com/dusty-nv/jetson-containers.git
cd jetson-containers
bash install.sh
```

## 2. Pull and Run the ComfyUI Image

Use `$(autotag comfyui)` to automatically select an image tag compatible with your installed JetPack / L4T release and start the container:

```bash
jetson-containers run $(autotag comfyui)
```

::: tip Pin a Specific Image Tag
For reproducible deployments (for example, on **JetPack 6.2.1 / L4T R36.4.3**), you can specify an explicit tag instead:

```bash
jetson-containers run dustynv/comfyui:r36.4.3
```
:::

## 3. Check Terminal Startup Output

Once the image is pulled and the server starts, the terminal prints `To see the GUI go to: http://0.0.0.0:8188`:

![ComfyUI container startup terminal output](/img/jetson-container-run.png)

## 4. Open the ComfyUI Web Interface

Keep the container running in the terminal and open the ComfyUI web interface in a browser:

- **On the Jetson local desktop**: visit `http://127.0.0.1:8188`.
- **From another computer on the same LAN**: visit `http://<Jetson-IP>:8188` (replace `<Jetson-IP>` with the actual LAN IP address of the Jetson board).

![Accessing the ComfyUI web interface in a browser](/img/jetson-container-webui.png)

## 5. Mount a Local Model Directory

By default, files inside an ephemeral container are not persisted after exit. Place downloaded model checkpoints (`.safetensors` / `.ckpt`) in a host directory on the Jetson (such as `~/models`) and mount it into the container's `checkpoints` directory with **`-v`**:

```bash
mkdir -p ~/models
jetson-containers run \
  -v ~/models/:/opt/ComfyUI/models/checkpoints \
  $(autotag comfyui)
```

If pinning an explicit image tag (such as `r36.4.3`), replace `$(autotag comfyui)` with `dustynv/comfyui:r36.4.3`.

## 6. Build a Workflow and Generate Images

Refresh or reopen the ComfyUI web page, select a mounted model checkpoint in the `Load Checkpoint` node, configure your workflow parameters, and click **Queue Prompt** to generate images:

![Image generation workflow in ComfyUI](/img/jetson-container-workflow.png)

## References

- [ComfyUI Official Website](https://www.comfy.org/)
- [jetson-containers GitHub Repository](https://github.com/dusty-nv/jetson-containers)
