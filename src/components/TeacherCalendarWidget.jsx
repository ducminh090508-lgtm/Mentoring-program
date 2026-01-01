import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { subscribePersonalSlots } from '../services/scheduleService'
import { subscribePairedSlotsForTeacher } from '../services/adminService'

const TeacherCalendarWidget = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  const today = new Date()
  const month = currentDate.getMonth()
  const year = currentDate.getFullYear()

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const { user } = useAuth()
  const [personalSlots, setPersonalSlots] = useState([])
  const [pairedSlots, setPairedSlots] = useState([])
  useEffect(() => {
    if (!user?.uid) return
    const unsubPersonal = subscribePersonalSlots({ ownerId: user.uid }, (slots) => setPersonalSlots(slots || []))
    const unsubPaired = subscribePairedSlotsForTeacher(user.uid, (slots) => setPairedSlots(slots || []))
    return () => { unsubPersonal && unsubPersonal(); unsubPaired && unsubPaired() }
  }, [user])

  const events = useMemo(() => {
    const map = {}
    const list = [...(personalSlots||[]).map(s => ({...s, __source:'personal'})), ...(pairedSlots||[]).map(s => ({...s, __source:'paired'}))]
    const dedup = new Map()
    list.forEach(s => {
      const key = `${(s.day||'')}|${(s.time||'')}|${(s.subject||'')}|${s.__source}`
      if (!dedup.has(key)) dedup.set(key, s)
    })
    const year = yearRef
    const month = monthRef
    return map
  }, [])

  // Generate calendar days
  const calendarDays = []
  
  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(month + direction)
    setCurrentDate(newDate)
  }

  const isToday = (day) => {
    return day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear()
  }

  const isSelected = (day) => {
    return day === selectedDate.getDate() && 
           month === selectedDate.getMonth() && 
           year === selectedDate.getFullYear()
  }

  const hasEvents = (day) => false

  const getEventCount = (day) => 0

  const handleDateClick = (day) => {
    if (day) {
      const newDate = new Date(year, month, day)
      setSelectedDate(newDate)
    }
  }

  const getUpcomingEvents = () => []

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'class': return 'fas fa-chalkboard-teacher'
      case 'lab': return 'fas fa-laptop-code'
      case 'meeting': return 'fas fa-users'
      case 'office': return 'fas fa-user-clock'
      default: return 'fas fa-calendar'
    }
  }

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'class': return '#4CAF50'
      case 'lab': return '#2196F3'
      case 'meeting': return '#9C27B0'
      case 'office': return '#FF9800'
      default: return '#9E9E9E'
    }
  }

  const upcomingEvents = getUpcomingEvents()

  return (
    <div className="card teacher-calendar-widget">
      <div className="card-header">
        <h3>Teaching Calendar</h3>
        <button className="calendar-settings">
          <i className="fas fa-cog"></i>
        </button>
      </div>

      <div className="calendar-header">
        <button 
          className="nav-btn"
          onClick={() => navigateMonth(-1)}
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        <h4 className="month-year">
          {monthNames[month]} {year}
        </h4>
        <button 
          className="nav-btn"
          onClick={() => navigateMonth(1)}
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>

      <div className="calendar-grid">
        <div className="weekday-headers">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="weekday-header">{day}</div>
          ))}
        </div>

        <div className="calendar-days">
          {calendarDays.map((day, index) => (
            <button
              key={index}
              className={`calendar-day ${!day ? 'empty' : ''} ${isToday(day) ? 'today' : ''} ${isSelected(day) ? 'selected' : ''} ${hasEvents(day) ? 'has-events' : ''}`}
              onClick={() => handleDateClick(day)}
              disabled={!day}
            >
              {day && (
                <>
                  <span className="day-number">{day}</span>
                  {hasEvents(day) && (
                    <div className="event-indicators">
                      {getEventCount(day) > 2 ? (
                        <span className="event-count">+{getEventCount(day)}</span>
                      ) : (
                        Array(Math.min(getEventCount(day), 2)).fill().map((_, i) => (
                          <div key={i} className="event-dot"></div>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="upcoming-events">
        <h4>Upcoming Events</h4>
        {upcomingEvents.length > 0 ? (
          <div className="events-list">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="upcoming-event">
                <div 
                  className="event-type-icon"
                  style={{ backgroundColor: getEventTypeColor(event.type) }}
                >
                  <i className={getEventTypeIcon(event.type)}></i>
                </div>
                <div className="event-details">
                  <div className="event-title">{event.title}</div>
                  <div className="event-date">{event.dateString}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-events">
            <i className="fas fa-calendar-check"></i>
            <p>No upcoming events</p>
          </div>
        )}
      </div>

      <div className="calendar-footer">
        <button className="today-btn" onClick={() => {
          setCurrentDate(new Date())
          setSelectedDate(new Date())
        }}>
          <i className="fas fa-calendar-day"></i>
          Today
        </button>
        <button className="add-event-btn">
          <i className="fas fa-plus"></i>
          Add Event
        </button>
      </div>
    </div>
  )
}

export default TeacherCalendarWidget
