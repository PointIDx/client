<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { User, MapPin, AlertTriangle, Briefcase, Upload, FileText, Send, CheckCircle, Euro, Phone, Home } from 'lucide-vue-next'

interface Prestataire {
  id: string
  nom: string
  raisonSociale: string
  secteurs: string[]
  ville: string
  telephone: string
  email: string
}

const props = defineProps<{
  open: boolean
  prestataire: Prestataire | null
}>()

const emit = defineEmits(['update:open', 'createMission'])

const currentTab = ref('client')
const formData = reactive({
  client: {
    civilite: '',
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    adresse: '',
    codePostal: '',
    ville: '',
  },
  chantier: {
    adresse: '',
    codePostal: '',
    ville: '',
    typeAcces: '',
    etage: '',
    contraintes: '',
    memeAdresseClient: false,
  },
  sinistre: {
    type: '',
    description: '',
    urgence: 'moyenne',
    dateSinistre: '',
    dateIntervention: '',
    numeroSinistre: '',
  },
  mission: {
    titre: '',
    description: '',
    budgetEstime: '',
    delaiSouhaite: '',
    horaires: '',
    materiaux: '',
    normes: '',
    conditionsParticulieres: '',
  },
  documents: [] as File[],
  notifications: {
    emailClient: true,
    smsClient: false,
    creerAccesClient: true,
  },
})

const typesSinistre = [
  'Dégât des eaux',
  'Incendie',
  'Fissures',
  'Infiltration',
  'Bris de glace',
  'Cambriolage',
  'Tempête',
  'Rénovation',
  'Autre',
]

const typesAcces = [
  'Libre',
  'Clés chez gardien',
  'Clés chez voisin',
  'Rendez-vous obligatoire',
  'Code d\'accès',
  'Autre',
]

const niveauxUrgence = [
  { value: 'faible', label: 'Faible', color: 'bg-green-100 text-green-800' },
  { value: 'moyenne', label: 'Moyenne', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'elevee', label: 'Élevée', color: 'bg-red-100 text-red-800' },
]

const updateFormData = (section: keyof typeof formData, field: string, value: any) => {
  (formData[section] as any)[field] = value
}

const copyClientAddress = () => {
  if (formData.chantier.memeAdresseClient) {
    updateFormData('chantier', 'adresse', formData.client.adresse)
    updateFormData('chantier', 'codePostal', formData.client.codePostal)
    updateFormData('chantier', 'ville', formData.client.ville)
  } else {
    updateFormData('chantier', 'adresse', '')
    updateFormData('chantier', 'codePostal', '')
    updateFormData('chantier', 'ville', '')
  }
}

const handleFileUpload = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (files) {
    const newFiles = Array.from(files)
    formData.documents = [...formData.documents, ...newFiles]
  }
}

const removeDocument = (index: number) => {
  formData.documents = formData.documents.filter((_, i) => i !== index)
}

const validateCurrentTab = computed(() => {
  switch (currentTab.value) {
    case 'client':
      return formData.client.nom && formData.client.prenom && formData.client.telephone
    case 'chantier':
      return formData.chantier.adresse && formData.chantier.codePostal && formData.chantier.ville
    case 'sinistre':
      return formData.sinistre.type && formData.sinistre.description
    case 'mission':
      return formData.mission.titre && formData.mission.description
    default:
      return true
  }
})

const resetForm = () => {
  Object.assign(formData, {
    client: { civilite: '', nom: '', prenom: '', telephone: '', email: '', adresse: '', codePostal: '', ville: '' },
    chantier: {
      adresse: '',
      codePostal: '',
      ville: '',
      typeAcces: '',
      etage: '',
      contraintes: '',
      memeAdresseClient: false,
    },
    sinistre: {
      type: '',
      description: '',
      urgence: 'moyenne',
      dateSinistre: '',
      dateIntervention: '',
      numeroSinistre: '',
    },
    mission: {
      titre: '',
      description: '',
      budgetEstime: '',
      delaiSouhaite: '',
      horaires: '',
      materiaux: '',
      normes: '',
      conditionsParticulieres: '',
    },
    documents: [],
    notifications: { emailClient: true, smsClient: false, creerAccesClient: true },
  })
  currentTab.value = 'client'
}

const handleSubmit = () => {
  if (!props.prestataire) return

  const missionData = {
    ...formData,
    prestataire: props.prestataire,
    numeroMission: `M${Date.now().toString().slice(-6)}`,
    dateCreation: new Date().toISOString(),
    statut: 'envoyee',
  }

  emit('createMission', missionData)
  emit('update:open', false)
  resetForm()
}

const onOpenChange = (open: boolean) => {
  emit('update:open', open)
  if (!open) {
    resetForm()
  }
}

const tabs = ['client', 'chantier', 'sinistre', 'mission', 'validation']

const goToPreviousTab = () => {
  const currentIndex = tabs.indexOf(currentTab.value)
  if (currentIndex > 0) {
    currentTab.value = tabs[currentIndex - 1]
  }
}

const goToNextTab = () => {
  const currentIndex = tabs.indexOf(currentTab.value)
  if (currentIndex < tabs.length - 1) {
    currentTab.value = tabs[currentIndex + 1]
  }
}
</script>

<template>
  <Dialog :open="props.open" @update:open="onOpenChange">
    <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto bg-white" data-testid="mission-creation-dialog">
      <DialogHeader>
        <DialogTitle class="flex items-center space-x-3">
          <Briefcase class="w-6 h-6" />
          <span>Créer une mission</span>
        </DialogTitle>
        <DialogDescription>
          Créez une nouvelle mission pour
          <strong>
            {{ props.prestataire?.nom }} - {{ props.prestataire?.raisonSociale }}
          </strong>
        </DialogDescription>
      </DialogHeader>

      <!-- Prestataire sélectionné -->
      <Card v-if="props.prestataire" class="bg-blue-50 border-blue-200" data-testid="prestataire-selected-card">
        <CardContent class="p-4">
          <div class="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback>
                {{ props.prestataire.nom.split(' ').map((n) => n[0]).join('') }}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 class="font-semibold">{{ props.prestataire.nom }}</h4>
              <p class="text-sm text-gray-600">{{ props.prestataire.raisonSociale }}</p>
              <div class="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                <span class="flex items-center">
                  <MapPin class="w-3 h-3 mr-1" />
                  {{ props.prestataire.ville }}
                </span>
                <span class="flex items-center">
                  <Phone class="w-3 h-3 mr-1" />
                  {{ props.prestataire.telephone }}
                </span>
              </div>
              <div class="flex flex-wrap gap-1 mt-2">
                <Badge
                  v-for="secteur in props.prestataire.secteurs"
                  :key="secteur"
                  variant="secondary"
                  class="text-xs"
                >
                  {{ secteur }}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs v-model:model-value="currentTab" class="space-y-4">
        <TabsList class="grid w-full grid-cols-5">
          <TabsTrigger value="client" class="flex items-center space-x-1" data-testid="tab-client">
            <User class="w-4 h-4" />
            <span>Client</span>
          </TabsTrigger>
          <TabsTrigger value="chantier" class="flex items-center space-x-1" data-testid="tab-chantier">
            <Home class="w-4 h-4" />
            <span>Chantier</span>
          </TabsTrigger>
          <TabsTrigger value="sinistre" class="flex items-center space-x-1" data-testid="tab-sinistre">
            <AlertTriangle class="w-4 h-4" />
            <span>Sinistre</span>
          </TabsTrigger>
          <TabsTrigger value="mission" class="flex items-center space-x-1" data-testid="tab-mission">
            <Briefcase class="w-4 h-4" />
            <span>Mission</span>
          </TabsTrigger>
          <TabsTrigger value="validation" class="flex items-center space-x-1" data-testid="tab-validation">
            <CheckCircle class="w-4 h-4" />
            <span>Validation</span>
          </TabsTrigger>
        </TabsList>

        <!-- Onglet Client -->
        <TabsContent value="client" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle class="text-lg">Informations client</CardTitle>
              <CardDescription>Renseignez les coordonnées du client bénéficiaire</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label for="civilite">Civilité *</Label>
                  <Select
                    v-model="formData.client.civilite"
                    data-testid="client-civilite-select"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Monsieur</SelectItem>
                      <SelectItem value="Mme">Madame</SelectItem>
                      <SelectItem value="Mlle">Mademoiselle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label for="nom">Nom *</Label>
                  <Input
                    id="nom"
                    v-model="formData.client.nom"
                    placeholder="Nom de famille"
                    data-testid="client-nom-input"
                  />
                </div>

                <div>
                  <Label for="prenom">Prénom *</Label>
                  <Input
                    id="prenom"
                    v-model="formData.client.prenom"
                    placeholder="Prénom"
                    data-testid="client-prenom-input"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label for="telephone">Téléphone *</Label>
                  <Input
                    id="telephone"
                    type="tel"
                    v-model="formData.client.telephone"
                    placeholder="06 12 34 56 78"
                    data-testid="client-telephone-input"
                  />
                </div>

                <div>
                  <Label for="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    v-model="formData.client.email"
                    placeholder="client@email.com"
                    data-testid="client-email-input"
                  />
                </div>
              </div>

              <div>
                <Label for="adresseClient">Adresse du client</Label>
                <Input
                  id="adresseClient"
                  v-model="formData.client.adresse"
                  placeholder="Adresse complète"
                  data-testid="client-adresse-input"
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label for="codePostalClient">Code postal</Label>
                  <Input
                    id="codePostalClient"
                    v-model="formData.client.codePostal"
                    placeholder="75001"
                    data-testid="client-codepostal-input"
                  />
                </div>

                <div>
                  <Label for="villeClient">Ville</Label>
                  <Input
                    id="villeClient"
                    v-model="formData.client.ville"
                    placeholder="Paris"
                    data-testid="client-ville-input"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- Onglet Chantier -->
        <TabsContent value="chantier" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle class="text-lg">Lieu d'intervention</CardTitle>
              <CardDescription>Précisez l'adresse et les conditions d'accès au chantier</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="flex items-center space-x-2">
                <Checkbox
                  id="memeAdresse"
                  v-model:checked="formData.chantier.memeAdresseClient"
                  @update:checked="copyClientAddress"
                  data-testid="chantier-meme-adresse-checkbox"
                />
                <Label for="memeAdresse">Même adresse que le client</Label>
              </div>

              <div>
                <Label for="adresseChantier">Adresse du chantier *</Label>
                <Input
                  id="adresseChantier"
                  v-model="formData.chantier.adresse"
                  placeholder="Adresse complète du lieu d'intervention"
                  :disabled="formData.chantier.memeAdresseClient"
                  data-testid="chantier-adresse-input"
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label for="codePostalChantier">Code postal *</Label>
                  <Input
                    id="codePostalChantier"
                    v-model="formData.chantier.codePostal"
                    placeholder="75001"
                    :disabled="formData.chantier.memeAdresseClient"
                    data-testid="chantier-codepostal-input"
                  />
                </div>

                <div>
                  <Label for="villeChantier">Ville *</Label>
                  <Input
                    id="villeChantier"
                    v-model="formData.chantier.ville"
                    placeholder="Paris"
                    :disabled="formData.chantier.memeAdresseClient"
                    data-testid="chantier-ville-input"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label for="typeAcces">Type d'accès</Label>
                  <Select
                    v-model="formData.chantier.typeAcces"
                    data-testid="chantier-typeacces-select"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez" />
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
                    v-model="formData.chantier.etage"
                    placeholder="RDC, 1er, 2ème..."
                    data-testid="chantier-etage-input"
                  />
                </div>
              </div>

              <div>
                <Label for="contraintes">Contraintes d'accès</Label>
                <Textarea
                  id="contraintes"
                  v-model="formData.chantier.contraintes"
                  placeholder="Précisez les contraintes particulières (horaires, parking, ascenseur...)"
                  rows="3"
                  data-testid="chantier-contraintes-textarea"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- Onglet Sinistre -->
        <TabsContent value="sinistre" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle class="text-lg">Détails du sinistre</CardTitle>
              <CardDescription>Décrivez le sinistre et les travaux à réaliser</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label for="typeSinistre">Type de sinistre *</Label>
                  <Select
                    v-model="formData.sinistre.type"
                    data-testid="sinistre-type-select"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="type in typesSinistre" :key="type" :value="type">
                        {{ type }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label for="numeroSinistre">N° de sinistre</Label>
                  <Input
                    id="numeroSinistre"
                    v-model="formData.sinistre.numeroSinistre"
                    placeholder="Numéro de dossier sinistre"
                    data-testid="sinistre-numero-input"
                  />
                </div>
              </div>

              <div>
                <Label>Niveau d'urgence *</Label>
                <RadioGroup
                  v-model="formData.sinistre.urgence"
                  class="flex space-x-6 mt-2"
                  data-testid="sinistre-urgence-radiogroup"
                >
                  <div v-for="niveau in niveauxUrgence" :key="niveau.value" class="flex items-center space-x-2">
                    <RadioGroupItem :value="niveau.value" :id="niveau.value" />
                    <Label :for="niveau.value" :class="`px-2 py-1 rounded text-sm ${niveau.color}`">
                      {{ niveau.label }}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label for="dateSinistre">Date du sinistre</Label>
                  <Input
                    id="dateSinistre"
                    type="date"
                    v-model="formData.sinistre.dateSinistre"
                    data-testid="sinistre-date-input"
                  />
                </div>

                <div>
                  <Label for="dateIntervention">Date d'intervention souhaitée</Label>
                  <Input
                    id="dateIntervention"
                    type="date"
                    v-model="formData.sinistre.dateIntervention"
                    data-testid="sinistre-date-intervention-input"
                  />
                </div>
              </div>

              <div>
                <Label for="descriptionSinistre">Description détaillée *</Label>
                <Textarea
                  id="descriptionSinistre"
                  v-model="formData.sinistre.description"
                  placeholder="Décrivez précisément les dégâts constatés et les travaux à réaliser..."
                  rows="4"
                  data-testid="sinistre-description-textarea"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- Onglet Mission -->
        <TabsContent value="mission" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle class="text-lg">Détails de la mission</CardTitle>
              <CardDescription>Précisez les modalités d'exécution de la mission</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div>
                <Label for="titreMission">Titre de la mission *</Label>
                <Input
                  id="titreMission"
                  v-model="formData.mission.titre"
                  placeholder="Ex: Réparation dégât des eaux - Salle de bain"
                  data-testid="mission-titre-input"
                />
              </div>

              <div>
                <Label for="descriptionMission">Description de la mission *</Label>
                <Textarea
                  id="descriptionMission"
                  v-model="formData.mission.description"
                  placeholder="Décrivez précisément les travaux à réaliser, les prestations attendues..."
                  rows="4"
                  data-testid="mission-description-textarea"
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label for="budgetEstime">Budget estimé</Label>
                  <div class="relative">
                    <Euro class="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="budgetEstime"
                      v-model="formData.mission.budgetEstime"
                      placeholder="Montant estimé"
                      class="pl-10"
                      data-testid="mission-budget-input"
                    />
                  </div>
                </div>

                <div>
                  <Label for="delaiSouhaite">Délai souhaité</Label>
                  <Input
                    id="delaiSouhaite"
                    v-model="formData.mission.delaiSouhaite"
                    placeholder="Ex: 2 semaines, 1 mois..."
                    data-testid="mission-delai-input"
                  />
                </div>
              </div>

              <div>
                <Label for="horaires">Horaires d'intervention</Label>
                <Input
                  id="horaires"
                  v-model="formData.mission.horaires"
                  placeholder="Ex: 8h-17h du lundi au vendredi"
                  data-testid="mission-horaires-input"
                />
              </div>

              <div>
                <Label for="materiaux">Matériaux et fournitures</Label>
                <Textarea
                  id="materiaux"
                  v-model="formData.mission.materiaux"
                  placeholder="Précisez si les matériaux sont fournis par le client, le prestataire, ou autres modalités..."
                  rows="2"
                  data-testid="mission-materiaux-textarea"
                />
              </div>

              <div>
                <Label for="normes">Normes et réglementations</Label>
                <Textarea
                  id="normes"
                  v-model="formData.mission.normes"
                  placeholder="Normes techniques à respecter, réglementations particulières..."
                  rows="2"
                  data-testid="mission-normes-textarea"
                />
              </div>

              <div>
                <Label for="conditionsParticulieres">Conditions particulières</Label>
                <Textarea
                  id="conditionsParticulieres"
                  v-model="formData.mission.conditionsParticulieres"
                  placeholder="Autres conditions ou remarques importantes..."
                  rows="2"
                  data-testid="mission-conditions-textarea"
                />
              </div>

              <!-- Upload de documents -->
              <div>
                <Label>Documents joints</Label>
                <div class="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload class="mx-auto h-8 w-8 text-gray-400" />
                  <div class="mt-2">
                    <label for="documents" class="cursor-pointer">
                      <span class="text-sm font-medium text-gray-900">Cliquez pour ajouter des documents</span>
                      <span class="block text-xs text-gray-500 mt-1">
                        Photos, rapports, devis... (PDF, JPG, PNG)
                      </span>
                    </label>
                    <input
                      id="documents"
                      type="file"
                      multiple
                      class="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      @change="handleFileUpload"
                      data-testid="mission-documents-input"
                    />
                  </div>
                </div>

                <div v-if="formData.documents.length > 0" class="mt-4 space-y-2">
                  <div v-for="(file, index) in formData.documents" :key="index" class="flex items-center justify-between p-2 bg-gray-50 rounded" :data-testid="`mission-document-item-${index}`">
                    <div class="flex items-center space-x-2">
                      <FileText class="w-4 h-4 text-gray-500" />
                      <span class="text-sm">{{ file.name }}</span>
                    </div>
                    <Button variant="ghost" size="sm" @click="removeDocument(index)" :data-testid="`mission-document-remove-button-${index}`">
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- Onglet Validation -->
        <TabsContent value="validation" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle class="text-lg">Notifications client</CardTitle>
              <CardDescription>Configurez les notifications à envoyer au client</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="space-y-3">
                <div class="flex items-center space-x-2">
                  <Checkbox
                    id="emailClient"
                    v-model:checked="formData.notifications.emailClient"
                    data-testid="validation-email-checkbox"
                  />
                  <Label for="emailClient">Envoyer un email de notification au client</Label>
                </div>

                <div class="flex items-center space-x-2">
                  <Checkbox
                    id="smsClient"
                    v-model:checked="formData.notifications.smsClient"
                    data-testid="validation-sms-checkbox"
                  />
                  <Label for="smsClient">Envoyer un SMS de notification au client</Label>
                </div>

                <div class="flex items-center space-x-2">
                  <Checkbox
                    id="creerAccesClient"
                    v-model:checked="formData.notifications.creerAccesClient"
                    data-testid="validation-access-checkbox"
                  />
                  <Label for="creerAccesClient">Créer un accès client pour le suivi du dossier</Label>
                </div>
              </div>

              <Alert v-if="formData.notifications.creerAccesClient" data-testid="validation-access-alert">
                <CheckCircle class="h-4 w-4" />
                <AlertDescription>
                  Un email sera automatiquement envoyé au client avec ses identifiants de connexion pour suivre
                  l'avancement de son dossier, ajouter des photos et communiquer avec le prestataire.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <!-- Récapitulatif -->
          <Card data-testid="validation-recap-card">
            <CardHeader>
              <CardTitle class="text-lg">Récapitulatif de la mission</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 class="font-semibold">Client</h5>
                  <p>
                    {{ formData.client.civilite }} {{ formData.client.prenom }} {{ formData.client.nom }}
                  </p>
                  <p>{{ formData.client.telephone }}</p>
                  <p v-if="formData.client.email">{{ formData.client.email }}</p>
                </div>

                <div>
                  <h5 class="font-semibold">Chantier</h5>
                  <p>{{ formData.chantier.adresse }}</p>
                  <p>
                    {{ formData.chantier.codePostal }} {{ formData.chantier.ville }}
                  </p>
                </div>

                <div>
                  <h5 class="font-semibold">Sinistre</h5>
                  <p>{{ formData.sinistre.type }}</p>
                  <Badge
                    :class="
                      niveauxUrgence.find((n) => n.value === formData.sinistre.urgence)?.color || 'bg-gray-100'
                    "
                  >
                    Urgence {{ niveauxUrgence.find((n) => n.value === formData.sinistre.urgence)?.label }}
                  </Badge>
                </div>

                <div>
                  <h5 class="font-semibold">Mission</h5>
                  <p>{{ formData.mission.titre }}</p>
                  <p v-if="formData.mission.budgetEstime">Budget: {{ formData.mission.budgetEstime }}€</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <!-- Boutons de navigation -->
      <div class="flex justify-between pt-4 border-t">
        <Button
          variant="outline"
          @click="goToPreviousTab"
          :disabled="currentTab === 'client'"
          data-testid="previous-tab-button"
        >
          Précédent
        </Button>

        <div class="flex space-x-2">
          <Button
            v-if="currentTab !== 'validation'"
            @click="goToNextTab"
            :disabled="!validateCurrentTab"
            data-testid="next-tab-button"
          >
            Suivant
          </Button>
          <Button v-else @click="handleSubmit" :disabled="!validateCurrentTab" data-testid="create-mission-button">
            <Send class="w-4 h-4 mr-2" />
            Créer la mission
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
