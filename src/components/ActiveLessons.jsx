import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { listTasksForStudent } from '../services/taskService'

const ActiveLessons = () => {
  const { user } = useAuth()
  const [lessons, setLessons] = useState([])

  useEffect(() => {
    const load = async () => {
      if (!user?.uid) return
      const tasks = await listTasksForStudent({ studentId: user.uid })
      const mapped = tasks.slice(0, 3).map(t => ({
        id: t.id,
        title: t.title || 'Task',
        description: t.description || 'Task detail',
        progress: 0,
        icon: 'ph ph-book-open',
        colorClass: 'lesson-blue'
      }))
      setLessons(mapped)
    }
    load()
  }, [user])

  const handleContinue = (lessonId, lessonTitle) => {
    // Show notification or navigate to lesson
    console.log(`Continuing lesson: ${lessonTitle}`)
    // You could add toast notification here
  }

  return (
    <section className="active-lessons">
      <h2>Continue Learning</h2>
      <div className="lessons-grid">
        {lessons.map(lesson => (
          <div key={lesson.id} className={`card lesson-card ${lesson.colorClass}`}>
            <div className="lesson-icon">
              <i className={lesson.icon}></i>
            </div>
            <div className="lesson-content">
              <h4>{lesson.title}</h4>
              <p>{lesson.description}</p>
              <div className="lesson-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-indicator" 
                    style={{ width: `${lesson.progress}%` }}
                  ></div>
                </div>
                <span>{lesson.progress}%</span>
              </div>
            </div>
            <button 
              className="continue-btn"
              onClick={() => handleContinue(lesson.id, lesson.title)}
            >
              Continue
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ActiveLessons
