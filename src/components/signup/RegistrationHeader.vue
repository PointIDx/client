<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">
        Inscription {{ getAccountTypeLabel(accountType) }}
      </h1>
      <p class="text-lg text-gray-600">
        {{ getDescription(accountType) }}
      </p>
    </div>

    <!-- Progress bar -->
    <div class="space-y-2">
      <div class="flex justify-between text-sm font-medium text-gray-900">
        <span>Étape {{ currentStep }} sur {{ totalSteps }}</span>
        <span>{{ Math.round((currentStep / totalSteps) * 100) }}% complété</span>
      </div>
      <Progress :value="(currentStep / totalSteps) * 100" class="w-full" />
    </div>

    <!-- Steps indicator -->
    <div class="flex justify-center">
      <div class="flex items-center space-x-4 overflow-x-auto pb-2">
        <div 
          v-for="(step, index) in steps" 
          :key="step.id"
          class="flex items-center flex-shrink-0"
        >
          <!-- Step circle -->
          <div class="flex items-center">
            <div 
              :class="getStepCircleClass(index + 1)"
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
            >
              <CheckCircle v-if="index + 1 < currentStep" class="w-5 h-5" />
              <span v-else>{{ index + 1 }}</span>
            </div>
            
            <!-- Step label -->
            <span 
              :class="getStepLabelClass(index + 1)"
              class="ml-2 text-sm font-medium hidden sm:inline"
            >
              {{ step.label }}
            </span>
          </div>
          
          <!-- Connector line -->
          <div 
            v-if="index < steps.length - 1"
            :class="index + 1 < currentStep ? 'bg-green-500' : 'bg-gray-300'"
            class="w-8 h-0.5 mx-4 hidden sm:block"
          />
        </div>
      </div>
    </div>

    <!-- Current step info -->
    <div class="text-center bg-blue-50 rounded-lg p-4">
      <h3 class="font-medium text-blue-900 mb-1">
        {{ getCurrentStepTitle() }}
      </h3>
      <p class="text-sm text-blue-700">
        {{ getCurrentStepDescription() }}
      </p>
      
      <!-- Time estimate -->
      <div class="flex items-center justify-center mt-2 text-xs text-blue-600">
        <Clock class="w-4 h-4 mr-1" />
        <span>Temps estimé: {{ getCurrentStepTime() }}</span>
      </div>
    </div>

    <!-- Help and support -->
    <div class="text-center">
      <p class="text-sm text-gray-600 mb-2">
        Besoin d'aide pendant votre inscription ?
      </p>
      <div class="flex justify-center space-x-4 text-sm">
        <button 
          @click="$emit('show-help')"
          class="text-blue-600 hover:underline flex items-center"
        >
          <HelpCircle class="w-4 h-4 mr-1" />
          Guide d'aide
        </button>
        <button 
          @click="$emit('contact-support')"
          class="text-blue-600 hover:underline flex items-center"
        >
          <MessageCircle class="w-4 h-4 mr-1" />
          Contacter le support
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Clock, HelpCircle, MessageCircle } from 'lucide-vue-next'

interface StepInfo {
  id: string
  label: string
  title: string
  description: string
  timeEstimate: string
}

interface Props {
  accountType: string
  currentStep: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'show-help': []
  'contact-support': []
}>()

const getAccountTypeLabel = (type: string) => {
  const labels = {
    'PRESTATAIRE': 'Prestataire',
    'ASSUREUR': 'Assureur',
    'SOCIETAIRE': 'Particulier'
  }
  return labels[type as keyof typeof labels] || ''
}

const getDescription = (type: string) => {
  const descriptions = {
    'PRESTATAIRE': 'Rejoignez notre réseau de prestataires de confiance',
    'ASSUREUR': 'Intégrez notre plateforme de gestion des sinistres',
    'SOCIETAIRE': 'Créez votre compte pour accéder à nos services'
  }
  return descriptions[type as keyof typeof descriptions] || 'Créez votre compte professionnel'
}

const getStepsForAccountType = (type: string): StepInfo[] => {
  const commonSteps = [
    {
      id: 'company',
      label: 'Entreprise',
      title: 'Informations de l\'entreprise',
      description: 'Validez votre SIRET et renseignez les informations légales',
      timeEstimate: '3-5 min'
    },
    {
      id: 'documents',
      label: 'Documents',
      title: 'Documents obligatoires',
      description: 'Téléchargez vos documents justificatifs',
      timeEstimate: '2-3 min'
    },
    {
      id: 'contact',
      label: 'Contact',
      title: 'Informations de contact',
      description: 'Renseignez vos coordonnées de contact',
      timeEstimate: '2 min'
    }
  ]

  const typeSpecificSteps = {
    'PRESTATAIRE': [
      {
        id: 'provider',
        label: 'Compétences',
        title: 'Informations prestataire',
        description: 'Détaillez vos compétences et zones d\'intervention',
        timeEstimate: '5-8 min'
      }
    ],
    'ASSUREUR': [
      {
        id: 'insurer',
        label: 'Assurance',
        title: 'Informations assureur',
        description: 'Spécifiez votre activité d\'assurance et agréments',
        timeEstimate: '4-6 min'
      }
    ],
    'SOCIETAIRE': [
      {
        id: 'personal',
        label: 'Personnel',
        title: 'Informations personnelles',
        description: 'Renseignez vos informations personnelles et votre logement',
        timeEstimate: '4-5 min'
      }
    ]
  }

  const accountStep = commonSteps.slice(0, 1) // Company info
  const documentsStep = commonSteps.slice(1, 2) // Documents
  const contactStep = commonSteps.slice(2, 3) // Contact
  const specificSteps = typeSpecificSteps[type as keyof typeof typeSpecificSteps] || []
  
  const finalSteps = [
    {
      id: 'account',
      label: 'Compte',
      title: 'Création du compte',
      description: 'Créez vos identifiants et acceptez les conditions',
      timeEstimate: '2-3 min'
    },
    {
      id: 'confirmation',
      label: 'Confirmation',
      title: 'Inscription réussie',
      description: 'Votre compte a été créé avec succès',
      timeEstimate: '1 min'
    }
  ]

  if (type === 'SOCIETAIRE') {
    // For SOCIETAIRE: Personal info, Contact, Account, Confirmation
    return [
      specificSteps[0], // Personal info instead of company info
      contactStep[0],
      finalSteps[0], // Account
      finalSteps[1]  // Confirmation
    ]
  } else {
    // For PRESTATAIRE/ASSUREUR: Company, Documents, Contact, Specific, Account, Confirmation
    return [
      accountStep[0],  // Company
      documentsStep[0], // Documents  
      contactStep[0],  // Contact
      ...specificSteps, // Provider/Insurer specific
      finalSteps[0],   // Account
      finalSteps[1]    // Confirmation
    ]
  }
}

const steps = computed(() => getStepsForAccountType(props.accountType))
const totalSteps = computed(() => steps.value.length)

const getStepCircleClass = (stepNumber: number) => {
  if (stepNumber < props.currentStep) {
    return 'bg-green-500 text-white'
  } else if (stepNumber === props.currentStep) {
    return 'bg-blue-500 text-white'
  } else {
    return 'bg-gray-200 text-gray-600'
  }
}

const getStepLabelClass = (stepNumber: number) => {
  if (stepNumber < props.currentStep) {
    return 'text-green-600'
  } else if (stepNumber === props.currentStep) {
    return 'text-blue-600'
  } else {
    return 'text-gray-500'
  }
}

const getCurrentStepTitle = () => {
  return steps.value[props.currentStep - 1]?.title || ''
}

const getCurrentStepDescription = () => {
  return steps.value[props.currentStep - 1]?.description || ''
}

const getCurrentStepTime = () => {
  return steps.value[props.currentStep - 1]?.timeEstimate || ''
}
</script>