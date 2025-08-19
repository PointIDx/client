<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft, 
  Bell, 
  Shield, 
  Eye, 
  Cookie,
  Lock,
  Save,
  Check,
  AlertCircle,
  Globe,
  Clock,
  Palette,
  MessageSquare
} from 'lucide-vue-next'
import { useQuery, useMutation } from '@vue/apollo-composable'
import {
  GET_MY_SETTINGS_QUERY,
  UPDATE_NOTIFICATION_SETTINGS_MUTATION,
  UPDATE_COOKIE_SETTINGS_MUTATION,
  UPDATE_PRESTATAIRE_VISIBILITY_SETTINGS_MUTATION,
  CHANGE_PASSWORD_MUTATION,
  type UserSettings,
  type UserNotificationSettingsInput,
  type CookieSettingsInput,
  type PrestataireVisibilitySettingsInput,
  type PasswordChangeInput
} from '@/graphql/queries/settings'

const router = useRouter()
const authStore = useAuthStore()

// State - Initialize with defaults
const settings = ref<UserSettings>({
  emailNotifications: false,
  smsNotifications: false,
  pushNotifications: false,
  notificationFrequency: 'immediate',
  cookieAnalytics: false,
  cookieMarketing: false,
  cookiePreferences: false,
  dataSharingConsent: false,
  visibleInSearch: false,
  visibleToAssureurs: false,
  acceptNewMissions: false,
  autoAcceptCompatibleMissions: false,
  maxConcurrentMissions: 5,
  twoFactorEnabled: false,
  sessionTimeoutMinutes: 30
})
const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Password change form
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const isPrestataire = computed(() => {
  const accountType = authStore.user?.accountType
  return accountType === 'Prestataire' || accountType === 'PRESTATAIRE'
})

// Fetch settings
const { result: settingsResult, loading: settingsLoading, refetch: refetchSettings } = useQuery(
  GET_MY_SETTINGS_QUERY,
  {},
  {
    errorPolicy: 'all'
  }
)

// Mutations
const { mutate: updateNotificationSettings, loading: updatingNotifications } = useMutation(UPDATE_NOTIFICATION_SETTINGS_MUTATION)
const { mutate: updateCookieSettings, loading: updatingCookies } = useMutation(UPDATE_COOKIE_SETTINGS_MUTATION)
const { mutate: updateVisibilitySettings, loading: updatingVisibility } = useMutation(UPDATE_PRESTATAIRE_VISIBILITY_SETTINGS_MUTATION)
const { mutate: changePassword, loading: changingPassword } = useMutation(CHANGE_PASSWORD_MUTATION)

const loading = computed(() => settingsLoading.value || isLoading.value)

onMounted(() => {
  if (settingsResult.value?.getMySettings) {
    Object.assign(settings.value, settingsResult.value.getMySettings)
  }
})

// Watch for settings result
watch(settingsResult, (newResult) => {
  if (newResult?.getMySettings) {
    Object.assign(settings.value, newResult.getMySettings)
  }
}, { immediate: true })

function showMessage(message: string, isError = false) {
  if (isError) {
    errorMessage.value = message
    successMessage.value = ''
  } else {
    successMessage.value = message
    errorMessage.value = ''
  }
  
  setTimeout(() => {
    successMessage.value = ''
    errorMessage.value = ''
  }, 5000)
}

async function updateNotifications() {
  
  try {
    const input: UserNotificationSettingsInput = {
      email_notifications: settings.value.emailNotifications || false,
      sms_notifications: settings.value.smsNotifications || false,
      push_notifications: settings.value.pushNotifications || false,
      notification_frequency: settings.value.notificationFrequency || 'immediate'
    }
    
    const result = await updateNotificationSettings({ input })
    
    if (result?.data?.updateNotificationSettings?.success) {
      showMessage('Paramètres de notification mis à jour avec succès')
      await refetchSettings()
    } else {
      showMessage(result?.data?.updateNotificationSettings?.message || 'Erreur lors de la mise à jour', true)
    }
  } catch (error) {
    showMessage('Erreur lors de la mise à jour des notifications', true)
  }
}

async function updateCookies() {
  
  try {
    const input: CookieSettingsInput = {
      analytics: settings.value.cookieAnalytics || false,
      marketing: settings.value.cookieMarketing || false,
      preferences: settings.value.cookiePreferences || false,
      dataSharingConsent: settings.value.dataSharingConsent || false
    }
    
    const result = await updateCookieSettings({ input })
    
    if (result?.data?.updateCookieSettings?.success) {
      showMessage('Paramètres de cookies mis à jour avec succès')
      await refetchSettings()
    } else {
      showMessage(result?.data?.updateCookieSettings?.message || 'Erreur lors de la mise à jour', true)
    }
  } catch (error) {
    showMessage('Erreur lors de la mise à jour des cookies', true)
  }
}

async function updateVisibility() {
  
  try {
    const input: PrestataireVisibilitySettingsInput = {
      visibleInSearch: settings.value.visibleInSearch || false,
      visibleToAssureurs: settings.value.visibleToAssureurs || false,
      acceptNewMissions: settings.value.acceptNewMissions || false,
      autoAcceptCompatibleMissions: settings.value.autoAcceptCompatibleMissions || false,
      maxConcurrentMissions: settings.value.maxConcurrentMissions || 5
    }
    
    const result = await updateVisibilitySettings({ input })
    
    if (result?.data?.updatePrestataireVisibilitySettings?.success) {
      showMessage('Paramètres de visibilité mis à jour avec succès')
      await refetchSettings()
    } else {
      showMessage(result?.data?.updatePrestataireVisibilitySettings?.message || 'Erreur lors de la mise à jour', true)
    }
  } catch (error) {
    showMessage('Erreur lors de la mise à jour de la visibilité', true)
  }
}

async function handlePasswordChange() {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    showMessage('Les mots de passe ne correspondent pas', true)
    return
  }
  
  if (passwordForm.value.newPassword.length < 8) {
    showMessage('Le mot de passe doit contenir au moins 8 caractères', true)
    return
  }
  
  try {
    const result = await changePassword({
      input: passwordForm.value
    })
    
    if (result?.data?.changePassword?.success) {
      showMessage('Mot de passe changé avec succès')
      passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    } else {
      showMessage(result?.data?.changePassword?.message || 'Erreur lors du changement de mot de passe', true)
    }
  } catch (error) {
    showMessage('Erreur lors du changement de mot de passe', true)
  }
}

function goBack() {
  if (isPrestataire.value) {
    router.push('/prestataire-dashboard')
  } else {
    router.push('/assureur-dashboard')
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <Button variant="ghost" size="sm" @click="goBack" class="hover:bg-gray-100">
              <ArrowLeft class="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Paramètres</h1>
              <p class="text-gray-600">Gérez vos préférences et paramètres de compte</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="p-4">
      <Card class="bg-white">
        <CardContent class="p-8">
          <div class="text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p class="mt-2 text-gray-600">Chargement des paramètres...</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Settings content -->
    <div v-else class="p-4">
      <div class="space-y-6">
        <!-- Success/Error Messages -->
        <Alert v-if="successMessage" class="bg-green-50 border-green-200">
          <Check class="w-4 h-4 text-green-600" />
          <AlertDescription class="text-green-800">{{ successMessage }}</AlertDescription>
        </Alert>

        <Alert v-if="errorMessage" class="bg-red-50 border-red-200">
          <AlertCircle class="w-4 h-4 text-red-600" />
          <AlertDescription class="text-red-800">{{ errorMessage }}</AlertDescription>
        </Alert>


        <!-- Notification Settings -->
        <Card class="bg-white">
          <CardHeader>
            <CardTitle class="flex items-center">
              <Bell class="w-5 h-5 mr-2" />
              Notifications
            </CardTitle>
            <CardDescription>
              Gérez vos préférences de notification
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <Label class="font-medium">Notifications par email</Label>
                    <p class="text-sm text-gray-600">Recevoir les notifications par email</p>
                  </div>
                  <Switch 
                    v-model:checked="settings.emailNotifications" 
                  />
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <Label class="font-medium">Notifications push</Label>
                    <p class="text-sm text-gray-600">Recevoir les notifications dans le navigateur</p>
                  </div>
                  <Switch 
                    :model-value="settings.pushNotifications" 
                    @update:model-value="(value) => settings.pushNotifications = value"
                  />
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <Label class="font-medium">Notifications SMS</Label>
                    <p class="text-sm text-gray-600">Recevoir les notifications par SMS</p>
                  </div>
                  <Switch 
                    :model-value="settings.smsNotifications" 
                    @update:model-value="(value) => settings.smsNotifications = value"
                  />
                </div>

                <div class="space-y-2">
                  <Label class="font-medium">Fréquence des notifications</Label>
                  <Select v-model="settings.notificationFrequency">
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner la fréquence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immédiat</SelectItem>
                      <SelectItem value="daily">Quotidien</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      <SelectItem value="never">Jamais</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator class="my-4" />

              <Button @click="updateNotifications" :disabled="updatingNotifications" class="bg-black hover:bg-gray-800">
                <Save class="w-4 h-4 mr-2" />
                {{ updatingNotifications ? 'Enregistrement...' : 'Enregistrer les notifications' }}
              </Button>
            </div>
          </CardContent>
        </Card>

        <!-- Cookie Settings -->
        <Card class="bg-white">
          <CardHeader>
            <CardTitle class="flex items-center">
              <Cookie class="w-5 h-5 mr-2" />
              Cookies et confidentialité
            </CardTitle>
            <CardDescription>
              Gérez vos préférences de cookies
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <Label class="font-medium">Cookies d'analyse</Label>
                    <p class="text-sm text-gray-600">Nous aident à améliorer le site</p>
                  </div>
                  <Switch 
                    :model-value="settings.cookieAnalytics" 
                    @update:model-value="(value) => settings.cookieAnalytics = value"
                  />
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <Label class="font-medium">Cookies marketing</Label>
                    <p class="text-sm text-gray-600">Utilisés pour la publicité personnalisée</p>
                  </div>
                  <Switch 
                    :model-value="settings.cookieMarketing" 
                    @update:model-value="(value) => settings.cookieMarketing = value"
                  />
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <Label class="font-medium">Cookies de préférences</Label>
                    <p class="text-sm text-gray-600">Mémorisent vos préférences</p>
                  </div>
                  <Switch 
                    :model-value="settings.cookiePreferences" 
                    @update:model-value="(value) => settings.cookiePreferences = value"
                  />
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <Label class="font-medium">Consentement partage de données</Label>
                    <p class="text-sm text-gray-600">Autoriser le partage avec des tiers</p>
                  </div>
                  <Switch 
                    :model-value="settings.dataSharingConsent" 
                    @update:model-value="(value) => settings.dataSharingConsent = value"
                  />
                </div>
              </div>

              <Separator class="my-4" />

              <Button @click="updateCookies" :disabled="updatingCookies" class="bg-black hover:bg-gray-800">
                <Save class="w-4 h-4 mr-2" />
                {{ updatingCookies ? 'Enregistrement...' : 'Enregistrer les cookies' }}
              </Button>
            </div>
          </CardContent>
        </Card>

        <!-- Prestataire Visibility Settings (only for prestataires) -->
        <Card v-if="isPrestataire" class="bg-white">
          <CardHeader>
            <CardTitle class="flex items-center">
              <Eye class="w-5 h-5 mr-2" />
              Visibilité et disponibilité
            </CardTitle>
            <CardDescription>
              Contrôlez votre visibilité et gestion des missions
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <Label class="font-medium">Visible dans les recherches</Label>
                  <p class="text-sm text-gray-600">Apparaître dans les résultats de recherche</p>
                </div>
                <Switch 
                  :model-value="settings.visibleInSearch" 
                  @update:model-value="(value) => settings.visibleInSearch = value"
                />
              </div>

              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <Label class="font-medium">Visible pour les assureurs</Label>
                  <p class="text-sm text-gray-600">Permettre aux assureurs de vous trouver</p>
                </div>
                <Switch 
                  :model-value="settings.visibleToAssureurs" 
                  @update:model-value="(value) => settings.visibleToAssureurs = value"
                />
              </div>

              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <Label class="font-medium">Accepter nouvelles missions</Label>
                  <p class="text-sm text-gray-600">Recevoir de nouvelles propositions de missions</p>
                </div>
                <Switch 
                  :model-value="settings.acceptNewMissions" 
                  @update:model-value="(value) => settings.acceptNewMissions = value"
                />
              </div>

              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <Label class="font-medium">Acceptation automatique</Label>
                  <p class="text-sm text-gray-600">Accepter automatiquement les missions compatibles</p>
                </div>
                <Switch 
                  :model-value="settings.autoAcceptCompatibleMissions" 
                  @update:model-value="(value) => settings.autoAcceptCompatibleMissions = value"
                />
              </div>

              <div class="space-y-2">
                <Label class="font-medium">Nombre maximum de missions simultanées</Label>
                <Input 
                  type="number" 
                  min="1" 
                  max="50" 
                  v-model.number="settings.maxConcurrentMissions" 
                  class="w-20"
                />
                <p class="text-sm text-gray-600">Entre 1 et 50 missions</p>
              </div>
            </div>

            <Separator class="my-4" />

            <Button @click="updateVisibility" :disabled="updatingVisibility" class="bg-black hover:bg-gray-800">
              <Save class="w-4 h-4 mr-2" />
              {{ updatingVisibility ? 'Enregistrement...' : 'Enregistrer la visibilité' }}
            </Button>
          </CardContent>
        </Card>

        <!-- Password Change -->
        <Card class="bg-white">
          <CardHeader>
            <CardTitle class="flex items-center">
              <Lock class="w-5 h-5 mr-2" />
              Sécurité
            </CardTitle>
            <CardDescription>
              Changez votre mot de passe
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-4">
              <div>
                <Label for="currentPassword">Mot de passe actuel</Label>
                <Input 
                  id="currentPassword"
                  type="password"
                  v-model="passwordForm.currentPassword"
                  class="mt-1"
                />
              </div>

              <div>
                <Label for="newPassword">Nouveau mot de passe</Label>
                <Input 
                  id="newPassword"
                  type="password"
                  v-model="passwordForm.newPassword"
                  class="mt-1"
                />
              </div>

              <div>
                <Label for="confirmPassword">Confirmer le nouveau mot de passe</Label>
                <Input 
                  id="confirmPassword"
                  type="password"
                  v-model="passwordForm.confirmPassword"
                  class="mt-1"
                />
              </div>
            </div>

            <Separator class="my-4" />

            <Button 
              @click="handlePasswordChange" 
              :disabled="changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword"
              class="bg-black hover:bg-gray-800"
            >
              <Shield class="w-4 h-4 mr-2" />
              {{ changingPassword ? 'Changement...' : 'Changer le mot de passe' }}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>