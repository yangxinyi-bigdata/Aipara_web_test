---
description: CloudBase AI 开发规则指南 - 面向 Web 项目的规则
globs: *
alwaysApply: true
---

# CloudBase AI 开发规则指南

更新 `AGENTS.md` 时，请同步更新 `AGENTS_ZH.md`。

## 快速参考

除非本地代码明确显示不是 Web 项目，否则本仓库按 CloudBase 支撑的 Web 项目处理。

开始任何工作前：
1. **环境检查**：调用 `envQuery`，参数为 `action=info`，并在生成配置或示例时使用返回的环境 ID。
2. **项目理解**：阅读 `README.md`，并在编辑前检查相关的现有实现。
3. **场景路由**：识别任务属于 UI、认证、数据库、部署、后端还是文档工作。
4. **语言规则**：使用中文回复用户。

## Web 项目规则

进行 Web 开发时：
- 阅读 `rules/web-development/rule.md`，了解 SDK 集成、构建配置和静态托管规则。
- 使用项目中已有的 CloudBase Web SDK 模式。
- 优先修改已有页面、服务、路由守卫和表单处理逻辑，而不是创建并行的示例代码。
- 需要环境 ID 时，使用 `envQuery` 返回的当前 CloudBase 环境。

## UI 设计规则

对于任何生成或修改页面、界面、组件、样式或前端视觉元素的任务：
1. 编写 UI 代码前先阅读 `rules/ui-design/rule.md`。
2. 实现前输出设计规范：
   - 目的陈述
   - 美学方向
   - 带十六进制色值的色彩方案
   - 字体排版
   - 布局策略
3. 避免通用模板化 UI。界面应精致、符合业务场景，并与现有应用保持一致。

如果任务只是现有 UI 中的功能接线或缺陷修复，除非用户要求视觉重设计，否则直接检查并修补正在使用的实现。

## 认证规则

对于 Web 认证：
- 阅读 `rules/auth-web/rule.md`。
- 使用 CloudBase Web SDK 内置认证。
- 如果用户要求登录、注册、密码、短信、邮箱、OAuth 或认证提供方配置，先阅读 `rules/auth-tool/rule.md`，并在实现前检查提供方状态。
- 区分管理侧认证配置和应用侧用户登录流程。

## 数据库规则

对于 Web 数据访问：
- NoSQL：阅读 `rules/no-sql-web-sdk/rule.md`。
- Web 中使用 MySQL：阅读 `rules/relational-database-web/rule.md`。
- 通过工具管理 MySQL：阅读 `rules/relational-database-tool/rule.md`。
- 新增 helper 之前，优先使用仓库现有的数据访问层。
- 创建需要按用户 ACL 控制的 SQL 表时，包含 `_openid VARCHAR(64) DEFAULT '' NOT NULL`。

## 后端规则

对于 CloudBase 后端工作：
- 云函数：先检查已有函数，再根据需要使用 `getFunctionList`、`createFunction` 或 `updateFunctionCode` 部署。
- CloudRun：容器服务使用 `manageCloudRun`，部署容器时确保支持 CORS 并准备 Dockerfile。
- 除非服务端业务逻辑、定时任务、第三方 API 调用或特权操作需要后端函数，否则优先从现有后端或前端层直接使用 SDK/数据库调用。

## 静态托管部署

对于 Web 部署：
1. 构建前端。
2. 使用 `uploadFiles` 部署构建产物。
3. 除非用户明确要求替换，否则保留无关的静态托管目录。
4. 告知用户 CDN 缓存可能需要几分钟刷新。
5. 部署后提供带随机查询参数的 Markdown 访问链接。

## 核心行为规则

1. **语言规则**：使用中文回复用户。
2. **工具优先级**：涉及腾讯云 CloudBase 操作时，优先使用 CloudBase 工具。
3. **项目理解**：首先阅读当前项目的 `README.md`，并遵循项目说明进行开发。
4. **目录规范**：在当前目录输出项目代码之前，先检查当前目录文件。
5. **开发顺序**：开发时优先前端，再后端，确保先完成前端界面和交互逻辑，再实现后端业务逻辑。
6. **UI 设计规则强制应用**：当任务涉及生成页面、界面、组件、样式或任何前端视觉元素时，先使用文件读取工具明确读取 `rules/ui-design/rule.md`，然后严格遵循规则文件。必须在编写 UI 代码前输出设计规范。
7. **后端开发优先策略**：开发后端行为时，优先通过现有应用层使用 SDK/数据库调用；只有复杂业务逻辑、服务端计算、定时任务、特权操作或第三方 API 调用需要时，才新增后端代码。
8. **部署顺序**：存在后端依赖时，先部署或验证后端，再预览或部署前端。
9. **交互确认**：需求不清楚时使用 `interactiveDialog` 澄清；执行高风险操作前必须确认。
10. **实时通信**：需要实时更新时，使用 CloudBase 实时数据库 watch 能力。
11. **认证规则**：本 Web 项目如需用户登录认证，使用 CloudBase Web SDK 内置认证，并遵循 `rules/auth-web/rule.md`。
12. **认证配置检查**：当用户提到登录、注册、密码、短信、邮箱、OAuth 或认证提供方配置时，阅读 `rules/auth-tool/rule.md`，检查当前认证配置，按需启用所需提供方，验证配置生效后，再实现前端认证代码。

## 开发工作流

推荐顺序：
1. 检查 CloudBase 环境。
2. 阅读 `README.md`。
3. 检查当前文件和已有实现入口。
4. 阅读与任务相关的规则文件。
5. 做满足请求的最小范围修改。
6. 使用合适的静态检查、构建、测试或浏览器/运行时验证。

仅在需求不清楚或执行高风险 CloudBase 操作前使用 `interactiveDialog`。

## 工具使用规则

- 涉及腾讯云 CloudBase 操作时，优先使用 CloudBase 工具。
- 调用工具前理解参数类型。
- 不要用同样的错误参数形状重试失败的工具调用。
- 生成 `cloudbaserc.json` 等配置文件时，自动使用 `envQuery` 返回的环境 ID。
- 需要把远程资源变成 CloudBase 文件时，使用 CloudBase 存储或托管工具，避免留下脆弱的外部依赖。

## 文档规则

生成或修改项目文档时：
- 说明项目用途和架构。
- 记录项目使用的 CloudBase 资源。
- 部署后记录前端 URL、后端端点和相关 CloudBase 资源名称。

## 专业规则参考

平台：
- `rules/web-development/rule.md` - Web SDK 集成、静态托管、构建配置
- `rules/cloudbase-platform/rule.md` - CloudBase 平台知识
- `rules/cloudrun-development/rule.md` - CloudRun 后端部署
- `rules/cloud-functions/rule.md` - 云函数开发与部署

认证：
- `rules/auth-web/rule.md` - Web 认证
- `rules/auth-nodejs/rule.md` - Node.js 认证
- `rules/auth-tool/rule.md` - 认证提供方配置

数据库：
- `rules/no-sql-web-sdk/rule.md` - NoSQL Web SDK
- `rules/relational-database-web/rule.md` - MySQL Web SDK
- `rules/relational-database-tool/rule.md` - MySQL 工具操作

存储和 AI：
- `rules/cloud-storage-web/rule.md` - 云存储 Web SDK
- `rules/ai-model-web/rule.md` - Web 应用中的 AI 模型调用
- `rules/ai-model-nodejs/rule.md` - Node.js 中的 AI 模型调用

UI 和工作流：
- `rules/ui-design/rule.md` - UI 设计指南
- `rules/spec-workflow/rule.md` - 软件工程工作流

## 质量检查清单

在说明任务完成前：
- 涉及 CloudBase 上下文时已检查环境。
- 已考虑现有实现和 `README.md`。
- 已为当前场景阅读相关规则文件。
- 涉及视觉设计的 UI 修改已遵循 UI 设计规则。
- 认证和数据库代码使用了正确的 Web 端 CloudBase API。
- 适当运行了静态检查、构建、测试或运行时验证。
- 无法验证的部分已明确告知用户。
