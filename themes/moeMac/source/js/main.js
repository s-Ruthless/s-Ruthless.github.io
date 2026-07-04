/**
 * moeMac Theme - Main JavaScript
 */
(function () {
  'use strict';

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
          try { self.ap.list.hide(); } catch (e) {} /* 清除 APlayer 内联 max-height */ var listEl = mount.querySelector('.aplayer-list'); if (listEl) listEl.style.maxHeight = '';
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
    iconMap: { 'win-hero': 'fas fa-house', 'win-posts': 'fas fa-newspaper', 'win-categories': 'fas fa-folder', 'win-tags': 'fas fa-tags', 'win-music': 'fas fa-music', 'win-data': 'fas fa-chart-bar' },
    nameMap: { 'win-hero': '\u6211\u7684\u4e3b\u9875', 'win-posts': '\u6700\u65b0\u6587\u7ae0', 'win-categories': '\u5206\u7c7b', 'win-tags': '\u6807\u7b7e\u4e91', 'win-music': '\u6b4c\u5355', 'win-data': '\u7ad9\u70b9\u6570\u636e' },
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
      var container = document.getElementById('dock-mini-zone');
      if (!container) { win.style.display = 'none'; return; }
      var icon = this.iconMap[id] || 'fas fa-window-maximize';
      var name = this.nameMap[id] || '';
      var item = document.createElement('div');
      item.className = 'dock-item dock-minimized-item dock-item-enter';
      item.setAttribute('data-win-id', id);
      item.innerHTML = '<div class="dock-text">' + name + '</div><div class="dock-item-inner"><i class="' + icon + ' dock-icon"></i></div>';
      /* 插入分隔线（如果还没有） */
      if (!document.querySelector('.dock-mini-sep')) {
        var sep = document.createElement('div');
        sep.className = 'dock-mini-sep';
        container.appendChild(sep);
      }
      container.appendChild(item);


      /* 延迟一帧让 dock 图标先入场动画，再启动窗口缩小 */
      requestAnimationFrame(function() {
        var iconRect = item.getBoundingClientRect();
        var winRect = win.getBoundingClientRect();
        var dx = (iconRect.left + iconRect.width / 2) - (winRect.left + winRect.width / 2);
        var dy = (iconRect.top + iconRect.height / 2) - (winRect.top + winRect.height / 2);
        var targetScale = Math.max(iconRect.width / winRect.width, 0.08);

        /* 窗口缩小动画：用 ease-out 先快后慢，配合 dock 图标弹入 */
        win.style.transition = 'transform 0.48s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.48s cubic-bezier(0.22, 0.61, 0.36, 1)';
        win.style.transformOrigin = 'center center';
        win.style.zIndex = '10001';
        win.style.pointerEvents = 'none';
        requestAnimationFrame(function() {
          win.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + targetScale + ')';
          win.style.opacity = '0';
        });
      });

      setTimeout(function() {
        win.classList.add('win-minimized');
        win.style.display = 'none';
        win.style.transition = '';
        win.style.transform = '';
        win.style.opacity = '';
        win.style.zIndex = '';
        win.style.pointerEvents = '';
        item.classList.remove('dock-item-enter');
      }, 520);
    },

    restore: function (win, miniItem) {
      if (!miniItem) {
        var id = this.winId(win);
        miniItem = document.querySelector('.dock-minimized-item[data-win-id="' + id + '"]');
      }
      win.classList.remove('win-minimized');
      win.style.display = '';

      /* dock 图标退场动画 */
      if (miniItem) {
        miniItem.classList.add('dock-item-leave');
        var onAnimEnd = function() {
          miniItem.removeEventListener('animationend', onAnimEnd);
          miniItem.remove();
          var wrap = document.querySelector('.dock-bar-inner');
          /* 如果没有最小化图标了，移除分隔线 */
          if (wrap && !wrap.querySelector('.dock-minimized-item')) {
            var s = wrap.querySelector('.dock-mini-sep');
            if (s) s.remove();
          }
          var container = document.getElementById('dock-mini-wrap');
          if (container && container.children.length === 0) {
            var sep = document.querySelector('.dock-mini-wraparator');
            if (sep) sep.classList.remove('visible');
          }
        };
        miniItem.addEventListener('animationend', onAnimEnd);
        /* 兜底：万一动画事件没触发 */
        setTimeout(function() { if (miniItem.parentNode) onAnimEnd(); }, 350);
      }

      /* 窗口弹出恢复 */
      win.style.transition = 'none';
      win.style.transform = 'scale(0.4) translateY(30px)';
      win.style.opacity = '0';
      win.offsetHeight;
      win.style.transition = 'transform 0.42s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease';
      win.style.transform = 'scale(1) translateY(0)';
      win.style.opacity = '1';
      setTimeout(function() {
        win.style.transition = '';
        win.style.transform = '';
        win.style.opacity = '';
      }, 450);
      Drag.focus(win);
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

  /* ====== Window Drag ====== */
  var Drag = {
    winW: 0, winH: 0, maxZ: 10, gap: 20, minDist: 40, centerDist: 80, dockH: 80,
    init: function () {
      this.winW = window.innerWidth; this.winH = window.innerHeight;
      var self = this;
      document.querySelectorAll('.app-window:not([data-pos])').forEach(function (el) {
        if (el.style.left && el.style.left.indexOf('%') !== -1) {
          var rect = el.getBoundingClientRect();
          el.style.left = rect.left + 'px';
          el.style.top = rect.top + 'px';
        }
      });
      document.querySelectorAll('.drag-win').forEach(function (el) {
        var saved = null;
        try { saved = JSON.parse(sessionStorage.getItem('moeWinPos_' + el.id)); } catch(e) {}
        if (saved && saved.w === window.innerWidth && saved.h === window.innerHeight) {
          el.style.left = saved.x + 'px';
          el.style.top = saved.y + 'px';
        } else {
          var ew = el.offsetWidth, eh = el.offsetHeight;
          var best = self.findPos(ew, eh);
          el.style.left = best.x + 'px'; el.style.top = best.y + 'px';
        }
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
              try { sessionStorage.setItem('moeWinPos_' + el.id, JSON.stringify({x:el.offsetLeft,y:el.offsetTop,w:window.innerWidth,h:window.innerHeight})); } catch(e) {}
              document.removeEventListener('mousemove', mv);
              document.removeEventListener('mouseup', up);
            }
            document.addEventListener('mousemove', mv);
            document.addEventListener('mouseup', up);
          });
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
    findPos: function (ew, eh) {
      var aw = this.winW, ah = this.winH - this.dockH;
      var cl = { l: aw / 2 - 100, t: ah / 2 - 100, w: 200, h: 200 };
      var placed = [];
      for (var tries = 0; tries < 200; tries++) {
        var x = this.gap + Math.random() * (aw - ew - this.gap * 2);
        var y = this.gap + Math.random() * (ah - eh - this.gap * 2);
        if (!this.ov(x, y, ew, eh, cl, placed)) {
          placed.push({ l: x, t: y, w: ew, h: eh });
          return { x: x, y: y };
        }
      }
      return { x: this.gap + Math.random() * (aw - ew - this.gap * 2), y: this.gap + Math.random() * (ah - eh - this.gap * 2) };
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

  /* ====== AJAX Nav ====== */
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
      ProgressBar.start(); box.classList.add('fade-out');
      setTimeout(function () {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', u, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.onload = function () {
          if (xhr.status >= 200 && xhr.status < 400) {
            var doc = new DOMParser().parseFromString(xhr.responseText, 'text/html');
            var nc = doc.getElementById('ajax-container');
            if (nc) {
              box.innerHTML = nc.innerHTML;
              var t = doc.querySelector('title'); if (t) document.title = t.textContent;
              if (push) history.pushState(null, null, u);
              Drag.init(); WallFilter(); self.dockHL();
              loadHitokoto();
              MusicPlayer.moveToWindow();
              window.scrollTo(0, 0);
              if (typeof hljs !== 'undefined') document.querySelectorAll('pre code').forEach(function (b) { hljs.highlightElement(b); });
              // GSAP 动画重载（AJAX 导航后重新触发入场动画）
              if (typeof GSAPAnimations !== 'undefined') GSAPAnimations.run();
            }
          }
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
    }
  };

  /* ====== Init ====== */
  document.addEventListener('DOMContentLoaded', function () {
    ProgressBar.init(); WinMgr.init(); Drag.init(); WallFilter(); Nav.init();
    loadHitokoto(); MusicPlayer.init();
    // GSAP 动画在 Drag.init() 定位完成后再执行，避免窗口跑到左上角
    if (typeof GSAPAnimations !== 'undefined') GSAPAnimations.run();
  });
})();