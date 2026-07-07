/**
 * 404 本地服务器支持
 *
 * Hexo 本地开发服务器 (hexo server) 使用 Connect 框架（非 Express），
 * 默认不处理 404 页面，访问不存在的路径只会显示 "Cannot GET /xxx"。
 *
 * 此脚本注册一个 catch-all 中间件（priority=100，在 route 和 static 之后执行），
 * 当请求未匹配任何路由或静态文件时，返回 404.html 内容。
 *
 * GitHub Pages 会自动识别 404.html，线上无需此脚本。
 */
hexo.extend.filter.register('server_middleware', function(app) {
  var fs = require('fs');
  var path = require('path');

  app.use(function(req, res, next) {
    // 跳过静态资源文件
    if (/\.(js|css|png|jpg|jpeg|gif|svg|ico|xml|json|txt|woff|woff2|ttf|eot|map|webp|avif)$/.test(req.url)) {
      return next();
    }

    var fourOhFour = path.resolve(hexo.base_dir, hexo.public_dir, '404.html');
    if (fs.existsSync(fourOhFour)) {
      var html = fs.readFileSync(fourOhFour, 'utf8');
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } else {
      next();
    }
  });
}, 100);
