import { useState } from 'react'
import s from './CreateModal.module.css'

const API = 'http://localhost:4000/api'
const CATEGORIES = ['Academic', 'Social', 'Sports', 'Tech', 'Arts', 'Career']

export default function CreateModal({ user, onClose, onCreate }) {
  const [form, setForm] = useState({
    title: '', description: '', date: '', time: '12:00',
    location: '', category: 'Tech', capacity: 50
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const res = await fetch(`${API}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, capacity: +form.capacity, createdBy: user.id })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onCreate(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={s.modal}>
        <div className={s.header}>
          <h2>Create Event</h2>
          <button className={s.close} onClick={onClose}>×</button>
        </div>
        <form onSubmit={submit} className={s.form}>
          <div className={s.field}>
            <label>Event Title</label>
            <input placeholder="e.g. Study Group — COEN 352" value={form.title} onChange={set('title')} required/>
          </div>
          <div className={s.field}>
            <label>Description</label>
            <textarea placeholder="Tell people what this event is about…" value={form.description} onChange={set('description')} rows={3} required/>
          </div>
          <div className={s.row}>
            <div className={s.field}>
              <label>Date</label>
              <input type="date" value={form.date} onChange={set('date')} required/>
            </div>
            <div className={s.field}>
              <label>Time</label>
              <input type="time" value={form.time} onChange={set('time')} required/>
            </div>
          </div>
          <div className={s.field}>
            <label>Location</label>
            <input placeholder="e.g. EV Building, Room 2.260" value={form.location} onChange={set('location')} required/>
          </div>
          <div className={s.row}>
            <div className={s.field}>
              <label>Category</label>
              <select value={form.category} onChange={set('category')}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className={s.field}>
              <label>Capacity</label>
              <input type="number" min="1" max="10000" value={form.capacity} onChange={set('capacity')} required/>
            </div>
          </div>
          {error && <div className={s.error}>{error}</div>}
          <div className={s.btns}>
            <button type="button" className={s.cancel} onClick={onClose}>Cancel</button>
            <button type="submit" className={s.submit} disabled={loading}>
              {loading ? 'Creating…' : '🎉 Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
