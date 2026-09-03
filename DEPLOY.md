# 部署说明

本 wiki 有**两个部署目标**，base 路径不同，构建方式也不同。

## 1. GitHub Pages（自动）

`main` 分支每次 push 由 `.github/workflows/deploy.yml` 自动构建部署。

- base 使用默认值 `/test_wiki_vitepress/`（仓库名子路径）
- 无需手动操作，也**不要**在 workflow 里设置 `DEPLOY_BASE`

## 2. 自托管服务器（手动）

服务器 `8.138.149.15`，站点根目录 `/var/www/linkzee-wiki/`。

- `www.linkzeelabs.com/wiki-new/`（前端机 47.113.114.54）**保留 `/wiki-new/` 前缀**反代到
  8.138.149.15 的 1234 端口，因此必须用 `DEPLOY_BASE=/wiki-new/` 构建，并且文件要在
  `/var/www/linkzee-wiki/wiki-new/` 子目录里真实存在一份。

### ⚠️ 关键：构建时必须带 `DEPLOY_BASE=/wiki-new/`

```bash
# 1. 构建
DEPLOY_BASE=/wiki-new/ npm run docs:build

# 2. 同步两份：根目录一份（供直接访问 1234），wiki-new/ 子目录一份（供反代）
rsync -avz --delete --exclude '/wiki-new/' docs/.vitepress/dist/ root@8.138.149.15:/var/www/linkzee-wiki/
rsync -avz --delete docs/.vitepress/dist/ root@8.138.149.15:/var/www/linkzee-wiki/wiki-new/
```

部署后验证：

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://www.linkzeelabs.com/wiki-new/   # 期望 200
curl -s https://www.linkzeelabs.com/wiki-new/ | grep -o '<title>[^<]*'           # 期望 LinkZee Wiki 而非 404
```

浏览器若仍显示旧内容，`Ctrl+Shift+R` 强刷清缓存。

## base 路径机制

`docs/.vitepress/config.mts`：

```js
base: process.env.DEPLOY_BASE || '/test_wiki_vitepress/',
```

- 不设变量 → `/test_wiki_vitepress/`（GitHub Pages）
- `DEPLOY_BASE=/wiki-new/` → 自托管服务器（经 `/wiki-new/` 前缀反代）

## nginx 配置参考

`/etc/nginx/sites-enabled/linkzee-wiki`：

```nginx
server {
    listen 1234;
    listen [::]:1234;
    server_name _;
    root /var/www/linkzee-wiki;
    index index.html;
    location / {
        try_files $uri $uri.html $uri/ /404.html;
    }
}
```
