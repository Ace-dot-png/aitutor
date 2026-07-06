'use client'
import { useEffect, useState } from 'react'

type MascotState = 'happy' | 'neutral' | 'sad'

interface MascotProps {
  state: MascotState
  message?: string
  size?: number
}

const PlaceholderFace = ({ state }: { state: MascotState }) => {
  const mouth = state === 'happy'
    ? 'M 35 60 Q 50 75 65 60'
    : state === 'sad'
    ? 'M 35 70 Q 50 55 65 70'
    : 'M 35 65 L 65 65'

  const eyebrows = state === 'sad'
    ? <><line x1="30" y1="32" x2="45" y2="38" stroke="#0A0A0A" strokeWidth="3" strokeLinecap="round"/><line x1="55" y1="38" x2="70" y2="32" stroke="#0A0A0A" strokeWidth="3" strokeLinecap="round"/></>
    : state === 'happy'
    ? <><line x1="30" y1="36" x2="45" y2="32" stroke="#0A0A0A" strokeWidth="3" strokeLinecap="round"/><line x1="55" y1="32" x2="70" y2="36" stroke="#0A0A0A" strokeWidth="3" strokeLinecap="round"/></>
    : <><line x1="30" y1="35" x2="45" y2="35" stroke="#0A0A0A" strokeWidth="3" strokeLinecap="round"/><line x1="55" y1="35" x2="70" y2="35" stroke="#0A0A0A" strokeWidth="3" strokeLinecap="round"/></>

  const colour = state === 'happy' ? '#1cdb19' : state === 'sad' ? '#d72d02' : '#121bde'

  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="45" fill={colour} />
      {eyebrows}
      <circle cx="38" cy="45" r="5" fill="#0A0A0A" />
      <circle cx="62" cy="45" r="5" fill="#0A0A0A" />
      <circle cx="40" cy="43" r="2" fill="white" />
      <circle cx="64" cy="43" r="2" fill="white" />
      <path d={mouth} stroke="#0A0A0A" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export function Mascot({ state, message, size = 100 }: MascotProps) {
  const [bounce, setBounce] = useState(false)

  useEffect(() => {
    setBounce(true)
    const t = setTimeout(() => setBounce(false), 600)
    return () => clearTimeout(t)
  }, [state])

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        style={{
          width: size,
          height: size,
          transform: bounce ? 'scale(1.15)' : 'scale(1)',
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        <PlaceholderFace state={state} />
      </div>
      {message && (
        <div
          style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}
          className="rounded-lg px-3 py-2 text-sm text-center max-w-48"
        >
          <p className="text-[#F5F5F5]">{message}</p>
        </div>
      )}
    </div>
  )
}
