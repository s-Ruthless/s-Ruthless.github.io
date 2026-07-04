/**
 * moeMac CORS Proxy - Cloudflare Worker
 * 
 * 部署步骤：
 * 1. 登录 https://dash.cloudflare.com/
 * 2. 左侧菜单 -> Workers & Pages -> Create Application -> Create Worker
 * 3. 把这段代码粘贴进去，保存并部署
 * 4. 复制你的 Worker URL（如 https://moe-cors.your-name.workers.dev）
 * 5. 填入 _config.yml 的 cors_proxy 配置
 * 
 * 免费额度：每天 10 万次请求，完全够用
 */

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const target = url.searchParams.get('url');
    
    if (!target) {
      return new Response('Missing url parameter', { status: 400 });
    }

    // 只允许代理网易云音乐 API
    if (!target.startsWith('https://music.163.com/')) {
      return new Response('Only music.163.com allowed', { status: 403 });
    }

    try {
      const resp = await fetch(target, {
        headers: {
          'Referer': 'https://music.163.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const body = await resp.text();
      
      return new Response(body, {
        status: resp.status,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
};