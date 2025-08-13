<script setup lang="ts">
import { ref, onMounted, watch, toRef, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAssureurStore } from '@/stores/assureur'
import { useMissionStore } from '@/stores/mission'
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
  FileCheck
} from 'lucide-vue-next'

import { useForm, Form } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

import { SPECIALIZATIONS } from '@/interfaces/sub-mission'

interface SubMissionPlan {
  id: string
  specialization: string
  title: string
  description: string
  urgence: string
  estimatedCost?: number
  materialsNeeded?: string
  specialRequirements?: string
  estimatedDurationHours?: number
}

const router = useRouter()
const route = useRoute()
const assureurStore = useAssureurStore()
const missionStore = useMissionStore()

// State for sub-missions planning
const subMissions = ref<SubMissionPlan[]>([])
const showSubMissionForm = ref(false)
const currentStep = ref(1) // 1: Mission Details, 2: Sub-missions Planning, 3: Review

const addSubMission = () => {
  subMissions.value.push({
    id: Date.now().toString(),
    specialization: '',
    title: '',
    description: '',
    urgence: 'MOYENNE',
    estimatedCost: undefined,
    materialsNeeded: '',
    specialRequirements: '',
    estimatedDurationHours: undefined
  })
  showSubMissionForm.value = true
}

const removeSubMission = (index: number) => {
  subMissions.value.splice(index, 1)
}

// Zod Schemas for validation - Updated to match MissionCreateInput
const clientFormSchema = toTypedSchema(z.object({
  // Client Information (Required)
  civilite: z.string().min(1, 'La civilité est requise.'),
  nom: z.string().min(1, 'Le nom est requis.'),
  prenom: z.string().min(1, 'Le prénom est requis.'),
  telephone: z.string().min(1, 'Le téléphone est requis.'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  adresse: z.string().optional(),
  codePostal: z.string().optional(),
  ville: z.string().optional(),

  // Site/Worksite Information (Required)
  chantierAdresse: z.string().min(1, "L'adresse du chantier est requise."),
  chantierCodePostal: z.string().min(1, 'Le code postal est requis.'),
  chantierVille: z.string().min(1, 'La ville est requise.'),
  chantierTypeAcces: z.string().optional(),
  chantierEtage: z.string().optional(),
  chantierContraintes: z.string().optional(),
  chantierMemeAdresseClient: z.boolean().optional(),

  // Incident Information (Required)
  sinistreType: z.string().min(1, 'Le type de sinistre est requis.'),
  sinistreDescription: z.string().min(1, 'La description est requise.'),
  sinistreUrgence: z.string().min(1, "Le niveau d'urgence est requis."),
  sinistreDateSinistre: z.string().optional(),
  sinistreDateIntervention: z.string().optional(),
  numeroSinistre: z.string().optional(),

  // Mission Information (Required)
  titre: z.string().min(1, 'Le titre de la mission est requis.'),
  description: z.string().min(1, 'La description de la mission est requise.'),
  budgetEstime: z.string().optional(),
  delaiSouhaite: z.string().optional(),
  horaires: z.string().optional(),
  materiaux: z.string().optional(),
  normes: z.string().optional(),
  conditionsParticulieres: z.string().optional(),

  // Communication Preferences
  emailClient: z.boolean().optional(),
  smsClient: z.boolean().optional(),
  creerAccesClient: z.boolean().optional(),

  // Legacy Fields (for backward compatibility)
  // urgence: z.enum(['BASSE', 'MOYENNE', 'HAUTE', 'CRITIQUE']),
  // deadline: z.string().optional(),
  // estimatedCost: z.number().optional(),
}))


const {handleSubmit, values, setValue} = useForm({
  validationSchema: clientFormSchema,
  initialValues: {
    chantierMemeAdresseClient: false,
    emailClient: true,
    smsClient: false,
    creerAccesClient: true,
    sinistreUrgence: 'MOYENNE',
  }
})

// Function to copy client address to chantier address
const copyClientAddressToChantier = () => {
  console.log('copyClientAddressToChantier called', {
    chantierMemeAdresseClient: values.chantierMemeAdresseClient,
    clientAddress: { adresse: values.adresse, codePostal: values.codePostal, ville: values.ville }
  })
  
  if (values.chantierMemeAdresseClient) {
    // Use nextTick to ensure reactive updates happen
    nextTick(() => {
      if (values.adresse) {
        setValue('chantierAdresse', values.adresse)
        console.log('Set chantierAdresse to:', values.adresse)
      }
      if (values.codePostal) {
        setValue('chantierCodePostal', values.codePostal)
        console.log('Set chantierCodePostal to:', values.codePostal)
      }
      if (values.ville) {
        setValue('chantierVille', values.ville)
        console.log('Set chantierVille to:', values.ville)
      }
    })
  }
}

// Handler for checkbox change
const handleSameAddressChange = (checked: boolean) => {
  console.log('handleSameAddressChange called with:', checked)
  if (checked) {
    copyClientAddressToChantier()
  }
}

// Watch for changes in "same address" checkbox
watch(
  () => values.chantierMemeAdresseClient,
  (useSameAddress) => {
    console.log('Same address checkbox changed to:', useSameAddress)
    if (useSameAddress) {
      copyClientAddressToChantier()
    }
  }
)

// Watch for changes in client address fields when same address is checked
watch(
  () => [values.adresse, values.codePostal, values.ville],
  ([adresse, codePostal, ville]) => {
    console.log('Client address changed:', { adresse, codePostal, ville })
    if (values.chantierMemeAdresseClient) {
      copyClientAddressToChantier()
    }
  }
)

const documents = ref<File[]>([])

const typesSinistre = [
  'Dégât des eaux', 'Incendie', 'Fissures', 'Infiltration', 'Bris de glace', 'Cambriolage', 'Tempête', 'Rénovation', 'Autre',
]

const typesAcces = [
  'Libre', 'Clés chez gardien', 'Clés chez voisin', 'Rendez-vous obligatoire', "Code d'accès", 'Autre',
]

const niveauxUrgence = [
  { value: 'BASSE', label: 'Basse', color: 'bg-green-100 text-green-800' },
  { value: 'MOYENNE', label: 'Moyenne', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'HAUTE', label: 'Haute', color: 'bg-orange-100 text-orange-800' },
  { value: 'CRITIQUE', label: 'Critique', color: 'bg-red-100 text-red-800' },
]




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

const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const onSubmit = handleSubmit(async (values) => {
  console.log('✅ Form validation passed! Mission form submitted:', values)
  
  try {
    // Step 1: Create the main mission
    const missionResult = await missionStore.createMission({
        // Client Information
        civilite: values.civilite,
        nom: values.nom,
        prenom: values.prenom,
        telephone: values.telephone,
        email: values.email || undefined,
        adresse: values.adresse || undefined,
        codePostal: values.codePostal || undefined,
        ville: values.ville || undefined,

        // Site/Worksite Information
        chantierAdresse: values.chantierAdresse,
        chantierCodePostal: values.chantierCodePostal,
        chantierVille: values.chantierVille,
        chantierTypeAcces: values.chantierTypeAcces || undefined,
        chantierEtage: values.chantierEtage || undefined,
        chantierContraintes: values.chantierContraintes || undefined,
        chantierMemeAdresseClient: values.chantierMemeAdresseClient || false,

        // Incident Information
        sinistreType: values.sinistreType,
        sinistreDescription: values.sinistreDescription,
        sinistreUrgence: values.sinistreUrgence,
        sinistreDateSinistre: values.sinistreDateSinistre || undefined,
        sinistreDateIntervention: values.sinistreDateIntervention || undefined,
        numeroSinistre: values.numeroSinistre || undefined,

        // Mission Information
        titre: values.titre,
        description: values.description,
        budgetEstime: values.budgetEstime || undefined,
        delaiSouhaite: values.delaiSouhaite || undefined,
        horaires: values.horaires || undefined,
        materiaux: values.materiaux || undefined,
        normes: values.normes || undefined,
        conditionsParticulieres: values.conditionsParticulieres || undefined,

        // Communication Preferences
        emailClient: values.emailClient || false,
        smsClient: values.smsClient || false,
        creerAccesClient: values.creerAccesClient || false,

        // Legacy Fields (for backward compatibility)
        urgence: values.sinistreUrgence,
        deadline: values.sinistreDateIntervention ? new Date(values.sinistreDateIntervention).toISOString() : undefined,
        location: {
          street: values.chantierAdresse,
          city: values.chantierVille,
          postalCode: values.chantierCodePostal,
          country: 'France'
        },
        estimatedCost: values.budgetEstime ? parseFloat(values.budgetEstime) : undefined,
    })
    
    console.log('Mission creation result:', missionResult)
    
    if (missionResult && missionResult.id) {
      console.log('✅ Mission created successfully:', missionResult)
      
      // Step 2: Create sub-missions if any were planned
      if (subMissions.value.length > 0) {
        console.log('Creating sub-missions...')
        const subMissionPromises = subMissions.value.map(subMission => 
          missionStore.createSubMission({
            missionId: missionResult.id,
            title: subMission.title,
            description: subMission.description,
            specialization: subMission.specialization,
            urgence: subMission.urgence as any,
            estimatedCost: subMission.estimatedCost,
            materialsNeeded: subMission.materialsNeeded,
            specialRequirements: subMission.specialRequirements,
            estimatedDurationHours: subMission.estimatedDurationHours
          })
        )
        
        await Promise.all(subMissionPromises)
        console.log('✅ Sub-missions created successfully')
      }
      
      // Navigate to mission details page to manage assignments
      router.push(`/mission/${missionResult.id}`)
    } else {
      console.error('❌ Mission creation failed: No result returned')
    }
  } catch (error) {
    console.error('Error creating mission:', error)
    console.error('Failed to create mission. Please try again.')
  }
}, (errors) => {
  console.log('❌ Form validation failed:', errors)
  console.log('Current form values:', values)
})


</script>

<template>
  <div>
    <!-- Progress Bar -->
    <div class="bg-white border-b border-gray-100">
      <div class="mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-4">
            <Button variant="ghost" size="sm" @click="router.push('/assureur-dashboard')"
              data-testid="back-to-dashboard-button" class="flex items-center space-x-2">
              <ArrowLeft class="w-4 h-4" />
              <span>Retour au tableau de bord</span>
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Sidebar - Progress & Sub-missions -->
        <div class="lg:col-span-1">
          <Card class="sticky top-8">
            <CardHeader>
              <CardTitle class="text-lg">Création de Mission</CardTitle>
              <CardDescription>Étape {{ currentStep }} sur 3</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <!-- Progress Steps -->
              <div class="space-y-2">
                <div class="flex items-center space-x-2" :class="{ 'text-blue-600 font-medium': currentStep >= 1 }">
                  <CheckCircle v-if="currentStep > 1" class="w-4 h-4 text-green-600" />
                  <div v-else class="w-4 h-4 rounded-full border-2" :class="{ 'bg-blue-600 border-blue-600': currentStep >= 1, 'border-gray-300': currentStep < 1 }"></div>
                  <span class="text-sm">Informations mission</span>
                </div>
                <div class="flex items-center space-x-2" :class="{ 'text-blue-600 font-medium': currentStep >= 2 }">
                  <CheckCircle v-if="currentStep > 2" class="w-4 h-4 text-green-600" />
                  <div v-else class="w-4 h-4 rounded-full border-2" :class="{ 'bg-blue-600 border-blue-600': currentStep >= 2, 'border-gray-300': currentStep < 2 }"></div>
                  <span class="text-sm">Sous-missions (optionnel)</span>
                </div>
                <div class="flex items-center space-x-2" :class="{ 'text-blue-600 font-medium': currentStep >= 3 }">
                  <div class="w-4 h-4 rounded-full border-2" :class="{ 'bg-blue-600 border-blue-600': currentStep >= 3, 'border-gray-300': currentStep < 3 }"></div>
                  <span class="text-sm">Récapitulatif</span>
                </div>
              </div>

              <!-- Sub-missions Summary -->
              <div v-if="subMissions.length > 0" class="mt-4 pt-4 border-t">
                <p class="text-sm font-medium text-gray-700 mb-2">Sous-missions planifiées ({{ subMissions.length }})</p>
                <div class="space-y-1">
                  <div v-for="sub in subMissions" :key="sub.id" class="text-xs bg-gray-50 p-2 rounded">
                    <div class="font-medium">{{ sub.specialization }}</div>
                    <div class="text-gray-600">{{ sub.title }}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div class="flex flex-col lg:col-span-3 space-y-6">
          <!-- Step 1: Mission Information -->
          <div v-show="currentStep === 1">
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
                      <Select :model-value="field.value" @update:model-value="field.onChange" :name="field.name">
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
                  </FormItem>
                </FormField>

                <FormField v-slot="{ field }"  name="nom">
                  <FormItem>
                    <FormLabel>Nom *</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Nom de famille" v-bind="field" data-testid="client-nom-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ field }" name="prenom">
                  <FormItem>
                    <FormLabel>Prénom *</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Prénom" v-bind="field" data-testid="client-prenom-input" />
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
                      <Input type="tel" placeholder="06 12 34 56 78" v-bind="field"
                        data-testid="client-telephone-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ field }" name="email">
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="client@email.com" v-bind="field"
                        data-testid="client-email-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </div>

              <FormField v-slot="{ field }" name="adresse">
                <FormItem>
                  <FormLabel>Adresse du client</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Adresse complète" v-bind="field"
                      data-testid="client-adresse-input" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField v-slot="{ field }" name="codePostal">
                  <FormItem>
                    <FormLabel>Code postal</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="75001" v-bind="field" data-testid="client-codepostal-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ field }" name="ville">
                  <FormItem>
                    <FormLabel>Ville</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Paris" v-bind="field" data-testid="client-ville-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </div>
            </CardContent>
          </Card>



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
              <FormField v-slot="{ field }"  name="chantierMemeAdresseClient">
                <FormItem class="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox :checked="field.value"
                      @update:checked="(val: boolean) => { field.onChange(val); handleSameAddressChange(val); }"
                      data-testid="chantier-meme-adresse-checkbox" />
                  </FormControl>
                  <div class="space-y-1 leading-none">
                    <FormLabel>Même adresse que le client</FormLabel>
                  </div>
                </FormItem>
              </FormField>

              <FormField v-slot="{ field }"  name="chantierAdresse">
                <FormItem>
                  <FormLabel>Adresse du chantier *</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Adresse complète du lieu d'intervention" v-bind="field"
                       data-testid="chantier-adresse-input" :disabled="values.chantierMemeAdresseClient" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField v-slot="{ field }"  name="chantierCodePostal">
                  <FormItem>
                    <FormLabel>Code postal *</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="75001" v-bind="field"
                         data-testid="chantier-codepostal-input" :disabled="values.chantierMemeAdresseClient" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ field }"  name="chantierVille">
                  <FormItem>
                    <FormLabel>Ville *</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Paris" v-bind="field"
                         data-testid="chantier-ville-input" :disabled="values.chantierMemeAdresseClient" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField v-slot="{ field }"  name="chantierTypeAcces">
                  <FormItem>
                    <FormLabel>Type d'accès</FormLabel>
                    <FormControl>
                      <Select :model-value="field.value" @update:model-value="field.onChange" :name="field.name">
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

                <FormField v-slot="{ field }"  name="chantierEtage">
                  <FormItem>
                    <FormLabel>Étage</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="RDC, 1er, 2ème..." v-bind="field"
                        data-testid="chantier-etage-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </div>

              <FormField v-slot="{ field }"  name="chantierContraintes">
                <FormItem>
                  <FormLabel>Contraintes d'accès</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Précisez les contraintes particulières (horaires, parking, ascenseur...)"
                      v-bind="field" rows="3" data-testid="chantier-contraintes-textarea" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
            </CardContent>
          </Card>





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
              <FormField v-slot="{ field }"  name="sinistreType">
                <FormItem>
                  <FormLabel>Type de sinistre *</FormLabel>
                  <FormControl>
                    <Select :model-value="field.value" @update:model-value="field.onChange" :name="field.name">
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

              <FormField v-slot="{ field }"  name="numeroSinistre">
                <FormItem>
                  <FormLabel>N° de sinistre</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Numéro de dossier sinistre" v-bind="field"
                      data-testid="sinistre-numero-input" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField v-slot="{ field }"  name="deadline">
                <FormItem>
                  <FormLabel>Échéance</FormLabel>
                  <FormControl>
                    <Input type="date" v-bind="field" data-testid="mission-deadline-input" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>

            <FormField v-slot="{ field }"  name="sinistreUrgence">
              <FormItem>
                <FormLabel>Niveau d'urgence *</FormLabel>
                <FormControl>
                  <RadioGroup v-bind="field" class="flex space-x-6 mt-2" data-testid="sinistre-urgence-radiogroup">
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
              <FormField v-slot="{ field }"  name="sinistreDateSinistre">
                <FormItem>
                  <FormLabel>Date du sinistre</FormLabel>
                  <FormControl>
                    <Input type="date" v-bind="field" data-testid="sinistre-date-input" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ field }"  name="sinistreDateIntervention">
                <FormItem>
                  <FormLabel>Date d'intervention souhaitée</FormLabel>
                  <FormControl>
                    <Input type="date" v-bind="field" data-testid="sinistre-date-intervention-input" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>

            <FormField v-slot="{ field }"  name="sinistreDescription">
              <FormItem>
                <FormLabel>Description détaillée *</FormLabel>
                <FormControl>
                  <Textarea placeholder="Décrivez précisément les dégâts constatés et les travaux à réaliser..."
                    v-bind="field" rows="4" data-testid="sinistre-description-textarea" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </CardContent>
        </Card>





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
            <FormField v-slot="{ field }"  name="titre">
              <FormItem>
                <FormLabel>Titre de la mission *</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Ex: Réparation dégât des eaux - Salle de bain" v-bind="field"
                    data-testid="mission-titre-input" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ field }"  name="description">
              <FormItem>
                <FormLabel>Description de la mission *</FormLabel>
                <FormControl>
                  <Textarea placeholder="Décrivez précisément les travaux à réaliser, les prestations attendues..."
                    v-bind="field" rows="4" data-testid="mission-description-textarea" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField v-slot="{ field }"  name="budgetEstime">
                <FormItem>
                  <FormLabel>Budget estimé</FormLabel>
                  <FormControl>
                    <div class="relative">
                      <Euro class="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input type="text" placeholder="Montant estimé" v-bind="field" class="pl-10"
                        data-testid="mission-budget-input" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ field }"  name="delaiSouhaite">
                <FormItem>
                  <FormLabel>Délai souhaité</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Ex: 2 semaines, 1 mois..." v-bind="field"
                      data-testid="mission-delai-input" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>

            <FormField v-slot="{ field }"  name="horaires">
              <FormItem>
                <FormLabel>Horaires d'intervention</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Ex: 8h-17h du lundi au vendredi" v-bind="field"
                    data-testid="mission-horaires-input" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ field }"  name="materiaux">
              <FormItem>
                <FormLabel>Matériaux et fournitures</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Précisez si les matériaux sont fournis par le client, le prestataire, ou autres modalités..."
                    v-bind="field" rows="2" data-testid="mission-materiaux-textarea" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ field }"  name="normes">
              <FormItem>
                <FormLabel>Normes et réglementations</FormLabel>
                <FormControl>
                  <Textarea placeholder="Normes techniques à respecter, réglementations particulières..." v-bind="field"
                    rows="2" data-testid="mission-normes-textarea" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ field }"  name="conditionsParticulieres">
              <FormItem>
                <FormLabel>Conditions particulières</FormLabel>
                <FormControl>
                  <Textarea placeholder="Autres conditions ou remarques importantes..." v-bind="field" rows="2"
                    data-testid="mission-conditions-textarea" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Upload de documents -->
            <div>
              <Label>Documents joints</Label>
              <div
                class="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <Upload class="mx-auto h-8 w-8 text-gray-400" />
                <div class="mt-2">
                  <label for="documents" class="cursor-pointer">
                    <span class="text-sm font-medium text-gray-900">Cliquez pour ajouter des documents</span>
                    <span class="block text-xs text-gray-500 mt-1">
                      Photos, rapports, devis... (PDF, JPG, PNG)
                    </span>
                  </label>
                  <input id="documents" type="file" multiple class="hidden" accept=".pdf,.jpg,.jpeg,.png"
                    @change="handleFileUpload" data-testid="mission-documents-input" />
                </div>
              </div>

              <div v-if="documents.length > 0" class="mt-4 space-y-2">
                <div v-for="(file, index) in documents" :key="index"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  :data-testid="`mission-document-item-${index}`">
                  <div class="flex items-center space-x-2">
                    <FileText class="w-4 h-4 text-gray-500" />
                    <span class="text-sm font-medium">{{ file.name }}</span>
                    <span class="text-xs text-gray-500">({{ Math.round(file.size / 1024) }} KB)</span>
                  </div>
                  <Button variant="ghost" size="sm" @click="removeDocument(index)"
                    :data-testid="`mission-document-remove-button-${index}`">
                    Supprimer
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>





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
            <FormField v-slot="{ field }"  name="emailClient">
              <FormItem class="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox :checked="field.value" @update:checked="field.onChange"
                    data-testid="validation-email-checkbox" />
                </FormControl>
                <div class="space-y-1 leading-none">
                  <FormLabel>Envoyer un email de notification au client</FormLabel>
                </div>
              </FormItem>
            </FormField>

            <FormField v-slot="{ field }"  name="smsClient">
              <FormItem class="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox :checked="field.value" @update:checked="field.onChange"
                    data-testid="validation-sms-checkbox" />
                </FormControl>
                <div class="space-y-1 leading-none">
                  <FormLabel>Envoyer un SMS de notification au client</FormLabel>
                </div>
              </FormItem>
            </FormField>

            <FormField v-slot="{ field }"  name="creerAccesClient">
              <FormItem class="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox :checked="field.value" @update:checked="field.onChange"
                    data-testid="validation-access-checkbox" />
                </FormControl>
                <div class="space-y-1 leading-none">
                  <FormLabel>Créer un accès client pour le suivi du dossier</FormLabel>
                </div>
              </FormItem>
            </FormField>
          </CardContent>
        </Card>


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
                    {{ values.civilite }} {{ values.prenom }} {{ values.nom }}
                  </p>
                  <p class="text-gray-600" data-testid="recap-client-phone">{{ values.telephone }}</p>
                  <p v-if="values.email" class="text-gray-600" data-testid="recap-client-email">{{
                    values.email }}</p>
                </div>
              </div>

              <div class="space-y-2">
                <h5 class="font-semibold text-gray-900 flex items-center">
                  <Home class="w-4 h-4 mr-2" />
                  Chantier
                </h5>
                <div class="pl-6 space-y-1">
                  <p class="font-medium" data-testid="recap-chantier-address">{{ values.chantierAdresse }}</p>
                  <p class="text-gray-600" data-testid="recap-chantier-city-zip">
                    {{ values.chantierCodePostal }} {{ values.chantierVille }}
                  </p>
                </div>
              </div>

              <div class="space-y-2">
                <h5 class="font-semibold text-gray-900 flex items-center">
                  <AlertTriangle class="w-4 h-4 mr-2" />
                  Sinistre
                </h5>
                <div class="pl-6 space-y-1">
                  <p class="font-medium" data-testid="recap-sinistre-type">{{ values.sinistreType }}</p>
                  <Badge :class="niveauxUrgence.find((n) => n.value === values.sinistreUrgence)?.color || 'bg-gray-100'
                    " data-testid="recap-sinistre-urgence">
                    Urgence {{niveauxUrgence.find((n) => n.value === values.sinistreUrgence)?.label}}
                  </Badge>
                </div>
              </div>

              <div class="space-y-2">
                <h5 class="font-semibold text-gray-900 flex items-center">
                  <Briefcase class="w-4 h-4 mr-2" />
                  Mission
                </h5>
                <div class="pl-6 space-y-1">
                  <p class="font-medium" data-testid="recap-mission-title">{{ values.titre }}</p>
                  <p v-if="values.budgetEstime" class="text-gray-600" data-testid="recap-mission-budget">
                    Budget: {{ values.budgetEstime }}€
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>


          <!-- Step 1 Navigation -->
          <div class="flex space-x-2 w-full">
            <Button @click="nextStep" class="flex items-center w-full space-x-2 bg-blue-600 text-white">
              <span>Suivant: Sous-missions</span>
            </Button>
          </div>
          </div>

          <!-- Step 2: Sub-missions Planning -->
          <div v-show="currentStep === 2">
            <Card>
              <CardHeader>
                <CardTitle class="flex items-center space-x-2">
                  <Briefcase class="w-5 h-5 text-blue-600" />
                  <span>Planification des sous-missions</span>
                </CardTitle>
                <CardDescription>
                  Divisez votre mission en sous-missions spécialisées (optionnel)
                </CardDescription>
              </CardHeader>
              <CardContent class="space-y-6">
                <div class="flex items-center justify-between">
                  <p class="text-sm text-gray-600">
                    Les sous-missions permettent d'assigner différents corps de métier à des tâches spécifiques.
                  </p>
                  <Button @click="addSubMission" variant="outline" class="flex items-center space-x-2">
                    <Send class="w-4 h-4" />
                    <span>Ajouter une sous-mission</span>
                  </Button>
                </div>

                <!-- Sub-missions List -->
                <div v-if="subMissions.length > 0" class="space-y-4">
                  <div v-for="(sub, index) in subMissions" :key="sub.id" class="border rounded-lg p-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Spécialisation *</Label>
                        <Select v-model="sub.specialization">
                          <SelectTrigger>
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
                        <Label>Titre *</Label>
                        <Input v-model="sub.title" placeholder="Titre de la sous-mission" />
                      </div>
                    </div>
                    <div class="mt-4">
                      <Label>Description *</Label>
                      <Textarea v-model="sub.description" placeholder="Description détaillée de la sous-mission" rows="2" />
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <Label>Urgence</Label>
                        <Select v-model="sub.urgence">
                          <SelectTrigger>
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
                        <Label>Coût estimé (€)</Label>
                        <Input v-model="sub.estimatedCost" type="number" placeholder="0" />
                      </div>
                      <div>
                        <Label>Durée estimée (heures)</Label>
                        <Input v-model="sub.estimatedDurationHours" type="number" placeholder="0" />
                      </div>
                    </div>
                    <div class="flex justify-end mt-4">
                      <Button @click="removeSubMission(index)" variant="destructive" size="sm">
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </div>

                <div v-else class="text-center py-8 text-gray-500">
                  <p>Aucune sous-mission planifiée</p>
                  <p class="text-sm">Vous pouvez créer la mission sans sous-missions et les ajouter plus tard.</p>
                </div>
              </CardContent>
            </Card>

            <!-- Step 2 Navigation -->
            <div class="flex space-x-2 w-full mt-6">
              <Button @click="previousStep" variant="outline" class="w-full">
                <span>Précédent</span>
              </Button>
              <Button @click="nextStep" class="flex items-center w-full space-x-2 bg-blue-600 text-white">
                <span>Suivant: Récapitulatif</span>
              </Button>
            </div>
          </div>

          <!-- Step 3: Review and Submit -->
          <div v-show="currentStep === 3">
            <form @submit.prevent="onSubmit">
              <!-- Final Review Card would go here -->
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
                          {{ values.civilite }} {{ values.prenom }} {{ values.nom }}
                        </p>
                        <p class="text-gray-600" data-testid="recap-client-phone">{{ values.telephone }}</p>
                        <p v-if="values.email" class="text-gray-600" data-testid="recap-client-email">{{ values.email }}</p>
                      </div>
                    </div>

                    <div class="space-y-2">
                      <h5 class="font-semibold text-gray-900 flex items-center">
                        <Home class="w-4 h-4 mr-2" />
                        Chantier
                      </h5>
                      <div class="pl-6 space-y-1">
                        <p class="font-medium" data-testid="recap-chantier-address">{{ values.chantierAdresse }}</p>
                        <p class="text-gray-600" data-testid="recap-chantier-city-zip">
                          {{ values.chantierCodePostal }} {{ values.chantierVille }}
                        </p>
                      </div>
                    </div>

                    <div class="space-y-2">
                      <h5 class="font-semibold text-gray-900 flex items-center">
                        <AlertTriangle class="w-4 h-4 mr-2" />
                        Sinistre
                      </h5>
                      <div class="pl-6 space-y-1">
                        <p class="font-medium" data-testid="recap-sinistre-type">{{ values.sinistreType }}</p>
                        <Badge :class="niveauxUrgence.find((n) => n.value === values.sinistreUrgence)?.color || 'bg-gray-100'
                          " data-testid="recap-sinistre-urgence">
                          Urgence {{ niveauxUrgence.find((n) => n.value === values.sinistreUrgence)?.label }}
                        </Badge>
                      </div>
                    </div>

                    <div class="space-y-2">
                      <h5 class="font-semibold text-gray-900 flex items-center">
                        <Briefcase class="w-4 h-4 mr-2" />
                        Mission
                      </h5>
                      <div class="pl-6 space-y-1">
                        <p class="font-medium" data-testid="recap-mission-title">{{ values.titre }}</p>
                        <p v-if="values.budgetEstime" class="text-gray-600" data-testid="recap-mission-budget">
                          Budget: {{ values.budgetEstime }}€
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Sub-missions Summary -->
                  <div v-if="subMissions.length > 0" class="mt-6 pt-6 border-t">
                    <h5 class="font-semibold text-gray-900 mb-4">Sous-missions ({{ subMissions.length }})</h5>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div v-for="sub in subMissions" :key="sub.id" class="bg-gray-50 p-3 rounded-lg">
                        <div class="font-medium">{{ sub.specialization }}</div>
                        <div class="text-sm text-gray-600">{{ sub.title }}</div>
                        <div v-if="sub.estimatedCost" class="text-xs text-gray-500">{{ sub.estimatedCost }}€</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <!-- Final Navigation -->
              <div class="flex space-x-2 w-full mt-6">
                <Button @click="previousStep" variant="outline" class="w-full" type="button">
                  <span>Précédent</span>
                </Button>
                <Button type="submit"
                  class="flex items-center w-full space-x-2 bg-black text-white rounded-md px-4 py-2" data-testid="create-mission-button">
                  <Send class="w-4 h-4" />
                  <span>Créer la mission</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
