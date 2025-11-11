import { useRef, useEffect, useState } from 'react'

interface Profile {
  id: number
  name: string
  role: string
  image: string
  bio: string
  techStack: string[]
  location: string
  company?: string
}

interface SwipeCardProps {
  profile: Profile
  isTop: boolean
  isExpanded: boolean
  onSwipe: (direction: 'left' | 'right' | 'down') => void
  onExpand: () => void
}

export function SwipeCard({ profile, isTop, isExpanded, onSwipe, onExpand }: SwipeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState({ x: 0, y: 0, rotate: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const startPos = useRef({ x: 0, y: 0 })
  const currentPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!isTop || !cardRef.current) return

    const handleMouseDown = (e: MouseEvent) => {
      setIsDragging(true)
      startPos.current = { x: e.clientX, y: e.clientY }
      currentPos.current = { x: 0, y: 0 }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      const dx = e.clientX - startPos.current.x
      const dy = e.clientY - startPos.current.y
      currentPos.current = { x: dx, y: dy }

      const rotate = (dx / window.innerWidth) * 20
      setTransform({ x: dx, y: dy, rotate })
    }

    const handleMouseUp = () => {
      setIsDragging(false)

      const { x, y } = currentPos.current
      const distance = Math.sqrt(x * x + y * y)
      const threshold = 100
      const angle = Math.atan2(y, x) * (180 / Math.PI)

      if (distance > threshold) {
        if (angle > -135 && angle < -45) {
          onExpand()
          setTransform({ x: 0, y: 0, rotate: 0 })
        } else if (angle > -45 && angle < 45) {
          onSwipe('right')
          const finalX = x * 2
          const finalY = y * 2
          const finalRotate = (x / window.innerWidth) * 45
          setTransform({ x: finalX, y: finalY, rotate: finalRotate })
        } else {
          onSwipe('left')
          const finalX = x * 2
          const finalY = y * 2
          const finalRotate = (x / window.innerWidth) * 45
          setTransform({ x: finalX, y: finalY, rotate: finalRotate })
        }
      } else {
        setTransform({ x: 0, y: 0, rotate: 0 })
      }
    }

    const element = cardRef.current
    element.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      element.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, isTop, onSwipe, onExpand])

  if (!isTop) {
    return (
      <div className="absolute inset-0 bg-slate-800 rounded-2xl shadow-lg pointer-events-none transform scale-95 opacity-60" />
    )
  }

  const swipeIndicator = (() => {
    const angle = Math.atan2(transform.y, transform.x) * (180 / Math.PI)
    if (transform.x === 0 && transform.y === 0) return null
    if (angle > -135 && angle < -45) return { text: 'LEARN MORE', color: 'text-purple-400', bg: 'bg-purple-900/40' }
    if (angle > -45 && angle < 45) return { text: 'CONNECT', color: 'text-blue-400', bg: 'bg-black/40' }
    return { text: 'PASS', color: 'text-red-400', bg: 'bg-red-900/40' }
  })()

  return (
    <div
      ref={cardRef}
      className={`absolute inset-0 bg-primary 00-2xl shadow-2xl cursor-grab active:cursor-grabbing overflow-hidden transition-all ${isExpanded ? 'static rounded-none' : ''}`}
      style={{
        transform: isExpanded ? 'none' : `translate(${transform.x}px, ${transform.y}px) rotate(${transform.rotate}deg)`,
        opacity: isExpanded ? 1 : Math.max(0, 1 - Math.abs(transform.x) / 300),
        position: isExpanded ? 'static' : 'absolute',
      }}
    >
      <div className="relative w-full h-full">
        <img
          src={profile.image || '/placeholder.svg'}
          alt={profile.name}
          className={`w-full ${isExpanded ? 'h-64' : 'h-full'} object-cover`}
        />

        <div
          className={`absolute inset-0 bg-linear-to-t ${isExpanded ? 'from-slate-900 via-slate-800 to-transparent' : 'from-black/90 via-black/40 to-transparent'}`}
        />

        <div
          className={`absolute ${isExpanded ? 'top-0 left-0 right-0 bottom-0 p-6 overflow-y-auto' : 'bottom-0 left-0 right-0 p-6'} text-white`}
        >
          <h2 className="text-3xl font-bold">{profile.name}</h2>
          <p className="text-blue-400 font-semibold mt-1">{profile.role}</p>
          {profile.company && <p className="text-sm text-gray-300 mt-1">{profile.company}</p>}
          <p className="text-sm text-gray-300 mt-2 flex items-center gap-1">📍 {profile.location}</p>

          <p className={`text-sm text-gray-300 mt-3 ${isExpanded ? '' : 'line-clamp-2'}`}>{profile.bio}</p>

          {isExpanded && (
            <>
              <div className="mt-6">
                <h3 className="font-semibold text-lg mb-3">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-blue-900/50 text-blue-300 rounded-full text-xs font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
                  Connect
                </button>
                <button className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors">
                  Pass
                </button>
              </div>
            </>
          )}
        </div>

        {!isExpanded && swipeIndicator && (
          <div className={`absolute top-8 right-8 ${swipeIndicator.bg} px-4 py-2 rounded-full`}>
            <span className={`font-bold text-lg ${swipeIndicator.color}`}>{swipeIndicator.text}</span>
          </div>
        )}
      </div>
    </div>
  )
}
