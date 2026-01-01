import { useState, useEffect } from 'react'

const ScheduleCalendar = ({ view, selectedDate, events, onEventClick, onDateSelect, onTimeSlotClick }) => {
  const [calendarData, setCalendarData] = useState([])

  useEffect(() => {
    generateCalendarData()
  }, [view, selectedDate, events])

  const generateCalendarData = () => {
    if (view === 'month') {
      generateMonthView()
    } else if (view === 'week') {
      generateWeekView()
    } else {
      generateDayView()
    }
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
      const dayEvents = getEventsForDate(current)
      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        isToday: isToday(current),
        events: dayEvents
      })
      current.setDate(current.getDate() + 1)
    }

    setCalendarData(days)
  }

  const generateWeekView = () => {
    const startOfWeek = new Date(selectedDate)
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay())

    const days = []
    for (let i = 0; i < 7; i++) {
      const current = new Date(startOfWeek)
      current.setDate(startOfWeek.getDate() + i)
      
      const dayEvents = getEventsForDate(current)
      days.push({
        date: new Date(current),
        isToday: isToday(current),
        events: dayEvents
      })
    }

    setCalendarData(days)
  }

  const generateDayView = () => {
    const dayEvents = getEventsForDate(selectedDate)
    setCalendarData([{
      date: new Date(selectedDate),
      isToday: isToday(selectedDate),
      events: dayEvents
    }])
  }

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(event => {
      const eventDate = new Date(event.startTime).toISOString().split('T')[0]
      return eventDate === dateStr
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

  const getEventDuration = (event) => {
    const start = new Date(event.startTime)
    const end = new Date(event.endTime)
    const duration = (end - start) / (1000 * 60) // in minutes
    
    if (duration < 60) {
      return `${duration}m`
    } else {
      const hours = Math.floor(duration / 60)
      const minutes = duration % 60
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
    }
  }

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'class': return 'fas fa-chalkboard-teacher'
      case 'study': return 'fas fa-book-open'
      case 'deadline': return 'fas fa-exclamation-triangle'
      case 'office_hours': return 'fas fa-user-clock'
      default: return 'fas fa-calendar'
    }
  }

  // Time slots removed for simplified week view

  if (view === 'month') {
    return (
      <div className="calendar-month-view">
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
              onClick={() => onDateSelect(day.date)}
            >
              <div className="day-number">{day.date.getDate()}</div>
              <div className="day-events">
                {day.events.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    className="month-event"
                    style={{ backgroundColor: event.color }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick(event)
                    }}
                  >
                    <span className="event-title">{event.title}</span>
                  </div>
                ))}
                {day.events.length > 3 && (
                  <div className="more-events">+{day.events.length - 3} more</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (view === 'week') {
    return (
      <div className="calendar-week-view">
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
          <div className="week-days">
            {calendarData.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className="week-day-column"
                onClick={() => onTimeSlotClick && onTimeSlotClick(day.date, 9)}
              >
                <div className="day-events">
                  {day.events.map(event => (
                    <div
                      key={event.id}
                      className="week-event"
                      style={{ backgroundColor: event.color }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick(event)
                      }}
                    >
                      <div className="event-title">{event.title}</div>
                      {event.location && <div className="event-location">{event.location}</div>}
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

  // Day view
  return (
    <div className="calendar-day-view">
      <div className="day-header">
        <h2>{selectedDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric' 
        })}</h2>
      </div>
      <div className="day-content">
        <div className="time-column">
          {generateTimeSlots().map(hour => (
            <div key={hour} className="time-slot">
              {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
            </div>
          ))}
        </div>
        <div className="day-events-column">
          {generateTimeSlots().map(hour => (
            <div
              key={hour}
              className="day-time-slot"
              onClick={() => onTimeSlotClick && onTimeSlotClick(selectedDate, hour)}
            >
              {calendarData[0]?.events
                .filter(event => {
                  const eventHour = new Date(event.startTime).getHours()
                  return eventHour === hour
                })
                .map(event => (
                  <div
                    key={event.id}
                    className="day-event"
                    style={{ backgroundColor: event.color }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick(event)
                    }}
                  >
                    <div className="event-header">
                      <i className={getEventTypeIcon(event.type)}></i>
                      <span className="event-time">
                        {formatTime(event.startTime)} - {formatTime(event.endTime)}
                      </span>
                      <span className="event-duration">({getEventDuration(event)})</span>
                    </div>
                    <div className="event-title">{event.title}</div>
                    {event.description && (
                      <div className="event-description">{event.description}</div>
                    )}
                    {event.location && (
                      <div className="event-location">
                        <i className="fas fa-map-marker-alt"></i>
                        {event.location}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ScheduleCalendar
