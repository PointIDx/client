<template>
  <div :class="['flex', message.isOwn ? 'justify-end' : 'justify-start']" data-testid="chat-message">
    <div
      :class="[
        'max-w-[70%] rounded-lg p-3 relative group',
        message.isOwn ? 'bg-blue-500 text-white' : 'bg-gray-200'
      ]"
    >
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <p class="text-sm" data-testid="message-content">{{ message.message }}</p>
          <p :class="['text-xs mt-1', message.isOwn ? 'text-blue-100' : 'text-gray-500']" data-testid="message-time">
            {{ message.time }}
          </p>
        </div>
        <div class="hidden group-hover:flex items-center gap-1 ml-2">
          <button 
            v-if="message.isOwn"
            class="text-xs opacity-70 hover:opacity-100"
            data-testid="edit-button"
            title="Edit message"
          >
            Edit
          </button>
          <button 
            class="text-xs opacity-70 hover:opacity-100"
            data-testid="reply-button"
            title="Reply to message"
          >
            Reply
          </button>
        </div>
      </div>
      
      <!-- File attachments if any -->
      <div v-if="hasAttachments" class="mt-2" data-testid="message-attachments">
        <div class="flex flex-wrap gap-2">
          <div 
            v-for="attachment in message.attachments" 
            :key="attachment.id"
            class="bg-white bg-opacity-20 rounded p-2 text-xs"
            data-testid="file-attachment"
          >
            <a 
              :href="attachment.url" 
              :download="attachment.name"
              class="hover:underline"
              data-testid="download-file"
            >
              {{ attachment.name }}
            </a>
          </div>
        </div>
      </div>
      
      <!-- Read status indicator -->
      <div v-if="message.isOwn" class="flex justify-end mt-1">
        <span 
          :class="['text-xs', message.isRead ? 'text-green-300' : 'text-gray-300']"
          data-testid="read-status"
        >
          {{ message.isRead ? '✓✓' : '✓' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Message, ExtendedChatMessage } from '@/interfaces/chat'

interface Props {
  message: Message & Partial<ExtendedChatMessage>
}

const props = defineProps<Props>()

const hasAttachments = computed(() => {
  return props.message.attachments && props.message.attachments.length > 0
})
</script>