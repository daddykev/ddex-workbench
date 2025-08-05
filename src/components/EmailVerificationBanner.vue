<template>
  <div v-if="showBanner" class="verification-banner">
    <div class="container">
      <div class="verification-content">
        <div class="verification-message">
          <font-awesome-icon :icon="['fas', 'exclamation-circle']" class="verification-icon" />
          <div>
            <p class="verification-title">Please verify your email</p>
            <p class="verification-text">
              We've sent a verification link to <strong>{{ user.email }}</strong>. 
              Please check your inbox and spam folder.
            </p>
          </div>
        </div>
        
        <div class="verification-actions">
          <button 
            @click="handleResend" 
            class="btn btn-secondary btn-sm"
            :disabled="resending || cooldown > 0"
          >
            <span v-if="resending">
              <font-awesome-icon :icon="['fas', 'spinner']" spin />
              Sending...
            </span>
            <span v-else-if="cooldown > 0">
              Resend in {{ cooldown }}s
            </span>
            <span v-else>
              Resend Email
            </span>
          </button>
          
          <button 
            @click="handleCheck" 
            class="btn btn-primary btn-sm"
            :disabled="checking"
          >
            <span v-if="checking">
              <font-awesome-icon :icon="['fas', 'spinner']" spin />
              Checking...
            </span>
            <span v-else>
              I've Verified
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { 
  user, 
  isAuthenticated, 
  isEmailVerified, 
  sendVerificationEmail, 
  checkEmailVerification 
} = useAuth()

const resending = ref(false)
const checking = ref(false)
const cooldown = ref(0)

// Intervals
let cooldownInterval = null
let checkInterval = null

// Computed property to show banner
const showBanner = computed(() => {
  return isAuthenticated.value && !isEmailVerified.value
})

const handleResend = async () => {
  resending.value = true
  
  try {
    await sendVerificationEmail()
    
    // Start 60 second cooldown
    cooldown.value = 60
    cooldownInterval = setInterval(() => {
      cooldown.value--
      if (cooldown.value <= 0) {
        clearInterval(cooldownInterval)
        cooldownInterval = null
      }
    }, 1000)
    
    // Show success message (consider using a toast notification instead)
    alert('Verification email sent! Please check your inbox.')
  } catch (error) {
    console.error('Failed to resend verification email:', error)
    alert('Failed to send verification email. Please try again.')
  } finally {
    resending.value = false
  }
}

const handleCheck = async () => {
  checking.value = true
  
  try {
    const verified = await checkEmailVerification()
    if (verified) {
      // Clear the check interval if running
      if (checkInterval) {
        clearInterval(checkInterval)
        checkInterval = null
      }
      
      // The banner will automatically hide because isEmailVerified will be true
      // Optionally show a success message
      alert('Email verified successfully! You now have full access.')
    } else {
      alert('Your email is not verified yet. Please check your inbox and click the verification link.')
    }
  } catch (error) {
    console.error('Failed to check verification status:', error)
    alert('Failed to check verification status. Please try again.')
  } finally {
    checking.value = false
  }
}

onMounted(() => {
  // Only start periodic checking if user is authenticated but not verified
  if (isAuthenticated.value && !isEmailVerified.value) {
    // Check verification status every 30 seconds
    checkInterval = setInterval(async () => {
      try {
        const verified = await checkEmailVerification()
        if (verified) {
          // Clear the interval once verified
          clearInterval(checkInterval)
          checkInterval = null
          
          // Optionally show a success notification
          console.log('Email verified automatically!')
        }
      } catch (error) {
        console.error('Error during periodic verification check:', error)
      }
    }, 30000) // 30 seconds
  }
})

// Clean up intervals on unmount
onUnmounted(() => {
  if (checkInterval) {
    clearInterval(checkInterval)
    checkInterval = null
  }
  if (cooldownInterval) {
    clearInterval(cooldownInterval)
    cooldownInterval = null
  }
})
</script>

<style scoped>
.verification-banner {
  background-color: var(--color-warning);
  color: var(--color-bg);
  padding: var(--space-md) 0;
  position: sticky;
  top: 64px; /* Below navbar */
  z-index: var(--z-dropdown);
  box-shadow: var(--shadow-md);
}

.verification-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
  flex-wrap: wrap;
}

.verification-message {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
}

.verification-icon {
  font-size: var(--text-xl);
  margin-top: 2px;
}

.verification-title {
  font-weight: var(--font-semibold);
  margin-bottom: var(--space-xs);
}

.verification-text {
  font-size: var(--text-sm);
  opacity: 0.9;
}

.verification-actions {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
}

/* Dark theme adjustments */
[data-theme="dark"] .verification-banner {
  background-color: var(--color-warning);
  color: var(--color-bg);
}

[data-theme="dark"] .btn-secondary {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border-color: rgba(255, 255, 255, 0.2);
}

[data-theme="dark"] .btn-secondary:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.2);
}

[data-theme="dark"] .btn-primary {
  background-color: white;
  color: var(--color-warning);
}

[data-theme="dark"] .btn-primary:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.9);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .verification-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .verification-actions {
    justify-content: flex-end;
  }
}
</style>