/**
 * GSAP 动画增强 - moeMac 主题
 */
(function () {
  'use strict';

  if (typeof gsap === 'undefined') return;

  gsap.config({ force3D: true });

  var GSAPAnimations = {
    _master: null,

    killAll: function () {
      if (this._master) { this._master.kill(); this._master = null; }
      var sels = '.app-window,.post-list-item,.timeline-item,.timeline-dot,.article-header,.article-content,.article-nav,.page-header,.dock-bar,.win-traffic-btn,.dock-item-inner';
      gsap.killTweensOf(sels);
      gsap.set(sels, { clearProps: 'opacity,transform' });
    },

    /** 首页窗口：依次弹入 */
    heroWindows: function () {
      var windows = document.querySelectorAll('.app-window');
      if (!windows.length) return;

      var tl = gsap.timeline();
      windows.forEach(function (win, i) {
        win.style.visibility = 'visible';
        tl.fromTo(win,
          { y: 50, opacity: 0, scale: 0.93 },
          { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.4)' },
          i * 0.1
        );
      });
      this._master = tl;
    },

    /** Dock 栏弹入 */
    dockBounce: function () {
      var dock = document.querySelector('.dock-bar');
      if (!dock) return;
      gsap.fromTo(dock,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, delay: 0.4, ease: 'back.out(1.7)' }
      );
    },

    /** Dock 图标 — 清除残留 transform（tooltip 由 main.js DockTip 控制） */
    dockItems: function () {
      document.querySelectorAll('.dock-item-inner').forEach(function (inner) {
        inner.style.transform = '';
      });
    },

    /** 红绿灯 hover — 纯 CSS 控制（:hover + :active），不再用 GSAP
     *  原因：GSAP onmouseleave 在窗口隐藏（minimize）时不触发，
     *  导致 inline transform 残留，按钮永久放大不复原。
     *  CSS :hover 自动在元素隐藏/鼠标离开时重置，无 inline style 残留。 */
    trafficButtons: function () {
      /* 清除可能残留的旧 inline transform */
      document.querySelectorAll('.win-traffic-btn').forEach(function (btn) {
        btn.style.transform = '';
      });
    },

    /** 文章列表卡片依次滑入 — 带 ScrollTrigger 滚动触发 */
    postListCards: function () {
      var cards = document.querySelectorAll('.post-list-item');
      if (!cards.length) return;
      if (typeof ScrollTrigger !== 'undefined') {
        /* ScrollTrigger 批量入场：滚动到视口时淡入 */
        ScrollTrigger.batch(cards, {
          start: 'top 90%',
          onEnter: function (batch) {
            gsap.fromTo(batch,
              { y: 30, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: 'power2.out' }
            );
          }
        });
      } else {
        var tl = gsap.timeline();
        cards.forEach(function (card, i) {
          tl.fromTo(card,
            { x: -20, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.35, ease: 'power2.out' },
            i * 0.06
          );
        });
      }
    },

    /** 归档时间线逐项淡入 — 带 ScrollTrigger */
    timelineItems: function () {
      var items = document.querySelectorAll('.timeline-item');
      if (!items.length) return;
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.batch(items, {
          start: 'top 88%',
          onEnter: function (batch) {
            gsap.fromTo(batch,
              { opacity: 0, x: -18 },
              { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
            );
          }
        });
        document.querySelectorAll('.timeline-dot').forEach(function (dot, i) {
          gsap.fromTo(dot,
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.25, delay: i * 0.05, ease: 'back.out(2)',
              scrollTrigger: { trigger: dot, start: 'top 90%' } }
          );
        });
      } else {
        var tl = gsap.timeline();
        items.forEach(function (item, i) {
          tl.fromTo(item,
            { opacity: 0, x: -18 },
            { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' },
            i * 0.04
          );
        });
        document.querySelectorAll('.timeline-dot').forEach(function (dot, i) {
          tl.fromTo(dot,
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.25, ease: 'back.out(2)' },
            i * 0.04
          );
        });
      }
    },

    /** 文章页渐入 */
    postPage: function () {
      var header = document.querySelector('.article-header');
      var content = document.querySelector('.article-content');
      var nav = document.querySelector('.article-nav');
      if (header)  gsap.fromTo(header,  { y: 25, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' });
      if (content) gsap.fromTo(content, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, delay: 0.1, ease: 'power2.out' });
      if (nav)     gsap.fromTo(nav,     { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, delay: 0.2, ease: 'power2.out' });
    },

    /** 页面头部 */
    pageHeader: function () {
      var h = document.querySelector('.page-header');
      if (!h) return;
      gsap.fromTo(h, { y: -15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' });
    },

    /** 友链 hover — GSAP 弹性 + 3D 倾斜 */
    friendCards: function () {
      document.querySelectorAll('.friend-card').forEach(function (card) {
        card.onmouseenter = function () {
          gsap.to(card, { y: -6, scale: 1.03, duration: 0.2, ease: 'back.out(2)' });
        };
        card.onmouseleave = function () {
          gsap.to(card, { y: 0, scale: 1, duration: 0.2, ease: 'power2.out' });
        };
      });
    },

    /** 文章内图片淡入 — ScrollTrigger */
    articleImages: function () {
      if (typeof ScrollTrigger === 'undefined') return;
      document.querySelectorAll('.article-content img').forEach(function (img) {
        gsap.fromTo(img,
          { opacity: 0, y: 20, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power2.out',
            scrollTrigger: { trigger: img, start: 'top 85%' } }
        );
      });
    },

    /** 分页按钮 hover */
    paginationBtns: function () {
      document.querySelectorAll('.page-btn,.filter-btn').forEach(function (el) {
        el.onmouseenter = function () { gsap.to(el, { scale: 1.05, duration: 0.15 }); };
        el.onmouseleave = function () { gsap.to(el, { scale: 1, duration: 0.15 }); };
      });
    },

    /** 运行全部动画 */
    run: function () {
      document.body.classList.add('gsap-animating');
      this.killAll();
      this.heroWindows();
      this.dockBounce();
      this.dockItems();
      this.trafficButtons();
      this.postListCards();
      this.timelineItems();
      this.postPage();
      this.pageHeader();
      this.friendCards();
      this.paginationBtns();
      this.articleImages();
      /* UI 增强效果（在 GSAP 动画之后初始化，确保 GSAP 可用） */
      if (typeof UIEnhance !== 'undefined') {
        UIEnhance.tiltCards();
        UIEnhance.motionNumbers();
        UIEnhance.rippleEffect();
        UIEnhance.clipReveal();
        UIEnhance.dockMagnify();
        UIEnhance.magneticButtons();
        UIEnhance.glassShine();
        UIEnhance.heroEffects();
      }
      /* 刷新 ScrollTrigger（AJAX 加载后重新计算位置） */
      if (typeof ScrollTrigger !== 'undefined') {
        setTimeout(function () { ScrollTrigger.refresh(); }, 100);
      }
      setTimeout(function () { document.body.classList.remove('gsap-animating'); }, 1200);
    }
  };

  /* 由 main.js 在 Drag.init() 完成后调用 */
  window.GSAPAnimations = GSAPAnimations;
})();