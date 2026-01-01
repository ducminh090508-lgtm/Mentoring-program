import { db } from '../firebase/firebaseConfig'
import { collection, doc, setDoc, getDoc, getDocs, query, where, serverTimestamp, updateDoc } from 'firebase/firestore'

// Tasks are created by teachers and assigned to students
export const createTask = async ({ teacherId, title, description, dueDate, assignedTo = [] }) => {
  const ref = doc(collection(db, 'tasks'))
  await setDoc(ref, { teacherId, title, description, dueDate, assignedTo, createdAt: serverTimestamp() })
}

export const listTasksForStudent = async ({ studentId }) => {
  const q = query(collection(db, 'tasks'), where('assignedTo', 'array-contains', studentId))
  const res = await getDocs(q)
  return res.docs.map(d => ({ id: d.id, ...d.data() }))
}

// Submissions by students
export const submitTask = async ({ taskId, studentId, payload }) => {
  // fetch task to get teacherId
  const taskSnap = await getDoc(doc(db, 'tasks', taskId))
  const task = taskSnap.exists() ? taskSnap.data() : {}
  const ref = doc(collection(db, 'submissions'))
  await setDoc(ref, { 
    taskId, 
    studentId, 
    teacherId: task.teacherId || null,
    payload, 
    createdAt: serverTimestamp(), 
    status: 'submitted' 
  })
}

export const listSubmissionsForTeacher = async ({ teacherId }) => {
  const q = query(collection(db, 'submissions'), where('teacherId', '==', teacherId))
  const res = await getDocs(q)
  return res.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const gradeSubmission = async ({ submissionId, grade }) => {
  await updateDoc(doc(db, 'submissions', submissionId), { grade, status: 'graded', gradedAt: serverTimestamp() })
}


