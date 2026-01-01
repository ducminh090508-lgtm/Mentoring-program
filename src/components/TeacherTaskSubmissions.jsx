import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { listSubmissionsForTeacher, gradeSubmission } from '../services/taskService'

const TeacherTaskSubmissions = () => {
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [selectedSubmission, setSelectedSubmission] = useState(null)

  const { user } = useAuth()
  const [submissions, setSubmissions] = useState([])

  useEffect(() => {
    const load = async () => {
      if (!user?.uid) return
      const list = await listSubmissionsForTeacher({ teacherId: user.uid })
      setSubmissions(list)
    }
    load()
  }, [user])

  const statusOptions = [
    { value: 'all', label: 'All Submissions' },
    { value: 'submitted', label: 'Pending Review' },
    { value: 'graded', label: 'Graded' },
    { value: 'reviewed', label: 'Reviewed' },
    { value: 'late', label: 'Late Submissions' },
    { value: 'needs_revision', label: 'Needs Revision' }
  ]

  const filteredSubmissions = submissions.filter(submission => 
    filterStatus === 'all' || submission.status === filterStatus
  )

  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.submittedAt) - new Date(a.submittedAt)
      case 'student':
        return a.studentName.localeCompare(b.studentName)
      case 'assignment':
        return a.assignment.localeCompare(b.assignment)
      case 'class':
        return a.class.localeCompare(b.class)
      default:
        return 0
    }
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return '#2196F3'
      case 'graded': return '#4CAF50'
      case 'reviewed': return '#4CAF50'
      case 'late': return '#FF9800'
      case 'needs_revision': return '#F44336'
      default: return '#9E9E9E'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted': return 'ph ph-clock'
      case 'graded': return 'ph ph-check-circle'
      case 'reviewed': return 'ph ph-checks'
      case 'late': return 'ph ph-warning-circle'
      case 'needs_revision': return 'ph ph-arrow-clockwise'
      default: return 'ph ph-circle'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'submitted': return 'Pending Review'
      case 'graded': return 'Graded'
      case 'reviewed': return 'Reviewed'
      case 'late': return 'Late'
      case 'needs_revision': return 'Needs Revision'
      default: return 'Unknown'
    }
  }

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'zip': return 'ph ph-file-zip'
      case 'pdf': return 'ph ph-file-pdf'
      case 'html': return 'ph ph-file-html'
      case 'sql': return 'ph ph-database'
      default: return 'ph ph-file'
    }
  }

  const handleGradeSubmission = async (submissionId) => {
    await gradeSubmission({ submissionId, grade: 90 })
  }

  const handleViewSubmission = (submission) => {
    setSelectedSubmission(submission)
  }

  const handleDownload = (submissionId) => {
    console.log('Download submission:', submissionId)
    // Handle download logic
  }

  // Calculate stats
  const pendingCount = submissions.filter(s => s.status === 'submitted').length
  const lateCount = submissions.filter(s => s.status === 'late').length
  const gradedCount = submissions.filter(s => s.status === 'graded' || s.status === 'reviewed').length
  const needsRevisionCount = submissions.filter(s => s.status === 'needs_revision').length

  return (
    <div className="teacher-task-submissions">
      {/* Header */}
      <div className="submissions-header">
        <div className="header-content">
          <h2>Task Submissions</h2>
          <p>Review and grade student submissions</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="submissions-stats">
        <div className="stat-card pending">
          <div className="stat-icon">
            <i className="ph ph-clock"></i>
          </div>
          <div className="stat-content">
            <span className="stat-number">{pendingCount}</span>
            <span className="stat-label">Pending Review</span>
          </div>
        </div>

        <div className="stat-card late">
          <div className="stat-icon">
            <i className="ph ph-warning-circle"></i>
          </div>
          <div className="stat-content">
            <span className="stat-number">{lateCount}</span>
            <span className="stat-label">Late Submissions</span>
          </div>
        </div>

        <div className="stat-card graded">
          <div className="stat-icon">
            <i className="ph ph-check-circle"></i>
          </div>
          <div className="stat-content">
            <span className="stat-number">{gradedCount}</span>
            <span className="stat-label">Graded</span>
          </div>
        </div>

        <div className="stat-card revision">
          <div className="stat-icon">
            <i className="ph ph-arrow-clockwise"></i>
          </div>
          <div className="stat-content">
            <span className="stat-number">{needsRevisionCount}</span>
            <span className="stat-label">Needs Revision</span>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="submissions-controls">
        <div className="filter-group">
          <label>Status:</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
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
            <option value="date">Submission Date</option>
            <option value="student">Student Name</option>
            <option value="assignment">Assignment</option>
            <option value="class">Class</option>
          </select>
        </div>

        <button className="export-btn">
          <i className="ph ph-download"></i>
          Export Data
        </button>
      </div>

      {/* Submissions List */}
      <div className="submissions-list">
        {sortedSubmissions.map(submission => (
          <div key={submission.id} className="submission-card">
            <div className="submission-header">
              <div className="student-info">
                <img src={submission.studentAvatar} alt={submission.studentName} className="student-avatar" />
                <div className="student-details">
                  <h4>{submission.studentName}</h4>
                  <p className="assignment-name">{submission.assignment}</p>
                  <span className="class-name">{submission.class}</span>
                </div>
              </div>

              <div className="submission-status">
                <div 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(submission.status) }}
                >
                  <i className={getStatusIcon(submission.status)}></i>
                  {getStatusLabel(submission.status)}
                </div>
              </div>
            </div>

            <div className="submission-content">
                          <div className="submission-meta">
              <div className="meta-item">
                <i className="ph ph-calendar"></i>
                <span>Submitted: {submission.submittedAt.toLocaleDateString()}</span>
              </div>
              <div className="meta-item">
                <i className={getFileIcon(submission.fileType)}></i>
                <span>{submission.fileSize}</span>
              </div>
              {submission.grade && (
                <div className="meta-item grade">
                  <i className="ph ph-star"></i>
                  <span>Grade: {submission.grade}%</span>
                </div>
              )}
            </div>

              <div className="submission-description">
                <p>{submission.description}</p>
              </div>

              <div className="submission-attachments">
                <span className="attachments-label">Attachments:</span>
                <div className="attachments-list">
                  {submission.attachments.map((file, index) => (
                    <span key={index} className="attachment-file">
                      <i className={getFileIcon(file.split('.').pop())}></i>
                      {file}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="submission-actions">
              <button 
                className="action-btn primary"
                onClick={() => handleViewSubmission(submission)}
              >
                <i className="ph ph-eye"></i>
                View Details
              </button>

              {submission.status === 'submitted' || submission.status === 'late' ? (
                <button 
                  className="action-btn grade"
                  onClick={() => handleGradeSubmission(submission.id)}
                >
                  <i className="ph ph-pencil"></i>
                  Grade
                </button>
              ) : (
                <button 
                  className="action-btn"
                  onClick={() => handleGradeSubmission(submission.id)}
                >
                  <i className="ph ph-pencil"></i>
                  Edit Grade
                </button>
              )}

              <button 
                className="action-btn"
                onClick={() => handleDownload(submission.id)}
              >
                <i className="ph ph-download"></i>
                Download
              </button>

              <button className="action-btn">
                <i className="ph ph-chat-circle"></i>
                Feedback
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="quick-action-btn">
          <i className="ph ph-plus"></i>
          Create Assignment
        </button>
        <button className="quick-action-btn">
          <i className="ph ph-bell"></i>
          Send Reminder
        </button>
        <button className="quick-action-btn">
          <i className="ph ph-chart-bar"></i>
          View Analytics
        </button>
      </div>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="modal-overlay" onClick={() => setSelectedSubmission(null)}>
          <div className="submission-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Submission Details</h3>
              <button 
                className="close-btn"
                onClick={() => setSelectedSubmission(null)}
              >
                <i className="ph ph-x"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="submission-detail-content">
                <div className="detail-section">
                  <h4>Student Information</h4>
                  <p><strong>Name:</strong> {selectedSubmission.studentName}</p>
                  <p><strong>Assignment:</strong> {selectedSubmission.assignment}</p>
                  <p><strong>Class:</strong> {selectedSubmission.class}</p>
                  <p><strong>Submitted:</strong> {selectedSubmission.submittedAt.toLocaleString()}</p>
                </div>
                <div className="detail-section">
                  <h4>Description</h4>
                  <p>{selectedSubmission.description}</p>
                </div>
                <div className="detail-section">
                  <h4>Files</h4>
                  <div className="file-list">
                    {selectedSubmission.attachments.map((file, index) => (
                      <div key={index} className="file-item">
                        <i className={getFileIcon(file.split('.').pop())}></i>
                        <span>{file}</span>
                        <button className="download-file-btn">
                          <i className="ph ph-download"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherTaskSubmissions
