import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { subscribePersonalSlots } from '../services/scheduleService'
import { subscribePairedSlotsForTeacher } from '../services/adminService'

const TeacherScheduleSidebar = () => {
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

  const hasEvents = (day) => {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return scheduleEvents[dateString] && scheduleEvents[dateString].length > 0
  }

  const handleDateClick = (day) => {
    if (day) {
      const newDate = new Date(year, month, day)
      setSelectedDate(newDate)
    }
  }

  const getSelectedDayEvents = () => {
    const dateString = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
    return scheduleEvents[dateString] || []
  }

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'class': return 'ph ph-chalkboard-teacher'
      case 'workshop': return 'ph ph-laptop'
      case 'office': return 'ph ph-user-circle'
      case 'review': return 'ph ph-code'
      default: return 'ph ph-calendar'
    }
  }

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'class': return '#4CAF50'
      case 'workshop': return '#2196F3'
      case 'office': return '#FF9800'
      case 'review': return '#9C27B0'
      default: return '#9E9E9E'
    }
  }

  useEffect(() => {
    if (!user?.uid) return
    const unsubPersonal = subscribePersonalSlots({ ownerId: user.uid }, (slots) => setPersonalSlots(slots || []))
    const unsubPaired = subscribePairedSlotsForTeacher(user.uid, (slots) => setPairedSlots(slots || []))
    return () => {
      unsubPersonal && unsubPersonal()
      unsubPaired && unsubPaired()
    }
  }, [user])

  const getDateForWeekday = (baseDate, dayValue) => {
    const dayNames = ['sun','mon','tue','wed','thu','fri','sat']
    let targetIndex
    if (typeof dayValue === 'number') {
      targetIndex = Math.max(0, Math.min(6, dayValue))
    } else if (typeof dayValue === 'string') {
      const norm = dayValue.trim().toLowerCase().slice(0,3)
      targetIndex = Math.max(0, dayNames.indexOf(norm))
    } else {
      targetIndex = baseDate.getDay()
    }
    const start = new Date(baseDate)
    const diff = start.getDay() - targetIndex
    start.setDate(start.getDate() - diff)
    start.setHours(0,0,0,0)
    return start
  }

  const scheduleEvents = useMemo(() => {
    const combined = [...(personalSlots||[]).map(s => ({...s, __source:'personal'})), ...(pairedSlots||[]).map(s => ({...s, __source:'paired'}))]
    const byKey = new Map()
    combined.forEach(s => {
      const key = `${(s.day||'')}|${(s.time||'')}|${(s.subject||'')}|${s.__source}`
      if (!byKey.has(key)) byKey.set(key, s)
    })
    const map = {}
    // Fill the whole visible month so weekly items appear each week
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(firstDay.getDate() - firstDay.getDay())
    for (let i = 0; i < 42; i++) {
      const dayDate = new Date(startDate)
      dayDate.setDate(startDate.getDate() + i)
      const dayIndex = dayDate.getDay()
      const dateString = `${dayDate.getFullYear()}-${String(dayDate.getMonth()+1).padStart(2,'0')}-${String(dayDate.getDate()).padStart(2,'0')}`
      Array.from(byKey.values()).forEach(s => {
        const slotDay = typeof s.day === 'number' ? s.day : ['sun','mon','tue','wed','thu','fri','sat'].indexOf(String(s.day||'').toLowerCase().slice(0,3))
        if (slotDay === dayIndex) {
          const entry = {
            time: s.time || '09:00',
            title: s.subject || 'Session',
            type: 'class',
            students: s.students || 0
          }
          if (!map[dateString]) map[dateString] = []
          if (!map[dateString].some(e => e.time === entry.time && e.title === entry.title)) {
            map[dateString].push(entry)
          }
        }
      })
    }
    return map
  }, [personalSlots, pairedSlots, selectedDate])

  const selectedDayEvents = getSelectedDayEvents()

  return (
    <div className="teacher-schedule-sidebar">
      {/* Calendar Section */}
      <div className="sidebar-card">
        <div className="sidebar-card-header">
          <h3>Schedule Calendar</h3>
        </div>

        <div className="calendar-header">
                  <button 
          className="nav-btn"
          onClick={() => navigateMonth(-1)}
        >
          <i className="ph ph-caret-left"></i>
        </button>
        <h4 className="month-year">
          {monthNames[month]} {year}
        </h4>
        <button 
          className="nav-btn"
          onClick={() => navigateMonth(1)}
        >
          <i className="ph ph-caret-right"></i>
        </button>
        </div>

        <div className="simple-calendar">
          <div className="calendar-weekdays">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <div key={index} className="weekday">{day}</div>
            ))}
          </div>
          
          <div className="calendar-dates">
            {calendarDays.map((day, index) => {
              const isEmpty = !day
              const isCurrentDay = isToday(day)
              const isSelectedDay = isSelected(day)
              const hasEvent = hasEvents(day)
              
              return (
                <div
                  key={index}
                  className={`date-cell ${isEmpty ? 'empty' : ''} ${isCurrentDay ? 'today' : ''} ${isSelectedDay ? 'selected' : ''} ${hasEvent ? 'has-events' : ''}`}
                  onClick={() => !isEmpty && handleDateClick(day)}
                >
                  {day && (
                    <>
                      <span className="date-number">{day}</span>
                      {hasEvent && <div className="event-indicator"></div>}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="sidebar-card">
        <div className="sidebar-card-header">
          <h3>
            {isToday(selectedDate.getDate()) && 
             selectedDate.getMonth() === today.getMonth() && 
             selectedDate.getFullYear() === today.getFullYear() 
              ? "Today's Schedule" 
              : `Schedule for ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
          </h3>
        </div>

        <div className="schedule-events">
          {selectedDayEvents.length > 0 ? (
            selectedDayEvents.map((event, index) => (
              <div key={index} className="schedule-event">
                <div className="event-time">{event.time}</div>
                <div className="event-details">
                  <div 
                    className="event-type-indicator"
                    style={{ backgroundColor: getEventTypeColor(event.type) }}
                  ></div>
                  <div className="event-info">
                    <h4>{event.title}</h4>
                    <p>{event.students} students</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-events">
              <i className="ph ph-calendar-check"></i>
              <p>No scheduled events</p>
            </div>
          )}
        </div>

        <button className="add-event-btn">
          <i className="ph ph-plus"></i>
          Add Event
        </button>
      </div>

      {/* Quick Stats */}
      <div className="sidebar-card">
        <div className="sidebar-card-header">
          <h3>This Week</h3>
        </div>

        <div className="week-stats">
          <div className="stat-item">
            <div className="stat-icon">
              <i className="ph ph-chalkboard-teacher"></i>
            </div>
            <div className="stat-info">
              <span className="stat-number">12</span>
              <span className="stat-label">Classes</span>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon">
              <i className="ph ph-users"></i>
            </div>
            <div className="stat-info">
              <span className="stat-number">127</span>
              <span className="stat-label">Students</span>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon">
              <i className="ph ph-clock"></i>
            </div>
            <div className="stat-info">
              <span className="stat-number">18</span>
              <span className="stat-label">Hours</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherScheduleSidebar
