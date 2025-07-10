<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Briefcase, MapPin, Calendar, Euro, Eye, Phone, Mail, User, Clock, CheckCircle, FileText } from 'lucide-vue-next'
import type { IMission } from '@/interfaces/IMission'

interface MissionsTabProps {
  missions: IMission[]
}

const props = defineProps<MissionsTabProps>()

const getStatutBadge = (statut: IMission["statut"]) => {
  switch (statut) {
    case "brouillon":
      return `
        <Badge variant="secondary">
          <FileText class="w-3 h-3 mr-1" />
          Brouillon
        </Badge>
      `
    case "envoyee":
      return `
        <Badge variant="outline">
          <Clock class="w-3 h-3 mr-1" />
          Envoyée
        </Badge>
      `
    case "acceptee":
      return `
        <Badge variant="default">
          <CheckCircle class="w-3 h-3 mr-1" />
          Acceptée
        </Badge>
      `
    case "en_cours":
      return `
        <Badge class="bg-blue-100 text-blue-800">
          <Clock class="w-3 h-3 mr-1" />
          En cours
        </Badge>
      `
    case "terminee":
      return `
        <Badge class="bg-green-100 text-green-800">
          <CheckCircle class="w-3 h-3 mr-1" />
          Terminée
        </Badge>
      `
    default:
      return ``
  }
}

const getUrgenceBadge = (urgence: string) => {
  switch (urgence) {
    case "faible":
      return `<Badge class="bg-green-100 text-green-800">Faible</Badge>`
    case "moyenne":
      return `<Badge class="bg-yellow-100 text-yellow-800">Moyenne</Badge>`
    case "elevee":
      return `<Badge class="bg-red-100 text-red-800">Élevée</Badge>`
    default:
      return `<Badge variant="secondary">${urgence}</Badge>`
  }
}
</script>

<template>
  <div class="space-y-6">
    <div v-if="props.missions.length === 0" class="text-center py-12">
      <Card>
        <CardContent class="text-center py-12">
          <Briefcase class="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Aucune mission créée</h3>
          <p class="text-gray-600 mb-4">
            Commencez par rechercher des prestataires et créez votre première mission
          </p>
        </CardContent>
      </Card>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card v-for="mission in props.missions" :key="mission.id" class="hover:shadow-lg transition-shadow">
        <CardHeader class="pb-3">
          <div class="flex items-start justify-between">
            <div>
              <CardTitle class="text-lg">{{ mission.mission.titre }}</CardTitle>
              <CardDescription class="text-sm">Mission #{{ mission.numeroMission }}</CardDescription>
            </div>
            <div v-html="getStatutBadge(mission.statut)"></div>
          </div>
        </CardHeader>

        <CardContent class="space-y-3">
          <!-- Client -->
          <div class="flex items-center space-x-2">
            <User class="w-4 h-4 text-gray-500" />
            <span class="text-sm">
              {{ mission.client.civilite }} {{ mission.client.prenom }} {{ mission.client.nom }}
            </span>
          </div>

          <!-- Prestataire -->
          <div class="flex items-center space-x-2">
            <Avatar class="w-6 h-6">
              <AvatarFallback class="text-xs">
                {{ mission.prestataire.nom.split(' ').map((n) => n[0]).join('') }}
              </AvatarFallback>
            </Avatar>
            <span class="text-sm text-gray-600">{{ mission.prestataire.nom }}</span>
          </div>

          <!-- Localisation -->
          <div class="flex items-center space-x-2">
            <MapPin class="w-4 h-4 text-gray-500" />
            <span class="text-sm text-gray-600">{{ mission.chantier.ville }}</span>
          </div>

          <!-- Type et urgence -->
          <div class="flex items-center justify-between">
            <Badge variant="outline" class="text-xs">
              {{ mission.sinistre.type }}
            </Badge>
            <div v-html="getUrgenceBadge(mission.sinistre.urgence)"></div>
          </div>

          <!-- Budget -->
          <div v-if="mission.mission.budgetEstime" class="flex items-center space-x-2">
            <Euro class="w-4 h-4 text-gray-500" />
            <span class="text-sm text-gray-600">{{ mission.mission.budgetEstime }}€</span>
          </div>

          <!-- Date -->
          <div class="flex items-center space-x-2">
            <Calendar class="w-4 h-4 text-gray-500" />
            <span class="text-sm text-gray-600">{{ new Date(mission.dateCreation).toLocaleDateString() }}</span>
          </div>

          <!-- Bouton voir détails -->
          <Dialog>
            <DialogTrigger as-child>
              <Button variant="outline" size="sm" class="w-full mt-4 bg-transparent">
                <Eye class="w-4 h-4 mr-2" />
                Voir détails
              </Button>
            </DialogTrigger>
            <DialogContent class="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle class="flex items-center space-x-2">
                  <Briefcase class="w-5 h-5" />
                  <span>Mission #{{ mission.numeroMission }}</span>
                </DialogTitle>
                <DialogDescription>{{ mission.mission.titre }}</DialogDescription>
              </DialogHeader>

              <div class="space-y-6">
                <!-- Statut et urgence -->
                <div class="flex items-center justify-between">
                  <div v-html="getStatutBadge(mission.statut)"></div>
                  <div v-html="getUrgenceBadge(mission.sinistre.urgence)"></div>
                </div>

                <!-- Informations client -->
                <div>
                  <h4 class="font-semibold mb-3">Client</h4>
                  <div class="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p>
                      <strong>
                        {{ mission.client.civilite }} {{ mission.client.prenom }} {{ mission.client.nom }}
                      </strong>
                    </p>
                    <div class="flex items-center space-x-4 text-sm text-gray-600">
                      <span class="flex items-center">
                        <Phone class="w-3 h-3 mr-1" />
                        {{ mission.client.telephone }}
                      </span>
                      <span v-if="mission.client.email" class="flex items-center">
                        <Mail class="w-3 h-3 mr-1" />
                        {{ mission.client.email }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Informations prestataire -->
                <div>
                  <h4 class="font-semibold mb-3">Prestataire assigné</h4>
                  <div class="bg-blue-50 p-4 rounded-lg">
                    <div class="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {{ mission.prestataire.nom.split(' ').map((n) => n[0]).join('') }}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p class="font-semibold">{{ mission.prestataire.nom }}</p>
                        <p class="text-sm text-gray-600">{{ mission.prestataire.raisonSociale }}</p>
                        <div class="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span class="flex items-center">
                            <Phone class="w-3 h-3 mr-1" />
                            {{ mission.prestataire.telephone }}
                          </span>
                          <span class="flex items-center">
                            <Mail class="w-3 h-3 mr-1" />
                            {{ mission.prestataire.email }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Description de la mission -->
                <div>
                  <h4 class="font-semibold mb-3">Description de la mission</h4>
                  <p class="text-sm text-gray-700 bg-gray-50 p-3 rounded">{{ mission.mission.description }}</p>
                </div>

                <!-- Informations sinistre -->
                <div>
                  <h4 class="font-semibold mb-3">Sinistre</h4>
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span class="text-gray-500">Type:</span>
                      <p>{{ mission.sinistre.type }}</p>
                    </div>
                    <div>
                      <span class="text-gray-500">Urgence:</span>
                      <div class="mt-1" v-html="getUrgenceBadge(mission.sinistre.urgence)"></div>
                    </div>
                  </div>
                </div>

                <!-- Budget -->
                <div v-if="mission.mission.budgetEstime">
                  <h4 class="font-semibold mb-3">Budget estimé</h4>
                  <p class="text-lg font-semibold text-green-600">{{ mission.mission.budgetEstime }}€</p>
                </div>

                <!-- Date de création -->
                <div>
                  <h4 class="font-semibold mb-3">Informations</h4>
                  <div class="text-sm text-gray-600">
                    <p>Créée le {{ new Date(mission.dateCreation).toLocaleDateString() }}</p>
                    <p>Lieu: {{ mission.chantier.ville }}</p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
