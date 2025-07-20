<template>
  <div class="flex items-center justify-between p-4 border-b bg-white" data-testid="chat-header">
    <div class="flex items-center gap-3">
      <UserAvatar 
        :name="chat.name" 
        :avatar="chat.avatar" 
        :size="44"
      />
      <div>
        <h3 class="font-semibold text-lg" data-testid="chat-contact-name">{{ chat.name }}</h3>
        <p class="text-sm text-gray-500" data-testid="chat-status">{{ status }}</p>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <!-- Mission button for assureurs -->
      <button 
        v-if="userType === 'assureur'"
        @click="$emit('createMission')"
        class="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
        title="Create mission"
        data-testid="create-mission-button"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2L3 7v11a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V7l-7-5z"/>
        </svg>
        Mission
      </button>
      
      <!-- Search in conversation -->
      <button 
        @click="$emit('search')"
        class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        title="Search in conversation"
        data-testid="search-button"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
        </svg>
      </button>
      
      <!-- More options -->
      <button 
        @click="$emit('showMore')"
        class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        title="More options"
        data-testid="more-options-button"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import UserAvatar from '../UserAvatar.vue'
import type { Chat } from '@/interfaces/chat'

interface Props {
  chat: Chat
  status?: string
  userType?: 'assureur' | 'prestataire'
}

withDefaults(defineProps<Props>(), {
  status: 'Online',
  userType: 'assureur'
})

defineEmits<{
  createMission: []
  search: []
  showMore: []
}>()
</script>