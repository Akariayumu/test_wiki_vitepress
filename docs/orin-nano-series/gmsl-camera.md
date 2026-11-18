---
title: GMSL 摄像头使用说明
outline: deep
---

# GMSL 摄像头使用说明

本文介绍在搭载 **MAX96724** 四通道 GMSL2 解串转接板的载板（如 [C2402](/c2402/c2402)）上部署 GMSL 摄像头驱动、安装运行依赖及预览测试相机画面的方法。

::: danger 硬件连接安全警告
GMSL2 转接板及 Mini-FAKRA 同轴接口带有 **PoC（Power over Coax，同轴电缆供电）** 电压。**请务必在载板完全断电的状态下安装转接板、锁紧固定螺钉并连接同轴相机线缆，严禁带电热插拔**，以免浪涌损坏解串板 PoC 电路、MAX96724 芯片或相机端加串器。
:::

## 1. 确认系统版本并获取驱动

GMSL 相机驱动与 **核心卡型号（Orin Nano / Orin NX）**、**JetPack（L4T 内核）版本** 以及所接入的 **GMSL 相机模组型号（加串器与 Sensor）** 严格绑定。

请先在 **Jetson 开发板终端**执行以下命令查看当前系统的 L4T 与 JetPack 版本，随后携带核心卡型号、系统版本及相机型号**联系客服获取匹配的 GMSL 驱动包**：

```bash
cat /etc/nv_tegra_release
sudo apt-cache show nvidia-jetpack
```

## 2. 安装前置软件依赖

相机预览工具依赖 NVIDIA OpenCV 与 DeepStream 运行库。请在 **Jetson 开发板终端**执行以下命令完成安装（请将 `6.x` 替换为当前 JetPack 对应的实际 DeepStream 版本号，例如 `deepstream-6.3` 或 `deepstream-7.0`）：

```bash
sudo apt update
sudo apt install -y nvidia-opencv
sudo apt install -y deepstream-6.x
```

## 3. 部署驱动文件

将从客服获取的预编译驱动包上传至 Jetson 开发板并解压，确认其中包含 `bin_copy` 目录。

::: warning 覆盖前建议备份
覆盖操作会更新根文件系统中的内核镜像、设备树或相机驱动文件。建议在执行前先备份 `/boot` 目录下的原有 `Image`、设备树及 `/boot/extlinux/extlinux.conf` 配置文件。
:::

在 **Jetson 开发板终端**将 `bin_copy` 目录下的所有文件覆盖复制至系统根目录，完成后先关机断电（若尚未安装转接板与相机）或直接重启系统生效：

```bash
sudo cp -rfvp ./bin_copy/* /
sudo reboot
```

::: details 附：使用驱动源码包自行编译（可选，在 Ubuntu 宿主机执行）
若从客服获取的是离线驱动源码压缩包（如 JetPack 5.x 等源码构建包），可在 **x86_64 Ubuntu 宿主机终端**按以下步骤交叉编译生成 `bin_copy` 目录：

1. 安装交叉编译所需依赖工具：
   ```bash
   sudo apt update
   sudo apt install -y build-essential flex bison libssl-dev python3
   ```
2. 解压驱动源码压缩包并拉取编译所需的二进制文件（请将压缩包名称替换为实际文件名）：
   ```bash
   tar xvf jetson_rXX.X.X_xxxxx.tar.gz
   cd jetson_rXX.X.X_xxxxx/binaries
   ./get.sh
   ```
3. 根据所搭载的核心卡型号，在当前编译终端设置 `MY_BOARD` 环境变量（关闭终端重新打开后需再次执行，或写入 `~/.bashrc`）：
   ```bash
   # 若搭载 Jetson Orin Nano 核心卡：
   export MY_BOARD=orin_nano

   # 若搭载 Jetson Orin NX 核心卡：
   export MY_BOARD=orin_nx
   ```
4. 编译并签名内核与驱动模块：
   ```bash
   cd ../Linux_for_Tegra/source/public/kernel/mybuild
   ./mybuild_all.sh
   ./mysign.sh
   ```
5. 编译完成后，将当前目录下生成的 `bin_copy/` 文件夹传输至已刷入对应 JetPack 版本的 Jetson 开发板，按上方第 3 节步骤执行 `sudo cp -rfvp ./bin_copy/* /` 覆盖并重启即可。
:::

## 4. 检测与打开相机

1. **硬件检查**：确保载板断电状态下已将 GMSL2 转接板安装到位并锁紧螺钉，Mini-FAKRA 同轴线缆已稳固连接相机，随后接通载板电源启动系统。
2. **确认设备节点**：连接本地显示器进入系统桌面（或配置好图形显示环境），打开 **Jetson 开发板终端**，检查 `/dev/video*` 视频节点是否已正常生成：
   ```bash
   ls /dev/video*
   ```
3. **运行预览程序**：执行随驱动部署的 `run_camera` 命令打开相机实时画面：
   ```bash
   # 不带参数：同时打开全部已接入的 GMSL 相机
   run_camera

   # 指定单路通道（参数 0–3 分别对应第 1–4 路相机，例如打开第 1 路）
   run_camera 0

   # 自定义预览窗口分辨率（例如以 960×540 窗口大小打开）
   WIDTH=960 HEIGHT=540 run_camera
   ```

## 5. 常见问题排查

- **未生成 `/dev/video*` 节点**：
  1. 核对当前系统 `cat /etc/nv_tegra_release` 版本与驱动包的目标版本是否完全一致；
  2. 断电检查 GMSL2 转接板与载板高速板对板连接器是否完全压合到位、Mini-FAKRA 同轴插头是否扣紧；
  3. 检查载板供电功率是否充足（多路 PoC 相机同时供电建议使用 12V 稳压电源并预留充足电流余量）。
- **运行 `run_camera` 报错缺少动态库或无法弹窗**：
  1. 确认已安装第 2 节中的 `nvidia-opencv` 与对应版本的 `deepstream-6.x`；
  2. `run_camera` 需要图形界面渲染窗口，请在连接 HDMI/DP 显示器的本地桌面终端（或远程桌面终端）中运行，纯无头 SSH 终端无法直接弹出视频窗口。
