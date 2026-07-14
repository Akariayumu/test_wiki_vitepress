---
title: 五、其他外设
outline: deep
---

# 五、其他外设

### 1. UART接口

##### 1.1使用 cutecom 操作UART

**cutecom** 是一个**跨平台的串口终端程序**，它提供了一个简洁直观的图形用户界面，允许用户通过串口接口发送和接收数据。运行以下命令以安装 **cutecom**

```shell
sudo apt install cutecom
```

[![1.png](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/scaled-1680-/EKf1.png)](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/EKf1.png)

官方默认开启的UART接口为**ttyTHS1** 即 40pin GPIO中的 **pin8 (TX)** 和**pin10(RX)**引脚。

- 使用一根条线短接8和10引脚
- 更改串口权限（临时授权）

```shell
sudo chmod 777 /dev/ttyTHS1
```

- 运行如下语句将当前用户加入到用户组。（可选，永久授权）

```shell
sudo usermod -aG dialout $USER
```

- 打开 **cutecom**，选择 **ttyTHS1** 并打开。

[![8.png](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/scaled-1680-/DfP8.png)](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/DfP8.png)

- 输入文本并回车，可以看到下方接收区显示有内容。

[![10.png](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/scaled-1680-/oY510.png)](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/oY510.png)

##### 1.2 使用 python 操作 UART

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

[![11.png](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/scaled-1680-/RJK11.png)](https://www.linkzeelabs.com/wiki/uploads/images/gallery/2025-07/RJK11.png)

### 2. SPI接口

- 查看开发板spi资源

```shell
jetson@ubuntu:~/Downloads$ lsmod | grep -i spi
spidev                 28672  0
spi_tegra114           32768  0
```

##### 2.1使用C/C++进行SPI通讯

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

##### 2.1使用python进行SPI通讯

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

### 3. I²C接口

- 安装i2c工具

```shell
sudo apt install i2c-tools
```

- 查看开发板可用的i2c的总线：

```shell
jetson@jetson-desktop:~$ i2cdetect -l
i2c-0   i2c             3160000.i2c                            I2C adapter
i2c-1   i2c             c240000.i2c                            I2C adapter
i2c-2   i2c             3180000.i2c                            I2C adapter
i2c-4   i2c             Tegra BPMP I2C adapter                 I2C adapter
i2c-5   i2c             31b0000.i2c                            I2C adapter
i2c-7   i2c             c250000.i2c                            I2C adapter
i2c-9   i2c             NVIDIA SOC i2c adapter 0               I2C adapter
```

- 查看连接到对应总线的i2c设备：

```shell
jetson@jetson-desktop:~$ i2cdetect -y -r -a 7
      0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f
00: 00 -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
10: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
20: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
30: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
40: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
50: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
60: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
70: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
```

- 正确接入i2c设备后：

```shell
i2cdetect -y -r -a 7
      0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f
00: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
10: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
20: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
30: -- -- -- -- -- -- -- -- -- -- -- -- -- 3c -- --
40: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
50: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
60: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
70: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
```

### 4. RTC接口

**实时时钟**（Real-Time Clock, **RTC**）是一种独立计时设备，可在系统断电或主电源关闭时持续提供精确的时间和日期信息。当开发板在**离线环境**下运行，并且**断电后仍需保持时间同步**时，就需要使用到RTC。

::: info
官方套件不支持RTC功能
:::

- 检查系统时间是否正确

```shell
timedatectl status
```

- 同步网络时间

```
sudo apt install ntpdate
sudo ntpdate cn.pool.ntp.org
```

- 设置时区

```
sudo timedatectl set-timezone Asia/Shanghai
```

- 同步系统时间到RTC硬件

```
sudo hwclock --systohc --utc --rtc /dev/rtc0 --noadjfile
```

- 检查RTC硬件时间

```
sudo hwclock --show --utc --rtc /dev/rtc0 --noadjfile
```

- 设置开机自动同步RTC时间

1. 打开文件

```
sudo vi /lib/systemd/system/hwrtc.service
```

2. 写入以下内容

```shell
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

```
sudo systemctl enable hwrtc.service
```

- 手动RTC硬件同步到系统时间

```
sudo hwclock --hctosys --utc --rtc /dev/rtc0 --noadjfile
```

- 关闭网络同步时间

```
sudo timedatectl set-ntp false
```
