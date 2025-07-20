<template>
  <div class="w-[20%] min-w-[280px] border-r bg-background flex flex-col" data-testid="chat-sidebar">
    <div class="p-4 border-b">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Messages</h2>
        <span 
          v-if="totalUnreadCount > 0"
          class="bg-red-500 text-white text-xs rounded-full px-2 py-1"
          data-testid="total-unread-count"
        >
          {{ totalUnreadCount }}
        </span>
      </div>
      <div class="mt-2">
        <input 
          type="text" 
          placeholder="Search conversations..." 
          class="w-full px-3 py-2 border rounded-md text-sm"
          data-testid="chat-search-input"
        />
      </div>
    </div>
    <div class="flex-1 overflow-auto">
      <div class="p-2">
        <ChatListItem
          v-for="chat in chats"
          :key="chat.id"
          :chat="chat"
          :isSelected="selectedChatId === chat.id"
          @select="$emit('selectChat', chat)"
          data-testid="chat-room-item"
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
  selectedChatId?: string // Changed from number to string to match backend
  totalUnreadCount?: number
}

withDefaults(defineProps<Props>(), {
  totalUnreadCount: 0
})

defineEmits<{
  selectChat: [chat: Chat]
}>()
</script>