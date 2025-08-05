// composables/useAuth.js
import { ref, computed } from 'vue'
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendEmailVerification
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
      emailVerified: firebaseUser.emailVerified,
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
      return credential.user
    } catch (err) {
      error.value = err.message
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
      
      // Send verification email immediately
      await sendEmailVerification(credential.user)
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', credential.user.uid), {
        displayName: displayName || credential.user.email.split('@')[0],
        email: credential.user.email,
        created: new Date(),
        role: 'user'
      })
      
      return credential.user
    } catch (err) {
      error.value = err.message
      throw err
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
          role: 'user'
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

  const sendVerificationEmail = async () => {
    const currentUser = auth.currentUser
    if (!currentUser) throw new Error('No user logged in')
    
    try {
      await sendEmailVerification(currentUser)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const checkEmailVerification = async () => {
    const currentUser = auth.currentUser
    if (!currentUser) return false
    
    try {
      // Reload the user to get fresh emailVerified status
      await currentUser.reload()
      
      // Update the user ref with fresh data
      if (user.value) {
        user.value.emailVerified = currentUser.emailVerified
      }
      
      return currentUser.emailVerified
    } catch (err) {
      error.value = err.message
      return false
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