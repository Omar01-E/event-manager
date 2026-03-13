import { useState, useEffect } from 'react'
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, Modal, ScrollView } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { io } from 'socket.io-client'
import EventCard from '../components/EventCard'
import CreateModal from '../components/CreateModal'

const API    = 'http://localhost:4000/api'
const socket = io('http://localhost:4000')
const CATS   = ['All','Academic','Social','Sports','Tech','Arts','Career']
const TABS   = [['all','🌐'],['rsvp','✅'],['mine','📌']]

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser]       = useState(null)
  const [events, setEvents]   = useState([])
  const [search, setSearch]   = useState('')
  const [cat, setCat]         = useState('All')
  const [tab, setTab]         = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const [toast, setToast]     = useState('')

  useEffect(() => {
    AsyncStorage.getItem('em_user').then(u => {
      if (!u) { router.replace('/login'); return }
      setUser(JSON.parse(u))
    })
    fetch(`${API}/events`).then(r => r.json()).then(setEvents)
    socket.on('events:update', setEvents)
    return () => socket.off('events:update', setEvents)
  }, [])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const rsvp = async (id) => {
    if (!user) return
    const res  = await fetch(`${API}/events/${id}/rsvp`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ userId:user.id }) })
    const data = await res.json()
    if (!res.ok) { showToast('❌ '+data.error); return }
    showToast(data.attendees.includes(user.id) ? '✅ RSVP confirmed!' : '👋 Removed from event')
  }

  const deleteEvent = async (id) => {
    await fetch(`${API}/events/${id}`, { method:'DELETE' })
    showToast('🗑 Event deleted')
  }

  const logout = async () => {
    await AsyncStorage.removeItem('em_user')
    router.replace('/login')
  }

  const filtered = events.filter(e => {
    const q = search.toLowerCase()
    const matchSearch = e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q)
    const matchCat    = cat === 'All' || e.category === cat
    const matchTab    = tab==='all' ? true : tab==='mine' ? e.createdBy===user?.id : e.attendees.includes(user?.id)
    return matchSearch && matchCat && matchTab
  })

  if (!user) return null

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.brand}>📅 EventHub</Text>
          <Text style={s.welcome}>Hi, {user.name.split(' ')[0]} 👋</Text>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.createBtn} onPress={() => setShowCreate(true)}>
            <Text style={s.createTxt}>+ New</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.avatarBox} onPress={logout}>
            <Text style={s.avatarTxt}>{user.avatar}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput style={s.search} placeholder="Search events…" placeholderTextColor="#555" value={search} onChangeText={setSearch}/>
      </View>

      {/* Tabs */}
      <View style={s.tabRow}>
        {TABS.map(([id,icon]) => (
          <TouchableOpacity key={id} style={[s.tab, tab===id && s.tabActive]} onPress={() => setTab(id)}>
            <Text style={[s.tabTxt, tab===id && s.tabActiveTxt]}>{icon} {id==='all'?'All':id==='rsvp'?'RSVPs':'Mine'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catScroll} contentContainerStyle={s.catRow}>
        {CATS.map(c => (
          <TouchableOpacity key={c} style={[s.catBtn, cat===c && s.catActive]} onPress={() => setCat(c)}>
            <Text style={[s.catTxt, cat===c && s.catActiveTxt]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Events */}
      <FlatList
        data={filtered}
        keyExtractor={e => e.id}
        contentContainerStyle={s.list}
        renderItem={({ item }) => (
          <EventCard event={item} user={user} onRsvp={() => rsvp(item.id)} onDelete={() => deleteEvent(item.id)} />
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyIcon}>📭</Text>
            <Text style={s.emptyTxt}>No events found</Text>
          </View>
        }
      />

      {showCreate && <CreateModal user={user} onClose={() => setShowCreate(false)} onCreate={e => { setEvents(p => [e,...p]); showToast('🎉 Event created!'); setShowCreate(false) }}/>}

      {!!toast && <View style={s.toast}><Text style={s.toastTxt}>{toast}</Text></View>}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe:    { flex:1, backgroundColor:'#07070f' },
  header:  { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:20, paddingTop:16, paddingBottom:8 },
  brand:   { fontSize:18, fontWeight:'800', color:'#818cf8' },
  welcome: { fontSize:13, color:'#6b6b88', marginTop:2 },
  headerRight: { flexDirection:'row', alignItems:'center', gap:10 },
  createBtn: { backgroundColor:'#6366f1', borderRadius:10, paddingHorizontal:14, paddingVertical:8 },
  createTxt: { color:'#fff', fontWeight:'700', fontSize:13 },
  avatarBox: { width:36, height:36, borderRadius:18, backgroundColor:'#6366f1', justifyContent:'center', alignItems:'center' },
  avatarTxt: { color:'#fff', fontWeight:'700', fontSize:13 },
  searchWrap:{ flexDirection:'row', alignItems:'center', marginHorizontal:16, marginVertical:10, backgroundColor:'#10101a', borderWidth:1, borderColor:'#1c1c2e', borderRadius:12, paddingHorizontal:12 },
  searchIcon:{ fontSize:14, marginRight:6 },
  search:    { flex:1, color:'#f0f0f8', fontSize:14, paddingVertical:10 },
  tabRow:    { flexDirection:'row', paddingHorizontal:16, gap:8, marginBottom:8 },
  tab:       { flex:1, paddingVertical:8, borderRadius:10, backgroundColor:'#10101a', borderWidth:1, borderColor:'#1c1c2e', alignItems:'center' },
  tabActive: { backgroundColor:'rgba(99,102,241,0.15)', borderColor:'#818cf8' },
  tabTxt:    { fontSize:12, color:'#6b6b88', fontWeight:'600' },
  tabActiveTxt: { color:'#818cf8' },
  catScroll: { maxHeight:44 },
  catRow:    { paddingHorizontal:16, gap:8, alignItems:'center' },
  catBtn:    { paddingHorizontal:14, paddingVertical:6, borderRadius:50, backgroundColor:'#10101a', borderWidth:1, borderColor:'#1c1c2e' },
  catActive: { backgroundColor:'rgba(99,102,241,0.15)', borderColor:'#818cf8' },
  catTxt:    { fontSize:12, color:'#6b6b88', fontWeight:'600' },
  catActiveTxt: { color:'#818cf8' },
  list:      { padding:16, gap:12 },
  empty:     { alignItems:'center', paddingTop:60, gap:10 },
  emptyIcon: { fontSize:40 },
  emptyTxt:  { color:'#6b6b88', fontSize:14 },
  toast:     { position:'absolute', bottom:32, left:32, right:32, backgroundColor:'#1a1a2e', borderWidth:1, borderColor:'#818cf8', borderRadius:50, padding:14, alignItems:'center' },
  toastTxt:  { color:'#f0f0f8', fontWeight:'600', fontSize:13 },
})
