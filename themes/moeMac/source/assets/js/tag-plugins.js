/**
 * moeMac 主题 — 标签外挂前端交互脚本
 * 功能：Tabs 切换、Folding 图标旋转、KaTeX 公式渲染、Mermaid 图表渲染、复制按钮
 *
 * 初始化入口：window.TagPlugins.init()
 * 在 main.js 的 AJAX 导航完成后自动调用
 */
window.TagPlugins = (function () {
  'use strict';

  /* ========== Tabs 标签页切换 ========== */
  function initTabs() {
    document.querySelectorAll('.tabs-container').forEach(function (container) {
      if (container.dataset.initialized) return;
      container.dataset.initialized = 'true';

      var labels = container.querySelectorAll('.tab-label');
      labels.forEach(function (label) {
        label.addEventListener('click', function () {
          var targetId = label.getAttribute('data-tab');
          // 取消所有 active
          container.querySelectorAll('.tab-label').forEach(function (l) { l.classList.remove('active'); });
          container.querySelectorAll('.tab-content').forEach(function (c) { c.classList.remove('active'); });
          // 激活当前
          label.classList.add('active');
          var target = container.querySelector('#' + CSS.escape(targetId));
          if (target) target.classList.add('active');
        });
      });
    });
  }

  /* ========== Folding 折叠面板图标 ========== */
  function initFolding() {
    document.querySelectorAll('.folding-panel, .hide-toggle-panel').forEach(function (panel) {
      if (panel.dataset.initialized) return;
      panel.dataset.initialized = 'true';
      panel.addEventListener('toggle', function () {
        var icon = panel.querySelector('.folding-icon');
        if (icon) {
          if (panel.open) icon.style.transform = 'rotate(90deg)';
          else icon.style.transform = 'rotate(0deg)';
        }
      });
    });
  }

  /* ========== KaTeX 数学公式渲染 ========== */
  function initKatex() {
    if (typeof katex === 'undefined') {
      // KaTeX 库尚未加载，等待后重试
      setTimeout(initKatex, 200);
      return;
    }

    // 渲染行内公式 <span class="math-inline">公式</span>
    document.querySelectorAll('.math-inline:not([data-katex-rendered])').forEach(function (el) {
      try {
        var formula = el.textContent;
        katex.render(formula, el, { displayMode: false, throwOnError: false });
        el.setAttribute('data-katex-rendered', 'true');
      } catch (e) {
        console.warn('[KaTeX] inline render error:', e, el.textContent);
      }
    });

    // 渲染块级公式 <div class="math-block">公式</div>
    document.querySelectorAll('.math-block:not([data-katex-rendered])').forEach(function (el) {
      try {
        var formula = el.textContent;
        katex.render(formula, el, { displayMode: true, throwOnError: false });
        el.setAttribute('data-katex-rendered', 'true');
      } catch (e) {
        console.warn('[KaTeX] block render error:', e, el.textContent);
      }
    });
  }

  /* ========== Mermaid 图表渲染 ========== */
  var mermaidLoaded = false;
  function initMermaid() {
    var mermaidDivs = document.querySelectorAll('.mermaid:not([data-processed])');
    if (mermaidDivs.length === 0) return;

    if (typeof mermaid === 'undefined') {
      if (mermaidLoaded) return; // 脚本加载中，等 onload 回调会处理
      mermaidLoaded = true;
      var script = document.createElement('script');
      script.src = (window.__ASSETS__ || '/assets') + '/js/mermaid.min.js';
      script.onload = function () {
        try {
          mermaid.initialize({
            startOnLoad: false,
            theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'default',
            securityLevel: 'loose'
          });
          mermaid.run();
        } catch (e) {
          console.warn('[Mermaid] init error:', e);
        }
      };
      document.head.appendChild(script);
    } else {
      try {
        mermaid.run();
      } catch (e) {
        console.warn('[Mermaid] run error:', e);
      }
    }
  }

  /* ========== copy-inline 点击复制 ========== */
  
  /* ========== Gallery 灯箱 ========== */
  function initGalleryLightbox() {
    var items = document.querySelectorAll('.article-content .gallery-item');
    if (items.length === 0) return;
    items.forEach(function(item, idx) {
      if (item.dataset.galleryInit) return;
      item.dataset.galleryInit = '1';
      item.addEventListener('click', function() {
        var img = item.querySelector('img');
        if (!img) return;
        openGalleryLightbox(img.src, img.alt || '');
      });
    });
  }

  var _galleryLightbox = null;
  function openGalleryLightbox(src, alt) {
    if (!_galleryLightbox) {
      _galleryLightbox = document.createElement('div');
      _galleryLightbox.className = 'gallery-lightbox';
      _galleryLightbox.innerHTML = '<div class="lightbox-mask"></div><div class="lightbox-close"><i class="fas fa-xmark"></i></div><div class="lightbox-content"><img src="" alt=""></div>';
      document.body.appendChild(_galleryLightbox);
      _galleryLightbox.querySelector('.lightbox-mask').addEventListener('click', closeGalleryLightbox);
      _galleryLightbox.querySelector('.lightbox-close').addEventListener('click', closeGalleryLightbox);
      document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeGalleryLightbox(); });
    }
    var lbImg = _galleryLightbox.querySelector('img');
    lbImg.src = src;
    lbImg.alt = alt;
    _galleryLightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeGalleryLightbox() {
    if (_galleryLightbox) {
      _galleryLightbox.classList.remove('open');
      document.body.style.overflow = '';
    }
  }
function initCopyInline() {
    document.querySelectorAll('.copy-inline-btn').forEach(function (btn) {
      if (btn.dataset.initialized) return;
      btn.dataset.initialized = 'true';
      btn.addEventListener('click', function () {
        var text = btn.parentElement.getAttribute('data-text');
        if (navigator.clipboard && text) {
          navigator.clipboard.writeText(text).then(function () {
            btn.classList.add('copied');
            setTimeout(function () { btn.classList.remove('copied'); }, 1500);
          });
        }
      });
    });
  }

  /* ========== Steps 步骤条切换 ========== */
  function initSteps() {
    document.querySelectorAll('.steps-container').forEach(function (container) {
      if (container.dataset.initialized) return;
      container.dataset.initialized = 'true';
      var labels = container.querySelectorAll('.step-label');
      labels.forEach(function (label) {
        label.addEventListener('click', function () {
          var targetId = label.getAttribute('data-step');
          container.querySelectorAll('.step-label').forEach(function (l) { l.classList.remove('active'); });
          container.querySelectorAll('.step-content').forEach(function (c) { c.classList.remove('active'); });
          label.classList.add('active');
          var target = container.querySelector('#' + CSS.escape(targetId));
          if (target) target.classList.add('active');
        });
      });
    });
  }

  /* ========== Carousel 轮播图 ========== */
  function initCarousel() {
    document.querySelectorAll('.carousel-container').forEach(function (container) {
      if (container.dataset.initialized) return;
      container.dataset.initialized = 'true';
      var slides = container.querySelectorAll('.carousel-slide');
      var dots = container.querySelectorAll('.carousel-dot');
      var prevBtn = container.querySelector('.carousel-prev');
      var nextBtn = container.querySelector('.carousel-next');
      var current = 0;
      var total = slides.length;
      if (total <= 1) return;

      function goTo(idx) {
        current = ((idx % total) + total) % total;
        slides.forEach(function (s, i) { s.classList.toggle('active', i === current); });
        dots.forEach(function (d, i) { d.classList.toggle('active', i === current); });
      }
      if (prevBtn) prevBtn.addEventListener('click', function (e) { e.stopPropagation(); goTo(current - 1); });
      if (nextBtn) nextBtn.addEventListener('click', function (e) { e.stopPropagation(); goTo(current + 1); });
      dots.forEach(function (dot) {
        dot.addEventListener('click', function (e) {
          e.stopPropagation();
          var idx = parseInt(dot.getAttribute('data-idx'), 10);
          if (!isNaN(idx)) goTo(idx);
        });
      });
      /* 触摸滑动支持 */
      var touchStartX = 0;
      container.addEventListener('touchstart', function (e) {
        touchStartX = e.touches[0].clientX;
      }, { passive: true });
      container.addEventListener('touchend', function (e) {
        var dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 40) { goTo(dx > 0 ? current - 1 : current + 1); }
      }, { passive: true });
    });
  }

  /* ========== Gallery 等高对齐画廊布局 ========== */
  function initGallery() {
    var galleries = document.querySelectorAll('.gallery-container');
    if (!galleries.length) return;

    galleries.forEach(function (gallery) {
      if (gallery.dataset.initialized) return;
      gallery.dataset.initialized = 'true';

      var itemsEl = gallery.querySelector('.gallery-items');
      var items = Array.from(gallery.querySelectorAll('.gallery-item'));
      if (!itemsEl || !items.length) return;
      var perRow = parseInt(gallery.getAttribute('data-cols'), 10) || 4;
      var gap = 12;
      var baseRowHeight = 160;

      function getPerRow() {
        var w = window.innerWidth || document.documentElement.clientWidth;
        if (w <= 600) return Math.min(perRow, 2);
        if (w <= 900) return Math.min(perRow, 3);
        return perRow;
      }

      function layout() {
        var containerWidth = itemsEl.clientWidth;
        if (!containerWidth) return;
        var currentPerRow = getPerRow();
        var topOffset = 0;

        for (var i = 0; i < items.length; i += currentPerRow) {
          var row = items.slice(i, i + currentPerRow);
          var totalWidth = 0;
          var validCount = 0;

          row.forEach(function (item) {
            var img = item.querySelector('img');
            var ratio = 1;
            if (img && img.naturalWidth && img.naturalHeight) {
              ratio = img.naturalWidth / img.naturalHeight;
            } else if (item._ratio) {
              ratio = item._ratio;
            }
            item._ratio = ratio;
            totalWidth += baseRowHeight * ratio;
            validCount++;
          });

          if (validCount === 0) continue;
          var totalGap = gap * (validCount - 1);
          var scale = (containerWidth - totalGap) / totalWidth;
          var actualRowHeight = baseRowHeight * scale;
          var leftOffset = 0;

          row.forEach(function (item) {
            var itemWidth = actualRowHeight * item._ratio;
            item.style.width = itemWidth + 'px';
            item.style.height = actualRowHeight + 'px';
            item.style.transform = 'translate(' + leftOffset + 'px,' + topOffset + 'px)';
            leftOffset += itemWidth + gap;
          });

          topOffset += actualRowHeight + gap;
        }

        itemsEl.style.height = (topOffset - gap) + 'px';
      }

      /* 先做一次初始布局（即使图片未加载，用默认 ratio=1 先撑开容器） */
      layout();

      /* 等待所有图片加载后重新布局 */
      var loaded = 0;
      var total = items.length;
      var layoutCount = 0;

      function checkAllLoaded() {
        loaded++;
        if (loaded >= total) {
          layout();
          layoutCount++;
        }
      }

      items.forEach(function (item) {
        var img = item.querySelector('img');
        if (!img) { checkAllLoaded(); return; }
        if (img.complete && img.naturalWidth) {
          checkAllLoaded();
        } else {
          img.addEventListener('load', checkAllLoaded, { once: true });
          img.addEventListener('error', checkAllLoaded, { once: true });
        }
      });

      /* 兜底：500ms 后强制重新布局（缩短等待时间，适配 AJAX 导航） */
      setTimeout(function () {
        if (layoutCount === 0) { layout(); layoutCount++; }
      }, 500);

      /* 二次兜底：1.5s 后再检查一次（确保慢速网络下也能正确布局） */
      setTimeout(function () {
        layout();
      }, 1500);

      /* 响应式重排 */
      var resizeTimer = null;
      function onResize() {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(layout, 150);
      }
      window.addEventListener('resize', onResize);

      /* 点击灯箱放大 */
      items.forEach(function (item) {
        item.style.cursor = 'pointer';
        item.addEventListener('click', function () {
          var fullUrl = item.getAttribute('data-full');
          if (!fullUrl) return;
          openGalleryLightbox(fullUrl);
        });
      });
    });
  }

  /* ========== Gallery 灯箱 ========== */
  function openGalleryLightbox(url) {
    var lb = document.querySelector('.gallery-lightbox');
    if (!lb) {
      lb = document.createElement('div');
      lb.className = 'gallery-lightbox';
      lb.innerHTML = '<div class="lightbox-mask"></div><div class="lightbox-content"><img src="" alt=""></div><button class="lightbox-close"><i class="fas fa-xmark"></i></button>';
      document.body.appendChild(lb);
      lb.querySelector('.lightbox-mask').addEventListener('click', function () { lb.classList.remove('open'); });
      lb.querySelector('.lightbox-close').addEventListener('click', function () { lb.classList.remove('open'); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && lb.classList.contains('open')) lb.classList.remove('open');
      });
    }
    var img = lb.querySelector('.lightbox-content img');
    img.src = url;
    lb.classList.add('open');
  }

  /* ========== 初始化全部 ========== */
  function init() {
    initTabs();
    initFolding();
    initSteps();
    initCarousel();
    initGallery();
    initCopyInline();
    // KaTeX 和 Mermaid 延迟加载（库文件较大）
    setTimeout(initKatex, 100);
    setTimeout(initMermaid, 200);
  }

  // 首次加载
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { init: init };
})();
