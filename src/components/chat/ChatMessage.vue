<template>
  <div :class="['flex', message.isOwn ? 'justify-end' : 'justify-start']">
    <div
      :class="[
        'max-w-[70%] rounded-lg p-3',
        message.isOwn ? 'bg-blue-500 text-white' : 'bg-gray-200'
      ]"
    >
      <p class="text-sm">{{ message.message }}</p>
      <p :class="['text-xs mt-1', message.isOwn ? 'text-blue-100' : 'text-gray-500']">
        {{ message.time }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage } from '@/interfaces/chat'

interface Props {
  message: ChatMessage
}

defineProps<Props>()
</script>