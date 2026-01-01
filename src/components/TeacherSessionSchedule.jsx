import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { subscribePairedSlotsForTeacher } from '../services/adminService'
import { subscribePersonalSlots } from '../services/scheduleService'

const TeacherSessionSchedule = () => {
  const [selectedDay, setSelectedDay] = useState(new Date().getDay())
  const { user } = useAuth()
  const [weekSchedule, setWeekSchedule] = useState(
    Array.from({ length: 7 }).map((_, idx) => ({ day: idx, date: new Date().toISOString().slice(0,10), sessions: [] }))
  )

  useEffect(() => {
    if (!user?.uid) return
    let paired = []
    let personal = []
    const recompute = () => {
      const makeSession = (slot, source) => ({
        id: `${source}:${slot.id}`,
        title: slot.subject || 'Session',
        time: `${slot.time || '09:00'} - ${slot.endTime || '10:00'}`,
        students: slot.students || 0,
        room: slot.room || 'TBD',
        type: 'lecture',
        status: 'scheduled',
        day: slot.day
      })
      const combined = [...(paired||[]).map(s => makeSession(s,'paired')), ...(personal||[]).map(s => makeSession(s,'personal'))]
      const byKey = new Map()
      combined.forEach(s => {
        const key = `${s.day||''}|${s.time}|${s.title}|${s.type}`
        if (!byKey.has(key)) byKey.set(key, s)
      })
      const byDay = Array.from({ length: 7 }).map((_, idx) => ({ day: idx, date: new Date().toISOString().slice(0,10), sessions: [] }))
      Array.from(byKey.values()).forEach(s => {
        const dayIndex = typeof s.day === 'number' ? s.day : ['sun','mon','tue','wed','thu','fri','sat'].indexOf(String(s.day||'').toLowerCase().slice(0,3))
        const target = dayIndex >= 0 && dayIndex <= 6 ? dayIndex : new Date().getDay()
        byDay[target].sessions.push(s)
      })
      setWeekSchedule(byDay)
    }
    const unsubPaired = subscribePairedSlotsForTeacher(user.uid, (slots) => { paired = slots || []; recompute() })
    const unsubPersonal = subscribePersonalSlots({ ownerId: user.uid }, (slots) => { personal = slots || []; recompute() })
    return () => { unsubPaired && unsubPaired(); unsubPersonal && unsubPersonal() }
  }, [user])

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = new Date().getDay()

  const getSessionTypeIcon = (type) => {
    switch (type) {
      case 'lecture': return 'fas fa-chalkboard-teacher'
      case 'lab': return 'fas fa-laptop-code'
      case 'office_hours': return 'fas fa-user-clock'
      case 'meeting': return 'fas fa-users'
      default: return 'fas fa-calendar'
    }
  }

  const getSessionTypeColor = (type) => {
    switch (type) {
      case 'lecture': return '#4CAF50'
      case 'lab': return '#2196F3'
      case 'office_hours': return '#FF9800'
      case 'meeting': return '#9C27B0'
      default: return '#9E9E9E'
    }
  }

  const selectedDayData = weekSchedule.find(day => day.day === selectedDay)
  const totalStudentsToday = selectedDayData?.sessions.reduce((acc, session) => acc + session.students, 0) || 0
  const totalSessionsToday = selectedDayData?.sessions.length || 0

  return (
    <div className="card teacher-session-schedule">
      <div className="card-header">
        <h3>Weekly Schedule</h3>
        <button className="create-session-btn">
          <i className="fas fa-plus"></i>
          New Session
        </button>
      </div>

      <div className="week-overview">
        {weekSchedule.map(day => (
          <button
            key={day.day}
            className={`day-tab ${selectedDay === day.day ? 'active' : ''} ${today === day.day ? 'today' : ''}`}
            onClick={() => setSelectedDay(day.day)}
          >
            <span className="day-name">{dayNames[day.day]}</span>
            <span className="day-date">{new Date(day.date).getDate()}</span>
            <span className="session-count">{day.sessions.length}</span>
          </button>
        ))}
      </div>

      <div className="day-summary">
        <div className="summary-stats">
          <div className="stat">
            <i className="fas fa-calendar-check"></i>
            <span>{totalSessionsToday} Sessions</span>
          </div>
          <div className="stat">
            <i className="fas fa-users"></i>
            <span>{totalStudentsToday} Students</span>
          </div>
          <div className="stat">
            <i className="fas fa-clock"></i>
            <span>{selectedDayData?.sessions.length ? 
              `${selectedDayData.sessions.length * 1.5}h` : '0h'} Teaching</span>
          </div>
        </div>
      </div>

      <div className="sessions-list">
        {selectedDayData?.sessions.length > 0 ? (
          selectedDayData.sessions.map(session => (
            <div key={session.id} className="session-card">
              <div className="session-time">
                <div className="time-display">{session.time}</div>
                <div className="session-duration">1.5h</div>
              </div>
              
              <div className="session-info">
                <div className="session-header">
                  <h4>{session.title}</h4>
                  <div 
                    className="session-type-badge"
                    style={{ backgroundColor: getSessionTypeColor(session.type) }}
                  >
                    <i className={getSessionTypeIcon(session.type)}></i>
                    <span>{session.type.replace('_', ' ')}</span>
                  </div>
                </div>
                
                <div className="session-details">
                  <div className="detail-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{session.room}</span>
                  </div>
                  {session.students > 0 && (
                    <div className="detail-item">
                      <i className="fas fa-users"></i>
                      <span>{session.students} students</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="session-actions">
                <button className="action-btn edit" title="Edit Session">
                  <i className="fas fa-edit"></i>
                </button>
                <button className="action-btn attendance" title="Take Attendance">
                  <i className="fas fa-clipboard-check"></i>
                </button>
                <button className="action-btn materials" title="Class Materials">
                  <i className="fas fa-folder-open"></i>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-day">
            <div className="empty-icon">
              <i className="fas fa-calendar-times"></i>
            </div>
            <p>No sessions scheduled for {dayNames[selectedDay]}</p>
            <button className="schedule-session-btn">
              <i className="fas fa-plus"></i>
              Schedule a Session
            </button>
          </div>
        )}
      </div>

      <div className="schedule-footer">
        <div className="quick-stats">
          <div className="quick-stat">
            <span className="stat-label">This Week:</span>
            <span className="stat-value">
              {weekSchedule.reduce((acc, day) => acc + day.sessions.length, 0)} Sessions
            </span>
          </div>
          <div className="quick-stat">
            <span className="stat-label">Total Students:</span>
            <span className="stat-value">
              {weekSchedule.reduce((acc, day) => 
                acc + day.sessions.reduce((dayAcc, session) => dayAcc + session.students, 0), 0
              )}
            </span>
          </div>
        </div>
        <button className="view-full-schedule-btn">
          <i className="fas fa-calendar-alt"></i>
          Full Schedule View
        </button>
      </div>
    </div>
  )
}

export default TeacherSessionSchedule
