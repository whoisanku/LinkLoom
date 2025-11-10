import { useState, useRef } from 'react'
import { Heart, X, Star, MapPin, Briefcase, GraduationCap } from 'lucide-react'
import Heading from '@/components/ui/Typography'

const profiles = [
  {
    id: 1,
    name: 'Sarah',
    age: 28,
    distance: '3 miles away',
    mainImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop',
    bio: 'Adventure seeker 🌄 | Coffee addict ☕ | Dog mom 🐕',
    job: 'Product Designer at Tech Co',
    education: 'NYU, Class of 2018',
    interests: ['Photography', 'Hiking', 'Travel', 'Coffee'],
    gallery: [
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&h=800&fit=crop',
    ],
    passions: ['Travel', 'Art', 'Fitness', 'Cooking', 'Music', 'Photography'],
  },
  {
    id: 2,
    name: 'Emma',
    age: 26,
    distance: '5 miles away',
    mainImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=800&fit=crop',
    bio: 'Yoga instructor 🧘‍♀️ | Plant based 🌱 | Beach lover 🏖️',
    job: 'Yoga Instructor',
    education: 'UCLA, Class of 2020',
    interests: ['Yoga', 'Meditation', 'Cooking', 'Reading'],
    gallery: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1476900543704-4312b78632f8?w=600&h=800&fit=crop',
    ],
    passions: ['Wellness', 'Nature', 'Sustainability', 'Mindfulness'],
  },
  {
    id: 3,
    name: 'Olivia',
    age: 30,
    distance: '2 miles away',
    mainImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop',
    bio: 'Bookworm 📚 | Wine enthusiast 🍷 | Weekend explorer',
    job: 'Marketing Manager',
    education: 'Columbia University',
    interests: ['Reading', 'Wine tasting', 'Museums', 'Theater'],
    gallery: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1522556189639-b150ed9c4330?w=600&h=800&fit=crop',
    ],
    passions: ['Literature', 'Culture', 'Food', 'Travel', 'Art'],
  },
]

export default function TinderSwipeCard() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [cards, setCards] = useState(profiles)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragCurrent, setDragCurrent] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const cardRef = useRef(null)
  const scrollRef = useRef(null)

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
        animateSwipe(direction)
      } else {
        setDragCurrent({ x: 0, y: 0 })
      }
    }

    setIsDragging(false)
    setIsScrolling(false)
  }

  const animateSwipe = (direction: 'left' | 'right' | 'up') => {
    const flyOut = direction === 'right' ? 1000 : -1000
    setDragCurrent({ x: flyOut, y: 0 })

    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length)
      setDragCurrent({ x: 0, y: 0 })
      setScrollY(0)
    }, 300)
  }

  const handleButtonClick = (direction: 'left' | 'right' | 'up') => {
    if (direction === 'up') {
      setScrollY(500)
    } else {
      animateSwipe(direction)
    }
  }

  if (!currentProfile) return null

  const rotation = dragCurrent.x / 20
  const opacity = 1 - Math.abs(dragCurrent.x) / 500

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="relative w-full max-w-md">
        {/* Card Stack Effect */}
        <Heading
          variant={'h2'}
          title={
            'this file is in feature/home/index.tsx near the end. called, tinderSwipeCard.tsx. Move this to where you need it.'
          }
        />
        <div className="relative" style={{ height: '600px' }}>
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
                  className="relative w-full h-full bg-white rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing"
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
                    className="relative h-full overflow-hidden"
                    style={{
                      transform: `translateY(-${scrollY}px)`,
                      transition: isDragging && isScrolling ? 'none' : 'transform 0.3s ease',
                    }}
                  >
                    <div className="relative h-96">
                      <img
                        src={profile.mainImage}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                        draggable="false"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Basic Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <h2 className="text-4xl font-bold mb-1">
                          {profile.name}, {profile.age}
                        </h2>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin size={16} />
                          <span>{profile.distance}</span>
                        </div>
                        <p className="mt-2 text-sm">{profile.bio}</p>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    <div className="bg-white p-6 space-y-6">
                      {/* About */}
                      <div>
                        <h3 className="text-xl font-bold mb-3">About {profile.name}</h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Briefcase size={20} className="text-gray-600" />
                            <span className="text-gray-700">{profile.job}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <GraduationCap size={20} className="text-gray-600" />
                            <span className="text-gray-700">{profile.education}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <MapPin size={20} className="text-gray-600" />
                            <span className="text-gray-700">{profile.distance}</span>
                          </div>
                        </div>
                      </div>

                      {/* Interests */}
                      <div>
                        <h3 className="text-xl font-bold mb-3">Interests</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.interests.map((interest, idx) => (
                            <span
                              key={idx}
                              className="px-4 py-2 bg-pink-50 text-pink-600 rounded-full text-sm font-medium"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Passions */}
                      <div>
                        <h3 className="text-xl font-bold mb-3">Passions</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.passions.map((passion, idx) => (
                            <span
                              key={idx}
                              className="px-4 py-2 bg-purple-50 text-purple-600 rounded-full text-sm font-medium border border-purple-200"
                            >
                              {passion}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Photo Gallery */}
                      <div>
                        <h3 className="text-xl font-bold mb-3">More Photos</h3>
                        <div className="grid grid-cols-3 gap-2">
                          {profile.gallery.map((photo, idx) => (
                            <img
                              key={idx}
                              src={photo}
                              alt={`${profile.name} ${idx + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                              draggable="false"
                            />
                          ))}
                        </div>
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
                      className="border-4 border-red-500 text-red-500 font-bold text-4xl px-6 py-3 rotate-[20deg] rounded-lg"
                      style={{ opacity: Math.max(0, -dragCurrent.x / 200) }}
                    >
                      NOPE
                    </div>
                  </div>

                  {/* Scroll Indicator */}
                  {scrollY === 0 && (
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 pointer-events-none">
                      <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-full text-xs text-gray-600 animate-bounce">
                        ↑ Swipe up to see more
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center items-center gap-6 mt-8">
          <button
            onClick={() => handleButtonClick('left')}
            className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
          >
            <X size={32} className="text-red-500" />
          </button>
          <button
            onClick={() => handleButtonClick('up')}
            className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
          >
            <Star size={28} className="text-blue-500" />
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
