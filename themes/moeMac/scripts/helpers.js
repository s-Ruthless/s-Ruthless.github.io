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
  var stack = [{ level: 0 }];

  for (var i = 0; i < headings.length; i++) {
    var h = headings[i];
    var hLevel = h.level;

    while (stack[stack.length - 1].level < hLevel) {
      html += '<ol class="' + listClass + '-child">';
      stack.push({ level: stack[stack.length - 1].level + 1, tag: "ol" });
    }
    while (stack[stack.length - 1].level > hLevel) {
      html += "</ol></li>";
      stack.pop();
    }

    html += '<li class="' + listClass + '-item">';
    html += '<a class="' + listClass + '-link" href="#' + h.id + '">';
    html += h.text;
    html += "</a>";
  }

  while (stack.length > 1) {
    html += "</ol></li>";
    stack.pop();
  }
  html += "</li></ol>";

  return html;
});