---
title: "Git 工作流最佳实践"
date: 2026-06-05 12:00:00
tags:
  - Git
  - 工具
  - 协作
categories:
  - 技术
---

团队协作中 Git Flow 和 Trunk-Based Development 各有优劣。小团队推荐轻量分支策略：main + feature 分支，PR review 后合并。

## 常见工作流对比

{% tabs git-workflows, 1 %}

{% tab Git Flow %}
最经典的分支模型，包含 5 种分支类型：

- `main` — 生产环境代码
- `develop` — 开发集成分支
- `feature/*` — 功能开发分支
- `release/*` — 发布准备分支
- `hotfix/*` — 紧急修复分支

```bash
# 创建功能分支
git flow feature start user-auth

# 完成功能分支（合并到 develop）
git flow feature finish user-auth

# 发布
git flow release start v1.2.0
git flow release finish v1.2.0
```

**优点**：流程清晰，适合大团队和版本发布产品
**缺点**：分支多、合并频繁，对小团队过重
{% endtab %}

{% tab GitHub Flow %}
GitHub 推广的轻量工作流：

1. 从 `main` 拉取分支
2. 在分支上开发并提交
3. 创建 Pull Request
4. Code Review 后合并到 `main`
5. 删除分支，自动部署

```bash
git checkout -b feature/user-auth
# ... 开发提交 ...
git push origin feature/user-auth
# 在 GitHub 上创建 PR → Review → Merge
```

**优点**：简单、只有一个长期分支 `main`
**缺点**：`main` 既是开发又是生产，需要 CI 保障质量
{% endtab %}

{% tab Trunk-Based %}
主干开发，所有人频繁提交到 `main`：

- `main` 始终可部署
- 功能短分支（存活 < 24h）快速合并
- 用 Feature Flag 控制未完成功能

```bash
git checkout main
git pull
git checkout -b quick-fix
# ... 小改动 ...
git push origin quick-fix
# PR → 快速 Review → Squash Merge
```

**优点**：集成快、冲突少，适合持续部署
**缺点**：需要 Feature Flag 和强大 CI
{% endtab %}

{% endtabs %}

## Commit 规范

{% note info %}
推荐使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```
{% endnote %}

### 类型说明

| 类型 | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(auth): 添加 OAuth 登录` |
| `fix` | 修复 Bug | `fix(api): 修复分页偏移问题` |
| `docs` | 文档变更 | `docs: 更新 README` |
| `style` | 代码格式 | `style: 统一缩进` |
| `refactor` | 重构 | `refactor(utils): 抽取公共函数` |
| `test` | 测试 | `test(auth): 添加登录测试` |
| `chore` | 构建/工具 | `chore: 升级依赖版本` |

### 实用示例

```bash
# 好的 commit
git commit -m "feat(user): 添加头像上传功能

- 支持 JPG/PNG 格式
- 自动压缩到 200KB 以下
- 使用 Cloudflare R2 存储

Closes #123"

# 不好的 commit
git commit -m "update"
```

## 常用技巧

### 修改最近一次 commit

{% folding blue 常用 Git 技巧 %}
```bash
# 修改最近一次 commit 的信息
git commit --amend -m "新的 commit 信息"

# 把新文件加入最近一次 commit
git add new-file.js
git commit --amend --no-edit

# 修改最近 3 次的 commit（交互式 rebase）
git rebase -i HEAD~3
```
{% endfolding %}

### 暂存与恢复

```bash
# 暂存当前修改
git stash
git stash push -m "WIP: 用户认证功能"

# 查看暂存列表
git stash list

# 恢复最近一次暂存（不删除）
git stash apply

# 恢复并删除最近一次暂存
git stash pop

# 恢复指定暂存
git stash pop stash@{2}
```

### 撤销操作

{% hideToggle 点击查看撤销操作 %}
```bash
# 撤销工作区修改（未 add）
git checkout -- file.js

# 撤销暂存（已 add，未 commit）
git reset HEAD file.js

# 撤销最近一次 commit（保留修改）
git reset --soft HEAD~1

# 撤销最近一次 commit（丢弃修改）
git reset --hard HEAD~1

# 安全撤销（生成反向 commit）
git revert HEAD

# 撤销已 push 的 commit
git revert <commit-hash>
git push origin main
```

{% note danger %}
`git reset --hard` 会**永久丢弃**修改，请确保不需要这些代码！
{% endnote %}
{% endhideToggle %}

## 分支管理

### 常用命令

```bash
# 查看所有分支
git branch -a

# 创建并切换分支
git checkout -b feature/new-api

# 切换分支
git checkout main

# 删除本地分支
git branch -d feature/old-api

# 删除远程分支
git push origin --delete feature/old-api

# 重命名分支
git branch -m old-name new-name
```

### 合并策略

{% tabs merge-strategy %}

{% tab Merge %}
保留完整分支历史，生成 merge commit：

```bash
git checkout main
git merge feature/user-auth
```

```
*   merge commit
|\
| * feature commit 2
| * feature commit 1
|/
* main commit
```

**适用**：功能分支历史有意义，想保留
{% endtab %}

{% tab Squash %}
将功能分支所有 commit 压缩为一个：

```bash
git checkout main
git merge --squash feature/user-auth
git commit -m "feat(user): 添加用户认证功能"
```

```
* squashed commit
* main commit
```

**适用**：功能分支 commit 太碎，想保持主干整洁
{% endtab %}

{% tab Rebase %}
变基，把功能 commit 移到 main 最新位置之后：

```bash
git checkout feature/user-auth
git rebase main
git checkout main
git merge feature/user-auth  # fast-forward
```

```
* feature commit 2
* feature commit 1
* main commit
```

**适用**：保持线性历史
{% endtab %}

{% endtabs %}

## .gitignore 最佳实践

```gitignore
# 依赖
node_modules/
.pnpm-store/

# 构建产物
dist/
build/
public/

# 环境变量
.env
.env.local
.env.*.local

# 编辑器
.vscode/
.idea/
*.swp
*.swo

# 系统
.DS_Store
Thumbs.db

# 日志
*.log
npm-debug.log*
```

{% note warning %}
**不要忽略** `package-lock.json` 或 `pnpm-lock.yaml`！锁文件确保团队成员安装相同版本的依赖。
{% endnote %}

## 总结

{% note success %}
**Git 工作流要点**：
1. **小团队**：GitHub Flow 足够简单高效
2. **Commit 规范**：用 Conventional Commits，方便生成 changelog
3. **频繁提交**：小步快跑，每次 commit 做一件事
4. **Code Review**：PR 是质量保障的第一道防线
5. **分支命名**：`feature/` `fix/` `hotfix/` `chore/` 前缀清晰
{% endnote %}

{% btn https://www.conventionalcommits.org/, Conventional Commits 规范, fa-book %}
