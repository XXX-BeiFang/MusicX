<template>
  <div class="ai-assistant-page">
    <div class="page-header">
      <h1>AI音乐助手</h1>
      <p class="description">
        我是你的AI音乐助手，可以帮你推荐音乐、解释歌词、提供音乐知识，或者根据你的心情推荐歌曲。
      </p>
    </div>

    <div class="assistant-container">
      <AIMusicAssistant />
    </div>
  </div>
</template>

<script setup lang="ts">
import * as AIMusicAssistant from '@/components/AIMusicAssistant.vue';
</script>

<style scoped>
.ai-assistant-page {
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.description {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.assistant-container {
  flex: 1;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>