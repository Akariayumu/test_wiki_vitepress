---
title: 部署 OpenClaw
outline: deep
---

# 部署 OpenClaw

## 1. 简介

**OpenClaw** 是一个开源（MIT）的**自托管网关（Gateway）**，可通过通道插件将常见即时通讯软件（Discord、Telegram、WhatsApp、Signal 等）接入 AI Agent，具备工具调用、多轮会话和记忆能力。所有业务数据均运行在本地硬件上，非常适合在 Jetson Orin 载板上搭建全天候运行的**私有化对话式 AI 助手**。

OpenClaw 基于 **Node.js** 构建，Jetson Orin 运行的是 Arm64（`aarch64`）架构的 Ubuntu 系统，可直接在载板上原生部署。

::: tip 适用范围
本教程同时适用于 **Jetson Orin Nano** 与 **Jetson Orin NX** 全系列载板（`C1901` / `C1902` / `C1902 V2` / `C1903` / `C2401`），部署步骤完全一致。
:::

## 2. 环境要求

| 项目 | 要求 |
| --- | --- |
| 硬件 | Jetson Orin Nano / NX 载板（已刷入系统） |
| 系统 | JetPack 5 / 6 / 7（Ubuntu，Arm64） |
| Node.js | **22.19+ / 23.11+ / 24+**（推荐 24） |
| 网络 | 可访问互联网（安装依赖及调用云端模型 API 所需） |
| 模型 API Key | Anthropic、OpenAI、Google 等任一服务商密钥（或本地模型接口） |

::: warning 版本要求
系统 `apt` 默认源中的 Node.js 版本通常过旧，**不能直接使用**，请按下方第 3 节步骤安装满足版本要求的 Node.js。
:::

## 3. 安装 Node.js

推荐使用 **nvm**（Node Version Manager）安装新版 Node.js，环境隔离且便于后续升级切换。在 Jetson 开发板终端执行：

```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# 使 nvm 在当前终端立即生效（或重新打开终端）
source ~/.bashrc

# 安装并启用 Node.js 24
nvm install 24
nvm use 24
nvm alias default 24
```

安装完成后验证版本（确认 ≥ `v22.19.0`）：

```bash
node --version
```

## 4. 安装 OpenClaw

Node.js 就绪后，在 Jetson 开发板终端执行官方一键安装脚本：

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

::: tip 使用 npm 安装
也可以直接通过 `npm` 全局安装：`npm install -g openclaw@latest`。
:::

## 5. 初始化与安装守护进程

在 Jetson 开发板终端运行初始化引导向导，将 OpenClaw 注册为用户级后台守护进程，并开启 `loginctl enable-linger` 确保无头 SSH 会话退出登录后后台服务依然常驻运行：

```bash
openclaw onboard --install-daemon
sudo loginctl enable-linger "$USER"
```

交互向导会依次引导完成以下步骤：

1. **选择模型服务商**（Anthropic / OpenAI / Google 等）
2. **填写 API Key**
3. **配置并启动 Gateway 服务**

配置文件保存在 `~/.openclaw/openclaw.json`，后续可按需手动编辑（例如修改监听端口）：

```json5
{
  gateway: {
    port: 18789,
  },
}
```

## 6. 验证与访问控制面板

在 Jetson 开发板终端检查 Gateway 运行状态（默认监听 **`18789`** 端口）：

```bash
openclaw gateway status
```

若开发板连接了本地桌面显示器，可直接执行以下命令自动唤起浏览器打开控制面板（Control UI）；**若通过无显示器（Headless）SSH 远程连接，请跳过此命令，直接参阅第 7 节建立隧道访问**：

```bash
openclaw dashboard
```

默认访问地址为 **`http://127.0.0.1:18789/`**。在面板聊天框内发送测试消息，确认 AI Agent 可正常响应。

## 7. 无头 Jetson 的远程访问

边缘部署场景下 Jetson 通常不外接显示器，且 Gateway 默认仅绑定本机回环地址（`127.0.0.1`）。推荐使用 **SSH 端口转发隧道**将面板安全映射到本地电脑访问。

在本地电脑终端执行（将 `user@jetson-ip` 替换为开发板实际的用户名与局域网 IP）：

```bash
ssh -L 18789:localhost:18789 user@jetson-ip
```

保持该 SSH 会话不断开，在**本地电脑浏览器**打开 `http://127.0.0.1:18789/` 即可安全访问运行在 Jetson 上的控制面板。

::: warning 安全提示
如需在局域网或公网直接暴露控制面板（如修改绑定地址或配置 Nginx 反向代理），请务必提前启用强鉴权机制，并将 Webhook 等外部输入视为不可信数据。日常运维建议优先使用 SSH 隧道。
:::

## 8. 接入聊天渠道

如需通过手机随时对话，最快捷的方式是接入 **Telegram**（仅需创建一个 Bot Token 即可绑定）。Discord、WhatsApp、Signal 等其他渠道的插件配置方法请参阅官方文档的 Channels 章节。

## 9. 常见问题

- **提示 Node.js 版本不满足要求**：请执行 `node --version` 确认版本号 ≥ `22.19`；若通过 `nvm` 安装，请检查当前终端是否已执行 `nvm use 24` 并通过 `nvm alias default 24` 设为默认版本。
- **安装脚本提示找不到 `npm` 或 `node`**：请先完成第 3 节的 Node.js 安装并刷新环境变量（`source ~/.bashrc`），再重新运行安装脚本。
- **浏览器无法打开控制面板**：请先在开发板上执行 `openclaw gateway status` 确认后台服务处于运行状态；若使用无显示器设备，请按第 7 节建立 SSH 端口转发隧道后再从本地浏览器访问。
- **退出 SSH 后后台服务自动停止**：请确认已执行第 5 节中的 `sudo loginctl enable-linger "$USER"`，允许用户级 `systemd` 服务在退出登录后继续驻留。
- **系统资源占用评估**：默认使用云端模型 API 时，Jetson 本地 CPU 与内存开销极低；若接入本地 [Ollama](/orin-nano-series/ollama) 大模型，请留意统一内存余量。

## 参考

- [OpenClaw 官方文档](https://docs.openclaw.ai/zh-CN)（安装参数、守护进程与通道插件细节以官方文档为准，本文针对 Jetson Arm64 环境提供部署适配说明）
