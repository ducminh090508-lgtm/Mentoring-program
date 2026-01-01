import { useState } from 'react'

const UpcomingEvents = ({ events, onEventClick }) => {
  const formatEventTime = (startTime, endTime) => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const now = new Date()
    
    const isToday = start.toDateString() === now.toDateString()
    const isTomorrow = start.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString()
    
    let dateString = ''
    if (isToday) {
      dateString = 'Today'
    } else if (isTomorrow) {
      dateString = 'Tomorrow'
    } else {
      dateString = start.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
    
    const timeString = `${start.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })} - ${end.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })}`
    
    return { dateString, timeString }
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

  const getEventTypeName = (type) => {
    switch (type) {
      case 'class': return 'Class'
      case 'study': return 'Study Session'
      case 'deadline': return 'Deadline'
      case 'office_hours': return 'Office Hours'
      default: return 'Event'
    }
  }

  const getTimeUntilEvent = (startTime) => {
    const now = new Date()
    const eventStart = new Date(startTime)
    const diffMs = eventStart - now
    
    if (diffMs < 0) return 'Started'
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffDays > 0) {
      return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`
    } else if (diffHours > 0) {
      return `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return `in ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#FF6B6B'
      case 'high': return '#FF9800'
      case 'medium': return '#2196F3'
      case 'low': return 'var(--status-inactive)'
      default: return 'transparent'
    }
  }

  if (!events || events.length === 0) {
    return (
      <div className="card upcoming-events">
        <h3>Upcoming Events</h3>
        <div className="empty-upcoming">
          <div className="empty-icon">
            <i className="fas fa-calendar-check"></i>
          </div>
          <p>No upcoming events</p>
          <small>Your next 7 days are clear!</small>
        </div>
      </div>
    )
  }

  return (
    <div className="card upcoming-events">
      <div className="card-header">
        <h3>Upcoming Events</h3>
        <span className="events-count">{events.length}</span>
      </div>
      
      <div className="events-list">
        {events.map(event => {
          const { dateString, timeString } = formatEventTime(event.startTime, event.endTime)
          
          return (
            <div
              key={event.id}
              className="upcoming-event-item"
              onClick={() => onEventClick(event)}
            >
              <div className="event-indicator" style={{ backgroundColor: event.color }}>
                <i className={getEventTypeIcon(event.type)}></i>
              </div>
              
              <div className="event-details">
                <div className="event-header">
                  <h4 className="event-title">{event.title}</h4>
                  {event.priority && (
                    <span 
                      className="priority-indicator"
                      style={{ backgroundColor: getPriorityColor(event.priority) }}
                    ></span>
                  )}
                </div>
                
                <div className="event-meta">
                  <span className="event-type">{getEventTypeName(event.type)}</span>
                  {event.course && (
                    <>
                      <span className="meta-separator">•</span>
                      <span className="event-course">{event.course}</span>
                    </>
                  )}
                </div>
                
                <div className="event-timing">
                  <div className="event-date-time">
                    <span className="event-date">{dateString}</span>
                    <span className="event-time">{timeString}</span>
                  </div>
                  <span className="time-until">{getTimeUntilEvent(event.startTime)}</span>
                </div>
                
                {event.location && (
                  <div className="event-location">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{event.location}</span>
                  </div>
                )}
                
                {event.description && (
                  <div className="event-description">
                    {event.description}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="upcoming-footer">
        <button className="view-all-btn">
          <i className="fas fa-calendar"></i>
          View Full Calendar
        </button>
      </div>
    </div>
  )
}

export default UpcomingEvents
