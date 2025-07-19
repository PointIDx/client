<template>
  <div class="flex items-center gap-2 bg-gray-100 rounded-lg p-2 text-sm">
    <FileTextIcon v-if="!file.type.startsWith('image/')" class="h-4 w-4" />
    <ImageIcon v-else class="h-4 w-4" />
    <span class="truncate max-w-[150px]">{{ file.name }}</span>
    <span class="text-gray-500">({{ formatFileSize(file.size) }})</span>
    <button
      @click="$emit('remove')"
      class="h-4 w-4 p-0 hover:bg-gray-200 rounded"
      title="Remove file"
    >
      <XIcon class="h-3 w-3" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { FileText as FileTextIcon, Image as ImageIcon, X as XIcon } from 'lucide-vue-next'

interface Props {
  file: File
}

defineProps<Props>()

defineEmits<{
  remove: []
}>()

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
</script>