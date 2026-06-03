# MarkAPI

[简体中文](README.zh-CN.md)

MarkAPI is a self-hosted Markdown API documentation browser. Upload a complete `.md` API document and turn it into an online documentation page with a table of contents, search, version history, and share links.

It is designed for small teams and internal projects that already maintain API documentation in Markdown and do not want to adopt a heavy documentation platform.

## Features

- Self-hosted deployment with data stored in your own SQLite database
- Single admin password for the management UI
- Multiple documentation projects
- Markdown uploads that create versioned document snapshots
- Read-only public documentation through unguessable share links
- Optional public access to version history
- Documentation pages with table of contents, in-page search, and version switching
- GitHub Flavored Markdown support
- API-documentation enhancements for endpoint paths, field names, and JSON code block copying
- Chinese and English UI
- Light, dark, and system themes
- Docker Compose quick start

## Good Fit

- Internal API documentation
- Stable read-only documentation links for frontend, QA, customer success, or external collaborators
- Keeping historical versions of Markdown API documents
- Lightweight documentation sites deployed on private servers or internal networks

## Not a Good Fit

- Documentation platforms that need multi-user accounts, roles, or fine-grained permissions
- Public SaaS-style documentation workspaces with registration and team collaboration
- Projects that need OpenAPI-driven SDK generation or a full developer portal
- Knowledge base, blog, or CMS use cases

## Quick Start

```bash
cp .env.example .env
docker compose up -d
```

Before starting, edit `.env` and set at least:

```env
ADMIN_PASSWORD=replace-with-admin-password
SESSION_SECRET=replace-with-long-random-secret
DATABASE_URL=file:./data/markapi.db
ALLOW_HTTP_ADMIN_LOGIN=1
```

`ALLOW_HTTP_ADMIN_LOGIN=1` is suitable for local or temporary HTTP usage. Change it to `ALLOW_HTTP_ADMIN_LOGIN=0` after deploying behind HTTPS.

`DATABASE_URL` already points to a local SQLite file by default and usually does not need to be changed.

The default service URL is:

```text
http://localhost:3000
```

Open the admin UI, create a project, upload a Markdown document, and copy the share link.

Docker Compose stores data in the `markapi-data` volume. Back up the SQLite database regularly before using it for real work.

## Example Documents

- [MMall API example documentation (Chinese)](examples/mmall-api.md)
- [MMall API sample documentation (English)](examples/mmall-api.en.md)

## Markdown Conventions

MarkAPI renders Markdown directly and does not require a proprietary document format.

- Supports GitHub Flavored Markdown, including tables, task lists, and code blocks
- Uses second- and third-level headings to build the table of contents
- Renders `json` code blocks with an API-documentation-friendly layout
- Recognizes lines like `GET /api/users` as endpoint rows
- Adds copy actions for common field names, paths, and enum-like values in tables

## Configuration

| Variable | Required | Description |
| --- | --- | --- |
| `ADMIN_PASSWORD` | Yes | Password for the admin UI |
| `SESSION_SECRET` | Yes | Secret used to sign admin sessions. Use a long random value in production |
| `DATABASE_URL` | Yes | SQLite database URL. The provided default usually does not need to be changed |
| `ALLOW_HTTP_ADMIN_LOGIN` | No | Allows admin login over HTTP in production-like deployments |

Default `.env.example`:

```env
ADMIN_PASSWORD=replace-with-admin-password
SESSION_SECRET=replace-with-long-random-secret
DATABASE_URL=file:./data/markapi.db
ALLOW_HTTP_ADMIN_LOGIN=1
```

You usually do not need to change `DATABASE_URL`. The default value stores the SQLite database under the project `data/` directory.

## Security Notes

MarkAPI currently uses a single-admin-password model. It is intended for small teams and internal deployments.

Public documentation is available through unguessable `shareToken` links. This is not a login-based authorization system: anyone with the link can access the corresponding document.

For production, use HTTPS and set:

```env
ALLOW_HTTP_ADMIN_LOGIN=0
```

If you must access the admin UI over HTTP, set:

```env
ALLOW_HTTP_ADMIN_LOGIN=1
```

This allows the admin session cookie to be sent without HTTPS. Login credentials will travel over a plaintext connection, so only use it on trusted internal networks or temporary environments.

## Local Development

```bash
npm install
npm run dev
```

Common checks:

```bash
npm run lint
npm run build
```

This project uses npm scripts. pnpm and yarn workflows are not required.

## Tech Stack

- [Next.js](https://nextjs.org/) App Router
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [SQLite](https://www.sqlite.org/)

## Project Status

MarkAPI is an early-stage project. The goal is to stay lightweight, self-hostable, and easy to maintain. The current focus is internal API documentation browsing, not complex permissions, team workspaces, or plugin systems.

## Contributing

Issues and pull requests are welcome. Before submitting changes, run at least:

```bash
npm run lint
npm run build
```

Keep each pull request focused on one clear topic and avoid mixing unrelated refactors into feature or bug-fix changes.

## License

[MIT](LICENSE)
