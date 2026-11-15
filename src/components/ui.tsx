import { Dialog } from '@base-ui/react/dialog'
import { X, ArrowRight, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { Subject } from '../data/curriculum'

export function PageHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: ReactNode }) {
  return <div className="page-heading"><div>{eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}<h1>{title}</h1><p>{description}</p></div>{action}</div>
}
export function SubjectIcon({ subject, small=false }: { subject: Subject; small?: boolean }) { return <span aria-hidden="true" className={`subject-icon ${subject.color} ${small ? 'small' : ''}`}>{subject.symbol}</span> }
export function ProgressBar({ value, className='' }: { value: number; className?: string }) { return <div className={`progress-track ${className}`} role="progressbar" aria-label="Progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)}><div style={{transform:`scaleX(${Math.max(0,Math.min(100,value))/100})`}}/></div> }
export function EmptyState({title, description, to, label='Explore topics'}:{title:string;description:string;to?:string;label?:string}) { return <div className="empty-state"><span><BookOpen size={25}/></span><h3>{title}</h3><p>{description}</p>{to ? <Link className="button button-secondary" to={to}>{label}<ArrowRight size={15}/></Link> : null}</div> }
export function Modal({open,onOpenChange,title,description,children}:{open:boolean;onOpenChange:(open:boolean)=>void;title:string;description?:string;children:ReactNode}) {
  return <Dialog.Root open={open} onOpenChange={onOpenChange}><Dialog.Portal><Dialog.Backdrop className="dialog-backdrop"/><Dialog.Popup className="dialog-popup"><div className="dialog-heading"><Dialog.Title>{title}</Dialog.Title><Dialog.Close className="icon-button" aria-label="Close dialog"><X size={19}/></Dialog.Close></div>{description ? <Dialog.Description className="dialog-description">{description}</Dialog.Description> : null}{children}</Dialog.Popup></Dialog.Portal></Dialog.Root>
}
