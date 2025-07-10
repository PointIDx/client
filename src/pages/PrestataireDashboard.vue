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

import type { Mission as MissionInterface } from "@/interfaces/mission-prestataire"
import type { DemandeCommPrestataire } from "@/interfaces/demande-comm-prestataire"
import  type { Message } from "@/interfaces/message"
import type { HistoriqueStatut } from "@/interfaces/historique-statut"
import { MissionStatutPrestataire } from "@/enums/mission-statut-prestataire"
import { DemandeCommStatut } from "@/enums/demande-comm-statut"
import { UrgenceMission } from "@/enums/urgence-mission"
import { MessageExpediteur } from "@/enums/message-expediteur"

// Données mockées
const mockMissions: MissionInterface[] = [
  {
    id: "1",
    numeroMission: "M240001",
    assureur: {
      nom: "Assurance Générale",
      email: "contact@assurance-generale.fr",
      telephone: "01 23 45 67 89",
    },
    client: {
      civilite: "M",
      nom: "Dupont",
      prenom: "Jean",
      telephone: "06 12 34 56 78",
      email: "jean.dupont@email.com",
    },
    chantier: {
      adresse: "15 Rue de la Paix",
      ville: "Lyon",
      codePostal: "69001",
    },
    mission: {
      titre: "Réparation fissures mur porteur",
      description: "Réparation de fissures importantes sur mur porteur suite à tassement",
      budgetEstime: "2500",
    },
    sinistre: {
      type: "Fissures",
      urgence: UrgenceMission.Elevee,
      numeroSinistre: "SIN2024001",
    },
    statut: MissionStatutPrestataire.Nouvelle,
    dateCreation: "2024-01-15T10:30:00Z",
    nouveauxMessages: 2,
  },
  {
    id: "2",
    numeroMission: "M240002",
    assureur: {
      nom: "Mutuelle Pro",
      email: "missions@mutuelle-pro.fr",
      telephone: "04 56 78 90 12",
    },
    client: {
      civilite: "Mme",
      nom: "Martin",
      prenom: "Claire",
      telephone: "06 98 76 54 32",
      email: "claire.martin@email.com",
    },
    chantier: {
      adresse: "8 Avenue des Fleurs",
      ville: "Lyon",
      codePostal: "69008",
    },
    mission: {
      titre: "Rénovation salle de bain",
      description: "Rénovation complète salle de bain suite à dégât des eaux",
      budgetEstime: "4200",
    },
    sinistre: {
      type: "Dégât des eaux",
      urgence: UrgenceMission.Moyenne,
      numeroSinistre: "SIN2024002",
    },
    statut: MissionStatutPrestataire.EnCours,
    dateCreation: "2024-01-10T14:20:00Z",
    dateReponse: "2024-01-11T09:15:00Z",
    dateFinPrevue: "2024-02-10T17:00:00Z",
    nouveauxMessages: 0,
  },
  {
    id: "3",
    numeroMission: "M240003",
    assureur: {
      nom: "Assurance Habitat",
      email: "sinistres@assurance-habitat.fr",
      telephone: "02 34 56 78 90",
    },
    client: {
      civilite: "M",
      nom: "Bernard",
      prenom: "Paul",
      telephone: "06 11 22 33 44",
      email: "paul.bernard@email.com",
    },
    chantier: {
      adresse: "22 Rue du Commerce",
      ville: "Villeurbanne",
      codePostal: "69100",
    },
    mission: {
      titre: "Réparation toiture après tempête",
      description: "Réparation de tuiles et gouttières endommagées par la tempête",
      budgetEstime: "1800",
    },
    sinistre: {
      type: "Tempête",
      urgence: UrgenceMission.Moyenne,
      numeroSinistre: "SIN2024003",
    },
    statut: MissionStatutPrestataire.Terminee,
    dateCreation: "2024-01-05T08:30:00Z",
    dateReponse: "2024-01-05T14:20:00Z",
    dateFinPrevue: "2024-01-25T17:00:00Z",
    nouveauxMessages: 1,
  },
]

const mockDemandesComm: DemandeCommPrestataire[] = [
  {
    id: "1",
    assureur: {
      nom: "Marie Dubois",
      entreprise: "Assurance Générale",
      email: "marie.dubois@assurance-generale.fr",
      telephone: "01 23 45 67 89",
    },
    message:
      "Bonjour, nous avons un sinistre urgent à traiter dans votre secteur. Pourriez-vous nous confirmer votre disponibilité pour une intervention cette semaine ?",
    statut: DemandeCommStatut.EnAttente,
    dateEnvoi: "2024-01-20T10:30:00Z",
  },
  {
    id: "2",
    assureur: {
      nom: "Pierre Martin",
      entreprise: "Mutuelle Pro",
      email: "pierre.martin@mutuelle-pro.fr",
      telephone: "04 56 78 90 12",
    },
    message:
      "Nous recherchons un prestataire qualifié pour des travaux de maçonnerie. Votre profil correspond à nos critères. Êtes-vous intéressé par un partenariat ?",
    statut: DemandeCommStatut.EnAttente,
    dateEnvoi: "2024-01-18T14:15:00Z",
  },
]

const mockMessages: Message[] = [
  {
    id: "1",
    missionId: "1",
    expediteur: MessageExpediteur.Assureur,
    contenu: "Bonjour, pouvez-vous confirmer votre disponibilité pour cette mission urgente ?",
    dateEnvoi: "2024-01-15T11:00:00Z",
    lu: false,
  },
  {
    id: "2",
    missionId: "1",
    expediteur: MessageExpediteur.Assureur,
    contenu: "Le client sera disponible demain matin pour vous rencontrer.",
    dateEnvoi: "2024-01-15T15:30:00Z",
    lu: false,
  },
  {
    id: "3",
    missionId: "2",
    expediteur: MessageExpediteur.Prestataire,
    contenu: "Travaux en cours, avancement à 60%. Photos envoyées par email.",
    dateEnvoi: "2024-01-25T14:20:00Z",
    lu: true,
  },
  {
    id: "4",
    missionId: "3",
    expediteur: MessageExpediteur.Assureur,
    contenu: "Merci pour la mission terminée. Le client est très satisfait.",
    dateEnvoi: "2024-01-26T09:15:00Z",
    lu: false,
  },
]

const missions = ref<MissionInterface[]>(mockMissions)
const demandesComm = ref<DemandeCommPrestataire[]>(mockDemandesComm)
const messages = ref<Message[]>(mockMessages)
const historiqueStatuts = ref<HistoriqueStatut[]>([])
const selectedMission = ref<MissionInterface | null>(null)
const showChat = ref(false)
const newMessage = ref("")
const showSuccess = ref(false)
const successMessage = ref("")

const notifications = ref([
  { id: "1", type: "mission", message: "Nouvelle mission assignée: M240001", date: "2024-01-15T10:30:00Z" },
  { id: "2", type: "message", message: "Nouveau message sur mission M240001", date: "2024-01-15T15:30:00Z" },
  { id: "3", type: "demande", message: "Nouvelle demande de communication", date: "2024-01-20T10:30:00Z" },
])

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

const changerStatutMission = (missionId: string, nouveauStatut: MissionStatutPrestataire, commentaire?: string) => {
  missions.value = missions.value.map((mission) => {
    if (mission.id === missionId) {
      const nouvelHistorique: HistoriqueStatut = {
        id: Date.now().toString(),
        missionId,
        ancienStatut: mission.statut,
        nouveauStatut,
        commentaire,
        dateChangement: new Date().toISOString(),
      }
      historiqueStatuts.value.push(nouvelHistorique)

      return { ...mission, statut: nouveauStatut }
    }
    return mission
  })

  successMessage.value = `Statut de la mission mis à jour: ${nouveauStatut}`
  showSuccess.value = true
  setTimeout(() => (showSuccess.value = false), 3000)
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

const marquerMessagesLus = (missionId: string) => {
  messages.value = messages.value.map((msg) =>
    msg.missionId === missionId && msg.expediteur === MessageExpediteur.Assureur ? { ...msg, lu: true } : msg,
  )

  missions.value = missions.value.map((mission) =>
    mission.id === missionId ? { ...mission, nouveauxMessages: 0 } : mission,
  )
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
    <div v-if="showSuccess" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <Alert class="bg-green-50 border-green-200">
        <CheckCircle class="h-4 w-4 text-green-600" />
        <AlertDescription class="text-green-800">{{ successMessage }}</AlertDescription>
      </Alert>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Tabs default-value="missions" class="space-y-6">
        <TabsList>
          <TabsTrigger value="missions">
            Mes Missions ({{ missions.length }})
            <Badge v-if="missions.filter((m) => m.nouveauxMessages > 0).length > 0" class="ml-2 px-1 min-w-[1.2rem] h-5">
              {{ missions.reduce((acc, m) => acc + m.nouveauxMessages, 0) }}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="demandes">
            Demandes de Communication ({{ demandesComm.filter((d) => d.statut === "en_attente").length }})
          </TabsTrigger>
        </TabsList>

        <!-- Onglet Missions -->
        <TabsContent value="missions" class="space-y-6">
          <!-- Statistiques -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent class="p-4">
                <div class="flex items-center space-x-2">
                  <Briefcase class="w-5 h-5 text-blue-600" />
                  <div>
                    <p class="text-sm text-gray-600">Total missions</p>
                    <p class="text-2xl font-bold">{{ missions.length }}</p>
                  </div>
                </div>
                </CardContent>
            </Card>
            <Card>
              <CardContent class="p-4">
                <div class="flex items-center space-x-2">
                  <Bell class="w-5 h-5 text-orange-600" />
                  <div>
                    <p class="text-sm text-gray-600">Nouvelles</p>
                    <p class="text-2xl font-bold">{{ missions.filter((m) => m.statut === "nouvelle").length }}</p>
                  </div>
                </div>
                </CardContent>
            </Card>
            <Card>
              <CardContent class="p-4">
                <div class="flex items-center space-x-2">
                  <Clock class="w-5 h-5 text-yellow-600" />
                  <div>
                    <p class="text-sm text-gray-600">En cours</p>
                    <p class="text-2xl font-bold">{{ missions.filter((m) => m.statut === "en_cours").length }}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent class="p-4">
                <div class="flex items-center space-x-2">
                  <AlertTriangle class="w-5 h-5 text-red-600" />
                  <div>
                    <p class="text-sm text-gray-600">Urgentes</p>
                    <p class="text-2xl font-bold">
                      {{ missions.filter((m) => m.sinistre.urgence === "elevee").length }}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- Liste des missions -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card v-for="mission in missions" :key="mission.id" class="hover:shadow-lg transition-shadow">
              <CardHeader class="pb-3">
                <div class="flex items-start justify-between">
                  <div>
                    <CardTitle class="text-lg">{{ mission.mission.titre }}</CardTitle>
                    <CardDescription class="text-sm">Mission #{{ mission.numeroMission }}</CardDescription>
                  </div>
                  <div class="flex flex-col items-end space-y-1">
                    <Badge :class="getStatutBadge(mission.statut)?.class">
                      <component :is="getStatutBadge(mission.statut)?.icon" class="w-3 h-3 mr-1" />
                      {{ getStatutBadge(mission.statut)?.text }}
                    </Badge>
                    <Badge v-if="mission.nouveauxMessages > 0" class="bg-red-100 text-red-800">
                      <MessageCircle class="w-3 h-3 mr-1" />
                      {{ mission.nouveauxMessages }}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent class="space-y-3">
                <!-- Client -->
                <div class="flex items-center space-x-2">
                  <User class="w-4 h-4 text-gray-500" />
                  <span class="text-sm">
                    {{ mission.client.civilite }} {{ mission.client.prenom }} {{ mission.client.nom }}
                  </span>
                </div>

                <!-- Localisation -->
                <div class="flex items-center space-x-2">
                  <MapPin class="w-4 h-4 text-gray-500" />
                  <span class="text-sm text-gray-600">{{ mission.chantier.ville }}</span>
                </div>

                <!-- Type et urgence -->
                <div class="flex items-center justify-between">
                  <Badge variant="outline" class="text-xs">
                    {{ mission.sinistre.type }}
                  </Badge>
                  <Badge :class="getUrgenceBadge(mission.sinistre.urgence)?.class">
                    {{ getUrgenceBadge(mission.sinistre.urgence)?.text }}
                  </Badge>
                </div>

                <!-- Budget -->
                <div v-if="mission.mission.budgetEstime" class="flex items-center space-x-2">
                  <Euro class="w-4 h-4 text-gray-500" />
                  <span class="text-sm text-gray-600">{{ mission.mission.budgetEstime }}€</span>
                </div>

                <!-- Date -->
                <div class="flex items-center space-x-2">
                  <Calendar class="w-4 h-4 text-gray-500" />
                  <span class="text-sm text-gray-600">
                    {{ new Date(mission.dateCreation).toLocaleDateString() }}
                  </span>
                </div>

                <!-- Actions -->
                <div class="flex space-x-2 pt-2">
                  <Dialog>
                    <DialogTrigger as-child>
                      <Button variant="outline" size="sm" class="flex-1 bg-transparent">
                        <Eye class="w-4 h-4 mr-1" />
                        Détails
                      </Button>
                    </DialogTrigger>
                    <DialogContent class="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Mission #{{ mission.numeroMission }}</DialogTitle>
                        <DialogDescription>{{ mission.mission.titre }}</DialogDescription>
                      </DialogHeader>

                      <div class="space-y-6">
                        <!-- Statut et actions -->
                        <div class="flex items-center justify-between">
                          <Badge :class="getStatutBadge(mission.statut)?.class">
                            <component :is="getStatutBadge(mission.statut)?.icon" class="w-3 h-3 mr-1" />
                            {{ getStatutBadge(mission.statut)?.text }}
                          </Badge>
                          <div class="flex space-x-2">
                            <template v-if="mission.statut === 'nouvelle'">
                              <Button size="sm" @click="changerStatutMission(mission.id, MissionStatutPrestataire.Acceptee)">
                                <Check class="w-4 h-4 mr-1" />
                                Accepter
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                @click="changerStatutMission(mission.id, MissionStatutPrestataire.Refusee)"
                              >
                                <X class="w-4 h-4 mr-1" />
                                Refuser
                              </Button>
                            </template>
                            <Button v-else-if="mission.statut === 'acceptee'" size="sm" @click="changerStatutMission(mission.id, MissionStatutPrestataire.EnCours)">
                              Démarrer
                            </Button>
                            <Button v-else-if="mission.statut === 'en_cours'" size="sm" @click="changerStatutMission(mission.id, MissionStatutPrestataire.Terminee)">
                              Terminer
                            </Button>
                          </div>
                        </div>

                        <!-- Informations client -->
                        <div>
                          <h4 class="font-semibold mb-3">Client</h4>
                          <div class="bg-gray-50 p-4 rounded-lg space-y-2">
                            <p>
                              <strong>
                                {{ mission.client.civilite }} {{ mission.client.prenom }} {{ mission.client.nom }}
                              </strong>
                            </p>
                            <div class="flex items-center space-x-4 text-sm text-gray-600">
                              <span class="flex items-center">
                                <Phone class="w-3 h-3 mr-1" />
                                {{ mission.client.telephone }}
                              </span>
                              <span v-if="mission.client.email" class="flex items-center">
                                <Mail class="w-3 h-3 mr-1" />
                                {{ mission.client.email }}
                              </span>
                            </div>
                          </div>
                        </div>

                        <!-- Informations assureur -->
                        <div>
                          <h4 class="font-semibold mb-3">Assureur</h4>
                          <div class="bg-blue-50 p-4 rounded-lg space-y-2">
                            <p class="font-semibold">{{ mission.assureur.nom }}</p>
                            <div class="flex items-center space-x-4 text-sm text-gray-600">
                              <span class="flex items-center">
                                <Phone class="w-3 h-3 mr-1" />
                                {{ mission.assureur.telephone }}
                              </span>
                              <span class="flex items-center">
                                <Mail class="w-3 h-3 mr-1" />
                                {{ mission.assureur.email }}
                              </span>
                            </div>
                          </div>
                        </div>

                        <!-- Chantier -->
                        <div>
                          <h4 class="font-semibold mb-3">Lieu d'intervention</h4>
                          <div class="flex items-center space-x-2">
                            <MapPin class="w-4 h-4 text-gray-500" />
                            <span>
                              {{ mission.chantier.adresse }}, {{ mission.chantier.codePostal }} {{ mission.chantier.ville }}
                            </span>
                          </div>
                        </div>

                        <!-- Description -->
                        <div>
                          <h4 class="font-semibold mb-3">Description de la mission</h4>
                          <p class="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                            {{ mission.mission.description }}
                          </p>
                        </div>

                        <!-- Sinistre -->
                        <div>
                          <h4 class="font-semibold mb-3">Sinistre</h4>
                          <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span class="text-gray-500">Type:</span>
                              <p>{{ mission.sinistre.type }}</p>
                            </div>
                            <div>
                              <span class="text-gray-500">N° Sinistre:</span>
                              <p>{{ mission.sinistre.numeroSinistre }}</p>
                            </div>
                            <div>
                              <span class="text-gray-500">Urgence:</span>
                              <div class="mt-1">
                                <Badge :class="getUrgenceBadge(mission.sinistre.urgence)?.class">
                                  {{ getUrgenceBadge(mission.sinistre.urgence)?.text }}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Budget -->
                        <div v-if="mission.mission.budgetEstime">
                          <h4 class="font-semibold mb-3">Budget estimé</h4>
                          <p class="text-lg font-semibold text-green-600">{{ mission.mission.budgetEstime }}€</p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    size="sm"
                    class="flex-1"
                    @click="() => { selectedMission = mission; showChat = true; marquerMessagesLus(mission.id); }"
                  >
                    <MessageCircle class="w-4 h-4 mr-1" />
                    Chat
                  </Button>

                  <!-- Menu changement de statut -->
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal class="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <template v-if="mission.statut === 'nouvelle'">
                        <DropdownMenuItem @click="changerStatutMission(mission.id, MissionStatutPrestataire.Acceptee)">
                          <Check class="w-4 h-4 mr-2" />
                          Accepter
                        </DropdownMenuItem>
                        <DropdownMenuItem @click="changerStatutMission(mission.id, MissionStatutPrestataire.Refusee)">
                          <X class="w-4 h-4 mr-2" />
                          Refuser
                        </DropdownMenuItem>
                      </template>
                      <DropdownMenuItem v-else-if="mission.statut === 'acceptee'" @click="changerStatutMission(mission.id, MissionStatutPrestataire.EnCours)">
                        <Clock class="w-4 h-4 mr-2" />
                        Démarrer
                      </DropdownMenuItem>
                      <DropdownMenuItem v-else-if="mission.statut === 'en_cours'" @click="changerStatutMission(mission.id, MissionStatutPrestataire.Terminee)">
                        <CheckCircle class="w-4 h-4 mr-2" />
                        Terminer
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <History class="w-4 h-4 mr-2" />
                        Voir historique
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <!-- Onglet Demandes de Communication -->
        <TabsContent value="demandes">
          <Card>
            <CardHeader>
              <CardTitle>Demandes de communication</CardTitle>
              <CardDescription>Gérez les demandes de contact des assureurs</CardDescription>
            </CardHeader>
            <CardContent>
              <div v-if="demandesComm.length === 0" class="text-center py-8 text-gray-500">
                <MessageSquare class="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune demande de communication</p>
              </div>
              <div v-else class="space-y-4">
                <div v-for="demande in demandesComm" :key="demande.id" class="border rounded-lg p-4">
                  <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {{ demande.assureur.nom
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                          }}
                        </AvatarFallback>
                      </Avatar>
                      <div class="flex-1">
                        <h4 class="font-semibold">{{ demande.assureur.nom }}</h4>
                        <p class="text-sm text-gray-600">{{ demande.assureur.entreprise }}</p>
                        <div class="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span class="flex items-center">
                            <Phone class="w-3 h-3 mr-1" />
                            {{ demande.assureur.telephone }}
                          </span>
                          <span class="flex items-center">
                            <Mail class="w-3 h-3 mr-1" />
                            {{ demande.assureur.email }}
                          </span>
                        </div>
                        <p class="text-sm text-gray-500 mt-2">
                          Reçu le {{ new Date(demande.dateEnvoi).toLocaleDateString() }} à
                          {{ new Date(demande.dateEnvoi).toLocaleTimeString() }}
                        </p>
                        <div class="mt-3">
                          <p class="text-sm">
                            <strong>Message:</strong>
                          </p>
                          <p class="text-sm text-gray-700 bg-gray-50 p-3 rounded mt-1">{{ demande.message }}</p>
                        </div>
                      </div>
                    </div>
                    <div class="text-right">
                      <template v-if="demande.statut === 'en_attente'">
                        <div class="flex space-x-2">
                          <Dialog>
                            <DialogTrigger as-child>
                              <Button size="sm">
                                <Check class="w-4 h-4 mr-1" />
                                Accepter
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Accepter la demande</DialogTitle>
                                <DialogDescription>
                                  Vous allez accepter la demande de communication de {{ demande.assureur.nom }}
                                </DialogDescription>
                              </DialogHeader>
                              <div class="space-y-4">
                                <div>
                                  <Label for="messageAcceptation">Message de réponse (optionnel)</Label>
                                  <Textarea
                                    id="messageAcceptation"
                                    placeholder="Bonjour, je suis disponible pour échanger..."
                                    rows="3"
                                  />
                                </div>
                                <div class="flex justify-end space-x-2">
                                  <Button variant="outline">Annuler</Button>
                                  <Button @click="repondreDemande(demande.id, DemandeCommStatut.Acceptee)">
                                    <Send class="w-4 h-4 mr-2" />
                                    Accepter
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Dialog>
                            <DialogTrigger as-child>
                              <Button size="sm" variant="destructive">
                                <X class="w-4 h-4 mr-1" />
                                Refuser
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Refuser la demande</DialogTitle>
                                <DialogDescription>
                                  Vous allez refuser la demande de communication de {{ demande.assureur.nom }}
                                </DialogDescription>
                              </DialogHeader>
                              <div class="space-y-4">
                                <div>
                                  <Label for="messageRefus">Motif du refus (optionnel)</Label>
                                  <Textarea
                                    id="messageRefus"
                                    placeholder="Je ne suis pas disponible actuellement..."
                                    rows="3"
                                  />
                                </div>
                                <div class="flex justify-end space-x-2">
                                  <Button variant="outline">Annuler</Button>
                                  <Button
                                    variant="destructive"
                                    @click="repondreDemande(demande.id, DemandeCommStatut.Refusee)"
                                  >
                                    <Send class="w-4 h-4 mr-2" />
                                    Refuser
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </template>
                      <div v-else>
                        <Badge
                          :variant="demande.statut === 'acceptee' ? 'default' : 'destructive'"
                          class="mb-2"
                        >
                          {{ demande.statut === "acceptee" ? "Acceptée" : "Refusée" }}
                        </Badge>
                        <p v-if="demande.dateReponse" class="text-xs text-gray-500">
                          Répondu le {{ new Date(demande.dateReponse).toLocaleDateString() }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>

    <!-- Dialog Chat -->
    <Dialog :open="showChat" @update:open="showChat = $event">
      <DialogContent class="max-w-2xl max-h-[80vh]">
        <template v-if="selectedMission">
          <DialogHeader>
            <DialogTitle class="flex items-center space-x-2">
              <MessageCircle class="w-5 h-5" />
              <span>Chat - Mission #{{ selectedMission.numeroMission }}</span>
            </DialogTitle>
            <DialogDescription>{{ selectedMission.mission.titre }}</DialogDescription>
          </DialogHeader>

          <div class="flex flex-col h-96">
            <!-- Messages -->
            <div class="flex-1 overflow-y-auto space-y-3 p-4 bg-gray-50 rounded">
              <div
                v-for="message in getMessagesForMission(selectedMission.id)"
                :key="message.id"
                class="flex"
                :class="message.expediteur === 'prestataire' ? 'justify-end' : 'justify-start'"
              >
                <div
                  class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg"
                  :class="message.expediteur === 'prestataire' ? 'bg-blue-600 text-white' : 'bg-white border shadow-sm'"
                >
                  <p class="text-sm">{{ message.contenu }}</p>
                  <p
                    class="text-xs mt-1"
                    :class="message.expediteur === 'prestataire' ? 'text-blue-100' : 'text-gray-500'"
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
              />
              <Button @click="envoyerMessage(selectedMission.id)" :disabled="!newMessage.trim()">
                <Send class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </template>
      </DialogContent>
    </Dialog>
  </div>
</template>
