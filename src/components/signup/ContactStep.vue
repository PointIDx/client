<template>
  <Card>
    <CardHeader>
      <CardTitle>Informations de contact</CardTitle>
      <CardDescription>
        Renseignez les informations de la personne à contacter
      </CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <form @submit="onSubmit" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="prenom">Prénom *</Label>
            <Field name="prenom" v-slot="{ field, errorMessage }">
              <Input
                id="prenom"
                v-bind="field"
                placeholder="Jean"
                :class="errorMessage ? 'border-red-500' : ''"
              />
              <ErrorMessage name="prenom" class="text-sm text-red-500" />
            </Field>
          </div>

          <div class="space-y-2">
            <Label for="nom">Nom *</Label>
            <Field name="nom" v-slot="{ field, errorMessage }">
              <Input
                id="nom"
                v-bind="field"
                placeholder="Dupont"
                :class="errorMessage ? 'border-red-500' : ''"
              />
              <ErrorMessage name="nom" class="text-sm text-red-500" />
            </Field>
          </div>
        </div>

        <div class="space-y-2">
          <Label for="email">Email professionnel *</Label>
          <Field name="email" v-slot="{ field, errorMessage }">
            <Input
              id="email"
              v-bind="field"
              type="email"
              placeholder="jean.dupont@entreprise.com"
              :class="errorMessage ? 'border-red-500' : ''"
            />
            <ErrorMessage name="email" class="text-sm text-red-500" />
          </Field>
        </div>

        <div class="space-y-2">
          <Label for="telephone">Téléphone *</Label>
          <Field name="telephone" v-slot="{ field, errorMessage }">
            <Input
              id="telephone"
              v-bind="field"
              type="tel"
              placeholder="06 12 34 56 78"
              :class="errorMessage ? 'border-red-500' : ''"
            />
            <ErrorMessage name="telephone" class="text-sm text-red-500" />
          </Field>
        </div>

        <!-- Additional contact information for certain account types -->
        <div v-if="showAdditionalFields" class="space-y-4 border-t pt-4">
          <h4 class="font-medium text-gray-900">Informations complémentaires</h4>
          
          <div class="space-y-2">
            <Label for="fonction">Fonction dans l'entreprise</Label>
            <Field name="fonction" v-slot="{ field }">
              <Input
                id="fonction"
                v-bind="field"
                placeholder="Directeur, Gérant, Responsable..."
              />
            </Field>
          </div>

          <div class="space-y-2">
            <Label for="telephoneFixe">Téléphone fixe</Label>
            <Field name="telephoneFixe" v-slot="{ field }">
              <Input
                id="telephoneFixe"
                v-bind="field"
                type="tel"
                placeholder="01 23 45 67 89"
              />
            </Field>
          </div>
        </div>

        <!-- Contact preferences -->
        <div class="space-y-4 border-t pt-4">
          <h4 class="font-medium text-gray-900">Préférences de contact</h4>
          
          <div class="space-y-3">
            <div class="flex items-center space-x-2">
              <Field name="acceptEmails" v-slot="{ field }">
                <input
                  id="acceptEmails"
                  type="checkbox"
                  v-bind="field"
                  class="rounded border-gray-300"
                />
              </Field>
              <Label for="acceptEmails" class="text-sm">
                J'accepte de recevoir des emails informatifs
              </Label>
            </div>

            <div class="flex items-center space-x-2">
              <Field name="acceptSms" v-slot="{ field }">
                <input
                  id="acceptSms"
                  type="checkbox"
                  v-bind="field"
                  class="rounded border-gray-300"
                />
              </Field>
              <Label for="acceptSms" class="text-sm">
                J'accepte de recevoir des SMS pour les urgences
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
import { computed } from 'vue'
import { useForm, Field, ErrorMessage } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft } from 'lucide-vue-next'
import { contactSchema } from '@/schemas/registration-schemas'
import type { Contact } from '@/interfaces/contact'

interface Props {
  accountType: string
  initialValues?: Partial<Contact>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'submit': [data: Contact]
  'go-back': []
}>()

const showAdditionalFields = computed(() => {
  return props.accountType === 'ASSUREUR' || props.accountType === 'PRESTATAIRE'
})

const { handleSubmit, meta } = useForm({
  validationSchema: toTypedSchema(contactSchema),
  initialValues: {
    acceptEmails: true,
    acceptSms: false,
    ...props.initialValues
  }
})

const onSubmit = handleSubmit((values) => {
  emit('submit', values as Contact)
})
</script>