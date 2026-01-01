import { useState, useEffect } from 'react'

const TeacherScheduleCalendar = ({ view, selectedDate, sessions, onSessionClick, onTimeSlotClick, onSessionDelete }) => {
  const [calendarData, setCalendarData] = useState([])

  useEffect(() => {
    generateCalendarData()
  }, [view, selectedDate, sessions])

  const generateCalendarData = () => {
    if (view === 'month') {
      generateMonthView()
    } else {
      generateWeekView()
    }
  }

  const generateWeekView = () => {
    const startOfWeek = new Date(selectedDate)
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay())

    const days = []
    for (let i = 0; i < 7; i++) {
      const current = new Date(startOfWeek)
      current.setDate(startOfWeek.getDate() + i)
      
      const daySessions = getSessionsForDate(current)
      days.push({
        date: new Date(current),
        isToday: isToday(current),
        sessions: daySessions
      })
    }

    setCalendarData(days)
  }

  const generateMonthView = () => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(firstDay.getDate() - firstDay.getDay())

    const days = []
    const current = new Date(startDate)

    for (let i = 0; i < 42; i++) { // 6 weeks
      const daySessions = getSessionsForDate(current)
      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        isToday: isToday(current),
        sessions: daySessions
      })
      current.setDate(current.getDate() + 1)
    }

    setCalendarData(days)
  }

  const getSessionsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return sessions.filter(session => {
      const sessionDate = new Date(session.startTime).toISOString().split('T')[0]
      return sessionDate === dateStr
    })
  }

  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getSessionTypeIcon = (type) => {
    switch (type) {
      case 'lecture': return 'fas fa-chalkboard-teacher'
      case 'lab': return 'fas fa-laptop-code'
      case 'office_hours': return 'fas fa-user-clock'
      case 'meeting': return 'fas fa-users'
      case 'workshop': return 'fas fa-tools'
      default: return 'fas fa-calendar'
    }
  }

  // Time slots removed for simplified week view

  if (view === 'month') {
    return (
      <div className="teacher-calendar-month-view">
        <div className="month-header">
          <div className="weekday-headers">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="weekday-header">{day}</div>
            ))}
          </div>
        </div>
        <div className="month-grid">
          {calendarData.map((day, index) => (
            <div
              key={index}
              className={`month-day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''}`}
              onClick={() => onTimeSlotClick && onTimeSlotClick(day.date, 9)}
            >
              <div className="day-number">{day.date.getDate()}</div>
              <div className="day-sessions">
                {day.sessions.slice(0, 3).map(session => (
                  <div
                    key={session.id}
                    className="month-session"
                    style={{ backgroundColor: session.color }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onSessionClick(session)
                    }}
                  >
                    <i className={getSessionTypeIcon(session.type)}></i>
                    <span className="session-title">{session.title}</span>
                  </div>
                ))}
                {day.sessions.length > 3 && (
                  <div className="more-sessions">+{day.sessions.length - 3} more</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Week view
  return (
    <div className="teacher-calendar-week-view">
      <div className="week-header">
        {calendarData.map((day, index) => (
          <div key={index} className={`week-day-header ${day.isToday ? 'today' : ''}`}>
            <div className="day-name">
              {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className="day-number">{day.date.getDate()}</div>
          </div>
        ))}
      </div>

      <div className="week-content">
        <div className="week-days-grid">
          {calendarData.map((day, dayIndex) => (
            <div
              key={dayIndex}
              className="week-day-column"
              onClick={() => onTimeSlotClick && onTimeSlotClick(day.date, 9)}
            >
              <div className="day-sessions">
                {day.sessions.map(session => (
                  <div
                    key={session.id}
                    className="week-session"
                    style={{ backgroundColor: session.color }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onSessionClick(session)
                    }}
                  >
                    <div className="session-header">
                      <i className={getSessionTypeIcon(session.type)}></i>
                      <button 
                        className="session-delete"
                        onClick={(e) => {
                          e.stopPropagation()
                          onSessionDelete(session.id)
                        }}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                    <div className="session-title">{session.title}</div>
                    <div className="session-details">
                      <div className="session-room">{session.room}</div>
                      {session.students > 0 && (
                        <div className="session-students">
                          <i className="fas fa-users"></i>
                          {session.students}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TeacherScheduleCalendar
