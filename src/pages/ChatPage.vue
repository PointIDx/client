<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted, nextTick } from 'vue'
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

console.log('🚀 ChatPage setup function started')

const route = useRoute()
const chatStore = useChatStore()
const authStore = useAuthStore()

console.log('✅ ChatPage stores initialized')

// Initialize chat based on route parameters
const initializeChatFromRoute = async () => {
  const { missionId, prestataireId, contactName, contactPerson, type } = route.query
  
  console.log('🔍 initializeChatFromRoute called with route.query:', route.query)
  
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
        
        // Subscriptions are already enabled globally
        console.log('✅ Subscriptions already enabled for new room')
        
        // Subscribe to specific room events
        chatStore.subscribeToRoomEvents(room.id)
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
          
          // Subscriptions are already enabled globally
          console.log('✅ Subscriptions already enabled for mission chat')
          
          // Subscribe to specific room events
          chatStore.subscribeToRoomEvents(room.id)
        }
      } else {
        console.warn('Mission chat requires contactPerson parameter')
      }
    } else {
      console.log('No specific route parameters for chat initialization')
    }
  } catch (error) {
    console.error('Error initializing chat from route:', error)
  }
}

// Computed properties for chat data
const recentChats = computed(() => {
  console.log('🔄 Computing recentChats, chatStore.chatRooms:', chatStore.chatRooms)
  const result = chatStore.chatRooms.map(room => {
    // Use sender name from last message if available, otherwise fallback to room name or default
    const displayName = (room.lastMessage?.senderName && room.lastMessage.senderName.trim() !== '') 
      ? room.lastMessage.senderName 
      : (room.name && room.name.trim() !== '' ? room.name : 'Chat');
    
    // Generate avatar based on initials of the display name
    const getInitials = (name: string) => {
      if (!name) return '?';
      const words = name.trim().split(' ');
      if (words.length === 1) {
        return words[0].charAt(0).toUpperCase();
      }
      return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    };
    
    const chatItem = {
      id: room.id, // Keep as string to match backend
      name: displayName,
      avatar: room.avatarUrl || `initials:${getInitials(displayName)}`, // Prefix to indicate initials
      lastMessage: room.lastMessage?.content || 'No messages yet',
      time: room.lastMessageAt ? new Date(room.lastMessageAt).toLocaleString() : '',
      hasNewMessage: (room.unreadCount || 0) > 0,
      newMessageCount: room.unreadCount || 0,
    }
    
    console.log('📝 Chat item processed:', chatItem)
    return chatItem
  })
  
  console.log('✅ Recent chats computed, result:', result)
  return result
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
  
  // Use last message sender name if available, otherwise fallback to room name or default
  const displayName = ((chatStore.currentRoom as any).lastMessage?.senderName && (chatStore.currentRoom as any).lastMessage?.senderName.trim() !== '') 
    ? (chatStore.currentRoom as any).lastMessage?.senderName 
    : (chatStore.currentRoom.name && chatStore.currentRoom.name.trim() !== '' ? chatStore.currentRoom.name : 'Chat');
  
  // Generate avatar based on initials of the display name
  const getInitials = (name: string) => {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };
  
  return {
    id: chatStore.currentRoom.id, // Keep as string to match backend
    name: displayName,
    avatar: chatStore.currentRoom.avatarUrl || `initials:${getInitials(displayName)}`, // Prefix to indicate initials
    lastMessage: 'No messages yet',
    time: chatStore.currentRoom.lastMessageAt ? new Date(chatStore.currentRoom.lastMessageAt).toLocaleString() : '',
    hasNewMessage: (chatStore.currentRoom.unreadCount || 0) > 0,
    newMessageCount: chatStore.currentRoom.unreadCount || 0,
  }
})

// State
const message = ref("")
const attachedFiles = ref<File[]>([])
const replyToMessage = ref<Message | null>(null)

// Computed properties for real-time state
const isTyping = computed(() => {
  return chatStore.currentTypingUsers.length > 0
})

const isOnline = computed(() => {
  return chatStore.isOnline
})

const typingUserNames = computed(() => {
  return chatStore.currentTypingUsers.map(userId => {
    // Find user name from participants or use userId as fallback
    const participant = chatStore.currentParticipants.find(p => p.userId === userId)
    return participant?.userName || `User ${userId}`
  })
})

// Methods
const handleSelectChat = async (chat: Chat) => {
  const room = chatStore.chatRooms.find(r => r.id === chat.id)
  if (room) {
    // Unsubscribe from previous room events
    if (chatStore.currentRoom) {
      chatStore.unsubscribeFromRoomEvents(chatStore.currentRoom.id)
    }
    
    await chatStore.setCurrentRoom(room.id)
    
    // Subscribe to new room events
    chatStore.subscribeToRoomEvents(room.id)
  }
}

const handleSendMessage = async (messageText: string, files: File[], replyTo?: Message) => {
  if (!chatStore.currentRoom) return
  
  if (messageText.trim() || files.length > 0) {
    try {
      // Handle file uploads first if there are any
      const fileAttachments: string[] = []
      
      if (files.length > 0) {
        // File upload functionality is implemented in the chat store
        // but not yet integrated here - would require upload service
        console.log("File upload pending integration with upload service", files)
      }

      // Send text message
      if (messageText.trim()) {
        await chatStore.sendMessage({
          roomId: chatStore.currentRoom.id,
          content: messageText,
          messageType: ChatMessageType.TEXT,
          fileAttachments,
          replyToId: replyTo?.id
        })
      }

      // Clear input
      message.value = ""
      attachedFiles.value = []
      replyToMessage.value = null
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }
}



const handleShowMore = () => {
  if (selectedChat.value) {
    console.log("Showing more options for", selectedChat.value.name)
  }
}

const handleTyping = async (isUserTyping: boolean) => {
  if (chatStore.currentRoom) {
    await chatStore.setTypingIndicator(chatStore.currentRoom.id, isUserTyping)
  }
}

const handleReply = (message: Message) => {
  replyToMessage.value = message
  // Focus the input after setting reply
  nextTick(() => {
    const inputElement = document.querySelector('[data-testid="message-input"]') as HTMLTextAreaElement
    if (inputElement) {
      inputElement.focus()
    }
  })
}

const handleEditMessage = async (messageId: string, newContent: string) => {
  // Edit message functionality is available in the chat store
  if (chatStore.currentRoom) {
    try {
      await chatStore.editMessage(messageId, newContent)
    } catch (error) {
      console.error('Failed to edit message:', error)
    }
  }
}

const clearReply = () => {
  replyToMessage.value = null
}

const handleCreateMission = () => {
  // Navigate to mission creation with current chat contact context
  if (selectedChat.value) {
    // Get prestataire info from current chat room participants
    const prestataireId = chatStore.currentRoom?.participants.find(p => p !== authStore.user?.id)
    if (prestataireId) {
      router.push({
        path: '/mission-creation',
        query: {
          prestataireId,
          type: 'prestataire',
          contactName: selectedChat.value.name
        }
      })
    }
  }
}

const handleSearch = () => {
  // Search functionality is available via searchChatMessages query
  // but would require UI implementation for search input/results
  console.log('Search functionality available but needs UI implementation')
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
    
    // Always enable subscriptions to listen for real-time events
    console.log('🔔 Enabling subscriptions for real-time chat events')
    chatStore.enableSubscriptions()
    
    // Initialize chat from route parameters if provided
    await initializeChatFromRoute()
    
    // If no room selected and we have rooms, select the first one
    if (!chatStore.currentRoom && chatStore.chatRooms.length > 0) {
      await chatStore.setCurrentRoom(chatStore.chatRooms[0].id)
      // Subscribe to the selected room events
      chatStore.subscribeToRoomEvents(chatStore.chatRooms[0].id)
    }
  } catch (error) {
    console.error('Failed to initialize chat:', error)
  }
})

// Clean up subscriptions when component unmounts
onUnmounted(() => {
  chatStore.disableSubscriptions()
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
      <div class="flex-1 flex flex-col bg-white">
        <template v-if="selectedChat">
          <!-- Chat Header -->
          <ChatHeader
            :chat="selectedChat"
            :user-type="(authStore.user?.accountType?.toLowerCase() as 'prestataire' | 'assureur' | undefined)"
            @create-mission="handleCreateMission"
            @search="handleSearch"
            @show-more="handleShowMore"
          />

          <!-- Chat Messages -->
          <div class="flex-1 overflow-auto bg-gray-50">
            <div class="p-4">
              <ChatMessage
                v-for="msg in chatMessages"
                :key="msg.id"
                :message="msg"
                @reply="handleReply"
                @edit="handleEditMessage"
              />
              
              <!-- Typing Indicator -->
              <TypingIndicator 
                :isVisible="isTyping" 
                :userNames="typingUserNames"
                :isOnline="isOnline"
              />
            </div>
          </div>

          <!-- Chat Input -->
          <ChatInput
            v-model="message"
            v-model:attachedFiles="attachedFiles"
            :reply-to-message="replyToMessage"
            @send="handleSendMessage"
            @typing="handleTyping"
            @clear-reply="clearReply"
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