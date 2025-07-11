<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Upload, Loader2, AlertCircle, ArrowLeft } from "lucide-vue-next"
import AccountTypeSelection from "./AccountTypeSelection.vue"
import { useRouter } from "vue-router"
import { useForm, Field, ErrorMessage } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { toast } from "vue-sonner"

import { AccountType } from "@/enums/account-type"
import { useAssureurStore } from "@/stores/assureur"
import { usePrestataireStore } from "@/stores/prestataire"
import { useAuthStore } from "@/stores/auth"
import {
  companyInfoSchema,
  documentsSchema,
  contactSchema,
  accountSchema,
  providerInfoSchema,
  insurerInfoSchema,
  societaireInfoSchema,
} from "@/schemas/registration-schemas"
import { ASSUREUR_SIGNUP_MUTATION } from "@/graphql/mutations/assureur-signup"

// Import new utilities and constants
import { 
  FORMES_JURIDIQUES, 
  TYPES_ASSURANCE, 
  REGIONS, 
  TYPES_PROJET, 
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
  FILE_SIZE_LIMITS,
  ACCEPTED_FILE_TYPES,
  TIMEOUT_DURATIONS
} from "@/constants"
import { validatePdfFile } from "@/utils/file-validation"
import { handleError, showSuccess, showInfo } from "@/utils/error-handling"

const router = useRouter()
const assureurStore = useAssureurStore()
const prestataireStore = usePrestataireStore()
const authStore = useAuthStore()

const accountType = ref<AccountType | null>(null)
const currentStep = ref(1)
const isLoading = ref(false)

// Form states
const { handleSubmit: handleCompanyInfoSubmit, defineField: defineCompanyInfoField, meta: companyInfoMeta, values: companyInfoValues, errors: companyInfoErrors, setErrors: setCompanyInfoErrors } = useForm({
  validationSchema: toTypedSchema(companyInfoSchema),
})
const [siret, siretAttrs] = defineCompanyInfoField('siret')
const [raisonSociale, raisonSocialeAttrs] = defineCompanyInfoField('raisonSociale')
const [formeJuridique, formeJuridiqueAttrs] = defineCompanyInfoField('formeJuridique')
const [adresse, adresseAttrs] = defineCompanyInfoField('adresse')
const [codePostal, codePostalAttrs] = defineCompanyInfoField('codePostal')
const [ville, villeAttrs] = defineCompanyInfoField('ville')
const [dateCreation, dateCreationAttrs] = defineCompanyInfoField('dateCreation')

const { handleSubmit: handleDocumentsSubmit, defineField: defineDocumentsField, meta: documentsMeta, values: documentsValues, errors: documentsErrors, setErrors: setDocumentsErrors } = useForm({
  validationSchema: toTypedSchema(documentsSchema),
})
const [kbis, kbisAttrs] = defineDocumentsField('kbis')
const [assurance, assuranceAttrs] = defineDocumentsField('assurance')
const [agrement, agrementAttrs] = defineDocumentsField('agrement')

const { handleSubmit: handleContactSubmit, defineField: defineContactField, meta: contactMeta, values: contactValues, errors: contactErrors, setErrors: setContactErrors } = useForm({
  validationSchema: toTypedSchema(contactSchema),
})
const [prenom, prenomAttrs] = defineContactField('prenom')
const [nom, nomAttrs] = defineContactField('nom')
const [emailContact, emailContactAttrs] = defineContactField('email')
const [telephone, telephoneAttrs] = defineContactField('telephone')

const { handleSubmit: handleAccountSubmit, defineField: defineAccountField, meta: accountMeta, values: accountValues, errors: accountErrors, setErrors: setAccountErrors } = useForm({
  validationSchema: toTypedSchema(accountSchema),
})
const [emailLogin, emailLoginAttrs] = defineAccountField('email')
const [password, passwordAttrs] = defineAccountField('password')
const [confirmPassword, confirmPasswordAttrs] = defineAccountField('confirmPassword')

const { handleSubmit: handleProviderInfoSubmit, defineField: defineProviderInfoField, meta: providerInfoMeta, values: providerInfoValues, errors: providerInfoErrors, setErrors: setProviderInfoErrors } = useForm({
  validationSchema: toTypedSchema(providerInfoSchema),
})
const [secteursActivite, secteursActiviteAttrs] = defineProviderInfoField('secteursActivite')
const [providerRegions, providerRegionsAttrs] = defineProviderInfoField('zonesGeographiques.regions')

const { handleSubmit: handleInsurerInfoSubmit, defineField: defineInsurerInfoField, meta: insurerInfoMeta, values: insurerInfoValues, errors: insurerInfoErrors, setErrors: setInsurerInfoErrors } = useForm({
  validationSchema: toTypedSchema(insurerInfoSchema),
})
const [numeroAgrement, numeroAgrementAttrs] = defineInsurerInfoField('numeroAgrement')
const [insurerTypesAssurance, insurerTypesAssuranceAttrs] = defineInsurerInfoField('typesAssurance')
const [garantiesProposees, garantiesProposeesAttrs] = defineInsurerInfoField('garantiesProposees')
const [insurerRegions, insurerRegionsAttrs] = defineInsurerInfoField('zonesCouverture.regions')

const { handleSubmit: handleSocietaireInfoSubmit, defineField: defineSocietaireInfoField, meta: societaireInfoMeta, values: societaireInfoValues, errors: societaireInfoErrors, setErrors: setSocietaireInfoErrors } = useForm({
  validationSchema: toTypedSchema(societaireInfoSchema),
})
const [civilite, civiliteAttrs] = defineSocietaireInfoField('civilite')
const [prenomSocietaire, prenomSocietaireAttrs] = defineSocietaireInfoField('prenom')
const [nomSocietaire, nomSocietaireAttrs] = defineSocietaireInfoField('nom')
const [dateNaissance, dateNaissanceAttrs] = defineSocietaireInfoField('dateNaissance')
const [adresseBien, adresseBienAttrs] = defineSocietaireInfoField('adresseBien')
const [codePostalBien, codePostalBienAttrs] = defineSocietaireInfoField('codePostalBien')
const [villeBien, villeBienAttrs] = defineSocietaireInfoField('villeBien')
const [typeProjet, typeProjetAttrs] = defineSocietaireInfoField('typeProjet')
const [numeroDossier, numeroDossierAttrs] = defineSocietaireInfoField('numeroDossier')
const [descriptionProjet, descriptionProjetAttrs] = defineSocietaireInfoField('descriptionProjet')

watch(() => assureurStore.companyInfo, (newVal) => {
  if (newVal) {
    raisonSociale.value = newVal.raisonSociale;
    adresse.value = newVal.adresse;
    codePostal.value = newVal.codePostal;
    ville.value = newVal.ville;
    dateCreation.value = newVal.dateCreation;
  }
}, { deep: true });

watch(() => prestataireStore.companyInfo, (newVal) => {
  if (newVal) {
    raisonSociale.value = newVal.raisonSociale;
    adresse.value = newVal.adresse;
    codePostal.value = newVal.codePostal;
    ville.value = newVal.ville;
    dateCreation.value = newVal.dateCreation;
  }
}, { deep: true });

// Using constants instead of hardcoded arrays
const formeJuridiques = FORMES_JURIDIQUES

const typesAssuranceOptions = TYPES_ASSURANCE

const departements = [
  "01 - Ain", "02 - Aisne", "03 - Allier", "04 - Alpes-de-Haute-Provence", "05 - Hautes-Alpes",
  "06 - Alpes-Maritimes", "07 - Ardèche", "08 - Ardennes", "09 - Ariège", "10 - Aube",
  "11 - Aude", "12 - Aveyron", "13 - Bouches-du-Rhône", "14 - Calvados", "15 - Cantal",
  "16 - Charente", "17 - Charente-Maritime", "18 - Cher", "19 - Corrèze", "20A - Corse-du-Sud",
  "20B - Haute-Corse", "21 - Côte-d'Or", "22 - Côtes-d'Armor", "23 - Creuse", "24 - Dordogne",
  "25 - Doubs", "26 - Drôme", "27 - Eure", "28 - Eure-et-Loir", "29 - Finistère",
  "30 - Gard", "31 - Haute-Garonne", "32 - Gers", "33 - Gironde", "34 - Hérault",
  "35 - Ille-et-Vilaine", "36 - Indre", "37 - Indre-et-Loire", "38 - Isère", "39 - Jura",
  "40 - Landes", "41 - Loir-et-Cher", "42 - Loire", "43 - Haute-Loire", "44 - Loire-Atlantique",
  "45 - Loiret", "46 - Lot", "47 - Lot-et-Garonne", "48 - Lozère", "49 - Maine-et-Loire",
  "50 - Manche", "51 - Marne", "52 - Haute-Marne", "53 - Mayenne", "54 - Meurthe-et-Moselle",
  "55 - Meuse", "56 - Morbihan", "57 - Moselle", "58 - Nièvre", "59 - Nord",
  "60 - Oise", "61 - Orne", "62 - Pas-de-Calais", "63 - Puy-de-Dôme", "64 - Pyrénées-Atlantiques",
  "65 - Hautes-Pyrénées", "66 - Pyrénées-Orientales", "67 - Bas-Rhin", "68 - Haut-Rhin",
  "69 - Rhône", "70 - Haute-Saône", "71 - Saône-et-Loire", "72 - Sarthe", "73 - Savoie",
  "74 - Haute-Savoie", "75 - Paris", "76 - Seine-Maritime", "77 - Seine-et-Marne", "78 - Yvelines",
  "79 - Deux-Sèvres", "80 - Somme", "81 - Tarn", "82 - Tarn-et-Garonne", "83 - Var",
  "84 - Vaucluse", "85 - Vendée", "86 - Vienne", "87 - Haute-Vienne", "88 - Vosges",
  "89 - Yonne", "90 - Territoire de Belfort", "91 - Essonne", "92 - Hauts-de-Seine",
  "93 - Seine-Saint-Denis", "94 - Val-de-Marne", "95 - Val-d'Oise",
]

const regions = REGIONS

const typesProjet = TYPES_PROJET

const handleSiretValidation = async () => {
  isLoading.value = true;
  try {
    if (accountType.value === 'assureur') {
      await assureurStore.validateSiret(siret.value as string);
    } else if (accountType.value === 'prestataire') {
      await prestataireStore.getSiretInfo(siret.value as string);
    }
    // Success message is now handled by the store utilities
  } catch (err: any) {
    setCompanyInfoErrors({ siret: err.message });
    // Error handling is now handled by the store utilities
  } finally {
    isLoading.value = false;
  }
};

const handleFileUpload = (type: "kbis" | "assurance" | "agrement", file: File) => {
  const validation = validatePdfFile(file)
  
  if (!validation.isValid) {
    if (type === "kbis") setDocumentsErrors({ kbis: validation.error || VALIDATION_MESSAGES.INVALID_FILE_TYPE });
    if (type === "assurance") setDocumentsErrors({ assurance: validation.error || VALIDATION_MESSAGES.INVALID_FILE_TYPE });
    if (type === "agrement") setDocumentsErrors({ agrement: validation.error || VALIDATION_MESSAGES.INVALID_FILE_TYPE });
    return
  }
  
  // File is valid, set it
  if (type === "kbis") kbis.value = file as any;
  if (type === "assurance") assurance.value = file as any;
  if (type === "agrement") agrement.value = file as any;
};

const validateStep = async (step: number) => {
  let isValid = false;
  switch (step) {
    case 1:
      if (accountType.value === "societaire") {
        isValid = societaireInfoMeta.value.valid;
      } else if (accountType.value === "assureur") {
        isValid = companyInfoMeta.value.valid && assureurStore.siretValidated;
      } else if (accountType.value === "prestataire") {
        isValid = companyInfoMeta.value.valid && prestataireStore.siretValidated;
      }
      break;
    case 2:
      if (accountType.value === "societaire") {
        isValid = societaireInfoMeta.value.valid; // Assuming project info is part of societaireInfoSchema
      } else {
        isValid = documentsMeta.value.valid;
      }
      break;
    case 3:
      if (accountType.value === "societaire") {
        isValid = accountMeta.value.valid;
      } else {
        isValid = contactMeta.value.valid;
      }
      break;
    case 4:
      if (accountType.value === "societaire") {
        isValid = true; // No step 4 for societaire
      } else if (accountType.value === "prestataire") {
        isValid = providerInfoMeta.value.valid;
      } else if (accountType.value === "assureur") {
        isValid = insurerInfoMeta.value.valid;
      }
      break;
    case 5:
      isValid = accountMeta.value.valid;
      break;
    default:
      isValid = false;
  }
  if (!isValid) {
    toast({
      title: "Validation échouée",
      description: "Veuillez remplir tous les champs obligatoires et corriger les erreurs.",
      variant: "destructive",
    });
  }
  return isValid;
};

const nextStep = async () => {
  const isValid = await validateStep(currentStep.value);
  if (isValid) {
    currentStep.value++;
  }
};

const prevStep = () => {
  currentStep.value--;
};

const submitRegistration = async () => {
  isLoading.value = true;
  try {
    let success = false;
    if (accountType.value === "societaire") {
      success = await authStore.signup(accountValues.email as string, accountValues.password as string);
      if (success) {
        router.push("/societaire-dashboard");
      }
    } else if (accountType.value === "prestataire") {
      const companyInfoData = companyInfoValues;
      const contactData = contactValues;
      const providerInfoData = providerInfoValues;
      const accountData = accountValues;

      await prestataireStore.prestataireSignup(
        companyInfoData,
        contactData,
        providerInfoData,
        accountData
      );
      success = true;
      if (success) {
        router.push("/prestataire-dashboard");
      }
    } else if (accountType.value === "assureur") {
      // Assureur signup logic
      const companyInfoData = companyInfoValues;
      const documentsData = documentsValues;
      const contactData = contactValues;
      const insurerInfoData = insurerInfoValues;
      const accountData = accountValues;

      // Prepare files for upload (if using a multipart form or similar)
      const formData = new FormData();
      formData.append('operations', JSON.stringify({
        query: ASSUREUR_SIGNUP_MUTATION.loc?.source.body,
        variables: {
          companyInfo: companyInfoData,
          documents: {
            kbis: null, // Placeholder, actual file will be appended
            assurance: null,
            agrement: null,
          },
          contact: contactData,
          insurerInfo: insurerInfoData,
          account: accountData,
        },
      }));
      formData.append('map', JSON.stringify({
        "0": ["variables.documents.kbis"],
        "1": ["variables.documents.assurance"],
        "2": ["variables.documents.agrement"],
      }));
      formData.append('0', documentsData.kbis);
      formData.append('1', documentsData.assurance);
      formData.append('2', documentsData.agrement);

      try {
        const response = await fetch('/graphql', {
          method: 'POST',
          body: formData,
        });
        const result = await response.json();

        if (result.data && result.data.assureurSignup) {
          // Save token and redirect
          localStorage.setItem('token', result.data.assureurSignup.token);
          localStorage.setItem('expiresIn', result.data.assureurSignup.expiresIn);
          localStorage.setItem('refreshToken', result.data.assureurSignup.refreshToken);
          authStore.user = result.data.assureurSignup.user;
          success = true;
          router.push("/assureur-dashboard");
        } else {
          throw new Error(result.errors?.[0]?.message || "Erreur lors de l'inscription de l'assureur.");
        }
      } catch (graphQLError: any) {
        throw new Error(graphQLError.message || "Erreur de communication avec le serveur GraphQL.");
      }
    }

    if (success) {
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès.",
      });
    } else {
      toast({
        title: "Erreur d'inscription",
        description: "Une erreur est survenue lors de l'inscription. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  } catch (err: any) {
    toast({
      title: "Erreur d'inscription",
      description: err.message || "Une erreur inattendue est survenue.",
      variant: "destructive",
    });
  } finally {
    isLoading.value = false;
  }
};

const resetAccountType = () => {
  accountType.value = null;
  currentStep.value = 1;
  // Reset forms
  handleCompanyInfoSubmit(() => {});
  handleDocumentsSubmit(() => {});
  handleContactSubmit(() => {});
  handleAccountSubmit(() => {});
  handleProviderInfoSubmit(() => {});
  handleInsurerInfoSubmit(() => {});
  handleSocietaireInfoSubmit(() => {});
};

const maxSteps = computed(() => {
  if (accountType.value === "societaire") return 4;
  if (accountType.value === "prestataire") return 6;
  if (accountType.value === "assureur") return 6;
  return 6;
});
const progressValue = computed(() => (currentStep.value / maxSteps.value) * 100);

const handleAccountTypeSelected = (type: AccountType) => {
  accountType.value = type;
};
</script>


<template>
  <div v-if="!accountType">
    <AccountTypeSelection @selectType="handleAccountTypeSelected" />
  </div>
  <div v-else class="min-h-screen bg-white text-black font-mono py-8">
    <div class="container mx-auto max-w-2xl px-4">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-black">
          Inscription
          {{ accountType === "prestataire" ? "Prestataire" : accountType === "assureur" ? "Assureur" : "Sociétaire" }}
        </h1>
        <p class="mt-2 text-gray-700">Créez votre compte professionnel en quelques étapes</p>
        <Button variant="ghost" @click="resetAccountType" class="mt-2 text-gray-700 hover:text-black">
          <ArrowLeft class="mr-2 h-4 w-4" />
          Changer le type de compte
        </Button>
      </div>

      <div class="mb-6">
        <Progress :value="progressValue" class="h-2" />
        <div class="mt-2 flex justify-between text-sm text-gray-700">
          <span>
            Étape {{ currentStep }} sur {{ maxSteps }}
          </span>
          <span>{{ Math.round(progressValue) }}% complété</span>
        </div>
      </div>

      <Card class="border-gray-300">
        <CardHeader>
          <CardTitle class="text-black">
            <span v-if="currentStep === 1">
              {{ accountType === "societaire" ? "Informations personnelles" : "Informations légales de l'entreprise" }}
            </span>
            <span v-else-if="currentStep === 2">
              {{ accountType === "societaire" ? "Informations sur votre projet" : "Documents légaux" }}
            </span>
            <span v-else-if="currentStep === 3">
              {{ accountType === "societaire" ? "Création du compte" : "Contact référent" }}
            </span>
            <span v-else-if="currentStep === 4">
              {{ accountType === "prestataire" ? "Informations prestataire" : "Informations assureur" }}
            </span>
            <span v-else-if="currentStep === 5">Création du compte</span>
            <span v-else-if="currentStep === 6">Confirmation</span>
          </CardTitle>
          <CardDescription class="text-gray-700">
            <span v-if="currentStep === 1">Renseignez les informations de votre entreprise</span>
            <span v-else-if="currentStep === 2">Téléchargez vos documents obligatoires</span>
            <span v-else-if="currentStep === 3">Coordonnées du responsable</span>
            <span v-else-if="currentStep === 4">
              {{ accountType === "prestataire" ? "Secteurs d'activité et zones d'intervention" : "Agréments et zones de couverture" }}
            </span>
            <span v-else-if="currentStep === 5">Définissez vos identifiants de connexion</span>
            <span v-else-if="currentStep === 6">Votre inscription a été soumise</span>
          </CardDescription>
        </CardHeader>

        <CardContent class="space-y-6">
          <Alert v-if="error" variant="destructive">
            <AlertCircle class="h-4 w-4" />
            <AlertDescription>{{ error }}</AlertDescription>
          </Alert>

          <!-- Étape 1: Informations légales -->
          <div v-if="currentStep === 1 && accountType !== 'societaire'" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <Label for="siret">SIRET *</Label>
                <div class="flex gap-2">
                  <Input
                    id="siret"
                    type="text"
                    v-model="siret"
                    v-bind="siretAttrs"
                    placeholder="14 chiffres"
                    :maxlength="VALIDATION_RULES.SIRET_LENGTH"
                    data-testid="siret-input"
                  />
                  <Button
                    @click="handleSiretValidation()"
                    :disabled="siret?.length !== VALIDATION_RULES.SIRET_LENGTH || isLoading || (accountType === 'assureur' && assureurStore.siretValidated) || (accountType === 'prestataire' && prestataireStore.siretValidated)"
                    :variant="(accountType === 'assureur' && assureurStore.siretValidated) || (accountType === 'prestataire' && prestataireStore.siretValidated) ? 'default' : 'outline'"
                    :class="(accountType === 'assureur' && assureurStore.siretValidated) || (accountType === 'prestataire' && prestataireStore.siretValidated) ? 'bg-black text-white hover:bg-gray-800' : 'border-gray-400 text-gray-700 hover:bg-gray-100 hover:border-gray-500'"
                    data-testid="verify-siret-button"
                  >
                    <Loader2 v-if="isLoading" class="h-4 w-4 animate-spin" />
                    <CheckCircle v-else-if="(accountType === 'assureur' && assureurStore.siretValidated) || (accountType === 'prestataire' && prestataireStore.siretValidated)" class="h-4 w-4" />
                    <span v-else>Vérifier</span>
                  </Button>
                </div>
                <ErrorMessage name="siret" class="text-red-500 text-sm" data-testid="siret-error" />
              </div>

              <div class="md:col-span-2">
                <Label for="raisonSociale">Raison sociale *</Label>
                <Input
                  id="raisonSociale"
                  v-model="raisonSociale"
                  v-bind="raisonSocialeAttrs"
                  :disabled="(accountType === 'assureur' && !assureurStore.siretValidated) || (accountType === 'prestataire' && !prestataireStore.siretValidated)"
                  data-testid="raison-sociale-input"
                />
                <ErrorMessage name="raisonSociale" class="text-red-500 text-sm" data-testid="raison-sociale-error" />
              </div>

              <div>
                <Label for="formeJuridique">Forme juridique *</Label>
                <Select
                  v-model="formeJuridique"
                  v-bind="formeJuridiqueAttrs"
                  data-testid="forme-juridique-select"
                >
                  <SelectTrigger data-testid="forme-juridique-trigger">
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent data-testid="forme-juridique-options">
                    <SelectItem v-for="forme in formeJuridiques" :key="forme" :value="forme">
                      {{ forme }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <ErrorMessage name="formeJuridique" class="text-red-500 text-sm" data-testid="forme-juridique-error" />
              </div>

              <div>
                <Label for="dateCreation">Date de création *</Label>
                <Input
                  id="dateCreation"
                  type="date"
                  v-model="dateCreation"
                  v-bind="dateCreationAttrs"
                  :disabled="(accountType === 'assureur' && !assureurStore.siretValidated) || (accountType === 'prestataire' && !prestataireStore.siretValidated)"
                  data-testid="date-creation-input"
                />
                <ErrorMessage name="dateCreation" class="text-red-500 text-sm" data-testid="date-creation-error" />
              </div>

              <div class="md:col-span-2">
                <Label for="adresse">Adresse complète (siège social) *</Label>
                <Input
                  id="adresse"
                  v-model="adresse"
                  v-bind="adresseAttrs"
                  :disabled="(accountType === 'assureur' && !assureurStore.siretValidated) || (accountType === 'prestataire' && !prestataireStore.siretValidated)"
                  data-testid="adresse-input"
                />
                <ErrorMessage name="adresse" class="text-red-500 text-sm" data-testid="adresse-error" />
              </div>

              <div>
                <Label for="codePostal">Code postal *</Label>
                <Input
                  id="codePostal"
                  v-model="codePostal"
                  v-bind="codePostalAttrs"
                  :disabled="(accountType === 'assureur' && !assureurStore.siretValidated) || (accountType === 'prestataire' && !prestataireStore.siretValidated)"
                  data-testid="code-postal-input"
                />
                <ErrorMessage name="codePostal" class="text-red-500 text-sm" data-testid="code-postal-error" />
              </div>

              <div>
                <Label for="ville">Ville *</Label>
                <Input
                  id="ville"
                  v-model="ville"
                  v-bind="villeAttrs"
                  :disabled="(accountType === 'assureur' && !assureurStore.siretValidated) || (accountType === 'prestataire' && !prestataireStore.siretValidated)"
                  data-testid="ville-input"
                />
                <ErrorMessage name="ville" class="text-red-500 text-sm" data-testid="ville-error" />
              </div>
            </div>
          </div>

          <!-- Étape 1: Informations personnelles (Sociétaire) -->
          <div v-else-if="currentStep === 1 && accountType === 'societaire'" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label for="civilite">Civilité *</Label>
                <Select
                  v-model="civilite"
                  v-bind="civiliteAttrs"
                  data-testid="societaire-civilite-select"
                >
                  <SelectTrigger data-testid="societaire-civilite-trigger">
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent data-testid="societaire-civilite-options">
                    <SelectItem value="M">Monsieur</SelectItem>
                    <SelectItem value="Mme">Madame</SelectItem>
                  </SelectContent>
                </Select>
                <ErrorMessage name="civilite" class="text-red-500 text-sm" data-testid="societaire-civilite-error" />
              </div>

              <div>
                <Label for="dateNaissance">Date de naissance *</Label>
                <Input
                  id="dateNaissance"
                  type="date"
                  v-model="dateNaissance"
                  v-bind="dateNaissanceAttrs"
                  data-testid="societaire-date-naissance-input"
                />
                <ErrorMessage name="dateNaissance" class="text-red-500 text-sm" data-testid="societaire-date-naissance-error" />
              </div>

              <div>
                <Label for="prenomSocietaire">Prénom *</Label>
                <Input
                  id="prenomSocietaire"
                  type="text"
                  v-model="prenomSocietaire"
                  v-bind="prenomSocietaireAttrs"
                  data-testid="societaire-prenom-input"
                />
                <ErrorMessage name="prenom" class="text-red-500 text-sm" data-testid="societaire-prenom-error" />
              </div>

              <div>
                <Label for="nomSocietaire">Nom *</Label>
                <Input
                  id="nomSocietaire"
                  type="text"
                  v-model="nomSocietaire"
                  v-bind="nomSocietaireAttrs"
                  data-testid="societaire-nom-input"
                />
                <ErrorMessage name="nom" class="text-red-500 text-sm" data-testid="societaire-nom-error" />
              </div>

              <div class="md:col-span-2">
                <Label for="adresseBien">Adresse du bien/projet *</Label>
                <Input
                  id="adresseBien"
                  type="text"
                  v-model="adresseBien"
                  v-bind="adresseBienAttrs"
                  placeholder="Adresse complète du bien concerné"
                  data-testid="societaire-adresse-bien-input"
                />
                <ErrorMessage name="adresseBien" class="text-red-500 text-sm" data-testid="societaire-adresse-bien-error" />
              </div>

              <div>
                <Label for="codePostalBien">Code postal *</Label>
                <Input
                  id="codePostalBien"
                  type="text"
                  v-model="codePostalBien"
                  v-bind="codePostalBienAttrs"
                  data-testid="societaire-code-postal-bien-input"
                />
                <ErrorMessage name="codePostalBien" class="text-red-500 text-sm" data-testid="societaire-code-postal-bien-error" />
              </div>

              <div>
                <Label for="villeBien">Ville *</Label>
                <Input
                  id="villeBien"
                  type="text"
                  v-model="villeBien"
                  v-bind="villeBienAttrs"
                  data-testid="societaire-ville-bien-input"
                />
                <ErrorMessage name="villeBien" class="text-red-500 text-sm" data-testid="societaire-ville-bien-error" />
              </div>
            </div>
          </div>

          <!-- Étape 2: Documents -->
          <div v-else-if="currentStep === 2 && accountType !== 'societaire'" class="space-y-6">
            <div>
              <Label for="kbis">Kbis (moins de 6 mois) *</Label>
              <div class="mt-2 border-2 border-dashed border-gray-400 rounded-lg p-6 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                <Upload class="mx-auto h-12 w-12 text-gray-600" />
                <div class="mt-4">
                  <label for="kbis" class="cursor-pointer">
                    <span class="mt-2 block text-sm font-medium text-black">
                      {{ kbis ? kbis.name : "Cliquez pour télécharger votre Kbis" }}
                    </span>
                    <span class="mt-1 block text-xs text-gray-700">PDF, max 5MB</span>
                  </label>
                  <input
                    id="kbis"
                    type="file"
                    class="hidden"
                    accept=".pdf"
                    @change="(e: any) => handleFileUpload('kbis', e.target.files?.[0])"
                    data-testid="kbis-upload"
                  />
                </div>
              </div>
              <ErrorMessage name="kbis" class="text-red-500 text-sm" data-testid="kbis-error" />
            </div>

            <div>
              <Label for="assurance">Attestation d'assurance responsabilité civile / décennale *</Label>
              <div class="mt-2 border-2 border-dashed border-gray-400 rounded-lg p-6 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                <Upload class="mx-auto h-12 w-12 text-gray-600" />
                <div class="mt-4">
                  <label for="assurance" class="cursor-pointer">
                    <span class="mt-2 block text-sm font-medium text-black">
                      {{ assurance ? assurance.name : "Cliquez pour télécharger votre attestation" }}
                    </span>
                    <span class="mt-1 block text-xs text-gray-700">PDF, max 5MB</span>
                  </label>
                  <input
                    id="assurance"
                    type="file"
                    class="hidden"
                    accept=".pdf"
                    @change="(e: any) => handleFileUpload('assurance', e.target.files?.[0])"
                    data-testid="assurance-upload"
                  />
                </div>
              </div>
              <ErrorMessage name="assurance" class="text-red-500 text-sm" data-testid="assurance-error" />
            </div>

            <!-- Document spécifique aux assureurs -->
            <div v-if="accountType === 'assureur'">
              <Label for="agrement">Agrément ACPR / Autorisation d'exercer *</Label>
              <div class="mt-2 border-2 border-dashed border-gray-400 rounded-lg p-6 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                <Upload class="mx-auto h-12 w-12 text-gray-600" />
                <div class="mt-4">
                  <label for="agrement" class="cursor-pointer">
                    <span class="mt-2 block text-sm font-medium text-black">
                      {{ agrement ? agrement.name : "Cliquez pour télécharger votre agrément" }}
                    </span>
                    <span class="mt-1 block text-xs text-gray-700">PDF, max 5MB</span>
                  </label>
                  <input
                    id="agrement"
                    type="file"
                    class="hidden"
                    accept=".pdf"
                    @change="(e: any) => handleFileUpload('agrement', e.target.files?.[0])"
                    data-testid="agrement-upload"
                  />
                </div>
              </div>
              <ErrorMessage name="agrement" class="text-red-500 text-sm" data-testid="agrement-error" />
            </div>
          </div>

          <!-- Étape 2: Informations projet (Sociétaire) -->
          <div v-else-if="currentStep === 2 && accountType === 'societaire'" class="space-y-6">
            <div>
              <Label for="typeProjet">Type de projet/sinistre *</Label>
              <Select
                v-model="societaireInfo.typeProjet"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="type in typesProjet" :key="type" :value="type">
                    {{ type }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label for="numeroDossier">Numéro de dossier (optionnel)</Label>
              <Input
                id="numeroDossier"
                v-model="societaireInfo.numeroDossier"
                placeholder="Si vous avez déjà un numéro de dossier"
              />
            </div>

            <div>
              <Label for="descriptionProjet">Description du projet/sinistre *</Label>
              <textarea
                id="descriptionProjet"
                v-model="societaireInfo.descriptionProjet"
                placeholder="Décrivez votre projet ou sinistre en détail..."
                class="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div class="bg-gray-100 p-4 rounded-lg border border-gray-300">
              <h4 class="font-medium text-black mb-2">Une fois votre compte créé, vous pourrez :</h4>
              <ul class="text-sm text-gray-700 space-y-1">
                <li>• Suivre l'avancement de votre dossier en temps réel</li>
                <li>• Ajouter des photos et documents complémentaires</li>
                <li>• Communiquer directement avec les intervenants</li>
                <li>• Consulter et télécharger vos factures</li>
                <li>• Recevoir des notifications sur l'évolution de votre dossier</li>
              </ul>
            </div>
          </div>

          <!-- Étape 3: Contact -->
          <div v-else-if="currentStep === 3 && accountType !== 'societaire'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label for="prenom">Prénom du contact *</Label>
              <Input
                id="prenom"
                type="text"
                v-model="prenom"
                v-bind="prenomAttrs"
                data-testid="contact-prenom-input"
              />
              <ErrorMessage name="prenom" class="text-red-500 text-sm" data-testid="contact-prenom-error" />
            </div>

            <div>
              <Label for="nom">Nom du contact *</Label>
              <Input
                id="nom"
                type="text"
                v-model="nom"
                v-bind="nomAttrs"
                data-testid="contact-nom-input"
              />
              <ErrorMessage name="nom" class="text-red-500 text-sm" data-testid="contact-nom-error" />
            </div>

            <div>
              <Label for="emailContact">Email professionnel *</Label>
              <Input
                id="emailContact"
                type="email"
                v-model="emailContact"
                v-bind="emailContactAttrs"
                data-testid="contact-email-input"
              />
              <ErrorMessage name="email" class="text-red-500 text-sm" data-testid="contact-email-error" />
            </div>

            <div>
              <Label for="telephone">Téléphone professionnel *</Label>
              <Input
                id="telephone"
                type="tel"
                v-model="telephone"
                v-bind="telephoneAttrs"
                data-testid="contact-telephone-input"
              />
              <ErrorMessage name="telephone" class="text-red-500 text-sm" data-testid="contact-telephone-error" />
            </div>
          </div>

          <!-- Étape 3: Compte (Sociétaire) -->
          <div v-else-if="currentStep === 3 && accountType === 'societaire'" class="space-y-4">
            <div>
              <Label for="emailLoginSocietaire">Adresse email (login) *</Label>
              <Input
                id="emailLoginSocietaire"
                type="email"
                v-model="emailLogin"
                v-bind="emailLoginAttrs"
                data-testid="societaire-email-input"
              />
              <ErrorMessage name="email" class="text-red-500 text-sm" data-testid="societaire-email-error" />
            </div>

            <div>
              <Label for="passwordSocietaire">Mot de passe *</Label>
              <Input
                id="passwordSocietaire"
                type="password"
                v-model="password"
                v-bind="passwordAttrs"
                data-testid="societaire-password-input"
              />
              <ErrorMessage name="password" class="text-red-500 text-sm" data-testid="societaire-password-error" />
            </div>

            <div>
              <Label for="confirmPasswordSocietaire">Confirmation mot de passe *</Label>
              <Input
                id="confirmPasswordSocietaire"
                type="password"
                v-model="confirmPassword"
                v-bind="confirmPasswordAttrs"
                data-testid="societaire-confirm-password-input"
              />
              <ErrorMessage name="confirmPassword" class="text-red-500 text-sm" data-testid="societaire-confirm-password-error" />
            </div>

            <div class="bg-gray-100 p-4 rounded-lg border border-gray-300">
              <p class="text-sm text-gray-700">
                <strong>Votre espace personnel vous permettra de :</strong>
                <br />• Accéder à votre tableau de bord personnalisé
                <br />• Gérer vos documents et photos
                <br />• Suivre tous vos dossiers en cours
                <br />• Recevoir des notifications sur l'évolution de votre dossier
              </p>
            </div>
          </div>

          <!-- Étape 4: Informations spécifiques -->
          <div v-else-if="currentStep === 4 && accountType === 'prestataire'" class="space-y-6">
            <div>
              <Label for="secteursActivite">Secteurs d'activité *</Label>
              <Input
                id="secteursActivite"
                v-model="secteursActivite"
                v-bind="secteursActiviteAttrs"
                placeholder="Ex: Maçonnerie, Plomberie, Électricité..."
                data-testid="secteurs-activite-input"
              />
              <ErrorMessage name="secteursActivite" class="text-red-500 text-sm" data-testid="secteurs-activite-error" />
              <p class="text-sm text-gray-700 mt-1">Séparez les secteurs par des virgules</p>
            </div>

            <div>
              <Label>Zones géographiques d'intervention *</Label>
              <p class="text-sm text-gray-700 mb-4">Sélectionnez au moins une zone d'intervention</p>

              <div class="space-y-4">
                <div>
                  <Label class="text-sm font-medium">Régions</Label>
                  <div class="mt-2 space-y-2">
                    <label v-for="region in regions" :key="region" class="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        :value="region"
                        v-model="providerRegions"
                        class="rounded"
                        data-testid="provider-region-checkbox"
                      />
                      <span>{{ region }}</span>
                    </label>
                  </div>
                  <ErrorMessage name="zonesGeographiques.regions" class="text-red-500 text-sm" data-testid="provider-regions-error" />
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="currentStep === 4 && accountType === 'assureur'" class="space-y-6">
            <div>
              <Label for="numeroAgrement">Numéro d'agrément ACPR *</Label>
              <Input
                id="numeroAgrement"
                type="text"
                v-model="numeroAgrement"
                v-bind="numeroAgrementAttrs"
                placeholder="Ex: 12345678"
                data-testid="agrement-input"
              />
              <ErrorMessage name="numeroAgrement" class="text-red-500 text-sm" data-testid="agrement-error" />
            </div>

            <div>
              <Label>Types d'assurance proposés *</Label>
              <div class="mt-2 space-y-2">
                <label v-for="type in typesAssuranceOptions" :key="type" class="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    :checked="insurerTypesAssurance?.includes(type)"
                    @change="(e) => {
                      const target = e.target as HTMLInputElement;
                      if (target.checked) {
                        insurerTypesAssurance?.push(type);
                      } else {
                        insurerTypesAssurance = insurerTypesAssurance?.filter((t) => t !== type);
                      }
                    }"
                    class="rounded"
                    data-testid="type-assurance-checkbox"
                  />
                  <span>{{ type }}</span>
                </label>
              </div>
              <ErrorMessage name="typesAssurance" class="text-red-500 text-sm" data-testid="types-assurance-error" />
            </div>

            <div>
              <Label for="garantiesProposees">Garanties et services proposés *</Label>
              <Input
                id="garantiesProposees"
                type="text"
                v-model="garantiesProposees"
                v-bind="garantiesProposeesAttrs"
                placeholder="Décrivez vos principales garanties..."
                data-testid="garanties-proposees-input"
              />
              <ErrorMessage name="garantiesProposees" class="text-red-500 text-sm" data-testid="garanties-proposees-error" />
            </div>

            <div>
              <Label>Zones de couverture *</Label>
              <div class="mt-2 space-y-2">
                <label v-for="region in regions" :key="region" class="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    :checked="insurerRegions.includes(region)"
                    @change="(e) => {
                      const target = e.target as HTMLInputElement;
                      if (target.checked) {
                        insurerRegions.push(region);
                      } else {
                        insurerRegions = insurerRegions.filter((r) => r !== region);
                      }
                    }"
                    class="rounded"
                    data-testid="zone-couverture-checkbox"
                  />
                  <span>{{ region }}</span>
                </label>
              </div>
              <ErrorMessage name="zonesCouverture.regions" class="text-red-500 text-sm" data-testid="zones-couverture-error" />
            </div>
          </div>

          <!-- Étape 5: Compte -->
          <div v-else-if="currentStep === 5 && accountType !== 'societaire'" class="space-y-4">
            <div>
              <Label for="emailLogin">Adresse email (login) *</Label>
              <Input
                id="emailLogin"
                type="email"
                v-model="account.email"
              />
            </div>

            <div>
              <Label for="password">Mot de passe *</Label>
              <Input
                id="password"
                type="password"
                v-model="account.password"
              />
            </div>

            <div>
              <Label for="confirmPassword">Confirmation mot de passe *</Label>
              <Input
                id="confirmPassword"
                type="password"
                v-model="account.confirmPassword"
              />
              <p v-if="account.password && account.confirmPassword && account.password !== account.confirmPassword" class="text-sm text-red-600 mt-1">Les mots de passe ne correspondent pas</p>
            </div>
          </div>

          <!-- Confirmation -->
          <div v-else-if="(currentStep === 6 && accountType !== 'societaire') || (currentStep === 4 && accountType === 'societaire')" class="text-center space-y-4">
            <CheckCircle class="mx-auto h-16 w-16 text-black" />
            <h3 class="text-xl font-semibold text-black">Inscription réussie !</h3>
            <p class="text-gray-700">
              <span v-if="accountType === 'societaire'">
                Votre compte sociétaire a été créé avec succès. Vous pouvez maintenant accéder à votre espace
                personnel à l'adresse <strong>{{ account.email }}</strong>.
              </span>
              <span v-else>
                Votre demande d'inscription {{ accountType === "prestataire" ? "prestataire" : "assureur" }} a été
                envoyée. Vous recevrez un email de confirmation à l'adresse <strong>{{ account.email }}</strong> une
                fois votre compte validé par nos équipes.
              </span>
            </p>
            <div class="bg-gray-100 p-4 rounded-lg border border-gray-300">
              <p class="text-sm text-gray-700">
                <span v-if="accountType === 'societaire'">
                  <strong>Vous pouvez maintenant :</strong>
                  <br />
                  1. Vous connecter à votre espace personnel
                  <br />
                  2. Consulter vos dossiers en cours
                  <br />
                  3. Ajouter des photos et documents
                  <br />
                  4. Communiquer avec vos intervenants
                </span>
                <span v-else>
                  <strong>Prochaines étapes :</strong>
                  <br />
                  1. Vérification de vos documents (24-48h)
                  <br />
                  2. Email de validation
                  <br />
                  3. Accès à votre espace {{ accountType === "prestataire" ? "prestataire" : "assureur" }}
                </span>
              </p>
            </div>
            <Button v-if="accountType === 'societaire'" class="mt-4 bg-black text-white hover:bg-gray-800">Accéder à mon espace</Button>
          </div>

          <!-- Boutons de navigation -->
          <div v-if="(accountType === 'societaire' && currentStep < 4) || (accountType !== 'societaire' && currentStep < 6)" class="flex justify-between pt-6">
            <Button variant="outline" @click="prevStep" :disabled="currentStep === 1" class="border-gray-400 text-gray-700 hover:bg-gray-100 hover:border-gray-500">
              Précédent
            </Button>

            <Button @click="(accountType === 'societaire' && currentStep < 3) || (accountType !== 'societaire' && currentStep < 5) ? nextStep() : submitRegistration()" :disabled="
              (accountType === 'societaire' && !societaireInfoMeta.valid) ||
              (accountType === 'prestataire' && currentStep === 1 && !companyInfoMeta.valid) ||
              (accountType === 'prestataire' && currentStep === 2 && !documentsMeta.valid) ||
              (accountType === 'prestataire' && currentStep === 3 && !contactMeta.valid) ||
              (accountType === 'prestataire' && currentStep === 4 && !providerInfoMeta.valid) ||
              (accountType === 'prestataire' && currentStep === 5 && !accountMeta.valid) ||
              (accountType === 'assureur' && currentStep === 1 && !companyInfoMeta.valid) ||
              (accountType === 'assureur' && currentStep === 2 && !documentsMeta.valid) ||
              (accountType === 'assureur' && currentStep === 3 && !contactMeta.valid) ||
              (accountType === 'assureur' && currentStep === 4 && !insurerInfoMeta.valid) ||
              (accountType === 'assureur' && currentStep === 5 && !accountMeta.valid) ||
              isLoading
            "
            data-testid="next-button"
            class="bg-black text-white hover:bg-gray-800">
              <Loader2 v-if="isLoading && ((accountType === 'societaire' && currentStep >= 3) || (accountType !== 'societaire' && currentStep >= 5))" class="mr-2 h-4 w-4 animate-spin" />
              <span v-if="(accountType === 'societaire' && currentStep < 3) || (accountType !== 'societaire' && currentStep < 5)">Suivant</span>
              <span v-else>Finaliser l'inscription</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
