import { useState, useEffect } from 'react'

const QuickSubmissionModal = ({ assignment, onClose, onSubmit }) => {
  const [submissionData, setSubmissionData] = useState({
    files: [],
    textContent: '',
    comments: '',
    submissionType: assignment.submissionType
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleFileUpload = (files) => {
    const fileArray = Array.from(files)
    setSubmissionData(prev => ({
      ...prev,
      files: [...prev.files, ...fileArray]
    }))
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  const removeFile = (index) => {
    setSubmissionData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate submission delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    onSubmit(assignment.id, submissionData)
    setIsSubmitting(false)
  }

  const canSubmit = () => {
    if (assignment.submissionType === 'file') {
      return submissionData.files.length > 0
    }
    if (assignment.submissionType === 'text') {
      return submissionData.textContent.trim().length > 0
    }
    if (assignment.submissionType === 'quiz') {
      return true // Quiz would have its own validation
    }
    return false
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="submission-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-section">
            <h2>Quick Submit</h2>
            <p>{assignment.title}</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {assignment.submissionType === 'file' && (
              <div className="file-upload-section">
                <label className="section-label">Upload Files</label>
                <div 
                  className={`file-drop-zone ${dragActive ? 'drag-active' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="drop-zone-content">
                    <i className="fas fa-cloud-upload-alt"></i>
                    <p>Drag & drop files here or click to browse</p>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="file-input"
                      accept=".pdf,.doc,.docx,.txt,.zip,.js,.html,.css,.py,.java"
                    />
                  </div>
                </div>

                {submissionData.files.length > 0 && (
                  <div className="uploaded-files">
                    <h4>Uploaded Files ({submissionData.files.length})</h4>
                    <div className="files-list">
                      {submissionData.files.map((file, index) => (
                        <div key={index} className="file-item">
                          <div className="file-info">
                            <i className="fas fa-file"></i>
                            <div className="file-details">
                              <span className="file-name">{file.name}</span>
                              <span className="file-size">{formatFileSize(file.size)}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="remove-file"
                            onClick={() => removeFile(index)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {assignment.submissionType === 'text' && (
              <div className="text-submission-section">
                <label htmlFor="text-content" className="section-label">
                  Your Submission
                </label>
                <textarea
                  id="text-content"
                  className="text-submission"
                  placeholder="Enter your submission text here..."
                  value={submissionData.textContent}
                  onChange={(e) => setSubmissionData(prev => ({
                    ...prev,
                    textContent: e.target.value
                  }))}
                  rows={10}
                />
                <div className="character-count">
                  {submissionData.textContent.length} characters
                </div>
              </div>
            )}

            {assignment.submissionType === 'quiz' && (
              <div className="quiz-submission-section">
                <div className="quiz-info">
                  <i className="fas fa-info-circle"></i>
                  <p>This will redirect you to the quiz interface where you can complete and submit your answers.</p>
                </div>
              </div>
            )}

            <div className="comments-section">
              <label htmlFor="comments" className="section-label">
                Additional Comments (Optional)
              </label>
              <textarea
                id="comments"
                className="comments-input"
                placeholder="Add any comments or notes for your instructor..."
                value={submissionData.comments}
                onChange={(e) => setSubmissionData(prev => ({
                  ...prev,
                  comments: e.target.value
                }))}
                rows={3}
              />
            </div>

            <div className="submission-info">
              <div className="info-grid">
                <div className="info-item">
                  <i className="fas fa-calendar"></i>
                  <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="info-item">
                  <i className="fas fa-star"></i>
                  <span>Worth: {assignment.points} points</span>
                </div>
                <div className="info-item">
                  <i className="fas fa-clock"></i>
                  <span>Estimated: {assignment.estimatedTime}</span>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="action-btn cancel-btn"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="action-btn submit-btn"
                disabled={!canSubmit() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    Submit Assignment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default QuickSubmissionModal
