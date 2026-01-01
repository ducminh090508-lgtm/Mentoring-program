import { db } from '../firebase/firebaseConfig'
import { 
  collection, collectionGroup, doc, setDoc, getDocs, query, where, deleteDoc, serverTimestamp, onSnapshot
} from 'firebase/firestore'

// Teacher-Student assignments
export const assignTeacherToStudent = async (teacherId, studentId) => {
  const id = `${studentId}_${teacherId}`
  const ref = doc(db, 'assignments', id)
  await setDoc(ref, { teacherId, studentId, createdAt: serverTimestamp() })
}

export const listAssignments = async () => {
  const res = await getDocs(collection(db, 'assignments'))
  return res.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const listAssignmentsByTeacher = async (teacherId) => {
  const q = query(collection(db, 'assignments'), where('teacherId', '==', teacherId))
  const res = await getDocs(q)
  return res.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const listAssignmentsByStudent = async (studentId) => {
  const q = query(collection(db, 'assignments'), where('studentId', '==', studentId))
  const res = await getDocs(q)
  return res.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const removeAssignment = (teacherId, studentId) => {
  const id = `${studentId}_${teacherId}`
  return deleteDoc(doc(db, 'assignments', id))
}

// Paired schedule (per student-teacher)
export const addPairedSlot = async ({ studentId, teacherId, day, time, subject }) => {
  const id = `${studentId}_${teacherId}`
  const ref = doc(db, 'pairedSchedules', id)
  // store as a subcollection of slots or array field
  // here we keep a subcollection for scalability
  const slotRef = doc(collection(ref, 'slots'))
  await setDoc(slotRef, { day, time, subject, studentId, teacherId, createdAt: serverTimestamp() })
}

export const listPairedSlots = async ({ studentId, teacherId }) => {
  const id = `${studentId}_${teacherId}`
  const ref = collection(doc(db, 'pairedSchedules', id), 'slots')
  const res = await getDocs(ref)
  return res.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const subscribePairedSlotsForTeacher = (teacherId, callback) => {
  const q = query(collectionGroup(db, 'slots'), where('teacherId', '==', teacherId))
  return onSnapshot(q, (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}

export const subscribePairedSlotsForStudent = (studentId, callback) => {
  const q = query(collectionGroup(db, 'slots'), where('studentId', '==', studentId))
  return onSnapshot(q, (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}


