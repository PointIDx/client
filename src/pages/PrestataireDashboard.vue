<script setup lang="ts">
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Bell,
  MessageCircle,
  Eye,
  MapPin,
  User,
  CheckCircle,
  Send,
  Check,
  X,
  LogOut,
  Settings,
  MoreHorizontal,
  Calendar,
  Building
} from "lucide-vue-next"

import { usePrestataireStore } from '@/stores/prestataire'
import { useMissionStore } from '@/stores/mission'
import { useAuthStore } from '@/stores/auth'
import { onMounted, computed, ref, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { MissionStatutPrestataire } from '@/enums/mission-statut-prestataire'
import type { SubMission } from '@/interfaces/sub-mission'
import { getMissionStatusBadge } from '@/utils/status-badges'
import { handleError } from '@/utils/error-handling'
import ExportMissions from '@/components/ExportMissions.vue'
// Temporarily commented out due to CSS loading issues causing navigation failures
// import PrestataireStatistics from '@/components/PrestataireStatistics.vue'
// import PrestataireProfile from '@/components/PrestataireProfile.vue'

const router = useRouter()

const prestataireStore = usePrestataireStore()
const missionStore = useMissionStore()
const authStore = useAuthStore()

onMounted(async () => {
  console.log('🔧 Prestataire dashboard mounted, fetching missions...')
  try {
    await missionStore.fetchMissions('PRESTATAIRE')
    console.log('✅ Missions fetch completed')
  } catch (error) {
    console.error('❌ Failed to fetch missions:', error)
  }
  prestataireStore.fetchNotifications()
})

const missions = computed(() => missionStore.missions as unknown as SubMission[])

// Filter sub-missions by status and assignment
const nouvellesMissions = computed(() => {
  // Available sub-missions that can be accepted 
  const nouvelles = missions.value.filter((subMission) => {
    // For INVITE status, show even if prestataireId is set (prestataire invited but not accepted)
    const isInvited = subMission.statut === 'INVITE'
    
    // For other statuses, only show if no prestataire assigned
    const noPrestataire = !subMission.prestataireId
    const isWaiting = subMission.statut === 'EN_ATTENTE' ||
                     subMission.statut === 'EnAttente' ||   // Case variation
                     subMission.statut === 'WAITING' ||     // Alternative naming
                     subMission.statut === 'PENDING'       // Alternative naming
    
    return isInvited || (isWaiting && noPrestataire)
  })
  
  console.log('🎯 Available sub-missions filter result:', nouvelles.length, 'from total:', missions.value.length)
  console.log('🔍 All sub-missions with details:', missions.value.map((m) => ({
    id: m.id,
    reference: m.reference,
    statut: m.statut,
    prestataireId: m.prestataireId,
    isAvailable: !m.prestataireId && (m.statut === 'EN_ATTENTE' || m.statut === 'EnAttente')
  })))
  console.log('🔍 Filtered available sub-missions:', nouvelles.map(m => ({
    id: m.id,
    reference: m.reference,
    title: m.title,
    statut: m.statut
  })))
  return nouvelles
})
const missionsEnCours = computed(() => {
  // Sub-missions assigned to this prestataire that are in progress
  // Check for various possible status values (case variations)
  const enCours = missions.value.filter((subMission) => {
    const hasPrestataire = !!subMission.prestataireId
    const statusMatch = subMission.statut === 'EN_COURS' ||
                       subMission.statut === 'ASSIGNEE' ||
                       subMission.statut === 'Assignee' ||  // Case variation
                       subMission.statut === 'EnCours' ||   // Case variation
                       subMission.statut === 'ASSIGNED'     // Alternative naming
    
    console.log(`🔍 Sub-mission ${subMission.reference}: prestataireId=${subMission.prestataireId}, statut="${subMission.statut}", hasPrestataire=${hasPrestataire}, statusMatch=${statusMatch}`)
    
    return hasPrestataire && statusMatch
  })
  
  console.log('🎯 Assigned sub-missions filter result:', enCours.length)
  console.log('🔍 All sub-mission statuses found:', [...new Set(missions.value.map(m => m.statut))])
  console.log('🔍 All assigned sub-missions (regardless of status):', missions.value.filter(m => m.prestataireId).map(m => ({
    id: m.id,
    reference: m.reference,
    title: m.title,
    statut: m.statut,
    prestataireId: m.prestataireId
  })))
  console.log('🔍 Filtered assigned sub-missions (with status filter):', enCours.map(m => ({
    id: m.id,
    reference: m.reference,
    title: m.title,
    statut: m.statut,
    prestataireId: m.prestataireId
  })))
  return enCours
})
const missionsTerminees = computed(() => {
  // Sub-missions assigned to this prestataire that are completed
  const terminees = missions.value.filter((subMission) => 
    subMission.prestataireId && (
      subMission.statut === 'TERMINEE' ||
      subMission.statut === 'ANNULEE' ||
      subMission.statut === 'SUSPENDUE'
    )
  )
  console.log('🎯 Sub-missions terminées count:', terminees.length)
  return terminees
})


const selectedMission = ref<SubMission | null>(null)
const showChat = ref(false)
const newMessage = ref('')
const showSuccess = ref(false)
const successMessage = ref('')
const notifications = computed(() => prestataireStore.notifications.filter((n: { isRead: any }) => !n.isRead))






// Using shared utilities for status badges
const getStatutBadge = getMissionStatusBadge

const changerStatutMission = async (missionId: string, nouveauStatut: MissionStatutPrestataire) => {
  try {
    await missionStore.updateMissionStatus(missionId, nouveauStatut)
    // Ensure the UI updates
    await nextTick()
    successMessage.value = `Statut de la mission mis à jour: ${nouveauStatut}`
    showSuccess.value = true
    setTimeout(() => (showSuccess.value = false), 3000)
  } catch (error) {
    handleError(error, 'Update Mission Status', { showToast: true })
  }
}

const acceptMission = async (missionId: string) => {
  try {
    await missionStore.acceptMission(missionId)
    // Refresh missions after accepting
    await missionStore.fetchMissions('PRESTATAIRE')
    successMessage.value = 'Mission acceptée avec succès'
    showSuccess.value = true
    setTimeout(() => (showSuccess.value = false), 3000)
  } catch (error) {
    handleError(error, 'Accept Mission', { showToast: true })
  }
}

const navigateToChat = () => {
  router.push({
    path: '/chat',
  })
}

const viewMissionDetails = (missionId: string) => {
  router.push(`/mission/${missionId}`)
}

const viewSubMissionDetails = (subMissionId: string) => {
  router.push(`/sub-mission/${subMissionId}`)
}

const openChat = (mission: any) => {
  // Navigate to chat page with mission context using userId for chat room creation
  router.push({
    path: '/chat',
    query: {
      assureurId: mission.assureur?.userId || '', // Use userId for chat room creation
      contactName: mission.assureur?.contactPerson || 'Non spécifié',
      contactPerson: mission.assureur?.contactPerson || 'Non spécifié',
      type: 'prestataire'
    }
  })
}

const showLogoutDialog = ref(false)

const handleLogout = () => {
  authStore.logout()
  showLogoutDialog.value = false
  router.push('/login')
}

const userInitials = computed(() => {
  if (!authStore.user?.profile) return 'U'
  
  // Check if it's a prestataire profile with contactInfo
  if (authStore.user.profile.contactInfo?.prenom) {
    return authStore.user.profile.contactInfo.prenom.charAt(0).toUpperCase()
  }
  
  // Fallback to first letter of email if no profile info
  if (authStore.user.email) {
    return authStore.user.email.charAt(0).toUpperCase()
  }
  
  return 'U'
})
</script>

<template>
  <div class="min-h-screen bg-white text-black font-mono">
    <!-- Header -->
    <header class="bg-white border-b border-gray-300">
      <div class="mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div>
            <h1 class="text-2xl font-bold text-black">Dashboard Prestataire</h1>
            <p class="text-gray-700">Gérez vos missions et communications</p>
          </div>
          <div class="flex items-center space-x-4">
            <ExportMissions />
            <Button data-testid="nav_chat_button"  size="icon" class="bg-transparent shadow-none hover:shadow-none focus:shadow-none" @click="navigateToChat">
              <MessageCircle class="w-6 h-6 mr-2" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button size="default" class="bg-transparent text-gray-700 relative shadow-none hover:shadow-none focus:shadow-none" data-testid="notifications-button">
                  <Bell class="w-6 h-6 mr-2" />
                  Notifications
                  <Badge v-if="prestataireStore.notifications.filter(n => !n.isRead).length > 0" class="absolute -top-2 -right-2 px-1 min-w-[1.2rem] h-5 bg-black text-white border-black">
                    {{ prestataireStore.notifications.filter(n => !n.isRead).length }}
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-80">
                <DropdownMenuItem v-if="prestataireStore.notifications.filter(n => !n.isRead).length === 0" class="text-gray-500 text-center">
                  Aucune notification
                </DropdownMenuItem>
                <DropdownMenuItem v-for="notif in prestataireStore.notifications.filter(n => !n.isRead)" :key="notif.id" class="flex-col items-start p-3">
                  <p class="text-sm font-medium">{{ notif.message }}</p>
                  <p class="text-xs text-gray-500">{{ new Date(notif.createdAt).toLocaleString() }}</p>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" class="relative h-8 w-8 rounded-full hover:bg-gray-100 cursor-pointer">
                  <Avatar class="h-8 w-8">
                    <AvatarFallback class="bg-gray-100 text-gray-700 hover:bg-gray-200">
                      {{ userInitials }}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent class="w-56" align="end">
                <div class="flex items-center justify-start gap-2 p-2">
                  <div class="flex flex-col space-y-1 leading-none">
                    <p class="text-sm font-medium leading-none">
                      {{ authStore.user?.profile?.contactInfo?.prenom || 'Utilisateur' }}
                      {{ authStore.user?.profile?.contactInfo?.nom || '' }}
                    </p>
                    <p class="text-xs leading-none text-muted-foreground">
                      {{ authStore.user?.email }}
                    </p>
                  </div>
                </div>
                <div class="border-t border-gray-200 my-1"></div>
                <DropdownMenuItem class="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer" @click="showLogoutDialog = true">
                  <LogOut class="mr-2 h-4 w-4" />
                  <span>Se déconnecter</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>

    <!-- Success Alert -->
    <div v-if="showSuccess" class="mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <Alert class="bg-gray-100 border-gray-300">
        <CheckCircle class="h-4 w-4 text-black" />
        <AlertDescription class="text-black">{{ successMessage }}</AlertDescription>
      </Alert>
    </div>

    <div class="mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Tabs default-value="nouvelles" class="space-y-6">
        <TabsList data-testid="missions-tabs">
          <TabsTrigger value="nouvelles" data-testid="nouvelles-tab" class="data-[state=active]:bg-black data-[state=active]:text-white">
            Sous-missions disponibles ({{ nouvellesMissions.length }})
          </TabsTrigger>
          <TabsTrigger value="en-cours" data-testid="en-cours-tab" class="data-[state=active]:bg-black data-[state=active]:text-white">
            Mes sous-missions en cours ({{ missionsEnCours.length }})
          </TabsTrigger>
          <TabsTrigger value="terminees" data-testid="terminees-tab" class="data-[state=active]:bg-black data-[state=active]:text-white">
            Mes sous-missions terminées ({{ missionsTerminees.length }})
          </TabsTrigger>
          <TabsTrigger value="statistics" data-testid="statistics-tab" class="data-[state=active]:bg-black data-[state=active]:text-white">
            Statistiques
          </TabsTrigger>
          <TabsTrigger value="profile" data-testid="profile-tab" class="data-[state=active]:bg-black data-[state=active]:text-white">
            Profil
          </TabsTrigger>
          <TabsTrigger value="debug" data-testid="debug-tab" class="data-[state=active]:bg-black data-[state=active]:text-white">
            Debug ({{ missions.length }})
          </TabsTrigger>
        </TabsList>

        <!-- Onglet Sous-missions disponibles -->
        <TabsContent value="nouvelles" data-testid="nouvelles-missions-list">
          <Card>
            <CardHeader>
              <CardTitle>Sous-missions disponibles ({{ nouvellesMissions.length }})</CardTitle>
              <CardDescription>Sous-missions non assignées que vous pouvez accepter</CardDescription>
            </CardHeader>
            <CardContent>
              <div v-if="nouvellesMissions.length === 0" class="text-center py-8 text-gray-500">
                <User class="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Aucune sous-mission disponible</p>
                <p class="text-sm">Les sous-missions disponibles apparaîtront ici</p>
              </div>
              
              <div v-else>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Référence</TableHead>
                      <TableHead>Titre</TableHead>
                      <TableHead>Spécialisation</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow v-for="subMission in nouvellesMissions" :key="subMission.id" class="hover:bg-gray-50" :data-testid="`submission-row-${subMission.id}`">
                      <TableCell>
                        <div class="font-medium">{{ subMission.reference }}</div>
                      </TableCell>
                      <TableCell>
                        <div class="font-medium">{{ subMission.title }}</div>
                        <div class="text-sm text-gray-500">{{ subMission.description.substring(0, 50) }}...</div>
                      </TableCell>
                      <TableCell>
                        <div class="flex items-center space-x-2">
                          <span class="text-sm">{{ subMission.specialization }}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge :class="getStatutBadge(subMission.statut)?.class" class="text-xs">
                          <component :is="getStatutBadge(subMission.statut)?.icon" class="w-3 h-3 mr-1" />
                          {{ getStatutBadge(subMission.statut)?.text }}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div class="flex items-center text-sm text-gray-600">
                          <Calendar class="w-3 h-3 mr-1" />
                          {{ subMission.createdAt ? new Date(subMission.createdAt).toLocaleDateString() : 'N/A' }}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger as-child>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal class="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem @click="viewSubMissionDetails(subMission.id)">
                              <Eye class="w-4 h-4 mr-2" />
                              Voir détails sous-mission
                            </DropdownMenuItem>
                            <DropdownMenuItem @click="openChat(subMission)">
                              <MessageCircle class="w-4 h-4 mr-2" />
                              Contacter
                            </DropdownMenuItem>
                            <DropdownMenuItem @click="acceptMission(subMission.id)" class="text-green-600">
                              <Check class="w-4 h-4 mr-2" />
                              Accepter sous-mission
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- Onglet Sous-missions en cours -->
        <TabsContent value="en-cours" data-testid="en-cours-missions-list">
          <Card>
            <CardHeader>
              <CardTitle>Mes sous-missions en cours ({{ missionsEnCours.length }})</CardTitle>
              <CardDescription>Sous-missions qui vous sont assignées et en cours de traitement</CardDescription>
            </CardHeader>
            <CardContent>
              <div v-if="missionsEnCours.length === 0" class="text-center py-8 text-gray-500">
                <User class="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Aucune sous-mission en cours</p>
                <p class="text-sm">Les sous-missions acceptées apparaîtront ici</p>
              </div>
              
              <div v-else>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Référence</TableHead>
                      <TableHead>Titre</TableHead>
                      <TableHead>Spécialisation</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow v-for="subMission in missionsEnCours" :key="subMission.id" class="hover:bg-gray-50" :data-testid="`submission-row-${subMission.id}`">
                      <TableCell>
                        <div class="font-medium">{{ subMission.reference }}</div>
                      </TableCell>
                      <TableCell>
                        <div class="flex items-center space-x-2">
                          <User class="w-4 h-4 text-gray-500" />
                          <span>{{ subMission.title }}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div class="flex items-center space-x-2">
                          <Building class="w-4 h-4 text-gray-500" />
                          <span>{{ subMission.specialization }}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge :class="getStatutBadge(subMission.statut)?.class" class="text-xs">
                          <component :is="getStatutBadge(subMission.statut)?.icon" class="w-3 h-3 mr-1" />
                          {{ getStatutBadge(subMission.statut)?.text }}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div class="flex items-center text-sm text-gray-600">
                          <Calendar class="w-3 h-3 mr-1" />
                          {{ subMission.createdAt ? new Date(subMission.createdAt).toLocaleDateString() : 'N/A' }}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger as-child>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal class="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem @click="viewSubMissionDetails(subMission.id)">
                              <Eye class="w-4 h-4 mr-2" />
                              Voir détails sous-mission
                            </DropdownMenuItem>
                            <DropdownMenuItem @click="openChat(subMission)">
                              <MessageCircle class="w-4 h-4 mr-2" />
                              Contacter
                            </DropdownMenuItem>
                            <DropdownMenuItem v-if="subMission.statut === 'ASSIGNEE'" @click="changerStatutMission(subMission.id, MissionStatutPrestataire.EnCours)" class="text-blue-600">
                              <Send class="w-4 h-4 mr-2" />
                              Démarrer sous-mission
                            </DropdownMenuItem>
                            <DropdownMenuItem v-if="subMission.statut === 'EN_COURS'" @click="changerStatutMission(subMission.id, MissionStatutPrestataire.Terminee)" class="text-green-600">
                              <CheckCircle class="w-4 h-4 mr-2" />
                              Terminer sous-mission
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- Onglet Sous-missions terminées -->
        <TabsContent value="terminees" data-testid="terminees-missions-list">
          <Card>
            <CardHeader>
              <CardTitle>Mes sous-missions terminées ({{ missionsTerminees.length }})</CardTitle>
              <CardDescription>Sous-missions que vous avez complétées</CardDescription>
            </CardHeader>
            <CardContent>
              <div v-if="missionsTerminees.length === 0" class="text-center py-8 text-gray-500">
                <CheckCircle class="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Aucune sous-mission terminée</p>
                <p class="text-sm">Vos sous-missions terminées apparaîtront ici</p>
              </div>
              
              <div v-else>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Référence</TableHead>
                      <TableHead>Titre</TableHead>
                      <TableHead>Spécialisation</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow v-for="subMission in missionsTerminees" :key="subMission.id" class="hover:bg-gray-50" :data-testid="`submission-row-${subMission.id}`">
                      <TableCell>
                        <div class="font-medium">{{ subMission.reference }}</div>
                      </TableCell>
                      <TableCell>
                        <div class="flex items-center space-x-2">
                          <User class="w-4 h-4 text-gray-500" />
                          <span>{{ subMission.title }}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div class="flex items-center space-x-2">
                          <Building class="w-4 h-4 text-gray-500" />
                          <span>{{ subMission.specialization }}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge :class="getStatutBadge(subMission.statut)?.class" class="text-xs">
                          <component :is="getStatutBadge(subMission.statut)?.icon" class="w-3 h-3 mr-1" />
                          {{ getStatutBadge(subMission.statut)?.text }}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div class="flex items-center text-sm text-gray-600">
                          <Calendar class="w-3 h-3 mr-1" />
                          {{ subMission.createdAt ? new Date(subMission.createdAt).toLocaleDateString() : 'N/A' }}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger as-child>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal class="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem @click="viewSubMissionDetails(subMission.id)">
                              <Eye class="w-4 h-4 mr-2" />
                              Voir détails sous-mission
                            </DropdownMenuItem>
                            <DropdownMenuItem @click="openChat(subMission)">
                              <MessageCircle class="w-4 h-4 mr-2" />
                              Contacter
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- Onglet Statistiques -->
        <TabsContent value="statistics" data-testid="statistics-tab-content">
          <!-- Temporarily commented out due to CSS loading issues -->
          <!-- <PrestataireStatistics /> -->
          <div class="p-8 text-center text-gray-500">
            <p>Statistiques en cours de développement</p>
          </div>
        </TabsContent>

        <!-- Onglet Profil -->
        <TabsContent value="profile" data-testid="profile-tab-content">
          <!-- Temporarily commented out due to CSS loading issues -->
          <!-- <PrestataireProfile /> -->
          <div class="p-8 text-center text-gray-500">
            <p>Profil en cours de développement</p>
          </div>
        </TabsContent>

        <!-- Debug Tab -->
        <TabsContent value="debug" data-testid="debug-tab-content">
          <Card>
            <CardHeader>
              <CardTitle>Debug: Toutes les sous-missions ({{ missions.length }})</CardTitle>
              <CardDescription>Vue complète des données pour diagnostics</CardDescription>
            </CardHeader>
            <CardContent>
              <div v-if="missions.length === 0" class="text-center py-8 text-gray-500">
                <p>Aucune sous-mission trouvée</p>
              </div>
              <div v-else>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Référence</TableHead>
                      <TableHead>Titre</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Prestataire ID</TableHead>
                      <TableHead>Spécialisation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow v-for="subMission in missions" :key="subMission.id" class="hover:bg-gray-50">
                      <TableCell class="font-mono text-xs">{{ subMission.id.substring(0, 8) }}...</TableCell>
                      <TableCell class="font-medium">{{ subMission.reference }}</TableCell>
                      <TableCell>{{ subMission.title }}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{{ subMission.statut }}</Badge>
                      </TableCell>
                      <TableCell class="font-mono text-xs">
                        {{ subMission.prestataireId ? subMission.prestataireId.substring(0, 8) + '...' : 'NULL' }}
                      </TableCell>
                      <TableCell>{{ subMission.specialization }}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  </div>

  <!-- Logout Confirmation Dialog -->
  <Dialog v-model:open="showLogoutDialog">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Confirmer la déconnexion</DialogTitle>
        <DialogDescription>
          Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à votre compte.
        </DialogDescription>
      </DialogHeader>
      <div class="flex justify-end space-x-2 mt-4">
        <Button variant="outline" @click="showLogoutDialog = false">Annuler</Button>
        <Button @click="handleLogout" class="bg-red-600 hover:bg-red-700 text-white">
          Se déconnecter
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
