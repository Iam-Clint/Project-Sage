import { Link } from 'react-router-dom'

export function Brand({ compact = false }: { compact?: boolean }) {
  return <Link to="/" className="brand" aria-label="SAGE home"><span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span>{compact ? null : <span>SAGE<span className="brand-subtitle">A little wiser, every day.</span></span>}</Link>
}
