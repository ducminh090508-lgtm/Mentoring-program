import { useEffect } from 'react'

const NotificationPanel = ({ onClose }) => {
  const notifications = []

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.notification-panel')) {
        onClose()
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [onClose])

  const getIconColor = (type) => {
    switch (type) {
      case 'warning': return '#FF9800'
      case 'success': return '#4CAF50'
      case 'info': return '#2196F3'
      default: return '#666'
    }
  }

  return (
    <div className="notification-panel">
      <div className="notification-panel-content">
        <div className="notification-header">
          <h3>Notifications</h3>
          <button className="close-panel" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="notification-list">
          {notifications.length === 0 ? (
            <div className="empty-notifications">
              <div className="empty-icon">
                <i className="fas fa-bell-slash"></i>
              </div>
              <p>No notifications</p>
            </div>
          ) : notifications.map(notification => (
            <div key={notification.id} className="notification-item">
              <i 
                className={notification.icon}
                style={{ color: getIconColor(notification.type) }}
              ></i>
              <div>
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default NotificationPanel
