<template>
  <Card>
    <CardHeader>
      <CardTitle>Informations assureur</CardTitle>
      <CardDescription>
        Détaillez votre activité d'assurance et vos spécialités
      </CardDescription>
    </CardHeader>
    <CardContent class="space-y-6">
      <form @submit="onSubmit" class="space-y-6">
        <!-- License number -->
        <div class="space-y-2">
          <Label for="numeroAgrement">Numéro d'agrément ACPR *</Label>
          <Field name="numeroAgrement" v-slot="{ field, errorMessage }">
            <Input
              id="numeroAgrement"
              v-bind="field"
              placeholder="Ex: 12345678901"
              :class="errorMessage ? 'border-red-500' : ''"
            />
            <ErrorMessage name="numeroAgrement" class="text-sm text-red-500" />
          </Field>
          <p class="text-xs text-gray-500">
            Numéro d'agrément délivré par l'Autorité de Contrôle Prudentiel et de Résolution
          </p>
        </div>

        <!-- Insurance types -->
        <div class="space-y-2">
          <Label>Types d'assurance proposés *</Label>
          <div class="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto border rounded-md p-4">
            <div v-for="type in TYPES_ASSURANCE" :key="type" class="flex items-center space-x-2">
              <Field name="typesAssurance" v-slot="{ field }">
                <input
                  :id="`assurance-${type}`"
                  type="checkbox"
                  :value="type"
                  v-model="field.value"
                  class="rounded border-gray-300"
                />
              </Field>
              <Label :for="`assurance-${type}`" class="text-sm">{{ type }}</Label>
            </div>
          </div>
          <ErrorMessage name="typesAssurance" class="text-sm text-red-500" />
        </div>

        <!-- Coverage zones -->
        <div class="space-y-4">
          <Label>Zones de couverture *</Label>
          
          <!-- National coverage option -->
          <div class="flex items-center space-x-2">
            <Field name="couvertureNationale" v-slot="{ field }">
              <input
                id="couvertureNationale"
                type="checkbox"
                v-bind="field"
                class="rounded border-gray-300"
                @change="handleNationalCoverageChange"
              />
            </Field>
            <Label for="couvertureNationale" class="text-sm font-medium">
              Couverture nationale
            </Label>
          </div>

          <!-- Regional coverage (disabled if national is selected) -->
          <div v-if="!couvertureNationale" class="space-y-2">
            <Label class="text-sm font-medium">Régions couvertes</Label>
            <div class="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
              <div v-for="region in REGIONS" :key="region" class="flex items-center space-x-2">
                <Field name="regionsCouvertes" v-slot="{ field }">
                  <input
                    :id="`region-${region}`"
                    type="checkbox"
                    :value="region"
                    v-model="field.value"
                    class="rounded border-gray-300"
                  />
                </Field>
                <Label :for="`region-${region}`" class="text-sm">{{ region }}</Label>
              </div>
            </div>
            <ErrorMessage name="regionsCouvertes" class="text-sm text-red-500" />
          </div>
        </div>

        <!-- Specialty lines -->
        <div class="space-y-2">
          <Label for="specialites">Spécialités sectorielles</Label>
          <Field name="specialites" v-slot="{ field }">
            <Select v-model="field.value" multiple>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez vos spécialités" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="specialite in SPECIALITES_ASSURANCE" :key="specialite" :value="specialite">
                  {{ specialite }}
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <p class="text-xs text-gray-500">
            Secteurs d'activité dans lesquels vous avez une expertise particulière
          </p>
        </div>

        <!-- Claims processing -->
        <div class="space-y-4">
          <Label>Gestion des sinistres</Label>
          
          <div class="space-y-2">
            <Label for="delaiTraitement">Délai moyen de traitement des dossiers</Label>
            <Field name="delaiTraitement" v-slot="{ field }">
              <Select v-model="field.value">
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un délai" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Moins de 24h</SelectItem>
                  <SelectItem value="48h">24-48h</SelectItem>
                  <SelectItem value="72h">48-72h</SelectItem>
                  <SelectItem value="1-semaine">1 semaine</SelectItem>
                  <SelectItem value="plus">Plus d'une semaine</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div class="flex items-center space-x-2">
            <Field name="expertiseInterne" v-slot="{ field }">
              <input
                id="expertiseInterne"
                type="checkbox"
                v-bind="field"
                class="rounded border-gray-300"
              />
            </Field>
            <Label for="expertiseInterne" class="text-sm">
              Service d'expertise interne
            </Label>
          </div>

          <div class="flex items-center space-x-2">
            <Field name="urgences24h" v-slot="{ field }">
              <input
                id="urgences24h"
                type="checkbox"
                v-bind="field"
                class="rounded border-gray-300"
              />
            </Field>
            <Label for="urgences24h" class="text-sm">
              Service d'urgence 24h/24
            </Label>
          </div>
        </div>

        <!-- Company size and capacity -->
        <div class="space-y-4">
          <Label>Capacité de traitement</Label>
          
          <div class="space-y-2">
            <Label for="volumeAnnuel">Volume annuel de dossiers traités</Label>
            <Field name="volumeAnnuel" v-slot="{ field }">
              <Select v-model="field.value">
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un volume" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-100">0-100 dossiers</SelectItem>
                  <SelectItem value="101-500">101-500 dossiers</SelectItem>
                  <SelectItem value="501-1000">501-1000 dossiers</SelectItem>
                  <SelectItem value="1001-5000">1001-5000 dossiers</SelectItem>
                  <SelectItem value="5000+">Plus de 5000 dossiers</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div class="space-y-2">
            <Label for="nombreEmployes">Nombre d'employés dédiés aux sinistres</Label>
            <Field name="nombreEmployes" v-slot="{ field }">
              <Input
                id="nombreEmployes"
                v-bind="field"
                type="number"
                min="1"
                placeholder="10"
              />
            </Field>
          </div>
        </div>

        <!-- Description and approach -->
        <div class="space-y-2">
          <Label for="approche">Approche et valeurs</Label>
          <Field name="approche" v-slot="{ field }">
            <textarea
              id="approche"
              v-bind="field"
              rows="4"
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Décrivez votre approche, vos valeurs, ce qui vous différencie..."
            />
          </Field>
          <p class="text-xs text-gray-500">
            Cette description sera visible par les clients et prestataires
          </p>
        </div>

        <div class="flex justify-between pt-4">
          <Button type="button" variant="outline" @click="$emit('go-back')">
            <ArrowLeft class="h-4 w-4 mr-2" />
            Retour
          </Button>
          <Button type="submit" :disabled="!meta.valid">
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft } from 'lucide-vue-next'
import { insurerInfoSchema } from '@/schemas/registration-schemas'
import { REGIONS, TYPES_ASSURANCE } from '@/constants'

// Mock specialties - replace with actual constants
const SPECIALITES_ASSURANCE = [
  'Habitation',
  'Automobile',
  'Professionnelle',
  'Responsabilité civile',
  'Santé/Prévoyance',
  'Voyage',
  'Cyber-risques',
  'Environnement',
  'Construction',
  'Transport',
  'Agricole',
  'Maritime'
]

interface InsurerInfo {
  numeroAgrement: string
  typesAssurance: string[]
  couvertureNationale: boolean
  regionsCouvertes: string[]
  specialites: string[]
  delaiTraitement: string
  expertiseInterne: boolean
  urgences24h: boolean
  volumeAnnuel: string
  nombreEmployes: number
  approche: string
}

interface Props {
  initialValues?: Partial<InsurerInfo>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'submit': [data: InsurerInfo]
  'go-back': []
}>()

const couvertureNationale = ref(false)

const { handleSubmit, meta, setFieldValue } = useForm({
  validationSchema: toTypedSchema(insurerInfoSchema),
  initialValues: {
    typesAssurance: [],
    regionsCouvertes: [],
    specialites: [],
    couvertureNationale: false,
    expertiseInterne: false,
    urgences24h: false,
    ...props.initialValues
  }
})

const handleNationalCoverageChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  couvertureNationale.value = target.checked
  
  if (target.checked) {
    // Clear regional selections if national coverage is selected
    setFieldValue('regionsCouvertes', [])
  }
}

const onSubmit = handleSubmit((values) => {
  emit('submit', values as InsurerInfo)
})
</script>