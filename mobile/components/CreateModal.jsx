import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'

const API  = 'http://localhost:4000/api'
const CATS = ['Academic','Social','Sports','Tech','Arts','Career']

export default function CreateModal({ user, onClose, onCreate }) {
  const [form, setForm] = useState({ title:'', description:'', date:'', time:'12:00', location:'', category:'Tech', capacity:'50' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const set = k => v => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    setError(''); setLoading(true)
    try {
      const res = await fetch(`${API}/events`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ ...form, capacity:+form.capacity, createdBy:user.id })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onCreate(data)
    } catch(err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS==='ios'?'padding':undefined}>
        <ScrollView style={s.page} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          <View style={s.header}>
            <Text style={s.title}>Create Event</Text>
            <TouchableOpacity style={s.closeBtn} onPress={onClose}>
              <Text style={s.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          {[
            ['title','Event Title','e.g. Study Group — COEN 352'],
            ['date','Date (YYYY-MM-DD)','2026-03-20'],
            ['time','Time','12:00'],
            ['location','Location','EV Building, Room 2.260'],
            ['capacity','Capacity','50'],
          ].map(([key,label,ph]) => (
            <View key={key} style={s.field}>
              <Text style={s.label}>{label}</Text>
              <TextInput style={s.input} placeholder={ph} placeholderTextColor="#555" value={form[key]} onChangeText={set(key)} keyboardType={key==='capacity'?'numeric':'default'}/>
            </View>
          ))}

          <View style={s.field}>
            <Text style={s.label}>Description</Text>
            <TextInput style={[s.input, s.textarea]} placeholder="Tell people what this event is about…" placeholderTextColor="#555" value={form.description} onChangeText={set('description')} multiline numberOfLines={3}/>
          </View>

          <View style={s.field}>
            <Text style={s.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catRow}>
              {CATS.map(c => (
                <TouchableOpacity key={c} style={[s.catBtn, form.category===c && s.catActive]} onPress={() => set('category')(c)}>
                  <Text style={[s.catTxt, form.category===c && s.catActiveTxt]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {!!error && <View style={s.errorBox}><Text style={s.errorTxt}>{error}</Text></View>}

          <View style={s.btns}>
            <TouchableOpacity style={s.cancel} onPress={onClose}>
              <Text style={s.cancelTxt}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.submit} onPress={submit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff"/> : <Text style={s.submitTxt}>🎉 Create Event</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const s = StyleSheet.create({
  page:    { flex:1, backgroundColor:'#07070f' },
  content: { padding:24, gap:16 },
  header:  { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:4 },
  title:   { fontSize:20, fontWeight:'800', color:'#f0f0f8' },
  closeBtn:{ backgroundColor:'#14141f', borderWidth:1, borderColor:'#1c1c2e', borderRadius:50, width:32, height:32, justifyContent:'center', alignItems:'center' },
  closeTxt:{ color:'#9090b0', fontSize:14 },
  field:   { gap:6 },
  label:   { fontSize:11, color:'#9090b0', fontWeight:'600', textTransform:'uppercase', letterSpacing:0.5 },
  input:   { backgroundColor:'#10101a', borderWidth:1, borderColor:'#1c1c2e', borderRadius:10, color:'#f0f0f8', fontSize:14, padding:12 },
  textarea:{ height:80, textAlignVertical:'top' },
  catRow:  { gap:8 },
  catBtn:  { paddingHorizontal:14, paddingVertical:7, borderRadius:50, backgroundColor:'#10101a', borderWidth:1, borderColor:'#1c1c2e' },
  catActive:{ backgroundColor:'rgba(99,102,241,0.15)', borderColor:'#818cf8' },
  catTxt:  { color:'#6b6b88', fontSize:13, fontWeight:'600' },
  catActiveTxt:{ color:'#818cf8' },
  errorBox:{ backgroundColor:'rgba(239,68,68,0.1)', borderWidth:1, borderColor:'rgba(239,68,68,0.3)', borderRadius:8, padding:10 },
  errorTxt:{ color:'#f87171', fontSize:13 },
  btns:    { flexDirection:'row', gap:10, marginTop:8 },
  cancel:  { flex:1, borderWidth:1, borderColor:'#1c1c2e', borderRadius:12, padding:14, alignItems:'center' },
  cancelTxt:{ color:'#9090b0', fontSize:14 },
  submit:  { flex:2, backgroundColor:'#6366f1', borderRadius:12, padding:14, alignItems:'center' },
  submitTxt:{ color:'#fff', fontWeight:'700', fontSize:14 },
})
