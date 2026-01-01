import { useEffect, useState } from 'react'
import TeacherSubmissionModal from './TeacherSubmissionModal'
import { useAuth } from '../context/AuthContext'
import { listStudents } from '../services/userService'
import { createTask } from '../services/taskService'

const TeacherTasksPage = () => {
  const [filter, setFilter] = useState('pending')
  const [selectedClass, setSelectedClass] = useState('all')
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Task creation state
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [assignees, setAssignees] = useState([]) // array of student ids
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [taskDueDate, setTaskDueDate] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    const load = async () => {
      const list = await listStudents()
      setStudents(list)
    }
    load()
  }, [])

  const toggleAssignee = (id) => {
    setAssignees(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleCreateTask = async () => {
    if (!taskTitle || !taskDueDate || assignees.length === 0) return
    setIsCreating(true)
    await createTask({
      teacherId: user?.uid,
      title: taskTitle,
      description: taskDescription,
      dueDate: new Date(taskDueDate).toISOString(),
      assignedTo: assignees,
    })
    setTaskTitle('')
    setTaskDescription('')
    setTaskDueDate('')
    setAssignees([])
    setIsCreating(false)
  }

  // Submissions list will be wired with Firestore (placeholder empty now)
  const submissions = []

  const classes = ['all']

  const filterOptions = [
    { value: 'pending', label: 'Pending Review', count: submissions.filter(s => s.status === 'pending').length },
    { value: 'graded', label: 'Graded', count: submissions.filter(s => s.status === 'graded').length },
    { value: 'reviewed', label: 'Reviewed', count: submissions.filter(s => s.status === 'reviewed').length },
    { value: 'late', label: 'Late Submissions', count: submissions.filter(s => s.isLate).length },
    { value: 'all', label: 'All', count: submissions.length }
  ]

  const filteredSubmissions = submissions
    .filter(submission => {
      // Filter by status
      if (filter === 'late') return submission.isLate
      if (filter === 'all') return true
      return submission.status === filter
    })
    .filter(submission => {
      // Filter by class
      if (selectedClass === 'all') return true
      return submission.courseName === selectedClass
    })
    .filter(submission => {
      // Filter by search term
      if (!searchTerm) return true
      return submission.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             submission.assignmentTitle.toLowerCase().includes(searchTerm.toLowerCase())
    })

  const getStatusColor = (status, isLate) => {
    if (isLate) return '#FF6B6B'
    switch (status) {
      case 'pending': return '#FF9800'
      case 'graded': return '#4CAF50'
      case 'reviewed': return '#2196F3'
      default: return '#9E9E9E'
    }
  }

  const getStatusIcon = (status, isLate) => {
    if (isLate) return 'fas fa-clock'
    switch (status) {
      case 'pending': return 'fas fa-hourglass-half'
      case 'graded': return 'fas fa-check-circle'
      case 'reviewed': return 'fas fa-eye'
      default: return 'fas fa-question-circle'
    }
  }

  const getFileTypeIcon = (type) => {
    switch (type) {
      case 'javascript': return 'fab fa-js-square'
      case 'html': return 'fab fa-html5'
      case 'css': return 'fab fa-css3-alt'
      case 'sql': return 'fas fa-database'
      case 'image': return 'fas fa-image'
      case 'markdown': return 'fab fa-markdown'
      case 'text': return 'fas fa-file-alt'
      default: return 'fas fa-file'
    }
  }

  const getGradeColor = (grade) => {
    if (grade >= 90) return '#4CAF50'
    if (grade >= 80) return '#2196F3'
    if (grade >= 70) return '#FF9800'
    return '#FF6B6B'
  }

  const handleViewSubmission = (submission) => {
    setSelectedSubmission(submission)
    setShowSubmissionModal(true)
  }

  const handleGradeSubmission = (submission) => {
    console.log('Grade submission:', submission)
    // Navigate to grading interface
  }

  const getTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  return (
    <div className="teacher-tasks-page">
      <div className="tasks-header">
        <div className="header-content">
          <h1>Student Submissions</h1>
          <p>Review and grade student work across all your classes</p>
        </div>
        <div className="header-stats">
          <div className="stat-card pending">
            <i className="fas fa-hourglass-half"></i>
            <div>
              <span className="stat-number">{submissions.filter(s => s.status === 'pending').length}</span>
              <span className="stat-label">Pending Review</span>
            </div>
          </div>
          <div className="stat-card late">
            <i className="fas fa-clock"></i>
            <div>
              <span className="stat-number">{submissions.filter(s => s.isLate).length}</span>
              <span className="stat-label">Late Submissions</span>
            </div>
          </div>
          <div className="stat-card graded">
            <i className="fas fa-check-circle"></i>
            <div>
              <span className="stat-number">{submissions.filter(s => s.status === 'graded').length}</span>
              <span className="stat-label">Graded</span>
            </div>
          </div>
        </div>
      </div>

      {/* Create Task Panel */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3>Create Task</h3>
        </div>
        <div className="create-task-form">
          <div className="form-row">
            <div className="form-group">
              <label>Title</label>
              <input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="e.g. React Hooks Project" />
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} placeholder="Add task details, requirements, etc." rows={3} />
          </div>
          <div className="form-group">
            <label>Assign to Students</label>
            <div className="assignees-grid">
              {students.map(s => (
                <label key={s.id} className={`assignee-chip ${assignees.includes(s.id) ? 'selected' : ''}`}>
                  <input type="checkbox" checked={assignees.includes(s.id)} onChange={() => toggleAssignee(s.id)} />
                  <span>{s.name || s.email}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button className="action-btn" onClick={handleCreateTask} disabled={isCreating || !taskTitle || !taskDueDate || assignees.length === 0}>
              <i className="ph ph-plus"></i>
              {isCreating ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </div>
      </div>

      <div className="tasks-controls">
        <div className="search-section">
          <div className="search-input-wrapper">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search students or assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="filter-section">
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

          <div className="status-filters">
            {filterOptions.map(option => (
              <button
                key={option.value}
                className={`filter-tab ${filter === option.value ? 'active' : ''}`}
                onClick={() => setFilter(option.value)}
              >
                {option.label}
                <span className="filter-count">{option.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="submissions-list">
        {filteredSubmissions.length > 0 ? (
          filteredSubmissions.map(submission => (
            <div key={submission.id} className="submission-card">
              <div className="submission-header">
                <div className="student-info">
                  <img 
                    src={submission.studentAvatar} 
                    alt={submission.studentName}
                    className="student-avatar"
                  />
                  <div className="student-details">
                    <h3>{submission.studentName}</h3>
                    <p className="course-name">{submission.courseName}</p>
                  </div>
                </div>

                <div className="submission-meta">
                  <div 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(submission.status, submission.isLate) }}
                  >
                    <i className={getStatusIcon(submission.status, submission.isLate)}></i>
                    <span>{submission.isLate ? 'Late' : submission.status}</span>
                  </div>
                  {submission.grade && (
                    <div 
                      className="grade-badge"
                      style={{ color: getGradeColor(submission.grade) }}
                    >
                      {submission.grade}%
                    </div>
                  )}
                </div>
              </div>

              <div className="submission-content">
                <div className="assignment-info">
                  <h4>{submission.assignmentTitle}</h4>
                  <div className="submission-timeline">
                    <div className="timeline-item">
                      <i className="fas fa-upload"></i>
                      <span>Submitted {getTimeAgo(submission.submittedAt)}</span>
                    </div>
                    <div className="timeline-item">
                      <i className="fas fa-calendar"></i>
                      <span>Due {new Date(submission.dueDate).toLocaleDateString()}</span>
                    </div>
                    {submission.attempts > 1 && (
                      <div className="timeline-item">
                        <i className="fas fa-redo"></i>
                        <span>Attempt #{submission.attempts}</span>
                      </div>
                    )}
                  </div>
                </div>

                {submission.files.length > 0 && (
                  <div className="submission-files">
                    <h5>Submitted Files:</h5>
                    <div className="files-list">
                      {submission.files.map((file, index) => (
                        <div key={index} className="file-item">
                          <i className={getFileTypeIcon(file.type)}></i>
                          <span className="file-name">{file.name}</span>
                          <span className="file-size">{file.size}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {submission.comments && (
                  <div className="student-comments">
                    <h5>Student Comments:</h5>
                    <p>"{submission.comments}"</p>
                  </div>
                )}

                {submission.teacherFeedback && (
                  <div className="teacher-feedback">
                    <h5>Your Feedback:</h5>
                    <p>"{submission.teacherFeedback}"</p>
                  </div>
                )}
              </div>

              <div className="submission-actions">
                <button 
                  className="action-btn view"
                  onClick={() => handleViewSubmission(submission)}
                >
                  <i className="fas fa-eye"></i>
                  View Details
                </button>
                
                {submission.status === 'pending' && (
                  <button 
                    className="action-btn grade"
                    onClick={() => handleGradeSubmission(submission)}
                  >
                    <i className="fas fa-graduation-cap"></i>
                    Grade Now
                  </button>
                )}
                
                <button className="action-btn download">
                  <i className="fas fa-download"></i>
                  Download
                </button>
                
                <button className="action-btn message">
                  <i className="fas fa-comment"></i>
                  Message
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-submissions">
            <div className="empty-icon">
              <i className="fas fa-clipboard-list"></i>
            </div>
            <h3>No submissions found</h3>
            <p>No submissions match your current filters</p>
          </div>
        )}
      </div>

      {showSubmissionModal && selectedSubmission && (
        <TeacherSubmissionModal
          submission={selectedSubmission}
          onClose={() => {
            setShowSubmissionModal(false)
            setSelectedSubmission(null)
          }}
          onGrade={(grade, feedback) => {
            console.log('Grade submission:', grade, feedback)
            setShowSubmissionModal(false)
            setSelectedSubmission(null)
          }}
        />
      )}
    </div>
  )
}

export default TeacherTasksPage
