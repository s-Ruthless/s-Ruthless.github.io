/**
 * animations.js — 轻量动画系统（替代 GSAP）
 * 使用：CSS @keyframes + IntersectionObserver + Web Animations API
 * 零外部依赖，原生浏览器 API，性能最优
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
      /* 无 IO 支持时直接显示 */
      el.style.opacity = '1';
      return;
    }
    el.dataset.anim = animClass || 'anim-fade-up';
    if (delay) el.dataset.animDelay = String(delay);
    el.style.opacity = '0';
    io.observe(el);
  }

  var Animations = {
    _initialized: false,

    /** 清除旧动画状态 */
    killAll: function () {
      var sels = '.post-list-item,.wall-card,.archive-row,.archive-year-header,.article-header,.article-content,.article-nav,.page-header,.dock-bar,.win-traffic-btn,.dock-item-inner';
      if (document.documentElement.classList.contains('is-desktop')) {
        sels = '.app-window,' + sels;
      }
      var els = document.querySelectorAll(sels);
      els.forEach(function (el) {
        el.style.opacity = '';
        el.style.transform = '';
        el.style.animationDelay = '';
        el.classList.remove('anim-fade-up', 'anim-fade-in', 'anim-scale-in', 'anim-slide-left', 'anim-dock-up');
      });
    },

    /** 首页窗口：CSS 动画依次弹入 */
    heroWindows: function () {
      if (!document.documentElement.classList.contains('is-desktop')) return;
      var windows = document.querySelectorAll('.app-window');
      if (!windows.length) return;
      windows.forEach(function (win, i) {
        win.style.visibility = 'visible';
        win.style.animationDelay = (i * 80) + 'ms';
        win.classList.add('anim-scale-in');
      });
    },

    /** Dock 栏弹入 */
    dockBounce: function () {
      var dock = document.querySelector('.dock-bar');
      if (!dock) return;
      dock.style.animationDelay = '200ms';
      dock.classList.add('anim-dock-up');
    },

    /** Dock 图标 — 清除残留 transform */
    dockItems: function () {
      document.querySelectorAll('.dock-item-inner').forEach(function (inner) {
        inner.style.transform = '';
      });
    },

    /** 红绿灯按钮 — 清除残留 transform（hover 由 CSS 控制） */
    trafficButtons: function () {
      document.querySelectorAll('.win-traffic-btn').forEach(function (btn) {
        btn.style.transform = '';
      });
    },

    /** 列表卡片入场 — IntersectionObserver + CSS 动画 */
    postListCards: function () {
      /* 文章墙卡片：随机延迟淡入 */
      var wallCards = document.querySelectorAll('.wall-card');
      wallCards.forEach(function (card) {
        card.style.opacity = '0';
        var delay = Math.floor(Math.random() * 300);
        setTimeout(function () {
          card.style.opacity = '';
          card.classList.add('anim-fade-up');
        }, delay);
      });

      /* 文章列表 / 归档行：IntersectionObserver 批量入场 */
      var listCards = document.querySelectorAll('.post-list-item, .archive-row');
      listCards.forEach(function (card, i) {
        observe(card, 'anim-fade-up', (i % 10) * 60);
      });
    },

    /** 归档年份标题渐入 */
    archiveHeaders: function () {
      var headers = document.querySelectorAll('.archive-year-header');
      headers.forEach(function (h, i) {
        observe(h, 'anim-slide-left', i * 50);
      });
    },

    /** 文章页渐入 */
    postPage: function () {
      var header = document.querySelector('.article-header');
      var content = document.querySelector('.article-content');
      var nav = document.querySelector('.article-nav');
      if (header) { header.classList.add('anim-fade-up'); header.style.animationDelay = '0ms'; }
      if (content) { content.classList.add('anim-fade-up'); content.style.animationDelay = '100ms'; }
      if (nav) { nav.classList.add('anim-fade-up'); nav.style.animationDelay = '200ms'; }
    },

    /** 页面头部 */
    pageHeader: function () {
      var h = document.querySelector('.page-header');
      if (!h) return;
      h.classList.add('anim-fade-up');
    },

    /** 文章内图片淡入 — IntersectionObserver */
    articleImages: function () {
      var imgs = document.querySelectorAll('.article-content img');
      imgs.forEach(function (img) {
        observe(img, 'anim-fade-up', 0);
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
      /* UI 增强效果 */
      if (typeof UIEnhance !== 'undefined') {
        UIEnhance.motionNumbers();
        UIEnhance.rippleEffect();
        UIEnhance.clipReveal();
        UIEnhance.heroEffects();
      }
      setTimeout(function () { document.body.classList.remove('animating'); }, 1000);
    }
  };

  window.Animations = Animations;
  window.GSAPAnimations = Animations; /* 兼容 main.js 中的旧引用 */
})();
