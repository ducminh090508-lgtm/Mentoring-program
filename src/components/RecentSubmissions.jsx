import { useEffect, useState } from 'react'
import { listTasksForStudent } from '../services/taskService'
import { useAuth } from '../context/AuthContext'

const RecentSubmissions = () => {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState([])

  useEffect(() => {
    const load = async () => {
      if (!user?.uid) return
      // Use tasks as a proxy for recent activity; hide points/grades
      const tasks = await listTasksForStudent({ studentId: user.uid })
      const mapped = (tasks || []).slice(0, 5).map(t => ({
        id: t.id,
        title: t.title || 'Task',
        submittedTime: t.submittedAt ? new Date(t.submittedAt.toDate ? t.submittedAt.toDate() : t.submittedAt).toLocaleString() : '—',
        status: t.status || 'pending'
      }))
      setSubmissions(mapped)
    }
    load()
  }, [user])

  const handleSubmissionClick = (submission) => {
    console.log(`Viewing submission: ${submission.title}`)
    // You could open submission details or navigate to submission page
  }

  const getIconClass = (status) => {
    return status === 'completed' ? 'submission-icon completed' : 'submission-icon pending'
  }

  const getIconName = (status) => {
    return status === 'completed' ? 'fas fa-check' : 'fas fa-clock'
  }

  return (
    <div className="card recent-submissions">
      <h3>Recent Submissions</h3>
      <div className="submissions-list">
        {submissions.map(submission => (
          <div 
            key={submission.id} 
            className="submission-item"
            onClick={() => handleSubmissionClick(submission)}
          >
            <div className={getIconClass(submission.status)}>
              <i className={getIconName(submission.status)}></i>
            </div>
            <div className="submission-content">
              <h4>{submission.title}</h4>
              <p>{submission.submittedTime}</p>
            </div>
            {/* No points/grades shown */}
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecentSubmissions
