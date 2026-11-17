---
title: USB 配置说明
outline: deep
---

# USB 配置说明

在 Jetson Orin Nano / NX 上刷入 NVIDIA 官方纯净系统后，安装与当前 **JetPack 版本**及**核心卡型号**严格匹配的设备树（DTB），可使控元 **C1901、C1902、C1902 V2、C1903、C2401** 载板上的全部 USB 3.2 高速端口及 USB Type-C 接口正常工作（包括 C1901 的 3 路 USB 3.2、C1902 / C1902 V2 的 4 路 USB 3.2 与 Type-C、C1903 核心卡直出的 10Gbps USB 3.2 端口与 Type-C，以及 C2401 背面 30-pin 排母的扩展 USB 3.0 通道）。

本文使用的预编译 DTB 与版本映射来自开源仓库 [Akariayumu/board_dts](https://github.com/Akariayumu/board_dts/tree/master/orin-nano-nx-usb-config)。本文所有命令均在 **Jetson 开发板终端**执行。

::: danger 操作前必读
- **严禁跨版本或跨型号混用**：DTB 文件与 JetPack 版本、核心卡型号严格绑定，混用会导致外设异常或系统无法启动。
- **提前备份与准备恢复环境**：写错 DTB 或 `/boot/extlinux/extlinux.conf` 启动配置可能导致无法开机。操作前请务必备份重要数据与原配置文件，并准备好可进入 Force Recovery 模式的刷机电脑与数据线。
- **未列出的组合切勿替代**：下表仅列出 `board_dts` 仓库中已验证的组合。表格中的 `—` 表示仓库暂未提供对应文件，请勿拿其他版本或其他核心卡的 DTB 替代。
:::

## 1. 确认核心卡和系统版本

在 Jetson 开发板终端执行以下命令，确认当前核心卡型号与 L4T 系统版本：

```bash
cat /proc/device-tree/model; echo
head -1 /etc/nv_tegra_release
```

系统版本与设备树文件对应关系如下：

| JetPack 版本 | L4T 版本 | Orin Nano 4GB | Orin Nano 8GB | Orin NX 8GB | Orin NX 16GB |
| --- | --- | --- | --- | --- | --- |
| 5.1.4 | R35.6.0 | `kernel_tegra234-p3767-0004-p3768-0000-a0.dtb` | `kernel_tegra234-p3767-0003-p3768-0000-a0.dtb` | `kernel_tegra234-p3767-0001-p3768-0000-a0.dtb` | `kernel_tegra234-p3767-0000-p3768-0000-a0.dtb` |
| 5.1.5 (SUPER) | R35.6.1 | `kernel_tegra234-p3767-0004-super-p3768-0000-a0.dtb` | `kernel_tegra234-p3767-0003-super-p3768-0000-a0.dtb` | `kernel_tegra234-p3767-0001-super-p3768-0000-a0.dtb` | `kernel_tegra234-p3767-0000-super-p3768-0000-a0.dtb` |
| 6.2 | R36.4.3 | `orin_nano_4g.dtb` | `orin_nano_8g.dtb` | `orin_nx_8g.dtb` | `orin_nx_16g.dtb` |
| 7.2 | R39.x | — | `orin_nano_8gb.dtb` | — | — |

::: tip 尚未刷入官方系统？
若尚未安装对应版本的 JetPack 系统，请先参阅 [安装 Ubuntu 虚拟机和 SDK Manager](/flashing-guide/ubuntu-sdkmanager) 及对应载板的刷机教程。
:::

## 2. 下载设备树仓库

开发板正常启动并联网后，在 **Jetson 开发板终端**克隆设备树仓库：

```bash
git clone https://github.com/Akariayumu/board_dts.git
cd board_dts/orin-nano-nx-usb-config
```

第 3 节中的各分支命令均假设当前工作目录位于 `board_dts/orin-nano-nx-usb-config`。

## 3. 安装对应版本的设备树

::: warning 四选一执行（切勿全部顺序执行）
以下 **3.1 ~ 3.4** 分别对应四个不同的 JetPack 版本。**请根据第 1 节确认的系统版本，仅选择匹配的单个子节执行**，完成后直接跳至 [第 4 节 验证 USB 3.2](#_4-验证-usb-3-2)。

此外请注意：替换整包 DTB 会覆盖此前通过 [Jetson-IO](/orin-nano-series/expansion-header) 生成的定制主 DTB（如 40-pin 引脚复用修改）；若在 `extlinux.conf` 中配置过 CSI 相机等 `FDTOVERLAYS` 行，编辑时请注意保留。
:::

### 3.1 JetPack 5.1.4

JetPack 5.x 会按核心卡 SKU 自动加载 `/boot/dtb/` 目录下的同名文件，因此需备份并替换原同名 DTB：

1. 进入 `jetpack-5.1.4` 目录：

   ```bash
   cd jetpack-5.1.4
   ```

2. 根据实际核心卡型号取消对应一行的注释（**仅设置一个 `dtb` 变量**）：

   ```bash
   # Orin Nano 4GB
   dtb=kernel_tegra234-p3767-0004-p3768-0000-a0.dtb

   # Orin Nano 8GB
   # dtb=kernel_tegra234-p3767-0003-p3768-0000-a0.dtb

   # Orin NX 8GB
   # dtb=kernel_tegra234-p3767-0001-p3768-0000-a0.dtb

   # Orin NX 16GB
   # dtb=kernel_tegra234-p3767-0000-p3768-0000-a0.dtb
   ```

3. 校验文件存在、备份原 DTB 后安装并重启：

   ```bash
   test -f "$dtb" || { echo "找不到 $dtb"; exit 1; }
   test -f "/boot/dtb/$dtb" || { echo "系统中找不到 /boot/dtb/$dtb"; exit 1; }
   sudo cp -a "/boot/dtb/$dtb" "/boot/dtb/$dtb.backup-$(date +%Y%m%d-%H%M%S)"
   sudo install -o root -g root -m 0644 "$dtb" "/boot/dtb/$dtb"
   sudo reboot
   ```

### 3.2 JetPack 5.1.5 (SUPER)

1. 进入 `jetpack-5.1.5-super` 目录：

   ```bash
   cd jetpack-5.1.5-super
   ```

2. 根据实际核心卡型号取消对应一行的注释（**仅设置一个 `dtb` 变量**）：

   ```bash
   # Orin Nano 4GB
   dtb=kernel_tegra234-p3767-0004-super-p3768-0000-a0.dtb

   # Orin Nano 8GB
   # dtb=kernel_tegra234-p3767-0003-super-p3768-0000-a0.dtb

   # Orin NX 8GB
   # dtb=kernel_tegra234-p3767-0001-super-p3768-0000-a0.dtb

   # Orin NX 16GB
   # dtb=kernel_tegra234-p3767-0000-super-p3768-0000-a0.dtb
   ```

3. 备份原 DTB、安装新文件并重启：

   ```bash
   test -f "$dtb" || { echo "找不到 $dtb"; exit 1; }
   test -f "/boot/dtb/$dtb" || { echo "系统中找不到 /boot/dtb/$dtb"; exit 1; }
   sudo cp -a "/boot/dtb/$dtb" "/boot/dtb/$dtb.backup-$(date +%Y%m%d-%H%M%S)"
   sudo install -o root -g root -m 0644 "$dtb" "/boot/dtb/$dtb"
   sudo reboot
   ```

### 3.3 JetPack 6.2

JetPack 6.2 需将新 DTB 复制至 `/boot/dtb/`，并在 `/boot/extlinux/extlinux.conf` 的 `LABEL primary` 启动项中显式指定 `FDT` 路径：

1. 进入 `jetpack-6.2` 目录：

   ```bash
   cd jetpack-6.2
   ```

2. 根据实际核心卡型号取消对应一行的注释（**仅设置一个 `dtb` 变量**）：

   ```bash
   # Orin Nano 4GB
   dtb=orin_nano_4g.dtb

   # Orin Nano 8GB
   # dtb=orin_nano_8g.dtb

   # Orin NX 8GB
   # dtb=orin_nx_8g.dtb

   # Orin NX 16GB
   # dtb=orin_nx_16g.dtb
   ```

3. 安装 DTB 并备份启动配置文件后打开编辑器：

   ```bash
   test -f "$dtb" || { echo "找不到 $dtb"; exit 1; }
   sudo install -o root -g root -m 0644 "$dtb" "/boot/dtb/$dtb"
   sudo cp -a /boot/extlinux/extlinux.conf \
     "/boot/extlinux/extlinux.conf.backup-$(date +%Y%m%d-%H%M%S)"
   sudo nano /boot/extlinux/extlinux.conf
   ```

4. 在 `LABEL primary` 段落中配置 `FDT` 指向刚安装的 `/boot/dtb/<实际文件名>`：
   - **若 `LABEL primary` 下已有 `FDT` 行**（例如此前运行过 `jetson-io.py`），请**直接替换该行的路径**，切勿保留两行 `FDT`；
   - **若尚无 `FDT` 行**，则在 `APPEND` 行下方新增一行 `FDT`；
   - **严禁修改或复制其他机器的 `APPEND` 内容**（每台设备的 `root=PARTUUID=...` 均不相同）。

   ```text
   LABEL primary
         MENU LABEL primary kernel
         LINUX /boot/Image
         INITRD /boot/initrd
         APPEND ...保留本机原有内容，切勿修改...
         FDT /boot/dtb/orin_nano_4g.dtb
   ```

5. 将示例中的 `orin_nano_4g.dtb` 换为您实际选择的 `$dtb` 文件名。保存退出后核对配置并重启：

   ```bash
   grep -A8 -E '^LABEL[[:space:]]+primary$' /boot/extlinux/extlinux.conf
   sudo reboot
   ```

### 3.4 JetPack 7.2

`board_dts` 当前仅提供并验证了 **Orin Nano 8GB**（文件名 `orin_nano_8gb.dtb`）。其他核心卡型号请等待仓库更新，切勿混用 JetPack 6.2 的 DTB。

1. 安装 DTB 并备份、编辑 `extlinux.conf`：

   ```bash
   cd jetpack-7.2
   dtb=orin_nano_8gb.dtb
   test -f "$dtb" || { echo "找不到 $dtb"; exit 1; }
   sudo install -o root -g root -m 0644 "$dtb" "/boot/dtb/$dtb"
   sudo cp -a /boot/extlinux/extlinux.conf \
     "/boot/extlinux/extlinux.conf.backup-$(date +%Y%m%d-%H%M%S)"
   sudo nano /boot/extlinux/extlinux.conf
   ```

2. 在 `LABEL primary` 段落中设置 `FDT`（若已有 `FDT` 行则直接替换路径，避免重复两行 `FDT`；保持原 `APPEND` 行不变）：

   ```text
         FDT /boot/dtb/orin_nano_8gb.dtb
   ```

3. 保存退出后检查配置并重启：

   ```bash
   grep -A8 -E '^LABEL[[:space:]]+primary$' /boot/extlinux/extlinux.conf
   sudo reboot
   ```

## 4. 验证 USB 3.2

重启进入系统后，在各 USB 3.2 端口插入支持 USB 3.x 的外设（如高速 U 盘或移动固态硬盘），在终端查看 USB 拓扑树：

```bash
lsusb -t
```

速率末尾显示 `5000M`（5Gbps）或 `10000M`（10Gbps）即表明设备已正常协商至 USB 3.2 SuperSpeed 链路；若仅显示 `480M` 则仍处于 USB 2.0 模式。

![使用 lsusb -t 验证 USB SuperSpeed 链路速率](/img/usb-01-superspeed-verification.webp)

若外设未被识别，可查看内核 USB 控制器日志辅助排查：

```bash
sudo dmesg | grep -i -e xusb -e tegra-xudc
```

## 5. 配置 USB Type-C Device 模式

查看当前 USB Type-C 端口的主从角色状态：

```bash
cat /sys/class/usb_role/usb2-0-role-switch/role
```

如需手动临时切换为 `device`（从机）模式（重启后失效）：

```bash
sudo bash -c 'echo device > /sys/class/usb_role/usb2-0-role-switch/role'
```

处于 `device` 模式并连接电脑后，Type-C 接口可提供虚拟串口、固定地址为 `192.168.55.1` 的虚拟网卡（详见 [通过 USB Type-C 连接 SSH](/orin-nano-series/connect-jetson#_3-通过-usb-type-c-连接-ssh)），以及 Linux / macOS 宿主机上的 NCM 联网功能。

如需设置每次开机自动切换为 `device` 模式，可在备份后修改 NVIDIA 启动脚本：

```bash
sudo cp -a /opt/nvidia/l4t-usb-device-mode/nv-l4t-usb-device-mode-start.sh \
  /opt/nvidia/l4t-usb-device-mode/nv-l4t-usb-device-mode-start.sh.backup
sudo sed -i 's#exit 0#echo device > /sys/class/usb_role/usb2-0-role-switch/role\nexit 0#g' \
  /opt/nvidia/l4t-usb-device-mode/nv-l4t-usb-device-mode-start.sh
```

## 6. 故障恢复

- **JetPack 5.x**：恢复 `/boot/dtb/` 目录下带时间戳备份的同名 `.backup-*` 文件；若系统无法引导进入终端，请进入 Force Recovery 模式重新刷机。
- **JetPack 6.2 / 7.2**：在开机 UEFI / extlinux 引导阶段通过调试串口或键盘选择备用启动项进入系统，将 `/boot/extlinux/extlinux.conf` 恢复为带时间戳的备份文件（或删除新增的 `FDT` 行）并重启。
- **USB Type-A 正常但 Type-C 连接电脑无反应**：确认使用的是支持数据传输的 USB 线缆、检查 `/sys/class/usb_role/usb2-0-role-switch/role` 是否存在，并重新执行第 5 节的 `device` 角色切换命令。
