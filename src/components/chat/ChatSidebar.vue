<template>
  <div class="w-[20%] min-w-[280px] border-r bg-background flex flex-col">
    <div class="p-4 border-b">
      <h2 class="text-lg font-semibold">Messages</h2>
    </div>
    <div class="flex-1 overflow-auto">
      <div class="p-2">
        <ChatListItem
          v-for="chat in chats"
          :key="chat.id"
          :chat="chat"
          :isSelected="selectedChatId === chat.id"
          @select="$emit('selectChat', chat)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChatListItem from './ChatListItem.vue'

import type { Chat } from '@/interfaces/chat'

interface Props {
  chats: Chat[]
  selectedChatId?: number
}

defineProps<Props>()

defineEmits<{
  selectChat: [chat: Chat]
}>()
</script>