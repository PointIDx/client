<template>
  <div class="bg-white border-t" data-testid="chat-input">
    <!-- Reply Preview -->
    <div v-if="replyToMessage" class="px-4 py-3 bg-gray-50 border-b border-gray-200" data-testid="reply-preview">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <svg class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"/>
            </svg>
            <span class="text-sm font-medium text-gray-600">Replying to {{ replyToMessage.sender }}</span>
          </div>
          <p class="text-sm text-gray-700 bg-white px-3 py-2 rounded border-l-4 border-gray-300">
            {{ truncateText(replyToMessage.message, 100) }}
          </p>
        </div>
        <button
          @click="clearReply"
          class="p-1 hover:bg-gray-200 rounded transition-colors"
          title="Cancel reply"
          data-testid="cancel-reply-button"
        >
          <svg class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- File Attachments Preview -->
    <div v-if="attachedFiles.length > 0" class="px-4 py-3 bg-gray-50 border-b border-gray-200" data-testid="file-attachments-preview">
      <div class="flex flex-wrap gap-2">
        <div
          v-for="(file, index) in attachedFiles"
          :key="index"
          class="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border"
          data-testid="file-attachment-preview"
        >
          <svg class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z"/>
          </svg>
          <span class="text-sm text-gray-700 truncate max-w-[120px]">{{ file.name }}</span>
          <button
            @click="removeFile(index)"
            class="text-gray-400 hover:text-red-500 transition-colors"
            title="Remove file"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Message Input Area -->
    <div class="p-4">
      <div class="flex items-end gap-3">
        <!-- Attach File Button -->
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
          class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          title="Attach file"
          data-testid="attach-file-button"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"/>
          </svg>
        </button>

        <!-- Message Input -->
        <div class="flex-1 relative">
          <textarea
            ref="textareaRef"
            v-model="message"
            @keydown="handleKeyDown"
            @input="handleInput"
            :placeholder="placeholder"
            rows="1"
            class="w-full px-4 py-3 pr-12 bg-gray-100 border-0 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-black transition-all"
            style="max-height: 120px;"
            data-testid="message-input"
          />
          
          <!-- Send Button (inside textarea) -->
          <button
            @click="handleSendMessage"
            :disabled="!canSend"
            :class="[
              'absolute right-2 bottom-2 w-8 h-8 rounded-full transition-all flex items-center justify-center',
              canSend 
                ? 'bg-black text-white hover:bg-gray-800' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            ]"
            title="Send message"
            data-testid="send-button"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Typing indicator for current user (you can show character count here if needed) -->
      <div v-if="message.length > 0" class="mt-2 text-xs text-gray-500 text-right">
        {{ message.length }}/2000
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import type { Message } from '@/interfaces/chat'

interface Props {
  placeholder?: string
  modelValue?: string
  attachedFiles?: File[]
  replyToMessage?: Message | null
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Type a message...',
  modelValue: '',
  attachedFiles: () => [],
  replyToMessage: null
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:attachedFiles': [files: File[]]
  'send': [message: string, files: File[], replyTo?: Message]
  'typing': [isTyping: boolean]
  'clearReply': []
}>()

const fileInputRef = ref<HTMLInputElement>()
const textareaRef = ref<HTMLTextAreaElement>()

const message = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const canSend = computed(() => {
  return message.value.trim().length > 0 || props.attachedFiles.length > 0
})

const handleSendMessage = () => {
  if (canSend.value) {
    emit('send', message.value.trim(), [...props.attachedFiles], props.replyToMessage || undefined)
    message.value = ''
    emit('update:attachedFiles', [])
    if (props.replyToMessage) {
      emit('clearReply')
    }
    // Reset textarea height
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
    }
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault()
    handleSendMessage()
  }
}

const handleInput = (e: Event) => {
  // Auto-resize textarea
  const textarea = e.target as HTMLTextAreaElement
  textarea.style.height = 'auto'
  textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  
  // Handle typing indicator
  handleTyping()
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = Array.from(target.files || [])
  emit('update:attachedFiles', [...props.attachedFiles, ...files])
  
  // Reset the file input
  if (target) {
    target.value = ''
  }
}

const removeFile = (index: number) => {
  const newFiles = props.attachedFiles.filter((_, i) => i !== index)
  emit('update:attachedFiles', newFiles)
}

const clearReply = () => {
  emit('clearReply')
}

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

let typingTimeout: ReturnType<typeof setTimeout> | null = null

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