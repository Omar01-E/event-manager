import { useState } from 'react'
import s from './Auth.module.css'

const API = 'http://localhost:4000/api'

export default function Auth({ onAuth }) {
  const [mode, setMode]   = useState('login')
  const [form, setForm]   = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await fetch(`${API}/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onAuth(data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const demoLogin = async () => {
    setForm({ email: 'demo@demo.com', password: 'demo123', name: '' })
    setLoading(true)
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'demo@demo.com', password: 'demo123' })
      })
      const data = await res.json()
      onAuth(data.user)
    } finally { setLoading(false) }
  }

  return (
    <div className={s.page}>
      <div className={s.left}>
        <div className={s.brand}>
          <span className={s.logo}>📅</span>
          <h1>EventHub</h1>
        </div>
        <p className={s.sub}>Manage, discover and join student events in real-time.</p>
        <div className={s.features}>
          {['🎯 Create & manage events', '🔔 Real-time updates', '👥 RSVP & attendance tracking', '🏷️ Categories & search'].map(f => (
            <div key={f} className={s.feat}>{f}</div>
          ))}
        </div>
      </div>

      <div className={s.right}>
        <form className={s.card} onSubmit={submit}>
          <h2>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
          <p className={s.hint}>{mode === 'login' ? 'Sign in to your account' : 'Join EventHub today'}</p>

          {mode === 'register' && (
            <div className={s.field}>
              <label>Full Name</label>
              <input placeholder="Omar El akrae" value={form.name} onChange={set('name')} required/>
            </div>
          )}
          <div className={s.field}>
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required/>
          </div>
          <div className={s.field}>
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required/>
          </div>

          {error && <div className={s.error}>{error}</div>}

          <button className={s.btnPrimary} disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <button type="button" className={s.btnDemo} onClick={demoLogin} disabled={loading}>
            Try Demo Account
          </button>

          <p className={s.toggle}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <span onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </span>
          </p>
        </form>
        <p className={s.credit}>Designed by <strong>Omar El akrae</strong></p>
      </div>
    </div>
  )
}
