<template>
  <div class="p-4 border-t bg-background" data-testid="chat-input">
    <!-- File Attachments Preview -->
    <div v-if="attachedFiles.length > 0" class="mb-3 flex flex-wrap gap-2" data-testid="file-attachments-preview">
      <FileAttachment
        v-for="(file, index) in attachedFiles"
        :key="index"
        :file="file"
        @remove="removeFile(index)"
        data-testid="file-attachment-preview"
      />
    </div>

    <div class="flex items-center gap-2">
      <input
        ref="fileInputRef"
        type="file"
        multiple
        class="hidden"
        @change="handleFileSelect"
        data-testid="file-input"
      />
      <button
        @click="fileInputRef?.click()"
        class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        title="Attach file"
        data-testid="attach-file-button"
      >
        <PaperclipIcon class="h-4 w-4" />
      </button>
      <input
        v-model="message"
        @keypress="handleKeyPress"
        @input="handleTyping"
        :placeholder="placeholder"
        class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        data-testid="message-input"
      />
      <button
        @click="handleSendMessage"
        :disabled="!canSend"
        class="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Send message"
        data-testid="send-button"
      >
        <SendIcon class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Send as SendIcon, Paperclip as PaperclipIcon } from 'lucide-vue-next'
import FileAttachment from './FileAttachment.vue'

interface Props {
  placeholder?: string
  modelValue?: string
  attachedFiles?: File[]
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Type a message...',
  modelValue: '',
  attachedFiles: () => []
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:attachedFiles': [files: File[]]
  'send': [message: string, files: File[]]
  'typing': [isTyping: boolean]
}>()

const fileInputRef = ref<HTMLInputElement>()

const message = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const canSend = computed(() => {
  return message.value.trim().length > 0 || props.attachedFiles.length > 0
})

const handleSendMessage = () => {
  if (canSend.value) {
    emit('send', message.value.trim(), [...props.attachedFiles])
    message.value = ''
    emit('update:attachedFiles', [])
  }
}

const handleKeyPress = (e: KeyboardEvent) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault()
    handleSendMessage()
  }
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = Array.from(target.files || [])
  emit('update:attachedFiles', [...props.attachedFiles, ...files])
}

const removeFile = (index: number) => {
  const newFiles = props.attachedFiles.filter((_, i) => i !== index)
  emit('update:attachedFiles', newFiles)
}

let typingTimeout: NodeJS.Timeout | null = null

const handleTyping = () => {
  emit('typing', true)
  
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }
  
  typingTimeout = setTimeout(() => {
    emit('typing', false)
  }, 1000)
}
</script>