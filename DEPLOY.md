# 部署说明

本 wiki 有**两个部署目标**，base 路径不同，构建方式也不同。

## 1. GitHub Pages（自动）

`main` 分支每次 push 由 `.github/workflows/deploy.yml` 自动构建部署。

- base 使用默认值 `/test_wiki_vitepress/`（仓库名子路径）
- 无需手动操作，也**不要**在 workflow 里设置 `DEPLOY_BASE`

## 2. 自托管 nginx 服务器（手动）

服务器 `154.83.85.36`，nginx 在 **1234** 端口以**根路径**托管，站点根目录 `/var/www/linkzee-wiki/`。

### ⚠️ 关键：构建时必须带 `DEPLOY_BASE=/`

nginx 从根路径提供服务，而默认 base 是 `/test_wiki_vitepress/`。若不覆盖 base，
页面里所有 `/test_wiki_vitepress/assets/...` 资源都会 404，页面变成无样式的裸 HTML。

```bash
# 1. 构建（务必带 DEPLOY_BASE=/）
DEPLOY_BASE=/ npm run docs:build

# 2. 同步到服务器（--delete 会清掉已删除的旧页面）
rsync -avz --delete docs/.vitepress/dist/ root@154.83.85.36:/var/www/linkzee-wiki/
```

部署后验证：

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://154.83.85.36:1234/            # 期望 200
# 首页引用的资源应为 /assets/... 而非 /test_wiki_vitepress/assets/...
```

浏览器若仍显示旧内容，`Ctrl+Shift+R` 强刷清缓存。

## base 路径机制

`docs/.vitepress/config.mts`：

```js
base: process.env.DEPLOY_BASE || '/test_wiki_vitepress/',
```

- 不设变量 → `/test_wiki_vitepress/`（GitHub Pages）
- `DEPLOY_BASE=/` → 根路径（nginx 服务器）

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
