import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useQuery, useMutation } from '@vue/apollo-composable'
import {
  GET_MY_PRESTATAIRE_PROFILE_QUERY,
  GET_MY_ASSUREUR_PROFILE_QUERY,
  UPDATE_PRESTATAIRE_PROFILE_MUTATION,
  UPDATE_ASSUREUR_PROFILE_MUTATION,
  type PrestataireInfo,
  type AssureurInfo,
  type PrestataireProfileUpdateInput,
  type AssureurProfileUpdateInput
} from '@/graphql/queries/profile'
import { useAuthStore } from './auth'

export const useProfileStore = defineStore('profile', () => {
  const authStore = useAuthStore()
  
  // State
  const prestataireProfile = ref<PrestataireInfo | null>(null)
  const assureurProfile = ref<AssureurInfo | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const isPrestataire = computed(() => {
    const accountType = authStore.user?.accountType
    return accountType === 'Prestataire' || accountType === 'PRESTATAIRE'
  })
  const isAssureur = computed(() => {
    const accountType = authStore.user?.accountType
    return accountType === 'Assureur' || accountType === 'ASSUREUR'
  })
  
  const currentProfile = computed(() => {
    if (isPrestataire.value) return prestataireProfile.value
    if (isAssureur.value) return assureurProfile.value
    return null
  })

  const hasProfile = computed(() => currentProfile.value !== null)

  // GraphQL queries
  const { 
    result: prestataireResult, 
    loading: prestataireLoading, 
    error: prestataireError,
    refetch: refetchPrestataireProfile 
  } = useQuery(
    GET_MY_PRESTATAIRE_PROFILE_QUERY,
    {},
    {
      enabled: isPrestataire.value,
      errorPolicy: 'all'
    }
  )

  const { 
    result: assureurResult, 
    loading: assureurLoading, 
    error: assureurError,
    refetch: refetchAssureurProfile 
  } = useQuery(
    GET_MY_ASSUREUR_PROFILE_QUERY,
    {},
    {
      enabled: isAssureur.value,
      errorPolicy: 'all'
    }
  )

  // GraphQL mutations
  const { mutate: updatePrestataireProfileMutation, loading: updatingPrestataire } = useMutation(UPDATE_PRESTATAIRE_PROFILE_MUTATION)
  const { mutate: updateAssureurProfileMutation, loading: updatingAssureur } = useMutation(UPDATE_ASSUREUR_PROFILE_MUTATION)

  // Watch for query results
  watch(prestataireResult, (newResult) => {
    if (newResult?.getMyPrestataireProfile) {
      prestataireProfile.value = newResult.getMyPrestataireProfile
      error.value = null
    }
  }, { immediate: true })

  watch(assureurResult, (newResult) => {
    if (newResult?.getMyAssureurProfile) {
      assureurProfile.value = newResult.getMyAssureurProfile
      error.value = null
    }
  }, { immediate: true })

  watch(prestataireError, (newError) => {
    if (newError) {
      error.value = newError.message
    }
  })

  watch(assureurError, (newError) => {
    if (newError) {
      error.value = newError.message
    }
  })

  // Update loading state
  const isLoading = computed(() => 
    loading.value || 
    prestataireLoading.value || 
    assureurLoading.value || 
    updatingPrestataire.value || 
    updatingAssureur.value
  )

  // Actions
  async function fetchProfile() {
    loading.value = true
    error.value = null
    
    try {
      if (isPrestataire.value) {
        await refetchPrestataireProfile()
      } else if (isAssureur.value) {
        await refetchAssureurProfile()
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch profile'
      console.error('Error fetching profile:', err)
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(input: PrestataireProfileUpdateInput | AssureurProfileUpdateInput) {
    error.value = null
    
    try {
      if (isPrestataire.value) {
        const result = await updatePrestataireProfileMutation({ 
          input: input as PrestataireProfileUpdateInput 
        })
        
        if (result?.data?.updatePrestataireProfile) {
          prestataireProfile.value = result.data.updatePrestataireProfile
        }
      } else if (isAssureur.value) {
        const result = await updateAssureurProfileMutation({ 
          input: input as AssureurProfileUpdateInput 
        })
        
        if (result?.data?.updateAssureurProfile) {
          assureurProfile.value = result.data.updateAssureurProfile
        }
      }
      
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update profile'
      console.error('Error updating profile:', err)
      return false
    }
  }

  function clearProfile() {
    prestataireProfile.value = null
    assureurProfile.value = null
    error.value = null
  }

  // Initialize profile data if available
  function initializeProfile() {
    if (prestataireResult?.value?.getMyPrestataireProfile) {
      prestataireProfile.value = prestataireResult.value.getMyPrestataireProfile
    }
    if (assureurResult?.value?.getMyAssureurProfile) {
      assureurProfile.value = assureurResult.value.getMyAssureurProfile
    }
  }

  return {
    // State
    prestataireProfile,
    assureurProfile,
    loading: isLoading,
    error,
    
    // Computed
    isPrestataire,
    isAssureur,
    currentProfile,
    hasProfile,
    
    // Actions
    fetchProfile,
    updateProfile,
    clearProfile,
    initializeProfile
  }
})