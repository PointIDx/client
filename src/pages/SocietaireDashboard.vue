
<script setup lang="ts">
import { onMounted, ref } from "vue"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Building2,
  LogOut,
  Clock,
  CheckCircle,
  User,
  MapPin,
  Phone,
  Mail,
  Euro,
  Upload,
  X,
  FileText,
  Image,
  MessageSquare,
  Camera,
  Send,
  Shield,
} from "lucide-vue-next"

import { useSocietaireStore } from "@/stores/societaire"
import { TimelineStatut } from "@/enums/timeline-statut"
import { HistoriqueType } from "@/enums/historique-type"
import { DocumentType } from "@/enums/document-type"

const societaireStore = useSocietaireStore()

const emit = defineEmits(["logout"])

const selectedFiles = ref<File[]>([])
const comment = ref("")
const isUploading = ref(false)
const uploadSuccess = ref(false)

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    const files = Array.from(target.files)
    selectedFiles.value = [...selectedFiles.value, ...files]
  }
}

const removeFile = (index: number) => {
  selectedFiles.value = selectedFiles.value.filter((_, i) => i !== index)
}

const handleSubmit = async () => {
  if (selectedFiles.value.length === 0 && !comment.value.trim()) return

  isUploading.value = true
  let success = false;

  if (selectedFiles.value.length > 0) {
    for (const file of selectedFiles.value) {
      success = await societaireStore.sendFile(file, comment.value);
      if (!success) break; // Stop if any file upload fails
    }
  }

  if (comment.value.trim() && !selectedFiles.value.length) {
    success = await societaireStore.sendComment(comment.value);
  }

  isUploading.value = false
  uploadSuccess.value = success;
  selectedFiles.value = []
  comment.value = ""
  
  setTimeout(() => uploadSuccess.value = false, 3000)
}

const getStatusColor = (statut: string) => {
  switch (statut) {
    case TimelineStatut.Termine: return "text-green-600 bg-green-100/50 border-green-300"
    case TimelineStatut.EnCours: return "text-blue-600 bg-blue-100/50 border-blue-300"
    case TimelineStatut.Attente: return "text-gray-600 bg-gray-100/50 border-gray-300"
    default: return "text-gray-600 bg-gray-100/50 border-gray-300"
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case HistoriqueType.Client: return "bg-blue-100/60 border-blue-300"
    case HistoriqueType.Prestataire: return "bg-green-100/60 border-green-300"
    case HistoriqueType.Assureur: return "bg-purple-100/60 border-purple-300"
    default: return "bg-gray-100/60 border-gray-200"
  }
}

const onLogout = () => {
  societaireStore.logout()
  emit("logout")
}

onMounted(() => {
  societaireStore.fetchSocietaireDossier();
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 font-mono">
    <!-- Header -->
    <header class="border-b border-gray-200 bg-white/50 backdrop-blur-sm sticky top-0 z-50">
      <div class="mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
            <Building2 class="h-5 w-5 text-white" />
          </div>
          <div>
            <span class="text-lg font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              PointID
            </span>
            <span class="text-gray-500 text-sm ml-2">/ ESPACE SOCIÉTAIRE</span>
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <div class="text-right">
            <div class="text-gray-900 text-sm font-semibold">{{ societaireStore.email }}</div>
            <div class="text-gray-500 text-xs">Dossier: {{ societaireStore.dossierNumber }}</div>
          </div>
          <Button
            @click="onLogout"
            variant="outline"
            size="sm"
            class="border-gray-300 text-gray-500 hover:text-gray-900 hover:border-gray-400 bg-transparent"
          >
            <LogOut class="h-4 w-4 mr-2" />
            DÉCONNEXION
          </Button>
        </div>
      </div>
    </header>

    <div class="mx-auto px-4 py-8">
      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Colonne principale -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Informations du dossier -->
          <Card class="bg-white/50 border-gray-200">
            <CardHeader>
              <div class="flex items-center justify-between">
                <CardTitle class="text-xl font-bold text-gray-900 flex items-center">
                  <FileText class="h-5 w-5 mr-2 text-blue-500" />
                  DOSSIER SINISTRE
                </CardTitle>
                <Badge :class="`${getStatusColor(societaireStore.dossierData?.statut || '')} border font-mono`">
                  {{ societaireStore.dossierData?.statut.toUpperCase() }}
                </Badge>
              </div>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <Label class="text-gray-500 text-sm">TYPE DE SINISTRE</Label>
                  <p class="text-gray-900 font-semibold">{{ societaireStore.dossierData?.type }}</p>
                </div>
                <div>
                  <Label class="text-gray-500 text-sm">DATE DE CRÉATION</Label>
                  <p class="text-gray-900 font-semibold">{{ societaireStore.dossierData?.dateCreation }}</p>
                </div>
              </div>
              <div>
                <Label class="text-gray-500 text-sm">DESCRIPTION</Label>
                <p class="text-gray-900">{{ societaireStore.dossierData?.description }}</p>
              </div>
              <div>
                <Label class="text-gray-500 text-sm flex items-center">
                  <MapPin class="h-4 w-4 mr-1" />
                  ADRESSE D'INTERVENTION
                </Label>
                <p class="text-gray-900">{{ societaireStore.dossierData?.adresse }}</p>
              </div>
            </CardContent>
          </Card>

          <!-- Timeline -->
          <Card class="bg-white/50 border-gray-200">
            <CardHeader>
              <CardTitle class="text-xl font-bold text-gray-900 flex items-center">
                <Clock class="h-5 w-5 mr-2 text-green-500" />
                SUIVI DE L'INTERVENTION
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-6">
                <div v-for="(etape, index) in societaireStore.timeline" :key="index" class="flex items-start space-x-4">
                  <div :class="`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    etape.statut === TimelineStatut.Termine 
                      ? 'bg-green-100/60 border-green-400 text-green-600' 
                      : etape.statut === TimelineStatut.EnCours
                      ? 'bg-blue-100/60 border-blue-400 text-blue-600 animate-pulse'
                      : 'bg-gray-100/60 border-gray-300 text-gray-600'
                  }`">
                    <component :is="etape.icon" class="h-5 w-5" />
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center justify-between">
                      <h3 :class="`font-semibold ${
                        etape.statut === TimelineStatut.Termine ? 'text-green-600' :
                        etape.statut === TimelineStatut.EnCours ? 'text-blue-600' : 'text-gray-600'
                      }`">
                        {{ etape.etape.toUpperCase() }}
                      </h3>
                      <span v-if="etape.date" class="text-gray-500 text-sm">{{ etape.date }}</span>
                    </div>
                    <p class="text-gray-500 text-sm mt-1">{{ etape.description }}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Historique des échanges -->
          <Card class="bg-white/50 border-gray-200">
            <CardHeader>
              <CardTitle class="text-xl font-bold text-gray-900 flex items-center">
                <MessageSquare class="h-5 w-5 mr-2 text-purple-500" />
                HISTORIQUE DES ÉCHANGES
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div v-for="(echange, index) in societaireStore.historique" :key="index" :class="`p-4 rounded-lg border ${getTypeColor(echange.type)}`">
                  <div class="flex items-center justify-between mb-2">
                    <Badge :class="`text-xs ${
                      echange.type === HistoriqueType.Client ? 'bg-blue-500 text-white' :
                      echange.type === HistoriqueType.Prestataire ? 'bg-green-500 text-white' :
                      'bg-purple-500 text-white'
                    }`">
                      {{ echange.auteur.toUpperCase() }}
                    </Badge>
                    <span class="text-gray-500 text-xs">{{ echange.date }}</span>
                  </div>
                  <p class="text-gray-700 mb-2">{{ echange.message }}</p>
                  <div v-if="echange.fichiers.length > 0" class="flex flex-wrap gap-2">
                    <Badge v-for="(fichier, fileIndex) in echange.fichiers" :key="fileIndex" variant="outline" class="text-xs border-gray-300 text-gray-500">
                      📎 {{ fichier }}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Colonne latérale -->
        <div class="space-y-8">
          <!-- Prestataire -->
          <Card class="bg-white/50 border-gray-200">
            <CardHeader>
              <CardTitle class="text-lg font-bold text-gray-900 flex items-center">
                <User class="h-5 w-5 mr-2 text-green-500" />
                PRESTATAIRE ASSIGNÉ
              </CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div>
                <h3 class="font-semibold text-gray-900">{{ societaireStore.dossierData?.prestataire.nom }}</h3>
                <p class="text-gray-500">{{ societaireStore.dossierData?.prestataire.contact }}</p>
              </div>
              <div class="space-y-2">
                <div class="flex items-center space-x-2 text-gray-700">
                  <Phone class="h-4 w-4 text-green-500" />
                  <span class="text-sm">{{ societaireStore.dossierData?.prestataire.telephone }}</span>
                </div>
                <div class="flex items-center space-x-2 text-gray-700">
                  <Mail class="h-4 w-4 text-blue-500" />
                  <span class="text-sm">{{ societaireStore.dossierData?.prestataire.email }}</span>
                </div>
              </div>
              <div>
                <Label class="text-gray-500 text-sm">SPÉCIALITÉS</Label>
                <div class="flex flex-wrap gap-1 mt-1">
                  <Badge v-for="(spec, index) in societaireStore.dossierData?.prestataire.specialites" :key="index" variant="outline" class="text-xs border-gray-300 text-gray-500">
                    {{ spec }}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Estimation -->
          <Card class="bg-white/50 border-gray-200">
            <CardHeader>
              <CardTitle class="text-lg font-bold text-gray-900 flex items-center">
                <Euro class="h-5 w-5 mr-2 text-yellow-500" />
                ESTIMATION
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-center">
                <div class="text-3xl font-bold text-yellow-500 mb-2">{{ societaireStore.dossierData?.estimation }}</div>
                <p class="text-gray-500 text-sm">Estimation fournie par le prestataire</p>
              </div>
            </CardContent>
          </Card>

          <!-- Ajout de contenu -->
          <Card class="bg-white/50 border-gray-200">
            <CardHeader>
              <CardTitle class="text-lg font-bold text-gray-900 flex items-center">
                <Camera class="h-5 w-5 mr-2 text-cyan-500" />
                ENRICHIR LE DOSSIER
              </CardTitle>
              <CardDescription class="text-gray-500">
                Ajoutez des photos ou commentaires pour améliorer le suivi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form @submit.prevent="handleSubmit" class="space-y-4">
                <!-- Upload de fichiers -->
                <div>
                  <Label class="text-gray-900 text-sm font-semibold">FICHIERS</Label>
                  <div class="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors duration-300">
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      @change="handleFileSelect"
                      class="hidden"
                      id="file-upload"
                    />
                    <label for="file-upload" class="cursor-pointer">
                      <Upload class="h-8 w-8 text-gray-500 mx-auto mb-2" />
                      <p class="text-gray-500 text-sm">
                        Cliquez pour ajouter des fichiers
                        <br />
                        <span class="text-xs">JPG, PNG, PDF - Max 10MB</span>
                      </p>
                    </label>
                  </div>

                  <!-- Fichiers sélectionnés -->
                  <div v-if="selectedFiles.length > 0" class="mt-3 space-y-2">
                    <div v-for="(file, index) in selectedFiles" :key="index" class="flex items-center justify-between bg-gray-100 p-2 rounded">
                      <div class="flex items-center space-x-2">
                        <Image v-if="file.type.startsWith('image/')" class="h-4 w-4 text-blue-500" />
                        <FileText v-else class="h-4 w-4 text-red-500" />
                        <span class="text-gray-900 text-sm">{{ file.name }}</span>
                        <span class="text-gray-500 text-xs">
                          ({{ (file.size / 1024 / 1024).toFixed(1) }} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        @click="removeFile(index)"
                        class="text-gray-500 hover:text-red-500 transition-colors duration-300"
                      >
                        <X class="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Commentaire -->
                <div>
                  <Label for="comment" class="text-gray-900 text-sm font-semibold">
                    COMMENTAIRE (OPTIONNEL)
                  </Label>
                  <Textarea
                    id="comment"
                    v-model="comment"
                    placeholder="Ajoutez un commentaire pour contextualiser vos fichiers..."
                    class="mt-2 bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-cyan-500 focus:ring-cyan-500/20 resize-none"
                    rows="3"
                  />
                </div>

                <!-- Message de succès -->
                <div v-if="uploadSuccess" class="flex items-center space-x-2 text-green-600 bg-green-100/50 border border-green-300 rounded-lg p-3">
                  <CheckCircle class="h-4 w-4 flex-shrink-0" />
                  <span class="text-sm">Contenu ajouté avec succès !</span>
                </div>

                <!-- Bouton d'envoi -->
                <Button
                  type="submit"
                  :disabled="isUploading || (selectedFiles.length === 0 && !comment.trim())"
                  class="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div v-if="isUploading" class="flex items-center justify-center space-x-2">
                    <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>ENVOI EN COURS...</span>
                  </div>
                  <span v-else class="flex items-center justify-center">
                    <Send class="h-4 w-4 mr-2" />
                    AJOUTER AU DOSSIER
                  </span>
                </Button>
              </form>
            </CardContent>
          </Card>

          <!-- Documents -->
          <Card class="bg-white/50 border-gray-200">
            <CardHeader>
              <CardTitle class="text-lg font-bold text-gray-900 flex items-center">
                <FileText class="h-5 w-5 mr-2 text-orange-500" />
                DOCUMENTS DU DOSSIER
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div v-for="(doc, index) in societaireStore.documents" :key="index" class="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <Image v-if="doc.type === DocumentType.Image"   class="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <FileText v-else  class="h-5 w-5 text-red-500 flex-shrink-0" />
                    <div>
                      <p class="text-gray-900 font-medium">{{ doc.nom }}</p>
                      <p class="text-gray-500 text-xs">{{ doc.taille }} - {{ doc.auteur }} - {{ doc.date }}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" class="text-gray-500 hover:text-gray-900">
                    Télécharger
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>
