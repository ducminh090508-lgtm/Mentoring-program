import { useState } from 'react'
import TeacherStudentOverview from './TeacherStudentOverview'
import TeacherSessionSchedule from './TeacherSessionSchedule'
import TeacherQuickActions from './TeacherQuickActions'
import TeacherCalendarWidget from './TeacherCalendarWidget'
import TeacherClassNotifications from './TeacherClassNotifications'

const TeacherMainContent = () => {
  return (
    <main className="main-content teacher-main">
      <div className="teacher-header">
        <div className="welcome-section">
          <h1>Welcome back</h1>
          <p>Here's what's happening with your classes today</p>
        </div>
        <div className="teacher-stats">
          <div className="stat-card">
            <i className="fas fa-users"></i>
            <div>
              <span className="stat-number">—</span>
              <span className="stat-label">Total Students</span>
            </div>
          </div>
          <div className="stat-card">
            <i className="fas fa-clipboard-check"></i>
            <div>
              <span className="stat-number">—</span>
              <span className="stat-label">Pending Reviews</span>
            </div>
          </div>
          <div className="stat-card">
            <i className="fas fa-calendar-day"></i>
            <div>
              <span className="stat-number">—</span>
              <span className="stat-label">Classes Today</span>
            </div>
          </div>
        </div>
      </div>

      <div className="teacher-content-grid">
        <div className="main-column">
          <TeacherStudentOverview />
          <TeacherSessionSchedule />
        </div>
        <div className="side-column">
          <TeacherQuickActions />
          <TeacherCalendarWidget />
          <TeacherClassNotifications />
        </div>
      </div>
    </main>
  )
}

export default TeacherMainContent
