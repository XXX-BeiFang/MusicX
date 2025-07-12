<script setup lang="ts">
const chat = chatStore()
const { conversations, activeConversationId } = storeToRefs(chat)

const emit = defineEmits(['change'])

// 处理会话点击
function handleConversationClick(index: number) {
  chat.setChatState('activeConversationId', index)
  emit('change')
}

// 删除会话
function deleteConversation(index: number) {
  chat.conversations.splice(index, 1)
  // 如果删除的是当前激活会话，重置activeConversationId
  if (chat.activeConversationId === index) {
    chat.setChatState('activeConversationId', 0)
  } else if (chat.activeConversationId > index) {
    chat.setChatState('activeConversationId', chat.activeConversationId - 1)
  }
}
</script>
<template>
  <aside class="w-64 text-foreground p-4 overflow-hidden border-r">
    <el-button
      type="primary"
      @click="chat.addConversation()"
      class="my-4 w-full"
    >
      新增会话
    </el-button>
    <ul class="overflow-y-auto overflow-x-hidden">
      <li
        class="mb-2 p-2 cursor-pointer flex items-center transition duration-300 hover:bg-hoverMenuBg rounded-lg group session-item"
        :class="{ 'bg-hoverMenuBg': index === activeConversationId }"
        v-for="(conversation, index) in conversations"
        :key="conversation.id"
        @click="handleConversationClick(index)"
      >
        <img
          src="@/assets/avatar/chatbot.jpg"
          alt="Avatar"
          class="w-10 h-10 rounded-full mr-2"
        />
        <div class="w-full">
          <p class="font-bold">会话 {{ conversation.id }}</p>
          <p class="text-sm text-muted-foreground line-clamp-1">
            {{
              conversation.messages[conversation.messages.length - 1]
                ?.content || '暂无消息'
            }}
          </p>
        </div>
        <el-button type="danger" size="small" @click.stop="deleteConversation(index)" class="delete-btn opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2">删除</el-button>
      </li>
    </ul>
  </aside>
</template>

<style scoped>
.session-item {
  position: relative;
}

.delete-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  display: none;
  padding: 0 10px;
  height: 28px;
  font-size: 13px;
  border-radius: 6px;
}

.session-item:hover .delete-btn {
  display: block;
}
</style>
