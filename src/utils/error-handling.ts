import { toast } from 'vue-sonner'
import { TIMEOUT_DURATIONS } from '@/constants'

export interface ErrorInfo {
  message: string
  code?: string
  details?: any
}

export interface ErrorHandlerOptions {
  showToast?: boolean
  logError?: boolean
  rethrow?: boolean
  customMessage?: string
}

/**
 * Standardized error handler
 */
export function handleError(
  error: any, 
  context: string, 
  options: ErrorHandlerOptions = {}
): ErrorInfo {
  const {
    showToast = true,
    logError = true,
    rethrow = false,
    customMessage
  } = options

  // Extract error information
  const errorInfo: ErrorInfo = {
    message: customMessage || extractErrorMessage(error),
    code: extractErrorCode(error),
    details: error
  }

  // Log error
  if (logError) {
    console.error(`[${context}] Error:`, error)
  }

  // Show toast notification
  if (showToast) {
    toast.error(errorInfo.message, {
      duration: TIMEOUT_DURATIONS.ERROR_MESSAGE
    })
  }

  // Rethrow if needed
  if (rethrow) {
    throw error
  }

  return errorInfo
}

/**
 * Extracts error message from various error types
 */
function extractErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error
  }

  if (error?.message) {
    return error.message
  }

  if (error?.graphQLErrors?.length > 0) {
    return error.graphQLErrors[0].message
  }

  if (error?.networkError?.message) {
    return error.networkError.message
  }

  if (error?.response?.data?.message) {
    return error.response.data.message
  }

  if (error?.response?.data?.errors?.length > 0) {
    return error.response.data.errors[0].message
  }

  return 'Une erreur inattendue est survenue'
}

/**
 * Extracts error code from various error types
 */
function extractErrorCode(error: any): string | undefined {
  if (error?.code) {
    return error.code
  }

  if (error?.graphQLErrors?.length > 0) {
    return error.graphQLErrors[0].extensions?.code
  }

  if (error?.response?.status) {
    return error.response.status.toString()
  }

  return undefined
}

/**
 * Handles GraphQL errors specifically
 */
export function handleGraphQLError(error: any, context: string, options: ErrorHandlerOptions = {}): ErrorInfo {
  const customMessage = getGraphQLErrorMessage(error)
  toast.error(error)
  return handleError(error, context, {
    ...options,
    customMessage
  })
}

/**
 * Gets user-friendly message for GraphQL errors
 */
function getGraphQLErrorMessage(error: any): string {
  if (error?.graphQLErrors?.length > 0) {
    const graphQLError = error.graphQLErrors[0]
    
    switch (graphQLError.extensions?.code) {
      case 'UNAUTHENTICATED':
        return 'Vous devez être connecté pour effectuer cette action'
      case 'FORBIDDEN':
        return 'Vous n\'avez pas les permissions nécessaires'
      case 'NOT_FOUND':
        return 'L\'élément demandé n\'a pas été trouvé'
      case 'BAD_USER_INPUT':
        return 'Les données saisies sont invalides'
      case 'INTERNAL_SERVER_ERROR':
        return 'Une erreur serveur est survenue'
      default:
        return graphQLError.message
    }
  }

  if (error?.networkError) {
    return 'Erreur de connexion au serveur'
  }

  return 'Une erreur GraphQL est survenue'
}



/**
 * Shows success message with toast
 */
export function showSuccess(message: string, duration?: number): void {
  toast.success(message, {
    duration: duration || TIMEOUT_DURATIONS.SUCCESS_MESSAGE
  })
}

/**
 * Shows info message with toast
 */
export function showInfo(message: string, duration?: number): void {
  toast.info(message, {
    duration: duration || TIMEOUT_DURATIONS.SUCCESS_MESSAGE
  })
}

