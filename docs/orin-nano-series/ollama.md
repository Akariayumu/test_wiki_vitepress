---
title: 安装使用ollama
outline: deep
---

# 安装使用ollama

## 1. 运行以下指令安装ollama

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

## 2. 检查是否正确安装

```
jetson@jetson-desktop:~$ ollama -v
ollama version is 0.9.6
```

## 3. 下载并运行deepseek-r1 1.5b模型

```bash
ollama run deepseek-r1:1.5b
```

![image.png](/img/ollama-run.png)
