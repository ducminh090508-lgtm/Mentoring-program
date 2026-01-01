import { useState, useEffect } from 'react'

const TeacherCreateSessionModal = ({ session, timeSlot, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    course: '',
    type: 'lecture',
    startTime: '',
    endTime: '',
    room: '',
    students: '',
    description: '',
    materials: [],
    color: '#4CAF50',
    isRecurring: false,
    recurrencePattern: 'weekly',
    recurrenceEnd: ''
  })

  const [errors, setErrors] = useState({})
  const [materialInput, setMaterialInput] = useState('')

  useEffect(() => {
    if (session) {
      // Editing existing session
      setFormData({
        title: session.title || '',
        course: session.course || '',
        type: session.type || 'lecture',
        startTime: formatDateTimeLocal(session.startTime),
        endTime: formatDateTimeLocal(session.endTime),
        room: session.room || '',
        students: session.students || '',
        description: session.description || '',
        materials: session.materials || [],
        color: session.color || '#4CAF50',
        isRecurring: session.isRecurring || false,
        recurrencePattern: session.recurrencePattern || 'weekly',
        recurrenceEnd: session.recurrenceEnd || ''
      })
    } else if (timeSlot) {
      // Creating new session with pre-filled time
      setFormData(prev => ({
        ...prev,
        startTime: formatDateTimeLocal(timeSlot.startTime),
        endTime: formatDateTimeLocal(timeSlot.endTime)
      }))
    }
  }, [session, timeSlot])

  const formatDateTimeLocal = (dateString) => {
    const date = new Date(dateString)
    const offset = date.getTimezoneOffset()
    const localDate = new Date(date.getTime() - (offset * 60 * 1000))
    return localDate.toISOString().slice(0, 16)
  }

  const sessionTypes = [
    { value: 'lecture', label: 'Lecture', icon: 'fas fa-chalkboard-teacher', color: '#4CAF50' },
    { value: 'lab', label: 'Lab Session', icon: 'fas fa-laptop-code', color: '#2196F3' },
    { value: 'office_hours', label: 'Office Hours', icon: 'fas fa-user-clock', color: '#FF9800' },
    { value: 'meeting', label: 'Meeting', icon: 'fas fa-users', color: '#9C27B0' },
    { value: 'workshop', label: 'Workshop', icon: 'fas fa-tools', color: '#607D8B' }
  ]

  const courses = [
    'JavaScript Fundamentals',
    'React Development',
    'Database Design',
    'Python Programming',
    'Data Structures',
    'Web Development'
  ]

  const rooms = [
    'Room 101',
    'Room 102',
    'Room 203',
    'Computer Lab',
    'Conference Room',
    'Office 205',
    'Auditorium'
  ]

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

    // Auto-update color based on session type
    if (field === 'type') {
      const selectedType = sessionTypes.find(type => type.value === value)
      if (selectedType) {
        setFormData(prev => ({
          ...prev,
          color: selectedType.color
        }))
      }
    }
  }

  const handleAddMaterial = () => {
    if (materialInput.trim()) {
      setFormData(prev => ({
        ...prev,
        materials: [...prev.materials, materialInput.trim()]
      }))
      setMaterialInput('')
    }
  }

  const handleRemoveMaterial = (index) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Session title is required'
    }

    if (!formData.course.trim()) {
      newErrors.course = 'Course is required'
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

    if (!formData.room.trim()) {
      newErrors.room = 'Room is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const sessionData = {
      ...formData,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
      students: parseInt(formData.students) || 0
    }

    onSave(sessionData)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-session-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-section">
            <h2>{session ? 'Edit Session' : 'Create New Session'}</h2>
            <p>{session ? 'Update session details' : 'Add a new session to your schedule'}</p>
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
                  Session Title *
                </label>
                <input
                  type="text"
                  id="title"
                  className={`form-input ${errors.title ? 'error' : ''}`}
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter session title..."
                />
                {errors.title && <span className="error-message">{errors.title}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="course" className="form-label">
                  Course *
                </label>
                <select
                  id="course"
                  className={`form-select ${errors.course ? 'error' : ''}`}
                  value={formData.course}
                  onChange={(e) => handleInputChange('course', e.target.value)}
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
                {errors.course && <span className="error-message">{errors.course}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="type" className="form-label">
                  Session Type
                </label>
                <select
                  id="type"
                  className="form-select"
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                >
                  {sessionTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
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
                <label htmlFor="room" className="form-label">
                  Room *
                </label>
                <select
                  id="room"
                  className={`form-select ${errors.room ? 'error' : ''}`}
                  value={formData.room}
                  onChange={(e) => handleInputChange('room', e.target.value)}
                >
                  <option value="">Select a room</option>
                  {rooms.map(room => (
                    <option key={room} value={room}>
                      {room}
                    </option>
                  ))}
                </select>
                {errors.room && <span className="error-message">{errors.room}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="students" className="form-label">
                  Expected Students
                </label>
                <input
                  type="number"
                  id="students"
                  className="form-input"
                  value={formData.students}
                  onChange={(e) => handleInputChange('students', e.target.value)}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

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
                  placeholder="Add session description, agenda, or notes..."
                  rows={3}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label className="form-label">Materials</label>
                <div className="materials-input">
                  <input
                    type="text"
                    value={materialInput}
                    onChange={(e) => setMaterialInput(e.target.value)}
                    placeholder="Add material (e.g., slides.pdf, homework.js)"
                    className="form-input"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddMaterial()
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddMaterial}
                    className="add-material-btn"
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
                {formData.materials.length > 0 && (
                  <div className="materials-list">
                    {formData.materials.map((material, index) => (
                      <div key={index} className="material-item">
                        <span>{material}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMaterial(index)}
                          className="remove-material-btn"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Session Color</label>
                <div className="color-preview" style={{ backgroundColor: formData.color }}>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    className="color-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Recurring Session</label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isRecurring}
                      onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
                    />
                    <span className="checkbox-text">Repeat this session</span>
                  </label>
                  {formData.isRecurring && (
                    <div className="recurrence-options">
                      <select
                        className="form-select small"
                        value={formData.recurrencePattern}
                        onChange={(e) => handleInputChange('recurrencePattern', e.target.value)}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                      <input
                        type="date"
                        className="form-input small"
                        value={formData.recurrenceEnd}
                        onChange={(e) => handleInputChange('recurrenceEnd', e.target.value)}
                        placeholder="End date"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-actions">
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
                {session ? 'Update Session' : 'Create Session'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default TeacherCreateSessionModal
