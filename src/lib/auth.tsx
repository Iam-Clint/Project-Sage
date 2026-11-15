import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { neonAuth, type NeonUser } from './neon'
import { useRef } from 'react'

type Learner = { id: string; name: string; email: string; demo: boolean }
type AuthContextValue = { learner: Learner | null; loading: boolean; refreshSession: () => Promise<boolean>; enterDemo: () => void; signOut: () => Promise<void> }
const AuthContext = createContext<AuthContextValue | null>(null)
const demoLearner: Learner = { id: 'demo', name: 'Emmanuel David', email: 'Demo student', demo: true }
function toLearner(user: NeonUser): Learner { return { id: user.id, name: user.name?.trim() || user.email.split('@')[0] || 'Learner', email: user.email, demo: false } }
function demoSession() { return sessionStorage.getItem('sage-demo') === 'true' ? demoLearner : null }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [learner, setLearner] = useState<Learner | null>(null)
  const [loading, setLoading] = useState(true)
  const sessionRevision = useRef(0)
  const refreshSession = useCallback(async () => {
    const revision = ++sessionRevision.current
    if (!neonAuth) { setLearner(demoSession()); setLoading(false); return false }
    const { data, error } = await neonAuth.getSession()
    if (error) throw error
    if (revision !== sessionRevision.current) return false
    if (data?.user) sessionStorage.removeItem('sage-demo')
    setLearner(data?.user ? toLearner(data.user) : demoSession())
    setLoading(false)
    return !!data?.user
  }, [])
  useEffect(() => {
    let active = true
    if (demoSession()) { setLearner(demoLearner); setLoading(false) }
    async function sync() {
      const revision = sessionRevision.current
      if (demoSession()) { if (active) { setLearner(demoLearner); setLoading(false) } return }
      try {
        const result = neonAuth ? await neonAuth.getSession() : null
        if (!active || revision !== sessionRevision.current) return
        const user = !result?.error ? result?.data?.user : null
        if (user) sessionStorage.removeItem('sage-demo')
        setLearner(user ? toLearner(user) : demoSession())
      } catch { if (active && revision === sessionRevision.current) setLearner(demoSession()) }
      finally { if (active && revision === sessionRevision.current) setLoading(false) }
    }
    void sync()
    window.addEventListener('focus', sync)
    return () => { active = false; window.removeEventListener('focus', sync) }
  }, [])
  const enterDemo = () => { sessionRevision.current++; sessionStorage.setItem('sage-demo', 'true'); setLearner(demoLearner); setLoading(false) }
  const signOut = async () => {
    sessionRevision.current++
    if (learner && !learner.demo && neonAuth) { const { error } = await neonAuth.signOut(); if (error) throw error }
    sessionRevision.current++
    sessionStorage.removeItem('sage-demo'); setLearner(null)
  }
  return <AuthContext.Provider value={{ learner, loading, refreshSession, enterDemo, signOut }}>{children}</AuthContext.Provider>
}
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
