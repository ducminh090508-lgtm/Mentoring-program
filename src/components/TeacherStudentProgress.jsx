import { useState } from 'react'

const TeacherStudentProgress = () => {
  const [selectedClass, setSelectedClass] = useState('all')
  const [sortBy, setSortBy] = useState('name')

  // Sample student data
  const students = [
    {
      id: 1,
      name: 'Sarah Wilson',
      email: 'sarah.wilson@email.com',
      avatar: 'https://via.placeholder.com/40x40/4CAF50/FFFFFF?text=SW',
      class: 'React Development',
      overallGrade: 92,
      assignments: { completed: 8, total: 10 },
      attendance: 95,
      lastActivity: '2 hours ago',
      status: 'active',
      progress: [
        { subject: 'Components', score: 95 },
        { subject: 'Hooks', score: 88 },
        { subject: 'State Management', score: 92 }
      ]
    },
    {
      id: 2,
      name: 'David Park',
      email: 'david.park@email.com',
      avatar: 'https://via.placeholder.com/40x40/2196F3/FFFFFF?text=DP',
      class: 'Database Design',
      overallGrade: 78,
      assignments: { completed: 6, total: 10 },
      attendance: 82,
      lastActivity: '1 day ago',
      status: 'warning',
      progress: [
        { subject: 'SQL Basics', score: 85 },
        { subject: 'Relationships', score: 72 },
        { subject: 'Optimization', score: 76 }
      ]
    },
    {
      id: 3,
      name: 'Alex Johnson',
      email: 'alex.johnson@email.com',
      avatar: 'https://via.placeholder.com/40x40/FF9800/FFFFFF?text=AJ',
      class: 'JavaScript Fundamentals',
      overallGrade: 96,
      assignments: { completed: 10, total: 10 },
      attendance: 98,
      lastActivity: '30 minutes ago',
      status: 'active',
      progress: [
        { subject: 'Variables & Functions', score: 98 },
        { subject: 'Objects & Arrays', score: 95 },
        { subject: 'DOM Manipulation', score: 94 }
      ]
    },
    {
      id: 4,
      name: 'Emma Rodriguez',
      email: 'emma.rodriguez@email.com',
      avatar: 'https://via.placeholder.com/40x40/9C27B0/FFFFFF?text=ER',
      class: 'React Development',
      overallGrade: 86,
      assignments: { completed: 7, total: 10 },
      attendance: 89,
      lastActivity: '5 hours ago',
      status: 'active',
      progress: [
        { subject: 'Components', score: 90 },
        { subject: 'Hooks', score: 85 },
        { subject: 'State Management', score: 83 }
      ]
    },
    {
      id: 5,
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      avatar: 'https://via.placeholder.com/40x40/F44336/FFFFFF?text=MC',
      class: 'Database Design',
      overallGrade: 65,
      assignments: { completed: 4, total: 10 },
      attendance: 68,
      lastActivity: '3 days ago',
      status: 'inactive',
      progress: [
        { subject: 'SQL Basics', score: 70 },
        { subject: 'Relationships', score: 58 },
        { subject: 'Optimization', score: 67 }
      ]
    }
  ]

  const classes = ['all', 'React Development', 'Database Design', 'JavaScript Fundamentals']

  const filteredStudents = students.filter(student => 
    selectedClass === 'all' || student.class === selectedClass
  )

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'grade':
        return b.overallGrade - a.overallGrade
      case 'attendance':
        return b.attendance - a.attendance
      case 'activity':
        return new Date(b.lastActivity) - new Date(a.lastActivity)
      default:
        return 0
    }
  })

  const getGradeColor = (grade) => {
    if (grade >= 90) return '#4CAF50'
    if (grade >= 80) return '#2196F3'
    if (grade >= 70) return '#FF9800'
    return '#F44336'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#4CAF50'
      case 'warning': return '#FF9800'
      case 'inactive': return '#F44336'
      default: return '#9E9E9E'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return 'ph ph-check-circle'
      case 'warning': return 'ph ph-warning-circle'
      case 'inactive': return 'ph ph-x-circle'
      default: return 'ph ph-circle'
    }
  }

  // Calculate overview stats
  const totalStudents = filteredStudents.length
  const averageGrade = Math.round(filteredStudents.reduce((sum, student) => sum + student.overallGrade, 0) / totalStudents)
  const averageAttendance = Math.round(filteredStudents.reduce((sum, student) => sum + student.attendance, 0) / totalStudents)
  const activeStudents = filteredStudents.filter(student => student.status === 'active').length

  return (
    <div className="teacher-student-progress">
      {/* Header */}
      <div className="progress-header">
        <div className="header-content">
          <h2>Student Progress</h2>
          <p>Monitor your students' learning journey and performance</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="progress-overview">
        <div className="overview-card">
          <div className="overview-icon">
            <i className="ph ph-users"></i>
          </div>
          <div className="overview-content">
            <span className="overview-number">{totalStudents}</span>
            <span className="overview-label">Total Students</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-icon">
            <i className="ph ph-trend-up"></i>
          </div>
          <div className="overview-content">
            <span className="overview-number">{averageGrade}%</span>
            <span className="overview-label">Average Grade</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-icon">
            <i className="ph ph-calendar-check"></i>
          </div>
          <div className="overview-content">
            <span className="overview-number">{averageAttendance}%</span>
            <span className="overview-label">Attendance</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-icon">
            <i className="ph ph-user-check"></i>
          </div>
          <div className="overview-content">
            <span className="overview-number">{activeStudents}</span>
            <span className="overview-label">Active Students</span>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="progress-controls">
        <div className="filter-group">
          <label>Class:</label>
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            className="filter-select"
          >
            {classes.map(className => (
              <option key={className} value={className}>
                {className === 'all' ? 'All Classes' : className}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Sort by:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="name">Name</option>
            <option value="grade">Grade</option>
            <option value="attendance">Attendance</option>
            <option value="activity">Last Activity</option>
          </select>
        </div>
      </div>

      {/* Students List */}
      <div className="students-list">
        {sortedStudents.map(student => (
          <div key={student.id} className="student-card">
            <div className="student-header">
              <div className="student-avatar">
                <img src={student.avatar} alt={student.name} />
                <div 
                  className="status-indicator"
                  style={{ backgroundColor: getStatusColor(student.status) }}
                ></div>
              </div>

              <div className="student-info">
                <h4>{student.name}</h4>
                <p className="student-email">{student.email}</p>
                <p className="student-class">{student.class}</p>
              </div>

              <div className="student-status">
                <i 
                  className={getStatusIcon(student.status)}
                  style={{ color: getStatusColor(student.status) }}
                ></i>
              </div>
            </div>

            <div className="student-metrics">
              <div className="metric-group">
                <div className="metric-item">
                  <span className="metric-label">Overall Grade</span>
                  <span 
                    className="metric-value grade"
                    style={{ color: getGradeColor(student.overallGrade) }}
                  >
                    {student.overallGrade}%
                  </span>
                </div>

                <div className="metric-item">
                  <span className="metric-label">Assignments</span>
                  <span className="metric-value">
                    {student.assignments.completed}/{student.assignments.total}
                  </span>
                </div>

                <div className="metric-item">
                  <span className="metric-label">Attendance</span>
                  <span className="metric-value">{student.attendance}%</span>
                </div>

                <div className="metric-item">
                  <span className="metric-label">Last Activity</span>
                  <span className="metric-value">{student.lastActivity}</span>
                </div>
              </div>

              <div className="progress-bars">
                {student.progress.map((item, index) => (
                  <div key={index} className="progress-item">
                    <div className="progress-header">
                      <span className="progress-label">{item.subject}</span>
                      <span className="progress-score">{item.score}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${item.score}%`,
                          backgroundColor: getGradeColor(item.score)
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="student-actions">
              <button className="action-btn">
                <i className="ph ph-eye"></i>
                View Details
              </button>
              <button className="action-btn">
                <i className="ph ph-chat-circle"></i>
                Message
              </button>
              <button className="action-btn">
                <i className="ph ph-chart-bar"></i>
                Analytics
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TeacherStudentProgress
