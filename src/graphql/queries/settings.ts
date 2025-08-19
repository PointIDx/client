import { gql } from '@apollo/client/core'

export const GET_MY_SETTINGS_QUERY = gql`
  query GetMySettings {
    getMySettings {
      # General settings
      language
      timezone
      theme

      # Cookie settings
      cookieAnalytics
      cookieMarketing
      cookiePreferences
      dataSharingConsent

      # Notification settings
      emailNotifications
      smsNotifications
      pushNotifications
      notificationFrequency

      # Communication
      preferredCommunicationMethod

      # Security
      twoFactorEnabled
      sessionTimeoutMinutes

      # Prestataire visibility (only for prestataires)
      visibleInSearch
      visibleToAssureurs
      acceptNewMissions
      autoAcceptCompatibleMissions
      maxConcurrentMissions

      # Metadata
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_USER_SETTINGS_MUTATION = gql`
  mutation UpdateUserSettings($input: UserSettingsUpdateInput!) {
    updateUserSettings(input: $input) {
      success
      message
      settings {
        id
        userId
        notificationSettings {
          emailNotifications
          pushNotifications
          smsNotifications
          marketingEmails
          securityAlerts
        }
        cookieSettings {
          essential
          analytics
          marketing
          preferences
        }
      }
    }
  }
`

export const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($input: PasswordChangeInput!) {
    changePassword(input: $input) {
      success
      message
    }
  }
`

export const UPDATE_NOTIFICATION_SETTINGS_MUTATION = gql`
  mutation UpdateNotificationSettings($input: UserNotificationSettingsInput!) {
    updateNotificationSettings(input: $input) {
      success
      message
      settings {
        emailNotifications
        smsNotifications
        pushNotifications
        notificationFrequency
      }
    }
  }
`

export const UPDATE_COOKIE_SETTINGS_MUTATION = gql`
  mutation UpdateCookieSettings($input: CookieSettingsInput!) {
    updateCookieSettings(input: $input) {
      success
      message
      settings {
        cookieAnalytics
        cookieMarketing
        cookiePreferences
        dataSharingConsent
      }
    }
  }
`

export const UPDATE_PRESTATAIRE_VISIBILITY_SETTINGS_MUTATION = gql`
  mutation UpdatePrestataireVisibilitySettings($input: PrestataireVisibilitySettingsInput!) {
    updatePrestataireVisibilitySettings(input: $input) {
      success
      message
      settings {
        visibleInSearch
        visibleToAssureurs
        acceptNewMissions
        autoAcceptCompatibleMissions
        maxConcurrentMissions
      }
    }
  }
`

// Types
export interface UserSettings {
  // General settings
  language?: string
  timezone?: string
  theme?: string

  // Cookie settings
  cookieAnalytics?: boolean
  cookieMarketing?: boolean
  cookiePreferences?: boolean
  dataSharingConsent?: boolean

  // Notification settings
  emailNotifications?: boolean
  smsNotifications?: boolean
  pushNotifications?: boolean
  notificationFrequency?: string

  // Communication
  preferredCommunicationMethod?: string

  // Security
  twoFactorEnabled?: boolean
  sessionTimeoutMinutes?: number

  // Prestataire visibility (only for prestataires)
  visibleInSearch?: boolean
  visibleToAssureurs?: boolean
  acceptNewMissions?: boolean
  autoAcceptCompatibleMissions?: boolean
  maxConcurrentMissions?: number

  // Metadata
  createdAt?: string
  updatedAt?: string
}

export interface SettingsUpdateResult {
  success: boolean
  message: string
  settings?: UserSettings
}

export interface PasswordChangeResult {
  success: boolean
  message: string
}

// Input types
export interface UserSettingsUpdateInput {
  // General settings
  language?: string
  timezone?: string
  theme?: string
  
  // Cookie settings
  cookieAnalytics?: boolean
  cookieMarketing?: boolean
  cookiePreferences?: boolean
  dataSharingConsent?: boolean
  
  // Notification settings
  emailNotifications?: boolean
  smsNotifications?: boolean
  pushNotifications?: boolean
  notificationFrequency?: string
  
  // Communication preferences
  preferredCommunicationMethod?: string
  
  // Security settings
  twoFactorEnabled?: boolean
  sessionTimeoutMinutes?: number
  
  // Prestataire visibility
  visibleInSearch?: boolean
  visibleToAssureurs?: boolean
  acceptNewMissions?: boolean
  autoAcceptCompatibleMissions?: boolean
  maxConcurrentMissions?: number
}

export interface UserNotificationSettingsInput {
  email_notifications: boolean
  sms_notifications: boolean
  push_notifications: boolean
  notification_frequency: string
}

export interface CookieSettingsInput {
  analytics: boolean
  marketing: boolean
  preferences: boolean
  dataSharingConsent: boolean
}

export interface PrestataireVisibilitySettingsInput {
  visibleInSearch: boolean
  visibleToAssureurs: boolean
  acceptNewMissions: boolean
  autoAcceptCompatibleMissions: boolean
  maxConcurrentMissions: number
}

export interface PasswordChangeInput {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}