---
title: 安装使用 Ollama
outline: deep
---

# 安装使用 Ollama

**Ollama** 是一款轻量级的本地大语言模型（LLM）运行与管理框架，可将模型权重、参数配置与推理后端封装为统一镜像。在 **Jetson Orin Nano / Orin NX** 载板上，Ollama 会自动调用集成 GPU 的 CUDA 后端进行硬件加速，并提供交互式终端对话与兼容 OpenAI 格式的本地 HTTP API（默认监听 `11434` 端口）。

::: info 网络与存储准备
- 安装脚本与模型权重拉取需稳定访问 `ollama.com` 及 GitHub（国内网络环境下若下载缓慢或中断，建议提前配置可用的网络加速环境）。
- 大模型权重体积较大（默认存储在 `/usr/share/ollama/.ollama/models`），建议在 **NVMe SSD** 上部署并预留充足磁盘空间。
:::

## 1. 核心卡内存与模型规模选型

Jetson 采用 CPU 与 GPU **共享统一物理内存（Unified Memory）** 架构，Ubuntu 系统与基础后台服务本身会占用约 1.2–2 GB 内存。请根据所用核心卡容量选择合适参数规模的量化模型（默认多为 `Q4_K_M` 4-bit 量化）：

| 核心卡型号 | 统一内存容量 | 推荐模型参数规模（4-bit 量化） | 典型适用模型示例 |
| --- | --- | --- | --- |
| **Orin Nano 4GB** | 4 GB | `0.5B – 1.5B` | `deepseek-r1:1.5b`、`qwen2.5:1.5b`、`llama3.2:1b` |
| **Orin Nano 8GB / Orin NX 8GB** | 8 GB | `1.5B – 7B`（推荐 `3B`） | `llama3.2:3b`、`qwen2.5:3b`、`deepseek-r1:7b`（运行 7B 建议关闭桌面使用无头模式） |
| **Orin NX 16GB** | 16 GB | `7B – 14B` | `deepseek-r1:7b`、`deepseek-r1:8b`、`qwen2.5:7b`、`qwen2.5:14b` |

## 2. 安装 Ollama

在 Jetson 开发板终端执行官方一键安装脚本（脚本会自动检测 Arm64 与 NVIDIA JetPack GPU 环境，并注册 `ollama.service` 开机自启服务）：

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

安装完成后，检查版本号确认客户端与后台服务已就绪：

```bash
ollama -v
```

正常输出示例：

```text
ollama version is 0.9.6
```

## 3. 拉取并运行 DeepSeek-R1 1.5B

以轻量化推理模型 **DeepSeek-R1 1.5B** 为例，执行以下命令自动拉取模型并进入交互式对话模式：

```bash
ollama run deepseek-r1:1.5b
```

出现 `>>> Send a message (/? for help)` 提示符后即可直接输入问题进行对话：

![在 Jetson 上使用 Ollama 运行 DeepSeek-R1 1.5B 模型](/img/ollama-run.png)

结束对话时，在交互提示符下输入 **`/bye`**（或按下 `Ctrl + D`）即可退出会话返回终端：

```text
>>> /bye
```

## 4. 验证 GPU 加速与常用命令

在模型会话运行期间（或刚完成对话后的驻留窗口期内），可另开一个终端执行 `ollama ps` 检查模型是否成功加载至 GPU 显存：

```bash
ollama ps
```

若 **`PROCESSOR`** 列显示 **`100% GPU`**，即表明已完整启用 Jetson CUDA 硬件加速：

```text
NAME                ID              SIZE      PROCESSOR    UNTIL
deepseek-r1:1.5b    a42b25d8c10a    1.6 GB    100% GPU     4 minutes from now
```

::: tip 排障与常用管理命令
- 若 `PROCESSOR` 显示为 `100% CPU` 或较高的 CPU 分摊比例，说明当前模型超出了可用统一内存上限（可通过 [`jtop`](/orin-nano-series/jtop) 查看实时内存占用）或系统缺少 CUDA 运行库（参见 [安装 CUDA](/orin-nano-series/cuda)）。
- 查看本地已下载模型列表：`ollama list`
- 删除不再使用的本地模型释放空间：`ollama rm <模型名称>`（例如 `ollama rm deepseek-r1:1.5b`）
- 查看后台服务日志：`journalctl -u ollama -n 50 --no-pager`
:::

## 参考

- [Ollama 官方网站与模型库](https://ollama.com/library)
- [Ollama 官方文档](https://github.com/ollama/ollama/tree/main/docs)
