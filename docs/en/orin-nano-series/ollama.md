---
title: Installing and Using Ollama
outline: deep
---

# Installing and Using Ollama

## 1. Run the following command to install Ollama

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

## 2. Verify the installation

```
jetson@jetson-desktop:~$ ollama -v
ollama version is 0.9.6
```

## 3. Download and run the deepseek-r1 1.5b model

```bash
ollama run deepseek-r1:1.5b
```

![image.png](/img/ollama-run.png)
