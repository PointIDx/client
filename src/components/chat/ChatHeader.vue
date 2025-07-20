<template>
  <div class="flex items-center justify-between p-4 border-b bg-background" data-testid="chat-header">
    <div class="flex items-center gap-3">
      <UserAvatar 
        :name="chat.name" 
        :avatar="chat.avatar" 
        :size="40"
      />
      <div>
        <h3 class="font-semibold" data-testid="chat-contact-name">{{ chat.name }}</h3>
        <p class="text-sm text-gray-500" data-testid="chat-status">{{ status }}</p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <button 
        @click="$emit('call')"
        class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        title="Voice call"
        data-testid="voice-call-button"
      >
        <PhoneIcon class="h-4 w-4" />
      </button>
      <button 
        @click="$emit('videoCall')"
        class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        title="Video call"
        data-testid="video-call-button"
      >
        <VideoIcon class="h-4 w-4" />
      </button>
      <button 
        @click="$emit('showMore')"
        class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        title="More options"
        data-testid="more-options-button"
      >
        <MoreVerticalIcon class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Phone as PhoneIcon, Video as VideoIcon, MoreVertical as MoreVerticalIcon } from 'lucide-vue-next'
import UserAvatar from '../UserAvatar.vue'

import type { Chat } from '@/interfaces/chat'

interface Props {
  chat: Chat
  status?: string
}

withDefaults(defineProps<Props>(), {
  status: 'Online'
})

defineEmits<{
  call: []
  videoCall: []
  showMore: []
}>()
</script>