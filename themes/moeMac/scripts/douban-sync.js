/**
 * 豆瓣书影音同步脚本
 *
 * 用法：
 *   npx hexo douban              # 抓取全部（书 + 影 + 音）
 *   npx hexo douban --books      # 只抓书
 *   npx hexo douban --movies     # 只抓电影
 *   npx hexo douban --music      # 只抓音乐
 *
 * 配置（themes/moeMac/_config.yml）：
 *   douban:
 *     user_id: "your-douban-id"   # 豆瓣个人主页 URL 中的 ID
 *     cookie: ""                   # 可选：登录 cookie，用于访问受限页面
 *
 * 数据保存到 source/_data/douban.json，page-douban.ejs 自动读取。
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';

/**
 * 解决豆瓣安全验证的 SHA-512 工作量证明挑战
 */
function solveSecChallenge(cha, difficulty) {
  difficulty = difficulty || 4;
  var target = Array(difficulty + 1).join('0');
  var nonce = 0;
  var hash;
  do {
    nonce++;
    hash = crypto.createHash('sha512').update(cha + nonce, 'utf8').digest('hex');
  } while (hash.substring(0, difficulty) !== target);
  return nonce;
}

function fetchPage(url, cookie) {
  var headers = {
    'User-Agent': UA,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Referer': 'https://www.douban.com/',
  };
  if (cookie) headers['Cookie'] = cookie;

  function doGet(u) {
    return new Promise(function (resolve, reject) {
      var mod = u.startsWith('https') ? require('https') : require('http');
      mod.get(u, { headers: headers }, function (res) {
        if ([301, 302, 303, 307, 308].indexOf(res.statusCode) !== -1 && res.headers.location) {
          var next = res.headers.location;
          if (next.startsWith('/')) next = new URL(u).origin + next;
          res.resume();
          return doGet(next).then(resolve, reject);
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error('HTTP ' + res.statusCode + ' for ' + u));
        }
        var chunks = [];
        res.on('data', function (c) { chunks.push(c); });
        res.on('end', function () {
          resolve(Buffer.concat(chunks).toString('utf-8'));
        });
      }).on('error', reject);
    });
  }

  return doGet(url).then(function (html) {
    // 豆瓣电影页面有安全验证（SHA-512 工作量证明）
    if (html.indexOf('name="sec"') > -1 || html.indexOf('sha512') > -1) {
      var tokMatch = html.match(/name="tok"[^>]*value="([^"]+)"/);
      var chaMatch = html.match(/name="cha"[^>]*value="([^"]+)"/);
      var redMatch = html.match(/name="red"[^>]*value="([^"]+)"/);
      if (tokMatch && chaMatch) {
        var sol = solveSecChallenge(chaMatch[1], 4);
        var postBody = 'tok=' + encodeURIComponent(tokMatch[1]) + '&cha=' + encodeURIComponent(chaMatch[1]) + '&sol=' + sol + '&red=' + encodeURIComponent(redMatch ? redMatch[1] : url);
        return new Promise(function (resolve, reject) {
          var postReq = require('https').request('https://sec.douban.com/c', {
            method: 'POST',
            headers: {
              'User-Agent': UA,
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
              'Referer': url,
              'Content-Type': 'application/x-www-form-urlencoded',
              'Content-Length': Buffer.byteLength(postBody),
            },
          }, function (res) {
            var setCookies = res.headers['set-cookie'];
            if (setCookies) {
              headers['Cookie'] = setCookies.map(function (c) { return c.split(';')[0]; }).join('; ');
            }
            if ([301, 302, 303, 307, 308].indexOf(res.statusCode) !== -1 && res.headers.location) {
              var next = res.headers.location;
              if (next.startsWith('/')) next = 'https://sec.douban.com' + next;
              res.resume();
              return doGet(next).then(resolve, reject);
            }
            var chunks = [];
            res.on('data', function (c) { chunks.push(c); });
            res.on('end', function () { resolve(Buffer.concat(chunks).toString('utf-8')); });
          });
          postReq.on('error', reject);
          postReq.write(postBody);
          postReq.end();
        });
      }
    }
    return html;
  });
}

/**
 * 下载封面图到本地（豆瓣有防盗链，必须带 Referer 才能下载）
 * 返回本地相对路径，如 /images/douban/books/s5961934.jpg
 */
function downloadCover(imgUrl, type, baseDir) {
  return new Promise(function (resolve) {
    if (!imgUrl) return resolve('');

    // 从 URL 提取文件名: .../s5961934.jpg -> s5961934.jpg
    var fname = imgUrl.split('/').pop();
    // 去掉尺寸前缀 (s_, m_, l_) 统一用原始 ID
    fname = fname.replace(/^[sml]_/, '');
    var relPath = '/images/douban/' + type + '/' + fname;
    var absPath = path.join(baseDir, 'source' + relPath);

    // 已存在则跳过
    if (fs.existsSync(absPath)) {
      return resolve(relPath);
    }

    var dir = path.dirname(absPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    var mod = imgUrl.startsWith('https') ? require('https') : require('http');
    mod.get(imgUrl, {
      headers: {
        'User-Agent': UA,
        'Referer': 'https://www.douban.com/',
        'Accept': 'image/*,*/*',
      }
    }, function (res) {
      if (res.statusCode !== 200) {
        res.resume();
        console.error('    ✗ 封面下载失败: HTTP ' + res.statusCode + ' ' + fname);
        return resolve('');
      }
      var chunks = [];
      res.on('data', function (c) { chunks.push(c); });
      res.on('end', function () {
        fs.writeFileSync(absPath, Buffer.concat(chunks));
        resolve(relPath);
      });
    }).on('error', function (e) {
      console.error('    ✗ 封面下载出错: ' + e.message + ' ' + fname);
      resolve('');
    });
  });
}

/**
 * 从条目块中提取字段（标题/封面/评分/日期/笔记/链接）
 */
function extractItem(block) {
  if (block.indexOf('subject') === -1 && block.indexOf('nbg') === -1) return null;

  // 标题提取优先级：
  // 1. <em>标签（电影有，格式如 "复仇者联盟4：终局之战 / Avengers: Endgame"）
  // 2. title="" 属性（书籍有，是中文名；电影图片的 title 是英文名）
  // 3. <a>标签内文本
  // 对于 <em> 格式 "中文名 / English Name"，取第一部分（中文名）
  var emMatch = block.match(/<em>([\s\S]*?)<\/em>/i);
  var titleAttrMatch = block.match(/title="([^"]+)"/);
  var linkTextMatch = block.match(/<a[^>]*href="[^"]*subject[^"]*"[^>]*>([\s\S]*?)<\/a>/i);

  var fullName = '';
  var title = '';

  if (emMatch) {
    // <em>复仇者联盟4：终局之战 / Avengers: Endgame</em>
    fullName = emMatch[1].replace(/<[^>]*>/g, '').trim();
    // 取第一个 / 之前的部分作为中文名
    var parts = fullName.split(/\s*\/\s*/);
    title = parts[0].trim();
  } else if (titleAttrMatch) {
    // title="流浪地球" 或 title="Avengers: Endgame"
    title = titleAttrMatch[1].replace(/<[^>]*>/g, '').trim();
    fullName = title;
  } else if (linkTextMatch) {
    // 从链接文本提取
    title = linkTextMatch[1].replace(/<[^>]*>/g, '').trim();
    // 清理多余空白
    title = title.split(/\n/)[0].trim();
    fullName = title;
  }

  if (!title) return null;

  // 原始名（英文名）：不保存，只保留中文名

  // 条目链接（用于提取 subject ID）
  var linkMatch = block.match(/href="(https?:\/\/(?:book|movie|music)\.douban\.com\/subject\/(\d+)\/)"/i);
  var link = linkMatch ? linkMatch[1] : '';
  var subjectId = linkMatch ? linkMatch[2] : '';

  // 封面图：优先 src，其次 data-src（懒加载）
  var coverMatch = block.match(/<img[^>]*\ssrc="(https?:[^"]+)"[^>]*>/i)
    || block.match(/<img[^>]*\sdata-src="(https?:[^"]+)"[^>]*>/i)
    || block.match(/<img[^>]*\ssrc="(\/\/[^"]+)"[^>]*>/i);
  var cover = coverMatch ? coverMatch[1] : '';
  if (cover && cover.indexOf('//') === 0) cover = 'https:' + cover;
  if (cover) {
    cover = cover
      .replace(/\/view\/subject\/[msl]\//, '/view/subject/l/')
      .replace(/\/view\/photo\/[msl]_/, '/view/photo/l_')
      .replace(/_s\./, '_m.')
      .replace(/_s_ratio_poster/, '_l_ratio_poster');
  }

  // 评分（个人评分）
  // 旧格式: rating5-t, rating3-t (1-5 星 → ×2 转为 10 分制)
  // 新格式: allstar50, allstar35 等 (直接是 10 分制)
  var ratingMatch = block.match(/rating(\d)-t/);
  var allstarMatch = block.match(/allstar(\d{2})/);
  var rating = 0;
  if (ratingMatch) {
    rating = parseInt(ratingMatch[1], 10) * 2;
  } else if (allstarMatch) {
    rating = parseInt(allstarMatch[1], 10);
  }

  // 日期
  var dateMatch = block.match(/<span\s+class="date">([\s\S]*?)<\/span>/i);
  var dateStr = dateMatch ? dateMatch[1].replace(/<[^>]*>/g, '').trim() : '';
  var dateClean = dateStr.match(/(\d{4}[-/.]\d{1,2}[-/.]\d{1,2})/);
  dateStr = dateClean ? dateClean[1] : dateStr;

  // 笔记/评论
  var noteMatch = block.match(/<p\s+class="comment[^"]*"[^>]*>([\s\S]*?)<\/p>/i)
    || block.match(/<span\s+class="comment">([\s\S]*?)<\/span>/i);
  var note = noteMatch ? noteMatch[1].replace(/<[^>]*>/g, '').trim() : '';

  // 作者/出版社/年份等信息
  // 书籍: <div class="pub">刘慈欣 / 长江文艺出版社 / 2008-11</div>
  // 电影收藏页: <li class="intro">2022 / 中国大陆 / 喜剧 科幻</li>
  var infoMatch = block.match(/<div\s+class="pub"[^>]*>([\s\S]*?)<\/div>/i)
    || block.match(/<li\s+class="intro"[^>]*>([\s\S]*?)<\/li>/i)
    || block.match(/<p\s+class="pl"[^>]*>([\s\S]*?)<\/p>/i)
    || block.match(/<span\s+class="pl"[^>]*>([\s\S]*?)<\/span>/i);
  var info = infoMatch ? infoMatch[1].replace(/<[^>]*>/g, '').trim() : '';
  // 清理 info：去掉价格、提取电影类型
  if (info) {
    var infoParts = info.split(/\s*\/\s*/);
    // 已知电影类型关键词
    var GENRES = ['剧情','喜剧','动作','爱情','科幻','悬疑','惊悚','恐怖','犯罪','同性',
      '音乐','歌舞','传记','历史','战争','西部','奇幻','冒险','灾难','武侠','情色',
      '家庭','儿童','纪录','短片','戏曲','黑色电影','古装','运动','动画','谈话'];
    var genreParts = infoParts.filter(function(p) {
      return GENRES.indexOf(p.trim()) > -1;
    });
    if (genreParts.length > 0) {
      // 电影：只保留类型
      info = genreParts.join(' / ');
    } else {
      // 书籍：去掉价格部分（如 28.00元、CNY 79.80、￥35、纯数字价格）
      infoParts = infoParts.filter(function(p) {
        return !/[\d.]+元/.test(p) && !/^CNY\s/i.test(p) && !/^￥/.test(p) && !/^\d+(\.\d+)?$/.test(p.trim());
      });
      info = infoParts.join(' / ');
    }
  }

  return { name: title, original_name: '', cover: cover, cover_local: '', id: subjectId, link: link, rating: rating, date: dateStr, note: note, info: info };
}

/**
 * 解析豆瓣收藏页 HTML，提取条目列表
 * 适配豆瓣新版页面结构：
 *   书籍: <li class="subject-item"> 含 pic / info / short-note
 *   电影: <div class="item comment-item"> 含 pic / info
 *   音乐: 结构同电影
 */
function parseItems(html) {
  var items = [];

  // 检查是否需要登录
  if (html.indexOf('form-login') !== -1) {
    console.error('  ✗ 需要登录，请在配置中填写 cookie');
    return items;
  }

  // 模式 1：书籍页 <li class="subject-item">
  var bookBlocks = html.split(/<li\s+class="subject-item"/);
  if (bookBlocks.length > 1) {
    for (var i = 1; i < bookBlocks.length; i++) {
      var item = extractItem(bookBlocks[i].substring(0, 3000));
      if (item) items.push(item);
    }
    return items;
  }

  // 模式 2：电影/音乐页 <div class="item ...">（在 grid-view 内）
  var gridStart = html.indexOf('class="grid-view"');
  var searchHtml = gridStart > -1 ? html.substring(gridStart) : html;
  var movieBlocks = searchHtml.split(/<div\s+class="item(?:\s+[^"]*)?"/);
  if (movieBlocks.length > 1) {
    for (var j = 1; j < movieBlocks.length; j++) {
      var item = extractItem(movieBlocks[j].substring(0, 3000));
      if (item) items.push(item);
    }
  }

  return items;
}

/**
 * 抓取某个分类的全部收藏（自动翻页），并下载封面图到本地
 */
async function fetchCategory(baseUrl, userId, type, cookie, baseDir) {
  var allItems = [];
  var perPage = type === 'movies' ? 30 : 15;
  var maxPages = 15;
  var seenNames = {};
  var typeShort = type.replace(/s$/, ''); // books->book, movies->movie, music->music

  for (var page = 0; page < maxPages; page++) {
    var start = page * perPage;
    var url = baseUrl + '/people/' + userId + '/collect?start=' + start + '&sort=time&rating=all&filter=all&mode=grid';
    console.log('  [page ' + (page + 1) + '] ' + url);

    var html;
    try {
      html = await fetchPage(url, cookie);
    } catch (e) {
      console.error('  ✗ 请求失败: ' + e.message);
      break;
    }

    var items = parseItems(html);
    if (items.length === 0) {
      console.log('  ✓ 无更多数据，共 ' + allItems.length + ' 条');
      break;
    }

    // 去重（按名称）
    var newCount = 0;
    for (var k = 0; k < items.length; k++) {
      if (!seenNames[items[k].name]) {
        seenNames[items[k].name] = true;
        allItems.push(items[k]);
        newCount++;
      }
    }

    console.log('  ✓ 获取 ' + items.length + ' 条' + (newCount < items.length ? '（' + (items.length - newCount) + ' 条重复已跳过）' : '') + '，累计 ' + allItems.length + ' 条');

    if (items.length < perPage || newCount === 0) break;

    // 礼貌延迟，避免被封
    await new Promise(function (r) { setTimeout(r, 2000); });
  }

  // 下载所有封面图到本地（豆瓣有防盗链，必须下载）
  console.log('  📥 下载封面图到本地...');
  for (var i = 0; i < allItems.length; i++) {
    var item = allItems[i];
    if (!item.cover) {
      console.log('    [' + (i + 1) + '/' + allItems.length + '] ' + item.name + ' - 无封面');
      continue;
    }
    var localPath = await downloadCover(item.cover, typeShort, baseDir);
    item.cover_local = localPath;
    if (localPath) {
      console.log('    [' + (i + 1) + '/' + allItems.length + '] ' + item.name + ' ✓');
    } else {
      console.log('    [' + (i + 1) + '/' + allItems.length + '] ' + item.name + ' ✗ 下载失败');
    }
    // 小延迟避免被封
    await new Promise(function (r) { setTimeout(r, 500); });
  }

  return allItems;
}

/**
 * 将已有数据中的评分合并到新抓取的数据中
 * 避免每次同步都重新从条目页抓取评分
 */
function mergeExistingRatings(newItems, oldItems) {
  if (!oldItems || !oldItems.length) return;
  var oldMap = {};
  oldItems.forEach(function (it) {
    if (it.name && it.rating > 0) oldMap[it.name] = it.rating;
  });
  newItems.forEach(function (it) {
    if ((!it.rating || it.rating === 0) && oldMap[it.name]) {
      it.rating = oldMap[it.name];
    }
  });
}

/**
 * 核心同步逻辑（console 命令和 before_generate filter 共用）
 * @param {object} hexo  - Hexo 实例
 * @param {object} opts  - { books, movies, music } 布尔值，全 false/空 则抓取全部
 */
async function runSync(hexo, opts) {
  opts = opts || {};
  var cfg = hexo.theme.config.douban || {};
  var userId = cfg.user_id || '';

  if (!userId) {
    console.log('\n  ⚠ 未配置豆瓣用户 ID');
    console.log('  请在 themes/moeMac/_config.yml 中设置：');
    console.log('    douban:');
    console.log('      user_id: "你的豆瓣ID"');
    console.log('  豆瓣 ID = 个人主页 URL 中的 ID，如 douban.com/people/xxx/ 中的 xxx\n');
    return;
  }

  var cookie = cfg.cookie || '';
  var fetchBooks = opts.books || (!opts.books && !opts.movies && !opts.music);
  var fetchMovies = opts.movies || (!opts.books && !opts.movies && !opts.music);
  var fetchMusic = opts.music || (!opts.books && !opts.movies && !opts.music);

  console.log('\n🔄 开始同步豆瓣收藏 [用户: ' + userId + ']\n');

  var result = {};

  // 读取已有数据（作为回退）
  var dataPath = path.join(hexo.base_dir, 'source/_data/douban.json');
  var existing = {};
  if (fs.existsSync(dataPath)) {
    try { existing = JSON.parse(fs.readFileSync(dataPath, 'utf-8')); } catch (e) {}
  }

  if (fetchBooks) {
    console.log('📚 抓取书籍...');
    try {
      result.books = await fetchCategory('https://book.douban.com', userId, 'books', cookie, hexo.base_dir);
      // 保留已有评分（避免重新抓取评分）
      mergeExistingRatings(result.books, existing.books);
    } catch (e) {
      console.error('  ✗ 书籍抓取失败: ' + e.message);
      result.books = existing.books || [];
    }
    console.log('');
  } else {
    result.books = existing.books || [];
  }

  if (fetchMovies) {
    console.log('🎬 抓取电影...');
    try {
      result.movies = await fetchCategory('https://movie.douban.com', userId, 'movies', cookie, hexo.base_dir);
      mergeExistingRatings(result.movies, existing.movies);
    } catch (e) {
      console.error('  ✗ 电影抓取失败: ' + e.message);
      result.movies = existing.movies || [];
    }
    console.log('');
  } else {
    result.movies = existing.movies || [];
  }

  if (fetchMusic) {
    console.log('🎵 抓取音乐...');
    try {
      result.music = await fetchCategory('https://music.douban.com', userId, 'music', cookie, hexo.base_dir);
      mergeExistingRatings(result.music, existing.music);
    } catch (e) {
      console.error('  ✗ 音乐抓取失败: ' + e.message);
      result.music = existing.music || [];
    }
    console.log('');
  } else {
    result.music = existing.music || [];
  }

  // 补全缺失评分 + 电影类型：从豆瓣条目页抓取
  var allNew = [].concat(result.books || [], result.movies || [], result.music || []);
  // 需要 rating=0 的条目，或电影 info 不含类型的条目
  var GENRES = ['剧情','喜剧','动作','爱情','科幻','悬疑','惊悚','恐怖','犯罪','同性',
    '音乐','歌舞','传记','历史','战争','西部','奇幻','冒险','灾难','武侠','情色',
    '家庭','儿童','纪录','短片','戏曲','黑色电影','古装','运动','动画','谈话'];
  var needFetch = allNew.filter(function (it) {
    if (!it.link) return false;
    if (!it.rating || it.rating === 0) return true;
    // 电影 info 没有类型关键词时也需要抓取
    if (it.link.indexOf('movie.douban.com') > -1 && it.info) {
      return !GENRES.some(function(g) { return it.info.indexOf(g) > -1; });
    }
    return false;
  });
  if (needFetch.length > 0) {
    console.log('⭐ 抓取 ' + needFetch.length + ' 个条目的评分/类型...');
    for (var u = 0; u < needFetch.length; u++) {
      var uItem = needFetch[u];
      try {
        var sHtml = await fetchPage(uItem.link, cookie);
        // 评分
        if (!uItem.rating || uItem.rating === 0) {
          var rMatch = sHtml.match(/property="v:average"[^>]*>\s*([\d.]+)\s*</);
          if (rMatch) uItem.rating = Math.round(parseFloat(rMatch[1]) * 10) / 10;
        }
        // 电影类型
        if (uItem.link.indexOf('movie.douban.com') > -1) {
          var genreMatches = sHtml.match(/property="v:genre">([^<]+)</g);
          if (genreMatches) {
            var genres = genreMatches.map(function(m) {
              return m.replace(/property="v:genre">([^<]+)</, '$1').trim();
            });
            uItem.info = genres.join(' / ');
          }
        }
        console.log('  [' + (u + 1) + '/' + needFetch.length + '] ' + uItem.name + ' ✓ ' + (uItem.rating || '—') + (uItem.info ? ' / ' + uItem.info : ''));
      } catch (e) {
        console.log('  [' + (u + 1) + '/' + needFetch.length + '] ' + uItem.name + ' ✗ ' + e.message);
      }
      await new Promise(function (r) { setTimeout(r, 3000); });
    }
    console.log('');
  }

  // 保存
  var dataDir = path.join(hexo.base_dir, 'source/_data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  result._meta = {
    user_id: userId,
    synced_at: new Date().toISOString(),
    total: {
      books: (result.books || []).length,
      movies: (result.movies || []).length,
      music: (result.music || []).length
    }
  };

  fs.writeFileSync(dataPath, JSON.stringify(result, null, 2), 'utf-8');

  console.log('✅ 同步完成！');
  console.log('   📚 书籍: ' + result._meta.total.books + ' 条');
  console.log('   🎬 电影: ' + result._meta.total.movies + ' 条');
  console.log('   🎵 音乐: ' + result._meta.total.music + ' 条');
  console.log('   📁 保存至: source/_data/douban.json\n');
}

/**
 * 只补全缺失评分和电影类型（不重新抓取收藏列表）
 * 用法：npx hexo douban --ratings
 */
async function fetchMissingRatings(hexo) {
  var cfg = hexo.theme.config.douban || {};
  var cookie = cfg.cookie || '';
  var dataPath = path.join(hexo.base_dir, 'source/_data/douban.json');

  if (!fs.existsSync(dataPath)) {
    console.log('\n  ✗ 找不到 source/_data/douban.json，请先运行 npx hexo douban\n');
    return;
  }

  var data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  var allItems = [].concat(data.books || [], data.movies || [], data.music || []);

  var GENRES = ['剧情','喜剧','动作','爱情','科幻','悬疑','惊悚','恐怖','犯罪','同性',
    '音乐','歌舞','传记','历史','战争','西部','奇幻','冒险','灾难','武侠','情色',
    '家庭','儿童','纪录','短片','戏曲','黑色电影','古装','运动','动画','谈话'];

  var needFetch = allItems.filter(function (it) {
    if (!it.link) return false;
    if (!it.rating || it.rating === 0) return true;
    if (it.link.indexOf('movie.douban.com') > -1 && it.info) {
      return !GENRES.some(function(g) { return it.info.indexOf(g) > -1; });
    }
    return false;
  });

  if (needFetch.length === 0) {
    console.log('\n  ✓ 所有条目都已有评分和类型，无需补全\n');
    return;
  }

  console.log('\n⭐ 共 ' + needFetch.length + ' 个条目需要补全\n');

  for (var i = 0; i < needFetch.length; i++) {
    var item = needFetch[i];
    try {
      var sHtml = await fetchPage(item.link, cookie);
      if (!item.rating || item.rating === 0) {
        var rMatch = sHtml.match(/property="v:average"[^>]*>\s*([\d.]+)\s*</);
        if (rMatch) item.rating = Math.round(parseFloat(rMatch[1]) * 10) / 10;
      }
      if (item.link.indexOf('movie.douban.com') > -1) {
        var genreMatches = sHtml.match(/property="v:genre">([^<]+)</g);
        if (genreMatches) {
          item.info = genreMatches.map(function(m) {
            return m.replace(/property="v:genre">([^<]+)</, '$1').trim();
          }).join(' / ');
        }
      }
      console.log('  [' + (i + 1) + '/' + needFetch.length + '] ' + item.name + ' ✓ ' + (item.rating || '—') + (item.info ? ' / ' + item.info : ''));
    } catch (e) {
      console.log('  [' + (i + 1) + '/' + needFetch.length + '] ' + item.name + ' ✗ ' + e.message);
    }
    await new Promise(function (r) { setTimeout(r, 3000); });
  }

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log('\n✅ 补全完成，已保存到 douban.json\n');
}

/* ========== 手动命令：npx hexo douban ========== */
hexo.extend.console.register('douban', '同步豆瓣书影音收藏到 source/_data/douban.json', {
  options: [
    { name: '--books', desc: '只抓取书籍' },
    { name: '--movies', desc: '只抓取电影' },
    { name: '--music', desc: '只抓取音乐' },
    { name: '--ratings', desc: '只补全缺失评分和电影类型（不重新抓取收藏列表）' },
    { name: '--force', desc: '强制重新抓取（忽略缓存）' }
  ],
}, async function (args) {
  /* 必须先 load 才能拿到 theme.config */
  await this.load();
  if (args.ratings) {
    await fetchMissingRatings(this);
  } else {
    await runSync(this, { books: args.books, movies: args.movies, music: args.music });
  }
  console.log('   运行 hexo clean && hexo generate 重新生成页面');
});

/* ========== 自动同步：hexo generate 时触发（智能跳过） ========== */
hexo.extend.filter.register('before_generate', async function () {
  var cfg = hexo.theme.config.douban || {};

  // 未开启自动同步，或未配置 user_id，直接跳过
  if (!cfg.auto_sync) return;
  if (!cfg.user_id) return;

  // 检查距上次同步的时间间隔（0 = 每次都同步，默认 24h）
  var intervalHours = (cfg.sync_interval_hours != null) ? cfg.sync_interval_hours : 24;
  var dataPath = path.join(hexo.base_dir, 'source/_data/douban.json');

  if (fs.existsSync(dataPath)) {
    try {
      var data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      if (data._meta && data._meta.synced_at) {
        var lastSync = new Date(data._meta.synced_at);
        var elapsedHours = (Date.now() - lastSync.getTime()) / 3600000;
        if (elapsedHours < intervalHours) {
          hexo.log.debug('豆瓣数据上次同步于 ' + lastSync.toISOString() +
            '（不足 ' + intervalHours + 'h），跳过自动同步');
          return;
        }
      }
    } catch (e) { /* 文件损坏，继续同步 */ }
  }

  hexo.log.info('🔄 自动同步豆瓣数据（距上次已超过 ' + intervalHours + ' 小时）...');
  try {
    await runSync(hexo, {});
  } catch (e) {
    hexo.log.error('豆瓣自动同步失败: ' + e.message);
  }
});
