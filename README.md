# Dmark

内部 Markdown API 文档浏览器。第一版只包含单管理员密码、项目管理、Markdown 上传、历史版本和不可猜分享链接。

## 本地运行

```bash
npm install
npm run prisma:deploy
npm run dev
```

本地 `.env` 已给出可用默认值：

```env
ADMIN_PASSWORD=local-test-password
SESSION_SECRET=local-dev-session-secret-for-dmark
DATABASE_URL=file:../data/dmark.db
```

`DATABASE_URL` 使用 `file:../data/dmark.db` 是因为 Prisma 的 SQLite 相对路径按 `prisma/schema.prisma` 所在目录解析。

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
DATABASE_URL=file:../data/dmark.db
```

把 `data/` 目录放在持久化磁盘上，并定期备份 SQLite 数据库。

## 同步源码到服务器

```bash
scripts/sync-to-server.sh root@example.com
scripts/sync-to-server.sh deploy@example.com /data/dmark
```

默认同步到服务器的 `/data/dmark`。脚本会排除 `.env`、`node_modules/`、`.next/` 和本地 SQLite 数据库。

需要指定 SSH 端口或密钥时：

```bash
SSH_OPTS="-p 2222 -i ~/.ssh/id_ed25519" scripts/sync-to-server.sh deploy@example.com
```

预览同步内容：

```bash
DRY_RUN=1 scripts/sync-to-server.sh deploy@example.com
```
