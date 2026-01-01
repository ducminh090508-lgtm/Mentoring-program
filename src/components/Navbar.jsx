import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const Navbar = ({ currentPage, onNavigate }) => {
  const { user, logout } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const navItems = [
    { id: 'assignments', label: 'Tasks', icon: 'ph ph-clipboard-text' },
    { id: 'schedule', label: 'Schedule', icon: 'ph ph-calendar' }
  ]

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications)
    setShowUserMenu(false)
  }

  const handleUserClick = () => {
    setShowUserMenu(!showUserMenu)
    setShowNotifications(false)
  }

  const handleNavClick = (pageId) => {
    onNavigate(pageId)
    setShowNotifications(false)
    setShowUserMenu(false)
  }

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <i className="ph ph-graduation-cap"></i>
            <span>Peer Mentoring Program</span>
          </div>
          
          <ul className="nav-menu">
            {navItems.map(item => (
              <li key={item.id}>
                <button
                  className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
                  onClick={() => handleNavClick(item.id)}
                >
                  <i className={item.icon}></i>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
          
          <div className="nav-user" style={{ gap: '12px' }}>
            <button className="assign-btn" onClick={logout} title="Sign out">
              <i className="ph ph-sign-out"></i>
              <span className="hide-sm">Sign Out</span>
            </button>
            <div className="user-avatar" onClick={handleUserClick}>
              <img 
                src={user?.avatar || "https://via.placeholder.com/40x40/4CAF50/FFFFFF?text=U"} 
                alt={user?.name || "User"} 
              />
            </div>
          </div>
        </div>
      </nav>
      
      {showUserMenu && (
        <div className="user-menu">
                  <div className="user-menu-content">
          <div className="user-info">
            <img src={user?.avatar || "https://via.placeholder.com/40x40/4CAF50/FFFFFF?text=U"} alt={user?.name || "User"} />
            <div>
              <h4>{user?.name || "User"}</h4>
              <p>{user?.role || "Student"}</p>
            </div>
          </div>
          <ul className="user-menu-items">
            <li onClick={logout}><i className="ph ph-sign-out"></i> Sign Out</li>
          </ul>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
