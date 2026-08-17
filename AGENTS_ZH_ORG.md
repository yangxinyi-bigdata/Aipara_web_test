---
description: CloudBase AI 开发规则指南 - 提供基于场景的最佳实践以确保开发质量
globs: *
alwaysApply: true
---

# CloudBase AI 开发规则指南

## AI 快速参考

**⚠️ 关键：请根据项目类型先阅读本节**

### 开发 Web 项目时：
1. **环境检查**：首先调用 `envQuery` 工具（适用于所有交互）
2. **⚠️ 模板下载（新项目必需）**：**启动新项目时必须先调用 `downloadTemplate` 工具** - 不要手动创建文件。使用 `downloadTemplate` 并设置 `template="react"` 或 `template="vue"`，以获取完整项目结构。只有当模板下载失败或用户明确要求时，才继续手动创建文件。
3. **⚠️ UI 设计（关键）**：**生成任何页面、界面、组件或样式之前，必须先阅读 `rules/ui-design/rule.md`** - 这不是可选项。你必须明确读取该文件，并在编写任何 UI 代码之前输出设计规范。
4. **核心能力**：阅读下方“核心能力”部分（尤其是 Web 的 UI 设计、数据库与认证）
5. **平台规则**：阅读 `rules/web-development/rule.md`，了解平台特定规则（SDK 集成、静态托管、构建配置）
6. **认证**：阅读 `rules/auth-web/rule.md` - **必须使用 Web SDK 内置认证**
7. **数据库**：
   - NoSQL：`rules/no-sql-web-sdk/rule.md`
   - MySQL：`rules/relational-database-web/rule.md` + `rules/relational-database-tool/rule.md`

### 开发小程序项目时：
1. **环境检查**：首先调用 `envQuery` 工具（适用于所有交互）
2. **⚠️ 模板下载（新项目必需）**：**启动新项目时必须先调用 `downloadTemplate` 工具** - 不要手动创建文件。使用 `downloadTemplate` 并设置 `template="miniprogram"`，以获取完整项目结构。只有当模板下载失败或用户明确要求时，才继续手动创建文件。
3. **⚠️ UI 设计（关键）**：**生成任何页面、界面、组件或样式之前，必须先阅读 `rules/ui-design/rule.md`** - 这不是可选项。你必须明确读取该文件，并在编写任何 UI 代码之前输出设计规范。
4. **核心能力**：阅读下方“核心能力”部分（尤其是小程序的 UI 设计、数据库与认证）
5. **平台规则**：阅读 `rules/miniprogram-development/rule.md`，了解平台特定规则（项目结构、微信开发者工具、wx.cloud 使用）
6. **认证**：阅读 `rules/auth-wechat/rule.md` - **天然免登录，在云函数中获取 OPENID**
7. **数据库**：
   - NoSQL：`rules/no-sql-wx-mp-sdk/rule.md`
   - MySQL：`rules/relational-database-tool/rule.md`（通过工具）

### 开发原生 App 项目（iOS/Android/Flutter/React Native 等）时：
1. **环境检查**：首先调用 `envQuery` 工具（适用于所有交互）
2. **⚠️ 平台限制**：**原生 App（iOS、Android、Flutter、React Native 及其他原生移动框架）不支持 CloudBase SDK** - 必须使用 HTTP API 调用 CloudBase 能力
3. **⚠️ UI 设计（关键）**：**生成任何页面、界面、组件或样式之前，必须先阅读 `rules/ui-design/rule.md`** - 这不是可选项。你必须明确读取该文件，并在编写任何 UI 代码之前输出设计规范。
4. **必读规则**：
   - **必须阅读** `rules/http-api/rule.md` - 所有 CloudBase 操作的 HTTP API 使用方式
   - **必须阅读** `rules/relational-database-tool/rule.md` - MySQL 数据库操作（通过工具）
5. **可选规则**：
   - `rules/cloudbase-platform/rule.md` - CloudBase 平台通用知识
   - `rules/ui-design/rule.md` - UI 设计指南（如果涉及 UI）
6. **⚠️ 数据库限制**：**原生 App 仅支持 MySQL 数据库**。如果用户需要使用 MySQL 数据库，**必须提示他们先在控制台启用**：
   - 在这里启用 MySQL 数据库：[CloudBase Console - MySQL Database](https://tcb.cloud.tencent.com/dev?envId=${envId}#/db/mysql/table/default/)
   - 将 `${envId}` 替换为实际环境 ID

---

## 核心能力（必须做好）

作为应用开发中最重要的部分，以下四项核心能力必须做好，不需要因平台不同而分别阅读不同规则：

### 1. ⚠️ UI 设计（关键 - 最高优先级）
**⚠️ 强制要求：所有设计工作必须严格遵循 `rules/ui-design/rule.md` 规则**

**🚨 关键强制要求：在生成任何 UI 代码之前，你必须明确读取 `rules/ui-design/rule.md` 文件。这不是建议，而是强制要求。**

**在生成任何页面、界面、组件或样式之前：**
1. **必须先明确读取 `rules/ui-design/rule.md` 文件** - 使用文件读取工具读取该文件，不要跳过此步骤
2. **必须先完成设计规范输出**，再编写代码：
   - 目的陈述
   - 美学方向（从具体选项中选择，不能使用泛泛而谈的表述）
   - 色彩方案（包含十六进制色值，避开禁用颜色）
   - 字体排版（指定字体名称，避开禁用字体）
   - 布局策略（非对称/创意方式，避免居中模板）
3. **必须确保** 生成的界面具有鲜明的美学风格和高质量视觉设计
4. **必须避免** 通用 AI 审美（常见字体、陈词滥调的配色方案、模板化设计）

**这适用于所有涉及以下内容的任务：**
- 页面生成
- 界面创建
- 组件设计
- 样式/视觉效果
- 任何前端视觉元素

**⚠️ 违规检测：如果发现自己在未先读取 `rules/ui-design/rule.md` 的情况下编写 UI 代码，请立即停止并先读取该文件。**

### 2. 数据库 + 认证
**强化数据库和认证能力**

**认证**：
- **Web 项目**：
  - 必须使用 CloudBase Web SDK 内置认证，参考 `rules/auth-web/rule.md`
  - 平台开发规则：参考 `rules/web-development/rule.md`，了解 Web SDK 集成、静态托管部署和构建配置
- **小程序项目**：
  - 天然免登录，在云函数中获取 `wxContext.OPENID`，参考 `rules/auth-wechat/rule.md`
  - 平台开发规则：参考 `rules/miniprogram-development/rule.md`，了解小程序项目结构、微信开发者工具集成和 CloudBase 能力
- **Node.js 后端**：参考 `rules/auth-nodejs/rule.md`

**数据库操作**：
- **Web 项目**：
  - NoSQL 数据库：参考 `rules/no-sql-web-sdk/rule.md`
  - MySQL 关系型数据库：参考 `rules/relational-database-web/rule.md`（Web 应用开发）和 `rules/relational-database-tool/rule.md`（通过工具管理）
  - 平台开发规则：参考 `rules/web-development/rule.md`，了解 Web SDK 数据库集成模式
- **小程序项目**：
  - NoSQL 数据库：参考 `rules/no-sql-wx-mp-sdk/rule.md`
  - MySQL 关系型数据库：参考 `rules/relational-database-tool/rule.md`（通过工具）
  - 平台开发规则：参考 `rules/miniprogram-development/rule.md`，了解小程序数据库集成和 wx.cloud 使用

### 3. 静态托管部署（Web）
**参考 `rules/web-development/rule.md` 中的部署流程**
- 构建完成后使用 CloudBase 静态托管
- 使用 `uploadFiles` 工具部署
- 提醒用户部署后 CDN 会有几分钟缓存
- 生成带随机 queryString 的 Markdown 格式访问链接

### 4. 后端部署（云函数或 CloudRun）
**参考 `rules/cloudrun-development/rule.md`**
- **云函数部署**：使用 `getFunctionList` 查询，然后调用 `createFunction` 或 `updateFunctionCode` 部署
- **CloudRun 部署**：使用 `manageCloudRun` 工具进行容器化部署
- 确保后端代码支持 CORS，并准备 Dockerfile（容器类型）

## 开发流程标准

**重要：为确保开发质量，AI 必须在开始工作前完成以下步骤：**

### 0. 环境检查（第一步）
用户输入任何内容后，首先检查 CloudBase 环境状态：
- 确保已知当前 CloudBase 环境 ID
- 如果对话历史中不存在环境 ID，必须调用 `envQuery` 工具，并使用参数 `action=info` 查询当前环境信息和环境 ID
- **重要**：后续代码中涉及环境 ID 配置时，自动使用查询到的环境 ID，不需要用户手动输入

### 1. 场景识别
识别当前开发场景类型，主要用于理解项目类型；但核心能力适用于所有项目：
- **Web 项目**：React/Vue/原生 JS 前端项目
- **微信小程序**：小程序 CloudBase 项目
- **原生 App**：使用 HTTP API 的原生移动应用（iOS、Android、Flutter、React Native 等，不支持 SDK）
- **CloudRun 项目**：CloudBase Run 后端服务项目（支持任意语言：Java/Go/Python/Node.js/PHP/.NET 等）
- **数据库相关**：涉及数据操作的项目
- **UI 设计/界面生成**：需要界面设计、页面生成、原型创建、组件设计等的项目

### 2. 平台特定快速指南

**Web 项目 - 必读规则文件：**
- `rules/web-development/rule.md` - 平台开发规则（SDK 集成、静态托管、构建配置）
- `rules/auth-web/rule.md` - 认证（必须使用 Web SDK 内置认证）
- `rules/no-sql-web-sdk/rule.md` - NoSQL 数据库操作
- `rules/relational-database-web/rule.md` - MySQL 数据库操作（Web）
- `rules/relational-database-tool/rule.md` - MySQL 数据库管理（工具）
- `rules/cloudbase-platform/rule.md` - CloudBase 平台通用知识

**小程序项目 - 必读规则文件：**
- `rules/miniprogram-development/rule.md` - 平台开发规则（项目结构、微信开发者工具、wx.cloud）
- `rules/auth-wechat/rule.md` - 认证（天然免登录，在云函数中获取 OPENID）
- `rules/no-sql-wx-mp-sdk/rule.md` - NoSQL 数据库操作
- `rules/relational-database-tool/rule.md` - MySQL 数据库操作（通过工具）
- `rules/cloudbase-platform/rule.md` - CloudBase 平台通用知识

**原生 App 项目（iOS/Android/Flutter/React Native 等）- 必读规则文件：**
- **⚠️ `rules/http-api/rule.md`** - **强制** - 所有 CloudBase 操作的 HTTP API 使用方式（不支持 SDK）
- **⚠️ `rules/relational-database-tool/rule.md`** - **强制** - MySQL 数据库操作（通过工具）
- **⚠️ 数据库限制**：仅支持 MySQL 数据库。如果用户需要 MySQL，**必须提示他们先在控制台启用**：[Enable MySQL Database](https://tcb.cloud.tencent.com/dev?envId=${envId}#/db/mysql/table/default/)

**原生 App 项目（iOS/Android/Flutter/React Native 等）- 可选规则文件：**
- `rules/cloudbase-platform/rule.md` - CloudBase 平台通用知识
- `rules/ui-design/rule.md` - UI 设计指南（如果涉及 UI）

**通用规则文件（所有项目）：**
- **⚠️ `rules/ui-design/rule.md`** - **强制 - 最高优先级** - 生成任何 UI/页面/组件/样式之前必须先阅读
- `rules/spec-workflow/rule.md` - 标准软件工程流程（如有需要）

### 3. 开发确认
开始工作前，建议向用户确认：
1. “我将此识别为 [场景类型] 项目”
2. “我会严格遵循核心能力要求，并参考相关规则文件”
3. “请确认我的理解是否正确”

## 核心行为规则
1. **语言规则**：必须使用中文回复
2. **工具优先级**：涉及腾讯云 CloudBase 操作时，必须优先使用 CloudBase 工具
3. **⚠️ 模板下载（强制）**：**启动新项目或用户要求开发应用时，必须先调用 `downloadTemplate` 工具** - 不要手动创建项目文件。使用 `downloadTemplate` 并设置合适的模板类型（`react`、`vue`、`miniprogram`、`uniapp`）。只有当模板下载失败或用户明确要求手动创建时，才手动创建文件。这可以确保项目结构、配置文件和最佳实践正确。
4. **项目理解**：首先阅读当前项目的 README.md，并遵循项目说明进行开发
5. **目录规范**：在当前目录输出项目代码之前，先检查当前目录文件
6. **开发顺序**：开发时优先前端，再后端，确保先完成前端界面和交互逻辑，再实现后端业务逻辑
7. **⚠️ UI 设计规则强制应用**：当任务涉及生成页面、界面、组件、样式或任何前端视觉元素时，**必须先使用文件读取工具明确读取 `rules/ui-design/rule.md` 文件**，然后严格遵循规则文件，确保生成的界面具有鲜明的美学风格和高质量视觉设计，避免通用 AI 审美。**必须在编写任何 UI 代码之前输出设计规范。**
8. **后端开发优先策略**：开发后端时，优先使用 SDK 直接调用 CloudBase 数据库，而不是通过云函数，除非确有需要（例如复杂业务逻辑、服务端计算、调用第三方 API 等）
9. **部署顺序**：存在后端依赖时，优先部署后端，再预览前端
10. **交互确认**：需求不清楚时使用 interactiveDialog 澄清；执行高风险操作前必须确认
11. **实时通信**：使用 CloudBase 实时数据库 watch 能力
12. **⚠️ 认证规则**：用户开发项目时，如果需要用户登录认证，必须使用内置认证功能，并严格按平台区分认证方式
   - **Web 项目**：**必须使用 CloudBase Web SDK 内置认证**（例如 `auth.toDefaultLoginPage()`），参考 `rules/auth-web/rule.md`
   - **小程序项目**：**天然免登录**，在云函数中获取 `wxContext.OPENID`，参考 `rules/auth-wechat/rule.md`
   - **原生 App（iOS/Android）**：**必须使用 HTTP API** 进行认证，参考 `rules/http-api/rule.md` 和 Authentication API swagger
13. **⚠️ 原生 App 开发规则**：开发原生移动应用（iOS、Android、Flutter、React Native 及其他原生移动框架）时：
   - **不支持 SDK**：CloudBase SDK 不适用于原生 App，必须使用 HTTP API
   - **数据库限制**：仅支持通过 HTTP API 使用 MySQL 数据库
   - **MySQL 数据库设置**：如果用户需要 MySQL 数据库，必须提示他们先在控制台启用：[CloudBase Console - MySQL Database](https://tcb.cloud.tencent.com/dev?envId=${envId}#/db/mysql/table/default/)（将 `${envId}` 替换为实际环境 ID）
   - **必读规则**：必须阅读 `rules/http-api/rule.md` 和 `rules/relational-database-tool/rule.md`

## 开发工作流

### 开发

1. **⚠️ 下载 CloudBase 模板（新项目必需）**：
   - **启动新项目时必须先调用 `downloadTemplate` 工具** - 不要手动创建项目文件
   - Web 项目：使用 `downloadTemplate` 并设置 `template="react"` 或 `template="vue"`
   - 小程序项目：使用 `downloadTemplate` 并设置 `template="miniprogram"`
   - UniApp 项目：使用 `downloadTemplate` 并设置 `template="uniapp"`
   - **只有当模板下载失败或用户明确要求手动创建时，才继续手动创建文件**
   - 如果无法下载到当前目录，可以使用脚本复制，注意隐藏文件也需要复制

2. **⚠️ UI 设计文档阅读（强制）**：
   - **生成任何页面、界面、组件或样式之前，必须先使用文件读取工具明确读取 `rules/ui-design/rule.md` 文件**
   - **必须输出设计规范**（目的陈述、美学方向、色彩方案、字体排版、布局策略），然后再编写任何 UI 代码
   - 这不是可选项 - 你必须阅读该文件，并遵循设计思维框架和前端美学指南
   - 避免生成通用 AI 审美风格界面

3. **小程序 TabBar 素材下载 - 下载远程素材链接**：小程序 TabBar 和其他素材图片必须使用 **png** 格式，必须使用 downloadRemoteFile 工具下载文件到本地。可以从 Unsplash、Wikimedia（一般选择 500 大小即可）、Pexels、Apple 官方 UI 等资源中选择

如果应用中需要远程链接，可以继续调用 uploadFile 上传，并获取临时访问链接和云存储 cloudId

3. **查询知识库专业知识**：如果对任何 CloudBase 知识不确定，可以使用 searchKnowledgeBase 工具智能搜索 CloudBase 知识库（支持 CloudBase、云函数、小程序前端知识等），快速获取专业文档和答案

4. **微信开发者工具打开项目流程**：
- 检测到当前项目是小程序项目时，建议用户使用微信开发者工具进行预览、调试和发布
- 打开前，确认 project.config.json 已配置 appid 字段。如果未配置，必须要求用户提供
- 使用微信开发者工具内置 CLI 命令打开项目（指向包含 project.config.json 的目录）：
  - Windows：`"C:\Program Files (x86)\Tencent\微信web开发者工具\cli.bat" open --project "项目根目录路径"`
  - macOS：`/Applications/wechatwebdevtools.app/Contents/MacOS/cli open --project "/path/to/project/root"`
- 项目根目录路径是包含 project.config.json 文件的目录

### 部署流程

1. **云函数部署流程**：可以使用 getFunctionList 工具查询是否已有云函数，然后直接调用 createFunction 或 updateFunctionCode 更新云函数代码。只需要将 functionRootPath 指向云函数目录的父目录（例如 cloudfunctions 目录的绝对路径）。不需要压缩代码等操作。上述工具会自动读取父目录下与函数同名的云函数子目录中的文件，并自动部署

2. **CloudRun 部署流程**：对于非云函数后端服务（Java、Go、PHP、Python、Node.js 等），使用 manageCloudRun 工具部署。确保后端代码支持 CORS，准备 Dockerfile，然后调用 manageCloudRun 进行容器化部署。详情参考 `rules/cloudrun-development/rule.md`

3. **静态托管部署流程**：使用 uploadFiles 工具部署。部署后提醒用户 CDN 会有几分钟缓存。可以生成带随机 queryString 的 Markdown 格式访问链接。详情参考 `rules/web-development/rule.md`

### 文档生成规则

1. 生成项目后需要生成 README.md 文件，包含项目名称、项目描述等基本项目信息。最重要的是清楚说明项目架构和涉及的 CloudBase 资源，方便维护者后续修改和维护
2. 部署后，如果是 Web 项目，可以将官方部署访问地址写入文档

### 配置文件规则

1. 为了帮助不使用 AI 的其他人了解可用资源，生成后可以创建 cloudbaserc.json 文件

### 工具接口调用规则
调用工具服务时，需要充分理解所有待调用接口的数据类型和返回值类型。如果不确定调用哪个接口，先检查文档和工具说明，再根据文档与工具说明确定接口及参数。不要出现错误的方法参数或参数类型错误。

例如，很多接口需要 confirm 参数，且为布尔类型。如果未提供该参数，或提供了错误的数据类型，接口会返回错误。

### 环境 ID 自动配置规则
- 生成项目配置文件（例如 `cloudbaserc.json`、`project.config.json` 等）时，自动使用 `envQuery` 查询到的环境 ID
- 涉及环境 ID 的代码示例中，自动填入当前环境 ID，不需要用户手动替换
- 部署和预览相关操作中，优先使用已经查询到的环境信息

## 专业规则文件参考

**注意**：详细信息请参考具体 skill 文件。本节仅提供快速参考。

### 平台开发技能
- **Web**：`rules/web-development/rule.md` - SDK 集成、静态托管、构建配置
- **小程序**：`rules/miniprogram-development/rule.md` - 项目结构、微信开发者工具、wx.cloud
- **CloudRun**：`rules/cloudrun-development/rule.md` - 后端部署（函数/容器）
- **平台（通用）**：`rules/cloudbase-platform/rule.md` - 环境、认证、服务

### 认证技能
- **Web**：`rules/auth-web/rule.md` - **必须使用 Web SDK 内置认证**
- **小程序**：`rules/auth-wechat/rule.md` - **天然免登录，在云函数中获取 OPENID**
- **Node.js**：`rules/auth-nodejs/rule.md`
- **HTTP API**：`rules/auth-http-api/rule.md`

### 数据库技能
- **NoSQL（Web）**：`rules/no-sql-web-sdk/rule.md`
- **NoSQL（小程序）**：`rules/no-sql-wx-mp-sdk/rule.md`
- **MySQL（Web）**：`rules/relational-database-web/rule.md`
- **MySQL（工具）**：`rules/relational-database-tool/rule.md`

### 🎨 ⚠️ UI 设计技能（关键 - 先阅读）
- **`rules/ui-design/rule.md`** - **强制 - 最高优先级**
  - **生成任何界面/页面/组件/样式之前必须先阅读**
  - 设计思维框架、完整设计流程、前端美学指南
  - **无例外**：所有 UI 工作都需要先阅读此文件

### 工作流技能
- **Spec Workflow**：`rules/spec-workflow/rule.md` - 标准软件工程流程（需求、设计、任务）

## 开发质量检查清单

为确保开发质量，建议在开始任务前完成以下检查：

### 建议步骤
0. **[ ] 环境检查**：调用 `envQuery` 工具检查 CloudBase 环境状态（适用于所有交互）
1. **[ ] 模板下载检查（新项目必需）**：如果启动新项目，是否已经先调用 `downloadTemplate` 工具？不要手动创建项目文件 - 使用模板。
2. **[ ] 场景识别**：明确识别当前项目类型（Web/小程序/数据库/UI）
3. **[ ] 核心能力确认**：确认已考虑全部四项核心能力
   - UI 设计：是否已使用文件读取工具明确读取 `rules/ui-design/rule.md` 文件？
   - 数据库 + 认证：是否已参考对应的认证和数据库技能？
   - 静态托管部署：是否已理解部署流程？
   - 后端部署：是否已理解云函数或 CloudRun 部署流程？
4. **[ ] UI 设计规则检查（强制）**：如果任务涉及生成页面、界面、组件或样式：
   - 是否已使用文件读取工具明确读取 `rules/ui-design/rule.md` 文件？（要求：是）
   - 是否已在编写代码前输出设计规范？（要求：是）
   - 是否已理解并将遵循设计思维框架？（要求：是）
5. **[ ] 用户确认**：与用户确认场景识别和核心能力理解是否正确
6. **[ ] 规则执行**：严格遵循核心能力要求和相关规则文件进行开发

### ⚠️ 常见问题规避
- **❌ 不要手动创建项目文件** - 新项目始终先使用 `downloadTemplate` 工具
- **❌ 不要跳过阅读 UI 设计文档** - 生成任何 UI 代码之前，必须明确读取 `rules/ui-design/rule.md` 文件
- 避免跳过核心能力并直接开始开发
- 避免混用不同平台的 API 和认证方法
- 避免忽略 UI 设计规则：所有涉及界面、页面、组件、样式的任务都必须明确读取并严格遵循 `rules/ui-design/rule.md`
- 避免忽略数据库和认证标准：必须使用正确的认证方法和数据库操作方法
- 重要技术方案应与用户确认

### 质量保证
如果发现开发不符合标准，可以：
- 指出具体问题
- 要求重新执行规则检查流程
- 明确指定需要遵循的规则文件
