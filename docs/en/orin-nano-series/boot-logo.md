---
title: Custom Boot Logo
outline: deep
---

# Custom Boot Logo

At power-on, the development board enters UEFI to boot the system, during which the default NVIDIA logo background is displayed. If you need to customize this image, follow the steps below to obtain the UEFI source code, replace the image content, recompile UEFI, and flash it to the development board.

## 1. Install the Docker Environment

If Docker is already installed, you can skip this step, but make sure the current user has been added to the `docker` user group

```bash
sudo apt install docker.io
```

Add the current user to the `docker` user group, then reboot for it to take effect

```bash
sudo usermod -a -G docker ${USER}
sudo reboot
```

Set the variables

```bash
export EDK2_DEV_IMAGE="ghcr.io/tianocore/containers/ubuntu-22-dev:latest"
export EDK2_USER_ARGS="-v \"${HOME}\":\"${HOME}\" -e EDK2_DOCKER_USER_HOME=\"${HOME}\""
export EDK2_BUILD_ROOT="/build"
export EDK2_BUILDROOT_ARGS="-v \"${EDK2_BUILD_ROOT}\":\"${EDK2_BUILD_ROOT}\""
alias edk2_docker="docker run -it --rm -w \"\$(pwd)\" ${EDK2_BUILDROOT_ARGS} ${EDK2_USER_ARGS} \"${EDK2_DEV_IMAGE}\""
```

Pull and verify the environment

```bash
edk2_docker echo hello
```

![image.png](/img/boot-logo-docker.png)

## 2. Pull the Source Code

Initialize the edk2 environment

```bash
edk2_docker init_edkrepo_conf
edk2_docker edkrepo manifest-repos add nvidia https://github.com/NVIDIA/edk2-edkrepo-manifest.git main nvidia
```

Pull the UEFI source code according to the JetPack version (using **JetPack 6.2.1** / **r36.4.4** as an example)

```bash
edk2_docker edkrepo clone nvidia-uefi-r36.4.4 NVIDIA-Platforms r36.4.4-updates
```

This process syncs multiple git projects and may take a long time.

After the sync is complete, you can find the default LOGO files in the following directory

```bash
cd nvidia-uefi-r36.4.4/edk2-nvidia/Silicon/NVIDIA/Assets/
```

![image.png](/img/boot-logo-assets.png)

You can either directly replace the images at these three resolutions, or change the referenced LOGO file paths in the configuration file below

```bash
cd nvidia-uefi-r36.4.4/edk2-nvidia/Platform/NVIDIA/NVIDIA.fvmain.fdf.inc
```

![image.png](/img/boot-logo-config.png)

::: warning
Keep the file size as small as possible. The final compiled uefi_xxx.bin **must not exceed 3.5MB**, otherwise the development board will fail to boot after flashing.
:::

## 3. Compile

After the replacement is complete, run the following commands to compile the UEFI firmware

```bash
cd nvidia-uefi-r36.4.4/
edk2_docker edk2-nvidia/Platform/NVIDIA/Jetson/build.sh
```

![image.png](/img/boot-logo-build.png)

## 4. Replace

## 5. Flash
