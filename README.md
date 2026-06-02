# MarkAPI

自托管 Markdown API 文档浏览器。第一版只包含单管理员密码、项目管理、Markdown 上传、历史版本和不可猜分享链接。

## 快速开始

```bash
cp .env.example .env
docker compose up -d
```

启动前请先编辑 `.env`，至少设置 `ADMIN_PASSWORD` 和 `SESSION_SECRET`。默认服务地址是 `http://localhost:3000`。

如果直接通过 HTTP 访问管理后台，保留：

```env
ALLOW_INSECURE_ADMIN_COOKIE=1
```

正式部署到 HTTPS 后，改回：

```env
ALLOW_INSECURE_ADMIN_COOKIE=0
```

## 本地运行

```bash
npm install
npm run prisma:deploy
npm run dev
```

本地 `.env` 已给出可用默认值：

```env
ADMIN_PASSWORD=local-test-password
SESSION_SECRET=local-dev-session-secret-for-markapi
DATABASE_URL=file:../data/markapi.db
```

`DATABASE_URL` 使用 `file:../data/markapi.db` 是因为 Prisma 的 SQLite 相对路径按 `prisma/schema.prisma` 所在目录解析。

## 生产部署

```bash
npm install
npm run prisma:deploy
npm run build
npm start
```

生产环境必须覆盖这些变量：

```env
NODE_ENV=production
ADMIN_PASSWORD=strong-password
SESSION_SECRET=random-long-secret
DATABASE_URL=file:../data/markapi.db
ALLOW_INSECURE_ADMIN_COOKIE=0
```

如果生产环境必须通过 HTTP 访问，设置 `ALLOW_INSECURE_ADMIN_COOKIE=1`。这会让管理员登录 Cookie 在 HTTP 下可用，但登录凭证会通过明文连接传输，建议只在可信内网或临时环境使用。

把 `data/` 目录放在持久化磁盘上，并定期备份 SQLite 数据库。
