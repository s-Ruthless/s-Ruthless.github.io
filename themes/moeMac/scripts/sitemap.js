/**
 * sitemap.js — 内置站点地图生成器（集成在主题中，无需安装额外插件）
 *
 * 生成标准 sitemap.xml，包含所有文章、页面、分类、标签
 *
 * 启用方式：主题 _config.yml 中设置 sitemap: true
 * 关闭方式：设为 false（或删除该行）
 *
 * 可选配置：
 *   sitemap:
 *     enable: true
 *     path: sitemap.xml    # 输出文件路径
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

hexo.extend.generator.register('sitemap', function (locals) {
  var cfg = hexo.theme.config.sitemap;
  if (!cfg || (cfg.enable === false)) return {};

  var path = cfg.path || 'sitemap.xml';
  var siteUrl = (hexo.config.url || '').replace(/\/$/, '');

  var urls = [];
  var now = new Date().toISOString();

  /* 首页 */
  urls.push({
    loc: siteUrl + '/',
    lastmod: now,
    changefreq: 'daily',
    priority: '1.0'
  });

  /* 文章 */
  if (locals.posts) {
    locals.posts.each(function (post) {
      var lastmod = post.updated || post.date;
      urls.push({
        loc: siteUrl + '/' + post.path.replace(/index\.html$/, ''),
        lastmod: new Date(lastmod).toISOString(),
        changefreq: 'weekly',
        priority: '0.8'
      });
    });
  }

  /* 页面 */
  if (locals.pages) {
    locals.pages.each(function (page) {
      /* 跳过 404 等特殊页面 */
      if (page.path.indexOf('404') > -1) return;
      urls.push({
        loc: siteUrl + '/' + page.path.replace(/index\.html$/, ''),
        lastmod: new Date(page.updated || page.date || now).toISOString(),
        changefreq: 'monthly',
        priority: '0.6'
      });
    });
  }

  /* 分类 */
  if (locals.categories) {
    locals.categories.each(function (cat) {
      urls.push({
        loc: siteUrl + '/categories/' + (cat.slug || cat.name) + '/',
        lastmod: now,
        changefreq: 'weekly',
        priority: '0.5'
      });
    });
  }

  /* 标签 */
  if (locals.tags) {
    locals.tags.each(function (tag) {
      urls.push({
        loc: siteUrl + '/tags/' + (tag.slug || tag.name) + '/',
        lastmod: now,
        changefreq: 'weekly',
        priority: '0.5'
      });
    });
  }

  /* 归档页 */
  urls.push({
    loc: siteUrl + '/archives/',
    lastmod: now,
    changefreq: 'weekly',
    priority: '0.6'
  });

  var xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  urls.forEach(function (u) {
    xml += '  <url>\n';
    xml += '    <loc>' + escapeXML(u.loc) + '</loc>\n';
    xml += '    <lastmod>' + u.lastmod + '</lastmod>\n';
    xml += '    <changefreq>' + u.changefreq + '</changefreq>\n';
    xml += '    <priority>' + u.priority + '</priority>\n';
    xml += '  </url>\n';
  });

  xml += '</urlset>\n';

  return {
    path: path,
    data: xml
  };
});
