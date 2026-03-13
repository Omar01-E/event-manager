import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'

const API = 'http://localhost:4000/api'

export default function Login() {
  const router = useRouter()
  const [mode, setMode]     = useState('login')
  const [name, setName]     = useState('')
  const [email, setEmail]   = useState('')
  const [pass, setPass]     = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setError(''); setLoading(true)
    try {
      const res = await fetch(`${API}/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      await AsyncStorage.setItem('em_user', JSON.stringify(data.user))
      router.replace('/dashboard')
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const demo = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'demo@demo.com', password: 'demo123' })
      })
      const data = await res.json()
      await AsyncStorage.setItem('em_user', JSON.stringify(data.user))
      router.replace('/dashboard')
    } finally { setLoading(false) }
  }

  return (
    <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS==='ios'?'padding':undefined}>
      <ScrollView style={s.page} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <View style={s.hero}>
          <Text style={s.emoji}>📅</Text>
          <Text style={s.brand}>EventHub</Text>
          <Text style={s.tagline}>Discover & manage student events</Text>
        </View>

        <View style={s.card}>
          <Text style={s.title}>{mode==='login'?'Welcome back':'Create account'}</Text>

          {mode==='register' && (
            <View style={s.field}>
              <Text style={s.label}>Full Name</Text>
              <TextInput style={s.input} placeholder="Omar El akrae" placeholderTextColor="#555" value={name} onChangeText={setName}/>
            </View>
          )}
          <View style={s.field}>
            <Text style={s.label}>Email</Text>
            <TextInput style={s.input} placeholder="you@example.com" placeholderTextColor="#555" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address"/>
          </View>
          <View style={s.field}>
            <Text style={s.label}>Password</Text>
            <TextInput style={s.input} placeholder="••••••••" placeholderTextColor="#555" value={pass} onChangeText={setPass} secureTextEntry/>
          </View>

          {!!error && <View style={s.errorBox}><Text style={s.errorTxt}>{error}</Text></View>}

          <TouchableOpacity style={s.btnPrimary} onPress={submit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff"/> : <Text style={s.btnPrimaryTxt}>{mode==='login'?'Sign In':'Create Account'}</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={s.btnDemo} onPress={demo} disabled={loading}>
            <Text style={s.btnDemoTxt}>Try Demo Account</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { setMode(m => m==='login'?'register':'login'); setError('') }}>
            <Text style={s.toggle}>
              {mode==='login'?"Don't have an account? ":"Already have an account? "}
              <Text style={s.toggleLink}>{mode==='login'?'Sign up':'Sign in'}</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={s.credit}>Designed by <Text style={s.creditName}>Omar El akrae</Text></Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  page:    { flex:1, backgroundColor:'#07070f' },
  content: { padding:24, paddingTop:60, gap:20 },
  hero:    { alignItems:'center', gap:6, paddingVertical:16 },
  emoji:   { fontSize:48 },
  brand:   { fontSize:28, fontWeight:'800', color:'#818cf8' },
  tagline: { fontSize:14, color:'#6b6b88', textAlign:'center' },
  card:    { backgroundColor:'#10101a', borderWidth:1, borderColor:'#1c1c2e', borderRadius:20, padding:24, gap:14 },
  title:   { fontSize:20, fontWeight:'800', color:'#f0f0f8' },
  field:   { gap:6 },
  label:   { fontSize:12, color:'#9090b0', fontWeight:'600', textTransform:'uppercase', letterSpacing:0.5 },
  input:   { backgroundColor:'#14141f', borderWidth:1, borderColor:'#1c1c2e', borderRadius:10, color:'#f0f0f8', fontSize:15, padding:12 },
  errorBox:{ backgroundColor:'rgba(239,68,68,0.1)', borderWidth:1, borderColor:'rgba(239,68,68,0.3)', borderRadius:8, padding:10 },
  errorTxt:{ color:'#f87171', fontSize:13 },
  btnPrimary:    { backgroundColor:'#6366f1', borderRadius:12, padding:14, alignItems:'center' },
  btnPrimaryTxt: { color:'#fff', fontWeight:'700', fontSize:15 },
  btnDemo:       { borderWidth:1, borderColor:'#1c1c2e', borderRadius:12, padding:13, alignItems:'center' },
  btnDemoTxt:    { color:'#9090b0', fontSize:14 },
  toggle:        { textAlign:'center', color:'#6b6b88', fontSize:13 },
  toggleLink:    { color:'#818cf8', fontWeight:'600' },
  credit:        { textAlign:'center', color:'#2a2a3e', fontSize:11 },
  creditName:    { color:'#4a4a6e' },
})
