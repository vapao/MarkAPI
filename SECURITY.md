# Security Policy

If you discover a security issue in MarkAPI, please do not disclose it publicly before reporting it.

Report the issue through GitHub private security reporting or through a public contact method provided by the repository maintainers. Please include as much of the following information as possible:

- Affected version or commit
- Reproduction steps
- Impact scope
- Your suggested fix direction

MarkAPI uses a single-admin-password model and unguessable share links by default. Public deployments must use strong `ADMIN_PASSWORD` and `SESSION_SECRET` values, and admin access should preferably happen over HTTPS.
