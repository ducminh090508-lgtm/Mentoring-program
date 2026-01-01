import TeacherCalendarWidget from './TeacherCalendarWidget'
import TeacherClassNotifications from './TeacherClassNotifications'
import TeacherPerformanceWidget from './TeacherPerformanceWidget'

const TeacherRightPanel = () => {
  return (
    <aside className="right-panel teacher-right-panel">
      <TeacherCalendarWidget />
      <TeacherClassNotifications />
      <TeacherPerformanceWidget />
    </aside>
  )
}

export default TeacherRightPanel
