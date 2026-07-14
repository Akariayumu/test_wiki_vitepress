---
title: 其他外设
---

# 其他外设

## 1. UART接口

### 1.1 使用 cutecom 操作UART

cutecom 是一个跨平台的串口终端程序，它提供了一个简洁直观的图形用户界面，允许用户通过串口接口发送和接收数据。运行以下命令以安装 cutecom

```shell
sudo apt install cutecom
```

![1.png](/img/wiki-EKf1.png)

官方默认开启的UART接口为 ttyTHS1 即 40pin GPIO中的 pin8 (TX) 和 pin10( RX) 引脚。

- 使用一根条线短接8和10引脚
- 更改串口权限（临时授权）

```shell
sudo chmod 777 /dev/ttyTHS1
```

- 运行如下语句将当前用户加入到用户组。（可选，永久授权）

```shell
sudo usermod -aG dialout $USER
```

- 打开 cutecom，选择 ttyTHS1 并打开。

![8.png](/img/wiki-DfP8.png)

- 输入文本并回车，可以看到下方接收区显示有内容。

![10.png](/img/wiki-oY510.png)

### 1.2 使用 python 操作 UART

- 更改串口权限

```shell
sudo chmod 777 /dev/ttyTHS1
```

- 安装pyserial库

```shell
pip install pyserial
```

- 运行以下脚本进行测试

```python
import serial
import time

PORT = "/dev/ttyTHS1"
BAUDRATE = 115200
ENCODING = "UTF-8"
MESSAGE = "hello,jetson\r\n"

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

![11.png](/img/wiki-RJK11.png)

## 2. SPI接口

- 查看开发板spi资源

```shell
jetson@ubuntu:~/Downloads$ lsmod | grep -i spi
spidev                 28672  0
spi_tegra114           32768  0
```

### 2.1 使用C/C++进行SPI通讯

以SPI0为例，使用条线短接19，20号针脚

- 下载SPI例程

```shell
git clone https://github.com/rm-hull/spidev-test
```

- 编译源文件

```shell
cd spidev-test
gcc spidev_test.c -o spidev_test
```

- 运行例程

```shell
sudo modprobe spidev  #启动官方spi驱动
./spidev_test -D /dev/spidev0.0 -s 100000 -p "\x11\x22\x33" -v
```

正确测试结果如下：

```shell
jetson@ubuntu:~/spidev-test$ ./spidev_test -D /dev/spidev0.0 -s 100000 -p "\x11\x22\x33" -v
spi mode: 0x0
bits per word: 8
max speed: 100000 Hz (100 KHz)
TX | 11 22 33 __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __  | ."3
RX | 11 22 33 __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __ __  | ."3
```

### 2.2 使用python进行SPI通讯

- 安装spidev库

```shell
pip install spidev
```

- 运行测试脚本

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
    print(f"recived:{resp}")
    time.sleep(0.1)

spi.close()
```

正确测试结果如下：

```shell
(test) jetson@ubuntu:~/Downloads$ python test_spi.py
recived:[11]
recived:[22]
recived:[33]
```

## 3. I2C接口

- 安装i2c工具

```shell
sudo apt install i2c-tools
```

- 查看开发板可用的i2c的总线：

```shell
jetson@jetson-desktop:~$ i2cdetect -l
i2c-0    i2c           3160000.i2c                         I2C adapter
i2c-1    i2c           c240000.i2c                         I2C adapter
i2c-2    i2c           3180000.i2c                         I2C adapter
i2c-4    i2c           Tegra BPMP I2C adapter              I2C adapter
i2c-5    i2c           31b0000.i2c                         I2C adapter
i2c-7    i2c           c250000.i2c                         I2C adapter
i2c-9    i2c           NVIDIA SOC i2c adapter 0            I2C adapter
```

- 查看连接到对应总线的i2c设备：

```shell
i2cdetect -y -r -a 7
```

- 正确接入i2c设备后，在扫描列表中可看到设备地址（如 0x3c）

## 4. CAN总线

C1901/C1902与C2401的连线形式不一样，请注意甄别。

C2401包括的部分为图示蓝框的部分，C1901/1902为红框所示的部分。

![CAN](/img/wiki-gemini-generated-image-ry4utnry4utnry4u.png)

C1901/1902 未配置 CAN 收发芯片，仅输出CAN_TX, CAN_RX信号。

C2401设置有 CAN 收发芯片，通过总线通讯时，需要将拨码开关1调整至 ON 接入120Ω电阻，输出CAN_H, CAN_L信号。

![CAN](/img/wiki-9svimage.png)

### CAN总线配置方法

1. 挂载相关内核模块

```shell
sudo modprobe can
sudo modprobe can_raw
sudo modprobe mttcan
```

2. 安装CAN工具进行收发操作

```shell
sudo apt-get install can-utils
```

3. 将CAN0波特率设置成10k

```shell
sudo ip link set down can0
sudo ip link set can0 type can bitrate 10000   #每次调整波特率前都需要先关闭端口
sudo ip link set up can0
```

4. 发送数据

```shell
cansend can0 123#00.00.00.00.11.11.11.11
```

5. 接收数据

```shell
candump can0 &
```

查看can网络情况：

```shell
jetson@jetson-desktop:~$ ifconfig
can0: flags=193<UP,RUNNING,NOARP>  mtu 16
        unspec 00-00-00-00-00-00-00-00-00-00-00-00-00-00-00-00  txqueuelen 10  (UNSPEC)
        RX packets 2  bytes 16 (16.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
        device interrupt 110
```

CAN 网络在协议层面有以下 3 种状态：

- **Error Active** (主动错误) - [正常] 这是健康状态。节点可以正常收发数据，如果发现总线错误，会发送"主动错误帧"（破坏总线电平）来通知其他节点。
- **Error Passive** (被动错误) - [警告] 当错误计数器（RX/TX Error Counter）超过 127 时进入此状态。节点依然可以收发数据，但发送错误帧时是被动的，以此避免干扰总线上的健康节点。
- **Bus Off** (总线关闭) - [严重] 当发送错误计数器超过 255 时进入此状态。CAN 控制器会将自己从物理总线上断开，彻底停止收发数据。需要重启接口 (down 然后 up) 或配置自动重启 (restart-ms) 才能恢复。

## 5. RTC接口

实时时钟（Real-Time Clock, RTC）是一种独立计时设备，可在系统断电或主电源关闭时持续提供精确的时间和日期信息。当开发板在离线环境下运行，并且断电后仍需保持时间同步时，就需要使用到RTC。

官方套件不支持RTC功能

载板RTC电池连接器型号为MX1.25-2P，使用电池时，请确认好极性，禁止接反电池

![RTC](/img/wiki-gfZimage.png)

- 检查系统时间是否正确

```shell
timedatectl status
```

- 同步网络时间

```shell
sudo apt install ntpdate
sudo ntpdate cn.pool.ntp.org
```

- 设置时区

```shell
sudo timedatectl set-timezone Asia/Shanghai
```

- 同步系统时间到RTC硬件

```shell
sudo hwclock --systohc --utc --rtc /dev/rtc0 --noadjfile
```

- 检查RTC硬件时间

```shell
sudo hwclock --show --utc --rtc /dev/rtc0 --noadjfile
```

- 设置开机自动同步RTC时间

1. 打开文件

```shell
sudo vi /lib/systemd/system/hwrtc.service
```

2. 写入以下内容

```ini
[Unit]
Description=Synchronise System clock to hardware RTC
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

3. 设置开机自启动服务

```shell
sudo systemctl enable hwrtc.service
```

- 手动RTC硬件同步到系统时间

```shell
sudo hwclock --hctosys --utc --rtc /dev/rtc0 --noadjfile
```

- 关闭网络同步时间

```shell
sudo timedatectl set-ntp false
```
