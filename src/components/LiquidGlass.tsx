import { useEffect, useId, useRef, useState, type PointerEvent } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'motion/react'
import { ArrowUpRight, Sparkles } from 'lucide-react'
import { Orb } from './Orb'

// A smooth displacement field refracts the backdrop inward at the edge of the lens.
// It is generated once; pointer movement never redraws a canvas or rerenders React.
let cachedMap:string|undefined
function displacementMap() {
  if(cachedMap) return cachedMap
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 160
  const ctx = canvas.getContext('2d')!
  const pixels = ctx.createImageData(160, 160)
  for (let y=0;y<160;y++) for(let x=0;x<160;x++) {
    const nx=(x-79.5)/79.5, ny=(y-79.5)/79.5
    const radius=Math.hypot(nx,ny)
    const edge=Math.min(1-Math.abs(nx),1-Math.abs(ny))
    const strength=Math.exp(-Math.max(0,edge)*9)*0.85+Math.pow(Math.min(1,radius),3)*0.15
    const index=(y*160+x)*4
    pixels.data[index]=128+nx*strength*105
    pixels.data[index+1]=128+ny*strength*105
    pixels.data[index+2]=128
    pixels.data[index+3]=255
  }
  ctx.putImageData(pixels,0,0)
  cachedMap=canvas.toDataURL()
  return cachedMap
}

export function LiquidGlass() {
  const filterId = `glass-${useId().replace(/[^a-zA-Z0-9]/g,'')}`
  const [map,setMap]=useState('')
  const stage=useRef<HTMLDivElement>(null)
  const reduced=useReducedMotion()
  const targetX=useMotionValue(0),targetY=useMotionValue(0)
  const x=useSpring(targetX,{bounce:0,duration:0.4})
  const y=useSpring(targetY,{bounce:0,duration:0.4})
  const rotate=useTransform(x,[-22,22],[-3,3])
  const scaleX=useTransform(x,[-22,0,22],[1.045,1,1.045])
  const scaleY=useTransform(y,[-18,0,18],[1.035,1,1.035])
  const sheenX=useTransform(x,[-22,22],[-35,35])
  useEffect(()=>{setMap(displacementMap())},[])
  function move(event:PointerEvent<HTMLDivElement>) {
    if(reduced || event.pointerType==='touch') return
    const box=stage.current!.getBoundingClientRect()
    targetX.set(((event.clientX-box.left)/box.width-.5)*44)
    targetY.set(((event.clientY-box.top)/box.height-.5)*36)
  }
  return <div className="liquid-stage" ref={stage} onPointerMove={move} onPointerLeave={()=>{targetX.set(0);targetY.set(0)}}>
    <div className="stage-grid"/>
    <div className="stage-orbit orbit-one"/><div className="stage-orbit orbit-two"/>
    <div className="stage-topic topic-algebra"><span>01 / MATHEMATICS</span><strong>x² + 5x + 6</strong><small>A different way to see the problem.</small></div>
    <div className="stage-topic topic-science"><span>02 / PHYSICS</span><strong>F = ma<span>↗</span></strong><small>One idea. A world of connections.</small></div>
    <div className="liquid-orb"><Orb/></div>
    <span className="stage-word" aria-hidden="true">curiosity</span>
    <svg className="glass-filter-defs" aria-hidden="true"><defs><filter id={filterId} x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
      <feImage href={map || undefined} width="100%" height="100%" preserveAspectRatio="none" result="displacement"/>
      <feDisplacementMap in="SourceGraphic" in2="displacement" scale="56" xChannelSelector="R" yChannelSelector="G"/>
    </filter></defs></svg>
    <motion.div className="liquid-lens" style={{x:reduced?0:x,y:reduced?0:y,rotate:reduced?0:rotate,scaleX:reduced?1:scaleX,scaleY:reduced?1:scaleY}}>
      <div className="lens-refraction" style={map?{backdropFilter:`url(#${filterId}) saturate(1.25)`}:undefined}/>
      <motion.div className="lens-sheen" style={{x:reduced?0:sheenX}}/>
      <div className="lens-face"><span className="lens-icon"><Sparkles size={24}/></span><div><span className="lens-kicker">YOUR STUDY COMPANION</span><strong>A little clearer.<br/>A lot more possible.</strong></div><ArrowUpRight size={23}/></div>
      <div className="lens-bottom"><span><i/>Learning, with you in mind.</span><span>PROJECT SAGE</span></div>
    </motion.div>
    <div className="stage-bottom"><span>BUILT FOR CURIOUS MINDS</span><span>Move your pointer. See things differently.<ArrowUpRight size={12}/></span></div>
  </div>
}

export function GlassMaterialDefs(){
  const [map,setMap]=useState('')
  useEffect(()=>{setMap(displacementMap())},[])
  return <svg className="glass-filter-defs" aria-hidden="true"><defs><filter id="sage-panel-glass" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB"><feImage href={map || undefined} width="100%" height="100%" preserveAspectRatio="none" result="panel-map"/><feDisplacementMap in="SourceGraphic" in2="panel-map" scale="12" xChannelSelector="R" yChannelSelector="G"/></filter></defs></svg>
}

export function WorkspaceMaterial(){return <div className="workspace-material-backdrop" aria-hidden="true"><svg viewBox="0 0 1200 1300" preserveAspectRatio="xMidYMin slice"><defs><linearGradient id="workspace-stroke" x1="0" y1="0" x2="1200" y2="1100" gradientUnits="userSpaceOnUse"><stop stopColor="#c7a4ff" stopOpacity=".32"/><stop offset=".5" stopColor="#c7a4ff" stopOpacity=".12"/><stop offset="1" stopColor="#acceb9" stopOpacity=".25"/></linearGradient><radialGradient id="workspace-halo"><stop stopColor="#8661b6" stopOpacity=".2"/><stop offset="1" stopColor="#8661b6" stopOpacity="0"/></radialGradient></defs><ellipse cx="920" cy="340" rx="440" ry="450" fill="url(#workspace-halo)"/>{Array.from({length:12},(_,i)=><path key={i} d={`M-100 ${100+i*25} C320 ${-100+i*37} 600 ${720+i*13} 1350 ${150+i*35}`} stroke="url(#workspace-stroke)" strokeWidth="1.2" fill="none"/>)}<circle cx="1010" cy="470" r="260" stroke="url(#workspace-stroke)" fill="none"/><circle cx="1010" cy="470" r="290" stroke="url(#workspace-stroke)" fill="none"/><circle cx="1010" cy="470" r="320" stroke="url(#workspace-stroke)" fill="none"/><text x="80" y="800" fill="#b59bdb" opacity=".035" fontSize="340" fontWeight="600" letterSpacing="-25">SAGE</text></svg></div>}
