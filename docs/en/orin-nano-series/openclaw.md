---
title: Deploy OpenClaw
outline: deep
---

# Deploy OpenClaw

## 1. Introduction

**OpenClaw** is an open-source (MIT) **self-hosted gateway** that connects popular messaging platforms (Discord, Telegram, WhatsApp, Signal, and more) to an AI Agent via channel plugins, with tool-calling, multi-turn session, and memory support. All data stays on your own hardware, making it well suited for hosting an always-on, **private conversational AI assistant** on a Jetson Orin carrier board.

OpenClaw is built on **Node.js**, and Jetson Orin runs Ubuntu on the Arm64 (`aarch64`) architecture, allowing native deployment directly on the device.

::: tip Supported Hardware
This guide applies across all **Jetson Orin Nano** and **Jetson Orin NX** series carrier boards (`C1901` / `C1902` / `C1902 V2` / `C1903` / `C2401`) with identical steps.
:::

## 2. Requirements

| Item | Requirement |
| --- | --- |
| Hardware | Jetson Orin Nano / NX carrier board (OS already flashed) |
| OS | JetPack 5 / 6 / 7 (Ubuntu, Arm64) |
| Node.js | **22.19+ / 23.11+ / 24+** (24 recommended) |
| Network | Internet access (for package installation and cloud model API calls) |
| Model API Key | API key from Anthropic, OpenAI, Google, or a local LLM endpoint |

::: warning Node.js Version Requirement
The default Node.js package in Ubuntu's stock `apt` repositories is too old and **cannot be used directly**. Follow Section 3 below to install a supported Node.js release.
:::

## 3. Install Node.js

We recommend installing a modern Node.js release via **nvm** (Node Version Manager) for clean isolation and easy upgrades. On the Jetson terminal, run:

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# Load nvm in the current shell (or reopen the terminal)
source ~/.bashrc

# Install and activate Node.js 24
nvm install 24
nvm use 24
nvm alias default 24
```

Verify the active version (must be ≥ `v22.19.0`):

```bash
node --version
```

## 4. Install OpenClaw

Once Node.js is ready, run the official install script on the Jetson terminal:

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

::: tip Install via npm
Alternatively, install globally using `npm`: `npm install -g openclaw@latest`.
:::

## 5. Initialize and Install the Daemon

Run the onboarding wizard on the Jetson terminal to register OpenClaw as a user-level background daemon, and enable `loginctl enable-linger` so the service keeps running even after you disconnect from SSH:

```bash
openclaw onboard --install-daemon
sudo loginctl enable-linger "$USER"
```

The interactive wizard walks through:

1. **Selecting a model provider** (Anthropic / OpenAI / Google, etc.)
2. **Entering your API Key**
3. **Configuring and starting the Gateway service**

Configuration is saved at `~/.openclaw/openclaw.json` and can be edited manually later (for example, to customize the port):

```json5
{
  gateway: {
    port: 18789,
  },
}
```

## 6. Verify and Access the Control Panel

Check that the Gateway service is active on the Jetson terminal (listening on port **`18789`** by default):

```bash
openclaw gateway status
```

If a local desktop monitor is attached to the Jetson, launch the Control UI in the local browser with the command below (**for headless SSH sessions without a monitor, skip `openclaw dashboard` and proceed directly to Section 7**):

```bash
openclaw dashboard
```

The default URL is **`http://127.0.0.1:18789/`**. Send a test prompt in the chat panel to verify that the AI Agent responds.

## 7. Remote Access on a Headless Jetson

In edge deployments, Jetson boards typically run headless, and the Gateway binds only to the loopback interface (`127.0.0.1`) by default. Use an **SSH port-forwarding tunnel** to securely access the panel from your computer.

On your local computer terminal (replace `user@jetson-ip` with the board's actual username and LAN IP):

```bash
ssh -L 18789:localhost:18789 user@jetson-ip
```

Keep that SSH session open and visit `http://127.0.0.1:18789/` in a **browser on your local computer** to access the Jetson Control UI.

::: warning Security Notice
If you expose the Control UI directly over a LAN or the internet (by modifying the bind address or placing it behind an Nginx reverse proxy), configure strong authentication beforehand and treat all external inputs (such as webhooks) as untrusted. Prefer SSH tunneling whenever possible.
:::

## 8. Connect Chat Channels

For mobile chat access, **Telegram** is the quickest channel to set up — only a Bot Token is required. For Discord, WhatsApp, Signal, and other integrations, refer to the Channels section in the official documentation.

## 9. Troubleshooting

- **"Node version not satisfied" error**: Run `node --version` to verify that it is ≥ `22.19`. When using `nvm`, confirm that `nvm use 24` is active in your shell and `nvm alias default 24` has been set.
- **Install script reports `npm` or `node` not found**: Complete Section 3 first and reload your shell environment (`source ~/.bashrc`) before running the installer.
- **Control UI fails to open in browser**: Run `openclaw gateway status` on the Jetson board to verify that the daemon is active; on headless boards, establish the SSH port-forwarding tunnel in Section 7 before opening `http://127.0.0.1:18789/` locally.
- **Daemon stops after logging out of SSH**: Confirm that you ran `sudo loginctl enable-linger "$USER"` in Section 5 so `systemd --user` services persist across logouts.
- **System resource usage**: When calling cloud LLM APIs, local CPU and RAM overhead on the Jetson is minimal; if pairing with a local [Ollama](/en/orin-nano-series/ollama) model, monitor available unified memory.

## References

- [OpenClaw Official Documentation](https://docs.openclaw.ai/) (refer to upstream documentation for the latest CLI flags, daemon options, and channel configurations; this guide provides Arm64 adaptation notes for Jetson)
