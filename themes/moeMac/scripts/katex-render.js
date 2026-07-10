/**
 * moeMac 主题 — KaTeX 数学公式渲染支持
 *
 * 在 Markdown 中使用：
 *   行内公式：$E = mc^2$
 *   块级公式：$$\int_0^1 x^2 dx = \frac{1}{3}$$
 *
 * 原理：
 *   before_post_render 阶段：
 *     - 代码块/行内代码中的 {% %}、{{ }}、$ 转义为 Unicode 私有区单字符
 *       （单字符不会被 highlight.js 拆分到不同 <span> 中）
 *       代码块本身保持原样，让 Markdown 渲染器正常渲染
 *     - $$...$$ 和 $...$ 替换为占位符，避免被 marked 转义
 *   after_post_render 阶段：
 *     - 还原所有占位符
 *   前端通过 KaTeX JS 自动渲染。
 */

'use strict';

// 转义 HTML 特殊字符
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 使用 Unicode 私有区单字符作为占位符
// 单字符不会被 highlight.js 拆分到不同 <span> 中
var NJ_OPEN = '\uE010';   // {% %}
var NJ_CLOSE = '\uE011';  // %}
var NJ_EXPR_OPEN = '\uE012';  // {{
var NJ_EXPR_CLOSE = '\uE013'; // }}
var DOLLAR = '\uE014';    // $

function escapeInCode(str) {
  return str
    .replace(/\{%/g, NJ_OPEN)
    .replace(/%\}/g, NJ_CLOSE)
    .replace(/\{\{/g, NJ_EXPR_OPEN)
    .replace(/\}\}/g, NJ_EXPR_CLOSE)
    .replace(/\$/g, DOLLAR);
}

function unescapeInCode(str) {
  return str
    .split(NJ_OPEN).join('{%')
    .split(NJ_CLOSE).join('%}')
    .split(NJ_EXPR_OPEN).join('{{')
    .split(NJ_EXPR_CLOSE).join('}}')
    .split(DOLLAR).join('$');
}

hexo.extend.filter.register('before_post_render', function (data) {
  if (!data.content) return data;

  var store = [];

  // 1. 代码块：仅转义内部的 {% %}、{{ }}、$，代码块本身保持原样让 Markdown 渲染器处理
  //    跳过 mermaid 代码块（由 mermaid-render.js 处理）
  data.content = data.content.replace(/(```[\s\S]*?```|~~~[\s\S]*?~~~)/g, function (m) {
    if (/^```mermaid/.test(m) || /^~~~mermaid/.test(m)) {
      return m;
    }
    return escapeInCode(m);
  });

  // 2. 行内代码：仅转义内部的 {% %}、{{ }}、$
  //    使用 [^`\n] 防止跨行匹配吞掉中间内容
  data.content = data.content.replace(/(`[^`\n]+`)/g, function (m) {
    if (m.indexOf('$') === -1 && m.indexOf('{%') === -1 && m.indexOf('{{') === -1) {
      return m;
    }
    return escapeInCode(m);
  });

  // 3. 块级公式 $$ ... $$
  data.content = data.content.replace(/\$\$([\s\S]+?)\$\$/g, function (m, formula) {
    var id = '@@KATEX_BLOCK_' + store.length + '@@';
    store.push({ id: id, content: '<div class="math-block">' + escapeHtml(formula.trim()) + '</div>' });
    return id;
  });

  // 4. 行内公式 $ ... $
  data.content = data.content.replace(/\$([^\n$]+?)\$/g, function (m, formula) {
    if (!formula.trim()) return m;
    var id = '@@KATEX_INLINE_' + store.length + '@@';
    store.push({ id: id, content: '<span class="math-inline">' + escapeHtml(formula.trim()) + '</span>' });
    return id;
  });

  data._katex_store = store;
  return data;
}, 7);

hexo.extend.filter.register('after_post_render', function (data) {
  if (!data.content) return data;

  // 1. 还原代码块/行内代码中被转义的字符
  data.content = unescapeInCode(data.content);

  // 2. 还原 KaTeX 公式占位符
  if (data._katex_store) {
    var store = data._katex_store;
    for (var i = 0; i < store.length; i++) {
      var s = store[i];
      // 块级公式占位符可能被 <p> 包裹，移除多余的 <p></p>
      if (s.id.indexOf('BLOCK') !== -1) {
        data.content = data.content.split('<p>' + s.id + '</p>').join(s.content);
      }
      data.content = data.content.split(s.id).join(s.content);
    }
    delete data._katex_store;
  }

  return data;
});
