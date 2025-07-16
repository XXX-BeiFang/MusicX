<template>
  <div class="ai-music-assistant">
    <div class="conversation-container" ref="conversationContainer">
      <div v-for="(message, index) in currentConversation.messages" :key="index"
           :class="['message', message.role === 'assistant' ? 'assistant' : 'user']">
        <div class="avatar">
          <img :src="message.role === 'assistant' ? '/src/assets/avatar/chatbot.jpg' : '/src/assets/avatar/admin.png'" alt="avatar">
        </div>
        <div class="content">
          <div v-if="message.role === 'assistant'" v-html="formatMessage(message.content)"></div>
          <div v-else>{{ message.content }}</div>
        </div>
      </div>
      <div v-if="isLoading" class="message assistant">
        <div class="avatar">
          <img src="/src/assets/avatar/chatbot.jpg" alt="avatar">
        </div>
        <div class="content">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>

    <div class="input-container">
      <el-input
        v-model="userInput"
        type="textarea"
        :rows="2"
        placeholder="问我关于音乐的任何问题..."
        :disabled="isLoading"
        @keydown.enter.prevent="sendMessage"
      />
      <el-button type="primary" :icon="Promotion" @click="sendMessage" :loading="isLoading">
        发送
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, computed } from 'vue';
import { Promotion } from '@element-plus/icons-vue';
import { AudioStore } from '@/stores/modules/audio';
import { storeToRefs } from 'pinia';
import { marked } from 'marked';

// 定义消息类型
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// 定义会话类型
interface Conversation {
  id: string;
  messages: Message[];
  title: string;
  createdAt: number;
}

// 状态
const isLoading = ref(false);
const userInput = ref('');
const conversationContainer = ref<HTMLDivElement | null>(null);
const audioStore = AudioStore();
const { trackList, currentSongIndex } = storeToRefs(audioStore);

// 当前会话
const currentConversation = reactive<Conversation>({
  id: 'default',
  messages: [
    {
      id: '1',
      role: 'assistant',
      content: '你好！我是你的AI音乐助手。我可以帮你推荐音乐、解释歌词、提供音乐知识，或者根据你的心情推荐歌曲。请告诉我你需要什么帮助？',
      timestamp: Date.now()
    }
  ],
  title: '新的音乐对话',
  createdAt: Date.now()
});

// 当前播放的歌曲
const currentTrack = computed(() => {
  return trackList.value[currentSongIndex.value] || null;
});

// 格式化消息（将markdown转换为HTML）
const formatMessage = (content: string) => {
  return marked(content);
};

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (conversationContainer.value) {
      conversationContainer.value.scrollTop = conversationContainer.value.scrollHeight;
    }
  });
};

// 生成唯一ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 发送消息
const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return;

  // 添加用户消息
  const userMessage: Message = {
    id: generateId(),
    role: 'user',
    content: userInput.value,
    timestamp: Date.now()
  };

  currentConversation.messages.push(userMessage);
  userInput.value = '';
  scrollToBottom();

  // 设置加载状态
  isLoading.value = true;

  try {
    // 这里应该调用实际的AI API，现在我们模拟一个响应
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 根据用户输入和当前播放的歌曲生成响应
    let response = '';
    const userMessageLower = userMessage.content.toLowerCase();

    if (userMessageLower.includes('推荐') || userMessageLower.includes('recommend')) {
      response = `根据你的兴趣，我推荐以下歌曲：
1. 《Blinding Lights》 - The Weeknd
2. 《好想爱这个世界啊》 - 华晨宇
3. 《Dynamite》 - BTS
4. 《起风了》 - 买辣椒也用券

你想听哪一首？我可以帮你添加到播放列表。`;
    } else if (userMessageLower.includes('心情') || userMessageLower.includes('mood')) {
      response = `音乐确实能影响我们的心情！如果你感到：

- **开心/兴奋**：试试《Can't Stop the Feeling!》 - Justin Timberlake
- **放松/冥想**：《River Flows In You》 - Yiruma
- **动力/激励**：《Eye of the Tiger》 - Survivor
- **伤感/怀旧**：《Someone Like You》 - Adele

告诉我你现在的心情，我可以给你更精准的推荐。`;
    } else if (currentTrack.value && (userMessageLower.includes('这首歌') || userMessageLower.includes('当前歌曲') || userMessageLower.includes('current song'))) {
      response = `你正在听的是《${currentTrack.value.title}》，演唱者是${currentTrack.value.artist}。这首歌收录在专辑《${currentTrack.value.album}》中。

这是一首非常受欢迎的作品，展现了艺术家独特的音乐风格。你喜欢这种类型的音乐吗？我可以推荐类似的歌曲给你。`;
    } else {
      response = `感谢你的提问！作为音乐助手，我可以：

1. 推荐符合你心情的歌曲
2. 解释歌词含义
3. 提供音乐历史知识
4. 推荐类似你喜欢的艺术家的音乐
5. 创建特定场景的播放列表

请告诉我你对哪方面更感兴趣，我会提供更具体的帮助。`;
    }

    // 添加助手响应
    const assistantMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: response,
      timestamp: Date.now()
    };

    currentConversation.messages.push(assistantMessage);
  } catch (error) {
    // 添加错误消息
    currentConversation.messages.push({
      id: generateId(),
      role: 'assistant',
      content: '抱歉，我遇到了一些问题。请稍后再试。',
      timestamp: Date.now()
    });
    console.error('AI响应错误:', error);
  } finally {
    isLoading.value = false;
    scrollToBottom();
  }
};

// 组件挂载后滚动到底部
onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
.ai-music-assistant {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--el-bg-color);
  border-radius: 8px;
  overflow: hidden;
}

.conversation-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  gap: 12px;
  max-width: 85%;
}

.message.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.content {
  background-color: var(--el-fill-color-light);
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
}

.message.user .content {
  background-color: var(--el-color-primary-light-9);
}

.input-container {
  padding: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
  display: flex;
  gap: 12px;
}

.input-container .el-input {
  flex: 1;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  align-items: center;
  height: 24px;
}

.typing-indicator span {
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: var(--el-text-color-secondary);
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: 0s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  30% {
    transform: translateY(-6px);
    opacity: 1;
  }
}

/* 处理markdown内容样式 */
:deep(a) {
  color: var(--el-color-primary);
  text-decoration: none;
}

:deep(p) {
  margin: 8px 0;
}

:deep(ul), :deep(ol) {
  padding-left: 20px;
  margin: 8px 0;
}

:deep(pre) {
  background-color: var(--el-fill-color);
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 8px 0;
}

:deep(code) {
  font-family: monospace;
  background-color: var(--el-fill-color);
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 90%;
}

:deep(pre code) {
  background-color: transparent;
  padding: 0;
}

:deep(blockquote) {
  border-left: 4px solid var(--el-border-color);
  padding-left: 16px;
  color: var(--el-text-color-secondary);
  margin: 8px 0;
}
</style>