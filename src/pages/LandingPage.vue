<script setup lang="ts">
import AppHeader from "@/components/AppHeader.vue"
import HeroSection from "@/components/HeroSection.vue"
import UserTypesSection from "@/components/UserTypesSection.vue"
import FeaturesSection from "@/components/FeaturesSection.vue"
import TestimonialsSection from "@/components/TestimonialsSection.vue"
import CallToActionSection from "@/components/CallToActionSection.vue"
import AppFooter from "@/components/AppFooter.vue"
</script>

<template>
  <div class="min-h-screen bg-black text-white font-mono overflow-x-hidden">
    <AppHeader />

    <HeroSection />

    <UserTypesSection />

    <FeaturesSection />

    <TestimonialsSection />

    <CallToActionSection />

    <AppFooter />
  </div>
</template>
