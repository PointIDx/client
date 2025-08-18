<template>
  <div class="w-[350px] bg-white border-r border-gray-200 flex flex-col h-full" data-testid="chat-sidebar">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-100">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <button 
            @click="$emit('goBack')"
            class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            title="Retour"
          >
            <ArrowLeft class="w-5 h-5" />
          </button>
          <h1 class="text-2xl font-bold text-gray-900">Messages</h1>
        </div>
        <div class="flex items-center gap-2">
          <!-- New Message Button -->
          <button class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"/>
            </svg>
          </button>
          <!-- Settings Button -->
          <button class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Search Bar -->
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
          </svg>
        </div>
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search conversations..." 
          class="w-full pl-10 pr-4 py-3 bg-gray-100 border-0 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black transition-all"
          data-testid="chat-search-input"
        />
      </div>
    </div>

    <!-- Chat List -->
    <div class="flex-1 overflow-y-auto">
      <!-- Empty State -->
      <div v-if="filteredChats.length === 0" class="flex flex-col items-center justify-center h-64 text-gray-500">
        <svg class="w-16 h-16 mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
          <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
        </svg>
        <p class="text-sm">{{ searchQuery ? 'No conversations found' : 'No conversations yet' }}</p>
        <p class="text-xs mt-1">{{ searchQuery ? 'Try a different search term' : 'Start a conversation by contacting someone' }}</p>
      </div>

      <!-- Chat Items -->
      <div v-else class="space-y-1 p-2">
        <div
          v-for="chat in filteredChats"
          :key="chat.id"
          @click="$emit('selectChat', chat)"
          :class="[
            'flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 group',
            selectedChatId === chat.id 
              ? 'bg-black text-white' 
              : 'hover:bg-gray-50'
          ]"
          data-testid="chat-room-item"
        >
          <!-- Avatar -->
          <div class="relative flex-shrink-0 mr-3">
            <div class="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center font-medium text-gray-700">
              {{ getInitials(chat.name) }}
            </div>
            <!-- Online indicator -->
            <div class="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>

          <!-- Chat Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1">
              <h3 :class="[
                'font-semibold text-sm truncate',
                selectedChatId === chat.id ? 'text-white' : 'text-gray-900'
              ]">
                {{ chat.name }}
              </h3>
              <div class="flex items-center gap-2">
                <!-- Timestamp -->
                <span :class="[
                  'text-xs',
                  selectedChatId === chat.id ? 'text-gray-300' : 'text-gray-500'
                ]">
                  {{ formatTime(chat.time) }}
                </span>
                <!-- Unread Badge -->
                <div 
                  v-if="chat.newMessageCount > 0"
                  :class="[
                    'flex items-center justify-center min-w-[20px] h-5 rounded-full text-xs font-medium',
                    selectedChatId === chat.id 
                      ? 'bg-white text-black' 
                      : 'bg-black text-white'
                  ]"
                  data-testid="unread-count"
                >
                  {{ chat.newMessageCount > 99 ? '99+' : chat.newMessageCount }}
                </div>
              </div>
            </div>
            
            <!-- Last Message -->
            <div class="flex items-center justify-between">
              <p :class="[
                'text-sm truncate mr-2',
                selectedChatId === chat.id ? 'text-gray-200' : 'text-gray-600'
              ]">
                {{ chat.lastMessage || 'No messages yet' }}
              </p>
              
              <!-- Message Status Icons -->
              <div class="flex items-center gap-1">
                <!-- Delivered/Read status for sent messages -->
                <svg 
                  v-if="chat.lastMessage && isOwnMessage(chat)"
                  :class="[
                    'w-4 h-4',
                    selectedChatId === chat.id ? 'text-gray-300' : 'text-gray-400'
                  ]" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                </svg>
                
                <!-- Muted indicator -->
                <svg 
                  v-if="chat.isMuted" 
                  :class="[
                    'w-4 h-4',
                    selectedChatId === chat.id ? 'text-gray-300' : 'text-gray-400'
                  ]"
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.146 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.146l4.237-3.816a1 1 0 011.617.816zM11.414 9.414a1 1 0 011.414 0L14 10.586l1.172-1.172a1 1 0 111.414 1.414L15.414 12l1.172 1.172a1 1 0 11-1.414 1.414L14 13.414l-1.172 1.172a1 1 0 11-1.414-1.414L12.586 12l-1.172-1.172a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer with Total Unread Count -->
    <div v-if="totalUnreadCount > 0" class="px-4 py-3 border-t border-gray-100 bg-gray-50">
      <div class="flex items-center justify-center">
        <span class="text-sm text-gray-600">
          {{ totalUnreadCount }} unread message{{ totalUnreadCount === 1 ? '' : 's' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowLeft } from 'lucide-vue-next'
import type { Chat } from '@/interfaces/chat'

interface Props {
  chats: Chat[]
  selectedChatId?: string
  totalUnreadCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  totalUnreadCount: 0
})

defineEmits<{
  selectChat: [chat: Chat]
  goBack: []
}>()

const searchQuery = ref('')

const filteredChats = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.chats
  }
  
  const query = searchQuery.value.toLowerCase()
  return props.chats.filter(chat => 
    chat.name.toLowerCase().includes(query) ||
    chat.lastMessage.toLowerCase().includes(query)
  )
})

const getInitials = (name: string) => {
  if (!name) return '?'
  
  const words = name.trim().split(' ')
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase()
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
}

const formatTime = (timeString: string) => {
  if (!timeString) return ''
  
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
    const isThisWeek = (now.getTime() - date.getTime()) < (7 * 24 * 60 * 60 * 1000)
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    } else if (isThisWeek) {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short'
      })
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      })
    }
  } catch {
    return timeString
  }
}

const isOwnMessage = (chat: Chat) => {
  // This would typically check if the last message was sent by the current user
  // For now, we'll return false, but this should be enhanced based on actual message data
  return false
}
</script>