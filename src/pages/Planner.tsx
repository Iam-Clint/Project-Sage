import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CalendarDays, Check, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { subjects, findSubject } from '../data/curriculum'
import { PageHeading, Modal, EmptyState } from '../components/ui'
import { useLearning } from '../lib/store'
import { isStudyDate, localDate } from '../lib/learning'

export default function Planner() {
  const [params]=useSearchParams()
  const [date,setDate]=useState(isStudyDate(params.get('date')) ? params.get('date')! : localDate())
  const [open,setOpen]=useState(false)
  const [error,setError]=useState('')
  const plans=useLearning(s=>s.plans)
  const add=useLearning(s=>s.addPlan)
  const toggle=useLearning(s=>s.togglePlan)
  const remove=useLearning(s=>s.removePlan)
  const dayPlans=plans.filter(p=>p.date===date).sort((a,b)=>a.time.localeCompare(b.time))
  function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault()
    const form=new FormData(e.currentTarget)
    const entry={title:String(form.get('title')).trim(),subjectId:String(form.get('subject')),date:String(form.get('date')),time:String(form.get('time')),minutes:Number(form.get('minutes'))}
    if(!entry.title || !findSubject(entry.subjectId) || !isStudyDate(entry.date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(entry.time) || !Number.isFinite(entry.minutes) || entry.minutes<5 || entry.minutes>180){setError('Add a session title, a valid date and time, and a duration of 5–180 minutes.');return}
    add(entry);setDate(entry.date);setError('');setOpen(false);toast.success('A little time for your next chapter.')
  }
  return <><PageHeading eyebrow="MAKE A LITTLE ROOM FOR LEARNING" title="Your time. Your next step." description="A simple plan makes it easier to show up. Keep yours realistic." action={<button className="button button-primary" onClick={()=>{setError('');setOpen(true)}}><Plus size={16}/>Add study session</button>}/><section className="panel planner-panel"><div className="planner-toolbar"><h2><CalendarDays size={18}/>Your study sessions</h2><label className="field"><span className="sr-only">Choose a date</span><input type="date" value={date} onChange={e=>setDate(e.target.value || localDate())} required/></label></div>{dayPlans.length ? <div className="plan-list">{dayPlans.map(plan=><article className={`plan-row ${plan.done ? 'plan-done' : ''}`} key={plan.id}><button className="plan-checkbox" aria-label={`${plan.done ? 'Mark incomplete' : 'Complete'} ${plan.title}`} aria-pressed={plan.done} onClick={()=>toggle(plan.id)}>{plan.done ? <Check size={17}/> : null}</button><span className={`subject-dot ${findSubject(plan.subjectId)?.color}`}/><div><strong>{plan.title}</strong><small>{findSubject(plan.subjectId)?.name} · {plan.time} · {plan.minutes} minutes</small></div><button className="icon-button" aria-label={`Remove ${plan.title}`} onClick={()=>{remove(plan.id);toast('Study session removed')}}><Trash2 size={16}/></button></article>)}</div> : <EmptyState title="A little space, a fresh possibility." description="Add a study session for this day. Even 15 focused minutes is a good start."/>}</section><Modal open={open} onOpenChange={setOpen} title="Make time for your next idea" description="Choose a subject and a pace that works for you."><form onSubmit={submit}><label className="field">Session title<input name="title" placeholder="e.g. Work through quadratic equations" required maxLength={100}/></label><label className="field">Subject<select name="subject">{subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><div className="form-columns"><label className="field">Date<input name="date" type="date" defaultValue={date} required/></label><label className="field">Time<input name="time" type="time" defaultValue="17:00" required/></label></div><label className="field">Minutes<input name="minutes" type="number" defaultValue={20} min={5} max={180} required/></label>{error ? <p className="inline-error" role="alert">{error}</p> : null}<div className="dialog-actions"><button className="button button-secondary" type="button" onClick={()=>setOpen(false)}>Cancel</button><button className="button button-primary" type="submit">Save session<Plus size={15}/></button></div></form></Modal></>
}
