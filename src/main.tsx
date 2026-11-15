import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { ThemeToaster } from './components/ThemeToggle'
import { Loading } from './components/Loading'
import { GlassMaterialDefs } from './components/LiquidGlass'
import { AuthProvider, useAuth } from './lib/auth'
import { LearningProvider } from './lib/store'
import Welcome from './pages/Welcome'
import Auth, { AuthCallback } from './pages/Auth'
const Shell=lazy(()=>import('./components/Shell'))
const Dashboard=lazy(()=>import('./pages/Dashboard'))
const Subjects=lazy(()=>import('./pages/Subjects'))
const Lesson=lazy(()=>import('./pages/Subjects').then(m=>({default:m.Lesson})))
const Practice=lazy(()=>import('./pages/Practice'))
const Tutor=lazy(()=>import('./pages/Tutor'))
const Progress=lazy(()=>import('./pages/Progress'))
const Planner=lazy(()=>import('./pages/Planner'))
const Settings=lazy(()=>import('./pages/Settings'))
import './styles.css'

function Workspace() {
  const { learner, loading } = useAuth()
  const location = useLocation()
  if (loading) return <main className="workspace-loading"><Loading workspace/></main>
  if (!learner) return <Navigate to="/login" state={{ from: location.pathname }} replace/>
  return <LearningProvider><Suspense fallback={<Loading workspace/>}><Outlet/></Suspense></LearningProvider>
}

createRoot(document.getElementById('root')!).render(<StrictMode><BrowserRouter><AuthProvider><Suspense fallback={<Loading/>}><Routes>
  <Route path="/" element={<Welcome/>}/>
  <Route path="/login" element={<Auth mode="login"/>}/>
  <Route path="/signup" element={<Auth mode="signup"/>}/>
  <Route path="/forgot-password" element={<Auth mode="forgot"/>}/>
  <Route path="/reset-password" element={<Auth mode="reset"/>}/>
  <Route path="/auth/callback" element={<AuthCallback/>}/>
  <Route element={<Workspace/>}><Route path="/app" element={<Shell/>}>
    <Route index element={<Dashboard/>}/>
    <Route path="subjects" element={<Subjects/>}/>
    <Route path="saved" element={<Subjects savedOnly/>}/>
    <Route path="lesson/:id" element={<Lesson/>}/>
    <Route path="practice" element={<Practice/>}/>
    <Route path="tutor" element={<Tutor/>}/>
    <Route path="progress" element={<Progress/>}/>
    <Route path="planner" element={<Planner/>}/>
    <Route path="settings" element={<Settings/>}/>
    <Route path="*" element={<Navigate to="/app" replace/>}/>
  </Route></Route>
  <Route path="*" element={<Navigate to="/" replace/>}/>
</Routes></Suspense><GlassMaterialDefs/><ThemeToaster/></AuthProvider></BrowserRouter></StrictMode>)
