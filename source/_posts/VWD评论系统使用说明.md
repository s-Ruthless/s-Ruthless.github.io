---
title: VWD评论系统使用说明
date: 2026-07-18 10:00:00
cover: https://picsum.photos/seed/vwd-guide/600/400
tags:
  - VWD
  - 评论系统
  - Vercel
  - 教程
categories:
  - 技术
abbrlink: "bf499fec"
---

**VWD（Vercel Workers Discuss）** 是一款基于 Vercel Serverless 平台的自托管评论系统，使用 Vercel Postgres 和 Vercel KV 作为数据存储。深度适配 Vercel 生态，开箱即用，**部署成本为零**。

本项目参考了 [CWD](https://github.com/anghunk/cwd)（Cloudflare Workers Discuss）和 [Waline](https://waline.js.org/) 评论系统的设计与实现，适合个人博客或中小型站点使用。

> **提示**：本文涵盖从部署到进阶配置的所有内容，建议先通读一遍，再按需查阅。

<!-- more -->

{% btns rounded center %}
{% btn https://github.com/s-Ruthless/Vercel-Workers-Discuss, GitHub 仓库, fa-star, red %}
{% btn https://github.com/s-Ruthless/Vercel-Workers-Discuss, 官方文档, fa-book, blue %}
{% endbtns %}


## 功能特性

VWD 评论系统提供了一套完整的评论解决方案，涵盖评论、说说、通知、安全、备份等功能。

{% card blue 核心能力 %}
- **评论系统**：支持嵌套回复、Markdown 渲染、XSS 过滤、图片灯箱
- **说说功能**：博主可发布动态/短博文，支持 Markdown、表情、标签、点赞
- **管理后台**：Vue 3 + macOS 风格 UI，暗黑模式、中英文双语、自定义主题色
- **邮件通知**：SMTP 邮件通知，支持自定义模板，兼容 QQ/163 邮箱
- **Telegram 通知**：新评论实时推送到 Telegram，支持一键 Webhook 配置
- **S3 备份**：兼容 AWS S3 / Cloudflare R2 / MinIO，支持自动备份与恢复
- **点赞功能**：文章点赞、评论点赞和说说点赞
- **表情系统**：Waline 风格表情包，内置阿鲁表情包和颜文字
- **数据迁移**：支持从 Twikoo、Artalk、Valine 导入评论数据
- **多站点**：支持多站点管理，通过 `siteId` 隔离数据
- **安全**：IP/邮箱黑名单、域名白名单、评论审核机制
{% endcard %}


## 技术栈

| 层级 | 技术 |
| --- | --- |
| 运行时 | Vercel Serverless (Node.js 20+) |
| Web 框架 | Hono + `hono/vercel` adapter |
| 数据库 | Vercel Postgres (Neon PostgreSQL) |
| 键值存储 | Vercel KV (Upstash Redis) |
| 邮件 | nodemailer |
| S3 存储 | aws4fetch |
| Admin 前端 | Vue 3 + Vite + TypeScript |
| 图表 | ECharts |
| 国际化 | vue-i18n（Admin 支持中英文，Widget 仅中文） |
| 样式 | LESS + CSS Variables（暗黑模式） |


## 免费额度分析

根据对 Vercel 免费计划的分析，VWD 评论系统的部署成本为零，不需要任何成本。

| 指标 | 免费每月额度 | 单次消耗 | 理论极限 |
| --- | --- | --- | --- |
| Serverless 函数调用 | 100 万次 | ~3 次/次访问 | 33 万次页面访问 |
| 带宽 | 100 GB | ~50 KB/次访问 | 200 万次页面访问 |
| Postgres 计算 | 60 小时 | ~20ms/次请求 | 1000 万次请求 |
| KV 命令 | 300 万次 | ~2 次/次访问 | 150 万次页面访问 |

::: success 放心使用
对于个人博客或中小型站点来说，Vercel 免费计划完全够用。
:::


## 快速部署

### 前置要求

{% checkbox 拥有 GitHub 账号 %}
{% checkbox 拥有 Vercel 账号（可使用 GitHub 登录） %}
{% checkbox checked, Node.js >= 20（本地开发需要） %}

### 部署步骤

{% steps %}

{% step Fork / 克隆仓库 %}

```bash
git clone https://github.com/s-Ruthless/Vercel-Workers-Discuss.git
cd Vercel-Workers-Discuss
```

或直接在 GitHub 上 Fork [Vercel-Workers-Discuss](https://github.com/s-Ruthless/Vercel-Workers-Discuss) 仓库。
{% endstep %}

{% step 在 Vercel 导入仓库 %}

1. 登录 [Vercel 控制台](https://vercel.com/dashboard)
2. 点击 **Add New → Project**
3. 选择你 Fork 的仓库 `Vercel-Workers-Discuss`
4. Vercel 会自动识别 `vercel.json` 配置，无需手动设置：
   - **Build Command**：`npm run build`（自动构建 Widget + Admin + 文档）
   - **Output Directory**：`public`
   - **Install Command**：`npm install`
5. 点击 **Deploy**，等待构建完成
{% endstep %}

{% step 创建数据库资源 %}

在 Vercel 控制台中创建以下资源（与项目关联到同一个 Scope）：

1. **Vercel Postgres** — 存储 评论、设置、说说数据
2. **Vercel KV** — 管理会话 Token 和限流

创建方式：Vercel 控制台 → **Storage** → **Create** → 选择 Postgres / KV
{% endstep %}

{% step 关联数据库到项目 %}

1. 进入项目 **Settings → Storage**
2. 将创建的 Postgres 和 KV 实例连接到本项目
3. 以下环境变量会**自动注入**，无需手动配置：

| 变量名 | 说明 |
| --- | --- |
| `POSTGRES_URL` | Vercel Postgres 连接地址 |
| `KV_REST_API_URL` | Vercel KV REST API 地址 |
| `KV_REST_API_TOKEN` | Vercel KV REST API Token |
{% endstep %}

{% step 重新部署并设置管理员 %}

关联数据库后，在 Vercel 控制台点击 **Redeploy**。

::: tip 自动建表
数据库表会在首次 API 请求时**自动创建**（`ensureSchema`），无需手动初始化。
:::

部署成功后，打开 `https://your-project.vercel.app/admin/`，首次访问会引导你设置管理员账号和密码。
{% endstep %}

{% endsteps %}

### 方式二：Vercel CLI 部署

如果你更喜欢命令行操作，也可以使用 Vercel CLI 部署：

```bash
# 克隆并安装
git clone https://github.com/s-Ruthless/Vercel-Workers-Discuss.git
cd Vercel-Workers-Discuss
npm install

# 登录 Vercel
npx vercel login

# 部署（包含构建）
npm run deploy

# 或分步操作
npm run build        # 构建 Widget + Admin + 文档
npx vercel --prod    # 部署到生产环境
```

### 部署完成

部署成功后，你将获得以下地址：

| 地址 | 说明 |
| --- | --- |
| `https://your-project.vercel.app/` | 首页引导页 |
| `https://your-project.vercel.app/doc/` | 使用文档（VitePress 文档站） |
| `https://your-project.vercel.app/admin/` | 管理后台 |
| `https://your-project.vercel.app/vwd.js` | Widget JS 文件 |
| `https://your-project.vercel.app/api/health` | 健康检查 |
| `https://your-project.vercel.app/emotion/` | 表情图片资源 |

::: tip 检测部署情况
部署成功后，访问健康检查接口 `https://your-project.vercel.app/api/health`，如果成功会返回：

```json
{
  "status": "ok",
  "version": "1.0.0"
}
```
:::


## 前端接入

VWD 内置 Widget 组件，部署后自动构建到 `public/vwd.js`，可通过你的域名直接引用。

### 组件特性

VWD 评论组件采用 **Shadow DOM** 技术构建，基于独立根节点渲染，具备以下优势：

- **样式隔离**：组件样式完全独立，不会与宿主页面的样式产生冲突
- **DOM 隔离**：组件内部 DOM 结构与外部页面完全隔离，互不干扰
- **即插即用**：无需担心现有网站的样式框架（如 Bootstrap、Tailwind 等）影响组件显示
- **自定义样式**：通过 `customCssUrl` 参数注入自定义样式表，灵活调整外观

### 不同框架接入示例

{% tabs framework-tabs, 1 %}

{% tab HTML（通用） %}
此方法适用于绝大多数博客框架，包括 Hexo、Hugo、Jekyll、WordPress 等。

```html
<div id="comments"></div>
<script src="https://your-project.vercel.app/vwd.js"></script>

<!-- 实例调用 -->
<script>
  const comments = new VWDComments({
    el: '#comments',
    apiBaseUrl: 'https://your-project.vercel.app', // 换成你的 API 地址
  });
  comments.mount();
</script>
```
{% endtab %}

{% tab Vue 3 %}

安装 `npm i vwd-widget`（或直接引用 CDN）

```html
<div id="comments"></div>
```

```js
import VWDComments from 'vwd-widget';

onMounted(() => {
  const comments = new VWDComments({
    el: '#comments',
    apiBaseUrl: 'https://your-project.vercel.app',
  });
  comments.mount();
});
```
{% endtab %}

{% tab React %}

```jsx
import { useEffect, useRef } from 'react';
import VWDComments from 'vwd-widget';

function Comments() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const comments = new VWDComments({
      el: containerRef.current,
      apiBaseUrl: 'https://your-project.vercel.app',
    });
    comments.mount();

    return () => {
      comments.unmount();
    };
  }, []);

  return <div id="comments" ref={containerRef} />;
}

export default Comments;
```
{% endtab %}

{% tab Astro %}

```astro
<div id="comments"></div>
<script src="https://your-project.vercel.app/vwd.js" is:inline></script>

<script is:inline>
  document.addEventListener('DOMContentLoaded', () => {
    const comments = new VWDComments({
      el: '#comments',
      apiBaseUrl: 'https://your-project.vercel.app',
    });
    comments.mount();
  });
</script>
```
{% endtab %}

{% endtabs %}

### 配置参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `el` | `string \| HTMLElement` | 是 | — | 挂载元素选择器或 DOM 元素 |
| `apiBaseUrl` | `string` | 是 | — | API 基础地址 |
| `siteId` | `string` | 否 | `blog` | 站点 ID，用于多站点数据隔离，推荐配置 |
| `postSlug` | `string` | 否 | `window.location.pathname` | 自定义评论标识符，用于跨路径/多语言聚合 |
| `postTitle` | `string` | 否 | `document.title` | 文章标题（用于通知邮件） |
| `postUrl` | `string` | 否 | `window.location.origin + pathname` | 文章 URL（用于通知邮件） |
| `mode` | `'says'` | 否 | — | 设为 `'says'` 开启说说渲染功能 |
| `lang` | `'zh-CN'` | 否 | `zh-CN` | 评论组件语言代码 |
| `theme` | `'light' \| 'dark'` | 否 | `'light'` | 主题模式 |
| `pageSize` | `number` | 否 | `20` | 每页显示评论数 |
| `primaryColor` | `string` | 否 | `#0969da` | 主题色（hex 格式） |
| `customCssUrl` | `string` | 否 | — | 自定义样式表 URL，追加到 Shadow DOM 底部 |

### 实例方法

| 方法 | 说明 |
| --- | --- |
| `mount()` | 挂载组件到 DOM |
| `unmount()` | 卸载组件 |
| `updateConfig(config)` | 更新配置（支持动态切换主题等） |
| `getConfig()` | 获取当前配置 |

**使用示例：**

```javascript
// 动态切换主题
comments.updateConfig({ theme: 'dark' });

// 动态修改评论标识符（适用于单页应用路由切换）
comments.updateConfig({ postSlug: '/new-post-slug' });

// 配置自定义样式（会以 <link> 形式注入到 Shadow DOM 底部）
comments.updateConfig({
  customCssUrl: 'https://your-cdn.example.com/vwd-custom.css',
});
```

::: warning postSlug 说明
如果你的站点是多语言结构（例如 `/en/post/1` 和 `/zh/post/1`），或者是不同路径需要共享同一份评论数据，可以通过 `postSlug` 参数手动指定唯一的标识符。如果未指定 `postSlug`，组件将默认使用 `window.location.pathname` 作为标识符。
:::


## Hexo + moeMac 主题接入

如果你使用的是 moeMac 主题，VWD 已深度集成，只需在主题配置文件 `themes/moeMac/_config.yml` 中配置即可。

### 开启 VWD 评论

```yaml
comments:
  enable: true
  provider: "vwd"  # 设置为 vwd
  vwd:
    apiBaseUrl: "https://your-vwd-api.vercel.app"  # VWD API 地址（Vercel 部署后的地址）
    jsUrl: ""               # vwd.js 脚本地址，留空则默认使用 apiBaseUrl + /vwd.js
    siteId: "blog"          # 站点标识，用于多站点数据隔离（推荐配置）
    lang: "auto"            # 评论组件语言，auto 自动检测浏览器语言
    customCssUrl: ''        # 自定义 CSS 地址，留空则使用默认样式
    primaryColor: '#cf0226' # 主题色，影响按钮/链接等强调色
    saysEnable: true        # true 开启说说渲染（动态页面），false 关闭
    saysPageSize: 10        # 每页显示说说数（也可在 VWD 后台设置）
```

### 配置项说明

{% folding blue jsUrl 脚本地址说明 %}
留空时默认从 API 服务器远程加载 `vwd.js`。也可填写自定义地址：

- **远程地址**（可加版本号刷新缓存）：`jsUrl: "https://vwd.moeao.cn/vwd.js?v=2"`
- **本地路径**（下载到本地后使用）：`jsUrl: "/assets/js/vwd.js"`
{% endfolding %}

{% folding green 页面级控制 %}
在文章/页面的 front-matter 中可以单独控制评论显示：

```yaml
title: 不需要评论的文章
comment: false  # 关闭评论
```
{% endfolding %}

{% folding orange 多主题色适配 %}
`primaryColor` 会影响评论组件的按钮、链接等强调色。建议与你的博客主题色保持一致，例如 moeMac 主题默认色为 `#cf0226`。
{% endfolding %}

> VWD 支持暗黑模式自动切换、Shadow DOM 隔离样式、评论数据本地存储等特性。

### moeMac 主题相关文章

{% postcard /posts/ada921dd.html/ %}


## 说说功能

VWD 评论系统内置说说功能，博主可以在后台 `/admin/says` 发布说说，然后创建独立页面展示说说列表。

### 发布说说

在管理后台的「说说管理」页面可以：

- **发布说说**：支持 Markdown 内容、表情、标签
- **编辑说说**：修改已有说说的内容
- **删除说说**：删除不需要的说说
- **说说状态**：控制说说的显示/隐藏

### 在独立页面展示说说

```html
<div id="vwd-says" style="max-width: 800px; margin: 2rem auto;"></div>
<script src="https://your-project.vercel.app/vwd.js"></script>
<script>
  new VWDComments({
    el: '#vwd-says',
    apiBaseUrl: 'https://your-project.vercel.app',
    mode: 'says'
  }).mount();
</script>
```

### moeMac 主题动态页面

如果你使用 moeMac 主题，说说功能已内置集成。创建动态页面：

```bash
hexo new page dynamic
```

在 `source/dynamic/index.md` 中设置布局：

```yaml
---
title: 动态
date: 2026-07-15 10:00:00
layout: page-dynamic
comment: true
---
```

::: tip 工作原理
`page-dynamic` 布局直接从 `comments.vwd` 读取 VWD 配置，自动初始化 `VWDComments` 组件并设置 `mode: 'says'`，渲染说说列表。页面底部同时包含评论区（由 `comment` 开关控制）。
:::

### 说说后台设置

在后台「设置」→「说说设置」中可配置：

| 配置项 | 说明 |
| --- | --- |
| 说说开关 | 开启/关闭说说功能 |
| 说说点赞 | 开启/关闭说说点赞（也可在功能开关中配置） |
| 每页数量 | 说说列表每页显示条数 |
| 说说审核 | 开启后新说说需审核后显示 |


## 管理后台

管理后台基于 Vue 3 + Vite + TypeScript 构建，采用 macOS 风格 UI，支持暗黑模式、中英文双语切换、自定义主题色。

访问地址：`https://your-project.vercel.app/admin/`

### 后台功能

{% card blue 评论管理 %}
- 评论列表查看与搜索
- 单条评论编辑（修改内容、置顶权重）
- 评论审核（通过/拒绝）
- 评论删除
- 评论状态管理
{% endcard %}

{% card green 说说管理 %}
- 发布说说（支持 Markdown、表情、标签）
- 编辑/删除说说
- 说说状态控制
{% endcard %}

{% card orange 系统设置 %}
- 头像服务前缀配置（Gravatar / Cravatar / 自定义）
- 博主标签显示
- 评论审核机制
- 功能开关（点赞、图片灯箱、表情等）
- 主题色自定义
- 评论框提示文案
{% endcard %}

{% card purple 数据管理 %}
- 评论数据导出/导入（VWD / Twikoo / Artalk / Valine）
- 系统配置导出/导入
- 访问统计导出/导入
- 全量备份与恢复
- S3 自动备份配置
{% endcard %}

### 多站点管理

管理后台顶部导航栏提供了站点下拉选择器，用于在多站点之间切换数据视图。在「站点管理」页面可以添加、编辑、删除托管站点，每个站点通过 `siteId` 进行数据隔离。

### 使用官方管理后台

除了自部署的管理后台，你也可以使用官方提供的管理后台（最新版本）：<https://vwd.zishu.me>

登陆时填入你的 API 地址、账号和密码。


## 邮件通知

VWD 支持 SMTP 邮件通知，新评论和回复会实时推送到管理员邮箱。

### 支持的邮箱服务

{% badge QQ 邮箱, blue, pill %} {% badge 163 邮箱, green, pill %} {% badge 自定义 SMTP, purple, pill %}

### 配置步骤

{% tabs email-tabs, 1 %}

{% tab QQ 邮箱 %}

1. 登录 QQ 邮箱，进入 `设置 > 账户`
2. 开启 `POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV 服务`，并获取授权码
3. 在管理后台设置中配置 QQ 邮箱账号和授权码

**SMTP 配置参考：**

| 字段 | 值 |
| --- | --- |
| 主机 | `smtp.qq.com` |
| 端口 | `465` |
| 安全连接 | `true` |
| 密码 | 授权码（非 QQ 密码） |
{% endtab %}

{% tab 163 邮箱 %}

1. 登录 163 邮箱，进入 `设置`
2. 开启 `POP3/SMTP/IMAP`，并获取授权码
3. 在管理后台设置中配置 163 邮箱账号和授权码
{% endtab %}

{% tab 自定义 SMTP %}

配置自定义 SMTP 邮箱需要以下信息：

- SMTP 服务器地址
- SMTP 服务器端口
- 发件邮箱账号
- 邮箱密码或授权码
{% endtab %}

{% endtabs %}

### 邮件模板变量

支持自定义 HTML 邮件模板，包含以下变量：

{% folding blue 回复评论模板变量 %}

| 变量名 | 说明 |
| --- | --- |
| `${toEmail}` | 收件人邮箱 |
| `${toName}` | 收件人昵称 |
| `${postTitle}` | 文章标题 |
| `${parentComment}` | 被回复的评论内容 |
| `${replyAuthor}` | 回复者昵称 |
| `${replyContent}` | 回复内容 |
| `${postUrl}` | 文章链接 |
{% endfolding %}

{% folding green 新评论通知模板变量 %}

| 变量名 | 说明 |
| --- | --- |
| `${postTitle}` | 文章标题 |
| `${postUrl}` | 文章链接 |
| `${commentAuthor}` | 评论者昵称 |
| `${commentContent}` | 评论内容 |
{% endfolding %}

{% folding orange 评论通过审核通知模板变量 %}

| 变量名 | 说明 |
| --- | --- |
| `${toName}` | 收件人昵称 |
| `${postTitle}` | 文章标题 |
| `${commentContent}` | 评论内容 |
| `${postUrl}` | 文章链接 |
{% endfolding %}


## Telegram 通知

系统支持通过 Telegram 机器人接收新评论通知，并支持快捷审核。

### 功能特性

- **实时通知**：新评论会立即推送到指定的 Telegram 账号或群组
- **快捷审核**：通知消息包含"批准"按钮，无需登录后台即可审核

### 配置步骤

{% steps %}

{% step 创建机器人 %}

- 在 Telegram 中搜索 `@BotFather`
- 发送 `/newbot` 命令，按照提示创建新机器人
- 获取 **API Token**
{% endstep %}

{% step 获取 Chat ID %}

- 如果是个人接收，给你的机器人发送一条消息
- 访问 `https://api.telegram.org/bot<YourBOTToken>/getUpdates` 查看 `chat.id`
- 或者使用 `@userinfobot` 获取你的 ID
- 如果是群组，将机器人拉入群组，并获取群组 ID（通常以 `-` 开头）
{% endstep %}

{% step 后台设置 %}

- 登录评论系统后台
- 进入"设置" → "Telegram 通知设置"
- 填入 **Bot Token** 和 **Chat ID**
- 开启 **Telegram 通知** 开关
- 点击 **保存**
- 点击 **一键设置 Webhook**（重要：必须执行此步骤，机器人才能接收按钮点击事件）
{% endstep %}

{% endsteps %}

::: danger 重要提示
配置完成后，必须点击「一键设置 Webhook」按钮，否则 Telegram 机器人无法接收按钮点击事件，快捷审核功能将无法使用。
:::


## 安全设置

VWD 提供多维度的安全防护机制，有效防范垃圾评论与恶意攻击。

### 管理员评论密钥

设置管理员评论密钥后，博主在前台使用管理员邮箱发表评论时，需要先输入正确的密钥进行身份验证。验证通过的评论将直接视为已审核，通过「先审核再显示」的限制。

::: warning 安全机制
- 同一 IP 连续验证失败 3 次后，将触发风控并锁定该 IP 30 分钟
- 失败次数的统计有效期为 1 小时，超过 1 小时未再尝试会自动清零
:::

### 其他安全配置

{% card red 域名白名单 %}
配置允许调用的域名，多个域名用逗号或换行分隔，留空表示不做限制。配置后，仅当当前访问页面的域名在列表中时，前台评论组件才会正常加载。
{% endcard %}

{% card orange 评论审核 %}
开启后，普通用户提交的新评论默认状态为"待审核"，需在后台审核通过后才会显示。关闭时，新评论将在通过基础校验后直接公开展示。
{% endcard %}

{% card red IP 黑名单 %}
支持多个 IP，用逗号或换行分隔，留空表示不限制。匹配到的 IP 在提交评论时会被直接拒绝，适合用于临时封禁恶意刷评或攻击来源。
{% endcard %}

{% card red 邮箱黑名单 %}
支持多个邮箱，用逗号或换行分隔，留空表示不限制。匹配到的邮箱在提交评论时会被直接拒绝，适合用于屏蔽垃圾邮箱或可疑机器人账号。
{% endcard %}


## 数据迁移与备份

### 评论数据迁移

VWD 支持从其他评论框架导入数据，方便无缝切换。

{% badge VWD, blue, pill %} {% badge Twikoo, green, pill %} {% badge Artalk, orange, pill %} {% badge Valine, purple, pill %}

**使用方法：**

在 `后台管理 > 数据管理 > 评论数据` 区块下：

- 使用「导出 JSON」按钮，可导出当前所有评论数据（VWD 原生格式），用于备份或在其他环境恢复
- 使用「导入评论」按钮，先在下拉框中选择要导入的框架类型，再选择本地 JSON 文件进行导入

::: tip 智能匹配
迁移程序会自动判断是否包含域名前缀（因部分框架默认不输出域名前缀），然后可以自定义前缀。
:::

### 其他数据导入导出

在 `后台管理 > 数据管理` 页面，还提供以下操作：

- **系统配置**：导出 / 导入 Settings 表中的配置（评论设置、邮件设置、功能开关等）
- **访问统计**：导出 / 导入页面访问量、按日访问和点赞明细
- **全量备份**：一键导出或导入「评论 + 配置 + 统计」全部数据，适合整站迁移或备份恢复

### S3 自动备份

VWD 支持 S3 兼容存储自动备份，兼容 AWS S3 / Cloudflare R2 / MinIO。

{% btns rounded center %}
{% btn https://aws.amazon.com/s3/, AWS S3, fa-cloud, orange %}
{% btn https://www.cloudflare.com/products/r2/, Cloudflare R2, fa-cloud, blue %}
{% btn https://min.io/, MinIO, fa-cloud, red %}
{% endbtns %}

**配置 S3：**

在后台「设置」→「S3 备份配置」中填写：

| 字段 | 说明 | 示例 |
| --- | --- | --- |
| Endpoint | S3 服务地址 | `https://s3.amazonaws.com` |
| Region | 区域 | `us-east-1` |
| Bucket | 存储桶名 | `vwd-backup` |
| Access Key | 访问密钥 ID | `your-access-key` |
| Secret Key | 访问密钥 | `your-secret-key` |

**使用方式：**

- **手动备份**：点击「立即备份」按钮触发一次备份
- **备份列表**：查看历史备份文件，支持下载和删除
- **恢复**：选择备份文件进行恢复


## 功能开关

在 `网站设置` > `功能开关` 中，可以控制各项功能的开启状态和个性化配置。

### 点赞功能

| 功能 | 说明 | 默认状态 |
| --- | --- | --- |
| 评论点赞 | 用户可以对评论进行点赞操作 | 开启 |
| 文章点赞 | 每篇文章底部显示点赞按钮 | 开启 |
| 说说点赞 | 用户可以对说说进行点赞操作 | 开启 |

### 图片预览

控制是否启用评论内容中图片的灯箱预览功能。开启后，评论中的图片可以点击放大查看，再次点击关闭。功能默认关闭，可根据需要开启。

### 表情系统

- **表情开关**：控制是否启用表情功能，开启后评论框中会显示表情选择器
- **自定义表情包路径**：支持配置自定义表情包路径（Waline 风格），可使用 unpkg 等 CDN 地址。内置阿鲁表情包和颜文字

### 个性化设置

- **评论框提示文案**：自定义评论输入框的提示文字，支持换行，留空则使用默认值"发表你的看法..."
- **主题色**：自定义评论组件的主题色（hex 格式），如 `#0969da`，也可在前端实例化时通过 `primaryColor` 参数指定


## API 概览

### 公开 API

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/comments` | 获取评论列表 |
| POST | `/api/comments` | 提交评论 |
| POST | `/api/comments/like` | 评论点赞 |
| DELETE | `/api/comments/like` | 取消评论点赞 |
| POST | `/api/verify-admin` | 管理员评论验证 |
| GET | `/api/like` | 获取文章点赞状态 |
| POST | `/api/like` | 文章点赞 |
| GET | `/api/says` | 获取说说列表 |
| GET | `/api/says/:id` | 获取单条说说 |
| POST | `/api/says/like` | 说说点赞 |
| GET | `/api/config/comments` | 获取公开配置（含表情包路径） |
| GET | `/api/health` | 健康检查 |

### 管理 API（需鉴权）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/api/admin/login` | 管理员登录 |
| GET | `/api/admin/comments/list` | 评论列表 |
| DELETE | `/api/admin/comments/delete` | 删除评论 |
| PUT | `/api/admin/comments/status` | 更新评论状态 |
| PUT | `/api/admin/comments/update` | 编辑评论 |
| GET/PUT | `/api/admin/settings/*` | 各项设置 |
| GET/POST | `/api/admin/export/*` | 数据导出 |
| POST | `/api/admin/import/*` | 数据导入 |
| GET | `/api/admin/stats/*` | 评论统计 |
| GET/POST/PUT/DELETE | `/api/admin/says/*` | 说说管理 |
| GET/PUT | `/api/admin/settings/says` | 说说设置 |

::: warning 鉴权说明
所有管理 API（除 login 外）需在请求头中携带 `Authorization: Bearer <token>`。
:::


## 环境变量

| 变量 | 必需 | 说明 |
| --- | --- | --- |
| `POSTGRES_URL` | 是 | Vercel Postgres 连接地址（Vercel 自动注入） |
| `KV_REST_API_URL` | 是 | Vercel KV REST API 地址（Vercel 自动注入） |
| `KV_REST_API_TOKEN` | 是 | Vercel KV REST API Token（Vercel 自动注入） |

::: tip 无需环境变量的配置
管理员账号和密码在部署后通过 `/admin/` 页面首次设置，存储在数据库中。以下配置均在 Admin 后台的设置页面中配置：

- **管理员账户**：首次部署时通过页面设置
- **SMTP 配置**：发件邮箱、SMTP 服务器、端口、授权码
- **Telegram 配置**：Bot Token、Chat ID
- **S3 配置**：Endpoint、Region、Bucket、Access Key、Secret Key
:::


## 数据库表结构

| 表名 | 说明 |
| --- | --- |
| `Comment` | 评论数据（昵称、邮箱、内容、状态、点赞数等） |
| `Settings` | 系统设置（键值对存储） |
| `Likes` | 点赞记录（文章点赞、说说点赞，按 user_id 去重） |
| `Say` | 说说/动态（Markdown 内容、状态、标签等） |


## 本地开发

{% folding blue 本地开发命令 %}

```bash
# 一键安装所有依赖（根目录 + admin + widget）
npm run install:all

# 启动 Vercel Dev（包含 API + Admin 热更新）
npm run dev

# 单独开发 Admin 前端
cd admin && npm run dev

# 单独开发 Widget
cd widget && npm run dev
```

> 项目包含三个独立的 `package.json`（根目录服务端、`admin/` 后台前端、`widget/` 评论组件），`npm run install:all` 会一次性安装全部三个目录的依赖。
>
> Admin 和 Widget 通过 `@shared` 别名引用 `scripts/emoji.js` 中的共享表情逻辑。Vite 配置中 `@shared` 分别指向 `../scripts`。
{% endfolding %}

{% folding green 构建脚本 %}

```bash
# 完整构建（Widget + Admin 前端）
npm run build

# 仅构建 Widget
npm run build:widget

# 仅构建 Admin 前端
npm run build:admin

# 初始化数据库
npm run db:init

# 部署到 Vercel
npm run deploy
```

> 表情图片资源（`public/emotion/`）已随仓库提交，构建时无需额外复制步骤。
{% endfolding %}


## 常见问题

{% folding 设置完 siteId 后，评论区不显示旧的评论数据？ %}
因为设置了 siteId 后，接口会根据 siteId 来查询数据库带有你设置的 siteId 的评论数据。旧数据需要手动去 Vercel Postgres 控制台执行 SQL 语句来更新：

```sql
-- abc 替换为你要设置的 siteId
-- example.com 替换为查找包含指定域名的评论数据
UPDATE "Comment" SET site_id = 'abc' WHERE post_url LIKE '%example.com%';
```

运行以上 SQL 语句后，评论区就会显示带有 `abc` siteId 的评论数据了。
{% endfolding %}

{% folding 评论框不显示 %}

- 检查浏览器控制台是否有报错
- 确认 `apiBaseUrl` 地址正确，**末尾不要加 `/`**
- 确认 `vwd.js` 能正常加载（在浏览器地址栏直接访问该 URL）
- 确认 `el` 选择器对应的元素存在于页面中
{% endfolding %}

{% folding 评论提交后不显示 %}

- 登录管理后台 `/admin/`，检查是否开启了「评论审核」（开启后新评论需手动审批）
- 检查评论是否被 `IP/邮箱黑名单` 拦截
{% endfolding %}

{% folding 指定文章的自定义标识 %}
默认情况下，VWD 使用页面路径（`window.location.pathname`）作为文章标识。如果你的文章 URL 变了（比如换了域名或路径结构），评论会丢失。可以通过显式指定 `postSlug` 来固定标识：

```js
new VWDComments({
  el: '#vwd-comments',
  apiBaseUrl: 'https://your-project.vercel.app',
  postSlug: 'my-first-post'  // 使用固定标识，不随 URL 变化
}).mount();
```
{% endfolding %}

{% folding 邮件通知不生效 %}

- 在 `/admin/settings` 中正确配置 SMTP 服务器、端口、发件邮箱、授权码
- 注意 QQ 邮箱使用授权码而非密码，163 邮箱同理
- 检查服务器是否屏蔽了邮件端口
{% endfolding %}

{% folding Telegram 通知不生效 %}

- 在 `/admin/settings` 中配置 Bot Token 和 Chat ID
- Chat ID 可以通过给 @userinfobot 发消息获取
- 确认 Bot 已被加入到目标群组（如果发到群组）
- 确认已点击「一键设置 Webhook」
{% endfolding %}

{% folding Vercel 构建报 SyntaxError %}
确保修改的源文件使用 UTF-8 编码（无 BOM），否则 Vercel 构建时可能报 `SyntaxError: Invalid or unexpected token`。
{% endfolding %}

{% folding 文档站如何访问 %}
部署成功后，文档站地址为：

```
https://your-project.vercel.app/doc/
```

也可以通过 `/doc`（不带斜杠）访问，会自动重定向到 `/doc/`。
{% endfolding %}


## 后续更新

GitHub 仓库推送代码后，Vercel 会**自动拉取并重新构建部署**，无需任何手动操作。

```bash
git add .
git commit -m "update: your changes"
git push origin main
# Vercel 自动触发部署
```

::: warning 编码注意
确保修改的源文件使用 UTF-8 编码（无 BOM），否则 Vercel 构建时可能报 `SyntaxError: Invalid or unexpected token`。
:::


## 总结

VWD 评论系统是一款基于 Vercel Serverless 平台的免服务器、极速安全、即插即用评论系统，具有以下优势：

| 特性 | 说明 |
| --- | --- |
| {% badge 免费, green, pill %} | 基于 Vercel 免费计划，个人博客部署成本为零 |
| {% badge 快速, blue, pill %} | Vercel 边缘网络全球 CDN 加速，毫秒级响应 |
| {% badge 安全, red, pill %} | IP/邮箱黑名单、域名白名单、评论审核、XSS 过滤 |
| {% badge 功能丰富, purple, pill %} | 评论、说说、点赞、表情、邮件通知、Telegram 通知 |
| {% badge 易集成, orange, pill %} | 一行代码嵌入，Shadow DOM 样式隔离，支持多种框架 |
| {% badge 可迁移, cyan, pill %} | 支持 Twikoo、Artalk、Valine 数据导入，S3 自动备份 |

如果你喜欢这个项目，欢迎在 GitHub 上 Star 支持！

{% btns rounded center %}
{% btn https://github.com/s-Ruthless/Vercel-Workers-Discuss, Star 支持, fa-star, red %}
{% btn https://github.com/s-Ruthless/Vercel-Workers-Discuss/issues, 问题反馈, fa-comment, blue %}
{% endbtns %}

{% divider fa-heart, VWD %}
