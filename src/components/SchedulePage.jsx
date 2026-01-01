import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { subscribePersonalSlots } from '../services/scheduleService'
import { subscribePairedSlotsForStudent } from '../services/adminService'
import ScheduleCalendar from './ScheduleCalendar'
import EventModal from './EventModal'
import UpcomingEvents from './UpcomingEvents'
import ScheduleStats from './ScheduleStats'

const SchedulePage = () => {
  const [currentView, setCurrentView] = useState('week') // week, month, day
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [personalSlots, setPersonalSlots] = useState([])
  const [pairedSlots, setPairedSlots] = useState([])
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)
  const [userEvents, setUserEvents] = useState([])

  const { user } = useAuth()
  useEffect(() => {
    if (!user?.uid) return
    const unsubPersonal = subscribePersonalSlots({ ownerId: user.uid }, (slots) => setPersonalSlots(slots || []))
    const unsubPaired = subscribePairedSlotsForStudent(user.uid, (slots) => setPairedSlots(slots || []))
    return () => {
      unsubPersonal && unsubPersonal()
      unsubPaired && unsubPaired()
    }
  }, [user])

  // Load user-created events from localStorage when user is available
  useEffect(() => {
    if (!user?.uid) return
    try {
      const raw = localStorage.getItem(`userEvents_${user.uid}`)
      const parsed = raw ? JSON.parse(raw) : []
      setUserEvents(Array.isArray(parsed) ? parsed : [])
    } catch (err) {
      setUserEvents([])
    }
  }, [user])

  // Persist user-created events to localStorage whenever they change
  useEffect(() => {
    if (!user?.uid) return
    try {
      localStorage.setItem(`userEvents_${user.uid}`, JSON.stringify(userEvents))
    } catch (err) {
      // ignore storage errors
    }
  }, [userEvents, user])

  // Map weekday name/number to date within the current week of selectedDate
  const getDateForWeekday = (baseDate, dayValue) => {
    const dayNames = ['sun','mon','tue','wed','thu','fri','sat']
    let targetIndex
    if (typeof dayValue === 'number') {
      targetIndex = Math.max(0, Math.min(6, dayValue))
    } else if (typeof dayValue === 'string') {
      const norm = dayValue.trim().toLowerCase().slice(0,3)
      targetIndex = Math.max(0, dayNames.indexOf(norm))
    } else {
      targetIndex = baseDate.getDay()
    }
    const start = new Date(baseDate)
    const diff = start.getDay() - targetIndex
    start.setDate(start.getDate() - diff)
    start.setHours(0,0,0,0)
    return start
  }

  const normalizeDayToIndex = (dayValue) => {
    const dayNames = ['sun','mon','tue','wed','thu','fri','sat']
    if (typeof dayValue === 'number') return Math.max(0, Math.min(6, dayValue))
    if (typeof dayValue === 'string') {
      const norm = dayValue.trim().toLowerCase().slice(0,3)
      const idx = dayNames.indexOf(norm)
      return idx >= 0 ? idx : undefined
    }
    return undefined
  }

  const createEventForDate = (slot, onDate, sourceTag) => {
    const [h='09', m='00'] = (slot.time || '09:00').split(':')
    const start = new Date(onDate)
    start.setHours(parseInt(h,10), parseInt(m,10), 0, 0)
    const end = new Date(start)
    end.setHours(start.getHours() + 1)
    return {
      id: `${sourceTag}:${slot.id}:${start.toISOString()}`,
      title: slot.subject || 'Session',
      type: 'study',
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      description: typeof slot.day === 'string' ? slot.day : '',
      color: '#4CAF50'
    }
  }

  // Combine and dedupe whenever slots or selectedDate change
  useEffect(() => {
    const combined = [...(personalSlots||[]).map(s => ({...s, __source:'personal'})), ...(pairedSlots||[]).map(s => ({...s, __source:'paired'}))]
    const dedupSlots = new Map()
    combined.forEach(s => {
      const key = `${(s.day||'')}|${(s.time||'')}|${(s.subject||'')}|${s.__source}`
      if (!dedupSlots.has(key)) dedupSlots.set(key, s)
    })

    const result = []
    const byEventKey = new Map()

    if (currentView === 'month') {
      const year = selectedDate.getFullYear()
      const month = selectedDate.getMonth()
      const firstDay = new Date(year, month, 1)
      const startDate = new Date(firstDay)
      startDate.setDate(firstDay.getDate() - firstDay.getDay())
      for (let i = 0; i < 42; i++) {
        const dayDate = new Date(startDate)
        dayDate.setDate(startDate.getDate() + i)
        const dayIndex = dayDate.getDay()
        Array.from(dedupSlots.values()).forEach(s => {
          const slotDay = normalizeDayToIndex(s.day)
          if (slotDay === dayIndex) {
            const ev = createEventForDate(s, dayDate, s.__source)
            const key = `${dayDate.toDateString()}|${s.time}|${s.subject}|${s.__source}`
            if (!byEventKey.has(key)) { byEventKey.set(key, true); result.push(ev) }
          }
        })
      }
    } else {
      // week/day: use selected week only
      Array.from(dedupSlots.values()).forEach(s => {
        const when = getDateForWeekday(selectedDate, s.day)
        const ev = createEventForDate(s, when, s.__source)
        const key = `${when.toDateString()}|${s.time}|${s.subject}|${s.__source}`
        if (!byEventKey.has(key)) { byEventKey.set(key, true); result.push(ev) }
      })
    }

    setEvents(result)
  }, [personalSlots, pairedSlots, selectedDate, currentView])

  const handleCreateEvent = () => {
    setSelectedEvent(null)
    setIsCreatingEvent(true)
    setShowEventModal(true)
  }

  const handleEditEvent = (event) => {
    setSelectedEvent(event)
    setIsCreatingEvent(false)
    setShowEventModal(true)
  }

  const handleDeleteEvent = (eventId) => {
    setUserEvents(prev => prev.filter(event => event.id !== eventId))
  }

  const handleSaveEvent = (eventData) => {
    if (isCreatingEvent) {
      const newEvent = {
        ...eventData,
        id: `user:${Date.now()}`,
        source: 'user'
      }
      setUserEvents(prev => [...prev, newEvent])
    } else {
      const isEditingUserEvent = selectedEvent && (selectedEvent.source === 'user' || String(selectedEvent.id).startsWith('user:'))
      if (isEditingUserEvent) {
        setUserEvents(prev => prev.map(event => 
          event.id === selectedEvent.id ? { ...event, ...eventData } : event
        ))
      } else {
        // Editing a derived event creates a personal copy
        const newEvent = {
          ...eventData,
          id: `user:${Date.now()}`,
          source: 'user'
        }
        setUserEvents(prev => [...prev, newEvent])
      }
    }
    setShowEventModal(false)
    setSelectedEvent(null)
    setIsCreatingEvent(false)
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
  }

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(event => {
      const eventDate = new Date(event.startTime).toISOString().split('T')[0]
      return eventDate === dateStr
    })
  }

  // Combine derived schedule events with user-created events for display and stats
  const combinedEvents = [...events, ...userEvents]

  const getUpcomingEvents = () => {
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    return combinedEvents
      .filter(event => {
        const eventDate = new Date(event.startTime)
        return eventDate >= now && eventDate <= nextWeek
      })
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      .slice(0, 5)
  }

  const getWeeklyStats = () => {
    const now = new Date()
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)

    const weekEvents = combinedEvents.filter(event => {
      const eventDate = new Date(event.startTime)
      return eventDate >= weekStart && eventDate < weekEnd
    })

    const totalHours = weekEvents.reduce((total, event) => {
      const start = new Date(event.startTime)
      const end = new Date(event.endTime)
      return total + (end - start) / (1000 * 60 * 60)
    }, 0)

    const eventsByType = weekEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1
      return acc
    }, {})

    return {
      totalEvents: weekEvents.length,
      totalHours: Math.round(totalHours * 10) / 10,
      eventsByType
    }
  }

  return (
    <div className="schedule-page">
      <div className="schedule-header">
        <div className="header-content">
          <h1>Schedule</h1>
          <p>Manage your learning schedule and track your time</p>
        </div>
        <div className="header-actions">
          <button 
            className="create-event-btn"
            onClick={handleCreateEvent}
          >
            <i className="fas fa-plus"></i>
            New Event
          </button>
        </div>
      </div>

      <div className="schedule-controls">
        <div className="view-selector">
          <button 
            className={`view-btn ${currentView === 'day' ? 'active' : ''}`}
            onClick={() => setCurrentView('day')}
          >
            <i className="fas fa-calendar-day"></i>
            Day
          </button>
          <button 
            className={`view-btn ${currentView === 'week' ? 'active' : ''}`}
            onClick={() => setCurrentView('week')}
          >
            <i className="fas fa-calendar-week"></i>
            Week
          </button>
          <button 
            className={`view-btn ${currentView === 'month' ? 'active' : ''}`}
            onClick={() => setCurrentView('month')}
          >
            <i className="fas fa-calendar-alt"></i>
            Month
          </button>
        </div>

        <div className="date-navigation">
          <button 
            className="nav-btn"
            onClick={() => {
              const newDate = new Date(selectedDate)
              if (currentView === 'day') {
                newDate.setDate(newDate.getDate() - 1)
              } else if (currentView === 'week') {
                newDate.setDate(newDate.getDate() - 7)
              } else {
                newDate.setMonth(newDate.getMonth() - 1)
              }
              setSelectedDate(newDate)
            }}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          
          <div className="current-date">
            {currentView === 'day' && selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
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
              if (currentView === 'day') {
                newDate.setDate(newDate.getDate() + 1)
              } else if (currentView === 'week') {
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

        <button 
          className="today-btn"
          onClick={() => setSelectedDate(new Date())}
        >
          Today
        </button>
      </div>

      <div className="schedule-content">
        <div className="schedule-main">
          <ScheduleCalendar
            view={currentView}
            selectedDate={selectedDate}
            events={combinedEvents}
            onEventClick={handleEditEvent}
            onDateSelect={handleDateSelect}
            onTimeSlotClick={(date, time) => {
              setSelectedEvent({
                startTime: new Date(date.getTime() + time * 60 * 60 * 1000).toISOString(),
                endTime: new Date(date.getTime() + (time + 1) * 60 * 60 * 1000).toISOString()
              })
              setIsCreatingEvent(true)
              setShowEventModal(true)
            }}
          />
        </div>

        <div className="schedule-sidebar">
          <ScheduleStats stats={getWeeklyStats()} />
          <UpcomingEvents 
            events={getUpcomingEvents()}
            onEventClick={handleEditEvent}
          />
        </div>
      </div>

      {showEventModal && (
        <EventModal
          event={selectedEvent}
          isCreating={isCreatingEvent}
          onClose={() => {
            setShowEventModal(false)
            setSelectedEvent(null)
            setIsCreatingEvent(false)
          }}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  )
}

export default SchedulePage
