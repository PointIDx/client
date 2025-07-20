<template>
  <div
    @click="$emit('select')"
    :class="[
      'w-full p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors',
      isSelected ? 'bg-gray-100' : ''
    ]"
    data-testid="chat-room-item"
    :data-room-id="chat.id"
  >
    <div class="flex items-center gap-3 w-full">
      <div class="relative">
        <UserAvatar 
          :name="chat.name" 
          :avatar="chat.avatar" 
          :size="40"
        />
        <div
          v-if="chat.hasNewMessage"
          class="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"
          data-testid="chat-notification"
        ></div>
      </div>
      <div class="flex-1 text-left overflow-hidden">
        <div class="flex items-center justify-between">
          <p class="font-medium text-sm truncate" data-testid="chat-room-name">{{ chat.name }}</p>
          <span class="text-xs text-gray-500" data-testid="chat-last-time">{{ chat.time }}</span>
        </div>
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-500 truncate max-w-[150px]" data-testid="chat-last-message">{{ chat.lastMessage }}</p>
          <span
            v-if="chat.hasNewMessage && chat.newMessageCount > 0"
            class="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
            data-testid="unread-count"
          >
            {{ chat.newMessageCount }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import UserAvatar from '../UserAvatar.vue'

import type { Chat } from '@/interfaces/chat'

interface Props {
  chat: Chat
  isSelected: boolean
}

defineProps<Props>()

defineEmits<{
  select: []
}>()
</script>