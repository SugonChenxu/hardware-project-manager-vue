<template>
  <div id="app">
    <GanttChart />
  </div>
</template>

<script setup>
import GanttChart from './components/GanttChart.vue'
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
  overflow: hidden;
}

#app {
  font-family: 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
}
</style> 