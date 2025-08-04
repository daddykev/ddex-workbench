<template>
  <div class="auth-page">
    <div class="container">
      <div class="auth-container">
        <div class="auth-card card">
          <div class="card-body">
            <div class="auth-header">
              <h1 class="auth-title">Welcome Back</h1>
              <p class="auth-subtitle">Sign in to your account</p>
            </div>

            <form @submit.prevent="handleSubmit" class="auth-form">
              <!-- Email Input -->
              <div class="form-group">
                <label class="form-label">Email</label>
                <input
                  v-model="form.email"
                  type="email"
                  class="form-input"
                  placeholder="you@example.com"
                  required
                  :disabled="loading"
                />
              </div>

              <!-- Password Input -->
              <div class="form-group">
                <label class="form-label">Password</label>
                <input
                  v-model="form.password"
                  type="password"
                  class="form-input"
                  placeholder="••••••••"
                  required
                  :disabled="loading"
                />
              </div>

              <!-- Remember Me & Forgot Password -->
              <div class="form-options">
                <div class="form-checkbox">
                  <input
                    v-model="form.rememberMe"
                    type="checkbox"
                    id="remember"
                    :disabled="loading"
                  />
                  <label for="remember">Remember me</label>
                </div>
                <a href="#" class="forgot-link" @click.prevent="handleForgotPassword">
                  Forgot password?
                </a>
              </div>

              <!-- Error Message -->
              <div v-if="error" class="alert alert-error">
                {{ error }}
              </div>

              <!-- Submit Button -->
              <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
                <span v-if="loading" class="flex items-center justify-center gap-sm">
                  <font-awesome-icon :icon="['fas', 'spinner']" spin />
                  Signing in...
                </span>
                <span v-else>Sign In</span>
              </button>

              <!-- Divider -->
              <div class="auth-divider">
                <span>or sign in with</span>
              </div>

              <!-- Google Sign In -->
              <button
                type="button"
                @click="handleGoogleSignIn"
                class="btn btn-secondary btn-block"
                :disabled="loading"
              >
                <font-awesome-icon :icon="['fab', 'google']" class="mr-sm" />
                Google
              </button>
            </form>

            <!-- Sign Up Link -->
            <div class="auth-footer">
              <p class="text-center text-secondary">
                Don't have an account? 
                <router-link to="/signup" class="text-primary font-medium">
                  Create one
                </router-link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { login, loginWithGoogle, error } = useAuth()

const loading = ref(false)
const form = reactive({
  email: '',
  password: '',
  rememberMe: true
})

const handleSubmit = async () => {
  loading.value = true
  error.value = null
  
  try {
    await login(form.email, form.password)
    // Redirect to the page they were trying to access, or home
    const redirectTo = router.currentRoute.value.query.redirect || '/'
    router.push(redirectTo)
  } catch (err) {
    // Error is handled by useAuth composable
  } finally {
    loading.value = false
  }
}

const handleGoogleSignIn = async () => {
  loading.value = true
  error.value = null
  
  try {
    await loginWithGoogle()
    const redirectTo = router.currentRoute.value.query.redirect || '/'
    router.push(redirectTo)
  } catch (err) {
    // Error is handled by useAuth composable
  } finally {
    loading.value = false
  }
}

const handleForgotPassword = () => {
  // TODO: Implement password reset
  console.log('Password reset not implemented yet')
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 64px - 280px);
  display: flex;
  align-items: center;
  padding: var(--space-2xl) 0;
}

.auth-container {
  max-width: 400px;
  margin: 0 auto;
  width: 100%;
}

.auth-header {
  text-align: center;
  margin-bottom: var(--space-2xl);
}

.auth-title {
  font-size: var(--text-3xl);
  margin-bottom: var(--space-xs);
}

.auth-subtitle {
  color: var(--color-text-secondary);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-checkbox {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.form-checkbox label {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
}

.forgot-link {
  font-size: var(--text-sm);
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--transition-base);
}

.forgot-link:hover {
  color: var(--color-primary-hover);
  text-decoration: underline;
}

.btn-block {
  width: 100%;
}

.auth-divider {
  text-align: center;
  position: relative;
  margin: var(--space-lg) 0;
}

.auth-divider span {
  background: var(--color-surface);
  padding: 0 var(--space-md);
  position: relative;
  z-index: 1;
  color: var(--color-text-tertiary);
  font-size: var(--text-sm);
}

.auth-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--color-border);
}

.auth-footer {
  margin-top: var(--space-xl);
}

.alert {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
}

.alert-error {
  background-color: var(--color-error);
  color: white;
}

.mr-sm {
  margin-right: var(--space-sm);
}
</style>