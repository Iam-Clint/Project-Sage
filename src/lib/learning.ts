import type { Difficulty, Question } from '../data/curriculum'

export type Attempt = { id: string; questionId: string; topicId: string; subjectId: string; correct: boolean; difficulty: Difficulty; date: string; seconds: number }
export function nextDifficulty(current: Difficulty, correct: boolean): Difficulty { return Math.max(1, Math.min(3, current + (correct ? 1 : -1))) as Difficulty }
export function chooseQuestion(pool: Question[], used: string[], difficulty: Difficulty): Question | undefined {
  return pool.filter(question => !used.includes(question.id)).sort((a, b) => Math.abs(a.difficulty - difficulty) - Math.abs(b.difficulty - difficulty))[0]
}
export function accuracy(attempts: Attempt[]): number { return attempts.length ? Math.round(attempts.filter(a => a.correct).length / attempts.length * 100) : 0 }
export function localDate(date: Date = new Date()): string { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` }
export function streak(attempts: Attempt[], now = new Date()): number {
  const dates = new Set(attempts.map(attempt => localDate(new Date(attempt.date))))
  const cursor = new Date(now); cursor.setHours(12, 0, 0, 0)
  if (!dates.has(localDate(cursor))) cursor.setDate(cursor.getDate() - 1)
  let count = 0
  while (dates.has(localDate(cursor))) { count++; cursor.setDate(cursor.getDate() - 1) }
  return count
}
export function weekDays(now = new Date()): Date[] {
  const monday = new Date(now); monday.setHours(12, 0, 0, 0); monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7)
  return Array.from({length:7}, (_, index) => { const date = new Date(monday); date.setDate(date.getDate() + index); return date })
}
