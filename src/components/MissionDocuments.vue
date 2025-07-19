<template>
  <div class="space-y-4">
    <!-- Document Upload Section -->
    <DocumentUpload 
      v-if="canUpload"
      :mission-id="missionId" 
      @upload-complete="handleUploadComplete"
    />
    
    <!-- Documents List -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <FileText class="w-5 h-5" />
            <span>Documents de la mission ({{ documents.length }})</span>
          </div>
          <Button 
            v-if="canUpload" 
            variant="outline" 
            size="sm"
            @click="refreshDocuments"
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
          <p class="mt-2 text-gray-600">Chargement des documents...</p>
        </div>
        
        <!-- Empty State -->
        <div v-else-if="documents.length === 0" class="text-center py-8 text-gray-500">
          <Upload class="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Aucun document attaché à cette mission</p>
          <p v-if="canUpload" class="text-sm mt-2">
            Utilisez le formulaire ci-dessus pour ajouter des documents
          </p>
        </div>
        
        <!-- Documents Grid -->
        <div v-else class="space-y-3">
          <div 
            v-for="doc in documents" 
            :key="doc.id"
            class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center space-x-3 flex-1">
              <!-- File Type Icon -->
              <div class="flex-shrink-0">
                <FileText v-if="isTextFile(doc.contentType)" class="w-6 h-6 text-blue-500" />
                <FileImage v-else-if="isImageFile(doc.contentType)" class="w-6 h-6 text-green-500" />
                <Archive v-else-if="isArchiveFile(doc.contentType)" class="w-6 h-6 text-orange-500" />
                <FileText v-else class="w-6 h-6 text-gray-500" />
              </div>
              
              <!-- File Info -->
              <div class="flex-1 min-w-0">
                <p class="font-medium text-gray-900 truncate">{{ doc.filename }}</p>
                <div class="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{{ formatFileSize(doc.size) }}</span>
                  <span>{{ formatDate(doc.uploadDate) }}</span>
                  <span v-if="doc.description" class="truncate">{{ doc.description }}</span>
                </div>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                @click="downloadDocument(doc)"
                :disabled="downloading === doc.id"
              >
                <Download v-if="downloading !== doc.id" class="w-4 h-4 mr-2" />
                <div v-else class="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                {{ downloading === doc.id ? 'Téléchargement...' : 'Télécharger' }}
              </Button>
              
              <Button
                v-if="canDelete"
                variant="outline"
                size="sm"
                @click="confirmDelete(doc)"
                class="text-red-600 hover:text-red-700"
              >
                <Trash2 class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    
    <!-- Delete Confirmation Dialog -->
    <Dialog :open="showDeleteDialog" @update:open="showDeleteDialog = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer le document "{{ documentToDelete?.filename }}" ?
            Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="showDeleteDialog = false">
            Annuler
          </Button>
          <Button 
            variant="destructive" 
            @click="deleteDocument"
            :disabled="deleting"
          >
            {{ deleting ? 'Suppression...' : 'Supprimer' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  FileText, 
  Upload, 
  Download, 
  RefreshCw, 
  Trash2,
  FileImage,
  Archive
} from 'lucide-vue-next'
import { useQuery, useMutation } from '@vue/apollo-composable'
import { GET_MISSION_DOCUMENTS_QUERY, GET_DOCUMENT_DOWNLOAD_URL_QUERY } from '@/graphql/queries/mission-documents'
import { DELETE_DOCUMENT_MUTATION } from '@/graphql/mutations/mission-documents'
import { handleGraphQLError, showSuccess } from '@/utils/error-handling'
import DocumentUpload from './DocumentUpload.vue'
import { useAuthStore } from '@/stores/auth'
import { useMissionOperationsStore } from '@/stores/mission-operations'

interface Props {
  missionId: string
  canUpload?: boolean
  canDelete?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  canUpload: true,
  canDelete: false
})

const emit = defineEmits<{
  'document-added': [document: any]
}>()

const authStore = useAuthStore()
const missionOpsStore = useMissionOperationsStore()

// State
const documents = ref<any[]>([])
const loading = ref(false)
const downloading = ref<string | null>(null)
const deleting = ref(false)
const showDeleteDialog = ref(false)
const documentToDelete = ref<any>(null)

// GraphQL
const { refetch: refetchDocuments } = useQuery(GET_MISSION_DOCUMENTS_QUERY, { missionId: props.missionId })
const { mutate: getDownloadUrl } = useMutation(GET_DOCUMENT_DOWNLOAD_URL_QUERY)

// Computed
const canDelete = computed(() => {
  return props.canDelete || authStore.user?.accountType === 'ASSUREUR'
})

// Methods
const loadDocuments = async () => {
  loading.value = true
  try {
    const result = await refetchDocuments()
    if (result?.data?.getMissionDocuments) {
      documents.value = result.data.getMissionDocuments
    }
  } catch (error) {
    console.error('Error loading documents:', error)
    handleGraphQLError(error, 'Load Documents', { showToast: true })
  } finally {
    loading.value = false
  }
}

const refreshDocuments = () => {
  loadDocuments()
}

const handleUploadComplete = (newDocuments: any[]) => {
  // Create a new array to avoid mutating read-only arrays
  documents.value = [...documents.value, ...newDocuments]
  
  // Emit event for each new document to update parent component
  newDocuments.forEach(doc => {
    emit('document-added', doc)
  })
}

const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const isTextFile = (contentType: string): boolean => {
  return contentType.includes('text/') || 
         contentType.includes('application/pdf') || 
         contentType.includes('application/msword') ||
         contentType.includes('application/vnd.openxmlformats-officedocument')
}

const isImageFile = (contentType: string): boolean => {
  return contentType.startsWith('image/')
}

const isArchiveFile = (contentType: string): boolean => {
  return contentType.includes('application/zip') || 
         contentType.includes('application/x-rar') ||
         contentType.includes('application/x-7z')
}

const downloadDocument = async (doc: any) => {
  downloading.value = doc.id
  try {
    const result = await getDownloadUrl({ documentId: doc.id })
    
    if (result?.data?.getDocumentDownloadUrl) {
      const { url, filename } = result.data.getDocumentDownloadUrl
      
      // Create download link
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      showSuccess(`Document "${filename}" téléchargé`)
    }
  } catch (error) {
    console.error('Error downloading document:', error)
    handleGraphQLError(error, 'Download Document', { showToast: true })
  } finally {
    downloading.value = null
  }
}

const confirmDelete = (doc: any) => {
  documentToDelete.value = doc
  showDeleteDialog.value = true
}

const deleteDocument = async () => {
  if (!documentToDelete.value) return
  
  deleting.value = true
  try {
    await missionOpsStore.deleteDocument(documentToDelete.value.id)
    
    // Remove from local list
    documents.value = documents.value.filter(doc => doc.id !== documentToDelete.value.id)
    
    showDeleteDialog.value = false
    documentToDelete.value = null
    
  } catch (error) {
    console.error('Error deleting document:', error)
  } finally {
    deleting.value = false
  }
}

// Initialize
onMounted(() => {
  loadDocuments()
})
</script>