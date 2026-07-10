---
title: React 性能优化实战
date: 2024-01-18 14:00:00
categories:
  - 技术
tags:
  - 前端
  - React
---

从 `useMemo`、`useCallback` 到虚拟列表，从代码分割到懒加载。

本文总结了 React 项目中常见的性能瓶颈及对应的优化方案，附带真实项目中的 benchmark 数据。

## React 渲染机制

React 的性能优化核心在于理解**何时会重新渲染**：

{% note info %}
React 组件在以下情况会重新渲染：
1. **props 变化**：父组件传入了新的 props
2. **state 变化**：调用了 `setState`
3. **context 变化**：消费的 Context value 发生变化
4. **父组件渲染**：父组件 re-render 会触发所有子组件渲染
{% endnote %}

## memo / useMemo / useCallback

{% tabs 优化手段, 1 %}

{% tab React.memo %}
`React.memo` 是高阶组件，对 props 进行浅比较，只有 props 变化时才重新渲染：

```jsx
import { memo } from 'react';

// 只有 props 变化时才重渲染
const ExpensiveList = memo(({ items }) => {
  return (
    <ul>
      {items.map(item => <li key={item.id}>{item.name}</li>)}
    </ul>
  );
});

// 自定义比较函数
const MemoChild = memo(MyComponent, (prevProps, nextProps) => {
  return prevProps.data.id === nextProps.data.id; // true = 不重渲染
});
```

{% note warning %}
`React.memo` 只做**浅比较**。如果 props 是对象/数组/函数，每次父组件渲染都会创建新引用，memo 会失效。
{% endnote %}
{% endtab %}

{% tab useMemo %}
`useMemo` 缓存计算结果，只有依赖变化时才重新计算：

```jsx
import { useMemo } from 'react';

function ProductList({ products, filterText }) {
  // ✅ 只有 products 或 filterText 变化时才重新过滤
  const filtered = useMemo(() => {
    return products.filter(p => p.name.includes(filterText));
  }, [products, filterText]);

  return filtered.map(p => <ProductCard key={p.id} product={p} />);
}
```

**适用场景**：
- 昂贵的计算（排序、过滤大量数据）
- 保持引用稳定（传给 memo 子组件的 props）
{% endtab %}

{% tab useCallback %}
`useCallback` 缓存函数引用，避免每次渲染创建新函数：

```jsx
import { useCallback } from 'react';

function Parent({ data }) {
  // ✅ handleClick 引用稳定，传给 memo 子组件不会触发重渲染
  const handleClick = useCallback((id) => {
    console.log('click', id);
  }, []);

  return <MemoChild onClick={handleClick} data={data} />;
}
```

{% note danger %}
**不要滥用 useCallback**！如果函数没有传给被 memo 的子组件，缓存函数本身就是浪费。每次多一次依赖比较，反而更慢。
{% endnote %}
{% endtab %}

{% endtabs %}

## 虚拟列表

渲染上万条数据时，虚拟列表只渲染可视区域的元素：

```jsx
import { FixedSizeList as List } from 'react-window';

function BigList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {items[index].name}
    </div>
  );

  return (
    <List
      height={600}        // 容器高度
      itemCount={items.length}  // 数据总量
      itemSize={50}       // 每行高度
      width="100%"
    >
      {Row}
    </List>
  );
}
```

{% folding blue 点击查看 Benchmark 对比 %}

| 方案 | 1000 条 | 10000 条 | 100000 条 |
|------|---------|----------|-----------|
| 直接渲染 | 120ms | 2300ms | 浏览器卡死 |
| 分页 | 15ms | 15ms | 15ms |
| 虚拟列表 | 25ms | 28ms | 35ms |

> 虚拟列表在超大数据量下优势明显，首次渲染时间几乎不受数据量影响。
{% endfolding %}

## 代码分割与懒加载

### React.lazy + Suspense

```jsx
import { lazy, Suspense } from 'react';

// 懒加载路由组件
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

### 按需加载重型组件

```jsx
// 图表库很重，只在需要时加载
const HeavyChart = lazy(() => import('./HeavyChart'));

function Report({ showChart }) {
  return (
    <div>
      {showChart && (
        <Suspense fallback={<Skeleton />}>
          <HeavyChart data={data} />
        </Suspense>
      )}
    </div>
  );
}
```

## 状态优化

### 状态下放

{% hideToggle 点击查看状态下放示例 %}
```jsx
// ❌ 糟糕：输入框变化导致整个列表重渲染
function BadExample() {
  const [keyword, setKeyword] = useState('');
  const [items, setItems] = useState([]);

  return (
    <div>
      <input value={keyword} onChange={e => setKeyword(e.target.value)} />
      <ExpensiveList items={items} />  {/* 每次输入都会重渲染 */}
    </div>
  );
}

// ✅ 优化：把输入框状态隔离到子组件
function SearchInput() {
  const [keyword, setKeyword] = useState('');
  return <input value={keyword} onChange={e => setKeyword(e.target.value)} />;
}

function GoodExample() {
  const [items, setItems] = useState([]);
  return (
    <div>
      <SearchInput />        {/* 输入变化不影响父组件 */}
      <ExpensiveList items={items} />
    </div>
  );
}
```
{% endhideToggle %}

### 使用 Selector 精确订阅

```jsx
import { useSelector, shallowEqual } from 'react-redux';

// ❌ 糟糕：整个 state 变化都会重渲染
const state = useSelector(state => state);

// ✅ 优化：只订阅需要的字段
const userName = useSelector(state => state.user.name);

// ✅ 对象：使用 shallowEqual
const { name, age } = useSelector(
  state => ({ name: state.user.name, age: state.user.age }),
  shallowEqual
);
```

## 总结

{% note success %}
**性能优化清单**：
1. **测量优先**：用 React DevTools Profiler 找到瓶颈
2. **memo + useMemo + useCallback**：配合使用，避免不必要的重渲染
3. **虚拟列表**：大数据量渲染的终极方案
4. **代码分割**：按路由/按需懒加载，减小首屏体积
5. **状态下放**：把频繁变化的状态隔离到最小组件
6. **精确订阅**：只订阅真正需要的状态片段
{% endnote %}

{% label 记住@red %}：**不要过早优化**！先用 Profiler 测量，找到真正的瓶颈再优化。

{% btn https://react.dev/reference/react/memo, React.memo 官方文档, fa-book %}
