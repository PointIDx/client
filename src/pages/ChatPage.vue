<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ChatSidebar from '@/components/chat/ChatSidebar.vue'
import ChatHeader from '@/components/chat/ChatHeader.vue'
import ChatMessage from '@/components/chat/ChatMessage.vue'
import ChatInput from '@/components/chat/ChatInput.vue'
import TypingIndicator from '@/components/chat/TypingIndicator.vue'
import type { Chat, Message } from '@/interfaces/chat'

// Mock data for recent chats
const recentChats = ref<Chat[]>([
  {
    id: 1,
    name: "Alice Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Hey! How are you doing?",
    time: "2m ago",
    hasNewMessage: true,
    newMessageCount: 3,
  },
  {
    id: 2,
    name: "Bob Smith",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Thanks for the help earlier",
    time: "1h ago",
    hasNewMessage: false,
    newMessageCount: 0,
  },
  {
    id: 3,
    name: "Carol Davis",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "See you tomorrow!",
    time: "3h ago",
    hasNewMessage: true,
    newMessageCount: 1,
  },
  {
    id: 4,
    name: "David Wilson",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "The project looks great",
    time: "1d ago",
    hasNewMessage: false,
    newMessageCount: 0,
  },
  {
    id: 5,
    name: "Emma Brown",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Can we reschedule?",
    time: "2d ago",
    hasNewMessage: false,
    newMessageCount: 0,
  },
])

// Mock data for current chat messages
const chatMessages = ref<Message[]>([
  {
    id: 1,
    sender: "Alice Johnson",
    message: "Hey! How are you doing?",
    time: "10:30 AM",
    isOwn: false,
  },
  {
    id: 2,
    sender: "You",
    message: "I'm doing great! Just working on some projects. How about you?",
    time: "10:32 AM",
    isOwn: true,
  },
  {
    id: 3,
    sender: "Alice Johnson",
    message: "Same here! I've been busy with the new design system we discussed.",
    time: "10:33 AM",
    isOwn: false,
  },
  {
    id: 4,
    sender: "Alice Johnson",
    message: "Would love to get your feedback on it when you have time.",
    time: "10:33 AM",
    isOwn: false,
  },
  {
    id: 5,
    sender: "You",
    message: "I'd be happy to take a look. Can you share the link?",
    time: "10:35 AM",
    isOwn: true,
  },
])

// State
const selectedChat = ref<Chat>(recentChats.value[0])
const message = ref("")
const isTyping = ref(false)
const attachedFiles = ref<File[]>([])

// Methods
const handleSelectChat = (chat: Chat) => {
  selectedChat.value = chat
  // Could load messages for the selected chat here
}

const handleSendMessage = (messageText: string, files: File[]) => {
  if (messageText.trim() || files.length > 0) {
    console.log("Sending message:", messageText, "Files:", files)
    
    // Add message to chat messages
    const newMessage: Message = {
      id: chatMessages.value.length + 1,
      sender: "You",
      message: messageText,
      time: new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      }),
      isOwn: true,
    }
    
    chatMessages.value.push(newMessage)
    
    // Update last message in chat list
    const chatIndex = recentChats.value.findIndex(c => c.id === selectedChat.value.id)
    if (chatIndex !== -1) {
      recentChats.value[chatIndex].lastMessage = messageText || `Sent ${files.length} file(s)`
      recentChats.value[chatIndex].time = "now"
    }
  }
}

const handleCall = () => {
  console.log("Starting voice call with", selectedChat.value.name)
}

const handleVideoCall = () => {
  console.log("Starting video call with", selectedChat.value.name)
}

const handleShowMore = () => {
  console.log("Showing more options for", selectedChat.value.name)
}

// Simulate typing indicator
onMounted(() => {
  setTimeout(() => {
    isTyping.value = true
    setTimeout(() => {
      isTyping.value = false
    }, 3000)
  }, 2000)
})
</script>

<template>
  <div class="flex h-screen w-full">
    <!-- Sidebar -->
    <ChatSidebar
      :chats="recentChats"
      :selectedChatId="selectedChat.id"
      @selectChat="handleSelectChat"
    />

    <!-- Main Chat Area -->
    <div class="w-[80%] flex flex-col bg-background">
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
      />
    </div>
  </div>
</template>