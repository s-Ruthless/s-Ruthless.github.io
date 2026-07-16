/**
 * abbrlink.js — 内置 SEO 短链接生成器（集成在主题中，无需安装额外插件）
 *
 * 根据 front-matter 中的 title 生成 CRC32 哈希短链接
 * 例如：title: 夏天的正确打开方式 → /posts/b8e72f3a.html
 *
 * 特点：
 *   - 始终启用，无需配置
 *   - 同一 title 永远生成相同的哈希，URL 稳定不变
 *   - 始终根据 title 生成，忽略手写值，确保一致性
 *   - 8 位十六进制，简短美观
 *   - 纯 JS 实现，零外部依赖
 *   - 新文章无需任何手动操作
 *
 * 使用方式：
 *   站点 _config.yml 中设置 permalink: posts/:abbrlink.html
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

/* 设置 abbrlink 到 front-matter（已有则替换，没有则追加） */
function setAbbrlink(fm, abbrlink) {
  var newLine = 'abbrlink: "' + abbrlink + '"';
  /* 已有 abbrlink 行则替换 */
  if (/^abbrlink:\s*.+$/m.test(fm)) {
    return fm.replace(/^abbrlink:\s*["']?[^"'\s]+["']?\s*$/m, newLine);
  }
  /* 没有则追加 */
  return fm.replace(/\s+$/, '') + '\n' + newLine;
}

/* before_generate 过滤器：
   - abbrlink: true  → 始终根据 title 算 CRC32，覆盖手写值
   - abbrlink: false → 尊重 front-matter 中已有的值，没有才生成 */
hexo.extend.filter.register('before_generate', function () {
  var enabled = hexo.theme.config.abbrlink;
  var postsDir = path.join(hexo.source_dir, '_posts');
  if (!fs.existsSync(postsDir)) return;

  var files = fs.readdirSync(postsDir).filter(function (f) {
    return /\.(md|markdown)$/.test(f);
  });

  var updated = 0;
  var updates = {}; /* baseName → new abbrlink */

  files.forEach(function (filename) {
    var filePath = path.join(postsDir, filename);
    var content = fs.readFileSync(filePath, 'utf8');
    var parsed = parseFrontMatter(content);
    if (!parsed) return;

    var title = getTitle(parsed.frontMatter);
    if (!title) return;

    var abbrlink = generateAbbrlink(title);
    var existing = getAbbrlink(parsed.frontMatter);

    /* 值相同则跳过写入 */
    if (existing === abbrlink) return;

    /* abbrlink: false 时，已有值则跳过（尊重手写） */
    if (!enabled && existing) return;

    /* abbrlink: true 时，始终覆盖；false 时仅补生成 */
    var newFm = setAbbrlink(parsed.frontMatter, abbrlink);
    var newContent = '---\n' + newFm + '\n---\n' + parsed.body;
    fs.writeFileSync(filePath, newContent, 'utf8');

    var baseName = filename.replace(/\.(md|markdown)$/, '');
    updates[baseName] = abbrlink;
    updated++;
  });

  /* 同步更新 Hexo 内部 post 数据，确保 permalink 用新值 */
  if (Object.keys(updates).length > 0) {
    hexo.locals.get('posts').forEach(function (post) {
      if (updates[post.slug]) {
        post.abbrlink = updates[post.slug];
      }
    });
  }

  if (updated > 0) {
    hexo.log.info('abbrlink: 为 ' + updated + ' 篇文章更新了短链接');
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
