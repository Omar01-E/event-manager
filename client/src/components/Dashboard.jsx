import { useState, useEffect } from 'react'
import EventCard from './EventCard'
import CreateModal from './CreateModal'
import s from './Dashboard.module.css'

const API = 'http://localhost:4000/api'
const CATEGORIES = ['All', 'Academic', 'Social', 'Sports', 'Tech', 'Arts', 'Career']

export default function Dashboard({ user, onLogout, socket }) {
  const [events, setEvents]     = useState([])
  const [search, setSearch]     = useState('')
  const [cat, setCat]           = useState('All')
  const [tab, setTab]           = useState('all') // all | mine | rsvp
  const [showCreate, setShowCreate] = useState(false)
  const [toast, setToast]       = useState('')

  useEffect(() => {
    fetch(`${API}/events`).then(r => r.json()).then(setEvents)
    socket.on('events:update', setEvents)
    return () => socket.off('events:update', setEvents)
  }, [socket])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const rsvp = async (eventId) => {
    const res = await fetch(`${API}/events/${eventId}/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    })
    const data = await res.json()
    if (!res.ok) { showToast('❌ ' + data.error); return }
    const joined = data.attendees.includes(user.id)
    showToast(joined ? '✅ RSVP confirmed!' : '👋 Removed from event')
  }

  const deleteEvent = async (eventId) => {
    await fetch(`${API}/events/${eventId}`, { method: 'DELETE' })
    showToast('🗑 Event deleted')
  }

  const onCreate = (event) => {
    setEvents(prev => [event, ...prev])
    showToast('🎉 Event created!')
    setShowCreate(false)
  }

  const filtered = events.filter(e => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
                        e.description.toLowerCase().includes(search.toLowerCase()) ||
                        e.location.toLowerCase().includes(search.toLowerCase())
    const matchCat  = cat === 'All' || e.category === cat
    const matchTab  = tab === 'all' ? true
                    : tab === 'mine' ? e.createdBy === user.id
                    : e.attendees.includes(user.id)
    return matchSearch && matchCat && matchTab
  })

  const myEventsCount  = events.filter(e => e.createdBy === user.id).length
  const rsvpCount      = events.filter(e => e.attendees.includes(user.id)).length
  const upcomingCount  = events.filter(e => new Date(e.date) >= new Date()).length

  return (
    <div className={s.layout}>
      {/* Sidebar */}
      <aside className={s.sidebar}>
        <div className={s.brandWrap}>
          <span className={s.brandIcon}>📅</span>
          <span className={s.brandName}>EventHub</span>
        </div>

        <div className={s.userBox}>
          <div className={s.avatar}>{user.avatar}</div>
          <div>
            <div className={s.userName}>{user.name}</div>
            <div className={s.userEmail}>{user.email}</div>
          </div>
        </div>

        <nav className={s.nav}>
          {[['all','🌐','All Events'],['rsvp','✅','My RSVPs'],['mine','📌','My Events']].map(([id,icon,label]) => (
            <button key={id} className={`${s.navBtn} ${tab===id?s.active:''}`} onClick={() => setTab(id)}>
              <span>{icon}</span>{label}
            </button>
          ))}
        </nav>

        <div className={s.stats}>
          <div className={s.statBox}><span className={s.statVal}>{upcomingCount}</span><span className={s.statLbl}>Upcoming</span></div>
          <div className={s.statBox}><span className={s.statVal}>{rsvpCount}</span><span className={s.statLbl}>RSVPs</span></div>
          <div className={s.statBox}><span className={s.statVal}>{myEventsCount}</span><span className={s.statLbl}>Created</span></div>
        </div>

        <button className={s.createBtn} onClick={() => setShowCreate(true)}>+ Create Event</button>
        <button className={s.logoutBtn} onClick={onLogout}>Sign Out</button>

        <div className={s.credit}>Designed by <strong>Omar El akrae</strong></div>
      </aside>

      {/* Main */}
      <main className={s.main}>
        <div className={s.topBar}>
          <div className={s.searchWrap}>
            <span className={s.searchIcon}>🔍</span>
            <input
              className={s.search}
              placeholder="Search events…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className={s.catRow}>
          {CATEGORIES.map(c => (
            <button key={c} className={`${s.catBtn} ${cat===c?s.catActive:''}`} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>

        <div className={s.sectionHeader}>
          <h2>{tab === 'all' ? 'All Events' : tab === 'mine' ? 'My Events' : 'My RSVPs'}</h2>
          <span className={s.count}>{filtered.length} event{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {filtered.length === 0 ? (
          <div className={s.empty}>
            <span>📭</span>
            <p>No events found</p>
            <button className={s.createBtn} onClick={() => setShowCreate(true)}>Create one</button>
          </div>
        ) : (
          <div className={s.grid}>
            {filtered.map((e, i) => (
              <EventCard
                key={e.id}
                event={e}
                user={user}
                onRsvp={() => rsvp(e.id)}
                onDelete={() => deleteEvent(e.id)}
                delay={i}
              />
            ))}
          </div>
        )}
      </main>

      {showCreate && <CreateModal user={user} onClose={() => setShowCreate(false)} onCreate={onCreate} />}

      {toast && <div className={s.toast}>{toast}</div>}
    </div>
  )
}
