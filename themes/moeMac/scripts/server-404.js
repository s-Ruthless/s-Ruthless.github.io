/**
 * 404 本地服务器支持
 *
 * Hexo 本地开发服务器 (hexo server) 默认不处理 404 页面，
 * 访问不存在的路径只会显示 "Cannot GET /xxx"。
 * 此脚本注册一个 catch-all 中间件，在所有路由之后执行，
 * 当请求未匹配任何静态文件时返回 404.html。
 *
 * GitHub Pages 会自动识别 404.html，线上无需此脚本。
 *
 * 使用 priority 参数确保此中间件在 Hexo 静态文件服务之后注册（数字越大越晚执行）。
 */
hexo.extend.filter.register('server_middleware', function(app) {
  var fs = require('fs');
  var path = require('path');

  // catch-all：在所有路由之后执行，仅处理未匹配的请求
  app.use(function(req, res, next) {
    // 跳过静态资源（让 Express 正常返回 404）
    if (/\.(js|css|png|jpg|jpeg|gif|svg|ico|xml|json|txt|woff|woff2|ttf|eot|map|webp|avif)$/.test(req.url)) {
      return next();
    }

    var fourOhFour = path.resolve(hexo.base_dir, hexo.public_dir, '404.html');
    if (fs.existsSync(fourOhFour)) {
      res.status(404).sendFile(fourOhFour);
    } else {
      next();
    }
  });
}, 100);
