import { describe, expect, it } from 'vitest'
import { accuracy, chooseQuestion, isStudyDate, nextDifficulty, streak } from '../../src/lib/learning'
import { questions } from '../../src/data/curriculum'
import type { Attempt } from '../../src/lib/learning'

describe('adaptive learning', () => {
  it('bounds difficulty and adjusts after each answer', () => {
    expect(nextDifficulty(1, false)).toBe(1)
    expect(nextDifficulty(1, true)).toBe(2)
    expect(nextDifficulty(3, true)).toBe(3)
    expect(nextDifficulty(3, false)).toBe(2)
  })
  it('chooses an unused question nearest the target and stops when exhausted', () => {
    const pool = questions.filter(q=>q.subjectId === 'maths')
    const chosen = chooseQuestion(pool, [], 3)!
    expect(chosen.difficulty).toBe(3)
    expect(chooseQuestion(pool, [chosen.id], 3)?.id).not.toBe(chosen.id)
    expect(chooseQuestion(pool, pool.map(q=>q.id), 2)).toBeUndefined()
  })
  it('accepts actual dates and rejects rolled-over or malformed dates', () => {
    expect(isStudyDate('2024-02-29')).toBe(true)
    for(const date of ['2025-02-29','2026-13-01','2026-00-15','2026-11-31','2026-11-00','','tomorrow',null]) expect(isStudyDate(date)).toBe(false)
  })
  it('counts a streak by unique local days and permits yesterday as the latest day', () => {
    const attempts = [1,1,2,3,5].map((days,i)=>({id:String(i),date:new Date(2026,10,15-days,16).toISOString(),correct:i%2===0})) as Attempt[]
    expect(streak(attempts,new Date(2026,10,15,12))).toBe(3)
    expect(accuracy([])).toBe(0)
    expect(accuracy(attempts)).toBe(60)
  })
})
