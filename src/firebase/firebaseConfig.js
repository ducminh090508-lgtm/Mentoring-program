// Firebase client initialization using provided configuration
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics } from 'firebase/analytics'

// Provided Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBn2-hdLLOGjass7r031oKMgO2oLcYgf1U',
  authDomain: 'insane-15878.firebaseapp.com',
  projectId: 'insane-15878',
  storageBucket: 'insane-15878.firebasestorage.app',
  messagingSenderId: '255982479262',
  appId: '1:255982479262:web:ac7ee90b05bdb2da5f188f',
  measurementId: 'G-YYW6Z6F7WM',
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

// Analytics (guarded for non-browser environments)
let analytics = null
try {
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app)
  }
} catch (_) {
  // analytics not supported in current environment
}

export { analytics }
export default app


