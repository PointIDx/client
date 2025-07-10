<script setup lang="ts">
import { ref, reactive, computed, type Component } from 'vue'
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

import type { PrestataireAssureur } from '@/interfaces/prestataire-assureur'
import type { DemandeCommAssureur } from '@/interfaces/demande-comm-assureur'
import type { MissionAssureur } from '@/interfaces/mission-assureur'
import { DemandeCommStatut } from '@/enums/demande-comm-statut'
import { UrgenceSinistre } from '@/enums/urgence-sinistre'
import { MissionStatutAssureur } from '@/enums/mission-statut-assureur'

const mockPrestataires: PrestataireAssureur[] = [
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
const filteredPrestataires = ref<PrestataireAssureur[]>(mockPrestataires)
const selectedPrestataire = ref<PrestataireAssureur | null>(null)
const showCommDialog = ref(false)
const messageComm = ref("")
const demandes = ref<DemandeCommAssureur[]>([])
const showSuccess = ref(false)

const showMissionDialog = ref(false)
const selectedPrestataireForMission = ref<PrestataireAssureur | null>(null)
const missions = ref<MissionAssureur[]>([])
const showMissionSuccess = ref(false)

const missionForm = reactive({
  client: {
    civilite: "",
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
    adresse: "",
    codePostal: "",
    ville: "",
  },
  chantier: {
    adresse: "",
    codePostal: "",
    ville: "",
    typeAcces: "",
    etage: "",
    contraintes: "",
  },
  sinistre: {
    type: "",
    description: "",
    urgence: UrgenceSinistre.Moyenne,
    dateSinistre: "",
    dateIntervention: "",
  },
  mission: {
    titre: "",
    description: "",
    budgetEstime: "",
    delaiSouhaite: "",
    horaires: "",
    materiaux: "",
    normes: "",
  },
  documents: [] as File[],
})

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

const typesSinistre = [
  "Dégât des eaux",
  "Incendie",
  "Fissures",
  "Infiltration",
  "Bris de glace",
  "Cambriolage",
  "Tempête",
  "Autre",
]

const typesAcces = [
  "Libre",
  "Clés chez gardien",
  "Clés chez voisin",
  "Rendez-vous obligatoire",
  "Code d'accès",
  "Autre",
]

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

  const nouvelleDemande: DemandeCommAssureur = {
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

type StatutBadge = {
  text: string;
  variant: "default" | "destructive" | "outline" | "secondary";
  icon: Component;
}


const getStatutBadge = (statut: DemandeCommStatut): StatutBadge => {
  switch (statut) {
    case DemandeCommStatut.EnAttente:
      return {
        text: "En attente",
        variant: "secondary" as const,
        icon: Clock,
      };
    case DemandeCommStatut.Acceptee:
      return {
        text: "Acceptée",
        variant: "default" as const,
        icon: CheckCircle,
      };
    case DemandeCommStatut.Refusee:
      return {
        text: "Refusée",
        variant: "destructive" as const,
        icon: XCircle,
      };
    default:
      // Exhaustive check - this should never happen if DemandeCommStatut is properly typed
      throw new Error(`Unknown statut: ${statut}`);
  }
}


const creerMission = () => {
  if (!selectedPrestataireForMission.value) return

  const nouvelleMission: MissionAssureur = {
    id: Date.now().toString(),
    prestataire: selectedPrestataireForMission.value,
    client: missionForm.client,
    chantier: missionForm.chantier,
    sinistre: missionForm.sinistre,
    mission: missionForm.mission,
    documents: missionForm.documents,
    statut: MissionStatutAssureur.Envoyee,
    dateCreation: new Date().toISOString(),
    numeroMission: `M${Date.now().toString().slice(-6)}`,
  }

  missions.value.push(nouvelleMission)

  // Reset du formulaire
  Object.assign(missionForm, {
    client: { civilite: "", nom: "", prenom: "", telephone: "", email: "", adresse: "", codePostal: "", ville: "" },
    chantier: { adresse: "", codePostal: "", ville: "", typeAcces: "", etage: "", contraintes: "" },
    sinistre: { type: "", description: "", urgence: UrgenceSinistre.Moyenne, dateSinistre: "", dateIntervention: "" },
    mission: {
      titre: "",
      description: "",
      budgetEstime: "",
      delaiSouhaite: "",
      horaires: "",
      materiaux: "",
      normes: "",
    },
    documents: [],
  })

  showMissionDialog.value = false
  showMissionSuccess.value = true
  setTimeout(() => (showMissionSuccess.value = false), 5000)
}

const validateMissionForm = computed(() => {
  return (
    missionForm.client.nom &&
    missionForm.client.prenom &&
    missionForm.client.telephone &&
    missionForm.chantier.adresse &&
    missionForm.sinistre.type &&
    missionForm.sinistre.description &&
    missionForm.mission.titre &&
    missionForm.mission.description
  )
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
    <div v-if="showSuccess" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <Alert class="bg-green-50 border-green-200">
        <CheckCircle class="h-4 w-4 text-green-600" />
        <AlertDescription class="text-green-800">
          Demande de communication envoyée avec succès ! Le prestataire sera notifié par email et sur son portail.
        </AlertDescription>
      </Alert>
    </div>

    <div v-if="showMissionSuccess" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <Alert class="bg-green-50 border-green-200">
        <CheckCircle class="h-4 w-4 text-green-600" />
        <AlertDescription class="text-green-800">Mission créée et envoyée avec succès !</AlertDescription>
      </Alert>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                        <AvatarImage :src="prestataire.avatar || '/placeholder.svg'" />
                        <AvatarFallback>
                          {{ prestataire.nom
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                          }}
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
                      <DialogContent class="bg-white max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle class="flex items-center space-x-3">
                            <Avatar class="w-12 h-12">
                              <AvatarImage :src="prestataire.avatar || '/placeholder.svg'" />
                              <AvatarFallback>
                                {{ prestataire.nom
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                }}
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
                      @click="() => { selectedPrestataire = prestataire; showCommDialog = true; }"
                    >
                      <MessageCircle class="w-4 h-4 mr-1" />
                      Contacter
                    </Button>

                    <!-- Nouveau bouton pour créer une mission -->
                    <Button
                      size="sm"
                      variant="default"
                      @click="() => { selectedPrestataireForMission = prestataire; showMissionDialog = true; }"
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
                          {{ demande.prestataire.nom
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                          }}
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
                      <Badge :variant="getStatutBadge(demande.statut)?.variant">
                        <component :is="getStatutBadge(demande.statut)?.icon" class="w-3 h-3 mr-1" />
                        {{ getStatutBadge(demande.statut)?.text }}
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
          <Card>
            <CardHeader>
              <CardTitle>Mes missions</CardTitle>
              <CardDescription>Suivez l'état de vos missions</CardDescription>
            </CardHeader>
            <CardContent>
              <div v-if="missions.length === 0" class="text-center py-8 text-gray-500">
                <FileText class="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune mission créée</p>
                <p class="text-sm">Recherchez des prestataires et créez une mission pour commencer</p>
              </div>
              <div v-else class="space-y-4">
                <div v-for="mission in missions" :key="mission.id" class="border rounded-lg p-4">
                  <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {{ mission.prestataire.nom
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                          }}
                        </AvatarFallback>
                      </Avatar>
                      <div class="flex-1">
                        <h4 class="font-semibold">{{ mission.prestataire.nom }}</h4>
                        <p class="text-sm text-gray-600">{{ mission.prestataire.raisonSociale }}</p>
                        <p class="text-sm text-gray-500 mt-1">
                          Créée le {{ new Date(mission.dateCreation).toLocaleDateString() }}
                        </p>
                        <div class="mt-2">
                          <p class="text-sm">
                            <strong>Titre:</strong> {{ mission.mission.titre }}
                          </p>
                          <p class="text-sm">
                            <strong>Description:</strong> {{ mission.mission.description }}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div class="text-right">
                      <Badge variant="secondary">{{ mission.statut }}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
                {{ selectedPrestataire.nom
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                }}
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
    <Dialog :open="showMissionDialog" @update:open="showMissionDialog = $event">
      <DialogContent class="bg-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Création de mission</DialogTitle>
          <DialogDescription>
            Remplissez les informations pour créer une mission pour {{ selectedPrestataireForMission?.nom }}
          </DialogDescription>
        </DialogHeader>

        <div v-if="selectedPrestataireForMission" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Colonne gauche : Informations client et chantier -->
          <div class="space-y-6">
            <!-- Informations client -->
            <div>
              <h4 class="font-semibold mb-3">Informations client</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label for="civilite">Civilité</Label>
                  <Select
                    v-model="missionForm.client.civilite"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Civilité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M.">M.</SelectItem>
                      <SelectItem value="Mme">Mme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label for="nom">Nom *</Label>
                  <Input
                    id="nom"
                    v-model="missionForm.client.nom"
                  />
                </div>
                <div>
                  <Label for="prenom">Prénom *</Label>
                  <Input
                    id="prenom"
                    v-model="missionForm.client.prenom"
                  />
                </div>
                <div>
                  <Label for="telephone">Téléphone *</Label>
                  <Input
                    id="telephone"
                    type="tel"
                    v-model="missionForm.client.telephone"
                  />
                </div>
                <div>
                  <Label for="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    v-model="missionForm.client.email"
                  />
                </div>
                <div class="md:col-span-2">
                  <Label for="adresse">Adresse</Label>
                  <Input
                    id="adresse"
                    v-model="missionForm.client.adresse"
                  />
                </div>
                <div>
                  <Label for="codePostal">Code postal</Label>
                  <Input
                    id="codePostal"
                    v-model="missionForm.client.codePostal"
                  />
                </div>
                <div>
                  <Label for="ville">Ville</Label>
                  <Input
                    id="ville"
                    v-model="missionForm.client.ville"
                  />
                </div>
              </div>
            </div>

            <!-- Informations chantier -->
            <div>
              <h4 class="font-semibold mb-3">Informations chantier</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                  <Label for="adresseChantier">Adresse *</Label>
                  <Input
                    id="adresseChantier"
                    v-model="missionForm.chantier.adresse"
                  />
                </div>
                <div>
                  <Label for="codePostalChantier">Code postal</Label>
                  <Input
                    id="codePostalChantier"
                    v-model="missionForm.chantier.codePostal"
                  />
                </div>
                <div>
                  <Label for="villeChantier">Ville</Label>
                  <Input
                    id="villeChantier"
                    v-model="missionForm.chantier.ville"
                  />
                </div>
                <div>
                  <Label for="typeAcces">Type d'accès</Label>
                  <Select
                    v-model="missionForm.chantier.typeAcces"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Type d'accès" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="type in typesAcces" :key="type" :value="type">
                        {{ type }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label for="etage">Étage</Label>
                  <Input
                    id="etage"
                    v-model="missionForm.chantier.etage"
                  />
                </div>
                <div class="md:col-span-2">
                  <Label for="contraintes">Contraintes d'accès</Label>
                  <Textarea
                    id="contraintes"
                    v-model="missionForm.chantier.contraintes"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Colonne droite : Informations sinistre et mission -->
          <div class="space-y-6">
            <!-- Informations sinistre -->
            <div>
              <h4 class="font-semibold mb-3">Informations sinistre</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                  <Label for="typeSinistre">Type de sinistre *</Label>
                  <Select
                    v-model="missionForm.sinistre.type"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Type de sinistre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="type in typesSinistre" :key="type" :value="type">
                        {{ type }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div class="md:col-span-2">
                  <Label for="descriptionSinistre">Description du sinistre *</Label>
                  <Textarea
                    id="descriptionSinistre"
                    v-model="missionForm.sinistre.description"
                  />
                </div>
                <div>
                  <Label>Urgence</Label>
                  <RadioGroup
                    v-model="missionForm.sinistre.urgence"
                  >
                    <div class="flex items-center space-x-2">
                      <RadioGroupItem value="faible" id="r1" />
                      <Label for="r1">Faible</Label>
                    </div>
                    <div class="flex items-center space-x-2">
                      <RadioGroupItem value="moyenne" id="r2" />
                      <Label for="r2">Moyenne</Label>
                    </div>
                    <div class="flex items-center space-x-2">
                      <RadioGroupItem value="elevee" id="r3" />
                      <Label for="r3">Élevée</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label for="dateSinistre">Date du sinistre</Label>
                  <Input
                    id="dateSinistre"
                    type="date"
                    v-model="missionForm.sinistre.dateSinistre"
                  />
                </div>
                <div>
                  <Label for="dateIntervention">Date souhaitée d'intervention</Label>
                  <Input
                    id="dateIntervention"
                    type="date"
                    v-model="missionForm.sinistre.dateIntervention"
                  />
                </div>
              </div>
            </div>

            <!-- Informations mission -->
            <div>
              <h4 class="font-semibold mb-3">Informations mission</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                  <Label for="titreMission">Titre de la mission *</Label>
                  <Input
                    id="titreMission"
                    v-model="missionForm.mission.titre"
                  />
                </div>
                <div class="md:col-span-2">
                  <Label for="descriptionMission">Description de la mission *</Label>
                  <Textarea
                    id="descriptionMission"
                    v-model="missionForm.mission.description"
                  />
                </div>
                <div>
                  <Label for="budgetEstime">Budget estimé</Label>
                  <Input
                    id="budgetEstime"
                    v-model="missionForm.mission.budgetEstime"
                  />
                </div>
                <div>
                  <Label for="delaiSouhaite">Délai souhaité</Label>
                  <Input
                    id="delaiSouhaite"
                    v-model="missionForm.mission.delaiSouhaite"
                  />
                </div>
                <div>
                  <Label for="horaires">Horaires</Label>
                  <Input
                    id="horaires"
                    v-model="missionForm.mission.horaires"
                  />
                </div>
                <div>
                  <Label for="materiaux">Matériaux</Label>
                  <Input
                    id="materiaux"
                    v-model="missionForm.mission.materiaux"
                  />
                </div>
                <div class="md:col-span-2">
                  <Label for="normes">Normes</Label>
                  <Input
                    id="normes"
                    v-model="missionForm.mission.normes"
                  />
                </div>
              </div>
            </div>

            <!-- Documents -->
            <div>
              <h4 class="font-semibold mb-3">Documents</h4>
              <Input type="file" multiple />
            </div>

            <div class="flex justify-end space-x-2 col-span-2">
              <Button variant="outline" @click="showMissionDialog = false">
                Annuler
              </Button>
              <Button @click="creerMission" :disabled="!validateMissionForm">
                Créer la mission
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
