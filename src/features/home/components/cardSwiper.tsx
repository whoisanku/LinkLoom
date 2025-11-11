import { useState, useRef, useEffect } from 'react'
import { Heart, X } from 'lucide-react'
import { sdk } from '@farcaster/miniapp-sdk'
import type { TinderProfile } from '@/lib/farcasterValidation'

export default function TinderSwipeCard({ profiles }: { profiles: TinderProfile[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [cards, setCards] = useState<TinderProfile[]>([])
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragCurrent, setDragCurrent] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const cardRef = useRef(null)

  useEffect(() => {
    // Incrementally adopt new profiles without resetting currentIndex
    setCards((prev) => {
      if (!prev || prev.length === 0) return profiles
      const prevIds = new Set(prev.map((p) => p.id))
      const additions = profiles.filter((p) => !prevIds.has(p.id))
      if (additions.length === 0) return prev
      return [...prev, ...additions]
    })
  }, [profiles])

  const currentProfile = cards[currentIndex]

  const handleStart = (clientX: number, clientY: number) => {
    setDragStart({ x: clientX, y: clientY })
    setDragCurrent({ x: 0, y: 0 })
    setIsDragging(true)
    setIsScrolling(false)
  }

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return

    const deltaX = clientX - dragStart.x
    const deltaY = clientY - dragStart.y

    if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY < -20) {
      setIsScrolling(true)
      const newScrollY = Math.max(0, Math.min(-deltaY, 500))
      setScrollY(newScrollY)
    } else if (!isScrolling) {
      setDragCurrent({ x: deltaX, y: 0 })
    }
  }

  const handleEnd = () => {
    if (!isDragging) return

    if (isScrolling) {
      if (scrollY < 100) {
        setScrollY(0)
      }
    } else {
      const threshold = 100
      if (Math.abs(dragCurrent.x) > threshold) {
        const direction = dragCurrent.x > 0 ? 'right' : 'left'
        const isLast = cards.length <= 1
        if (direction === 'left' && isLast) {
          // Do not allow swiping away the last card
          setDragCurrent({ x: 0, y: 0 })
        } else {
          animateSwipe(direction)
        }
      } else {
        setDragCurrent({ x: 0, y: 0 })
      }
    }

    setIsDragging(false)
    setIsScrolling(false)
  }

  const animateSwipe = (direction: 'left' | 'right' | 'up') => {
    if (!cards || cards.length === 0 || isAnimating) return
    setIsAnimating(true)
    const flyOut = direction === 'right' ? 1000 : -1000
    setDragCurrent({ x: flyOut, y: 0 })

    setTimeout(() => {
      // Remove the swiped card to avoid wrap-around
      setCards((prev) => prev.filter((_, idx) => idx !== currentIndex))
      setCurrentIndex(0)
      setDragCurrent({ x: 0, y: 0 })
      setScrollY(0)
      setIsAnimating(false)
    }, 300)
  }

  const handleButtonClick = async (direction: 'left' | 'right') => {
    if (isAnimating) return
    const isLast = cards.length <= 1
    if (direction === 'right') {
      try {
        if (currentProfile?.id && sdk?.actions?.viewProfile) {
          await sdk.actions.viewProfile({ fid: currentProfile.id })
          return
        }
        if (currentProfile?.username) {
          window.location.href = `https://warpcast.com/${currentProfile.username}`
          return
        }
      } catch {}
      animateSwipe('right')
    } else {
      if (isLast) return
      animateSwipe('left')
    }
  }

  if (!currentProfile) return null

  const rotation = dragCurrent.x / 20
  const opacity = 1 - Math.abs(dragCurrent.x) / 500

  return (
    <div className="flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Card Stack Effect */}
        
        <div className="relative" style={{ height: '440px' }}>
          {cards.slice(currentIndex, currentIndex + 3).map((profile, idx) => (
            <div
              key={profile.id}
              className="absolute inset-0"
              style={{
                transform: `scale(${1 - idx * 0.05}) translateY(${idx * -10}px)`,
                zIndex: 3 - idx,
                opacity: idx === 0 ? 1 : 0.5,
                pointerEvents: idx === 0 ? 'auto' : 'none',
              }}
            >
              {idx === 0 && (
                <div
                  ref={cardRef}
                  className="relative w-full h-auto bg-transparent rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing"
                  style={{
                    transform: `translateX(${dragCurrent.x}px) translateY(${dragCurrent.y}px) rotate(${rotation}deg)`,
                    opacity: opacity,
                    transition: isDragging ? 'none' : 'all 0.3s ease',
                  }}
                  onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
                  onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
                  onMouseUp={handleEnd}
                  onMouseLeave={handleEnd}
                  onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
                  onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
                  onTouchEnd={handleEnd}
                >
                  {/* Main Image */}
                  <div
                    className="relative overflow-hidden"
                    style={{
                      transform: `translateY(-${scrollY}px)`,
                      transition: isDragging && isScrolling ? 'none' : 'transform 0.3s ease',
                    }}
                  >
                    <div className="relative h-[400px]">
                      <img
                        src={profile.mainImage}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                        draggable="false"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

                      {(typeof profile.score === 'number' || typeof profile.seedFollows === 'number') && (
                        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                          {typeof profile.seedFollows === 'number' && (
                            <div className="rounded-full border border-white/20 bg-black/70 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm">
                              seeds {profile.seedFollows}
                            </div>
                          )}
                          {typeof profile.score === 'number' && (
                            <div className="rounded-full border border-white/20 bg-black/70 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm">
                              {Math.round(profile.score * 100)}%
                            </div>
                          )}
                        </div>
                      )}

                      {/* Basic Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <h2 className="text-4xl font-bold mb-1" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 1px 2px rgba(0,0,0,0.8)' }}>
                          {profile.name}
                          {profile.age ? `, ${profile.age}` : ''}
                        </h2>
                        <p className="mt-2 text-sm" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.85)' }}>{profile.bio}</p>
                      </div>
                    </div>
                  </div>

                  {/* Swipe Indicators */}
                  <div className="absolute top-12 left-12 pointer-events-none">
                    <div
                      className="border-4 border-green-500 text-green-500 font-bold text-4xl px-6 py-3 rotate-[-20deg] rounded-lg"
                      style={{ opacity: Math.max(0, dragCurrent.x / 200) }}
                    >
                      LIKE
                    </div>
                  </div>
                  <div className="absolute top-12 right-12 pointer-events-none">
                    <div
                      className="border-4 border-red-500 text-red-500 font-bold text-4xl px-6 py-3 rounded-lg"
                      style={{ opacity: Math.max(0, -dragCurrent.x / 200) }}
                    >
                      NOPE
                    </div>
                  </div>

                  {/* Scroll Indicator removed */}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center items-center gap-6 mt-4">
          <button
            onClick={() => handleButtonClick('left')}
            disabled={cards.length <= 1}
            className={`w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-95 ${cards.length <= 1 ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110'}`}
          >
            <X size={32} className="text-red-500" />
          </button>
          <button
            onClick={() => handleButtonClick('right')}
            className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
          >
            <Heart size={32} className="text-green-500" />
          </button>
        </div>
      </div>
    </div>
  )
}
