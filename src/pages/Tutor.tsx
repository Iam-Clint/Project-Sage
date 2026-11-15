import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, BookOpen, Lightbulb, Sparkles } from 'lucide-react'
import { findTopic, topics } from '../data/curriculum'
import { PageHeading } from '../components/ui'

export default function Tutor() {
  const [params] = useSearchParams()
  const [topicId, setTopicId] = useState(findTopic(params.get('topic') || '')?.id || topics[0].id)
  const [step, setStep] = useState(0)
  const topic = findTopic(topicId)!
  return <><PageHeading eyebrow="LET’S FIGURE IT OUT TOGETHER" title="A space for your questions." description="Work through one idea at a time with your guided SAGE tutor."/>
    <div className="tutor-layout"><aside className="panel tutor-topics"><h2><BookOpen size={17}/>Choose a concept</h2><label className="field"><span className="sr-only">Topic</span><select value={topicId} onChange={e=>{setTopicId(e.target.value);setStep(0)}}>{topics.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label><p>This guided preview uses original lesson content. Your AI tutor will be connected in the backend phase.</p><Link className="text-link" to={`/app/lesson/${topic.id}`}>Open the lesson<ArrowRight size={14}/></Link></aside>
    <section className="panel tutor-conversation"><div className="tutor-conversation-heading"><Sparkles size={19}/><strong>SAGE tutor</strong><span className="demo-badge">GUIDED PREVIEW</span></div><div className="tutor-messages" aria-live="polite"><div className="chat-message"><span className="chat-avatar"><Sparkles size={16}/></span><div><span className="eyebrow">SAGE</span><p>Let’s explore {topic.name.toLowerCase()}. Start with this idea:</p><p>{topic.idea}</p></div></div>{step>=1 ? <><div className="chat-message learner-message"><p>Can you show me an example?</p></div><div className="chat-message"><span className="chat-avatar"><Lightbulb size={16}/></span><div><span className="eyebrow">A WORKED EXAMPLE</span><p>{topic.example}</p></div></div></> : null}{step>=2 ? <><div className="chat-message learner-message"><p>What should I remember?</p></div><div className="chat-message"><span className="chat-avatar"><Sparkles size={16}/></span><div><p>{topic.question.hint}</p><p>Ready to give it a try? There’s no pressure to get it right the first time.</p><Link to={`/app/practice?topic=${topic.id}&subject=${topic.subjectId}`} className="text-link">Try the concept check<ArrowRight size={14}/></Link></div></div></> : null}</div><div className="tutor-controls">{step<2 ? <button className="button button-secondary" onClick={()=>setStep(step+1)}>{step===0 ? 'Show me an example' : 'Help me remember'}<ArrowRight size={16}/></button> : <button className="button button-secondary" onClick={()=>setStep(0)}>Explore this idea again</button>}<small>Authored guidance · AI replies coming next</small></div></section></div></>
}
