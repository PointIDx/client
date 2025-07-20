import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useApolloClient, useMutation, useQuery } from '@vue/apollo-composable'
import type { 
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
  UpdateRoomInput
} from '@/interfaces/chat'

import {
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

// Subscriptions
import { 
  CHAT_ROOM_EVENTS,
  NEW_MESSAGES,
  TYPING_INDICATORS,
  ROOM_UPDATES,
  USER_PRESENCE_UPDATES,
  HEARTBEAT
} from '@/graphql/subscriptions/chat-subscriptions'


export const useChatStore = defineStore('chat', () => {
  // State
  const chatRooms = ref<ChatRoomWithLastMessage[]>([])
  const currentRoom = ref<ChatRoom | null>(null)
  const currentMessages = ref<ChatMessage[]>([])
  const currentParticipants = ref<RoomParticipant[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const typingUsers = ref<string[]>([])
  
  // Subscription state
  const subscriptionEnabled = ref(false)
  const subscriptionInstances = ref<Map<string, any>>(new Map())
  const isOnline = ref(true)
  const heartbeatInterval = ref<any>(null)

  // Apollo client - will be obtained when needed in methods

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
    console.log('🎯 STORE: loadChatRooms method called')
    try {
      isLoading.value = true
      error.value = null
      console.log('🎯 STORE: About to make GraphQL request')

      // Get Apollo client within the method call
      const { client } = useApolloClient()
      console.log('🎯 STORE: Apollo client instance:', client ? 'EXISTS' : 'NULL')
      console.log('🎯 STORE: GET_CHAT_ROOMS query:', GET_CHAT_ROOMS ? 'EXISTS' : 'NULL')

      if (!client) {
        console.error('🚨 STORE: Apollo client is null/undefined!')
        throw new Error('Apollo client not available')
      }

      if (!GET_CHAT_ROOMS) {
        console.error('🚨 STORE: GET_CHAT_ROOMS query is null/undefined!')
        throw new Error('GET_CHAT_ROOMS query not available')
      }

      console.log('🎯 STORE: Starting client.query call...')
      const result = await client.query({
        query: GET_CHAT_ROOMS,
        fetchPolicy: 'network-only'
      })
      console.log('🎯 STORE: client.query completed, result:', result)

      const { data } = result
      console.log('🎯 STORE: GraphQL request completed, data:', data)

      if (data && data.getChatRooms) {
        console.log('🎯 STORE: Processing getChatRooms data, count:', data.getChatRooms.length)
        // Transform ChatRoomWithLastMessage to ChatRoomWithLastMessage for our store
        chatRooms.value = data.getChatRooms.map((item: any) => ({
          ...item.room,
          lastMessage: item.lastMessage,
          unreadCount: item.unreadCount
        }))
        console.log('🎯 STORE: Chat rooms set, count:', chatRooms.value.length)
        
        // Note: Subscriptions will be enabled by components when needed
      } else {
        console.warn('🎯 STORE: No chat rooms data received from GraphQL')
        chatRooms.value = []
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to load chat rooms'
      console.error('🚨 STORE: Error loading chat rooms:', err)
      console.error('🚨 STORE: Error stack:', err.stack)
    } finally {
      isLoading.value = false
      console.log('🎯 STORE: loadChatRooms finally block, isLoading set to false')
    }
  }

  /**
   * Load a specific chat room
   */
  const loadChatRoom = async (roomId: string) => {
    try {
      isLoading.value = true
      error.value = null

      // Get Apollo client within the method call
      const { client } = useApolloClient()

      const { data } = await client.query({
        query: GET_CHAT_ROOM,
        variables: { roomId },
        fetchPolicy: 'network-only'
      })

      if (data && data.getChatRoom) {
        currentRoom.value = data.getChatRoom
        return data.getChatRoom
      } else {
        console.warn('No chat room data received from GraphQL')
        currentRoom.value = null
        return null
      }
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
      console.log('📨 Loading messages for room:', roomId, 'limit:', limit, 'offset:', offset)
      isLoading.value = true
      error.value = null

      // Get Apollo client within the method call
      const { client } = useApolloClient()
      console.log('📨 STORE: Apollo client instance:', client ? 'EXISTS' : 'NULL')
      console.log('📨 STORE: GET_CHAT_MESSAGES query:', GET_CHAT_MESSAGES ? 'EXISTS' : 'NULL')

      const { data } = await client.query({
        query: GET_CHAT_MESSAGES,
        variables: { roomId, limit, offset },
        fetchPolicy: 'network-only'
      })

      console.log('📨 Messages response:', data)

      if (offset === 0) {
        currentMessages.value = data.getChatMessages || []
        console.log('📨 Set current messages:', currentMessages.value.length, 'messages')
      } else {
        currentMessages.value = [...(data.getChatMessages || []), ...currentMessages.value]
        console.log('📨 Added messages to existing:', currentMessages.value.length, 'total messages')
      }

      return data.getChatMessages || []
    } catch (err: any) {
      error.value = err.message || 'Failed to load messages'
      console.error('❌ Error loading messages:', err)
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
      // Get Apollo client within the method call
      const { client } = useApolloClient()

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

      // Get Apollo client within the method call
      const { client } = useApolloClient()

      const { data } = await client.query({
        query: GET_OR_CREATE_DIRECT_ROOM,
        variables: { otherUserId },
        fetchPolicy: 'network-only'
      })

      if (data && data.getOrCreateDirectRoom) {
        const room = data.getOrCreateDirectRoom
        
        // Add to rooms list if not already there (as ChatRoomWithLastMessage format)
        const existingRoomIndex = chatRooms.value.findIndex(r => r.id === room.id)
        if (existingRoomIndex === -1) {
          const roomWithLastMessage = {
            ...room,
            lastMessage: null,
            unreadCount: room.unreadCount || 0
          }
          chatRooms.value.unshift(roomWithLastMessage)
        }

        return room
      } else {
        console.warn('No direct room data received from GraphQL')
        return null
      }
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
        currentMessages.value = [...currentMessages.value, newMessage]

        // Update room's last message by replacing the room object
        const roomIndex = chatRooms.value.findIndex(r => r.id === input.roomId)
        if (roomIndex !== -1) {
          chatRooms.value[roomIndex] = {
            ...chatRooms.value[roomIndex],
            lastMessage: newMessage,
            lastMessageAt: newMessage.sentAt
          }
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

    currentMessages.value = currentMessages.value.map(message =>
      message.roomId === roomId
        ? { ...message, isRead: true }
        : message
    )

    const roomIndex = chatRooms.value.findIndex(r => r.id === roomId)
    if (roomIndex !== -1) {
      chatRooms.value = chatRooms.value.map((room, index) =>
        index === roomIndex
          ? { ...room, unreadCount: 0 }
          : room
      )
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
      // Get Apollo client within the method call
      const { client } = useApolloClient()

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
    console.log('🔄 Setting current room:', roomId)
    await loadChatRoom(roomId)
    console.log('📨 Loading messages for room:', roomId)
    await loadMessages(roomId)
    console.log('👥 Loading participants for room:', roomId)
    await loadParticipants(roomId)
    console.log('✅ Marking messages as read for room:', roomId)
    await markRoomMessagesAsRead(roomId)
    console.log('🏁 Current room setup completed')
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
   * Enable subscriptions (to be called from components)
   */
  const enableSubscriptions = () => {
    console.log('🔔 Enabling chat subscriptions...')
    subscriptionEnabled.value = true
    
    // Start all subscriptions
    subscribeToNewMessages()
    subscribeToTypingIndicators()
    subscribeToRoomUpdates()
    subscribeToUserPresenceUpdates()
    subscribeToHeartbeat()
  }

  /**
   * Subscribe to new messages across all user's rooms
   */
  const subscribeToNewMessages = () => {
    if (subscriptionInstances.value.has('newMessages')) return
    
    try {
      const { client } = useApolloClient()
      const observable = client.subscribe({
        query: NEW_MESSAGES
      })
      
      const subscription = observable.subscribe({
        next: ({ data }) => {
          if (data?.newMessages) {
            handleNewMessage(data.newMessages)
          }
        },
        error: (err) => {
          console.error('❌ New messages subscription error:', err)
        }
      })
      
      subscriptionInstances.value.set('newMessages', subscription)
      console.log('✅ New messages subscription enabled')
    } catch (error) {
      console.error('❌ Failed to subscribe to new messages:', error)
    }
  }

  /**
   * Subscribe to typing indicators
   */
  const subscribeToTypingIndicators = () => {
    if (subscriptionInstances.value.has('typingIndicators')) return
    
    try {
      const { client } = useApolloClient()
      const observable = client.subscribe({
        query: TYPING_INDICATORS
      })
      
      const subscription = observable.subscribe({
        next: ({ data }) => {
          if (data?.typingIndicators) {
            handleTypingIndicator(data.typingIndicators)
          }
        },
        error: (err) => {
          console.error('❌ Typing indicators subscription error:', err)
        }
      })
      
      subscriptionInstances.value.set('typingIndicators', subscription)
      console.log('✅ Typing indicators subscription enabled')
    } catch (error) {
      console.error('❌ Failed to subscribe to typing indicators:', error)
    }
  }

  /**
   * Subscribe to room updates
   */
  const subscribeToRoomUpdates = () => {
    if (subscriptionInstances.value.has('roomUpdates')) return
    
    try {
      const { client } = useApolloClient()
      const observable = client.subscribe({
        query: ROOM_UPDATES
      })
      
      const subscription = observable.subscribe({
        next: ({ data }) => {
          if (data?.roomUpdates) {
            handleRoomUpdate(data.roomUpdates)
          }
        },
        error: (err) => {
          console.error('❌ Room updates subscription error:', err)
        }
      })
      
      subscriptionInstances.value.set('roomUpdates', subscription)
      console.log('✅ Room updates subscription enabled')
    } catch (error) {
      console.error('❌ Failed to subscribe to room updates:', error)
    }
  }

  /**
   * Subscribe to user presence updates
   */
  const subscribeToUserPresenceUpdates = () => {
    if (subscriptionInstances.value.has('userPresence')) return
    
    try {
      const { client } = useApolloClient()
      const observable = client.subscribe({
        query: USER_PRESENCE_UPDATES
      })
      
      const subscription = observable.subscribe({
        next: ({ data }) => {
          if (data?.userPresenceUpdates) {
            handleUserPresenceUpdate(data.userPresenceUpdates)
          }
        },
        error: (err) => {
          console.error('❌ User presence subscription error:', err)
        }
      })
      
      subscriptionInstances.value.set('userPresence', subscription)
      console.log('✅ User presence subscription enabled')
    } catch (error) {
      console.error('❌ Failed to subscribe to user presence updates:', error)
    }
  }

  /**
   * Subscribe to heartbeat for connection monitoring
   */
  const subscribeToHeartbeat = () => {
    if (subscriptionInstances.value.has('heartbeat')) return
    
    try {
      const { client } = useApolloClient()
      const observable = client.subscribe({
        query: HEARTBEAT
      })
      
      const subscription = observable.subscribe({
        next: ({ data }) => {
          if (data?.heartbeat) {
            isOnline.value = true
            console.log('💓 Heartbeat received')
          }
        },
        error: (err) => {
          console.error('❌ Heartbeat subscription error:', err)
          isOnline.value = false
        }
      })
      
      subscriptionInstances.value.set('heartbeat', subscription)
      console.log('✅ Heartbeat subscription enabled')
      
      // Monitor heartbeat timeout
      if (heartbeatInterval.value) {
        clearInterval(heartbeatInterval.value)
      }
      
      heartbeatInterval.value = setInterval(() => {
        // If no heartbeat received in 60 seconds, mark as offline
        // This is handled by the subscription error handler
      }, 60000)
      
    } catch (error) {
      console.error('❌ Failed to subscribe to heartbeat:', error)
    }
  }

  /**
   * Subscribe to specific room events
   */
  const subscribeToRoomEvents = (roomId: string) => {
    const key = `room-${roomId}`
    if (subscriptionInstances.value.has(key)) return
    
    try {
      const { client } = useApolloClient()
      const observable = client.subscribe({
        query: CHAT_ROOM_EVENTS,
        variables: { roomId }
      })
      
      const subscription = observable.subscribe({
        next: ({ data }) => {
          if (data?.chatRoomEvents) {
            handleChatEvent(data.chatRoomEvents)
          }
        },
        error: (err) => {
          console.error(`❌ Room ${roomId} events subscription error:`, err)
        }
      })
      
      subscriptionInstances.value.set(key, subscription)
      console.log(`✅ Room ${roomId} events subscription enabled`)
    } catch (error) {
      console.error(`❌ Failed to subscribe to room ${roomId} events:`, error)
    }
  }

  /**
   * Unsubscribe from specific room events
   */
  const unsubscribeFromRoomEvents = (roomId: string) => {
    const key = `room-${roomId}`
    const subscription = subscriptionInstances.value.get(key)
    if (subscription) {
      subscription.unsubscribe()
      subscriptionInstances.value.delete(key)
      console.log(`🔕 Room ${roomId} events subscription disabled`)
    }
  }

  /**
   * Handle incoming chat events from subscriptions
   */
  const handleChatEvent = (event: any) => {
    console.log('🎯 Processing chat event:', event.eventType, 'for room:', event.roomId)

    switch (event.eventType) {
      case 'NEW_MESSAGE':
        handleNewMessageEvent(event)
        break
      case 'MESSAGE_EDITED':
        handleMessageEditedEvent(event)
        break
      case 'MESSAGE_DELETED':
        handleMessageDeletedEvent(event)
        break
      case 'USER_TYPING':
        handleUserTypingEvent(event)
        break
      case 'ROOM_UPDATED':
        handleRoomUpdatedEvent(event)
        break
      default:
        console.log('🤷 Unknown event type:', event.eventType)
    }
  }

  /**
   * Handle new messages from subscription
   */
  const handleNewMessage = (message: any) => {
    console.log('💬 New message received:', message)
    
    // Add to current messages if it's for the current room
    if (currentRoom.value && message.roomId === currentRoom.value.id) {
      console.log('➕ Adding message to current room messages')
      // Check if message already exists to avoid duplicates
      const existingMessageIndex = currentMessages.value.findIndex(m => m.id === message.id)
      if (existingMessageIndex === -1) {
        currentMessages.value.push(message)
      }
    }

    // Update room's last message and unread count
    const roomIndex = chatRooms.value.findIndex(r => r.id === message.roomId)
    if (roomIndex !== -1) {
      const currentUnreadCount = chatRooms.value[roomIndex].unreadCount || 0
      const newUnreadCount = currentRoom.value?.id !== message.roomId ? currentUnreadCount + 1 : currentUnreadCount
      
      console.log('🔄 Updating room last message in sidebar')
      chatRooms.value[roomIndex] = {
        ...chatRooms.value[roomIndex],
        lastMessage: message,
        lastMessageAt: message.sentAt,
        unreadCount: newUnreadCount
      }
    }
  }

  /**
   * Handle typing indicators from subscription
   */
  const handleTypingIndicator = (indicator: any) => {
    console.log('⌨️ Typing indicator received:', indicator)
    
    if (currentRoom.value && indicator.roomId === currentRoom.value.id) {
      const now = new Date()
      const expiresAt = new Date(indicator.expiresAt)
      
      if (expiresAt > now) {
        // User is typing
        if (!typingUsers.value.includes(indicator.userId)) {
          typingUsers.value.push(indicator.userId)
        }
        
        // Set timeout to remove typing indicator when it expires
        setTimeout(() => {
          const index = typingUsers.value.indexOf(indicator.userId)
          if (index !== -1) {
            typingUsers.value.splice(index, 1)
          }
        }, expiresAt.getTime() - now.getTime())
      }
    }
  }

  /**
   * Handle room updates from subscription
   */
  const handleRoomUpdate = (room: any) => {
    console.log('🏠 Room update received:', room)
    
    // Update room in the list
    const roomIndex = chatRooms.value.findIndex(r => r.id === room.id)
    if (roomIndex !== -1) {
      chatRooms.value[roomIndex] = {
        ...chatRooms.value[roomIndex],
        ...room
      }
    }
    
    // Update current room if it's the same room
    if (currentRoom.value && room.id === currentRoom.value.id) {
      currentRoom.value = {
        ...currentRoom.value,
        ...room
      }
    }
  }

  /**
   * Handle user presence updates from subscription
   */
  const handleUserPresenceUpdate = (participant: any) => {
    console.log('👤 User presence update received:', participant)
    
    // Update participant in current participants if it's for the current room
    if (currentRoom.value && participant.roomId === currentRoom.value.id) {
      const participantIndex = currentParticipants.value.findIndex(p => p.userId === participant.userId)
      if (participantIndex !== -1) {
        currentParticipants.value[participantIndex] = participant
      } else {
        currentParticipants.value.push(participant)
      }
    }
  }

  /**
   * Handle new message events (legacy support for chatRoomEvents)
   */
  const handleNewMessageEvent = (event: any) => {
    try {
      const messageData = JSON.parse(event.data)
      handleNewMessage(messageData)
    } catch (parseError) {
      console.error('❌ Error parsing message data:', parseError)
    }
  }

  /**
   * Handle message edited events
   */
  const handleMessageEditedEvent = (event: any) => {
    try {
      const messageData = JSON.parse(event.data)
      console.log('✏️ Message edited:', messageData)
      
      // Update message in current messages if it's for the current room
      if (currentRoom.value && event.roomId === currentRoom.value.id) {
        const messageIndex = currentMessages.value.findIndex(m => m.id === messageData.id)
        if (messageIndex !== -1) {
          currentMessages.value[messageIndex] = messageData
        }
      }
    } catch (parseError) {
      console.error('❌ Error parsing edited message data:', parseError)
    }
  }

  /**
   * Handle message deleted events
   */
  const handleMessageDeletedEvent = (event: any) => {
    try {
      const { messageId } = JSON.parse(event.data)
      console.log('🗑️ Message deleted:', messageId)
      
      // Remove message from current messages if it's for the current room
      if (currentRoom.value && event.roomId === currentRoom.value.id) {
        const messageIndex = currentMessages.value.findIndex(m => m.id === messageId)
        if (messageIndex !== -1) {
          currentMessages.value.splice(messageIndex, 1)
        }
      }
    } catch (parseError) {
      console.error('❌ Error parsing deleted message data:', parseError)
    }
  }

  /**
   * Handle user typing events
   */
  const handleUserTypingEvent = (event: any) => {
    try {
      const { userId, isTyping } = JSON.parse(event.data)
      console.log('⌨️ User typing event:', userId, isTyping)
      
      if (currentRoom.value && event.roomId === currentRoom.value.id) {
        if (isTyping) {
          if (!typingUsers.value.includes(userId)) {
            typingUsers.value.push(userId)
          }
        } else {
          const index = typingUsers.value.indexOf(userId)
          if (index !== -1) {
            typingUsers.value.splice(index, 1)
          }
        }
      }
    } catch (parseError) {
      console.error('❌ Error parsing typing event data:', parseError)
    }
  }

  /**
   * Handle room updated events
   */
  const handleRoomUpdatedEvent = (event: any) => {
    try {
      const roomData = JSON.parse(event.data)
      console.log('🏠 Room updated:', roomData)
      
      // Update room in the list
      const roomIndex = chatRooms.value.findIndex(r => r.id === event.roomId)
      if (roomIndex !== -1) {
        chatRooms.value[roomIndex] = {
          ...chatRooms.value[roomIndex],
          ...roomData
        }
      }
      
      // Update current room if it's the same room
      if (currentRoom.value && event.roomId === currentRoom.value.id) {
        currentRoom.value = {
          ...currentRoom.value,
          ...roomData
        }
      }
    } catch (parseError) {
      console.error('❌ Error parsing room update data:', parseError)
    }
  }

  /**
   * Disable subscriptions
   */
  const disableSubscriptions = () => {
    console.log('🔕 Disabling chat subscriptions...')
    subscriptionEnabled.value = false
    
    // Unsubscribe from all active subscriptions
    subscriptionInstances.value.forEach((subscription, key) => {
      try {
        subscription.unsubscribe()
        console.log(`🔕 Unsubscribed from ${key}`)
      } catch (error) {
        console.error(`❌ Error unsubscribing from ${key}:`, error)
      }
    })
    
    subscriptionInstances.value.clear()
    
    // Clear heartbeat interval
    if (heartbeatInterval.value) {
      clearInterval(heartbeatInterval.value)
      heartbeatInterval.value = null
    }
    
    isOnline.value = false
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
    subscriptionEnabled,
    isOnline,

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
    
    // Subscription actions
    enableSubscriptions,
    disableSubscriptions,
    subscribeToRoomEvents,
    unsubscribeFromRoomEvents,
    handleChatEvent
  }
})