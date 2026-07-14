---
title: 自定义启动LOGO
outline: deep
---

开机时，开发板会进入UEFI引导系统启动，期间会显示NVIDIA默认的LOGO背景，如果您需要自定义该图片，需要按照以下操作获取UEFI源码替换图片内容重新编译UEFI并刷入到开发板中。

## 一、安装docker环境

如果已安装docker可以跳过此步骤，但要确保当前用户添加到docker 用户组

```shell
sudo apt install docker.io
```

将当前用户添加到docker 用户组后重启生效

```shell
sudo usermod -a -G docker ${USER}
sudo reboot
```

设置变量

```shell
export EDK2_DEV_IMAGE="ghcr.io/tianocore/containers/ubuntu-22-dev:latest"
export EDK2_USER_ARGS="-v \"${HOME}\":\"${HOME}\" -e EDK2_DOCKER_USER_HOME=\"${HOME}\""
export EDK2_BUILD_ROOT="/build"
export EDK2_BUILDROOT_ARGS="-v \"${EDK2_BUILD_ROOT}\":\"${EDK2_BUILD_ROOT}\""
alias edk2_docker="docker run -it --rm -w \"\$(pwd)\" ${EDK2_BUILDROOT_ARGS} ${EDK2_USER_ARGS} \"${EDK2_DEV_IMAGE}\""
```

拉取并验证环境

```shell
edk2_docker echo hello
```

![image](/img/wiki-2rmimage.png)

## 二、拉取源码

初始化edk2环境

```shell
edk2_docker init_edkrepo_conf
edk2_docker edkrepo manifest-repos add nvidia https://github.com/NVIDIA/edk2-edkrepo-manifest.git main nvidia
```

根据JetPack版本拉取uefi源码 (以 **JetPack6.2.1**/**r36.4.4** 为例)

```shell
edk2_docker edkrepo clone nvidia-uefi-r36.4.4 NVIDIA-Platforms r36.4.4-updates
```

该过程会同步多个git项目，可能耗时较长。

同步完成后可以在以下目录找到默认的LOGO文件

```shell
cd nvidia-uefi-r36.4.4/edk2-nvidia/Silicon/NVIDIA/Assets/
```

![image](/img/wiki-UKyimage.png)

您可以选择直接替换掉这三个分辨率的图片，也可以在下面的配置文件中更改引用的LOGO文件路径

```shell
cd nvidia-uefi-r36.4.0/edk2-nvidia/Platform/NVIDIA/NVIDIA.fvmain.fdf.inc
```

![image](/img/wiki-F9Eimage.png)

应该尽可能地控制文件大小，最后的编译出的uefi_xxx.bin**不得超过3.5MB**，否则刷入后开发板将无法启动。

## 三、编译

替换完成后，执行以下命令编译UEFI固件

```shell
cd nvidia-uefi-r36.4.4/
edk2_docker edk2-nvidia/Platform/NVIDIA/Jetson/build.sh
```

![image](/img/wiki-j8Uimage.png)

## 四、替换

## 五、刷入
