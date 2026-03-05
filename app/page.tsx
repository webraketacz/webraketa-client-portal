'use client'

import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

export default function Home() {
  const [status, setStatus] = useState('Loading...')

  useEffect(() => {
    const run = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        setStatus('ERROR: ' + error.message)
        console.error(error)
        return
      }
      console.log('session:', data.session)
      setStatus(data.session ? '✅ Přihlášen' : '❌ Nepřihlášen')
    }
    run()
  }, [])

  return (
    <main style={{ padding: 24 }}>
      <h1>Webraketa Client Portal</h1>
      <p>Auth status: {status}</p>
    </main>
  )
}
