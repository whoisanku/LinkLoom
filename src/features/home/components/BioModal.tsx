import { useEffect } from 'react'

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

interface BioModalProps {
  profile: Profile
  onClose: () => void
  onLike: () => void
  onPass: () => void
}

export function BioModal({ profile, onClose, onLike, onPass }: BioModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-slate-800 rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-slate-700/80 hover:bg-slate-700 flex items-center justify-center text-2xl text-white"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="relative w-full h-64 md:h-80 overflow-hidden">
          <img src={profile.image || '/placeholder.svg'} alt={profile.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0  from-black/50 to-transparent" />
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
            <p className="text-blue-400 font-semibold text-lg mt-1">{profile.role}</p>
            {profile.company && <p className="text-slate-400 mt-1">{profile.company}</p>}
            <p className="text-slate-400 text-lg mt-2 flex items-center gap-2">📍 {profile.location}</p>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-3">About</h2>
            <p className="text-slate-300 leading-relaxed text-base">{profile.bio}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-3">Tech Stack</h2>
            <div className="flex flex-wrap gap-2">
              {profile.techStack.map((tech) => (
                <span
                  key={tech}
                  className="bg-blue-900/40 text-blue-300 px-4 py-2 rounded-full text-sm font-medium border border-blue-700/50"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 p-6 md:p-8 flex gap-4 bg-slate-900/50">
          <button
            onClick={onPass}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Pass
          </button>
          <button
            onClick={onLike}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Connect 🔗
          </button>
        </div>
      </div>
    </>
  )
}
