---
title: 网卡驱动
outline: deep
---

# 网卡驱动

本文介绍在 Jetson Orin 系列开发板上为外扩 **Intel M.2 无线网卡**与板载/外扩 **Realtek 2.5G 有线网卡（RTL8125）** 安装驱动的方法。本文所有命令均在 **Jetson 开发板终端**执行。

## 1. 无线网卡驱动

在 M.2 Key E 插槽选配无线网卡时，请先根据网卡芯片品牌确认是否需要手动安装驱动：

- **Realtek 无线网卡（免驱）**：如官方套件常见的 `RTL8822CE`、`RTL8852CE` 等芯片，JetPack 内核已自带 `rtw88` / `rtw89` 驱动，开机即可直接使用。
- **Intel 无线网卡（需手动安装 `iwlwifi`）**：自 **JetPack 6** 起，官方镜像移除了旧版自带的 **Intel 8265NGW** 驱动支持；同时若要使用性能更优的 **Intel Wi-Fi 6 AX200 / AX210** 等无线网卡，也需手动安装 `backport-iwlwifi-dkms` 驱动包。

按以下步骤安装 Intel 无线网卡驱动：

1. **断电安装网卡并检查硬件识别状态**：在断电状态下插好 M.2 无线网卡与天线，上电开机后在终端执行：

   ```bash
   sudo lshw -C network
   ```

   若输出中出现 `product: Wi-Fi 6 AX200`（或对应型号）但伴随 **`UNCLAIMED`** 字样，说明 PCIe 硬件已被正常识别，仅缺少内核驱动。

2. **安装 `iwlwifi` 驱动包**：`iwlwifi` 是 Intel 官方维护的 Linux 开源无线网卡驱动（需要先通过有线网口或 USB 共享网络使开发板联网）：

   ```bash
   sudo apt update
   sudo apt install -y backport-iwlwifi-dkms
   ```

3. **重启开发板使驱动加载生效**：

   ```bash
   sudo reboot
   ```

4. **验证无线接口状态**：重启后再次执行检查命令：

   ```bash
   sudo lshw -C network
   ```

   预期输出示例（已分配逻辑网卡名 `wlan0` 且 `driver=iwlwifi`，无 `UNCLAIMED` 标记）：

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

   当 `description` 显示为 `Wireless interface` 且生成 `wlan0`（或 `wlP1p1s0`）接口后，即可正常连接 Wi-Fi。

## 2. 有线网卡驱动（2.5G RTL8125）

各款载板的板载 RJ45 有线网口驱动支持情况如下：

- **板载千兆网口（全部免驱）**：官方开发者套件及控元 **C1901、C1902、C1902 V2、C1903、C2402** 的全部板载千兆网口，以及 **C2401 的千兆网口**（采用 Realtek `RTL8111` 或 Intel `I210` 芯片），JetPack 系统已内置驱动，即插即用。
- **板载 2.5G 网口（需安装 `r8125` 驱动）**：控元 **[C2401](/c2401/c2401)** 双网口中的 **2.5GbE 网口**采用 **Realtek RTL8125** 芯片（以及用户自行通过 M.2 外扩的 RTL8125 网卡），在重刷官方纯净系统后需按以下步骤安装驱动。

::: info 网口指示灯说明
直接安装 Realtek 官网公版驱动时，RJ45 网口状态指示灯闪烁逻辑可能与出厂镜像存在细微差异（不影响 2.5G 数据传输性能）。如需适配指示灯定义的定制驱动包，请联系控元科技技术支持获取。
:::

1. **下载驱动源码包**：访问 [Realtek 官方 Linux 驱动下载页](https://www.realtek.com/Download/ToDownload?type=direct&downloadid=3763)，在 **Unix (Linux)** 栏目下下载 **2.5G Ethernet LINUX driver r8125**（`.tar.bz2` 压缩包）：

   ![在 Realtek 官网下载 2.5G Linux r8125 驱动包](/img/wiki-MIZimage.png)

2. **上传并解压源码包**：将下载的压缩包上传至 Jetson 开发板（或直接在开发板上下载），解压并进入驱动目录（注意将版本号替换为实际下载版本）：

   ```bash
   tar -xvf r8125-9.016.01.tar.bz2
   cd r8125-9.016.01
   ```

3. **执行自动编译与安装脚本**：

   ```bash
   sudo bash autorun.sh
   ```

4. **重启并验证 2.5G 网口状态**：安装完成后可执行 `sudo reboot` 重启开发板，随后检查网卡绑定状态：

   ```bash
   sudo lshw -C network
   ```

   预期输出示例（`driver=r8125` 已成功绑定至 `RTL8125 2.5GbE Controller`）：

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

## 3. 快速核对 PCI ID 与内核驱动

日常排障时，也推荐组合使用 `lspci -nnk` 与 `ip -br link`，一次性确认网卡的硬件 PCI ID、当前生效的 `Kernel driver in use` 以及网络接口启停状态：

```bash
lspci -nnk | grep -A3 -i net
ip -br link
```

下图为 JetPack 7.2.1 实机上免驱识别 Realtek `RTL8852CE` 无线网卡与板载 `RTL8111/8168` 千兆有线网卡的核验示例：

![使用 lspci 与 ip 命令确认网卡 PCI ID、驱动与接口状态](/img/network-01-driver-loaded.webp)
