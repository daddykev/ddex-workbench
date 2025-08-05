<template>
  <div class="auth-page">
    <div class="container">
      <div class="auth-container">
        <!-- Success Message -->
        <div v-if="signupSuccess" class="card success-card">
          <div class="card-body text-center">
            <div class="success-icon">
              <font-awesome-icon :icon="['fas', 'check-circle']" />
            </div>
            <h2 class="success-title">Account Created Successfully!</h2>
            <p class="success-message">
              We've sent a verification email to <strong>{{ form.email }}</strong>.
            </p>
            <p class="success-submessage">
              Please check your inbox and click the verification link to activate your account.
            </p>
            <div class="success-actions">
              <router-link to="/login" class="btn btn-primary">
                Go to Login
              </router-link>
              <button @click="resendVerification" class="btn btn-secondary" :disabled="resending">
                <span v-if="resending">
                  <font-awesome-icon :icon="['fas', 'spinner']" spin />
                  Sending...
                </span>
                <span v-else>Resend Email</span>
              </button>
            </div>
            <p class="text-sm text-secondary mt-lg">
              Didn't receive the email? Check your spam folder or try resending.
            </p>
          </div>
        </div>

        <!-- Signup Form -->
        <div v-else class="auth-card card">
          <div class="card-body">
            <div class="auth-header">
              <h1 class="auth-title">Create Account</h1>
              <p class="auth-subtitle">Join DDEX Workbench</p>
            </div>

            <form @submit.prevent="handleSubmit" class="auth-form">
              <!-- Display Name Input -->
              <div class="form-group">
                <label class="form-label">Display Name</label>
                <input
                  v-model="form.displayName"
                  type="text"
                  class="form-input"
                  placeholder="John Doe"
                  required
                  :disabled="loading"
                />
              </div>

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
                <p class="form-help">
                  <font-awesome-icon :icon="['fas', 'info-circle']" class="mr-xs" />
                  You'll need to verify this email address
                </p>
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
                  minlength="6"
                />
                <p class="form-help">Minimum 6 characters</p>
              </div>

              <!-- Confirm Password Input -->
              <div class="form-group">
                <label class="form-label">Confirm Password</label>
                <input
                  v-model="form.confirmPassword"
                  type="password"
                  class="form-input"
                  placeholder="••••••••"
                  required
                  :disabled="loading"
                />
              </div>

              <!-- Error Message -->
              <div v-if="error || passwordError" class="alert alert-error">
                {{ error || passwordError }}
              </div>

              <!-- Terms Checkbox -->
              <div class="form-checkbox">
                <input
                  v-model="form.acceptTerms"
                  type="checkbox"
                  id="terms"
                  required
                  :disabled="loading"
                />
                <label for="terms">
                  I agree to the 
                  <router-link to="/terms" target="_blank">Terms of Service</router-link>
                  and 
                  <router-link to="/privacy" target="_blank">Privacy Policy</router-link>
                </label>
              </div>

              <!-- Submit Button -->
              <button type="submit" class="btn btn-primary btn-block" :disabled="loading || !canSubmit">
                <span v-if="loading" class="flex items-center justify-center gap-sm">
                  <font-awesome-icon :icon="['fas', 'spinner']" spin />
                  Creating account...
                </span>
                <span v-else>Create Account</span>
              </button>

              <!-- Divider -->
              <div class="auth-divider">
                <span>or sign up with</span>
              </div>

              <!-- Google Sign Up -->
              <button
                type="button"
                @click="handleGoogleSignUp"
                class="btn btn-secondary btn-block"
                :disabled="loading"
              >
                <font-awesome-icon :icon="['fab', 'google']" class="mr-sm" />
                Google
              </button>
            </form>

            <!-- Sign In Link -->
            <div class="auth-footer">
              <p class="text-center text-secondary">
                Already have an account? 
                <router-link to="/login" class="text-primary font-medium">
                  Sign in
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
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { signup, loginWithGoogle, sendVerificationEmail, logout, error } = useAuth()

const loading = ref(false)
const signupSuccess = ref(false)
const resending = ref(false)
const form = reactive({
  displayName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

const passwordError = computed(() => {
  if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
    return 'Passwords do not match'
  }
  return null
})

const canSubmit = computed(() => {
  return form.acceptTerms && !passwordError.value
})

const handleSubmit = async () => {
  if (!canSubmit.value) return
  
  loading.value = true
  error.value = null
  
  try {
    await signup(form.email, form.password, form.displayName)
    // Sign out the user immediately after signup
    await logout()
    // Show success message
    signupSuccess.value = true
  } catch (err) {
    // Error is handled by useAuth composable
  } finally {
    loading.value = false
  }
}

const handleGoogleSignUp = async () => {
  loading.value = true
  error.value = null
  
  try {
    await loginWithGoogle()
    // Google accounts are pre-verified, so redirect to home
    router.push('/')
  } catch (err) {
    // Error is handled by useAuth composable
  } finally {
    loading.value = false
  }
}

const resendVerification = async () => {
  resending.value = true
  
  try {
    // Need to sign in temporarily to resend email
    await login(form.email, form.password)
    await sendVerificationEmail()
    await logout()
    alert('Verification email sent! Please check your inbox.')
  } catch (err) {
    alert('Failed to resend email. Please try again later.')
  } finally {
    resending.value = false
  }
}
</script>

<style scoped>
/* Base Auth Page Styles (matching LoginView) */
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

.alert-warning {
  background-color: var(--color-warning);
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.mr-sm {
  margin-right: var(--space-sm);
}

.mr-xs {
  margin-right: var(--space-xs);
}

.mt-sm {
  margin-top: var(--space-sm);
}

/* Success Card Styles */
.success-card {
  max-width: 500px;
  margin: 0 auto;
  text-align: center;
}

.success-icon {
  font-size: 4rem;
  color: var(--color-success);
  margin-bottom: var(--space-lg);
}

.success-title {
  font-size: var(--text-2xl);
  margin-bottom: var(--space-md);
}

.success-message {
  font-size: var(--text-lg);
  color: var(--color-text);
  margin-bottom: var(--space-sm);
}

.success-submessage {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xl);
}

.success-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
  margin-bottom: var(--space-lg);
}

/* Additional form help styling */
.form-help {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  margin-top: var(--space-xs);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

[data-theme="dark"] .form-help {
  color: var(--color-info);
}
</style>