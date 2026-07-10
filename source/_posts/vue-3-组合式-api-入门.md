---
title: "Vue 3 组合式 API 入门"
date: 2026-06-10 12:00:00
cover: https://picsum.photos/seed/vue3-composition/600/400
tags:
  - Vue
  - 前端
  - JavaScript
categories:
  - 技术
---

从 Options API 迁移到 Composition API，一开始很不习惯，但用了 `setup` 之后发现逻辑复用真的方便太多了。

`ref` 和 `reactive` 的区别要注意。

## ref vs reactive

{% tabs ref-vs-reactive %}

{% tab ref %}
`ref` 适用于**基本类型**，也可以包装对象。访问时需要 `.value`：

```javascript
import { ref } from 'vue';

const count = ref(0);
const name = ref('Vue');

function increment() {
  count.value++; // 需要用 .value
}

// 模板中自动解包，不需要 .value
// <div>{{ count }}</div>
```

**特点**：
- 深层响应式
- 需要 `.value` 访问（模板中自动解包）
- 重新赋值不会丢失响应性
{% endtab %}

{% tab reactive %}
`reactive` 只适用于**对象/数组**，返回 Proxy 代理对象：

```javascript
import { reactive } from 'vue';

const state = reactive({
  count: 0,
  name: 'Vue'
});

function increment() {
  state.count++; // 直接访问，不需要 .value
}

// ⚠️ 不能直接重新赋值
// state = { count: 1 } // ❌ 丢失响应性
// 应该用 Object.assign
Object.assign(state, { count: 1 }); // ✅
```

**特点**：
- 只能用于对象/数组
- 直接访问属性，不需要 `.value`
- 重新赋值会丢失响应性
{% endtab %}

{% endtabs %}

{% note warning %}
**选择建议**：基本类型用 `ref`，对象/数组两者皆可。如果需要频繁整体替换对象，用 `ref` 更安全。
{% endnote %}

## setup 语法糖

`<script setup>` 是组合式 API 的编译语法糖，代码更简洁：

```vue
<script setup>
import { ref, computed, onMounted } from 'vue';

// 响应式数据
const count = ref(0);
const double = computed(() => count.value * 2);

// 方法
function increment() {
  count.value++;
}

// 生命周期
onMounted(() => {
  console.log('组件已挂载');
});
</script>

<template>
  <button @click="increment">
    count: {{ count }}, double: {{ double }}
  </button>
</template>
```

## 逻辑复用

组合式 API 最大的优势是**逻辑复用**——把响应式逻辑提取为独立函数：

```javascript
// useMouse.js — 鼠标位置追踪逻辑
import { ref, onMounted, onUnmounted } from 'vue';

export function useMouse() {
  const x = ref(0);
  const y = ref(0);

  function update(e) {
    x.value = e.pageX;
    y.value = e.pageY;
  }

  onMounted(() => window.addEventListener('mousemove', update));
  onUnmounted(() => window.removeEventListener('mousemove', update));

  return { x, y };
}
```

```vue
<!-- 任意组件中使用 -->
<script setup>
import { useMouse } from './useMouse';
const { x, y } = useMouse();
</script>

<template>Mouse: {{ x }}, {{ y }}</template>
```

{% note success %}
相比 Options API 的 mixin，组合式函数有以下优势：
- **来源清晰**：能看到变量从哪个函数来
- **无命名冲突**：不同逻辑可以解构重命名
- **类型推断**：TypeScript 支持更好
{% endnote %}

## 生命周期对照

{% folding green Options API → Composition API 生命周期对照 %}
| Options API | Composition API | 说明 |
|-------------|----------------|------|
| `beforeCreate` | `setup()` 本身 | 最先执行 |
| `created` | `setup()` 本身 | 最先执行 |
| `beforeMount` | `onBeforeMount` | 挂载前 |
| `mounted` | `onMounted` | 挂载后 |
| `beforeUpdate` | `onBeforeUpdate` | 更新前 |
| `updated` | `onUpdated` | 更新后 |
| `beforeUnmount` | `onBeforeUnmount` | 卸载前 |
| `unmounted` | `onUnmounted` | 卸载后 |
| `errorCaptured` | `onErrorCaptured` | 捕获错误 |
{% endfolding %}

## computed 和 watch

{% tabs computed-watch %}

{% tab computed 计算属性 %}
```javascript
import { ref, computed } from 'vue';

const price = ref(100);
const quantity = ref(2);

// 只读计算属性
const total = computed(() => price.value * quantity.value);

// 可写计算属性
const fullName = computed({
  get: () => firstName.value + ' ' + lastName.value,
  set: (val) => {
    [firstName.value, lastName.value] = val.split(' ');
  }
});
```

**适用场景**：需要根据已有状态派生新值
{% endtab %}

{% tab watch 侦听器 %}
```javascript
import { ref, watch, watchEffect } from 'vue';

const keyword = ref('');

// 侦听单个值
watch(keyword, (newVal, oldVal) => {
  console.log(`从 ${oldVal} 变为 ${newVal}`);
});

// 侦听多个值
watch([firstName, lastName], ([new1, new2]) => {
  console.log(new1, new2);
});

// 深度侦听
watch(obj, (newVal) => {
  // ...
}, { deep: true, immediate: true });

// watchEffect：自动追踪依赖
watchEffect(() => {
  console.log(keyword.value); // 自动追踪 keyword
});
```

**适用场景**：需要在值变化时执行副作用
{% endtab %}

{% endtabs %}

## 总结

{% note info %}
**组合式 API 核心要点**：
1. `ref` 适用于所有类型，`reactive` 仅对象/数组
2. `<script setup>` 是推荐的编写方式
3. 逻辑复用通过自定义组合式函数实现
4. `computed` 派生值，`watch` 执行副作用
{% endnote %}

{% btn https://cn.vuejs.org/guide/extras/composition-api-faq.html, Vue 3 官方文档, fa-book %}
