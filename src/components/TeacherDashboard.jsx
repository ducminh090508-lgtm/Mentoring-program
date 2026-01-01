import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import TeacherNavbar from './TeacherNavbar'
import TeacherTasksPage from './TeacherTasksPage'
import TeacherSchedulePage from './TeacherSchedulePage'

const TeacherDashboard = () => {
  const { user } = useAuth()
  const [currentPage, setCurrentPage] = useState('tasks')

  const handleNavigation = (page) => {
    setCurrentPage(page)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault()
            setCurrentPage('tasks')
            break
          case '2':
            e.preventDefault()
            setCurrentPage('schedule')
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="new-teacher-dashboard">
      <TeacherNavbar currentPage={currentPage} onNavigate={handleNavigation} />
      {currentPage === 'tasks' ? (
        <div className="page-content">
          <TeacherTasksPage />
        </div>
      ) : (
        <div className="page-content">
          <TeacherSchedulePage />
        </div>
      )}
    </div>
  )
}

export default TeacherDashboard
