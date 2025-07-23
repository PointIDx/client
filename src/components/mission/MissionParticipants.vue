<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Users class="h-5 w-5" />
        Participants à la Mission
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Client -->
        <div v-if="mission.societaire" class="text-center space-y-4">
          <Avatar class="mx-auto h-16 w-16">
            <AvatarFallback class="text-lg">
              {{ mission.societaire.firstName.charAt(0) }}{{ mission.societaire.lastName.charAt(0) }}
            </AvatarFallback>
          </Avatar>
          <div>
            <p class="font-medium">{{ mission.societaire.firstName }} {{ mission.societaire.lastName }}</p>
            <p class="text-sm text-gray-500">{{ mission.societaire.email }}</p>
            <Badge class="bg-blue-100 text-blue-800 mt-2">Client</Badge>
          </div>
        </div>

        <!-- Alternative Client Info (if no societaire) -->
        <div v-else-if="mission.civilite || mission.nom || mission.prenom" class="text-center space-y-4">
          <Avatar class="mx-auto h-16 w-16">
            <AvatarFallback class="text-lg">
              {{ mission.prenom?.charAt(0) || '' }}{{ mission.nom?.charAt(0) || '' }}
            </AvatarFallback>
          </Avatar>
          <div>
            <p class="font-medium">{{ mission.civilite }} {{ mission.prenom }} {{ mission.nom }}</p>
            <p class="text-sm text-gray-500">{{ mission.email }}</p>
            <Badge class="bg-blue-100 text-blue-800 mt-2">Client</Badge>
          </div>
        </div>

        <!-- Prestataire -->
        <div v-if="mission.prestataire" class="text-center space-y-4">
          <Avatar class="mx-auto h-16 w-16">
            <AvatarFallback class="text-lg">
              {{ mission.prestataire.contactPerson?.split(' ').map(n => n[0]).join('') || 'PR' }}
            </AvatarFallback>
          </Avatar>
          <div>
            <p class="font-medium">{{ mission.prestataire.contactPerson }}</p>
            <p class="text-sm text-gray-500">{{ mission.prestataire.companyName }}</p>
            <Badge class="bg-green-100 text-green-800 mt-2">Prestataire</Badge>
          </div>
        </div>

        <!-- Assureur (static for now) -->
        <div class="text-center space-y-4">
          <Avatar class="mx-auto h-16 w-16">
            <AvatarFallback class="text-lg">AS</AvatarFallback>
          </Avatar>
          <div>
            <p class="font-medium">Marie Martin</p>
            <p class="text-sm text-gray-500">Assurance Plus</p>
            <Badge class="bg-purple-100 text-purple-800 mt-2">Assureur</Badge>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Users } from 'lucide-vue-next'
import type { MissionDetails } from '@/interfaces/MissionDetails'

interface Props {
  mission: MissionDetails
}

defineProps<Props>()
</script>