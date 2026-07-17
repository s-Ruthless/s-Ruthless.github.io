---
title: moeMac 主题使用说明
date: 2026-07-11 10:00:00
cover: https://picsum.photos/seed/moemac-guide/600/400
sticky: 2
tags:
  - Hexo
  - 教程
  - moeMac
categories:
  - 技术
abbrlink: "91ca8701"
---

moeMac 是一款 **macOS 桌面风格** 的 Hexo 主题，采用毛玻璃（Glassmorphism）设计语言，支持可拖拽窗口、Dock 导航栏、AJAX 无刷新切换、暗黑模式等特性。本文是主题的完整使用指南。

> **提示**：本文涵盖从安装到进阶配置的所有内容，建议先通读一遍，再按需查阅。

<!-- more -->


## 快速开始

### 安装主题

将 moeMac 主题克隆到 Hexo 博客的 `themes/` 目录：

```bash
cd your-hexo-blog
git clone https://github.com/s-Ruthless/moeMac.git themes/moeMac
```

然后在站点配置文件 `_config.yml` 中启用主题：

```yaml
theme: moeMac
```

### 插件说明

#### hexo init 自带插件（无需手动安装）

以下插件由 `hexo init` 自动安装，是 Hexo 的标准依赖：

| 插件 | 说明 |
|---|---|
| `hexo` | Hexo 核心 |
| `hexo-server` | 本地预览服务器 |
| `hexo-renderer-ejs` | EJS 模板渲染 |
| `hexo-renderer-marked` | Markdown 渲染 |
| `hexo-renderer-stylus` | Stylus 渲染 |
| `hexo-generator-archive` | 归档页生成 |
| `hexo-generator-category` | 分类页生成 |
| `hexo-generator-tag` | 标签页生成 |
| `hexo-generator-index` | 首页分页生成 |

#### 需手动安装的插件

moeMac 的搜索功能依赖 `hexo-generator-searchdb`（`hexo init` 不会自动安装）：

```bash
npm install hexo-generator-searchdb
```

> 不需要搜索功能可跳过，在主题 `_config.yml` 中设置 `search: false`。

#### 无需安装任何插件的功能

以下功能全部由主题内置脚本实现，零外部 npm 依赖：

| 功能 | 实现脚本 |
|---|---|
| SEO 短链接 | `scripts/abbrlink.js` — CRC32 哈希 |
| RSS 订阅 | `scripts/rss.js` — 生成 atom.xml |
| 站点地图 | `scripts/sitemap.js` — 生成 sitemap.xml |
| 豆瓣书影音 | `scripts/douban-sync.js` |
| 标签外挂 | `scripts/tag-plugins.js` + `scripts/container-blocks.js` |
| TOC 目录 | `scripts/helpers.js` |
| KaTeX 公式 | `scripts/katex-render.js` |
| Mermaid 图表 | `scripts/mermaid-render.js` |

> `themes/moeMac/scripts/` 下的 JS 文件是 Hexo 构建时脚本，运行在 Node.js 服务端，不可通过 CDN 引用。

### 启动预览

```bash
hexo clean && hexo server
```

打开 `http://localhost:4000` 即可看到效果。


## 基本配置

所有主题配置在 `themes/moeMac/_config.yml` 中完成。

### 站点信息

```yaml
blog_name: "你的博客名"
blog_description: "一句话描述<br>可换行"
author: "你的名字"
```

### 主题色

```yaml
accent_color: "#cf0226"
```

主题色会影响全站的强调色，包括链接、按钮、标签、Dock 高亮等。支持任何合法的 CSS 颜色值。

### 头像

支持图片头像和文字头像两种模式：

```yaml
# 图片头像
avatar_type: "image"
avatar_url: "https://example.com/avatar.jpg"

# 文字头像
avatar_type: "text"
avatar_text: "梦繁星"
```

### 社交链接

在首页「我的主页」窗口中显示社交按钮：

```yaml
social:
  - { type: "github", url: "https://github.com/yourname", label: "GitHub" }
  - { type: "email", url: "mailto:you@example.com", label: "邮箱" }
  - { type: "qq", url: "tencent://message/?uin=123456", label: "QQ" }
  - { type: "twitter", url: "https://twitter.com/yourname", label: "Twitter" }
  - { type: "bilibili", url: "https://space.bilibili.com/123456", label: "B站" }
  - { type: "zhihu", url: "https://www.zhihu.com/people/yourname", label: "知乎" }
  - { type: "link", url: "https://your-link.com", label: "自定义" }
```

### Favicon

```yaml
favicon: ""                    # 自定义 favicon 路径，留空则使用 emoji
favicon_emoji: "🌿"            # emoji 图标作为 favicon
```


## Dock 导航栏

Dock 栏位于屏幕底部，类似 macOS 的 Dock，支持站内页面和外部链接：

```yaml
dock:
  - { icon: "fas fa-house", label: "首页", page: "/", type: "page" }
  - { icon: "fas fa-newspaper", label: "文章", page: "/posts/", type: "page" }
  - { icon: "fas fa-folder-open", label: "归档", page: "/archives/", type: "page" }
  - { icon: "fas fa-images", label: "相册", page: "/gallery/", type: "page" }
  - { icon: "fas fa-book", label: "豆瓣", page: "/douban/", type: "page" }
  - { icon: "fas fa-comments", label: "动态", page: "/dynamic/", type: "page" }
  - { icon: "fas fa-link", label: "友链", page: "/links/", type: "page" }
  - { icon: "fas fa-heart", label: "关于", page: "/about/", type: "page" }
```

- `icon`：Font Awesome 图标类名
- `type: "page"` 为站内页面（AJAX 加载），`type: "link"` 为外链（新窗口打开）

> RSS 按钮由 `rss.show_in_home: true` 控制自动显示在主页社交图标区，无需在 Dock 中配置。


## 首页窗口

首页采用浮动窗口布局，可自由配置显示哪些窗口及排列顺序：

```yaml
home_windows:
  - "posts"       # 最新文章
  - "categories"  # 分类
  - "tags"        # 标签云
  - "music"       # 音乐播放器
  - "data"        # 站点数据
  - "info"        # 网站信息

recent_posts_count: 5  # 最新文章窗口显示的文章数
```

### 窗口交互

- **拖拽**：按住窗口标题栏可自由拖动位置
- **关闭/最小化**：点击窗口左上角红绿灯按钮
- **置顶**：点击绿色图钉按钮可将窗口置顶
- **调整大小**：拖动窗口右下角可调整大小
- **Dock 恢复**：最小化后点击 Dock 图标恢复窗口


## 音乐播放器

moeMac 内置音乐播放器，基于 MetingJS，支持网易云/QQ音乐/酷狗等平台：

```yaml
meting_api: "https://api.injahow.cn/meting/"  # Meting API 地址
platform: "netease"        # 音乐平台
playlist_id: "18117638485" # 歌单 ID
show_desktop_lyrics: true  # 桌面歌词
```

**获取歌单 ID**：打开网易云音乐网页版，找到你的歌单，URL 中的数字即为 ID。

> 推荐自建 Meting API 以避免公共 API 限流。


## 评论系统

支持 Waline / Twikoo / Giscus / Gitalk / CWD / VWD 六种评论系统：

```yaml
comments:
  enable: true
  provider: "waline"  # waline / twikoo / giscus / gitalk / cwd / vwd
```

### Waline

> 官方文档：[https://waline.js.org/](https://waline.js.org/)

```yaml
waline:
  serverURL: "https://your-waline.vercel.app"
```

### Twikoo

> 官方文档：[https://twikoo.js.org/](https://twikoo.js.org/)

```yaml
twikoo:
  envId: ""               # 腾讯云环境ID 或自建地址
```

### Giscus（基于 GitHub Discussions）

> 官方文档：[https://giscus.app/](https://giscus.app/)

```yaml
giscus:
  repo: "owner/repo"
  repoId: "R_xxx"
  category: "Announcements"
  categoryId: "DIC_xxx"
  mapping: "pathname"
  inputPosition: "top"
  reactionsEnabled: 0
  theme_light: "noborder_light"
  theme_dark: "noborder_dark"
```

### Gitalk（基于 GitHub Issues）

> 官方文档：[https://github.com/gitalk/gitalk](https://github.com/gitalk/gitalk)

```yaml
gitalk:
  clientID: ""
  clientSecret: ""
  repo: ""
  owner: ""
  admin: [""]
```

### CWD（基于 Cloudflare Workers）

> 官方文档：[https://cwd.js.org/](https://cwd.js.org/)

```yaml
cwd:
  apiBaseUrl: "https://your-cwd-api.workers.dev"
  siteId: "blog"
  lang: "auto"
```

### VWD（基于 Vercel Serverless）

VWD 是基于 Vercel Serverless 的评论系统，部署简单，适合个人博客使用。

> 官方文档：[https://github.com/s-Ruthless/Vercel-Workers-Discuss](https://github.com/s-Ruthless/Vercel-Workers-Discuss)

```yaml
vwd:
  apiBaseUrl: "https://your-vwd-api.vercel.app"  # VWD API 地址（Vercel 部署后的地址）
  jsUrl: ""               # vwd.js 脚本地址，留空则默认使用 apiBaseUrl + /vwd.js
  siteId: "blog"           # 站点标识，用于多站点数据隔离（推荐配置）
  lang: "auto"            # 评论组件语言，auto 自动检测浏览器语言
  customCssUrl: ''         # 自定义 CSS 地址，留空则使用默认样式
  primaryColor: '#cf0226'  # 主题色，影响按钮/链接等强调色
  saysEnable: true       # true 开启说说渲染（动态页面），false 关闭
  saysPageSize: 10       # 每页显示说说数（也可在 VWD 后台设置）
```

> **`jsUrl` 说明**：留空时默认从 API 服务器远程加载 `vwd.js`。也可填写自定义地址：
> - 远程地址（可加版本号刷新缓存）：`jsUrl: "https://vwd.moeao.cn/vwd.js?v=2"`
> - 本地路径（下载到本地后使用）：`jsUrl: "/assets/js/vwd.js"`

VWD 支持暗黑模式自动切换、Shadow DOM 隔离样式、评论数据本地存储等特性。

> VWD 还支持说说（动态/短博文）功能，详见下方[动态说说](#动态说说)章节。


### 页面级控制

在文章/页面的 front-matter 中：

```yaml
title: 不需要评论的文章
comment: false  # 关闭评论
```


## 动态说说

VWD 评论系统内置说说功能，博主可以在后台 `/admin/says` 发布说说，然后创建独立页面展示说说列表。

### 配置

说说功能直接在 `comments.vwd` 下配置，无需额外字段：

```yaml
comments:
  enable: true
  provider: "vwd"
  vwd:
    apiBaseUrl: "https://your-vwd-api.vercel.app"
    # ... 其他 VWD 配置 ...
    saysEnable: true       # true 开启说说渲染，false 关闭
    saysPageSize: 10       # 每页显示说说数（也可在 VWD 后台设置）
```

> 说说和评论共用同一套 VWD 配置（apiBaseUrl、siteId、lang 等），`saysEnable` 控制说说渲染开关，`saysPageSize` 控制每页条数。

### 创建动态页面

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

> `comment: true` 会在说说列表下方显示评论区，设为 `false` 则只显示说说。

### 工作原理

`page-dynamic` 布局直接从 `comments.vwd` 读取 VWD 配置，自动初始化 `VWDComments` 组件并设置 `mode: 'says'`，渲染说说列表。页面底部同时包含评论区（由 `comment` 开关控制）。

- 说说管理：在 VWD 后台 `/admin/says` 发布和管理说说
- 暗黑模式：自动同步切换
- 主题色：跟随 `comments.vwd.primaryColor`
- 站点隔离：跟随 `comments.vwd.siteId`

> 说说功能依赖 VWD 评论系统，需先在 `comments` 中配置 `provider: "vwd"` 并填写 `vwd.apiBaseUrl`。


## 豆瓣书影音

moeMac 支持自动抓取豆瓣书影音记录并展示。

### 自动抓取（推荐）

```yaml
douban:
  user_id: "your-douban-id"       # 豆瓣 ID
  auto_sync: true                  # hexo g 时自动同步
  sync_interval_hours: 24          # 同步间隔
```

运行 `npx hexo douban` 可手动触发抓取，数据保存在 `source/_data/douban.json`。

### 手动配置

```yaml
douban:
  books:
    - { name: "书名", cover: "封面URL", rating: 9, date: "2026-01-01", note: "读后感" }
  movies:
    - { name: "电影名", cover: "封面URL", rating: 8, date: "2026-01-01", note: "观后感" }
```


## 相册页面

创建相册页面：

```bash
hexo new page gallery
```

在 `source/gallery/index.md` 中使用 **Markdown 图片语法** 写入图片数据：

```markdown
title: 相册
layout: gallery
date: 2026-07-05 22:00:00

<!-- 相册管理说明：
  每张图片用 Markdown 语法编写，格式：![标题](缩略图地址)
  如需指定大图（灯箱查看），在大图URL前加 "large:" 前缀写在图片下方一行
-->

![山间河流](https://example.com/photo1-small.jpg)
large: https://example.com/photo1-large.jpg

![云海山脉](https://example.com/photo2-small.jpg)
large: https://example.com/photo2-large.jpg
```

- **缩略图**：`![标题](缩略图URL)` — 必填
- **大图**：`large: 大图URL` — 可选，不写则用缩略图作为大图
- **标题**：`![]` 中的文字 — 可选，显示在图片悬浮层

相册页面使用瀑布流布局，支持无限滚动加载，点击图片可打开灯箱查看大图。


## 壁纸设置

```yaml
wallpaper_path: "/assets/img/background.webp"
```

留空则使用默认渐变背景。支持本地路径和网络 URL。


## 一言 / 每日一句

```yaml
hitokoto: true                    # true: 使用一言 API
hitokoto_api: "https://v1.hitokoto.cn/"
sentences:                        # false 或 API 失败时的回退句子
  - "生活明朗，万物可爱。"
  - "愿你眼中有光，心中有爱。"
```


## 文章配置

### Front-matter 选项

```yaml
title: 文章标题
date: 2026-07-11 10:00:00
cover: https://example.com/cover.jpg   # 封面图
sticky: 1                               # 置顶（数值越大越靠前）
tags:
  - 标签1
  - 标签2
categories:
  - 分类
comment: true       # 是否显示评论（默认 true）
copyright: true     # 是否显示版权声明（默认 true）
```

### 文章目录

```yaml
post:
  show_toc: true        # 显示目录
  toc_expand: false     # 二级目录是否默认展开
  show_date: true       # 显示发布日期
  copyright: true       # 版权声明
```


## SEO 短链接（abbrlink）

主题内置 abbrlink 生成器，根据文章标题自动生成 CRC32 哈希短链接，URL 稳定且对 SEO 友好。

```yaml
abbrlink: true  # true: 始终根据 title 算 CRC32，覆盖手写值；false: 尊重手写值，没有才生成
```

文章 URL 格式为 `posts/b8e72f3a.html`（8 位十六进制哈希）。同一标题永远生成相同哈希，URL 稳定不变。

需在站点 `_config.yml` 中设置：

```yaml
permalink: posts/:abbrlink.html
```

运行 `hexo generate` 时会自动为所有文章生成 abbrlink 并写入 front-matter，始终根据 title 计算，确保链接一致性。


## RSS 订阅

内置 RSS 生成器，自动输出 `atom.xml`（标准 RSS 2.0 格式），无需安装任何插件。

```yaml
rss:
  enable: true
  path: atom.xml       # 输出文件路径
  limit: 20            # 输出文章数量（0 = 全部）
  content: true        # true 包含全文 / false 仅摘要
  show_in_home: true   # true: 主页社交图标区自动显示 RSS 按钮
```

读者可通过浏览器自动发现的 RSS 链接或直接访问 `https://你的域名/atom.xml` 订阅。


## 站点地图（Sitemap）

内置站点地图生成器，自动输出 `sitemap.xml`，供搜索引擎抓取。

```yaml
sitemap:
  enable: true
  path: sitemap.xml
```

生成后可提交到 [Google Search Console](https://search.google.com/search-console) 或百度站长平台。


## 搜索

moeMac 内置站内搜索，基于 `hexo-generator-searchdb` 插件：

```bash
npm install hexo-generator-searchdb
```

在站点 `_config.yml` 中配置：

```yaml
search:
  path: search.xml
  field: post
  format: html
  limit: 10000
```

在主题配置中开启：

```yaml
search: true
```


## CDN 加速

将 `source/assets/` 目录上传到 CDN，然后填写：

```yaml
cdn: "https://your-cdn.com/moemac/assets"
```

所有 CSS/JS/字体资源将自动走 CDN。


## 暗黑模式

点击页面右下角的月亮/太阳图标切换暗黑模式，选择会保存在 `localStorage` 中，下次访问自动应用。


## 标签外挂

moeMac 内置丰富的标签外挂，包括提示容器、标签页、折叠面板、轮播图、画廊、时间线、步骤条、文章引用卡片等。

详细的语法教程和效果演示请查看下方文章：

{% postcard /posts/75bba892.html %}


## 网站信息

```yaml
site_info:
  icp: "备ICP号"           # ICP 备案号
  psbc: "公安备案号"        # 公安备案号
  start_date: "2023-01-01" # 建站日期
  copyright: "@2026"       # 版权声明
```


## 友链

```yaml
friends:
  - { name: "站点名", url: "https://example.com", avatar: "https://example.com/favicon.ico", description: "一句话描述" }
```

友链页面会自动渲染为卡片布局，支持 hover 动效。


## 响应式设计

- **桌面端**（>768px）：浮动窗口布局，支持拖拽、调整大小
- **移动端**（≤768px）：自动切换为单列卡片流布局，触摸友好的交互

主题会自动检测视口宽度并切换布局模式，跨越 768px 断点时会自动刷新页面。


## 常见问题

### 页面切换后动画不执行？

确保 `animations.js` 和 `main.js` 在页面中正确加载。AJAX 切换会自动重新触发动画。

### 音乐播放器不显示？

检查 Meting API 是否可用，歌单 ID 是否正确。可尝试更换 API 地址。

### 豆瓣抓取失败？

豆瓣有反爬机制，可尝试配置 `cookie` 字段，或适当降低抓取频率。

### 评论不显示？

检查评论系统配置是否正确，`provider` 与对应的配置字段是否匹配。


## 总结

moeMac 主题力求在美观与性能之间取得平衡，所有功能开箱即用。如果你喜欢这个主题，欢迎在 GitHub 上 Star 支持！

有问题或建议，欢迎留言交流。
