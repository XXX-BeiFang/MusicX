<script setup lang="ts">
import axios from 'axios'
import * as SettingDialog from './settingDialog.vue'
import 'highlight.js/styles/github-dark.css'
import { renderMarkdown } from '@/utils/markdown'

const chat = chatStore()
const chatRef = ref<HTMLElement>()
const { conversations, activeConversationId, modelSelect } = storeToRefs(chat)

// 消息输入框
const messageInput = ref('')
// 模型列表
const modelList = ref<{ id: string }[]>([])

/**
 * 处理流式响应数据
 */
const processStreamResponse = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  decoder: TextDecoder
): Promise<void> => {
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = (chunk || '').split('\n').filter((line) => line.trim())

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonString = line.substring(6).trim()
          if (jsonString && jsonString !== '[DONE]') {
            const jsonResponse = JSON.parse(jsonString)
            const content = jsonResponse.choices[0]?.delta?.content || ''
            // 添加消息
            chat.createMessage(content, 'system')
            scrollToBottom()
          }
        }
      }
    }
  } catch (error) {
    console.error('处理流式数据错误:', error)
  }
}

// 发送消息
async function sendMessage() {
  if (messageInput.value.trim() === '') return
  chat.createMessage(messageInput.value, 'user')
  scrollToBottom()

  const response = await fetch(`${chat.apiBaseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: chat.apiToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelSelect.value,
      messages: chat.conversations[chat.activeConversationId].messages,
      stream: true,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`${errorData.error.code} - ${errorData.error.message}`)
  }

  // 清空输入框
  messageInput.value = ''

  // 获取响应数据流
  const reader = response.body?.getReader()
  const decoder = new TextDecoder('utf-8')

  // 处理流式响应数据
  await processStreamResponse(
    reader as ReadableStreamDefaultReader<Uint8Array>,
    decoder
  )
}

/**
 * 滚动聊天底部
 */
const scrollToBottom = () => {
  nextTick(() => {
    if (chatRef.value) {
      chatRef.value.scrollTop = chatRef.value.scrollHeight
    }
  })
}

// 清空当前会话聊天内容
function clearCurrentConversation() {
  if (chat.activeConversationId !== undefined && chat.conversations[chat.activeConversationId]) {
    chat.conversations[chat.activeConversationId].messages = []
  }
}

onMounted(async () => {
  if (chat.apiBaseUrl && chat.apiToken) {
    // 初始化会话
    const { data } = await axios.get(`${chat.apiBaseUrl}/v1/models`, {
      headers: { Authorization: chat.apiToken },
    })
    modelList.value = data.data
  }
})

defineExpose({
  scrollToBottom,
})
</script>
<template>
  <main class="flex-1 p-4 flex flex-col text-foreground">
    <div class="flex justify-end mb-4">
      <button
        @click="clearCurrentConversation"
        class="clear-btn px-5 py-2 text-base font-medium rounded-xl border border-border bg-white dark:bg-neutral-800 text-foreground transition-all duration-150 hover:shadow-md hover:border-primary hover:text-primary active:scale-95"
      >
        清空聊天
      </button>
    </div>
    <div class="flex-1 overflow-y-auto" ref="chatRef">
      <div
        v-for="message in conversations[activeConversationId]?.messages"
        :key="message.content"
        class="mb-4 flex"
        :class="{
          'items-start': message.role === 'system',
          'items-end justify-end': message.role !== 'system',
        }"
      >
        <img
          v-if="message.role === 'system'"
          src="@/assets/avatar/chatbot.jpg"
          alt="ChatGPT Avatar"
          class="w-10 h-10 rounded-full mr-2"
        />
        <div class="p-4 rounded-xl bg-background text-sm shadow-lg max-w-[80%]">
          <p v-html="renderMarkdown(message.content)" />
        </div>
        <img
          v-if="message.role !== 'system'"
          src="@/assets/avatar/admin.png"
          alt="User Avatar"
          class="w-10 h-10 rounded-full ml-2"
        />
      </div>
    </div>
    <div class="mt-4 flex items-center w-full gap-2">
      <div class="relative w-full flex items-center">
        <el-input
          placeholder="请输入您的问题..."
          v-model="messageInput"
          @keydown.enter="sendMessage"
        >
          <template #append>
            <el-select
              v-model="modelSelect"
              placeholder="Model"
              size="large"
              style="width: 215px"
            >
              <el-option
                v-for="item in modelList"
                :key="item.id"
                :label="item.id"
                :value="item.id"
              />
            </el-select>
          </template>
        </el-input>
      </div>
      <!-- 发送按钮 -->
      <el-button class="h-full" type="primary" @click="sendMessage">
        <icon-iconoir:send-diagonal />
      </el-button>
      <!-- 设置 -->
      <SettingDialog.default />
    </div>
  </main>
</template>

<style scoped>
.clear-btn {
  outline: none;
  cursor: pointer;
  letter-spacing: 1px;
  box-shadow: 0 1px 4px rgba(80, 80, 80, 0.04);
}
</style>
