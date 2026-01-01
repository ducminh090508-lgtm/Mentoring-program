import { useState } from 'react'

const Sidebar = () => {
  const [activeButton, setActiveButton] = useState(0)

  const sidebarItems = [
    { icon: 'fas fa-home', label: 'Dashboard' },
    { icon: 'fas fa-book', label: 'Courses' },
    { icon: 'fas fa-chart-bar', label: 'Analytics' },
    { icon: 'fas fa-calendar', label: 'Calendar' },
    { icon: 'fas fa-cog', label: 'Settings' }
  ]

  const handleButtonClick = (index) => {
    setActiveButton(index)
  }

  return (
    <aside className="sidebar">
      {sidebarItems.map((item, index) => (
        <div key={index} className="sidebar-item">
          <button 
            className={`icon-button ${activeButton === index ? 'active' : ''}`}
            onClick={() => handleButtonClick(index)}
            title={item.label}
          >
            <i className={item.icon}></i>
          </button>
        </div>
      ))}
    </aside>
  )
}

export default Sidebar
