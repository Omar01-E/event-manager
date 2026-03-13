import s from './EventCard.module.css'

const CAT_COLORS = {
  Academic: '#6366f1', Social: '#ec4899', Sports: '#22c55e',
  Tech: '#3b82f6', Arts: '#f97316', Career: '#eab308'
}

const CAT_ICONS = {
  Academic: '📚', Social: '🎉', Sports: '⚽', Tech: '💻', Arts: '🎨', Career: '💼'
}

export default function EventCard({ event, user, onRsvp, onDelete, delay }) {
  const isRsvp   = event.attendees.includes(user.id)
  const isMine   = event.createdBy === user.id
  const isFull   = event.attendees.length >= event.capacity
  const isPast   = new Date(event.date) < new Date()
  const color    = CAT_COLORS[event.category] || '#818cf8'
  const pct      = Math.round((event.attendees.length / event.capacity) * 100)

  const fmt = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-CA', { weekday:'short', month:'short', day:'numeric' })

  return (
    <div className={s.card} style={{ animationDelay: `${delay * 0.06}s`, '--color': color }}>
      <div className={s.catBar} style={{ background: color }}/>

      <div className={s.top}>
        <span className={s.catChip} style={{ background: `${color}22`, color }}>
          {CAT_ICONS[event.category]} {event.category}
        </span>
        {isPast && <span className={s.pastBadge}>Past</span>}
        {isMine && <span className={s.mineBadge}>Mine</span>}
      </div>

      <h3 className={s.title}>{event.title}</h3>
      <p className={s.desc}>{event.description}</p>

      <div className={s.meta}>
        <div className={s.metaRow}><span>📅</span><span>{fmt(event.date)} at {event.time}</span></div>
        <div className={s.metaRow}><span>📍</span><span>{event.location}</span></div>
      </div>

      <div className={s.capacity}>
        <div className={s.capRow}>
          <span className={s.capLabel}>Attendees</span>
          <span className={s.capCount}>{event.attendees.length} / {event.capacity}</span>
        </div>
        <div className={s.bar}><div className={s.fill} style={{ width: `${pct}%`, background: color }}/></div>
      </div>

      <div className={s.actions}>
        <button
          className={`${s.rsvpBtn} ${isRsvp ? s.rsvpActive : ''} ${isFull && !isRsvp ? s.disabled : ''}`}
          onClick={onRsvp}
          disabled={isFull && !isRsvp || isPast}
        >
          {isRsvp ? '✓ Going' : isFull ? 'Full' : 'RSVP'}
        </button>
        {isMine && (
          <button className={s.delBtn} onClick={() => { if(confirm('Delete this event?')) onDelete() }}>🗑</button>
        )}
      </div>
    </div>
  )
}
