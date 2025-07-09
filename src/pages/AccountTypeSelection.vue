<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, Shield, ArrowRight, User } from 'lucide-vue-next'

const emit = defineEmits(['selectType'])

const onSelectType = (type: 'prestataire' | 'assureur' | 'societaire') => {
  emit('selectType', type)
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
        <!-- Carte Prestataire -->
        <Card class="relative hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader class="text-center pb-4">
            <div class="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <Building2 class="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle class="text-xl">Prestataire</CardTitle>
            <CardDescription>Entreprise de travaux, artisan, professionnel du bâtiment</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <h4 class="font-medium text-gray-900">Vous êtes :</h4>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Artisan du bâtiment</li>
                <li>• Entreprise de travaux</li>
                <li>• Professionnel de la construction</li>
                <li>• Prestataire de services</li>
              </ul>
            </div>

            <div class="space-y-2">
              <h4 class="font-medium text-gray-900">Vous pourrez :</h4>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Définir vos secteurs d'activité</li>
                <li>• Configurer vos zones d'intervention</li>
                <li>• Gérer vos devis et chantiers</li>
                <li>• Accéder aux assurances adaptées</li>
              </ul>
            </div>

            <Button @click="onSelectType('prestataire')" class="w-full mt-6" size="lg">
              S'inscrire comme Prestataire
              <ArrowRight class="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <!-- Carte Assureur -->
        <Card class="relative hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader class="text-center pb-4">
            <div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
              <Shield class="h-8 w-8 text-green-600" />
            </div>
            <CardTitle class="text-xl">Assureur</CardTitle>
            <CardDescription>Compagnie d'assurance, courtier, agent général</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <h4 class="font-medium text-gray-900">Vous êtes :</h4>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Compagnie d'assurance</li>
                <li>• Courtier en assurance</li>
                <li>• Agent général</li>
                <li>• Mutuelle professionnelle</li>
              </ul>
            </div>

            <div class="space-y-2">
              <h4 class="font-medium text-gray-900">Vous pourrez :</h4>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Proposer vos produits d'assurance</li>
                <li>• Définir vos zones de couverture</li>
                <li>• Gérer vos contrats et sinistres</li>
                <li>• Accéder aux prestataires qualifiés</li>
              </ul>
            </div>

            <Button @click="onSelectType('assureur')" class="w-full mt-6" size="lg" variant="outline">
              S'inscrire comme Assureur
              <ArrowRight class="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <!-- Carte Sociétaire -->
        <Card class="relative hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader class="text-center pb-4">
            <div class="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
              <User class="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle class="text-xl">Sociétaire</CardTitle>
            <CardDescription>Particulier, client final, bénéficiaire</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <h4 class="font-medium text-gray-900">Vous êtes :</h4>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Particulier</li>
                <li>• Propriétaire</li>
                <li>• Locataire</li>
                <li>• Bénéficiaire d'un contrat</li>
              </ul>
            </div>

            <div class="space-y-2">
              <h4 class="font-medium text-gray-900">Vous pourrez :</h4>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• Suivre l'avancement de votre dossier</li>
                <li>• Ajouter des photos et documents</li>
                <li>• Communiquer avec les intervenants</li>
                <li>• Consulter vos factures</li>
              </ul>
            </div>

            <Button @click="onSelectType('societaire')" class="w-full mt-6" size="lg" variant="secondary">
              S'inscrire comme Sociétaire
              <ArrowRight class="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
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
