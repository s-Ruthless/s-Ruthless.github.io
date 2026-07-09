/**
 * moeMac Theme - Main JavaScript
 */
/* 全局防重复执行守卫 — 荣耀等浏览器可能不支持 defer 导致脚本重复加载 */
if (window.__moeMacMainLoaded) {
  /* 已加载过，跳过所有初始化 */
} else {
window.__moeMacMainLoaded = true;
(function () {
  'use strict';

  /* ====== 移动端检测 ====== */
  var MOBILE_BP = 768;
  /* 安全的 matchMedia 包装：部分国产浏览器 matchMedia 可能返回 null 或抛异常 */
  function mmMatches(q){ try { var m = window.matchMedia ? window.matchMedia(q) : null; return m ? m.matches : false; } catch(e){ return false; } }
  /* 多层检测：UA + 物理屏幕宽度 + 触摸 + userAgentData，确保各种浏览器都能正确识别 */
  var _uaMobile = (function(){
    var ua = navigator.userAgent || navigator.vendor || '';
    /* 标准 Android 手机、iPhone */
    if (/Android.*Mobile|iPhone|iPod/i.test(ua)) return true;
    /* 荣耀/华为手机：部分 UA 不含 'Mobile'，增加 HarmonyOS/ArkWeb 匹配 */
    if (/Android/i.test(ua) && /Honor|HWV|HUAWEI|HonorBrowser|HarmonyOS|ArkWeb/i.test(ua)) return true;
    /* 物理屏幕宽度兜底：手机物理屏幕通常 ≤500 CSS px */
    if (screen.width <= 500) return true;
    /* userAgentData API — 现代浏览器检测 */
    if (navigator.userAgentData && navigator.userAgentData.mobile) return true;
    /* 触摸设备 + 无 hover + 屏幕宽度 ≤900 */
    var hasTouch = (navigator.maxTouchPoints || 0) > 0 || ('ontouchstart' in window);
    var smallScreen = window.innerWidth <= 900 || (screen.width <= 900 && screen.height <= 900);
    if (hasTouch && smallScreen && !mmMatches('(hover:hover)')) return true;
    return false;
  })();
  function isMobile() {
    return _uaMobile || mmMatches('(max-width: ' + MOBILE_BP + 'px)') || window.innerWidth <= MOBILE_BP;
  }
  /* 同步移动端/桌面端 class（与 head.ejs 早期脚本配合）
     关键：一定设一个，is-mobile 或 is-desktop，不能两个都没有 */
  function syncMobileClass() {
    var html = document.documentElement;
    if (isMobile()) {
      html.classList.add('is-mobile');
      html.classList.remove('is-desktop');
    } else {
      html.classList.add('is-desktop');
      html.classList.remove('is-mobile');
    }
  }

  /* ====== Progress Bar ====== */
  var ProgressBar = {
    el: null,
    init: function () {
      this.el = document.getElementById('nprogress-bar');
    },
    start: function () {
      if (!this.el) return;
      this.el.style.transition = 'none';
      this.el.style.width = '0';
      this.el.style.opacity = '1';
      var self = this;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          self.el.style.transition = 'width 0.6s cubic-bezier(.4,0,.2,1)';
          self.el.style.width = '80%';
        });
      });
    },
    done: function () {
      if (!this.el) return;
      this.el.style.transition = 'width 0.25s ease';
      this.el.style.width = '100%';
      var el = this.el;
      setTimeout(function () {
        el.style.transition = 'opacity 0.4s ease';
        el.style.opacity = '0';
      }, 300);
    }
  };

  /* ====== Hitokoto ====== */
  function loadHitokoto() {
    var el = document.getElementById('hitokoto-text');
    if (!el) return;
    var api = el.getAttribute('data-api');
    if (!api || api === 'false' || api === 'undefined') {
      var fallbacks = [
        '\u751f\u6d3b\u660e\u6717\uff0c\u4e07\u7269\u53ef\u7231\u3002',
        '\u613f\u4f60\u773c\u4e2d\u6709\u5149\uff0c\u5fc3\u4e2d\u6709\u7231\u3002',
        '\u628a\u65e5\u5b50\u8fc7\u6210\u8bd7\uff0c\u7b80\u5355\u800c\u7cbe\u81f4\u3002',
        '\u6e29\u67d4\u534a\u4e24\uff0c\u4ece\u5bb9\u4e00\u751f\u3002',
        '\u4fdd\u6301\u70ed\u7231\uff0c\u5954\u8d74\u5c71\u6d77\u3002'
      ];
      el.textContent = '\u300c' + fallbacks[Math.floor(Math.random() * fallbacks.length)] + '\u300d';
      return;
    }
    fetch(api)
      .then(function (r) { return r.json(); })
      .then(function (d) {
        el.textContent = '\u300c' + (d.hitokoto || '') + '\u300d';
        var fromEl = document.getElementById('hitokoto-from');
        if (fromEl && d.from) fromEl.textContent = '\u2014\u2014\u300c' + d.from + '\u300d';
      })
      .catch(function () {
        el.textContent = '\u300c\u52a0\u8f7d\u5931\u8d25\u300d';
      });
  }

  /* ====== Music Player ====== */
  var MusicPlayer = {
    ap: null, initialized: false, loading: false,
    init: function () {
      if (this.initialized || this.loading) return;
      var mount = document.getElementById('aplayer-mount');
      if (!mount) return;
      var loadingEl = document.getElementById('music-loading');
      var apiBase = mount.getAttribute('data-api');
      var platform = mount.getAttribute('data-platform');
      var playlistId = mount.getAttribute('data-playlist-id');
      if (!playlistId) return;
      this.loading = true;
      var self = this;
      var url = apiBase + '?server=' + platform + '&type=playlist&id=' + playlistId;
      function hideLoading() { if (loadingEl) loadingEl.style.display = 'none'; }
      function showError(msg) { if (loadingEl) loadingEl.innerHTML = '<span style="color:#e57373;font-size:13px;">' + msg + '</span>'; }
      fetch(url)
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (songs) {
          if (!songs || !songs.length) { showError('\u6b4c\u5355\u4e3a\u7a7a'); self.loading = false; return; }
          hideLoading();
          self.moveToWindow();
          mount.classList.add('aplayer-init-hide');
          self.ap = new APlayer({
            container: mount, lrcType: 0,
            audio: songs.map(function (s) { return { name: s.name || '', artist: s.artist || '', url: s.url || '', cover: s.cover || '' }; }),
            mini: false, autoplay: false, theme: '#8b5cf6',
            loop: 'all', order: 'list', preload: 'metadata', volume: 0.7, mutex: true
          });
          try { self.ap.list.hide(); } catch (e) {} /* 隐藏列表以重置 APlayer 的 max-height */ var listEl = mount.querySelector(".aplayer-list"); if (listEl) listEl.style.maxHeight = "";
          mount.classList.remove('aplayer-init-hide');
          self.initialized = true;
          self.loading = false;
          window.__aplayer = self.ap;
        })
        .catch(function (err) { console.error('[Music]', err); showError('\u6b4c\u5355\u52a0\u8f7d\u5931\u8d25: ' + err.message); self.loading = false; });
    },
    moveToWindow: function () {
      var wrap = document.getElementById('global-music-player');
      var winMount = document.getElementById('music-window-mount');
      if (wrap && winMount) { winMount.appendChild(wrap); wrap.style.display = ''; }
      else if (wrap) { wrap.style.display = 'none'; }
    },
    moveFromBody: function () {
      var wrap = document.getElementById('global-music-player');
      if (wrap && wrap.parentNode !== document.body) { document.body.appendChild(wrap); wrap.style.display = 'none'; }
    }
  };

  /* ====== Window Manager ====== */
  var WinMgr = {
    iconMap: { 'win-hero': 'fas fa-house', 'win-posts': 'fas fa-newspaper', 'win-categories': 'fas fa-folder', 'win-tags': 'fas fa-tags', 'win-music': 'fas fa-music', 'win-data': 'fas fa-chart-bar', 'win-info': 'fas fa-circle-info' },
    nameMap: { 'win-hero': '\u6211\u7684\u4e3b\u9875', 'win-posts': '\u6700\u65b0\u6587\u7ae0', 'win-categories': '\u5206\u7c7b', 'win-tags': '\u6807\u7b7e\u4e91', 'win-music': '\u6b4c\u5355', 'win-data': '\u7ad9\u70b9\u6570\u636e', 'win-info': '\u7f51\u7ad9\u4fe1\u606f' },
    init: function () {
      var self = this;
      document.addEventListener('click', function (e) {
        var btn = e.target.closest('.win-traffic-btn');
        if (!btn) return;
        e.stopPropagation();
        var win = btn.closest('.app-window');
        if (!win) return;
        if (btn.classList.contains('win-btn-close')) self.close(win);
        else if (btn.classList.contains('win-btn-minimize')) self.minimize(win);
        else if (btn.classList.contains('win-btn-pin')) self.togglePin(win);
      });
      document.addEventListener('click', function (e) {
        var mini = e.target.closest('.dock-minimized-item');
        if (!mini) return;
        e.stopPropagation(); e.preventDefault();
        var wid = mini.getAttribute('data-win-id');
        if (wid) { var win = document.getElementById(wid); if (win) self.restore(win, mini); }
      });
    },
    close: function (win) { win.style.display = 'none'; },
    minimize: function (win) {
      if (win.classList.contains('win-minimized') || win.style.display === 'none') return;
      var id = this.winId(win);
      var zone = document.getElementById('dock-mini-zone');
      if (!zone) { win.style.display = 'none'; return; }
      if (typeof gsap === 'undefined') { win.style.display = 'none'; win.classList.add('win-minimized'); return; }
      var icon = this.iconMap[id] || 'fas fa-window-maximize';
      var name = this.nameMap[id] || '';
      var item = document.createElement('div');
      item.className = 'dock-minimized-item';
      item.setAttribute('data-win-id', id);
      gsap.set(item, { scale: 0, y: 16, opacity: 0 });
      item.innerHTML = '<div class="dock-text">' + name + '</div><div class="dock-item-inner"><i class="' + icon + ' dock-icon"></i></div>';
      if (!zone.querySelector('.dock-mini-sep')) {
        var sep = document.createElement('div');
        sep.className = 'dock-mini-sep';
        zone.appendChild(sep);
      }
      zone.appendChild(item);
      /* 动态创建的最小化图标也绑定 tooltip */
      DockTip.init();

      /* 先让 zone 可测量，然后获取目标宽度，再用 GSAP 动画宽度展开 */
      /* 动画期间 overflow:hidden 防止内容溢出；动画完成后加 expanded 切换 overflow:visible */
      zone.style.width = '0px';
      zone.classList.remove('expanded');
      /* 强制布局同步，确保 scrollWidth 计算准确 */
      void zone.offsetWidth;
      var targetWidth = zone.scrollWidth;

      /* 保存当前位置，动画结束后清除 GSAP transform 并恢复 Drag 的 left/top */
      var savedLeft = win.style.left, savedTop = win.style.top;

      var iconRect = item.getBoundingClientRect();
      var winRect = win.getBoundingClientRect();
      var dx = (iconRect.left + iconRect.width / 2) - (winRect.left + winRect.width / 2);
      var dy = (iconRect.top + iconRect.height / 2) - (winRect.top + winRect.height / 2);
      var targetScale = Math.max(iconRect.width / winRect.width, 0.06);

      /* GSAP timeline：窗口 Genie 吸入 → dock 图标弹入 + dock-mini-zone 宽度展开 */
      var tl = gsap.timeline({
        onComplete: function () {
          gsap.set(win, { clearProps: 'all' });
          win.classList.add('win-minimized');
          win.style.display = 'none';
          win.style.left = savedLeft; win.style.top = savedTop;
          zone.style.width = 'auto';
          zone.classList.add('expanded'); /* 动画完成，切换 overflow:visible 让 hover 不被裁切 */
          syncDockGlass();
        }
      });
      tl.to(win, {
        x: dx, y: dy,
        scale: targetScale, scaleY: 0.6,
        opacity: 0, filter: 'blur(2px)',
        duration: 0.42, ease: 'power2.in'
      });
      /* dock-mini-zone 宽度展开 + 玻璃背景实时同步 */
      tl.to(zone, {
        width: targetWidth,
        duration: 0.35, ease: 'power2.out',
        onUpdate: syncDockGlass
      }, 0);
      /* dock图标弹入动画 */
      tl.to(item, {
        scale: 1, y: 0, opacity: 1,
        duration: 0.28, ease: 'back.out(1.6)'
      }, '-=0.1');
      /* 保存位置到 dataset（clearProps 后仍能恢复） */
      win.dataset.savedLeft = savedLeft;
      win.dataset.savedTop = savedTop;
    },

    restore: function (win, miniItem) {
      if (!miniItem) {
        var id = this.winId(win);
        miniItem = document.querySelector('.dock-minimized-item[data-win-id="' + id + '"]');
      }
      win.classList.remove('win-minimized');
      win.style.display = '';
      /* 恢复动画期间隐藏红绿灯（窗口从 dock 弹出时不应显示） */
      win.classList.add('win-restoring');
      /* 读取最小化前保存的位置 */
      var savedLeft = win.dataset.savedLeft || win.style.left;
      var savedTop  = win.dataset.savedTop  || win.style.top;
      /* GSAP 不可用时降级为直接显示 */
      if (typeof gsap === 'undefined') {
        win.classList.remove('win-restoring');
        if (miniItem && miniItem.parentNode) miniItem.remove();
        var zone0 = document.getElementById('dock-mini-zone');
        if (zone0 && !zone0.querySelector('.dock-minimized-item')) { zone0.classList.remove('expanded'); zone0.style.width = '0px'; var s0 = zone0.querySelector('.dock-mini-sep'); if (s0) s0.remove(); }
        Drag.focus(win); return;
      }

      var zone = document.getElementById('dock-mini-zone');
      var sep = zone ? zone.querySelector('.dock-mini-sep') : null;

      var iconRect = miniItem ? miniItem.getBoundingClientRect() : null;
      var winRect = win.getBoundingClientRect();
      var dx = 0, dy = 0, startScale = 0.1;
      if (iconRect) {
        dx = (iconRect.left + iconRect.width / 2) - (winRect.left + winRect.width / 2);
        dy = (iconRect.top + iconRect.height / 2) - (winRect.top + winRect.height / 2);
        startScale = Math.max(iconRect.width / winRect.width, 0.06);
      }

      /* 判断 zone 里是否只剩这一个 miniItem（restore 后就空了） */
      var otherItems = zone ? zone.querySelectorAll('.dock-minimized-item:not([data-win-id="' + this.winId(win) + '"])') : [];
      var shouldCollapseZone = zone && zone.classList.contains('expanded') && otherItems.length === 0;

      /* GSAP timeline：窗口从 dock 位置展开 + dock 图标缩小消失 + zone 宽度收起，同步进行 */
      gsap.set(win, { x: dx, y: dy, scale: startScale, scaleY: 0.6, opacity: 0, filter: 'blur(2px)' });
      var tl = gsap.timeline({
        onComplete: function () {
          if (!shouldCollapseZone) zone.style.width = 'auto';
          syncDockGlass();
        }
      });

      /* 窗口展开动画 */
      tl.to(win, {
        x: 0, y: 0, scale: 1, scaleY: 1, opacity: 1, filter: 'blur(0px)',
        duration: 0.4, ease: 'back.out(1.4)'
      });

      /* dock 图标缩小消失（与窗口展开同时进行）*/
      if (miniItem) {
        tl.to(miniItem, {
          scale: 0.3, y: -8, opacity: 0,
          duration: 0.25, ease: 'power2.in'
        }, 0);
      }

      /* zone 宽度收起动画（仅当最后一个 icon 被 restore 时）*/
      if (shouldCollapseZone) {
        zone.classList.remove('expanded'); /* 动画期间 overflow:hidden */
        /* 强制布局同步，确保当前宽度计算准确 */
        void zone.offsetWidth;
        var currentWidth = zone.scrollWidth;
        zone.style.width = currentWidth + 'px';
        tl.to(zone, {
          width: 0,
          duration: 0.32, ease: 'power2.inOut',
          onUpdate: syncDockGlass
        }, 0);
        tl.call(function () {
          if (miniItem && miniItem.parentNode) miniItem.remove();
          if (sep && sep.parentNode) sep.remove();
          zone.style.width = '0px';
          syncDockGlass();
        });
      } else {
        /* 还有其他 icon，窗口展开完成后移除当前 icon 并自适应宽度 */
        tl.call(function () {
          if (miniItem && miniItem.parentNode) miniItem.remove();
          if (sep && sep.parentNode && !zone.querySelector('.dock-minimized-item')) sep.remove();
          if (zone && zone.querySelector('.dock-minimized-item')) {
            zone.classList.remove('expanded'); /* 动画期间 overflow:hidden */
            /* 强制布局同步，确保新宽度计算准确 */
            void zone.offsetWidth;
            var newW = zone.scrollWidth;
            zone.style.width = zone.offsetWidth + 'px';
            gsap.to(zone, { width: newW, duration: 0.28, ease: 'power2.out',
              onUpdate: syncDockGlass,
              onComplete: function () {
                zone.style.width = 'auto';
                zone.classList.add('expanded'); /* 恢复 overflow:visible */
                syncDockGlass();
              }
            });
          }
        }, null, 0.4);
      }

      /* 动画完成后清除 GSAP transform，并恢复 Drag 的原始 left/top */
      tl.set(win, { clearProps: 'all' }, '>');
      tl.call(function () {
        win.style.left = win.dataset.savedLeft || savedLeft || win.style.left;
        win.style.top  = win.dataset.savedTop  || savedTop  || win.style.top;
        win.classList.remove('win-restoring');
        Drag.focus(win); /* 动画完成后才 focus（避免 restore 中途弹出红绿灯） */
      }, null, '>');
    },

    togglePin: function (win) {
      win.classList.toggle('win-pinned');
      var btn = win.querySelector('.win-btn-pin');
      if (btn) btn.classList.toggle('is-pinned');
      win.style.zIndex = win.classList.contains('win-pinned') ? 9990 : '';
    },
    winId: function (win) {
      if (win.id) return win.id;
      win.id = 'win-' + Math.random().toString(36).substr(2, 6);
      return win.id;
    }
  };

  /* ====== Dock Tooltip — 独立于 GSAP，确保始终可用 ====== */
  var DockTip = {
    init: function () {
      document.querySelectorAll('.dock-item, .dock-minimized-item').forEach(function (item) {
        var tip = item.querySelector('.dock-text');
        if (!tip) return;
        /* 用 dataset 防重复绑定 */
        if (tip.dataset.tipBound) return;
        tip.dataset.tipBound = '1';
        item.addEventListener('mouseenter', function () {
          tip.classList.add('tip-show');
        });
        item.addEventListener('mouseleave', function () {
          tip.classList.remove('tip-show');
        });
      });
    }
  };

  /* ====== 移动端首页：纵向滚动卡片流 ====== */
  var MobileHome = {
    /* 重置所有窗口的内联样式，让 CSS 接管布局 */
    init: function () {
      if (!isMobile()) return;
      var container = document.getElementById('ajax-container');
      if (!container) return;
      container.querySelectorAll('.app-window').forEach(function (el) {
        el.setAttribute('data-pos', '1');
        el.style.visibility = 'visible';
        el.style.left = '';
        el.style.top = '';
        el.style.transform = '';
        el.style.opacity = '';
        el.style.zIndex = '';
        el.style.pointerEvents = '';
        el.style.transition = '';
        el.style.width = '';
        el.style.height = '';
        el.style.minHeight = '';
        el.style.maxHeight = '';
      });
    },

    /* 导航时清理（样式会被新内容覆盖，但保险起见重置） */
    destroy: function () {
      var container = document.getElementById('ajax-container');
      if (!container) return;
      container.querySelectorAll('.app-window').forEach(function (el) {
        el.style.transition = '';
        el.style.transform = '';
        el.style.opacity = '';
        el.style.zIndex = '';
        el.style.pointerEvents = '';
        el.style.visibility = '';
      });
    }
  };

  /* ====== Window Drag ====== */
  var Drag = {
    winW: 0, winH: 0, maxZ: 10, gap: 30, minDist: 60, centerDist: 120, dockH: 80,
    init: function () {
      this.winW = window.innerWidth; this.winH = window.innerHeight;
      var self = this;
      /* 移动端：纵向滚动卡片流，无需拖拽布局 */
      if (isMobile()) {
        MobileHome.init();
        return;
      }
      document.querySelectorAll('.app-window:not([data-pos])').forEach(function (el) {
        if (el.style.left && el.style.left.indexOf('%') !== -1) {
          var rect = el.getBoundingClientRect();
          el.style.left = rect.left + 'px';
          el.style.top = rect.top + 'px';
        }
      });
      var placed = [];
      document.querySelectorAll('.drag-win').forEach(function (el) {
        var ew = el.offsetWidth, eh = el.offsetHeight;
        var best = self.findPos(ew, eh, placed);
        el.style.left = best.x + 'px'; el.style.top = best.y + 'px';
        el.setAttribute('data-pos', '1');
        el.style.visibility = 'visible';
      });
      document.querySelectorAll('.app-window').forEach(function (el) {
        el.addEventListener('mousedown', function () { self.focus(el); });
        var bar = el.querySelector('.drag-bar');
        if (bar) {
          var ox, oy, sx, sy, moving = false;
          bar.addEventListener('mousedown', function (e) {
            if (e.target.closest('.win-traffic-btn')) return;
            ox = el.offsetLeft; oy = el.offsetTop; sx = e.clientX; sy = e.clientY;
            el.classList.add('win-dragging'); self.focus(el); moving = true;
            function mv(ev) {
              if (!moving) return;
              var newX = ox + ev.clientX - sx;
              var newY = oy + ev.clientY - sy;
              var maxX = document.documentElement.clientWidth - el.offsetWidth;
              var maxY = document.documentElement.clientHeight - el.offsetHeight;
              newX = Math.max(0, Math.min(newX, maxX));
              newY = Math.max(0, Math.min(newY, maxY));
              el.style.left = newX + 'px';
              el.style.top = newY + 'px';
            }
            function up() {
              moving = false; el.classList.remove('win-dragging');
              // position not persisted
              document.removeEventListener('mousemove', mv);
              document.removeEventListener('mouseup', up);
            }
            document.addEventListener('mousemove', mv);
            document.addEventListener('mouseup', up);
          });
          /* 触摸拖拽（移动端） */
          bar.addEventListener('touchstart', function (e) {
            if (e.target.closest('.win-traffic-btn')) return;
            if (e.touches.length !== 1) return;
            var t = e.touches[0];
            ox = el.offsetLeft; oy = el.offsetTop; sx = t.clientX; sy = t.clientY;
            el.classList.add('win-dragging'); self.focus(el); moving = true;
            function tmv(ev) {
              if (!moving || ev.touches.length !== 1) return;
              var tt = ev.touches[0];
              var newX = ox + tt.clientX - sx;
              var newY = oy + tt.clientY - sy;
              var maxX = document.documentElement.clientWidth - el.offsetWidth;
              var maxY = document.documentElement.clientHeight - el.offsetHeight;
              newX = Math.max(0, Math.min(newX, maxX));
              newY = Math.max(0, Math.min(newY, maxY));
              el.style.left = newX + 'px';
              el.style.top = newY + 'px';
            }
            function tup() {
              moving = false; el.classList.remove('win-dragging');
              document.removeEventListener('touchmove', tmv);
              document.removeEventListener('touchend', tup);
              document.removeEventListener('touchcancel', tup);
            }
            document.addEventListener('touchmove', tmv, { passive: false });
            document.addEventListener('touchend', tup);
            document.addEventListener('touchcancel', tup);
          }, { passive: true });
        }
        var rh = el.querySelector('.win-resize-handle');
        if (rh) {
          var ron = false, rsx, rsy, rw, rh2;
          rh.addEventListener('mousedown', function (e) {
            e.stopPropagation(); ron = true;
            el.classList.add('win-resizing');
            rsx = e.clientX; rsy = e.clientY;
            rw = el.offsetWidth; rh2 = el.offsetHeight;
            function mv(ev) {
              if (!ron) return;
              el.style.width = Math.max(200, rw + ev.clientX - rsx) + 'px';
              el.style.height = Math.max(140, rh2 + ev.clientY - rsy) + 'px';
            }
            function up() {
              ron = false; el.classList.remove('win-resizing');
              document.removeEventListener('mousemove', mv);
              document.removeEventListener('mouseup', up);
            }
            document.addEventListener('mousemove', mv);
            document.addEventListener('mouseup', up);
          });
        }
      });
      document.querySelectorAll('.app-window').forEach(function (el) {
        var ro = new ResizeObserver(function () {
          var w = el.offsetWidth, h = el.offsetHeight;
          var cw = document.documentElement.clientWidth, ch = document.documentElement.clientHeight;
          var maxX = cw - w, maxY = ch - h;
          var cx = parseFloat(el.style.left) || 0, cy = parseFloat(el.style.top) || 0;
          if (cx > maxX) el.style.left = Math.max(0, maxX) + 'px';
          if (cy > maxY) el.style.top = Math.max(0, maxY) + 'px';
        });
        ro.observe(el);
      });
    },
    findPos: function (ew, eh, placed) {
      var aw = this.winW, ah = this.winH - this.dockH;
      var cl = { l: aw / 2 - 100, t: ah / 2 - 100, w: 200, h: 200 };
      placed = placed || [];
      for (var tries = 0; tries < 500; tries++) {
        var x = this.gap + Math.random() * (aw - ew - this.gap * 2);
        var y = this.gap + Math.random() * (ah - eh - this.gap * 2);
        if (!this.ov(x, y, ew, eh, cl, placed)) {
          placed.push({ l: x, t: y, w: ew, h: eh });
          return { x: x, y: y };
        }
      }
      // 500次都没找到不重叠的位置，用网格兜底
      var cols = Math.floor(aw / (ew + this.gap));
      var idx = placed.length;
      var col = idx % cols;
      var row = Math.floor(idx / cols);
      var fx = this.gap + col * (ew + this.gap);
      var fy = this.gap + row * (eh + this.gap);
      placed.push({ l: fx, t: fy, w: ew, h: eh });
      return { x: fx, y: fy };
    },
    focus: function (el) {
      document.querySelectorAll('.app-window').forEach(function (w) { w.classList.remove('win-focused'); });
      el.classList.add('win-focused'); this.top(el);
    },
    ov: function (x, y, w, h, c, p) {
      if (Math.abs((x + w / 2) - (c.l + c.w / 2)) < w / 2 + c.w / 2 + this.centerDist &&
        Math.abs((y + h / 2) - (c.t + c.h / 2)) < h / 2 + c.h / 2 + this.centerDist) return true;
      for (var i = 0; i < p.length; i++) {
        if (Math.abs((x + w / 2) - (p[i].l + p[i].w / 2)) < w / 2 + p[i].w / 2 + this.minDist &&
          Math.abs((y + h / 2) - (p[i].t + p[i].h / 2)) < h / 2 + p[i].h / 2 + this.minDist) return true;
      }
      return false;
    },
    top: function (el) {
      if (!el.classList.contains('win-pinned')) { this.maxZ++; el.style.zIndex = this.maxZ; }
    }
  };

  /* ====== Wall Filter ====== */
  function WallFilter() {
    var btns = document.querySelectorAll('.filter-btn');
    var cards = document.querySelectorAll('.wall-card');
    if (!btns.length) return;
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        var cat = b.getAttribute('data-cat');
        cards.forEach(function (c) { c.classList.toggle('hidden', cat !== 'all' && c.getAttribute('data-cat') !== cat); });
      });
    });
  }

  /* ====== 文章目录 TOC ====== */
  var TOC = {
    spyTimer: null,
    init: function () {
      var wrap = document.getElementById('post-toc-wrap');
      var fab = document.getElementById('post-toc-fab');
      if (!wrap) return;

      var toggle = document.getElementById('post-toc-toggle');
      if (toggle) {
        toggle.addEventListener('click', function () {
          wrap.classList.toggle('collapsed');
        });
      }

      /* 移动端 FAB 开关 */
      if (fab) {
        fab.addEventListener('click', function (e) {
          e.stopPropagation();
          wrap.classList.toggle('fab-open');
        });
        document.addEventListener('click', function (e) {
          if (!wrap.contains(e.target) && e.target !== fab && !fab.contains(e.target)) {
            wrap.classList.remove('fab-open');
          }
        });
      }

      /* 点击目录项平滑滚动 */
      var links = wrap.querySelectorAll('.post-toc-list a');
      links.forEach(function (a) {
        a.addEventListener('click', function (e) {
          e.preventDefault();
          var id = decodeURIComponent(a.getAttribute('href').replace(/^#/, ''));
          var target = document.getElementById(id);
          if (target) {
            var top = target.getBoundingClientRect().top + window.pageYOffset - 80;
            window.scrollTo({ top: top, behavior: 'smooth' });
          }
          wrap.classList.remove('fab-open');
        });
      });

      this.scrollSpy();
    },
    scrollSpy: function () {
      var wrap = document.getElementById('post-toc-wrap');
      if (!wrap) return;
      var links = wrap.querySelectorAll('.post-toc-list a');
      if (!links.length) return;
      var content = document.getElementById('post-content') || document.querySelector('.article-content');
      if (!content) return;
      var headings = [];
      links.forEach(function (a) {
        var id = decodeURIComponent(a.getAttribute('href').replace(/^#/, ''));
        var h = document.getElementById(id);
        if (h) headings.push({ el: h, link: a });
      });
      if (!headings.length) return;

      var self = this;
      function update() {
        var pos = window.pageYOffset + 100;
        var current = headings[0];
        for (var i = 0; i < headings.length; i++) {
          if (headings[i].el.offsetTop <= pos) current = headings[i];
        }
        headings.forEach(function (h) { h.link.classList.toggle('toc-active', h === current); });
        /* 当前项滚入 TOC 可视区 */
        if (current) {
          var body = document.getElementById('post-toc-body');
          if (body) {
            var r = current.link.getBoundingClientRect();
            var br = body.getBoundingClientRect();
            if (r.top < br.top || r.bottom > br.bottom) {
              current.link.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
          }
        }
      }
      window.addEventListener('scroll', function () {
        clearTimeout(self.spyTimer);
        self.spyTimer = setTimeout(update, 60);
      }, { passive: true });
      update();
    }
  };

  /* ====== 代码块复制按钮 ====== */
  var CodeCopy = {
    init: function () {
      var blocks = document.querySelectorAll('.article-content figure.highlight, .article-content pre');
      blocks.forEach(function (pre) {
        if (pre.querySelector('.code-copy-btn')) return;
        /* 只对代码块加，跳过已被 figure 包裹的 pre（避免重复） */
        if (pre.tagName === 'PRE' && pre.closest('figure.highlight')) return;
        var btn = document.createElement('button');
        btn.className = 'code-copy-btn';
        btn.type = 'button';
        btn.innerHTML = '<i class="fas fa-copy"></i>';
        btn.title = '复制代码';
        btn.addEventListener('click', function () {
          var codeEl = pre.querySelector('td.code pre') || pre.querySelector('pre') || pre;
          var text = codeEl.innerText.replace(/\n$/,'');
          var done = function () { btn.innerHTML = '<i class="fas fa-check"></i>'; btn.classList.add('copied'); setTimeout(function () { btn.innerHTML = '<i class="fas fa-copy"></i>'; btn.classList.remove('copied'); }, 1600); };
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done).catch(function () { CodeCopy._legacy(text, done); });
          } else { CodeCopy._legacy(text, done); }
        });
        pre.appendChild(btn);
      });
    },
    _legacy: function (text, cb) {
      var ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); cb(); } catch (e) {}
      document.body.removeChild(ta);
    }
  };

  /* ====== 图片懒加载 ====== */
  var LazyImg = {
    init: function () {
      var imgs = document.querySelectorAll('.article-content img:not([loading]), .page-body img:not([loading])');
      imgs.forEach(function (img) { img.setAttribute('loading', 'lazy'); img.setAttribute('decoding', 'async'); });
    }
  };

  /* ====== 返回顶部 ====== */
  var BackTop = {
    el: null, timer: null,
    init: function () {
      if (document.getElementById('back-top-btn')) { this.el = document.getElementById('back-top-btn'); return; }
      var btn = document.createElement('button');
      btn.id = 'back-top-btn'; btn.className = 'back-top-btn'; btn.type = 'button';
      btn.innerHTML = '<i class="fas fa-arrow-up"></i>'; btn.title = '返回顶部';
      btn.style.display = 'none';
      btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
      document.body.appendChild(btn);
      this.el = btn;
      var self = this;
      window.addEventListener('scroll', function () {
        clearTimeout(self.timer); self.timer = setTimeout(function () { self.toggle(); }, 100);
      }, { passive: true });
      this.toggle();
    },
    toggle: function () {
      if (!this.el) return;
      this.el.style.display = window.pageYOffset > 400 ? 'flex' : 'none';
    },
    refresh: function () { this.toggle(); }
  };

  /* ====== 站内搜索 ====== */
  var Search = {
    data: null, loading: false, timer: null,
    init: function () {
      var trig = document.getElementById('search-trigger');
      var modal = document.getElementById('search-modal');
      var mask = document.getElementById('search-mask');
      var input = document.getElementById('search-input');
      var clear = document.getElementById('search-clear');
      if (!trig || !modal) return;
      /* 防重复绑定 — 荣耀等浏览器可能重复执行脚本 */
      if (trig.dataset.searchInit) return;
      trig.dataset.searchInit = '1';
      var self = this;

      function open() {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
        setTimeout(function () { if (input) input.focus(); }, 80);
        if (!self.data && !self.loading) self.loadData();
      }
      function close() {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
      trig.addEventListener('click', open);
      if (mask) mask.addEventListener('click', close);
      if (clear) clear.addEventListener('click', function () {
  if (input && input.value) { input.value = ''; input.focus(); self.render(''); }
  else { close(); }
});
      if (input) {
        input.addEventListener('input', function () {
          clearTimeout(self.timer);
          self.timer = setTimeout(function () { self.render(input.value); }, 180);
        });
        input.addEventListener('keydown', function (e) {
          if (e.key === 'Escape') close();
        });
      }
      document.addEventListener('keydown', function (e) {
        if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
          e.preventDefault(); open();
        }
        if (e.key === 'Escape' && modal.classList.contains('open')) close();
      });
    },
    loadData: function () {
      var self = this;
      this.loading = true;
      fetch('/search.xml').then(function (r) { return r.text(); }).then(function (txt) {
        var xml = new DOMParser().parseFromString(txt, 'text/xml');
        var entries = xml.querySelectorAll('entry');
        self.data = [];
        entries.forEach(function (en) {
          self.data.push({
            title: (en.querySelector('title') || {}).textContent || '',
            url: (en.querySelector('url') || {}).textContent || '',
            content: (en.querySelector('content') || {}).textContent || ''
          });
        });
        self.loading = false;
      }).catch(function () { self.loading = false; });
    },
    render: function (q) {
      var box = document.getElementById('search-results');
      if (!box) return;
      q = (q || '').trim();
      if (!q) { box.innerHTML = '<div class="search-hint">输入关键词开始搜索</div>'; return; }
      if (!this.data) { box.innerHTML = '<div class="search-hint">索引加载中…</div>'; return; }
      if (this.loading) { box.innerHTML = '<div class="search-hint">索引加载中…</div>'; return; }
      var kw = q.toLowerCase();
      var matched = [];
      for (var i = 0; i < this.data.length; i++) {
        var it = this.data[i];
        var ti = it.title.toLowerCase();
        /* 去除 content 中的 HTML 标签，提取纯文本 */
        var plain = it.content.replace(/<[^>]+>/g, '').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();
        var ci = plain.toLowerCase();
        var pos = ci.indexOf(kw);
        if (ti.indexOf(kw) !== -1 || pos !== -1) {
          var start = Math.max(0, pos - 40);
          var excerpt = pos !== -1
            ? (start > 0 ? '…' : '') + plain.substr(start, 100) + '…'
            : plain.substr(0, 100) + '…';
          /* 从 url 提取日期 */
          var dateMatch = it.url.match(/(\d{4})\/(\d{2})\/(\d{2})/);
          var dateStr = dateMatch ? dateMatch[1] + '-' + dateMatch[2] + '-' + dateMatch[3] : '';
          matched.push({ title: it.title, url: it.url, excerpt: excerpt, date: dateStr });
          if (matched.length >= 20) break;
        }
      }
      if (!matched.length) { box.innerHTML = '<div class="search-empty">没有找到相关结果</div>'; return; }
      var hl = function (s) { return s.replace(new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<em>$1</em>'); };
      var html = '';
      matched.forEach(function (m) {
        html += '<a class="search-item ajax-link" data-href="' + m.url + '">' +
          '<div class="search-item-title">' + hl(m.title) + '</div>' +
          '<div class="search-item-excerpt">' + hl(m.excerpt) + '</div>' +
          (m.date ? '<div class="search-item-meta"><i class="fas fa-calendar-days"></i> ' + m.date + '</div>' : '') +
          '</a>';
      });
      box.innerHTML = html;
      var self = this;
      box.querySelectorAll('.search-item').forEach(function (a) {
        a.addEventListener('click', function (e) {
          e.preventDefault();
          var modal = document.getElementById('search-modal');
          if (modal) modal.classList.remove('open');
          document.body.style.overflow = '';
          var href = a.getAttribute('data-href');
          if (Nav && Nav.go) Nav.go(href);
        });
      });
    }
  };

  /* ====== AJAX Nav ====== */

  /* 已加载的外部脚本缓存 — 避免重复加载
     初始页面加载的脚本（head.ejs / scripts.ejs）也会被追踪 */
  var _loadedScripts = {};

  /* 扫描当前文档中所有已存在的外部 script，记录到缓存 */
  function _scanLoadedScripts() {
    document.querySelectorAll('script[src]').forEach(function (s) {
      _loadedScripts[s.getAttribute('src')] = true;
    });
  }

  /* AJAX 导航前清理：销毁旧评论实例、重置全局状态 */
  function cleanupBeforeNav() {
    /* 销毁 CWD 实例及其观察器 */
    if (window.__cwdInstance) {
      try {
        if (window.__cwdInstance.unmount) window.__cwdInstance.unmount();
        else if (window.__cwdInstance.destroy) window.__cwdInstance.destroy();
      } catch (e) { console.warn('[cleanup] CWD unmount:', e); }
      window.__cwdInstance = null;
    }
    /* 重置评论全局回调（新页面会重新定义） */
    window.__commentsShowError = null;
    window.__commentsHideLoading = null;
  }

  /* 重新执行容器内所有 <script> 标签 + 处理 <link> 样式表
     浏览器对 innerHTML 设置的 script 不会执行，需手动重建
     - 已加载的外部脚本跳过（全局变量已定义），避免重复加载
     - onerror 属性通过 setAttribute 对动态脚本不生效，需显式绑定
     - 同时检查 document 中是否已有相同 src 的 script（初始页面加载的）
     - <link rel="stylesheet"> 移到 <head> 并去重（innerHTML 后浏览器不一定加载容器内 link） */
  function execScripts(container) {
    /* 1. 处理 <link rel="stylesheet"> — 移到 <head>，已存在则跳过 */
    container.querySelectorAll('link[rel="stylesheet"]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href) return;
      /* 已在 <head> 中有相同 href 的 link，跳过 */
      if (document.querySelector('head link[href="' + href + '"]')) {
        if (link.parentNode) link.parentNode.removeChild(link);
        return;
      }
      /* 移到 <head>，浏览器会自动加载 */
      document.head.appendChild(link);
    });

    /* 2. 处理 <script> 标签 */
    var scripts = container.querySelectorAll('script');
    scripts.forEach(function (oldScript) {
      var src = oldScript.getAttribute('src');
      var onerr = oldScript.getAttribute('onerror');

      /* 已加载的外部脚本：跳过（缓存命中 或 文档中已存在相同 src） */
      if (src && (_loadedScripts[src] || document.querySelector('script[src="' + src + '"]'))) {
        if (oldScript.parentNode) oldScript.parentNode.removeChild(oldScript);
        return;
      }

      var newScript = document.createElement('script');
      var attrs = oldScript.attributes;
      for (var i = 0; i < attrs.length; i++) {
        /* onerror 属性单独处理（setAttribute 对动态 script 不可靠） */
        if (attrs[i].name === 'onerror') continue;
        newScript.setAttribute(attrs[i].name, attrs[i].value);
      }
      newScript.textContent = oldScript.textContent;

      /* 外部脚本：绑定 onload/onerror */
      if (src) {
        newScript.onload = function () { _loadedScripts[src] = true; };
        if (onerr) {
          newScript.onerror = function () {
            try { new Function(onerr)(); } catch (e) { console.warn('[execScripts] onerror:', e); }
          };
        }
      }

      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }

  var Nav = {
    box: null, busy: false,
    init: function () {
      this.box = document.getElementById('ajax-container');
      if (!this.box) return;
      var self = this;
      document.addEventListener('click', function (e) {
        var a = e.target.closest('.ajax-link');
        if (a) { var href = a.getAttribute('data-href'); if (href) { e.preventDefault(); self.go(href); return; } }
        var d = e.target.closest('.dock-item:not(.dock-minimized-item)');
        if (d) {
          var href2 = d.getAttribute('data-href'); if (!href2) return; e.preventDefault();
          d.getAttribute('data-type') === 'link' ? window.open(href2, '_blank') : self.go(href2);
        }
      });
      window.addEventListener('popstate', function () { self.load(location.pathname, false); });
      this.dockHL();
    },
    go: function (u) { if (this.busy || u === location.pathname) return; this.load(u, true); },
    load: function (u, push) {
      if (this.busy) return; this.busy = true;
      var self = this, box = this.box;
      MusicPlayer.moveFromBody();
      MobileHome.destroy();
      ProgressBar.start(); box.classList.add('fade-out');
      setTimeout(function () {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', u, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.onload = function () {
          try {
          if (xhr.status >= 200 && xhr.status < 400) {
            var doc = new DOMParser().parseFromString(xhr.responseText, 'text/html');
            var nc = doc.getElementById('ajax-container');
            if (nc) {
              /* 清理旧评论实例（CWD 等），防止观察器/事件残留 */
              cleanupBeforeNav();
              /* 先更新 URL 和标题，确保评论系统等脚本读取到正确的 location.pathname */
              if (push) history.pushState(null, null, u);
              var t = doc.querySelector('title'); if (t) document.title = t.textContent;
              box.innerHTML = nc.innerHTML;
              /* 关键：innerHTML 不执行 <script>，需手动重建执行
                 必须在 init 调用之前，因为 Gallery.init 等依赖内联脚本设置的变量（如 GALLERY_DATA） */
              try { execScripts(box); } catch(e) { console.warn('execScripts error:', e); }
              /* DesktopMode 必须先执行：移除首页的 overflow:hidden，
                 否则非首页内容不可滚动 */
              try { DesktopMode.check(); } catch(e) { console.warn('DesktopMode error:', e); }
              try {
              Drag.init(); WallFilter(); self.dockHL();
              DockTip.init();
              loadHitokoto();
              MusicPlayer.moveToWindow();
              TOC.init();
              CodeCopy.init();
              LazyImg.init();
              BackTop.refresh();
              CountUp.init();
              ArchiveFold.init();
              Gallery.init();
              /* 重新触发卜算子访客统计（脚本在 head 中，AJAX 不会自动重新加载） */
              refreshBusuanzi();
              window.scrollTo(0, 0);
              // GSAP 动画需在 AJAX 加载完成后重新执行
              if (typeof GSAPAnimations !== "undefined") GSAPAnimations.run();
              // UI 增强效果重新初始化
              if (typeof UIEnhance !== "undefined") UIEnhance.init();
              } catch(e2) { console.warn('AJAX init error:', e2); }
            }
          }
          } catch(e3) { console.warn('AJAX load error:', e3); }
          /* 无论成功失败，必须重置 UI 状态和 busy 标志 */
          box.classList.remove('fade-out'); box.classList.add('fade-in');
          setTimeout(function () { box.classList.remove('fade-in'); }, 300);
          ProgressBar.done(); self.busy = false;
        };
        xhr.onerror = function () { window.location.href = u; };
        xhr.send();
      }, 280);
    },
    dockHL: function () {
      var c = location.pathname;
      document.querySelectorAll('.dock-item:not(.dock-minimized-item)').forEach(function (el) {
        var h = el.getAttribute('data-href');
        el.classList.toggle('active', h === c || (h === '/' && c === '/'));
      });
      syncDockGlass();
    }
  };

  /* ====== 桌面模式切换（首页禁止滚动） ====== */
  var DesktopMode = {
    check: function () {
      /* 移动端：不锁定滚动，移除 is-desktop 标记 */
      if (isMobile()) {
        document.documentElement.classList.remove('is-desktop');
        document.body.classList.remove('is-desktop');
        document.documentElement.classList.add('is-mobile');
        return;
      }
      /* 非移动端：一定设 is-desktop，不管有没有 .drag-win
         .drag-win 仅用于首页锁定滚动，不影响其他页面的桌面端布局 */
      document.documentElement.classList.add('is-desktop');
      document.documentElement.classList.remove('is-mobile');
      var hasDesktop = !!document.querySelector('.drag-win');
      document.body.classList.toggle('is-desktop', hasDesktop);
    }
  };

  /* ====== 同步 dock-glass 宽度到 dock-bar-inner（rAF 批处理优化）====== */
  var _dockGlassRAF = null;
  function syncDockGlass() {
    if (_dockGlassRAF) return; /* 已有排队的帧，跳过 */
    _dockGlassRAF = requestAnimationFrame(function () {
      _dockGlassRAF = null;
      var inner = document.querySelector('.dock-bar-inner');
      var glass = document.querySelector('.dock-glass');
      if (inner && glass) {
        glass.style.width = inner.offsetWidth + 'px';
      }
    });
  }

  /* ====== 卜算子访客统计 — AJAX 导航后重新触发 ====== */
  function refreshBusuanzi() {
    /* 卜算子在 head.ejs 中加载，位于 ajax-container 之外，AJAX 导航不会重新触发。
       此函数通过重新插入 script 标签来重新获取访客数据。 */
    var old = document.querySelector('script[src*="busuanzi"]');
    var src = old ? old.getAttribute('src') : '/assets/js/busuanzi.pure.mini.js';
    if (old) old.remove();
    /* 重置全局状态，让新脚本干净初始化 */
    window.bszCaller = undefined;
    window.bszTag = undefined;
    var s = document.createElement('script');
    s.src = src;
    s.async = true;
    document.head.appendChild(s);
  }

  /* ====== 统计数字计数动画 ====== */
  var CountUp = {
    init: function () {
      var nums = document.querySelectorAll('.stat-hero-num');
      nums.forEach(function (el) {
        var target = parseInt(el.textContent, 10);
        if (isNaN(target) || target === 0) return;
        el.textContent = '0';
        var start = 0;
        var duration = 800;
        var startTime = null;
        function step(ts) {
          if (!startTime) startTime = ts;
          var progress = Math.min((ts - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(eased * target).toString();
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = target.toString();
        }
        requestAnimationFrame(step);
      });
    }
  };

  /* ====== 暗黑模式切换 ====== */
  var ThemeToggle = {
    init: function () {
      /* 防重复创建 — 荣耀等浏览器可能重复执行脚本 */
      if (document.querySelector('.theme-toggle')) return;
      /* 从 localStorage 读取主题偏好 */
      var saved = localStorage.getItem('theme');
      if (saved === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
      /* 创建切换按钮 */
      var btn = document.createElement('button');
      btn.className = 'theme-toggle';
      btn.type = 'button';
      btn.innerHTML = '<i class="fas fa-moon"></i>';
      btn.title = '切换暗黑模式';
      btn.addEventListener('click', function () {
        var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
          document.documentElement.removeAttribute('data-theme');
          localStorage.setItem('theme', 'light');
          btn.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
          document.documentElement.setAttribute('data-theme', 'dark');
          localStorage.setItem('theme', 'dark');
          btn.innerHTML = '<i class="fas fa-sun"></i>';
        }
      });
      /* 如果已经是暗黑模式，显示太阳图标 */
      if (document.documentElement.getAttribute('data-theme') === 'dark') {
        btn.innerHTML = '<i class="fas fa-sun"></i>';
      }
      document.body.appendChild(btn);
    }
  };

  /* ====== 归档页面年份折叠 ====== */
  var ArchiveFold = {
    init: function () {
      var sections = document.querySelectorAll('.archive-year-section');
      if (!sections.length) return;
      /* 确保 toggleYear 全局可用 */
      if (typeof window.toggleYear !== 'function') {
        window.toggleYear = function (year) {
          var content = document.getElementById('year-content-' + year);
          var header = document.querySelector('#year-' + year + ' .archive-year-header');
          var icon = document.querySelector('#year-' + year + ' .year-toggle-icon');
          if (!content) return;
          
          // 更可靠的展开状态检测：检查header是否有expanded类
          var isExpanded = header && header.classList.contains('expanded');
          
          if (!isExpanded) {
            content.style.maxHeight = '2000px';
            if (icon) icon.style.transform = 'rotate(0deg)';
            if (header) header.classList.add('expanded');
          } else {
            content.style.maxHeight = '0';
            if (icon) icon.style.transform = 'rotate(-90deg)';
            if (header) header.classList.remove('expanded');
          }
        };
      }
      /* 绑定点击事件（AJAX加载后内联onclick可能丢失） */
      sections.forEach(function (section) {
        var header = section.querySelector('.archive-year-header');
        if (header && !header._bound) {
          header._bound = true;
          header.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var year = header.getAttribute('data-year') || section.id.replace('year-', '');
            window.toggleYear(year);
          });
        }
      });
      /* 默认折叠所有年份（使用新的CSS过渡效果）*/
      sections.forEach(function (section) {
        var yearId = section.id.replace('year-', '');
        var content = document.getElementById('year-content-' + yearId);
        var header = section.querySelector('.archive-year-header');
        var icon = section.querySelector('.year-toggle-icon');
        if (content) {
          content.style.maxHeight = '0';
          if (icon) icon.style.transform = 'rotate(-90deg)';
          if (header) header.classList.remove('expanded');
        }
      });
    }
  };

  /* ====== 相册页面：瀑布流 + 无限加载 + 灯箱 ====== */
  var Gallery = {
    page: 0, perPage: 9, loading: false, finished: false,
    data: [], currentIdx: 0,
    init: function () {
      var container = document.getElementById('galleryMasonry');
      if (!container) return;
      if (typeof GALLERY_DATA === 'undefined') return;
      /* 重置状态 — AJAX 导航回到相册页时旧状态会残留 */
      this.page = 0;
      this.loading = false;
      this.finished = false;
      this.data = GALLERY_DATA;
      this.container = container;
      container.innerHTML = '';
      this.loader = document.getElementById('galleryLoader');
      this.end = document.getElementById('galleryEnd');
      if (this.loader) this.loader.classList.remove('hidden');
      if (this.end) this.end.style.display = 'none';
      this.loadMore();
      /* 无限加载监听 */
      var self = this;
      window.addEventListener('scroll', function () {
        if (self.finished || self.loading) return;
        var scrollBottom = window.innerHeight + window.scrollY;
        if (scrollBottom >= document.body.offsetHeight - 200) {
          self.loadMore();
        }
      }, { passive: true });
      /* 灯箱 */
      this.initLightbox();
    },
    loadMore: function () {
      if (this.finished) return;
      this.loading = true;
      var start = this.page * this.perPage;
      var end = Math.min(start + this.perPage, this.data.length);
      if (start >= this.data.length) {
        this.finished = true;
        if (this.loader) this.loader.classList.add('hidden');
        if (this.end) this.end.style.display = '';
        return;
      }
      for (var i = start; i < end; i++) {
        this.addItem(this.data[i], i);
      }
      this.page++;
      this.loading = false;
      if (end >= this.data.length) {
        this.finished = true;
        if (this.loader) this.loader.classList.add('hidden');
        if (this.end) this.end.style.display = '';
      }
    },
    addItem: function (item, idx) {
      var self = this;
      var div = document.createElement('div');
      div.className = 'gallery-item';
      div.dataset.idx = idx;
      var img = document.createElement('img');
      img.src = item.thumb || item.src;
      img.alt = item.title || '';
      img.loading = 'lazy';
      img.addEventListener('load', function () { div.classList.add('loaded'); });
      img.addEventListener('click', function () { self.openLightbox(idx); });
      var overlay = document.createElement('div');
      overlay.className = 'gallery-overlay';
      overlay.innerHTML = '<span>' + (item.title || '') + '</span>';
      div.appendChild(img);
      div.appendChild(overlay);
      this.container.appendChild(div);
    },
    initLightbox: function () {
      var self = this;
      var lb = document.getElementById('galleryLightbox');
      if (!lb) return;
      this.lightbox = lb;
      this.lbImg = document.getElementById('lightboxImg');
      var close = document.getElementById('lightboxClose');
      var prev = document.getElementById('lightboxPrev');
      var next = document.getElementById('lightboxNext');
      var mask = lb.querySelector('.lightbox-mask');
      if (close) close.addEventListener('click', function () { self.closeLightbox(); });
      if (mask) mask.addEventListener('click', function () { self.closeLightbox(); });
      if (prev) prev.addEventListener('click', function (e) { e.stopPropagation(); self.showLightbox(-1); });
      if (next) next.addEventListener('click', function (e) { e.stopPropagation(); self.showLightbox(1); });
      document.addEventListener('keydown', function (e) {
        if (!lb.classList.contains('open')) return;
        if (e.key === 'Escape') self.closeLightbox();
        if (e.key === 'ArrowLeft') self.showLightbox(-1);
        if (e.key === 'ArrowRight') self.showLightbox(1);
      });
    },
    openLightbox: function (idx) {
      this.currentIdx = idx;
      this.lbImg.src = this.data[idx].large || this.data[idx].thumb || this.data[idx].src;
      this.lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    },
    closeLightbox: function () {
      this.lightbox.classList.remove('open');
      document.body.style.overflow = '';
    },
    showLightbox: function (dir) {
      this.currentIdx = (this.currentIdx + dir + this.data.length) % this.data.length;
      this.lbImg.src = this.data[this.currentIdx].large || this.data[this.currentIdx].thumb || this.data[this.currentIdx].src;
    }
  };

  /* ====== Init ====== */
  /* 荣耀等浏览器可能不支持 defer，脚本可能在 DOMContentLoaded 之后才加载
     此时 addEventListener('DOMContentLoaded') 永远不会触发，导致所有 init 不执行
     必须检查 readyState：如果 DOM 已就绪就直接执行，否则等事件 */
  function bootInit(){
    _scanLoadedScripts(); /* 记录初始页面加载的所有外部脚本，供 execScripts 去重 */
    syncMobileClass(); /* 确保移动端 class 与当前视口一致 */
    ProgressBar.init(); WinMgr.init(); Drag.init(); WallFilter(); Nav.init();
    DockTip.init(); /* dock tooltip — 不依赖 GSAP */
      loadHitokoto(); MusicPlayer.init();
      TOC.init(); CodeCopy.init(); LazyImg.init(); BackTop.init(); Search.init();
      CountUp.init();
      ThemeToggle.init();
      ArchiveFold.init();
      Gallery.init();
      DesktopMode.check();
      syncDockGlass();
    // 窗口最小化/恢复后 dock 宽度变化，同步 glass
    window.addEventListener('resize', syncDockGlass);
    // GSAP 动画需在 Drag.init() 定位窗口之后执行
    if (typeof GSAPAnimations !== "undefined") GSAPAnimations.run();
    // UI 增强效果（粒子拖尾只初始化一次，其余每次 AJAX 都重新初始化）
    if (typeof UIEnhance !== "undefined") { UIEnhance.initOnce(); UIEnhance.init(); }

    /* ====== 响应式断点监听：跨越 768px 时刷新页面 ====== */
    var _prevMobile = isMobile();
    var _resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(_resizeTimer);
      _resizeTimer = setTimeout(function () {
        var _nowMobile = isMobile();
        if (_nowMobile !== _prevMobile) {
          _prevMobile = _nowMobile;
          location.reload();
        }
      }, 300);
    });
  }
  /* 如果 DOM 已就绪就直接执行，否则等 DOMContentLoaded
     荣耀浏览器不支持 defer 时，脚本可能在 DOMContentLoaded 之后才加载 */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootInit);
  } else {
    bootInit();
  }
})();
} /* end else */
