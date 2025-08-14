<script setup lang="ts">
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
} from "lucide-vue-next"

import { usePrestataireStore } from '@/stores/prestataire'
import { useMissionStore } from '@/stores/mission'
import { useAuthStore } from '@/stores/auth'
import { onMounted, computed, ref, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { MissionStatutPrestataire } from '@/enums/mission-statut-prestataire'
import type { MissionPrestataire } from '@/interfaces/mission-prestataire'
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

const missions = computed(() => missionStore.missions)

// Filter missions by GraphQL MissionStatut values
const nouvellesMissions = computed(() => {
  const nouvelles = missions.value.filter((mission: any) => mission.status === 'EN_ATTENTE')
  console.log('🎯 Nouvelles missions count:', nouvelles.length, 'from total:', missions.value.length)
  if (missions.value.length > 0) {
    console.log('📋 All mission statuses:', missions.value.map((m: { status: any }) => m.status))
  }
  return nouvelles
})
const missionsEnCours = computed(() => {
  const enCours = missions.value.filter((mission: any) => 
    mission.status === 'EN_COURS' ||
    mission.status === 'ASSIGNEE'
  )
  console.log('🎯 Missions en cours count:', enCours.length)
  return enCours
})
const missionsTerminees = computed(() => {
  const terminees = missions.value.filter((mission: any) => 
    mission.status === 'TERMINEE' ||
    mission.status === 'ANNULEE' ||
    mission.status === 'SUSPENDUE'
  )
  console.log('🎯 Missions terminées count:', terminees.length)
  return terminees
})


const selectedMission = ref<MissionPrestataire | null>(null)
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

const navigateToChat = () => {
  router.push({
    path: '/chat',
  })
}

const viewMissionDetails = (missionId: string) => {
  router.push(`/mission/${missionId}`)
}

const openChat = (mission: any) => {
  // Navigate to chat page with mission context using userId for chat room creation
  router.push({
    path: '/chat',
    query: {
      prestataireId: mission.societaire?.id || '', // Use userId for chat room creation
      contactName: mission.societaire?.firstName + ' ' + (mission.societaire?.lastName || ''),
      contactPerson: mission.societaire?.firstName + ' ' + (mission.societaire?.lastName || ''),
      type: 'prestataire'
    }
  })
}
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
            <Avatar>
              <AvatarFallback>MD</AvatarFallback>
            </Avatar>
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
            Nouvelles demandes ({{ nouvellesMissions.length }})
          </TabsTrigger>
          <TabsTrigger value="en-cours" data-testid="en-cours-tab" class="data-[state=active]:bg-black data-[state=active]:text-white">
            Missions en cours ({{ missionsEnCours.length }})
          </TabsTrigger>
          <TabsTrigger value="terminees" data-testid="terminees-tab" class="data-[state=active]:bg-black data-[state=active]:text-white">
            Missions terminées ({{ missionsTerminees.length }})
          </TabsTrigger>
          <TabsTrigger value="statistics" data-testid="statistics-tab" class="data-[state=active]:bg-black data-[state=active]:text-white">
            Statistiques
          </TabsTrigger>
          <TabsTrigger value="profile" data-testid="profile-tab" class="data-[state=active]:bg-black data-[state=active]:text-white">
            Profil
          </TabsTrigger>
        </TabsList>

        <!-- Onglet Nouvelles demandes -->
        <TabsContent value="nouvelles" data-testid="nouvelles-missions-list">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card v-for="mission in nouvellesMissions" :key="mission.id" class="hover:shadow-lg transition-shadow border-gray-300 cursor-pointer" data-testid="mission-card" @click="viewMissionDetails(mission.id)">
              <CardHeader class="pb-3">
                <div class="flex items-start justify-between">
                  <div>
                    <CardTitle class="text-lg text-black">Mission</CardTitle>
                    <CardDescription class="text-sm text-gray-700">Dossier #{{ mission.reference }}</CardDescription>
                  </div>
                  <Badge :class="getStatutBadge(mission.status)?.class">
                    <component :is="getStatutBadge(mission.status)?.icon" class="w-3 h-3 mr-1" />
                    {{ getStatutBadge(mission.status)?.text }}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent class="space-y-3">
                <div class="flex items-center space-x-2">
                  <User class="w-4 h-4 text-gray-600" />
                  <span class="text-sm text-gray-700">{{ mission.societaire?.firstName + ' ' + (mission.societaire?.lastName || '') }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-sm text-gray-700">Contact: {{ mission.societaire?.firstName + ' ' + (mission.societaire?.lastName || '') }}</span>
                </div>
                <div class="flex items-center space-x-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    class="flex-1 bg-white border-gray-400 text-gray-700 hover:bg-gray-100 hover:border-gray-500 min-w-0 px-2" 
                    data-testid="details-button"
                    @click.stop="viewMissionDetails(mission.id)"
                  >
                    <Eye class="w-4 h-4 mr-1 flex-shrink-0" />
                    <span class="truncate">Voir détails</span>
                  </Button>

                  <Button
                    size="sm"
                    class="flex-1 bg-white border-gray-400 text-gray-700 hover:bg-gray-100 hover:border-gray-500 min-w-0 px-2"
                    variant="outline"
                    @click.stop="openChat(mission)"
                    data-testid="chat-button"
                  >
                    <MessageCircle class="w-4 h-4 mr-1 flex-shrink-0" />
                    <span class="truncate">Chat</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <!-- Onglet Missions en cours -->
        <TabsContent value="en-cours" data-testid="en-cours-missions-list">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card v-for="mission in missionsEnCours" :key="mission.id" class="hover:shadow-lg transition-shadow cursor-pointer" data-testid="mission-card" @click="viewMissionDetails(mission.id)">
              <CardHeader class="pb-3">
                <div class="flex items-start justify-between">
                  <div>
                    <CardTitle class="text-lg">Mission</CardTitle>
                    <CardDescription class="text-sm">Dossier #{{ mission.reference }}</CardDescription>
                  </div>
                  <Badge :class="getStatutBadge(mission.status)?.class">
                    <component :is="getStatutBadge(mission.status)?.icon" class="w-3 h-3 mr-1" />
                    {{ getStatutBadge(mission.status)?.text }}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent class="space-y-3">
                <div class="flex items-center space-x-2">
                  <User class="w-4 h-4 text-gray-500" />
                  <span class="text-sm">{{ mission.societaire?.firstName + ' ' + (mission.societaire?.lastName || '') }}</span>
                </div>
                <div class="flex items-center space-x-2 pt-2">
                  <Dialog>
                    <DialogTrigger as-child>
                      <Button variant="outline" size="sm" class="flex-1 bg-white border-gray-400 text-gray-700 hover:bg-gray-100 hover:border-gray-500 min-w-0 px-2" data-testid="details-button">
                        <Eye class="w-4 h-4 mr-1 flex-shrink-0" />
                        <span class="truncate">Détails</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent class="max-w-2xl max-h-[80vh] overflow-y-auto bg-white border-gray-300">
                      <DialogHeader>
                        <DialogTitle class="text-black">Mission #{{ mission.reference }}</DialogTitle>
                        <DialogDescription class="text-gray-700">Détails de la mission</DialogDescription>
                      </DialogHeader>

                      <div class="space-y-6">
                        <!-- Statut et actions -->
                        <div class="flex items-center justify-between">
                          <Badge :class="getStatutBadge(mission.status)?.class">
                            <component :is="getStatutBadge(mission.status)?.icon" class="w-3 h-3 mr-1" />
                            {{ getStatutBadge(mission.status)?.text }}
                          </Badge>
                          <div class="flex space-x-2">
                            <template v-if="mission.status === MissionStatutPrestataire.Nouvelle">
                              <Button size="sm" class="bg-black text-white hover:bg-gray-800 min-w-0 px-3" @click="changerStatutMission(mission.id, MissionStatutPrestataire.Acceptee)" data-testid="accept-mission-button">
                                <Check class="w-4 h-4 mr-1 flex-shrink-0" />
                                <span class="truncate">Accepter</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                class="border-gray-400 text-gray-700 hover:bg-gray-100 hover:border-gray-500 min-w-0 px-3"
                                @click="changerStatutMission(mission.id, MissionStatutPrestataire.Refusee)"
                                data-testid="refuse-mission-button"
                              >
                                <X class="w-4 h-4 mr-1 flex-shrink-0" />
                                <span class="truncate">Refuser</span>
                              </Button>
                            </template>
                            <Button v-else-if="mission.status === MissionStatutPrestataire.Acceptee" size="sm" class="bg-black text-white hover:bg-gray-800 min-w-0 px-3" @click="changerStatutMission(mission.id, MissionStatutPrestataire.EnCours)" data-testid="start-mission-button">
                              <span class="truncate">Démarrer</span>
                            </Button>
                            <Button v-else-if="mission.status === MissionStatutPrestataire.EnCours" size="sm" class="bg-black text-white hover:bg-gray-800 min-w-0 px-3" @click="changerStatutMission(mission.id, MissionStatutPrestataire.Terminee)" data-testid="finish-mission-button">
                              <span class="truncate">Terminer</span>
                            </Button>
                          </div>
                        </div>
                        <!-- The rest of the dialog content -->
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    size="sm"
                    class="flex-1 bg-white border-gray-400 text-gray-700 hover:bg-gray-100 hover:border-gray-500 min-w-0 px-2"
                    variant="outline"
                    @click.stop="openChat(mission)"
                    data-testid="chat-button"
                  >
                    <MessageCircle class="w-4 h-4 mr-1 flex-shrink-0" />
                    <span class="truncate">Chat</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <!-- Onglet Missions terminées -->
        <TabsContent value="terminees" data-testid="terminees-missions-list">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card v-for="mission in missionsTerminees" :key="mission.id" class="hover:shadow-lg transition-shadow cursor-pointer" data-testid="mission-card" @click="viewMissionDetails(mission.id)">
              <CardHeader class="pb-3">
                <div class="flex items-start justify-between">
                  <div>
                    <CardTitle class="text-lg">Mission</CardTitle>
                    <CardDescription class="text-sm">Dossier #{{ mission.reference }}</CardDescription>
                  </div>
                  <Badge :class="getStatutBadge(mission.status)?.class">
                    <component :is="getStatutBadge(mission.status)?.icon" class="w-3 h-3 mr-1" />
                    {{ getStatutBadge(mission.status)?.text }}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent class="space-y-3">
                <div class="flex items-center space-x-2">
                  <User class="w-4 h-4 text-gray-500" />
                  <span class="text-sm">{{ mission.societaire?.firstName + ' ' + (mission.societaire?.lastName || '') }}</span>
                </div>
                <div class="flex items-center space-x-2 pt-2">
                  <Dialog>
                    <DialogTrigger as-child>
                      <Button variant="outline" size="sm" class="flex-1 bg-white border-gray-400 text-gray-700 hover:bg-gray-100 hover:border-gray-500 min-w-0 px-2" data-testid="details-button">
                        <Eye class="w-4 h-4 mr-1 flex-shrink-0" />
                        <span class="truncate">Détails</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent class="max-w-2xl max-h-[80vh] overflow-y-auto bg-white border-gray-300">
                      <DialogHeader>
                        <DialogTitle class="text-black">Mission #{{ mission.reference }}</DialogTitle>
                        <DialogDescription class="text-gray-700">Détails de la mission</DialogDescription>
                      </DialogHeader>

                      <div class="space-y-6">
                        <!-- Statut et actions -->
                        <div class="flex items-center justify-between">
                          <Badge :class="getStatutBadge(mission.status)?.class">
                            <component :is="getStatutBadge(mission.status)?.icon" class="w-3 h-3 mr-1" />
                            {{ getStatutBadge(mission.status)?.text }}
                          </Badge>
                          <div class="flex space-x-2">
                            <template v-if="mission.status === MissionStatutPrestataire.Nouvelle">
                              <Button size="sm" class="bg-black text-white hover:bg-gray-800 min-w-0 px-3" @click="changerStatutMission(mission.id, MissionStatutPrestataire.Acceptee)" data-testid="accept-mission-button">
                                <Check class="w-4 h-4 mr-1 flex-shrink-0" />
                                <span class="truncate">Accepter</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                class="border-gray-400 text-gray-700 hover:bg-gray-100 hover:border-gray-500 min-w-0 px-3"
                                @click="changerStatutMission(mission.id, MissionStatutPrestataire.Refusee)"
                                data-testid="refuse-mission-button"
                              >
                                <X class="w-4 h-4 mr-1 flex-shrink-0" />
                                <span class="truncate">Refuser</span>
                              </Button>
                            </template>
                            <Button v-else-if="mission.status === MissionStatutPrestataire.Acceptee" size="sm" class="bg-black text-white hover:bg-gray-800 min-w-0 px-3" @click="changerStatutMission(mission.id, MissionStatutPrestataire.EnCours)" data-testid="start-mission-button">
                              <span class="truncate">Démarrer</span>
                            </Button>
                            <Button v-else-if="mission.status === MissionStatutPrestataire.EnCours" size="sm" class="bg-black text-white hover:bg-gray-800 min-w-0 px-3" @click="changerStatutMission(mission.id, MissionStatutPrestataire.Terminee)" data-testid="finish-mission-button">
                              <span class="truncate">Terminer</span>
                            </Button>
                          </div>
                        </div>
                        <!-- The rest of the dialog content -->
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    size="sm"
                    class="flex-1 bg-white border-gray-400 text-gray-700 hover:bg-gray-100 hover:border-gray-500 min-w-0 px-2"
                    variant="outline"
                    @click.stop="openChat(mission)"
                    data-testid="chat-button"
                  >
                    <MessageCircle class="w-4 h-4 mr-1 flex-shrink-0" />
                    <span class="truncate">Chat</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
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
      </Tabs>
    </div>
  </div>
</template>
