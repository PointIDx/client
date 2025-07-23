<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Briefcase class="h-5 w-5" />
        Résumé de la Mission
      </CardTitle>
    </CardHeader>
    <CardContent class="space-y-3">
      <div class="flex items-center justify-between py-2">
        <div class="flex items-center gap-2 text-sm font-medium text-gray-600">
          <Euro class="h-4 w-4" />
          Budget estimé
        </div>
        <div class="text-sm text-gray-900 font-medium">{{ mission.budgetEstime || '4000' }} €</div>
      </div>
      <div class="flex items-center justify-between py-2">
        <div class="flex items-center gap-2 text-sm font-medium text-gray-600">
          <Clock class="h-4 w-4" />
          Délai souhaité
        </div>
        <div class="text-sm text-gray-900 font-medium">{{ mission.delaiSouhaite || '40' }}Jours</div>
      </div>
      <div v-if="mission.horaires" class="flex items-center justify-between py-2">
        <div class="text-sm font-medium text-gray-600">Horaires</div>
        <div class="text-sm text-gray-900 font-medium">{{ mission.horaires }}</div>
      </div>
      <Separator class="my-3" />
      <div class="py-2">
        <p class="text-sm font-medium text-gray-600 mb-3">Préférences de communication</p>
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-700">Notifications par email</span>
            <Badge :variant="mission.emailClient ? 'default' : 'secondary'">
              {{ mission.emailClient ? 'Activé' : 'Désactivé' }}
            </Badge>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-700">Notifications par SMS</span>
            <Badge :variant="mission.smsClient ? 'default' : 'secondary'">
              {{ mission.smsClient ? 'Activé' : 'Désactivé' }}
            </Badge>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-700">Accès client créé</span>
            <Badge :variant="mission.creerAccesClient ? 'default' : 'secondary'">
              {{ mission.creerAccesClient ? 'Oui' : 'Non' }}
            </Badge>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Briefcase, Euro, Clock } from 'lucide-vue-next'
import type { MissionDetails } from '@/interfaces/MissionDetails'

interface Props {
  mission: MissionDetails
}

defineProps<Props>()
</script>