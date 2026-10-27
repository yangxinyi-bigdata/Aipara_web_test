# Duanluo Web

Duanluo Web 是 Duanluo AI 段落输入法的官网与用户中心项目。项目基于 Next.js 14、React、TypeScript、Tailwind CSS 和 shadcn/ui 构建，前端通过 CloudBase Web SDK 接入身份认证、关系型数据库和云函数，用于展示产品能力、承载登录注册、账户资料、订阅和钱包等用户侧功能。

## 项目现状

- 官网首页：展示 Duanluo 的 AI 段落输入、跨语种输入、AI 拼音识别、下载入口、FAQ、联系信息等内容。
- 登录注册：支持手机号/邮箱验证码登录、账号密码登录，并在新用户登录后引导设置密码。
- 用户中心：包含账户概览、密码设置、邮箱/手机号绑定、订阅管理和钱包流水。
- CloudBase 后端：通过 `user_profile_service` 云函数处理资料同步和订阅升级/取消/续费；钱包充值已锁住。
- 静态部署：生产构建为 Next.js static export，输出目录为 `out`，用于 CloudBase 静态网站托管。

## 技术栈

- Next.js `14.2.3`
- React `18`
- TypeScript，开启 `strict`
- Tailwind CSS + `tailwindcss-animate`
- shadcn/ui 组件结构
- Radix UI 基础组件
- Lucide React 图标
- CloudBase Web SDK `@cloudbase/js-sdk`
- CloudBase Node SDK `@cloudbase/node-sdk`

## CloudBase 环境

当前项目绑定的 CloudBase 环境来自 `cloudbaserc.json` 和环境查询结果：

| 资源 | 当前值 |
| --- | --- |
| 环境 ID | `aipara-2gj6wwwsabef0ce0` |
| 环境别名 | `aipara` |
| 地域 | `ap-shanghai` |
| 静态托管域名 | `https://aipara-2gj6wwwsabef0ce0-1302061796.tcloudbaseapp.com/` |
| 云存储 CDN 域名 | `https://6169-aipara-2gj6wwwsabef0ce0-1302061796.tcb.qcloud.la/` |
| 函数目录 | `functions/` |

本地开发中，`next.config.mjs` 会把 `/__auth/:path*` 代理到 `https://aipara.yangxinyi.site/__auth/:path*`，用于 CloudBase Auth 相关回调路径。若更换正式域名或 CloudBase 托管域名，需要同步检查该 rewrite 配置。

## 目录结构

```text
.
├── app/                         # Next.js App Router 页面
│   ├── page.tsx                 # 官网首页
│   ├── login/page.tsx           # 登录/注册页
│   └── account/                 # 用户中心
│       ├── page.tsx             # 账户概览
│       ├── password/page.tsx    # 密码设置
│       ├── bindings/page.tsx    # 邮箱/手机号绑定
│       ├── subscription/page.tsx # 订阅管理
│       └── wallet/page.tsx      # 钱包与账单流水
├── components/
│   ├── layout/                  # 导航、主题、首页区块
│   └── ui/                      # shadcn/ui 风格基础组件
├── lib/
│   ├── cloudbase.ts             # CloudBase Web SDK 单例初始化
│   ├── profile-service.ts       # 云函数调用封装
│   ├── phone.ts                 # 手机号格式化工具
│   └── user.ts                  # 用户字段读取工具
├── functions/
│   ├── user_profile_service/    # 用户资料/订阅/钱包云函数
│   └── hello_world/             # 示例云函数
├── public/                      # 官网图片资源
├── rules/                       # CloudBase 开发规则文档
├── cloudbaserc.json             # CloudBase 项目配置
└── next.config.mjs              # Next.js 静态导出与 Auth rewrite 配置
```

## 前端路由

| 路由 | 说明 |
| --- | --- |
| `/` | Duanluo 官网首页 |
| `/login` | 登录、注册、验证码入口 |
| `/account` | 登录后的账户概览 |
| `/account/password` | 设置或补充账号密码 |
| `/account/bindings` | 绑定邮箱和手机号 |
| `/account/subscription` | 查看套餐、升级/取消/续费订阅 |
| `/account/wallet` | 查看余额、账单流水和开发阶段充值 |

## 数据与后端架构

浏览器端通过 `lib/cloudbase.ts` 初始化 CloudBase：

- `app.auth()`：处理登录状态、密码登录、验证码登录、退出登录、邮箱/手机号绑定等认证流程。
- `app.rdb()`：直接读取关系型数据库中的用户资料、套餐、订阅和账单数据。
- `app.callFunction()`：调用 `user_profile_service` 执行需要服务端身份校验或多表写入的操作。

`user_profile_service` 云函数通过 `@cloudbase/node-sdk` 在当前环境内运行，使用 `app.auth().getUserInfo()` 获取调用者 `uid`，再访问关系型数据库。

云函数支持的 action：

| action | 用途 |
| --- | --- |
| `profile.sync` | 同步或初始化用户资料 |
| `profile.updateMeta` | 更新用户扩展资料，例如邮箱、手机号、密码设置标记 |
| `subscription.upgrade` | 扣减余额并升级到 Pro |
| `subscription.cancel` | 取消 Pro 并回退到免费套餐 |
| `subscription.renew` | 扣减余额并续费 Pro |
| `wallet.recharge` | 已锁住，固定返回 403「充值暂未开放」；会员与额度只能由服务端写入 |

当前代码涉及的关系型数据库表：

| 表名 | 用途 |
| --- | --- |
| `user_profile` | 用户主档、订阅状态、余额、点数、扩展资料 |
| `user_subscription` | 订阅记录 |
| `user_billing_ledger` | 充值、订阅扣费等账务流水 |
| `plan_catalog` | 套餐额度配置 |

这些表应包含能与 CloudBase 用户身份关联的字段，例如 `uid`、`owner` 或 `_openid`。如果后续新建按用户隔离的 SQL 表，请按项目规则包含 `_openid VARCHAR(64) DEFAULT '' NOT NULL`。

## 本地开发

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

默认访问：

```text
http://localhost:3000
```

构建生产静态站点：

```bash
npm run build
```

生产环境下 `next.config.mjs` 会启用 `output: "export"`，构建产物输出到 `out/`。如需部署到子路径，可设置：

```bash
NEXT_PUBLIC_BASE_PATH=/your-sub-path npm run build
```

## 部署说明

前端部署流程：

1. 执行 `npm run build` 生成 `out/`。
2. 将 `out/` 上传到 CloudBase 静态网站托管。
3. 保留与认证或其他系统相关的托管目录，例如 `__auth/`。
4. 部署后 CDN 可能需要几分钟刷新。

当前静态托管访问地址：

- [CloudBase 静态托管](https://aipara-2gj6wwwsabef0ce0-1302061796.tcloudbaseapp.com/)

云函数部署目录为 `functions/`。更新 `user_profile_service` 时，应部署 `functions/user_profile_service` 对应的云函数代码，并确认函数运行环境中已安装 `@cloudbase/node-sdk`。

## 认证配置注意事项

登录页依赖 CloudBase Auth 的邮箱、手机号验证码和账号密码能力。上线或迁移环境前需要在 CloudBase 控制台确认：

- 邮箱登录/验证码能力已启用。
- 手机号短信验证码能力已启用。
- 用户名/密码或账号密码登录能力已启用。
- Web 安全域名包含当前访问域名。
- `/__auth` 相关路径能正确访问 CloudBase Auth 托管资源。

## 维护提示

- 项目仍保留部分模板遗留命名，例如 `package.json` 中的 `name` 仍为 `shadcn-landing-page`，首页 metadata 也仍包含模板描述。若要正式发布，建议同步改为 Duanluo 品牌信息。
- `functions/hello_world` 是示例函数，不参与当前用户中心主流程。
- `aipara-home.md` 是早期官网结构草稿，可作为内容调整参考，但当前页面实现以 `app/` 和 `components/layout/sections/` 为准。
- 修改 CloudBase 环境 ID 时，需要同步检查 `cloudbaserc.json`、`lib/cloudbase.ts` 和相关控制台/托管配置。
