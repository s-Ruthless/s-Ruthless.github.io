# 更新日志

## v2.3.1 (2026-07-13)

### 代码块按钮优化

- **按钮 hover 美化** — 图标 `scale(1.15)` 放大 + 背景渐显 + 主题色变色，点击 `scale(0.9)` 回弹
- **所有按钮常驻显示** — 复制按钮不再 hover 标题栏才显示，消除明暗变化
- **删除 title 提示** — 移除折叠/复制/全屏按钮的原生 tooltip
- **复制成功动画** — `copyPop` 弹跳动画（scale 1→1.2→1）

### 网站信息

- **主题名称/链接可配置** — `_config.yml` 新增 `theme_name` / `theme_url` 配置项
- **修复双下划线** — 删除 `.info-item a:hover{text-decoration:underline}`，只保留 `::after` 动画下划线

### 归档页面

- **折叠动画兼容** — `max-height` 改为 JS 精确 `height` 过渡，兼容 QQ/微信浏览器旧 WebKit
- **行入场动画** — `transform:translateY` 改为纯 `opacity`，避免旧 WebKit 多行 transform 抖动

## v2.3.0 (2026-07-13)

### 代码块重构 — Butterfly 风格布局

- **重构 HTML 结构** — 参考 Butterfly 主题，将代码块拆分为 `.code-header`（固定顶部）+ `.code-main`（主体）> `.code-gutter`（固定行号）+ `.code-scroll`（仅代码区横向滚动）
- **顶部栏固定** — Mac 红绿灯 + 语言标签 + 按钮组，不随代码横向滚动
- **行号固定** — 左侧行号栏独立于代码滚动区，横向滚动时行号不动
- **滚动条可见** — 覆盖全局 `::-webkit-scrollbar{display:none}` 限制，代码区滚动条正常显示
- **行号统一宽度** — `min-width:3.2em` 保证 1 位/3 位数行号宽度一致
- **行号对齐修复** — 克隆 `<code>` 时移除 `.line-numbers-rows`，避免行号 span 混入代码内容

### 代码块工具栏

- **折叠按钮** — 放在红绿灯左侧，默认展开图标 `↓`，折叠后图标 `→`，常驻显示
- **复制按钮** — hover 显示，复制成功后打勾反馈
- **全屏按钮** — 放在复制按钮右侧，常驻显示
- **折叠动画** — 精确 `max-height` + `will-change` 优化，平滑过渡不卡顿
- **折叠时去边框** — 折叠状态隐藏 header 底部边框

### 全屏查看

- **全屏覆盖层** — 几乎全屏（`calc(100vw - 40px)`），暗色遮罩 + 毛玻璃模糊
- **代码高亮正常** — token 选择器去掉 `.article-content` 前缀，全屏内代码高亮不受影响
- **行号跟随滚动** — `position:sticky` 固定行号，垂直滚动时行号同步移动
- **滚动条可见** — 全屏模式下横向/纵向滚动条均显示
- **克隆复制按钮** — 全屏内保留复制按钮并重新绑定事件

### 代码高亮主题配置

- **4 套主题可选** — `github`（默认）/ `dracula` / `one-dark` / `vs`
- **配置方式** — `_config.yml` 中 `code_theme: "github"`
- **浅色/暗黑自动切换** — 每套主题包含浅色和暗黑两套配色
- **独立 CSS 文件** — token 颜色从 `article.css` 提取到 `code-theme-*.css`

### 归档页面修复

- **折叠动画兼容** — `grid-template-rows` 改为 `max-height`，兼容 QQ/微信浏览器旧 WebKit
- **第 5 组延迟显示修复** — 调整 `ArchiveFold.init()` 执行顺序，在动画注册之后执行
- **折叠展开列表入场动画** — 纯 CSS `@keyframes` 方案，只要 `.expanded` 类添加就自动触发逐行动画
- **动画冲突修复** — 折叠组内归档行不注册 IntersectionObserver，由 CSS 动画接管

### 图标补全

- **新增 Font Awesome 图标** — `fa-chevron-up` / `fa-expand` / `fa-compress`

## v2.2.0 (2026-07-12)

### 全站动画系统

- **FA 图标 CSS 动画增强** — 保留所有 Font Awesome 图标，通过 CSS hover 微动画增强，0 KB 额外依赖
  - Dock 图标 hover 摇摆、搜索按钮旋转、主题切换翻转、返回顶部弹跳
  - 文章元信息脉冲、导航箭头滑动、标签摇摆、置顶图钉持续摆动
  - 豆瓣评分星星逐颗闪烁、豆瓣详情箭头滑动、空状态图标脉冲
  - 灯箱关闭旋转、导航箭头滑动、归档统计图标脉冲、年份折叠箭头旋转
  - 分类列表摇摆、文章列表标签摇摆、按钮图标摇摆
- **全站 UI 元素动画 100% 覆盖**
  - 红绿灯按钮 hover 缩放+颜色加深、社交按钮弹跳、头像旋转
  - 数据窗口数字弹跳、信息链接下划线滑入、文章标题位移
  - 友链头像旋转+变圆、标签云 3D 弹跳、搜索结果指示条
  - 分页按钮上移+阴影、404 emoji 弹跳、统计数字弹跳
  - 柱状图柱子上移、折线图数据点放大、折叠箭头旋转
  - Tabs 底线滑入、文章链接下划线滑入、正文图片放大
  - 窗口聚焦光圈脉冲、Dock 活跃指示点持续脉冲、进度条入场动画
- **图片懒加载动画** — 奔跑的小猫 + 尘土飞扬，暗黑模式适配
- **窗口标题图标位置修复** — `display:inline-flex!important` 覆盖 FA 的 `inline-block`

### Bug 修复

- **非首页刷新布局丢失** — `.page-container` / `.page-body` 等通用布局样式从 `article.css`（异步加载）移至 `style.css`（同步加载），防止刷新时布局铺满全屏

### 性能优化

- **页面容器样式同步加载** — 所有页面共用的布局 CSS 移至同步加载的 `style.css`

---

## v2.1.0 (2026-07-12)

### 性能优化

- **Lighthouse 性能大幅提升** — 非首屏 CSS 异步加载（`media="print" onload`），KaTeX / APlayer / Mermaid JS 按需懒加载，LCP 图片（头像、壁纸）`preload` 预加载，Masonry 核心 JS 预加载
- **Masonry 布局安全网** — 添加 CSS `load` 事件监听和 `window.load` 重排，确保异步 CSS 加载后瀑布流正确布局

### Bug 修复

- **归档折叠抖动** — 将 `max-height` 动画改为 CSS Grid `grid-template-rows` 动画，消除移动端折叠时的屏幕抖动
- **移动端 Dock Tooltip 遮挡** — 移动端移除 Dock hover 提示，JS 跳过事件绑定
- **移动端封面图非正方形** — 固定文章列表卡片封面图高度为 90px
- **Postcard 卡片布局** — 缩略图固定 100×100 正方形，消除多卡片模式下图片下方空白
- **豆瓣卡片 hover 模糊** — 添加 `will-change: transform` 和 `backface-visibility: hidden`，修复字体模糊和图片卡顿
- **豆瓣电影评分抓取** — 优先获取个人评分，回退社区评分，修正 `allstarXX` 转换公式，支持 `data-rating` 新格式
- **画廊 JS 加载延迟** — 优化 `initGallery` 初始化时序，使用 `requestAnimationFrame` 确保 DOM 渲染后正确布局
- **文章列表页卡片错位** — 关键布局 CSS `pages.css` 改回同步加载，避免 Masonry 计算错误

### 变更

- **豆瓣页面移除音乐模块** — 从模板和抓取脚本中移除音乐相关逻辑
- **KaTeX / APlayer 懒加载** — 仅检测到数学公式 / 音乐播放器时才加载对应 JS

---

## v2.0.0 (2026-07-12)

### 重磅更新

本次为重大版本升级，涵盖 SEO 优化、内容创作工具链、性能优化、CSP 安全修复等多个方面。

#### 新增功能

- **SEO 短链接（abbrlink）** — 内置 `scripts/abbrlink.js`，根据文章标题自动生成 CRC32 哈希短链接，URL 稳定不变，无需安装任何插件
- **RSS 订阅** — 内置 `scripts/rss.js`，自动输出标准 RSS 2.0 格式的 `atom.xml`，支持全文/摘要、文章数量限制、主页社交图标区自动显示 RSS 按钮
- **站点地图** — 内置 `scripts/sitemap.js`，自动生成 `sitemap.xml`，包含文章、页面、分类、标签、归档页，可提交到 Google Search Console / 百度站长平台
- **KaTeX 数学公式** — 内置 `scripts/katex-render.js`，支持行内 `$...$` 和块级 `$$...$$` 公式，CSS/JS/字体全部本地化
- **Mermaid 图表** — 内置 `scripts/mermaid-render.js`，支持流程图、时序图、甘特图等，使用 `mermaid` 代码块语法
- **标签外挂系统** — 内置 `scripts/tag-plugins.js` + `scripts/container-blocks.js`，提供提示容器、标签页、折叠面板、轮播图、画廊、时间线、步骤条、文章引用卡片等丰富的标签外挂
- **内置 TOC 目录** — `scripts/helpers.js`，不依赖 hexo-toc 插件
- **瀑布流布局** — 集成 Masonry（本地化），用于文章墙卡片和相册

#### 性能优化

- **动画系统重构** — 移除 GSAP 依赖，改用 CSS @keyframes + IntersectionObserver + Web Animations API，零外部依赖
- **JS 加载优先级优化** — `defer` 脚本按优先级排序，核心脚本添加 `preload`，CSS 加载完成检查防止动画重放
- **资源预连接** — 自动从用户配置中提取外部域名，生成 `preconnect` + `dns-prefetch` 标签
- **CSS/JS 版本号** — 统一版本号参数强制浏览器缓存刷新

#### 安全修复

- **CSP 合规** — 修复 `main.js` 中 AJAX 导航使用 `new Function()` 执行 `onerror` 字符串的问题，改为正则解析
- **CSP 合规** — 修补 `APlayer.min.js` 中 webpack 引导代码的 `Function("return this")()` 和 `eval("this")`，直接替换为 `window` 引用

#### 静态资源全本地化

所有第三方 CSS / JS / 字体文件均已下载到 `source/assets/` 目录，不依赖任何外部 CDN：

| 资源 | 说明 |
|---|---|
| APlayer + Meting | 音乐播放器 |
| KaTeX（含 20 个 woff2 字体） | 数学公式渲染 |
| Mermaid | 图表渲染 |
| Masonry | 瀑布流布局 |
| Font Awesome | 图标字体 |
| Gitalk / Waline / Twikoo / CWD | 评论系统 |
| 卜算子 | 访客统计 |

> 唯一的外部引用是 Giscus 评论系统的 `giscus.app/client.js`（官方要求不可本地化）。

#### UI / UX 改进

- **分类图标统一** — 所有分类统一使用 `fas fa-folder` 图标
- **卡片布局优化** — 文章墙改为 3 列网格布局，置顶徽章+分类标签+日期并排显示不再换行
- **代码块行号对齐** — 修复代码块行号与内容上下不对齐的问题
- **语法高亮增强** — 启用 `auto_detect`，补充浅色和深色模式下的 token 类型 CSS 规则
- **AJAX 导航画廊修复** — 修复 AJAX 导航后画廊图片布局异常，优化 `initGallery` 初始化逻辑
- **暗黑模式** — 早期注入 `<script>` 在所有 CSS/JS 之前读取 localStorage，避免 FOUC 闪烁
- **移动端适配** — 独立布局、触摸友好、自动检测视口切换

#### 文档

- **README.md** — 精简为项目介绍和快速上手指南，详细配置指向在线文档
- **使用说明** — 新增插件分类说明（hexo init 自带 / 手动安装 / 无需插件）、abbrlink、RSS、Sitemap 配置文档

#### 破坏性变更

- `permalink` 需改为 `posts/:abbrlink.html`（如使用 abbrlink 功能）
- 移除 GSAP 依赖（`gsap.min.js`、`gsap-animations.js`、`ScrollTrigger.min.js`），由原生动画替代
- 移除 `pinyin-pro` 依赖

---

## v1.1.0

- 修复荣耀浏览器窗口不显示问题
- 移动端相册瀑布流改为 3 列
- 修复评论 null 报错
- 动态预连接优化
- 移动端兼容性改进

## v1.0.0

- 初始发布
- macOS 桌面风格、Dock 导航、浮动窗口、毛玻璃质感
- 暗黑模式、AJAX 导航、音乐播放器
- Giscus / Waline / Twikoo / Gitalk 评论系统
- 豆瓣书影音、相册、归档统计
