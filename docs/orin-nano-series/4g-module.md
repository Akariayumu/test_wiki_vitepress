---
title: 4G 模块使用说明
outline: deep
---

# 4G 模块使用说明

移远通信（Quectel）LTE Standard **EM05** 系列（含 `EM05-CN`、`EM05-E`、`EM05-G` 等型号）是一款面向工业物联网与边缘计算的 LTE Cat 4 无线通信模块，采用紧凑型 M.2 Key B（NGFF）封装，支持最大下行速率 `150 Mbps`、最大上行速率 `50 Mbps`，兼容 LTE-FDD、LTE-TDD、WCDMA 等多种网络制式。

要在 Jetson Orin 系列（JetPack 6 / R36.x）上使用移远 `EM05` 模块进行 QMI 高速拨号上网，需要在 **Ubuntu 宿主机**上向 L4T 内核源码合入移远 USB 串口与 `qmi_wwan_q` 网卡驱动，交叉编译并重刷系统后，在 **Jetson 开发板**上使用 `quectel-CM` 工具拨号联网。

::: info 硬件接口与资料获取说明
- **载板插槽兼容性**：
  - **C2402**：背面原生配备 **M.2 Key B（2230 / 3042）通信插槽**及正面 **Nano SIM 卡槽**，可直接安装 `EM05` 模块、SIM 卡与 4G 天线。
  - **官方套件 / C1901 / C1902 / C1902 V2 / C1903 / C2401**：载板无原生 M.2 Key B 与 SIM 卡槽（载板上的 M.2 Key M 为 PCIe NVMe 接口、M.2 Key E 为 Wi-Fi 接口，切勿强行混插），需搭配带 SIM 卡座的 **USB 转 M.2 Key B（WWAN）转接板**接入载板 USB 接口，并务必连接好 4G 主天线后再上电。
- **驱动源码与拨号工具获取**：本文涉及的移远专用驱动源码 `qmi_wwan_q.c` 及拨号程序 `Quectel_QConnectManager_Linux`（如 `Quectel_QConnectManager_Linux_V1.6.5.zip`）可从移远通信官方下载中心获取，或参阅 [硬件资源下载](/resources/downloads) 并联系控元科技技术支持获取验证好的资料包。
- **通用内核编译参考**：关于 L4T 内核与 BSP 交叉编译的更多背景说明，也可参阅 [内核与 BSP 编译指南](/hardware-bsp/kernel-and-bsp-build)。
:::

## 1. 获取源码与交叉编译工具链

本节所有命令均在 **x86_64 Ubuntu 宿主机终端**（需提前通过 SDK Manager 下载生成好 `Linux_for_Tegra` 刷机目录，以下以 JetPack 6.2.1 / R36.4.3 为例）执行：

1. 安装交叉编译所需的依赖包：

   ```bash
   sudo apt update
   sudo apt install -y build-essential bc git bison flex libssl-dev zip libncurses-dev make
   ```

2. 下载并解压 NVIDIA 官方 Bootlin `aarch64` 交叉编译工具链：

   ```bash
   mkdir -p $HOME/l4t-gcc-toolchain
   cd $HOME/l4t-gcc-toolchain
   wget https://developer.nvidia.com/downloads/embedded/l4t/r36_release_v3.0/toolchain/aarch64--glibc--stable-2022.08-1.tar.bz2
   tar xf aarch64--glibc--stable-2022.08-1.tar.bz2
   ```

3. 进入 SDK Manager 缓存的 `Linux_for_Tegra/source` 目录（请按宿主机实际路径调整）：

   ```bash
   cd $HOME/nvidia/nvidia_sdk/JetPack_6.2.1_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra/source
   ```

4. 根据当前 L4T 版本对应的 Release Tag 拉取内核与设备树源码（Tag 对照表可查阅 [Jetson Linux Archive | NVIDIA Developer](https://developer.nvidia.com/embedded/jetson-linux-archive)，例如 L4T 36.4.3 对应 `jetson_36.4.3`）：

   ```bash
   ./source_sync.sh -k -t jetson_36.4.3
   ```

## 2. 修改内核源码添加移远驱动

::: tip 官方移植文档参考
本节源码修改细节可对照参考 [移远 Linux & Android USB 驱动移植技术手册](https://forums.quectel.com/uploads/short-url/95mRmCPDAFQTH1TzCIB2cuFr9Yo.pdf)。以下文件路径均相对于 `Linux_for_Tegra/source/kernel/kernel-jammy-src/` 内核源码根目录。
:::

在 **Ubuntu 宿主机**上依次修改以下内核文件：

1. **开启内核配置项**：编辑 `kernel/kernel-jammy-src/arch/arm64/configs/defconfig`，确认启用或追加以下 USB 串口与 WWAN 驱动配置：

   ```ini
   CONFIG_USB_SERIAL=y
   CONFIG_USB_SERIAL_WWAN=y
   CONFIG_USB_SERIAL_OPTION=y
   CONFIG_USB_NET_DRIVERS=y
   CONFIG_USB_USBNET=y
   CONFIG_USB_NET_QMI_WWAN=y
   CONFIG_USB_WDM=y
   ```

2. **添加移远 EM05 的 VID / PID**：编辑 `kernel/kernel-jammy-src/drivers/usb/serial/option.c`，在 `option_ids[]` 数组开头加入 `EM05` 设备 ID（`0x2C7C:0x0125`；若使用其他子型号请一并核对 PID）：

   ```c
   static const struct usb_device_id option_ids[] = {
   #if 1 // Added by Quectel
       { USB_DEVICE(0x2C7C, 0x0125) },
   #endif
       /* ...原有内容保持不变... */
   };
   ```

3. **过滤 QMI / USBNet 接口避免被串口驱动误占**：在同一文件 `drivers/usb/serial/option.c` 的 `option_probe()` 函数中添加接口过滤逻辑：

   ```c
   static int option_probe(struct usb_serial *serial,
               const struct usb_device_id *id)
   {
       /* ...原有变量声明与校验... */

   #if 1 // Added by Quectel
       if (serial->dev->descriptor.idVendor == cpu_to_le16(0x2C7C)) {
           __u16 idProduct = le16_to_cpu(serial->dev->descriptor.idProduct);
           struct usb_interface_descriptor *intf = &serial->interface->cur_altsetting->desc;

           if (intf->bInterfaceClass != 0xFF || intf->bInterfaceSubClass == 0x42) {
               // ECM, RNDIS, NCM, MBIM, ACM, UAC, ADB
               return -ENODEV;
           }

           if ((idProduct & 0xF000) == 0x0000) {
               // MDM interface 4 is QMI
               if (intf->bInterfaceNumber == 4 && intf->bNumEndpoints == 3
                   && intf->bInterfaceSubClass == 0xFF && intf->bInterfaceProtocol == 0xFF)
                   return -ENODEV;
           }
       }
   #endif

       /* Store the device flags so we can use them during attach. */
       usb_set_serial_data(serial, (void *)device_flags);

       return 0;
   }
   ```

4. **添加 USB 批量传输零包（Zero Packet）机制**：编辑 `kernel/kernel-jammy-src/drivers/usb/serial/usb_wwan.c`，在 `usb_wwan_setup_urb()` 中补充零包标志：

   ```c
   static struct urb *usb_wwan_setup_urb(struct usb_serial_port *port,
                  int endpoint,
                  int dir, void *ctx, char *buf, int len,
                  void (*callback)(struct urb *))
   {
       /* ...原有代码... */
       usb_fill_bulk_urb(urb, serial->dev,
               usb_sndbulkpipe(serial->dev, endpoint) | dir,
               buf, len, callback, ctx);

   #if 1 // Added by Quectel for zero packet
       if (dir == USB_DIR_OUT) {
           struct usb_device_descriptor *desc = &serial->dev->descriptor;

           if (desc->idVendor == cpu_to_le16(0x2C7C))
               urb->transfer_flags |= URB_ZERO_PACKET;
       }
   #endif
       return urb;
   }
   ```

5. **添加休眠唤醒 `reset_resume` 支持**：回到 `kernel/kernel-jammy-src/drivers/usb/serial/option.c`，在 `option_1port_device` 结构体中添加 `.reset_resume`：

   ```c
   static struct usb_serial_driver option_1port_device = {
       /* ...原有字段... */
   #ifdef CONFIG_PM
       .suspend        = usb_wwan_suspend,
       .resume         = usb_wwan_resume,
   #if 1 // Added by Quectel
       .reset_resume   = usb_wwan_resume,
   #endif
   #endif
   };
   ```

6. **合入 `qmi_wwan_q.c` 网卡驱动**：将获取到的移远 `qmi_wwan_q.c` 源文件复制到 `kernel/kernel-jammy-src/drivers/net/usb/` 目录下，并编辑 `kernel/kernel-jammy-src/drivers/net/usb/Makefile`，在 `qmi_wwan.o` 之前加入 `qmi_wwan_q.o`（也可注释掉原生 `qmi_wwan.o` 以免冲突）：

   ```makefile
   # must insert qmi_wwan_q.o before qmi_wwan.o
   obj-${CONFIG_USB_NET_QMI_WWAN} += qmi_wwan_q.o
   obj-${CONFIG_USB_NET_QMI_WWAN} += qmi_wwan.o
   ```

## 3. 交叉编译内核、模块与设备树

::: danger 必须在安装模块前导出 INSTALL_MOD_PATH
执行 `sudo -E make install -C kernel` 与 `sudo -E make modules_install` 前，**必须在同一终端会话中先导出 `INSTALL_MOD_PATH` 指向目标刷机目录的 `rootfs/`**！若漏设该变量，系统会将 `arm64` 架构内核模块直接写入 x86 Ubuntu 宿主机的 `/lib/modules/`，污染宿主机内核环境。
:::

保持当前工作目录位于 **Ubuntu 宿主机**的 `Linux_for_Tegra/source` 下（整个编译过程可能需要 20–40 分钟）：

1. 确认位于 `Linux_for_Tegra/source` 目录，并统一设置交叉编译环境变量与目标根文件系统路径：

   ```bash
   cd $HOME/nvidia/nvidia_sdk/JetPack_6.2.1_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra/source

   export CROSS_COMPILE=$HOME/l4t-gcc-toolchain/aarch64--glibc--stable-2022.08-1/bin/aarch64-buildroot-linux-gnu-
   export INSTALL_MOD_PATH=$HOME/nvidia/nvidia_sdk/JetPack_6.2.1_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra/rootfs/
   export KERNEL_HEADERS=$PWD/kernel/kernel-jammy-src
   ```

2. 编译内核主镜像并将树内模块安装至目标 `rootfs/`：

   ```bash
   make -C kernel
   sudo -E make install -C kernel
   ```

3. 将新生成的内核镜像 `Image` 复制覆盖到上层 `Linux_for_Tegra/kernel/Image`：

   ```bash
   cp kernel/kernel-jammy-src/arch/arm64/boot/Image ../kernel/Image
   ```

4. 编译 NVIDIA 树外（Out-of-Tree）驱动模块并安装至目标 `rootfs/`：

   ```bash
   make modules
   sudo -E make modules_install
   ```

5. 编译设备树（DTB）并复制到刷机目录 `../kernel/dtb/`：

   ```bash
   make dtbs
   cp kernel-devicetree/generic-dts/dtbs/* ../kernel/dtb/
   ```

## 4. 刷入系统镜像

1. 将 Jetson 开发板置入 **Force Recovery（强制恢复）模式**，并通过 USB Type-C 数据线连接至 Ubuntu 宿主机（在宿主机执行 `lsusb` 确认识别到 `NVIDIA Corp. APX` 设备）。
2. 在 **Ubuntu 宿主机终端**执行 `cd ..` 退回至 `Linux_for_Tegra/` 刷机根目录，并更新 `initrd`：

   ```bash
   cd ..
   # 确认当前目录为 .../Linux_for_Tegra（包含 l4t_initrd_flash.sh 所在 tools 目录）
   sudo ./tools/l4t_update_initrd.sh
   ```

3. 根据所需的功耗配置选择以下命令之一将新系统刷入 NVMe SSD：

   - **刷入 SUPER 模式配置**（推荐，解锁最高性能档位；注意 Orin NX 仅在 C1902 V1.1+、C1902 V2、C1903 上支持 SUPER 模式）：

     ```bash
     sudo ./tools/kernel_flash/l4t_initrd_flash.sh --external-device nvme0n1p1 \
       -c tools/kernel_flash/flash_l4t_t234_nvme.xml \
       -p "-c bootloader/generic/cfg/flash_t234_qspi.xml" \
       --showlogs --network usb0 jetson-orin-nano-devkit-super internal
     ```

   - **刷入普通（标准）模式配置**：

     ```bash
     sudo ./tools/kernel_flash/l4t_initrd_flash.sh --external-device nvme0n1p1 \
       -c tools/kernel_flash/flash_l4t_t234_nvme.xml \
       -p "-c bootloader/generic/cfg/flash_t234_qspi.xml" \
       --showlogs --network usb0 jetson-orin-nano-devkit internal
     ```

## 5. 开机拨号与联网验证

刷机完成、开发板接入 `EM05` 模块（已插好可用 SIM 卡与天线）并正常启动进入系统后，以下操作均在 **Jetson 开发板终端**执行：

1. 检查 USB 总线与驱动节点是否就绪：

   ```bash
   lsusb | grep -i 2c7c
   ls /dev/ttyUSB* /dev/cdc-wdm*
   ```

   正常情况下应能看到 `2c7c:0125` 设备以及 `/dev/ttyUSB0~3` 和 `/dev/cdc-wdm0` 节点。

2. 将 `Quectel_QConnectManager_Linux_V1.6.5.zip` 上传至开发板，解压并编译生成拨号程序 `quectel-CM`：

   ```bash
   unzip Quectel_QConnectManager_Linux_V1.6.5.zip
   cd Quectel_QConnectManager_Linux_V1.6.5
   make
   ```

3. 运行 `quectel-CM` 发起 4G QMI 拨号：

   ::: tip 拨号进程驻留说明
   `quectel-CM` 默认在**前台持续运行**以守护数据连接（一旦按 `Ctrl+C` 或关闭该终端，4G 连接会随之断开）。首次调试建议先在前台运行观察日志，并**另开一个终端窗口**验证网络；测试无误后可使用 `sudo ./quectel-CM &`（或配置为 `systemd` 后台服务）驻留运行。若专用物联网卡需指定 APN，可附加 `-s <APN>` 参数。
   :::

   ```bash
   sudo ./quectel-CM
   ```

   拨号成功时终端输出示例如下（可看到 `SIM_READY`、驱动 `qmi_wwan_q` 及 `udhcpc` 成功获取运营商分配的 IPv4 地址）：

   ```text
   [08-08_11:39:04:415] QConnectManager_Linux_V1.6.5
   [08-08_11:39:04:416] Find /sys/bus/usb/devices/1-2.2 idVendor=0x2c7c idProduct=0x125, bus=0x001, dev=0x007
   [08-08_11:39:04:416] Auto find qmichannel = /dev/cdc-wdm0
   [08-08_11:39:04:417] Auto find usbnet_adapter = wwan0
   [08-08_11:39:04:417] netcard driver = qmi_wwan_q, driver version = V1.2.6
   [08-08_11:39:04:417] Modem works in QMI mode
   [08-08_11:39:04:812] requestGetSIMStatus SIMStatus: SIM_READY
   [08-08_11:39:04:908] requestRegistrationState2 MCC: 460, MNC: 11, PS: Attached, DataCap: LTE
   [08-08_11:39:05:132] ip link set dev wwan0 up
   [08-08_11:39:05:142] busybox udhcpc -f -n -q -t 5 -i wwan0
   udhcpc: started, v1.30.1
   udhcpc: sending discover
   udhcpc: sending select for 10.21.181.66
   udhcpc: lease of 10.21.181.66 obtained, lease time 7200
   [08-08_11:39:05:286] ip -4 address add 10.21.181.66/30 dev wwan0
   [08-08_11:39:05:292] ip -4 route add default via 10.21.181.65 dev wwan0
   ```

4. 打开新的 Jetson 终端窗口，检查 `wwan0` 接口信息并测试外网连通性：

   ```bash
   ip addr show wwan0
   ping -I wwan0 -c 4 223.5.5.5
   ```

   接口地址状态参考如下：

   ```text
   wwan0: flags=193<UP,RUNNING,NOARP>  mtu 1500
           inet 10.21.181.66  netmask 255.255.255.252
           inet6 fe80::5804:41ff:feda:ce83  prefixlen 64  scopeid 0x20<link>
           ether 5a:04:41:da:ce:83  txqueuelen 1000  (Ethernet)
           RX packets 9  bytes 2304 (2.3 KB)
           RX errors 0  dropped 0  overruns 0  frame 0
           TX packets 22  bytes 1854 (1.8 KB)
           TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
   ```

   ![通过 4G wwan0 接口进行外网连通性 Ping 测试](/img/ping-test.png)
