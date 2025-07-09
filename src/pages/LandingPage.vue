<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  Shield,
  User,
  ArrowRight,
  CheckCircle,
  Clock,
  FileText,
  MessageSquare,
  Camera,
  MapPin,
  Star,
  Users,
  TrendingUp,
  Zap,
  Phone,
  Mail,
  LocateIcon as Location,
  Play,
  ChevronDown,
} from 'lucide-vue-next'

const isVisible = ref(false)
const activeFeature = ref(0)

onMounted(() => {
  isVisible.value = true
  setInterval(() => {
    activeFeature.value = (activeFeature.value + 1) % 6
  }, 3000)
})

const features = [
  { icon: Clock, title: 'Suivi en temps réel', color: 'blue' },
  { icon: MessageSquare, title: 'Communication intégrée', color: 'green' },
  { icon: Camera, title: 'Gestion documentaire', color: 'purple' },
  { icon: MapPin, title: 'Géolocalisation', color: 'orange' },
  { icon: FileText, title: 'Rapports automatisés', color: 'red' },
  { icon: TrendingUp, title: 'Analytics avancés', color: 'indigo' },
]

const userTypes = [
  {
    icon: Building2,
    title: 'PRESTATAIRES',
    subtitle: 'Artisans, entreprises de travaux, professionnels du bâtiment',
    color: 'blue',
    features: [
      'Gestion centralisée des missions',
      'Suivi en temps réel des interventions',
      'Communication directe avec les clients',
      'Gestion documentaire simplifiée',
    ],
    cta: 'REJOINDRE COMME PRESTATAIRE',
  },
  {
    icon: Shield,
    title: 'ASSUREURS',
    subtitle: "Compagnies d'assurance, courtiers, agents généraux",
    color: 'green',
    features: [
      'Création et suivi des missions',
      'Réseau de prestataires qualifiés',
      'Tableaux de bord analytiques',
      'Gestion des coûts optimisée',
    ],
    cta: 'REJOINDRE COMME ASSUREUR',
  },
  {
    icon: User,
    title: 'SOCIÉTAIRES',
    subtitle: 'Particuliers, propriétaires, bénéficiaires',
    color: 'purple',
    features: [
      'Suivi transparent du dossier',
      'Ajout de photos et commentaires',
      'Communication avec les intervenants',
      'Timeline des interventions',
    ],
    cta: 'ACCÉDER À MON DOSSIER',
  },
]

const testimonials = [
  {
    text: "Grâce à PointID, je gère mes interventions 3x plus rapidement. L'interface est intuitive et le suivi client est parfait.",
    author: 'Marc Dubois',
    role: 'Artisan plombier',
    icon: Building2,
    color: 'blue',
  },
  {
    text: 'La plateforme nous permet de suivre tous nos dossiers en temps réel. Nos clients sont plus satisfaits et nos coûts ont diminué.',
    author: 'Sophie Martin',
    role: 'Directrice Assurance Plus',
    icon: Shield,
    color: 'green',
  },
  {
    text: "Enfin une solution où je peux suivre l'avancement de mon dossier ! Je peux même ajouter des photos et communiquer directement.",
    author: 'Jean Dupont',
    role: 'Propriétaire',
    icon: User,
    color: 'purple',
  },
]

const footerLinks = {
  product: ['Fonctionnalités', 'Tarifs', 'API', 'Intégrations'],
  support: ['Documentation', "Centre d'aide", 'Formation', 'Status'],
}

const contactInfo = [
  { icon: Phone, text: '01 23 45 67 89' },
  { icon: Mail, text: 'contact@pointid.fr' },
  { icon: Location, text: 'Paris, France' },
]
</script>

<template>
  <div class="min-h-screen bg-black text-white font-mono overflow-x-hidden">
    <!-- Header -->
    <header class="border-b border-gray-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60 sticky top-0 z-50">
      <div class="container mx-auto px-4 h-16 flex items-center justify-between">
        <div
          class="flex items-center space-x-3 transition-all duration-1000"
          :class="isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'"
        >
          <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
            <Building2 class="h-5 w-5 text-black" />
          </div>
          <span class="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            PointID
          </span>
        </div>

        <nav class="hidden md:flex items-center space-x-8">
          <a
            v-for="(item, index) in ['Fonctionnalités', 'Utilisateurs', 'Témoignages', 'Contact']"
            :key="item"
            :href="`#${item.toLowerCase()}`"
            class="text-gray-400 hover:text-white transition-all duration-300 hover:scale-105"
            :class="isVisible ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'"
            :style="{ transitionDelay: `${index * 100}ms` }"
          >
            {{ item }}
          </a>
        </nav>

        <div
          class="flex items-center space-x-4 transition-all duration-1000"
          :class="isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'"
        >
          <Button variant="ghost" class="text-gray-400 hover:text-white hover:bg-gray-800">
            Se connecter
          </Button>
		  <router-link to="/pro-registration" v-slot="{navigate}">
			<Button class="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-black font-semibold" rou>
				S'inscrire
			</Button>
		  </router-link>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="py-32 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-cyan-900/20"></div>
      <div class="absolute inset-0">
        <div
          v-for="i in 50"
          :key="i"
          class="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-pulse"
          :style="{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }"
        />
      </div>

      <div class="container mx-auto px-4 text-center relative z-10">
        <div
          class="transition-all duration-1000"
          :class="isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'"
        >
          <Badge class="mb-6 bg-blue-900/50 text-blue-300 hover:bg-blue-900/70 border border-blue-700/50 text-sm px-4 py-2">
            <span class="animate-pulse mr-2">●</span>
            Plateforme de gestion des sinistres
          </Badge>

          <h1 class="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            <span class="block mb-2">SIMPLIFIEZ LA</span>
            <span class="block bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent animate-pulse">
              GESTION
            </span>
            <span class="block mt-2">DE VOS SINISTRES</span>
          </h1>

          <p class="text-xl text-gray-400 mb-12 max-w-4xl mx-auto leading-relaxed">
            La première plateforme qui connecte <span class="text-blue-400 font-semibold">assureurs</span>,
            <span class="text-green-400 font-semibold">prestataires</span> et
            <span class="text-purple-400 font-semibold">sociétaires</span> pour un suivi transparent et efficace
            des dossiers sinistres.
          </p>

          <div class="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button
              size="lg"
              class="text-lg px-10 py-6 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-black font-semibold transform hover:scale-105 transition-all duration-300"
            >
              COMMENCER GRATUITEMENT
              <ArrowRight class="ml-3 h-6 w-6" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              class="text-lg px-10 py-6 border-gray-600 text-white hover:bg-gray-800 hover:border-gray-500 transform hover:scale-105 transition-all duration-300 bg-transparent"
            >
              <Play class="mr-3 h-6 w-6" />
              VOIR LA DÉMO
            </Button>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div
              v-for="(stat, index) in [
                { value: '500+', label: 'Prestataires actifs', color: 'blue', delay: '0ms' },
                { value: '50+', label: 'Assureurs partenaires', color: 'green', delay: '200ms' },
                { value: '10k+', label: 'Dossiers traités', color: 'purple', delay: '400ms' },
                { value: '98%', label: 'Satisfaction client', color: 'orange', delay: '600ms' },
              ]"
              :key="index"
              class="text-center transform transition-all duration-1000 hover:scale-110"
              :class="isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'"
              :style="{ transitionDelay: stat.delay }"
            >
              <div
                class="text-4xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent"
                :class="`from-${stat.color}-400 to-${stat.color}-300`"
              >
                {{ stat.value }}
              </div>
              <div class="text-gray-400 text-sm uppercase tracking-wider">{{ stat.label }}</div>
            </div>
          </div>
        </div>

        <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown class="h-8 w-8 text-gray-500" />
        </div>
      </div>
    </section>

    <!-- Types d'utilisateurs -->
    <section id="utilisateurs" class="py-32 bg-gradient-to-b from-black to-gray-900">
      <div class="container mx-auto px-4">
        <div class="text-center mb-20">
          <h2 class="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            UNE SOLUTION POUR
            <br />
            CHAQUE PROFESSIONNEL
          </h2>
          <p class="text-xl text-gray-400 max-w-3xl mx-auto">
            Que vous soyez prestataire, assureur ou sociétaire, notre plateforme s'adapte à vos besoins spécifiques.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <Card
            v-for="(user, index) in userTypes"
            :key="index"
            class="relative bg-gray-900/50 border-gray-700 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl group"
            :class="`hover:border-${user.color}-500/50 hover:shadow-${user.color}-500/20`"
          >
            <CardHeader class="text-center pb-6">
              <div
                class="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                :class="`bg-gradient-to-br from-${user.color}-500 to-${user.color}-400`"
              >
                <component :is="user.icon" class="h-10 w-10 text-black" />
              </div>
              <CardTitle
                class="text-2xl font-bold bg-clip-text text-transparent"
                :class="`bg-gradient-to-r from-${user.color}-400 to-${user.color}-300`"
              >
                {{ user.title }}
              </CardTitle>
              <CardDescription class="text-gray-400 text-base">{{ user.subtitle }}</CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
              <div class="space-y-4">
                <div
                  v-for="(feature, featureIndex) in user.features"
                  :key="featureIndex"
                  class="flex items-center space-x-3 group-hover:translate-x-2 transition-transform duration-300"
                  :style="{ transitionDelay: `${featureIndex * 100}ms` }"
                >
                  <CheckCircle class="h-5 w-5 flex-shrink-0" :class="`text-${user.color}-400`" />
                  <span class="text-gray-300">{{ feature }}</span>
                </div>
              </div>
              <Button
                class="w-full mt-8 text-black font-semibold transform hover:scale-105 transition-all duration-300"
                :class="`bg-gradient-to-r from-${user.color}-600 to-${user.color}-500 hover:from-${user.color}-700 hover:to-${user.color}-600`"
                size="lg"
              >
                {{ user.cta }}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>

    <!-- Fonctionnalités avec animation -->
    <section id="fonctionnalites" class="py-32 bg-black relative">
      <div class="container mx-auto px-4">
        <div class="text-center mb-20">
          <h2 class="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            FONCTIONNALITÉS
            <br />
            AVANCÉES
          </h2>
          <p class="text-xl text-gray-400 max-w-3xl mx-auto">
            Tous les outils dont vous avez besoin pour gérer efficacement vos sinistres et interventions.
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div
            v-for="(feature, index) in features"
            :key="index"
            class="text-center p-8 rounded-2xl border transition-all duration-500 transform hover:scale-105"
            :class="
              activeFeature === index
                ? `border-${feature.color}-500/50 bg-${feature.color}-900/20 shadow-2xl shadow-${feature.color}-500/20`
                : 'border-gray-800 bg-gray-900/30 hover:border-gray-700'
            "
          >
            <div
              class="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-500"
              :class="
                activeFeature === index
                  ? `bg-gradient-to-br from-${feature.color}-500 to-${feature.color}-400 scale-110`
                  : `bg-gray-800 group-hover:bg-${feature.color}-900/50`
              "
            >
              <component
                :is="feature.icon"
                class="h-10 w-10 transition-colors duration-500"
                :class="activeFeature === index ? 'text-black' : `text-${feature.color}-400`"
              />
            </div>
            <h3
              class="text-xl font-bold mb-3 transition-colors duration-500"
              :class="activeFeature === index ? `text-${feature.color}-300` : 'text-white'"
            >
              {{ feature.title.toUpperCase() }}
            </h3>
            <p class="text-gray-400 leading-relaxed">
              <span v-if="index === 0">Timeline détaillée de chaque étape du dossier avec notifications automatiques.</span>
              <span v-if="index === 1">Chat en temps réel entre tous les intervenants du dossier.</span>
              <span v-if="index === 2">Upload de photos, documents et commentaires pour enrichir le dossier.</span>
              <span v-if="index === 3">Localisation précise des interventions et optimisation des déplacements.</span>
              <span v-if="index === 4">Génération automatique de rapports et factures avec signature électronique.</span>
              <span v-if="index === 5">Tableaux de bord avec statistiques et indicateurs de performance.</span>
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Témoignages -->
    <section id="temoignages" class="py-32 bg-gradient-to-b from-gray-900 to-black">
      <div class="container mx-auto px-4">
        <div class="text-center mb-20">
          <h2 class="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            ILS NOUS FONT
            <br />
            CONFIANCE
          </h2>
          <p class="text-xl text-gray-400 max-w-3xl mx-auto">
            Découvrez ce que nos utilisateurs pensent de notre plateforme.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <Card
            v-for="(testimonial, index) in testimonials"
            :key="index"
            class="bg-gray-900/50 border-gray-700 hover:border-gray-600 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl group"
          >
            <CardContent class="p-8">
              <div class="flex items-center mb-6">
                <Star
                  v-for="i in 5"
                  :key="i"
                  class="h-5 w-5 text-yellow-400 fill-current animate-pulse"
                  :style="{ animationDelay: `${i * 200}ms` }"
                />
              </div>
              <p class="text-gray-300 mb-8 text-lg leading-relaxed italic">"{{ testimonial.text }}"</p>
              <div class="flex items-center">
                <div
                  class="w-12 h-12 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300"
                  :class="`bg-gradient-to-br from-${testimonial.color}-500 to-${testimonial.color}-400`"
                >
                  <component :is="testimonial.icon" class="h-6 w-6 text-black" />
                </div>
                <div>
                  <div class="font-bold text-white text-lg">{{ testimonial.author }}</div>
                  <div class="text-gray-400">{{ testimonial.role }}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-32 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-blue-900/50 via-cyan-900/50 to-blue-900/50"></div>
      <div class="absolute inset-0">
        <div
          v-for="i in 30"
          :key="i"
          class="absolute w-2 h-2 bg-cyan-400/20 rounded-full animate-ping"
          :style="{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }"
        />
      </div>

      <div class="container mx-auto px-4 text-center relative z-10">
        <h2 class="text-4xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
          PRÊT À TRANSFORMER
          <br />
          VOTRE GESTION ?
        </h2>
        <p class="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
          Rejoignez des centaines de professionnels qui font déjà confiance à PointID.
        </p>
        <div class="flex flex-col sm:flex-row gap-6 justify-center">
          <Button
            size="lg"
            class="text-lg px-12 py-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-black font-bold transform hover:scale-110 transition-all duration-300 shadow-2xl shadow-cyan-500/25"
          >
            COMMENCER GRATUITEMENT
            <ArrowRight class="ml-3 h-6 w-6" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            class="text-lg px-12 py-6 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black transform hover:scale-110 transition-all duration-300 bg-transparent"
          >
            PLANIFIER UNE DÉMO
          </Button>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer id="contact" class="bg-black border-t border-gray-800 py-20">
      <div class="container mx-auto px-4">
        <div class="grid md:grid-cols-4 gap-12">
          <div>
            <div class="flex items-center space-x-3 mb-6">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                <Building2 class="h-6 w-6 text-black" />
              </div>
              <span class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                PointID
              </span>
            </div>
            <p class="text-gray-400 mb-6 leading-relaxed">
              La plateforme de référence pour la gestion des sinistres et interventions professionnelles.
            </p>
            <div class="flex space-x-4">
              <div class="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors duration-300 cursor-pointer">
                <Users class="h-5 w-5 text-gray-400" />
              </div>
              <div class="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors duration-300 cursor-pointer">
                <Zap class="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-lg font-bold mb-6 text-white">PRODUIT</h3>
            <ul class="space-y-3">
              <li v-for="link in footerLinks.product" :key="link">
                <a
                  href="#"
                  class="text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block"
                >
                  {{ link }}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 class="text-lg font-bold mb-6 text-white">SUPPORT</h3>
            <ul class="space-y-3">
              <li v-for="link in footerLinks.support" :key="link">
                <a
                  href="#"
                  class="text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block"
                >
                  {{ link }}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 class="text-lg font-bold mb-6 text-white">CONTACT</h3>
            <div class="space-y-4">
              <div
                v-for="(contact, index) in contactInfo"
                :key="index"
                class="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors duration-300 group"
              >
                <component :is="contact.icon" class="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                <span>{{ contact.text }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p class="text-gray-400 text-sm">© 2024 PointID. TOUS DROITS RÉSERVÉS.</p>
          <div class="flex space-x-8 mt-4 md:mt-0">
            <a
              v-for="link in ['Mentions légales', 'Confidentialité', 'CGU']"
              :key="link"
              href="#"
              class="text-gray-400 hover:text-white text-sm transition-colors duration-300 hover:underline"
            >
              {{ link }}
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
