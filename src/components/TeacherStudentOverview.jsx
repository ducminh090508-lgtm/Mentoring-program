import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { listAssignmentsByTeacher, listAssignmentsByStudent } from '../services/adminService'
import { listTasksForStudent } from '../services/taskService'

const TeacherStudentOverview = () => {
  const [selectedClass, setSelectedClass] = useState('all')
  const [sortBy, setSortBy] = useState('progress')
  const { user } = useAuth()
  const [studentSummaries, setStudentSummaries] = useState([])

  useEffect(() => {
    const load = async () => {
      if (!user?.uid) return
      // For a teacher: fetch assigned students and basic totals (pending/completed via tasks if desired)
      const asg = await listAssignmentsByTeacher(user.uid)
      // Minimal card data; you can expand by fetching user docs and task stats
      const cards = asg.map(a => ({
        id: a.studentId,
        name: a.studentId,
        avatar: 'https://via.placeholder.com/40x40/4CAF50/FFFFFF?text=S',
        class: 'Assigned',
        progress: 0,
        lastActive: '-',
        pendingTasks: 0,
        completedTasks: 0,
        grade: 'B',
        status: 'active'
      }))
      setStudentSummaries(cards)
    }
    load()
  }, [user])

  const classes = useMemo(() => ['all', 'Assigned'], [])

  const filteredStudents = studentSummaries
    .filter(student => selectedClass === 'all' || student.class === selectedClass)
    .sort((a, b) => {
      switch (sortBy) {
        case 'progress':
          return b.progress - a.progress
        case 'name':
          return a.name.localeCompare(b.name)
        case 'grade':
          return a.grade.localeCompare(b.grade)
        case 'pending':
          return b.pendingTasks - a.pendingTasks
        default:
          return 0
      }
    })

  const getProgressColor = (progress) => {
    if (progress >= 90) return '#4CAF50'
    if (progress >= 75) return '#2196F3'
    if (progress >= 60) return '#FF9800'
    return '#FF6B6B'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#4CAF50'
      case 'attention': return '#FF9800'
      case 'inactive': return '#FF6B6B'
      default: return '#9E9E9E'
    }
  }

  return (
    <div className="card teacher-student-overview">
      <div className="card-header">
        <h3>Student Overview</h3>
        <div className="overview-controls">
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            className="class-filter"
          >
            {classes.map(cls => (
              <option key={cls} value={cls}>
                {cls === 'all' ? 'All Classes' : cls}
              </option>
            ))}
          </select>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-filter"
          >
            <option value="progress">Sort by Progress</option>
            <option value="name">Sort by Name</option>
            <option value="grade">Sort by Grade</option>
            <option value="pending">Sort by Pending Tasks</option>
          </select>
        </div>
      </div>

      <div className="student-summary">
        <div className="summary-item">
          <span className="summary-number">{filteredStudents.length}</span>
          <span className="summary-label">Students</span>
        </div>
        <div className="summary-item">
          <span className="summary-number">
            {Math.round(filteredStudents.reduce((acc, s) => acc + s.progress, 0) / filteredStudents.length)}%
          </span>
          <span className="summary-label">Avg Progress</span>
        </div>
        <div className="summary-item">
          <span className="summary-number">
            {filteredStudents.reduce((acc, s) => acc + s.pendingTasks, 0)}
          </span>
          <span className="summary-label">Pending Tasks</span>
        </div>
      </div>

      <div className="students-list">
        {filteredStudents.map(student => (
          <div key={student.id} className="student-card">
            <div className="student-avatar">
              <img src={student.avatar} alt={student.name} />
              <div 
                className="status-indicator"
                style={{ backgroundColor: getStatusColor(student.status) }}
              ></div>
            </div>
            
            <div className="student-info">
              <div className="student-name-grade">
                <h4>{student.name}</h4>
                <span className={`grade-badge grade-${student.grade.replace('+', 'plus').replace('-', 'minus')}`}>
                  {student.grade}
                </span>
              </div>
              <p className="student-class">{student.class}</p>
              <p className="student-activity">Last active: {student.lastActive}</p>
            </div>
            
            <div className="student-metrics">
              <div className="progress-section">
                <div className="progress-header">
                  <span>Progress</span>
                  <span>{student.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${student.progress}%`,
                      backgroundColor: getProgressColor(student.progress)
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="task-summary">
                <div className="task-item">
                  <span className="task-number pending">{student.pendingTasks}</span>
                  <span className="task-label">Pending</span>
                </div>
                <div className="task-item">
                  <span className="task-number completed">{student.completedTasks}</span>
                  <span className="task-label">Completed</span>
                </div>
              </div>
            </div>
            
            <div className="student-actions">
              <button className="action-btn message" title="Send Message">
                <i className="fas fa-comment"></i>
              </button>
              <button className="action-btn view" title="View Details">
                <i className="fas fa-eye"></i>
              </button>
              <button className="action-btn grade" title="Grade Work">
                <i className="fas fa-graduation-cap"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="overview-footer">
        <button className="view-all-students-btn">
          <i className="fas fa-users"></i>
          View All Students
        </button>
      </div>
    </div>
  )
}

export default TeacherStudentOverview
