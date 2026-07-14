---
title: 安装jtop
outline: deep
---

# 安装jtop

jtop 是英伟达专为 **Jetson 系列边缘计算设备**开发的**交互式系统监控工具**。

## 1 安装jtop

- 安装jtop需要的依赖库

```shell
sudo apt update
sudo apt install python3
sudo apt install python3-pip
```

- 安装jtop

```
sudo pip3 install -U pip -i https://pypi.tuna.tsinghua.edu.cn/simple
sudo pip3 install jetson-stats -i https://pypi.tuna.tsinghua.edu.cn/simple
sudo systemctl restart jtop.service
```

## 2 jtop的使用

- 安装完成后在控制台中输入jtop打开主界面

![image.png](/img/wiki-YiKimage.png)

2.1 监视各个模块的工作信息

2.2 控制风扇

![1.png](/img/wiki-x711.png)

2.3 查看内置软件信息

![image.png](/img/wiki-L3Timage.png)
