---
title: Install Ubuntu VM and SDK Manager
outline: deep
---

# Install Ubuntu VM and SDK Manager

NVIDIA's official **SDK Manager** is the standard tool for flashing Jetson modules and installing JetPack SDK components. Because SDK Manager requires an **x86_64 Ubuntu Desktop** host, this guide walks through installing Ubuntu inside a **VMware Workstation Pro** virtual machine on Windows and setting up SDK Manager.

::: tip Recommended Host Setup
- **Native Ubuntu PC**: If you already run a native x86_64 Ubuntu Desktop machine, skip directly to [3. Install and Launch NVIDIA SDK Manager](#_3-install-and-launch-nvidia-sdk-manager).
- **Recommended Ubuntu Version**: **Ubuntu 22.04 LTS Desktop (64-bit)**, which supports both JetPack 6 and JetPack 7.
- **VM Resource Allocation**: Memory **`≥ 8 GB`**, CPU **`≥ 4 cores`**, virtual disk **`≥ 120 GB`** (**`≥ 200 GB`** recommended if you plan to create full NVMe system backups), and an enabled USB controller so the VM can detect the Jetson module in Force Recovery mode.
:::

## 1. Preparation and Version Matrix

Each JetPack generation requires specific host Ubuntu releases. Verify your target JetPack version before downloading an Ubuntu ISO:

| Target JetPack Release | Jetson Target OS | Host Ubuntu Requirement | Notes |
| --- | --- | --- | --- |
| **JetPack 5.1.x** | Ubuntu 20.04 | **Ubuntu 20.04 LTS** | Requires an Ubuntu 20.04 host |
| **JetPack 6.x** | Ubuntu 22.04 | **Ubuntu 20.04 / 22.04 LTS** | **Ubuntu 22.04 LTS** recommended |
| **JetPack 7.x** | Ubuntu 24.04 | **Ubuntu 22.04 / 24.04 LTS** | Ubuntu 20.04 hosts are not supported; devices with UEFI firmware `≥ 36.0` can also use the [JetPack 7 bootable USB ISO installer](/en/flashing-guide/jetpack7-flashing) without a VM |

Download the following official software and images:

| Software / Image | Official Source & Notes |
| --- | --- |
| **VMware Workstation Pro** | Virtual machine hypervisor (free for personal use) — register a Broadcom account and download from the [official VMware Workstation page](https://www.vmware.com/products/desktop-hypervisor/workstation-and-fusion) |
| **Ubuntu Desktop ISO** | Download `ubuntu-22.04.*-desktop-amd64.iso` (or `20.04` for JetPack 5) from [Ubuntu Releases](https://releases.ubuntu.com/) |
| **NVIDIA SDK Manager** | Download the `.deb` Ubuntu package inside the VM from the [official NVIDIA SDK Manager page](https://developer.nvidia.com/sdk-manager) (free NVIDIA Developer account required) |

## 2. Install the VMware Virtual Machine

1. Run the VMware Workstation Pro installer on your Windows host and follow the installation wizard with the default options.

![Run the VMware Workstation Pro installer](/img/wiki-snipaste-2025-06-09-14-51-05.png)

2. Open VMware Workstation Pro and click **File → New Virtual Machine** (`Ctrl+N`).

![Create a new virtual machine](/img/wiki-snipaste-2025-06-11-15-21-48.png)

3. Select **Typical (recommended)** and click **Next**.

![Select Typical configuration](/img/wiki-snipaste-2025-06-11-15-32-12.png)

4. Choose **Installer disc image file (iso)**, browse to the downloaded Ubuntu Desktop ISO (Ubuntu 22.04 LTS recommended; screenshot shows an earlier ISO as an interface example), and click **Next**.

![Select the Ubuntu ISO image](/img/wiki-snipaste-2025-06-11-15-33-59.png)

5. Enter your full name, username, and password (keep this password handy — you will need it for `sudo` commands and flashing), then click **Next**.

![Configure the Ubuntu user account](/img/wiki-snipaste-2025-06-11-15-37-32.png)

6. Set a virtual machine name and choose a storage directory on a host drive with plenty of free space, then click **Next**.

![Set the VM name and storage directory](/img/wiki-snipaste-2025-06-11-15-38-12.png)

7. Set the **Maximum disk size** to **`120 GB` or more** (**`200 GB` or more** if you plan to back up full NVMe firmware images), select **Split virtual disk into multiple files**, and click **Next**.

![Specify virtual disk capacity](/img/wiki-snipaste-2025-06-11-15-40-38.png)

8. On the summary page, click **Customize Hardware...** to allocate **`8 GB` (8192 MB) or more** of memory and 4+ CPU cores based on your host PC, verify that a **USB Controller** is present, and click **Finish**.

![Customize VM hardware and finish creation](/img/wiki-snipaste-2025-06-11-15-41-54.png)

9. Power on the virtual machine and wait for the automated Ubuntu installation to complete.

![Ubuntu automated installation in progress](/img/wiki-snipaste-2025-06-11-15-51-19.webp)

10. Once Ubuntu boots to the desktop, step through or skip the initial welcome prompts.

![Ubuntu desktop welcome wizard](/img/wiki-snipaste-2025-06-11-15-58-36.png)

## 3. Install and Launch NVIDIA SDK Manager

### 3.1 Download the DEB Package

Inside Ubuntu, open Firefox, visit the [NVIDIA SDK Manager page](https://developer.nvidia.com/sdk-manager), and click **`.deb Ubuntu`** to download the installer package into `~/Downloads` (sign in with your NVIDIA Developer account when prompted).

![Download the SDK Manager Ubuntu deb package](/img/wiki-1.png)

### 3.2 Install SDK Manager from the Terminal

Confirm that `sdkmanager_*_amd64.deb` is saved in `~/Downloads`, then open a terminal and install it (`apt install` resolves dependencies automatically):

**Run on the Ubuntu host terminal:**

```bash
cd ~/Downloads
sudo apt update
sudo apt install ./sdkmanager_*.deb
```

![Verify the sdkmanager package in Downloads](/img/wiki-12.png)

### 3.3 Launch and Sign In to SDK Manager

Open **SDKManager** from the Ubuntu application launcher, or start it directly from the terminal:

**Run on the Ubuntu host terminal:**

```bash
sdkmanager
```

![Open SDK Manager from the Ubuntu application grid](/img/wiki-ZDbimage.webp)

Click **LOGIN** on the welcome screen and complete authentication in your browser using your NVIDIA Developer account. Once signed in, SDK Manager opens to the main setup screen and is ready to detect your Jetson board.

![Sign in to NVIDIA SDK Manager](/img/wiki-f6Eimage.webp)

## Next Steps

Choose the flashing guide for your carrier board:

- [Flash Official Developer Kit](/en/flashing-guide/devkit-flashing)
- [Flash C1901](/en/flashing-guide/c1901-flashing)
- [Flash C1902 / C1902 V2](/en/flashing-guide/c1902-flashing)
- [Flash C1903](/en/flashing-guide/c1903-flashing)
- [Flash C2401](/en/flashing-guide/c2401-flashing)
- [Flash JetPack 7 (ISO Installer)](/en/flashing-guide/jetpack7-flashing)
