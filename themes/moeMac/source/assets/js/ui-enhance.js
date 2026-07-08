/**
 * UI-Layouts Inspired Enhancements - moeMac Theme
 * 基于 ui-layouts.com 风格，用 GSAP + Canvas + CSS 实现
 * 包含：动态网格背景、光标粒子拖尾、3D卡片倾斜、数字滚动、
 *       点击涟漪、Clip-Path图片揭示、Dock放大镜、磁吸按钮
 */
(function () {
  'use strict';

  /* 移动端检测 */
  var _isMobile = window.innerWidth <= 768;

  var UIEnhance = {

    /* ====== 1. 动态网格背景 — 缓慢漂浮的渐变色块 ====== */
    meshGradient: function () {
      /* 移动端跳过 — 减少动画负担 */
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
      if (typeof gsap === 'undefined') return;
      var blobs = mesh.querySelectorAll('.mesh-blob');
      blobs.forEach(function (blob, i) {
        gsap.to(blob, {
          x: (i % 2 === 0 ? 1 : -1) * (60 + i * 20),
          y: (i % 2 === 0 ? -1 : 1) * (40 + i * 15),
          duration: 12 + i * 3,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true
        });
        gsap.to(blob, {
          scale: 1.1 + i * 0.05,
          duration: 8 + i * 2,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true
        });
      });
    },

    /* ====== 2. 光标粒子拖尾 — Canvas 火花 ====== */
    sparkles: function () {
      /* 移动端跳过 — Canvas 动画消耗性能 */
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

      /* 触摸设备也支持 */
      document.addEventListener('touchmove', function (e) {
        var t = e.touches[0];
        if (t) {
          spawn(t.clientX, t.clientY);
        }
      }, { passive: true });

      function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (var i = particles.length - 1; i >= 0; i--) {
          var p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.03; /* 微重力 */
          p.life -= p.decay;
          if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
          }
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fill();
          /* 光晕 */
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

    /* ====== 3. 3D 卡片倾斜 — 已移除 ======
       原因：目标选择器 .friend-card 不存在（实际类名为 .link-card），
       且 GSAP inline rotateX/rotateY 会覆盖 CSS :hover transform 导致冲突。
       卡片 hover 效果完全由 CSS 控制。 */

    /* ====== 4. 数字滚动动画 — 滚动到视口时从 0 滚到目标值 ====== */
    motionNumbers: function () {
      var nums = document.querySelectorAll('[data-motion-num]');
      if (!nums.length) return;

      function animateNum(el) {
        var target = parseInt(el.getAttribute('data-motion-num'), 10);
        if (isNaN(target)) return;
        var obj = { val: 0 };
        if (typeof gsap !== 'undefined') {
          gsap.to(obj, {
            val: target,
            duration: 1.2,
            ease: 'power2.out',
            onUpdate: function () {
              el.textContent = Math.floor(obj.val);
            },
            onComplete: function () {
              el.textContent = target;
            }
          });
        } else {
          el.textContent = target;
        }
      }

      nums.forEach(function (el) {
        el.classList.add('motion-num');
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.create({
            trigger: el,
            start: 'top 90%',
            once: true,
            onEnter: function () { animateNum(el); }
          });
        } else if (typeof IntersectionObserver !== 'undefined') {
          var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                animateNum(el);
                io.unobserve(el);
              }
            });
          }, { threshold: 0.5 });
          io.observe(el);
        } else {
          animateNum(el);
        }
      });
    },

    /* ====== 5. 点击涟漪效果 ====== */
    rippleEffect: function () {
      /* 注意：不包含 .dock-item 和 .dock-minimized-item — ripple-target 会加 overflow:hidden，
         裁切掉 .dock-text tooltip */
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

          setTimeout(function () {
            if (ripple.parentNode) ripple.remove();
          }, 600);
        });
      });
    },

    /* ====== 6. Clip-Path 图片揭示 — 滚动触发 ====== */
    clipReveal: function () {
      var imgs = document.querySelectorAll('.article-content img, .wall-card img, .douban-card img');
      imgs.forEach(function (img) {
        if (img.dataset.clipInit) return;
        img.dataset.clipInit = '1';
        img.classList.add('clip-reveal');

        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.create({
            trigger: img,
            start: 'top 85%',
            once: true,
            onEnter: function () {
              img.classList.add('revealed');
            }
          });
        } else {
          /* 无 ScrollTrigger 时延迟显示 */
          setTimeout(function () { img.classList.add('revealed'); }, 300);
        }
      });
    },

    /* ====== 7. Dock 放大镜效果 — 已移除 ======
       原因：GSAP inline scale/y 与 CSS :hover transform: translateY(-8px) scale(1.25) translateZ(0)
       冲突，导致 dock 图标 hover 时字体抖动、图标跳跃。
       Dock hover 效果完全由 CSS :hover 控制（style.css .dock-item:hover .dock-item-inner）。 */

    /* ====== 8. 磁吸按钮 — 已移除 ======
       原因：GSAP inline x/y 与 CSS :hover transform: translateZ(0) 冲突，
       导致 .win-traffic-btn 和 .page-btn hover 时字体抖动。
       按钮 hover 效果完全由 CSS 控制。 */

    /* ====== 9. 窗口玻璃光泽扫光 ====== */
    glassShine: function () {
      document.querySelectorAll('.app-window').forEach(function (win) {
        if (win.querySelector('.glass-shine')) return;
        var shine = document.createElement('div');
        shine.className = 'glass-shine';
        win.appendChild(shine);
      });
    },

    /* ====== 10. Hero 头像文字渐变闪烁 ====== */
    heroEffects: function () {
      /* 注意：不再添加 float-anim 到 .hero-ava —
         animation 的 transform 会覆盖 CSS :hover 的 transform: scale(1.08) translateZ(0)，
         导致 hover 缩放失效。浮动效果由 CSS animation 控制会与 hover 冲突。 */
      var name = document.querySelector('.hero-text h2');
      if (name && !name.dataset.shimmerInit) {
        name.dataset.shimmerInit = '1';
        /* 只在有足够文字时加闪烁 */
        if (name.textContent.length > 1) {
          name.classList.add('shimmer-text');
        }
      }
    },

    /* ====== 初始化全部（AJAX 加载后也可调用） ====== */
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
