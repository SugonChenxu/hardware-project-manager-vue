<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
// Router会自动处理组件的渲染，不需要手动导入组件
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  height: 100%;
  overflow: auto;
}

#app {
  font-family: 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
}
</style> 