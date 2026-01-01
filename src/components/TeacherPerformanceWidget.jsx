import { useState } from 'react'

const TeacherPerformanceWidget = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week')

  const performanceData = { week: null, month: null, semester: null }

  const currentData = performanceData[selectedPeriod] || { activeStudents: 0, totalStudents: 0, averageGrade: 0, submissionRate: 0, attendanceRate: 0, improvements: [] }

  const classBreakdown = []

  const getGradeColor = (grade) => {
    if (grade >= 90) return '#4CAF50'
    if (grade >= 80) return '#2196F3'
    if (grade >= 70) return '#FF9800'
    return '#FF6B6B'
  }

  const getChangeColor = (change, trend) => {
    return trend === 'up' ? '#4CAF50' : '#FF6B6B'
  }

  const getPerformanceLevel = (rate) => {
    if (rate >= 90) return { level: 'Excellent', color: '#4CAF50' }
    if (rate >= 80) return { level: 'Good', color: '#2196F3' }
    if (rate >= 70) return { level: 'Fair', color: '#FF9800' }
    return { level: 'Needs Attention', color: '#FF6B6B' }
  }

  return (
    <div className="card teacher-performance-widget">
      <div className="card-header">
        <h3>Class Performance</h3>
        <select 
          value={selectedPeriod} 
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="period-selector"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="semester">This Semester</option>
        </select>
      </div>

      <div className="performance-overview">
        <div className="overview-stat">
          <div className="stat-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-content">
            <span className="stat-number">—</span>
            <span className="stat-label">Active Students</span>
          </div>
        </div>

        <div className="overview-stat">
          <div className="stat-icon">
            <i className="fas fa-graduation-cap"></i>
          </div>
          <div className="stat-content">
            <span className="stat-number">—</span>
            <span className="stat-label">Average Grade</span>
            <span className="stat-level">—</span>
          </div>
        </div>
      </div>

      <div className="performance-metrics">
        <div className="metric-item">
          <div className="metric-header">
            <span className="metric-label">Submission Rate</span>
            <span className="metric-value">—</span>
          </div>
          <div className="metric-bar">
              <div className="metric-progress" style={{ width: '0%' }}></div>
          </div>
        </div>

        <div className="metric-item">
          <div className="metric-header">
            <span className="metric-label">Attendance Rate</span>
            <span className="metric-value">—</span>
          </div>
          <div className="metric-bar">
              <div className="metric-progress" style={{ width: '0%' }}></div>
          </div>
        </div>
      </div>

      <div className="improvements-section">
        <h4>Key Improvements</h4>
        <div className="improvements-list">
          <div className="empty-state" style={{ padding: 16, color: 'var(--text-muted)' }}>No data</div>
        </div>
      </div>

      <div className="class-breakdown">
        <h4>Class Breakdown</h4>
        <div className="classes-list">
          <div className="empty-state" style={{ padding: 16, color: 'var(--text-muted)' }}>No classes</div>
        </div>
      </div>

      <div className="performance-footer">
        <button className="detailed-report-btn">
          <i className="fas fa-chart-bar"></i>
          Detailed Report
        </button>
      </div>
    </div>
  )
}

export default TeacherPerformanceWidget
