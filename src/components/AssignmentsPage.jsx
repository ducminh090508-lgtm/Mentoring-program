import { useState, useEffect } from 'react'
import QuickSubmissionModal from './QuickSubmissionModal'
import { useAuth } from '../context/AuthContext'
import { listTasksForStudent, submitTask } from '../services/taskService'

const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState([])
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [sortBy, setSortBy] = useState('dueDate')

  const { user } = useAuth()
  useEffect(() => {
    const load = async () => {
      if (!user?.uid) return
      const list = await listTasksForStudent({ studentId: user.uid })
      // normalize to existing UI fields (provide defaults if missing)
      const normalized = list.map(t => ({
        id: t.id,
        title: t.title,
        course: t.course || 'Course',
        description: t.description || '',
        dueDate: (t.dueDate && new Date(t.dueDate.seconds ? t.dueDate.seconds*1000 : t.dueDate).toISOString().slice(0,10)) || new Date().toISOString().slice(0,10),
        status: 'pending',
        priority: 'medium',
        points: t.points || 100,
        submissionType: t.submissionType || 'file',
        estimatedTime: t.estimatedTime || '1-2 hours',
        requirements: t.requirements || [],
        progress: 0
      }))
      setAssignments(normalized)
    }
    load()
  }, [user])

  const filteredAssignments = assignments.filter(assignment => {
    const matchesFilter = filter === 'all' || assignment.status === filter
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.course.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const sortedAssignments = [...filteredAssignments].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        return new Date(a.dueDate) - new Date(b.dueDate)
      case 'priority':
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      case 'course':
        return a.course.localeCompare(b.course)
      case 'points':
        return b.points - a.points
      default:
        return 0
    }
  })

  const handleQuickSubmit = (assignment) => {
    setSelectedAssignment(assignment)
    setShowSubmissionModal(true)
  }

  const handleSubmissionComplete = async (assignmentId, submissionData) => {
    setAssignments(prev => prev.map(assignment => 
      assignment.id === assignmentId 
        ? { 
            ...assignment, 
            status: 'completed', 
            progress: 100,
            submittedDate: new Date().toISOString().split('T')[0]
          }
        : assignment
    ))
    await submitTask({ taskId: assignmentId, studentId: user.uid, payload: submissionData })
    setShowSubmissionModal(false)
    setSelectedAssignment(null)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'var(--status-active)'
      case 'in_progress': return '#FF9800'
      case 'pending': return '#FF6B6B'
      case 'not_started': return 'var(--status-inactive)'
      default: return 'var(--status-inactive)'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#FF6B6B'
      case 'high': return '#FF9800'
      case 'medium': return '#2196F3'
      case 'low': return 'var(--status-inactive)'
      default: return 'var(--status-inactive)'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'Overdue'
    if (diffDays === 0) return 'Due today'
    if (diffDays === 1) return 'Due tomorrow'
    return `Due in ${diffDays} days`
  }

  const getFilterCounts = () => {
    return {
      all: assignments.length,
      pending: assignments.filter(a => a.status === 'pending').length,
      in_progress: assignments.filter(a => a.status === 'in_progress').length,
      not_started: assignments.filter(a => a.status === 'not_started').length,
      completed: assignments.filter(a => a.status === 'completed').length
    }
  }

  const filterCounts = getFilterCounts()

  return (
    <div className="assignments-page">
      <div className="assignments-header">
        <div className="header-content">
          <h1>Assignments</h1>
          <p>Manage your coursework and track submission deadlines</p>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <span className="stat-number">{assignments.filter(a => a.status !== 'completed').length}</span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{assignments.filter(a => a.status === 'completed').length}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{assignments.reduce((sum, a) => sum + (a.points || 0), 0)}</span>
            <span className="stat-label">Total Points</span>
          </div>
        </div>
      </div>

      <div className="assignments-controls">
        <div className="search-section">
          <div className="search-input">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-section">
          <div className="filter-tabs">
            {[
              { key: 'all', label: 'All', count: filterCounts.all },
              { key: 'pending', label: 'Pending', count: filterCounts.pending },
              { key: 'in_progress', label: 'In Progress', count: filterCounts.in_progress },
              { key: 'not_started', label: 'Not Started', count: filterCounts.not_started },
              { key: 'completed', label: 'Completed', count: filterCounts.completed }
            ].map(tab => (
              <button
                key={tab.key}
                className={`filter-tab ${filter === tab.key ? 'active' : ''}`}
                onClick={() => setFilter(tab.key)}
              >
                {tab.label}
                <span className="tab-count">{tab.count}</span>
              </button>
            ))}
          </div>

          <div className="sort-section">
            <label htmlFor="sort-select">Sort by:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="course">Course</option>
              <option value="points">Points</option>
            </select>
          </div>
        </div>
      </div>

      <div className="assignments-grid">
        {sortedAssignments.map(assignment => (
          <div key={assignment.id} className="assignment-card">
            <div className="assignment-header">
              <div className="assignment-title-section">
                <h3>{assignment.title}</h3>
                <span className="assignment-course">{assignment.course}</span>
              </div>
              <div className="assignment-badges">
                <span 
                  className="priority-badge"
                  style={{ backgroundColor: getPriorityColor(assignment.priority) }}
                >
                  {assignment.priority}
                </span>
                <span className="points-badge">{assignment.points} pts</span>
              </div>
            </div>

            <div className="assignment-body">
              <p className="assignment-description">{assignment.description}</p>
              
              <div className="assignment-meta">
                <div className="meta-item">
                  <i className="fas fa-clock"></i>
                  <span>{assignment.estimatedTime}</span>
                </div>
                <div className="meta-item">
                  <i className="fas fa-calendar-alt"></i>
                  <span className={formatDate(assignment.dueDate).includes('Overdue') ? 'overdue' : ''}>
                    {formatDate(assignment.dueDate)}
                  </span>
                </div>
                <div className="meta-item">
                  <i className="fas fa-file-alt"></i>
                  <span>{assignment.submissionType}</span>
                </div>
              </div>

              {assignment.requirements && (
                <div className="assignment-requirements">
                  <h4>Requirements:</h4>
                  <ul>
                    {assignment.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="assignment-progress">
                <div className="progress-header">
                  <span>Progress</span>
                  <span>{assignment.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-indicator"
                    style={{ width: `${assignment.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="assignment-footer">
              <div className="assignment-status">
                <span 
                  className="status-indicator"
                  style={{ backgroundColor: getStatusColor(assignment.status) }}
                ></span>
                <span className="status-text">
                  {assignment.status.replace('_', ' ').toUpperCase()}
                </span>
                {assignment.grade && (
                  <span className="grade-display">Grade: {assignment.grade}%</span>
                )}
              </div>

              <div className="assignment-actions">
                {assignment.status === 'completed' ? (
                  <button className="action-btn view-btn">
                    <i className="fas fa-eye"></i>
                    View Submission
                  </button>
                ) : (
                  <>
                    <button className="action-btn work-btn">
                      <i className="fas fa-play"></i>
                      {assignment.status === 'not_started' ? 'Start' : 'Continue'}
                    </button>
                    <button 
                      className="action-btn submit-btn"
                      onClick={() => handleQuickSubmit(assignment)}
                      disabled={assignment.progress < 50}
                    >
                      <i className="fas fa-upload"></i>
                      Quick Submit
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedAssignments.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <i className="fas fa-tasks"></i>
          </div>
          <h3>No assignments found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      )}

      {showSubmissionModal && selectedAssignment && (
        <QuickSubmissionModal
          assignment={selectedAssignment}
          onClose={() => {
            setShowSubmissionModal(false)
            setSelectedAssignment(null)
          }}
          onSubmit={handleSubmissionComplete}
        />
      )}
    </div>
  )
}

export default AssignmentsPage
