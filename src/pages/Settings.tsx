import { useState } from 'react'
import { toast } from 'sonner'
import { PageHeading, Modal } from '../components/ui'
import { useAuth } from '../lib/auth'
import { useLearning } from '../lib/store'

export default function Settings() {
  const {learner}=useAuth()
  const goal=useLearning(s=>s.dailyGoal)
  const setGoal=useLearning(s=>s.setDailyGoal)
  const reset=useLearning(s=>s.reset)
  const [open,setOpen]=useState(false)
  return <><PageHeading eyebrow="MAKE THIS SPACE YOURS" title="Learning, on your terms." description="A few details to help SAGE fit your day."/><div className="settings-layout"><section className="panel settings-panel"><h2>Your profile</h2><div className="settings-row"><span>Name</span><strong>{learner?.name}</strong></div><div className="settings-row"><span>Email</span><strong>{learner?.email}</strong></div><div className="settings-row"><span>Workspace</span><strong>{learner?.demo ? 'Demo preview' : 'Student'}</strong></div></section><section className="panel settings-panel"><h2>A pace you can keep</h2><p>Your daily goal tracks time spent answering practice questions.</p><label className="field">Daily practice goal<select value={goal} onChange={e=>{setGoal(Number(e.target.value));toast.success('Your daily goal is updated')}}>{[5,10,15,20,30,45,60,90,120].map(n=><option value={n} key={n}>{n} minutes</option>)}</select></label></section><section className="panel settings-panel"><h2>Your learning data</h2><p>Progress, saved topics, and study plans are stored in this browser for your profile. Cross-device sync will be added in the backend phase.</p><button className="button button-danger" onClick={()=>setOpen(true)}>Reset local progress</button></section></div><Modal open={open} onOpenChange={setOpen} title="Start this workspace fresh?" description={learner?.demo ? 'This restores the sample activity and clears changes made in this demo.' : 'This clears your practice answers, explored lessons, bookmarks, and study plans in this browser.'}><div className="dialog-actions"><button className="button button-secondary" onClick={()=>setOpen(false)}>Keep my progress</button><button className="button button-danger" onClick={()=>{reset();setOpen(false);toast.success('Your workspace is ready for a fresh start')}}>Reset progress</button></div></Modal></>
}
