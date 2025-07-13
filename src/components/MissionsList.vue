<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
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
} from 'lucide-vue-next'
import type { IMission } from '@/interfaces/IMission'
import { useAssureurStore } from '@/stores/assureur'

const assureurStore = useAssureurStore()

// Props
interface Props {
  missions?: IMission[]
}

const props = withDefaults(defineProps<Props>(), {
  missions: () => []
})

// Données mockées pour la démonstration (utilisées si pas de props)
const mockMissions: IMission[] = [
  {
    id: "1",
    numeroMission: "M240001",
    prestataire: {
      id: "1",
      nom: "Martin",
      prenom: "Dubois",
      raisonSociale: "DUBOIS MAÇONNERIE SARL",
      telephone: "04 78 12 34 56",
      email: "contact@dubois-maconnerie.fr",
      ville: "Lyon",
    },
    client: {
      civilite: "M",
      nom: "Dupont",
      prenom: "Jean",
      telephone: "06 12 34 56 78",
      email: "jean.dupont@email.com",
      adresse: "15 Rue de la Paix",
      codePostal: "69001",
      ville: "Lyon",
    },
    chantier: {
      adresse: "15 Rue de la Paix",
      ville: "Lyon",
      codePostal: "69001",
      typeAcces: "Libre",
      etage: "RDC",
      contraintes: "Aucune",
    },
    mission: {
      titre: "Réparation fissures mur porteur",
      description: "Réparation de fissures importantes sur mur porteur suite à tassement",
      budgetEstime: "2500",
      delaiSouhaite: "2 semaines",
      horaires: "8h-17h",
      materiaux: "Fournis par le prestataire",
      normes: "Normes DTU",
      conditionsParticulieres: "Accès facile",
    },
    sinistre: {
      type: "Fissures",
      description: "Réparation de fissures importantes sur mur porteur suite à tassement",
      urgence: "elevee",
      numeroSinistre: "SIN2024001",
      dateSinistre: "2024-01-10",
      dateIntervention: "2024-01-15",
    },
    statut: "en_cours",
    dateCreation: "2024-01-15T10:30:00Z",
    documents: [],
    dateEnvoi: "2024-01-15T11:00:00Z",
    dateReponse: "2024-01-16T09:15:00Z",
    dateFinPrevue: "2024-02-15T17:00:00Z",
  },
  {
    id: "2",
    numeroMission: "M240002",
    prestataire: {
      id: "2",
      nom: "Sophie",
      prenom: "Moreau",
      raisonSociale: "MOREAU PLOMBERIE",
      telephone: "04 91 23 45 67",
      email: "sophie@moreau-plomberie.fr",
      ville: "Marseille",
    },
    client: {
      civilite: "Mme",
      nom: "Martin",
      prenom: "Claire",
      telephone: "06 98 76 54 32",
      email: "claire.martin@email.com",
      adresse: "8 Avenue des Fleurs",
      codePostal: "13008",
      ville: "Marseille",
    },
    chantier: {
      adresse: "8 Avenue des Fleurs",
      ville: "Marseille",
      codePostal: "13008",
      typeAcces: "Clés chez gardien",
      etage: "3ème",
      contraintes: "Prévenir le gardien",
    },
    mission: {
      titre: "Dégât des eaux - Réparation canalisation",
      description: "Réparation urgente de canalisation suite à dégât des eaux dans salle de bain",
      budgetEstime: "800",
      delaiSouhaite: "2 jours",
      horaires: "Urgence",
      materiaux: "Fournis par le prestataire",
      normes: "Normes plomberie",
      conditionsParticulieres: "Accès rapide nécessaire",
    },
    sinistre: {
      type: "Dégât des eaux",
      description: "Réparation urgente de canalisation suite à dégât des eaux dans salle de bain",
      urgence: "elevee",
      numeroSinistre: "SIN2024002",
      dateSinistre: "2024-01-18",
      dateIntervention: "2024-01-20",
    },
    statut: "acceptee",
    dateCreation: "2024-01-20T14:20:00Z",
    documents: [],
    dateEnvoi: "2024-01-20T14:30:00Z",
    dateReponse: "2024-01-20T16:45:00Z",
  },
  {
    id: "3",
    numeroMission: "M240003",
    prestataire: {
      id: "3",
      nom: "Pierre",
      prenom: "Leroy",
      raisonSociale: "LEROY ÉLECTRICITÉ",
      telephone: "05 61 12 34 56",
      email: "pierre@leroy-electricite.fr",
      ville: "Toulouse",
    },
    client: {
      civilite: "M",
      nom: "Bernard",
      prenom: "Paul",
      telephone: "06 11 22 33 44",
      email: "paul.bernard@email.com",
      adresse: "22 Rue du Commerce",
      codePostal: "31000",
      ville: "Toulouse",
    },
    chantier: {
      adresse: "22 Rue du Commerce",
      ville: "Toulouse",
      codePostal: "31000",
      typeAcces: "Libre",
      etage: "1er",
      contraintes: "Aucune",
    },
    mission: {
      titre: "Remise aux normes installation électrique",
      description: "Mise aux normes complète de l'installation électrique suite à contrôle",
      budgetEstime: "3200",
      delaiSouhaite: "1 mois",
      horaires: "9h-18h",
      materiaux: "Fournis par le prestataire",
      normes: "Normes NFC 15-100",
      conditionsParticulieres: "Coupure électrique à prévoir",
    },
    sinistre: {
      type: "Autre",
      description: "Mise aux normes complète de l'installation électrique suite à contrôle",
      urgence: "moyenne",
      numeroSinistre: "SIN2024003",
      dateSinistre: "2024-01-20",
      dateIntervention: "2024-01-25",
    },
    statut: "envoyee",
    dateCreation: "2024-01-25T09:00:00Z",
    documents: [],
    dateEnvoi: "2024-01-25T09:15:00Z",
  },
  {
    id: "4",
    numeroMission: "M240004",
    prestataire: {
      id: "1",
      nom: "Martin",
      prenom: "Dubois",
      raisonSociale: "DUBOIS MAÇONNERIE SARL",
      telephone: "04 78 12 34 56",
      email: "contact@dubois-maconnerie.fr",
      ville: "Lyon",
    },
    client: {
      civilite: "Mme",
      nom: "Rousseau",
      prenom: "Marie",
      telephone: "06 55 44 33 22",
      email: "marie.rousseau@email.com",
      adresse: "5 Place de la Mairie",
      codePostal: "69100",
      ville: "Villeurbanne",
    },
    chantier: {
      adresse: "5 Place de la Mairie",
      ville: "Villeurbanne",
      codePostal: "69100",
      typeAcces: "Libre",
      etage: "RDC",
      contraintes: "Aucune",
    },
    mission: {
      titre: "Réparation toiture après tempête",
      description: "Réparation de tuiles et gouttières endommagées par la tempête",
      budgetEstime: "1800",
      delaiSouhaite: "1 semaine",
      horaires: "8h-17h",
      materiaux: "Fournis par le prestataire",
      normes: "Normes DTU",
      conditionsParticulieres: "Accès par l'extérieur",
    },
    sinistre: {
      type: "Tempête",
      description: "Réparation de tuiles et gouttières endommagées par la tempête",
      urgence: "moyenne",
      numeroSinistre: "SIN2024004",
      dateSinistre: "2024-01-05",
      dateIntervention: "2024-01-10",
    },
    statut: "terminee",
    dateCreation: "2024-01-10T08:30:00Z",
    documents: [],
    dateEnvoi: "2024-01-10T09:00:00Z",
    dateReponse: "2024-01-10T14:20:00Z",
    dateFinPrevue: "2024-01-20T17:00:00Z",
  },
  {
    id: "5",
    numeroMission: "M240005",
    prestataire: {
      id: "2",
      nom: "Sophie",
      prenom: "Moreau",
      raisonSociale: "MOREAU PLOMBERIE",
      telephone: "04 91 23 45 67",
      email: "sophie@moreau-plomberie.fr",
      ville: "Marseille",
    },
    client: {
      civilite: "M",
      nom: "Petit",
      prenom: "Luc",
      telephone: "06 77 88 99 00",
      email: "luc.petit@email.com",
      adresse: "12 Boulevard de la Liberté",
      codePostal: "13001",
      ville: "Marseille",
    },
    chantier: {
      adresse: "12 Boulevard de la Liberté",
      ville: "Marseille",
      codePostal: "13001",
      typeAcces: "Code d'accès",
      etage: "2ème",
      contraintes: "Code 1234",
    },
    mission: {
      titre: "Installation chaudière",
      description: "Installation d'une nouvelle chaudière gaz condensation",
      budgetEstime: "4500",
      delaiSouhaite: "3 jours",
      horaires: "9h-17h",
      materiaux: "Fournis par le prestataire",
      normes: "Normes gaz",
      conditionsParticulieres: "Ancienne chaudière à déposer",
    },
    sinistre: {
      type: "Chauffage",
      description: "Installation d'une nouvelle chaudière gaz condensation",
      urgence: "faible",
      numeroSinistre: "SIN2024005",
      dateSinistre: "2024-01-25",
      dateIntervention: "2024-01-28",
    },
    statut: "refusee",
    dateCreation: "2024-01-28T11:00:00Z",
    documents: [],
    dateEnvoi: "2024-01-28T11:30:00Z",
    dateReponse: "2024-01-29T08:45:00Z",
  },
]

type SortField = "dateCreation" | "prestataire" | "client" | "statut" | "urgence" | "budget"
type SortDirection = "asc" | "desc"

const missions = computed(() => props.missions.length > 0 ? props.missions : mockMissions)
const searchTerm = ref("")
const selectedStatut = ref("all")
const selectedPrestataire = ref("all")
const selectedUrgence = ref("all")
const selectedType = ref("all")
const dateDebut = ref("")
const dateFin = ref("")
const sortField = ref<SortField>("dateCreation")
const sortDirection = ref<SortDirection>("desc")
const selectedMission = ref<IMission | null>(null)

// Options pour les filtres
const statutOptions = [
  { value: "all", label: "Tous les statuts" },
  { value: "brouillon", label: "Brouillon" },
  { value: "envoyee", label: "Envoyée" },
  { value: "acceptee", label: "Acceptée" },
  { value: "refusee", label: "Refusée" },
  { value: "en_cours", label: "En cours" },
  { value: "terminee", label: "Terminée" },
  { value: "annulee", label: "Annulée" },
]

const urgenceOptions = [
  { value: "all", label: "Toutes urgences" },
  { value: "faible", label: "Faible" },
  { value: "moyenne", label: "Moyenne" },
  { value: "elevee", label: "Élevée" },
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
    (acc: IMission["prestataire"][], mission) => {
      if (!acc.find((p) => p.id === mission.prestataire.id)) {
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
        mission.numeroMission.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        mission.prestataire.nom.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        mission.prestataire.raisonSociale.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        mission.client.nom.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        mission.client.prenom.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        mission.mission.titre.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        mission.sinistre.type.toLowerCase().includes(searchTerm.value.toLowerCase()),
    )
  }

  // Filtre par statut
  if (selectedStatut.value !== "all") {
    filtered = filtered.filter((mission) => mission.statut === selectedStatut.value)
  }

  // Filtre par prestataire
  if (selectedPrestataire.value !== "all") {
    filtered = filtered.filter((mission) => mission.prestataire.id === selectedPrestataire.value)
  }

  // Filtre par urgence
  if (selectedUrgence.value !== "all") {
    filtered = filtered.filter((mission) => mission.sinistre.urgence === selectedUrgence.value)
  }

  // Filtre par type
  if (selectedType.value !== "all") {
    filtered = filtered.filter((mission) => mission.sinistre.type === selectedType.value)
  }

  // Filtre par date
  if (dateDebut.value) {
    filtered = filtered.filter((mission) => new Date(mission.dateCreation) >= new Date(dateDebut.value))
  }
  if (dateFin.value) {
    filtered = filtered.filter((mission) => new Date(mission.dateCreation) <= new Date(dateFin.value))
  }

  // Tri
  filtered.sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (sortField.value) {
      case "dateCreation":
        aValue = new Date(a.dateCreation)
        bValue = new Date(b.dateCreation)
        break
      case "prestataire":
        aValue = a.prestataire.nom
        bValue = b.prestataire.nom
        break
      case "client":
        aValue = `${a.client.nom} ${a.client.prenom}`
        bValue = `${b.client.nom} ${b.client.prenom}`
        break
      case "statut":
        aValue = a.statut
        bValue = b.statut
        break
      case "urgence":
        const urgenceOrder: { [key: string]: number } = { faible: 1, moyenne: 2, elevee: 3 }
        aValue = urgenceOrder[a.sinistre.urgence]
        bValue = urgenceOrder[b.sinistre.urgence]
        break
      case "budget":
        aValue = Number.parseFloat(a.mission.budgetEstime || "0")
        bValue = Number.parseFloat(b.mission.budgetEstime || "0")
        break
      default:
        aValue = a.dateCreation
        bValue = b.dateCreation
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

const getStatutBadge = (statut: IMission["statut"]) => {
  switch (statut) {
    case "brouillon":
      return `
        <Badge variant="secondary">
          <FileText class="w-3 h-3 mr-1" />
          Brouillon
        </Badge>
      `
    case "envoyee":
      return `
        <Badge variant="outline">
          <Clock class="w-3 h-3 mr-1" />
          Envoyée
        </Badge>
      `
    case "acceptee":
      return `
        <Badge variant="default">
          <CheckCircle class="w-3 h-3 mr-1" />
          Acceptée
        </Badge>
      `
    case "refusee":
      return `
        <Badge variant="destructive">
          <XCircle class="w-3 h-3 mr-1" />
          Refusée
        </Badge>
      `
    case "en_cours":
      return `
        <Badge class="bg-blue-100 text-blue-800">
          <Clock class="w-3 h-3 mr-1" />
          En cours
        </Badge>
      `
    case "terminee":
      return `
        <Badge class="bg-green-100 text-green-800">
          <CheckCircle class="w-3 h-3 mr-1" />
          Terminée
        </Badge>
      `
    case "annulee":
      return `
        <Badge variant="destructive">
          <XCircle class="w-3 h-3 mr-1" />
          Annulée
        </Badge>
      `
    default:
      return ``
  }
}

const getUrgenceBadge = (urgence: IMission["sinistre"]["urgence"]) => {
  switch (urgence) {
    case "faible":
      return `<Badge class="bg-green-100 text-green-800">Faible</Badge>`
    case "moyenne":
      return `<Badge class="bg-yellow-100 text-yellow-800">Moyenne</Badge>`
    case "elevee":
      return `<Badge class="bg-red-100 text-red-800">Élevée</Badge>`
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
    
    await assureurStore.exportMissions(filters)
  } catch (error) {
    console.error('Erreur lors de l\'export:', error)
  }
}

const handleExportMissionDetails = async (missionId: string) => {
  try {
    await assureurStore.exportMissionDetails(missionId)
  } catch (error) {
    console.error('Erreur lors de l\'export de la mission:', error)
  }
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
                {{ missions.filter((m) => m.statut === "en_cours" || m.statut === "acceptee").length }}
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
                <p class="text-2xl font-bold">{{ missions.filter((m) => m.statut === "terminee").length }}</p>
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
                <p class="text-2xl font-bold">{{ missions.filter((m) => m.sinistre.urgence === "elevee").length }}</p>
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
              />
            </div>
          </div>

          <!-- Filtres -->
          <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <Label>Statut</Label>
              <Select v-model="selectedStatut">
                <SelectTrigger>
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
                <SelectTrigger>
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les prestataires</SelectItem>
                  <SelectItem v-for="prestataire in prestataires" :key="prestataire.id" :value="prestataire.id">
                    {{ prestataire.nom }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Urgence</Label>
              <Select v-model="selectedUrgence">
                <SelectTrigger>
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
              <Button variant="outline" @click="resetFilters">
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
                  <Button variant="ghost" @click="handleSort('dateCreation')" class="h-auto p-0">
                    N° Mission / Date
                    <component :is="getSortIcon('dateCreation')" class="w-4 h-4" />
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
                  <Button variant="ghost" @click="handleSort('statut')" class="h-auto p-0">
                    Statut
                    <component :is="getSortIcon('statut')" class="w-4 h-4" />
                  </Button>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="mission in filteredAndSortedMissions" :key="mission.id" class="hover:bg-gray-50">
                <TableCell>
                  <div>
                    <p class="font-medium">{{ mission.numeroMission }}</p>
                    <p class="text-sm text-gray-500">{{ new Date(mission.dateCreation).toLocaleDateString() }}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex items-center space-x-2">
                    <Avatar class="w-8 h-8">
                      <AvatarFallback class="text-xs">
                        {{ mission.prestataire.nom.split(' ').map((n) => n[0]).join('') }}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p class="font-medium text-sm">{{ mission.prestataire.nom }}</p>
                      <p class="text-xs text-gray-500">{{ mission.prestataire.ville }}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p class="font-medium text-sm">
                      {{ mission.client.civilite }} {{ mission.client.prenom }} {{ mission.client.nom }}
                    </p>
                    <p class="text-xs text-gray-500">{{ mission.chantier.ville }}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p class="font-medium text-sm">{{ mission.mission.titre }}</p>
                    <p class="text-xs text-gray-500 max-w-xs truncate">{{ mission.mission.description }}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="space-y-1">
                    <Badge variant="outline" class="text-xs">
                      {{ mission.sinistre.type }}
                    </Badge>
                    <div v-html="getUrgenceBadge(mission.sinistre.urgence)"></div>
                  </div>
                </TableCell>
                <TableCell>
                  <div v-if="mission.mission.budgetEstime" class="flex items-center">
                    <Euro class="w-3 h-3 mr-1 text-gray-500" />
                    <span class="font-medium">{{ mission.mission.budgetEstime }}</span>
                  </div>
                </TableCell>
                <TableCell><div v-html="getStatutBadge(mission.statut)"></div></TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal class="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem @click="selectedMission = mission">
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
              <span>Mission {{ selectedMission.numeroMission }}</span>
            </DialogTitle>
            <DialogDescription>{{ selectedMission.mission.titre }}</DialogDescription>
          </DialogHeader>

          <div class="space-y-6">
            <!-- Statut et urgence -->
            <div class="flex items-center justify-between">
              <div v-html="getStatutBadge(selectedMission.statut)"></div>
              <div v-html="getUrgenceBadge(selectedMission.sinistre.urgence)"></div>
            </div>

            <!-- Informations client -->
            <div>
              <h4 class="font-semibold mb-3">Client</h4>
              <div class="bg-gray-50 p-4 rounded-lg space-y-2">
                <p>
                  <strong>
                    {{ selectedMission.client.civilite }} {{ selectedMission.client.prenom }} {{ selectedMission.client.nom }}
                  </strong>
                </p>
                <div class="flex items-center space-x-4 text-sm text-gray-600">
                  <span class="flex items-center">
                    <Phone class="w-3 h-3 mr-1" />
                    {{ selectedMission.client.telephone }}
                  </span>
                  <span v-if="selectedMission.client.email" class="flex items-center">
                    <Mail class="w-3 h-3 mr-1" />
                    {{ selectedMission.client.email }}
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
                      {{ selectedMission.prestataire.nom.split(' ').map((n) => n[0]).join('') }}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p class="font-semibold">{{ selectedMission.prestataire.nom }}</p>
                    <p class="text-sm text-gray-600">{{ selectedMission.prestataire.raisonSociale }}</p>
                    <div class="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span class="flex items-center">
                        <Phone class="w-3 h-3 mr-1" />
                        {{ selectedMission.prestataire.telephone }}
                      </span>
                      <span class="flex items-center">
                        <Mail class="w-3 h-3 mr-1" />
                        {{ selectedMission.prestataire.email }}
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
                  {{ selectedMission.chantier.adresse }}, {{ selectedMission.chantier.codePostal }}
                  {{ selectedMission.chantier.ville }}
                </span>
              </div>
            </div>

            <!-- Description de la mission -->
            <div>
              <h4 class="font-semibold mb-3">Description de la mission</h4>
              <p class="text-sm text-gray-700 bg-gray-50 p-3 rounded">{{ selectedMission.mission.description }}</p>
            </div>

            <!-- Informations sinistre -->
            <div>
              <h4 class="font-semibold mb-3">Sinistre</h4>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-500">Type:</span>
                  <p>{{ selectedMission.sinistre.type }}</p>
                </div>
                <div>
                  <span class="text-gray-500">N° Sinistre:</span>
                  <p>{{ selectedMission.sinistre.numeroSinistre }}</p>
                </div>
              </div>
            </div>

            <!-- Budget -->
            <div v-if="selectedMission.mission.budgetEstime">
              <h4 class="font-semibold mb-3">Budget estimé</h4>
              <p class="text-lg font-semibold text-green-600">{{ selectedMission.mission.budgetEstime }}€</p>
            </div>

            <!-- Dates -->
            <div>
              <h4 class="font-semibold mb-3">Chronologie</h4>
              <div class="space-y-2 text-sm">
                <div class="flex items-center space-x-2">
                  <Calendar class="w-4 h-4 text-gray-500" />
                  <span>Créée le {{ new Date(selectedMission.dateCreation).toLocaleDateString() }}</span>
                </div>
                <div v-if="selectedMission.dateEnvoi" class="flex items-center space-x-2">
                  <Calendar class="w-4 h-4 text-gray-500" />
                  <span>Envoyée le {{ new Date(selectedMission.dateEnvoi).toLocaleDateString() }}</span>
                </div>
                <div v-if="selectedMission.dateReponse" class="flex items-center space-x-2">
                  <Calendar class="w-4 h-4 text-gray-500" />
                  <span>Réponse le {{ new Date(selectedMission.dateReponse).toLocaleDateString() }}</span>
                </div>
                <div v-if="selectedMission.dateFinPrevue" class="flex items-center space-x-2">
                  <Calendar class="w-4 h-4 text-gray-500" />
                  <span>Fin prévue le {{ new Date(selectedMission.dateFinPrevue).toLocaleDateString() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
