<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { useSubscription } from '@vue/apollo-composable'
import { useRoute } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import ChatSidebar from '@/components/chat/ChatSidebar.vue'
import ChatHeader from '@/components/chat/ChatHeader.vue'
import ChatMessage from '@/components/chat/ChatMessage.vue'
import ChatInput from '@/components/chat/ChatInput.vue'
import TypingIndicator from '@/components/chat/TypingIndicator.vue'
import type { Chat, Message } from '@/interfaces/chat'
import { ChatMessageType, RoomType } from '@/interfaces/chat'
import { CHAT_EVENTS } from '@/graphql/subscriptions/new-messages'

console.log('🚀 ChatPage setup function started')

const route = useRoute()
const chatStore = useChatStore()
const authStore = useAuthStore()

console.log('✅ ChatPage stores initialized')

// Subscription state
const subscriptionEnabled = ref(false)
const currentRoomIds = computed(() => chatStore.chatRooms.map(room => room.id))

// Initialize subscription with proper Vue scope
const { onResult: onChatEvent } = useSubscription(
  CHAT_EVENTS,
  () => ({ roomIds: currentRoomIds.value }),
  () => ({ enabled: subscriptionEnabled.value && currentRoomIds.value.length > 0 })
)

// Handle chat events
onChatEvent((result: any) => {
  console.log('📡 Subscription result received:', result)
  
  if (result.data?.chatEvents) {
    const event = result.data.chatEvents
    console.log('🎯 Chat event received:', event)
    
    // Handle different event types
    if (event.eventType === 'NEW_MESSAGE') {
      try {
        const messageData = JSON.parse(event.data)
        console.log('💬 New message data:', messageData)
        
        // Add to current messages if it's for the current room
        if (chatStore.currentRoom && event.roomId === chatStore.currentRoom.id) {
          console.log('➕ Adding message to current room messages')
          chatStore.currentMessages.push(messageData)
        } else {
          console.log('📤 Message for different room or no current room')
        }

        // Update room's last message
        const roomIndex = chatStore.chatRooms.findIndex(r => r.id === event.roomId)
        if (roomIndex !== -1) {
          const currentUnreadCount = chatStore.chatRooms[roomIndex].unreadCount || 0
          const newUnreadCount = chatStore.currentRoom?.id !== event.roomId ? currentUnreadCount + 1 : currentUnreadCount
          
          console.log('🔄 Updating room last message in sidebar')
          chatStore.chatRooms[roomIndex] = {
            ...chatStore.chatRooms[roomIndex],
            lastMessage: messageData,
            lastMessageAt: messageData.sentAt,
            unreadCount: newUnreadCount
          }
        }
      } catch (parseError) {
        console.error('❌ Error parsing message data:', parseError)
      }
    }
  }
})

// Initialize chat based on route parameters
const initializeChatFromRoute = async () => {
  const { missionId, prestataireId, contactName, contactPerson, type } = route.query
  
  try {
    if (prestataireId && type === 'prestataire') {
      console.log('Creating/getting direct room with prestataire:', prestataireId)
      // Create or get direct room with prestataire
      const room = await chatStore.getOrCreateDirectRoom(prestataireId as string)
      if (room) {
        console.log('Room created/found, setting as current:', room.id)
        await chatStore.setCurrentRoom(room.id)
        
        // Reload chat rooms to ensure the new room appears in the sidebar
        await chatStore.loadChatRooms()
        
        // Enable subscriptions now that we have rooms
        console.log('🔔 Enabling subscriptions for rooms:', chatStore.chatRooms.length)
        subscriptionEnabled.value = true
      } else {
        console.error('Failed to create/get direct room')
      }
    } else if (missionId && type === 'mission') {
      console.log('Mission chat requested for:', { missionId, contactName })
      // For mission-based chat, we could create a group room or use direct messaging
      // For now, we'll treat it as a direct room if we have a specific contact person
      if (contactPerson) {
        const room = await chatStore.getOrCreateDirectRoom(contactPerson as string)
        if (room) {
          await chatStore.setCurrentRoom(room.id)
          await chatStore.loadChatRooms()
          console.log('🔔 Enabling subscriptions for mission chat')
          subscriptionEnabled.value = true
        }
      } else {
        console.warn('Mission chat requires contactPerson parameter')
      }
    }
  } catch (error) {
    console.error('Error initializing chat from route:', error)
  }
}

// Computed properties for chat data
const recentChats = computed(() => {
  return chatStore.chatRooms.map(room => ({
    id: room.id, // Keep as string to match backend
    name: room.name || 'Chat',
    avatar: room.avatarUrl || "/placeholder.svg?height=40&width=40",
    lastMessage: room.lastMessage?.content || 'No messages yet',
    time: room.lastMessageAt ? new Date(room.lastMessageAt).toLocaleString() : '',
    hasNewMessage: (room.unreadCount || 0) > 0,
    newMessageCount: room.unreadCount || 0,
  }))
})

const chatMessages = computed(() => {
  return chatStore.currentMessages.map(msg => ({
    id: msg.id, // Keep as string to match backend
    sender: msg.senderName || 'Unknown',
    message: msg.content || '',
    time: new Date(msg.sentAt).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    }),
    isOwn: msg.senderId === authStore.user?.id,
  }))
})

const selectedChat = computed(() => {
  if (!chatStore.currentRoom) return null
  
  return {
    id: chatStore.currentRoom.id, // Keep as string to match backend
    name: chatStore.currentRoom.name || 'Chat',
    avatar: chatStore.currentRoom.avatarUrl || "/placeholder.svg?height=40&width=40",
    lastMessage: chatStore.currentRoom.lastMessageAt?.content || 'No messages yet',
    time: chatStore.currentRoom.lastMessageAt ? new Date(chatStore.currentRoom.lastMessageAt).toLocaleString() : '',
    hasNewMessage: (chatStore.currentRoom.unreadCount || 0) > 0,
    newMessageCount: chatStore.currentRoom.unreadCount || 0,
  }
})

// State
const message = ref("")
const isTyping = ref(false)
const attachedFiles = ref<File[]>([])

// Methods
const handleSelectChat = async (chat: Chat) => {
  const room = chatStore.chatRooms.find(r => r.id === chat.id)
  if (room) {
    await chatStore.setCurrentRoom(room.id)
  }
}

const handleSendMessage = async (messageText: string, files: File[]) => {
  if (!chatStore.currentRoom) return
  
  if (messageText.trim() || files.length > 0) {
    try {
      // Handle file uploads first if there are any
      const fileAttachments: string[] = []
      
      if (files.length > 0) {
        // TODO: Implement file upload logic
        console.log("File upload not yet implemented", files)
      }

      // Send text message
      if (messageText.trim()) {
        await chatStore.sendMessage({
          roomId: chatStore.currentRoom.id,
          content: messageText,
          messageType: ChatMessageType.TEXT,
          fileAttachments
        })
      }

      // Clear input
      message.value = ""
      attachedFiles.value = []
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }
}

const handleCall = () => {
  if (selectedChat.value) {
    console.log("Starting voice call with", selectedChat.value.name)
  }
}

const handleVideoCall = () => {
  if (selectedChat.value) {
    console.log("Starting video call with", selectedChat.value.name)
  }
}

const handleShowMore = () => {
  if (selectedChat.value) {
    console.log("Showing more options for", selectedChat.value.name)
  }
}

const handleTyping = async (isTyping: boolean) => {
  if (chatStore.currentRoom) {
    await chatStore.setTypingIndicator(chatStore.currentRoom.id, isTyping)
  }
}

// Watch for route changes
watch(() => route.query, () => {
  initializeChatFromRoute()
}, { immediate: false })

console.log('🔧 Setting up onMounted hook')

// Initialize chat
onMounted(async () => {
  console.log('🚀 onMounted started')
  try {
    // Load all chat rooms first
    console.log('🔄 About to call loadChatRooms')
    await chatStore.loadChatRooms()
    console.log('✅ loadChatRooms completed successfully')
    
    // Enable subscriptions if we have rooms
    if (chatStore.chatRooms.length > 0) {
      console.log('🔔 Enabling subscriptions for existing rooms:', chatStore.chatRooms.length)
      subscriptionEnabled.value = true
    } else {
      console.log('📭 No existing rooms, subscriptions disabled')
    }
    
    // Initialize chat from route parameters if provided
    await initializeChatFromRoute()
    
    // If no room selected and we have rooms, select the first one
    if (!chatStore.currentRoom && chatStore.chatRooms.length > 0) {
      await chatStore.setCurrentRoom(chatStore.chatRooms[0].id)
    }
  } catch (error) {
    console.error('Failed to initialize chat:', error)
  }
})

// Clean up subscription when component unmounts
onUnmounted(() => {
  subscriptionEnabled.value = false
})
</script>

<template>
  <div class="flex h-screen w-full">
    <!-- Loading State -->
    <div v-if="chatStore.isLoading" class="flex items-center justify-center w-full">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Loading chat...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="chatStore.error" class="flex items-center justify-center w-full">
      <div class="text-center text-red-600">
        <p class="text-lg font-semibold mb-2">Error</p>
        <p>{{ chatStore.error }}</p>
      </div>
    </div>

    <!-- Chat Interface -->
    <template v-else>
      <!-- Sidebar -->
      <ChatSidebar
        :chats="recentChats"
        :selectedChatId="selectedChat?.id"
        :totalUnreadCount="chatStore.totalUnreadCount"
        @selectChat="handleSelectChat"
      />

      <!-- Main Chat Area -->
      <div class="w-[80%] flex flex-col bg-background">
        <template v-if="selectedChat">
          <!-- Chat Header -->
          <ChatHeader
            :chat="selectedChat"
            @call="handleCall"
            @videoCall="handleVideoCall"
            @showMore="handleShowMore"
          />

          <!-- Chat Messages -->
          <div class="flex-1 p-4 overflow-auto">
            <div class="space-y-4">
              <ChatMessage
                v-for="msg in chatMessages"
                :key="msg.id"
                :message="msg"
              />
              
              <!-- Typing Indicator -->
              <TypingIndicator :isVisible="isTyping" />
            </div>
          </div>

          <!-- Chat Input -->
          <ChatInput
            v-model="message"
            v-model:attachedFiles="attachedFiles"
            @send="handleSendMessage"
            @typing="handleTyping"
          />
        </template>

        <!-- No Chat Selected -->
        <div v-else class="flex items-center justify-center h-full">
          <div class="text-center text-gray-500">
            <p class="text-lg">Select a conversation to start chatting</p>
            <p class="text-sm mt-2">Choose from your existing conversations or start a new one</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>