import { useState } from 'react'

const TeacherQuickActions = () => {
  const [showCreateMenu, setShowCreateMenu] = useState(false)

  const quickActions = []

  const recentActions = []

  return (
    <div className="card teacher-quick-actions">
      <div className="card-header">
        <h3>Quick Actions</h3>
        <button 
          className="more-actions-btn"
          onClick={() => setShowCreateMenu(!showCreateMenu)}
        >
          <i className="fas fa-ellipsis-v"></i>
        </button>
      </div>

      <div className="actions-grid">
        {quickActions.length === 0 ? (
          <div className="empty-state" style={{ padding: 16, color: 'var(--text-muted)' }}>
            No quick actions
          </div>
        ) : quickActions.map(action => (
          <button
            key={action.id}
            className="quick-action-card"
            onClick={action.action}
            style={{ '--action-color': action.color }}
          >
            <div className="action-icon">
              <i className={action.icon}></i>
              {action.count && (
                <span className="action-count">{action.count}</span>
              )}
            </div>
            <div className="action-content">
              <h4>{action.title}</h4>
              <p>{action.description}</p>
            </div>
            <div className="action-arrow">
              <i className="fas fa-chevron-right"></i>
            </div>
          </button>
        ))}
      </div>

      <div className="actions-divider">
        <span>Recent Activity</span>
      </div>

      <div className="recent-actions">
        {recentActions.length === 0 ? (
          <div className="empty-state" style={{ padding: 16, color: 'var(--text-muted)' }}>
            No recent activity
          </div>
        ) : recentActions.map(recent => (
          <div key={recent.id} className="recent-action-item">
            <div className="recent-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="recent-content">
              <p className="recent-action">{recent.action}</p>
              <div className="recent-meta">
                <span className="recent-time">{recent.time}</span>
                {recent.students && (
                  <>
                    <span className="meta-separator">•</span>
                    <span className="recent-students">{recent.students} students</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="actions-footer">
        <button className="view-history-btn">
          <i className="fas fa-history"></i>
          View Full History
        </button>
      </div>

      {showCreateMenu && (
        <div className="create-menu-overlay" onClick={() => setShowCreateMenu(false)}>
          <div className="create-menu" onClick={(e) => e.stopPropagation()}>
            <div className="create-menu-header">
              <h4>Create New</h4>
              <button 
                className="close-menu"
                onClick={() => setShowCreateMenu(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="create-menu-items">
              <button className="create-item">
                <i className="fas fa-file-alt"></i>
                <span>Assignment</span>
              </button>
              <button className="create-item">
                <i className="fas fa-question-circle"></i>
                <span>Quiz</span>
              </button>
              <button className="create-item">
                <i className="fas fa-calendar-plus"></i>
                <span>Class Session</span>
              </button>
              <button className="create-item">
                <i className="fas fa-bullhorn"></i>
                <span>Announcement</span>
              </button>
              <button className="create-item">
                <i className="fas fa-folder-plus"></i>
                <span>Course Material</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherQuickActions
