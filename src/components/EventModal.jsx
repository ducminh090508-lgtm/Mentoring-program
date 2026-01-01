import { useState, useEffect } from 'react'

const EventModal = ({ event, isCreating, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'study',
    startTime: '',
    endTime: '',
    description: '',
    location: '',
    color: '#4CAF50',
    course: '',
    instructor: '',
    priority: 'medium',
    isRecurring: false,
    recurrencePattern: 'weekly'
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (event && !isCreating) {
      setFormData({
        title: event.title || '',
        type: event.type || 'study',
        startTime: event.startTime ? formatDateTimeLocal(event.startTime) : '',
        endTime: event.endTime ? formatDateTimeLocal(event.endTime) : '',
        description: event.description || '',
        location: event.location || '',
        color: event.color || '#4CAF50',
        course: event.course || '',
        instructor: event.instructor || '',
        priority: event.priority || 'medium',
        isRecurring: event.isRecurring || false,
        recurrencePattern: event.recurrencePattern || 'weekly'
      })
    } else if (event && isCreating && event.startTime) {
      // Pre-fill with clicked time slot
      setFormData(prev => ({
        ...prev,
        startTime: formatDateTimeLocal(event.startTime),
        endTime: formatDateTimeLocal(event.endTime)
      }))
    }
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [event, isCreating])

  const formatDateTimeLocal = (dateString) => {
    const date = new Date(dateString)
    const offset = date.getTimezoneOffset()
    const localDate = new Date(date.getTime() - (offset * 60 * 1000))
    return localDate.toISOString().slice(0, 16)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }))
    }

    // Auto-update color based on event type
    if (field === 'type') {
      const typeColors = {
        class: '#4CAF50',
        study: '#2196F3',
        deadline: '#FF6B6B',
        office_hours: '#FF9800'
      }
      setFormData(prev => ({
        ...prev,
        color: typeColors[value] || '#4CAF50'
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required'
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required'
    }

    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime)
      const end = new Date(formData.endTime)
      
      if (end <= start) {
        newErrors.endTime = 'End time must be after start time'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const eventData = {
      ...formData,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString()
    }

    onSave(eventData)
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      onDelete(event.id)
      onClose()
    }
  }

  const eventTypes = [
    { value: 'class', label: 'Class', icon: 'fas fa-chalkboard-teacher' },
    { value: 'study', label: 'Study Session', icon: 'fas fa-book-open' },
    { value: 'deadline', label: 'Deadline', icon: 'fas fa-exclamation-triangle' },
    { value: 'office_hours', label: 'Office Hours', icon: 'fas fa-user-clock' }
  ]

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'var(--status-inactive)' },
    { value: 'medium', label: 'Medium', color: '#2196F3' },
    { value: 'high', label: 'High', color: '#FF9800' },
    { value: 'urgent', label: 'Urgent', color: '#FF6B6B' }
  ]

  const colorOptions = [
    '#4CAF50', '#2196F3', '#FF6B6B', '#FF9800',
    '#9C27B0', '#607D8B', '#795548', '#E91E63'
  ]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="event-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-section">
            <h2>{isCreating ? 'Create New Event' : 'Edit Event'}</h2>
            <p>{isCreating ? 'Add a new event to your schedule' : 'Update event details'}</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="title" className="form-label">
                  Event Title *
                </label>
                <input
                  type="text"
                  id="title"
                  className={`form-input ${errors.title ? 'error' : ''}`}
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter event title..."
                />
                {errors.title && <span className="error-message">{errors.title}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type" className="form-label">
                  Event Type
                </label>
                <select
                  id="type"
                  className="form-select"
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                >
                  {eventTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="priority" className="form-label">
                  Priority
                </label>
                <select
                  id="priority"
                  className="form-select"
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                >
                  {priorityOptions.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startTime" className="form-label">
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  id="startTime"
                  className={`form-input ${errors.startTime ? 'error' : ''}`}
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                />
                {errors.startTime && <span className="error-message">{errors.startTime}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="endTime" className="form-label">
                  End Time *
                </label>
                <input
                  type="datetime-local"
                  id="endTime"
                  className={`form-input ${errors.endTime ? 'error' : ''}`}
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                />
                {errors.endTime && <span className="error-message">{errors.endTime}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="course" className="form-label">
                  Course
                </label>
                <input
                  type="text"
                  id="course"
                  className="form-input"
                  value={formData.course}
                  onChange={(e) => handleInputChange('course', e.target.value)}
                  placeholder="Course name..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="location" className="form-label">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  className="form-input"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Room, building, or online..."
                />
              </div>
            </div>

            {(formData.type === 'class' || formData.type === 'office_hours') && (
              <div className="form-row">
                <div className="form-group full-width">
                  <label htmlFor="instructor" className="form-label">
                    Instructor
                  </label>
                  <input
                    type="text"
                    id="instructor"
                    className="form-input"
                    value={formData.instructor}
                    onChange={(e) => handleInputChange('instructor', e.target.value)}
                    placeholder="Instructor name..."
                  />
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <textarea
                  id="description"
                  className="form-textarea"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Add event description, notes, or agenda..."
                  rows={3}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Event Color</label>
                <div className="color-picker">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${formData.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleInputChange('color', color)}
                    />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Recurring Event</label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isRecurring}
                      onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
                    />
                    <span className="checkbox-text">Repeat this event</span>
                  </label>
                  {formData.isRecurring && (
                    <select
                      className="form-select"
                      value={formData.recurrencePattern}
                      onChange={(e) => handleInputChange('recurrencePattern', e.target.value)}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              {!isCreating && (
                <button
                  type="button"
                  className="action-btn delete-btn"
                  onClick={handleDelete}
                >
                  <i className="fas fa-trash"></i>
                  Delete Event
                </button>
              )}
              <div className="primary-actions">
                <button
                  type="button"
                  className="action-btn cancel-btn"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="action-btn save-btn"
                >
                  <i className="fas fa-save"></i>
                  {isCreating ? 'Create Event' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EventModal
