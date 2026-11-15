import { useEffect, useRef, type ReactNode } from 'react'

export function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = ref.current
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { element.dataset.visible = 'true'; observer.disconnect() }
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' })
    element.dataset.reveal = 'true'
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return <div className={`reveal ${className}`} ref={ref}>{children}</div>
}
