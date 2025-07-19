<template>
  <div v-if="isVisible" class="flex justify-start">
    <div class="bg-gray-200 rounded-lg p-3 max-w-[70%]">
      <div class="flex items-center gap-1">
        <span class="text-sm text-gray-500">{{ typingText }}</span>
        <div class="flex gap-1">
          <div class="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style="animation-delay: -0.3s"></div>
          <div class="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style="animation-delay: -0.15s"></div>
          <div class="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isVisible: boolean
  typingText?: string
}

withDefaults(defineProps<Props>(), {
  typingText: 'typing'
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