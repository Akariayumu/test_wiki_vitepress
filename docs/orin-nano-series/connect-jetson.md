---
title: 连接到 Jetson 系统
outline: deep
---

# 连接到 Jetson 系统

Jetson 开发板具备视频输出接口（DP / HDMI）、RJ45 以太网口、USB Type-C 接口及 UART 调试串口。根据使用场景是否有显示器或局域网环境，可选择以下五种方式连接并操作开发板：

1. **连接显示器与键鼠**：适合桌面交互式开发与首次开机初始化配置。
2. **通过局域网连接 SSH**：适合日常命令行远程开发。
3. **通过 USB Type-C 连接 SSH**：无需路由器与网线，一根数据线即可直连登录。
4. **远程连接图形桌面**：适合无外接显示器但需要运行图形界面程序的场景。
5. **通过 UART 调试串口连接**：无需网络与显卡驱动，适合查看底层启动日志、无屏初始化及系统排障。

## 1. 连接显示器

将显示器视频线接入载板视频输出口，并接入 USB 鼠标与键盘，接通电源后即可直接进入 Ubuntu 桌面，操作体验与普通桌面 PC 一致。

各款载板的视频输出接口类型如下：

- **DisplayPort 1.2**：NVIDIA 官方开发者套件、`C1902`、`C1902 V2`
- **标准 HDMI**：`C1901`（由 DP 转换，原厂固件支持 1080p）、`C1903`（HDMI 2.1）、`C2402`
- **Mini HDMI**：`C2401`（Mini HDMI 2.1，需搭配 Mini HDMI 转标准 HDMI 线材）

::: warning DP 转 HDMI 转接线选型注意
使用配备 **DisplayPort（DP）** 接口的载板（官方套件、C1902、C1902 V2）连接仅带 HDMI 接口的显示器时，**必须使用内置转换芯片的主动式（Active）DP 转 HDMI 转换线或转接头**。普通无源（被动式）DP 转接线可能导致显示器无信号或黑屏。
:::

## 2. 通过局域网连接 SSH

::: info 前置条件
SSH 登录要求系统已完成用户账号创建（例如刷机时已在 SDK Manager 中预设好用户名与密码，或已外接显示器/调试串口完成首次开机向导）。
:::

### 2.1 获取开发板局域网 IP 地址

1. 使用网线将开发板 RJ45 网口连接至与电脑同一局域网的路由器或交换机（或将开发板接入同一 Wi-Fi），接通电源开机。
2. 通过以下任一方式查询开发板获配的 IPv4 地址：
   - **方式一（路由器管理后台）**：登录路由器管理页面，在“客户端状态 / 已连接设备”列表中查找制造商为 **`NVIDIA Corporation`**（或对应主机名）的设备 IP 地址。

     ![通过路由器后台查询 Jetson 开发板 IP 地址](/img/wiki-fBZimage.png)

   - **方式二（局域网 IP 扫描工具）**：在同网段电脑上运行 **Advanced IP Scanner** 等扫描工具，列表中制造商显示为 **`NVIDIA Corporation`** 的条目即为开发板。

     ![使用 Advanced IP Scanner 扫描同网段 NVIDIA 设备](/img/wiki-image.png)

### 2.2 使用 SSH 终端登录

可在宿主机终端直接执行 `ssh <用户名>@<开发板IP>` 登录，也可使用 **MobaXterm**、**PuTTY** 等图形化终端工具。下文以 Windows 平台常用的 **MobaXterm** 为例：

1. 打开 MobaXterm，点击左上角 **Session** 按钮新建会话：

   ![MobaXterm 点击 Session 新建会话](/img/wiki-rBnimage.png)

2. 在会话类型中选择 **SSH**：

   ![MobaXterm 选择 SSH 协议](/img/wiki-aDzimage.png)

3. 在 `Remote host` 中填入查询到的开发板 IP 地址，勾选 `Specify username` 并填入刷机时设置的用户名，点击 **OK**：

   ![填写 Jetson IP 地址与用户名](/img/wiki-0S0image.png)

4. 根据终端提示输入登录密码（Linux 终端输入密码时默认不显示星号或字符，输入完毕直接按 `Enter` 回车即可），成功登录后进入命令行提示符：

   ![SSH 终端提示输入登录密码](/img/wiki-ryXimage.png)

   ![SSH 成功登录至 Jetson 系统终端](/img/wiki-L2iimage.png)

## 3. 通过 USB Type-C 连接 SSH

当手头没有路由器、网线或显示器时，可直接通过载板上的 **USB Type-C** 接口建立虚拟局域网连接 SSH。

1. **正常开机并连接数据线**：先为开发板接通主电源并等待系统正常启动（约 30–60 秒），随后使用一根**支持数据传输的 USB Type-C 数据线**连接载板 Type-C 口与电脑 USB 口。
2. **确认虚拟网卡状态**：连接后，电脑作为 **USB Host（主机）**，Jetson 开发板工作在 **USB Device（从机虚拟网卡 / RNDIS）模式**。电脑端会自动识别出 `Remote NDIS Compatible Device`（或 CDC/NCM 虚拟网卡）并自动获取 `192.168.55.100` 等地址，而 **Jetson 开发板在该虚拟网段中的固定 IP 地址为 `192.168.55.1`**：

   ![Windows 识别到 Jetson USB 虚拟网卡（192.168.55.x）](/img/wiki-5Kbimage.png)

   ::: tip 电脑未识别到 192.168.55.x 虚拟网卡？
   - 请确认使用的是带数据线的 Type-C 线缆（部分随附充电线无 `D+/D-` 数据线芯），且开发板未处于 Force Recovery 刷机模式；
   - 部分第三方载板在重刷纯净官方固件后，可能需按 [USB 配置说明](/orin-nano-series/usb-config) 安装匹配的设备树以启用完整 USB 功能；C1901 的 Type-C 口仅作烧录设计时，建议优先采用局域网或 UART 调试串口连接。
   :::

3. **发起 SSH 连接**：在电脑终端执行 `ssh <用户名>@192.168.55.1`，或在 MobaXterm 中新建 SSH 会话并将 `Remote host` 设为 **`192.168.55.1`** 即可登录：

   ![通过 192.168.55.1 连接 USB Type-C SSH](/img/wiki-xOtimage.png)

## 4. 远程连接图形桌面

::: tip 无显示器（Headless）运行建议
在未连接物理显示器的无头模式下，Ubuntu 桌面可能因检测不到显示器而无法初始化图形会话或分辨率受限。建议在载板 DP / HDMI 口插入一个 **虚拟显示器诱骗器（Dummy Plug）**，以获得高帧率、可调分辨率的远程桌面体验。
:::

### 4.1 使用 NoMachine（推荐，支持 JetPack 5 / 6 / 7）

**NoMachine** 基于高效的 **NX 协议**，延迟低、安装简便，全面兼容 JetPack 5、JetPack 6 与 JetPack 7：

1. 在电脑（宿主机）端前往 [NoMachine 官网](https://www.nomachine.com/) 下载并安装对应操作系统的客户端：

   ![NoMachine 官网宿主机客户端下载](/img/wiki-15-8-2025-94138-www-nomachine-com.jpeg)

2. 前往 [NoMachine ARM 下载页](https://www.nomachine.com/download/arm)，下载适用于 **NoMachine for ARM — ARMv8 DEB (`arm64`)** 的安装包（如 `nomachine_*_arm64.deb`）：

   ![下载 NoMachine ARM64 DEB 安装包](/img/wiki-15-8-2025-95031-download-nomachine-com.jpeg)

3. 将下载好的 `.deb` 文件通过 MobaXterm 左侧 SFTP 文件栏（或 `scp` 命令）上传到 Jetson 开发板，并在 **Jetson 开发板终端**执行安装：

   ![通过 SFTP 上传 NoMachine 安装包至 Jetson](/img/wiki-VFBimage.png)

   ```bash
   sudo dpkg -i nomachine_*_arm64.deb
   ```

4. 确保电脑与 Jetson 处于同一局域网（或已通过 USB Type-C `192.168.55.1` 连通），打开电脑端 NoMachine 客户端，双击自动发现的 Jetson 设备（或点击 **Add** 手动输入 IP）：

   ![NoMachine 自动发现局域网内的 Jetson 设备](/img/wiki-HD3image.png)

   首次连接（或重装服务端后）会弹出主机证书指纹验证提示，点击 **OK** 确认信任：

   ![确认信任主机证书指纹](/img/wiki-4r1image.png)

5. 输入 Jetson 系统的用户名与密码，点击 **OK** 登录：

   ![输入 Jetson 系统用户名与密码](/img/wiki-Anoimage.png)

   连接成功后即可操作远程 Ubuntu 桌面；点击画面右上角折叠角标（或按 `Ctrl+Alt+0`）可打开控制菜单调节画质、缩放比例与显示分辨率：

   ![NoMachine 成功连接至 Jetson 远程桌面](/img/wiki-A8Rimage.webp)

   ![NoMachine 设置菜单调节显示与输入选项](/img/wiki-1LWimage.png)

### 4.2 使用系统内置远程桌面或 VNC

::: warning JetPack 6 / 7 与 JetPack 5 的远程桌面差异
- **JetPack 6 / 7（Ubuntu 22.04 / 24.04）**：GNOME 桌面已移除旧版 `vino-server` 组件（运行下文 `org.gnome.Vino` 命令会提示 `No such schema`）。在 JetPack 6 / 7 上建议优先使用 **NoMachine**；若需使用系统自带远程桌面，可在桌面打开 **Settings（设置）→ Sharing / System（共享/系统）→ Remote Desktop（远程桌面）**，开启 **Remote Desktop** 与 **Remote Control** 并设置固定连接密码，随后在电脑端使用 RDP 客户端（如 Windows 自带 `mstsc` 远程桌面连接或 Remmina）输入开发板 IP 登录。
- **JetPack 5（Ubuntu 20.04）**：仍内置基于 RFB 协议的 `vino-server`，可按下方步骤在命令行启用 VNC。
:::

仅在 **JetPack 5（Ubuntu 20.04）** 下，可在 **Jetson 开发板终端**执行以下命令配置 `vino-server` VNC 自启动：

1. 将 `vino-server` 软链接至图形会话自启动目录：

   ```bash
   cd /usr/lib/systemd/user/graphical-session.target.wants
   sudo ln -s ../vino-server.service ./
   ```

2. 关闭连接确认弹窗与加密限制（兼容通用 VNC 客户端）：

   ```bash
   gsettings set org.gnome.Vino prompt-enabled false
   gsettings set org.gnome.Vino require-encryption false
   ```

3. 设置 VNC 登录密码（将 `your_password` 替换为实际密码，限 8 位以内）：

   ```bash
   gsettings set org.gnome.Vino authentication-methods "['vnc']"
   gsettings set org.gnome.Vino vnc-password $(echo -n 'your_password' | base64)
   ```

4. 重启系统使配置生效：

   ```bash
   sudo reboot
   ```

5. 在电脑端打开 VNC Viewer 等客户端，新建连接并输入 Jetson 的局域网 IP 与 VNC 密码即可访问桌面（更多说明参见 [NVIDIA 官方 VNC 教程](https://developer.nvidia.com/embedded/learn/tutorials/vnc-setup)）：

   ![VNC 客户端新建连接](/img/wiki-cDeimage.webp)

   ![填写 Jetson IP 地址创建 VNC 会话](/img/wiki-P73image.png)

   ![输入 VNC 连接密码](/img/wiki-82Rimage.png)

   ![通过 VNC 访问 Jetson 桌面](/img/wiki-bjaimage.webp)

## 5. 通过 UART 调试串口连接

**UART 调试串口（Debug UART）** 直接连接至核心卡底层控制台，不依赖网络配置或显卡输出。从上电瞬间即可输出 Bootloader（MB1 / MB2 / UEFI）与 Linux 内核完整启动日志，并支持直接完成首次开机账号向导（OEM-config）与命令行登录，是无屏部署和故障排查的核心工具。

### 5.1 硬件准备与接线方式

准备一个 **3.3V 逻辑电平的 USB 转 TTL 串口模块**（如 CP2102、FT232RL、CH340 等；若模块带 `3.3V / 5V` 电平切换跳线，**必须拨至 `3.3V`**）。

::: danger 调试串口接线准则
- **交叉连接收发线**：USB-TTL 模块的 **`TXD`** 接载板的 **`RXD`**，模块的 **`RXD`** 接载板的 **`TXD`**，并将双方 **`GND`** 共地连接（共接 3 根线）。
- **严禁连接电源脚**：**切勿将 USB-TTL 模块的 `5V` 或 `3.3V`（`VCC`）引脚接入载板**，以免电源倒灌损坏载板或电脑 USB 端口！
:::

不同型号载板的调试串口物理位置如下：

- **12-pin 排针载板（官方开发者套件 / C1901 / C1902 / C1902 V2）**：位于载板边缘的 **12-pin 按钮 / 调试排针**（参考 [12-pin 引脚图](/img/c1902-12pin.png)）：
  - **Pin 3（`UART2_RXD`）** ↔ USB-TTL 模块 **`TXD`**
  - **Pin 4（`UART2_TXD`）** ↔ USB-TTL 模块 **`RXD`**
  - **Pin 7（`GND`）**（或 Pin 9 / Pin 11）↔ USB-TTL 模块 **`GND`**
- **独立 GH1.25 调试座载板（C1903 / C2401 / C2402）**：配备专用 4-pin GH1.25 调试串口座（C1903 与 C2402 丝印为 **`UART2 Debug`**，正视从左至右 Pin 1–4 依次为 `1: GND, 2: RX, 3: TX, 4: 5V`；C2401 为背面 **`UART DEBUG`** 座，详见 [C2401 产品介绍](/c2401/c2401) 接线定义图）。连接 `GND`、`RX`（接模块 `TXD`）、`TX`（接模块 `RXD`）三根线，**悬空 `5V` 引脚不接**。

![使用 USB-TTL 串口线连接 12-pin 调试排针示例](/img/jp7-serial-cable.webp)

### 5.2 串口终端参数配置与登录

1. 将 USB-TTL 模块插入电脑 USB 接口，确认系统分配的串口号（Windows 在“设备管理器 → 端口”中查看如 `COM5`；Linux 通常为 `/dev/ttyUSB0` 或 `/dev/ttyACM0`）。
2. 打开 **MobaXterm**（`Session` → `Serial`）、**PuTTY**、**minicom** 或 **picocom**，按以下固定参数打开串口：
   - **波特率（Speed / Baud rate）**：`115200`
   - **数据位 / 校验位 / 停止位**：`8N1`（Data bits: `8`，Parity: `None`，Stop bits: `1`）
   - **流控（Flow control）**：`None`（关闭硬件 RTS/CTS 与软件 XON/XOFF 流控）
   - 若在 Ubuntu 宿主机终端下连接，可直接运行：

     ```bash
     sudo picocom -b 115200 /dev/ttyUSB0
     ```

3. 为 Jetson 开发板上电，串口窗口将实时滚动输出 UEFI 与内核启动信息。待系统启动完毕出现 `login:` 提示符（若已开机再插串口线，按一次 `Enter` 回车即可唤醒提示符），输入用户名和密码即可登录系统。
