<template>
  <Card>
    <CardHeader class="text-center">
      <div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <CheckCircle class="w-8 h-8 text-green-600" />
      </div>
      <CardTitle class="text-2xl text-green-700">Inscription réussie !</CardTitle>
      <CardDescription class="text-lg">
        Votre compte {{ accountType.toLowerCase() }} a été créé avec succès
      </CardDescription>
    </CardHeader>
    <CardContent class="space-y-6">
      <!-- Success message -->
      <Alert class="bg-green-50 border-green-200">
        <CheckCircle class="h-4 w-4 text-green-600" />
        <AlertDescription class="text-green-800">
          <strong>Félicitations !</strong> Votre inscription a été validée.
          Un email de confirmation vous a été envoyé.
        </AlertDescription>
      </Alert>

      <!-- Registration summary -->
      <div class="space-y-4">
        <h4 class="font-medium text-gray-900">Récapitulatif de votre inscription</h4>
        
        <div class="bg-gray-50 rounded-lg p-4 space-y-3">
          <div class="flex justify-between">
            <span class="text-sm font-medium text-gray-600">Type de compte :</span>
            <span class="text-sm text-gray-900">{{ getAccountTypeLabel(accountType) }}</span>
          </div>
          
          <div v-if="companyInfo?.raisonSociale" class="flex justify-between">
            <span class="text-sm font-medium text-gray-600">Entreprise :</span>
            <span class="text-sm text-gray-900">{{ companyInfo.raisonSociale }}</span>
          </div>
          
          <div v-if="contactInfo?.email" class="flex justify-between">
            <span class="text-sm font-medium text-gray-600">Email :</span>
            <span class="text-sm text-gray-900">{{ contactInfo.email }}</span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-sm font-medium text-gray-600">Statut :</span>
            <span class="text-sm text-green-600 font-medium">Actif</span>
          </div>
        </div>
      </div>

      <!-- Next steps -->
      <div class="space-y-4">
        <h4 class="font-medium text-gray-900">Prochaines étapes</h4>
        
        <div class="space-y-3">
          <div class="flex items-start space-x-3">
            <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span class="text-xs font-medium text-blue-600">1</span>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">Vérifiez votre email</p>
              <p class="text-sm text-gray-600">
                Cliquez sur le lien de confirmation dans l'email que nous venons de vous envoyer
              </p>
            </div>
          </div>
          
          <div class="flex items-start space-x-3">
            <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span class="text-xs font-medium text-blue-600">2</span>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">Complétez votre profil</p>
              <p class="text-sm text-gray-600">
                Ajoutez les informations manquantes pour optimiser votre profil
              </p>
            </div>
          </div>
          
          <div v-if="accountType === 'PRESTATAIRE'" class="flex items-start space-x-3">
            <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span class="text-xs font-medium text-blue-600">3</span>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">Activez votre disponibilité</p>
              <p class="text-sm text-gray-600">
                Indiquez vos créneaux de disponibilité pour recevoir des missions
              </p>
            </div>
          </div>
          
          <div v-if="accountType === 'ASSUREUR'" class="flex items-start space-x-3">
            <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span class="text-xs font-medium text-blue-600">3</span>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">Configurez vos paramètres</p>
              <p class="text-sm text-gray-600">
                Définissez vos critères de recherche et vos préférences de prestataires
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Important information -->
      <Alert class="bg-blue-50 border-blue-200">
        <Info class="h-4 w-4 text-blue-600" />
        <AlertDescription class="text-blue-800">
          <strong>Important :</strong> 
          {{ getImportantMessage(accountType) }}
        </AlertDescription>
      </Alert>

      <!-- Action buttons -->
      <div class="flex flex-col sm:flex-row gap-3 pt-4">
        <Button 
          @click="goToDashboard" 
          class="flex-1 bg-green-600 hover:bg-green-700"
        >
          <Home class="h-4 w-4 mr-2" />
          Accéder à mon tableau de bord
        </Button>
        
        <Button 
          variant="outline" 
          @click="downloadGuide"
          class="flex-1"
        >
          <Download class="h-4 w-4 mr-2" />
          Télécharger le guide d'utilisation
        </Button>
      </div>

      <!-- Support contact -->
      <div class="text-center pt-4 border-t">
        <p class="text-sm text-gray-600 mb-2">
          Besoin d'aide ? Notre équipe est là pour vous accompagner
        </p>
        <div class="flex justify-center space-x-4 text-sm">
          <button 
            @click="openChat"
            class="text-blue-600 hover:underline flex items-center"
          >
            <MessageCircle class="h-4 w-4 mr-1" />
            Chat en direct
          </button>
          <a 
            href="mailto:support@pointid.fr" 
            class="text-blue-600 hover:underline flex items-center"
          >
            <Mail class="h-4 w-4 mr-1" />
            support@pointid.fr
          </a>
          <a 
            href="tel:+33123456789" 
            class="text-blue-600 hover:underline flex items-center"
          >
            <Phone class="h-4 w-4 mr-1" />
            01 23 45 67 89
          </a>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle, 
  Info, 
  Home, 
  Download, 
  MessageCircle, 
  Mail, 
  Phone 
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import type { CompanyInfo } from '@/interfaces/company-info'
import type { Contact } from '@/interfaces/contact'

interface Props {
  accountType: string
  companyInfo?: CompanyInfo
  contactInfo?: Contact
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'complete': []
}>()

const router = useRouter()

const getAccountTypeLabel = (type: string) => {
  const labels = {
    'PRESTATAIRE': 'Prestataire de services',
    'ASSUREUR': 'Compagnie d\'assurance',
    'SOCIETAIRE': 'Particulier'
  }
  return labels[type as keyof typeof labels] || type
}

const getImportantMessage = (type: string) => {
  const messages = {
    'PRESTATAIRE': 'Votre compte sera activé après validation de vos documents par notre équipe (24-48h).',
    'ASSUREUR': 'Votre accès aux fonctionnalités avancées sera activé après validation de votre agrément ACPR.',
    'SOCIETAIRE': 'Vous pouvez dès maintenant explorer nos services et contacter nos prestataires partenaires.'
  }
  return messages[type as keyof typeof messages] || 'Votre compte est maintenant actif.'
}

const goToDashboard = () => {
  const dashboardRoutes = {
    'PRESTATAIRE': '/prestataire-dashboard',
    'ASSUREUR': '/assureur-dashboard',
    'SOCIETAIRE': '/societaire-dashboard'
  }
  
  const route = dashboardRoutes[props.accountType as keyof typeof dashboardRoutes] || '/dashboard'
  router.push(route)
  emit('complete')
}

const downloadGuide = () => {
  // In a real app, this would trigger a file download
  const guides = {
    'PRESTATAIRE': '/guides/guide-prestataire.pdf',
    'ASSUREUR': '/guides/guide-assureur.pdf',
    'SOCIETAIRE': '/guides/guide-societaire.pdf'
  }
  
  const guideUrl = guides[props.accountType as keyof typeof guides] || '/guides/guide-general.pdf'
  
  // Create a temporary link to trigger download
  const link = document.createElement('a')
  link.href = guideUrl
  link.download = `guide-${props.accountType.toLowerCase()}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const openChat = () => {
  // In a real app, this would open a chat widget
  console.log('Opening chat support...')
  // You could integrate with services like Intercom, Zendesk, etc.
}
</script>