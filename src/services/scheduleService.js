import { db } from '../firebase/firebaseConfig'
import { collection, doc, setDoc, getDocs, query, where, serverTimestamp, deleteDoc, onSnapshot } from 'firebase/firestore'

// Personal schedules for teachers and students
export const addPersonalSlot = async ({ ownerId, role, day, time, subject }) => {
  const ref = doc(collection(db, 'personalSchedules'))
  await setDoc(ref, { ownerId, role, day, time, subject, createdAt: serverTimestamp() })
}

export const listPersonalSlots = async ({ ownerId }) => {
  const q = query(collection(db, 'personalSchedules'), where('ownerId', '==', ownerId))
  const res = await getDocs(q)
  return res.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const removePersonalSlot = async (slotId) => deleteDoc(doc(db, 'personalSchedules', slotId))

export const subscribePersonalSlots = ({ ownerId }, callback) => {
  const q = query(collection(db, 'personalSchedules'), where('ownerId', '==', ownerId))
  return onSnapshot(q, (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}


