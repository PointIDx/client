<script setup lang="ts">
import { ref, reactive } from "vue"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Bell,
  Briefcase,
  MessageCircle,
  Eye,
  Calendar,
  MapPin,
  Phone,
  Mail,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  MoreHorizontal,
  Euro,
  History,
  Check,
  X,
  MessageSquare,
} from "lucide-vue-next"

import { usePrestataireStore } from '@/stores/prestataire'
import { onMounted, computed } from 'vue'
import { MissionStatutPrestataire } from '@/enums/mission-statut-prestataire'

const prestataireStore = usePrestataireStore()

onMounted(() => {
  prestataireStore.getMissions()
})

const missions = computed(() => prestataireStore.missions)

const filteredMissions = (status: MissionStatutPrestataire) => {
  return missions.value.filter((mission) => mission.missionStatus === status)
}

const nouvellesMissions = computed(() => filteredMissions(MissionStatutPrestataire.Nouvelle))
const missionsEnCours = computed(() => filteredMissions(MissionStatutPrestataire.EnCours))
const missionsTerminees = computed(() => filteredMissions(MissionStatutPrestataire.Terminee))

const demandesComm = ref<DemandeCommPrestataire[]>(mockDemandesComm)
const messages = computed(() => prestataireStore.messages)
const getMessagesForMission = (missionId: string) => {
  return messages.value
    .filter((msg) => msg.missionId === missionId)
    .sort((a, b) => new Date(a.dateEnvoi).getTime() - new Date(b.dateEnvoi).getTime())
}

const envoyerMessage = async (missionId: string) => {
  if (!newMessage.value.trim()) return
  await prestataireStore.sendMessage(missionId, newMessage.value)
  newMessage.value = ""
}

watch(selectedMission, (newMission) => {
  if (newMission) {
    prestataireStore.subscribeToNewMessages(newMission.id)
  }
})

const getStatutBadge = (statut: MissionStatutPrestataire) => {
  switch (statut) {
    case MissionStatutPrestataire.Nouvelle:
      return {
        text: "Nouvelle",
        class: "bg-blue-100 text-blue-800",
        icon: Bell,
      }
    case MissionStatutPrestataire.Acceptee:
      return {
        text: "Acceptée",
        class: "default",
        icon: CheckCircle,
      }
    case MissionStatutPrestataire.Refusee:
      return {
        text: "Refusée",
        class: "destructive",
        icon: XCircle,
      }
    case MissionStatutPrestataire.EnCours:
      return {
        text: "En cours",
        class: "bg-yellow-100 text-yellow-800",
        icon: Clock,
      }
    case MissionStatutPrestataire.Terminee:
      return {
        text: "Terminée",
        class: "bg-green-100 text-green-800",
        icon: CheckCircle,
      }
    case MissionStatutPrestataire.Annulee:
      return {
        text: "Annulée",
        class: "destructive",
        icon: XCircle,
      }
  }
}

const getUrgenceBadge = (urgence: UrgenceMission) => {
  switch (urgence) {
    case UrgenceMission.Faible:
      return { text: "Faible", class: "bg-green-100 text-green-800" }
    case UrgenceMission.Moyenne:
      return { text: "Moyenne", class: "bg-yellow-100 text-yellow-800" }
    case UrgenceMission.Elevee:
      return { text: "Élevée", class: "bg-red-100 text-red-800" }
  }
}

const changerStatutMission = async (missionId: string, nouveauStatut: MissionStatutPrestataire) => {
  try {
    await prestataireStore.updateMissionStatus(missionId, nouveauStatut)
    successMessage.value = `Statut de la mission mis à jour: ${nouveauStatut}`
    showSuccess.value = true
    setTimeout(() => (showSuccess.value = false), 3000)
  } catch (error) {
    console.error(error)
  }
}

const repondreDemande = (demandeId: string, reponse: DemandeCommStatut, message?: string) => {
  demandesComm.value = demandesComm.value.map((demande) =>
    demande.id === demandeId
      ? {
          ...demande,
          statut: reponse,
          dateReponse: new Date().toISOString(),
        }
      : demande,
  )

  successMessage.value = `Demande ${reponse === DemandeCommStatut.Acceptee ? "acceptée" : "refusée"} avec succès`
  showSuccess.value = true
  setTimeout(() => (showSuccess.value = false), 3000)
}

const envoyerMessage = (missionId: string) => {
  if (!newMessage.value.trim()) return

  const nouveauMessage: Message = {
    id: Date.now().toString(),
    missionId,
    expediteur: MessageExpediteur.Prestataire,
    contenu: newMessage.value,
    dateEnvoi: new Date().toISOString(),
    lu: true,
  }

  messages.value.push(nouveauMessage)
  newMessage.value = ""
}

const getMessagesForMission = (missionId: string) => {
  return messages.value
    .filter((msg) => msg.missionId === missionId)
    .sort((a, b) => new Date(a.dateEnvoi).getTime() - new Date(b.dateEnvoi).getTime())
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Dashboard Prestataire</h1>
            <p class="text-gray-600">Gérez vos missions et communications</p>
          </div>
          <div class="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="outline" size="sm" class="relative bg-transparent">
                  <Bell class="w-4 h-4 mr-2" />
                  Notifications
                  <Badge v-if="notifications.length > 0" class="absolute -top-2 -right-2 px-1 min-w-[1.2rem] h-5">
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
      <Alert class="bg-green-50 border-green-200">
        <CheckCircle class="h-4 w-4 text-green-600" />
        <AlertDescription class="text-green-800">{{ successMessage }}</AlertDescription>
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
            <Card v-for="mission in nouvellesMissions" :key="mission.id" class="hover:shadow-lg transition-shadow" data-testid="mission-card">
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
                      <Button variant="outline" size="sm" class="flex-1 bg-transparent" data-testid="details-button">
                        <Eye class="w-4 h-4 mr-1" />
                        Détails
                      </Button>
                    </DialogTrigger>
                    <DialogContent class="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Mission #{{ mission.dossier.dossierNumber }}</DialogTitle>
                        <DialogDescription>{{ mission.dossier.description }}</DialogDescription>
                      </DialogHeader>

                      <div class="space-y-6">
                        <!-- Statut et actions -->
                        <div class="flex items-center justify-between">
                          <Badge :class="getStatutBadge(mission.missionStatus)?.class">
                            <component :is="getStatutBadge(mission.missionStatus)?.icon" class="w-3 h-3 mr-1" />
                            {{ getStatutBadge(mission.missionStatus)?.text }}
                          </Badge>
                          <div class="flex space-x-2">
                            <template v-if="mission.missionStatus === 'NOUVELLE_DEMANDE'">
                              <Button size="sm" @click="changerStatutMission(mission.id, 'ACCEPTEE')" data-testid="accept-mission-button">
                                <Check class="w-4 h-4 mr-1" />
                                Accepter
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                @click="changerStatutMission(mission.id, 'REFUSEE')"
                                data-testid="refuse-mission-button"
                              >
                                <X class="w-4 h-4 mr-1" />
                                Refuser
                              </Button>
                            </template>
                            <Button v-else-if="mission.missionStatus === 'ACCEPTEE'" size="sm" @click="changerStatutMission(mission.id, 'EN_COURS')" data-testid="start-mission-button">
                              Démarrer
                            </Button>
                            <Button v-else-if="mission.missionStatus === 'EN_COURS'" size="sm" @click="changerStatutMission(mission.id, 'TERMINEE')" data-testid="finish-mission-button">
                              Terminer
                            </Button>
                          </div>
                        </div>
                        <!-- The rest of the dialog content -->
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    size="sm"
                    class="flex-1"
                    @click="() => { selectedMission = mission; showChat = true; }"
                    data-testid="chat-button"
                  >
                    <MessageCircle class="w-4 h-4 mr-1" />
                    Chat
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
                      <Button variant="outline" size="sm" class="flex-1 bg-transparent" data-testid="details-button">
                        <Eye class="w-4 h-4 mr-1" />
                        Détails
                      </Button>
                    </DialogTrigger>
                    <DialogContent class="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Mission #{{ mission.dossier.dossierNumber }}</DialogTitle>
                        <DialogDescription>{{ mission.dossier.description }}</DialogDescription>
                      </DialogHeader>

                      <div class="space-y-6">
                        <!-- Statut et actions -->
                        <div class="flex items-center justify-between">
                          <Badge :class="getStatutBadge(mission.missionStatus)?.class">
                            <component :is="getStatutBadge(mission.missionStatus)?.icon" class="w-3 h-3 mr-1" />
                            {{ getStatutBadge(mission.missionStatus)?.text }}
                          </Badge>
                          <div class="flex space-x-2">
                            <template v-if="mission.missionStatus === 'NOUVELLE_DEMANDE'">
                              <Button size="sm" @click="changerStatutMission(mission.id, 'ACCEPTEE')" data-testid="accept-mission-button">
                                <Check class="w-4 h-4 mr-1" />
                                Accepter
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                @click="changerStatutMission(mission.id, 'REFUSEE')"
                                data-testid="refuse-mission-button"
                              >
                                <X class="w-4 h-4 mr-1" />
                                Refuser
                              </Button>
                            </template>
                            <Button v-else-if="mission.missionStatus === 'ACCEPTEE'" size="sm" @click="changerStatutMission(mission.id, 'EN_COURS')" data-testid="start-mission-button">
                              Démarrer
                            </Button>
                            <Button v-else-if="mission.missionStatus === 'EN_COURS'" size="sm" @click="changerStatutMission(mission.id, 'TERMINEE')" data-testid="finish-mission-button">
                              Terminer
                            </Button>
                          </div>
                        </div>
                        <!-- The rest of the dialog content -->
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    size="sm"
                    class="flex-1"
                    @click="() => { selectedMission = mission; showChat = true; }"
                    data-testid="chat-button"
                  >
                    <MessageCircle class="w-4 h-4 mr-1" />
                    Chat
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
                      <Button variant="outline" size="sm" class="flex-1 bg-transparent" data-testid="details-button">
                        <Eye class="w-4 h-4 mr-1" />
                        Détails
                      </Button>
                    </DialogTrigger>
                    <DialogContent class="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Mission #{{ mission.dossier.dossierNumber }}</DialogTitle>
                        <DialogDescription>{{ mission.dossier.description }}</DialogDescription>
                      </DialogHeader>

                      <div class="space-y-6">
                        <!-- Statut et actions -->
                        <div class="flex items-center justify-between">
                          <Badge :class="getStatutBadge(mission.missionStatus)?.class">
                            <component :is="getStatutBadge(mission.missionStatus)?.icon" class="w-3 h-3 mr-1" />
                            {{ getStatutBadge(mission.missionStatus)?.text }}
                          </Badge>
                          <div class="flex space-x-2">
                            <template v-if="mission.missionStatus === 'NOUVELLE_DEMANDE'">
                              <Button size="sm" @click="changerStatutMission(mission.id, 'ACCEPTEE')" data-testid="accept-mission-button">
                                <Check class="w-4 h-4 mr-1" />
                                Accepter
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                @click="changerStatutMission(mission.id, 'REFUSEE')"
                                data-testid="refuse-mission-button"
                              >
                                <X class="w-4 h-4 mr-1" />
                                Refuser
                              </Button>
                            </template>
                            <Button v-else-if="mission.missionStatus === 'ACCEPTEE'" size="sm" @click="changerStatutMission(mission.id, 'EN_COURS')" data-testid="start-mission-button">
                              Démarrer
                            </Button>
                            <Button v-else-if="mission.missionStatus === 'EN_COURS'" size="sm" @click="changerStatutMission(mission.id, 'TERMINEE')" data-testid="finish-mission-button">
                              Terminer
                            </Button>
                          </div>
                        </div>
                        <!-- The rest of the dialog content -->
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    size="sm"
                    class="flex-1"
                    @click="() => { selectedMission = mission; showChat = true; }"
                    data-testid="chat-button"
                  >
                    <MessageCircle class="w-4 h-4 mr-1" />
                    Chat
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
      <DialogContent class="max-w-2xl max-h-[80vh]" data-testid="chat-dialog">
        <template v-if="selectedMission">
          <DialogHeader>
            <DialogTitle class="flex items-center space-x-2">
              <MessageCircle class="w-5 h-5" />
              <span>Chat - Mission #{{ selectedMission.dossier.dossierNumber }}</span>
            </DialogTitle>
            <DialogDescription>{{ selectedMission.dossier.description }}</DialogDescription>
          </DialogHeader>

          <div class="flex flex-col h-96">
            <!-- Messages -->
            <div class="flex-1 overflow-y-auto space-y-3 p-4 bg-gray-50 rounded" data-testid="message-list">
              <div
                v-for="message in getMessagesForMission(selectedMission.id)"
                :key="message.id"
                class="flex"
                :class="message.expediteur === 'PRESTATAIRE' ? 'justify-end' : 'justify-start'"
                data-testid="message"
              >
                <div
                  class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg"
                  :class="message.expediteur === 'PRESTATAIRE' ? 'bg-blue-600 text-white' : 'bg-white border shadow-sm'"
                >
                  <p class="text-sm">{{ message.contenu }}</p>
                  <p
                    class="text-xs mt-1"
                    :class="message.expediteur === 'PRESTATAIRE' ? 'text-blue-100' : 'text-gray-500'"
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
              />
              <Button @click="envoyerMessage(selectedMission.id)" :disabled="!newMessage.trim()" data-testid="send-message-button">
                <Send class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </template>
      </DialogContent>
    </Dialog>
  </div>
</template>
