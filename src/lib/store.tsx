import { createContext, useContext, useState, type ReactNode } from 'react'
import { createStore, useStore, type StoreApi } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { questions, topics, findSubject, type Question } from '../data/curriculum'
import { isStudyDate, localDate, type Attempt } from './learning'
import { useAuth } from './auth'

export type StudyPlan = { id: string; title: string; subjectId: string; date: string; time: string; minutes: number; done: boolean }
type LearningState = { attempts: Attempt[]; completedLessons: string[]; savedTopics: string[]; plans: StudyPlan[]; dailyGoal: number; recordAttempt: (question: Question, correct: boolean, seconds: number) => void; completeLesson: (id: string) => void; toggleSaved: (id: string) => void; addPlan: (plan: Omit<StudyPlan, 'id' | 'done'>) => void; togglePlan: (id: string) => void; removePlan: (id: string) => void; setDailyGoal: (minutes: number) => void; reset: () => void }
const StoreContext = createContext<StoreApi<LearningState> | null>(null)
function validPlan(plan: unknown): plan is StudyPlan {
  if (!plan || typeof plan !== 'object') return false
  const p = plan as Partial<StudyPlan>
  return typeof p.id === 'string' && !!p.id && typeof p.title === 'string' && !!p.title.trim() && p.title.length <= 100 &&
    typeof p.subjectId === 'string' && !!findSubject(p.subjectId) && isStudyDate(p.date) &&
    typeof p.time === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(p.time) &&
    typeof p.minutes === 'number' && Number.isFinite(p.minutes) && p.minutes >= 5 && p.minutes <= 180 && typeof p.done === 'boolean'
}
function validAttempt(attempt: unknown): attempt is Attempt {
  if (!attempt || typeof attempt !== 'object') return false
  const a = attempt as Partial<Attempt>
  const question = questions.find(q => q.id === a.questionId)
  return typeof a.id === 'string' && !!a.id && !!question && a.topicId === question.topicId && a.subjectId === question.subjectId &&
    a.difficulty === question.difficulty && typeof a.correct === 'boolean' && typeof a.date === 'string' &&
    Number.isFinite(new Date(a.date).getTime()) && typeof a.seconds === 'number' && Number.isFinite(a.seconds) && a.seconds >= 0
}
function seed(demo: boolean) {
  const attempts: Attempt[] = []
  if (demo) for (let day=6; day>=0; day--) {
    if (day === 2) continue
    const date = new Date(); date.setDate(date.getDate() - day); date.setHours(16, 0, 0, 0)
    for (let j=0; j<3; j++) {
      const question = questions[(day * 5 + j) % questions.length]
      attempts.push({ id:`demo-${day}-${j}`, questionId:question.id, topicId:question.topicId, subjectId:question.subjectId, correct:(day+j)%4!==0, difficulty:question.difficulty, date:date.toISOString(), seconds:180+j*120 })
    }
  }
  return { attempts, completedLessons:demo ? ['maths-2','maths-3','physics-1','biology-1','english-3'] : [], savedTopics:demo ? ['maths-1','biology-5'] : [], plans:demo ? [{id:'demo-plan-1',title:'Quadratic equations',subjectId:'maths',date:localDate(),time:'17:00',minutes:20,done:false},{id:'demo-plan-2',title:'Explore photosynthesis',subjectId:'biology',date:localDate(),time:'18:00',minutes:15,done:false}] : [], dailyGoal:20 }
}
function createLearningStore(id: string, demo: boolean) {
  return createStore<LearningState>()(persist((set) => ({
    ...seed(demo),
    recordAttempt: (question, correct, seconds) => set(state => ({ attempts:[...state.attempts, {id:crypto.randomUUID(),questionId:question.id,topicId:question.topicId,subjectId:question.subjectId,correct,difficulty:question.difficulty,date:new Date().toISOString(),seconds:Number.isFinite(seconds) ? Math.max(0,Math.round(seconds)) : 0}] })),
    completeLesson: id => set(state => ({completedLessons:state.completedLessons.includes(id) ? state.completedLessons : [...state.completedLessons,id]})),
    toggleSaved: id => set(state => ({savedTopics:state.savedTopics.includes(id) ? state.savedTopics.filter(item => item!==id) : [...state.savedTopics,id]})),
    addPlan: plan => { const entry = {...plan,id:crypto.randomUUID(),done:false}; if (validPlan(entry)) set(state => ({plans:[...state.plans,entry]})) },
    togglePlan: id => set(state => ({plans:state.plans.map(plan => plan.id===id ? {...plan,done:!plan.done} : plan)})),
    removePlan: id => set(state => ({plans:state.plans.filter(plan => plan.id!==id)})),
    setDailyGoal: dailyGoal => set({dailyGoal}),
    reset: () => set(seed(demo)),
  }), {name:`sage-learning-v1-${id}`,version:1,storage:createJSONStorage(() => localStorage),partialize:({attempts,completedLessons,savedTopics,plans,dailyGoal})=>({attempts,completedLessons,savedTopics,plans,dailyGoal}),merge:(persisted,current)=> {
    const value = persisted as Partial<LearningState> | undefined
    if (!value || !Array.isArray(value.attempts) || !Array.isArray(value.completedLessons) || !Array.isArray(value.savedTopics) || !Array.isArray(value.plans)) return current
    return {...current,attempts:value.attempts.filter(validAttempt),completedLessons:value.completedLessons.filter(id=>topics.some(t=>t.id===id)),savedTopics:value.savedTopics.filter(id=>topics.some(t=>t.id===id)),plans:value.plans.filter(validPlan),dailyGoal:typeof value.dailyGoal==='number' && value.dailyGoal>=5 && value.dailyGoal<=120 ? value.dailyGoal : 20}
  }}))
}
export function LearningProvider({ children }: { children: ReactNode }) {
  const {learner} = useAuth()
  if (!learner) return null
  return <ScopedProvider key={learner.id} id={learner.id} demo={learner.demo}>{children}</ScopedProvider>
}
function ScopedProvider({id,demo,children}:{id:string;demo:boolean;children:ReactNode}) {
  const [store] = useState(()=>createLearningStore(id,demo))
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}
export function useLearning<T>(selector:(state:LearningState)=>T):T {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useLearning must be used within LearningProvider')
  return useStore(store,selector)
}
