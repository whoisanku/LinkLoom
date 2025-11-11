import { useMemo, type CSSProperties } from 'react'

type VoyageLoadingProps = {
  query: string
  showHint?: boolean
}

type VoyageWordConfig = {
  text: string
  delay: number
  duration: number
  offset: number
}

const DSSD_WORDS = [
  'DSSDSCANNING',
  'DSSDMAPPING',
  'DSSDLINKING',
  'DSSDDSSD',
  'SIGNALROUTING',
  'DSSDVOYAGE',
  'LINKLOOMSIGNALS',
  'MAPPING',
  'DISCOVERY',
  'NETWORKS',
  'ORBITS',
  'VECTORS',
  'SYNCED',
  'CONNECTIONS',
]

const FALLBACK_WORDS = [...DSSD_WORDS]

const OFFSETS = [-220, -140, -80, -20, 40, 100, 160, 220]

const VoyageLoading = ({ query, showHint = false }: VoyageLoadingProps) => {
  const wordConfigs = useMemo<VoyageWordConfig[]>(() => {
    const tokens = query
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean)
      .map((token) => token.toLowerCase())
    const baseTokens = tokens.length > 0 ? tokens : FALLBACK_WORDS

    const expansions = baseTokens.flatMap((token) => [
      token,
      `scanning ${token}`,
      `mapping ${token}`,
      `linking ${token}`,
      `${token} signal`,
      `routing ${token}`,
    ])

    const pool = [...expansions, ...FALLBACK_WORDS]
    const total = Math.max(12, pool.length)

    return Array.from({ length: total }, (_, index) => ({
      text: pool[index % pool.length]?.toUpperCase() ?? '',
      delay: index * 0.28,
      duration: 4.4 + (index % 4) * 0.35,
      offset: OFFSETS[index % OFFSETS.length] ?? 0,
    }))
  }, [query])

  return (
    <div className="voyage-loading-container relative">
      <div className="voyage-loading-space pointer-events-none" />
      <div className="voyage-loading-stage">
        {wordConfigs.map(({ text, delay, duration, offset }, index) => (
          <span
            key={`${text}-${index}`}
            className="voyage-word"
            style={
              {
                '--voyage-offset': `${offset}px`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
              } as CSSProperties & {
                '--voyage-offset': string
              }
            }
          >
            {text}
          </span>
        ))}
      </div>
      <div className="voyage-magnifier-wrap" aria-label="Loading">
        <div className="voyage-orbit">
          <svg className="voyage-magnifier" width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="2" opacity="0.9" />
            <line x1="14.5" y1="14.5" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      {showHint && (
        <div className="pointer-events-auto absolute inset-x-0 top-6 sm:top-10 flex flex-col items-center px-6 text-center">
          <h1 className="text-white text-lg sm:text-2xl font-semibold">This may take a moment</h1>
          <h1 className="mt-1 text-white/70">
            You can browse Farcaster meanwhile.
          </h1>
        </div>
      )}
    </div>
  )
}

export default VoyageLoading
