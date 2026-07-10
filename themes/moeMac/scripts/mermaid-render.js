/**
 * moeMac 主题 — Mermaid 图表支持
 */

'use strict';

var mermaidStore = {};

hexo.extend.filter.register('before_post_render', function (data) {
  if (!data.content) return data;

  var store = [];

  // 匹配 ```mermaid ... ``` 或 ~~~mermaid ... ~~~（兼容 CRLF 换行符）
  data.content = data.content.replace(/(```|~~~)mermaid[ \t]*\r?\n([\s\S]*?)\1/g, function (m, fence, code) {
    var id = '@@MERMAID_BLOCK_' + store.length + '@@';
    store.push({ id: id, code: code.trim() });
    return id;
  });

  if (store.length > 0) {
    mermaidStore[data.source] = store;
  }

  return data;
}, 15);

hexo.extend.filter.register('after_post_render', function (data) {
  var key = data.source;
  var store = mermaidStore[key];

  if (!store || store.length === 0) return data;

  for (var i = 0; i < store.length; i++) {
    var html = '<div class="mermaid">' + store[i].code + '</div>';
    data.content = data.content.split(store[i].id).join(html);
  }

  delete mermaidStore[key];
  return data;
});

// Fallback: also process highlight plaintext figures that contain mermaid code
// This handles cases where the before_post_render filter didn't catch the block
hexo.extend.filter.register('after_post_render', function (data) {
  if (!data.content) return data;

  // Match <figure class="highlight plaintext"> or <figure class="highlight mermaid">
  // that contains mermaid code (graph, sequenceDiagram, gantt, etc.)
  data.content = data.content.replace(
    /<figure class="highlight (?:plaintext|mermaid)">[\s\S]*?<td class="code">[\s\S]*?<pre>([\s\S]*?)<\/pre>[\s\S]*?<\/figure>/g,
    function (match, code) {
      // 将 HTML 结构还原为带换行的纯文本
      var mermaidCode = code
        .replace(/<\/span><br>/g, '\n')   // 行末 </span><br> → 换行
        .replace(/<span class="line">/g, '') // 行首 span 标签
        .replace(/<\/span>/g, '')           // 闭合 span 标签
        .replace(/<[^>]+>/g, '')            // 移除其他 HTML 标签
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&#123;/g, '{')
        .replace(/&#125;/g, '}')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      var trimmed = mermaidCode.trim();
      // Check if it looks like mermaid syntax
      if (/^(graph |graph TD|graph LR|graph BT|graph RL|flowchart |sequenceDiagram|classDiagram|stateDiagram|gantt|pie|journey|erDiagram|gitGraph|requirementDiagram)/.test(trimmed)) {
        return '<div class="mermaid">' + trimmed + '</div>';
      }
      return match;
    }
  );

  return data;
});
