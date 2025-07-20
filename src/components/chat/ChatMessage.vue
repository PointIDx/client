<template>
  <div :class="['flex mb-4', message.isOwn ? 'justify-end' : 'justify-start']" data-testid="chat-message">
    <!-- User avatar for received messages -->
    <div v-if="!message.isOwn" class="mr-3 flex-shrink-0">
      <div class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium">
        {{ message.sender.charAt(0).toUpperCase() }}
      </div>
    </div>

    <div
      :class="[
        'max-w-[75%] rounded-2xl px-4 py-2 relative group transition-all duration-200 hover:shadow-lg',
        message.isOwn 
          ? 'bg-black text-white rounded-br-sm' 
          : 'bg-gray-100 text-gray-800 rounded-bl-sm',
        isEditing && 'ring-2 ring-blue-500'
      ]"
    >
      <!-- Replied message preview -->
      <div v-if="message.replyTo" class="mb-2 border-l-4 border-gray-400 pl-3 py-1 bg-black bg-opacity-10 rounded">
        <p class="text-xs opacity-70 font-medium">{{ message.replyTo.sender }}</p>
        <p class="text-xs opacity-80">{{ truncateText(message.replyTo.content, 50) }}</p>
      </div>

      <div class="flex items-start justify-between">
        <div class="flex-1">
          <!-- Editing input -->
          <div v-if="isEditing" class="space-y-2">
            <textarea
              v-model="editedContent"
              class="w-full p-2 border rounded resize-none bg-white text-black"
              rows="3"
              @keydown.enter.shift.prevent="saveEdit"
              @keydown.escape="cancelEdit"
            />
            <div class="flex gap-2">
              <button 
                @click="saveEdit"
                class="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
              >
                Save
              </button>
              <button 
                @click="cancelEdit"
                class="px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
          
          <!-- Normal message display -->
          <div v-else>
            <p class="text-sm leading-relaxed whitespace-pre-wrap" data-testid="message-content">{{ message.message }}</p>
            
            <!-- Message edited indicator -->
            <span v-if="message.editedAt" class="text-xs opacity-60 italic">(edited)</span>
            
            <div class="flex items-center justify-between mt-2">
              <p :class="['text-xs', message.isOwn ? 'text-gray-300' : 'text-gray-500']" data-testid="message-time">
                {{ formatTime(message.time) }}
              </p>
              
              <!-- Read status for own messages -->
              <div v-if="message.isOwn" class="flex items-center">
                <span 
                  :class="['text-xs ml-2', message.isRead ? 'text-green-400' : 'text-gray-400']"
                  data-testid="read-status"
                  :title="message.isRead ? 'Read' : 'Delivered'"
                >
                  {{ message.isRead ? '✓✓' : '✓' }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Action buttons -->
        <div class="hidden group-hover:flex items-center gap-1 ml-3 flex-shrink-0">
          <button 
            @click="handleReply"
            class="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
            data-testid="reply-button"
            title="Reply to message"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"/>
            </svg>
          </button>
          
          <button 
            v-if="message.isOwn"
            @click="startEdit"
            class="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
            data-testid="edit-button"
            title="Edit message"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- File attachments -->
      <div v-if="hasAttachments" class="mt-3 space-y-2" data-testid="message-attachments">
        <div 
          v-for="attachment in message.attachments" 
          :key="attachment.id"
          class="flex items-center gap-2 p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
          data-testid="file-attachment"
        >
          <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z"/>
          </svg>
          <a 
            :href="attachment.url" 
            :download="attachment.name"
            class="text-sm hover:underline flex-1 truncate"
            data-testid="download-file"
          >
            {{ attachment.name }}
          </a>
          <span class="text-xs opacity-70">{{ formatFileSize(attachment.size) }}</span>
        </div>
      </div>
    </div>

    <!-- User avatar for sent messages -->
    <div v-if="message.isOwn" class="ml-3 flex-shrink-0">
      <div class="w-8 h-8 rounded-full bg-black flex items-center justify-center text-sm font-medium text-white">
        {{ message.sender.charAt(0).toUpperCase() }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Message, ExtendedChatMessage } from '@/interfaces/chat'

interface Props {
  message: Message & Partial<ExtendedChatMessage>
}

interface Emits {
  (e: 'reply', message: Message): void
  (e: 'edit', messageId: string, newContent: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isEditing = ref(false)
const editedContent = ref('')

const hasAttachments = computed(() => {
  return props.message.attachments && props.message.attachments.length > 0
})

const handleReply = () => {
  emit('reply', props.message)
}

const startEdit = () => {
  isEditing.value = true
  editedContent.value = props.message.message
}

const saveEdit = () => {
  if (editedContent.value.trim() && editedContent.value !== props.message.message) {
    emit('edit', props.message.id, editedContent.value.trim())
  }
  cancelEdit()
}

const cancelEdit = () => {
  isEditing.value = false
  editedContent.value = ''
}

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const formatTime = (timeString: string) => {
  try {
    // If it's already in HH:MM format, return as is
    if (/^\d{1,2}:\d{2}(:\d{2})?\s?(AM|PM)?$/i.test(timeString)) {
      return timeString
    }
    
    // Try to parse as Date and format
    const date = new Date(timeString)
    if (isNaN(date.getTime())) {
      return timeString // Return original if can't parse
    }
    
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })
    }
  } catch {
    return timeString
  }
}

const formatFileSize = (bytes: number) => {
  if (!bytes) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
</script>