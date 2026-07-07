'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'

type MascotPose = 'greeting' | 'curious' | 'thinking' | 'excited' | 'encouraging' | 'happy' | 'surprised' | 'gentle'

interface MascotProps {
  pose?: MascotPose
  state?: 'happy' | 'neutral' | 'sad'
  message?: string
  size?: number
}

const STATE_TO_POSE: Record<string, MascotPose> = {
  happy: 'excited',
  neutral: 'thinking',
  sad: 'gentle',
}

const POSE_SRC: Record<MascotPose, string> = {
  greeting: '/mascot/mascot-greeting.svg',
  curious: '/mascot/mascot-curious.svg',
  thinking: '/mascot/mascot-thinking.svg',
  excited: '/mascot/mascot-excited.svg',
  encouraging: '/mascot/mascot-encouraging.svg',
  happy: '/mascot/mascot-happy.svg',
  surprised: '/mascot/mascot-surprised.svg',
  gentle: '/mascot/mascot-gentle.svg',
}

export function Mascot({ pose, state, message, size = 100 }: MascotProps) {
  const resolvedPose: MascotPose = pose || (state ? STATE_TO_POSE[state] : 'greeting')
  const src = POSE_SRC[resolvedPose]
  const [bounce, setBounce] = useState(false)

  useEffect(() => {
    setBounce(true)
    const t = setTimeout(() => setBounce(false), 600)
    return () => clearTimeout(t)
  }, [resolvedPose])

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        style={{
          width: size,
          height: size * 1.2,
          transform: bounce ? 'scale(1.15)' : 'scale(1)',
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <Image
          src={src}
          alt={resolvedPose}
          width={size}
          height={size * 1.2}
          className="w-full h-full"
          priority
        />
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
