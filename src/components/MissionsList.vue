<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import {
  Search,
  Filter,
  Calendar,
  Eye,
  MoreHorizontal,
  Download,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MapPin,
  Phone,
  Mail,
  Euro,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Briefcase,
  Plus,
} from 'lucide-vue-next'
import type { MissionDetails } from '@/interfaces/MissionDetails'
import type { SubMission } from '@/interfaces/sub-mission'
import { useMissionStore } from '@/stores/mission'
import { SPECIALIZATIONS, UrgenceLevel } from '@/interfaces/sub-mission'

const router = useRouter()

const missionStore = useMissionStore()

// Props
interface Props {
  missions?: MissionDetails[]
}

const props = withDefaults(defineProps<Props>(), {
  missions: () => []
})


type SortField = "dateDeCreation" | "prestataire" | "client" | "status" | "urgence" | "budget"
type SortDirection = "asc" | "desc"

const missions = computed(() => props.missions)
const searchTerm = ref("")
const selectedStatut = ref("all")
const selectedPrestataire = ref("all")
const selectedUrgence = ref("all")
const selectedType = ref("all")
const dateDebut = ref("")
const dateFin = ref("")
const sortField = ref<SortField>("dateDeCreation")
const sortDirection = ref<SortDirection>("desc")
const selectedMission = ref<MissionDetails | null>(null)
const subMissions = ref<Record<string, SubMission[]>>({}) // missionId -> SubMission[]
const expandedMissions = ref<Set<string>>(new Set())
const showSubMissionDialog = ref(false)
const newSubMission = reactive({
  missionId: '',
  specialization: '',
  title: '',
  description: '',
  urgence: UrgenceLevel.MOYENNE,
  estimatedCost: undefined as number | undefined,
  materialsNeeded: '',
  specialRequirements: '',
  estimatedDurationHours: undefined as number | undefined
})

// Options pour les filtres
const statutOptions = [
  { value: "all", label: "Tous les statuts" },
  { value: "EN_ATTENTE", label: "En attente" },
  { value: "ASSIGNEE", label: "Assignée" },
  { value: "EN_COURS", label: "En cours" },
  { value: "TERMINEE", label: "Terminée" },
  { value: "ANNULEE", label: "Annulée" },
  { value: "SUSPENDUE", label: "Suspendue" },
]

const urgenceOptions = [
  { value: "all", label: "Toutes urgences" },
  { value: "FAIBLE", label: "Faible" },
  { value: "MOYENNE", label: "Moyenne" },
  { value: "HAUTE", label: "Haute" },
  { value: "CRITIQUE", label: "Critique" },
]

const typeOptions = [
  { value: "all", label: "Tous types" },
  { value: "Dégât des eaux", label: "Dégât des eaux" },
  { value: "Incendie", label: "Incendie" },
  { value: "Fissures", label: "Fissures" },
  { value: "Tempête", label: "Tempête" },
  { value: "Autre", label: "Autre" },
]

// Prestataires uniques pour le filtre
const prestataires = computed(() => {
  const uniquePrestataires = missions.value.reduce(
    (acc: Array<{ id: string; companyName: string; contactPerson: string }>, mission) => {
      if (mission.prestataire && !acc.find((p) => p.id === mission.prestataire!.id)) {
        acc.push(mission.prestataire)
      }
      return acc
    },
    [],
  )
  return uniquePrestataires
})

// Filtrage et tri des missions
const filteredAndSortedMissions = computed(() => {
  let filtered = [...missions.value]

  // Recherche textuelle
  if (searchTerm.value) {
    filtered = filtered.filter(
      (mission) =>
        mission.reference.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        (mission.prestataire?.contactPerson || '').toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        (mission.prestataire?.companyName || '').toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        mission.societaire?.lastName?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        mission.societaire?.firstName?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        mission.description.toLowerCase().includes(searchTerm.value.toLowerCase()),
    )
  }

  // Filtre par statut
  if (selectedStatut.value !== "all") {
    filtered = filtered.filter((mission) => mission.status === selectedStatut.value)
  }

  // Filtre par prestataire
  if (selectedPrestataire.value !== "all") {
    filtered = filtered.filter((mission) => mission.prestataire?.id === selectedPrestataire.value)
  }

  // Filtre par urgence
  if (selectedUrgence.value !== "all") {
    filtered = filtered.filter((mission) => mission.urgence === selectedUrgence.value)
  }

  // Filtre par date
  if (dateDebut.value) {
    filtered = filtered.filter((mission) => new Date(mission.dateDeCreation) >= new Date(dateDebut.value))
  }
  if (dateFin.value) {
    filtered = filtered.filter((mission) => new Date(mission.dateDeCreation) <= new Date(dateFin.value))
  }

  // Tri
  filtered.sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (sortField.value) {
      case "dateDeCreation":
        aValue = new Date(a.dateDeCreation)
        bValue = new Date(b.dateDeCreation)
        break
      case "prestataire":
        aValue = a.prestataire?.contactPerson || ''
        bValue = b.prestataire?.contactPerson || ''
        break
      case "client":
        aValue = `${a.societaire?.lastName} ${a.societaire?.firstName}`
        bValue = `${b.societaire?.lastName} ${b.societaire?.firstName}`
        break
      case "status":
        aValue = a.status
        bValue = b.status
        break
      case "urgence":
        const urgenceOrder: { [key: string]: number } = { FAIBLE: 1, MOYENNE: 2, HAUTE: 3, CRITIQUE: 4 }
        aValue = urgenceOrder[a.urgence]
        bValue = urgenceOrder[b.urgence]
        break
      case "budget":
        aValue = a.estimatedCost || 0
        bValue = b.estimatedCost || 0
        break
      default:
        aValue = a.dateDeCreation
        bValue = b.dateDeCreation
    }

    if (aValue < bValue) return sortDirection.value === "asc" ? -1 : 1
    if (aValue > bValue) return sortDirection.value === "asc" ? 1 : -1
    return 0
  })

  return filtered
})

const handleSort = (field: SortField) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc"
  } else {
    sortField.value = field
    sortDirection.value = "asc"
  }
}

const resetFilters = () => {
  searchTerm.value = ""
  selectedStatut.value = "all"
  selectedPrestataire.value = "all"
  selectedUrgence.value = "all"
  selectedType.value = "all"
  dateDebut.value = ""
  dateFin.value = ""
}

const getStatutBadge = (statut: string) => {
  switch (statut) {
    case "EN_ATTENTE":
      return `
        <Badge variant="outline">
          <Clock class="w-3 h-3 mr-1" />
          En attente
        </Badge>
      `
    case "ASSIGNEE":
      return `
        <Badge variant="default">
          <CheckCircle class="w-3 h-3 mr-1" />
          Assignée
        </Badge>
      `
    case "EN_COURS":
      return `
        <Badge class="bg-blue-100 text-blue-800">
          <Clock class="w-3 h-3 mr-1" />
          En cours
        </Badge>
      `
    case "TERMINEE":
      return `
        <Badge class="bg-green-100 text-green-800">
          <CheckCircle class="w-3 h-3 mr-1" />
          Terminée
        </Badge>
      `
    case "ANNULEE":
      return `
        <Badge variant="destructive">
          <XCircle class="w-3 h-3 mr-1" />
          Annulée
        </Badge>
      `
    case "SUSPENDUE":
      return `
        <Badge variant="secondary">
          <AlertTriangle class="w-3 h-3 mr-1" />
          Suspendue
        </Badge>
      `
    default:
      return ``
  }
}

const getUrgenceBadge = (urgence: string) => {
  switch (urgence) {
    case "FAIBLE":
      return `<Badge class="bg-green-100 text-green-800">Faible</Badge>`
    case "MOYENNE":
      return `<Badge class="bg-yellow-100 text-yellow-800">Moyenne</Badge>`
    case "HAUTE":
      return `<Badge class="bg-orange-100 text-orange-800">Haute</Badge>`
    case "CRITIQUE":
      return `<Badge class="bg-red-100 text-red-800">Critique</Badge>`
    default:
      return ``
  }
}

const getSortIcon = (field: SortField) => {
  if (sortField.value !== field) return ArrowUpDown
  return sortDirection.value === "asc" ? ArrowUp : ArrowDown
}

const handleExport = async () => {
  try {
    const filters = {
      statut: selectedStatut.value !== 'all' ? selectedStatut.value : undefined,
      urgence: selectedUrgence.value !== 'all' ? selectedUrgence.value : undefined,
      prestataireId: selectedPrestataire.value !== 'all' ? selectedPrestataire.value : undefined,
      type: selectedType.value !== 'all' ? selectedType.value : undefined,
      dateDebut: dateDebut.value || undefined,
      dateFin: dateFin.value || undefined,
      searchTerm: searchTerm.value || undefined
    }
    
    await missionStore.exportMissions(filters)
  } catch (error) {
    console.error('Erreur lors de l\'export:', error)
  }
}

const handleExportMissionDetails = async (missionId: string) => {
  try {
    await missionStore.exportMissionDetails(missionId)
  } catch (error) {
    console.error('Erreur lors de l\'export de la mission:', error)
  }
}

const viewMissionDetails = (missionId: string) => {
  router.push(`/mission/${missionId}`)
}

// Sub-mission management methods
const loadSubMissions = async (missionId: string) => {
  try {
    const subs = await missionStore.fetchSubMissions(missionId)
    subMissions.value[missionId] = subs
  } catch (error) {
    console.error('Error loading sub-missions:', error)
  }
}

const toggleMissionExpansion = async (missionId: string) => {
  if (expandedMissions.value.has(missionId)) {
    expandedMissions.value.delete(missionId)
  } else {
    expandedMissions.value.add(missionId)
    // Load sub-missions when expanding
    if (!subMissions.value[missionId]) {
      await loadSubMissions(missionId)
    }
  }
}

const openSubMissionDialog = (missionId: string) => {
  newSubMission.missionId = missionId
  showSubMissionDialog.value = true
}

const createSubMission = async () => {
  try {
    await missionStore.createSubMission({
      missionId: newSubMission.missionId,
      title: newSubMission.title,
      description: newSubMission.description,
      specialization: newSubMission.specialization,
      urgence: newSubMission.urgence,
      estimatedCost: newSubMission.estimatedCost,
      materialsNeeded: newSubMission.materialsNeeded,
      specialRequirements: newSubMission.specialRequirements,
      estimatedDurationHours: newSubMission.estimatedDurationHours
    })
    
    // Reload sub-missions for this mission
    await loadSubMissions(newSubMission.missionId)
    
    // Reset form
    Object.assign(newSubMission, {
      missionId: '',
      specialization: '',
      title: '',
      description: '',
      urgence: UrgenceLevel.MOYENNE,
      estimatedCost: undefined,
      materialsNeeded: '',
      specialRequirements: '',
      estimatedDurationHours: undefined
    })
    
    showSubMissionDialog.value = false
  } catch (error) {
    console.error('Error creating sub-mission:', error)
  }
}

const getSubMissionProgress = (missionId: string) => {
  const subs = subMissions.value[missionId] || []
  if (subs.length === 0) return { total: 0, completed: 0, percentage: 0 }
  
  const completed = subs.filter(sub => sub.statut === 'TERMINEE').length
  const percentage = Math.round((completed / subs.length) * 100)
  
  return { total: subs.length, completed, percentage }
}

const viewSubMissionDetails = (subMission: SubMission) => {
  // Navigate to sub-mission details or show in dialog
  console.log('Viewing sub-mission details:', subMission)
}
</script>

<template>
  <div class="space-y-6">
    <!-- En-tête avec statistiques -->
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
            <Clock class="w-5 h-5 text-yellow-600" />
            <div>
              <p class="text-sm text-gray-600">En cours</p>
              <p class="text-2xl font-bold">
                {{ missions.filter((m) => m.status === "EN_COURS" || m.status === "ASSIGNEE").length }}
              </p>
            </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="p-4">
            <div class="flex items-center space-x-2">
              <CheckCircle class="w-5 h-5 text-green-600" />
              <div>
                <p class="text-sm text-gray-600">Terminées</p>
                <p class="text-2xl font-bold">{{ missions.filter((m) => m.status === "TERMINEE").length }}</p>
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
                <p class="text-2xl font-bold">{{ missions.filter((m) => m.urgence === "HAUTE" || m.urgence === "CRITIQUE").length }}</p>
              </div>
            </div>
          </CardContent>
        </Card>
    </div>

    <!-- Filtres et recherche -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center">
          <Filter class="w-5 h-5 mr-2" />
          Filtres et recherche
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <!-- Barre de recherche -->
          <div>
            <Label for="search">Recherche</Label>
            <div class="relative">
              <Search class="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Rechercher par numéro, prestataire, client, titre..."
                v-model="searchTerm"
                class="pl-10"
                data-testid="missions-search-input"
              />
            </div>
          </div>

          <!-- Filtres -->
          <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <Label>Statut</Label>
              <Select v-model="selectedStatut">
                <SelectTrigger data-testid="status-filter-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="option in statutOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Prestataire</Label>
              <Select v-model="selectedPrestataire">
                <SelectTrigger data-testid="prestataire-filter-select">
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les prestataires</SelectItem>
                  <SelectItem v-for="prestataire in prestataires" :key="prestataire.id" :value="prestataire.id">
                    {{ prestataire.contactPerson }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Urgence</Label>
              <Select v-model="selectedUrgence">
                <SelectTrigger data-testid="urgence-filter-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="option in urgenceOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Type</Label>
              <Select v-model="selectedType">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="option in typeOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Date début</Label>
              <Input type="date" v-model="dateDebut" />
            </div>

            <div>
              <Label>Date fin</Label>
              <Input type="date" v-model="dateFin" />
            </div>
          </div>

          <!-- Boutons d'action -->
          <div class="flex justify-between items-center">
            <div class="text-sm text-gray-600">
              {{ filteredAndSortedMissions.length }} mission(s) trouvée(s) sur {{ missions.length }}
            </div>
            <div class="flex space-x-2">
              <Button variant="outline" @click="resetFilters" data-testid="reset-filters-button">
                <RefreshCw class="w-4 h-4 mr-2" />
                Réinitialiser
              </Button>
              <Button variant="outline" @click="handleExport">
                <Download class="w-4 h-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
          </div>
        </CardContent>
      </Card>

    <!-- Tableau des missions -->
    <Card>
      <CardHeader>
        <CardTitle>Liste des missions</CardTitle>
        <CardDescription>Consultez et gérez toutes vos missions</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" @click="handleSort('dateDeCreation')" class="h-auto p-0">
                    N° Mission / Date
                    <component :is="getSortIcon('dateDeCreation')" class="w-4 h-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" @click="handleSort('prestataire')" class="h-auto p-0">
                    Prestataire
                    <component :is="getSortIcon('prestataire')" class="w-4 h-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" @click="handleSort('client')" class="h-auto p-0">
                    Client
                    <component :is="getSortIcon('client')" class="w-4 h-4" />
                  </Button>
                </TableHead>
                <TableHead>Mission</TableHead>
                <TableHead>
                  <Button variant="ghost" @click="handleSort('urgence')" class="h-auto p-0">
                    Type / Urgence
                    <component :is="getSortIcon('urgence')" class="w-4 h-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" @click="handleSort('budget')" class="h-auto p-0">
                    Budget
                    <component :is="getSortIcon('budget')" class="w-4 h-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" @click="handleSort('status')" class="h-auto p-0">
                    Statut
                    <component :is="getSortIcon('status')" class="w-4 h-4" />
                  </Button>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow 
                v-for="mission in filteredAndSortedMissions" 
                :key="mission.id" 
                class="hover:bg-gray-50 cursor-pointer"
                @click="viewMissionDetails(mission.id)"
                :data-testid="`mission-row-${mission.id}`"
              >
                <TableCell>
                  <div>
                    <p class="font-medium" data-testid="mission-reference">{{ mission.reference }}</p>
                    <p class="text-sm text-gray-500" data-testid="mission-date">{{ new Date(mission.dateDeCreation).toLocaleDateString() }}</p>
                    <!-- Add expand/collapse button for sub-missions -->
                    <Button
                      v-if="subMissions[mission.id]?.length > 0 || expandedMissions.has(mission.id)"
                      variant="ghost"
                      size="sm"
                      @click.stop="toggleMissionExpansion(mission.id)"
                      :data-testid="`expand-mission-${mission.id}`"
                      class="mt-1 p-1 h-6"
                    >
                      <span class="text-xs">
                        {{ expandedMissions.has(mission.id) ? '▼' : '▶' }} 
                        {{ subMissions[mission.id]?.length || 0 }} sous-missions
                      </span>
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div v-if="mission.prestataire" class="flex items-center space-x-2">
                    <Avatar class="w-8 h-8">
                      <AvatarFallback class="text-xs">
                        {{ mission.prestataire.contactPerson.split(' ').map((n) => n[0]).join('') }}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p class="font-medium text-sm">{{ mission.prestataire.contactPerson }}</p>
                      <p class="text-xs text-gray-500">{{ mission.location?.city || '' }}</p>
                    </div>
                  </div>
                  <div v-else class="text-xs text-gray-500">Non assignée</div>
                </TableCell>
                <TableCell>
                  <div>
                    <p class="font-medium text-sm">
                      {{ mission.societaire?.firstName || '' }} {{ mission.societaire?.lastName || '' }}
                    </p>
                    <p class="text-xs text-gray-500">{{ mission.location?.city || '' }}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p class="font-medium text-sm">{{ mission.description }}</p>
                    <p class="text-xs text-gray-500 max-w-xs truncate">{{ mission.description }}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="space-y-1">
                    <div v-html="getUrgenceBadge(mission.urgence)"></div>
                  </div>
                </TableCell>
                <TableCell>
                  <div v-if="mission.estimatedCost" class="flex items-center">
                    <Euro class="w-3 h-3 mr-1 text-gray-500" />
                    <span class="font-medium">{{ mission.estimatedCost }}€</span>
                  </div>
                  <div v-else class="text-xs text-gray-500">-</div>
                </TableCell>
                <TableCell><div v-html="getStatutBadge(mission.status)" data-testid="mission-status"></div></TableCell>
                <TableCell @click.stop>
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" size="sm" :data-testid="`mission-actions-${mission.id}`">
                        <MoreHorizontal class="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem @click="viewMissionDetails(mission.id)">
                        <Eye class="w-4 h-4 mr-2" />
                        Voir détails
                      </DropdownMenuItem>
                      <DropdownMenuItem @click="handleExportMissionDetails(mission.id)">
                        <Download class="w-4 h-4 mr-2" />
                        Télécharger
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
              
              <!-- Sub-missions rows (shown when expanded) -->
              <template v-for="mission in filteredAndSortedMissions" :key="`expanded-${mission.id}`">
                <template v-if="expandedMissions.has(mission.id)">
                <!-- Add sub-mission button row -->
                <TableRow class="bg-blue-50">
                  <TableCell colspan="8" class="pl-8">
                    <Button
                      variant="outline"
                      size="sm"
                      @click.stop="openSubMissionDialog(mission.id)"
                      class="mb-2"
                      data-testid="add-sub-mission-button"
                    >
                      <Plus class="w-4 h-4 mr-2" />
                      Ajouter sous-mission
                    </Button>
                  </TableCell>
                </TableRow>
                
                <TableRow 
                  v-for="subMission in (subMissions[mission.id] || [])" 
                  :key="subMission.id"
                  class="bg-gray-50"
                  :data-testid="`sub-mission-row-${subMission.id}`"
                >
                  <TableCell class="pl-8">
                    <div>
                      <p class="font-medium text-sm" data-testid="sub-mission-title">{{ subMission.title }}</p>
                      <p class="text-xs text-gray-500">{{ subMission.specialization }}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span class="text-sm text-gray-600">Sous-mission</span>
                  </TableCell>
                  <TableCell>
                    <span class="text-sm text-gray-600">-</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p class="font-medium text-sm">{{ subMission.description }}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div class="space-y-1">
                      <div v-html="getUrgenceBadge(subMission.urgence)"></div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div v-if="subMission.estimatedCost" class="flex items-center">
                      <Euro class="w-3 h-3 mr-1 text-gray-500" />
                      <span class="font-medium">{{ subMission.estimatedCost }}€</span>
                    </div>
                    <div v-else class="text-xs text-gray-500">-</div>
                  </TableCell>
                  <TableCell>
                    <div v-html="getStatutBadge(subMission.statut)" data-testid="sub-mission-status"></div>
                  </TableCell>
                  <TableCell @click.stop>
                    <DropdownMenu>
                      <DropdownMenuTrigger as-child>
                        <Button variant="ghost" size="sm" :data-testid="`sub-mission-actions-${subMission.id}`">
                          <MoreHorizontal class="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem @click="viewSubMissionDetails(subMission)">
                          <Eye class="w-4 h-4 mr-2" />
                          Voir détails
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                </template>
              </template>
            </TableBody>
          </Table>
        </div>

        <div v-if="filteredAndSortedMissions.length === 0" class="text-center py-8">
          <Briefcase class="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p class="text-gray-500">Aucune mission trouvée avec ces critères</p>
        </div>
      </CardContent>
    </Card>

    <!-- Dialog détails mission -->
    <Dialog :open="!!selectedMission" @update:open="(open) => { if (!open) selectedMission = null }">
      <DialogContent class="max-w-2xl max-h-[80vh] overflow-y-auto">
        <div v-if="selectedMission">
          <DialogHeader>
            <DialogTitle class="flex items-center space-x-2">
              <Briefcase class="w-5 h-5" />
              <span>Mission {{ selectedMission.reference }}</span>
            </DialogTitle>
            <DialogDescription>{{ selectedMission.description }}</DialogDescription>
          </DialogHeader>

          <div class="space-y-6">
            <!-- Statut et urgence -->
            <div class="flex items-center justify-between">
              <div v-html="getStatutBadge(selectedMission.status)"></div>
              <div v-html="getUrgenceBadge(selectedMission.urgence)"></div>
            </div>

            <!-- Informations client -->
            <div>
              <h4 class="font-semibold mb-3">Client</h4>
              <div class="bg-gray-50 p-4 rounded-lg space-y-2">
                <p>
                  <strong>
                    {{ selectedMission.civilite || '' }} {{ selectedMission.prenom || '' }} {{ selectedMission.nom || '' }}
                  </strong>
                </p>
                <div class="flex items-center space-x-4 text-sm text-gray-600">
                  <span class="flex items-center">
                    <Phone class="w-3 h-3 mr-1" />
                    {{ selectedMission.telephone || '' }}
                  </span>
                  <span v-if="selectedMission.email" class="flex items-center">
                    <Mail class="w-3 h-3 mr-1" />
                    {{ selectedMission.email || '' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Informations prestataire -->
            <div>
              <h4 class="font-semibold mb-3">Prestataire assigné</h4>
              <div class="bg-blue-50 p-4 rounded-lg">
                <div class="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      {{ selectedMission.prestataire?.contactPerson?.split(' ').map((n) => n[0]).join('') || '' }}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p class="font-semibold">{{ selectedMission.prestataire?.contactPerson || '' }}</p>
                    <p class="text-sm text-gray-600">{{ selectedMission.prestataire?.companyName || '' }}</p>
                    <div class="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span class="flex items-center">
                        <Phone class="w-3 h-3 mr-1" />
                        {{ selectedMission.prestataire?.phone || '' }}
                      </span>
                      <span class="flex items-center">
                        <Mail class="w-3 h-3 mr-1" />
                        {{ selectedMission.prestataire?.email || '' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Chantier -->
            <div>
              <h4 class="font-semibold mb-3">Lieu d'intervention</h4>
              <div class="flex items-center space-x-2">
                <MapPin class="w-4 h-4 text-gray-500" />
                <span>
                  {{ selectedMission.chantierAdresse || selectedMission.location?.street || '' }}, {{ selectedMission.chantierCodePostal || selectedMission.location?.postalCode || '' }}
                  {{ selectedMission.chantierVille || selectedMission.location?.city || '' }}
                </span>
              </div>
            </div>

            <!-- Description de la mission -->
            <div>
              <h4 class="font-semibold mb-3">Description de la mission</h4>
              <p class="text-sm text-gray-700 bg-gray-50 p-3 rounded">{{ selectedMission.description }}</p>
            </div>

            <!-- Informations sinistre -->
            <div>
              <h4 class="font-semibold mb-3">Sinistre</h4>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-500">Type:</span>
                  <p>{{ selectedMission.sinistreType || '' }}</p>
                </div>
                <div>
                  <span class="text-gray-500">N° Sinistre:</span>
                  <p>{{ selectedMission.numeroSinistre || '' }}</p>
                </div>
              </div>
            </div>

            <!-- Budget -->
            <div v-if="selectedMission.budgetEstime || selectedMission.estimatedCost">
              <h4 class="font-semibold mb-3">Budget estimé</h4>
              <p class="text-lg font-semibold text-green-600">{{ selectedMission.budgetEstime || selectedMission.estimatedCost }}€</p>
            </div>

            <!-- Dates -->
            <div>
              <h4 class="font-semibold mb-3">Chronologie</h4>
              <div class="space-y-2 text-sm">
                <div class="flex items-center space-x-2">
                  <Calendar class="w-4 h-4 text-gray-500" />
                  <span>Créée le {{ new Date(selectedMission.dateDeCreation).toLocaleDateString() }}</span>
                </div>
                <div v-if="selectedMission.dateDeCreation" class="flex items-center space-x-2">
                  <Calendar class="w-4 h-4 text-gray-500" />
                  <span>Envoyée le {{ new Date(selectedMission.dateDeCreation).toLocaleDateString() }}</span>
                </div>
                <div v-if="selectedMission.deadline" class="flex items-center space-x-2">
                  <Calendar class="w-4 h-4 text-gray-500" />
                  <span>Échéance le {{ new Date(selectedMission.deadline).toLocaleDateString() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Sub-mission creation dialog -->
    <Dialog :open="showSubMissionDialog" @update:open="(open) => { if (!open) showSubMissionDialog = false }">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ajouter une sous-mission</DialogTitle>
          <DialogDescription>Créez une nouvelle sous-mission pour cette mission principale</DialogDescription>
        </DialogHeader>

        <div class="space-y-4">
          <div>
            <Label for="sub-mission-specialization">Spécialisation</Label>
            <Select v-model="newSubMission.specialization">
              <SelectTrigger data-testid="sub-mission-specialization-select">
                <SelectValue placeholder="Choisir une spécialisation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="spec in SPECIALIZATIONS" :key="spec" :value="spec">
                  {{ spec }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label for="sub-mission-title">Titre</Label>
            <Input
              id="sub-mission-title"
              v-model="newSubMission.title"
              placeholder="Titre de la sous-mission"
              data-testid="sub-mission-title-input"
            />
          </div>

          <div>
            <Label for="sub-mission-description">Description</Label>
            <Textarea
              id="sub-mission-description"
              v-model="newSubMission.description"
              placeholder="Description détaillée"
              data-testid="sub-mission-description-textarea"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="sub-mission-urgence">Urgence</Label>
              <Select v-model="newSubMission.urgence">
                <SelectTrigger data-testid="sub-mission-urgence-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FAIBLE">Faible</SelectItem>
                  <SelectItem value="MOYENNE">Moyenne</SelectItem>
                  <SelectItem value="HAUTE">Haute</SelectItem>
                  <SelectItem value="CRITIQUE">Critique</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label for="sub-mission-cost">Coût estimé (€)</Label>
              <Input
                id="sub-mission-cost"
                type="number"
                v-model="newSubMission.estimatedCost"
                placeholder="0"
                data-testid="sub-mission-cost-input"
              />
            </div>
          </div>

          <div class="flex justify-end space-x-2">
            <Button variant="outline" @click="showSubMissionDialog = false" data-testid="cancel-sub-mission-button">
              Annuler
            </Button>
            <Button @click="createSubMission" data-testid="create-sub-mission-button">
              Créer sous-mission
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
