/**
 * GSAP 动画增强 - moeMac 主题
 * 使用 gsap.timeline 统一编排，保证流畅
 */
(function () {
  'use strict';

  if (typeof gsap === 'undefined') return;

  gsap.config({ force3D: true });

  var GSAPAnimations = {
    _master: null,

    killAll: function () {
      if (this._master) {
        this._master.kill();
        this._master = null;
      }
      /* 只清除 opacity 和 transform，不动 left/top/visibility/data-pos */
      var selectors = [
        '.app-window', '.post-list-item', '.timeline-item', '.timeline-dot',
        '.article-header', '.article-content', '.article-nav', '.page-header', '#dock-bar'
      ].join(',');
      gsap.killTweensOf(selectors);
      gsap.set(selectors, { clearProps: 'opacity,transform' });
    },

    /** 首页窗口：timeline 依次弹入 */
    heroWindows: function () {
      var windows = document.querySelectorAll('.app-window');
      if (!windows.length) return;

      var tl = gsap.timeline();
      windows.forEach(function (win, i) {
        /* 保证窗口可见，位置由 Drag.init 管理 */
        win.style.visibility = 'visible';
        tl.fromTo(win,
          { y: 50, opacity: 0, scale: 0.94 },
          { y: 0, opacity: 1, scale: 1, duration: 0.55, ease: 'back.out(1.2)' },
          i * 0.08
        );
      });
      this._master = tl;
    },

    /** 窗口红绿灯 hover */
    trafficButtons: function () {
      document.querySelectorAll('.win-traffic-btn').forEach(function (btn) {
        btn.onmouseenter = function () { gsap.to(btn, { scale: 1.2, duration: 0.15 }); };
        btn.onmouseleave = function () { gsap.to(btn, { scale: 1, duration: 0.15 }); };
      });
    },

    /** 文章列表卡片 */
    postListCards: function () {
      var cards = document.querySelectorAll('.post-list-item');
      if (!cards.length) return;

      var tl = gsap.timeline();
      cards.forEach(function (card, i) {
        tl.fromTo(card,
          { x: -20, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.35, ease: 'power2.out' },
          i * 0.06
        );
      });
    },

    /** 归档时间线 */
    timelineItems: function () {
      var items = document.querySelectorAll('.timeline-item');
      if (!items.length) return;

      var tl = gsap.timeline();
      items.forEach(function (item, i) {
        tl.fromTo(item,
          { opacity: 0, x: -18 },
          { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' },
          i * 0.04
        );
      });

      var dots = document.querySelectorAll('.timeline-dot');
      dots.forEach(function (dot, i) {
        tl.fromTo(dot,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.25, ease: 'back.out(2)' },
          i * 0.04
        );
      });
    },

    /** 文章页 */
    postPage: function () {
      var header = document.querySelector('.article-header');
      var content = document.querySelector('.article-content');
      var nav = document.querySelector('.article-nav');
      if (!header && !content && !nav) return;

      var tl = gsap.timeline();
      if (header)   tl.fromTo(header,  { y: 25, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }, 0);
      if (content)  tl.fromTo(content, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.1);
      if (nav)      tl.fromTo(nav,     { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }, 0.2);
    },

    /** 通用页面头部 */
    pageHeader: function () {
      var h = document.querySelector('.page-header');
      if (!h) return;
      gsap.fromTo(h, { y: -15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' });
    },

    /** Dock 栏弹入 */
    dockBounce: function () {
      var dock = document.getElementById('dock-bar');
      if (!dock) return;
      gsap.fromTo(dock, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, delay: 0.3, ease: 'back.out(1.5)' });
    },

    /** hover 微弹 */
    friendCards: function () {
      document.querySelectorAll('.friend-card').forEach(function (card) {
        card.onmouseenter = function () { gsap.to(card, { y: -5, scale: 1.02, duration: 0.2 }); };
        card.onmouseleave = function () { gsap.to(card, { y: 0, scale: 1, duration: 0.2 }); };
      });
    },

    paginationBtns: function () {
      document.querySelectorAll('.page-btn, .filter-btn').forEach(function (el) {
        el.onmouseenter = function () { gsap.to(el, { scale: 1.05, duration: 0.15 }); };
        el.onmouseleave = function () { gsap.to(el, { scale: 1, duration: 0.15 }); };
      });
    },

    run: function () {
      var body = document.body;
      body.classList.add('gsap-animating');
      this.killAll();
      this.heroWindows();
      this.trafficButtons();
      this.postListCards();
      this.timelineItems();
      this.postPage();
      this.pageHeader();
      this.dockBounce();
      this.friendCards();
      this.paginationBtns();
      setTimeout(function () { body.classList.remove('gsap-animating'); }, 1000);
    }
  };

  /* 由 main.js 在 Drag.init() 完成后调用 GSAPAnimations.run() */

  window.GSAPAnimations = GSAPAnimations;
})();