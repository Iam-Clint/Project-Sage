import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './supabase'

type Learner = { id: string; name: string; email: string; demo: boolean }
type AuthContextValue = { learner: Learner | null; loading: boolean; enterDemo: () => void; signOut: () => Promise<void> }
const AuthContext = createContext<AuthContextValue | null>(null)
const demoLearner: Learner = { id: 'demo', name: 'Emmanuel David', email: 'Demo student', demo: true }

function toLearner(user: User): Learner {
  // Display metadata is never used to authorize access.
  return { id: user.id, name: user.user_metadata.full_name || user.user_metadata.name || user.email?.split('@')[0] || 'Learner', email: user.email || '', demo: false }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [learner, setLearner] = useState<Learner | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    const client = supabase
    const demo = sessionStorage.getItem('sage-demo') === 'true'
    if (!client) {
      if (demo) setLearner(demoLearner)
      setLoading(false)
      return
    }
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      setLearner(session?.user ? toLearner(session.user) : sessionStorage.getItem('sage-demo') === 'true' ? demoLearner : null)
      setLoading(false)
    })
    void client.auth.getSession().then(({ data, error }) => {
      if (!active) return
      setLearner(!error && data.session?.user ? toLearner(data.session.user) : demo ? demoLearner : null)
      setLoading(false)
    }).catch(() => { if (active) { setLearner(demo ? demoLearner : null); setLoading(false) } })
    return () => { active = false; subscription.unsubscribe() }
  }, [])
  const enterDemo = () => { sessionStorage.setItem('sage-demo', 'true'); setLearner(demoLearner) }
  const signOut = async () => {
    if (learner && !learner.demo && supabase) {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    }
    sessionStorage.removeItem('sage-demo')
    setLearner(null)
  }
  return <AuthContext.Provider value={{ learner, loading, enterDemo, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
