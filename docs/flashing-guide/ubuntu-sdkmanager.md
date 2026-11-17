---
title: 安装 Ubuntu 虚拟机和 SDK Manager
outline: deep
---

# 安装 Ubuntu 虚拟机和 SDK Manager

NVIDIA 官方的 **SDK Manager** 是为 Jetson 核心卡刷入系统与开发组件的标准工具，需运行在 **x86_64 架构的 Ubuntu 桌面系统**上。本文介绍如何在 Windows 电脑上通过 **VMware Workstation Pro** 安装 Ubuntu 虚拟机并部署 SDK Manager。

::: tip 宿主机环境建议
- **已有原生 Ubuntu 物理机**：若您使用的是 x86_64 原生 Ubuntu 电脑，可直接跳至 [3. 安装与启动 NVIDIA SDK Manager](#_3-安装与启动-nvidia-sdk-manager)。
- **推荐系统版本**：**Ubuntu 22.04 LTS Desktop（64 位）**，可同时兼容主流的 JetPack 6 与 JetPack 7。
- **虚拟机硬件分配**：内存 **`≥ 8 GB`**，处理器 **`≥ 4 核`**，虚拟磁盘空间 **`≥ 120 GB`**（如需使用脚本备份整机固件镜像，建议预留 **`≥ 200 GB`**），并保留 USB 控制器以识别恢复模式下的 Jetson 核心卡。
:::

## 1. 准备工作与版本匹配

不同代际的 JetPack 对宿主机 Ubuntu 版本有严格要求，下载镜像前请先核对下表：

| 目标 JetPack 版本 | Jetson 目标系统 | 宿主机 Ubuntu 版本要求 | 备注 |
| --- | --- | --- | --- |
| **JetPack 5.1.x** | Ubuntu 20.04 | **Ubuntu 20.04 LTS** | 仅支持 Ubuntu 20.04 宿主机 |
| **JetPack 6.x** | Ubuntu 22.04 | **Ubuntu 20.04 / 22.04 LTS** | 推荐使用 **Ubuntu 22.04 LTS** |
| **JetPack 7.x** | Ubuntu 24.04 | **Ubuntu 22.04 / 24.04 LTS** | 不支持 Ubuntu 20.04 宿主机；设备固件 `≥ 36.0` 时亦可直接用 [JetPack 7 ISO 启动 U 盘](/flashing-guide/jetpack7-flashing) 免虚拟机安装 |

请提前获取以下官方软件与镜像：

| 软件 / 镜像 | 获取渠道与说明 |
| --- | --- |
| **VMware Workstation Pro** | 虚拟机软件（现已对个人用户免费开放），请前往 [VMware Workstation 官方页面](https://www.vmware.com/products/desktop-hypervisor/workstation-and-fusion) 注册 Broadcom 账号并下载安装 |
| **Ubuntu Desktop ISO** | 推荐下载 `ubuntu-22.04.*-desktop-amd64.iso`（刷 JetPack 5 请选 `20.04`）：可从 [Ubuntu 官方发布页](https://releases.ubuntu.com/)、[清华大学开源软件镜像站](https://mirrors.tuna.tsinghua.edu.cn/ubuntu-releases/) 或 [中国科学技术大学开源镜像站](https://mirrors.ustc.edu.cn/ubuntu-releases/) 获取 |
| **NVIDIA SDK Manager** | 在 Ubuntu 虚拟机内访问 [NVIDIA SDK Manager 官方页面](https://developer.nvidia.com/sdk-manager) 下载 `.deb` Ubuntu 安装包（需注册免费 NVIDIA Developer 账号） |

## 2. 安装 VMware 虚拟机与 Ubuntu 系统

1. 在 Windows 宿主机上运行下载好的 VMware Workstation Pro 安装程序，保持默认选项完成安装。

![运行 VMware Workstation Pro 安装向导](/img/wiki-snipaste-2025-06-09-14-51-05.png)

2. 打开 VMware Workstation Pro，点击左上角菜单 **文件 → 新建虚拟机**（快捷键 `Ctrl+N`）。

![点击新建虚拟机](/img/wiki-snipaste-2025-06-11-15-21-48.png)

3. 选择 **典型（推荐）** 配置，点击「下一步」。

![选择典型虚拟机配置](/img/wiki-snipaste-2025-06-11-15-32-12.png)

4. 选择 **安装程序光盘映像文件 (iso)**，点击「浏览」选中已下载的 Ubuntu Desktop ISO 镜像文件（推荐 Ubuntu 22.04 LTS，下图中旧版截图仅作界面示意），点击「下一步」。

![选择 Ubuntu ISO 镜像文件](/img/wiki-snipaste-2025-06-11-15-33-59.png)

5. 设置 Ubuntu 系统的全名、用户名与登录密码（请牢记密码，后续执行 `sudo` 命令和刷机时需频繁输入），点击「下一步」。

![设置 Ubuntu 用户名与密码](/img/wiki-snipaste-2025-06-11-15-37-32.png)

6. 输入虚拟机名称，并选择剩余空间充足的物理磁盘目录存放虚拟机文件，点击「下一步」。

![设置虚拟机名称与存放位置](/img/wiki-snipaste-2025-06-11-15-38-12.png)

7. 设置**最大磁盘大小**为 **`120 GB` 及以上**（若后续需要执行整机 NVMe 固件备份，建议设置为 **`200 GB` 及以上**），选择「将虚拟磁盘拆分成多个文件」，点击「下一步」。

![设置虚拟机最大磁盘容量](/img/wiki-snipaste-2025-06-11-15-40-38.png)

8. 在确认页面点击 **自定义硬件**，将虚拟机内存调整至 **`8 GB`（8192 MB）及以上**，并根据宿主机 CPU 情况分配 4 个或更多处理器核心；同时确认硬件列表中包含 **USB 控制器**，随后返回点击「完成」。

![自定义硬件并完成虚拟机创建](/img/wiki-snipaste-2025-06-11-15-41-54.png)

9. 开启虚拟机，系统将自动引导进入 Ubuntu 安装流程，耐心等待安装完成。

![Ubuntu 系统自动安装进度](/img/wiki-snipaste-2025-06-11-15-51-19.webp)

10. 安装完成后重启进入 Ubuntu 桌面，按提示点击右上角「Skip / Next」完成首次欢迎向导即可。

![进入 Ubuntu 桌面完成初始化向导](/img/wiki-snipaste-2025-06-11-15-58-36.png)

## 3. 安装与启动 NVIDIA SDK Manager

### 3.1 下载 DEB 安装包

在 Ubuntu 系统内打开浏览器，访问 [NVIDIA SDK Manager 官方下载页](https://developer.nvidia.com/sdk-manager)，点击 **`.deb Ubuntu`** 按钮（登录 NVIDIA 账号后即可下载至默认的 `~/Downloads` 目录）。

![在官网下载 SDK Manager 的 Ubuntu deb 安装包](/img/wiki-1.png)

### 3.2 命令行安装 SDK Manager

确认 `sdkmanager_*_amd64.deb` 已下载到 `~/Downloads` 目录后，打开终端执行以下命令完成安装（`apt install` 会自动处理所需依赖包）：

**在 Ubuntu 宿主机终端执行：**

```bash
cd ~/Downloads
sudo apt update
sudo apt install ./sdkmanager_*.deb
```

![在 Downloads 目录下确认 sdkmanager 安装包](/img/wiki-12.png)

### 3.3 启动与登录 SDK Manager

安装完成后，可在 Ubuntu 应用列表中点击 **SDKManager** 图标启动，或直接在终端运行以下命令启动：

**在 Ubuntu 宿主机终端执行：**

```bash
sdkmanager
```

![从 Ubuntu 应用列表打开 SDK Manager](/img/wiki-ZDbimage.webp)

首次启动时，点击界面中央的 **LOGIN** 按钮，在弹出的浏览器窗口中登录您的 NVIDIA Developer 账号。授权成功后返回 SDK Manager 主界面，即可准备连接载板开始刷机。

![登录 NVIDIA Developer 账号进入 SDK Manager](/img/wiki-f6Eimage.webp)

## 下一步

请根据您手中的载板型号选择对应的刷机教程：

- [官方开发者套件刷入系统](/flashing-guide/devkit-flashing)
- [C1901 刷入系统](/flashing-guide/c1901-flashing)
- [C1902 / C1902 V2 刷入系统](/flashing-guide/c1902-flashing)
- [C1903 刷入系统](/flashing-guide/c1903-flashing)
- [C2401 刷入系统](/flashing-guide/c2401-flashing)
- [JetPack 7 刷入系统（ISO 启动盘安装）](/flashing-guide/jetpack7-flashing)
