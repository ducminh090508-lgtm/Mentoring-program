import { useState } from 'react'
import CalendarWidget from './CalendarWidget'
import RecentSubmissions from './RecentSubmissions'
import SessionAnalytics from './SessionAnalytics'

const RightPanel = () => {
  return (
    <aside className="right-panel">
      <CalendarWidget />
      <RecentSubmissions />
      <SessionAnalytics />
    </aside>
  )
}

export default RightPanel
