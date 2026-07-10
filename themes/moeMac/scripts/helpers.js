/**
 * moeMac 主题 — 内置 TOC（目录）生成 Helper
 * 不依赖任何外部插件，开箱即用
 * 使用 hexo.extend.helper.register 注册到模板引擎
 */
"use strict";

hexo.extend.helper.register("toc", function (content, options) {
  options = options || {};
  var listClass = options["class"] || "toc-list";
  var listNumber = options.list_number !== false;
  var minDepth = options.min_depth || 1;
  var maxDepth = options.max_depth || 6;

  if (!content || typeof content !== "string") return "";

  // 匹配所有 h1-h6 标签
  var headingRegex = /<h([1-6])([^>]*)id="([^"]*)"[^>]*>([\s\S]*?)<\/h\1>/gi;
  var headings = [];
  var m;
  while ((m = headingRegex.exec(content)) !== null) {
    var level = parseInt(m[1]);
    if (level < minDepth || level > maxDepth) continue;
    headings.push({
      level: level,
      id: m[3],
      text: m[4].replace(/<[^>]+>/g, "").trim()
    });
  }

  if (headings.length === 0) return "";

  // 构建嵌套列表
  var html = '<ol class="' + listClass + '">';
  // 用栈跟踪嵌套层级
  var stack = [{ level: 0 }];
  var depth = 1;

  for (var i = 0; i < headings.length; i++) {
    var h = headings[i];
    var hLevel = h.level;

    // 打开缺失的层级
    while (stack[stack.length - 1].level < hLevel) {
      html += '<ol class="' + listClass + '-child">';
      stack.push({ level: stack[stack.length - 1].level + 1, tag: "ol" });
    }
    // 关闭多余的层级
    while (stack[stack.length - 1].level > hLevel) {
      html += "</ol></li>";
      stack.pop();
    }

    html += '<li class="' + listClass + '-item">';
    html += '<a class="' + listClass + '-link" href="#' + h.id + '">';
    html += h.text;
    html += "</a>";
    // 不立即关闭 li，为嵌套子列表留空间
  }

  // 关闭所有未闭合的标签
  while (stack.length > 1) {
    html += "</ol></li>";
    stack.pop();
  }
  html += "</li></ol>";

  return html;
});


// ====== 文章卡片瀑布流行跨估算（CSS Grid masonry） ======
hexo.extend.helper.register('card_row_span', function(post, idx) {
  var rows = 0;
  var coverImg = post.cover || post.thumbnail || '';
  // 封面图: 120px ÷ 5px/row
  if (coverImg) rows += 24;
  // card-top 区: 分类+日期 ~20px + padding
  rows += 5;
  // 标题: 每行 ~4rows, 中文约20字一行
  var titleLen = (post.title || '').length;
  var titleLines = Math.max(1, Math.ceil(titleLen / 18));
  rows += titleLines * 4;
  // 摘要: 每行 ~3rows, 约30字一行
  var fullText = '';
  try {
    fullText = hexo.extend.helper.get('strip_html').call(this, post.excerpt || post.content || '');
  } catch(e) { fullText = (post.excerpt || post.content || '').replace(/<[^>]*>/g, ''); }
  var sizes = [30, 80, 150, 60, 120, 40, 100, 180, 50, 90, 140, 70];
  var maxLen = sizes[idx % sizes.length];
  var summaryLen = Math.min(fullText.length, maxLen);
  var summaryLines = Math.max(1, Math.ceil(summaryLen / 30));
  rows += summaryLines * 3;
  // 标签: ~24px
  if (post.tags && post.tags.length > 0) rows += 5;
  // 置顶徽章
  if (post.sticky) rows += 5;
  // 底部 padding + card-top margin
  rows += 5;
  return Math.max(10, rows);
});

// Expose strip_html for use in card_row_span
if (!hexo.extend.helper.get('strip_html_new')) {
  hexo.extend.helper.register('strip_html_new', function(str) {
    return String(str || '').replace(/<[^>]*>/g, '');
  });
}