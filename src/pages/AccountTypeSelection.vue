<script setup lang="ts">
import { Button } from "@/components/ui/button"
import UserTypeCard from "@/components/UserTypeCard.vue"
import { Building2, Shield, User } from "lucide-vue-next"
import type { UserType } from "@/interfaces/user-type"
import { AccountType } from "@/enums/account-type"

const emit = defineEmits(["selectType"])

const userTypes: UserType[] = [
  {
    type: AccountType.Prestataire,
    icon: Building2,
    iconBgClass: "bg-gray-100",
    iconTextColorClass: "text-gray-800",
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
    type: AccountType.Assureur,
    icon: Shield,
    iconBgClass: "bg-gray-200",
    iconTextColorClass: "text-gray-800",
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
    type: AccountType.Societaire,
    icon: User,
    iconBgClass: "bg-gray-300",
    iconTextColorClass: "text-gray-800",
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
    buttonVariant: "outline",
  },
]

const onSelectType = (type: AccountType) => {
  emit("selectType", type)
}
</script>

<template>
  <div class="min-h-screen bg-white text-black font-mono py-8">
    <div class="container mx-auto max-w-4xl px-4">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-black">Inscription Professionnelle</h1>
        <p class="mt-2 text-gray-700">Choisissez le type de compte qui correspond à votre activité</p>
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
        <div class="bg-gray-100 p-6 rounded-lg border border-gray-300">
          <h3 class="text-lg font-semibold text-black mb-2">Vous hésitez ?</h3>
          <p class="text-gray-700 mb-4">
            Contactez notre équipe pour vous aider à choisir le type de compte le plus adapté à votre activité.
          </p>
          <Button variant="ghost" class="text-gray-700 hover:text-black">Nous contacter</Button>
        </div>
      </div>
    </div>
  </div>
</template>
