---
title: moeMac 主题使用说明
date: 2026-07-11 10:00:00
cover: https://picsum.photos/seed/moemac-guide/600/400
sticky: 2
tags:
  - 前端
  - 工具
categories:
  - 技术
---

moeMac 是一款 **macOS 桌面风格** 的 Hexo 主题，采用毛玻璃（Glassmorphism）设计语言，支持可拖拽窗口、Dock 导航栏、AJAX 无刷新切换、暗黑模式等特性。本文是主题的完整使用指南。

> **提示**：本文涵盖从安装到进阶配置的所有内容，建议先通读一遍，再按需查阅。

<!-- more -->

---

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

### 必装插件

moeMac 额外依赖以下 Hexo 插件（`hexo init` 自带的不在此列）：

```bash
npm install hexo-generator-searchdb hexo-generator-archive hexo-generator-category hexo-generator-tag
```

### 启动预览

```bash
hexo clean && hexo server
```

打开 `http://localhost:4000` 即可看到效果。

---

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
avatar_text: "屿"
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

---

## Dock 导航栏

Dock 栏位于屏幕底部，类似 macOS 的 Dock，支持站内页面和外部链接：

```yaml
dock:
  - { icon: "fas fa-house", label: "首页", page: "/", type: "page" }
  - { icon: "fas fa-newspaper", label: "文章", page: "/posts/", type: "page" }
  - { icon: "fas fa-folder-open", label: "归档", page: "/archives/", type: "page" }
  - { icon: "fas fa-images", label: "相册", page: "/gallery/", type: "page" }
  - { icon: "fas fa-link", label: "友链", page: "/links/", type: "page" }
  - { icon: "fas fa-heart", label: "关于", page: "/about/", type: "page" }
  - { icon: "fas fa-rss", label: "RSS", page: "https://example.com/rss", type: "link" }
```

- `icon`：Font Awesome 图标类名
- `type: "page"` 为站内页面（AJAX 加载），`type: "link"` 为外链（新窗口打开）

---

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

---

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

---

## 评论系统

支持 Waline / Twikoo / Giscus / Gitalk / CWD 五种评论系统：

```yaml
comments:
  enable: true
  provider: "waline"  # waline / twikoo / giscus / gitalk / cwd
```

### Waline

```yaml
waline:
  serverURL: "https://your-waline.vercel.app"
```

### Giscus（基于 GitHub Discussions）

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

### 页面级控制

在文章/页面的 front-matter 中：

```yaml
---
title: 不需要评论的文章
comment: false  # 关闭评论
---
```

---

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

---

## 相册页面

创建相册页面：

```bash
hexo new page gallery
```

在 `source/gallery/index.md` 中写入图片数据：

```yaml
---
title: 相册
type: gallery
---

var GALLERY_DATA = [
  { thumb: "/images/photo1.jpg", full: "/images/photo1.jpg", caption: "描述" },
  { thumb: "/images/photo2.jpg", full: "/images/photo2.jpg", caption: "描述" }
];
```

相册页面使用瀑布流布局，点击图片可打开灯箱查看大图。

---

## 壁纸设置

```yaml
wallpaper_path: "/assets/img/background.webp"
```

留空则使用默认渐变背景。支持本地路径和网络 URL。

---

## 一言 / 每日一句

```yaml
hitokoto: true                    # true: 使用一言 API
hitokoto_api: "https://v1.hitokoto.cn/"
sentences:                        # false 或 API 失败时的回退句子
  - "生活明朗，万物可爱。"
  - "愿你眼中有光，心中有爱。"
```

---

## 文章配置

### Front-matter 选项

```yaml
---
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
---
```

### 文章目录

```yaml
post:
  show_toc: true        # 显示目录
  toc_expand: false     # 二级目录是否默认展开
  show_date: true       # 显示发布日期
  copyright: true       # 版权声明
```

---

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

---

## CDN 加速

将 `source/assets/` 目录上传到 CDN，然后填写：

```yaml
cdn: "https://your-cdn.com/moemac/assets"
```

所有 CSS/JS/字体资源将自动走 CDN。

---

## 暗黑模式

点击页面右下角的月亮/太阳图标切换暗黑模式，选择会保存在 `localStorage` 中，下次访问自动应用。

---

## 标签外挂

moeMac 内置丰富的标签外挂，包括提示容器、标签页、折叠面板、轮播图、画廊、时间线、步骤条等。

详细语法请参考 [moeMac 标签外挂演示](/2026/06/30/moeMac主题标签外挂演示/) 一文。

---

## 网站信息

```yaml
site_info:
  icp: "备ICP号"           # ICP 备案号
  psbc: "公安备案号"        # 公安备案号
  start_date: "2023-01-01" # 建站日期
  copyright: "@2026"       # 版权声明
```

---

## 友链

```yaml
friends:
  - { name: "站点名", url: "https://example.com", avatar: "https://example.com/favicon.ico", description: "一句话描述" }
```

友链页面会自动渲染为卡片布局，支持 hover 动效。

---

## 响应式设计

- **桌面端**（>768px）：浮动窗口布局，支持拖拽、调整大小
- **移动端**（≤768px）：自动切换为单列卡片流布局，触摸友好的交互

主题会自动检测视口宽度并切换布局模式，跨越 768px 断点时会自动刷新页面。

---

## 常见问题

### 页面切换后动画不执行？

确保 `animations.js` 和 `main.js` 在页面中正确加载。AJAX 切换会自动重新触发动画。

### 音乐播放器不显示？

检查 Meting API 是否可用，歌单 ID 是否正确。可尝试更换 API 地址。

### 豆瓣抓取失败？

豆瓣有反爬机制，可尝试配置 `cookie` 字段，或适当降低抓取频率。

### 评论不显示？

检查评论系统配置是否正确，`provider` 与对应的配置字段是否匹配。

---

## 总结

moeMac 主题力求在美观与性能之间取得平衡，所有功能开箱即用。如果你喜欢这个主题，欢迎在 GitHub 上 Star 支持！

有问题或建议，欢迎留言交流。
