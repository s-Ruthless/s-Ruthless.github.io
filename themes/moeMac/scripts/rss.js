/**
 * rss.js — 内置 RSS 订阅生成器（集成在主题中，无需安装额外插件）
 *
 * 生成标准 RSS 2.0 格式的 atom.xml
 *
 * 启用方式：主题 _config.yml 中设置 rss: true
 * 关闭方式：设为 false（或删除该行）
 *
 * 可选配置：
 *   rss:
 *     enable: true
 *     path: atom.xml       # 输出文件路径
 *     limit: 20             # 输出文章数量（0 = 全部）
 *     content: true         # 是否包含全文内容
 */

"use strict";

var escapeXML = function (str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

hexo.extend.generator.register('rss', function (locals) {
  var cfg = hexo.theme.config.rss;
  if (!cfg || (cfg.enable === false)) return {};

  var path = cfg.path || 'atom.xml';
  var limit = cfg.limit || 20;
  var showContent = cfg.content !== false;

  var siteUrl = (hexo.config.url || '').replace(/\/$/, '');
  var siteTitle = escapeXML(hexo.config.title || '');
  var siteDesc = escapeXML(hexo.config.description || '');
  var siteAuthor = escapeXML(hexo.config.author || '');
  var siteLang = hexo.config.language || 'zh-CN';

  var posts = locals.posts.sort('-date').toArray();
  if (limit > 0) posts = posts.slice(0, limit);

  var buildDate = new Date().toUTCString();

  var xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n';
  xml += '  <channel>\n';
  xml += '    <title>' + siteTitle + '</title>\n';
  xml += '    <link>' + siteUrl + '</link>\n';
  xml += '    <description>' + siteDesc + '</description>\n';
  xml += '    <language>' + siteLang + '</language>\n';
  xml += '    <lastBuildDate>' + buildDate + '</lastBuildDate>\n';
  xml += '    <generator>moeMac Theme (Hexo ' + (hexo.version || '') + ')</generator>\n';
  xml += '    <atom:link href="' + siteUrl + '/' + path + '" rel="self" type="application/rss+xml" />\n';

  posts.forEach(function (post) {
    var postUrl = siteUrl + '/' + post.path.replace(/index\.html$/, '');
    var pubDate = new Date(post.date).toUTCString();
    var title = escapeXML(post.title || '');
    var desc = escapeXML(post.description || post.excerpt || '');

    xml += '    <item>\n';
    xml += '      <title>' + title + '</title>\n';
    xml += '      <link>' + postUrl + '</link>\n';
    xml += '      <guid isPermaLink="true">' + postUrl + '</guid>\n';
    xml += '      <pubDate>' + pubDate + '</pubDate>\n';
    /* 清除 XML 无效字符（null byte 等控制字符，来自标签插件的占位符） */
    var content = showContent ? (post.content || desc) : desc;
    content = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    xml += '      <description><![CDATA[' + content + ']]></description>\n';

    /* 分类 */
    if (post.categories && post.categories.length) {
      post.categories.forEach(function (cat) {
        xml += '      <category>' + escapeXML(cat.name) + '</category>\n';
      });
    }

    /* 作者 */
    if (siteAuthor) {
      xml += '      <author>' + siteAuthor + '</author>\n';
    }

    xml += '    </item>\n';
  });

  xml += '  </channel>\n';
  xml += '</rss>\n';

  return {
    path: path,
    data: xml
  };
});
