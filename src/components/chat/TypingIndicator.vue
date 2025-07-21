<template>
  <div v-if="isVisible" class="flex justify-start" data-testid="typing-indicator">
    <div class="bg-gray-200 rounded-lg p-3 max-w-[70%]">
      <div class="flex items-center gap-1">
        <span class="text-sm text-gray-500" data-testid="typing-text">
          {{ displayText }}
        </span>
        <div class="flex gap-1">
          <div class="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style="animation-delay: -0.3s"></div>
          <div class="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style="animation-delay: -0.15s"></div>
          <div class="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
        </div>
        <div v-if="!isOnline" class="ml-2">
          <span class="text-xs text-red-500">(offline)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  isVisible: boolean
  typingText?: string
  userNames?: string[]
  isOnline?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  typingText: 'typing...',
  userNames: () => [],
  isOnline: true
})

const displayText = computed(() => {
  if (props.userNames && props.userNames.length > 0) {
    const names = props.userNames.join(', ')
    return `${names} ${props.userNames.length === 1 ? 'is' : 'are'} typing...`
  }
  return props.typingText
})
</script>

<style scoped>
@keyframes bounce {
  0%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-6px);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}
</style>