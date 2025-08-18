<template>
  <Card class="shadow-sm border-0 bg-white">
    <CardHeader class="pb-4">
      <CardTitle class="flex items-center space-x-3">
        <div class="flex items-center justify-center w-8 h-8 bg-orange-50 rounded-lg">
          <Upload class="w-4 h-4 text-orange-600" />
        </div>
        <span class="text-lg font-semibold">Ajouter un document</span>
      </CardTitle>
    </CardHeader>
    <CardContent class="pt-0 space-y-4">
      <!-- File Upload Area -->
      <div
        class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
        :class="{ 'border-blue-400 bg-blue-50': isDragOver }"
        @drop="handleDrop"
        @dragover.prevent="isDragOver = true"
        @dragleave="isDragOver = false"
        @click="triggerFileInput"
      >
        <input
          ref="fileInput"
          type="file"
          multiple
          class="hidden"
          @change="handleFileSelect"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.xlsx,.xls"
        />
        
        <div v-if="!files.length">
          <Upload class="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p class="text-gray-600">
            Glissez-déposez vos fichiers ici ou 
            <span class="text-blue-600 font-medium">cliquez pour parcourir</span>
          </p>
          <p class="text-sm text-gray-500 mt-2">
            Formats supportés: PDF, DOC, DOCX, JPG, PNG, TXT, XLSX
          </p>
        </div>
      </div>

      <!-- File List -->
      <div v-if="files.length" class="space-y-3">
        <h4 class="font-medium text-gray-900">Fichiers sélectionnés ({{ files.length }})</h4>
        <div class="space-y-2">
          <div
            v-for="(file, index) in files"
            :key="index"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <FileText class="w-5 h-5 text-gray-500" />
              <div>
                <p class="font-medium text-sm">{{ file.name }}</p>
                <p class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              @click="removeFile(index)"
              class="text-red-600 hover:text-red-700"
            >
              <X class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <!-- Description Field -->
      <div v-if="files.length">
        <Label for="description">Description (optionnelle)</Label>
        <Textarea
          id="description"
          v-model="description"
          placeholder="Décrivez le contenu de ce document..."
          rows="3"
        />
      </div>

      <!-- Upload Actions -->
      <div v-if="files.length" class="flex items-center justify-between pt-4">
        <Button variant="outline" @click="clearFiles">
          <X class="w-4 h-4 mr-2" />
          Effacer tout
        </Button>
        
        <Button 
          @click="uploadFiles"
          :disabled="uploading || !files.length"
          class="bg-blue-600 hover:bg-blue-700"
        >
          <Upload v-if="!uploading" class="w-4 h-4 mr-2" />
          <div v-else class="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          {{ uploading ? 'Téléchargement...' : 'Télécharger' }}
        </Button>
      </div>

      <!-- Upload Progress -->
      <div v-if="uploading" class="space-y-2">
        <div class="flex items-center justify-between text-sm">
          <span>Progression</span>
          <span>{{ uploadProgress }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: uploadProgress + '%' }"
          ></div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Upload, FileText, X } from 'lucide-vue-next'
// Using direct fetch for file upload instead of Apollo mutation
import { handleGraphQLError, showSuccess } from '@/utils/error-handling'
import { useAuthStore } from '@/stores/auth'

interface Props {
  subMissionId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'upload-complete': [documents: any[]]
}>()

const authStore = useAuthStore()

// State
const files = ref<File[]>([])
const description = ref('')
const isDragOver = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const fileInput = ref<HTMLInputElement>()

// Using direct fetch for file uploads - no Apollo mutation needed

// Methods
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    addFiles(Array.from(target.files))
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  
  if (event.dataTransfer?.files) {
    addFiles(Array.from(event.dataTransfer.files))
  }
}

const addFiles = (newFiles: File[]) => {
  // Filter out duplicates and invalid files
  const validFiles = newFiles.filter(file => {
    const isDuplicate = files.value.some(existing => 
      existing.name === file.name && existing.size === file.size
    )
    const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB limit
    
    if (!isValidSize) {
      console.warn(`File ${file.name} is too large (max 10MB)`)
    }
    
    return !isDuplicate && isValidSize
  })
  
  files.value.push(...validFiles)
}

const removeFile = (index: number) => {
  files.value.splice(index, 1)
}

const clearFiles = () => {
  files.value = []
  description.value = ''
  uploadProgress.value = 0
  // Reset the file input element
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

const uploadFiles = async () => {
  if (!files.value.length) return
  
  uploading.value = true
  uploadProgress.value = 0
  
  try {
    const uploadedDocuments = []
    const totalFiles = files.value.length
    
    for (let i = 0; i < files.value.length; i++) {
      const file = files.value[i]
      
      // Use direct fetch for file upload with multipart/form-data
      const formData = new FormData()
      
      // Add the GraphQL operation
      formData.append('operations', JSON.stringify({
        query: `
          mutation UploadSubMissionDocument($subMissionId: UUID!, $file: Upload!, $description: String) {
            uploadSubMissionDocument(input: {
              subMissionId: $subMissionId
              file: $file
              description: $description
            }) {
              id
              filename
              fileType
              fileSize
              uploadedAt
              metadata
              ownerId
            }
          }
        `,
        variables: {
          subMissionId: props.subMissionId,
          file: null,
          description: description.value || null
        }
      }))
      
      // Map the file to the correct variable
      formData.append('map', JSON.stringify({
        '0': ['variables.file']
      }))
      
      // Add the actual file
      formData.append('0', file)
      
      // Get auth token
      const tokens = authStore.tokens
      
      // Make the request
      const response = await fetch(import.meta.env.VITE_APP_SERVER_GRAPHQL_URL || '/graphql', {
        method: 'POST',
        headers: {
          'Authorization': tokens?.token ? `Bearer ${tokens.token}` : ''
        },
        body: formData
      })
      
      // Check if the response is ok
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Upload response not ok:', response.status, response.statusText, errorText)
        throw new Error(`Upload failed with status ${response.status}: ${response.statusText}`)
      }
      
      // Get response text first to debug
      const responseText = await response.text()
      console.log('Upload response text:', responseText)
      
      // Try to parse as JSON
      let result
      try {
        result = JSON.parse(responseText)
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError)
        console.error('Response was:', responseText)
        throw new Error(`Server returned invalid JSON response: ${responseText.substring(0, 200)}`)
      }
      
      if (result.data?.uploadSubMissionDocument) {
        const doc = result.data.uploadSubMissionDocument
        // Transform Document response to match SubMissionDocument format
        const transformedDoc = {
          id: doc.id,
          filename: doc.filename,
          url: `/api/documents/${doc.id}/download`, // Construct URL
          contentType: doc.fileType,
          size: doc.fileSize,
          uploadDate: doc.uploadedAt,
          description: doc.metadata?.description || null,
          uploadedBy: doc.ownerId
        }
        uploadedDocuments.push(transformedDoc)
      } else if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Upload failed')
      } else {
        throw new Error('Unknown upload error')
      }
      
      // Update progress
      uploadProgress.value = Math.round(((i + 1) / totalFiles) * 100)
    }
    
    emit('upload-complete', uploadedDocuments)
    
    // Show success message
    showSuccess(`${uploadedDocuments.length} document(s) téléchargé(s) avec succès`)
    
    // Clear form immediately after successful upload
    clearFiles()
    
  } catch (error) {
    console.error('Error uploading files:', error)
    handleGraphQLError(error, 'Upload Document', { showToast: true })
  } finally {
    uploading.value = false
  }
}
</script>