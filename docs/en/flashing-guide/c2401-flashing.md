---
title: Flash the C2401
---

# Flash the C2401

This guide explains how to flash the system onto the **C2401 Mini Kit**.

:::tip Before You Start
- Ubuntu VM and SDK Manager installed (see the [installation guide](/en/flashing-guide/ubuntu-sdkmanager))
- A USB Type-C cable capable of data transfer
- C2401 Mini Kit
:::

## 1. Enter Recovery Mode

The C2401 enters recovery mode through the **Recovery button** on its side.

![C2401 Recovery Mode](/img/wiki-0q7a2475-1.webp)

Steps:

1. Disconnect the C2401 power.
2. Press and hold the **RECOVERY** button.
3. Connect the power.
4. Connect the C2401 to the VM with a USB Type-C cable.
5. Release the RECOVERY button.

## 2. Detect the Device

Run in the Ubuntu terminal:

```bash
lsusb | grep -i nvidia
```

![C2401 Detect Device](/img/wiki-14.png)

If an NVIDIA device is detected, recovery mode was entered successfully.

## 3. Flash with SDK Manager

Open SDK Manager and select the corresponding module model.

![C2401 Select Hardware](/img/wiki-B3Uimage.png)

:::warning Note
The C2401 is an all-in-one Mini Kit; select the model that matches the built-in module.
:::

Uncheck Host Machine and keep only Target Hardware.

![C2401 Configure Options](/img/wiki-15.png)

After selecting the JetPack version, start the flashing flow.

![C2401 JetPack](/img/wiki-3k6image.png)

In the flashing configuration window, select the storage medium and system version.

![C2401 Flashing Configuration](/img/wiki-XjOimage.png)

Click Flash to start and wait for it to finish.

![C2401 Flashing](/img/wiki-JBF12.png)

## 4. Finish

After flashing, the C2401 reboots automatically into the system.

![C2401 Complete](/img/wiki-7.webp)

:::tip First Boot Configuration
- Select language, time zone, and keyboard layout
- Set a username and password
- Once done, you reach the Ubuntu desktop
:::

## Troubleshooting

### Cannot Enter Recovery Mode

- Confirm the RECOVERY button is pressed firmly
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

- [C2401 Introduction](/en/c2401/c2401)

> Source: [Kytech (Guangzhou) Co., Ltd — LinkZee Labs](https://www.linkzeelabs.com/wiki/books/flashing)
