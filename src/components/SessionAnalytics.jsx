import { useState, useEffect } from 'react'

const SessionAnalytics = () => {
  const [sessionData, setSessionData] = useState({
    timeSpent: '—',
    lessonsCompleted: '—',
    questionsAnswered: '—',
    accuracy: '—'
  })

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {}, 60000)

    return () => clearInterval(interval)
  }, [])

  const analyticsStats = [
    { label: 'Time Spent', value: sessionData.timeSpent },
    { label: 'Lessons Completed', value: sessionData.lessonsCompleted },
    { label: 'Questions Answered', value: sessionData.questionsAnswered },
    { label: 'Accuracy', value: sessionData.accuracy }
  ]

  return (
    <div className="card session-analytics">
      <h3>Today's Session</h3>
      <div className="analytics-stats">
        {analyticsStats.map((stat, index) => (
          <div key={index} className="stat-row">
            <span className="stat-label">{stat.label}</span>
            <span className="stat-value">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SessionAnalytics
