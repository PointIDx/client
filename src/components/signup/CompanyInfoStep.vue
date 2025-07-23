<template>
  <Card>
    <CardHeader>
      <CardTitle>Informations de l'entreprise</CardTitle>
      <CardDescription>
        Renseignez les informations légales de votre entreprise
      </CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <form @submit="onSubmit" class="space-y-4">
        <!-- SIRET Field -->
        <div class="space-y-2">
          <Label for="siret">SIRET *</Label>
          <div class="flex gap-2">
            <div class="flex-1">
              <Field
                name="siret"
                v-slot="{ field, errorMessage }"
                :validate-on-blur="true"
              >
                <Input
                  id="siret"
                  v-bind="field"
                  placeholder="14 chiffres"
                  maxlength="14"
                  :class="errorMessage ? 'border-red-500' : ''"
                />
                <ErrorMessage name="siret" class="text-sm text-red-500" />
              </Field>
            </div>
            <Button 
              type="button" 
              @click="validateSiret"
              :disabled="!siret || siret.length !== 14 || siretValidating"
              variant="outline"
            >
              <Loader2 v-if="siretValidating" class="h-4 w-4 animate-spin mr-2" />
              Valider
            </Button>
          </div>
          <div v-if="siretValidated" class="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle class="h-4 w-4" />
            SIRET validé
          </div>
        </div>

        <!-- Auto-filled fields when SIRET is validated -->
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="raisonSociale">Raison sociale *</Label>
            <Field name="raisonSociale" v-slot="{ field, errorMessage }">
              <Input
                id="raisonSociale"
                v-bind="field"
                placeholder="Nom de votre entreprise"
                :class="errorMessage ? 'border-red-500' : ''"
                :disabled="siretValidated"
              />
              <ErrorMessage name="raisonSociale" class="text-sm text-red-500" />
            </Field>
          </div>

          <div class="space-y-2">
            <Label for="formeJuridique">Forme juridique *</Label>
            <Field name="formeJuridique" v-slot="{ field, errorMessage }">
              <Select v-model="field.value" :disabled="siretValidated">
                <SelectTrigger :class="errorMessage ? 'border-red-500' : ''">
                  <SelectValue placeholder="Sélectionnez une forme juridique" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="forme in FORMES_JURIDIQUES" :key="forme" :value="forme">
                    {{ forme }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <ErrorMessage name="formeJuridique" class="text-sm text-red-500" />
            </Field>
          </div>

          <div class="space-y-2">
            <Label for="adresse">Adresse *</Label>
            <Field name="adresse" v-slot="{ field, errorMessage }">
              <Input
                id="adresse"
                v-bind="field"
                placeholder="Adresse complète"
                :class="errorMessage ? 'border-red-500' : ''"
                :disabled="siretValidated"
              />
              <ErrorMessage name="adresse" class="text-sm text-red-500" />
            </Field>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="codePostal">Code postal *</Label>
              <Field name="codePostal" v-slot="{ field, errorMessage }">
                <Input
                  id="codePostal"
                  v-bind="field"
                  placeholder="75001"
                  maxlength="5"
                  :class="errorMessage ? 'border-red-500' : ''"
                  :disabled="siretValidated"
                />
                <ErrorMessage name="codePostal" class="text-sm text-red-500" />
              </Field>
            </div>

            <div class="space-y-2">
              <Label for="ville">Ville *</Label>
              <Field name="ville" v-slot="{ field, errorMessage }">
                <Input
                  id="ville"
                  v-bind="field"
                  placeholder="Paris"
                  :class="errorMessage ? 'border-red-500' : ''"
                  :disabled="siretValidated"
                />
                <ErrorMessage name="ville" class="text-sm text-red-500" />
              </Field>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="dateCreation">Date de création *</Label>
            <Field name="dateCreation" v-slot="{ field, errorMessage }">
              <Input
                id="dateCreation"
                v-bind="field"
                type="date"
                :class="errorMessage ? 'border-red-500' : ''"
                :disabled="siretValidated"
              />
              <ErrorMessage name="dateCreation" class="text-sm text-red-500" />
            </Field>
          </div>

          <div class="space-y-2">
            <Label for="pays">Pays *</Label>
            <Field name="pays" v-slot="{ field, errorMessage }">
              <Input
                id="pays"
                v-bind="field"
                placeholder="France"
                :class="errorMessage ? 'border-red-500' : ''"
                :disabled="siretValidated"
              />
              <ErrorMessage name="pays" class="text-sm text-red-500" />
            </Field>
          </div>
        </div>

        <div class="flex justify-between pt-4">
          <Button type="button" variant="outline" @click="$emit('go-back')">
            <ArrowLeft class="h-4 w-4 mr-2" />
            Retour
          </Button>
          <Button type="submit" :disabled="!meta.valid || !siretValidated">
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
import { CheckCircle, Loader2, ArrowLeft } from 'lucide-vue-next'
import { companyInfoSchema } from '@/schemas/registration-schemas'
import { FORMES_JURIDIQUES } from '@/constants'
import type { CompanyInfo } from '@/interfaces/company-info'

interface Props {
  initialValues?: Partial<CompanyInfo>
  accountType: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'submit': [data: CompanyInfo]
  'go-back': []
}>()

const siretValidated = ref(false)
const siretValidating = ref(false)

const { handleSubmit, defineField, meta, setFieldValue, values } = useForm({
  validationSchema: toTypedSchema(companyInfoSchema),
  initialValues: props.initialValues
})

const [siret] = defineField('siret')

const validateSiret = async () => {
  if (!siret.value || siret.value.length !== 14) return

  siretValidating.value = true
  try {
    // Mock SIRET validation - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Auto-fill company information
    setFieldValue('raisonSociale', 'EXEMPLE SARL')
    setFieldValue('formeJuridique', 'SARL')
    setFieldValue('adresse', '123 Rue de la Paix')
    setFieldValue('codePostal', '75001')
    setFieldValue('ville', 'Paris')
    setFieldValue('pays', 'France')
    setFieldValue('dateCreation', '2020-01-01')
    
    siretValidated.value = true
  } catch (error) {
    console.error('SIRET validation failed:', error)
  } finally {
    siretValidating.value = false
  }
}

const onSubmit = handleSubmit((values) => {
  if (siretValidated.value) {
    emit('submit', values as CompanyInfo)
  }
})
</script>