# moeMac — macOS 风格 Hexo 主题

一个仿 macOS 桌面体验的 Hexo 主题，Dock 导航 + 浮动窗口 + 毛玻璃质感。

## 特性

- 🖥️ **macOS 桌面体验**：Dock 导航栏、可拖拽浮动窗口、红绿灯按钮
- 🌙 **暗黑模式**：一键切换，自动同步评论区
- 🎵 **音乐播放器**：基于 APlayer + Meting，支持网易云/QQ音乐等平台歌单
- 💬 **多评论系统**：支持 Giscus / Waline / Twikoo / Gitalk
- 🔍 **站内搜索**：基于 hexo-generator-searchdb
- 📊 **归档统计**：年度文章数量 SVG 折线图
- 🖼️ **相册页面**：瀑布流布局 + 灯箱查看
- 📚 **豆瓣书影音**：手动配置或自动抓取
- ⚡ **AJAX 导航**：无刷新页面切换 + 过渡动画
- 📱 **响应式**：适配移动端

## 安装

### 1. 克隆主题

```bash
cd your-hexo-blog
git clone https://gitee.com/s-Ruthless/s-ruthless.git themes/moeMac
```

### 2. 安装依赖

主题依赖以下 Hexo 插件（需在站点根目录 `package.json` 中声明）：

| 插件 | 用途 | 必须 |
|---|---|---|
| `hexo-renderer-ejs` | EJS 模板渲染 | ✅ |
| `hexo-renderer-marked` | Markdown 渲染 | ✅ |
| `hexo-generator-archive` | 归档页生成 | ✅ |
| `hexo-generator-category` | 分类页生成 | ✅ |
| `hexo-generator-tag` | 标签页生成 | ✅ |
| `hexo-generator-index` | 首页分页 | ✅ |
| `hexo-generator-searchdb` | 站内搜索索引 | ⚡ 启用搜索时需要 |

> **豆瓣抓取**不需要额外插件——主题自带 `scripts/douban-sync.js` 脚本，使用 Node.js 原生模块。
> **音乐播放器**不需要额外插件——前端 JS 加载 APlayer + Meting。

在站点根目录 `package.json` 中确保有以下依赖：

```json
{
  "dependencies": {
    "hexo": "^8.0.0",
    "hexo-generator-archive": "^2.0.0",
    "hexo-generator-category": "^2.0.0",
    "hexo-generator-index": "^4.0.0",
    "hexo-generator-searchdb": "^1.5.0",
    "hexo-generator-tag": "^2.0.0",
    "hexo-renderer-ejs": "^2.0.0",
    "hexo-renderer-marked": "^7.0.0",
    "hexo-renderer-stylus": "^3.0.1",
    "hexo-server": "^3.0.0"
  }
}
```

然后执行：

```bash
npm install
```

### 3. 启用主题

编辑站点 `_config.yml`：

```yaml
theme: moeMac
```

### 4. 配置搜索

在站点 `_config.yml` 末尾添加：

```yaml
search:
  path: search.xml
  field: post
  content: true
  format: html
  limit: 10000
```

### 5. 创建必要页面

```bash
hexo new page posts    # 文章列表页
hexo new page archives  # 归档页（自动生成，无需手动创建）
hexo new page gallery   # 相册
hexo new page about     # 关于
hexo new page links     # 友链
hexo new page douban    # 豆瓣书影音
```

编辑各页面的 `index.md`，设置对应的 `layout`：

```yaml
# source/posts/index.md
---
title: 文章
layout: posts-wall
---

# source/gallery/index.md
---
title: 相册
layout: gallery
---

# source/about/index.md
---
title: 关于
layout: page-about
comment: true
---

# source/links/index.md
---
title: 友链
layout: page-links
comment: true
---

# source/douban/index.md
---
title: 豆瓣
layout: page-douban
---
```

## 配置说明

编辑 `themes/moeMac/_config.yml`，以下是**必须配置**的项目：

### 基本信息

```yaml
blog_name: "你的博客名"
author: "你的名字"
```

### 头像

```yaml
# 方式一：文字头像
avatar_type: "text"
avatar_text: "我"

# 方式二：图片头像
avatar_type: "image"
avatar_url: "https://example.com/avatar.png"
```

### 主题色

```yaml
accent_color: "#c0504d"  # 改成你喜欢的颜色
```

### 音乐（可选）

```yaml
meting_api: "https://api.injahow.cn/meting/"  # 公共 API，建议自建
platform: "netease"      # netease / tencent / kugou
playlist_id: "你的歌单ID"  # 留空则不显示音乐窗口
```

### 评论系统（可选）

支持 Giscus / Waline / Twikoo / Gitalk，选择一种配置即可：

#### Giscus（推荐）

1. 前往 https://giscus.app 获取配置
2. 填写：

```yaml
comments:
  enable: true
  provider: "giscus"
  giscus:
    repo: "yourname/your-repo"
    repoId: "R_xxxxx"
    category: "Announcements"
    categoryId: "DIC_xxxxx"
    mapping: "pathname"
    inputPosition: "top"
    reactionsEnabled: 0
```

> 主题会根据站点暗黑模式自动切换 Giscus 主题，无需手动配置。

### Dock 导航

```yaml
dock:
  - { icon: "fas fa-house", label: "首页", page: "/", type: "page" }
  - { icon: "fas fa-newspaper", label: "文章", page: "/posts/", type: "page" }
  - { icon: "fas fa-folder-open", label: "归档", page: "/archives/", type: "page" }
  # 可自由增删，type: page 站内页面 / link 外部链接
```

### 壁纸

```yaml
wallpaper_path: ""  # 留空使用默认渐变，或填图片 URL
```

## 相册使用

编辑 `source/gallery/index.md`，使用 Markdown 图片语法：

```markdown
![标题](缩略图URL)
large: 大图URL（可选，不写则用缩略图）
```

## 豆瓣书影音

### 方式一：手动配置

在 `themes/moeMac/_config.yml` 中：

```yaml
douban:
  books:
    - { name: "书名", cover: "封面URL", rating: 9, date: "2026-01-01", note: "读后感" }
  movies:
    - { name: "电影名", cover: "海报URL", rating: 8, date: "2026-01-01", note: "观后感" }
```

### 方式二：自动抓取（内置脚本，无需安装插件）

主题自带豆瓣抓取脚本（`scripts/douban-sync.js`），使用 Node.js 原生模块，无需安装任何额外 npm 包。

```yaml
douban:
  user_id: "你的豆瓣ID"  # douban.com/people/xxx/ 中的 xxx
  cookie: ""             # 可选，登录后的 cookie，用于访问受限页面
```

然后运行：

```bash
npx hexo douban              # 抓取全部（书 + 影 + 音）
npx hexo douban --books      # 只抓书
npx hexo douban --movies     # 只抓电影
npx hexo douban --music      # 只抓音乐
```

脚本会自动抓取豆瓣收藏并下载封面图到 `source/images/douban/`，数据保存到 `source/_data/douban.json`。

## 站点配置

编辑站点根目录 `_config.yml`：

```yaml
title: 你的博客名
author: 你的名字
language: zh-CN
url: https://your-domain.com
```

## 常见问题

### CSS/JS 修改后不生效？

主题 CSS/JS 文件带有版本号参数（`?v=20260707`），修改后需要在以下文件中递增版本号：

- `themes/moeMac/layout/_partial/head.ejs` — CSS 版本号
- `themes/moeMac/layout/_partial/scripts.ejs` — JS 版本号

### 音乐播放器不显示？

1. 确认 `playlist_id` 已填写
2. 确认 `meting_api` 可访问（公共 API 可能限流，建议自建）
3. 确认 `home_windows` 中包含 `"music"`

### 评论区显示"配置不完整"？

检查 `themes/moeMac/_config.yml` 中 `comments` 部分，确保 `enable: true` 且对应 provider 的字段已填写。

## 技术栈

- Hexo + EJS 模板
- Tailwind CSS + DaisyUI（CDN 本地化）
- GSAP 动画
- APlayer + Meting 音乐
- Font Awesome 图标

## License

MIT
