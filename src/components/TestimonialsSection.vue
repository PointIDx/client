<script setup lang="ts">
import { Building2, Shield, User, Star } from "lucide-vue-next"
import { Card, CardContent } from "@/components/ui/card"

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
</script>

<template>
  <section id="temoignages" class="py-32 bg-white">
    <div class="container mx-auto px-4">
      <div class="text-center mb-20">
        <h2 class="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
          ILS NOUS FONT
          <br />
          CONFIANCE
        </h2>
        <p class="text-xl text-gray-700 max-w-3xl mx-auto">
          Découvrez ce que nos utilisateurs pensent de notre plateforme.
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <Card
          v-for="(testimonial, index) in testimonials"
          :key="index"
          class="bg-white border-gray-200 hover:border-gray-300 transition-all duration-500 transform hover:scale-105 hover:shadow-lg group"
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
            <p class="text-gray-700 mb-8 text-lg leading-relaxed italic">"{{ testimonial.text }}"</p>
            <div class="flex items-center">
              <div
                class="w-12 h-12 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300"
                :class="`bg-gradient-to-br from-${testimonial.color}-500 to-${testimonial.color}-400`"
              >
                <component :is="testimonial.icon" class="h-6 w-6 text-black" />
              </div>
              <div>
                <div class="font-bold text-gray-900 text-lg">{{ testimonial.author }}</div>
                <div class="text-gray-600">{{ testimonial.role }}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
</template>
