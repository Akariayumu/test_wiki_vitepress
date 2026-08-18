---
title: Deploying OpenClaw on Jetson
---

# Deploying OpenClaw on Jetson

## 1. Introduction

**OpenClaw** is an open-source (MIT) **self-hosted gateway** that connects popular instant messaging apps (Discord, Telegram, WhatsApp, Signal, etc.) to an AI Agent via channel plugins, with tool-calling, session, and memory capabilities. All data runs on your own hardware, making it ideal for building a **local, conversational AI assistant** on a Jetson Orin carrier board.

OpenClaw is built on **Node.js**, and Jetson Orin runs Ubuntu on the ARM64 (aarch64) architecture, so it can be deployed directly on the board.

:::tip Scope
This tutorial applies to both **Orin Nano** and **Orin NX** series carrier boards (C1901 / C1902 / C2401); the steps are identical.
:::

## 2. Requirements

| Item | Requirement |
|------|-------------|
| Hardware | Jetson Orin Nano / NX carrier board (system already flashed) |
| OS | JetPack 5 / 6 (Ubuntu, ARM64) |
| Node.js | **22.19+ / 23.11+ / 24+** (24 recommended) |
| Network | Internet access (required for installation and model API calls) |
| Model API Key | A key from any provider such as Anthropic, OpenAI, or Google |

:::warning Note
The Node.js version in the apt sources bundled with JetPack is usually too old and **cannot be used directly**. Follow step 3 below to install a Node.js version that meets the requirements.
:::

## 3. Install Node.js

JetPack's default Node version is too low. We recommend using **nvm** to install a newer version — it keeps versions isolated and easy to switch.

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# Make nvm take effect immediately (or reopen the terminal)
source ~/.bashrc

# Install and enable Node.js 24
nvm install 24
nvm use 24
nvm alias default 24
```

After installation, verify the version (must be ≥ 22.19):

```bash
node --version
```

## 4. Install OpenClaw

Once Node.js is ready, run the official one-click install script:

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

> Alternatively, install it globally with npm: `npm install -g openclaw@latest`

## 5. Initialize and Install the Daemon

Run the onboarding wizard, which also installs OpenClaw as a background daemon (starts on boot and keeps running after disconnection):

```bash
openclaw onboard --install-daemon
```

The wizard will guide you through:

1. **Choosing a model provider** (Anthropic / OpenAI / Google, etc.)
2. **Entering your API Key**
3. **Configuring and starting the Gateway**

The configuration file is saved at `~/.openclaw/openclaw.json` and can be edited manually later (e.g., to change the port):

```json5
{
  gateway: {
    port: 18789,
  },
}
```

## 6. Verify and Access the Control Panel

Check whether the Gateway is running properly (it listens on port **18789** by default):

```bash
openclaw gateway status
```

Open the Control UI:

```bash
openclaw dashboard
```

The default address is **`http://127.0.0.1:18789/`**. Send a message in the panel's chat box to test whether the AI responds normally.

## 7. Remote Access on a Headless Jetson

Jetson boards are usually used headless (without a display), and the Gateway only listens on the loopback address by default. We recommend using an **SSH tunnel** to securely forward the port to your computer:

```bash
# Run on your own computer (replace user@jetson-ip with the actual address)
ssh -L 18789:localhost:18789 user@jetson-ip
```

Keep the SSH connection open, then open `http://127.0.0.1:18789/` in a **browser on your local machine** to access the panel on the Jetson.

:::warning Security Note
If you need to expose the panel directly on the LAN/internet (by changing the bind address or adding an nginx reverse proxy), make sure to configure authentication first, and treat external input such as webhooks as untrusted data. Whenever possible, prefer the SSH tunnel.
:::

## 8. Connect Chat Channels

To chat from your phone anytime, the fastest option is **Telegram** — you only need a Bot Token to connect. For other channels such as Discord, WhatsApp, and Signal, see the Channels section of the official documentation.

## 9. FAQ

- **"Node version not satisfied"**: Confirm `node --version` ≥ 22.19; if using nvm, check that `nvm use 24` has taken effect and set it as `default`.
- **Install script errors saying npm / node not found**: Complete step 3 to install Node.js first, then run the install script.
- **Panel won't open**: First confirm the service is running with `openclaw gateway status`; on headless devices, remember to use an SSH tunnel (step 7).
- **Resource usage**: Model inference goes through the provider's cloud API by default, so local load on the Jetson is minimal; if you switch to a local LLM instead, pay attention to VRAM and compute capacity.

---

> Reference: [OpenClaw Official Documentation](https://docs.openclaw.ai/zh-CN). Installation commands, the daemon, and panel ports are subject to the official documentation; this page provides deployment notes adapted for Jetson (ARM64).
