import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { listTasksForStudent } from '../services/taskService'
import { listPersonalSlots } from '../services/scheduleService'

const ProgressOverview = () => {
  const [overallProgress, setOverallProgress] = useState(null)
  const [weeklyHours, setWeeklyHours] = useState(null)
  const [lessonsCompleted, setLessonsCompleted] = useState(null)
  const [learningStreak, setLearningStreak] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    const load = async () => {
      if (!user?.uid) return
      const tasks = await listTasksForStudent({ studentId: user.uid })
      const total = tasks.length
      const completed = null
      setLessonsCompleted(completed)
      setOverallProgress(null)

      const slots = await listPersonalSlots({ ownerId: user.uid })
      setWeeklyHours(slots.length) // simple proxy; can compute durations if stored

      setLearningStreak(null) // hidden for now
    }
    load()
  }, [user])

  return (
    <section className="progress-overview">
        <div className="card progress-card">
          <div className="card-header">
            <h3>Your Tasks</h3>
          </div>
          <p className="progress-text">Keep going! New tasks appear as your teachers assign them.</p>
        </div>

      <div className="card activity-card">
        <div className="card-header">
          <h3>Weekly Activity</h3>
          <i className="fas fa-chart-line"></i>
        </div>
          <div className="activity-stats">
            <div className="stat-item">
              <span className="stat-number">—</span>
              <span className="stat-label">Hours</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">—</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
      </div>

      <div className="card streak-card">
        <div className="card-header">
          <h3>Learning Streak</h3>
          <i className="fas fa-fire"></i>
        </div>
          <div className="streak-info">
            <span className="streak-number">—</span>
            <span className="streak-label">Days</span>
          </div>
      </div>
    </section>
  )
}

export default ProgressOverview
