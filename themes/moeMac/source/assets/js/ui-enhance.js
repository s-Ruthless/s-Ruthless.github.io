/**
 * UI Enhancements - moeMac Theme
 * 纯原生 JS + CSS 实现，零外部依赖
 * 包含：动态网格背景（CSS动画）、光标粒子拖尾、
 *       数字滚动、点击涟漪、Clip-Path图片揭示
 */
(function () {
  'use strict';

  var _isMobile = window.innerWidth <= 768;

  var UIEnhance = {

    /* ====== 1. 动态网格背景 — CSS 动画驱动，无需 GSAP ====== */
    meshGradient: function () {
      if (_isMobile) return;
      var mesh = document.querySelector('.mesh-bg');
      if (!mesh) {
        mesh = document.createElement('div');
        mesh.className = 'mesh-bg';
        mesh.innerHTML =
          '<div class="mesh-blob mesh-blob-1"></div>' +
          '<div class="mesh-blob mesh-blob-2"></div>' +
          '<div class="mesh-blob mesh-blob-3"></div>' +
          '<div class="mesh-blob mesh-blob-4"></div>';
        document.body.insertBefore(mesh, document.body.firstChild);
      }
      /* CSS 动画由 style.css 中的 @keyframes 驱动，无需 JS */
      /* 添加 animation 类让 blob 开始浮动 */
      var blobs = mesh.querySelectorAll('.mesh-blob');
      blobs.forEach(function (blob, i) {
        blob.style.animation = 'mesh-float-' + (i + 1) + ' ' + (12 + i * 3) + 's ease-in-out infinite alternate';
      });
    },

    /* ====== 2. 光标粒子拖尾 — Canvas 火花 ====== */
    sparkles: function () {
      if (_isMobile) return;
      var canvas = document.getElementById('sparkle-canvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'sparkle-canvas';
        document.body.appendChild(canvas);
      }
      var ctx = canvas.getContext('2d');
      var particles = [];
      var mouse = { x: 0, y: 0, prevX: 0, prevY: 0 };
      var colors = ['#a78bfa', '#ec4899', '#60a5fa', '#fbbf24', '#34d399'];
      var maxParticles = 40;

      function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      resize();
      window.addEventListener('resize', resize);

      function spawn(x, y) {
        if (particles.length >= maxParticles) return;
        var count = 2 + Math.floor(Math.random() * 3);
        for (var i = 0; i < count; i++) {
          particles.push({
            x: x + (Math.random() - 0.5) * 8,
            y: y + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2 - 0.5,
            life: 1,
            decay: 0.015 + Math.random() * 0.02,
            size: 1 + Math.random() * 2.5,
            color: colors[Math.floor(Math.random() * colors.length)]
          });
        }
      }

      var lastSpawn = 0;
      document.addEventListener('mousemove', function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        var now = Date.now();
        var dist = Math.hypot(mouse.x - mouse.prevX, mouse.y - mouse.prevY);
        if (now - lastSpawn > 30 && dist > 3) {
          spawn(mouse.x, mouse.y);
          mouse.prevX = mouse.x;
          mouse.prevY = mouse.y;
          lastSpawn = now;
        }
      });

      document.addEventListener('touchmove', function (e) {
        var t = e.touches[0];
        if (t) spawn(t.clientX, t.clientY);
      }, { passive: true });

      function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (var i = particles.length - 1; i >= 0; i--) {
          var p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.03;
          p.life -= p.decay;
          if (p.life <= 0) { particles.splice(i, 1); continue; }
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = p.life * 0.3;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        requestAnimationFrame(animate);
      }
      animate();
    },

    /* ====== 3. 数字滚动动画 — requestAnimationFrame 实现 ====== */
    motionNumbers: function () {
      var nums = document.querySelectorAll('[data-motion-num]');
      if (!nums.length) return;

      function animateNum(el) {
        var target = parseInt(el.getAttribute('data-motion-num'), 10);
        if (isNaN(target)) return;
        var startTime = null;
        var duration = 1200;
        function step(ts) {
          if (!startTime) startTime = ts;
          var progress = Math.min((ts - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(eased * target);
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = target;
        }
        requestAnimationFrame(step);
      }

      nums.forEach(function (el) {
        el.classList.add('motion-num');
        if (typeof IntersectionObserver !== 'undefined') {
          var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) { animateNum(el); io.unobserve(el); }
            });
          }, { threshold: 0.5 });
          io.observe(el);
        } else {
          animateNum(el);
        }
      });
    },

    /* ====== 4. 点击涟漪效果 ====== */
    rippleEffect: function () {
      var selectors = '.win-traffic-btn, .page-btn, .filter-btn, .ajax-link, .art-item, .post-item, .cat-item, .tag';
      document.querySelectorAll(selectors).forEach(function (el) {
        if (el.dataset.rippleInit) return;
        el.dataset.rippleInit = '1';
        el.classList.add('ripple-target');
        el.addEventListener('click', function (e) {
          var rect = el.getBoundingClientRect();
          var size = Math.max(rect.width, rect.height);
          var x = e.clientX - rect.left - size / 2;
          var y = e.clientY - rect.top - size / 2;
          var ripple = document.createElement('span');
          ripple.className = 'ripple';
          ripple.style.width = ripple.style.height = size + 'px';
          ripple.style.left = x + 'px';
          ripple.style.top = y + 'px';
          el.appendChild(ripple);
          setTimeout(function () { if (ripple.parentNode) ripple.remove(); }, 600);
        });
      });
    },

    /* ====== 5. Clip-Path 图片揭示 — IntersectionObserver ====== */
    /* 用 JS closest() 排除画廊/豆瓣图片，比 CSS :not() 更可靠 */
    clipReveal: function () {
      var imgs = document.querySelectorAll('.article-content img, .wall-card img');
      imgs.forEach(function (img) {
        if (img.dataset.clipInit) return;
        if (img.closest('.gallery-item')) return;  /* 跳过画廊图片 */
        if (img.closest('.douban-card')) return;   /* 跳过豆瓣封面 */
        if (img.closest('.flink-card')) return;    /* 跳过友链头像 */
        if (img.closest('.card-cover')) return;    /* 跳过文章封面图（已有点击跳转，不需揭示动画） */
        if (img.closest('.carousel-container')) return;  /* 跳过轮播图 */
        if (img.closest('.post-card')) return;  /* 跳过文章引用卡片 */
        if (img.closest('.post-card-thumb')) return;  /* 跳过文章卡片缩略图 */
        img.dataset.clipInit = '1';
        img.classList.add('clip-reveal');
        if (typeof IntersectionObserver !== 'undefined') {
          var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                img.classList.add('revealed');
                io.unobserve(img);
              }
            });
          }, { threshold: 0.1 });
          io.observe(img);
        } else {
          setTimeout(function () { img.classList.add('revealed'); }, 300);
        }
      });
    },

    /* ====== 6. glassShine 已移除 — hover 扫光会创建额外合成层导致字体模糊 ====== */
    glassShine: function () { /* no-op */ },

    /* ====== 7. Hero 头像文字渐变闪烁 ====== */
    heroEffects: function () {
      var name = document.querySelector('.hero-text h2');
      if (name && !name.dataset.shimmerInit) {
        name.dataset.shimmerInit = '1';
        if (name.textContent.length > 1) {
          name.classList.add('shimmer-text');
        }
      }
    },/* ====== 初始化全部（AJAX 加载后也可调用） ====== */
    init: function () {
      this.meshGradient();
      this.glassShine();
      this.heroEffects();
      this.motionNumbers();
      this.rippleEffect();
      this.clipReveal();
    },

    /* 仅初始化一次的效果（页面加载时） */
    initOnce: function () {
      this.sparkles();
    }
  };

  window.UIEnhance = UIEnhance;
})();
