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
      var sels = '.post-list-item,.wall-card,.archive-row,.archive-year-header,.article-header,.article-content,.article-nav,.page-header,.dock-bar,.win-traffic-btn,.dock-item-inner';
      /* 移动端不清理 .app-window 的 transform（由 MobileSlider 控制） */
      if (!document.documentElement.classList.contains('is-mobile')) {
        sels = '.app-window,' + sels;
      }
      gsap.killTweensOf(sels);
      gsap.set(sels, { clearProps: 'opacity,transform' });
    },

    /** 首页窗口：依次弹入 */
    heroWindows: function () {
      /* 移动端跳过窗口弹入动画（层叠滑动布局不需要） */
      if (document.documentElement.classList.contains('is-mobile')) return;
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

    /** 列表卡片依次滑入 — 文章列表 / 归档行用 ScrollTrigger，文章墙用随机延迟淡入 */
    postListCards: function () {
      /* 文章墙卡片：column-count 布局下 DOM 顺序 = 视觉列顺序，
         任何按 DOM 顺序的 stagger 都会变成"一列一列"出现。
         改为随机延迟淡入，打乱列顺序，视觉效果更自然。 */
      var wallCards = document.querySelectorAll('.wall-card');
      if (wallCards.length) {
        wallCards.forEach(function (card) {
          gsap.fromTo(card,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, delay: Math.random() * 0.3, ease: 'power2.out',
              clearProps: 'transform' }
          );
        });
      }

      /* 文章列表 / 归档行：正常流布局，ScrollTrigger 批量入场没问题 */
      var listCards = document.querySelectorAll('.post-list-item, .archive-row');
      if (!listCards.length) return;
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.batch(listCards, {
          start: 'top 90%',
          onEnter: function (batch) {
            gsap.fromTo(batch,
              { y: 30, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: 'power2.out',
                clearProps: 'transform' }
            );
          }
        });
      } else {
        var tl = gsap.timeline();
        listCards.forEach(function (card, i) {
          tl.fromTo(card,
            { x: -20, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.35, ease: 'power2.out',
              clearProps: 'transform' },
            i * 0.06
          );
        });
      }
    },

    /** 归档年份标题渐入 */
    archiveHeaders: function () {
      var headers = document.querySelectorAll('.archive-year-header');
      if (!headers.length) return;
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.batch(headers, {
          start: 'top 92%',
          onEnter: function (batch) {
            gsap.fromTo(batch,
              { opacity: 0, x: -18 },
              { opacity: 1, x: 0, duration: 0.35, stagger: 0.05, ease: 'power2.out' }
            );
          }
        });
      } else {
        headers.forEach(function (h, i) {
          gsap.fromTo(h,
            { opacity: 0, x: -18 },
            { opacity: 1, x: 0, duration: 0.35, delay: i * 0.05, ease: 'power2.out' }
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

    /* friendCards 已移除 — 目标选择器 .friend-card 不存在（实际类名为 .link-card），
       且 .link-card 已有 CSS :hover transform，GSAP inline transform 会与之冲突导致抖动。
       友链 hover 效果完全由 CSS 控制（pages.css .link-card:hover）。 */

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

    /* paginationBtns 已移除 — GSAP inline scale 与 CSS :hover translateZ(0) 冲突，
       导致分页按钮 hover 时字体抖动。hover 效果完全由 CSS 控制。 */

    /** 运行全部动画 */
    run: function () {
      document.body.classList.add('gsap-animating');
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
      /* UI 增强效果（在 GSAP 动画之后初始化，确保 GSAP 可用）
         已移除：tiltCards / dockMagnify / magneticButtons — 它们用 GSAP inline transform
         覆盖 CSS :hover transform，导致 dock 图标、按钮 hover 时字体抖动。 */
      if (typeof UIEnhance !== 'undefined') {
        UIEnhance.motionNumbers();
        UIEnhance.rippleEffect();
        UIEnhance.clipReveal();
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