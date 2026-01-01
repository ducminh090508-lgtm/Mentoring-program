import { auth, db } from '../firebase/firebaseConfig'
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { 
  doc, getDoc, setDoc, collection, query, where, getDocs, serverTimestamp
} from 'firebase/firestore'

export const onAuthChanged = (callback) => onAuthStateChanged(auth, callback)

export const loginWithEmail = async (email, password) => {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  const profile = await getDoc(doc(db, 'users', cred.user.uid))
  return { uid: cred.user.uid, ...(profile.exists() ? profile.data() : {}) }
}

export const signupWithEmail = async ({ email, password, name, role }) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  if (name) await updateProfile(cred.user, { displayName: name })
  const userDoc = doc(db, 'users', cred.user.uid)
  const userData = {
    name: name || email.split('@')[0],
    email,
    role: role || 'student',
    createdAt: serverTimestamp(),
  }
  await setDoc(userDoc, userData)
  return { uid: cred.user.uid, ...userData }
}

export const logoutUser = () => signOut(auth)

export const fetchUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}

export const listTeachers = async () => {
  const q = query(collection(db, 'users'), where('role', '==', 'teacher'))
  const res = await getDocs(q)
  return res.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const listStudents = async () => {
  // Primary: explicit role === 'student'
  const q = query(collection(db, 'users'), where('role', '==', 'student'))
  const res = await getDocs(q)
  let items = res.docs.map(d => ({ id: d.id, ...d.data() }))
  if (items.length > 0) return items

  // Fallback: load all users and treat missing role as student (for legacy data)
  const all = await getDocs(collection(db, 'users'))
  items = all.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(u => (u.role || 'student') === 'student')
  return items
}


