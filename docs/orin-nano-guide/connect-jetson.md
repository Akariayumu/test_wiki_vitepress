---
title: 连接到 Jetson 系统
---

# 连接到 Jetson 系统

Jetson 拥有 HDMI/DP 视频输出接口、RJ45 网口、Type-C 接口和 UART 调试接口，下面介绍四种连接到 Jetson 开发板的方法。

## 1. 连接显示器

使用功能正常的 DP/HDMI 线材连接到显示器，接通开发板电源就能正常进入桌面。接入鼠标键盘后即可如普通桌面 PC 一样操作。

## 2. 远程登录 (SSH)

> 此方法需要提前使用 SDK Manager 写入用户名和密码。

### 2.1 将开发板连接到路由器并接通电源开机

### 2.2 获取开发板 IP 地址

**方法一：** 通过路由器后台查询（不同品牌路由器操作不同）。

**方法二：** 使用 **Advanced IP Scanner** 扫描同网段下的设备。刷入官方固件时，制造商信息为 **NVIDIA Corporation** 的设备即为开发板。

![方法一：通过路由器后台获取开发板 IP 地址](/img/wiki-fBZimage.png)

![方法二：使用 Advanced IP Scanner 扫描同网段设备](/img/wiki-image.png)

### 2.3 下载安装 SSH 工具

下载安装 **Putty** 或 **MobaXterm** 等连接工具（下面以 MobaXterm 为例）。

### 2.4 点击 **Session** 创建一个会话

![2.4 点击 **Session** 创建一个会话](/img/wiki-rBnimage.png)

### 2.5 选择 **SSH**

![2.5 选择 SSH](/img/wiki-aDzimage.png)

### 2.6 输入 IP 地址和用户名

输入查询到的 IP 地址和刷入系统时设置的用户名，完成后点击 OK 保存。

![2.6 输入 IP 地址和用户名](/img/wiki-0S0image.png)

### 2.7 输入密码

输入密码（命令行不显示），完成后回车即可登录到系统。

![2.7 输入密码](/img/wiki-ryXimage.png)

![2.7 输入密码](/img/wiki-L2iimage.png)

## 3. 通过 Type-C 连接到 SSH

### 3.1 开发板正常上电开机

在默认模式下连接到主机后，Jetson 默认作为主机，其 IP 地址为 **192.168.55.1**。

![3.1 开发板正常上电开机](/img/wiki-5Kbimage.png)

### 3.2 使用 SSH 工具连接

参考第 2.3 节操作，使用 IP `192.168.55.1` 连接。

![3.2 使用 SSH 工具连接](/img/wiki-xOtimage.png)

## 4. 远程连接到 Jetson 桌面环境

> 在无显示器模式下建议使用 HDMI/DP 诱骗器确保桌面环境正常。

### 4.1 使用 NoMachine

NoMachine 是一款功能强大、跨平台的远程桌面软件，基于 **NX 协议**，通过高效压缩和加密技术实现低延迟传输，特别适合图形密集型任务。

**步骤：**

1. 主机下载安装 [NoMachine](https://www.nomachine.com/)
2. Jetson 端下载安装 NoMachine（[ARM 版本下载页](https://www.nomachine.com/download/arm)）
3. 通过 SCP 上传到开发板，或使用 wget 下载后安装：

```bash
sudo dpkg -i nomachine_9.1.24_6_arm64.deb
```

4. 主机和开发板连接到同一局域网，主机打开 NoMachine 即可自动搜索到 Jetson 服务端
5. 输入用户名和密码，点击 OK 即可连接到桌面

> 点击软件显示区域右上角可调节画质、画幅和编码模式等选项。

![4.1 使用 NoMachine](/img/wiki-15-8-2025-94138-www-nomachine-com.jpeg)

![4.1 使用 NoMachine](/img/wiki-15-8-2025-95031-download-nomachine-com.jpeg)

![4.1 使用 NoMachine](/img/wiki-VFBimage.png)

![4.1 使用 NoMachine](/img/wiki-HD3image.png)

![4.1 使用 NoMachine](/img/wiki-9pQimage.png)

![4.1 使用 NoMachine](/img/wiki-4r1image.png)

![4.1 使用 NoMachine](/img/wiki-Anoimage.png)

![4.1 使用 NoMachine](/img/wiki-A8Rimage.png)

![4.1 使用 NoMachine](/img/wiki-1LWimage.png)

### 4.2 使用 VNC

VNC（虚拟网络计算机）基于 **RFB 协议**，通过传输屏幕帧缓冲区的像素数据实现跨平台远程控制。

**Jetson 端配置：**

设置 VNC 服务为开机自启：

```bash
cd /usr/lib/systemd/user/graphical-session.target.wants
sudo ln -s ../vino-server.service ./
```

配置 VNC 服务：

```bash
gsettings set org.gnome.Vino prompt-enabled false
gsettings set org.gnome.Vino require-encryption false
```

设置 VNC 登录密码：

```bash
# 将 <密码> 替换为你要设置的密码
gsettings set org.gnome.Vino authentication-methods "['vnc']"
gsettings set org.gnome.Vino vnc-password $(echo -n '密码'|base64)
```

重启系统生效：

```bash
sudo reboot
```

在主机 VNC 软件中新建连接，输入 Jetson 的局域网 IP 并确认，输入密码即可连接。

> 参考英伟达官方说明：[Setting Up VNC | NVIDIA Developer](https://developer.nvidia.com/embedded/learn/tutorials/vnc-setup)

![4.2 使用 VNC](/img/wiki-cDeimage.png)

![4.2 使用 VNC](/img/wiki-P73image.png)

![4.2 使用 VNC](/img/wiki-82Rimage.png)

![4.2 使用 VNC](/img/wiki-bjaimage.png)
