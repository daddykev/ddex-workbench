import { ref, computed } from 'vue'
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendEmailVerification,
  reload
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db, onAuthChange } from '@/firebase'

// Global reactive state
const user = ref(null)
const loading = ref(true)
const error = ref(null)

// Initialize auth state observer
onAuthChange(async (firebaseUser) => {
  if (firebaseUser) {
    // Get additional user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
    user.value = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified, // Add this
      ...userDoc.data()
    }
  } else {
    user.value = null
  }
  loading.value = false
})

export function useAuth() {
  const isAuthenticated = computed(() => !!user.value)
  const isEmailVerified = computed(() => user.value?.emailVerified || false)

  const login = async (email, password) => {
    error.value = null
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password)
      
      // Check if email is verified
      if (!credential.user.emailVerified) {
        // You might want to handle this differently based on your requirements
        error.value = 'Please verify your email before logging in. Check your inbox for the verification link.'
        // Optionally sign them out
        await signOut(auth)
        throw new Error('Email not verified')
      }
      
      return credential.user
    } catch (err) {
      if (err.message !== 'Email not verified') {
        error.value = err.message
      }
      throw err
    }
  }

  const signup = async (email, password, displayName) => {
    error.value = null
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update display name
      if (displayName) {
        await updateProfile(credential.user, { displayName })
      }
      
      // Send verification email
      await sendVerificationEmail()
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', credential.user.uid), {
        displayName: displayName || credential.user.email.split('@')[0],
        email: credential.user.email,
        created: new Date(),
        role: 'user',
        emailVerified: false
      })
      
      return credential.user
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const sendVerificationEmail = async () => {
    if (!auth.currentUser) {
      throw new Error('No user logged in')
    }
    
    try {
      await sendEmailVerification(auth.currentUser, {
        url: `${window.location.origin}/login?verified=true`
      })
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const checkEmailVerification = async () => {
    if (!auth.currentUser) return false
    
    try {
      // Reload user to get latest emailVerified status
      await reload(auth.currentUser)
      
      // Update local state if verified
      if (auth.currentUser.emailVerified && !user.value.emailVerified) {
        user.value.emailVerified = true
        // Update Firestore
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          emailVerified: true
        }, { merge: true })
      }
      
      return auth.currentUser.emailVerified
    } catch (err) {
      console.error('Error checking email verification:', err)
      return false
    }
  }

  const loginWithGoogle = async () => {
    error.value = null
    try {
      const provider = new GoogleAuthProvider()
      const credential = await signInWithPopup(auth, provider)
      
      // Check if user document exists, create if not
      const userDocRef = doc(db, 'users', credential.user.uid)
      const userDoc = await getDoc(userDocRef)
      
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          displayName: credential.user.displayName,
          email: credential.user.email,
          photoURL: credential.user.photoURL,
          created: new Date(),
          role: 'user',
          emailVerified: true // Google accounts are pre-verified
        })
      }
      
      return credential.user
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const updateUserProfile = async (updates) => {
    if (!user.value) return
    
    try {
      // Update Firebase Auth profile if display name changed
      if (updates.displayName && updates.displayName !== user.value.displayName) {
        await updateProfile(auth.currentUser, { displayName: updates.displayName })
      }
      
      // Update Firestore document
      await setDoc(doc(db, 'users', user.value.uid), updates, { merge: true })
      
      // Update local state
      user.value = { ...user.value, ...updates }
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isEmailVerified,
    login,
    signup,
    loginWithGoogle,
    logout,
    updateUserProfile,
    sendVerificationEmail,
    checkEmailVerification
  }
}