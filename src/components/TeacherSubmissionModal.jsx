import { useState } from 'react'

const TeacherSubmissionModal = ({ submission, onClose, onGrade }) => {
  const [grade, setGrade] = useState(submission.grade || '')
  const [feedback, setFeedback] = useState(submission.teacherFeedback || '')
  const [rubricScores, setRubricScores] = useState({})

  const rubricCriteria = [
    { id: 'functionality', name: 'Functionality', maxPoints: 25, description: 'Code works as expected' },
    { id: 'quality', name: 'Code Quality', maxPoints: 25, description: 'Clean, readable, well-structured code' },
    { id: 'requirements', name: 'Requirements', maxPoints: 25, description: 'Meets all assignment requirements' },
    { id: 'creativity', name: 'Creativity', maxPoints: 25, description: 'Extra features or innovative solutions' }
  ]

  const handleRubricChange = (criteriaId, score) => {
    setRubricScores(prev => ({
      ...prev,
      [criteriaId]: score
    }))
    
    // Calculate total grade
    const newScores = { ...rubricScores, [criteriaId]: score }
    const total = Object.values(newScores).reduce((sum, score) => sum + (parseInt(score) || 0), 0)
    setGrade(total)
  }

  const handleSave = () => {
    onGrade(grade, feedback)
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="submission-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-section">
            <h2>Grade Submission</h2>
            <p>{submission.assignmentTitle} - {submission.studentName}</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="submission-details">
            <div className="submission-info">
              <h3>Submission Details</h3>
              <div className="info-grid">
                <div className="info-item">
                  <strong>Student:</strong> {submission.studentName}
                </div>
                <div className="info-item">
                  <strong>Course:</strong> {submission.courseName}
                </div>
                <div className="info-item">
                  <strong>Submitted:</strong> {new Date(submission.submittedAt).toLocaleString()}
                </div>
                <div className="info-item">
                  <strong>Attempt:</strong> #{submission.attempts}
                </div>
              </div>
            </div>

            {submission.files.length > 0 && (
              <div className="submission-files">
                <h3>Submitted Files</h3>
                <div className="files-list">
                  {submission.files.map((file, index) => (
                    <div key={index} className="file-item">
                      <i className={getFileTypeIcon(file.type)}></i>
                      <div className="file-info">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">{file.size}</span>
                      </div>
                      <button className="file-action">
                        <i className="fas fa-download"></i>
                      </button>
                      <button className="file-action">
                        <i className="fas fa-eye"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {submission.comments && (
              <div className="student-comments">
                <h3>Student Comments</h3>
                <div className="comments-box">
                  <p>"{submission.comments}"</p>
                </div>
              </div>
            )}
          </div>

          <div className="grading-section">
            <h3>Grading Rubric</h3>
            <div className="rubric-grid">
              {rubricCriteria.map(criteria => (
                <div key={criteria.id} className="rubric-item">
                  <div className="rubric-header">
                    <h4>{criteria.name}</h4>
                    <span className="max-points">/{criteria.maxPoints}</span>
                  </div>
                  <p className="rubric-description">{criteria.description}</p>
                  <input
                    type="number"
                    min="0"
                    max={criteria.maxPoints}
                    value={rubricScores[criteria.id] || ''}
                    onChange={(e) => handleRubricChange(criteria.id, e.target.value)}
                    className="rubric-score-input"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>

            <div className="total-grade">
              <h3>Total Grade</h3>
              <div className="grade-input-wrapper">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="total-grade-input"
                />
                <span className="grade-suffix">/ 100</span>
              </div>
            </div>

            <div className="feedback-section">
              <h3>Feedback</h3>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide constructive feedback to help the student improve..."
                className="feedback-textarea"
                rows={5}
              />
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="action-btn cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="action-btn save-draft">
            Save Draft
          </button>
          <button className="action-btn submit" onClick={handleSave}>
            Submit Grade
          </button>
        </div>
      </div>
    </div>
  )
}

export default TeacherSubmissionModal
