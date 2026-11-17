---
title: Network Card Driver
outline: deep
---

# Network Card Driver

This guide explains how to install Linux kernel drivers for add-on **Intel M.2 Wi-Fi modules** and onboard/add-on **Realtek 2.5GbE Ethernet controllers (`RTL8125`)** on Jetson Orin series boards. Run all commands in the **Jetson board terminal**.

## 1. Wireless Network Card Driver

When installing an M.2 Key E wireless card, check the chipset vendor first:

- **Realtek Wi-Fi modules (Plug-and-Play)**: Modules such as `RTL8822CE` and `RTL8852CE` (commonly bundled with developer kits) are supported out of the box by the built-in `rtw88` / `rtw89` drivers in JetPack and require no manual driver installation.
- **Intel Wi-Fi modules (Manual `iwlwifi` installation required)**: Starting with **JetPack 6**, stock images removed legacy **Intel 8265NGW** driver support, and newer **Intel Wi-Fi 6 AX200 / AX210** modules also require installing the `backport-iwlwifi-dkms` package manually.

Follow these steps to enable an Intel wireless card:

1. **Install the card and check hardware detection**: With main power disconnected, mount the M.2 Wi-Fi card and attach its antennas. Boot the board and run:

   ```bash
   sudo lshw -C network
   ```

   If the output lists `product: Wi-Fi 6 AX200` (or your Intel model) alongside **`UNCLAIMED`**, the PCIe device is detected properly and only needs the driver package.

2. **Install `backport-iwlwifi-dkms`**: `iwlwifi` is Intel's official open-source Linux wireless driver (connect the board temporarily via Gigabit Ethernet or USB tethering for internet access):

   ```bash
   sudo apt update
   sudo apt install -y backport-iwlwifi-dkms
   ```

3. **Reboot the Jetson board**:

   ```bash
   sudo reboot
   ```

4. **Verify wireless interface binding**: After rebooting, inspect the network status again:

   ```bash
   sudo lshw -C network
   ```

   Expected output (`wlan0` logical name assigned and `driver=iwlwifi` active without `UNCLAIMED`):

   ```text
     *-network
          description: Wireless interface
          product: Wi-Fi 6 AX200
          vendor: Intel Corporation
          physical id: 0
          bus info: pci@0001:01:00.0
          logical name: wlan0
          version: 1a
          serial: ac:12:03:a0:4c:db
          width: 64 bits
          clock: 33MHz
          capabilities: pm msi pciexpress msix bus_master cap_list ethernet physical wireless
          configuration: broadcast=yes driver=iwlwifi driverversion=5.15.148-tegra firmware=77.ad46c98b.0 cc-a0-77.ucode latency=0 link=no multicast=yes wireless=IEEE 802.11
          resources: irq:55 memory:20a8000000-20a8003fff
   ```

   Once `description: Wireless interface` and a logical interface (`wlan0` or `wlP1p1s0`) appear, Wi-Fi is ready to connect.

## 2. Wired Ethernet Driver (2.5GbE RTL8125)

Onboard RJ45 Ethernet driver requirements across carrier boards are as follows:

- **Onboard Gigabit Ethernet (Plug-and-Play)**: All Gigabit RJ45 ports on the Official Developer Kit, **C1901, C1902, C1902 V2, C1903, and C2402**, as well as the **Gigabit RJ45 port on C2401** (using Realtek `RTL8111` or Intel `I210` controllers), work out of the box with built-in JetPack drivers.
- **Onboard 2.5GbE Port (Requires `r8125` driver)**: The **2.5GbE RJ45 port** on the KYtech **[C2401](/en/c2401/c2401)** (as well as external PCIe/M.2 `RTL8125` adapters) uses the **Realtek RTL8125** controller and requires installing the `r8125` driver after flashing stock NVIDIA firmware.

::: info RJ45 LED Behavior Notice
With the generic upstream driver from Realtek's website, the RJ45 link/activity LED blink pattern may differ slightly from factory firmware (2.5GbE link speed and throughput are unaffected). Contact KYtech technical support if you need the LED-customized driver package.
:::

1. **Download the Realtek `r8125` driver**: Open the [Realtek Linux Driver Download Page](https://www.realtek.com/Download/ToDownload?type=direct&downloadid=3763) and download **2.5G Ethernet LINUX driver r8125** (`.tar.bz2` archive):

   ![Download the 2.5G Ethernet Linux driver r8125 from Realtek](/img/wiki-MIZimage.png)

   *Navigation tip: You can switch the Realtek webpage language using the globe menu in the top-right corner, then scroll to **Unix (Linux)** and click the download icon next to **`2.5G Ethernet LINUX driver r8125 for kernel up to 6.12`**.*

2. **Extract the driver archive**: Transfer the downloaded archive to the Jetson board, extract it, and enter the extracted directory (adjust the version number to match the downloaded release):

   ```bash
   tar -xvf r8125-9.016.01.tar.bz2
   cd r8125-9.016.01
   ```

3. **Run the automated build and installation script**:

   ```bash
   sudo bash autorun.sh
   ```

4. **Reboot and verify the 2.5GbE interface**: Reboot the board (`sudo reboot`) and check that `driver=r8125` is bound:

   ```bash
   sudo lshw -C network
   ```

   Expected output:

   ```text
     *-network
          description: Ethernet interface
          product: RTL8125 2.5GbE Controller
          vendor: Realtek Semiconductor Co., Ltd.
          physical id: 0
          bus info: pci@0007:01:00.0
          logical name: eth1
          version: 05
          serial: 86:b1:ce:38:66:80
          size: 1Gbit/s
          capacity: 2500Mbit/s
          width: 64 bits
          clock: 33MHz
          capabilities: pm msi pciexpress msix vpd bus_master cap_list ethernet physical tp 10bt 10bt-fd 100bt 100bt-fd 1000bt-fd 2500bt-fd autonegotiation
          configuration: autonegotiation=on broadcast=yes driver=r8125 driverversion=9.016.01-NAPI duplex=full ip=10.0.0.191 latency=0 link=yes multicast=yes port=twisted pair
          resources: irq:59 ioport:200000(size=256) memory:3228000000-322800ffff memory:3228010000-3228013fff
   ```

## 3. Verify PCI ID and Active Driver

For quick diagnostics, combine `lspci -nnk` and `ip -br link` to inspect the hardware PCI ID, active `Kernel driver in use`, and link state in one view:

```bash
lspci -nnk | grep -A3 -i net
ip -br link
```

The screenshot below shows out-of-the-box detection of a Realtek `RTL8852CE` wireless card and an onboard `RTL8111/8168` Gigabit Ethernet controller on JetPack 7.2.1:

![Checking network PCI IDs, loaded kernel drivers, and link status](/img/network-01-driver-loaded.webp)
