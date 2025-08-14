import { gql } from '@apollo/client/core'

// Subscribe to chat events for a specific room
export const CHAT_ROOM_EVENTS = gql`
  subscription ChatRoomEvents($roomId: UUID!) {
    chatRoomEvents(roomId: $roomId) {
      eventType
      roomId
      userId
      data
    }
  }
`

// Subscribe to new messages across all user's rooms
export const NEW_MESSAGES = gql`
  subscription NewMessages {
    newMessages {
      id
      roomId
      senderId
      content
      messageType
      sentAt
      editedAt
      replyToId
      fileAttachments
      isRead
      senderName
      senderAvatar
    }
  }
`

// Subscribe to typing indicators across all user's rooms
export const TYPING_INDICATORS = gql`
  subscription TypingIndicator {
    onTypingIndicator {
      id
      roomId
      userId
      userName
      startedAt
      expiresAt
    }
  }
`

// Subscribe to room updates (name changes, participant changes, etc.)
export const ROOM_UPDATES = gql`
  subscription RoomUpdates {
    roomUpdates {
      id
      roomType
      participants
      name
      description
      avatarUrl
      createdBy
      createdAt
      updatedAt
      lastMessageId
      lastMessageAt
      isArchived
      unreadCount
    }
  }
`

// Subscribe to user presence/status updates in chat rooms
export const USER_PRESENCE_UPDATES = gql`
  subscription UserPresenceUpdates {
    userPresenceUpdates {
      id
      roomId
      userId
      role
      joinedAt
      lastSeenAt
      isMuted
      userName
      userAvatar
    }
  }
`

// Heartbeat for connection testing (sends ping every 30 seconds)
export const HEARTBEAT = gql`
  subscription Heartbeat {
    heartbeat
  }
`