<template>
  <Card>
    <CardHeader>
      <CardTitle>Informations sociétaire</CardTitle>
      <CardDescription>
        Renseignez vos informations personnelles et votre situation
      </CardDescription>
    </CardHeader>
    <CardContent class="space-y-6">
      <form @submit="onSubmit" class="space-y-6">
        <!-- Personal information -->
        <div class="space-y-4">
          <h4 class="font-medium text-gray-900">Informations personnelles</h4>
          
          <div class="space-y-2">
            <Label for="civilite">Civilité *</Label>
            <Field name="civilite" v-slot="{ field, errorMessage }">
              <Select v-model="field.value">
                <SelectTrigger :class="errorMessage ? 'border-red-500' : ''">
                  <SelectValue placeholder="Sélectionnez votre civilité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Monsieur</SelectItem>
                  <SelectItem value="Mme">Madame</SelectItem>
                  <SelectItem value="Mlle">Mademoiselle</SelectItem>
                </SelectContent>
              </Select>
              <ErrorMessage name="civilite" class="text-sm text-red-500" />
            </Field>
          </div>

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
            <Label for="dateNaissance">Date de naissance *</Label>
            <Field name="dateNaissance" v-slot="{ field, errorMessage }">
              <Input
                id="dateNaissance"
                v-bind="field"
                type="date"
                :class="errorMessage ? 'border-red-500' : ''"
              />
              <ErrorMessage name="dateNaissance" class="text-sm text-red-500" />
            </Field>
          </div>
        </div>

        <!-- Contact information -->
        <div class="space-y-4">
          <h4 class="font-medium text-gray-900">Contact</h4>
          
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

          <div class="space-y-2">
            <Label for="email">Email *</Label>
            <Field name="email" v-slot="{ field, errorMessage }">
              <Input
                id="email"
                v-bind="field"
                type="email"
                placeholder="jean.dupont@email.com"
                :class="errorMessage ? 'border-red-500' : ''"
              />
              <ErrorMessage name="email" class="text-sm text-red-500" />
            </Field>
          </div>
        </div>

        <!-- Address information -->
        <div class="space-y-4">
          <h4 class="font-medium text-gray-900">Adresse</h4>
          
          <div class="space-y-2">
            <Label for="adresse">Adresse *</Label>
            <Field name="adresse" v-slot="{ field, errorMessage }">
              <Input
                id="adresse"
                v-bind="field"
                placeholder="123 Rue de la Paix"
                :class="errorMessage ? 'border-red-500' : ''"
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
                />
                <ErrorMessage name="ville" class="text-sm text-red-500" />
              </Field>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="pays">Pays *</Label>
            <Field name="pays" v-slot="{ field, errorMessage }">
              <Input
                id="pays"
                v-bind="field"
                placeholder="France"
                :class="errorMessage ? 'border-red-500' : ''"
              />
              <ErrorMessage name="pays" class="text-sm text-red-500" />
            </Field>
          </div>
        </div>

        <!-- Property information -->
        <div class="space-y-4">
          <h4 class="font-medium text-gray-900">Informations sur le logement</h4>
          
          <div class="space-y-2">
            <Label for="typeBien">Type de bien *</Label>
            <Field name="typeBien" v-slot="{ field, errorMessage }">
              <Select v-model="field.value">
                <SelectTrigger :class="errorMessage ? 'border-red-500' : ''">
                  <SelectValue placeholder="Sélectionnez le type de bien" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appartement">Appartement</SelectItem>
                  <SelectItem value="maison">Maison</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="loft">Loft</SelectItem>
                  <SelectItem value="autres">Autres</SelectItem>
                </SelectContent>
              </Select>
              <ErrorMessage name="typeBien" class="text-sm text-red-500" />
            </Field>
          </div>

          <div class="space-y-2">
            <Label for="statutOccupation">Statut d'occupation *</Label>
            <Field name="statutOccupation" v-slot="{ field, errorMessage }">
              <Select v-model="field.value">
                <SelectTrigger :class="errorMessage ? 'border-red-500' : ''">
                  <SelectValue placeholder="Sélectionnez votre statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="proprietaire">Propriétaire</SelectItem>
                  <SelectItem value="locataire">Locataire</SelectItem>
                  <SelectItem value="usufruitier">Usufruitier</SelectItem>
                  <SelectItem value="hebergement-gratuit">Hébergement gratuit</SelectItem>
                </SelectContent>
              </Select>
              <ErrorMessage name="statutOccupation" class="text-sm text-red-500" />
            </Field>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="superficie">Superficie (m²)</Label>
              <Field name="superficie" v-slot="{ field }">
                <Input
                  id="superficie"
                  v-bind="field"
                  type="number"
                  min="1"
                  placeholder="75"
                />
              </Field>
            </div>

            <div class="space-y-2">
              <Label for="nombrePieces">Nombre de pièces</Label>
              <Field name="nombrePieces" v-slot="{ field }">
                <Input
                  id="nombrePieces"
                  v-bind="field"
                  type="number"
                  min="1"
                  placeholder="3"
                />
              </Field>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="anneeConstruction">Année de construction</Label>
            <Field name="anneeConstruction" v-slot="{ field }">
              <Input
                id="anneeConstruction"
                v-bind="field"
                type="number"
                min="1800"
                :max="new Date().getFullYear()"
                placeholder="1990"
              />
            </Field>
          </div>
        </div>

        <!-- Insurance information -->
        <div class="space-y-4">
          <h4 class="font-medium text-gray-900">Assurance actuelle</h4>
          
          <div class="space-y-2">
            <Label for="assureurActuel">Assureur actuel</Label>
            <Field name="assureurActuel" v-slot="{ field }">
              <Input
                id="assureurActuel"
                v-bind="field"
                placeholder="Nom de votre assureur actuel"
              />
            </Field>
            <p class="text-xs text-gray-500">
              Optionnel - nous aide à mieux comprendre vos besoins
            </p>
          </div>

          <div class="space-y-2">
            <Label for="numeroPolice">Numéro de police</Label>
            <Field name="numeroPolice" v-slot="{ field }">
              <Input
                id="numeroPolice"
                v-bind="field"
                placeholder="Numéro de votre police d'assurance"
              />
            </Field>
          </div>

          <div class="space-y-2">
            <Label for="dateEcheance">Date d'échéance</Label>
            <Field name="dateEcheance" v-slot="{ field }">
              <Input
                id="dateEcheance"
                v-bind="field"
                type="date"
              />
            </Field>
          </div>
        </div>

        <!-- Preferences -->
        <div class="space-y-4">
          <h4 class="font-medium text-gray-900">Préférences</h4>
          
          <div class="space-y-3">
            <div class="flex items-center space-x-2">
              <Field name="newsletterOptIn" v-slot="{ field }">
                <input
                  id="newsletterOptIn"
                  type="checkbox"
                  v-bind="field"
                  class="rounded border-gray-300"
                />
              </Field>
              <Label for="newsletterOptIn" class="text-sm">
                Recevoir la newsletter avec conseils et actualités
              </Label>
            </div>

            <div class="flex items-center space-x-2">
              <Field name="offresPartenaires" v-slot="{ field }">
                <input
                  id="offresPartenaires"
                  type="checkbox"
                  v-bind="field"
                  class="rounded border-gray-300"
                />
              </Field>
              <Label for="offresPartenaires" class="text-sm">
                Recevoir des offres de nos partenaires
              </Label>
            </div>

            <div class="flex items-center space-x-2">
              <Field name="smsUrgence" v-slot="{ field }">
                <input
                  id="smsUrgence"
                  type="checkbox"
                  v-bind="field"
                  class="rounded border-gray-300"
                />
              </Field>
              <Label for="smsUrgence" class="text-sm">
                Recevoir des SMS en cas d'urgence
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
import { societaireInfoSchema } from '@/schemas/registration-schemas'

interface SocietaireInfo {
  civilite: string
  prenom: string
  nom: string
  dateNaissance: string
  telephone: string
  email: string
  adresse: string
  codePostal: string
  ville: string
  pays: string
  typeBien: string
  statutOccupation: string
  superficie?: number
  nombrePieces?: number
  anneeConstruction?: number
  assureurActuel?: string
  numeroPolice?: string
  dateEcheance?: string
  newsletterOptIn: boolean
  offresPartenaires: boolean
  smsUrgence: boolean
}

interface Props {
  initialValues?: Partial<SocietaireInfo>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'submit': [data: SocietaireInfo]
  'go-back': []
}>()

const { handleSubmit, meta } = useForm({
  validationSchema: toTypedSchema(societaireInfoSchema),
  initialValues: {
    pays: 'France',
    newsletterOptIn: false,
    offresPartenaires: false,
    smsUrgence: true,
    ...props.initialValues
  }
})

const onSubmit = handleSubmit((values) => {
  emit('submit', values as SocietaireInfo)
})
</script>