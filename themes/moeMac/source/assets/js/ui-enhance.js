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

    /* ====== 3. 3D 卡片倾斜 — 鼠标跟随的 perspective tilt ====== */
    tiltCards: function () {
      /* 移动端无 mousemove，跳过 */
      if (_isMobile) return;
      var selectors = '.wall-card, .friend-card, .post-list-item, .douban-card';
      document.querySelectorAll(selectors).forEach(function (card) {
        if (card.dataset.tiltInit) return;
        card.dataset.tiltInit = '1';
        card.classList.add('tilt-card');

        /* 添加光泽层 */
        var shine = document.createElement('div');
        shine.className = 'tilt-shine';
        card.style.position = card.style.position || 'relative';
        card.appendChild(shine);

        var rect = null;
        card.addEventListener('mouseenter', function () {
          rect = card.getBoundingClientRect();
        });
        card.addEventListener('mousemove', function (e) {
          if (!rect) rect = card.getBoundingClientRect();
          var cx = rect.left + rect.width / 2;
          var cy = rect.top + rect.height / 2;
          var dx = (e.clientX - cx) / (rect.width / 2);
          var dy = (e.clientY - cy) / (rect.height / 2);
          var maxTilt = 8; /* 最大倾斜角度 */
          var rx = -dy * maxTilt;
          var ry = dx * maxTilt;
          if (typeof gsap !== 'undefined') {
            gsap.to(card, {
              rotateX: rx, rotateY: ry,
              duration: 0.2, ease: 'power2.out',
              transformPerspective: 600
            });
          } else {
            card.style.transform = 'perspective(600px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
          }
          /* 光泽跟随 */
          var mx = ((e.clientX - rect.left) / rect.width) * 100;
          var my = ((e.clientY - rect.top) / rect.height) * 100;
          shine.style.setProperty('--mx', mx + '%');
          shine.style.setProperty('--my', my + '%');
        });
        card.addEventListener('mouseleave', function () {
          if (typeof gsap !== 'undefined') {
            gsap.to(card, {
              rotateX: 0, rotateY: 0,
              duration: 0.4, ease: 'power3.out'
            });
          } else {
            card.style.transform = '';
          }
          rect = null;
        });
      });
    },

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

    /* ====== 7. Dock 放大镜效果 — 鼠标附近的图标逐渐放大 ====== */
    dockMagnify: function () {
      /* 移动端无 mousemove，跳过 */
      if (_isMobile) return;
      var dockInner = document.querySelector('.dock-bar-inner');
      if (!dockInner) return;

      var items = dockInner.querySelectorAll('.dock-item, .dock-minimized-item');
      items.forEach(function (item) {
        if (item.dataset.magnifyInit) return;
        item.dataset.magnifyInit = '1';
        item.classList.add('dock-magnify');

        var inner = item.querySelector('.dock-item-inner');
        if (!inner) return;

        item.addEventListener('mousemove', function (e) {
          var rect = item.getBoundingClientRect();
          var cx = rect.left + rect.width / 2;
          var dist = Math.abs(e.clientX - cx);
          var maxDist = 80;
          if (dist < maxDist) {
            var scale = 1 + (1 - dist / maxDist) * 0.25;
            var lift = (1 - dist / maxDist) * 6;
            if (typeof gsap !== 'undefined') {
              gsap.to(inner, { scale: scale, y: -lift, duration: 0.15, ease: 'power2.out' });
            }
          }
        });

        /* mouseleave 重置 — 防止 inline transform 残留 */
        item.addEventListener('mouseleave', function () {
          if (typeof gsap !== 'undefined') {
            gsap.to(inner, { scale: 1, y: 0, duration: 0.2, ease: 'power2.out' });
          } else {
            inner.style.transform = '';
          }
        });
      });
    },

    /* ====== 8. 磁吸按钮 — 鼠标靠近时按钮被吸引 ====== */
    magneticButtons: function () {
      /* 移动端无 mousemove，跳过 */
      if (_isMobile) return;
      /* 注意：不包含 .back-top-btn — 它有 CSS :hover transform，
         GSAP inline transform 会与 CSS 冲突导致抖动 */
      var selectors = '.win-traffic-btn, .page-btn';
      document.querySelectorAll(selectors).forEach(function (btn) {
        if (btn.dataset.magneticInit) return;
        btn.dataset.magneticInit = '1';
        btn.classList.add('magnetic-btn');

        btn.addEventListener('mousemove', function (e) {
          var rect = btn.getBoundingClientRect();
          var cx = rect.left + rect.width / 2;
          var cy = rect.top + rect.height / 2;
          var dx = (e.clientX - cx) * 0.3;
          var dy = (e.clientY - cy) * 0.3;
          if (typeof gsap !== 'undefined') {
            gsap.to(btn, { x: dx, y: dy, duration: 0.2, ease: 'power2.out' });
          }
        });
        btn.addEventListener('mouseleave', function () {
          if (typeof gsap !== 'undefined') {
            gsap.to(btn, { x: 0, y: 0, duration: 0.3, ease: 'elastic.out(1, 0.4)' });
          }
        });
      });
    },

    /* ====== 9. 窗口玻璃光泽扫光 ====== */
    glassShine: function () {
      document.querySelectorAll('.app-window').forEach(function (win) {
        if (win.querySelector('.glass-shine')) return;
        var shine = document.createElement('div');
        shine.className = 'glass-shine';
        win.appendChild(shine);
      });
    },

    /* ====== 10. Hero 头像浮动 + 文字渐变闪烁 ====== */
    heroEffects: function () {
      var ava = document.querySelector('.hero-ava');
      if (ava && !ava.dataset.floatInit) {
        ava.dataset.floatInit = '1';
        ava.classList.add('float-anim');
      }
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
      this.tiltCards();
      this.motionNumbers();
      this.rippleEffect();
      this.clipReveal();
      this.dockMagnify();
      this.magneticButtons();
    },

    /* 仅初始化一次的效果（页面加载时） */
    initOnce: function () {
      this.sparkles();
    }
  };

  window.UIEnhance = UIEnhance;
})();
