---
title: JavaScript 异步编程进阶
date: 2023-02-14 09:10:00
categories:
  - 技术
tags:
  - JavaScript
  - 前端
---

从回调地狱到 async/await，JavaScript 的异步编程经历了漫长的演进。

本文梳理 Promise 链式调用、错误处理、并发控制等进阶技巧。

## 从回调地狱说起

早期的异步编程依赖回调函数，多层嵌套后形成"回调地狱"：

```javascript
// 典型的回调地狱
getUser(userId, function (err, user) {
  getOrders(user.id, function (err, orders) {
    getOrderDetail(orders[0].id, function (err, detail) {
      getProductInfo(detail.productId, function (err, product) {
        console.log(product);
      });
    });
  });
});
```

{% note danger %}
回调地狱的三大问题：**难以阅读**、**难以维护**、**错误处理分散**。
{% endnote %}

## Promise 链式调用

Promise 通过 `.then()` 链式调用解决了嵌套问题：

```javascript
getUser(userId)
  .then(user => getOrders(user.id))
  .then(orders => getOrderDetail(orders[0].id))
  .then(detail => getProductInfo(detail.productId))
  .then(product => console.log(product))
  .catch(err => console.error('出错:', err));
```

### 错误处理

{% note warning %}
`.catch()` 会捕获前面所有 `.then()` 中的错误。但如果在 `.catch()` 后面再链 `.then()`，错误已被处理，后续代码仍会执行。
{% endnote %}

## async/await

`async/await` 是 Promise 的语法糖，让异步代码看起来像同步代码：

```javascript
async function getProduct(userId) {
  try {
    const user = await getUser(userId);
    const orders = await getOrders(user.id);
    const detail = await getOrderDetail(orders[0].id);
    const product = await getProductInfo(detail.productId);
    return product;
  } catch (err) {
    console.error('出错:', err);
  }
}
```

{% tabs 异步演进, 3 %}

{% tab 回调时代 %}
最原始的异步方案，通过传入回调函数处理结果：

```javascript
fs.readFile('a.txt', 'utf8', (err, data) => {
  if (err) return console.error(err);
  console.log(data);
});
```

**优点**：兼容性最好
**缺点**：嵌套深、错误处理分散
{% endtab %}

{% tab Promise 时代 %}
用 `.then()` 链和 `.catch()` 统一处理：

```javascript
fs.promises.readFile('a.txt', 'utf8')
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

**优点**：链式调用、统一错误处理
**缺点**：仍然不够直观
{% endtab %}

{% tab async/await 时代 %}
用同步写法处理异步逻辑：

```javascript
async function read() {
  try {
    const data = await fs.promises.readFile('a.txt', 'utf8');
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}
```

**优点**：可读性最佳、错误处理直观
**缺点**：需注意事件循环特性
{% endtab %}

{% endtabs %}

## 并发控制

### Promise.all — 全部成功才成功

```javascript
const [user, config] = await Promise.all([
  fetchUser(),
  fetchConfig()
]);
```

{% note info %}
`Promise.all` 是"全有或全无"——任意一个失败，整个 `Promise.all` 就会 reject。
{% endnote %}

### Promise.allSettled — 等待全部完成

```javascript
const results = await Promise.allSettled([
  fetchUser(),
  fetchConfig(),
  fetchTheme()
]);

results.forEach(r => {
  if (r.status === 'fulfilled') {
    console.log('成功:', r.value);
  } else {
    console.log('失败:', r.reason);
  }
});
```

{% folding blue 对比 Promise.all 和 Promise.allSettled %}

| 方法 | 全部成功 | 部分失败 | 适用场景 |
|------|---------|---------|---------|
| `Promise.all` | 返回所有结果 | 整体 reject | 全部必须成功 |
| `Promise.allSettled` | 返回所有结果 | 返回每个状态 | 尽力而为 |
| `Promise.race` | 第一个完成 | 第一个失败 | 超时控制 |
| `Promise.any` | 第一个成功 | 全部失败才 reject | 最快可用 |

{% endfolding %}

### 并发限制

当需要批量请求但不想同时发起太多时，可以用并发池：

{% hideToggle 点击查看并发池实现 %}
```javascript
async function asyncPool(poolLimit, items, iteratorFn) {
  const ret = [];        // 存储所有 Promise
  const executing = [];  // 正在执行的 Promise

  for (const item of items) {
    const p = Promise.resolve().then(() => iteratorFn(item));
    ret.push(p);

    if (poolLimit <= items.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= poolLimit) {
        await Promise.race(executing);
      }
    }
  }

  return Promise.all(ret);
}

// 使用：最多同时 3 个请求
asyncPool(3, urls, url => fetch(url).then(r => r.json()));
```
{% endhideToggle %}

## 关键知识点总结

{% note success %}
1. **回调地狱** → Promise 链 → async/await，可读性逐步提升
2. **错误处理**：async/await 用 try/catch，Promise 用 .catch()
3. **并发控制**：Promise.all / allSettled / race / any 各有场景
4. **并发限制**：手动实现 async pool 或使用第三方库
{% endnote %}

## 练习题

{% hideBlock 点击查看答案 %}
```javascript
// 实现 delay 函数
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 实现 retry 函数
async function retry(fn, times = 3) {
  for (let i = 0; i < times; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === times - 1) throw e;
      await delay(1000 * (i + 1)); // 指数退避
    }
  }
}
```
{% endhideBlock %}
