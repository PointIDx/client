<script setup lang="ts">
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { onMounted, computed, ref, watch } from 'vue'
import { MissionStatutPrestataire } from '@/enums/mission-statut-prestataire'
import { MessageExpediteur } from '@/enums/message-expediteur'
import type { MissionPrestataire } from '@/interfaces/mission-prestataire'
import { getPrestataireMissionStatusBadge } from '@/utils/status-badges'
import { handleError } from '@/utils/error-handling'

const prestataireStore = usePrestataireStore()

onMounted(() => {
  prestataireStore.getMissions()
})

const missions = computed(() => prestataireStore.missions)

const filteredMissions = (status: MissionStatutPrestataire) => {
  return missions.value.filter((mission) => mission.missionStatus === status)
}

const nouvellesMissions = computed(() => filteredMissions(MissionStatutPrestataire.Nouvelle))
const missionsEnCours = computed(() => {
  return missions.value.filter((mission) => 
    mission.missionStatus === MissionStatutPrestataire.EnCours ||
    mission.missionStatus === MissionStatutPrestataire.Acceptee
  )
})
const missionsTerminees = computed(() => {
  return missions.value.filter((mission) => 
    mission.missionStatus === MissionStatutPrestataire.Terminee ||
    mission.missionStatus === MissionStatutPrestataire.Refusee
  )
})

const messages = computed(() => prestataireStore.messages)
const selectedMission = ref<MissionPrestataire | null>(null)
const showChat = ref(false)
const newMessage = ref('')
const showSuccess = ref(false)
const successMessage = ref('')
const notifications = ref<any[]>([])
const getMessagesForMission = (missionId: string) => {
  return messages.value
    .filter((msg) => msg.missionId === missionId)
    .sort((a, b) => new Date(a.dateEnvoi).getTime() - new Date(b.dateEnvoi).getTime())
}

const envoyerMessage = async (missionId: string) => {
  if (!newMessage.value.trim()) return
  try {
    await prestataireStore.sendMessage(missionId, newMessage.value)
    newMessage.value = ""
  } catch (error) {
    handleError(error, 'Send Message', { showToast: true })
  }
}

watch(selectedMission, (newMission) => {
  if (newMission) {
    prestataireStore.subscribeToNewMessages(newMission.id)
  }
})

// Using shared utilities for status badges
const getStatutBadge = getPrestataireMissionStatusBadge

const changerStatutMission = async (missionId: string, nouveauStatut: MissionStatutPrestataire) => {
  try {
    await prestataireStore.updateMissionStatus(missionId, nouveauStatut)
    successMessage.value = `Statut de la mission mis à jour: ${nouveauStatut}`
    showSuccess.value = true
    setTimeout(() => (showSuccess.value = false), 3000)
  } catch (error) {
    handleError(error, 'Update Mission Status', { showToast: true })
  }
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
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="outline" size="sm" class="relative bg-white border-gray-400 text-gray-700 hover:bg-gray-100 hover:border-gray-500">
                  <Bell class="w-4 h-4 mr-2" />
                  Notifications
                  <Badge v-if="notifications.length > 0" class="absolute -top-2 -right-2 px-1 min-w-[1.2rem] h-5 bg-black text-white border-black">
                    {{ notifications.length }}
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-80">
                <DropdownMenuItem v-for="notif in notifications" :key="notif.id" class="flex-col items-start p-3">
                  <p class="text-sm font-medium">{{ notif.message }}</p>
                  <p class="text-xs text-gray-500">{{ new Date(notif.date).toLocaleString() }}</p>
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
          <TabsTrigger value="nouvelles" data-testid="nouvelles-tab">
            Nouvelles demandes ({{ nouvellesMissions.length }})
          </TabsTrigger>
          <TabsTrigger value="en-cours" data-testid="en-cours-tab">
            Missions en cours ({{ missionsEnCours.length }})
          </TabsTrigger>
          <TabsTrigger value="terminees" data-testid="terminees-tab">
            Missions terminées ({{ missionsTerminees.length }})
          </TabsTrigger>
        </TabsList>

        <!-- Onglet Nouvelles demandes -->
        <TabsContent value="nouvelles" data-testid="nouvelles-missions-list">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card v-for="mission in nouvellesMissions" :key="mission.id" class="hover:shadow-lg transition-shadow border-gray-300" data-testid="mission-card">
              <CardHeader class="pb-3">
                <div class="flex items-start justify-between">
                  <div>
                    <CardTitle class="text-lg text-black">{{ mission.dossier.type }}</CardTitle>
                    <CardDescription class="text-sm text-gray-700">Mission #{{ mission.dossier.dossierNumber }}</CardDescription>
                  </div>
                  <Badge :class="getStatutBadge(mission.missionStatus)?.class">
                    <component :is="getStatutBadge(mission.missionStatus)?.icon" class="w-3 h-3 mr-1" />
                    {{ getStatutBadge(mission.missionStatus)?.text }}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent class="space-y-3">
                <div class="flex items-center space-x-2">
                  <MapPin class="w-4 h-4 text-gray-600" />
                  <span class="text-sm text-gray-700">{{ mission.dossier.address }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <User class="w-4 h-4 text-gray-600" />
                  <span class="text-sm text-gray-700">{{ mission.assureur.companyName }}</span>
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
                        <DialogTitle class="text-black">Mission #{{ mission.dossier.dossierNumber }}</DialogTitle>
                        <DialogDescription class="text-gray-700">{{ mission.dossier.description }}</DialogDescription>
                      </DialogHeader>

                      <div class="space-y-6">
                        <!-- Statut et actions -->
                        <div class="flex items-center justify-between">
                          <Badge :class="getStatutBadge(mission.missionStatus)?.class">
                            <component :is="getStatutBadge(mission.missionStatus)?.icon" class="w-3 h-3 mr-1" />
                            {{ getStatutBadge(mission.missionStatus)?.text }}
                          </Badge>
                          <div class="flex space-x-2">
                            <template v-if="mission.missionStatus === MissionStatutPrestataire.Nouvelle">
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
                            <Button v-else-if="mission.missionStatus === MissionStatutPrestataire.Acceptee" size="sm" class="bg-black text-white hover:bg-gray-800 min-w-0 px-3" @click="changerStatutMission(mission.id, MissionStatutPrestataire.EnCours)" data-testid="start-mission-button">
                              <span class="truncate">Démarrer</span>
                            </Button>
                            <Button v-else-if="mission.missionStatus === MissionStatutPrestataire.EnCours" size="sm" class="bg-black text-white hover:bg-gray-800 min-w-0 px-3" @click="changerStatutMission(mission.id, MissionStatutPrestataire.Terminee)" data-testid="finish-mission-button">
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
                    @click="() => { selectedMission = mission; showChat = true; }"
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
            <Card v-for="mission in missionsEnCours" :key="mission.id" class="hover:shadow-lg transition-shadow" data-testid="mission-card">
              <CardHeader class="pb-3">
                <div class="flex items-start justify-between">
                  <div>
                    <CardTitle class="text-lg">{{ mission.dossier.type }}</CardTitle>
                    <CardDescription class="text-sm">Mission #{{ mission.dossier.dossierNumber }}</CardDescription>
                  </div>
                  <Badge :class="getStatutBadge(mission.missionStatus)?.class">
                    <component :is="getStatutBadge(mission.missionStatus)?.icon" class="w-3 h-3 mr-1" />
                    {{ getStatutBadge(mission.missionStatus)?.text }}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent class="space-y-3">
                <div class="flex items-center space-x-2">
                  <MapPin class="w-4 h-4 text-gray-500" />
                  <span class="text-sm text-gray-600">{{ mission.dossier.address }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <User class="w-4 h-4 text-gray-500" />
                  <span class="text-sm">{{ mission.assureur.companyName }}</span>
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
                        <DialogTitle class="text-black">Mission #{{ mission.dossier.dossierNumber }}</DialogTitle>
                        <DialogDescription class="text-gray-700">{{ mission.dossier.description }}</DialogDescription>
                      </DialogHeader>

                      <div class="space-y-6">
                        <!-- Statut et actions -->
                        <div class="flex items-center justify-between">
                          <Badge :class="getStatutBadge(mission.missionStatus)?.class">
                            <component :is="getStatutBadge(mission.missionStatus)?.icon" class="w-3 h-3 mr-1" />
                            {{ getStatutBadge(mission.missionStatus)?.text }}
                          </Badge>
                          <div class="flex space-x-2">
                            <template v-if="mission.missionStatus === MissionStatutPrestataire.Nouvelle">
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
                            <Button v-else-if="mission.missionStatus === MissionStatutPrestataire.Acceptee" size="sm" class="bg-black text-white hover:bg-gray-800 min-w-0 px-3" @click="changerStatutMission(mission.id, MissionStatutPrestataire.EnCours)" data-testid="start-mission-button">
                              <span class="truncate">Démarrer</span>
                            </Button>
                            <Button v-else-if="mission.missionStatus === MissionStatutPrestataire.EnCours" size="sm" class="bg-black text-white hover:bg-gray-800 min-w-0 px-3" @click="changerStatutMission(mission.id, MissionStatutPrestataire.Terminee)" data-testid="finish-mission-button">
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
                    @click="() => { selectedMission = mission; showChat = true; }"
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
            <Card v-for="mission in missionsTerminees" :key="mission.id" class="hover:shadow-lg transition-shadow" data-testid="mission-card">
              <CardHeader class="pb-3">
                <div class="flex items-start justify-between">
                  <div>
                    <CardTitle class="text-lg">{{ mission.dossier.type }}</CardTitle>
                    <CardDescription class="text-sm">Mission #{{ mission.dossier.dossierNumber }}</CardDescription>
                  </div>
                  <Badge :class="getStatutBadge(mission.missionStatus)?.class">
                    <component :is="getStatutBadge(mission.missionStatus)?.icon" class="w-3 h-3 mr-1" />
                    {{ getStatutBadge(mission.missionStatus)?.text }}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent class="space-y-3">
                <div class="flex items-center space-x-2">
                  <MapPin class="w-4 h-4 text-gray-500" />
                  <span class="text-sm text-gray-600">{{ mission.dossier.address }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <User class="w-4 h-4 text-gray-500" />
                  <span class="text-sm">{{ mission.assureur.companyName }}</span>
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
                        <DialogTitle class="text-black">Mission #{{ mission.dossier.dossierNumber }}</DialogTitle>
                        <DialogDescription class="text-gray-700">{{ mission.dossier.description }}</DialogDescription>
                      </DialogHeader>

                      <div class="space-y-6">
                        <!-- Statut et actions -->
                        <div class="flex items-center justify-between">
                          <Badge :class="getStatutBadge(mission.missionStatus)?.class">
                            <component :is="getStatutBadge(mission.missionStatus)?.icon" class="w-3 h-3 mr-1" />
                            {{ getStatutBadge(mission.missionStatus)?.text }}
                          </Badge>
                          <div class="flex space-x-2">
                            <template v-if="mission.missionStatus === MissionStatutPrestataire.Nouvelle">
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
                            <Button v-else-if="mission.missionStatus === MissionStatutPrestataire.Acceptee" size="sm" class="bg-black text-white hover:bg-gray-800 min-w-0 px-3" @click="changerStatutMission(mission.id, MissionStatutPrestataire.EnCours)" data-testid="start-mission-button">
                              <span class="truncate">Démarrer</span>
                            </Button>
                            <Button v-else-if="mission.missionStatus === MissionStatutPrestataire.EnCours" size="sm" class="bg-black text-white hover:bg-gray-800 min-w-0 px-3" @click="changerStatutMission(mission.id, MissionStatutPrestataire.Terminee)" data-testid="finish-mission-button">
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
                    @click="() => { selectedMission = mission; showChat = true; }"
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
      </Tabs>
    </div>

    <!-- Dialog Chat -->
    <Dialog :open="showChat" @update:open="showChat = $event">
      <DialogContent class="max-w-2xl max-h-[80vh] bg-white border-gray-300" data-testid="chat-dialog">
        <template v-if="selectedMission">
          <DialogHeader>
            <DialogTitle class="flex items-center space-x-2 text-black">
              <MessageCircle class="w-5 h-5" />
              <span>Chat - Mission #{{ selectedMission.dossier.dossierNumber }}</span>
            </DialogTitle>
            <DialogDescription class="text-gray-700">{{ selectedMission.dossier.description }}</DialogDescription>
          </DialogHeader>

          <div class="flex flex-col h-96">
            <!-- Messages -->
            <div class="flex-1 overflow-y-auto space-y-3 p-4 bg-gray-100 rounded border border-gray-300" data-testid="message-list">
              <div
                v-for="message in getMessagesForMission(selectedMission.id)"
                :key="message.id"
                class="flex"
                :class="message.expediteur === MessageExpediteur.Prestataire ? 'justify-end' : 'justify-start'"
                data-testid="message"
              >
                <div
                  class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg"
                  :class="message.expediteur === MessageExpediteur.Prestataire ? 'bg-black text-white' : 'bg-white border border-gray-300 shadow-sm'"
                >
                  <p class="text-sm">{{ message.contenu }}</p>
                  <p
                    class="text-xs mt-1"
                    :class="message.expediteur === MessageExpediteur.Prestataire ? 'text-gray-300' : 'text-gray-500'"
                  >
                    {{ new Date(message.dateEnvoi).toLocaleString() }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Zone de saisie -->
            <div class="flex space-x-2 pt-4">
              <Input
                v-model="newMessage"
                placeholder="Tapez votre message..."
                @keyup.enter="envoyerMessage(selectedMission.id)"
                data-testid="message-input"
                class="bg-white border-gray-300"
              />
              <Button @click="envoyerMessage(selectedMission.id)" :disabled="!newMessage.trim()" data-testid="send-message-button" class="bg-black text-white hover:bg-gray-800">
                <Send class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </template>
      </DialogContent>
    </Dialog>
  </div>
</template>
