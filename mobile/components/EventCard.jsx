import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'

const CAT_COLORS = { Academic:'#6366f1', Social:'#ec4899', Sports:'#22c55e', Tech:'#3b82f6', Arts:'#f97316', Career:'#eab308' }
const CAT_ICONS  = { Academic:'📚', Social:'🎉', Sports:'⚽', Tech:'💻', Arts:'🎨', Career:'💼' }

export default function EventCard({ event, user, onRsvp, onDelete }) {
  const isRsvp = event.attendees.includes(user.id)
  const isMine = event.createdBy === user.id
  const isFull = event.attendees.length >= event.capacity
  const isPast = new Date(event.date) < new Date()
  const color  = CAT_COLORS[event.category] || '#818cf8'
  const pct    = Math.min((event.attendees.length / event.capacity) * 100, 100)
  const fmt    = d => new Date(d+'T00:00:00').toLocaleDateString('en-CA', { weekday:'short', month:'short', day:'numeric' })

  return (
    <View style={[s.card, { borderLeftColor: color }]}>
      <View style={s.top}>
        <View style={[s.catChip, { backgroundColor: color+'22' }]}>
          <Text style={[s.catTxt, { color }]}>{CAT_ICONS[event.category]} {event.category}</Text>
        </View>
        <View style={s.badges}>
          {isPast && <View style={s.pastBadge}><Text style={s.pastTxt}>Past</Text></View>}
          {isMine && <View style={s.mineBadge}><Text style={s.mineTxt}>Mine</Text></View>}
        </View>
      </View>

      <Text style={s.title}>{event.title}</Text>
      <Text style={s.desc} numberOfLines={2}>{event.description}</Text>

      <View style={s.meta}>
        <Text style={s.metaRow}>📅 {fmt(event.date)} at {event.time}</Text>
        <Text style={s.metaRow}>📍 {event.location}</Text>
      </View>

      <View style={s.capSection}>
        <View style={s.capRow}>
          <Text style={s.capLabel}>Attendees</Text>
          <Text style={s.capCount}>{event.attendees.length} / {event.capacity}</Text>
        </View>
        <View style={s.bar}><View style={[s.fill, { width:`${pct}%`, backgroundColor:color }]}/></View>
      </View>

      <View style={s.actions}>
        <TouchableOpacity
          style={[s.rsvpBtn, isRsvp && s.rsvpActive, (isFull && !isRsvp || isPast) && s.disabled]}
          onPress={onRsvp}
          disabled={(isFull && !isRsvp) || isPast}
        >
          <Text style={[s.rsvpTxt, isRsvp && s.rsvpActiveTxt]}>{isRsvp ? '✓ Going' : isFull ? 'Full' : 'RSVP'}</Text>
        </TouchableOpacity>
        {isMine && (
          <TouchableOpacity style={s.delBtn} onPress={() => Alert.alert('Delete event?','This cannot be undone.',[{text:'Cancel'},{text:'Delete',style:'destructive',onPress:onDelete}])}>
            <Text style={s.delTxt}>🗑</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  card:     { backgroundColor:'#10101a', borderWidth:1, borderColor:'#1c1c2e', borderLeftWidth:4, borderRadius:14, padding:16, gap:10 },
  top:      { flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  catChip:  { paddingHorizontal:10, paddingVertical:4, borderRadius:50 },
  catTxt:   { fontSize:11, fontWeight:'700' },
  badges:   { flexDirection:'row', gap:6 },
  pastBadge:{ backgroundColor:'rgba(107,107,136,0.15)', paddingHorizontal:8, paddingVertical:3, borderRadius:50 },
  pastTxt:  { color:'#6b6b88', fontSize:11, fontWeight:'600' },
  mineBadge:{ backgroundColor:'rgba(99,102,241,0.15)', paddingHorizontal:8, paddingVertical:3, borderRadius:50 },
  mineTxt:  { color:'#818cf8', fontSize:11, fontWeight:'600' },
  title:    { fontSize:16, fontWeight:'800', color:'#f0f0f8' },
  desc:     { fontSize:13, color:'#9090b0', lineHeight:18 },
  meta:     { gap:4 },
  metaRow:  { fontSize:12, color:'#9090b0' },
  capSection:{ gap:5 },
  capRow:   { flexDirection:'row', justifyContent:'space-between' },
  capLabel: { fontSize:11, color:'#6b6b88' },
  capCount: { fontSize:11, color:'#9090b0', fontWeight:'600' },
  bar:      { backgroundColor:'#1c1c2e', borderRadius:4, height:4 },
  fill:     { height:4, borderRadius:4 },
  actions:  { flexDirection:'row', gap:8, marginTop:4 },
  rsvpBtn:  { flex:1, borderWidth:1, borderColor:'#1c1c2e', borderRadius:8, padding:10, alignItems:'center' },
  rsvpActive:{ backgroundColor:'rgba(99,102,241,0.15)', borderColor:'#818cf8' },
  disabled: { opacity:0.4 },
  rsvpTxt:  { color:'#9090b0', fontWeight:'700', fontSize:13 },
  rsvpActiveTxt:{ color:'#818cf8' },
  delBtn:   { borderWidth:1, borderColor:'#1c1c2e', borderRadius:8, padding:10, paddingHorizontal:14 },
  delTxt:   { fontSize:14 },
})
