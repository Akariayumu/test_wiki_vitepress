---
title: Install Ubuntu VM and SDK Manager
---

# Install Ubuntu VM and SDK Manager

NVIDIA's official **SDK Manager** is the most common tool for flashing Jetson modules, and it needs to run on **Ubuntu**. This guide explains how to install Ubuntu inside a **VMware virtual machine** and deploy SDK Manager.

:::tip Recommended Setup
- Ubuntu 20.04 or 22.04 (64-bit)
- VM memory ≥ 8GB, disk ≥ 60GB
- Reserve enough USB controllers to detect the module
:::

## 1. Preparation

Download the following software:

| Software | Description |
|----------|-------------|
| VMware Workstation | Virtual machine software (free for personal use) |
| Ubuntu 20.04/22.04 ISO | System image |
| NVIDIA SDK Manager | Downloaded from the NVIDIA website (account required) |

## 2. Install the VMware Virtual Machine

![Install VMware](/img/wiki-snipaste-2025-06-09-14-51-05.png)

Follow the installation wizard to complete the VMware installation, then create a new virtual machine.

![Create VM](/img/wiki-snipaste-2025-06-11-15-21-48.png)

Select the Ubuntu ISO image you downloaded.

![Select ISO](/img/wiki-snipaste-2025-06-11-15-33-59.png)

Set a username and password. Remember this password — you will use it frequently later.

![Configure Account](/img/wiki-snipaste-2025-06-11-15-37-32.png)

Set the VM name and storage location; a disk with plenty of free space is recommended.

![Set Storage Location](/img/wiki-snipaste-2025-06-11-15-38-12.png)

Set the disk capacity to 60GB or more, and choose "Split virtual disk into multiple files".

![Set Disk Capacity](/img/wiki-snipaste-2025-06-11-15-32-12.png)

Click "Customize Hardware" to adjust memory, processors, and other settings.

![Customize Hardware](/img/wiki-snipaste-2025-06-11-15-40-38.png)

Set the memory to 8GB or more, and configure the processors based on your host.

![Set Memory](/img/wiki-snipaste-2025-06-11-15-41-54.png)

When done, power on the virtual machine and begin the Ubuntu installation.

![Power On VM](/img/wiki-snipaste-2025-06-11-15-51-19.webp)

Follow the prompts to complete the Ubuntu installation.

![Ubuntu Installation](/img/wiki-snipaste-2025-06-11-15-58-36.png)

## 3. Install SDK Manager

Once inside Ubuntu, open a terminal and install the SDK Manager deb package you downloaded:

```bash
sudo apt install ./sdkmanager_*.deb
```

![Install SDK Manager](/img/wiki-1.png)

After installation, find and open SDK Manager from the application list.

![Open SDK Manager](/img/wiki-12.png)

Log in with your NVIDIA account (register in advance).

![Log in to SDK Manager](/img/wiki-ZDbimage.webp)

Once logged in, you will see the SDK Manager main screen, ready to start flashing.

![SDK Manager Main Screen](/img/wiki-f6Eimage.webp)

## Next Steps

- [Flash the Official Developer Kit](/en/flashing-guide/devkit-flashing)
- [Flash the C1901](/en/flashing-guide/c1901-flashing)
- [Flash the C1902](/en/flashing-guide/c1902-flashing)
- [Flash the C2401](/en/flashing-guide/c2401-flashing)

> Source: [Kytech (Guangzhou) Co., Ltd — LinkZee Labs](https://www.linkzeelabs.com/wiki/books/flashing)
