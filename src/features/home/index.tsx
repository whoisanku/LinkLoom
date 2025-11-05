import Page from '@/components/ui/Page';
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import Search from './components/Search';
import VoyageLoading from './components/VoyageLoading';
import SeedEditor from './components/SeedEditor';
import { ICONS } from '@/assets/icons/Icon';
import Button from '@/components/ui/Button';
import { autoSeed, refineSeedsWithEvidence } from '@/lib/autoSeedClient';
import { gatherEvidenceForHandles } from '@/lib/farcasterValidation';
import type { SeedOut } from '@/lib/seed-schema';

const resolveGeminiErrorMessage = (error: unknown, fallback: string) => {
  const raw = String((error as Error)?.message ?? error ?? '').toLowerCase();
  if (!raw) return fallback;
  if (raw.includes('overloaded') || raw.includes('service unavailable') || raw.includes('503')) {
    return 'Gemini is overloaded right now. Wait a few moments and try again.';
  }
  if (raw.includes('network') || raw.includes('failed to fetch')) {
    return 'Network hiccup during signal generation. Check your connection and retry.';
  }
  return fallback;
};

export default function LinkLoomApp() {

  const pageRef = useRef<HTMLDivElement>(null)
  const scrollToTop = useCallback(() => {
    const root = pageRef.current
    if (root && typeof root.scrollTo === 'function') {
      root.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [])

  const [searchQuery, setSearchQuery] = useState('')
  const [executedQuery, setExecutedQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [seeds, setSeeds] = useState<SeedOut | null>(null)
  const [draftSeeds, setDraftSeeds] = useState<{ farcaster: string[]; twitter: string[] }>({
    farcaster: [],
    twitter: [],
  })
  const [isRefined, setIsRefined] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSearchQuery = (data: string) => { setSearchQuery(data) }

  useEffect(() => {
    let isCancelled = false

    const run = async () => {
      const trimmedQuery = searchQuery.trim()
      if (trimmedQuery.length < 3) {
        setIsLoading(false)
        return
      }

      try {
        setErrorMessage(null)
        setSeeds(null)
        setExecutedQuery(trimmedQuery)
        const out = await autoSeed(trimmedQuery)
        if (!isCancelled) {
          setSeeds(out)
          setDraftSeeds({
            farcaster: [...out.seeds.farcaster],
            twitter: [...out.seeds.twitter],
          })
          setIsRefined(false)
          scrollToTop()
        }
      } catch (error) {
        console.error('autoSeed failed', error)
        if (!isCancelled) {
          setErrorMessage(resolveGeminiErrorMessage(error, 'We lost the trail. Try charting again.'))
          setSeeds(null)
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }
    if (isLoading && searchQuery.trim().length >= 3) run()
    return () => {
      isCancelled = true
    }
  }, [isLoading, searchQuery])

  const handleReset = () => {
    setSeeds(null)
    setDraftSeeds({ farcaster: [], twitter: [] })
    setSearchQuery('')
    setExecutedQuery('')
    setErrorMessage(null)
    setIsLoading(false)
    setIsRefined(false)
    setIsRefining(false)
    scrollToTop()
  }

  const setBodyOverflow = (lock: boolean) => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = lock ? 'hidden' : ''
  }

  useEffect(() => {
    const active = isLoading || isRefining
    setBodyOverflow(active)
    return () => {
      setBodyOverflow(false)
    }
  }, [isLoading, isRefining])

  const handleDraftChange = (type: 'farcaster' | 'twitter', index: number, value: string) => {
    setIsRefined(false)
    setDraftSeeds((prev) => {
      const next = { ...prev, [type]: [...prev[type]] }
      next[type][index] = value
      return next
    })
  }

  const handleDraftRemove = (type: 'farcaster' | 'twitter', index: number) => {
    setIsRefined(false)
    setDraftSeeds((prev) => {
      const next = { ...prev, [type]: prev[type].filter((_, i) => i !== index) }
      return next
    })
  }

  const handleDraftAdd = (type: 'farcaster' | 'twitter') => {
    setIsRefined(false)
    setDraftSeeds((prev) => {
      const next = { ...prev, [type]: [...prev[type], ''] }
      return next
    })
  }

  const handleConfirm = async () => {
    if (!seeds || isRefining) return
    setIsRefining(true)
    setIsRefined(false)
    setErrorMessage(null)
    const query = executedQuery || searchQuery
    try {
      const evidence = await gatherEvidenceForHandles(draftSeeds.farcaster)
      const refined = await refineSeedsWithEvidence({
        query,
        roughSeed: seeds,
        confirmedSeeds: draftSeeds,
        evidence,
      })
      setSeeds(refined)
      setDraftSeeds({
        farcaster: [...refined.seeds.farcaster],
        twitter: [...refined.seeds.twitter],
      })
      setIsRefined(true)
      scrollToTop()
    } catch (error) {
      console.error('refineSeeds failed', error)
      setErrorMessage(resolveGeminiErrorMessage(error, 'Unable to validate Farcaster seeds right now. Try again shortly.'))
    } finally {
      setIsRefining(false)
    }
  }

  const combinedDraftList = useMemo(() => {
    const farcasterList = draftSeeds.farcaster.map((value, index) => ({
      id: `f-${index}`,
      type: 'farcaster' as const,
      value,
    }))
    const twitterList = draftSeeds.twitter.map((value, index) => ({
      id: `t-${index}`,
      type: 'twitter' as const,
      value,
    }))
    return [...farcasterList, ...twitterList]
  }, [draftSeeds])

  const confirmLabel = isRefining ? 'Validating...' : isRefined ? 'Refine Again' : 'Confirm'
  const confirmIsSuccess = isRefined && !isRefining

  return (
    <>
      {(isLoading || isRefining) && (
        <div className="fixed inset-0 top-[48px] z-50 bg-background overflow-hidden">
          <VoyageLoading query={executedQuery || searchQuery} />
        </div>
      )}
      
      <Page ref={pageRef}>
        <div className='relative flex h-full w-full flex-col items-center justify-start'>

        {!isLoading && (
          <div className='w-full max-w-5xl px-4 sm:px-6 lg:px-10'>
            {!seeds && (
              <Search type={'target'} getSearchQuery={handleSearchQuery} setIsLoading={setIsLoading} isLoading={isLoading} />
            )}

            {errorMessage && (
              <div className="mt-10 rounded-3xl border border-red-500/40 bg-red-500/10 px-6 py-5 text-red-200 backdrop-blur">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold uppercase tracking-[0.3em]">Voyage Interruption</span>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-full border border-red-500/40 p-1 text-red-200 transition hover:bg-red-500/20"
                    aria-label="Reset search"
                  >
                    {ICONS.close}
                  </button>
                </div>
                <p className="mt-3 text-sm text-red-100/80">{errorMessage}</p>
              </div>
            )}

            {seeds && (
              <div className="mt-12 flex flex-col gap-8 text-white">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.45em] text-white/50">Review signal shortlist</p>
                    <h2 className="text-3xl font-semibold">{executedQuery}</h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={handleReset} className="border-white/20 text-white/70 hover:text-white hover:border-white/40">
                    {ICONS.close}
                    Reset
                  </Button>
                </div>
              </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <SeedEditor
                    title="Farcaster"
                    color="from-[#3da8ff33]"
                    type="farcaster"
                    values={draftSeeds.farcaster}
                    onChange={handleDraftChange}
                    onRemove={handleDraftRemove}
                    onAdd={() => handleDraftAdd('farcaster')}
                  />
                  <SeedEditor
                    title="Twitter"
                    color="from-[#3da8ff22]"
                    type="twitter"
                    values={draftSeeds.twitter}
                    onChange={handleDraftChange}
                    onRemove={handleDraftRemove}
                    onAdd={() => handleDraftAdd('twitter')}
                  />
                </div>

                {combinedDraftList.length > 0 && (
                  <>
                    <div className="pointer-events-none h-24" />
                    <div className="fixed bottom-4 left-1/2 z-40 w-[min(96%,1100px)] -translate-x-1/2 rounded-full border border-white/10 bg-black/40 px-4 py-3 backdrop-blur-md">
                      <div className="flex items-center gap-3 overflow-x-auto">
                        <span className="shrink-0 text-[10px] uppercase tracking-[0.35em] text-white/50">Preview</span>
                        {confirmIsSuccess && (
                          <span className="shrink-0 rounded-full border border-emerald-400/40 bg-emerald-400/15 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-emerald-200">
                            Refined
                          </span>
                        )}
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          {combinedDraftList.map(({ id, type, value }) => (
                            <span
                              key={id}
                              className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80"
                              title={value || 'pending'}
                            >
                              <span className="mr-2 inline-flex h-2 w-2 rounded-full align-middle" style={{ backgroundColor: type === 'farcaster' ? '#6EC1FF' : '#69E1FF' }} />
                              <span className="mr-1 opacity-70">{type === 'farcaster' ? 'FC' : 'TW'}</span>
                              {value || 'pending'}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      className={`fixed bottom-6 right-6 z-50 rounded-full px-5 py-3 transition ${
                        confirmIsSuccess
                          ? 'bg-emerald-400 text-black hover:bg-emerald-300'
                          : 'bg-secondary text-black hover:bg-secondary/80'
                      }`}
                      onClick={handleConfirm}
                      disabled={isRefining || combinedDraftList.length === 0}
                      loading={isRefining}
                    >
                      {confirmLabel}
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
        </div>
      </Page>
    </>
  )

}
