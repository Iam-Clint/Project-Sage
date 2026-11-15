import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Eye, EyeOff, LoaderCircle, CheckCircle2 } from 'lucide-react'
import { Brand } from '../components/Brand'
import { Orb } from '../components/Orb'
import { useAuth } from '../lib/auth'
import { authSetupMessage, neonAuth, authErrorMessage } from '../lib/neon'


type AuthMode = 'login' | 'signup' | 'forgot' | 'reset'
function GoogleIcon() { return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.61 4.61 0 0 1-2 3.03v2.52h3.24c1.9-1.75 2.98-4.32 2.98-7.38Z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.39l-3.24-2.52c-.9.6-2.04.97-3.38.97-2.6 0-4.81-1.76-5.6-4.12H3.06v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.4 13.94a6 6 0 0 1 0-3.88v-2.6H3.06a10 10 0 0 0 0 9.08l3.34-2.6Z"/><path fill="#EA4335" d="M12 5.94c1.47 0 2.78.5 3.82 1.49l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.94 5.46l3.34 2.6C7.19 7.7 9.4 5.94 12 5.94Z"/></svg> }

export default function Auth({ mode }: { mode: AuthMode }) {
  const { learner, enterDemo, refreshSession } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  useEffect(() => { setError(''); setSuccess('') }, [mode])
  useEffect(() => { if (learner && mode !== 'reset') navigate('/app', { replace: true }) }, [learner, mode, navigate])
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setSuccess('')
    if (!neonAuth) { setError(authSetupMessage); return }
    const values = new FormData(event.currentTarget)
    const email = String(values.get('email') || '').trim()
    const password = String(values.get('password') || '')
    const name = String(values.get('name') || '').trim()
    if (mode === 'signup' && !name) { setError('Please add your name so we know what to call you.'); return }
    setBusy(true)
    try {
      if (mode === 'signup') {
        const { error: authError } = await neonAuth.signUp.email({ email, password, name, callbackURL: `${window.location.origin}/auth/callback` })
        if (authError) throw authError
        if (await refreshSession()) navigate('/app')
        else setSuccess('Check your inbox to confirm your email, then return to sign in.')
      } else if (mode === 'forgot') {
        const { error: authError } = await neonAuth.requestPasswordReset({ email, redirectTo: `${window.location.origin}/reset-password` })
        if (authError) throw authError
        setSuccess('If an account exists for this address, you’ll receive a password reset link.')
      } else if (mode === 'reset') {
        const token = new URLSearchParams(window.location.search).get('token')
        if (!token) throw new Error('Open the password reset link from your email to set a new password.')
        const { error: authError } = await neonAuth.resetPassword({ newPassword: password, token })
        if (authError) throw authError
        setSuccess('Your password has been updated. You can return to your workspace.')
      } else {
        const { error: authError } = await neonAuth.signIn.email({ email, password })
        if (authError) throw authError
        if (await refreshSession()) navigate('/app')
        else setError('Your sign-in completed, but your session could not be restored. Please try again.')
      }
    } catch (err) { setError(authErrorMessage(err)) }
    finally { setBusy(false) }
  }
  async function google() {
    setError('')
    if (!neonAuth) { setError(authSetupMessage); return }
    setBusy(true)
    try {
      const { error: authError } = await neonAuth.signIn.social({ provider: 'google', callbackURL: `${window.location.origin}/auth/callback`, errorCallbackURL: `${window.location.origin}/auth/callback` })
      if (authError) throw authError
    } catch (err) { setError(authErrorMessage(err)) }
    finally { setBusy(false) }
  }
  const signup = mode === 'signup'
  const recovery = mode === 'forgot' || mode === 'reset'
  const title = signup ? 'Your next chapter starts here.' : mode === 'forgot' ? 'Let’s get you back in.' : mode === 'reset' ? 'A fresh start.' : 'Good to have you back.'
  return <div className="auth-page"><aside className="auth-story"><Brand/><div className="auth-story-content"><span className="eyebrow">LEARNING, WITH YOU IN MIND</span><h1>Every question<br/>opens a possibility.</h1><p>You don’t have to know it all.<br/>You just have to start somewhere.</p><Orb/></div><span className="auth-story-footer">Your pace. Your progress. Your SAGE.</span></aside><main className="auth-main"><Link to="/" className="back-link"><ArrowLeft size={16}/>Back to SAGE</Link><div className="auth-form-wrap"><div className="auth-mobile-brand"><Brand/></div><span className="eyebrow">{signup ? 'LET’S BEGIN' : recovery ? 'ACCOUNT RECOVERY' : 'YOUR LEARNING CONTINUES'}</span><h2>{title}</h2><p>{signup ? 'Create a space for your curiosity to grow.' : recovery ? 'A few simple steps, and you’re ready to continue.' : 'Pick up where your curiosity left off.'}</p>{recovery ? null : <><button className="button button-google" onClick={google} disabled={busy}><GoogleIcon/>Continue with Google</button><div className="auth-divider"><span>or continue with email</span></div></>}<form onSubmit={submit} key={mode}>{signup ? <label className="field">Your name<input name="name" autoComplete="name" placeholder="What should we call you?" required maxLength={80}/></label> : null}{mode !== 'reset' ? <label className="field">Email address<input type="email" name="email" autoComplete="email" placeholder="you@example.com" required maxLength={254}/></label> : null}{mode !== 'forgot' ? <label className="field"><span className="field-label">{mode === 'reset' ? 'New password' : 'Password'}{mode === 'login' ? <Link to="/forgot-password">Forgot password?</Link> : null}</span><span className="password-field"><input type={showPassword ? 'text' : 'password'} name="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder={signup || mode === 'reset' ? 'At least 8 characters' : 'Enter your password'} required minLength={mode === 'login' ? 1 : 8} maxLength={128}/><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={()=>setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></span></label> : null}{error ? <div className="inline-error" role="alert">{error}</div> : null}{success ? <div className="inline-success" role="status"><CheckCircle2 size={18}/>{success}</div> : null}<button className="button button-primary full-width" type="submit" disabled={busy}>{busy ? <LoaderCircle size={18} className="spinner"/> : null}{mode === 'forgot' ? 'Send reset link' : mode === 'reset' ? 'Update password' : signup ? 'Create account' : 'Sign in'}{busy ? null : <ArrowRight size={17}/>}</button></form>{mode === 'reset' && success ? <Link to="/app" className="text-link">Go to your workspace →</Link> : null}{recovery ? <p className="auth-switch"><Link to="/login">Back to sign in</Link></p> : <p className="auth-switch">{signup ? 'Already have an account?' : 'New to SAGE?'} <Link to={signup ? '/login' : '/signup'}>{signup ? 'Sign in' : 'Create an account'}</Link></p>}<div className="demo-entry"><span>Just having a look around?</span><button onClick={()=>{enterDemo();navigate('/app')}} className="text-link">Explore the demo<ArrowUpRightSmall/></button></div><p className="auth-fineprint">Your learning belongs to you. SAGE asks only for the information needed to get you started.</p></div><span className="auth-footer">A little wiser, every day.</span></main></div>
}
function ArrowUpRightSmall() { return <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 12 12 4M4 4h8v8" stroke="currentColor" strokeWidth="1.5"/></svg> }

export function AuthCallback() {
  const { learner, loading } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1))
    const query = new URLSearchParams(window.location.search)
    const message = params.get('error_description') || query.get('error_description') || query.get('error')
    if (message) setError(message)
    else if (!loading && learner) navigate('/app', { replace: true })
    else if (!loading) setError('Your sign-in link could not be completed. Please try signing in again.')
  }, [learner, loading, navigate])
  return <main className="centered-state"><Brand/>{error ? <><h1>Let’s try that again.</h1><p role="alert">{error}</p><Link to="/login" className="button button-primary">Return to sign in</Link></> : <><LoaderCircle className="spinner"/><p>Getting your workspace ready…</p></>}</main>
}
