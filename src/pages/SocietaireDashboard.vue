<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
} from 'lucide-vue-next'

const props = defineProps({
  userEmail: {
    type: String,
    required: true,
  },
  dossierNumber: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['logout'])

const selectedFiles = ref<File[]>([])
const comment = ref("")
const isUploading = ref(false)
const uploadSuccess = ref(false)

// Données simulées du dossier
const dossierData = reactive({
  type: "Dégât des eaux",
  description: "Fuite d'eau dans la salle de bain suite à rupture de canalisation",
  dateCreation: "15 janvier 2024",
  adresse: "123 Rue de la République, 75011 Paris",
  statut: "En cours d'intervention",
  prestataire: {
    nom: "Plomberie Martin SARL",
    contact: "Marc Dubois",
    telephone: "01 23 45 67 89",
    email: "contact@plomberie-martin.fr",
    specialites: ["Plomberie", "Chauffage", "Sanitaire"]
  },
  estimation: "1,250 €"
})

// Timeline des étapes
const timeline = reactive([
  { 
    etape: "Dossier créé", 
    description: "Sinistre déclaré et enregistré", 
    date: "15 jan 2024", 
    statut: "termine", 
    icon: FileText 
  },
  { 
    etape: "Prestataire assigné", 
    description: "Professionnel sélectionné et contacté", 
    date: "16 jan 2024", 
    statut: "termine", 
    icon: User 
  },
  { 
    etape: "Mission acceptée", 
    description: "Prise en charge confirmée par le prestataire", 
    date: "17 jan 2024", 
    statut: "termine", 
    icon: CheckCircle 
  },
  { 
    etape: "Intervention en cours", 
    description: "Travaux de réparation démarrés", 
    date: "20 jan 2024", 
    statut: "encours", 
    icon: Clock 
  },
  { 
    etape: "Travaux terminés", 
    description: "Intervention achevée et contrôlée", 
    date: "", 
    statut: "attente", 
    icon: CheckCircle 
  },
  { 
    etape: "Dossier clôturé", 
    description: "Fermeture définitive du dossier", 
    date: "", 
    statut: "attente", 
    icon: Shield 
  }
])

// Historique des échanges
const historique = reactive([
  {
    auteur: "Prestataire",
    message: "Intervention programmée pour demain matin à 9h. Merci de libérer l'accès à la salle de bain.",
    date: "19 jan 2024 - 14:30",
    type: "prestataire",
    fichiers: []
  },
  {
    auteur: "Client",
    message: "Parfait, je serai présent. Voici une photo de l'état actuel des dégâts.",
    date: "19 jan 2024 - 15:45",
    type: "client",
    fichiers: ["degats_sdb.jpg"]
  },
  {
    auteur: "Assureur",
    message: "Dossier validé. Le prestataire peut procéder aux réparations selon le devis établi.",
    date: "18 jan 2024 - 11:20",
    type: "assureur",
    fichiers: ["validation_devis.pdf"]
  }
])

// Documents du dossier
const documents = reactive([
  { nom: "degats_sdb.jpg", type: "image", taille: "2.3 MB", auteur: "Client", date: "19 jan 2024" },
  { nom: "devis_reparation.pdf", type: "document", taille: "156 KB", auteur: "Prestataire", date: "18 jan 2024" },
  { nom: "validation_devis.pdf", type: "document", taille: "89 KB", auteur: "Assureur", date: "18 jan 2024" },
  { nom: "photos_avant.jpg", type: "image", taille: "1.8 MB", auteur: "Prestataire", date: "17 jan 2024" }
])

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
  
  // Simulation d'upload
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  isUploading.value = false
  uploadSuccess.value = true
  selectedFiles.value = []
  comment.value = ""
  
  setTimeout(() => uploadSuccess.value = false, 3000)
}

const getStatusColor = (statut: string) => {
  switch (statut) {
    case "termine": return "text-green-400 bg-green-900/20 border-green-700"
    case "encours": return "text-blue-400 bg-blue-900/20 border-blue-700"
    case "attente": return "text-gray-400 bg-gray-900/20 border-gray-700"
    default: return "text-gray-400 bg-gray-900/20 border-gray-700"
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case "client": return "bg-blue-900/30 border-blue-700"
    case "prestataire": return "bg-green-900/30 border-green-700"
    case "assureur": return "bg-purple-900/30 border-purple-700"
    default: return "bg-gray-900/30 border-gray-700"
  }
}

const onLogout = () => {
  emit('logout')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 font-mono">
    <!-- Header -->
    <header class="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
      <div class="container mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
            <Building2 class="h-5 w-5 text-black" />
          </div>
          <div>
            <span class="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              PointID
            </span>
            <span class="text-gray-400 text-sm ml-2">/ ESPACE SOCIÉTAIRE</span>
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <div class="text-right">
            <div class="text-white text-sm font-semibold">{{ userEmail }}</div>
            <div class="text-gray-400 text-xs">Dossier: {{ dossierNumber }}</div>
          </div>
          <Button
            @click="onLogout"
            variant="outline"
            size="sm"
            class="border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 bg-transparent"
          >
            <LogOut class="h-4 w-4 mr-2" />
            DÉCONNEXION
          </Button>
        </div>
      </div>
    </header>

    <div class="container mx-auto px-4 py-8">
      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Colonne principale -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Informations du dossier -->
          <Card class="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <div class="flex items-center justify-between">
                <CardTitle class="text-xl font-bold text-white flex items-center">
                  <FileText class="h-5 w-5 mr-2 text-blue-400" />
                  DOSSIER SINISTRE
                </CardTitle>
                <Badge :class="`${getStatusColor('encours')} border font-mono`">
                  {{ dossierData.statut.toUpperCase() }}
                </Badge>
              </div>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <Label class="text-gray-400 text-sm">TYPE DE SINISTRE</Label>
                  <p class="text-white font-semibold">{{ dossierData.type }}</p>
                </div>
                <div>
                  <Label class="text-gray-400 text-sm">DATE DE CRÉATION</Label>
                  <p class="text-white font-semibold">{{ dossierData.dateCreation }}</p>
                </div>
              </div>
              <div>
                <Label class="text-gray-400 text-sm">DESCRIPTION</Label>
                <p class="text-white">{{ dossierData.description }}</p>
              </div>
              <div>
                <Label class="text-gray-400 text-sm flex items-center">
                  <MapPin class="h-4 w-4 mr-1" />
                  ADRESSE D'INTERVENTION
                </Label>
                <p class="text-white">{{ dossierData.adresse }}</p>
              </div>
            </CardContent>
          </Card>

          <!-- Timeline -->
          <Card class="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle class="text-xl font-bold text-white flex items-center">
                <Clock class="h-5 w-5 mr-2 text-green-400" />
                SUIVI DE L'INTERVENTION
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-6">
                <div v-for="(etape, index) in timeline" :key="index" class="flex items-start space-x-4">
                  <div :class="`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    etape.statut === 'termine' 
                      ? 'bg-green-900/30 border-green-500 text-green-400' 
                      : etape.statut === 'encours'
                      ? 'bg-blue-900/30 border-blue-500 text-blue-400 animate-pulse'
                      : 'bg-gray-900/30 border-gray-600 text-gray-500'
                  }`">
                    <component :is="etape.icon" class="h-5 w-5" />
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center justify-between">
                      <h3 :class="`font-semibold ${
                        etape.statut === 'termine' ? 'text-green-400' :
                        etape.statut === 'encours' ? 'text-blue-400' : 'text-gray-500'
                      }`">
                        {{ etape.etape.toUpperCase() }}
                      </h3>
                      <span v-if="etape.date" class="text-gray-400 text-sm">{{ etape.date }}</span>
                    </div>
                    <p class="text-gray-400 text-sm mt-1">{{ etape.description }}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Historique des échanges -->
          <Card class="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle class="text-xl font-bold text-white flex items-center">
                <MessageSquare class="h-5 w-5 mr-2 text-purple-400" />
                HISTORIQUE DES ÉCHANGES
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div v-for="(echange, index) in historique" :key="index" :class="`p-4 rounded-lg border ${getTypeColor(echange.type)}`">
                  <div class="flex items-center justify-between mb-2">
                    <Badge :class="`text-xs ${
                      echange.type === 'client' ? 'bg-blue-600 text-white' :
                      echange.type === 'prestataire' ? 'bg-green-600 text-white' :
                      'bg-purple-600 text-white'
                    }`">
                      {{ echange.auteur.toUpperCase() }}
                    </Badge>
                    <span class="text-gray-400 text-xs">{{ echange.date }}</span>
                  </div>
                  <p class="text-gray-300 mb-2">{{ echange.message }}</p>
                  <div v-if="echange.fichiers.length > 0" class="flex flex-wrap gap-2">
                    <Badge v-for="(fichier, fileIndex) in echange.fichiers" :key="fileIndex" variant="outline" class="text-xs border-gray-600 text-gray-400">
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
          <Card class="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle class="text-lg font-bold text-white flex items-center">
                <User class="h-5 w-5 mr-2 text-green-400" />
                PRESTATAIRE ASSIGNÉ
              </CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div>
                <h3 class="font-semibold text-white">{{ dossierData.prestataire.nom }}</h3>
                <p class="text-gray-400">{{ dossierData.prestataire.contact }}</p>
              </div>
              <div class="space-y-2">
                <div class="flex items-center space-x-2 text-gray-300">
                  <Phone class="h-4 w-4 text-green-400" />
                  <span class="text-sm">{{ dossierData.prestataire.telephone }}</span>
                </div>
                <div class="flex items-center space-x-2 text-gray-300">
                  <Mail class="h-4 w-4 text-blue-400" />
                  <span class="text-sm">{{ dossierData.prestataire.email }}</span>
                </div>
              </div>
              <div>
                <Label class="text-gray-400 text-sm">SPÉCIALITÉS</Label>
                <div class="flex flex-wrap gap-1 mt-1">
                  <Badge v-for="(spec, index) in dossierData.prestataire.specialites" :key="index" variant="outline" class="text-xs border-gray-600 text-gray-400">
                    {{ spec }}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Estimation -->
          <Card class="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle class="text-lg font-bold text-white flex items-center">
                <Euro class="h-5 w-5 mr-2 text-yellow-400" />
                ESTIMATION
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-center">
                <div class="text-3xl font-bold text-yellow-400 mb-2">{{ dossierData.estimation }}</div>
                <p class="text-gray-400 text-sm">Estimation fournie par le prestataire</p>
              </div>
            </CardContent>
          </Card>

          <!-- Ajout de contenu -->
          <Card class="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle class="text-lg font-bold text-white flex items-center">
                <Camera class="h-5 w-5 mr-2 text-cyan-400" />
                ENRICHIR LE DOSSIER
              </CardTitle>
              <CardDescription class="text-gray-400">
                Ajoutez des photos ou commentaires pour améliorer le suivi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form @submit.prevent="handleSubmit" class="space-y-4">
                <!-- Upload de fichiers -->
                <div>
                  <Label class="text-white text-sm font-semibold">FICHIERS</Label>
                  <div class="mt-2 border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:border-gray-500 transition-colors duration-300">
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      @change="handleFileSelect"
                      class="hidden"
                      id="file-upload"
                    />
                    <label for="file-upload" class="cursor-pointer">
                      <Upload class="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p class="text-gray-400 text-sm">
                        Cliquez pour ajouter des fichiers
                        <br />
                        <span class="text-xs">JPG, PNG, PDF - Max 10MB</span>
                      </p>
                    </label>
                  </div>

                  <!-- Fichiers sélectionnés -->
                  <div v-if="selectedFiles.length > 0" class="mt-3 space-y-2">
                    <div v-for="(file, index) in selectedFiles" :key="index" class="flex items-center justify-between bg-gray-800 p-2 rounded">
                      <div class="flex items-center space-x-2">
                        <Image v-if="file.type.startsWith('image/')" class="h-4 w-4 text-blue-400" />
                        <FileText v-else class="h-4 w-4 text-red-400" />
                        <span class="text-white text-sm">{{ file.name }}</span>
                        <span class="text-gray-400 text-xs">
                          ({{ (file.size / 1024 / 1024).toFixed(1) }} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        @click="removeFile(index)"
                        class="text-gray-400 hover:text-red-400 transition-colors duration-300"
                      >
                        <X class="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Commentaire -->
                <div>
                  <Label for="comment" class="text-white text-sm font-semibold">
                    COMMENTAIRE (OPTIONNEL)
                  </Label>
                  <Textarea
                    id="comment"
                    v-model="comment"
                    placeholder="Ajoutez un commentaire pour contextualiser vos fichiers..."
                    class="mt-2 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-cyan-500/20 resize-none"
                    rows="3"
                  />
                </div>

                <!-- Message de succès -->
                <div v-if="uploadSuccess" class="flex items-center space-x-2 text-green-400 bg-green-900/20 border border-green-800 rounded-lg p-3">
                  <CheckCircle class="h-4 w-4 flex-shrink-0" />
                  <span class="text-sm">Contenu ajouté avec succès !</span>
                </div>

                <!-- Bouton d'envoi -->
                <Button
                  type="submit"
                  :disabled="isUploading || (selectedFiles.length === 0 && !comment.trim())"
                  class="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div v-if="isUploading" class="flex items-center space-x-2">
                    <div class="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                    <span>ENVOI EN COURS...</span>
                  </div>
                  <span v-else>
                    <Send class="h-4 w-4 mr-2" />
                    AJOUTER AU DOSSIER
                  </span>
                </Button>
              </form>
            </CardContent>
          </Card>

          <!-- Documents -->
          <Card class="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle class="text-lg font-bold text-white flex items-center">
                <FileText class="h-5 w-5 mr-2 text-orange-400" />
                DOCUMENTS DU DOSSIER
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div v-for="(doc, index) in documents" :key="index" class="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <Image v-if="doc.type === 'image'" class="h-5 w-5 text-blue-400 flex-shrink-0" />
                    <FileText v-else class="h-5 w-5 text-red-400 flex-shrink-0" />
                    <div>
                      <p class="text-white font-medium">{{ doc.nom }}</p>
                      <p class="text-gray-400 text-xs">{{ doc.taille }} - {{ doc.auteur }} - {{ doc.date }}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" class="text-gray-400 hover:text-white">
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
