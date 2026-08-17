---
description: CloudBase AI Development Rules Guide - Web-focused project rules
globs: *
alwaysApply: true
---

# CloudBase AI Development Rules Guide

When updating `AGENTS.md`, update `AGENTS_ZH.md` in sync.

## Quick Reference

This repository is treated as a CloudBase-backed Web project unless local code clearly shows otherwise.

Before any work:
1. **Environment check**: call `envQuery` with `action=info` and use the returned environment ID in generated config or examples.
2. **Project understanding**: read `README.md` and inspect the relevant existing implementation before editing.
3. **Scenario routing**: identify whether the task is UI, auth, database, deployment, backend, or documentation work.
4. **Language rule**: reply to the user in Chinese.

## Web Project Rules

For Web development:
- Read `rules/web-development/rule.md` for SDK integration, build configuration, and static hosting rules.
- Use CloudBase Web SDK patterns already present in the project.
- Prefer patching existing pages, services, route guards, and form handlers over creating parallel demo code.
- When environment ID is needed, use the current CloudBase environment from `envQuery`.

## UI Design Rules

For any task that generates or changes pages, interfaces, components, styles, or frontend visual elements:
1. Read `rules/ui-design/rule.md` before writing UI code.
2. Output a design specification before implementation:
   - Purpose Statement
   - Aesthetic Direction
   - Color Palette with hex values
   - Typography
   - Layout Strategy
3. Avoid generic template-like UI. Keep the interface polished, domain-appropriate, and consistent with the existing app.

If the task is only functional wiring or bug fixing in an existing UI, inspect and patch the active implementation directly unless the user requests visual redesign.

## Authentication Rules

For Web authentication:
- Read `rules/auth-web/rule.md`.
- Use CloudBase Web SDK built-in authentication.
- If the user asks for login, registration, password, SMS, email, OAuth, or provider configuration, read `rules/auth-tool/rule.md` first and check provider status before implementing frontend auth code.
- Keep management-side auth configuration separate from app-side user sign-in flows.

## Database Rules

For Web data access:
- NoSQL: read `rules/no-sql-web-sdk/rule.md`.
- MySQL from Web: read `rules/relational-database-web/rule.md`.
- MySQL management through tools: read `rules/relational-database-tool/rule.md`.
- Prefer the existing data-access layer in the repository before adding new helpers.
- For SQL tables, include `_openid VARCHAR(64) DEFAULT '' NOT NULL` when creating per-user ACL tables.

## Backend Rules

For CloudBase backend work:
- Cloud Functions: inspect existing functions first, then deploy with `getFunctionList`, `createFunction`, or `updateFunctionCode` as appropriate.
- CloudRun: use `manageCloudRun` for container services, ensure CORS support, and prepare a Dockerfile when deploying containers.
- Prefer direct SDK/database calls from the existing backend or frontend layer unless server-side business logic, scheduled work, third-party API calls, or privileged operations require a backend function.

## Static Hosting Deployment

For Web deployment:
1. Build the frontend.
2. Deploy the build output with `uploadFiles`.
3. Preserve unrelated static hosting directories unless the user explicitly asks to replace them.
4. Tell the user CDN cache may take a few minutes to refresh.
5. Provide the access URL as a Markdown link with a random query string after deployment.

## Core Behavior Rules

1. **Language Rule**: Reply to the user in Chinese.
2. **Tool Priority**: For Tencent CloudBase operations, prioritize CloudBase tools.
3. **Project Understanding**: First read the current project's `README.md` and follow project instructions for development.
4. **Directory Standards**: Before outputting project code in the current directory, check current directory files first.
5. **Development Order**: When developing, prioritize frontend first, then backend, ensuring frontend interface and interaction logic are completed before backend business logic.
6. **UI Design Rules Mandatory Application**: When tasks involve generating pages, interfaces, components, styles, or any frontend visual elements, first explicitly read `rules/ui-design/rule.md` using file reading tools, then strictly follow the rule file. Output the design specification before writing UI code.
7. **Backend Development Priority Strategy**: When developing backend behavior, prioritize SDK/database calls through the existing application layers unless complex business logic, server-side computation, scheduled work, privileged operations, or third-party API calls require backend code.
8. **Deployment Order**: When backend dependencies exist, deploy or verify backend first, then preview or deploy frontend.
9. **Interactive Confirmation**: Use `interactiveDialog` to clarify unclear requirements and confirm before executing high-risk operations.
10. **Real-time Communication**: Use CloudBase realtime database watch capability when realtime updates are required.
11. **Authentication Rules**: If user login authentication is needed in this Web project, use CloudBase Web SDK built-in authentication and follow `rules/auth-web/rule.md`.
12. **Authentication Configuration Check**: When the user mentions login, registration, password, SMS, email, OAuth, or provider configuration, read `rules/auth-tool/rule.md`, check the current authentication configuration, enable required providers if needed, verify the configuration, and only then implement frontend authentication code.

## Development Workflow

Recommended order:
1. Check CloudBase environment.
2. Read `README.md`.
3. Inspect current files and existing implementation surfaces.
4. Read the relevant rule file for the task.
5. Make the smallest scoped change that satisfies the request.
6. Verify with the appropriate static checks, build, tests, or browser/runtime validation.

Use `interactiveDialog` only when requirements are unclear or before high-risk CloudBase operations.

## Tool Usage Rules

- For Tencent CloudBase operations, prioritize CloudBase tools.
- Understand tool parameter types before calling tools.
- Do not retry a failed tool call with the same invalid parameter shape.
- For generated config files such as `cloudbaserc.json`, automatically use the environment ID from `envQuery`.
- For remote assets that must become CloudBase files, use CloudBase storage or hosting tools instead of leaving fragile external dependencies.

## Documentation Rules

When generating or changing project documentation:
- Explain project purpose and architecture.
- Document CloudBase resources used by the project.
- After deployment, record frontend URLs, backend endpoints, and relevant CloudBase resource names.

## Professional Rule Reference

Platform:
- `rules/web-development/rule.md` - Web SDK integration, static hosting, build configuration
- `rules/cloudbase-platform/rule.md` - CloudBase platform knowledge
- `rules/cloudrun-development/rule.md` - CloudRun backend deployment
- `rules/cloud-functions/rule.md` - Cloud Functions development and deployment

Authentication:
- `rules/auth-web/rule.md` - Web authentication
- `rules/auth-nodejs/rule.md` - Node.js authentication
- `rules/auth-tool/rule.md` - Authentication provider configuration

Database:
- `rules/no-sql-web-sdk/rule.md` - NoSQL Web SDK
- `rules/relational-database-web/rule.md` - MySQL Web SDK
- `rules/relational-database-tool/rule.md` - MySQL tool operations

Storage and AI:
- `rules/cloud-storage-web/rule.md` - Cloud storage Web SDK
- `rules/ai-model-web/rule.md` - AI model calls from Web apps
- `rules/ai-model-nodejs/rule.md` - AI model calls from Node.js

UI and workflow:
- `rules/ui-design/rule.md` - UI design guidelines
- `rules/spec-workflow/rule.md` - Software engineering workflow

## Quality Checklist

Before saying the task is done:
- Environment was checked when CloudBase context matters.
- Existing implementation and `README.md` were considered.
- The relevant rule file was read for the scenario.
- UI changes followed the UI design rule when visual design was involved.
- Auth and database code used the correct Web-specific CloudBase APIs.
- Static checks, build, tests, or runtime validation were run when appropriate.
- Any verification gap is stated clearly to the user.
