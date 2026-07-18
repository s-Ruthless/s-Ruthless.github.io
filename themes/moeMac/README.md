<div align="center">

# moeMac

一个仿 macOS 桌面体验的 Hexo 主题

Dock 导航 · 浮动窗口 · 毛玻璃质感 · 暗黑模式

[![Hexo](https://img.shields.io/badge/Hexo-8.0+-orange?logo=hexo)](https://hexo.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/Node-18+-green?logo=node.js)](https://nodejs.org)

**[在线演示](https://moeao.cn) · [完整文档](#完整文档) · [常见问题](#常见问题)**

</div>

---

## 简介

moeMac 是一个 Hexo 主题，将你的博客变成一个 macOS 桌面：Dock 导航栏、可拖拽的浮动窗口、红绿灯按钮、毛玻璃质感。支持暗黑模式、音乐播放器、AJAX 无刷新导航、移动端适配。

<div align="center">

| 桌面端 | 移动端 |
|---|---|
| ![桌面端](./screenshot/screenshot.png) | ![移动端](./screenshot/screenshot_mobile.png) |

</div>

## 特性

- 🖥️ macOS 桌面体验 — Dock 导航栏、可拖拽浮动窗口、红绿灯按钮、窗口置顶/最小化
- 🌙 暗黑模式 — 一键切换，全站适配（含代码高亮、评论区自动同步）
- 🎵 音乐播放器 — APlayer + Meting，支持网易云 / QQ 音乐 / 酷狗等平台歌单
- 💬 多评论系统 — Giscus / Waline / Twikoo / Gitalk / CWD / VWD，暗黑模式自动切换
- 📢 动态说说 — VWD 说说系统，发布短动态（mode: says）
- 📰 RSS 订阅 — 内置生成器，自动输出 atom.xml，无需安装插件
- 🗺️ 站点地图 — 内置生成器，自动输出 sitemap.xml
- 🔗 SEO 短链接 — 内置 abbrlink，根据标题生成 CRC32 哈希短链接
- 🔍 站内搜索 — 基于 hexo-generator-searchdb
- 📚 豆瓣书影音 — 内置抓取脚本，无需安装额外插件
- ⚡ AJAX 导航 — 无刷新页面切换 + 过渡动画
- 🗂️ 多布局文章列表 — 10 种布局可选（网格/列表/极简/杂志/大卡片/紧凑/时间线/封面叠加/特色卡片/Z字形）
- 📐 KaTeX 数学公式 / 📊 Mermaid 图表 / 🏷️ 丰富的标签外挂
- ✨ 动画系统 — CSS @keyframes + IntersectionObserver + Web Animations API，零外部依赖
- 📱 响应式适配 — 移动端独立布局

## 快速开始

### 1. 克隆主题

```bash
cd your-hexo-blog
git clone https://github.com/s-Ruthless/s-Ruthless.github.io.git themes/moeMac
```

### 2. 启用主题

编辑站点 `_config.yml`：

```yaml
theme: moeMac
permalink: posts/:abbrlink.html  # SEO 短链接（推荐）
```

### 3. 安装搜索插件（可选）

```bash
npm install hexo-generator-searchdb
```

> 不需要搜索可跳过，在主题 `_config.yml` 中设置 `search: false`。

### 4. 创建页面

```bash
hexo new page posts     # 文章列表页
hexo new page gallery   # 相册
hexo new page about     # 关于
hexo new page links     # 友链
hexo new page douban    # 豆瓣书影音
hexo new page dynamic   # 动态说说（VWD says）
```

各页面 `index.md` 需设置对应 `layout`，详见[完整文档](#完整文档)。

### 5. 启动

```bash
hexo clean && hexo server
```

打开 `http://localhost:4000` 即可预览。

## 依赖说明

### hexo init 自带（无需手动安装）

`hexo` · `hexo-server` · `hexo-renderer-ejs` · `hexo-renderer-marked` · `hexo-renderer-stylus` · `hexo-generator-archive` · `hexo-generator-category` · `hexo-generator-tag` · `hexo-generator-index`

### 需手动安装

| 插件 | 说明 | 必装？ |
|---|---|---|
| `hexo-generator-searchdb` | 站内搜索 | 否 |

### 无需任何插件（主题内置）

SEO 短链接、RSS、Sitemap、豆瓣书影音、标签外挂、TOC 目录、KaTeX 公式、Mermaid 图表、音乐播放器、评论系统、动态说说、暗黑模式、AJAX 导航 — 全部由主题 `scripts/` 内置实现，零外部 npm 依赖。

## 静态资源

所有第三方 CSS / JS / 字体均已本地化到 `source/assets/`，**不依赖任何外部 CDN**。

本地化的库包括：APlayer、Meting、KaTeX、Mermaid、Font Awesome、Gitalk、Waline、Twikoo、CWD、卜算子。

> 唯一的外部引用是 Giscus 评论系统的 `giscus.app/client.js`（官方要求，不可本地化）。VWD 评论系统的 `vwd.js` 默认从 API 服务器远程加载，也可下载到本地使用。Hitokoto / Meting API 属于实时数据接口，非静态资源。

## 目录结构

```
themes/moeMac/
├── _config.yml              # 主题配置
├── layout/                  # EJS 模板
│   ├── layout.ejs           # 基础布局
│   ├── index.ejs            # 首页（浮动窗口桌面）
│   ├── post.ejs             # 文章详情
│   └── _partial/            # 局部模板（head/scripts/dock/comments 等）
├── scripts/                 # Hexo 构建时脚本（Node.js，不可 CDN 引用）
│   ├── abbrlink.js          # SEO 短链接（CRC32）
│   ├── rss.js               # RSS 生成器
│   ├── sitemap.js           # 站点地图生成器
│   ├── douban-sync.js       # 豆瓣抓取脚本
│   ├── tag-plugins.js       # 标签外挂
│   ├── container-blocks.js  # 容器块语法
│   ├── helpers.js           # TOC 目录
│   ├── katex-render.js      # KaTeX 公式
│   └── mermaid-render.js    # Mermaid 图表
└── source/
    └── assets/
        ├── css/             # 所有样式（全部本地化）
        ├── js/              # 所有脚本（全部本地化）
        └── fonts/           # 字体（KaTeX + Font Awesome，本地化）
```

> `scripts/` 下的文件运行在 Node.js 服务端，通过 `hexo.extend.*` 注册钩子，不输出到前端，不可 CDN 引用。

## 技术栈

Hexo + EJS · 原生 CSS + CSS 变量 · CSS @keyframes + Web Animations API · APlayer + Meting · KaTeX · Mermaid · Font Awesome · 内联 SVG 社交图标

## 完整文档

详细的配置说明（基本信息、社交链接、Dock 导航、首页窗口、音乐播放器、评论系统、动态说说、豆瓣书影音、相册、壁纸、一言、SEO 短链接、RSS、Sitemap、KaTeX、Mermaid、搜索、CDN 加速等）请参阅：

**[moeMac 主题使用说明](https://moeao.cn/posts/ada921dd.html)**

## 常见问题

<details>
<summary>CSS/JS 修改后不生效？</summary>

修改后在 `head.ejs` / `scripts.ejs` 中递增版本号 `?v=xxx`。
</details>

<details>
<summary>abbrlink 没有生成？</summary>

1. 主题 `_config.yml` 中 `abbrlink: true`
2. 站点 `_config.yml` 中 `permalink: posts/:abbrlink.html`
3. 运行 `hexo clean && hexo generate`

> `true`：始终根据 title 算 CRC32，覆盖手写值；`false`：尊重 front-matter 中已有的值，没有才生成。
</details>

<details>
<summary>音乐播放器不显示？</summary>

确认 `playlist_id` 已填写、`meting_api` 可访问、`home_windows` 包含 `"music"`。
</details>

<details>
<summary>评论不显示？</summary>

检查 `comments.enable: true` 且对应 provider 配置完整。
</details>

## 浏览器兼容

Chrome / Edge 88+ · Firefox 87+ · Safari 14+ · 移动端 Safari / Chrome

> 需要 `backdrop-filter` 和 `color-mix()` 支持。

## 贡献

欢迎提交 Issue 和 Pull Request。

1. Fork 本仓库
2. 创建分支（`git checkout -b feature/amazing-feature`）
3. 提交更改（`git commit -m 'Add amazing feature'`）
4. 推送（`git push origin feature/amazing-feature`）
5. 提交 Pull Request

## 开源协议

[MIT License](./LICENSE) © 2026 [梦繁星](https://github.com/s-Ruthless)

## 致谢

[Hexo](https://hexo.io) · [APlayer](https://aplayer.js.org) + [MetingJS](https://github.com/metowolf/MetingJS) · [KaTeX](https://katex.org) · [Mermaid](https://mermaid.js.org) · [Font Awesome](https://fontawesome.com) · [Giscus](https://giscus.app) · [CWD](https://cwd.js.org/) · VWD
