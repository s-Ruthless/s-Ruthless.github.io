/**
 * 404 重定向中间件
 * Hexo 本地开发服务器 (hexo server) 默认不处理 404，
 * 此脚本拦截所有未匹配路由，返回 public/404.html。
 * GitHub Pages 会自动识别 404.html，无需此脚本。
 */
hexo.extend.filter.register('server_middleware', function(app) {
  var fs = require('fs');
  var path = require('path');

  app.use(function(req, res, next) {
    // 跳过静态资源文件
    if (/\.(js|css|png|jpg|jpeg|gif|svg|ico|xml|json|txt|woff|woff2|ttf|eot|map|webp|avif)$/.test(req.url)) {
      return next();
    }

    // 保存原始 send 方法
    var originalSend = res.send;

    // 覆盖 send：当状态码为 404 时返回 404.html 内容
    res.send = function(body) {
      if (res.statusCode === 404) {
        var fourOhFour = path.join(hexo.public_dir, '404.html');
        if (fs.existsSync(fourOhFour)) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          return originalSend.call(res, fs.readFileSync(fourOhFour, 'utf8'));
        }
      }
      return originalSend.apply(res, arguments);
    };

    next();
  });
});
