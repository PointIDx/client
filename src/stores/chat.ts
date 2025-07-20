import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useApolloClient, useMutation, useQuery, useSubscription } from '@vue/apollo-composable'
import { 
  ChatRoom, 
  ChatMessage, 
  RoomParticipant, 
  ChatRoomWithLastMessage,
  CreateChatRoomInput,
  SendChatMessageInput,
  EditChatMessageInput,
  MarkMessageAsReadInput,
  SetTypingIndicatorInput,
  AddParticipantInput,
  RemoveParticipantInput,
  UpdateRoomInput,
  RoomType,
  ChatMessageType,
  ParticipantRole
} from '@/interfaces/chat'

// GraphQL Operations
import { GET_CHAT_ROOMS } from '@/graphql/queries/get-chat-rooms'
import { GET_CHAT_ROOM } from '@/graphql/queries/get-chat-room'
import { GET_CHAT_MESSAGES } from '@/graphql/queries/get-chat-messages'
import { GET_ROOM_PARTICIPANTS } from '@/graphql/queries/get-room-participants'
import { GET_OR_CREATE_DIRECT_ROOM } from '@/graphql/queries/get-or-create-direct-room'
import { SEARCH_CHAT_MESSAGES } from '@/graphql/queries/search-chat-messages'

import { CREATE_CHAT_ROOM } from '@/graphql/mutations/create-chat-room'
import { SEND_CHAT_MESSAGE } from '@/graphql/mutations/send-chat-message'
import { EDIT_CHAT_MESSAGE } from '@/graphql/mutations/edit-chat-message'
import { MARK_MESSAGE_AS_READ } from '@/graphql/mutations/mark-message-as-read'
import { MARK_ROOM_MESSAGES_AS_READ } from '@/graphql/mutations/mark-room-messages-as-read'
import { SET_TYPING_INDICATOR } from '@/graphql/mutations/set-typing-indicator'

import { CHAT_ROOM_EVENTS } from '@/graphql/subscriptions/chat-room-events'
import { NEW_MESSAGES } from '@/graphql/subscriptions/new-messages'

export const useChatStore = defineStore('chat', () => {
  // State
  const chatRooms = ref<ChatRoomWithLastMessage[]>([])
  const currentRoom = ref<ChatRoom | null>(null)
  const currentMessages = ref<ChatMessage[]>([])
  const currentParticipants = ref<RoomParticipant[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const typingUsers = ref<string[]>([])

  // Apollo client
  const { client } = useApolloClient()

  // Computed
  const totalUnreadCount = computed(() => {
    return chatRooms.value.reduce((total, room) => total + (room.unreadCount || 0), 0)
  })

  const currentRoomParticipants = computed(() => {
    return currentParticipants.value.filter(p => p.roomId === currentRoom.value?.id)
  })

  // Actions

  /**
   * Load all chat rooms for the current user
   */
  const loadChatRooms = async () => {
    try {
      isLoading.value = true
      error.value = null

      const { data } = await client.query({
        query: GET_CHAT_ROOMS,
        fetchPolicy: 'network-only'
      })

      chatRooms.value = data.getChatRooms || []
    } catch (err: any) {
      error.value = err.message || 'Failed to load chat rooms'
      console.error('Error loading chat rooms:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load a specific chat room
   */
  const loadChatRoom = async (roomId: string) => {
    try {
      isLoading.value = true
      error.value = null

      const { data } = await client.query({
        query: GET_CHAT_ROOM,
        variables: { roomId },
        fetchPolicy: 'network-only'
      })

      currentRoom.value = data.getChatRoom
      return data.getChatRoom
    } catch (err: any) {
      error.value = err.message || 'Failed to load chat room'
      console.error('Error loading chat room:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load messages for a specific room
   */
  const loadMessages = async (roomId: string, limit = 50, offset = 0) => {
    try {
      isLoading.value = true
      error.value = null

      const { data } = await client.query({
        query: GET_CHAT_MESSAGES,
        variables: { roomId, limit, offset },
        fetchPolicy: 'network-only'
      })

      if (offset === 0) {
        currentMessages.value = data.getChatMessages || []
      } else {
        currentMessages.value = [...(data.getChatMessages || []), ...currentMessages.value]
      }

      return data.getChatMessages || []
    } catch (err: any) {
      error.value = err.message || 'Failed to load messages'
      console.error('Error loading messages:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load participants for a specific room
   */
  const loadParticipants = async (roomId: string) => {
    try {
      const { data } = await client.query({
        query: GET_ROOM_PARTICIPANTS,
        variables: { roomId },
        fetchPolicy: 'network-only'
      })

      currentParticipants.value = data.getRoomParticipants || []
      return data.getRoomParticipants || []
    } catch (err: any) {
      error.value = err.message || 'Failed to load participants'
      console.error('Error loading participants:', err)
      return []
    }
  }

  /**
   * Get or create a direct room with another user
   */
  const getOrCreateDirectRoom = async (otherUserId: string) => {
    try {
      isLoading.value = true
      error.value = null

      const { data } = await client.query({
        query: GET_OR_CREATE_DIRECT_ROOM,
        variables: { otherUserId },
        fetchPolicy: 'network-only'
      })

      const room = data.getOrCreateDirectRoom
      
      // Add to rooms list if not already there
      const existingRoomIndex = chatRooms.value.findIndex(r => r.id === room.id)
      if (existingRoomIndex === -1) {
        chatRooms.value.unshift(room)
      }

      return room
    } catch (err: any) {
      error.value = err.message || 'Failed to get or create direct room'
      console.error('Error getting or creating direct room:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new chat room
   */
  const createChatRoom = async (input: CreateChatRoomInput) => {
    try {
      isLoading.value = true
      error.value = null

      const { mutate } = useMutation(CREATE_CHAT_ROOM)
      const result = await mutate({ input })

      if (result?.data?.createChatRoom) {
        const newRoom = result.data.createChatRoom
        chatRooms.value.unshift(newRoom)
        return newRoom
      }

      return null
    } catch (err: any) {
      error.value = err.message || 'Failed to create chat room'
      console.error('Error creating chat room:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Send a message to a chat room
   */
  const sendMessage = async (input: SendChatMessageInput) => {
    try {
      const { mutate } = useMutation(SEND_CHAT_MESSAGE)
      const result = await mutate({ input })

      if (result?.data?.sendChatMessage) {
        const newMessage = result.data.sendChatMessage
        currentMessages.value.push(newMessage)

        // Update room's last message
        const roomIndex = chatRooms.value.findIndex(r => r.id === input.roomId)
        if (roomIndex !== -1) {
          chatRooms.value[roomIndex].lastMessage = newMessage
          chatRooms.value[roomIndex].lastMessageAt = newMessage.sentAt
        }

        return newMessage
      }

      return null
    } catch (err: any) {
      error.value = err.message || 'Failed to send message'
      console.error('Error sending message:', err)
      return null
    }
  }

  /**
   * Edit a message
   */
  const editMessage = async (input: EditChatMessageInput) => {
    try {
      const { mutate } = useMutation(EDIT_CHAT_MESSAGE)
      const result = await mutate({ input })

      if (result?.data?.editChatMessage) {
        const editedMessage = result.data.editChatMessage
        const messageIndex = currentMessages.value.findIndex(m => m.id === input.messageId)
        if (messageIndex !== -1) {
          currentMessages.value[messageIndex] = editedMessage
        }
        return editedMessage
      }

      return null
    } catch (err: any) {
      error.value = err.message || 'Failed to edit message'
      console.error('Error editing message:', err)
      return null
    }
  }

  /**
   * Mark a message as read
   */
  const markMessageAsRead = async (messageId: string) => {
    try {
      const { mutate } = useMutation(MARK_MESSAGE_AS_READ)
      await mutate({ input: { messageId } })

      // Update local state
      const messageIndex = currentMessages.value.findIndex(m => m.id === messageId)
      if (messageIndex !== -1) {
        currentMessages.value[messageIndex].isRead = true
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to mark message as read'
      console.error('Error marking message as read:', err)
    }
  }

  /**
   * Mark all messages in a room as read
   */
  const markRoomMessagesAsRead = async (roomId: string) => {
    try {
      const { mutate } = useMutation(MARK_ROOM_MESSAGES_AS_READ)
      await mutate({ roomId })

      // Update local state
      currentMessages.value.forEach(message => {
        if (message.roomId === roomId) {
          message.isRead = true
        }
      })

      // Update room unread count
      const roomIndex = chatRooms.value.findIndex(r => r.id === roomId)
      if (roomIndex !== -1) {
        chatRooms.value[roomIndex].unreadCount = 0
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to mark room messages as read'
      console.error('Error marking room messages as read:', err)
    }
  }

  /**
   * Set typing indicator
   */
  const setTypingIndicator = async (roomId: string, isTyping: boolean) => {
    try {
      const { mutate } = useMutation(SET_TYPING_INDICATOR)
      await mutate({ input: { roomId, isTyping } })
    } catch (err: any) {
      console.error('Error setting typing indicator:', err)
    }
  }

  /**
   * Search messages
   */
  const searchMessages = async (query: string, roomId?: string, limit = 20) => {
    try {
      const { data } = await client.query({
        query: SEARCH_CHAT_MESSAGES,
        variables: { query, roomId, limit },
        fetchPolicy: 'network-only'
      })

      return data.searchChatMessages || []
    } catch (err: any) {
      error.value = err.message || 'Failed to search messages'
      console.error('Error searching messages:', err)
      return []
    }
  }

  /**
   * Set current room and load its data
   */
  const setCurrentRoom = async (roomId: string) => {
    await loadChatRoom(roomId)
    await loadMessages(roomId)
    await loadParticipants(roomId)
    await markRoomMessagesAsRead(roomId)
  }

  /**
   * Clear current room
   */
  const clearCurrentRoom = () => {
    currentRoom.value = null
    currentMessages.value = []
    currentParticipants.value = []
    typingUsers.value = []
  }

  /**
   * Initialize subscriptions for real-time updates
   */
  const initializeSubscriptions = () => {
    // Subscribe to new messages
    useSubscription(NEW_MESSAGES, null, {
      onResult: (result) => {
        if (result.data?.newMessages) {
          const newMessage = result.data.newMessages
          
          // Add to current messages if it's for the current room
          if (currentRoom.value && newMessage.roomId === currentRoom.value.id) {
            currentMessages.value.push(newMessage)
          }

          // Update room's last message
          const roomIndex = chatRooms.value.findIndex(r => r.id === newMessage.roomId)
          if (roomIndex !== -1) {
            chatRooms.value[roomIndex].lastMessage = newMessage
            chatRooms.value[roomIndex].lastMessageAt = newMessage.sentAt
            if (currentRoom.value?.id !== newMessage.roomId) {
              chatRooms.value[roomIndex].unreadCount = (chatRooms.value[roomIndex].unreadCount || 0) + 1
            }
          }
        }
      }
    })
  }

  return {
    // State
    chatRooms,
    currentRoom,
    currentMessages,
    currentParticipants,
    isLoading,
    error,
    typingUsers,

    // Computed
    totalUnreadCount,
    currentRoomParticipants,

    // Actions
    loadChatRooms,
    loadChatRoom,
    loadMessages,
    loadParticipants,
    getOrCreateDirectRoom,
    createChatRoom,
    sendMessage,
    editMessage,
    markMessageAsRead,
    markRoomMessagesAsRead,
    setTypingIndicator,
    searchMessages,
    setCurrentRoom,
    clearCurrentRoom,
    initializeSubscriptions
  }
})