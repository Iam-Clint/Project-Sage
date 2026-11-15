import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Toaster } from 'sonner'

type Theme='light'|'dark'
function currentTheme():Theme{return document.documentElement.dataset.theme==='light'?'light':'dark'}
export function ThemeToggle(){
  const [theme,setTheme]=useState(currentTheme)
  useEffect(()=>{
    const sync=()=>setTheme(currentTheme())
    window.addEventListener('sage-theme-change',sync)
    return()=>window.removeEventListener('sage-theme-change',sync)
  },[])
  function toggle(){
    const next=theme==='dark'?'light':'dark'
    document.documentElement.dataset.theme=next
    document.documentElement.style.colorScheme=next
    try{localStorage.setItem('sage-theme',next)}catch{ /* The current theme still works without storage. */ }
    window.dispatchEvent(new Event('sage-theme-change'))
  }
  return <button className="theme-toggle" onClick={toggle} aria-label={`Switch to ${theme==='dark'?'light':'dark'} mode`} title={`Switch to ${theme==='dark'?'light':'dark'} mode`}>{theme==='dark'?<Sun size={17}/>:<Moon size={17}/>}</button>
}

export function ThemeToaster(){
  const [theme,setTheme]=useState(currentTheme)
  useEffect(()=>{const sync=()=>setTheme(currentTheme());window.addEventListener('sage-theme-change',sync);return()=>window.removeEventListener('sage-theme-change',sync)},[])
  return <Toaster theme={theme} position="bottom-right" closeButton/>
}
