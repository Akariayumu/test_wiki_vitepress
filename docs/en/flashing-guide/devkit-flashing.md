---
title: Flash the Official Developer Kit
---

# Flash the Official Developer Kit

This guide explains how to use **SDK Manager** to flash the system onto an **NVIDIA official Developer Kit**.

:::tip Scope
This tutorial applies to the **Jetson Orin Nano/NX official Developer Kit**. For third-party carrier boards (C1901/C1902/C2401), refer to the corresponding flashing guides.
:::

## 1. Enter Recovery Mode

Before flashing, put the module into **Recovery Mode**.

![Enter Recovery Mode](/img/wiki-0q7a9416.webp)

Steps:

1. Disconnect the power.
2. Use a jumper cap to short the **FC REC** and **GND** pins (or hold the Recovery button).
3. Connect the power, hold for 2 seconds, then release.
4. Connect the module to the virtual machine with a USB cable.

## 2. Detect the Device

Run the following command in the Ubuntu terminal to confirm the device is detected:

```bash
lsusb | grep -i nvidia
```

![Detect Device](/img/wiki-14.png)

If you see NVIDIA-related devices, recovery mode was entered successfully and the VM has captured the USB device.

## 3. Flash with SDK Manager

Open SDK Manager, log in, and select the corresponding hardware model.

![Select Hardware](/img/wiki-B3Uimage.png)

Uncheck **Host Machine** and keep only **Target Hardware**.

![Configure Flashing Options](/img/wiki-15.png)

Select the JetPack version; the latest stable release is recommended.

![Select JetPack Version](/img/wiki-3k6image.png)

Proceed to the flashing flow, accept the license agreement, and start downloading and flashing the system.

![Start Flashing](/img/wiki-XjOimage.png)

In the flashing configuration window that pops up, choose the manual setup mode.

![Flashing Configuration](/img/wiki-JBF12.png)

Choose the storage medium (such as NVMe or eMMC) and set a username and password.

![Set Storage and Account](/img/wiki-ftEimage.png)

Click Flash to start flashing the system and wait for it to finish.

![Flash System](/img/wiki-6.png)

After flashing, the module reboots automatically into the system.

![Flashing Complete](/img/wiki-7.webp)

## Troubleshooting

### Device Not Detected

- Confirm recovery mode was entered correctly
- Check that the USB cable is a data cable (not charge-only)
- In VMware, confirm the USB device is connected to the VM (VM > Removable Devices)
- Try a different USB port or cable

### Flashing Interrupted or Failed

- Ensure the VM has enough disk space (≥ 60GB)
- Disable the VM's power-saving/sleep settings
- Do not disconnect USB during flashing
- Re-enter recovery mode and retry

### Choosing a Storage Medium

- **NVMe SSD**: Fast and high-capacity — recommended
- **eMMC**: Onboard storage, fixed capacity
- **SD card**: Supported only on some models

## Next Steps

- [Flash the C1901](/en/flashing-guide/c1901-flashing)
- [Flash the C1902](/en/flashing-guide/c1902-flashing)
- [Flash the C2401](/en/flashing-guide/c2401-flashing)

> Source: [Kytech (Guangzhou) Co., Ltd — LinkZee Labs](https://www.linkzeelabs.com/wiki/books/flashing)
