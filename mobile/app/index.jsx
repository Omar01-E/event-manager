import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { View, ActivityIndicator } from 'react-native'

export default function Index() {
  const router = useRouter()

  useEffect(() => {
    AsyncStorage.getItem('em_user').then(u => {
      if (u) router.replace('/dashboard')
      else router.replace('/login')
    })
  }, [])

  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#07070f' }}>
      <ActivityIndicator color="#818cf8" size="large"/>
    </View>
  )
}
