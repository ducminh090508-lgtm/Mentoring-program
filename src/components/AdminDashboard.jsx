import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { listStudents, listTeachers } from '../services/userService'
import { assignTeacherToStudent, listAssignments, addPairedSlot, listPairedSlots } from '../services/adminService'

const AdminDashboard = () => {
  const { user, logout } = useAuth()
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [assignments, setAssignments] = useState([]) // {studentId, teacherId}

  const [filters, setFilters] = useState({ student: '', teacher: '' })
  const [selected, setSelected] = useState({ studentId: '', teacherId: '' })
  const [schedule, setSchedule] = useState({
    // { pairKey: "studentId|teacherId", slots: [{day, time, subject}] }
    slots: [],
  })

  const studentOptions = useMemo(() => students.filter(s => (s.name||'').toLowerCase().includes(filters.student.toLowerCase())), [students, filters.student])
  const teacherOptions = useMemo(() => teachers.filter(t => (t.name||'').toLowerCase().includes(filters.teacher.toLowerCase())), [teachers, filters.teacher])

  const pairKey = selected.studentId && selected.teacherId ? `${selected.studentId}|${selected.teacherId}` : ''

  const currentSlots = useMemo(() => schedule[pairKey] || [], [schedule, pairKey])

  useEffect(() => {
    const load = async () => {
      const [stu, tea, asg] = await Promise.all([listStudents(), listTeachers(), listAssignments()])
      setStudents(stu)
      setTeachers(tea)
      setAssignments(asg.map(a => ({ studentId: a.studentId, teacherId: a.teacherId })))
    }
    load()
  }, [])

  const addAssignment = async () => {
    if (!selected.studentId || !selected.teacherId) return
    const exists = assignments.some(a => a.studentId === selected.studentId && a.teacherId === selected.teacherId)
    if (!exists) {
      await assignTeacherToStudent(selected.teacherId, selected.studentId)
      setAssignments(prev => [...prev, { studentId: selected.studentId, teacherId: selected.teacherId }])
    }
  }

  const addSlot = async (day, time, subject) => {
    if (!pairKey) return
    await addPairedSlot({ studentId: selected.studentId, teacherId: selected.teacherId, day, time, subject })
    setSchedule(prev => ({ ...prev, [pairKey]: [ ...(prev[pairKey] || []), { day, time, subject } ] }))
  }

  const removeSlot = (index) => {
    if (!pairKey) return
    setSchedule(prev => ({
      ...prev,
      [pairKey]: (prev[pairKey] || []).filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="admin-dashboard">
      <nav className="navbar teacher-navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <i className="ph ph-shield-check"></i>
            <span>Admin Console</span>
          </div>
          <div className="nav-user" style={{ gap: '12px' }}>
            <button className="admin-signout-btn" onClick={logout} title="Sign out">
              <i className="ph ph-sign-out"></i>
              <span className="hide-sm">Sign Out</span>
            </button>
            <div className="user-avatar">
              <img src={user?.avatar || 'https://via.placeholder.com/40x40/4CAF50/FFFFFF?text=A'} alt={user?.name || 'Admin'} />
            </div>
          </div>
        </div>
      </nav>

      <div className="page-content">
        <div className="admin-layout">
          {/* Left: Assignment Panel */}
          <section className="card admin-assign-section">
            <div className="card-header">
              <h3>Assign Teachers to Students</h3>
            </div>

            <div className="assign-controls">
              <div className="assign-picker">
                <label>Student</label>
                <div className="picker-input">
                  <i className="ph ph-student"></i>
                  <input
                    value={filters.student}
                    onChange={(e) => setFilters(prev => ({ ...prev, student: e.target.value }))}
                    placeholder="Search students"
                  />
                </div>
                <div className="picker-list">
                  {studentOptions.map(s => (
                    <button
                      key={s.id}
                      className={`picker-item ${selected.studentId === s.id ? 'selected' : ''}`}
                      onClick={() => setSelected(prev => ({ ...prev, studentId: s.id }))}
                    >
                      <img src={s.avatar || 'https://via.placeholder.com/36x36/4CAF50/FFFFFF?text=S'} alt={s.name || s.email || s.id} />
                      <div>
                        <div className="name">{s.name || s.email || s.id}</div>
                        <div className="sub">{s.email || s.id}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="assign-picker">
                <label>Teacher</label>
                <div className="picker-input">
                  <i className="ph ph-chalkboard-teacher"></i>
                  <input
                    value={filters.teacher}
                    onChange={(e) => setFilters(prev => ({ ...prev, teacher: e.target.value }))}
                    placeholder="Search teachers"
                  />
                </div>
                <div className="picker-list">
                  {teacherOptions.map(t => (
                    <button
                      key={t.id}
                      className={`picker-item ${selected.teacherId === t.id ? 'selected' : ''}`}
                      onClick={() => setSelected(prev => ({ ...prev, teacherId: t.id }))}
                    >
                      <img src={t.avatar || 'https://via.placeholder.com/36x36/2196F3/FFFFFF?text=T'} alt={t.name || t.email || t.id} />
                      <div>
                        <div className="name">{t.name || t.email || t.id}</div>
                        <div className="sub">{t.email || t.id}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="assign-actions">
              <button className="assign-btn" onClick={addAssignment} disabled={!selected.studentId || !selected.teacherId}>
                <i className="ph ph-link-simple"></i>
                Assign
              </button>
            </div>

            <div className="assignment-list">
              {assignments.length === 0 ? (
                <div className="empty-state">
                  <i className="ph ph-users-three"></i>
                  <p>No assignments yet</p>
                </div>
              ) : (
                assignments.map((a, index) => {
                  const s = students.find(s => s.id === a.studentId)
                  const t = teachers.find(t => t.id === a.teacherId)
                  return (
                    <div key={index} className="assignment-item">
                      <div className="person">
                        <img src={s.avatar} alt={s.name} />
                        <div>
                          <div className="name">{s.name}</div>
                          <div className="sub">{s.id}</div>
                        </div>
                      </div>
                      <i className="ph ph-arrow-right"></i>
                      <div className="person">
                        <img src={t.avatar} alt={t.name} />
                        <div>
                          <div className="name">{t.name}</div>
                          <div className="sub">{t.id}</div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </section>

          {/* Right: Schedule Builder for the selected pair */}
          <section className="card admin-schedule-section">
            <div className="card-header">
              <h3>Create Paired Schedule</h3>
              <div className="pair-label">
                {pairKey ? (
                  <>
                    <i className="ph ph-calendar"></i>
                    <span>{pairKey.replace('|', ' · ')}</span>
                  </>
                ) : (
                  <span>Select a student and a teacher</span>
                )}
              </div>
            </div>

            <div className="schedule-controls">
              <ScheduleForm onAdd={addSlot} disabled={!pairKey} />
            </div>

            <div className="schedule-slots">
              {currentSlots.length === 0 ? (
                <div className="empty-state">
                  <i className="ph ph-calendar-plus"></i>
                  <p>No sessions scheduled</p>
                </div>
              ) : (
                currentSlots.map((slot, index) => (
                  <div key={index} className="slot-item">
                    <div className="slot-time">
                      <i className="ph ph-clock"></i>
                      <span>{slot.day}, {slot.time}</span>
                    </div>
                    <div className="slot-subject">
                      <i className="ph ph-book"></i>
                      <span>{slot.subject}</span>
                    </div>
                    <button className="slot-remove" onClick={() => removeSlot(index)}>
                      <i className="ph ph-trash"></i>
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

const ScheduleForm = ({ onAdd, disabled }) => {
  const [day, setDay] = useState('Monday')
  const [time, setTime] = useState('09:00')
  const [subject, setSubject] = useState('Mathematics')

  const add = () => {
    if (disabled) return
    onAdd(day, time, subject)
  }

  return (
    <div className="schedule-form">
      <div className="form-row">
        <div className="form-group">
          <label>Day</label>
          <select value={day} onChange={(e) => setDay(e.target.value)}>
            {['Monday','Tuesday','Wednesday','Thursday','Friday'].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Time</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Subject</label>
          <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Algebra" />
        </div>
        <div className="form-actions">
          <button className="assign-btn" onClick={add} disabled={disabled}>
            <i className="ph ph-plus"></i>
            Add Slot
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard


