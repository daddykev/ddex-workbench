// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import ValidatorView from '@/views/ValidatorView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'validator',
      component: ValidatorView
    },
    {
      path: '/snippets',
      name: 'snippets',
      // Lazy loaded when the route is visited
      component: () => import('@/views/SnippetsView.vue')
    },
    {
      path: '/api',
      name: 'api-docs',
      component: () => import('@/views/ApiDocsView.vue')
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

export default router