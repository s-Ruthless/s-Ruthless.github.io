if (typeof navigator.serviceWorker !== 'undefined') {
    navigator.serviceWorker.register('sw.js')
  }


window.$docsify = {
    coverpage: true,
    basePath: "/#/",
    subMaxLevel: 999,
    themeColor: "#42b983",
    alias: {
        "/.*/_sidebar.md": "/_sidebar.md",
    },
    name: '<img src="/img/avatar.webp" height=100px no-zoom >',
    nameLink: "/#/README.md",
    loadSidebar: true,
    autoHeader: true,
    auto2top: true,
    repo: 's-Ruthless',
    search: {
        paths: "auto",
        placeholder: "输入关键字，快速寻找答案 🔍",
        noData: "No Results! 😞",
        depth: 6,
    },
    copyCode: {
        buttonText: "点击复制",
        errorText: "错误",
        successText: "成功",
    },
    darklightTheme: {
        siteFont: "PT Sans",
        defaultTheme: "light",
        codeFontFamily: "Roboto Mono, Monaco, courier, monospace",
        dark: {
            accent: "#42b983",
        },
        light: {
            accent: "#42b983",
            sidebarSublink: "#505d6b",
        },
    },
    tabs: {
    persist    : true,
    sync       : true,
    theme      : 'classic',
    tabComments: true,
    tabHeadings: true
  }
};