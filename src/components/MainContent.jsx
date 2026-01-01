import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import ProgressOverview from './ProgressOverview'
import ActiveLessons from './ActiveLessons'
import DeadlinesSection from './DeadlinesSection'

const MainContent = () => {
  const { user } = useAuth()
  return (
    <main className="main-content">
      {/* Welcome Section */}
      <section className="welcome-section">
        <h1>Welcome back, {user?.name || 'Student'}!</h1>
        <p>Here's what's happening with your learning today.</p>
      </section>

      {/* Progress Overview Cards */}
      <ProgressOverview />

      {/* Active Lessons */}
      <ActiveLessons />

      {/* Upcoming Deadlines */}
      <DeadlinesSection />
    </main>
  )
}

export default MainContent
