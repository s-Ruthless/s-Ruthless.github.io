/**
 * abbrlink.js — 内置 SEO 短链接生成器（集成在主题中，无需安装额外插件）
 *
 * 根据 front-matter 中的 title 生成 CRC32 哈希短链接
 * 例如：title: 夏天的正确打开方式 → /posts/b8e72f3a.html
 *
 * 特点：
 *   - 同一 title 永远生成相同的哈希，URL 稳定不变
 *   - 8 位十六进制，简短美观
 *   - 纯 JS 实现，零外部依赖
 *   - 新文章无需任何手动操作
 *
 * 启用方式：
 *   1. 主题 _config.yml 中设置 abbrlink: true
 *   2. 站点 _config.yml 中设置 permalink: posts/:abbrlink.html
 */

"use strict";

var fs = require('fs');
var path = require('path');

/* CRC32 哈希表 */
var crc32Table = (function () {
  var table = [];
  for (var i = 0; i < 256; i++) {
    var c = i;
    for (var j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(str) {
  var crc = 0xFFFFFFFF;
  for (var i = 0; i < str.length; i++) {
    crc = (crc >>> 8) ^ crc32Table[(crc ^ str.charCodeAt(i)) & 0xFF];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

/* 生成 8 位十六进制短链接 */
function generateAbbrlink(title) {
  return crc32(title).toString(16).toLowerCase().padStart(8, '0');
}

/* 去除 BOM，统一换行符 */
function cleanContent(content) {
  if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
  return content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/* 解析 front-matter */
function parseFrontMatter(content) {
  content = cleanContent(content);
  var match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return null;
  return { frontMatter: match[1], body: match[2] || '' };
}

/* 获取已有的 abbrlink（兼容带引号和不带引号） */
function getAbbrlink(fm) {
  var m = fm.match(/^abbrlink:\s*["']?([^"'\s]+)["']?\s*$/m);
  return m ? m[1] : null;
}

/* 获取 title */
function getTitle(fm) {
  var m = fm.match(/^title:\s*(.+)\s*$/m);
  if (!m) return null;
  var title = m[1].trim();
  if ((title[0] === '"' && title[title.length - 1] === '"') ||
      (title[0] === "'" && title[title.length - 1] === "'")) {
    title = title.slice(1, -1);
  }
  return title;
}

/* 添加 abbrlink 到 front-matter（加引号防止 YAML 科学计数法误解析） */
function addAbbrlink(fm, abbrlink) {
  return fm.replace(/\s+$/, '') + '\nabbrlink: ' + '"' + abbrlink + '"';
}

/* before_generate 过滤器：根据 title 自动生成 abbrlink */
hexo.extend.filter.register('before_generate', function () {
  var enabled = hexo.theme.config.abbrlink;
  if (!enabled) return;

  var postsDir = path.join(hexo.source_dir, '_posts');
  if (!fs.existsSync(postsDir)) return;

  var files = fs.readdirSync(postsDir).filter(function (f) {
    return /\.(md|markdown)$/.test(f);
  });

  var updated = 0;

  files.forEach(function (filename) {
    var filePath = path.join(postsDir, filename);
    var content = fs.readFileSync(filePath, 'utf8');
    var parsed = parseFrontMatter(content);
    if (!parsed) return;

    /* 已有 abbrlink 则跳过（title 不变就不会重新生成） */
    if (getAbbrlink(parsed.frontMatter)) return;

    /* 从 title 生成 abbrlink */
    var title = getTitle(parsed.frontMatter);
    if (!title) return;

    var abbrlink = generateAbbrlink(title);

    /* 回写到文件 */
    var newFm = addAbbrlink(parsed.frontMatter, abbrlink);
    var newContent = '---\n' + newFm + '\n---\n' + parsed.body;
    fs.writeFileSync(filePath, newContent, 'utf8');
    updated++;
  });

  if (updated > 0) {
    hexo.log.info('abbrlink: 为 ' + updated + ' 篇文章生成了短链接');
  }
});

/**
 * post_permalink 过滤器：用 front-matter 中的 abbrlink 覆盖 URL
 */
function buildAbbrlinkCache() {
  var cache = {};
  var postsDir = path.join(hexo.source_dir, '_posts');
  if (!fs.existsSync(postsDir)) return cache;

  fs.readdirSync(postsDir).filter(function (f) {
    return /\.(md|markdown)$/.test(f);
  }).forEach(function (filename) {
    var content = fs.readFileSync(path.join(postsDir, filename), 'utf8');
    var parsed = parseFrontMatter(content);
    if (!parsed) return;
    var abbrlink = getAbbrlink(parsed.frontMatter);
    if (abbrlink) {
      var baseName = filename.replace(/\.(md|markdown)$/, '');
      cache[baseName] = abbrlink;
    }
  });
  return cache;
}

hexo.extend.filter.register('post_permalink', function (permalink) {
  if (!permalink || permalink.indexOf('posts/') === -1) return permalink;

  var cache = buildAbbrlinkCache();

  var match = permalink.match(/^posts\/(.+?)\.html$/);
  if (match) {
    var fileSlug = match[1];
    if (cache[fileSlug]) {
      return 'posts/' + cache[fileSlug] + '.html';
    }
  }

  return permalink;
});
