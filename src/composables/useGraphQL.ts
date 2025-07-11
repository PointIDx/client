import { ref, computed } from 'vue'
import { useApolloClient } from '@vue/apollo-composable'
import { handleGraphQLError, showSuccess } from '@/utils/error-handling'

export interface GraphQLOperationOptions {
  showSuccessMessage?: boolean
  successMessage?: string
  showErrorToast?: boolean
  context?: string
}

export function useGraphQL() {
  const { client } = useApolloClient()
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)

  const resetError = () => {
    error.value = null
  }

  const executeQuery = async <T>(
    query: any,
    variables?: Record<string, any>,
    options: GraphQLOperationOptions = {}
  ): Promise<T | null> => {
    const { showErrorToast = true, context = 'GraphQL Query' } = options

    loading.value = true
    error.value = null

    try {
      const { data } = await client.query({
        query,
        variables,
        fetchPolicy: 'network-only'
      })

      return data as T
    } catch (err) {
      error.value = err as Error
      if (showErrorToast) {
        handleGraphQLError(err, context, { showToast: true })
      }
      return null
    } finally {
      loading.value = false
    }
  }

  const executeMutation = async <T>(
    mutation: any,
    variables?: Record<string, any>,
    options: GraphQLOperationOptions = {}
  ): Promise<T | null> => {
    const { 
      showSuccessMessage = false, 
      successMessage = 'Opération réussie',
      showErrorToast = true,
      context = 'GraphQL Mutation'
    } = options

    loading.value = true
    error.value = null

    try {
      const { data } = await client.mutate({
        mutation,
        variables
      })

      if (showSuccessMessage) {
        showSuccess(successMessage)
      }

      return data as T
    } catch (err) {
      error.value = err as Error
      if (showErrorToast) {
        handleGraphQLError(err, context, { showToast: true })
      }
      return null
    } finally {
      loading.value = false
    }
  }

  const executeSubscription = (
    subscription: any,
    variables?: Record<string, any>,
    options: GraphQLOperationOptions = {}
  ) => {
    const { showErrorToast = true, context = 'GraphQL Subscription' } = options

    return client.subscribe({
      query: subscription,
      variables
    }).subscribe({
      next: (result) => result,
      error: (err) => {
        error.value = err as Error
        if (showErrorToast) {
          handleGraphQLError(err, context, { showToast: false })
        }
      }
    })
  }

  return {
    loading: isLoading,
    error: hasError,
    resetError,
    executeQuery,
    executeMutation,
    executeSubscription
  }
}

// Specialized composable for missions
export function useMissions() {
  const { executeQuery, executeMutation, loading, error } = useGraphQL()

  const fetchMissions = async (query: any, variables?: Record<string, any>) => {
    return executeQuery(query, variables, {
      context: 'Fetch Missions',
      showErrorToast: true
    })
  }

  const updateMissionStatus = async (
    mutation: any, 
    missionId: string, 
    status: string
  ) => {
    return executeMutation(mutation, { missionId, status }, {
      context: 'Update Mission Status',
      showSuccessMessage: true,
      successMessage: 'Statut de la mission mis à jour avec succès'
    })
  }

  const createMission = async (
    mutation: any,
    missionData: Record<string, any>
  ) => {
    return executeMutation(mutation, { input: missionData }, {
      context: 'Create Mission',
      showSuccessMessage: true,
      successMessage: 'Mission créée avec succès'
    })
  }

  return {
    loading,
    error,
    fetchMissions,
    updateMissionStatus,
    createMission
  }
}

// Specialized composable for messaging
export function useMessaging() {
  const { executeMutation, executeSubscription, loading, error } = useGraphQL()

  const sendMessage = async (
    mutation: any,
    missionId: string,
    content: string
  ) => {
    return executeMutation(mutation, { missionId, content }, {
      context: 'Send Message',
      showSuccessMessage: false, // Don't show success for messages
      showErrorToast: true
    })
  }

  const sendFile = async (
    mutation: any,
    missionId: string,
    file: File,
    comment?: string
  ) => {
    return executeMutation(mutation, { missionId, file, comment }, {
      context: 'Send File',
      showSuccessMessage: true,
      successMessage: 'Fichier envoyé avec succès'
    })
  }

  const subscribeToMessages = (
    subscription: any,
    missionId: string,
    onMessage: (message: any) => void
  ) => {
    return executeSubscription(subscription, { missionId }, {
      context: 'Message Subscription',
      showErrorToast: false
    })
  }

  return {
    loading,
    error,
    sendMessage,
    sendFile,
    subscribeToMessages
  }
}