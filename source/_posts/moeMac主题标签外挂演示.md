---
title: moeMac标签外挂演示
date: 2026-06-30 12:00:00
cover: https://picsum.photos/seed/moemac-tags/600/400
sticky: 1
tags:
  - 前端
  - 工具
categories:
  - 技术
---

本文是 moeMac 主题所有标签外挂（Tag Plugins）的**完整语法教程**与**效果演示**。所有功能开箱即用，无需额外安装插件。

> **提示**：每个功能都包含「语法」和「效果」两部分，你可以直接复制语法到自己的文章中使用。

<!-- more -->


## Note 提示容器

用于在文章中突出显示提示、警告等信息。支持多种类型和两种语法。

### 语法

**方式一：`:::` 容器语法（推荐）**

```markdown
::: tip
提示内容
:::

::: warning 自定义标题
带自定义标题的警告
:::
```

支持的类型：`tip` / `info` / `warning` / `danger` / `success` / `note` / `primary` / `default`

**方式二：`{% note %}` 标签语法**

```markdown
{% note [type] [title] %}
内容
{% endnote %}
```

### 效果

::: tip
这是一个提示（tip）容器，用于展示一般性提示信息。
:::

::: info
这是一个信息（info）容器，用于展示补充信息。
:::

::: warning
这是一个警告（warning）容器，需要注意的事项。
:::

::: danger
这是一个危险（danger）容器，表示需要特别注意的操作。
:::

::: success
这是一个成功（success）容器，表示操作完成。
:::

::: warning 自定义标题
容器也可以自定义标题，就像这个一样。
:::

{% note primary %}
这是一个 primary 类型的 note 容器，使用标签语法。
{% endnote %}

{% note danger 重要提醒 %}
note 容器内部也**支持 Markdown** 语法：

- 列表项一
- 列表项二
- 列表项三
{% endnote %}


## Checkbox 待办事项

用于展示待办列表，支持勾选状态和多种颜色。

### 语法

```markdown
{% checkbox 文本 %}                    未完成
{% checkbox checked, 已完成项 %}        已完成
{% checkbox checked, green, 绿色已完成 %}  指定颜色
```

支持的颜色：`red` / `green` / `blue` / `yellow` / `cyan` / `purple`

### 效果

{% checkbox 未完成的任务一 %}
{% checkbox 未完成的任务二 %}
{% checkbox checked, 已完成的任务 %}
{% checkbox checked, green, 绿色已完成 %}
{% checkbox checked, red, 红色已完成 %}
{% checkbox checked, blue, 蓝色已完成 %}
{% checkbox checked, purple, 紫色已完成 %}


## Tabs 标签页

将多个内容组织在不同的标签中，节省页面空间。

### 语法

```markdown
{% tabs 标签页名称, 默认显示第几个 %}

{% tab 标签1标题 %}
标签1内容
{% endtab %}

{% tab 标签2标题 %}
标签2内容
{% endtab %}

{% endtabs %}
```

### 效果

{% tabs demo-tabs, 1 %}

{% tab 概述 %}
这是第一个标签页的内容，默认显示。

支持 **Markdown** 格式，包括：

- 列表项 1
- 列表项 2
- 列表项 3
{% endtab %}

{% tab 代码示例 %}
这是第二个标签页的内容，支持代码块：

```javascript
const greet = (name) => {
  console.log(`Hello, ${name}!`);
};

greet('moeMac');
```
{% endtab %}

{% tab 引用与表格 %}
这是第三个标签页的内容。

> 引用也可以用在 Tab 里。

| 功能 | 状态 |
|------|------|
| Tabs | ✅ |
| Note | ✅ |
| Mermaid | ✅ |
{% endtab %}

{% endtabs %}


## Folding 折叠面板

默认收起，点击标题展开内容，适合放置较长的补充说明。

### 语法

```markdown
{% folding [color] [标题] %}
折叠内容
{% endfolding %}
```

支持的颜色：`blue` / `green` / `red` / `yellow` / `orange` / `purple`（可选，不填为默认色）

### 效果

{% folding 查看默认折叠面板 %}
点击标题可以展开/收起内容。

这里可以放较长的内容，默认折叠节省页面空间。
{% endfolding %}

{% folding blue 蓝色折叠面板 %}
蓝色边框的折叠面板，适合信息类内容。
{% endfolding %}

{% folding green 绿色折叠面板 %}
绿色边框的折叠面板，适合成功/完成类内容。
{% endfolding %}

{% folding red 红色折叠面板 %}
红色边框的折叠面板，适合警告类内容。
{% endfolding %}


## Hide 隐藏文本

用于隐藏敏感内容或剧透内容，支持行内隐藏和块级隐藏。

### 语法

```markdown
{% hide 隐藏文本 %}                        行内隐藏（鼠标悬停显示）
{% hideBlock 按钮文字 %} 隐藏块内容 {% endhideBlock %}   块级隐藏
{% hideToggle 标题 %} 可展开内容 {% endhideToggle %}     可展开隐藏
```

### 效果

**行内隐藏：**

这是一个句子，其中 {% hide 这是被隐藏的文本 %} 需要鼠标悬停才能看到。

**隐藏块：**

{% hideBlock 点击查看隐藏内容 %}
这里是隐藏的块级内容，点击按钮后才会显示。

可以包含任意 Markdown 内容：

```python
print("Hello, Hidden World!")
```
{% endhideBlock %}

**可展开隐藏：**

{% hideToggle 点击展开详情 %}
类似折叠面板，但视觉风格不同。适合用于 FAQ 或答案展示。
{% endhideToggle %}


## Badge 徽章

用于在行内突出显示状态标签，支持多种颜色和圆角样式。

### 语法

```markdown
{% badge 文本, 颜色 %}           方形徽章
{% badge 文本, 颜色, pill %}     圆角徽章
```

支持的颜色：`red` / `green` / `blue` / `yellow` / `orange` / `purple` / `gray` / `cyan`

### 效果

这是{% badge Hot, red %}一个热门{% badge New, green, pill %}功能的{% badge v2.0, blue %}演示。

{% badge 推荐, orange %} {% badge Beta, purple, pill %} {% badge Deprecated, gray %} {% badge Updated, cyan, pill %}


## Label 行内标签

给文字添加彩色背景高亮，类似荧光笔效果。

### 语法

```markdown
{% label 文本@颜色 %}
```

支持的颜色：`red` / `blue` / `green` / `yellow` / `orange` / `purple` / `pink` / `gray`

### 效果

这是一段包含{% label 关键词@red %}和{% label 重点@blue %}的文本。

也支持{% label 紫色@purple %}、{% label 橙色@orange %}、{% label 绿色@green %}、{% label 粉色@pink %}等颜色。


## Mark 文本高亮

用彩色背景标记文字，类似荧光笔标记，比 Label 更轻量。

### 语法

```markdown
{% mark 文本 %}               默认黄色
{% mark 文本@颜色 %}          指定颜色
```

支持的颜色：`yellow` / `red` / `green` / `blue` / `purple` / `cyan`

### 效果

这句话中{% mark 关键信息 %}被高亮了，{% mark 重要内容@red %}也是。

还可以{% mark 蓝色标记@blue %}和{% mark 绿色标记@green %}。


## Button 按钮链接

创建美观的链接按钮，支持图标和居中。

### 语法

```markdown
{% btn 链接, 文字, 图标 %}              默认按钮
{% btn 链接, 文字, 图标, center %}      居中按钮
{% btn 链接, 文字, 图标, red %}        彩色按钮
```

图标使用 Font Awesome 名称，如 `fa-link` / `fa-star` / `fa-book` / `fa-code` 等。

支持的颜色：`red` / `green` / `blue` / `yellow` / `orange` / `purple` / `pink` / `cyan` / `gray`

### 效果

{% btn https://hexo.io, Hexo 官网, fa-link %} {% btn https://butterfly.js.org/, Butterfly 主题, fa-star %}

彩色按钮：

{% btn https://github.com, GitHub, fa-star, red %} {% btn https://hexo.io, 文档, fa-book, blue %} {% btn https://nodejs.org, Node.js, fa-code, green %} {% btn https://vuejs.org, Vue.js, fa-star, purple %}

居中按钮：

{% btn https://github.com, GitHub, fa-star, orange, center %}


## Btns 按钮组

将多个按钮排列成一组，支持圆角和居中。

### 语法

```markdown
{% btns [rounded] [center] %}
{% btn 链接1, 文字1, 图标1, 颜色1 %}
{% btn 链接2, 文字2, 图标2, 颜色2 %}
{% endbtns %}
```

可选参数：`rounded`（圆角按钮）、`center`（居中排列）
按钮颜色：`red` / `green` / `blue` / `yellow` / `orange` / `purple` / `pink` / `cyan` / `gray`

### 效果

{% btns rounded center %}
{% btn https://hexo.io, Hexo, fa-book %}
{% btn https://nodejs.org, Node.js, fa-code, green %}
{% btn https://vuejs.org, Vue.js, fa-star, blue %}
{% btn https://github.com, GitHub, fa-heart, red %}
{% btn https://react.dev, React, fa-star, cyan %}
{% endbtns %}


## Quot 带作者引用

比普通引用更优雅，支持添加作者信息。

### 语法

```markdown
{% quot 引用文本 %}
{% quot 引用文本, 作者名 %}
```

### 效果

{% quot 代码是写给人看的，只是顺便能在机器上运行。 %}

{% quot 任何傻瓜都能写出计算机能理解的代码，但优秀的程序员能写出人类能理解的代码。, Martin Fowler %}

{% quot 简单是可靠的先决条件。, Edsger Dijkstra %}


## Flink 友链卡片

批量展示友情链接，以网格卡片排列，每个卡片包含头像、站点名称和描述。适合做友链页面或推荐站点列表。

### 语法

```markdown
{% flink %}
- name: 站点名称
  link: https://example.com
  avatar: https://example.com/favicon.png
  desc: 站点描述
- name: 另一个站点
  link: https://another.com
  avatar: https://another.com/favicon.png
  desc: 另一个描述
{% endflink %}
```

### 效果

{% flink %}
- name: Hexo
  link: https://hexo.io
  avatar: https://hexo.io/favicon.svg
  desc: 快速、简洁且高效的博客框架
- name: Butterfly
  link: https://butterfly.js.org
  avatar: https://butterfly.js.org/img/favicon.png
  desc: A Simple and Card UI Design theme
- name: Vue.js
  link: https://vuejs.org
  avatar: https://vuejs.org/logo.svg
  desc: 渐进式 JavaScript 框架
- name: Node.js
  link: https://nodejs.org
  avatar: https://nodejs.org/static/images/favicons/favicon.png
  desc: JavaScript 运行时
{% endflink %}


## Gallery 图片画廊

等高对齐画廊布局，每行图片根据原始宽高比自动计算高度，保持各行等高对齐。支持自定义列数和图片说明。

### 语法

```markdown
{% gallery 列数 %}
![图片说明1](图片地址1)
![图片说明2](图片地址2)
{% endgallery %}
```

也支持逗号分隔格式：

```markdown
{% gallery 3 %}
图片地址1, 说明1
图片地址2, 说明2
{% endgallery %}
```

> 列数默认为 4，移动端自动降为 2~3 列。

### 效果

{% gallery %}
![](https://i.loli.net/2019/12/25/Fze9jchtnyJXMHN.jpg)
![](https://i.loli.net/2019/12/25/ryLVePaqkYm4TEK.jpg)
![](https://i.loli.net/2019/12/25/gEy5Zc1Ai6VuO4N.jpg)
![](https://i.loli.net/2019/12/25/d6QHbytlSYO4FBG.jpg)
![](https://i.loli.net/2019/12/25/6nepIJ1xTgufatZ.jpg)
![](https://i.loli.net/2019/12/25/E7Jvr4eIPwUNmzq.jpg)
![](https://i.loli.net/2019/12/25/mh19anwBSWIkGlH.jpg)
![](https://i.loli.net/2019/12/25/2tu9JC8ewpBFagv.jpg)
{% endgallery %}



## Timeline 时间线

展示按时间排列的事件，适合做项目进度、更新日志等。

### 语法

```markdown
{% timeline %}

{% timenode 日期 %}
事件内容
{% endtimenode %}

{% timenode 另一个日期 %}
另一个事件
{% endtimenode %}

{% endtimeline %}
```

### 效果

{% timeline %}

{% timenode 2026-06-01 %}
博客正式上线，使用 Hexo + moeMac 主题。
{% endtimenode %}

{% timenode 2026-06-10 %}
添加 Vue 3 组合式 API 文章。
{% endtimenode %}

{% timenode 2026-06-18 %}
添加 CSS Grid 布局实战笔记。
{% endtimenode %}

{% timenode 2026-06-28 %}
添加 Node.js API 服务教程。
{% endtimenode %}

{% timenode 2026-06-30 %}
完成标签外挂功能移植，支持 30+ 种标签外挂。
{% endtimenode %}

{% endtimeline %}


## Copy 行内复制

行内代码复制按钮，点击即可复制文本到剪贴板。

### 语法

```markdown
{% copy 要复制的文本 %}
```

### 效果

使用 {% copy npm install hexo-cli -g %} 安装 Hexo CLI。

部署命令：{% copy hexo clean && hexo g && hexo d %}

配置文件路径：{% copy _config.yml %}


## inlineImg 行内图片

在行内插入图片，支持自定义宽高。

### 语法

```markdown
{% inlineImg 图片地址 [width:宽度] [height:高度] %}
```

### 效果

在行内插入小图片：`{% inlineImg /img/avatar.png 40px %}`（将地址替换为有效图片即可显示）。

> 由于演示文章没有本地图片资源，此处仅展示语法。实际使用时请替换为有效图片地址。


## 数学公式（KaTeX）

支持行内公式和块级公式，使用 KaTeX 渲染。

### 语法

```markdown
行内公式：$E = mc^2$

块级公式：
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

### 效果

**行内公式：**

质能方程 $E = mc^2$ 是物理学最著名的公式。

欧拉公式 $e^{i\pi} + 1 = 0$ 被称为最美的数学公式。

勾股定理 $a^2 + b^2 = c^2$ 描述直角三角形三边关系。

**块级公式：**

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

$$
\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}
$$

$$
\frac{\partial f}{\partial x} = \lim_{\Delta x \to 0} \frac{f(x + \Delta x) - f(x)}{\Delta x}
$$


## Mermaid 图表

在 Markdown 中绘制流程图、时序图、甘特图等。

### 语法

使用 mermaid 代码块（即以 mermaid 为语言标记的代码块）即可：

````
```mermaid
graph TD
    A[开始] --> B[结束]
```
````

### 效果

**流程图：**

```mermaid
graph TD
    A[开始] --> B{条件判断}
    B -- 是 --> C[执行操作 A]
    B -- 否 --> D[执行操作 B]
    C --> E[处理结果]
    D --> E
    E --> F[结束]
```

**时序图：**

```mermaid
sequenceDiagram
    participant U as 用户
    participant F as 前端
    participant A as API
    participant D as 数据库
    
    U->>F: 点击登录
    F->>A: POST /api/login
    A->>D: 查询用户
    D-->>A: 返回用户数据
    A->>A: 验证密码 + 生成 JWT
    A-->>F: 返回 Token
    F-->>U: 登录成功
```

**甘特图：**

```mermaid
gantt
    title 项目开发计划
    dateFormat YYYY-MM-DD
    section 设计阶段
    需求分析    :a1, 2026-06-01, 7d
    原型设计    :after a1, 5d
    section 开发阶段
    前端开发    :2026-06-13, 10d
    后端开发    :2026-06-13, 12d
    section 上线
    测试与部署   :2026-06-25, 5d
```


## Linkcard 链接卡片

单个外部链接卡片，带标题、描述和可选缩略图，适合在文章中引用外部网站或资源。与 Flink 不同，Linkcard 用于单个链接的精美展示，而非批量友链。

### 语法

```markdown
{% linkcard url, 标题, 描述, [图片url] %}
```

### 效果

{% linkcard https://hexo.io, Hexo, 快速、简洁且高效的博客框架, https://hexo.io/favicon.svg %}

{% linkcard https://github.com, GitHub, 全球最大的代码托管平台 %}


## Postcard 文章引用卡片

在文章中引用站内其他文章，自动获取标题、摘要和封面图，点击通过 AJAX 无刷新跳转。

### 语法

```markdown
{% postcard /文章路径/ %}                        单卡片，自动获取文章信息
{% postcard /文章路径/, 自定义标题, 自定义描述 %}    手动指定标题和描述
{% postcard /文章路径/, 标题, 描述, 封面图URL %}     完全自定义
{% postcard /路径1/ | /路径2/ | /路径3/ %}          多卡片横排
```

> 文章路径为 Hexo 生成的 URL 路径，如 `/2026/06/30/moeMac主题标签外挂演示/`。
> 不指定标题和描述时会自动从文章的 `title`、`excerpt` 和 `cover` 中获取。
> 使用 `|` 分隔多个路径可一行显示多个卡片。

### 效果

**单卡片：**

{% postcard /2026/06/30/moeMac主题标签外挂演示/ %}

**多卡片横排：**

{% postcard /2026/07/11/moeMac主题使用说明/ | /2026/06/18/css-grid-布局实战笔记/ | /2026/06/10/vue-3-组合式-api-入门/ %}


## Poem 诗词排版

居中展示诗词，带有标题和作者，适合文学类内容。

### 语法

```markdown
{% poem 标题, 作者 %}
第一行
第二行
第三行
{% endpoem %}
```

### 效果

{% poem 静夜思, 李白 %}
床前明月光
疑是地上霜
举头望明月
低头思故乡
{% endpoem %}


## Radio 单选按钮

类似 Checkbox，但使用圆形单选按钮样式。

### 语法

```markdown
{% radio 文本 %}                    未选中
{% radio checked, 已选中项 %}        已选中
{% radio checked, green, 绿色已选中 %} 指定颜色
```

### 效果

{% radio 选项一 %}
{% radio checked, 选项二（已选中） %}
{% radio 选项三 %}
{% radio checked, blue, 蓝色已选中 %}
{% radio checked, red, 红色已选中 %}


## Divider 分割线

带图标和文字的装饰性分割线，比普通 `<hr>` 更美观。

### 语法

```markdown
{% divider %}                        普通分割线
{% divider fa-star %}                带图标的分割线
{% divider fa-heart, 居中文字 %}      带图标和文字
```

### 效果

{% divider %}

{% divider fa-star %}

{% divider fa-heart, 分割线也可以很美 %}


## Detail 详情展开

简洁的折叠面板，点击展开/收起内容。

### 语法

```markdown
{% detail 标题 %}
详情内容
{% enddetail %}
```

### 效果

{% detail 点击查看更多信息 %}
这里是详情内容，点击标题可以收起。

支持 **Markdown** 语法和列表：

- 列表项一
- 列表项二
{% enddetail %}

{% detail 技术细节 %}
适合放置技术文档中的补充说明，默认折叠不占空间。
{% enddetail %}


## Kbd 键盘按键

展示键盘按键样式，适合编写快捷键教程。

### 语法

```markdown
{% kbd Ctrl %}              单个按键
{% kbd Ctrl + C %}          组合键（自动拆分）
```

### 效果

按 {% kbd Ctrl %} + {% kbd C %} 复制，{% kbd Ctrl %} + {% kbd V %} 粘贴。

快捷键：{% kbd Ctrl + Shift + Esc %} 打开任务管理器。

按 {% kbd Enter %} 确认，{% kbd Esc %} 取消。


## Span 自定义样式

给行内文字添加自定义样式，支持颜色和字体效果组合。

### 语法

```markdown
{% span red, 红色文字 %}
{% span bold large, 粗体大号文字 %}
{% span blue underline, 蓝色下划线 %}
```

支持的颜色：`red` / `blue` / `green` / `purple` / `orange` / `pink` / `gray`
支持的样式：`bold` / `italic` / `underline` / `strike` / `large` / `small`

### 效果

这是一段包含{% span red, 红色文字 %}和{% span blue, 蓝色文字 %}的句子。

支持组合样式：{% span bold large, 粗体大号 %}、{% span green italic, 绿色斜体 %}、{% span purple underline, 紫色下划线 %}。

{% span orange strike, 删除线效果 %} 也可以用 span 实现。


## Icon 行内图标

在文字中插入 Font Awesome 图标，支持指定颜色。

### 语法

```markdown
{% icon fa-heart %}              默认图标
{% icon fa-star, red %}          红色图标
{% icon fa-check-circle, green %} 绿色图标
```

### 效果

{% icon fa-heart, red %} 爱心、{% icon fa-star, yellow %} 星星、{% icon fa-check-circle, green %} 对勾、{% icon fa-info-circle, blue %} 信息。

在句子中使用：请注意{% icon fa-exclamation-triangle, orange %} 这个警告图标。


## U 下划线

给文字添加强调下划线，颜色跟随主题色。

### 语法

```markdown
{% u 需要下划线的文本 %}
```

### 效果

这句话中{% u 关键内容 %}被加上了下划线，{% u 用于强调重要信息 %}。


## Abbr 缩写提示

鼠标悬停时显示缩写的完整名称。

### 语法

```markdown
{% abbr HTML, HyperText Markup Language %}
{% abbr CSS, Cascading Style Sheets %}
```

### 效果

网页由 {% abbr HTML, HyperText Markup Language %} 结构和 {% abbr CSS, Cascading Style Sheets %} 样式组成。

前端开发常用 {% abbr JS, JavaScript %}、{% abbr TS, TypeScript %} 和 {% abbr API, Application Programming Interface %}。


## Aside 旁注

将文字以旁注形式展示，适合补充说明或引用。

### 语法

```markdown
{% aside 这是左侧旁注内容 %}
{% aside right, 这是右侧旁注内容 %}
```

### 效果

{% aside 这是一段旁注文字，适合用于补充说明或引用名言。 %}

正文内容继续，旁注会在左侧以特殊样式显示。

{% aside right, 右侧旁注也可以使用，适合对称排版。 %}


## Sub/Sup 上下标

插入上标和下标文字，适合化学公式、数学表达等。

### 语法

```markdown
H{% sub 2 %}O              下标
E = mc{% sup 2 %}          上标
```

### 效果

水分子：H{% sub 2 %}O，二氧化碳：CO{% sub 2 %}。

质能方程：E = mc{% sup 2 %}，面积单位：m{% sup 2 %}、体积单位：m{% sup 3 %}。


## Bubble 气泡注释

鼠标悬停时显示注释气泡，适合在不打断阅读流的情况下补充说明。

### 语法

```markdown
{% bubble 文本@注释内容 %}
```

### 效果

这是一个包含{% bubble 量子纠缠@两个或多个粒子之间存在的一种特殊关联 %}的句子。

也可以{% bubble 简单标注 %}一下某个概念。


## Progress 进度条

可视化展示进度、完成度等数值信息。

### 语法

```markdown
{% progress 百分比, [颜色], [标签] %}
```

支持的颜色：`red` / `green` / `blue` / `yellow` / `orange` / `purple` / `cyan` / `pink`

### 效果

{% progress 75, blue, 前端开发 %}

{% progress 90, green, 后端接口 %}

{% progress 45, orange, 测试覆盖 %}

{% progress 100, purple, 文档编写 %}


## Steps 步骤条

将内容组织在可切换的步骤中，适合教程、流程说明等场景。

### 语法

```markdown
{% steps %}

{% step 步骤一标题 %}
步骤一内容
{% endstep %}

{% step 步骤二标题 %}
步骤二内容
{% endstep %}

{% endsteps %}
```

### 效果

{% steps %}

{% step 准备环境 %}
安装 Node.js 和 Hexo CLI：

```bash
npm install -g hexo-cli
```
{% endstep %}

{% step 初始化项目 %}
创建新的 Hexo 博客：

```bash
hexo init my-blog
cd my-blog
npm install
```
{% endstep %}

{% step 安装主题 %}
将 moeMac 主题放入 `themes/moeMac` 目录，然后在 `_config.yml` 中设置：

```yaml
theme: moeMac
```
{% endstep %}

{% step 启动预览 %}

```bash
hexo server
```

访问 `http://localhost:4000` 即可看到效果。
{% endstep %}

{% endsteps %}


## Carousel 轮播图

图片轮播组件，支持自动播放、手动切换和触摸滑动。

### 语法

```markdown
{% carousel %}
![说明1](图片地址1)
![说明2](图片地址2)
{% endcarousel %}
```

### 效果

{% carousel %}
![春日花园](/images/douban/movie/p2893270877.jpg)
![夏日萤火](/images/douban/movie/p2545472803.jpg)
![秋日银杏](/images/douban/movie/p2770857575.jpg)
![冬日雪景](/images/douban/movie/p2814949620.jpg)
{% endcarousel %}


## Card 卡片容器

带标题和颜色的卡片容器，适合突出展示重要内容。

### 语法

```markdown
{% card [颜色] [标题] %}
卡片内容
{% endcard %}
```

支持的颜色：`red` / `green` / `blue` / `yellow` / `orange` / `purple` / `cyan` / `pink` / `default`

### 效果

{% card blue 重要提示 %}
这是一个蓝色卡片容器，内部**支持 Markdown** 语法。

- 列表项一
- 列表项二

> 也可以使用引用块。
{% endcard %}

{% card green 成功案例 %}
使用 moeMac 主题搭建博客的步骤简单明了，几分钟即可完成部署。
{% endcard %}

{% card orange 注意事项 %}
请确保 Node.js 版本 >= 14，否则部分功能可能无法正常使用。
{% endcard %}


## 功能总结

moeMac 主题已支持以下 **38 种** 标签外挂功能：

| 功能 | 语法 | 说明 |
|------|------|------|
| Note 容器 | `::: type` | 提示/警告/危险等容器块 |
| Checkbox 待办 | `checkbox` | 待办事项列表 |
| Radio 单选 | `radio` | 单选按钮 |
| Tabs 标签页 | `tabs` | 标签页切换 |
| Folding 折叠 | `folding` | 可展开/收起的面板 |
| Detail 详情 | `detail` | 简洁折叠面板 |
| Hide 隐藏 | `hide` | 鼠标悬停显示 |
| HideBlock | `hideBlock` | 点击显示块 |
| HideToggle | `hideToggle` | 可展开隐藏 |
| Badge 徽章 | `badge` | 行内彩色徽章 |
| Label 标签 | `label` | 行内彩色文字 |
| Mark 高亮 | `mark` | 荧光笔标记 |
| Button 按钮 | `btn` | 按钮链接 |
| Btns 按钮组 | `btns` | 多按钮排列 |
| Linkcard 链接卡片 | `linkcard` | 卡片式链接 |
| Postcard 文章卡片 | `postcard` | 站内文章引用卡片 |
| Quot 引用 | `quot` | 带作者引用 |
| Poem 诗词 | `poem` | 诗词排版 |
| Flink 友链 | `flink` | 友情链接卡片 |
| Gallery 画廊 | `gallery` | 图片网格画廊 |
| Timeline 时间线 | `timeline` | 时间轴 |
| Copy 复制 | `copy` | 行内代码复制 |
| Divider 分割线 | `divider` | 装饰性分割线 |
| Kbd 键盘按键 | `kbd` | 键盘按键样式 |
| Span 样式 | `span` | 自定义行内样式 |
| Icon 图标 | `icon` | 行内 Font Awesome 图标 |
| U 下划线 | `u` | 强调下划线 |
| Abbr 缩写 | `abbr` | 悬停提示缩写 |
| Aside 旁注 | `aside` | 旁注引用 |
| Sub 下标 | `sub` | 下标文字 |
| Sup 上标 | `sup` | 上标文字 |
| Bubble 气泡注释 | `bubble` | 悬停显示注释气泡 |
| Progress 进度条 | `progress` | 可视化进度条 |
| Steps 步骤条 | `steps` | 可切换步骤内容 |
| Carousel 轮播图 | `carousel` | 图片轮播组件 |
| Card 卡片容器 | `card` | 带标题颜色卡片 |
| 数学公式 | `$...$` | KaTeX 渲染 |
| Mermaid 图表 | `mermaid` | 流程图/时序图/甘特图 |
