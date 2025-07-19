<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Search,
  Filter,
  MapPin,
  Star,
  Eye,
  MessageCircle,
  Phone,
  Mail,
  Building,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Send,
  Bell,
  Plus,
} from 'lucide-vue-next'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
// MissionCreationDialog removed - now using separate page
import MissionsList from '@/components/MissionsList.vue'
import type { Prestataire } from '@/interfaces/prestataire'
import type { CommunicationRequestResponse } from '@/graphql/queries/get-communication-requests'
import type { IMission } from '@/interfaces/IMission'
import { DemandeCommStatut } from '@/enums/demande-comm-statut'
import { useAssureurStore } from '@/stores/assureur'
import { useGraphQL } from '@/composables/useGraphQL'
import { DOWNLOAD_DOCUMENT_QUERY } from '@/graphql/queries/download-document'
import { useRouter } from 'vue-router'

const assureurStore = useAssureurStore()
const { executeQuery } = useGraphQL()
const router = useRouter()

const searchTerm = ref("")
const selectedSecteur = ref("all")
const selectedRegion = ref("all")
const selectedDepartement = ref("all")
const selectedPrestataire = ref<Prestataire | null>(null)
const showCommDialog = ref(false)
const messageComm = ref("")
const showSuccess = ref(false)

// Mission dialog refs removed - now using separate page

// Use data from the store
const demandes = computed(() => assureurStore.communicationRequests)
const missions = computed(() => assureurStore.missions)
const notifications = computed(() => assureurStore.notifications.filter(n => !n.isRead))

const secteurs = ["Maçonnerie", "Plomberie", "Électricité", "Chauffage", "Couverture", "Menuiserie", "Peinture"]
const regions = [
  "Auvergne-Rhône-Alpes",
  "Bourgogne-Franche-Comté",
  "Bretagne",
  "Centre-Val de Loire",
  "Corse",
  "Grand Est",
  "Hauts-de-France",
  "Île-de-France",
  "Normandie",
  "Nouvelle-Aquitaine",
  "Occitanie",
  "Pays de la Loire",
  "Provence-Alpes-Côte d'Azur",
]

const departements = ["01 - Ain", "13 - Bouches-du-Rhône", "31 - Haute-Garonne", "69 - Rhône", "75 - Paris"]

const applyFilters = () => {
  // Determine the location filter: prioritize departement over region
  let locationFilter = undefined;
  if (selectedDepartement.value !== "all") {
    locationFilter = selectedDepartement.value;
  } else if (selectedRegion.value !== "all") {
    locationFilter = selectedRegion.value;
  }

  assureurStore.searchPrestataires({
    name: searchTerm.value === "" ? undefined : searchTerm.value,
    specialty: selectedSecteur.value === "all" ? undefined : selectedSecteur.value,
    location: locationFilter,
  });
}

onMounted(async () => {
  applyFilters();
  // Load communication requests and missions from the store
  await assureurStore.fetchCommunicationRequests();
  await assureurStore.fetchMissions();
  await assureurStore.fetchNotifications();
});

const resetFilters = () => {
  searchTerm.value = ""
  selectedSecteur.value = "all"
  selectedRegion.value = "all"
  selectedDepartement.value = "all"
  applyFilters();
}

const envoyerDemandeComm = async () => {
  if (!selectedPrestataire.value || !messageComm.value.trim()) return;

  try {
    await assureurStore.sendCommRequest({
      prestataireId: selectedPrestataire.value.id,
      message: messageComm.value,
    });

    messageComm.value = '';
    showCommDialog.value = false;
    showSuccess.value = true;
    setTimeout(() => (showSuccess.value = false), 3000);
  } catch (error) {
    console.error("Erreur lors de l'envoi de la demande:", error);
  }
};

const getStatutBadge = (statut: CommunicationRequestResponse["statut"]) => {
  switch (statut) {
    case "en_attente":
      return {
        text: 'En attente',
        class: 'bg-gray-200 text-gray-800 border-gray-400',
        icon: Clock
      }
    case "acceptee":
      return {
        text: 'Acceptée',
        class: 'bg-black text-white border-black',
        icon: CheckCircle
      }
    case "refusee":
      return {
        text: 'Refusée',
        class: 'bg-gray-700 text-white border-gray-700',
        icon: XCircle
      }
    default:
      return {
        text: 'Inconnu',
        class: 'bg-gray-100 text-gray-800 border-gray-300',
        icon: Clock
      }
  }
}

// handleCreateMission removed - now handled in separate page

const telechargerDocument = async (documentName: string) => {
  try {
    const result = await executeQuery<{ downloadDocument: { url: string, filename: string, contentType: string } }>(
      DOWNLOAD_DOCUMENT_QUERY,
      { documentName },
      {
        context: 'Download Document',
        showErrorToast: true
      }
    )
    
    if (result?.downloadDocument?.url) {
      const link = document.createElement('a')
      link.href = result.downloadDocument.url
      link.download = result.downloadDocument.filename || documentName
      link.click()
      
      console.log(`Téléchargement de ${documentName} initié`)
    } else {
      throw new Error('URL de téléchargement non disponible')
    }
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error)
  }
}

const handleContactClick = (prestataire: Prestataire) => {
  // Navigate to chat page with prestataire context
  router.push({
    path: '/chat',
    query: {
      prestataireId: prestataire.id,
      contactName: prestataire.nom || prestataire.raisonSociale,
      contactPerson: prestataire.nom,
      type: 'prestataire'
    }
  })
};

const handleMissionClick = (prestataire: Prestataire) => {
  // Navigate to mission creation page with prestataire data in query params
  router.push({
    name: 'mission-creation',
    query: {
      prestataireId: prestataire.id,
      prestataireNom: prestataire.nom,
      prestataireRaisonSociale: prestataire.raisonSociale,
      prestataireSecteurs: prestataire.secteurs?.join(',') || '',
      prestataireVille: prestataire.ville,
      prestataireTelephone: prestataire.telephone,
      prestataireEmail: prestataire.email
    }
  });
};

import placeholderImage from '@/assets/placeholder.svg'
</script>

<template>
  <div class="min-h-screen bg-white text-black font-mono">
    <!-- Header -->
    <header class="bg-white border-b border-gray-300">
      <div class="mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div>
            <h1 class="text-2xl font-bold text-black">Dashboard Assureur</h1>
            <p class="text-gray-700">Recherchez et contactez des prestataires qualifiés</p>
          </div>
          <div class="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="outline" size="sm" class="bg-transparent border-gray-400 text-gray-700 hover:bg-gray-100 hover:border-gray-500 relative">
                  <Bell class="w-4 h-4 mr-2" />
                  Notifications
                  <Badge v-if="notifications.length > 0" class="absolute -top-2 -right-2 px-1 min-w-[1.2rem] h-5 bg-black text-white border-black">
                    {{ notifications.length }}
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-80">
                <DropdownMenuItem v-if="notifications.length === 0" class="text-gray-500 text-center">
                  Aucune notification
                </DropdownMenuItem>
                <DropdownMenuItem v-for="notif in notifications" :key="notif.id" class="flex-col items-start p-3">
                  <p class="text-sm font-medium">{{ notif.message }}</p>
                  <p class="text-xs text-gray-500">{{ new Date(notif.createdAt).toLocaleString() }}</p>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Avatar>
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>

    <!-- Success Alert -->
    <div v-if="showSuccess" class="mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <Alert class="bg-gray-100 border-gray-300">
        <CheckCircle class="h-4 w-4 text-black" />
        <AlertDescription class="text-black">
          Demande de communication envoyée avec succès ! Le prestataire sera notifié par email et sur son portail.
        </AlertDescription>
      </Alert>
    </div>

    <!-- Mission success alert removed - now handled in separate page -->

    <div class="mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Tabs default-value="recherche" class="space-y-6">
        <TabsList>
          <TabsTrigger value="recherche" class="data-[state=active]:bg-black data-[state=active]:text-white">Recherche Prestataires</TabsTrigger>
          <TabsTrigger value="demandes" @click="assureurStore.fetchCommunicationRequests()" class="data-[state=active]:bg-black data-[state=active]:text-white">Mes Demandes ({{ demandes.length }})</TabsTrigger>
          <TabsTrigger value="missions" @click="assureurStore.fetchMissions()" class="data-[state=active]:bg-black data-[state=active]:text-white">Mes Missions ({{ missions.length }})</TabsTrigger>
        </TabsList>

        <!-- Onglet Recherche -->
        <TabsContent value="recherche" class="space-y-6">
          <!-- Filtres de recherche -->
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center">
                <Filter class="w-5 h-5 mr-2" />
                Filtres de recherche
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <Label for="search">Recherche</Label>
                  <div class="relative">
                    <Search class="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      data-testid="search-input"
                      placeholder="Nom, entreprise, spécialité..."
                      v-model="searchTerm"
                      class="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label>Secteur</Label>
                  <Select v-model="selectedSecteur">
                    <SelectTrigger data-testid="secteur-select-trigger">
                      <SelectValue placeholder="Tous secteurs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous secteurs</SelectItem>
                      <SelectItem v-for="secteur in secteurs" :key="secteur" :value="secteur">
                        {{ secteur }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Région</Label>
                  <Select v-model="selectedRegion">
                    <SelectTrigger data-testid="region-select-trigger">
                      <SelectValue placeholder="Toutes régions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes régions</SelectItem>
                      <SelectItem v-for="region in regions" :key="region" :value="region">
                        {{ region }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Département</Label>
                  <Select v-model="selectedDepartement">
                    <SelectTrigger data-testid="departement-select-trigger">
                      <SelectValue placeholder="Tous départements" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous départements</SelectItem>
                      <SelectItem v-for="dept in departements" :key="dept" :value="dept">
                        {{ dept }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div class="flex items-end space-x-2">
                  <Button @click="applyFilters" class="flex-1" data-testid="search-button">
                    Rechercher
                  </Button>
                  <Button variant="outline" @click="resetFilters" data-testid="reset-filters-button">
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Résultats -->
          <div>
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-semibold">{{ assureurStore.prestataires.length }} prestataire(s) trouvé(s)</h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card v-for="prestataire in assureurStore.prestataires" :key="prestataire.id" class="hover:shadow-lg transition-shadow">
                <CardHeader class="pb-3">
                  <div class="flex items-start justify-between">
                    <div class="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage :src="prestataire.avatar || placeholderImage" />
                      <AvatarFallback>
                        {{ prestataire.contactPerson.split(' ').map((n) => n[0]).join('') }}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle class="text-lg">{{ prestataire.companyName }}</CardTitle>
                      <CardDescription class="text-sm">{{ prestataire.contactPerson }}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent class="space-y-3">
                  <div class="flex items-center space-x-2">
                    <MapPin class="w-4 h-4 text-gray-500" />
                    <span class="text-sm text-gray-600">{{ prestataire.address.city }}</span>
                  </div>

                  <div class="flex items-center space-x-2">
                    <Star class="w-4 h-4 text-yellow-500 fill-current" />
                    <span class="text-sm font-medium">{{ prestataire.rating }}</span>
                  </div>

                  <div class="flex flex-wrap gap-1">
                    <Badge v-for="specialty in prestataire.specialties.slice(0, 2)" :key="specialty" variant="secondary" class="text-xs">
                      {{ specialty }}
                    </Badge>
                    <Badge v-if="prestataire.specialties.length > 2" variant="outline" class="text-xs">
                      +{{ prestataire.specialties.length - 2 }}
                    </Badge>
                  </div>

                  <div class="flex space-x-2 pt-2">
                    <Dialog>
                      <DialogTrigger as-child>
                        <Button variant="outline" size="sm" class="flex-1 bg-white border-gray-400 text-gray-700 hover:bg-gray-100 hover:border-gray-500">
                          <Eye class="w-4 h-4 mr-1" />
                          Voir fiche
                        </Button>
                      </DialogTrigger>
                      <DialogContent class="max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
                        <DialogHeader>
                          <DialogTitle class="flex items-center space-x-3">
                            <Avatar class="w-12 h-12">
                              <AvatarImage :src="prestataire.avatar || placeholderImage" />
                              <AvatarFallback>
                                {{ prestataire.contactPerson.split(' ').map((n) => n[0]).join('') }}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 class="text-xl font-bold">{{ prestataire.companyName }}</h3>
                              <p class="text-gray-600">{{ prestataire.contactPerson }}</p>
                            </div>
                          </DialogTitle>
                        </DialogHeader>

                        <div class="space-y-6">
                          <!-- Informations générales -->
                          <div>
                            <h4 class="font-semibold mb-3">Informations générales</h4>
                            <div class="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span class="text-gray-500">Localisation:</span>
                                <p>
                                  {{ prestataire.address.city }}
                                </p>
                              </div>
                            </div>
                          </div>

                          <!-- Contact -->
                          <div>
                            <h4 class="font-semibold mb-3">Contact</h4>
                            <div class="space-y-2 text-sm">
                              <div class="flex items-center space-x-2">
                                <Phone class="w-4 h-4 text-gray-500" />
                                <span>{{ prestataire.phone }}</span>
                              </div>
                              <div class="flex items-center space-x-2">
                                <Mail class="w-4 h-4 text-gray-500" />
                                <span>{{ prestataire.email }}</span>
                              </div>
                              <div class="flex items-center space-x-2">
                                <Building class="w-4 h-4 text-gray-500" />
                                <span>{{ prestataire.address.street }}, {{ prestataire.address.postalCode }} {{ prestataire.address.city }}</span>
                              </div>
                            </div>
                          </div>

                          <!-- Spécialités -->
                          <div>
                            <h4 class="font-semibold mb-3">Spécialités</h4>
                            <div class="space-y-2">
                              <div>
                                <div class="flex flex-wrap gap-1 mt-1">
                                  <Badge v-for="specialite in prestataire.specialties" :key="specialite" variant="secondary">
                                    {{ specialite }}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>

                          

                          <!-- Évaluations -->
                          <div>
                            <h4 class="font-semibold mb-3">Évaluations</h4>
                            <div class="flex items-center space-x-4">
                              <div class="flex items-center space-x-2">
                                <Star class="w-5 h-5 text-yellow-500 fill-current" />
                                <span class="text-lg font-semibold">{{ prestataire.rating }}</span>
                                <span class="text-gray-500">/ 5</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      size="sm"
                      class="flex-1"
                      @click="handleContactClick(prestataire)"
                    >
                      <MessageCircle class="w-4 h-4 mr-1" />
                      Contacter
                    </Button>

                    <Button
                      size="sm"
                      variant="default"
                      @click="handleMissionClick(prestataire)"
                    >
                      <Plus class="w-4 h-4 mr-1" />
                      Mission
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <!-- Onglet Demandes -->
        <TabsContent value="demandes">
          <Card>
            <CardHeader>
              <CardTitle>Mes demandes de communication</CardTitle>
              <CardDescription>Suivez l'état de vos demandes de contact avec les prestataires</CardDescription>
            </CardHeader>
            <CardContent>
              <div v-if="demandes.length === 0" class="text-center py-8 text-gray-500">
                <MessageCircle class="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune demande de communication envoyée</p>
                <p class="text-sm">Recherchez des prestataires et contactez-les pour commencer</p>
              </div>
              <div v-else class="space-y-4">
                <div v-for="demande in demandes" :key="demande.id" class="border rounded-lg p-4">
                  <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {{ demande.prestataire.nom.split(' ').map((n) => n[0]).join('') }}
                        </AvatarFallback>
                      </Avatar>
                      <div class="flex-1">
                        <h4 class="font-semibold">{{ demande.prestataire.nom }}</h4>
                        <p class="text-sm text-gray-600">{{ demande.prestataire.raisonSociale }}</p>
                        <p class="text-sm text-gray-500 mt-1">
                          Envoyé le {{ new Date(demande.dateEnvoi).toLocaleDateString() }} à
                          {{ new Date(demande.dateEnvoi).toLocaleTimeString() }}
                        </p>
                        <div class="mt-2">
                          <p class="text-sm">
                            <strong>Message:</strong>
                          </p>
                          <p class="text-sm text-gray-700 bg-gray-50 p-2 rounded mt-1">{{ demande.message }}</p>
                        </div>
                        <div v-if="demande.reponseMessage" class="mt-2">
                          <p class="text-sm">
                            <strong>Réponse:</strong>
                          </p>
                          <p class="text-sm text-gray-700 bg-blue-50 p-2 rounded mt-1">{{ demande.reponseMessage }}</p>
                        </div>
                      </div>
                    </div>
                    <div class="text-right">
                      <Badge :class="getStatutBadge(demande.statut).class">
                        <component :is="getStatutBadge(demande.statut).icon" class="w-3 h-3 mr-1" />
                        {{ getStatutBadge(demande.statut).text }}
                      </Badge>
                      <p v-if="demande.dateReponse" class="text-xs text-gray-500 mt-1">
                        Répondu le {{ new Date(demande.dateReponse).toLocaleDateString() }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- Onglet Missions -->
        <TabsContent value="missions">
          <MissionsList :missions="missions" />
        </TabsContent>
      </Tabs>
    </div>

    <!-- Dialog Demande de communication -->
    <Dialog :open="showCommDialog" @update:open="showCommDialog = $event">
      <DialogContent class="bg-white">
        <DialogHeader>
          <DialogTitle>Demande de communication</DialogTitle>
          <DialogDescription>Envoyez une demande de contact à {{ selectedPrestataire?.companyName }}</DialogDescription>
        </DialogHeader>

        <div v-if="selectedPrestataire" class="space-y-4">
          <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Avatar>
              <AvatarFallback>
                {{ selectedPrestataire.contactPerson.split(' ').map((n) => n[0]).join('') }}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 class="font-semibold">{{ selectedPrestataire.companyName }}</h4>
              <p class="text-sm text-gray-600">{{ selectedPrestataire.contactPerson }}</p>
              <p class="text-sm text-gray-500">{{ selectedPrestataire.address.city }}</p>
            </div>
          </div>

          <div>
            <Label for="message">Message d'accompagnement *</Label>
            <Textarea
              id="message"
              placeholder="Bonjour, je souhaiterais échanger avec vous concernant..."
              v-model="messageComm"
              class="mt-1"
              rows="4"
            />
          </div>

          <div class="bg-blue-50 p-3 rounded-lg">
            <p class="text-sm text-blue-800">
              <strong>Le prestataire recevra :</strong>
              <br />• Une notification sur son portail
              <br />• Un email avec votre message
              <br />• Vos coordonnées pour vous recontacter
            </p>
          </div>

          <div class="flex justify-end space-x-2">
            <Button variant="outline" @click="showCommDialog = false">
              Annuler
            </Button>
            <Button @click="envoyerDemandeComm" :disabled="!messageComm.trim()">
              <Send class="w-4 h-4 mr-2" />
              Envoyer la demande
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Dialog Création de mission removed - now navigating to separate page -->
  </div>
</template>