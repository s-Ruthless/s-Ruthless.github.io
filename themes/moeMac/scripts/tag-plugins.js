/**
 * moeMac 主题 — Butterfly 风格标签外挂（Tag Plugins）
 *
 * 核心原理（参考 katex-render.js）：
 *   before_post_render 阶段（优先级 6，在 container-blocks 5 之后、katex 7 之前）：
 *     - 将所有 {% tagname args %}...{% endtagname %} 和 {% tagname args %} 替换为
 *       @@TAG_N@@ 纯文本占位符，存储原始标签信息
 *     - 这样 escapeAllSwigTags 永远看不到 {% %}，不会生成 <hexoPostRenderCodeBlock>
 *     - marked 正常渲染周围 Markdown 语法
 *   after_post_render 阶段（优先级 4，在 katex 10 之前）：
 *     - 递归渲染标签内容（处理嵌套标签）
 *     - 还原占位符为实际 HTML
 */

'use strict';

var hexo = hexo || global.hexo;

/* =================== 辅助函数 =================== */

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function md(content) {
  if (!content) return '';
  try {
    return hexo.render.renderSync({ text: content, engine: 'markdown' });
  } catch (e) {
    return content;
  }
}

/* =================== Postcard 辅助函数 =================== */

function renderSinglePostcard(raw) {
  var parts = raw.split(',').map(function (s) { return s.trim(); });
  var inputPath = parts[0] || '';
  if (!inputPath) return '';

  /* 规范化路径 */
  if (inputPath.charAt(0) !== '/') inputPath = '/' + inputPath;

  /* 从 Hexo site 数据中查找文章
     支持多种路径格式匹配：
     1. abbrlink: /posts/75bba892.html 或 75bba892
     2. 旧日期路径: /2026/06/30/标题/ → 按 slug 匹配
     3. 完整路径: /posts/xxx.html 精确匹配
     4. 标题匹配 */
  var post = null;
  var resolvedPath = '';
  try {
    var posts = hexo.locals.get('posts');
    /* 提取输入路径中的关键信息 */
    var cleanInput = inputPath.replace(/^\/+|\/+$/g, '');
    /* 尝试提取 abbrlink: posts/75bba892.html → 75bba892 */
    var abbrlinkMatch = cleanInput.match(/(?:posts\/)?([a-f0-9]{8})\.html?$/i);
    var abbrlink = abbrlinkMatch ? abbrlinkMatch[1] : '';
    /* 尝试提取 slug: /2026/06/30/标题/ → 标题 */
    var slugMatch = cleanInput.match(/\d{4}\/\d{2}\/\d{2}\/(.+)$/);
    var slug = slugMatch ? decodeURIComponent(slugMatch[1]) : cleanInput;

    posts.forEach(function (p) {
      if (post) return;
      var pPath = '/' + (p.path || '').replace(/^\/+|\/+$/g, '');
      /* 1. 精确路径匹配 */
      if (pPath === '/' + cleanInput || (p.path || '') === cleanInput) {
        post = p;
        resolvedPath = pPath;
        return;
      }
      /* 2. abbrlink 匹配 */
      if (abbrlink && p.abbrlink === abbrlink) {
        post = p;
        resolvedPath = pPath;
        return;
      }
      /* 3. slug 匹配（旧日期路径兼容） */
      if (slug && p.slug === slug) {
        post = p;
        resolvedPath = pPath;
        return;
      }
      /* 4. 标题匹配 */
      if (slug && p.title === slug) {
        post = p;
        resolvedPath = pPath;
        return;
      }
    });
  } catch (e) { /* ignore */ }

  /* 如果没找到文章，使用原始输入路径作为链接 */
  var finalPath = resolvedPath || inputPath;
  if (finalPath.charAt(finalPath.length - 1) !== '/' && finalPath.indexOf('.html') === -1) {
    finalPath = finalPath + '/';
  }

  var title = parts[1] || (post ? post.title : '') || '文章';
  var desc = parts[2] || '';
  var cover = parts[3] || (post ? (post.cover || '') : '');

  /* 自动提取摘要 */
  if (!desc && post) {
    var excerpt = post.excerpt || post.description || '';
    if (!excerpt && post._content) {
      var moreIdx = post._content.indexOf('<!-- more -->');
      if (moreIdx !== -1) {
        excerpt = post._content.substring(0, moreIdx);
      } else {
        excerpt = post._content.substring(0, 200);
      }
    }
    excerpt = excerpt.replace(/<[^>]+>/g, '').replace(/[#*`~>\-]/g, '').replace(/\n+/g, ' ').trim();
    if (excerpt.length > 80) excerpt = excerpt.substring(0, 80) + '...';
    desc = excerpt;
  }
  if (!desc) desc = '点击阅读全文';

  /* 文章日期 */
  var dateStr = '';
  if (post && post.date) {
    try {
      var d = post.date;
      if (typeof d === 'object' && d.format) {
        dateStr = d.format('YYYY-MM-DD');
      } else {
        dateStr = String(d).substring(0, 10);
      }
    } catch (e) { /* ignore */ }
  }

  /* 紧凑横向卡片：缩略图在左，信息在右 */
  var html = '<a class="post-card ajax-link" data-href="' + finalPath + '">';
  if (cover) {
    html += '<div class="post-card-thumb">';
    html += '<img src="' + cover + '" alt="' + escapeHtml(title) + '" loading="lazy" decoding="async">';
    html += '</div>';
  }
  html += '<div class="post-card-info">';
  html += '<div class="post-card-title">' + escapeHtml(title) + '</div>';
  html += '<div class="post-card-excerpt">' + escapeHtml(desc) + '</div>';
  html += '<div class="post-card-meta">';
  if (dateStr) html += '<span class="post-card-date"><i class="fas fa-calendar-day"></i> ' + dateStr + '</span>';
  html += '<span class="post-card-read"><i class="fas fa-arrow-right"></i> 阅读</span>';
  html += '</div>';
  html += '</div></a>';
  return html;
}

/* =================== 标签渲染函数 ===================
 * 每个函数接收 (args, content)，返回 HTML
 * content 对于块级标签是已经递归渲染过的 HTML */

var TAG_RENDERERS = {

  /* --- Note 容器 --- */
  note: function (args, content) {
    var NOTE_ALIASES = { '提示': 'tip', '信息': 'info', '警告': 'warning', '危险': 'danger', '成功': 'success', '注意': 'note' };
    var NOTE_ICONS = { default: 'fa-circle-info', primary: 'fa-circle-info', tip: 'fa-lightbulb', success: 'fa-circle-check', info: 'fa-circle-info', warning: 'fa-triangle-exclamation', danger: 'fa-circle-xmark', note: 'fa-pen-to-square' };
    var NOTE_TITLES = { default: '注意', primary: '提示', tip: '提示', success: '成功', info: '信息', warning: '警告', danger: '危险', note: '注意' };

    var type = args[0] || 'default';
    if (NOTE_ALIASES[type]) type = NOTE_ALIASES[type];
    if (!NOTE_ICONS[type]) type = 'default';
    var customTitle = args.slice(1).join(' ');
    var title = customTitle || NOTE_TITLES[type] || type;
    var icon = NOTE_ICONS[type];

    return '<div class="note-' + type + ' custom-block cb-' + type + '">' +
      '<div class="custom-block-header"><i class="fas ' + icon + '"></i><span class="custom-block-title">' + title + '</span></div>' +
      '<div class="custom-block-body">' + content + '</div></div>';
  },

  /* --- Tabs 标签页 --- */
  tabs: function (args, content) {
    var name = args[0] || 'tabs';
    var defaultIndex = parseInt(args[1]) || 1;
    var tabId = 'tabs-' + String(name).replace(/[^a-zA-Z0-9]/g, '-');

    // 在 content 中查找已渲染的 tab 标记
    var tabRegex = /<!--TAB_START:([\s\S]*?)-->([\s\S]*?)<!--TAB_END-->/g;
    var tabLabels = [], tabContents = [], tabCounter = 0, m;
    while ((m = tabRegex.exec(content)) !== null) {
      tabCounter++;
      var isActive = tabCounter === defaultIndex;
      tabLabels.push('<button class="tab-label' + (isActive ? ' active' : '') + '" data-tab="' + tabId + '-' + tabCounter + '">' + m[1].trim() + '</button>');
      tabContents.push('<div class="tab-content' + (isActive ? ' active' : '') + '" id="' + tabId + '-' + tabCounter + '">' + m[2].trim() + '</div>');
    }
    if (tabCounter === 0) return content;
    return '<div class="tabs-container" id="' + tabId + '"><div class="tabs-nav">' + tabLabels.join('') + '</div><div class="tabs-body">' + tabContents.join('') + '</div></div>';
  },

  tab: function (args, content) {
    var label = args.join(' ').trim() || 'Tab';
    return '<!--TAB_START:' + label + '-->' + content + '<!--TAB_END-->';
  },

  /* --- Folding 折叠面板 --- */
  folding: function (args, content) {
    var FOLDING_COLORS = ['blue', 'cyan', 'green', 'yellow', 'red', 'default'];
    var firstArg = args[0] || '';
    var color = 'default', title;
    if (FOLDING_COLORS.indexOf(firstArg) !== -1) {
      color = firstArg;
      title = args.slice(1).join(' ') || '点击展开';
    } else {
      title = args.join(' ') || '点击展开';
    }
    var id = 'fold-' + Math.random().toString(36).substr(2, 6);
    return '<details class="folding-panel folding-' + color + '" id="' + id + '">' +
      '<summary class="folding-header"><i class="fas fa-chevron-right folding-icon"></i><span>' + title + '</span></summary>' +
      '<div class="folding-body">' + content + '</div></details>';
  },

  /* --- hideBlock 隐藏块 --- */
  hideBlock: function (args, content) {
    var display = args[0] || '点击查看内容';
    var hideId = Math.random().toString(36).substr(2, 8);
    return '<div class="hide-block" id="hb-' + hideId + '">' +
      '<button class="hide-block-btn" onclick="var e=document.getElementById(\'hb-c-' + hideId + '\');var b=this;e.style.display=\'block\';b.style.display=\'none\';">' +
      '<i class="fas fa-eye"></i> ' + display + '</button>' +
      '<div class="hide-block-content" id="hb-c-' + hideId + '" style="display:none;">' + content + '</div></div>';
  },

  /* --- hideToggle 可展开隐藏 --- */
  hideToggle: function (args, content) {
    var title = args.join(' ') || '点击展开';
    var id = 'ht-' + Math.random().toString(36).substr(2, 6);
    return '<details class="hide-toggle-panel" id="' + id + '">' +
      '<summary class="hide-toggle-header"><i class="fas fa-chevron-right folding-icon"></i><span>' + title + '</span></summary>' +
      '<div class="hide-toggle-body">' + content + '</div></details>';
  },

  /* --- Btns 按钮组 --- */
  btns: function (args, content) {
    var rounded = args.indexOf('rounded') !== -1;
    var center = args.indexOf('center') !== -1;
    var cls = 'btn-group' + (rounded ? ' btn-group-rounded' : '') + (center ? ' btn-group-center' : '');

    var COLOR_MAP = { red: '#ef4444', green: '#22c55e', blue: '#3b82f6', yellow: '#eab308', orange: '#f97316', purple: '#a855f7', pink: '#ec4899', cyan: '#06b6d4', gray: '#6b7280' };
    var buttons = [];
    var htmlBtnRegex = /<a\s+href="([^"]*)"[^>]*class="tag-btn[^"]*"[^>]*>([\s\S]*?)<\/a>/g;
    var m;
    while ((m = htmlBtnRegex.exec(content)) !== null) {
      buttons.push('<a href="' + m[1] + '" class="btn-group-item" target="_blank" rel="noopener">' + m[2].trim() + '</a>');
    }
    if (buttons.length === 0) {
      var rawBtnRegex = /\{%\s*btn\s+([^%]+)%\}/g;
      while ((m = rawBtnRegex.exec(content)) !== null) {
        var parts = m[1].split(',').map(function (s) { return s.trim(); });
        var iconHtml = parts[2] ? '<i class="fas ' + parts[2] + '"></i> ' : '';
        var color = parts[3] || '';
        var colorStyle = COLOR_MAP[color] ? ' style="--btn-color:' + COLOR_MAP[color] + '"' : '';
        var colorCls = COLOR_MAP[color] ? ' btn-group-colored' : '';
        buttons.push('<a href="' + (parts[0] || '#') + '" class="btn-group-item' + colorCls + '"' + colorStyle + ' target="_blank" rel="noopener">' + iconHtml + (parts[1] || '') + '</a>');
      }
    }
    if (buttons.length === 0) return content;
    return '<div class="' + cls + '">' + buttons.join('') + '</div>';
  },

  /* --- Flink 友链卡片 --- */
  flink: function (args, content) {
    var lines = content.trim().split('\n');
    var links = [], current = {};
    lines.forEach(function (line) {
      var m;
      if ((m = line.match(/^-\s+name:\s*(.*)$/))) { if (current.name) links.push(current); current = { name: m[1].trim() }; return; }
      if ((m = line.match(/^\s+link:\s*(.*)$/))) { current.link = m[1].trim(); return; }
      if ((m = line.match(/^\s+avatar:\s*(.*)$/))) { current.avatar = m[1].trim(); return; }
      if ((m = line.match(/^\s+desc:\s*(.*)$/))) { current.desc = m[1].trim(); return; }
    });
    if (current.name) links.push(current);
    if (links.length === 0) return content;
    var html = '<div class="flink-list">';
    links.forEach(function (link) {
      html += '<a class="flink-card" href="' + (link.link || '#') + '" target="_blank" rel="noopener">';
      if (link.avatar) html += '<img class="flink-avatar" src="' + link.avatar + '" alt="' + escapeHtml(link.name || '') + '" loading="lazy">';
      html += '<div class="flink-info"><span class="flink-name">' + (link.name || '') + '</span>';
      if (link.desc) html += '<span class="flink-desc">' + link.desc + '</span>';
      html += '</div></a>';
    });
    return html + '</div>';
  },

  /* --- Gallery 图片画廊（4列等高对齐布局） --- */
  gallery: function (args, content) {
    var columns = parseInt(args[0]) || 4;
    content = content.trim();
    var images = [];
    var lines = content.split('\n');
    /* 优先检测 markdown 图片语法 ![caption](url) */
    var imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    var m;
    while ((m = imgRegex.exec(content)) !== null) {
      images.push({ url: m[2].trim(), caption: m[1] || '' });
    }
    /* 如果没有 markdown 语法，尝试 CSV 格式 */
    if (images.length === 0) {
      lines.forEach(function (line) {
        line = line.trim();
        if (!line) return;
        /* CSV 格式：url, caption（caption 可选） */
        var commaIdx = line.indexOf(',');
        if (commaIdx !== -1) {
          images.push({ url: line.substring(0, commaIdx).trim(), caption: line.substring(commaIdx + 1).trim() });
        } else {
          images.push({ url: line, caption: '' });
        }
      });
    }
    if (images.length === 0) return content;
    var gid = 'gallery-' + Math.random().toString(36).substr(2, 6);
    var html = '<div class="gallery-container" id="' + gid + '" data-cols="' + columns + '">';
    html += '<div class="gallery-items">';
    images.forEach(function (img) {
      html += '<div class="gallery-item" data-full="' + img.url + '">';
      html += '<img src="' + img.url + '" alt="' + escapeHtml(img.caption) + '" decoding="async">';
      if (img.caption) {
        html += '<div class="gallery-caption">' + img.caption + '</div>';
      }
      html += '</div>';
    });
    html += '</div></div>';
    return html;
  },

  /* --- Timeline 时间线 --- */
  timeline: function (args, content) {
    var html = '<div class="timeline-container">';
    var nodeRegex = /<!--TIMENODE_START:([\s\S]*?)-->([\s\S]*?)<!--TIMENODE_END-->/g;
    var m;
    while ((m = nodeRegex.exec(content)) !== null) {
      html += '<div class="timeline-node"><div class="timeline-date">' + m[1].trim() + '</div><div class="timeline-content">' + m[2].trim() + '</div></div>';
    }
    return html + '</div>';
  },

  timenode: function (args, content) {
    var date = args.join(' ').trim();
    return '<!--TIMENODE_START:' + date + '-->' + content + '<!--TIMENODE_END-->';
  },

  /* --- Poem 诗词 --- */
  poem: function (args, content) {
    var parts = args.join(' ').split(',').map(function (s) { return s.trim(); });
    var title = parts[0] || '';
    var author = parts[1] || '';
    var lines = content.trim().split('\n').filter(function (l) { return l.trim(); });
    var bodyHtml = lines.map(function (l) { return '<p class="poem-line">' + l.trim() + '</p>'; }).join('');
    var html = '<div class="poem-block">';
    if (title) html += '<h4 class="poem-title">' + title + '</h4>';
    html += '<div class="poem-body">' + bodyHtml + '</div>';
    if (author) html += '<p class="poem-author">— ' + author + '</p>';
    return html + '</div>';
  },

  /* --- Detail 详情展开 --- */
  detail: function (args, content) {
    var title = args.join(' ') || '点击展开详情';
    var id = 'detail-' + Math.random().toString(36).substr(2, 6);
    return '<details class="details-panel" id="' + id + '"><summary class="details-summary">' + title + '</summary><div class="details-content">' + content + '</div></details>';
  },

  /* =================== 行内标签 =================== */

  badge: function (args) {
    var raw = args.join(' ');
    var parts = raw.split(',').map(function (s) { return s.trim(); });
    var colorMap = { red: '#ef4444', green: '#22c55e', blue: '#3b82f6', yellow: '#eab308', orange: '#f97316', purple: '#a855f7', cyan: '#06b6d4', gray: '#6b7280', default: 'var(--accent-color)' };
    var c = colorMap[parts[1]] || parts[1] || 'var(--accent-color)';
    var cls = parts[2] === 'pill' ? 'badge-pill' : 'badge-square';
    return '<span class="inline-badge ' + cls + '" style="--badge-color:' + c + '">' + (parts[0] || '') + '</span>';
  },

  label: function (args) {
    var input = args.join(' ');
    var atIdx = input.lastIndexOf('@');
    var text, color;
    if (atIdx !== -1) { text = input.substring(0, atIdx).trim(); color = input.substring(atIdx + 1).trim(); }
    else { text = input; color = 'default'; }
    var colorMap = { default: 'var(--accent-color)', blue: '#3b82f6', pink: '#ec4899', red: '#ef4444', purple: '#a855f7', orange: '#f97316', green: '#22c55e' };
    var c = colorMap[color] || color;
    return '<span class="inline-label" style="--label-color:' + c + '">' + text + '</span>';
  },

  hide: function (args) {
    return '<span class="hide-text" tabindex="0">' + args.join(' ') + '</span>';
  },

  btn: function (args) {
    var COLOR_MAP = { red: '#ef4444', green: '#22c55e', blue: '#3b82f6', yellow: '#eab308', orange: '#f97316', purple: '#a855f7', pink: '#ec4899', cyan: '#06b6d4', gray: '#6b7280' };
    var parts = args.join(' ').split(',').map(function (s) { return s.trim(); });
    var url = parts[0] || '#', text = parts[1] || '按钮', icon = parts[2] || '', color = parts[3] || '', center = parts[4] || '';
    var colorStyle = COLOR_MAP[color] ? ' style="--btn-color:' + COLOR_MAP[color] + '"' : '';
    var colorCls = COLOR_MAP[color] ? ' tag-btn-colored' : '';
    var html = '<a href="' + url + '" class="tag-btn' + colorCls + (center === 'center' ? ' center' : '') + '"' + colorStyle + ' target="_blank" rel="noopener">';
    if (icon) html += '<i class="fas ' + icon + '"></i> ';
    return html + text + '</a>';
  },

  inlineImg: function (args) {
    var src = args[0] || '', height = args[1] || '';
    var style = height ? ' style="height:' + height + ';vertical-align:middle;"' : '';
    return '<img class="inline-img" src="' + src + '"' + style + ' alt="inline-image">';
  },

  copy: function (args) {
    var text = args.join(' ');
    var escaped = text.replace(/'/g, '&#39;').replace(/"/g, '&quot;');
    return '<span class="copy-inline" data-text="' + escaped + '"><code>' + escaped + '</code>' +
      '<button class="copy-inline-btn" onclick="navigator.clipboard.writeText(this.parentElement.getAttribute(\'data-text\')).then(function(){var b=this;b.classList.add(\'copied\');setTimeout(function(){b.classList.remove(\'copied\')},1500)}.bind(this))">' +
      '<i class="fas fa-copy"></i></button></span>';
  },

  checkbox: function (args) {
    var COLORS = { red: '#ef4444', green: '#22c55e', blue: '#3b82f6', yellow: '#eab308', cyan: '#06b6d4', purple: '#a855f7' };
    var checked = false, color = '', text = '';
    args.forEach(function (arg) {
      arg = arg.replace(/,$/, '').trim();
      if (!arg) return;
      if (arg === 'checked') checked = true;
      else if (COLORS[arg]) color = arg;
      else text += (text ? ' ' : '') + arg;
    });
    var c = color ? COLORS[color] : 'var(--accent-color)';
    return '<div class="todo-item' + (checked ? ' todo-checked' : '') + '" style="--todo-color:' + c + '">' +
      '<span class="todo-checkbox' + (checked ? ' todo-checkbox-checked' : '') + '"></span><span class="todo-text">' + text + '</span></div>';
  },

  mark: function (args) {
    var input = args.join(' ');
    var atIdx = input.lastIndexOf('@');
    var text, color;
    if (atIdx !== -1) { text = input.substring(0, atIdx).trim(); color = input.substring(atIdx + 1).trim(); }
    else { text = input; color = 'yellow'; }
    var colorMap = { yellow: 'rgba(250,204,21,0.35)', red: 'rgba(239,68,68,0.25)', green: 'rgba(34,197,94,0.25)', blue: 'rgba(59,130,246,0.25)', purple: 'rgba(168,85,247,0.25)', cyan: 'rgba(6,182,212,0.25)' };
    return '<mark class="text-mark" style="background:' + (colorMap[color] || color) + '">' + text + '</mark>';
  },

  quot: function (args) {
    var parts = args.join(' ').split(',').map(function (s) { return s.trim(); });
    var html = '<blockquote class="quot-block"><p class="quot-text">' + (parts[0] || '') + '</p>';
    if (parts[1]) html += '<footer class="quot-author">— ' + parts[1] + '</footer>';
    return html + '</blockquote>';
  },

  linkcard: function (args) {
    var parts = args.join(' ').split(',').map(function (s) { return s.trim(); });
    var html = '<a class="link-card" href="' + (parts[0] || '#') + '" target="_blank" rel="noopener"><div class="link-card-content"><div class="link-card-text">';
    html += '<span class="link-card-title">' + (parts[1] || '链接') + '</span>';
    if (parts[2]) html += '<span class="link-card-desc">' + parts[2] + '</span>';
    html += '</div>';
    if (parts[3]) html += '<img class="link-card-img" src="' + parts[3] + '" alt="' + escapeHtml(parts[1] || '') + '" loading="lazy">';
    return html + '</div></a>';
  },

  /* --- Postcard 文章卡片（站内文章引用卡片，AJAX 跳转） --- */
  /* 支持多种语法：
     {% postcard /path/ %}                          单卡片
     {% postcard /path/, 标题, 描述, 封面URL %}      单卡片自定义
     {% postcard /path1/ | /path2/ | /path3/ %}     多卡片横排
  */
  postcard: function (args) {
    var raw = args.join(' ').trim();
    if (!raw) return '';

    /* 判断是否为多卡片模式（包含 | 分隔符） */
    if (raw.indexOf('|') !== -1) {
      var paths = raw.split('|').map(function (s) { return s.trim(); }).filter(function (s) { return s; });
      if (paths.length === 0) return '';
      if (paths.length === 1) return renderSinglePostcard(paths[0]);
      var grid = '<div class="post-card-grid">';
      paths.forEach(function (p) { grid += renderSinglePostcard(p); });
      return grid + '</div>';
    }

    return renderSinglePostcard(raw);
  },

  radio: function (args) {
    var COLORS = { red: '#ef4444', green: '#22c55e', blue: '#3b82f6', yellow: '#eab308', cyan: '#06b6d4', purple: '#a855f7' };
    var checked = false, color = '', text = '';
    args.forEach(function (arg) {
      arg = arg.replace(/,$/, '').trim();
      if (!arg) return;
      if (arg === 'checked') checked = true;
      else if (COLORS[arg]) color = arg;
      else text += (text ? ' ' : '') + arg;
    });
    var c = color ? COLORS[color] : 'var(--accent-color)';
    return '<div class="todo-item radio-item' + (checked ? ' todo-checked' : '') + '" style="--todo-color:' + c + '">' +
      '<span class="radio-checkbox' + (checked ? ' radio-checkbox-checked' : '') + '"></span><span class="todo-text">' + text + '</span></div>';
  },

  divider: function (args) {
    var icon = (args[0] || '').replace(/,$/, '').trim();
    var text = args.slice(1).join(' ') || '';
    if (!icon && !text) return '<hr class="article-divider">';
    return '<div class="article-divider-fancy"><span class="divider-line"></span>' +
      (icon ? '<i class="fas ' + icon + '"></i>' : '') +
      (text ? '<span class="divider-text">' + text + '</span>' : '') +
      '<span class="divider-line"></span></div>';
  },

  kbd: function (args) {
    var keys = args.join(' ').split('+').map(function (k) { return k.trim(); });
    return keys.map(function (k) { return '<kbd class="kbd-key">' + k + '</kbd>'; }).join('<span class="kbd-plus">+</span>');
  },

  span: function (args) {
    var STYLES = { red: 'color:#ef4444', blue: 'color:#3b82f6', green: 'color:#22c55e', purple: 'color:#a855f7', orange: 'color:#f97316', pink: 'color:#ec4899', gray: 'color:#6b7280', bold: 'font-weight:700', italic: 'font-style:italic', underline: 'text-decoration:underline', strike: 'text-decoration:line-through', large: 'font-size:1.2em', small: 'font-size:0.85em' };
    var parts = args.join(' ').split(',').map(function (s) { return s.trim(); });
    var styleParts = [];
    (parts[0] || '').split(/\s+/).forEach(function (s) { if (STYLES[s]) styleParts.push(STYLES[s]); });
    return '<span class="custom-span" style="' + styleParts.join(';') + '">' + (parts.slice(1).join(', ') || '') + '</span>';
  },

  /* Font Awesome 5 → 6 名称兼容映射 */
  icon: function (args) {
    var FA5_TO_FA6 = {
      'fa-check-circle': 'fa-circle-check',
      'fa-info-circle': 'fa-circle-info',
      'fa-exclamation-triangle': 'fa-triangle-exclamation',
      'fa-exclamation-circle': 'fa-circle-exclamation',
      'fa-times-circle': 'fa-circle-xmark',
      'fa-check-square': 'fa-square-check',
      'fa-tachometer-alt': 'fa-gauge-high',
      'fa-external-link-alt': 'fa-arrow-up-right-from-square',
      'fa-arrow-alt-circle-right': 'fa-circle-right',
      'fa-arrow-alt-circle-left': 'fa-circle-left',
      'fa-caret-square-right': 'fa-square-caret-right',
      'fa-caret-square-down': 'fa-square-caret-down',
      'fa-file-alt': 'fa-file-lines',
      'fa-file-code': 'fa-file-code',
      'fa-map-marked-alt': 'fa-map-location-dot',
      'fa-mobile-alt': 'fa-mobile-screen',
      'fa-play-circle': 'fa-circle-play',
      'fa-pause-circle': 'fa-circle-pause',
      'fa-stop-circle': 'fa-circle-stop',
      'fa-question-circle': 'fa-circle-question',
      'fa-plus-circle': 'fa-circle-plus',
      'fa-minus-circle': 'fa-circle-minus',
      'fa-arrow-circle-right': 'fa-circle-arrow-right',
      'fa-arrow-circle-left': 'fa-circle-arrow-left',
      'fa-arrow-circle-up': 'fa-circle-arrow-up',
      'fa-arrow-circle-down': 'fa-circle-arrow-down',
      'fa-shopping-cart': 'fa-cart-shopping',
      'fa-shopping-bag': 'fa-bag-shopping',
      'fa-github-alt': 'fa-github',
      'fa-thermometer-half': 'fa-temperature-half',
      'fa-walking': 'fa-person-walking',
      'fa-running': 'fa-person-running',
      'fa-user-circle': 'fa-circle-user',
      'fa-calendar-alt': 'fa-calendar-days'
    };
    var icon = (args[0] || '').replace(/,$/, '').trim();
    if (FA5_TO_FA6[icon]) icon = FA5_TO_FA6[icon];
    var color = args.slice(1).join(' ').trim();
    var colorMap = { red: '#ef4444', green: '#22c55e', blue: '#3b82f6', yellow: '#eab308', orange: '#f97316', purple: '#a855f7', pink: '#ec4899', gray: '#6b7280' };
    var styleStr = colorMap[color] ? ' style="color:' + colorMap[color] + '"' : '';
    return '<i class="fas ' + icon + ' inline-icon"' + styleStr + '></i>';
  },

  u: function (args) { return '<u class="underline-text">' + args.join(' ') + '</u>'; },

  abbr: function (args) {
    var parts = args.join(' ').split(',').map(function (s) { return s.trim(); });
    return '<abbr class="abbr-text" title="' + (parts[1] || '') + '">' + (parts[0] || '') + '</abbr>';
  },

  aside: function (args) {
    var raw = args.join(' ');
    var side = 'left', text = raw;
    if (raw.indexOf('left') === 0 || raw.indexOf('right') === 0) {
      var parts = raw.split(/\s+(.+)/);
      side = parts[0].replace(/,$/, '').trim();
      text = parts[1] || '';
    }
    return '<aside class="pullquote pullquote-' + side + '">' + text + '</aside>';
  },

  sub: function (args) { return '<sub class="sub-text">' + args.join(' ') + '</sub>'; },
  sup: function (args) { return '<sup class="sup-text">' + args.join(' ') + '</sup>'; },

  /* =================== 新增标签外挂 =================== */

  /* --- Bubble 气泡注释（行内 hover 显示） --- */
  bubble: function (args) {
    var input = args.join(' ');
    var atIdx = input.lastIndexOf('@');
    var text, tip;
    if (atIdx !== -1) { text = input.substring(0, atIdx).trim(); tip = input.substring(atIdx + 1).trim(); }
    else { text = input; tip = '注释'; }
    return '<span class="bubble-note" data-tip="' + escapeHtml(tip) + '">' + escapeHtml(text) + '<i class="fas fa-circle-info bubble-icon"></i></span>';
  },

  /* --- Progress 进度条 --- */
  progress: function (args) {
    var raw = args.join(' ');
    var parts = raw.split(',').map(function (s) { return s.trim(); });
    var percent = parseInt(parts[0], 10);
    if (isNaN(percent)) percent = 0;
    percent = Math.max(0, Math.min(100, percent));
    var colorMap = { red: '#ef4444', green: '#22c55e', blue: '#3b82f6', yellow: '#eab308', orange: '#f97316', purple: '#a855f7', cyan: '#06b6d4', pink: '#ec4899' };
    var color = colorMap[parts[1]] || parts[1] || 'var(--accent-color)';
    var label = parts[2] || '';
    var html = '<div class="progress-bar-wrap" style="--progress-color:' + color + '">';
    if (label) html += '<span class="progress-label">' + escapeHtml(label) + '</span>';
    html += '<div class="progress-track"><div class="progress-fill" style="width:' + percent + '%"></div></div>';
    html += '<span class="progress-percent">' + percent + '%</span></div>';
    return html;
  },

  /* --- Steps 步骤条（块级容器） --- */
  steps: function (args, content) {
    var name = args[0] || '';
    var stepRegex = /<!--STEP_START:([\s\S]*?)-->([\s\S]*?)<!--STEP_END-->/g;
    var stepLabels = [], stepContents = [], stepCounter = 0, m;
    while ((m = stepRegex.exec(content)) !== null) {
      stepCounter++;
      stepLabels.push(m[1].trim());
      stepContents.push(m[2].trim());
    }
    if (stepCounter === 0) return content;
    var sid = 'steps-' + Math.random().toString(36).substr(2, 6);
    var html = '<div class="steps-container" id="' + sid + '"><div class="steps-nav">';
    stepLabels.forEach(function (label, i) {
      html += '<button class="step-label' + (i === 0 ? ' active' : '') + '" data-step="' + sid + '-' + i + '"><span class="step-num">' + (i + 1) + '</span><span class="step-text">' + label + '</span></button>';
    });
    html += '</div><div class="steps-body">';
    stepContents.forEach(function (c, i) {
      html += '<div class="step-content' + (i === 0 ? ' active' : '') + '" id="' + sid + '-' + i + '">' + c + '</div>';
    });
    html += '</div></div>';
    return html;
  },

  step: function (args, content) {
    var label = args.join(' ').trim() || 'Step';
    return '<!--STEP_START:' + label + '-->' + content + '<!--STEP_END-->';
  },

  /* --- Carousel 轮播图（块级容器） --- */
  carousel: function (args, content) {
    var itemRegex = /<!--CAROUSEL_START:([\s\S]*?)-->([\s\S]*?)<!--CAROUSEL_END-->/g;
    var items = [], m;
    while ((m = itemRegex.exec(content)) !== null) {
      items.push({ url: m[1].trim(), caption: m[2].trim() });
    }
    if (items.length === 0) {
      var imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
      while ((m = imgRegex.exec(content)) !== null) {
        items.push({ url: m[2].trim(), caption: m[1] || '' });
      }
    }
    if (items.length === 0) return content;
    var cid = 'carousel-' + Math.random().toString(36).substr(2, 6);
    var html = '<div class="carousel-container" id="' + cid + '">';
    html += '<div class="carousel-track">';
    items.forEach(function (item, i) {
      html += '<div class="carousel-slide' + (i === 0 ? ' active' : '') + '">';
      html += '<img src="' + item.url + '" alt="' + escapeHtml(item.caption) + '" loading="eager" decoding="async">';
      if (item.caption) html += '<div class="carousel-caption">' + item.caption + '</div>';
      html += '</div>';
    });
    html += '</div>';
    if (items.length > 1) {
      html += '<button class="carousel-btn carousel-prev" data-carousel="' + cid + '"><i class="fas fa-chevron-left"></i></button>';
      html += '<button class="carousel-btn carousel-next" data-carousel="' + cid + '"><i class="fas fa-chevron-right"></i></button>';
      html += '<div class="carousel-dots">';
      items.forEach(function (_, i) {
        html += '<button class="carousel-dot' + (i === 0 ? ' active' : '') + '" data-carousel="' + cid + '" data-idx="' + i + '"></button>';
      });
      html += '</div>';
    }
    html += '</div>';
    return html;
  },

  /* --- Card 卡片容器（块级） --- */
  card: function (args, content) {
    var COLOR_MAP = { red: '#ef4444', green: '#22c55e', blue: '#3b82f6', yellow: '#eab308', orange: '#f97316', purple: '#a855f7', cyan: '#06b6d4', pink: '#ec4899', default: 'var(--accent-color)' };
    var firstArg = args[0] || '';
    var color = 'default', title, icon = '';
    if (COLOR_MAP[firstArg]) {
      color = firstArg;
      title = args.slice(1).join(' ') || '';
    } else {
      title = args.join(' ') || '';
    }
    var c = COLOR_MAP[color] || 'var(--accent-color)';
    var html = '<div class="card-box" style="--card-color:' + c + '">';
    if (title) html += '<div class="card-box-header"><i class="fas fa-bookmark card-box-icon"></i><span class="card-box-title">' + escapeHtml(title) + '</span></div>';
    html += '<div class="card-box-body">' + content + '</div></div>';
    return html;
  }
};

/* =================== 标签解析与渲染 =================== */

// 块级标签列表（有 end 标签）
var BLOCK_TAGS = ['note', 'tabs', 'tab', 'folding', 'hideBlock', 'hideToggle', 'btns', 'flink', 'gallery', 'timeline', 'timenode', 'poem', 'detail', 'steps', 'step', 'carousel', 'card'];

// 行内标签列表（无 end 标签）
var INLINE_TAGS = ['badge', 'label', 'hide', 'btn', 'inlineImg', 'copy', 'checkbox', 'mark', 'quot', 'linkcard', 'postcard', 'radio', 'divider', 'kbd', 'span', 'icon', 'u', 'abbr', 'aside', 'sub', 'sup', 'bubble', 'progress'];

/**
 * 递归渲染内容中的标签
 * @param {string} content - 可能包含 {% %} 标签语法的内容
 * @returns {string} - 渲染后的 HTML
 */
function renderContent(content) {
  if (!content) return '';

  // 1. 保护代码块和行内代码
  var codeStore = [];
  content = content.replace(/(```[\s\S]*?```|~~~[\s\S]*?~~~)/g, function (m) {
    var id = '\x00C' + codeStore.length + '\x00';
    codeStore.push(m);
    return id;
  });
  content = content.replace(/(`[^`\n]+`)/g, function (m) {
    var id = '\x00C' + codeStore.length + '\x00';
    codeStore.push(m);
    return id;
  });

  // 2. 匹配块级标签 {% tagname args %} content {% endtagname %}
  BLOCK_TAGS.forEach(function (name) {
    var regex = new RegExp('{%\\s*' + name + '\\s+([^%]*?)%}([\\s\\S]*?){%\\s*end' + name + '\\s*%}', 'g');
    content = content.replace(regex, function (m, argsStr, inner) {
      var args = argsStr.trim().split(/\s+/);
      // 递归处理内部内容
      var renderedInner = renderContent(inner);
      // 对于需要 Markdown 渲染的标签，调用 md()
      if (['note', 'folding', 'hideBlock', 'hideToggle', 'detail', 'card'].indexOf(name) !== -1) {
        renderedInner = md(inner.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]+`/g, function (m2) {
          return m2; // 保留代码块
        }));
        // 但需要先递归处理内部标签
        renderedInner = renderContent(inner);
        renderedInner = md(renderedInner.replace(/\x00C\d+\x00/g, function (m2) {
          return codeStore[parseInt(m2.replace(/\D/g, ''))];
        }));
      } else if (['tab', 'timenode', 'step'].indexOf(name) !== -1) {
        // tab 和 timenode 的内容需要 Markdown 渲染
        renderedInner = md(renderedInner);
      }
      if (TAG_RENDERERS[name]) {
        return TAG_RENDERERS[name](args, renderedInner);
      }
      return m;
    });
  });

  // 3. 匹配行内标签 {% tagname args %}
  INLINE_TAGS.forEach(function (name) {
    var regex = new RegExp('{%\\s*' + name + '\\s+([^%]*?)%}', 'g');
    content = content.replace(regex, function (m, argsStr) {
      var args = argsStr.trim().split(/\s+/);
      if (TAG_RENDERERS[name]) {
        return TAG_RENDERERS[name](args, '');
      }
      return m;
    });
  });

  // 4. 还原代码块
  content = content.replace(/\x00C(\d+)\x00/g, function (_, idx) {
    return codeStore[parseInt(idx)];
  });

  return content;
}

/* =================== before_post_render：提取标签，替换为占位符 =================== */
hexo.extend.filter.register('before_post_render', function (data) {
  if (!data.content) return data;

  var store = [];

  // 1. 保护代码块
  var codeStore = [];
  data.content = data.content.replace(/(```[\s\S]*?```|~~~[\s\S]*?~~~)/g, function (m) {
    var id = '\x00CODE' + codeStore.length + '\x00';
    codeStore.push(m);
    return id;
  });
  // 行内代码中如有 {% %} 也保护
  data.content = data.content.replace(/(`[^`\n]+`)/g, function (m) {
    if (m.indexOf('{%') === -1) return m;
    var id = '\x00CODE' + codeStore.length + '\x00';
    codeStore.push(m);
    return id;
  });

  // 2. 匹配块级标签，替换为 @@TAG_N@@ 占位符
  //    先匹配容器标签（tabs, timeline），再匹配子标签（tab, timenode）
  var blockOrder = ['tabs', 'tab', 'timeline', 'timenode', 'note', 'folding', 'hideBlock', 'hideToggle', 'btns', 'flink', 'gallery', 'poem', 'detail', 'steps', 'step', 'carousel', 'card'];
  blockOrder.forEach(function (name) {
    var regex = new RegExp('{%\\s*' + name + '\\s+([^%]*?)%}([\\s\\S]*?){%\\s*end' + name + '\\s*%}', 'g');
    data.content = data.content.replace(regex, function (m, argsStr, inner) {
      var idx = store.length;
      store.push({ name: name, args: argsStr.trim(), raw: inner });
      return '@@TAG_' + idx + '@@';
    });
  });

  // 3. 匹配行内标签，替换为 @@TAG_N@@ 占位符
  INLINE_TAGS.forEach(function (name) {
    var regex = new RegExp('{%\\s*' + name + '\\s+([^%]*?)%}', 'g');
    data.content = data.content.replace(regex, function (m, argsStr) {
      var idx = store.length;
      store.push({ name: name, args: argsStr.trim(), raw: '' });
      return '@@TAG_' + idx + '@@';
    });
  });

  // 4. 还原代码块
  data.content = data.content.replace(/\x00CODE(\d+)\x00/g, function (_, idx) {
    return codeStore[parseInt(idx)];
  });

  data._tag_store = store;
  return data;
}, 6);

/* =================== after_post_render：渲染标签，还原占位符 =================== */
hexo.extend.filter.register('after_post_render', function (data) {
  var store = data._tag_store;
  if (!store || store.length === 0) return data;
  if (!data.content || data.content.indexOf('@@TAG_') === -1) {
    delete data._tag_store;
    return data;
  }

  // 1. 渲染每个标签的 HTML
  for (var i = 0; i < store.length; i++) {
    var item = store[i];
    var args = item.args ? item.args.split(/\s+/).filter(function (a) { return a; }) : [];

    // 递归处理内部内容（处理嵌套标签）
    var innerHtml = '';
    if (item.raw) {
      // 先递归处理内部标签
      var processed = renderContent(item.raw);
      // 某些标签需要 Markdown 渲染
      if (['note', 'folding', 'hideBlock', 'hideToggle', 'detail', 'card'].indexOf(item.name) !== -1) {
        innerHtml = md(processed);
      } else if (['tab', 'timenode', 'step', 'carouselItem'].indexOf(item.name) !== -1) {
        innerHtml = md(processed);
      } else {
        innerHtml = processed;
      }
    }

    if (TAG_RENDERERS[item.name]) {
      item.html = TAG_RENDERERS[item.name](args, innerHtml);
    } else {
      item.html = '';
    }
  }

  // 2. 移除独立占位符外层的 <p> 包裹（块级标签场景）
  data.content = data.content.replace(/<p>\s*@@TAG_(\d+)@@\s*<\/p>/g, '@@TAG_$1@@');

  // 3. 替换占位符为实际 HTML（循环处理嵌套占位符）
  var maxIterations = 10;
  while (maxIterations-- > 0 && data.content.indexOf('@@TAG_') !== -1) {
    data.content = data.content.replace(/@@TAG_(\d+)@@/g, function (_, idx) {
      return store[parseInt(idx)] ? store[parseInt(idx)].html : '';
    });
  }

  delete data._tag_store;
  return data;
}, 4);
