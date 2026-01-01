import { useState, useEffect } from 'react'

const CalendarWidget = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [calendarDays, setCalendarDays] = useState([])

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  useEffect(() => {
    generateCalendar()
  }, [currentDate])

  const generateCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const today = new Date()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: '', isEmpty: true, disabled: true })
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = year === today.getFullYear() && 
                     month === today.getMonth() && 
                     day === today.getDate()
      
      days.push({
        day,
        isEmpty: false,
        disabled: false,
        isToday,
        isSelected: selectedDate === day
      })
    }

    setCalendarDays(days)
  }

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const handleDayClick = (day) => {
    if (day && !day.isEmpty && !day.disabled) {
      setSelectedDate(day.day)
      generateCalendar() // Regenerate to update selected state
    }
  }

  const getDayClassName = (day) => {
    let className = 'calendar-day'
    if (day.isEmpty || day.disabled) className += ' disabled'
    if (day.isToday) className += ' today'
    if (day.isSelected) className += ' selected'
    return className
  }

  return (
    <div className="card calendar-widget">
      <div className="calendar-header">
        <button className="nav-btn" onClick={() => navigateMonth(-1)}>
          <i className="fas fa-chevron-left"></i>
        </button>
        <h3>
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button className="nav-btn" onClick={() => navigateMonth(1)}>
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
      <div className="calendar-grid">
        <div className="day-header">S</div>
        <div className="day-header">M</div>
        <div className="day-header">T</div>
        <div className="day-header">W</div>
        <div className="day-header">T</div>
        <div className="day-header">F</div>
        <div className="day-header">S</div>
        
        {calendarDays.map((day, index) => (
          <div 
            key={index}
            className={getDayClassName(day)}
            onClick={() => handleDayClick(day)}
          >
            {day.day}
          </div>
        ))}
      </div>
    </div>
  )
}

export default CalendarWidget
