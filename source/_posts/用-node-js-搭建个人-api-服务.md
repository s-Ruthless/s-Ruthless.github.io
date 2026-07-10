---
title: "用 Node.js 搭建个人 API 服务"
date: 2026-06-28 12:00:00
tags:
  - Node-js
  - 后端
  - API
categories:
  - 技术
---

用 Node.js 从零搭建一个个人 API 服务，包括路由、中间件、数据库连接、JWT 认证和部署上线。

## 技术选型

{% note info %}
**轻量方案**：Express + SQLite + JWT
**生产方案**：Fastify + PostgreSQL + JWT + Redis 缓存
{% endnote %}

{% tabs node-frameworks, 1 %}

{% tab Express %}
最经典的 Node.js 框架，生态丰富：

```javascript
const express = require('express');
const app = express();

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(3000);
```

**优点**：生态最大、教程最多
**缺点**：性能一般、中间件机制老旧
{% endtab %}

{% tab Fastify %}
高性能框架，内置 JSON Schema 验证：

```javascript
const fastify = require('fastify')({ logger: true });

fastify.get('/api/health', async (req, reply) => {
  return { status: 'ok' };
});

fastify.listen({ port: 3000 });
```

**优点**：性能极高、内置验证、TypeScript 支持好
**缺点**：生态不如 Express 丰富
{% endtab %}

{% tab Hono %}
边缘计算框架，适配 Cloudflare Workers/Deno/Bun：

```javascript
import { Hono } from 'hono';
const app = new Hono();

app.get('/api/health', (c) => c.json({ status: 'ok' }));

export default app;
```

**优点**：超轻量、多运行时
**缺点**：生态较新
{% endtab %}

{% endtabs %}

## 项目结构

```
my-api/
├── src/
│   ├── routes/          # 路由
│   │   ├── auth.js
│   │   └── posts.js
│   ├── middleware/      # 中间件
│   │   ├── auth.js
│   │   └── error.js
│   ├── models/          # 数据模型
│   │   └── User.js
│   ├── config/          # 配置
│   │   └── database.js
│   └── app.js           # 入口
├── .env
├── package.json
└── README.md
```

## 核心实现

### 入口文件

```javascript
// src/app.js
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const errorHandler = require('./middleware/error');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// 错误处理（必须放最后）
app.use(errorHandler);

module.exports = app;
```

### JWT 认证中间件

```javascript
// src/middleware/auth.js
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }

  const token = header.split(' ')[1];
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: '令牌无效或已过期' });
  }
}

module.exports = authMiddleware;
```

### 路由示例

```javascript
// src/routes/posts.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// 获取文章列表
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const posts = await Post.findAll({ offset, limit });
    res.json({ data: posts, page, limit });
  } catch (err) {
    next(err);
  }
});

// 创建文章（需要认证）
router.post('/', auth, async (req, res, next) => {
  try {
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: '标题和内容不能为空' });
    }
    
    const post = await Post.create({
      title,
      content,
      userId: req.user.id
    });
    
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
```

## 数据库操作

{% tabs database, 1 %}

{% tab SQLite %}
轻量级，零配置，适合个人项目：

```javascript
const Database = require('better-sqlite3');
const db = new Database('data.db');

// 创建表
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 查询
const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

// 插入
const result = db.prepare(
  'INSERT INTO users (email, password, name) VALUES (?, ?, ?)'
).run(email, hash, name);
```
{% endtab %}

{% tab PostgreSQL %}
生产级数据库，功能强大：

```javascript
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// 查询
const { rows } = await pool.query(
  'SELECT * FROM users WHERE email = $1', [email]
);

// 插入
const { rows: [newUser] } = await pool.query(
  'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING *',
  [email, hash, name]
);
```
{% endtab %}

{% tab ORM (Prisma) %}
类型安全的 ORM，开发体验好：

```javascript
// schema.prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
}

// 使用
const user = await prisma.user.findUnique({
  where: { email }
});

const newUser = await prisma.user.create({
  data: { email, password: hash, name }
});
```
{% endtab %}

{% endtabs %}

## 错误处理

```javascript
// src/middleware/error.js
function errorHandler(err, req, res, next) {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: '参数验证失败', 
      details: err.details 
    });
  }

  if (err.code === '23505') { // PostgreSQL 唯一约束冲突
    return res.status(409).json({ 
      error: '资源已存在' 
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      error: '认证失败' 
    });
  }

  res.status(500).json({ 
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
}

module.exports = errorHandler;
```

{% note danger %}
**生产环境不要**把错误堆栈暴露给客户端！只在 development 模式返回详细信息。
{% endnote %}

## 部署

### PM2 进程管理

```bash
# 安装
npm i -g pm2

# 启动
pm2 start src/app.js --name my-api

# 常用命令
pm2 list          # 查看进程
pm2 logs my-api   # 查看日志
pm2 restart my-api # 重启
pm2 stop my-api    # 停止
pm2 monit          # 监控面板

# 开机自启
pm2 startup
pm2 save
```

### Docker 部署

{% folding green Dockerfile + docker-compose %}
```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["node", "src/app.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/mydb
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: mydb
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
```
{% endfolding %}

## API 文档

{% hideToggle 使用 Swagger 自动生成文档 %}
```javascript
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'My API', version: '1.0.0' },
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));
```

在路由中添加文档注释：
```javascript
/**
 * @openapi
 * /api/posts:
 *   get:
 *     summary: 获取文章列表
 *     parameters:
 *       - name: page
 *         in: query
 *         schema: { type: integer, default: 1 }
 *     responses:
 *       200:
 *         description: 成功
 */
router.get('/', ...);
```
{% endhideToggle %}

## 总结

{% note success %}
**搭建个人 API 服务清单**：
1. **选框架**：Express 上手快，Fastify 性能好，Hono 适配边缘
2. **选数据库**：个人项目 SQLite 够用，生产用 PostgreSQL
3. **认证**：JWT 简单可靠，配合 refresh token 更安全
4. **错误处理**：统一中间件，开发环境看详情，生产环境隐藏
5. **部署**：PM2 简单，Docker 标准化，Cloudflare Workers 全球加速
6. **文档**：Swagger/OpenAPI 自动生成
{% endnote %}

{% btn https://expressjs.com/, Express 官方文档, fa-book %}
