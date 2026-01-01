import { useState } from 'react'

const TeacherClassNotifications = () => {
  const [filter, setFilter] = useState('all')

  const notifications = []

  const filterOptions = [
    { value: 'all', label: 'All', count: notifications.length },
    { value: 'unread', label: 'Unread', count: notifications.filter(n => n.unread).length },
    { value: 'action', label: 'Action Required', count: notifications.filter(n => n.actionRequired).length },
    { value: 'high', label: 'High Priority', count: notifications.filter(n => n.priority === 'high').length }
  ]

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return notification.unread
      case 'action':
        return notification.actionRequired
      case 'high':
        return notification.priority === 'high'
      default:
        return true
    }
  })

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'submission': return 'fas fa-file-upload'
      case 'late': return 'fas fa-exclamation-triangle'
      case 'question': return 'fas fa-question-circle'
      case 'grade': return 'fas fa-graduation-cap'
      case 'attendance': return 'fas fa-user-clock'
      case 'achievement': return 'fas fa-trophy'
      default: return 'fas fa-bell'
    }
  }

  const getNotificationColor = (type, priority) => {
    if (priority === 'high') return '#FF6B6B'
    switch (type) {
      case 'submission': return '#4CAF50'
      case 'late': return '#FF6B6B'
      case 'question': return '#2196F3'
      case 'grade': return '#FF9800'
      case 'attendance': return '#9C27B0'
      case 'achievement': return '#4CAF50'
      default: return '#9E9E9E'
    }
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <span className="priority-badge high">High</span>
      case 'low':
        return <span className="priority-badge low">Low</span>
      default:
        return null
    }
  }

  const handleNotificationClick = (notification) => {
    console.log('Handle notification:', notification)
    // Here you would typically navigate to the relevant page or open a modal
  }

  const markAsRead = (notificationId, e) => {
    e.stopPropagation()
    console.log('Mark as read:', notificationId)
    // Update notification read status
  }

  const markAllAsRead = () => {
    console.log('Mark all as read')
    // Update all notifications read status
  }

  return (
    <div className="card teacher-class-notifications">
      <div className="card-header">
        <h3>Class Notifications</h3>
        <div className="notification-actions">
          <button className="mark-all-read" onClick={markAllAsRead}>
            <i className="fas fa-check-double"></i>
          </button>
          <button className="notification-settings">
            <i className="fas fa-cog"></i>
          </button>
        </div>
      </div>

      <div className="notification-filters">
        {filterOptions.map(option => (
          <button
            key={option.value}
            className={`filter-btn ${filter === option.value ? 'active' : ''}`}
            onClick={() => setFilter(option.value)}
          >
            {option.label}
            {option.count > 0 && (
              <span className="filter-count">{option.count}</span>
            )}
          </button>
        ))}
      </div>

      <div className="notifications-list">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`notification-item ${notification.unread ? 'unread' : ''} ${notification.actionRequired ? 'action-required' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div 
                className="notification-icon"
                style={{ backgroundColor: getNotificationColor(notification.type, notification.priority) }}
              >
                <i className={getNotificationIcon(notification.type)}></i>
              </div>

              <div className="notification-content">
                <div className="notification-header">
                  <h4>{notification.title}</h4>
                  <div className="notification-meta">
                    {getPriorityBadge(notification.priority)}
                    {notification.unread && (
                      <button 
                        className="mark-read-btn"
                        onClick={(e) => markAsRead(notification.id, e)}
                        title="Mark as read"
                      >
                        <i className="fas fa-check"></i>
                      </button>
                    )}
                  </div>
                </div>

                <p className="notification-message">{notification.message}</p>

                <div className="notification-details">
                  <div className="notification-context">
                    <span className="student-name">{notification.student}</span>
                    <span className="separator">•</span>
                    <span className="class-name">{notification.class}</span>
                  </div>
                  <span className="notification-time">{notification.time}</span>
                </div>

                {notification.actionRequired && (
                  <div className="action-indicator">
                    <i className="fas fa-exclamation"></i>
                    <span>Action Required</span>
                  </div>
                )}
              </div>

              {notification.unread && (
                <div className="unread-indicator"></div>
              )}
            </div>
          ))
        ) : (
          <div className="empty-notifications">
            <div className="empty-icon">
              <i className="fas fa-bell-slash"></i>
            </div>
            <p>No notifications</p>
            <small>You're all caught up!</small>
          </div>
        )}
      </div>

      <div className="notifications-footer">
        <button className="view-all-notifications">
          <i className="fas fa-list"></i>
          View All Notifications
        </button>
      </div>
    </div>
  )
}

export default TeacherClassNotifications
