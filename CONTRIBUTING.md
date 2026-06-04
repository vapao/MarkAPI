# Contributing

Thank you for considering contributing to MarkAPI.

## Local Development

```bash
npm install
npm run dev
```

This project uses npm scripts. Do not commit pnpm, yarn, or bun lockfiles unless the maintainers explicitly decide to migrate the workflow.

## Pre-Submit Checks

```bash
npm run lint
npm run build
```

Changes that affect the database schema must also update the SQLite initialization logic in `lib/db.ts`.

## Pull Request

- Keep each pull request focused on one clear issue.
- Prefer small changes and avoid mixing features, refactors, and formatting updates.
- For UI changes, include screenshots or describe the pages you verified.
- For new features, explain the user scenario and deployment impact.
