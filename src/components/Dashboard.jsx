import { useState } from 'react'
import Navbar from './Navbar'
import AssignmentsPage from './AssignmentsPage'
import SchedulePage from './SchedulePage'

const Dashboard = () => {
  const [currentPage, setCurrentPage] = useState('assignments')

  const handleNavigation = (page) => {
    setCurrentPage(page)
  }

  return (
    <div className="dashboard-app">
      <Navbar currentPage={currentPage} onNavigate={handleNavigation} />
      {currentPage === 'assignments' ? (
        <div className="page-content">
          <AssignmentsPage />
        </div>
      ) : (
        <div className="page-content">
          <SchedulePage />
        </div>
      )}
    </div>
  )
}

export default Dashboard
