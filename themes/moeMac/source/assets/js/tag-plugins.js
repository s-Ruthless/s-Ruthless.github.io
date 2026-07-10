/**
 * moeMac 主题 — 标签外挂前端交互脚本
 * 功能：Tabs 切换、Folding 图标旋转、KaTeX 公式渲染、Mermaid 图表渲染、复制按钮
 *
 * 初始化入口：window.TagPlugins.init()
 * 在 main.js 的 AJAX 导航完成后自动调用
 */
window.TagPlugins = (function () {
  'use strict';

  /* ========== Tabs 标签页切换 ========== */
  function initTabs() {
    document.querySelectorAll('.tabs-container').forEach(function (container) {
      if (container.dataset.initialized) return;
      container.dataset.initialized = 'true';

      var labels = container.querySelectorAll('.tab-label');
      labels.forEach(function (label) {
        label.addEventListener('click', function () {
          var targetId = label.getAttribute('data-tab');
          // 取消所有 active
          container.querySelectorAll('.tab-label').forEach(function (l) { l.classList.remove('active'); });
          container.querySelectorAll('.tab-content').forEach(function (c) { c.classList.remove('active'); });
          // 激活当前
          label.classList.add('active');
          var target = container.querySelector('#' + CSS.escape(targetId));
          if (target) target.classList.add('active');
        });
      });
    });
  }

  /* ========== Folding 折叠面板图标 ========== */
  function initFolding() {
    document.querySelectorAll('.folding-panel, .hide-toggle-panel').forEach(function (panel) {
      if (panel.dataset.initialized) return;
      panel.dataset.initialized = 'true';
      panel.addEventListener('toggle', function () {
        var icon = panel.querySelector('.folding-icon');
        if (icon) {
          if (panel.open) icon.style.transform = 'rotate(90deg)';
          else icon.style.transform = 'rotate(0deg)';
        }
      });
    });
  }

  /* ========== KaTeX 数学公式渲染 ========== */
  function initKatex() {
    if (typeof katex === 'undefined') {
      // KaTeX 库尚未加载，等待后重试
      setTimeout(initKatex, 200);
      return;
    }

    // 渲染行内公式 <span class="math-inline">公式</span>
    document.querySelectorAll('.math-inline:not([data-katex-rendered])').forEach(function (el) {
      try {
        var formula = el.textContent;
        katex.render(formula, el, { displayMode: false, throwOnError: false });
        el.setAttribute('data-katex-rendered', 'true');
      } catch (e) {
        console.warn('[KaTeX] inline render error:', e, el.textContent);
      }
    });

    // 渲染块级公式 <div class="math-block">公式</div>
    document.querySelectorAll('.math-block:not([data-katex-rendered])').forEach(function (el) {
      try {
        var formula = el.textContent;
        katex.render(formula, el, { displayMode: true, throwOnError: false });
        el.setAttribute('data-katex-rendered', 'true');
      } catch (e) {
        console.warn('[KaTeX] block render error:', e, el.textContent);
      }
    });
  }

  /* ========== Mermaid 图表渲染 ========== */
  var mermaidLoaded = false;
  function initMermaid() {
    var mermaidDivs = document.querySelectorAll('.mermaid:not([data-processed])');
    if (mermaidDivs.length === 0) return;

    if (typeof mermaid === 'undefined') {
      if (mermaidLoaded) return; // 脚本加载中，等 onload 回调会处理
      mermaidLoaded = true;
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js';
      script.onload = function () {
        try {
          mermaid.initialize({
            startOnLoad: false,
            theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'default',
            securityLevel: 'loose'
          });
          mermaid.run();
        } catch (e) {
          console.warn('[Mermaid] init error:', e);
        }
      };
      document.head.appendChild(script);
    } else {
      try {
        mermaid.run();
      } catch (e) {
        console.warn('[Mermaid] run error:', e);
      }
    }
  }

  /* ========== copy-inline 点击复制 ========== */
  function initCopyInline() {
    document.querySelectorAll('.copy-inline-btn').forEach(function (btn) {
      if (btn.dataset.initialized) return;
      btn.dataset.initialized = 'true';
      btn.addEventListener('click', function () {
        var text = btn.parentElement.getAttribute('data-text');
        if (navigator.clipboard && text) {
          navigator.clipboard.writeText(text).then(function () {
            btn.classList.add('copied');
            setTimeout(function () { btn.classList.remove('copied'); }, 1500);
          });
        }
      });
    });
  }

  /* ========== 初始化全部 ========== */
  function init() {
    initTabs();
    initFolding();
    initCopyInline();
    // KaTeX 和 Mermaid 延迟加载（库文件较大）
    setTimeout(initKatex, 100);
    setTimeout(initMermaid, 200);
  }

  // 首次加载
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { init: init };
})();
