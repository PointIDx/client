<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
// Dialog for "Voir fiche" functionality
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
  RefreshCw,
  Download,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  User,
  LogOut,
  Settings
} from 'lucide-vue-next'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
// MissionCreationDialog removed - now using separate page
import MissionsList from '@/components/MissionsList.vue'
import type { Prestataire } from '@/interfaces/prestataire'
import { useAssureurStore } from '@/stores/assureur'
import { useMissionStore } from '@/stores/mission'
import { useAuthStore } from '@/stores/auth'
import { useGraphQL } from '@/composables/useGraphQL'
import { DOWNLOAD_DOCUMENT_QUERY } from '@/graphql/queries/download-document'
import { useRouter } from 'vue-router'

const assureurStore = useAssureurStore()
const missionStore = useMissionStore()
const authStore = useAuthStore()
const { executeQuery } = useGraphQL()
const router = useRouter()

const searchTerm = ref("")
const selectedSecteur = ref("all")
const selectedRegion = ref("all")
const selectedDepartement = ref("all")
const selectedPrestataire = ref<Prestataire | null>(null)
const viewPrestataire = ref<Prestataire | null>(null)
const showPrestataireDetails = ref(false)
const showLogoutDialog = ref(false)

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(8)
// Removed communication request functionality - only chat remains

// Mission dialog refs removed - now using separate page

// Use data from the store

const missions = computed(() => missionStore.missions)
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
  // Load missions from the store
  const userType = authStore.user?.accountType as 'ASSUREUR' | 'PRESTATAIRE' | undefined
  if (userType === 'ASSUREUR') {
    await missionStore.fetchMissions('ASSUREUR');
  }
  await assureurStore.fetchNotifications();
});

const resetFilters = () => {
  searchTerm.value = ""
  selectedSecteur.value = "all"
  selectedRegion.value = "all"
  selectedDepartement.value = "all"
  currentPage.value = 1
  applyFilters();
}

// Pagination computed properties
const totalPages = computed(() => Math.ceil(assureurStore.prestataires.length / itemsPerPage.value))
const paginatedPrestataires = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return assureurStore.prestataires.slice(start, end)
})

// Pagination functions
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}





// handleCreateMission removed - now handled in separate page

const handleExport = async () => {
  try {
    await missionStore.exportMissions({})
    console.log('Export completed successfully')
  } catch (error) {
    console.error('Export failed:', error)
  }
}

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
  // Navigate to chat page with prestataire context (using userId for chat)
  router.push({
    path: '/chat',
    query: {
      prestataireId: prestataire.userId, // Use userId for chat room creation
      contactName: prestataire.nom || prestataire.raisonSociale,
      contactPerson: prestataire.nom,
      type: 'prestataire'
    }
  })
}

const navigateToChat = () => {
  router.push({
    path: '/chat',
  })
}

const handleLogout = () => {
  authStore.logout()
  showLogoutDialog.value = false
  router.push('/login')
}

const userInitials = computed(() => {
  if (!authStore.user?.profile) return 'U'
  
  // Check if it's an assureur profile with contactInfo
  if (authStore.user.profile.contactInfo?.prenom) {
    return authStore.user.profile.contactInfo.prenom.charAt(0).toUpperCase()
  }
  
  // Fallback to first letter of email if no profile info
  if (authStore.user.email) {
    return authStore.user.email.charAt(0).toUpperCase()
  }
  
  return 'U'
})

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

const viewPrestataireDetails = (prestataire: Prestataire) => {
  viewPrestataire.value = prestataire
  showPrestataireDetails.value = true
}

import placeholderImage from '@/assets/placeholder.svg'

// Watch for changes in filters to reset pagination
watch([searchTerm, selectedSecteur, selectedRegion, selectedDepartement], () => {
  currentPage.value = 1
})
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
          <div class="flex justify-center items-center space-x-4">
            <div class="flex items-center">
              <Button @click="() => router.push('/mission-creation')" class="bg-black text-white hover:bg-gray-800"
                data-testid="create-mission-button">
                <Plus class="w-4 h-4 mr-2" />
                Créer une mission
              </Button>
            </div>
            <Button data-testid="nav_chat_button" size="icon"
              class="bg-transparent shadow-none hover:shadow-none focus:shadow-none" @click="navigateToChat">
              <MessageCircle class="w-6 h-6 mr-2" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button size="icon"
                  class="bg-transparent  text-gray-700 relative shadow-none hover:shadow-none focus:shadow-none">
                  <Bell class="w-6 h-6 mr-2" />
                  <Badge v-if="notifications.length > 0"
                    class="absolute -top-2 -right-2 px-1 min-w-[1.2rem] h-5 bg-black text-white border-black">
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

    <!-- Success alerts for communication removed -->

    <!-- Communication request alerts removed - only chat functionality remains -->

    <div class="mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Tabs default-value="missions" class="space-y-6">
        <TabsList>
          <TabsTrigger value="missions" @click="missionStore.fetchMissions('ASSUREUR')"
            class="data-[state=active]:bg-black data-[state=active]:text-white">Mes Missions ({{ missions.length }})
          </TabsTrigger>
          <TabsTrigger value="recherche" class="data-[state=active]:bg-black data-[state=active]:text-white">Recherche
            Prestataires</TabsTrigger>
          <!-- Communication requests tab removed - only chat functionality remains -->
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
                    <Search class="absolute left-3 top-3 h-4 w-4 text-gmb-6ray-400" />
                    <Input id="search" data-testid="search-input" placeholder="Nom, entreprise, spécialité..."
                      v-model="searchTerm" class="pl-10" />
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
                  <Button class="flex-1 bg-black border-black text-white" @click="applyFilters"
                    data-testid="search-button">
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
          <Card>
            <CardHeader>
              <div class="flex justify-between items-center">
                <CardTitle>{{ assureurStore.prestataires.length }} prestataire(s) trouvé(s)</CardTitle>
                <div class="text-sm text-gray-600" v-if="totalPages > 1">
                  Page {{ currentPage }} sur {{ totalPages }} ({{ itemsPerPage }} par page)
                </div>
              </div>
            </CardHeader>
            <CardContent class="space-y-4">
              <div v-if="assureurStore.prestataires.length === 0" class="text-center py-8 text-gray-500">
                <User class="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Aucun prestataire trouvé</p>
                <p class="text-sm">Modifiez les filtres pour élargir votre recherche</p>
              </div>
              
              <div v-else>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Prestataire</TableHead>
                      <TableHead>Localisation</TableHead>
                      <TableHead>Spécialités</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow v-for="prestataire in paginatedPrestataires" :key="prestataire.id" class="hover:bg-gray-50" :data-testid="`prestataire-row-${prestataire.id}`">
                      <TableCell>
                        <div class="flex items-center space-x-3">
                          <Avatar class="w-10 h-10">
                            <AvatarImage :src="prestataire.avatar || placeholderImage" />
                            <AvatarFallback>
                              {{ prestataire.contactPerson.split(' ').map(n => n[0]).join('') }}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p class="font-semibold">{{ prestataire.companyName }}</p>
                            <p class="text-sm text-gray-600">{{ prestataire.contactPerson }}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div class="flex items-center space-x-1">
                          <MapPin class="w-4 h-4 text-gray-500" />
                          <span class="text-sm">{{ prestataire.address.city }}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div class="flex flex-wrap gap-1">
                          <Badge v-for="specialty in prestataire.specialties.slice(0, 2)" :key="specialty" variant="secondary" class="text-xs">
                            {{ specialty }}
                          </Badge>
                          <Badge v-if="prestataire.specialties.length > 2" variant="outline" class="text-xs">
                            +{{ prestataire.specialties.length - 2 }}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div class="flex items-center space-x-1" v-if="prestataire.rating">
                          <Star class="w-4 h-4 text-yellow-500 fill-current" />
                          <span class="text-sm font-medium">{{ prestataire.rating }}</span>
                        </div>
                        <span v-else class="text-sm text-gray-400">-</span>
                      </TableCell>
                      <TableCell>
                        <div class="flex items-center space-x-1">
                          <div :class="{
                            'w-2 h-2 rounded-full': true,
                            'bg-green-500': prestataire.availabilityStatus === 'AVAILABLE',
                            'bg-yellow-500': prestataire.availabilityStatus === 'BUSY',
                            'bg-red-500': prestataire.availabilityStatus === 'UNAVAILABLE',
                            'bg-gray-500': !prestataire.availabilityStatus
                          }"></div>
                          <span class="text-xs">
                            {{ prestataire.availabilityStatus === 'AVAILABLE' ? 'Disponible' :
                              prestataire.availabilityStatus === 'BUSY' ? 'Occupé' :
                              prestataire.availabilityStatus === 'UNAVAILABLE' ? 'Indisponible' : 'Inconnu' }}
                          </span>
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
                            <DropdownMenuItem @click="viewPrestataireDetails(prestataire)">
                              <Eye class="w-4 h-4 mr-2" />
                              Voir fiche
                            </DropdownMenuItem>
                            <DropdownMenuItem @click="handleContactClick(prestataire)">
                              <MessageCircle class="w-4 h-4 mr-2" />
                              Contacter
                            </DropdownMenuItem>
                            <DropdownMenuItem @click="handleMissionClick(prestataire)" data-testid="mission-dropdown-item">
                              <Plus class="w-4 h-4 mr-2" />
                              Créer mission
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                
                <!-- Pagination -->
                <div class="flex items-center justify-between pt-4" v-if="totalPages > 1">
                  <div class="text-sm text-gray-600">
                    Affichage {{ (currentPage - 1) * itemsPerPage + 1 }} - 
                    {{ Math.min(currentPage * itemsPerPage, assureurStore.prestataires.length) }} 
                    sur {{ assureurStore.prestataires.length }} prestataires
                  </div>
                  <div class="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      @click="previousPage" 
                      :disabled="currentPage === 1"
                    >
                      <ChevronLeft class="w-4 h-4" />
                      Précédent
                    </Button>
                    
                    <div class="flex items-center space-x-1">
                      <Button 
                        v-for="page in Math.min(totalPages, 5)" 
                        :key="page"
                        variant="outline" 
                        size="sm"
                        :class="{ 'bg-black text-white': currentPage === page }"
                        @click="goToPage(page)"
                      >
                        {{ page }}
                      </Button>
                      <span v-if="totalPages > 5" class="text-sm text-gray-500">...</span>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      @click="nextPage" 
                      :disabled="currentPage === totalPages"
                    >
                      Suivant
                      <ChevronRight class="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <!-- Onglet Missions -->
        <TabsContent value="missions">
          <!-- Working missions interface -->
          <Card class="mt-6">
            <CardHeader>
              <CardTitle>Gestion des Missions</CardTitle>
            </CardHeader>
            <CardContent>
              <!-- Filters and Export section -->
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <div class="text-sm text-gray-600">
                    {{ missions.length }} mission(s) trouvée(s)
                  </div>
                  <div class="flex space-x-2">
                    <Button variant="outline" @click="() => console.log('Reset filters')">
                      <RefreshCw class="w-4 h-4 mr-2" />
                      Réinitialiser
                    </Button>
                    <Button variant="outline" @click="() => handleExport()">
                      <Download class="w-4 h-4 mr-2" />
                      Exporter
                    </Button>
                  </div>
                </div>

                <!-- Missions table or empty state -->
                <div v-if="missions.length === 0" class="text-center py-8">
                  <Briefcase class="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p class="text-gray-500">Aucune mission trouvée</p>
                </div>

                <MissionsList :missions="missions" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- Communications tab removed - only chat functionality remains -->
      </Tabs>
    </div>
  </div>

  <!-- Prestataire Details Dialog -->
  <Dialog :open="showPrestataireDetails" @update:open="showPrestataireDetails = $event">
    <DialogContent class="max-w-2xl max-h-[80vh] overflow-y-auto bg-white" v-if="viewPrestataire">
      <DialogHeader>
        <DialogTitle class="flex items-center space-x-3">
          <Avatar class="w-12 h-12">
            <AvatarImage :src="viewPrestataire.avatar || placeholderImage" />
            <AvatarFallback>
              {{ viewPrestataire.contactPerson.split(' ').map(n => n[0]).join('') }}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 class="text-xl font-bold">{{ viewPrestataire.companyName }}</h3>
            <p class="text-gray-600">{{ viewPrestataire.contactPerson }}</p>
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
              <p>{{ viewPrestataire.address.city }}</p>
            </div>
          </div>
        </div>
        <!-- Contact -->
        <div>
          <h4 class="font-semibold mb-3">Contact</h4>
          <div class="space-y-2 text-sm">
            <div class="flex items-center space-x-2">
              <Phone class="w-4 h-4 text-gray-500" />
              <span>{{ viewPrestataire.phone }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <Mail class="w-4 h-4 text-gray-500" />
              <span>{{ viewPrestataire.email }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <Building class="w-4 h-4 text-gray-500" />
              <span>{{ viewPrestataire.address.street }}, {{ viewPrestataire.address.postalCode }} {{ viewPrestataire.address.city }}</span>
            </div>
          </div>
        </div>
        <!-- Spécialités -->
        <div>
          <h4 class="font-semibold mb-3">Spécialités</h4>
          <div class="flex flex-wrap gap-1 mt-1">
            <Badge v-for="specialite in viewPrestataire.specialties" :key="specialite" variant="secondary">
              {{ specialite }}
            </Badge>
          </div>
        </div>
        <!-- Évaluations -->
        <div>
          <h4 class="font-semibold mb-3">Évaluations</h4>
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2" v-if="viewPrestataire.rating">
              <Star class="w-5 h-5 text-yellow-500 fill-current" />
              <span class="text-lg font-semibold">{{ viewPrestataire.rating }}</span>
              <span class="text-gray-500">/ 5</span>
            </div>
            <span v-else class="text-gray-500">Aucune évaluation</span>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>

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