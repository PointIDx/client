<template>
  <div class="space-y-4">
    <!-- Add Comment Section -->
    <Card v-if="canComment">
      <CardHeader>
        <CardTitle class="flex items-center space-x-2">
          <MessageCircle class="w-5 h-5" />
          <span>Ajouter un commentaire</span>
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <Textarea
          v-model="newComment"
          placeholder="Écrivez votre commentaire ici..."
          rows="3"
          class="resize-none"
        />
        
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-500">
            {{ newComment.length }}/1000 caractères
          </div>
          
          <Button 
            @click="sendComment"
            :disabled="!newComment.trim() || sending || newComment.length > 1000"
            class="bg-blue-600 hover:bg-blue-700"
          >
            <Send v-if="!sending" class="w-4 h-4 mr-2" />
            <div v-else class="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            {{ sending ? 'Envoi...' : 'Envoyer' }}
          </Button>
        </div>
      </CardContent>
    </Card>
    
    <!-- Comments List -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <MessageCircle class="w-5 h-5" />
            <span>Messages et commentaires ({{ comments.length }})</span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            @click="refreshComments"
            :disabled="loading"
          >
            <RefreshCw class="w-4 h-4 mr-2" :class="{ 'animate-spin': loading }" />
            Actualiser
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-2 text-gray-600">Chargement des commentaires...</p>
        </div>
        
        <!-- Empty State -->
        <div v-else-if="comments.length === 0" class="text-center py-8 text-gray-500">
          <MessageCircle class="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Aucun commentaire pour cette mission</p>
          <p v-if="canComment" class="text-sm mt-2">
            Soyez le premier à ajouter un commentaire
          </p>
        </div>
        
        <!-- Comments List -->
        <div v-else class="space-y-4">
          <div 
            v-for="comment in sortedComments" 
            :key="comment.id"
            class="border-l-4 border-blue-200 pl-4 py-3"
            :class="{ 'border-green-200': isOwnComment(comment) }"
          >
            <!-- Comment Header -->
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-3">
                <Avatar class="h-8 w-8">
                  <AvatarFallback class="text-xs">
                    {{ getInitials(comment.expediteur) }}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span class="font-medium text-sm text-gray-900">
                    {{ comment.expediteur }}
                  </span>
                  <div class="flex items-center space-x-2 text-xs text-gray-500">
                    <Clock class="w-3 h-3" />
                    <span>{{ formatDate(comment.dateEnvoi) }}</span>
                    <Badge v-if="!comment.lu" variant="secondary" class="text-xs">
                      Non lu
                    </Badge>
                  </div>
                </div>
              </div>
              
              <!-- Comment Actions -->
              <div class="flex items-center space-x-1">
                <Button
                  v-if="isOwnComment(comment)"
                  variant="ghost"
                  size="sm"
                  class="text-green-600"
                  title="Votre commentaire"
                >
                  <User class="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <!-- Comment Content -->
            <div class="text-gray-700 leading-relaxed">
              {{ comment.contenu }}
            </div>
            
            <!-- Comment Metadata -->
            <div v-if="comment.createdAt !== comment.dateEnvoi" class="text-xs text-gray-400 mt-2">
              Modifié le {{ formatDate(comment.createdAt) }}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  MessageCircle, 
  Send, 
  RefreshCw, 
  Clock,
  User
} from 'lucide-vue-next'
import { useMutation } from '@vue/apollo-composable'
import { SEND_COMMENT_MUTATION } from '@/graphql/mutations/mission-comments'
import { handleGraphQLError, showSuccess } from '@/utils/error-handling'
import { useAuthStore } from '@/stores/auth'
import { useMissionOperationsStore } from '@/stores/mission-operations'

interface Props {
  missionId: string
  comments: Array<{
    id: string
    missionId: string
    userId: string
    expediteur: string
    contenu: string
    dateEnvoi: string
    lu: boolean
    createdAt: string
  }>
  canComment?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  canComment: true
})

const emit = defineEmits<{
  'comment-added': [comment: any]
  'refresh-requested': []
}>()

const authStore = useAuthStore()
const missionOpsStore = useMissionOperationsStore()

// State
const newComment = ref('')
const sending = ref(false)
const loading = ref(false)

// Computed
const sortedComments = computed(() => {
  return [...props.comments].sort((a, b) => 
    new Date(a.dateEnvoi).getTime() - new Date(b.dateEnvoi).getTime()
  )
})

// Methods
const sendComment = async () => {
  if (!newComment.value.trim()) return
  
  sending.value = true
  try {
    const result = await missionOpsStore.sendComment({
      missionId: props.missionId,
      content: newComment.value.trim()
    })
    
    if (result) {
      emit('comment-added', result)
      newComment.value = ''
    }
  } catch (error) {
    console.error('Error sending comment:', error)
  } finally {
    sending.value = false
  }
}

const refreshComments = () => {
  loading.value = true
  emit('refresh-requested')
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 24) {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  } else if (diffInHours < 7 * 24) {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  } else {
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const isOwnComment = (comment: any): boolean => {
  return comment.userId === authStore.user?.id
}
</script>