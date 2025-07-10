import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '../pages/LandingPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: LandingPage,
    },
    {
      path: '/pro-registration',
      name: 'pro-registration',
      component: () => import('../pages/ProRegistration.vue'),
    },
    {
      path: '/societaire-login',
      name: 'societaire-login',
      component: () => import('../pages/SocietaireLogin.vue'),
    },
    {
      path: '/societaire-dashboard',
      name: 'societaire-dashboard',
      component: () => import('../pages/SocietaireDashboard.vue'),
      props: true,
    },
    {
      path: '/assureur-dashboard',
      name: 'assureur-dashboard',
      component: () => import('../pages/AssureurDashboard.vue'),
    },
    {
      path: '/prestataire-dashboard',
      name: 'prestataire-dashboard',
      component: () => import('../pages/PrestataireDashboard.vue'),
    },
    {
      path: '/societaire-app',
      name: 'societaire-app',
      component: () => import('../pages/SocietaireApp.vue'),
    },
  ],
})

export default router
