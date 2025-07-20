import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '../pages/LandingPage.vue'
import { useAuthStore } from '@/stores/auth'

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
      path: '/login-selection',
      name: 'login-selection',
      component: () => import('../pages/LoginSelection.vue'),
    },
    {
      path: '/login/:type',
      name: 'login',
      component: () => import('../pages/Login.vue'),
      props: true,
    },
    {
      path: '/societaire-dashboard',
      name: 'societaire-dashboard',
      component: () => import('../pages/SocietaireDashboard.vue'),
      props: true,
      meta: { requiresAuth: true },
    },
    {
      path: '/assureur-dashboard',
      name: 'assureur-dashboard',
      component: () => import('../pages/AssureurDashboard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/prestataire-dashboard',
      name: 'prestataire-dashboard',
      component: () => import('../pages/PrestataireDashboard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/mission-creation',
      name: 'mission-creation',
      component: () => import('../pages/MissionCreationPage.vue'),
      props: true,
      meta: { requiresAuth: true },
    },
    {
      path: '/mission/:id',
      name: 'mission-detail',
      component: () => import('../pages/MissionDetailPage.vue'),
      props: true,
      meta: { requiresAuth: true },
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('../pages/ChatPage.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'home' });
  } else {
    next();
  }
});

export default router
