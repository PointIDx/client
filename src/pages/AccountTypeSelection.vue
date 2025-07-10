<script setup lang="ts">
import { Button } from "@/components/ui/button"
import UserTypeCard from "@/components/UserTypeCard.vue"
import { Building2, Shield, User } from "lucide-vue-next"

const emit = defineEmits(["selectType"])

const userTypes = [
  {
    type: "prestataire",
    icon: Building2,
    iconBgClass: "bg-blue-100",
    iconTextColorClass: "text-blue-600",
    title: "Prestataire",
    description: "Entreprise de travaux, artisan, professionnel du bâtiment",
    youAreList: [
      "Artisan du bâtiment",
      "Entreprise de travaux",
      "Professionnel de la construction",
      "Prestataire de services",
    ],
    youCanList: [
      "Définir vos secteurs d'activité",
      "Configurer vos zones d'intervention",
      "Gérer vos devis et chantiers",
      "Accéder aux assurances adaptées",
    ],
    buttonText: "S'inscrire comme Prestataire",
    buttonVariant: "default",
  },
  {
    type: "assureur",
    icon: Shield,
    iconBgClass: "bg-green-100",
    iconTextColorClass: "text-green-600",
    title: "Assureur",
    description: "Compagnie d'assurance, courtier, agent général",
    youAreList: [
      "Compagnie d'assurance",
      "Courtier en assurance",
      "Agent général",
      "Mutuelle professionnelle",
    ],
    youCanList: [
      "Proposer vos produits d'assurance",
      "Définir vos zones de couverture",
      "Gérer vos contrats et sinistres",
      "Accéder aux prestataires qualifiés",
    ],
    buttonText: "S'inscrire comme Assureur",
    buttonVariant: "outline",
  },
  {
    type: "societaire",
    icon: User,
    iconBgClass: "bg-purple-100",
    iconTextColorClass: "text-purple-600",
    title: "Sociétaire",
    description: "Particulier, client final, bénéficiaire",
    youAreList: [
      "Particulier",
      "Propriétaire",
      "Locataire",
      "Bénéficiaire d'un contrat",
    ],
    youCanList: [
      "Suivre l'avancement de votre dossier",
      "Ajouter des photos et documents",
      "Communiquer avec les intervenants",
      "Timeline des interventions",
    ],
    buttonText: "S'inscrire comme Sociétaire",
    buttonVariant: "secondary",
  },
]

const onSelectType = (type: "prestataire" | "assureur" | "societaire") => {
  emit("selectType", type)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto max-w-4xl px-4">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-gray-900">Inscription Professionnelle</h1>
        <p class="mt-2 text-gray-600">Choisissez le type de compte qui correspond à votre activité</p>
      </div>

      <div class="grid md:grid-cols-3 gap-6">
        <UserTypeCard
          v-for="userType in userTypes"
          :key="userType.type"
          :icon="userType.icon"
          :icon-bg-class="userType.iconBgClass"
          :icon-text-color-class="userType.iconTextColorClass"
          :title="userType.title"
          :description="userType.description"
          :you-are-list="userType.youAreList"
          :you-can-list="userType.youCanList"
          :button-text="userType.buttonText"
          :button-variant="userType.buttonVariant"
          @select="onSelectType(userType.type)"
        />
      </div>

      <div class="mt-12 text-center">
        <div class="bg-white p-6 rounded-lg shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Vous hésitez ?</h3>
          <p class="text-gray-600 mb-4">
            Contactez notre équipe pour vous aider à choisir le type de compte le plus adapté à votre activité.
          </p>
          <Button variant="ghost">Nous contacter</Button>
        </div>
      </div>
    </div>
  </div>
</template>
