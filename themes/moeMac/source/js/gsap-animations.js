/**
 * GSAP 动画增强 - moeMac 主题
 */
(function () {
  'use strict';

  if (typeof gsap === 'undefined') return;

  gsap.config({ force3D: true });

  var _firstRun = true;

  var GSAPAnimations = {
    _master: null,

    killAll: function () {
      if (this._master) { this._master.kill(); this._master = null; }
      var sels = '.app-window,.post-list-item,.timeline-item,.timeline-dot,.article-header,.article-content,.article-nav,.page-header,#dock-bar';
      gsap.killTweensOf(sels);
      gsap.set(sels, { clearProps: 'opacity,transform' });
    },

    heroWindows: function () {
      var windows = document.querySelectorAll('.app-window');
      if (!windows.length) return;
      windows.forEach(function (win) { win.style.visibility = 'visible'; });

      if (_firstRun) {
        /* 首次加载：窗口已经在正确位置，只做淡入，不设起始 y/scale */
        windows.forEach(function (win, i) {
          gsap.from(win, { opacity: 0, duration: 0.5, delay: i * 0.08, ease: 'power2.out' });
        });
      } else {
        /* AJAX 导航：从偏移位置弹入 */
        var tl = gsap.timeline();
        windows.forEach(function (win, i) {
          win.style.visibility = 'visible';
          tl.fromTo(win,
            { y: 40, opacity: 0, scale: 0.95 },
            { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.2)' },
            i * 0.08
          );
        });
        this._master = tl;
      }
    },

    dockBounce: function () {
      var dock = document.getElementById('dock-bar');
      if (!dock) return;
      if (_firstRun) {
        gsap.from(dock, { opacity: 0, duration: 0.5, delay: 0.3, ease: 'power2.out' });
      } else {
        gsap.fromTo(dock, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, delay: 0.2, ease: 'back.out(1.5)' });
      }
    },

    trafficButtons: function () {
      document.querySelectorAll('.win-traffic-btn').forEach(function (btn) {
        btn.onmouseenter = function () { gsap.to(btn, { scale: 1.2, duration: 0.15 }); };
        btn.onmouseleave = function () { gsap.to(btn, { scale: 1, duration: 0.15 }); };
      });
    },

    postListCards: function () {
      var cards = document.querySelectorAll('.post-list-item');
      if (!cards.length) return;
      var tl = gsap.timeline();
      cards.forEach(function (card, i) {
        tl.from(card, { x: -20, opacity: 0, duration: 0.3, ease: 'power2.out' }, i * 0.05);
      });
    },

    timelineItems: function () {
      var items = document.querySelectorAll('.timeline-item');
      if (!items.length) return;
      var tl = gsap.timeline();
      items.forEach(function (item, i) {
        tl.from(item, { opacity: 0, x: -15, duration: 0.3, ease: 'power2.out' }, i * 0.04);
      });
      document.querySelectorAll('.timeline-dot').forEach(function (dot, i) {
        tl.from(dot, { scale: 0, opacity: 0, duration: 0.25, ease: 'back.out(2)' }, i * 0.04);
      });
    },

    postPage: function () {
      var header = document.querySelector('.article-header');
      var content = document.querySelector('.article-content');
      var nav = document.querySelector('.article-nav');
      if (header) gsap.from(header, { y: 20, opacity: 0, duration: 0.35, ease: 'power2.out' });
      if (content) gsap.from(content, { y: 15, opacity: 0, duration: 0.35, delay: 0.1, ease: 'power2.out' });
      if (nav) gsap.from(nav, { y: 15, opacity: 0, duration: 0.3, delay: 0.2, ease: 'power2.out' });
    },

    pageHeader: function () {
      var h = document.querySelector('.page-header');
      if (!h) return;
      gsap.from(h, { y: -12, opacity: 0, duration: 0.3, ease: 'power2.out' });
    },

    friendCards: function () {
      document.querySelectorAll('.friend-card').forEach(function (card) {
        card.onmouseenter = function () { gsap.to(card, { y: -4, scale: 1.02, duration: 0.2 }); };
        card.onmouseleave = function () { gsap.to(card, { y: 0, scale: 1, duration: 0.2 }); };
      });
    },

    paginationBtns: function () {
      document.querySelectorAll('.page-btn,.filter-btn').forEach(function (el) {
        el.onmouseenter = function () { gsap.to(el, { scale: 1.05, duration: 0.15 }); };
        el.onmouseleave = function () { gsap.to(el, { scale: 1, duration: 0.15 }); };
      });
    },

    run: function () {
      document.body.classList.add('gsap-animating');
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
      _firstRun = false;
      setTimeout(function () { document.body.classList.remove('gsap-animating'); }, 1000);
    }
  };

  window.GSAPAnimations = GSAPAnimations;
})();