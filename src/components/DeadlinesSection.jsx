import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { listTasksForStudent } from '../services/taskService'

const DeadlinesSection = () => {
  const { user } = useAuth()
  const [deadlines, setDeadlines] = useState([])

  useEffect(() => {
    const load = async () => {
      if (!user?.uid) return
      const tasks = await listTasksForStudent({ studentId: user.uid })
      const items = tasks.map(t => {
        const d = t.dueDate && (t.dueDate.seconds ? new Date(t.dueDate.seconds*1000) : new Date(t.dueDate))
        const now = new Date()
        const diff = d ? Math.ceil((d - now) / (1000*60*60*24)) : null
        return {
          id: t.id,
          title: t.title || 'Task',
          description: t.description || '',
          day: d ? String(d.getDate()) : '--',
          month: d ? d.toLocaleString('en-US', { month: 'short' }).toUpperCase() : '--',
          timeLeft: d ? (diff < 0 ? 'Overdue' : diff === 0 ? 'Due today' : `Due in ${diff} days`) : 'No due date',
          status: 'pending',
          isUrgent: diff !== null && diff <= 2
        }
      })
      setDeadlines(items)
    }
    load()
  }, [user])

  const handleDeadlineClick = (deadline) => {
    console.log(`Viewing details for: ${deadline.title}`)
    // You could open a modal or navigate to deadline details
  }

  const getStatusClass = (status) => {
    return status === 'urgent' ? 'deadline-status urgent' : 'deadline-status'
  }

  return (
    <section className="deadlines-section">
      <h2>Upcoming Deadlines</h2>
      <div className="deadlines-list">
        {deadlines.map(deadline => (
          <div 
            key={deadline.id} 
            className={`deadline-item ${deadline.isUrgent ? 'urgent' : ''}`}
            onClick={() => handleDeadlineClick(deadline)}
          >
            <div className="deadline-date">
              <span className="day">{deadline.day}</span>
              <span className="month">{deadline.month}</span>
            </div>
            <div className="deadline-content">
              <h4>{deadline.title}</h4>
              <p>{deadline.description}</p>
              <span className="deadline-time">{deadline.timeLeft}</span>
            </div>
            <div className={getStatusClass(deadline.status)}>
              {deadline.status.charAt(0).toUpperCase() + deadline.status.slice(1)}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default DeadlinesSection
