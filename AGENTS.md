# AGENTS.md

本文件约束在本仓库内工作的自动化编码代理。目标是让后续改动保持小而清晰，优先保护项目稳定性。

## 项目概览

- MarkAPI 是一个内部 Markdown API 文档浏览器。
- 技术栈：Next.js App Router、React、TypeScript、Prisma、SQLite。
- 后台用于项目管理和 Markdown 上传；公开文档页通过不可猜的 `shareToken` 访问。
- 文档浏览页的主要代码在 `app/docs/[token]/page.tsx` 和 `components/docs-*`。

## 常用命令

```bash
npm install
npm run dev
npm run lint
npm run build
npm run prisma:generate
npm run prisma:migrate
npm run prisma:deploy
```

- 本项目使用 `npm` 脚本；不要假设存在 `pnpm` 或 `yarn` 工作流。
- 提交前至少运行 `npm run lint` 和 `npm run build`。
- 本地生产预览使用 `npm run build` 后再 `npm run start`。
- `next start` 不热更新；改完前端样式后，需要重新 build 并重启服务才能验证生产页面。

## 工作原则

- 优先做最小可验证改动。不要为了未来需求提前抽象、分层或引入库。
- 改动必须直接对应用户当前需求。不要顺手重构无关文件。
- 遇到脏工作区时，只处理和当前任务相关的文件。不要回滚用户或其他代理留下的改动。
- 不要使用破坏性命令，例如 `git reset --hard` 或 `git checkout -- <file>`，除非用户明确要求。
- 编辑文件优先使用补丁方式，保持 diff 可读。

## 代码约定

- 组件以函数组件为主，客户端组件显式使用 `"use client"`。
- 复用现有组件和样式命名，避免引入新的设计体系或组件库，除非用户明确要求并确认收益。
- React 状态逻辑保持局部、直接。派生值尽量在 render 中计算，避免无必要的 effect。
- 对 DOM 滚动、复制、搜索、高亮等浏览器行为，只在客户端组件中实现。
- Markdown 解析相关逻辑集中在 `lib/markdown.ts`，不要在组件里重复解析完整 Markdown。
- Prisma 访问集中在服务端页面或 action 中，复用 `lib/prisma.ts`。

## UI 约束

- 文档浏览页是工作型界面，视觉要克制、密度适中、便于扫描。
- Header 内控件不应抢正文和目录的视觉焦点；常态使用弱边框和白底，交互态再强调。
- 目录、搜索、版本切换等控件要优先保证长文档场景的可用性。
- 移动端已有单独目录折叠逻辑时，不要轻易叠加桌面专用控件。
- 固定格式控件要有稳定尺寸，避免加载、计数、按钮显隐造成布局跳动。

## 数据和环境

- 数据库是 SQLite，`DATABASE_URL` 按 Prisma schema 所在目录解析。
- 本地默认环境变量见 `README.md`。
- 生产环境必须覆盖 `ADMIN_PASSWORD`、`SESSION_SECRET` 和 `DATABASE_URL`。
- 生产 HTTP 管理登录只有在可信内网或临时环境下才可使用 `ALLOW_INSECURE_ADMIN_COOKIE=1`。

## 部署和同步

- `scripts/sync-to-server.sh` 用于同步源码到服务器，会排除 `.env`、`node_modules/`、`.next/` 和本地 SQLite 数据库。
- 修改同步脚本前必须确认这是当前任务范围；不要把同步脚本的无关改动混入业务提交。

## 提交规则

- 使用 conventional commit，例如：

```text
feat: refine docs browser controls
fix: keep docs toc highlight visible
```

- 一个提交只包含一个清晰主题。
- 暂存文件时按文件显式添加，避免 `git add .` 或 `git add -A` 混入无关改动。
- 提交后用 `git status` 确认剩余改动是否符合预期。
