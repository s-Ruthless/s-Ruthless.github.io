/**
 * animations.js — 轻量动画系统（替代 GSAP）
 * 使用：CSS @keyframes + IntersectionObserver + Web Animations API
 * 零外部依赖，原生浏览器 API，性能最优
 * 动画类型丰富：fade-up / fade-in / scale-in / slide-left / slide-right /
 *               flip-in / zoom-in / bounce-in / rotate-in / dock-up
 */
(function () {
  'use strict';

  /* IntersectionObserver 实例 — 复用减少开销 */
  var _io = null;
  function getIO() {
    if (_io) return _io;
    if (typeof IntersectionObserver === 'undefined') return null;
    _io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var animClass = el.dataset.anim || 'anim-fade-up';
          var delay = el.dataset.animDelay || '0';
          el.style.animationDelay = delay + 'ms';
          el.classList.add(animClass);
          /* 动画结束后清理：移除动画类和内联样式，防止 transform 锁定冲突 hover */
          el.addEventListener('animationend', function () {
            el.classList.remove(animClass);
            el.style.opacity = '';
            el.style.transform = '';
            el.style.animationDelay = '';
          }, { once: true });
          _io.unobserve(el);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });
    return _io;
  }

  /* 注册元素到 IntersectionObserver */
  function observe(el, animClass, delay) {
    var io = getIO();
    if (!io) {
      el.style.opacity = '1';
      return;
    }
    el.dataset.anim = animClass || 'anim-fade-up';
    if (delay) el.dataset.animDelay = String(delay);
    el.style.opacity = '0';
    io.observe(el);
  }

  /* 所有动画 class 列表 — 用于 killAll 清理 */
  var ALL_ANIM_CLASSES = [
    'anim-fade-up', 'anim-fade-in', 'anim-scale-in', 'anim-slide-left',
    'anim-slide-right', 'anim-flip-in', 'anim-zoom-in', 'anim-bounce-in',
    'anim-rotate-in', 'anim-dock-up', 'anim-slide-down', 'anim-win-fade', 'anim-win-scale', 'anim-win-slide', 'anim-win-flip'
  ];

  var Animations = {
    _initialized: false,

    /** 清除旧动画状态 */
    killAll: function () {
      var sels = '.post-list-item,.wall-card,.archive-row,.archive-year-header,.article-header,.article-content,.article-nav,.page-header,.dock-bar,.win-traffic-btn,.dock-item-inner,#galleryMasonry .gallery-item,.douban-card,.flink-card,.link-card,.stat-hero-card,.cat-item,.tag,.search-item';
      var winSels = '';
      if (document.documentElement.classList.contains('is-desktop')) {
        winSels = '.app-window,';
      }
      var els = document.querySelectorAll(winSels + sels);
      els.forEach(function (el) {
        ALL_ANIM_CLASSES.forEach(function (cls) { el.classList.remove(cls); });
        el.style.animationDelay = '';
        el.style.animation = '';
        /* 取消 Web Animations API 动画 */
        if (el.getAnimations) {
          el.getAnimations().forEach(function (a) { a.cancel(); });
        }
        /* app-window 设为透明（由 heroWindows 动画渐入），其他元素清除透明度 */
        if (el.classList.contains('app-window')) {
          el.style.opacity = '0';
          el.style.transform = '';
        } else {
          el.style.opacity = '';
          el.style.transform = '';
        }
      });
    },

    /** 首页窗口：淡入入场动画 — 使用 Web Animations API，确保窗口整体动画 */
    heroWindows: function () {
      var windows = document.querySelectorAll('.app-window');
      if (!windows.length) return;
      var isDesktop = document.documentElement.classList.contains('is-desktop');
      /* 四种入场动画 keyframes，按窗口顺序轮换 */
      var animKeyframes = [
        [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'translateY(0)' }],
        [{ opacity: 0, transform: 'scale(0.85)' }, { opacity: 1, transform: 'scale(1)' }],
        [{ opacity: 0, transform: 'translateX(-30px)' }, { opacity: 1, transform: 'translateX(0)' }],
        [{ opacity: 0, transform: 'perspective(800px) rotateX(-12deg) translateY(20px)' }, { opacity: 1, transform: 'perspective(800px) rotateX(0) translateY(0)' }]
      ];
      var easings = [
        'cubic-bezier(0.4,0,0.2,1)',
        'cubic-bezier(0.34,1.4,0.64,1)',
        'cubic-bezier(0.4,0,0.2,1)',
        'cubic-bezier(0.4,0,0.2,1)'
      ];
      windows.forEach(function (win, i) {
        /* 跳过已隐藏的窗口 */
        if (win.style.display === 'none') return;
        win.style.visibility = 'visible';
        /* 清除旧动画状态（CSS class + inline style） */
        ALL_ANIM_CLASSES.forEach(function (cls) { win.classList.remove(cls); });
        win.style.animation = '';
        win.style.animationDelay = '';
        /* 取消正在进行的 Web Animations API 动画 */
        if (win.getAnimations) {
          win.getAnimations().forEach(function (a) { a.cancel(); });
        }
        /* 立即设为透明，防止 Drag.init 的 opacity:1 产生闪烁 */
        win.style.opacity = '0';
        /* 依次延迟：桌面端 90ms 间隔，移动端 120ms 间隔 */
        var delay = isDesktop ? (i * 90) : (i * 120);
        var kfIdx = i % animKeyframes.length;
        /* 使用 Web Animations API — fill:'both' 确保延迟期间也应用 from 状态 */
        var anim = win.animate(animKeyframes[kfIdx], {
          duration: 500,
          delay: delay,
          easing: easings[kfIdx],
          fill: 'both'
        });
        /* 动画完成后清理 inline 样式 */
        anim.onfinish = function () {
          win.style.transform = '';
          win.style.opacity = '';
        };
      });
    },

    /** Dock 栏弹入 */
    dockBounce: function () {
      var dock = document.querySelector('.dock-bar');
      if (!dock) return;
      dock.classList.remove('anim-dock-up');
      void dock.offsetWidth;
      dock.style.animationDelay = '200ms';
      dock.classList.add('anim-dock-up');
      dock.addEventListener('animationend', function () {
        dock.classList.remove('anim-dock-up');
        dock.style.animationDelay = '';
        dock.style.transform = '';
      }, { once: true });
    },

    /** Dock 图标 — 清除残留 transform */
    dockItems: function () {
      document.querySelectorAll('.dock-item-inner').forEach(function (inner) {
        inner.style.transform = '';
      });
    },

    /** 红绿灯按钮 — 清除残留 transform */
    trafficButtons: function () {
      document.querySelectorAll('.win-traffic-btn').forEach(function (btn) {
        btn.style.transform = '';
      });
    },

    /** 列表卡片入场 — 统一使用 opacity+scale 避免位移影响布局间距 */
    postListCards: function () {
      /* 文章墙卡片：缩放弹入 + 顺序延迟（不用随机，避免视觉乱序） */
      var wallCards = document.querySelectorAll('.wall-card');
      var wallAnims = ['anim-zoom-in', 'anim-scale-in'];
      wallCards.forEach(function (card, i) {
        card.style.opacity = '0';
        var delay = (i % 12) * 40;
        var anim = wallAnims[i % wallAnims.length];
        setTimeout(function () {
          card.style.opacity = '';
          card.style.animationDelay = '';
          card.classList.add(anim);
          card.addEventListener('animationend', function () {
            card.classList.remove(anim);
            card.style.transform = '';
            card.style.animationDelay = '';
          }, { once: true });
        }, delay);
      });

      /* 文章列表 / 归档行：IntersectionObserver，统一使用 fade-up（opacity+translateY）
         避免水平位移动画导致卡片重叠、间距不均匀 */
      var listCards = document.querySelectorAll('.post-list-item, .archive-row');
      listCards.forEach(function (card, i) {
        observe(card, 'anim-fade-up', (i % 10) * 60);
      });
    },

    /** 归档年份标题渐入 — 从左滑入 */
    archiveHeaders: function () {
      var headers = document.querySelectorAll('.archive-year-header');
      headers.forEach(function (h, i) {
        observe(h, 'anim-slide-left', i * 50);
      });
    },

    /** 文章页渐入 — 多层动画 */
    postPage: function () {
      var header = document.querySelector('.article-header');
      var content = document.querySelector('.article-content');
      var nav = document.querySelector('.article-nav');
      var toc = document.getElementById('post-toc-wrap');
      var pairs = [
        { el: header, anim: 'anim-slide-down', delay: '0ms' },
        { el: content, anim: 'anim-fade-in', delay: '100ms' },
        { el: nav, anim: 'anim-slide-right', delay: '200ms' },
        { el: toc, anim: 'anim-slide-right', delay: '300ms' }
      ];
      pairs.forEach(function (p) {
        if (!p.el) return;
        p.el.classList.add(p.anim);
        p.el.style.animationDelay = p.delay;
        p.el.addEventListener('animationend', function () {
          p.el.classList.remove(p.anim);
          p.el.style.animationDelay = '';
          p.el.style.transform = '';
        }, { once: true });
      });
    },

    /** 页面头部 — 从上滑入 */
    pageHeader: function () {
      var h = document.querySelector('.page-header');
      if (!h) return;
      h.classList.add('anim-slide-down');
      h.addEventListener('animationend', function () {
        h.classList.remove('anim-slide-down');
        h.style.animationDelay = '';
        h.style.transform = '';
      }, { once: true });
    },

    /** 文章内图片淡入 — IntersectionObserver（用 JS 排除画廊/豆瓣/友链图片） */
    articleImages: function () {
      var imgs = document.querySelectorAll('.article-content img');
      imgs.forEach(function (img) {
        if (img.closest('.gallery-item')) return;
        if (img.closest('.douban-card')) return;
        if (img.closest('.flink-card')) return;
        if (img.closest('.link-card')) return;
        if (img.closest('.carousel-container')) return;
        if (img.closest('.post-card')) return;
        if (img.closest('.post-card-thumb')) return;
        observe(img, 'anim-zoom-in', 0);
      });
    },

    /** 画廊图片 — 缩放弹入（仅限相册页面 #galleryMasonry 内的元素） */
    galleryItems: function () {
      var items = document.querySelectorAll('#galleryMasonry .gallery-item');
      items.forEach(function (item, i) {
        observe(item, 'anim-zoom-in', (i % 6) * 80);
      });
    },

    /** 豆瓣卡片 — 交替滑入 */
    doubanCards: function () {
      var cards = document.querySelectorAll('.douban-card');
      var anims = ['anim-slide-right', 'anim-fade-up', 'anim-zoom-in'];
      cards.forEach(function (card, i) {
        observe(card, anims[i % anims.length], (i % 8) * 50);
      });
    },

    /** 友链卡片 — 翻转入场 */
    flinkCards: function () {
      var cards = document.querySelectorAll('.flink-card, .link-card');
      cards.forEach(function (card, i) {
        observe(card, 'anim-flip-in', (i % 8) * 60);
      });
    },

    /** 统计卡片 — 弹跳入场 */
    statCards: function () {
      var cards = document.querySelectorAll('.stat-hero-card');
      cards.forEach(function (card, i) {
        observe(card, 'anim-bounce-in', i * 80);
      });
    },

    /** 分类/标签 — 旋转入场 */
    catTags: function () {
      var items = document.querySelectorAll('.cat-item, .tag');
      items.forEach(function (item, i) {
        observe(item, 'anim-rotate-in', (i % 10) * 40);
      });
    },

    /** 搜索结果 — 从右滑入 */
    searchItems: function () {
      var items = document.querySelectorAll('.search-item');
      items.forEach(function (item, i) {
        observe(item, 'anim-slide-right', i * 50);
      });
    },

    /** 运行全部动画 */
    run: function () {
      document.body.classList.add('animating');
      this.killAll();
      this.heroWindows();
      this.dockBounce();
      this.dockItems();
      this.trafficButtons();
      this.postListCards();
      this.archiveHeaders();
      this.postPage();
      this.pageHeader();
      this.articleImages();
      this.galleryItems();
      this.doubanCards();
      this.flinkCards();
      this.statCards();
      this.catTags();
      this.searchItems();
      /* UI 增强效果 */
      if (typeof UIEnhance !== 'undefined') {
        UIEnhance.motionNumbers();
        UIEnhance.rippleEffect();
        UIEnhance.clipReveal();
        UIEnhance.heroEffects();
      }
      /* 安全超时：1.5s 后强制清理所有残留动画类和内联样式（防止 animationend 未触发） */
      setTimeout(function () {
        document.body.classList.remove('animating');
        var sels = '.post-list-item,.wall-card,.archive-row,.archive-year-header,.article-header,.article-content,.article-nav,.page-header,.dock-bar,.app-window,#galleryMasonry .gallery-item,.douban-card,.flink-card,.link-card,.stat-hero-card,.cat-item,.tag,.search-item';
        document.querySelectorAll(sels).forEach(function (el) {
          ALL_ANIM_CLASSES.forEach(function (cls) { el.classList.remove(cls); });
          el.style.opacity = '';
          el.style.transform = '';
          el.style.animationDelay = '';
          el.style.animation = '';
          /* 取消 Web Animations API 动画（fill:both 会在 cancel 后恢复原始样式） */
          if (el.getAnimations) {
            el.getAnimations().forEach(function (a) { a.cancel(); });
          }
        });
      }, 1500);
    }
  };

  window.Animations = Animations;
  window.GSAPAnimations = Animations; /* 兼容 main.js 中的旧引用 */
})();
