import { useState } from 'react'

const ScheduleStats = ({ stats }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('week')

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'class': return 'fas fa-chalkboard-teacher'
      case 'study': return 'fas fa-book-open'
      case 'deadline': return 'fas fa-exclamation-triangle'
      case 'office_hours': return 'fas fa-user-clock'
      default: return 'fas fa-calendar'
    }
  }

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'class': return '#4CAF50'
      case 'study': return '#2196F3'
      case 'deadline': return '#FF6B6B'
      case 'office_hours': return '#FF9800'
      default: return 'var(--status-inactive)'
    }
  }

  const getEventTypeName = (type) => {
    switch (type) {
      case 'class': return 'Classes'
      case 'study': return 'Study Sessions'
      case 'deadline': return 'Deadlines'
      case 'office_hours': return 'Office Hours'
      default: return 'Other Events'
    }
  }

  // Removed productivity score and recommendations

  const getTotalEventsByType = () => {
    return Object.entries(stats.eventsByType || {})
      .sort(([,a], [,b]) => b - a)
      .slice(0, 4)
  }

  return (
    <div className="card schedule-stats">
      <div className="card-header">
        <h3>This Week's Overview</h3>
        <div className="period-selector">
          <button 
            className={`period-btn ${selectedPeriod === 'week' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('week')}
          >
            Week
          </button>
          <button 
            className={`period-btn ${selectedPeriod === 'month' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('month')}
          >
            Month
          </button>
        </div>
      </div>

      <div className="stats-overview">
        <div className="stat-item-large">
          <div className="stat-icon">
            <i className="fas fa-calendar-check"></i>
          </div>
          <div className="stat-content">
            <span className="stat-number">{stats.totalEvents || 0}</span>
            <span className="stat-label">Total Events</span>
          </div>
        </div>

        <div className="stat-item-large">
          <div className="stat-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-content">
            <span className="stat-number">{stats.totalHours || 0}h</span>
            <span className="stat-label">Scheduled Time</span>
          </div>
        </div>
      </div>

      {/* Productivity score removed */}

      <div className="events-breakdown">
        <h4>Event Types</h4>
        <div className="event-types-list">
          {getTotalEventsByType().map(([type, count]) => (
            <div key={type} className="event-type-item">
              <div className="event-type-info">
                <div 
                  className="event-type-icon"
                  style={{ backgroundColor: getEventTypeColor(type) }}
                >
                  <i className={getEventTypeIcon(type)}></i>
                </div>
                <span className="event-type-name">{getEventTypeName(type)}</span>
              </div>
              <div className="event-type-stats">
                <span className="event-count">{count}</span>
                <div className="event-percentage">
                  <div 
                    className="percentage-bar"
                    style={{ 
                      width: `${(count / stats.totalEvents) * 100}%`,
                      backgroundColor: getEventTypeColor(type)
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="time-distribution">
        <h4>Time Distribution</h4>
        <div className="time-chart">
          {getTotalEventsByType().map(([type, count]) => {
            const percentage = (count / stats.totalEvents) * 100
            return (
              <div key={type} className="time-segment">
                <div 
                  className="segment-bar"
                  style={{ 
                    height: `${percentage}%`,
                    backgroundColor: getEventTypeColor(type)
                  }}
                ></div>
                <span className="segment-label">{type}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="quick-actions">
        <button className="quick-action-btn">
          <i className="fas fa-plus"></i>
          Quick Add Study Time
        </button>
        <button className="quick-action-btn">
          <i className="fas fa-bell"></i>
          Set Reminders
        </button>
      </div>
    </div>
  )
}

export default ScheduleStats
