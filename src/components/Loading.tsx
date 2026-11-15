export function Loading({ workspace=false }: {workspace?:boolean}) {
  return <div className={`loading-skeleton ${workspace?'workspace-skeleton':''}`} role="status" aria-label="Loading your next chapter"><span className="sr-only">Loading your next chapter…</span><div className="skeleton-heading"><i/><i/></div><div className="skeleton-hero"/><div className="skeleton-cards"><i/><i/><i/></div><div className="skeleton-content"/></div>
}
