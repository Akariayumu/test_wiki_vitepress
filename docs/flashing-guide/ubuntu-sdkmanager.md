---
title: 安装 Ubuntu 虚拟机和 SDK Manager
---

# 安装 Ubuntu 虚拟机和 SDK Manager

## 1. 安装 Ubuntu 虚拟机

### 1.1 下载 VMware Workstation

通过百度网盘下载此文件：VMware-workstation-full-16.2.5-20904516.exe

链接: https://pan.baidu.com/s/1xopblFgG29dYZXoNfwa5ZA 提取码: frjy

### 1.2 安装 VMware Workstation

打开 `VMware-workstation-full-16.2.5-20904516.exe`

选项保持默认即可，点下一步

输入激活码，请自行百度搜索：vmware16密钥

### 1.3 安装 Ubuntu 系统

推荐使用 20.04 和 22.04 版本，这里以 20.04 为例。

下载 `ubuntu20.04_desktop_amd64.iso` 镜像，若下载速度较慢，推荐使用清华源或中科大源。

打开 VMware Workstation Pro，新建虚拟机

选择典型配置

选择刚才下载的 ISO 镜像

输入用户名与密码

输入虚拟机名字与选择存放虚拟机文件的路径

虚拟机可用的存储空间，建议最少给 300G

点击完成

等待安装完成

出现以下画面表示安装完成

## 2. 安装 NVIDIA SDK Manager

### 2.1 下载安装包

进入虚拟机打开浏览器，进入 Jetson SDK，下载 `.deb` Ubuntu 安装包。

### 2.2 安装 SDK Manager

打开文件管理器进入 `Downloads` 文件夹，确认 `sdkmanager_xxxxx_amd64.deb` 存在，在当前目录下打开命令行窗口执行以下命令安装。

```bash
sudo apt update
sudo dpkg -i sdkmanager_2.3.0-12617_amd64.deb # 需要根据实际版本修改包名
sudo apt install --fix-broken
```
