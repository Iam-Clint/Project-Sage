import { localDate, weekDays, type Attempt } from '../lib/learning'

export function Activity({attempts}:{attempts:Attempt[]}) {
  const days = weekDays()
  const cells = days.map(date => {
    const items = attempts.filter(a=>localDate(new Date(a.date))===localDate(date))
    const seconds=items.reduce((sum,a)=>sum+a.seconds,0)
    return {date,seconds,questions:items.length}
  })
  return <div className="activity-chart" role="img" aria-label={`This week’s practice: ${cells.map(c=>`${c.date.toLocaleDateString('en',{weekday:'long'})}, ${Math.round(c.seconds/60)} minutes, ${c.questions} answers`).join('; ')}`}><div className="activity-y-labels"><span>30m</span><span>20m</span><span>10m</span><span>0</span></div><div className="activity-columns">{cells.map(({date,seconds})=><div key={localDate(date)} className={`activity-day ${localDate(date)===localDate() ? 'today' : ''}`}><div className="activity-dots">{Array.from({length:12},(_,i)=><i key={i} className={seconds/60>(11-i)*2.5 ? 'filled' : ''}/>)}</div><span>{date.toLocaleDateString('en',{weekday:'short'}).slice(0,3)}</span></div>)}</div></div>
}
