<script setup lang="ts">
import { ref, computed, watch } from 'vue'
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
import MissionCreationDialog from '@/components/MissionCreationDialog.vue'
import MissionsList from '@/components/MissionsList.vue'
import type { Prestataire } from '@/interfaces/prestataire'
import type { DemandeComm } from '@/interfaces/demande-comm'
import type { IMission } from '@/interfaces/IMission'
import { DemandeCommStatut } from '@/enums/demande-comm-statut'

const mockPrestataires: Prestataire[] = [
  {
    id: "1",
    nom: "Martin Dubois",
    raisonSociale: "DUBOIS MAÇONNERIE SARL",
    secteurs: ["Maçonnerie", "Gros œuvre"],
    specialites: ["Rénovation", "Construction neuve", "Réparation fissures"],
    ville: "Lyon",
    departement: "69 - Rhône",
    region: "Auvergne-Rhône-Alpes",
    notemoyenne: 4.8,
    nombreAvis: 127,
    siret: "12345678901234",
    formeJuridique: "SARL",
    dateCreation: "2015-03-15",
    telephone: "04 78 12 34 56",
    email: "contact@dubois-maconnerie.fr",
    adresse: "123 Rue de la République, 69001 Lyon",
    description:
      "Entreprise spécialisée dans la maçonnerie traditionnelle et moderne avec plus de 20 ans d'expérience.",
    certifications: ["Qualibat RGE", "Assurance décennale"],
    documentsPublics: ["Attestation assurance", "Certificat Qualibat"],
  },
  {
    id: "2",
    nom: "Sophie Moreau",
    raisonSociale: "MOREAU PLOMBERIE",
    secteurs: ["Plomberie", "Chauffage"],
    specialites: ["Dépannage urgence", "Installation sanitaire", "Chauffage central"],
    ville: "Marseille",
    departement: "13 - Bouches-du-Rhône",
    region: "Provence-Alpes-Côte d'Azur",
    notemoyenne: 4.6,
    nombreAvis: 89,
    siret: "98765432109876",
    formeJuridique: "EURL",
    dateCreation: "2018-07-22",
    telephone: "04 91 23 45 67",
    email: "sophie@moreau-plomberie.fr",
    adresse: "456 Avenue du Prado, 13008 Marseille",
    description: "Plombier chauffagiste disponible 24h/24 pour tous vos dépannages et installations.",
    certifications: ["RGE QualiPAC", "Assurance RC Pro"],
    documentsPublics: ["Attestation assurance", "Certificat RGE"],
  },
  {
    id: "3",
    nom: "Pierre Leroy",
    raisonSociale: "LEROY ÉLECTRICITÉ",
    secteurs: ["Électricité", "Domotique"],
    specialites: ["Installation électrique", "Mise aux normes", "Domotique"],
    ville: "Toulouse",
    departement: "31 - Haute-Garonne",
    region: "Occitanie",
    notemoyenne: 4.9,
    nombreAvis: 156,
    siret: "11223344556677",
    formeJuridique: "SASU",
    dateCreation: "2012-11-08",
    telephone: "05 61 12 34 56",
    email: "pierre@leroy-electricite.fr",
    adresse: "789 Rue des Pyrénées, 31000 Toulouse",
    description: "Électricien qualifié spécialisé dans les installations modernes et la domotique.",
    certifications: ["Qualifélec", "Habilitation électrique"],
    documentsPublics: ["Attestation assurance", "Certificat Qualifélec"],
  },
]

const searchTerm = ref("")
const selectedSecteur = ref("all")
const selectedRegion = ref("all")
const selectedDepartement = ref("all")
const filteredPrestataires = ref<Prestataire[]>(mockPrestataires)
const selectedPrestataire = ref<Prestataire | null>(null)
const showCommDialog = ref(false)
const messageComm = ref("")
const demandes = ref<DemandeComm[]>([])
const showSuccess = ref(false)

const showMissionDialog = ref(false)
const selectedPrestataireForMission = ref<Prestataire | null>(null)
const missions = ref<IMission[]>([
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
  }
])
const showMissionSuccess = ref(false)

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
  let filtered = mockPrestataires

  if (searchTerm.value) {
    filtered = filtered.filter(
      (p) =>
        p.nom.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        p.raisonSociale.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        p.secteurs.some((s) => s.toLowerCase().includes(searchTerm.value.toLowerCase())) ||
        p.specialites.some((s) => s.toLowerCase().includes(searchTerm.value.toLowerCase())),
    )
  }

  if (selectedSecteur.value !== "all") {
    filtered = filtered.filter((p) => p.secteurs.includes(selectedSecteur.value))
  }

  if (selectedRegion.value !== "all") {
    filtered = filtered.filter((p) => p.region === selectedRegion.value)
  }

  if (selectedDepartement.value !== "all") {
    filtered = filtered.filter((p) => p.departement === selectedDepartement.value)
  }

  filteredPrestataires.value = filtered
}

const resetFilters = () => {
  searchTerm.value = ""
  selectedSecteur.value = "all"
  selectedRegion.value = "all"
  selectedDepartement.value = "all"
  filteredPrestataires.value = mockPrestataires
}

const envoyerDemandeComm = () => {
  if (!selectedPrestataire.value || !messageComm.value.trim()) return

  const nouvelleDemande: DemandeComm = {
    id: Date.now().toString(),
    prestataire: selectedPrestataire.value,
    message: messageComm.value,
    statut: DemandeCommStatut.EnAttente,
    dateEnvoi: new Date().toISOString(),
  }

  demandes.value.push(nouvelleDemande)
  messageComm.value = ""
  showCommDialog.value = false
  showSuccess.value = true
  setTimeout(() => (showSuccess.value = false), 3000)
}

const getStatutBadge = (statut: DemandeComm["statut"]) => {
  switch (statut) {
    case "en_attente":
      return `
        <Badge variant="secondary">
          <Clock class="w-3 h-3 mr-1" />
          En attente
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
    default:
      return ``
  }
}

const handleCreateMission = (missionData: IMission) => {
  missions.value.push(missionData)
  showMissionSuccess.value = true
  setTimeout(() => (showMissionSuccess.value = false), 5000)
}

const handleContactClick = (prestataire: Prestataire) => {
  selectedPrestataire.value = prestataire
  showCommDialog.value = true
}

const handleMissionClick = (prestataire: Prestataire) => {
  selectedPrestataireForMission.value = prestataire
  showMissionDialog.value = true
}

import placeholderImage from '@/assets/placeholder.svg'
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Dashboard Assureur</h1>
            <p class="text-gray-600">Recherchez et contactez des prestataires qualifiés</p>
          </div>
          <div class="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Bell class="w-4 h-4 mr-2" />
              Notifications
            </Button>
            <Avatar>
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>

    <!-- Success Alert -->
    <div v-if="showSuccess" class="mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <Alert class="bg-green-50 border-green-200">
        <CheckCircle class="h-4 w-4 text-green-600" />
        <AlertDescription class="text-green-800">
          Demande de communication envoyée avec succès ! Le prestataire sera notifié par email et sur son portail.
        </AlertDescription>
      </Alert>
    </div>

    <div v-if="showMissionSuccess" class="mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <Alert class="bg-green-50 border-green-200">
        <CheckCircle class="h-4 w-4 text-green-600" />
        <AlertDescription class="text-green-800">Mission créée et envoyée avec succès !</AlertDescription>
      </Alert>
    </div>

    <div class="mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Tabs default-value="recherche" class="space-y-6">
        <TabsList>
          <TabsTrigger value="recherche">Recherche Prestataires</TabsTrigger>
          <TabsTrigger value="demandes">Mes Demandes ({{ demandes.length }})</TabsTrigger>
          <TabsTrigger value="missions">Mes Missions ({{ missions.length }})</TabsTrigger>
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
                      placeholder="Nom, entreprise, spécialité..."
                      v-model="searchTerm"
                      class="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label>Secteur</Label>
                  <Select v-model="selectedSecteur">
                    <SelectTrigger>
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
                    <SelectTrigger>
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
                    <SelectTrigger>
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
                  <Button @click="applyFilters" class="flex-1">
                    Rechercher
                  </Button>
                  <Button variant="outline" @click="resetFilters">
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Résultats -->
          <div>
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-semibold">{{ filteredPrestataires.length }} prestataire(s) trouvé(s)</h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card v-for="prestataire in filteredPrestataires" :key="prestataire.id" class="hover:shadow-lg transition-shadow">
                <CardHeader class="pb-3">
                  <div class="flex items-start justify-between">
                    <div class="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage :src="prestataire.avatar || placeholderImage" />
                        <AvatarFallback>
                          {{ prestataire.nom.split(' ').map((n) => n[0]).join('') }}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle class="text-lg">{{ prestataire.nom }}</CardTitle>
                        <CardDescription class="text-sm">{{ prestataire.raisonSociale }}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent class="space-y-3">
                  <div class="flex items-center space-x-2">
                    <MapPin class="w-4 h-4 text-gray-500" />
                    <span class="text-sm text-gray-600">{{ prestataire.ville }}</span>
                  </div>

                  <div class="flex items-center space-x-2">
                    <Star class="w-4 h-4 text-yellow-500 fill-current" />
                    <span class="text-sm font-medium">{{ prestataire.notemoyenne }}</span>
                    <span class="text-sm text-gray-500">({{ prestataire.nombreAvis }} avis)</span>
                  </div>

                  <div class="flex flex-wrap gap-1">
                    <Badge v-for="secteur in prestataire.secteurs.slice(0, 2)" :key="secteur" variant="secondary" class="text-xs">
                      {{ secteur }}
                    </Badge>
                    <Badge v-if="prestataire.secteurs.length > 2" variant="outline" class="text-xs">
                      +{{ prestataire.secteurs.length - 2 }}
                    </Badge>
                  </div>

                  <div class="flex space-x-2 pt-2">
                    <Dialog>
                      <DialogTrigger as-child>
                        <Button variant="outline" size="sm" class="flex-1 bg-transparent">
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
                                {{ prestataire.nom.split(' ').map((n) => n[0]).join('') }}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 class="text-xl font-bold">{{ prestataire.nom }}</h3>
                              <p class="text-gray-600">{{ prestataire.raisonSociale }}</p>
                            </div>
                          </DialogTitle>
                        </DialogHeader>

                        <div class="space-y-6">
                          <!-- Informations générales -->
                          <div>
                            <h4 class="font-semibold mb-3">Informations générales</h4>
                            <div class="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span class="text-gray-500">SIRET:</span>
                                <p>{{ prestataire.siret }}</p>
                              </div>
                              <div>
                                <span class="text-gray-500">Forme juridique:</span>
                                <p>{{ prestataire.formeJuridique }}</p>
                              </div>
                              <div>
                                <span class="text-gray-500">Création:</span>
                                <p>{{ new Date(prestataire.dateCreation).toLocaleDateString() }}</p>
                              </div>
                              <div>
                                <span class="text-gray-500">Localisation:</span>
                                <p>
                                  {{ prestataire.ville }}, {{ prestataire.departement }}
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
                                <span>{{ prestataire.telephone }}</span>
                              </div>
                              <div class="flex items-center space-x-2">
                                <Mail class="w-4 h-4 text-gray-500" />
                                <span>{{ prestataire.email }}</span>
                              </div>
                              <div class="flex items-center space-x-2">
                                <Building class="w-4 h-4 text-gray-500" />
                                <span>{{ prestataire.adresse }}</span>
                              </div>
                            </div>
                          </div>

                          <!-- Spécialités -->
                          <div>
                            <h4 class="font-semibold mb-3">Secteurs et spécialités</h4>
                            <div class="space-y-2">
                              <div>
                                <span class="text-sm text-gray-500">Secteurs:</span>
                                <div class="flex flex-wrap gap-1 mt-1">
                                  <Badge v-for="secteur in prestataire.secteurs" :key="secteur" variant="default">
                                    {{ secteur }}
                                  </Badge>
                                </div>
                              </div>
                              <div>
                                <span class="text-sm text-gray-500">Spécialités:</span>
                                <div class="flex flex-wrap gap-1 mt-1">
                                  <Badge v-for="specialite in prestataire.specialites" :key="specialite" variant="secondary">
                                    {{ specialite }}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>

                          <!-- Description -->
                          <div>
                            <h4 class="font-semibold mb-3">Description</h4>
                            <p class="text-sm text-gray-700">{{ prestataire.description }}</p>
                          </div>

                          <!-- Certifications -->
                          <div>
                            <h4 class="font-semibold mb-3">Certifications</h4>
                            <div class="flex flex-wrap gap-2">
                              <Badge v-for="cert in prestataire.certifications" :key="cert" variant="outline" class="bg-green-50 text-green-700">
                                <CheckCircle class="w-3 h-3 mr-1" />
                                {{ cert }}
                              </Badge>
                            </div>
                          </div>

                          <!-- Documents publics -->
                          <div>
                            <h4 class="font-semibold mb-3">Documents publics</h4>
                            <div class="space-y-2">
                              <div v-for="doc in prestataire.documentsPublics" :key="doc" class="flex items-center space-x-2">
                                <FileText class="w-4 h-4 text-gray-500" />
                                <span class="text-sm">{{ doc }}</span>
                                <Button variant="ghost" size="sm">
                                  Télécharger
                                </Button>
                              </div>
                            </div>
                          </div>

                          <!-- Évaluations -->
                          <div>
                            <h4 class="font-semibold mb-3">Évaluations</h4>
                            <div class="flex items-center space-x-4">
                              <div class="flex items-center space-x-2">
                                <Star class="w-5 h-5 text-yellow-500 fill-current" />
                                <span class="text-lg font-semibold">{{ prestataire.notemoyenne }}</span>
                                <span class="text-gray-500">/ 5</span>
                              </div>
                              <span class="text-sm text-gray-500">
                                Basé sur {{ prestataire.nombreAvis }} avis clients
                              </span>
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
                      </div>
                    </div>
                    <div class="text-right">
                      <div v-html="getStatutBadge(demande.statut)"></div>
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
          <DialogDescription>Envoyez une demande de contact à {{ selectedPrestataire?.nom }}</DialogDescription>
        </DialogHeader>

        <div v-if="selectedPrestataire" class="space-y-4">
          <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Avatar>
              <AvatarFallback>
                {{ selectedPrestataire.nom.split(' ').map((n) => n[0]).join('') }}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 class="font-semibold">{{ selectedPrestataire.nom }}</h4>
              <p class="text-sm text-gray-600">{{ selectedPrestataire.raisonSociale }}</p>
              <p class="text-sm text-gray-500">{{ selectedPrestataire.ville }}</p>
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

    <!-- Dialog Création de mission -->
    <MissionCreationDialog
      :open="showMissionDialog"
      :prestataire="selectedPrestataireForMission"
      @update:open="showMissionDialog = $event"
      @createMission="handleCreateMission"
    />
  </div>
</template>