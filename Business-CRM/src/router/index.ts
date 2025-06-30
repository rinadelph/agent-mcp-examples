import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue')
    },
    {
      path: '/shop',
      name: 'shop',
      component: () => import('../views/ProductList.vue')
    },
    {
      path: '/products/:id',
      name: 'product-detail',
      component: () => import('../views/ProductDetail.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/Register.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/account',
      name: 'account',
      component: () => import('../views/CustomerDashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminDashboard.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('../views/Cart.vue')
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('../views/Checkout.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/About.vue')
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/Contact.vue')
    },
    {
      path: '/auth-test',
      name: 'auth-test',
      component: () => import('../views/AuthTest.vue')
    }
  ]
})

// Navigation guards
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  
  // Check auth status on initial load with timeout
  if (!authStore.user && !authStore.loading) {
    authStore.checkAuthStatus() // Don't await - let it run in background
  }
  
  // Wait for auth check to complete with timeout to prevent infinite hanging
  let waitTime = 0
  const maxWaitTime = 3000 // 3 seconds max wait
  while (authStore.loading && waitTime < maxWaitTime) {
    await new Promise(resolve => setTimeout(resolve, 50))
    waitTime += 50
  }
  
  // For admin routes, wait a bit longer for profile/admin status to load
  if (to.meta.requiresAdmin && authStore.isAuthenticated && !authStore.profile) {
    let adminWaitTime = 0
    const maxAdminWaitTime = 2000 // 2 seconds for admin check
    while (!authStore.profile && adminWaitTime < maxAdminWaitTime) {
      await new Promise(resolve => setTimeout(resolve, 100))
      adminWaitTime += 100
    }
  }
  
  const isAuthenticated = authStore.isAuthenticated
  const isAdmin = authStore.isAdmin
  
  // Protected route check
  if (to.meta.requiresAuth && !isAuthenticated) {
    // Redirect to login with redirect query
    next({
      name: 'login',
      query: { redirect: to.fullPath }
    })
    return
  }
  
  // Admin route check
  if (to.meta.requiresAdmin && !isAdmin) {
    // Redirect to account page if not admin
    next({ name: 'account' })
    return
  }
  
  // Guest route check (login/register pages)
  if (to.meta.requiresGuest && isAuthenticated) {
    // Redirect to home if already authenticated
    next({ name: 'home' })
    return
  }
  
  next()
})

export default router