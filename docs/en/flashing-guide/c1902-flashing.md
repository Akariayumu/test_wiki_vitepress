---
title: Flash the C1902
---

# Flash the C1902

This guide explains how to flash the system onto the **C1902 carrier board**. C1902 is developed from the reference design and is fully compatible with the Developer Kit firmware.

:::tip Before You Start
- Ubuntu VM and SDK Manager installed (see the [installation guide](/en/flashing-guide/ubuntu-sdkmanager))
- A USB Type-C cable capable of data transfer
- C1902 carrier board + Jetson Orin Nano/NX module
:::

## 1. Enter Recovery Mode

The C1902 enters recovery mode through the **12-pin debug header**.

![C1902 Recovery Mode](/img/wiki-0q7a9416.jpg)

Steps:

1. Disconnect the C1902 power.
2. Use a jumper cap to short the **FC REC** and **GND** pins.
3. Connect the power.
4. Connect the C1902 to the VM with a USB Type-C cable.
5. Remove the jumper cap.

## 2. Detect the Device

Run in the Ubuntu terminal:

```bash
lsusb | grep -i nvidia
```

![C1902 Detect Device](/img/wiki-14.png)

If an NVIDIA device is detected, recovery mode was entered successfully.

## 3. Flash with SDK Manager

Open SDK Manager and select the corresponding module model (Orin Nano or Orin NX).

![C1902 Select Hardware](/img/wiki-B3Uimage.png)

:::warning Note
The C1902 is fully compatible with the Developer Kit firmware and can be flashed directly with the official JetPack.
:::

Uncheck Host Machine and keep only Target Hardware.

![C1902 Configure Options](/img/wiki-15.png)

After selecting the JetPack version, start the flashing flow.

![C1902 JetPack](/img/wiki-3k6image.png)

In the flashing configuration window, select the storage medium and system version.

![C1902 Flashing Configuration](/img/wiki-XjOimage.png)

Click Flash to start and wait for it to finish.

![C1902 Flashing](/img/wiki-JBF12.png)

## 4. Finish

After flashing, the C1902 reboots automatically into the system. The first boot requires initial system configuration.

![C1902 Complete](/img/wiki-7.png)

:::tip First Boot Configuration
- Select language, time zone, and keyboard layout
- Set a username and password
- Once done, you reach the Ubuntu desktop
:::

## Troubleshooting

### Cannot Enter Recovery Mode

- Confirm the FC REC and GND pins are shorted correctly
- Confirm the power supply is working
- Check that the USB Type-C cable is a data cable

### SDK Manager Cannot Detect the Device

- In VMware, confirm the USB device is connected to the VM
- Run lsusb to confirm the device is detected
- Try a different USB port

### Flashing Failed

- Ensure enough disk space
- Keep the USB connection stable during flashing
- Re-enter recovery mode and retry

## Next Steps

- [C1902 Introduction](/en/c1902/c1902)

> Source: [Kytech (Guangzhou) Co., Ltd — LinkZee Labs](https://www.linkzeelabs.com/wiki/books/flashing)
