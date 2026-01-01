import { useEffect, useState } from 'react'
import TeacherScheduleCalendar from './TeacherScheduleCalendar'
import TeacherCreateSessionModal from './TeacherCreateSessionModal'
import { useAuth } from '../context/AuthContext'
import { subscribePersonalSlots } from '../services/scheduleService'
import { subscribePairedSlotsForTeacher } from '../services/adminService'

const TeacherSchedulePage = () => {
  const [currentView, setCurrentView] = useState('week')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [sessions, setSessions] = useState([])
  const [personalSlots, setPersonalSlots] = useState([])
  const [pairedSlots, setPairedSlots] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedSession, setSelectedSession] = useState(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user?.uid) return
    const unsubPersonal = subscribePersonalSlots({ ownerId: user.uid }, (slots) => setPersonalSlots(slots || []))
    const unsubPaired = subscribePairedSlotsForTeacher(user.uid, (slots) => setPairedSlots(slots || []))
    return () => { unsubPersonal && unsubPersonal(); unsubPaired && unsubPaired() }
  }, [user])

  useEffect(() => {
    const toSession = (slot, source) => {
      // Build sessions for the selected week only; TeacherScheduleCalendar handles month grid expansion
      const dayNames = ['sun','mon','tue','wed','thu','fri','sat']
      const idx = typeof slot.day === 'number' ? slot.day : dayNames.indexOf(String(slot.day||'').toLowerCase().slice(0,3))
      const base = new Date(selectedDate)
      const startOfWeek = new Date(base)
      startOfWeek.setDate(base.getDate() - base.getDay())
      const onDate = new Date(startOfWeek)
      onDate.setDate(startOfWeek.getDate() + (idx >= 0 ? idx : 0))
      const [h='09', m='00'] = (slot.time || '09:00').split(':')
      onDate.setHours(parseInt(h,10), parseInt(m,10), 0, 0)
      const end = new Date(onDate)
      end.setHours(onDate.getHours() + 1)
      return {
        id: `${source}:${slot.id}:${onDate.toISOString()}`,
        title: slot.subject || 'Session',
        course: slot.subject || 'Session',
        type: 'lecture',
        startTime: onDate.toISOString(),
        endTime: end.toISOString(),
        room: slot.room || 'TBD',
        students: slot.students || 0,
        description: '',
        materials: [],
        status: 'scheduled',
        color: '#4CAF50'
      }
    }
    const combined = [...(personalSlots||[]).map(s => ({...s, __source:'personal'})), ...(pairedSlots||[]).map(s => ({...s, __source:'paired'}))]
    const dedup = new Map()
    combined.forEach(s => {
      const key = `${(s.day||'')}|${(s.time||'')}|${(s.subject||'')}|${s.__source}`
      if (!dedup.has(key)) dedup.set(key, s)
    })
    const result = Array.from(dedup.values()).map(s => toSession(s, s.__source))
    setSessions(result)
  }, [personalSlots, pairedSlots, selectedDate])

  const handleCreateSession = (sessionData) => {
    const newSession = {
      ...sessionData,
      id: Date.now(),
      status: 'scheduled'
    }
    setSessions(prev => [...prev, newSession])
    setShowCreateModal(false)
    setSelectedTimeSlot(null)
  }

  const handleEditSession = (session) => {
    setSelectedSession(session)
    setShowCreateModal(true)
  }

  const handleDeleteSession = (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      setSessions(prev => prev.filter(session => session.id !== sessionId))
    }
  }

  const handleTimeSlotClick = (date, time) => {
    const startTime = new Date(date)
    startTime.setHours(time)
    const endTime = new Date(startTime)
    endTime.setHours(time + 1, 30) // Default 1.5 hour sessions

    setSelectedTimeSlot({
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    })
    setSelectedSession(null)
    setShowCreateModal(true)
  }

  const getSessionTypeIcon = (type) => {
    switch (type) {
      case 'lecture': return 'fas fa-chalkboard-teacher'
      case 'lab': return 'fas fa-laptop-code'
      case 'office_hours': return 'fas fa-user-clock'
      case 'meeting': return 'fas fa-users'
      case 'workshop': return 'fas fa-tools'
      default: return 'fas fa-calendar'
    }
  }


  return (
    <div className="teacher-schedule-page">
      <div className="schedule-header">
        <div className="header-content">
          <h1>Schedule Management</h1>
          <p>Create and manage your weekly teaching schedule</p>
        </div>
        <div className="header-actions">
          <button 
            className="quick-create-btn"
            onClick={() => {
              setSelectedSession(null)
              setSelectedTimeSlot(null)
              setShowCreateModal(true)
            }}
          >
            <i className="fas fa-plus"></i>
            Create Session
          </button>
          <button className="import-schedule-btn">
            <i className="fas fa-upload"></i>
            Import Schedule
          </button>
        </div>
      </div>

      {/* Summary stat cards removed as requested */}

      <div className="schedule-controls">
        <div className="view-selector">
          <button 
            className={`view-btn ${currentView === 'week' ? 'active' : ''}`}
            onClick={() => setCurrentView('week')}
          >
            <i className="fas fa-calendar-week"></i>
            Week View
          </button>
          <button 
            className={`view-btn ${currentView === 'month' ? 'active' : ''}`}
            onClick={() => setCurrentView('month')}
          >
            <i className="fas fa-calendar-alt"></i>
            Month View
          </button>
        </div>

        <div className="date-navigation">
          <button 
            className="nav-btn"
            onClick={() => {
              const newDate = new Date(selectedDate)
              if (currentView === 'week') {
                newDate.setDate(newDate.getDate() - 7)
              } else {
                newDate.setMonth(newDate.getMonth() - 1)
              }
              setSelectedDate(newDate)
            }}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          
          <div className="current-period">
            {currentView === 'week' && `Week of ${selectedDate.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}`}
            {currentView === 'month' && selectedDate.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long' 
            })}
          </div>
          
          <button 
            className="nav-btn"
            onClick={() => {
              const newDate = new Date(selectedDate)
              if (currentView === 'week') {
                newDate.setDate(newDate.getDate() + 7)
              } else {
                newDate.setMonth(newDate.getMonth() + 1)
              }
              setSelectedDate(newDate)
            }}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>

        <div className="schedule-actions">
          <button className="action-btn">
            <i className="fas fa-download"></i>
            Export
          </button>
          <button className="action-btn">
            <i className="fas fa-print"></i>
            Print
          </button>
          <button 
            className="today-btn"
            onClick={() => setSelectedDate(new Date())}
          >
            Today
          </button>
        </div>
      </div>

      <div className="schedule-content">
        <div className="schedule-main">
          <TeacherScheduleCalendar
            view={currentView}
            selectedDate={selectedDate}
            sessions={sessions}
            onSessionClick={handleEditSession}
            onTimeSlotClick={handleTimeSlotClick}
            onSessionDelete={handleDeleteSession}
          />
        </div>

        <div className="schedule-sidebar">
          <div className="quick-actions-panel">
            <h3>Quick Actions</h3>
            <div className="quick-actions-grid">
              <button 
                className="quick-action"
                onClick={() => {
                  setSelectedTimeSlot({
                    startTime: new Date().toISOString(),
                    endTime: new Date(Date.now() + 90 * 60 * 1000).toISOString()
                  })
                  setShowCreateModal(true)
                }}
              >
                <i className="fas fa-chalkboard-teacher"></i>
                <span>New Lecture</span>
              </button>
              <button 
                className="quick-action"
                onClick={() => {
                  setSelectedTimeSlot({
                    startTime: new Date().toISOString(),
                    endTime: new Date(Date.now() + 90 * 60 * 1000).toISOString()
                  })
                  setShowCreateModal(true)
                }}
              >
                <i className="fas fa-laptop-code"></i>
                <span>New Lab</span>
              </button>
              <button 
                className="quick-action"
                onClick={() => {
                  setSelectedTimeSlot({
                    startTime: new Date().toISOString(),
                    endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString()
                  })
                  setShowCreateModal(true)
                }}
              >
                <i className="fas fa-user-clock"></i>
                <span>Office Hours</span>
              </button>
              <button className="quick-action">
                <i className="fas fa-users"></i>
                <span>Meeting</span>
              </button>
            </div>
          </div>

          <div className="session-types-legend">
            <h3>Session Types</h3>
            <div className="legend-items">
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#4CAF50' }}></div>
                <i className="fas fa-chalkboard-teacher"></i>
                <span>Lectures</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#2196F3' }}></div>
                <i className="fas fa-laptop-code"></i>
                <span>Lab Sessions</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#FF9800' }}></div>
                <i className="fas fa-user-clock"></i>
                <span>Office Hours</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#9C27B0' }}></div>
                <i className="fas fa-users"></i>
                <span>Meetings</span>
              </div>
            </div>
          </div>

          <div className="upcoming-sessions">
            <h3>Next Sessions</h3>
            <div className="sessions-preview">
              {sessions
                .filter(session => new Date(session.startTime) > new Date())
                .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                .slice(0, 3)
                .map(session => (
                  <div key={session.id} className="session-preview">
                    <div 
                      className="session-indicator"
                      style={{ backgroundColor: session.color }}
                    >
                      <i className={getSessionTypeIcon(session.type)}></i>
                    </div>
                    <div className="session-info">
                      <h4>{session.title}</h4>
                      <p>{session.course}</p>
                      <div className="session-time">
                        {new Date(session.startTime).toLocaleString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <TeacherCreateSessionModal
          session={selectedSession}
          timeSlot={selectedTimeSlot}
          onClose={() => {
            setShowCreateModal(false)
            setSelectedSession(null)
            setSelectedTimeSlot(null)
          }}
          onSave={handleCreateSession}
        />
      )}
    </div>
  )
}

export default TeacherSchedulePage
