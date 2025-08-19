<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
const router = useRouter()
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

// Helper function to get other participant info for direct chats
const getOtherParticipant = (room: any, participants: any[]) => {
  if (!authStore.user?.id || !room || !participants) return null
  
  // For direct chats, find the other participant (not the current user)
  if (room.roomType === 'DIRECT' || room.roomType === 'direct') {
    const otherParticipantId = room.participants?.find((id: string) => id !== authStore.user?.id)
    if (otherParticipantId) {
      // Look for participant info in current participants
      const participantInfo = participants.find(p => p.userId === otherParticipantId)
      if (participantInfo) {
        console.log('👤 Found participant info:', {
          userId: participantInfo.userId,
          userName: participantInfo.userName,
          lastSeenAt: participantInfo.lastSeenAt,
          isOnline: isParticipantOnline(participantInfo)
        })
        return {
          id: otherParticipantId,
          name: participantInfo.userName || 'Unknown User',
          avatar: participantInfo.userAvatar,
          isOnline: isParticipantOnline(participantInfo),
          lastSeen: participantInfo.lastSeenAt
        }
      } else {
        console.log('👤 No participant info found for:', otherParticipantId, 'in participants:', participants.map(p => p.userId))
      }
    }
  }
  
  // For group chats or when participant info is not available
  return {
    id: room.id,
    name: room.name || 'Group Chat',
    avatar: room.avatarUrl,
    isOnline: false,
    lastSeen: null
  }
}

// Helper function to determine if participant is online
const isParticipantOnline = (participant: any) => {
  if (!participant?.lastSeenAt) return false
  const lastSeen = new Date(participant.lastSeenAt)
  const now = new Date()
  const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60)
  return diffMinutes < 5 // Consider online if seen within 5 minutes
}

// Computed properties for chat data
const recentChats = computed(() => {
  console.log('🔄 Computing recentChats, chatStore.chatRooms:', chatStore.chatRooms)
  const result = chatStore.chatRooms.map(room => {
    // For direct chats, try to get the other participant's name
    let displayName = 'Chat'
    
    if (room.roomType === 'DIRECT' || room.roomType === 'direct') {
      // For direct chats, find the other participant
      const otherParticipantId = room.participants?.find((id: string) => id !== authStore.user?.id)
      
      // If this is the current room, we have participant info
      if (room.id === chatStore.currentRoom?.id && otherParticipantId) {
        const participantInfo = chatStore.currentParticipants.find(p => p.userId === otherParticipantId)
        if (participantInfo?.userName) {
          displayName = participantInfo.userName
        }
      }
      
      // Fallback: use last message sender name if it's not the current user
      if (displayName === 'Chat' && room.lastMessage?.senderName && room.lastMessage.senderId !== authStore.user?.id) {
        displayName = room.lastMessage.senderName
      }
    } else {
      // For group chats, use room name
      displayName = room.name || 'Group Chat'
    }
    
    // Generate avatar based on initials of the display name
    const getInitials = (name: string) => {
      if (!name) return '?';
      const words = name.trim().split(' ');
      if (words.length === 1) {
        return words[0].charAt(0).toUpperCase();
      }
      return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    };
    
    // Get online status if this is the current room
    let isOnline = false
    let lastSeen = null
    if (room.id === chatStore.currentRoom?.id) {
      const otherParticipantId = room.participants?.find((id: string) => id !== authStore.user?.id)
      if (otherParticipantId) {
        const participantInfo = chatStore.currentParticipants.find(p => p.userId === otherParticipantId)
        if (participantInfo) {
          isOnline = isParticipantOnline(participantInfo)
          lastSeen = participantInfo.lastSeenAt
        }
      }
    }
    
    const chatItem = {
      id: room.id, // Keep as string to match backend
      name: displayName,
      avatar: room.avatarUrl || `initials:${getInitials(displayName)}`, // Prefix to indicate initials
      lastMessage: room.lastMessage?.content || 'No messages yet',
      time: room.lastMessageAt ? new Date(room.lastMessageAt).toLocaleString() : '',
      hasNewMessage: (room.unreadCount || 0) > 0,
      newMessageCount: room.unreadCount || 0,
      isOnline,
      lastSeen
    }
    
    console.log('📝 Chat item processed:', chatItem)
    return chatItem
  })
  
  console.log('✅ Recent chats computed, result:', result)
  return result
})

const chatMessages = computed(() => {
  console.log('🔄 Computing chatMessages, current messages count:', chatStore.currentMessages.length)
  
  const messages = chatStore.currentMessages.map(msg => {
    let replyTo = undefined

    // First try to use server-provided reply data
    if (msg.replyToMessage) {
      replyTo = {
        id: msg.replyToMessage.id,
        sender: msg.replyToMessage.senderName || 'Unknown',
        content: msg.replyToMessage.content || ''
      }
      console.log('✅ Using server-provided reply data for message:', msg.id)
    } 
    // Fallback to client-side resolution if server doesn't provide it
    else if (msg.replyToId) {
      const repliedToMessage = chatStore.currentMessages.find(m => m.id === msg.replyToId)
      if (repliedToMessage) {
        replyTo = {
          id: repliedToMessage.id,
          sender: repliedToMessage.senderName || 'Unknown',
          content: repliedToMessage.content || ''
        }
        console.log('✅ Using client-side resolved reply data for message:', msg.id)
      } else {
        // If replied-to message not found in current messages, show placeholder
        replyTo = {
          id: msg.replyToId,
          sender: 'Unknown',
          content: '[Message not loaded]'
        }
        console.log('⚠️ Could not resolve reply relationship for message:', msg.id, 'replyToId:', msg.replyToId, '- showing placeholder')
      }
    }

    const transformedMessage = {
      id: msg.id, // Keep as string to match backend
      sender: msg.senderName || 'Unknown',
      message: msg.content || '',
      time: new Date(msg.sentAt).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      }),
      isOwn: msg.senderId === authStore.user?.id,
      replyTo
    }

    return transformedMessage
  })

  console.log('✅ Computed chatMessages complete, messages with replies:', 
    messages.filter(m => m.replyTo).length, '/', messages.length)
  
  return messages
})

const selectedChat = computed(() => {
  if (!chatStore.currentRoom) return null
  
  // Get other participant info for direct chats
  const otherParticipant = getOtherParticipant(chatStore.currentRoom, chatStore.currentParticipants)
  
  // Generate avatar based on initials if no avatar available
  const getInitials = (name: string) => {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };
  
  const displayName = otherParticipant?.name || 'Chat'
  const avatarUrl = otherParticipant?.avatar || `initials:${getInitials(displayName)}`
  
  return {
    id: chatStore.currentRoom.id,
    name: displayName,
    avatar: avatarUrl,
    lastMessage: 'No messages yet',
    time: chatStore.currentRoom.lastMessageAt ? new Date(chatStore.currentRoom.lastMessageAt).toLocaleString() : '',
    hasNewMessage: (chatStore.currentRoom.unreadCount || 0) > 0,
    newMessageCount: chatStore.currentRoom.unreadCount || 0,
    isOnline: otherParticipant?.isOnline || false,
    lastSeen: otherParticipant?.lastSeen || null
  }
})

// Reactive time reference that updates every minute
const currentTime = ref(new Date())

// Update current time every minute to refresh "last seen" calculations
const timeInterval = setInterval(() => {
  currentTime.value = new Date()
}, 60000) // Update every minute

// Computed property for chat status
const chatStatus = computed(() => {
  if (!selectedChat.value) return 'Offline'
  
  // Force reactivity by referencing currentTime
  const now = currentTime.value
  
  if (selectedChat.value.isOnline) {
    return 'Online'
  } else if (selectedChat.value.lastSeen) {
    const lastSeen = new Date(selectedChat.value.lastSeen)
    const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60)
    
    console.log('🕐 Computing last seen status:', {
      lastSeen: selectedChat.value.lastSeen,
      diffMinutes,
      now: now.toISOString()
    })
    
    if (diffMinutes < 1) {
      return 'Just now'
    } else if (diffMinutes < 60) {
      return `Last seen ${Math.floor(diffMinutes)} minute${Math.floor(diffMinutes) === 1 ? '' : 's'} ago`
    } else if (diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60)
      return `Last seen ${hours} hour${hours === 1 ? '' : 's'} ago`
    } else {
      const days = Math.floor(diffMinutes / 1440)
      return `Last seen ${days} day${days === 1 ? '' : 's'} ago`
    }
  }
  
  return 'Offline'
})

// State
const message = ref("")
const attachedFiles = ref<File[]>([])
const replyToMessage = ref<Message | null>(null)
const messagesContainer = ref<HTMLElement | null>(null)
const scrollAnchor = ref<HTMLElement | null>(null)

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

// Scroll to bottom utility
const scrollToBottom = async (force = false) => {
  await nextTick()
  
  // Try multiple times with delays to ensure DOM is ready
  for (let i = 0; i < 3; i++) {
    if (messagesContainer.value) {
      const container = messagesContainer.value
      const shouldScroll = force || 
        (container.scrollTop + container.clientHeight >= container.scrollHeight - 100)
      
      if (shouldScroll) {
        // Always use scrollTo with smooth behavior for consistency
        const targetScroll = container.scrollHeight
        console.log('📜 Scrolling to:', targetScroll, 'from current:', container.scrollTop)
        
        container.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        })
        console.log('📜 Smooth scrolled to bottom, attempt:', i + 1)
        break
      } else if (!force) {
        console.log('📜 Skip scroll - user not at bottom (scrollTop:', container.scrollTop, 'clientHeight:', container.clientHeight, 'scrollHeight:', container.scrollHeight, ')')
      }
    }
    
    if (i < 2) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
}

// Watch for new messages and scroll to bottom
watch(() => chatStore.currentMessages.length, async (newLength, oldLength) => {
  if (newLength > oldLength) {
    console.log('📨 New message detected, scrolling to bottom')
    
    // Use the same approach as sent messages with a slight delay
    setTimeout(async () => {
      if (messagesContainer.value) {
        const container = messagesContainer.value
        const scrollTop = container.scrollTop
        const clientHeight = container.clientHeight
        const scrollHeight = container.scrollHeight
        const isNearBottom = scrollTop + clientHeight >= scrollHeight - 150
        
        console.log('📜 Received message scroll check:', {
          scrollTop,
          clientHeight, 
          scrollHeight,
          isNearBottom,
          threshold: scrollHeight - 150,
          currentPosition: scrollTop + clientHeight
        })
        
        if (isNearBottom) {
          // User is near bottom, smooth scroll to show new message
          console.log('📜 User is near bottom, smooth scrolling to show new message')
          await scrollToBottom(false)
        } else {
          console.log('📜 User scrolled up, not auto-scrolling for new message')
        }
      }
    }, 100)
  }
})

// Watch for current room changes and scroll to bottom
watch(() => chatStore.currentRoom?.id, async (newRoomId, oldRoomId) => {
  if (newRoomId && newRoomId !== oldRoomId) {
    console.log('🏠 Room changed, scrolling to bottom after delay')
    // Wait a bit longer for messages to load when changing rooms
    setTimeout(async () => {
      await scrollToBottom(true) // Force scroll when changing rooms
    }, 300)
  }
})

// Watch for messages content changes (in case messages are replaced)
watch(() => chatStore.currentMessages, async () => {
  // Small delay to ensure DOM updates
  setTimeout(async () => {
    await scrollToBottom(true)
  }, 100)
}, { deep: true, flush: 'post' })

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
    
    // Ensure scroll to bottom after room is set and messages loaded
    setTimeout(async () => {
      await scrollToBottom(true)
      console.log('🎯 Manual scroll after room selection')
    }, 500)
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
      
      // Scroll to bottom after sending - smooth scroll
      setTimeout(async () => {
        await scrollToBottom(false)
        console.log('📤 Smooth scroll after sending message')
      }, 100)
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
      await chatStore.editMessage({ messageId, content: newContent })
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
    
    // Ensure scroll to bottom after initial load
    setTimeout(async () => {
      await scrollToBottom(true)
      console.log('🎯 Initial scroll after mount')
    }, 800)
  } catch (error) {
    console.error('Failed to initialize chat:', error)
  }
})

// Clean up subscriptions when component unmounts
onUnmounted(() => {
  chatStore.disableSubscriptions()
  // Clear the time interval
  if (timeInterval) {
    clearInterval(timeInterval)
  }
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
        @goBack="router.back()"
      />

      <!-- Main Chat Area -->
      <div class="flex-1 flex flex-col bg-white">
        <template v-if="selectedChat">
          <!-- Chat Header -->
          <ChatHeader
            :chat="selectedChat"
            :status="chatStatus"
            :user-type="(authStore.user?.accountType?.toLowerCase() as 'prestataire' | 'assureur' | undefined)"
            @create-mission="handleCreateMission"
            @search="handleSearch"
            @show-more="handleShowMore"
          />

          <!-- Chat Messages -->
          <div ref="messagesContainer" class="flex-1 overflow-auto bg-gray-50 scroll-smooth">
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
              
              <!-- Scroll anchor -->
              <div ref="scrollAnchor" class="h-1"></div>
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