<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  MapPin,
  Star,
  Eye,
  MessageCircle,
  Phone,
  Mail,
  Building,
  FileText,
  CheckCircle,
  Plus,
} from 'lucide-vue-next'

interface Prestataire {
  id: string
  nom: string
  raisonSociale: string
  secteurs: string[]
  specialites: string[]
  ville: string
  departement: string
  region: string
  notemoyenne: number
  nombreAvis: number
  siret: string
  formeJuridique: string
  dateCreation: string
  telephone: string
  email: string
  adresse: string
  description: string
  certifications: string[]
  documentsPublics: string[]
  avatar?: string
}

const props = defineProps<{ prestataire: Prestataire }>()

const emit = defineEmits(['contact', 'createMission'])

const handleContact = () => {
  emit('contact', props.prestataire)
}

const handleCreateMission = () => {
  emit('createMission', props.prestataire)
}

import placeholderImage from '@/assets/placeholder.svg'
</script>

<template>
  <Card class="hover:shadow-lg transition-shadow">
    <CardHeader class="pb-3">
      <div class="flex items-start justify-between">
        <div class="flex items-center space-x-3">
          <Avatar>
            <AvatarImage :src="prestataire.avatar || placeholderImage" />
            <AvatarFallback>
              {{
                prestataire.nom
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
              }}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle class="text-lg">{{ prestataire.nom }}</CardTitle>
            <CardDescription class="text-sm">{{ prestataire.raisonSociale }}</CardDescription>
          </div>
        </div>
      </div>
    </CardHeader>
    <CardContent class="space-y-3">
      <div class="flex items-center space-x-2">
        <MapPin class="w-4 h-4 text-gray-500" />
        <span class="text-sm text-gray-600">{{ prestataire.ville }}</span>
      </div>

      <div class="flex items-center space-x-2">
        <Star class="w-4 h-4 text-yellow-500 fill-current" />
        <span class="text-sm font-medium">{{ prestataire.notemoyenne }}</span>
        <span class="text-sm text-gray-500">({{ prestataire.nombreAvis }} avis)</span>
      </div>

      <div class="flex flex-wrap gap-1">
        <Badge v-for="secteur in prestataire.secteurs.slice(0, 2)" :key="secteur" variant="secondary" class="text-xs">
          {{ secteur }}
        </Badge>
        <Badge v-if="prestataire.secteurs.length > 2" variant="outline" class="text-xs">
          +{{ prestataire.secteurs.length - 2 }}
        </Badge>
      </div>

      <div class="flex space-x-2 pt-2">
        <Dialog>
          <DialogTrigger as-child>
            <Button variant="outline" size="sm" class="flex-1 bg-transparent" data-testid="view-prestataire-profile-button">
              <Eye class="w-4 h-4 mr-1" />
              Voir fiche
            </Button>
          </DialogTrigger>
          <DialogContent class="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle class="flex items-center space-x-3">
                <Avatar class="w-12 h-12">
                  <AvatarImage :src="prestataire.avatar || placeholderImage" />
                  <AvatarFallback>
                    {{
                      prestataire.nom
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    }}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 class="text-xl font-bold">{{ prestataire.nom }}</h3>
                  <p class="text-gray-600">{{ prestataire.raisonSociale }}</p>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div class="space-y-6">
              <!-- Informations générales -->
              <div>
                <h4 class="font-semibold mb-3">Informations générales</h4>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="text-gray-500">SIRET:</span>
                    <p>{{ prestataire.siret }}</p>
                  </div>
                  <div>
                    <span class="text-gray-500">Forme juridique:</span>
                    <p>{{ prestataire.formeJuridique }}</p>
                  </div>
                  <div>
                    <span class="text-gray-500">Création:</span>
                    <p>{{ new Date(prestataire.dateCreation).toLocaleDateString() }}</p>
                  </div>
                  <div>
                    <span class="text-gray-500">Localisation:</span>
                    <p>
                      {{ prestataire.ville }}, {{ prestataire.departement }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Contact -->
              <div>
                <h4 class="font-semibold mb-3">Contact</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex items-center space-x-2">
                    <Phone class="w-4 h-4 text-gray-500" />
                    <span>{{ prestataire.telephone }}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <Mail class="w-4 h-4 text-gray-500" />
                    <span>{{ prestataire.email }}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <Building class="w-4 h-4 text-gray-500" />
                    <span>{{ prestataire.adresse }}</span>
                  </div>
                </div>
              </div>

              <!-- Spécialités -->
              <div>
                <h4 class="font-semibold mb-3">Secteurs et spécialités</h4>
                <div class="space-y-2">
                  <div>
                    <span class="text-sm text-gray-500">Secteurs:</span>
                    <div class="flex flex-wrap gap-1 mt-1">
                      <Badge v-for="secteur in prestataire.secteurs" :key="secteur" variant="default">
                        {{ secteur }}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span class="text-sm text-gray-500">Spécialités:</span>
                    <div class="flex flex-wrap gap-1 mt-1">
                      <Badge v-for="specialite in prestataire.specialites" :key="specialite" variant="secondary">
                        {{ specialite }}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Description -->
              <div>
                <h4 class="font-semibold mb-3">Description</h4>
                <p class="text-sm text-gray-700">{{ prestataire.description }}</p>
              </div>

              <!-- Certifications -->
              <div>
                <h4 class="font-semibold mb-3">Certifications</h4>
                <div class="flex flex-wrap gap-2">
                  <Badge v-for="cert in prestataire.certifications" :key="cert" variant="outline" class="bg-green-50 text-green-700">
                    <CheckCircle class="w-3 h-3 mr-1" />
                    {{ cert }}
                  </Badge>
                </div>
              </div>

              <!-- Documents publics -->
              <div>
                <h4 class="font-semibold mb-3">Documents publics</h4>
                <div class="space-y-2">
                  <div v-for="doc in prestataire.documentsPublics" :key="doc" class="flex items-center space-x-2">
                    <FileText class="w-4 h-4 text-gray-500" />
                    <span class="text-sm">{{ doc }}</span>
                    <Button variant="ghost" size="sm">
                      Télécharger
                    </Button>
                  </div>
                </div>
              </div>

              <!-- Évaluations -->
              <div>
                <h4 class="font-semibold mb-3">Évaluations</h4>
                <div class="flex items-center space-x-4">
                  <div class="flex items-center space-x-2">
                    <Star class="w-5 h-5 text-yellow-500 fill-current" />
                    <span class="text-lg font-semibold">{{ prestataire.notemoyenne }}</span>
                    <span class="text-gray-500">/ 5</span>
                  </div>
                  <span class="text-sm text-gray-500">
                    Basé sur {{ prestataire.nombreAvis }} avis clients
                  </span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button size="sm" class="flex-1" @click="handleContact" data-testid="contact-prestataire-button">
          <MessageCircle class="w-4 h-4 mr-1" />
          Contacter
        </Button>

        <Button size="sm" variant="default" @click="handleCreateMission" data-testid="create-mission-button">
          <Plus class="w-4 h-4 mr-1" />
          Mission
        </Button>
      </div>
    </CardContent>
  </Card>
</template>
