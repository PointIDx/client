<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center space-x-2">
        <History class="w-5 h-5" />
        <span>Historique des modifications ({{ history.length }})</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <!-- Empty State -->
      <div v-if="history.length === 0" class="text-center py-8 text-gray-500">
        <History class="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>Aucun historique disponible</p>
      </div>
      
      <!-- History Timeline -->
      <div v-else class="space-y-4">
        <div 
          v-for="(entry, index) in sortedHistory" 
          :key="entry.id"
          class="relative"
        >
          <!-- Timeline Line -->
          <div 
            v-if="index < sortedHistory.length - 1"
            class="absolute left-4 top-8 bottom-0 w-px bg-gray-200"
          ></div>
          
          <!-- Timeline Item -->
          <div class="flex items-start space-x-4">
            <!-- Timeline Dot -->
            <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                 :class="getTimelineDotClass(entry.action)">
              <component :is="getActionIcon(entry.action)" class="w-4 h-4" />
            </div>
            
            <!-- Timeline Content -->
            <div class="flex-1 min-w-0 pb-4">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-medium text-gray-900">{{ formatAction(entry.action) }}</h4>
                  <p class="text-sm text-gray-600">{{ entry.entityType }}</p>
                </div>
                <div class="text-right">
                  <div class="text-xs text-gray-500">{{ formatDate(entry.timestamp) }}</div>
                  <div v-if="entry.ipAddress" class="text-xs text-gray-400">
                    {{ entry.ipAddress }}
                  </div>
                </div>
              </div>
              
              <!-- Value Changes -->
              <div v-if="entry.oldValue || entry.newValue" class="mt-2 p-3 bg-gray-50 rounded-lg">
                <div class="text-sm space-y-1">
                  <div v-if="entry.oldValue" class="flex items-center space-x-2">
                    <span class="text-red-600 font-medium">Ancien:</span>
                    <span class="text-gray-700">{{ entry.oldValue }}</span>
                  </div>
                  <div v-if="entry.newValue" class="flex items-center space-x-2">
                    <span class="text-green-600 font-medium">Nouveau:</span>
                    <span class="text-gray-700">{{ entry.newValue }}</span>
                  </div>
                </div>
              </div>
              
              <!-- User Agent (if available) -->
              <div v-if="showDetails && entry.userAgent" class="mt-2 text-xs text-gray-400">
                <details>
                  <summary class="cursor-pointer hover:text-gray-600">Détails techniques</summary>
                  <p class="mt-1 font-mono">{{ entry.userAgent }}</p>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Show Details Toggle -->
      <div v-if="history.length > 0" class="pt-4 border-t">
        <Button 
          variant="ghost" 
          size="sm"
          @click="showDetails = !showDetails"
          class="text-gray-500"
        >
          <Eye v-if="!showDetails" class="w-4 h-4 mr-2" />
          <EyeOff v-else class="w-4 h-4 mr-2" />
          {{ showDetails ? 'Masquer' : 'Afficher' }} les détails techniques
        </Button>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  History, 
  Eye, 
  EyeOff,
  Edit,
  Plus,
  Trash2,
  User,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  FileText,
  Send
} from 'lucide-vue-next'

interface Props {
  history: Array<{
    id: string
    entityType: string
    entityId: string
    action: string
    oldValue?: string
    newValue?: string
    userId: string
    timestamp: string
    ipAddress?: string
    userAgent?: string
  }>
}

const props = defineProps<Props>()

// State
const showDetails = ref(false)

// Computed
const sortedHistory = computed(() => {
  return [...props.history].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
})

// Methods
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours)
    return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`
  } else if (diffInHours < 7 * 24) {
    const days = Math.floor(diffInHours / 24)
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`
  } else {
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

const formatAction = (action: string): string => {
  const actionMap: Record<string, string> = {
    'CREATE': 'Création',
    'UPDATE': 'Modification',
    'DELETE': 'Suppression',
    'ASSIGN': 'Attribution',
    'ACCEPT': 'Acceptation',
    'REFUSE': 'Refus',
    'START': 'Démarrage',
    'COMPLETE': 'Finalisation',
    'SUSPEND': 'Suspension',
    'RESUME': 'Reprise',
    'CANCEL': 'Annulation',
    'VALIDATE': 'Validation',
    'COMMENT': 'Commentaire ajouté',
    'DOCUMENT_UPLOAD': 'Document téléchargé',
    'STATUS_CHANGE': 'Changement de statut',
    'USER_LOGIN': 'Connexion utilisateur',
    'USER_LOGOUT': 'Déconnexion utilisateur'
  }
  
  return actionMap[action] || action
}

const getActionIcon = (action: string) => {
  const iconMap: Record<string, any> = {
    'CREATE': Plus,
    'UPDATE': Edit,
    'DELETE': Trash2,
    'ASSIGN': User,
    'ACCEPT': CheckCircle,
    'REFUSE': XCircle,
    'START': Clock,
    'COMPLETE': CheckCircle,
    'SUSPEND': AlertTriangle,
    'RESUME': Clock,
    'CANCEL': XCircle,
    'VALIDATE': CheckCircle,
    'COMMENT': Send,
    'DOCUMENT_UPLOAD': FileText,
    'STATUS_CHANGE': Settings,
    'USER_LOGIN': User,
    'USER_LOGOUT': User
  }
  
  return iconMap[action] || Settings
}

const getTimelineDotClass = (action: string): string => {
  const classMap: Record<string, string> = {
    'CREATE': 'bg-blue-100 text-blue-600',
    'UPDATE': 'bg-yellow-100 text-yellow-600',
    'DELETE': 'bg-red-100 text-red-600',
    'ASSIGN': 'bg-purple-100 text-purple-600',
    'ACCEPT': 'bg-green-100 text-green-600',
    'REFUSE': 'bg-red-100 text-red-600',
    'START': 'bg-blue-100 text-blue-600',
    'COMPLETE': 'bg-green-100 text-green-600',
    'SUSPEND': 'bg-orange-100 text-orange-600',
    'RESUME': 'bg-blue-100 text-blue-600',
    'CANCEL': 'bg-red-100 text-red-600',
    'VALIDATE': 'bg-green-100 text-green-600',
    'COMMENT': 'bg-indigo-100 text-indigo-600',
    'DOCUMENT_UPLOAD': 'bg-teal-100 text-teal-600',
    'STATUS_CHANGE': 'bg-gray-100 text-gray-600',
    'USER_LOGIN': 'bg-emerald-100 text-emerald-600',
    'USER_LOGOUT': 'bg-gray-100 text-gray-600'
  }
  
  return classMap[action] || 'bg-gray-100 text-gray-600'
}
</script>