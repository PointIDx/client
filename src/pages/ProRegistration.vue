<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, Upload, Loader2, AlertCircle, ArrowLeft } from 'lucide-vue-next'
import AccountTypeSelection from './AccountTypeSelection.vue'

type AccountType = "prestataire" | "assureur" | "societaire" | null

interface CompanyInfo {
  raisonSociale: string
  siret: string
  formeJuridique: string
  adresse: string
  codePostal: string
  ville: string
  pays: string
  dateCreation: string
}

interface Documents {
  kbis: File | null
  assurance: File | null
  agrement?: File | null // Spécifique aux assureurs
}

interface Contact {
  prenom: string
  nom: string
  email: string
  telephone: string
}

interface Account {
  email: string
  password: string
  confirmPassword: string
}

interface ProviderInfo {
  secteursActivite: string
  zonesGeographiques: {
    departements: string[]
    regions: string[]
    codesPostaux: string[]
  }
}

interface InsurerInfo {
  numeroAgrement: string
  typesAssurance: string[]
  zonesCouverture: {
    departements: string[]
    regions: string[]
    codesPostaux: string[]
  }
  garantiesProposees: string
}

interface SocietaireInfo {
  civilite: string
  prenom: string
  nom: string
  dateNaissance: string
  adresseBien: string
  codePostalBien: string
  villeBien: string
  typeProjet: string
  numeroDossier: string
  descriptionProjet: string
}

const accountType = ref<AccountType>(null)
const currentStep = ref(1)
const isLoading = ref(false)
const siretValidated = ref(false)
const error = ref("")

const companyInfo = reactive<CompanyInfo>({
  raisonSociale: "",
  siret: "",
  formeJuridique: "",
  adresse: "",
  codePostal: "",
  ville: "",
  pays: "France",
  dateCreation: "",
})

const documents = reactive<Documents>({
  kbis: null,
  assurance: null,
  agrement: null,
})

const contact = reactive<Contact>({
  prenom: "",
  nom: "",
  email: "",
  telephone: "",
})

const account = reactive<Account>({
  email: "",
  password: "",
  confirmPassword: "",
})

const providerInfo = reactive<ProviderInfo>({
  secteursActivite: "",
  zonesGeographiques: {
    departements: [],
    regions: [],
    codesPostaux: [],
  },
})

const insurerInfo = reactive<InsurerInfo>({
  numeroAgrement: "",
  typesAssurance: [],
  zonesCouverture: {
    departements: [],
    regions: [],
    codesPostaux: [],
  },
  garantiesProposees: "",
})

const societaireInfo = reactive<SocietaireInfo>({
  civilite: "",
  prenom: "",
  nom: "",
  dateNaissance: "",
  adresseBien: "",
  codePostalBien: "",
  villeBien: "",
  typeProjet: "",
  numeroDossier: "",
  descriptionProjet: "",
})

const formeJuridiques = ["SARL", "SAS", "SASU", "EURL", "SA", "SNC", "SCS", "EI", "EIRL", "Micro-entreprise"]

const typesAssuranceOptions = [
  "Responsabilité Civile Professionnelle",
  "Assurance Décennale",
  "Assurance Multirisque Professionnelle",
  "Assurance Auto Professionnelle",
  "Assurance Matériel Professionnel",
  "Protection Juridique",
  "Cyber Assurance",
  "Assurance Perte d'exploitation",
]

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

const regions = [
  "Auvergne-Rhône-Alpes", "Bourgogne-Franche-Comté", "Bretagne", "Centre-Val de Loire", "Corse",
  "Grand Est", "Hauts-de-France", "Île-de-France", "Normandie", "Nouvelle-Aquitaine",
  "Occitanie", "Pays de la Loire", "Provence-Alpes-Côte d'Azur",
]

const typesProjet = [
  "Sinistre habitation", "Travaux de rénovation", "Construction neuve", "Dégât des eaux",
  "Incendie", "Cambriolage", "Bris de glace", "Autre",
]

const validateSiret = async (siret: string) => {
  if (siret.length !== 14) {
    error.value = "Le SIRET doit contenir exactement 14 chiffres"
    return false
  }

  isLoading.value = true
  error.value = ""

  try {
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const mockApiResponse = {
      etablissement: {
        uniteLegale: {
          denominationUniteLegale: accountType.value === "prestataire" ? "EXEMPLE ENTREPRISE SARL" : "ASSURANCE EXEMPLE SA",
          categorieJuridiqueUniteLegale: "5499",
        },
        adresseEtablissement: {
          numeroVoieEtablissement: "123",
          typeVoieEtablissement: "RUE",
          libelleVoieEtablissement: "DE LA PAIX",
          codePostalEtablissement: "75001",
          libelleCommuneEtablissement: "PARIS",
        },
        dateCreationEtablissement: "2020-01-15",
      },
    }

    companyInfo.raisonSociale = mockApiResponse.etablissement.uniteLegale.denominationUniteLegale
    companyInfo.adresse = `${mockApiResponse.etablissement.adresseEtablissement.numeroVoieEtablissement} ${mockApiResponse.etablissement.adresseEtablissement.typeVoieEtablissement} ${mockApiResponse.etablissement.adresseEtablissement.libelleVoieEtablissement}`
    companyInfo.codePostal = mockApiResponse.etablissement.adresseEtablissement.codePostalEtablissement
    companyInfo.ville = mockApiResponse.etablissement.adresseEtablissement.libelleCommuneEtablissement
    companyInfo.dateCreation = mockApiResponse.etablissement.dateCreationEtablissement

    siretValidated.value = true
    return true
  } catch (err) {
    error.value = "Erreur lors de la vérification du SIRET. Veuillez réessayer."
    return false
  } finally {
    isLoading.value = false
  }
}

const handleFileUpload = (type: "kbis" | "assurance" | "agrement", file: File) => {
  if (file.type !== "application/pdf") {
    error.value = "Seuls les fichiers PDF sont acceptés"
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    error.value = "Le fichier ne doit pas dépasser 5MB"
    return
  }
  documents[type] = file as any // Type assertion for simplicity, consider better type handling
  error.value = ""
}

const validateStep = (step: number) => {
  switch (step) {
    case 1:
      if (accountType.value === "societaire") {
        return (
          societaireInfo.civilite &&
          societaireInfo.prenom &&
          societaireInfo.nom &&
          societaireInfo.dateNaissance &&
          societaireInfo.adresseBien &&
          societaireInfo.codePostalBien &&
          societaireInfo.villeBien
        )
      }
      return (
        siretValidated.value &&
        companyInfo.raisonSociale &&
        companyInfo.formeJuridique &&
        companyInfo.adresse &&
        companyInfo.codePostal &&
        companyInfo.ville &&
        companyInfo.dateCreation
      )
    case 2:
      if (accountType.value === "societaire") {
        return societaireInfo.typeProjet && societaireInfo.descriptionProjet
      }
      if (accountType.value === "assureur") {
        return documents.kbis && documents.assurance && documents.agrement
      }
      return documents.kbis && documents.assurance
    case 3:
      if (accountType.value === "societaire") {
        return (
          account.email && account.password && account.confirmPassword && account.password === account.confirmPassword
        )
      }
      return contact.prenom && contact.nom && contact.email && contact.telephone
    case 4:
      if (accountType.value === "societaire") {
        return true // Pas d'étape 4 pour les sociétaires
      }
      if (accountType.value === "prestataire") {
        return providerInfo.secteursActivite && providerInfo.zonesGeographiques.regions.length > 0
      }
      if (accountType.value === "assureur") {
        return insurerInfo.numeroAgrement && insurerInfo.typesAssurance.length > 0 && insurerInfo.garantiesProposees && insurerInfo.zonesCouverture.regions.length > 0
      }
      return false
    case 5:
      return (
        account.email && account.password && account.confirmPassword && account.password === account.confirmPassword
      )
    default:
      return false
  }
}

const nextStep = () => {
  if (validateStep(currentStep.value)) {
    currentStep.value++
    error.value = ""
  } else {
    error.value = "Veuillez remplir tous les champs obligatoires"
  }
}

const prevStep = () => {
  currentStep.value--
  error.value = ""
}

const submitRegistration = async () => {
  isLoading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    if (accountType.value === "societaire") {
      currentStep.value = 4 // Confirmation pour sociétaire à l'étape 4
    } else {
      currentStep.value = 6 // Confirmation pour pro à l'étape 6
    }
  } catch (err) {
    error.value = "Erreur lors de l'inscription. Veuillez réessayer."
  } finally {
    isLoading.value = false
  }
}

const resetAccountType = () => {
  accountType.value = null
  currentStep.value = 1
  error.value = ""
}

const maxSteps = computed(() => (accountType.value === "societaire" ? 4 : 6))
const progressValue = computed(() => (currentStep.value / maxSteps.value) * 100)

const handleAccountTypeSelected = (type: AccountType) => {
  accountType.value = type
}
</script>

<template>
  <div v-if="!accountType">
    <AccountTypeSelection @selectType="handleAccountTypeSelected" />
  </div>
  <div v-else class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto max-w-2xl px-4">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-gray-900">
          Inscription
          {{ accountType === "prestataire" ? "Prestataire" : accountType === "assureur" ? "Assureur" : "Sociétaire" }}
        </h1>
        <p class="mt-2 text-gray-600">Créez votre compte professionnel en quelques étapes</p>
        <Button variant="ghost" @click="resetAccountType" class="mt-2">
          <ArrowLeft class="mr-2 h-4 w-4" />
          Changer le type de compte
        </Button>
      </div>

      <div class="mb-6">
        <Progress v-model:="progressValue" class="h-2" />
        <div class="mt-2 flex justify-between text-sm text-gray-500">
          <span>
            Étape {{ currentStep }} sur {{ maxSteps }}
          </span>
          <span>{{ Math.round(progressValue) }}% complété</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
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
          <CardDescription>
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
                    v-model="companyInfo.siret"
                    @input="
						(e: Event) => {
							const target = e.target as HTMLInputElement;
							if (target) {
							companyInfo.siret = target.value.replace(/\D/g, '').slice(0, 14);
							siretValidated = false;
							}
						}
					"
                    placeholder="14 chiffres"
                    maxlength="14"
                  />
                  <Button
                    @click="validateSiret(companyInfo.siret)"
                    :disabled="companyInfo.siret.length !== 14 || isLoading"
                    :variant="siretValidated ? 'default' : 'outline'"
                  >
                    <Loader2 v-if="isLoading" class="h-4 w-4 animate-spin" />
                    <CheckCircle v-else-if="siretValidated" class="h-4 w-4" />
                    <span v-else>Vérifier</span>
                  </Button>
                </div>
              </div>

              <div class="md:col-span-2">
                <Label for="raisonSociale">Raison sociale *</Label>
                <Input
                  id="raisonSociale"
                  v-model="companyInfo.raisonSociale"
                  :disabled="!siretValidated"
                />
              </div>

              <div>
                <Label for="formeJuridique">Forme juridique *</Label>
                <Select
                  v-model="companyInfo.formeJuridique"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="forme in formeJuridiques" :key="forme" :value="forme">
                      {{ forme }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label for="dateCreation">Date de création *</Label>
                <Input
                  id="dateCreation"
                  type="date"
                  v-model="companyInfo.dateCreation"
                  :disabled="!siretValidated"
                />
              </div>

              <div class="md:col-span-2">
                <Label for="adresse">Adresse complète (siège social) *</Label>
                <Input
                  id="adresse"
                  v-model="companyInfo.adresse"
                  :disabled="!siretValidated"
                />
              </div>

              <div>
                <Label for="codePostal">Code postal *</Label>
                <Input
                  id="codePostal"
                  v-model="companyInfo.codePostal"
                  :disabled="!siretValidated"
                />
              </div>

              <div>
                <Label for="ville">Ville *</Label>
                <Input
                  id="ville"
                  v-model="companyInfo.ville"
                  :disabled="!siretValidated"
                />
              </div>
            </div>
          </div>

          <!-- Étape 1: Informations personnelles (Sociétaire) -->
          <div v-else-if="currentStep === 1 && accountType === 'societaire'" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label for="civilite">Civilité *</Label>
                <Select
                  v-model="societaireInfo.civilite"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Monsieur</SelectItem>
                    <SelectItem value="Mme">Madame</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label for="dateNaissance">Date de naissance *</Label>
                <Input
                  id="dateNaissance"
                  type="date"
                  v-model="societaireInfo.dateNaissance"
                />
              </div>

              <div>
                <Label for="prenomSocietaire">Prénom *</Label>
                <Input
                  id="prenomSocietaire"
                  v-model="societaireInfo.prenom"
                />
              </div>

              <div>
                <Label for="nomSocietaire">Nom *</Label>
                <Input
                  id="nomSocietaire"
                  v-model="societaireInfo.nom"
                />
              </div>

              <div class="md:col-span-2">
                <Label for="adresseBien">Adresse du bien/projet *</Label>
                <Input
                  id="adresseBien"
                  v-model="societaireInfo.adresseBien"
                  placeholder="Adresse complète du bien concerné"
                />
              </div>

              <div>
                <Label for="codePostalBien">Code postal *</Label>
                <Input
                  id="codePostalBien"
                  v-model="societaireInfo.codePostalBien"
                />
              </div>

              <div>
                <Label for="villeBien">Ville *</Label>
                <Input
                  id="villeBien"
                  v-model="societaireInfo.villeBien"
                />
              </div>
            </div>
          </div>

          <!-- Étape 2: Documents -->
          <div v-else-if="currentStep === 2 && accountType !== 'societaire'" class="space-y-6">
            <div>
              <Label>Kbis (moins de 6 mois) *</Label>
              <div class="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload class="mx-auto h-12 w-12 text-gray-400" />
                <div class="mt-4">
                  <label for="kbis" class="cursor-pointer">
                    <span class="mt-2 block text-sm font-medium text-gray-900">
                      {{ documents.kbis ? documents.kbis.name : "Cliquez pour télécharger votre Kbis" }}
                    </span>
                    <span class="mt-1 block text-xs text-gray-500">PDF, max 5MB</span>
                  </label>
                  <input
                    id="kbis"
                    type="file"
                    class="hidden"
                    accept=".pdf"
                    @change="(e: Event) => {
						const target = e.target as HTMLInputElement;
						if (target?.files?.[0]) handleFileUpload('kbis', target.files[0]);
					}"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Attestation d'assurance responsabilité civile / décennale *</Label>
              <div class="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload class="mx-auto h-12 w-12 text-gray-400" />
                <div class="mt-4">
                  <label for="assurance" class="cursor-pointer">
                    <span class="mt-2 block text-sm font-medium text-gray-900">
                      {{ documents.assurance ? documents.assurance.name : "Cliquez pour télécharger votre attestation" }}
                    </span>
                    <span class="mt-1 block text-xs text-gray-500">PDF, max 5MB</span>
                  </label>
                  <input
                    id="assurance"
                    type="file"
                    class="hidden"
                    accept=".pdf"
                    @change="(e: Event) => {
						const target = e.target as HTMLInputElement;
						if (target?.files?.[0]) handleFileUpload('assurance', target.files[0]);
					}"
                  />
                </div>
              </div>
            </div>

            <!-- Document spécifique aux assureurs -->
            <div v-if="accountType === 'assureur'">
              <Label>Agrément ACPR / Autorisation d'exercer *</Label>
              <div class="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload class="mx-auto h-12 w-12 text-gray-400" />
                <div class="mt-4">
                  <label for="agrement" class="cursor-pointer">
                    <span class="mt-2 block text-sm font-medium text-gray-900">
                      {{ documents.agrement ? documents.agrement.name : "Cliquez pour télécharger votre agrément" }}
                    </span>
                    <span class="mt-1 block text-xs text-gray-500">PDF, max 5MB</span>
                  </label>
                  <input
                    id="agrement"
                    type="file"
                    class="hidden"
                    accept=".pdf"
                    @change="
						(e: Event) => {
							const target = e.target as HTMLInputElement;
							if (target?.files?.[0]) handleFileUpload('agrement', target.files[0]);
						}
						"
                  />
                </div>
              </div>
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

            <div class="bg-blue-50 p-4 rounded-lg">
              <h4 class="font-medium text-blue-900 mb-2">Une fois votre compte créé, vous pourrez :</h4>
              <ul class="text-sm text-blue-800 space-y-1">
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
                v-model="contact.prenom"
              />
            </div>

            <div>
              <Label for="nom">Nom du contact *</Label>
              <Input
                id="nom"
                v-model="contact.nom"
              />
            </div>

            <div>
              <Label for="emailContact">Email professionnel *</Label>
              <Input
                id="emailContact"
                type="email"
                v-model="contact.email"
              />
            </div>

            <div>
              <Label for="telephone">Téléphone professionnel *</Label>
              <Input
                id="telephone"
                type="tel"
                v-model="contact.telephone"
              />
            </div>
          </div>

          <!-- Étape 3: Compte (Sociétaire) -->
          <div v-else-if="currentStep === 3 && accountType === 'societaire'" class="space-y-4">
            <div>
              <Label for="emailLoginSocietaire">Adresse email (login) *</Label>
              <Input
                id="emailLoginSocietaire"
                type="email"
                v-model="account.email"
              />
            </div>

            <div>
              <Label for="passwordSocietaire">Mot de passe *</Label>
              <Input
                id="passwordSocietaire"
                type="password"
                v-model="account.password"
              />
            </div>

            <div>
              <Label for="confirmPasswordSocietaire">Confirmation mot de passe *</Label>
              <Input
                id="confirmPasswordSocietaire"
                type="password"
                v-model="account.confirmPassword"
              />
              <p v-if="account.password && account.confirmPassword && account.password !== account.confirmPassword" class="text-sm text-red-600 mt-1">Les mots de passe ne correspondent pas</p>
            </div>

            <div class="bg-green-50 p-4 rounded-lg">
              <p class="text-sm text-green-800">
                <strong>Votre espace personnel vous permettra de :</strong>
                <br />• Accéder à votre tableau de bord personnalisé
                <br />• Gérer vos documents et photos
                <br />• Suivre tous vos dossiers en cours
              </p>
            </div>
          </div>

          <!-- Étape 4: Informations spécifiques -->
          <div v-else-if="currentStep === 4 && accountType === 'prestataire'" class="space-y-6">
            <div>
              <Label for="secteursActivite">Secteurs d'activité *</Label>
              <Input
                id="secteursActivite"
                v-model="providerInfo.secteursActivite"
                placeholder="Ex: Maçonnerie, Plomberie, Électricité..."
              />
              <p class="text-sm text-gray-500 mt-1">Séparez les secteurs par des virgules</p>
            </div>

            <div>
              <Label>Zones géographiques d'intervention *</Label>
              <p class="text-sm text-gray-500 mb-4">Sélectionnez au moins une zone d'intervention</p>

              <div class="space-y-4">
                <div>
                  <Label class="text-sm font-medium">Régions</Label>
                  <div class="mt-2 space-y-2">
                    <label v-for="region in regions" :key="region" class="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        :checked="providerInfo.zonesGeographiques.regions.includes(region)"
                        @change="(e) => {
                          const target = e.target as HTMLInputElement;
                          if (target.checked) {
                            providerInfo.zonesGeographiques.regions.push(region);
                          } else {
                            providerInfo.zonesGeographiques.regions = providerInfo.zonesGeographiques.regions.filter((r) => r !== region);
                          }
                        }"
                        class="rounded"
                      />
                      <span>{{ region }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="currentStep === 4 && accountType === 'assureur'" class="space-y-6">
            <div>
              <Label for="numeroAgrement">Numéro d'agrément ACPR *</Label>
              <Input
                id="numeroAgrement"
                v-model="insurerInfo.numeroAgrement"
                placeholder="Ex: 12345678"
              />
            </div>

            <div>
              <Label>Types d'assurance proposés *</Label>
              <div class="mt-2 space-y-2">
                <label v-for="type in typesAssuranceOptions" :key="type" class="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    :checked="insurerInfo.typesAssurance.includes(type)"
                    @change="(e) => {
                      const target = e.target as HTMLInputElement;
                      if (target.checked) {
                        insurerInfo.typesAssurance.push(type);
                      } else {
                        insurerInfo.typesAssurance = insurerInfo.typesAssurance.filter((t) => t !== type);
                      }
                    }"
                    class="rounded"
                  />
                  <span>{{ type }}</span>
                </label>
              </div>
            </div>

            <div>
              <Label for="garantiesProposees">Garanties et services proposés *</Label>
              <Input
                id="garantiesProposees"
                v-model="insurerInfo.garantiesProposees"
                placeholder="Décrivez vos principales garanties..."
              />
            </div>

            <div>
              <Label>Zones de couverture *</Label>
              <div class="mt-2 space-y-2">
                <label v-for="region in regions" :key="region" class="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    :checked="insurerInfo.zonesCouverture.regions.includes(region)"
                    @change="(e) => {
                      const target = e.target as HTMLInputElement;
                      if (target.checked) {
                        insurerInfo.zonesCouverture.regions.push(region);
                      } else {
                        insurerInfo.zonesCouverture.regions = insurerInfo.zonesCouverture.regions.filter((r) => r !== region);
                      }
                    }"
                    class="rounded"
                  />
                  <span>{{ region }}</span>
                </label>
              </div>
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
            <CheckCircle class="mx-auto h-16 w-16 text-green-600" />
            <h3 class="text-xl font-semibold text-gray-900">Inscription réussie !</h3>
            <p class="text-gray-600">
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
            <div :class="`${accountType === 'societaire' ? 'bg-green-50' : 'bg-blue-50'} p-4 rounded-lg`">
              <p :class="`text-sm ${accountType === 'societaire' ? 'text-green-800' : 'text-blue-800'}`">
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
            <Button v-if="accountType === 'societaire'" class="mt-4">Accéder à mon espace</Button>
          </div>

          <!-- Boutons de navigation -->
          <div v-if="(accountType === 'societaire' && currentStep < 4) || (accountType !== 'societaire' && currentStep < 6)" class="flex justify-between pt-6">
            <Button variant="outline" @click="prevStep" :disabled="currentStep === 1">
              Précédent
            </Button>

            <Button @click="(accountType === 'societaire' && currentStep < 3) || (accountType !== 'societaire' && currentStep < 5) ? nextStep() : submitRegistration()" :disabled="!validateStep(currentStep) || (isLoading && ((accountType === 'societaire' && currentStep >= 3) || (accountType !== 'societaire' && currentStep >= 5)))">
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
