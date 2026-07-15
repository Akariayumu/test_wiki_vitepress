---
title: 在 Jetson 上部署 OpenClaw
---

# 在 Jetson 上部署 OpenClaw

## 1. 简介

**OpenClaw** 是一个开源（MIT）的**自托管网关（Gateway）**，它通过通道插件把常见的即时通讯软件（Discord、Telegram、WhatsApp、Signal 等）接入 AI Agent，具备工具调用、会话和记忆能力。所有数据都运行在你自己的硬件上，适合在 Jetson Orin 载板上搭建一个**本地化、可对话的 AI 助手**。

OpenClaw 基于 **Node.js**，Jetson Orin 运行的是 ARM64（aarch64）架构的 Ubuntu，因此可以直接在载板上部署。

:::tip 适用范围
本教程同时适用于 **Orin Nano** 和 **Orin NX** 系列载板（C1901 / C1902 / C2401），步骤完全一致。
:::

## 2. 环境要求

| 项目 | 要求 |
|------|------|
| 硬件 | Jetson Orin Nano / NX 载板（已刷好系统） |
| 系统 | JetPack 5 / 6（Ubuntu，ARM64） |
| Node.js | **22.19+ / 23.11+ / 24+**（推荐 24） |
| 网络 | 可访问外网（安装与调用模型 API 需要） |
| 模型 API Key | Anthropic、OpenAI、Google 等任一服务商的密钥 |

:::warning 注意
JetPack 自带的 apt 源里的 Node.js 版本通常过旧，**不能直接使用**，需要按下面第 3 步单独安装满足版本要求的 Node.js。
:::

## 3. 安装 Node.js

JetPack 默认 Node 版本偏低，推荐用 **nvm** 安装新版，互不干扰、便于切换。

```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# 使 nvm 立即生效（或重新打开终端）
source ~/.bashrc

# 安装并启用 Node.js 24
nvm install 24
nvm use 24
nvm alias default 24
```

安装完成后验证版本（需 ≥ 22.19）：

```bash
node --version
```

## 4. 安装 OpenClaw

Node.js 就绪后，执行官方一键安装脚本：

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

> 也可以直接用 npm 全局安装：`npm install -g openclaw@latest`

## 5. 初始化与安装守护进程

运行引导向导，同时把 OpenClaw 安装为后台守护进程（开机自启、断连后仍运行）：

```bash
openclaw onboard --install-daemon
```

向导会引导你完成：

1. **选择模型服务商**（Anthropic / OpenAI / Google 等）
2. **填写 API Key**
3. **配置并启动 Gateway**

配置文件保存在 `~/.openclaw/openclaw.json`，后续可手动编辑（例如修改端口）：

```json5
{
  gateway: {
    port: 18789,
  },
}
```

## 6. 验证与访问控制面板

检查 Gateway 是否正常运行（默认监听 **18789** 端口）：

```bash
openclaw gateway status
```

打开控制面板（Control UI）：

```bash
openclaw dashboard
```

默认地址为 **`http://127.0.0.1:18789/`**。在面板的聊天框里发一条消息，即可测试 AI 是否正常响应。

## 7. 无头 Jetson 的远程访问

Jetson 通常以无显示器（headless）方式使用，Gateway 默认只监听本机回环地址。推荐用 **SSH 隧道**把端口安全地转发到你的电脑：

```bash
# 在你自己的电脑上执行（把 user@jetson-ip 换成实际地址）
ssh -L 18789:localhost:18789 user@jetson-ip
```

保持该 SSH 连接，然后在**本机浏览器**打开 `http://127.0.0.1:18789/` 即可访问 Jetson 上的面板。

:::warning 安全提示
如需在局域网/公网直接暴露面板（修改绑定地址或加 nginx 反向代理），务必先配置好鉴权，并将 webhook 等外部输入视为不可信数据。能用 SSH 隧道就优先用隧道。
:::

## 8. 接入聊天渠道

想在手机上随时对话，最快的方式是 **Telegram**——只需一个 Bot Token 即可接入。Discord、WhatsApp、Signal 等其他渠道的配置详见官方文档的 Channels 章节。

## 9. 常见问题

- **提示 Node 版本不满足**：确认 `node --version` ≥ 22.19；用 nvm 的话检查是否 `nvm use 24` 生效、并设为 `default`。
- **安装脚本报错找不到 npm / node**：先完成第 3 步安装 Node.js，再执行安装脚本。
- **面板打不开**：先用 `openclaw gateway status` 确认服务在跑；无头设备记得走 SSH 隧道（第 7 步）。
- **资源占用**：模型推理默认走服务商云端 API，Jetson 本地负载很小；若改用本地大模型请注意显存与算力。

---

> 参考：[OpenClaw 官方文档](https://docs.openclaw.ai/zh-CN)。安装命令、守护进程与面板端口等以官方文档为准，本页针对 Jetson（ARM64）部署做了适配说明。
