<template>
  <div class="auth-page">
    <div class="container">
      <div class="auth-container">
        <div class="auth-card card">
          <div class="card-body">
            <!-- Password Reset -->
            <template v-if="showReset">
              <div class="auth-header">
                <h1 class="auth-title">Reset Password</h1>
                <p class="auth-subtitle">We'll email you a link to set a new password</p>
              </div>

              <form @submit.prevent="handleResetPassword" class="auth-form">
                <div class="form-group">
                  <label class="form-label">Email</label>
                  <input
                    v-model="resetEmail"
                    type="email"
                    class="form-input"
                    placeholder="you@example.com"
                    required
                    :disabled="resetLoading"
                  />
                </div>

                <div v-if="resetMessage" class="alert alert-success">
                  {{ resetMessage }}
                </div>

                <div v-if="resetError" class="alert alert-error">
                  {{ resetError }}
                </div>

                <button type="submit" class="btn btn-primary btn-block" :disabled="resetLoading">
                  <span v-if="resetLoading" class="flex items-center justify-center gap-sm">
                    <font-awesome-icon :icon="['fas', 'spinner']" spin />
                    Sending...
                  </span>
                  <span v-else>Send reset link</span>
                </button>

                <p class="text-center">
                  <a href="#" class="forgot-link" @click.prevent="closeReset">
                    Back to sign in
                  </a>
                </p>
              </form>
            </template>

            <template v-else>
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
            </template>

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
const { login, loginWithGoogle, resetPassword, error } = useAuth()

const loading = ref(false)

// Password reset state
const showReset = ref(false)
const resetEmail = ref('')
const resetLoading = ref(false)
const resetMessage = ref(null)
const resetError = ref(null)

const form = reactive({
  email: '',
  password: '',
  rememberMe: true
})

// Return to the page the user was trying to reach. Only same-app paths are
// allowed ("/..." but not "//host" or "/\host") to prevent open redirects.
const redirectAfterLogin = () => {
  const redirect = router.currentRoute.value.query.redirect
  const isSafe = typeof redirect === 'string' &&
    redirect.startsWith('/') &&
    !redirect.startsWith('//') &&
    !redirect.startsWith('/\\')
  router.replace(isSafe ? redirect : '/')
}

const handleSubmit = async () => {
  loading.value = true
  error.value = null
  
  try {
    await login(form.email, form.password)
    redirectAfterLogin()
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
    redirectAfterLogin()
  } catch (err) {
    // Error is handled by useAuth composable
  } finally {
    loading.value = false
  }
}

const handleForgotPassword = () => {
  resetEmail.value = form.email
  resetMessage.value = null
  resetError.value = null
  showReset.value = true
}

const closeReset = () => {
  showReset.value = false
}

const handleResetPassword = async () => {
  resetLoading.value = true
  resetMessage.value = null
  resetError.value = null

  // Same message whether or not the account exists, so emails can't be probed
  const sentMessage = 'If an account exists for that email, a reset link is on its way.'

  try {
    await resetPassword(resetEmail.value.trim())
    resetMessage.value = sentMessage
  } catch (err) {
    switch (err.code) {
      case 'auth/user-not-found':
        resetMessage.value = sentMessage
        break
      case 'auth/invalid-email':
        resetError.value = 'Please enter a valid email address.'
        break
      case 'auth/too-many-requests':
        resetError.value = 'Too many attempts. Please wait a few minutes and try again.'
        break
      default:
        resetError.value = 'Something went wrong sending the reset link. Please try again.'
    }
  } finally {
    resetLoading.value = false
  }
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

.alert-success {
  background-color: var(--color-success);
  color: white;
}

.mr-sm {
  margin-right: var(--space-sm);
}
</style>