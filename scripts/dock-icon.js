/**
 * dock-icon.js — 从主题 _config.yml 的 dock 配置中查找当前页面对应的图标
 * 使用方式（EJS 模板中）：<i class="<%- dock_icon() %>"></i>
 */
hexo.extend.helper.register('dock_icon', function () {
  var dock = this.theme.dock || [];
  var path = this.page.path || '';
  // 标准化：去掉 index.html 后缀，去掉首尾斜杠
  var normalized = path.replace(/\/index\.html$/, '').replace(/^\/|\/$/g, '');
  var icon = '';
  dock.forEach(function (item) {
    var itemPath = (item.page || '').replace(/^\/|\/$/g, '');
    // 精确匹配（如 posts == posts, archives == archives, about == about）
    if (itemPath === normalized) {
      icon = item.icon;
    }
  });
  return icon;
});
