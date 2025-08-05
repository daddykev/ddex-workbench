// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '@/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'

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
      path: '/developer',
      name: 'developer',
      component: () => import('@/views/DeveloperView.vue')
    },
    {
      path: '/contribute',
      name: 'contribute',
      component: () => import('@/views/ContributeView.vue')
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
    // Admin routes
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('@/views/AdminUsers.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
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
    {
      path: '/license',
      name: 'license',
      component: () => import('@/views/legal/LicenseView.vue')
    },
    // 404 catch-all
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue')
    }
  ]
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  // Wait for auth to be ready
  const user = await new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe()
      resolve(user)
    })
  })

  // Check if route requires auth
  if (to.meta.requiresAuth && !user) {
    return next('/login')
  }

  // Check if route requires admin
  if (to.meta.requiresAdmin) {
    if (!user) {
      return next('/login')
    }
    
    // Get user role from Firestore
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      const userData = userDoc.data()
      
      if (userData?.role !== 'admin') {
        return next('/')
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
      return next('/')
    }
  }

  // Check if route requires guest (login/signup pages)
  if (to.meta.requiresGuest && user) {
    return next('/')
  }

  next()
})

export default router