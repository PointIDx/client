<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
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
import { Progress } from '@/components/ui/progress'
import {
  User,
  MapPin,
  AlertTriangle,
  Briefcase,
  Upload,
  FileText,
  Send,
  CheckCircle,
  Euro,
  Phone,
  Home,
  ArrowLeft,
  ArrowRight,
  Building2,
  Clock,
  FileCheck
} from 'lucide-vue-next'

import { useForm, Form } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

import { FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form'

interface Prestataire {
  id: string
  nom: string
  raisonSociale: string
  secteurs: string[]
  ville: string
  telephone: string
  email: string
}

// Props for receiving prestataire data
interface Props {
  prestataireData?: Prestataire
}

const props = withDefaults(defineProps<Props>(), {
  prestataireData: () => ({
    id: '1',
    nom: 'Entreprise Martin',
    raisonSociale: 'Martin Rénovation SARL',
    secteurs: ['Plomberie', 'Électricité', 'Rénovation'],
    ville: 'Paris',
    telephone: '01 23 45 67 89',
    email: 'contact@martin-renovation.fr'
  })
})

const router = useRouter()
const route = useRoute()

// Initialize prestataire data from query params or props
const prestataire = ref<Prestataire>(props.prestataireData)

// Update prestataire data from route query params if available
onMounted(() => {
  const query = route.query
  if (query.prestataireId) {
    prestataire.value = {
      id: query.prestataireId as string,
      nom: query.prestataireNom as string,
      raisonSociale: query.prestataireRaisonSociale as string,
      secteurs: query.prestataireSecteurs ? (query.prestataireSecteurs as string).split(',') : [],
      ville: query.prestataireVille as string,
      telephone: query.prestataireTelephone as string,
      email: query.prestataireEmail as string
    }
  }
})

const currentTab = ref('client')

// Zod Schemas for validation
const clientFormSchema = toTypedSchema(z.object({
  civilite: z.string().min(1, 'La civilité est requise.'),
  nom: z.string().min(1, 'Le nom est requis.'),
  prenom: z.string().min(1, 'Le prénom est requis.'),
  telephone: z.string().min(1, 'Le téléphone est requis.'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  adresse: z.string().optional(),
  codePostal: z.string().optional(),
  ville: z.string().optional(),
}))

const chantierFormSchema = toTypedSchema(z.object({
  adresse: z.string().min(1, "L'adresse du chantier est requise."),
  codePostal: z.string().min(1, 'Le code postal est requis.'),
  ville: z.string().min(1, 'La ville est requise.'),
  typeAcces: z.string().optional(),
  etage: z.string().optional(),
  contraintes: z.string().optional(),
  memeAdresseClient: z.boolean().default(false),
}))

const sinistreFormSchema = toTypedSchema(z.object({
  type: z.string().min(1, 'Le type de sinistre est requis.'),
  description: z.string().min(1, 'La description est requise.'),
  urgence: z.string().min(1, "Le niveau d'urgence est requis."),
  dateSinistre: z.string().optional(),
  dateIntervention: z.string().optional(),
  numeroSinistre: z.string().optional(),
}))

const missionFormSchema = toTypedSchema(z.object({
  titre: z.string().min(1, 'Le titre de la mission est requis.'),
  description: z.string().min(1, 'La description de la mission est requise.'),
  budgetEstime: z.string().optional(),
  delaiSouhaite: z.string().optional(),
  horaires: z.string().optional(),
  materiaux: z.string().optional(),
  normes: z.string().optional(),
  conditionsParticulieres: z.string().optional(),
}))

const notificationsFormSchema = toTypedSchema(z.object({
  emailClient: z.boolean().default(true),
  smsClient: z.boolean().default(false),
  creerAccesClient: z.boolean().default(true),
}))

const clientForm = useForm({
  validationSchema: clientFormSchema,
  initialValues: {
    civilite: '', nom: '', prenom: '', telephone: '', email: '', adresse: '', codePostal: '', ville: ''
  },
})

const chantierForm = useForm({
  validationSchema: chantierFormSchema,
  initialValues: {
    adresse: '', codePostal: '', ville: '', typeAcces: '', etage: '', contraintes: '', memeAdresseClient: false
  }
})

const sinistreForm = useForm({
  validationSchema: sinistreFormSchema,
  initialValues: {
    type: '', description: '', urgence: 'moyenne', dateSinistre: '', dateIntervention: '', numeroSinistre: ''
  }
})

const missionForm = useForm({
  validationSchema: missionFormSchema,
  initialValues: {
    titre: '', description: '', budgetEstime: '', delaiSouhaite: '', horaires: '', materiaux: '', normes: '', conditionsParticulieres: ''
  }
})

const notificationsForm = useForm({
  validationSchema: notificationsFormSchema,
  initialValues: {
    emailClient: true, smsClient: false, creerAccesClient: true
  }
})

const documents = ref<File[]>([])

const typesSinistre = [
  'Dégât des eaux', 'Incendie', 'Fissures', 'Infiltration', 'Bris de glace', 'Cambriolage', 'Tempête', 'Rénovation', 'Autre',
]

const typesAcces = [
  'Libre', 'Clés chez gardien', 'Clés chez voisin', 'Rendez-vous obligatoire', "Code d'accès", 'Autre',
]

const niveauxUrgence = [
  { value: 'faible', label: 'Faible', color: 'bg-green-100 text-green-800' },
  { value: 'moyenne', label: 'Moyenne', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'elevee', label: 'Élevée', color: 'bg-red-100 text-red-800' },
]

const copyClientAddress = () => {
  if (chantierForm.values.memeAdresseClient) {
    chantierForm.setFieldValue('adresse', clientForm.values.adresse)
    chantierForm.setFieldValue('codePostal', clientForm.values.codePostal)
    chantierForm.setFieldValue('ville', clientForm.values.ville)
  } else {
    chantierForm.setFieldValue('adresse', '')
    chantierForm.setFieldValue('codePostal', '')
    chantierForm.setFieldValue('ville', '')
  }
}

watch(() => clientForm.values.adresse, (newVal) => {
  if (chantierForm.values.memeAdresseClient) {
    chantierForm.setFieldValue('adresse', newVal)
  }
})
watch(() => clientForm.values.codePostal, (newVal) => {
  if (chantierForm.values.memeAdresseClient) {
    chantierForm.setFieldValue('codePostal', newVal)
  }
})
watch(() => clientForm.values.ville, (newVal) => {
  if (chantierForm.values.memeAdresseClient) {
    chantierForm.setFieldValue('ville', newVal)
  }
})

// Watch for tab changes to initialize validation
watch(currentTab, () => {
  // The computed property will handle validation automatically
  console.log('Tab changed to:', currentTab.value)
}, { immediate: true })

// Watch for form changes to debug
watch(() => clientForm.errors, (newErrors) => {
  console.log('Form errors changed:', newErrors)
}, { deep: true, immediate: true })


const handleFileUpload = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (files) {
    const newFiles = Array.from(files)
    documents.value = [...documents.value, ...newFiles]
  }
}

const removeDocument = (index: number) => {
  documents.value = documents.value.filter((_, i) => i !== index)
}

const tabs = ['client', 'chantier', 'sinistre', 'mission', 'validation']

const currentTabIndex = computed(() => tabs.indexOf(currentTab.value))
const progressPercentage = computed(() => ((currentTabIndex.value + 1) / tabs.length) * 100)

// Computed property to check if current tab is valid
const isTabValid = async (tab: string) => {
  switch (tab) {
    case 'client':
      return (await clientForm.validate()).valid
    case 'chantier':
      return (await chantierForm.validate()).valid
    case 'sinistre':
      return (await sinistreForm.validate()).valid
    case 'mission':
      return (await missionForm.validate()).valid
    case 'validation':
      return (await notificationsForm.validate()).valid
    default:
      return true
  }
}

const goToPreviousTab = () => {
  const currentIndex = tabs.indexOf(currentTab.value)
  if (currentIndex > 0) {
    currentTab.value = tabs[currentIndex - 1]
  }
}

const goToNextTab = async () => {
  if (await isTabValid(currentTab.value)) {
    const currentIndex = tabs.indexOf(currentTab.value)
    if (currentIndex < tabs.length - 1) {
      currentTab.value = tabs[currentIndex + 1]
    }
  }
}

const handleSubmit = async () => {
  const allFormsValid =
    (await clientForm.validate()).valid &&
    (await chantierForm.validate()).valid &&
    (await sinistreForm.validate()).valid &&
    (await missionForm.validate()).valid &&
    (await notificationsForm.validate()).valid

  if (allFormsValid) {
    const missionData = {
      client: clientForm.values,
      chantier: chantierForm.values,
      sinistre: sinistreForm.values,
      mission: missionForm.values,
      notifications: notificationsForm.values,
      documents: documents.value,
      prestataire: prestataire.value,
      numeroMission: `M${Date.now().toString().slice(-6)}`,
      dateCreation: new Date().toISOString(),
      statut: 'envoyee',
    }

    console.log('Mission créée:', missionData)
    alert('Mission créée avec succès!')
    
    // Navigate back to dashboard
    router.push('/assureur-dashboard')
  } else {
    alert('Veuillez remplir tous les champs requis avant de soumettre.')
  }
}

const getTabIcon = (tab: string) => {
  switch (tab) {
    case 'client': return User
    case 'chantier': return Home
    case 'sinistre': return AlertTriangle
    case 'mission': return Briefcase
    case 'validation': return CheckCircle
    default: return User
  }
}

const getTabLabel = (tab: string) => {
  switch (tab) {
    case 'client': return 'Client'
    case 'chantier': return 'Chantier'
    case 'sinistre': return 'Sinistre'
    case 'mission': return 'Mission'
    case 'validation': return 'Validation'
    default: return tab
  }
}
</script>

<template>
  <div>
    <!-- Progress Bar -->
    <div class="bg-white border-b border-gray-100">
      <div class="mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              @click="router.push('/assureur-dashboard')"
              data-testid="back-to-dashboard-button"
              class="flex items-center space-x-2"
            >
              <ArrowLeft class="w-4 h-4" />
              <span>Retour au tableau de bord</span>
            </Button>
            <span class="text-sm font-medium text-gray-700">
              Étape {{ currentTabIndex + 1 }} sur {{ tabs.length }}
            </span>
          </div>
          <span class="text-sm text-gray-500">
            {{ Math.round(progressPercentage) }}% complété
          </span>
        </div>
        <Progress :value="progressPercentage" class="h-2" data-testid="progress-bar" />
      </div>
    </div>

    <!-- Main Content -->
    <div class="px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Sidebar - Prestataire Info -->
        <div class="lg:col-span-1">
          <Card class="sticky top-8" data-testid="prestataire-info-card">
            <CardHeader>
              <CardTitle class="text-lg">Prestataire sélectionné</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="flex items-center space-x-3">
                <Avatar class="w-12 h-12">
                  <AvatarFallback class="bg-blue-100 text-blue-600 text-lg">
                    {{ prestataire.nom.split(' ').map((n) => n[0]).join('') }}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 class="font-semibold text-gray-900">{{ prestataire.nom }}</h4>
                  <p class="text-sm text-gray-600">{{ prestataire.raisonSociale }}</p>
                </div>
              </div>
              
              <div class="space-y-2 text-sm">
                <div class="flex items-center text-gray-600">
                  <MapPin class="w-4 h-4 mr-2" />
                  {{ prestataire.ville }}
                </div>
                <div class="flex items-center text-gray-600">
                  <Phone class="w-4 h-4 mr-2" />
                  {{ prestataire.telephone }}
                </div>
              </div>

              <div>
                <p class="text-sm font-medium text-gray-700 mb-2">Secteurs d'activité</p>
                <div class="flex flex-wrap gap-1">
                  <Badge
                    v-for="secteur in prestataire.secteurs"
                    :key="secteur"
                    variant="secondary"
                    class="text-xs"
                    :data-testid="`prestataire-secteur-badge-${secteur}`"
                  >
                    {{ secteur }}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Main Form -->
        <div class="lg:col-span-3">
          <Tabs v-model:model-value="currentTab" class="space-y-6">
            <TabsList class="grid w-full grid-cols-5 h-auto p-1">
              <TabsTrigger 
                v-for="tab in tabs" 
                :key="tab"
                :value="tab" 
                class="flex flex-col items-center space-y-1 py-3 px-2"
                :data-testid="`tab-${tab}`"
              >
                <component :is="getTabIcon(tab)" class="w-5 h-5" />
                <span class="text-xs font-medium">{{ getTabLabel(tab) }}</span>
              </TabsTrigger>
            </TabsList>

            <!-- Client Tab -->
            <TabsContent value="client" class="space-y-6">
              <Form @submit="clientForm.handleSubmit(() => {})()" :form="clientForm">
                <Card>
                  <CardHeader>
                    <CardTitle class="flex items-center space-x-2">
                      <User class="w-5 h-5 text-blue-600" />
                      <span>Informations client</span>
                    </CardTitle>
                    <CardDescription>
                      Renseignez les coordonnées du client bénéficiaire de la mission
                    </CardDescription>
                  </CardHeader>
                  <CardContent class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField v-slot="{ field }" name="civilite">
                        <FormItem>
                          <FormLabel>Civilité *</FormLabel>
                          <FormControl>
                            <Select v-bind="field" @update:model-value="(value) => { console.log('Civilité selected:', value); field.onChange(value); }">
                              <SelectTrigger data-testid="client-civilite-select">
                                <SelectValue placeholder="Sélectionnez" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="M">Monsieur</SelectItem>
                                <SelectItem value="Mme">Madame</SelectItem>
                                <SelectItem value="Mlle">Mademoiselle</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                          <div class="text-sm text-blue-600 mt-1">
                            Debug: civilité = {{ field.value }}
                          </div>
                        </FormItem>
                      </FormField>

                      <FormField v-slot="{ field }" :validate-on-blur="false" name="nom" :form="clientForm">
                        <FormItem>
                          <FormLabel>Nom *</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Nom de famille"
                              v-bind="field"
                              data-testid="client-nom-input"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>

                      <FormField v-slot="{ field }" name="prenom">
                        <FormItem>
                          <FormLabel>Prénom *</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Prénom"
                              v-bind="field"
                              data-testid="client-prenom-input"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField v-slot="{ field }" name="telephone">
                        <FormItem>
                          <FormLabel>Téléphone *</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="06 12 34 56 78"
                              v-bind="field"
                              data-testid="client-telephone-input"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>

                      <FormField v-slot="{ field }" name="email">
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="client@email.com"
                              v-bind="field"
                              data-testid="client-email-input"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>
                    </div>

                    <FormField v-slot="{ field }" name="adresse">
                      <FormItem>
                        <FormLabel>Adresse du client</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Adresse complète"
                            v-bind="field"
                            data-testid="client-adresse-input"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </FormField>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField v-slot="{ field }" name="codePostal">
                        <FormItem>
                          <FormLabel>Code postal</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="75001"
                              v-bind="field"
                              data-testid="client-codepostal-input"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>

                      <FormField v-slot="{ field }" name="ville">
                        <FormItem>
                          <FormLabel>Ville</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Paris"
                              v-bind="field"
                              data-testid="client-ville-input"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>
                    </div>
                  </CardContent>
                </Card>
              </Form>
            </TabsContent>

            <!-- Chantier Tab -->
            <TabsContent value="chantier" class="space-y-6">
              <Form @submit="chantierForm.handleSubmit(() => {})()">
                <Card>
                  <CardHeader>
                    <CardTitle class="flex items-center space-x-2">
                      <Home class="w-5 h-5 text-blue-600" />
                      <span>Lieu d'intervention</span>
                    </CardTitle>
                    <CardDescription>
                      Précisez l'adresse et les conditions d'accès au chantier
                    </CardDescription>
                  </CardHeader>
                  <CardContent class="space-y-6">
                    <FormField v-slot="{ field }" :validate-on-blur="false" name="memeAdresseClient">
                      <FormItem class="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            :checked="field.value"
                            @update:checked="(val: boolean) => { field.onChange(val); copyClientAddress(); }"
                            data-testid="chantier-meme-adresse-checkbox"
                          />
                        </FormControl>
                        <div class="space-y-1 leading-none">
                          <FormLabel>Même adresse que le client</FormLabel>
                        </div>
                      </FormItem>
                    </FormField>

                    <FormField v-slot="{ field }" :validate-on-blur="false" name="adresse">
                      <FormItem>
                        <FormLabel>Adresse du chantier *</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Adresse complète du lieu d'intervention"
                            v-bind="field"
                            :disabled="chantierForm.values.memeAdresseClient"
                            data-testid="chantier-adresse-input"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </FormField>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField v-slot="{ field }" :validate-on-blur="false" name="codePostal">
                        <FormItem>
                          <FormLabel>Code postal *</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="75001"
                              v-bind="field"
                              :disabled="chantierForm.values.memeAdresseClient"
                              data-testid="chantier-codepostal-input"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>

                      <FormField v-slot="{ field }" :validate-on-blur="false" name="ville">
                        <FormItem>
                          <FormLabel>Ville *</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Paris"
                              v-bind="field"
                              :disabled="chantierForm.values.memeAdresseClient"
                              data-testid="chantier-ville-input"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField v-slot="{ field }" :validate-on-blur="false" name="typeAcces">
                        <FormItem>
                          <FormLabel>Type d'accès</FormLabel>
                          <FormControl>
                            <Select v-bind="field">
                              <SelectTrigger data-testid="chantier-typeacces-select">
                                <SelectValue placeholder="Sélectionnez" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem v-for="type in typesAcces" :key="type" :value="type">
                                  {{ type }}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>

                      <FormField v-slot="{ field }" :validate-on-blur="false" name="etage">
                        <FormItem>
                          <FormLabel>Étage</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="RDC, 1er, 2ème..."
                              v-bind="field"
                              data-testid="chantier-etage-input"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>
                    </div>

                    <FormField v-slot="{ field }" :validate-on-blur="false" name="contraintes">
                      <FormItem>
                        <FormLabel>Contraintes d'accès</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Précisez les contraintes particulières (horaires, parking, ascenseur...)"
                            v-bind="field"
                            rows="3"
                            data-testid="chantier-contraintes-textarea"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </FormField>
                  </CardContent>
                </Card>
              </Form>
            </TabsContent>

            <!-- Sinistre Tab -->
            <TabsContent value="sinistre" class="space-y-6">
              <Form @submit="sinistreForm.handleSubmit(() => {})()">
                <Card>
                  <CardHeader>
                    <CardTitle class="flex items-center space-x-2">
                      <AlertTriangle class="w-5 h-5 text-blue-600" />
                      <span>Détails du sinistre</span>
                    </CardTitle>
                    <CardDescription>
                      Décrivez le sinistre et les travaux à réaliser
                    </CardDescription>
                  </CardHeader>
                  <CardContent class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField v-slot="{ field }" :validate-on-blur="false" name="type">
                        <FormItem>
                          <FormLabel>Type de sinistre *</FormLabel>
                          <FormControl>
                            <Select v-bind="field">
                              <SelectTrigger data-testid="sinistre-type-select">
                                <SelectValue placeholder="Sélectionnez le type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem v-for="type in typesSinistre" :key="type" :value="type">
                                  {{ type }}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>

                      <FormField v-slot="{ field }" :validate-on-blur="false" name="numeroSinistre">
                        <FormItem>
                          <FormLabel>N° de sinistre</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Numéro de dossier sinistre"
                              v-bind="field"
                              data-testid="sinistre-numero-input"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>
                    </div>

                    <FormField v-slot="{ field }" :validate-on-blur="false" name="urgence">
                      <FormItem>
                        <FormLabel>Niveau d'urgence *</FormLabel>
                        <FormControl>
                          <RadioGroup
                            v-bind="field"
                            class="flex space-x-6 mt-2"
                            data-testid="sinistre-urgence-radiogroup"
                          >
                            <div v-for="niveau in niveauxUrgence" :key="niveau.value" class="flex items-center space-x-2">
                              <RadioGroupItem :value="niveau.value" :id="niveau.value" />
                              <Label :for="niveau.value" :class="`px-3 py-1 rounded-full text-sm font-medium ${niveau.color}`">
                                {{ niveau.label }}
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </FormField>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField v-slot="{ field }" :validate-on-blur="false" name="dateSinistre">
                        <FormItem>
                          <FormLabel>Date du sinistre</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              v-bind="field"
                              data-testid="sinistre-date-input"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>

                      <FormField v-slot="{ field }" :validate-on-blur="false" name="dateIntervention">
                        <FormItem>
                          <FormLabel>Date d'intervention souhaitée</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              v-bind="field"
                              data-testid="sinistre-date-intervention-input"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>
                    </div>

                    <FormField v-slot="{ field }" :validate-on-blur="false" name="description">
                      <FormItem>
                        <FormLabel>Description détaillée *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Décrivez précisément les dégâts constatés et les travaux à réaliser..."
                            v-bind="field"
                            rows="4"
                            data-testid="sinistre-description-textarea"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </FormField>
                  </CardContent>
                </Card>
              </Form>
            </TabsContent>

            <!-- Mission Tab -->
            <TabsContent value="mission" class="space-y-6">
              <Form @submit="missionForm.handleSubmit(() => {})()">
                <Card>
                  <CardHeader>
                    <CardTitle class="flex items-center space-x-2">
                      <Briefcase class="w-5 h-5 text-blue-600" />
                      <span>Détails de la mission</span>
                    </CardTitle>
                    <CardDescription>
                      Précisez les modalités d'exécution de la mission
                    </CardDescription>
                  </CardHeader>
                  <CardContent class="space-y-6">
                    <FormField v-slot="{ field }" :validate-on-blur="false" name="titre">
                      <FormItem>
                        <FormLabel>Titre de la mission *</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Ex: Réparation dégât des eaux - Salle de bain"
                            v-bind="field"
                            data-testid="mission-titre-input"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </FormField>

                    <FormField v-slot="{ field }" :validate-on-blur="false" name="description">
                      <FormItem>
                        <FormLabel>Description de la mission *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Décrivez précisément les travaux à réaliser, les prestations attendues..."
                            v-bind="field"
                            rows="4"
                            data-testid="mission-description-textarea"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </FormField>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField v-slot="{ field }" :validate-on-blur="false" name="budgetEstime">
                        <FormItem>
                          <FormLabel>Budget estimé</FormLabel>
                          <FormControl>
                            <div class="relative">
                              <Euro class="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                type="text"
                                placeholder="Montant estimé"
                                v-bind="field"
                                class="pl-10"
                                data-testid="mission-budget-input"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>

                      <FormField v-slot="{ field }" :validate-on-blur="false" name="delaiSouhaite">
                        <FormItem>
                          <FormLabel>Délai souhaité</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Ex: 2 semaines, 1 mois..."
                              v-bind="field"
                              data-testid="mission-delai-input"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>
                    </div>

                    <FormField v-slot="{ field }" :validate-on-blur="false" name="horaires">
                      <FormItem>
                        <FormLabel>Horaires d'intervention</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Ex: 8h-17h du lundi au vendredi"
                            v-bind="field"
                            data-testid="mission-horaires-input"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </FormField>

                    <FormField v-slot="{ field }" :validate-on-blur="false" name="materiaux">
                      <FormItem>
                        <FormLabel>Matériaux et fournitures</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Précisez si les matériaux sont fournis par le client, le prestataire, ou autres modalités..."
                            v-bind="field"
                            rows="2"
                            data-testid="mission-materiaux-textarea"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </FormField>

                    <FormField v-slot="{ field }" :validate-on-blur="false" name="normes">
                      <FormItem>
                        <FormLabel>Normes et réglementations</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Normes techniques à respecter, réglementations particulières..."
                            v-bind="field"
                            rows="2"
                            data-testid="mission-normes-textarea"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </FormField>

                    <FormField v-slot="{ field }" :validate-on-blur="false" name="conditionsParticulieres">
                      <FormItem>
                        <FormLabel>Conditions particulières</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Autres conditions ou remarques importantes..."
                            v-bind="field"
                            rows="2"
                            data-testid="mission-conditions-textarea"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </FormField>

                    <!-- Upload de documents -->
                    <div>
                      <Label>Documents joints</Label>
                      <div class="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
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

                      <div v-if="documents.length > 0" class="mt-4 space-y-2">
                        <div v-for="(file, index) in documents" :key="index" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg" :data-testid="`mission-document-item-${index}`">
                          <div class="flex items-center space-x-2">
                            <FileText class="w-4 h-4 text-gray-500" />
                            <span class="text-sm font-medium">{{ file.name }}</span>
                            <span class="text-xs text-gray-500">({{ Math.round(file.size / 1024) }} KB)</span>
                          </div>
                          <Button variant="ghost" size="sm" @click="removeDocument(index)" :data-testid="`mission-document-remove-button-${index}`">
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Form>
            </TabsContent>

            <!-- Validation Tab -->
            <TabsContent value="validation" class="space-y-6">
              <Form @submit="notificationsForm.handleSubmit(() => {})()">
                <Card>
                  <CardHeader>
                    <CardTitle class="flex items-center space-x-2">
                      <CheckCircle class="w-5 h-5 text-blue-600" />
                      <span>Notifications client</span>
                    </CardTitle>
                    <CardDescription>
                      Configurez les notifications à envoyer au client
                    </CardDescription>
                  </CardHeader>
                  <CardContent class="space-y-4">
                    <FormField v-slot="{ field }" :validate-on-blur="false" name="emailClient">
                      <FormItem class="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            :checked="field.value"
                            @update:checked="field.onChange"
                            data-testid="validation-email-checkbox"
                          />
                        </FormControl>
                        <div class="space-y-1 leading-none">
                          <FormLabel>Envoyer un email de notification au client</FormLabel>
                        </div>
                      </FormItem>
                    </FormField>

                    <FormField v-slot="{ field }" :validate-on-blur="false" name="smsClient">
                      <FormItem class="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            :checked="field.value"
                            @update:checked="field.onChange"
                            data-testid="validation-sms-checkbox"
                          />
                        </FormControl>
                        <div class="space-y-1 leading-none">
                          <FormLabel>Envoyer un SMS de notification au client</FormLabel>
                        </div>
                      </FormItem>
                    </FormField>

                    <FormField v-slot="{ field }" :validate-on-blur="false" name="creerAccesClient">
                      <FormItem class="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            :checked="field.value"
                            @update:checked="field.onChange"
                            data-testid="validation-access-checkbox"
                          />
                        </FormControl>
                        <div class="space-y-1 leading-none">
                          <FormLabel>Créer un accès client pour le suivi du dossier</FormLabel>
                        </div>
                      </FormItem>
                    </FormField>

                    <Alert v-if="notificationsForm.values.creerAccesClient" class="border-blue-200 bg-blue-50" data-testid="validation-access-alert">
                      <CheckCircle class="h-4 w-4 text-blue-600" />
                      <AlertDescription class="text-blue-800">
                        Un email sera automatiquement envoyé au client avec ses identifiants de connexion pour suivre
                        l'avancement de son dossier, ajouter des photos et communiquer avec le prestataire.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </Form>

              <!-- Récapitulatif -->
              <Card data-testid="validation-recap-card">
                <CardHeader>
                  <CardTitle class="flex items-center space-x-2">
                    <FileCheck class="w-5 h-5 text-blue-600" />
                    <span>Récapitulatif de la mission</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div class="space-y-2">
                      <h5 class="font-semibold text-gray-900 flex items-center">
                        <User class="w-4 h-4 mr-2" />
                        Client
                      </h5>
                      <div class="pl-6 space-y-1">
                        <p class="font-medium" data-testid="recap-client-name">
                          {{ clientForm.values.civilite }} {{ clientForm.values.prenom }} {{ clientForm.values.nom }}
                        </p>
                        <p class="text-gray-600" data-testid="recap-client-phone">{{ clientForm.values.telephone }}</p>
                        <p v-if="clientForm.values.email" class="text-gray-600" data-testid="recap-client-email">{{ clientForm.values.email }}</p>
                      </div>
                    </div>

                    <div class="space-y-2">
                      <h5 class="font-semibold text-gray-900 flex items-center">
                        <Home class="w-4 h-4 mr-2" />
                        Chantier
                      </h5>
                      <div class="pl-6 space-y-1">
                        <p class="font-medium" data-testid="recap-chantier-address">{{ chantierForm.values.adresse }}</p>
                        <p class="text-gray-600" data-testid="recap-chantier-city-zip">
                          {{ chantierForm.values.codePostal }} {{ chantierForm.values.ville }}
                        </p>
                      </div>
                    </div>

                    <div class="space-y-2">
                      <h5 class="font-semibold text-gray-900 flex items-center">
                        <AlertTriangle class="w-4 h-4 mr-2" />
                        Sinistre
                      </h5>
                      <div class="pl-6 space-y-1">
                        <p class="font-medium" data-testid="recap-sinistre-type">{{ sinistreForm.values.type }}</p>
                        <Badge
                          :class="
                            niveauxUrgence.find((n) => n.value === sinistreForm.values.urgence)?.color || 'bg-gray-100'
                          "
                          data-testid="recap-sinistre-urgence"
                        >
                          Urgence {{ niveauxUrgence.find((n) => n.value === sinistreForm.values.urgence)?.label }}
                        </Badge>
                      </div>
                    </div>

                    <div class="space-y-2">
                      <h5 class="font-semibold text-gray-900 flex items-center">
                        <Briefcase class="w-4 h-4 mr-2" />
                        Mission
                      </h5>
                      <div class="pl-6 space-y-1">
                        <p class="font-medium" data-testid="recap-mission-title">{{ missionForm.values.titre }}</p>
                        <p v-if="missionForm.values.budgetEstime" class="text-gray-600" data-testid="recap-mission-budget">
                          Budget: {{ missionForm.values.budgetEstime }}€
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <!-- Navigation Buttons -->
          <div class="flex justify-between items-center pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              @click="goToPreviousTab"
              :disabled="currentTab === 'client'"
              class="flex items-center space-x-2"
              data-testid="previous-tab-button"
            >
              <ArrowLeft class="w-4 h-4" />
              <span>Précédent</span>
            </Button>

            <div class="flex space-x-2">
              <Button
                v-if="currentTab !== 'validation'"
                @click="goToNextTab"
                :disabled="!isTabValid"
                class="flex items-center space-x-2"
                data-testid="next-tab-button"
              >
                <span>Suivant</span>
                <ArrowRight class="w-4 h-4" />
              </Button>
              <Button 
                v-else 
                @click="handleSubmit" 
                :disabled="!isTabValid"
                class="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                data-testid="create-mission-button"
              >
                <Send class="w-4 h-4" />
                <span>Créer la mission</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
