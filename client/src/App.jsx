import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'

const socket = io('http://localhost:4000')

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('em_user')
    return saved ? JSON.parse(saved) : null
  })

  const login = (u) => {
    setUser(u)
    localStorage.setItem('em_user', JSON.stringify(u))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('em_user')
  }

  return user
    ? <Dashboard user={user} onLogout={logout} socket={socket} />
    : <Auth onAuth={login} />
}
