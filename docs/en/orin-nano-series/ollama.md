---
title: Install and Use Ollama
outline: deep
---

# Install and Use Ollama

**Ollama** is a lightweight runtime and management framework for local large language models (LLMs) that bundles model weights, configuration, and backend dependencies into unified images. On **Jetson Orin Nano / Orin NX** carrier boards, Ollama automatically detects the integrated NVIDIA GPU for CUDA-accelerated inference and exposes both an interactive CLI and an OpenAI-compatible local REST API (listening on port `11434` by default).

::: info Network and Storage Prerequisites
- Installing Ollama and pulling model weights requires a stable internet connection able to reach `ollama.com` and GitHub.
- LLM weights require several gigabytes of storage (saved under `/usr/share/ollama/.ollama/models` by default). Running on an **NVMe SSD** with ample free space is strongly recommended.
:::

## 1. Recommended Model Sizes by Module

Jetson modules use a **Unified Memory** architecture shared between CPU and GPU, and Ubuntu plus background system services consume roughly 1.2–2 GB of RAM. Choose quantized model sizes (typically `Q4_K_M` 4-bit quantization) tailored to your module's RAM capacity:

| Module | Unified Memory | Recommended Parameter Size (4-bit) | Example Models |
| --- | --- | --- | --- |
| **Orin Nano 4GB** | 4 GB | `0.5B – 1.5B` | `deepseek-r1:1.5b`, `qwen2.5:1.5b`, `llama3.2:1b` |
| **Orin Nano 8GB / Orin NX 8GB** | 8 GB | `1.5B – 7B` (`3B` recommended) | `llama3.2:3b`, `qwen2.5:3b`, `deepseek-r1:7b` (use headless mode without desktop GUI for 7B) |
| **Orin NX 16GB** | 16 GB | `7B – 14B` | `deepseek-r1:7b`, `deepseek-r1:8b`, `qwen2.5:7b`, `qwen2.5:14b` |

## 2. Install Ollama

On the Jetson terminal, run the official installation script (it automatically detects Arm64 and NVIDIA JetPack GPU libraries, and registers the `ollama.service` systemd daemon):

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

Verify the installed version once the script finishes:

```bash
ollama -v
```

Expected output:

```text
ollama version is 0.9.6
```

## 3. Run DeepSeek-R1 1.5B

Using the compact reasoning model **DeepSeek-R1 1.5B** as an example, pull and launch an interactive chat session:

```bash
ollama run deepseek-r1:1.5b
```

When `>>> Send a message (/? for help)` appears, type a prompt to interact with the model:

![Running DeepSeek-R1 1.5B with Ollama on Jetson](/img/ollama-run.png)

To end the chat session and return to the shell, type **`/bye`** (or press `Ctrl + D`) at the prompt:

```text
>>> /bye
```

## 4. Verify GPU Acceleration and Common Commands

While a model is active in memory, open a second terminal and run `ollama ps` to confirm that inference is offloaded to the GPU:

```bash
ollama ps
```

Confirm that the **`PROCESSOR`** column reports **`100% GPU`**, indicating full Jetson CUDA hardware acceleration:

```text
NAME                ID              SIZE      PROCESSOR    UNTIL
deepseek-r1:1.5b    a42b25d8c10a    1.6 GB    100% GPU     4 minutes from now
```

::: tip Troubleshooting & Useful Commands
- If `PROCESSOR` reports `100% CPU` or a partial CPU/GPU split, the model either exceeds free unified memory (monitor live RAM usage with [`jtop`](/en/orin-nano-series/jtop)) or CUDA libraries are missing (see [Install CUDA](/en/orin-nano-series/cuda)).
- List downloaded local models: `ollama list`
- Remove a model to reclaim disk space: `ollama rm <model-name>` (e.g., `ollama rm deepseek-r1:1.5b`)
- Inspect service logs: `journalctl -u ollama -n 50 --no-pager`
:::

## References

- [Ollama Model Library](https://ollama.com/library)
- [Ollama Official Documentation](https://github.com/ollama/ollama/tree/main/docs)
