<template>
  <Card>
    <CardHeader>
      <CardTitle>Informations prestataire</CardTitle>
      <CardDescription>
        Détaillez vos compétences et zones d'intervention
      </CardDescription>
    </CardHeader>
    <CardContent class="space-y-6">
      <form @submit="onSubmit" class="space-y-6">
        <!-- Specializations -->
        <div class="space-y-2">
          <Label for="secteursActivite">Secteurs d'activité *</Label>
          <Field name="secteursActivite" v-slot="{ field, errorMessage }">
            <Select v-model="field.value" multiple>
              <SelectTrigger :class="errorMessage ? 'border-red-500' : ''">
                <SelectValue placeholder="Sélectionnez vos secteurs d'activité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="secteur in SECTEURS_ACTIVITE" :key="secteur" :value="secteur">
                  {{ secteur }}
                </SelectItem>
              </SelectContent>
            </Select>
            <ErrorMessage name="secteursActivite" class="text-sm text-red-500" />
          </Field>
          <p class="text-xs text-gray-500">
            Maintenez Ctrl/Cmd pour sélectionner plusieurs secteurs
          </p>
        </div>

        <!-- Geographic zones -->
        <div class="space-y-4">
          <Label>Zones géographiques d'intervention *</Label>
          
          <!-- Regions -->
          <div class="space-y-2">
            <Label class="text-sm font-medium">Régions</Label>
            <div class="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
              <div v-for="region in REGIONS" :key="region" class="flex items-center space-x-2">
                <Field name="zonesGeographiques.regions" v-slot="{ field }">
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
          </div>

          <!-- Départements -->
          <div class="space-y-2">
            <Label class="text-sm font-medium">Départements spécifiques (optionnel)</Label>
            <Field name="zonesGeographiques.departements" v-slot="{ field }">
              <Input
                v-bind="field"
                placeholder="Ex: 75, 92, 93 (séparés par des virgules)"
              />
            </Field>
            <p class="text-xs text-gray-500">
              Laissez vide pour couvrir toute la région sélectionnée
            </p>
          </div>

          <!-- Déplacement maximum -->
          <div class="space-y-2">
            <Label for="rayonIntervention">Rayon d'intervention maximum (km)</Label>
            <Field name="rayonIntervention" v-slot="{ field, errorMessage }">
              <Input
                id="rayonIntervention"
                v-bind="field"
                type="number"
                min="1"
                max="500"
                placeholder="50"
                :class="errorMessage ? 'border-red-500' : ''"
              />
              <ErrorMessage name="rayonIntervention" class="text-sm text-red-500" />
            </Field>
          </div>
        </div>

        <!-- Certifications -->
        <div class="space-y-2">
          <Label for="certifications">Certifications et agréments</Label>
          <Field name="certifications" v-slot="{ field }">
            <textarea
              id="certifications"
              v-bind="field"
              rows="3"
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Listez vos certifications, agréments, formations spécialisées..."
            />
          </Field>
          <p class="text-xs text-gray-500">
            Ex: Qualibat, RGE, CACES, certifications spécialisées...
          </p>
        </div>

        <!-- Experience -->
        <div class="space-y-2">
          <Label for="experience">Années d'expérience *</Label>
          <Field name="experience" v-slot="{ field, errorMessage }">
            <Select v-model="field.value">
              <SelectTrigger :class="errorMessage ? 'border-red-500' : ''">
                <SelectValue placeholder="Sélectionnez votre expérience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-2">0-2 ans</SelectItem>
                <SelectItem value="3-5">3-5 ans</SelectItem>
                <SelectItem value="6-10">6-10 ans</SelectItem>
                <SelectItem value="11-15">11-15 ans</SelectItem>
                <SelectItem value="16+">Plus de 15 ans</SelectItem>
              </SelectContent>
            </Select>
            <ErrorMessage name="experience" class="text-sm text-red-500" />
          </Field>
        </div>

        <!-- Team size -->
        <div class="space-y-2">
          <Label for="effectifs">Nombre d'employés</Label>
          <Field name="effectifs" v-slot="{ field }">
            <Select v-model="field.value">
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez la taille de votre équipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Travailleur indépendant</SelectItem>
                <SelectItem value="2-5">2-5 employés</SelectItem>
                <SelectItem value="6-10">6-10 employés</SelectItem>
                <SelectItem value="11-20">11-20 employés</SelectItem>
                <SelectItem value="21+">Plus de 20 employés</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <!-- Description -->
        <div class="space-y-2">
          <Label for="description">Description de l'entreprise</Label>
          <Field name="description" v-slot="{ field }">
            <textarea
              id="description"
              v-bind="field"
              rows="4"
              class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Décrivez votre entreprise, vos spécialités, votre approche..."
            />
          </Field>
          <p class="text-xs text-gray-500">
            Cette description sera visible par les clients potentiels
          </p>
        </div>

        <!-- Availability -->
        <div class="space-y-4">
          <Label>Disponibilité</Label>
          
          <div class="space-y-3">
            <div class="flex items-center space-x-2">
              <Field name="disponibiliteImmediate" v-slot="{ field }">
                <input
                  id="disponibiliteImmediate"
                  type="checkbox"
                  v-bind="field"
                  class="rounded border-gray-300"
                />
              </Field>
              <Label for="disponibiliteImmediate" class="text-sm">
                Disponible immédiatement
              </Label>
            </div>

            <div class="flex items-center space-x-2">
              <Field name="interventionsUrgence" v-slot="{ field }">
                <input
                  id="interventionsUrgence"
                  type="checkbox"
                  v-bind="field"
                  class="rounded border-gray-300"
                />
              </Field>
              <Label for="interventionsUrgence" class="text-sm">
                Interventions d'urgence (24h/24)
              </Label>
            </div>

            <div class="flex items-center space-x-2">
              <Field name="weekEnd" v-slot="{ field }">
                <input
                  id="weekEnd"
                  type="checkbox"
                  v-bind="field"
                  class="rounded border-gray-300"
                />
              </Field>
              <Label for="weekEnd" class="text-sm">
                Interventions week-end
              </Label>
            </div>
          </div>
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
import { useForm, Field, ErrorMessage } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft } from 'lucide-vue-next'
import { providerInfoSchema } from '@/schemas/registration-schemas'
import { REGIONS } from '@/constants'
import type { ProviderInfo } from '@/interfaces/provider-info'

// Mock secteurs d'activité - replace with actual constants
const SECTEURS_ACTIVITE = [
  'Plomberie',
  'Électricité',
  'Chauffage/Climatisation',
  'Menuiserie',
  'Maçonnerie',
  'Couverture/Toiture',
  'Peinture/Décoration',
  'Carrelage/Revêtements',
  'Serrurerie',
  'Vitrerie',
  'Nettoyage/Décontamination',
  'Déménagement',
  'Jardinage/Espaces verts',
  'Autres'
]

interface Props {
  initialValues?: Partial<ProviderInfo>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'submit': [data: ProviderInfo]
  'go-back': []
}>()

const { handleSubmit, meta } = useForm({
  validationSchema: toTypedSchema(providerInfoSchema),
  initialValues: {
    zonesGeographiques: {
      regions: [],
      departements: ''
    },
    disponibiliteImmediate: false,
    interventionsUrgence: false,
    weekEnd: false,
    ...props.initialValues
  }
})

const onSubmit = handleSubmit((values) => {
  emit('submit', values as ProviderInfo)
})
</script>