<template>
  <Card>
    <CardHeader>
      <CardTitle>Documents obligatoires</CardTitle>
      <CardDescription>
        Téléchargez les documents nécessaires à votre inscription
      </CardDescription>
    </CardHeader>
    <CardContent class="space-y-6">
      <form @submit="onSubmit" class="space-y-6">
        <!-- KBIS Document -->
        <div class="space-y-2">
          <Label>Extrait KBIS (moins de 3 mois) *</Label>
          <div 
            class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
            @click="triggerFileInput('kbis')"
            @dragover.prevent
            @drop.prevent="handleDrop($event, 'kbis')"
          >
            <input
              ref="kbisInput"
              type="file"
              class="hidden"
              accept=".pdf"
              @change="handleFileSelect($event, 'kbis')"
            />
            <div v-if="!kbisFile">
              <Upload class="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p class="text-sm text-gray-600">
                Cliquez ou glissez votre KBIS ici
              </p>
              <p class="text-xs text-gray-500 mt-1">PDF uniquement, max 5MB</p>
            </div>
            <div v-else class="flex items-center justify-center">
              <CheckCircle class="h-6 w-6 text-green-500 mr-2" />
              <span class="text-sm font-medium">{{ kbisFile.name }}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                class="ml-2"
                @click.stop="removeFile('kbis')"
              >
                ×
              </Button>
            </div>
          </div>
          <ErrorMessage name="kbis" class="text-sm text-red-500" />
        </div>

        <!-- Insurance Document -->
        <div class="space-y-2">
          <Label>Attestation d'assurance responsabilité civile *</Label>
          <div 
            class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
            @click="triggerFileInput('assurance')"
            @dragover.prevent
            @drop.prevent="handleDrop($event, 'assurance')"
          >
            <input
              ref="assuranceInput"
              type="file"
              class="hidden"
              accept=".pdf"
              @change="handleFileSelect($event, 'assurance')"
            />
            <div v-if="!assuranceFile">
              <Upload class="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p class="text-sm text-gray-600">
                Cliquez ou glissez votre attestation ici
              </p>
              <p class="text-xs text-gray-500 mt-1">PDF uniquement, max 5MB</p>
            </div>
            <div v-else class="flex items-center justify-center">
              <CheckCircle class="h-6 w-6 text-green-500 mr-2" />
              <span class="text-sm font-medium">{{ assuranceFile.name }}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                class="ml-2"
                @click.stop="removeFile('assurance')"
              >
                ×
              </Button>
            </div>
          </div>
          <ErrorMessage name="assurance" class="text-sm text-red-500" />
        </div>

        <!-- Optional Agreement Document -->
        <div v-if="accountType === 'PRESTATAIRE'" class="space-y-2">
          <Label>Agrément ou certification (optionnel)</Label>
          <div 
            class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
            @click="triggerFileInput('agrement')"
            @dragover.prevent
            @drop.prevent="handleDrop($event, 'agrement')"
          >
            <input
              ref="agrementInput"
              type="file"
              class="hidden"
              accept=".pdf"
              @change="handleFileSelect($event, 'agrement')"
            />
            <div v-if="!agrementFile">
              <Upload class="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p class="text-sm text-gray-600">
                Cliquez ou glissez votre agrément ici
              </p>
              <p class="text-xs text-gray-500 mt-1">PDF uniquement, max 5MB</p>
            </div>
            <div v-else class="flex items-center justify-center">
              <CheckCircle class="h-6 w-6 text-green-500 mr-2" />
              <span class="text-sm font-medium">{{ agrementFile.name }}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                class="ml-2"
                @click.stop="removeFile('agrement')"
              >
                ×
              </Button>
            </div>
          </div>
        </div>

        <!-- Upload Progress -->
        <div v-if="uploadProgress > 0 && uploadProgress < 100" class="space-y-2">
          <div class="flex justify-between text-sm">
            <span>Téléchargement en cours...</span>
            <span>{{ uploadProgress }}%</span>
          </div>
          <Progress :value="uploadProgress" class="w-full" />
        </div>

        <!-- Error Alert -->
        <Alert v-if="uploadError" class="border-red-300 bg-red-50">
          <AlertCircle class="h-4 w-4" />
          <AlertDescription class="text-red-700">
            {{ uploadError }}
          </AlertDescription>
        </Alert>

        <div class="flex justify-between pt-4">
          <Button type="button" variant="outline" @click="$emit('go-back')">
            <ArrowLeft class="h-4 w-4 mr-2" />
            Retour
          </Button>
          <Button type="submit" :disabled="!meta.valid || uploading">
            <Loader2 v-if="uploading" class="h-4 w-4 animate-spin mr-2" />
            Continuer
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useForm, Field, ErrorMessage } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, Upload, Loader2, ArrowLeft, AlertCircle } from 'lucide-vue-next'
import { documentsSchema } from '@/schemas/registration-schemas'
import { validatePdfFile } from '@/utils/file-validation'
import { FILE_SIZE_LIMITS } from '@/constants'

interface Props {
  accountType: string
  initialValues?: {
    kbis?: File
    assurance?: File
    agrement?: File
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'submit': [data: { kbis: File; assurance: File; agrement?: File }]
  'go-back': []
}>()

const kbisFile = ref<File | null>(null)
const assuranceFile = ref<File | null>(null)
const agrementFile = ref<File | null>(null)
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadError = ref('')

const kbisInput = ref<HTMLInputElement>()
const assuranceInput = ref<HTMLInputElement>()
const agrementInput = ref<HTMLInputElement>()

const { handleSubmit, meta, setFieldValue, setFieldError } = useForm({
  validationSchema: toTypedSchema(documentsSchema)
})

const triggerFileInput = (type: string) => {
  if (type === 'kbis') kbisInput.value?.click()
  else if (type === 'assurance') assuranceInput.value?.click()
  else if (type === 'agrement') agrementInput.value?.click()
}

const validateFile = (file: File): string | null => {
  const validation = validatePdfFile(file)
  return validation.isValid ? null : (validation.error ?? null)
}

const handleFileSelect = (event: Event, type: 'kbis' | 'assurance' | 'agrement') => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    handleFile(file, type)
  }
}

const handleDrop = (event: DragEvent, type: 'kbis' | 'assurance' | 'agrement') => {
  const file = event.dataTransfer?.files[0]
  if (file) {
    handleFile(file, type)
  }
}

const handleFile = (file: File, type: 'kbis' | 'assurance' | 'agrement') => {
  uploadError.value = ''
  
  const error = validateFile(file)
  if (error) {
    setFieldError(type, error)
    uploadError.value = error
    return
  }

  if (type === 'kbis') {
    kbisFile.value = file
    setFieldValue('kbis', file)
  } else if (type === 'assurance') {
    assuranceFile.value = file
    setFieldValue('assurance', file)
  } else if (type === 'agrement') {
    agrementFile.value = file
    setFieldValue('agrement', file)
  }
}

const removeFile = (type: string) => {
  if (type === 'kbis') {
    kbisFile.value = null
    setFieldValue('kbis', null)
    if (kbisInput.value) kbisInput.value.value = ''
  } else if (type === 'assurance') {
    assuranceFile.value = null
    setFieldValue('assurance', null)
    if (assuranceInput.value) assuranceInput.value.value = ''
  } else if (type === 'agrement') {
    agrementFile.value = null
    setFieldValue('agrement', null)
    if (agrementInput.value) agrementInput.value.value = ''
  }
}

const onSubmit = handleSubmit(async (values) => {
  if (!kbisFile.value || !assuranceFile.value) return

  uploading.value = true
  uploadProgress.value = 0

  try {
    // Simulate upload progress
    const interval = setInterval(() => {
      uploadProgress.value += 10
      if (uploadProgress.value >= 100) {
        clearInterval(interval)
        uploading.value = false
        emit('submit', {
          kbis: kbisFile.value!,
          assurance: assuranceFile.value!,
          agrement: agrementFile.value || undefined
        })
      }
    }, 200)
  } catch (error) {
    uploading.value = false
    uploadError.value = 'Erreur lors du téléchargement des documents'
  }
})
</script>