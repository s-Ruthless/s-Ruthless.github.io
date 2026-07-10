/**
 * moeMac 主题 — 容器块（Custom Blocks）支持
 * 将 ::: type [title] ... ::: 语法转换为 {% note %}...{% endnote %}
 */

'use strict';

hexo.extend.filter.register('before_post_render', function (data) {
  if (!data.content) return data;

  // 统一换行符为 LF
  var content = data.content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  var lines = content.split('\n');
  var inCodeBlock = false;
  var codeFenceChar = '';
  var codeFenceLen = 0;
  var result = [];

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];

    if (!inCodeBlock) {
      var openMatch = line.match(/^(`{3,}|~{3,})/);
      if (openMatch) {
        inCodeBlock = true;
        codeFenceChar = openMatch[1][0];
        codeFenceLen = openMatch[1].length;
        result.push(line);
        continue;
      }

      var m = line.match(/^:::[ \t]*(\S+)?(?:[ \t]+([^\n]*?))?[ \t]*$/);
      if (m) {
        if (!m[1]) {
          result.push('{% endnote %}');
        } else if (m[2] && m[2].trim()) {
          result.push('{% note ' + m[1] + ' ' + m[2].trim() + ' %}');
        } else {
          result.push('{% note ' + m[1] + ' %}');
        }
      } else {
        result.push(line);
      }
    } else {
      var closeMatch = line.match(new RegExp('^(' + codeFenceChar + '{' + codeFenceLen + ',})[ \\t]*$'));
      if (closeMatch) {
        inCodeBlock = false;
        codeFenceChar = '';
        codeFenceLen = 0;
      }
      result.push(line);
    }
  }

  data.content = result.join('\n');
  return data;
}, 5);
