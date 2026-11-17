---
title: 4G Module Guide
outline: deep
---

# 4G Module Guide

The Quectel LTE Standard **EM05** series (including `EM05-CN`, `EM05-E`, and `EM05-G`) is an LTE Cat 4 cellular module designed for industrial IoT and edge AI applications. Packaged in a compact M.2 Key B (NGFF) form factor, it delivers up to `150 Mbps` downlink and `50 Mbps` uplink rates across LTE-FDD, LTE-TDD, and WCDMA networks.

To use a Quectel `EM05` module in QMI mode on Jetson Orin series boards (JetPack 6 / R36.x), integrate Quectel's USB serial patches and `qmi_wwan_q` driver into the L4T kernel source on an **Ubuntu host PC**, cross-compile and reflash the system, and then establish the cellular connection on the **Jetson board** using `quectel-CM`.

::: info Carrier Board Slot Compatibility & Driver Resources
- **Hardware Slot Compatibility**:
  - **C2402**: Features a native rear **M.2 Key B (2230 / 3042) cellular slot** and a front **Nano SIM card slot**, allowing direct installation of an `EM05` module, Nano SIM card, and 4G antennas.
  - **Official DevKit / C1901 / C1902 / C1902 V2 / C1903 / C2401**: These carrier boards do not include a native M.2 Key B slot or SIM holder (onboard M.2 Key M slots are PCIe NVMe and M.2 Key E is for Wi-Fi — never force a Key B module into them). Use an external **USB-to-M.2 Key B (WWAN) adapter board with a SIM slot** connected to a USB port on the carrier board, and attach the main 4G antenna before powering on.
- **Obtaining Driver Source & Dialer Utility**: Obtain the `qmi_wwan_q.c` driver source and `Quectel_QConnectManager_Linux` archive (e.g., `Quectel_QConnectManager_Linux_V1.6.5.zip`) from Quectel's official download center, or check [Hardware Resources](/en/resources/downloads) and contact KYtech technical support for the verified package.
- **General Kernel Build Reference**: For additional background on L4T kernel and BSP compilation, see the [Kernel and BSP Build Guide](/en/hardware-bsp/kernel-and-bsp-build).
:::

## 1. Obtain Source Code and Cross-Toolchain

Run all commands in this section in the **x86_64 Ubuntu host PC terminal** (requires an existing `Linux_for_Tegra` directory prepared by SDK Manager; JetPack 6.2.1 / R36.4.3 is used as the example below):

1. Install build dependencies on the Ubuntu host:

   ```bash
   sudo apt update
   sudo apt install -y build-essential bc git bison flex libssl-dev zip libncurses-dev make
   ```

2. Download and extract NVIDIA's official Bootlin `aarch64` cross-compilation toolchain:

   ```bash
   mkdir -p $HOME/l4t-gcc-toolchain
   cd $HOME/l4t-gcc-toolchain
   wget https://developer.nvidia.com/downloads/embedded/l4t/r36_release_v3.0/toolchain/aarch64--glibc--stable-2022.08-1.tar.bz2
   tar xf aarch64--glibc--stable-2022.08-1.tar.bz2
   ```

3. Enter the `Linux_for_Tegra/source` directory cached by SDK Manager (adjust the path to match your host environment):

   ```bash
   cd $HOME/nvidia/nvidia_sdk/JetPack_6.2.1_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra/source
   ```

4. Sync the kernel and device tree sources matching your L4T release tag (look up exact tags at [Jetson Linux Archive | NVIDIA Developer](https://developer.nvidia.com/embedded/jetson-linux-archive); for example, L4T 36.4.3 uses `jetson_36.4.3`):

   ```bash
   ./source_sync.sh -k -t jetson_36.4.3
   ```

## 2. Patch the Kernel Source for Quectel EM05

::: tip Official Porting Guide
For detailed driver internals, refer to the [Quectel Linux & Android USB Driver User Guide](https://forums.quectel.com/uploads/short-url/95mRmCPDAFQTH1TzCIB2cuFr9Yo.pdf). All source file paths below are relative to `Linux_for_Tegra/source/kernel/kernel-jammy-src/`.
:::

Apply the following kernel source modifications on the **Ubuntu host PC**:

1. **Enable USB serial and WWAN kernel options**: Edit `kernel/kernel-jammy-src/arch/arm64/configs/defconfig` and ensure the following symbols are enabled:

   ```ini
   CONFIG_USB_SERIAL=y
   CONFIG_USB_SERIAL_WWAN=y
   CONFIG_USB_SERIAL_OPTION=y
   CONFIG_USB_NET_DRIVERS=y
   CONFIG_USB_USBNET=y
   CONFIG_USB_NET_QMI_WWAN=y
   CONFIG_USB_WDM=y
   ```

2. **Add the Quectel EM05 USB VID/PID**: Edit `kernel/kernel-jammy-src/drivers/usb/serial/option.c` and add the `EM05` USB ID (`0x2C7C:0x0125`) to `option_ids[]`:

   ```c
   static const struct usb_device_id option_ids[] = {
   #if 1 // Added by Quectel
       { USB_DEVICE(0x2C7C, 0x0125) },
   #endif
       /* ...keep existing entries... */
   };
   ```

3. **Exclude QMI / USBNet interfaces from the serial driver**: In the same file `drivers/usb/serial/option.c`, add interface filtering inside `option_probe()` so interface 4 remains available to `qmi_wwan_q`:

   ```c
   static int option_probe(struct usb_serial *serial,
               const struct usb_device_id *id)
   {
       /* ...existing declarations and checks... */

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

4. **Enable USB bulk zero-packet handling**: Edit `kernel/kernel-jammy-src/drivers/usb/serial/usb_wwan.c` and set `URB_ZERO_PACKET` inside `usb_wwan_setup_urb()`:

   ```c
   static struct urb *usb_wwan_setup_urb(struct usb_serial_port *port,
                  int endpoint,
                  int dir, void *ctx, char *buf, int len,
                  void (*callback)(struct urb *))
   {
       /* ...existing code... */
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

5. **Enable `reset_resume` power management**: In `kernel/kernel-jammy-src/drivers/usb/serial/option.c`, add `.reset_resume` to `option_1port_device`:

   ```c
   static struct usb_serial_driver option_1port_device = {
       /* ...existing fields... */
   #ifdef CONFIG_PM
       .suspend        = usb_wwan_suspend,
       .resume         = usb_wwan_resume,
   #if 1 // Added by Quectel
       .reset_resume   = usb_wwan_resume,
   #endif
   #endif
   };
   ```

6. **Add the `qmi_wwan_q` network driver**: Copy Quectel's `qmi_wwan_q.c` into `kernel/kernel-jammy-src/drivers/net/usb/`, then edit `kernel/kernel-jammy-src/drivers/net/usb/Makefile` so `qmi_wwan_q.o` is built before `qmi_wwan.o` (or comment out `qmi_wwan.o` to prevent driver binding conflicts):

   ```makefile
   # must insert qmi_wwan_q.o before qmi_wwan.o
   obj-${CONFIG_USB_NET_QMI_WWAN} += qmi_wwan_q.o
   obj-${CONFIG_USB_NET_QMI_WWAN} += qmi_wwan.o
   ```

## 3. Cross-Compile the Kernel, Modules, and DTBs

::: danger Always Export INSTALL_MOD_PATH Before Installing Modules
You **must export `INSTALL_MOD_PATH` pointing to `Linux_for_Tegra/rootfs/` in the same shell session BEFORE running `sudo -E make install -C kernel` or `sudo -E make modules_install`**! Running module installation without `INSTALL_MOD_PATH` will install `arm64` modules directly into your x86 Ubuntu host's `/lib/modules/` directory.
:::

Keep your working directory at `Linux_for_Tegra/source` on the **Ubuntu host PC** throughout this section (compilation typically takes 20–40 minutes):

1. Confirm you are in `Linux_for_Tegra/source` and export the cross-toolchain, target `rootfs/`, and kernel headers variables:

   ```bash
   cd $HOME/nvidia/nvidia_sdk/JetPack_6.2.1_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra/source

   export CROSS_COMPILE=$HOME/l4t-gcc-toolchain/aarch64--glibc--stable-2022.08-1/bin/aarch64-buildroot-linux-gnu-
   export INSTALL_MOD_PATH=$HOME/nvidia/nvidia_sdk/JetPack_6.2.1_Linux_JETSON_ORIN_NANO_TARGETS/Linux_for_Tegra/rootfs/
   export KERNEL_HEADERS=$PWD/kernel/kernel-jammy-src
   ```

2. Build the Linux kernel image and install in-tree kernel modules into the target `rootfs/`:

   ```bash
   make -C kernel
   sudo -E make install -C kernel
   ```

3. Copy the newly built `Image` into `../kernel/Image` (`Linux_for_Tegra/kernel/Image`):

   ```bash
   cp kernel/kernel-jammy-src/arch/arm64/boot/Image ../kernel/Image
   ```

4. Build NVIDIA out-of-tree modules and install them into the target `rootfs/`:

   ```bash
   make modules
   sudo -E make modules_install
   ```

5. Build the device trees (DTBs) and copy them into `../kernel/dtb/`:

   ```bash
   make dtbs
   cp kernel-devicetree/generic-dts/dtbs/* ../kernel/dtb/
   ```

## 4. Flash the System

1. Place the Jetson board into **Force Recovery mode** and connect its USB Type-C port to the Ubuntu host PC (verify `NVIDIA Corp. APX` appears in `lsusb`).
2. In the **Ubuntu host PC terminal**, run `cd ..` to return from `source/` to the parent `Linux_for_Tegra/` directory and update `initrd`:

   ```bash
   cd ..
   # Confirm current directory is .../Linux_for_Tegra
   sudo ./tools/l4t_update_initrd.sh
   ```

3. Flash the NVMe SSD using either command below according to your target power mode:

   - **SUPER mode configuration** (recommended; note that Orin NX `40W` SUPER mode is supported only on C1902 V1.1+, C1902 V2, and C1903):

     ```bash
     sudo ./tools/kernel_flash/l4t_initrd_flash.sh --external-device nvme0n1p1 \
       -c tools/kernel_flash/flash_l4t_t234_nvme.xml \
       -p "-c bootloader/generic/cfg/flash_t234_qspi.xml" \
       --showlogs --network usb0 jetson-orin-nano-devkit-super internal
     ```

   - **Standard mode configuration**:

     ```bash
     sudo ./tools/kernel_flash/l4t_initrd_flash.sh --external-device nvme0n1p1 \
       -c tools/kernel_flash/flash_l4t_t234_nvme.xml \
       -p "-c bootloader/generic/cfg/flash_t234_qspi.xml" \
       --showlogs --network usb0 jetson-orin-nano-devkit internal
     ```

## 5. Boot and Dial Up over 4G

Once flashing finishes and the Jetson board boots with the `EM05` module, active SIM card, and antennas attached, run all commands below in the **Jetson board terminal**:

1. Verify that the USB modem and QMI/serial device nodes are enumerated:

   ```bash
   lsusb | grep -i 2c7c
   ls /dev/ttyUSB* /dev/cdc-wdm*
   ```

   You should see the `2c7c:0125` USB device along with `/dev/ttyUSB0..3` and `/dev/cdc-wdm0`.

2. Upload `Quectel_QConnectManager_Linux_V1.6.5.zip` to the Jetson board, extract it, and build `quectel-CM`:

   ```bash
   unzip Quectel_QConnectManager_Linux_V1.6.5.zip
   cd Quectel_QConnectManager_Linux_V1.6.5
   make
   ```

3. Start the 4G QMI connection with `quectel-CM`:

   ::: tip Foreground Persistence Notice
   `quectel-CM` stays **running in the foreground** to maintain the cellular data session (pressing `Ctrl+C` or closing that terminal tears down the link). Keep this terminal open and **open a second terminal** to test connectivity, or append `&` (`sudo ./quectel-CM &`) / configure a `systemd` service to keep it running in the background. If your carrier requires a custom APN, pass `-s <APN>`.
   :::

   ```bash
   sudo ./quectel-CM
   ```

   Expected dial-up log (`SIM_READY`, `qmi_wwan_q` bound to `wwan0`, and an IPv4 lease obtained via `udhcpc`):

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

4. In a second Jetson terminal, inspect the `wwan0` interface and verify internet connectivity:

   ```bash
   ip addr show wwan0
   ping -I wwan0 -c 4 8.8.8.8
   ```

   Interface status example:

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

   ![Ping connectivity test over the 4G wwan0 cellular interface](/img/ping-test.png)
