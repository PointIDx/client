<script setup lang="ts">
import { Building2, Users, Zap, Phone, Mail, LocateIcon as Location } from "lucide-vue-next"

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
</template>
