import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getFunctions } from 'firebase/functions'
import { getAnalytics, isSupported } from 'firebase/analytics'

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const functions = getFunctions(app)

// Analytics (GA4): production builds on the live domain only, so localhost
// and `vite preview` don't pollute data. Resolves to the instance or null and
// never rejects (ad blockers, private browsing, unsupported environments).
const ANALYTICS_HOSTS = ['ddex-workbench.org', 'www.ddex-workbench.org']

export const analyticsPromise = (async () => {
  try {
    if (!import.meta.env.PROD) return null
    if (typeof window === 'undefined' || !ANALYTICS_HOSTS.includes(window.location.hostname)) return null
    if (!(await isSupported())) return null
    return getAnalytics(app)
  } catch {
    return null
  }
})()

// Auth state observer helper
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback)
}

// Export the app instance
export default app