---
title: 其他外设
outline: deep
---

# 其他外设

本文介绍如何在 Jetson Orin 系列开发板上测试与配置 **UART**、**SPI**、**I2C**、**CAN 总线**及 **RTC 实时时钟**等常用硬件外设。除另有说明外，本文所有命令均在 **Jetson 开发板终端**执行。

::: warning 3.3V 信号电平注意
载板 40-pin 排针、30-pin 排母及 GH1.25 外设座子引出的 **UART、SPI、I2C、GPIO** 信号引脚均为 **3.3V 逻辑电平**（部分座子虽提供 `5V` 供电脚，但信号脚不耐受 5V 电平）。接线前请务必确认外设电平匹配，切勿直接输入 5V 信号。
:::

## 1. UART 接口

不同 JetPack 版本及不同载板的通用 UART 引出形式与设备节点有所差异，测试前请先核对：

- **系统设备节点差异**：40-pin 排针默认启用的通用串口（Pin 8 `UART1_TX`、Pin 10 `UART1_RX`）在 **JetPack 6 / 7** 下对应 `/dev/ttyTHS1`，在 **JetPack 5** 下通常对应 `/dev/ttyTHS0`（可执行 `ls /dev/ttyTHS*` 查看）。下文以 JetPack 6 的 `/dev/ttyTHS1` 为例。
- **各载板硬件引出位置**：
  - **官方套件 / C1901 / C1902 / C1902 V2**：位于 40-pin 扩展排针的 **8 号引脚（`UART1_TX`）**与 **10 号引脚（`UART1_RX`）**（共地可接 6 号或 9 号 `GND`）。
  - **C1903 / C2402**：无 40-pin 排针，通过独立 **GH1.25-4P** 座子引出（C1903 提供 `UART0` 与 `UART1`，C2402 提供 `UART1`；引脚顺序均为 `1: GND, 2: RX, 3: TX, 4: 5V`）。
  - **C2401**：通过背面 **30-pin 扩展排母**引出通用 UART，另设独立 GH1.25-4P `UART1` 座子（**注意**：C2401 的 `UART1` 由 M.2 Key E 引出，需替换专用设备树后方可使用，详见 [C2401 产品介绍](/c2401/c2401)）。

### 1.1 使用 CuteCom 操作 UART

`CuteCom` 是一款跨平台的图形化串口调试终端，支持直观地收发串口数据。在 Jetson 开发板终端执行以下命令安装 `CuteCom`：

```bash
sudo apt update
sudo apt install -y cutecom
```

![安装 CuteCom](/img/wiki-EKf1.webp)

按以下步骤进行串口回环（自发自收）测试：

1. 使用一根**杜邦线（跳线）**短接 40-pin 排针的 **8 号（`UART1_TX`）**与 **10 号（`UART1_RX`）**引脚（GH1.25 载板则短接对应 UART 座子的 `TX` 与 `RX`）。
2. 配置串口访问权限（二选一）：

   临时赋予当前串口读写权限（重启后失效）：

   ```bash
   sudo chmod 666 /dev/ttyTHS1
   ```

   或将当前用户加入 `dialout` 用户组以获得永久权限（注销重新登录或重启后生效）：

   ```bash
   sudo usermod -aG dialout $USER
   ```

3. 打开 `CuteCom`，在 `Device` 下拉框中选择 `/dev/ttyTHS1`（JetPack 5 选择 `/dev/ttyTHS0`），点击 **Open** 打开串口：

   ![CuteCom 选择串口设备](/img/wiki-DfP8.webp)

4. 在 `Input` 输入框中输入测试文本并按回车发送，下方接收区将同步显示回环接收到的内容：

   ![CuteCom 串口回环收发测试](/img/wiki-oY510.png)

### 1.2 使用 Python 操作 UART

1. 确认已按上一节配置好 `/dev/ttyTHS1` 权限（如 `sudo chmod 666 /dev/ttyTHS1` 或已加入 `dialout` 组）。
2. 安装 `pyserial` 串口通信库：

   ```bash
   python3 -m pip install pyserial
   ```

3. 保持 `TX` 与 `RX` 引脚短接，创建并运行以下 Python 测试脚本（JetPack 5 请将 `PORT` 改为 `"/dev/ttyTHS0"`）：

   ```python
   import serial
   import time

   PORT = "/dev/ttyTHS1"
   BAUDRATE = 115200
   ENCODING = "UTF-8"
   MESSAGE = "hello, jetson\r\n"

   try:
       with serial.Serial(PORT, BAUDRATE, timeout=2) as se:
           print(f"Serial port {PORT} opened: {se.is_open}")
           while True:
               se.write(MESSAGE.encode(ENCODING))
               print(f"Sent: {MESSAGE.strip()}")
               try:
                   line = se.readline().decode(ENCODING).strip()
                   if line:
                       print(f"Received: {line}")
               except Exception as e:
                   print(f"Read error: {e}")
               time.sleep(1)
   except serial.SerialException as e:
       print(f"Serial error: {e}")
   except KeyboardInterrupt:
       print("\nExit by user.")
   ```

   正常运行后终端输出如下：

   ![Python UART 回环收发测试输出](/img/wiki-RJK11.png)

## 2. SPI 接口

::: warning 前置配置：启用 SPI 引脚复用
在 **JetPack 6 / 7** 默认固件下，40-pin 排针上的 SPI 引脚默认处于未启用（`unused`）状态。对于配备 40-pin 排针的载板（官方套件、C1901、C1902、C1902 V2），测试前请先参照 [40-pin 扩展头配置 (Jetson-IO)](/orin-nano-series/expansion-header) 运行 `sudo /opt/nvidia/jetson-io/jetson-io.py`，勾选启用 **`spi1`**（对应硬件丝印 `SPI0`）并保存重启。

**C1903 / C2402** 通过 **GH1.25-6P `SPI0`** 座子引出（`Pin 3: MOSI`、`Pin 4: MISO`），**C2401** 通过 **30-pin 扩展排母**引出；非 40-pin 载板不适用 Jetson-IO 40-pin 菜单，需确保已加载对应板卡设备树。
:::

加载 `spidev` 驱动模块并查看当前系统的 SPI 模块状态：

```bash
sudo modprobe spidev
lsmod | grep -i spi
```

预期输出示例：

```text
spidev                 28672  0
spi_tegra114           32768  0
```

### 2.1 使用 C/C++ 进行 SPI 通信

以 `SPI0`（对应设备节点 `/dev/spidev0.0`）回环测试为例，**使用杜邦线（跳线）短接 40-pin 排针的 19 号（`SPI0_MOSI`）与 21 号（`SPI0_MISO`）引脚**（若使用 C1903 / C2402 的 GH1.25-6P `SPI0` 接口，则短接 Pin 3 `MOSI` 与 Pin 4 `MISO`）。

::: danger 严禁误接 20 号引脚（GND）
40-pin 排针为双排奇偶编号：**19 号（`SPI0_MOSI`）与 21 号（`SPI0_MISO`）位于同一侧奇数列相邻位置**，而偶数列相邻的 **20 号引脚为 `GND`（地）**！接线时请仔细核对引脚序号，**严禁将 19 号与 20 号引脚短接**，否则会将 `MOSI` 输出对地短路，不仅回环数据全为 `0x00`，还存在损坏引脚的风险。
:::

1. 下载 `spidev-test` 测试例程并编译：

   ```bash
   git clone https://github.com/rm-hull/spidev-test
   cd spidev-test
   gcc spidev_test.c -o spidev_test
   ```

2. 运行 SPI 回环测试：

   ```bash
   sudo ./spidev_test -D /dev/spidev0.0 -s 100000 -p "\x11\x22\x33" -v
   ```

   当 `RX` 行与 `TX` 行均打印出 `11 22 33` 时，说明 SPI 收发正常：

   ```text
   spi mode: 0x0
   bits per word: 8
   max speed: 100000 Hz (100 KHz)
   TX | 11 22 33 __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __  | ."3
   RX | 11 22 33 __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __  | ."3
   ```

### 2.2 使用 Python 进行 SPI 通信

1. 安装 `spidev` 库：

   ```bash
   python3 -m pip install spidev
   ```

2. 保持 `MOSI` 与 `MISO` 短接，保存以下内容为 `test_spi.py` 并运行（若普通用户无 `/dev/spidev0.0` 权限，可使用 `sudo python3 test_spi.py`）：

   ```python
   import spidev
   import time

   spi = spidev.SpiDev()
   spi.open(0, 0)
   spi.max_speed_hz = 1_000_000
   spi.mode = 0

   TEST_DATA = [
       [11], [22], [33]
   ]

   for data in TEST_DATA:
       resp = spi.xfer2(data)
       print(f"received: {resp}")
       time.sleep(0.1)

   spi.close()
   ```

   运行命令：

   ```bash
   python3 test_spi.py
   ```

   预期输出如下：

   ```text
   received: [11]
   received: [22]
   received: [33]
   ```

## 3. I2C 接口

各载板的 I2C 引脚引出方式如下：

- **官方套件 / C1901 / C1902 / C1902 V2（40-pin 排针）**：Pin 3（`I2C1_SDA`）与 Pin 5（`I2C1_SCL`）对应软件总线 **`i2c-7`**；Pin 27（`I2C0_SDA`）与 Pin 28（`I2C0_SCL`）对应软件总线 **`i2c-1`**。
- **C1903 / C2402**：通过独立 **GH1.25-4P `I2C`** 座子引出（`1: GND, 2: SDA, 3: SCL, 4: 5V`，信号为 3.3V 电平）。
- **C2401**：通过背面 **30-pin 扩展排母**引出。

1. 安装 `i2c-tools` 工具包：

   ```bash
   sudo apt update
   sudo apt install -y i2c-tools
   ```

2. 查看开发板当前可用的 I2C 总线列表：

   ```bash
   i2cdetect -l
   ```

   预期输出示例：

   ```text
   i2c-0    i2c           3160000.i2c                         I2C adapter
   i2c-1    i2c           c240000.i2c                         I2C adapter
   i2c-2    i2c           3180000.i2c                         I2C adapter
   i2c-4    i2c           Tegra BPMP I2C adapter              I2C adapter
   i2c-5    i2c           31b0000.i2c                         I2C adapter
   i2c-7    i2c           c250000.i2c                         I2C adapter
   i2c-9    i2c           NVIDIA SOC i2c adapter 0            I2C adapter
   ```

3. 扫描指定总线上的挂载设备（以 40-pin Pin 3/5 对应的 `i2c-7` 为例）：

   ```bash
   sudo i2cdetect -y -r -a 7
   ```

   正确接入 I2C 外设并共地后，扫描矩阵中将显示该外设的十六进制从机地址（例如 OLED 屏幕常见的 `3c`）。

## 4. CAN 总线

控元各型号载板按**是否集成板载 CAN 收发器芯片**分为两类，接线方式完全不同，操作前请务必核对载板型号：

::: danger 严禁将无收发器载板直连 CAN_H / CAN_L 总线
- **无板载收发器（官方套件 / C1901 / C1902 / C1902 V2）**：对应下图**红框**部分，仅从核心卡引出 **3.3V 逻辑电平**的 `CAN_TX` 与 `CAN_RX` 信号。接入 CAN 总线时**必须外接 3.3V CAN 收发器模块**（如 SN65HVD230、TJA1051 等），**严禁将 `CAN_TX` / `CAN_RX` 直接接入物理 `CAN_H` / `CAN_L` 差分总线**，否则会烧毁核心卡引脚！
- **集成板载收发器（C1903 / C2401 / C2402）**：对应下图**蓝框**部分，载板已内置 CAN 收发器芯片，通过 GH1.25-2P 座子（C2402 的 XT30 `2+2` 接口亦同步引出）**直接输出差分信号 `CAN_H` 与 `CAN_L`**，可直接连入 CAN 总线。
:::

![CAN 总线节点硬件结构示意](/img/wiki-gemini-generated-image-ry4utnry4utnry4u.webp)

*蓝框对应内置收发器的 C1903 / C2401 / C2402；红框对应仅引出逻辑信号的 C1901 / C1902 / C1902 V2*

对于 **C1903 / C2401 / C2402**，若开发板处于物理 CAN 总线的首尾端点位置，可将板载功能**拨码开关 1（丝印 `CAN 120R`）**拨至 **`ON`**，接入板载 **120Ω 终端匹配电阻**：

![拨码开关 1 开启 120Ω CAN 终端电阻](/img/wiki-9svimage.png)

### 4.1 CAN 总线配置与收发测试

1. 加载 CAN 协议与控制器内核模块：

   ```bash
   sudo modprobe can
   sudo modprobe can_raw
   sudo modprobe mttcan
   ```

2. 安装 `can-utils` 调试工具包：

   ```bash
   sudo apt update
   sudo apt install -y can-utils
   ```

3. 配置 `can0` 波特率并启用接口（此处以 `10 kbps` 为例，实际通信时必须与总线上对端节点的波特率一致，如常见的 `500000` 即 `500 kbps`；每次调整波特率前需先关闭接口）：

   ```bash
   sudo ip link set down can0
   sudo ip link set can0 type can bitrate 10000
   sudo ip link set up can0
   ```

4. 发送测试帧：

   ```bash
   cansend can0 123#00.00.00.00.11.11.11.11
   ```

5. 监听接收总线数据（可新开终端窗口或加 `&` 后台运行）：

   ```bash
   candump can0
   ```

### 4.2 查看 CAN 状态与故障诊断

使用 `ip` 命令查看 `can0` 的协议层状态、实际波特率及错误计数器（传统 `ifconfig` 无法显示 CAN 控制器状态）：

```bash
ip -details -statistics link show can0
```

预期输出示例：

```text
6: can0: <NOARP,UP,LOWER_UP,ECHO> mtu 16 qdisc pfifo_fast state UP mode DEFAULT group default qlen 10
    link/can  promiscuity 0 minmtu 0 maxmtu 0
    can state ERROR-ACTIVE (berr-counter tx 0 rx 0) restart-ms 0
          bitrate 10000 sample-point 0.875
          tq 6250 prop-seg 6 phase-seg1 7 phase-seg2 2 sjw 1
          clock 50000000
    RX: bytes  packets  errors  dropped missed  mcast
    16         2        0       0       0       0
    TX: bytes  packets  errors  dropped carrier collsns
    0          0        0       0       0       0
```

输出中的 `can state` 字段对应 CAN 协议的 3 种节点状态：

- **`ERROR-ACTIVE`（主动错误，正常状态）**：总线健康的正常工作状态。节点可正常收发数据；检测到错误时会发送主动错误帧通知总线上其他节点。
- **`ERROR-PASSIVE`（被动错误，警告状态）**：当接收或发送错误计数器（`berr-counter tx/rx`）超过 `127` 时进入此状态（常见于波特率不匹配、缺少 120Ω 终端电阻或 `CAN_H` / `CAN_L` 接反）。节点仍可收发，但仅发送被动错误帧以免干扰总线。
- **`BUS-OFF`（总线关闭，严重故障）**：当发送错误计数器超过 `255` 时触发。CAN 控制器会自动从物理总线上脱离并停止一切收发。排查接线与终端电阻后，需重启接口（`sudo ip link set down can0 && sudo ip link set up can0`）或在配置时加上自动恢复参数（如 `restart-ms 100`）方可恢复。

## 5. RTC 接口

实时时钟（Real-Time Clock，RTC）可在系统断电后依靠后备电池持续计时。当开发板部署在无公网连接（离线）环境且需要断电保持准确系统时间时，需配置硬件 RTC。

::: danger 电池接口与极性警告
- **官方开发者套件不支持**后备电池掉电保持功能；控元载板（C1901 V1.2+、C1902、C1902 V2、C1903、C2401、C2402）均配备 **MX1.25-2P（3V）** RTC 电池座。
- 接入电池前请仔细核对座子正负极标识，**严禁反接电池**，否则可能损坏 RTC 电路或导致电池发热危险！
:::

![载板 MX1.25-2P RTC 电池接口](/img/wiki-gfZimage.png)

### 5.1 确认硬件 RTC 设备节点

Jetson 系统中通常同时存在 SoC 内部 RTC 与外扩/后备供电 RTC（分别对应 `/dev/rtc0`、`/dev/rtc1` 等）。配置前请先查看系统中的 RTC 节点列表：

```bash
ls -l /sys/class/rtc/
grep . /sys/class/rtc/rtc*/name
```

请确认载板后备电池对应的 `/dev/rtcN` 节点（若不确定，可分别写入时间后断电静置数分钟再上电读取验证）。下文命令及服务文件均以 `/dev/rtc0` 为例，**若您的载板外扩 RTC 对应 `/dev/rtc1`，请将下文所有 `/dev/rtc0` 替换为 `/dev/rtc1`**。

### 5.2 校准时间并写入硬件 RTC

1. 检查当前系统时间与状态：

   ```bash
   timedatectl status
   ```

2. 设置时区并联网校准系统时间（若当前环境可联网）：

   ```bash
   sudo timedatectl set-timezone Asia/Shanghai
   sudo apt update
   sudo apt install -y ntpdate
   sudo ntpdate cn.pool.ntp.org
   ```

3. 将校准后的系统时间写入硬件 RTC（使用 UTC 时间标准）：

   ```bash
   sudo hwclock --systohc --utc --rtc /dev/rtc0 --noadjfile
   ```

4. 读取硬件 RTC 时间，确认写入成功：

   ```bash
   sudo hwclock --show --utc --rtc /dev/rtc0 --noadjfile
   ```

### 5.3 配置开机自动从硬件 RTC 同步时间

为确保离线状态下每次上电自动从指定 RTC 节点恢复系统时间，可配置 `systemd` 开机服务：

1. 在 `/etc/systemd/system/` 下创建自定义服务文件（切勿写入系统包管理目录 `/lib/systemd/system/`）：

   ```bash
   sudo nano /etc/systemd/system/hwrtc.service
   ```

2. 写入以下内容（注意将 `--rtc /dev/rtc0` 改为实际确认的 RTC 节点）：

   ```ini
   [Unit]
   Description=Synchronize System Clock from Hardware RTC
   DefaultDependencies=no
   After=systemd-modules-load.service
   Before=systemd-journald.service systemd-fsck-root.service time-sync.target sysinit.target shutdown.target
   Conflicts=shutdown.target

   [Service]
   Type=oneshot
   RemainAfterExit=yes
   ExecStart=/sbin/hwclock --hctosys --utc --rtc /dev/rtc0 --noadjfile
   RestrictRealtime=yes

   [Install]
   WantedBy=sysinit.target
   ```

3. 重新加载 `systemd` 配置并设为开机自启：

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable hwrtc.service
   ```

4. （可选）常用手动维护命令：

   手动将硬件 RTC 时间同步回系统时间：

   ```bash
   sudo hwclock --hctosys --utc --rtc /dev/rtc0 --noadjfile
   ```

   在纯离线环境中关闭系统自带的网络时间同步服务：

   ```bash
   sudo timedatectl set-ntp false
   ```
