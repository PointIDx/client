<template>
  <Card>
    <CardHeader>
      <CardTitle>Création du compte</CardTitle>
      <CardDescription>
        Créez vos identifiants de connexion et acceptez les conditions
      </CardDescription>
    </CardHeader>
    <CardContent class="space-y-6">
      <form @submit="onSubmit" class="space-y-6">
        <!-- Login credentials -->
        <div class="space-y-4">
          <h4 class="font-medium text-gray-900">Identifiants de connexion</h4>
          
          <div class="space-y-2">
            <Label for="email">Email de connexion *</Label>
            <Field name="email" v-slot="{ field, errorMessage }">
              <Input
                id="email"
                v-bind="field"
                type="email"
                placeholder="votre@email.com"
                :class="errorMessage ? 'border-red-500' : ''"
                autocomplete="username"
              />
              <ErrorMessage name="email" class="text-sm text-red-500" />
            </Field>
            <p class="text-xs text-gray-500">
              Cet email sera utilisé pour vous connecter à votre compte
            </p>
          </div>

          <div class="space-y-2">
            <Label for="password">Mot de passe *</Label>
            <div class="relative">
              <Field name="password" v-slot="{ field, errorMessage }">
                <Input
                  id="password"
                  v-bind="field"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Mot de passe sécurisé"
                  :class="errorMessage ? 'border-red-500' : ''"
                  autocomplete="new-password"
                />
                <ErrorMessage name="password" class="text-sm text-red-500" />
              </Field>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                class="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-transparent"
                @click="showPassword = !showPassword"
              >
                <Eye v-if="!showPassword" class="h-4 w-4" />
                <EyeOff v-else class="h-4 w-4" />
              </Button>
            </div>
            <div class="text-xs text-gray-500 space-y-1">
              <p>Le mot de passe doit contenir :</p>
              <ul class="list-disc list-inside space-y-1 ml-2">
                <li :class="passwordValidation.length ? 'text-green-600' : 'text-gray-500'">
                  Au moins 8 caractères
                </li>
                <li :class="passwordValidation.uppercase ? 'text-green-600' : 'text-gray-500'">
                  Une majuscule
                </li>
                <li :class="passwordValidation.lowercase ? 'text-green-600' : 'text-gray-500'">
                  Une minuscule
                </li>
                <li :class="passwordValidation.number ? 'text-green-600' : 'text-gray-500'">
                  Un chiffre
                </li>
                <li :class="passwordValidation.special ? 'text-green-600' : 'text-gray-500'">
                  Un caractère spécial
                </li>
              </ul>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="confirmPassword">Confirmer le mot de passe *</Label>
            <div class="relative">
              <Field name="confirmPassword" v-slot="{ field, errorMessage }">
                <Input
                  id="confirmPassword"
                  v-bind="field"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Confirmez votre mot de passe"
                  :class="errorMessage ? 'border-red-500' : ''"
                  autocomplete="new-password"
                />
                <ErrorMessage name="confirmPassword" class="text-sm text-red-500" />
              </Field>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                class="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-transparent"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <Eye v-if="!showConfirmPassword" class="h-4 w-4" />
                <EyeOff v-else class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <!-- Two-factor authentication option -->
        <div class="space-y-4">
          <h4 class="font-medium text-gray-900">Sécurité renforcée</h4>
          
          <div class="flex items-center space-x-2">
            <Field name="enableTwoFactor" v-slot="{ field }">
              <input
                id="enableTwoFactor"
                type="checkbox"
                v-bind="field"
                class="rounded border-gray-300"
              />
            </Field>
            <Label for="enableTwoFactor" class="text-sm">
              Activer l'authentification à deux facteurs (recommandé)
            </Label>
          </div>
          <p class="text-xs text-gray-500 ml-6">
            Renforcez la sécurité de votre compte avec un code envoyé par SMS
          </p>
        </div>

        <!-- Terms and conditions -->
        <div class="space-y-4 border-t pt-6">
          <h4 class="font-medium text-gray-900">Conditions et confidentialité</h4>
          
          <div class="space-y-3">
            <div class="flex items-start space-x-2">
              <Field name="acceptTerms" v-slot="{ field, errorMessage }">
                <input
                  id="acceptTerms"
                  type="checkbox"
                  v-bind="field"
                  class="rounded border-gray-300 mt-1"
                  :class="errorMessage ? 'border-red-500' : ''"
                />
              </Field>
              <div class="flex-1">
                <Label for="acceptTerms" class="text-sm">
                  J'accepte les 
                  <button type="button" class="text-blue-600 hover:underline" @click="showTerms = true">
                    conditions générales d'utilisation
                  </button>
                  *
                </Label>
                <ErrorMessage name="acceptTerms" class="text-sm text-red-500 block" />
              </div>
            </div>

            <div class="flex items-start space-x-2">
              <Field name="acceptPrivacy" v-slot="{ field, errorMessage }">
                <input
                  id="acceptPrivacy"
                  type="checkbox"
                  v-bind="field"
                  class="rounded border-gray-300 mt-1"
                  :class="errorMessage ? 'border-red-500' : ''"
                />
              </Field>
              <div class="flex-1">
                <Label for="acceptPrivacy" class="text-sm">
                  J'accepte la 
                  <button type="button" class="text-blue-600 hover:underline" @click="showPrivacy = true">
                    politique de confidentialité
                  </button>
                  *
                </Label>
                <ErrorMessage name="acceptPrivacy" class="text-sm text-red-500 block" />
              </div>
            </div>

            <div class="flex items-start space-x-2">
              <Field name="acceptMarketing" v-slot="{ field }">
                <input
                  id="acceptMarketing"
                  type="checkbox"
                  v-bind="field"
                  class="rounded border-gray-300 mt-1"
                />
              </Field>
              <Label for="acceptMarketing" class="text-sm">
                J'accepte de recevoir des communications marketing personnalisées
              </Label>
            </div>
          </div>
        </div>

        <!-- Account security notice -->
        <Alert class="bg-blue-50 border-blue-200">
          <Shield class="h-4 w-4 text-blue-600" />
          <AlertDescription class="text-blue-800">
            Votre compte sera protégé par un chiffrement de niveau bancaire. 
            Nous ne partagerons jamais vos données personnelles sans votre autorisation explicite.
          </AlertDescription>
        </Alert>

        <div class="flex justify-between pt-4">
          <Button type="button" variant="outline" @click="$emit('go-back')">
            <ArrowLeft class="h-4 w-4 mr-2" />
            Retour
          </Button>
          <Button type="submit" :disabled="!meta.valid" class="bg-green-600 hover:bg-green-700">
            <Shield class="h-4 w-4 mr-2" />
            Créer mon compte
          </Button>
        </div>
      </form>

      <!-- Terms Modal -->
      <Dialog :open="showTerms" @update:open="showTerms = $event">
        <DialogContent class="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Conditions générales d'utilisation</DialogTitle>
          </DialogHeader>
          <div class="text-sm space-y-4">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...</p>
            <!-- Add full terms content here -->
          </div>
          <div class="flex justify-end">
            <Button @click="showTerms = false">Fermer</Button>
          </div>
        </DialogContent>
      </Dialog>

      <!-- Privacy Modal -->
      <Dialog :open="showPrivacy" @update:open="showPrivacy = $event">
        <DialogContent class="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Politique de confidentialité</DialogTitle>
          </DialogHeader>
          <div class="text-sm space-y-4">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...</p>
            <!-- Add full privacy policy content here -->
          </div>
          <div class="flex justify-end">
            <Button @click="showPrivacy = false">Fermer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useForm, Field, ErrorMessage } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ArrowLeft, Eye, EyeOff, Shield } from 'lucide-vue-next'
import { accountSchema } from '@/schemas/registration-schemas'
import type { Account } from '@/interfaces/account'

interface Props {
  initialValues?: Partial<Account>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'submit': [data: Account]
  'go-back': []
}>()

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const showTerms = ref(false)
const showPrivacy = ref(false)

const { handleSubmit, meta, values } = useForm({
  validationSchema: toTypedSchema(accountSchema),
  initialValues: {
    enableTwoFactor: false,
    acceptTerms: false,
    acceptPrivacy: false,
    acceptMarketing: false,
    ...props.initialValues
  }
})

// Password validation helper
const passwordValidation = computed(() => {
  const password = values.password || ''
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }
})

const onSubmit = handleSubmit((values) => {
  emit('submit', values as Account)
})
</script>