<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center space-x-2">
        <Upload class="w-5 h-5" />
        <span>Ajouter un document</span>
      </CardTitle>
    </CardHeader>
    <CardContent class="space-y-4">
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
import { useMutation } from '@vue/apollo-composable'
import { UPLOAD_MISSION_FILE_MUTATION } from '@/graphql/mutations/mission-documents'
import { handleGraphQLError, showSuccess } from '@/utils/error-handling'
import { useAuthStore } from '@/stores/auth'
import { useMissionOperationsStore } from '@/stores/mission-operations'

interface Props {
  missionId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'upload-complete': [documents: any[]]
}>()

const authStore = useAuthStore()
const missionOpsStore = useMissionOperationsStore()

// State
const files = ref<File[]>([])
const description = ref('')
const isDragOver = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const fileInput = ref<HTMLInputElement>()

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
      
      const result = await missionOpsStore.uploadMissionDocument({
        missionId: props.missionId,
        file: file,
        description: description.value || undefined
      })
      
      if (result) {
        uploadedDocuments.push(result)
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
  } finally {
    uploading.value = false
  }
}
</script>