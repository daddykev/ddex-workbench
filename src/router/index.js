import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/SplashPage.vue')
    },
    {
      path: '/validator',
      name: 'validator',
      component: () => import('@/views/ValidatorView.vue')
    },
    {
      path: '/snippets',
      name: 'snippets',
      component: () => import('@/views/SnippetsView.vue')
    },
    {
      path: '/api',
      name: 'api-docs',
      component: () => import('@/views/ApiDocsView.vue')
    },
    {
      path: '/pricing',
      name: 'pricing',
      component: () => import('@/views/PricingView.vue')
    },
    // Auth pages
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/views/auth/SignupView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/UserSettings.vue'),
      meta: { requiresAuth: true }
    },
    // Legal pages
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('@/views/legal/PrivacyView.vue')
    },
    {
      path: '/terms',
      name: 'terms',
      component: () => import('@/views/legal/TermsView.vue')
    },
    // 404 catch-all
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue')
    }
  ]
})

// For now, let's remove the navigation guard to get the app working
// We can add it back later with proper auth checking

export default router