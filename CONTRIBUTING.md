# Contributing

感谢你考虑参与 MarkAPI。

## 本地开发

```bash
npm install
npm run prisma:deploy
npm run dev
```

本项目使用 npm 脚本。请不要提交 pnpm、yarn 或 bun 相关锁文件，除非维护者明确决定迁移工作流。

## 提交前检查

```bash
npm run lint
npm run build
```

涉及 Prisma schema 的改动，还需要提交对应 migration，并确认：

```bash
npm run prisma:generate
```

## Pull Request

- 一个 PR 只解决一个清晰问题。
- 优先提交小改动，避免把功能、重构和格式化混在一起。
- UI 改动请附截图或说明验证过的页面。
- 新功能需要说明用户场景和部署影响。
