import Page from '@/components/ui/Page';
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import Search from './components/Search';
import VoyageLoading from './components/VoyageLoading';
import SeedEditor from './components/SeedEditor';
import FinalCandidates from './components/FinalCandidates';
import KeywordsEditor from './components/KeywordsEditor';
import { ICONS } from '@/assets/icons/Icon';
import Button from '@/components/ui/Button';
import { autoSeed, refineSeedsWithEvidence } from '@/lib/autoSeedClient';
import { gatherEvidenceForHandles } from '@/lib/farcasterValidation';
import type { SeedOut } from '@/lib/seed-schema';
import { fetchTopicCandidates, type TopicCandidate, type TopicSearchResponsePayload } from '@/lib/topicSearchClient';

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

const resolveCandidateErrorMessage = (error: unknown, fallback: string) => {
  const raw = String((error as Error)?.message ?? error ?? '').toLowerCase();
  if (!raw) return fallback;
  if (raw.includes('network')) {
    return 'Cannot reach the candidate ranking backend. Make sure it is running and retry.';
  }
  if (raw.includes('timeout')) {
    return 'Candidate ranking backend timed out. Try again shortly.';
  }
  if (raw.includes('502') || raw.includes('503')) {
    return 'Candidate ranking backend is unavailable. Give it a moment and retry.';
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
  const [draftKeywords, setDraftKeywords] = useState<{ positive: string[]; weak: string[]; negative: string[] }>({
    positive: [],
    weak: [],
    negative: [],
  })
  const [isRefined, setIsRefined] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [finalCandidates, setFinalCandidates] = useState<TopicCandidate[]>([])
  const [candidateMetadata, setCandidateMetadata] = useState<TopicSearchResponsePayload['metadata'] | null>(null)

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
        setFinalCandidates([])
        setCandidateMetadata(null)
        setExecutedQuery(trimmedQuery)
        const out = await autoSeed(trimmedQuery)
        if (!isCancelled) {
          setSeeds(out)
          setDraftSeeds({
            farcaster: [...out.seeds.farcaster],
            twitter: [...out.seeds.twitter],
          })
          setDraftKeywords({
            positive: [...out.normalized_keywords.positive],
            weak: [...out.normalized_keywords.weak],
            negative: [...out.normalized_keywords.negative],
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
    setFinalCandidates([])
    setCandidateMetadata(null)
    setIsLoading(false)
    setIsRefined(false)
    setIsRefining(false)
    setDraftKeywords({ positive: [], weak: [], negative: [] })
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

  const handleKeywordChange = (type: 'positive' | 'weak' | 'negative', index: number, value: string) => {
    setIsRefined(false)
    setDraftKeywords((prev) => {
      const next = { ...prev, [type]: [...prev[type]] } as typeof prev
      next[type][index] = value
      return next
    })
  }

  const handleKeywordRemove = (type: 'positive' | 'weak' | 'negative', index: number) => {
    setIsRefined(false)
    setDraftKeywords((prev) => {
      const next = { ...prev, [type]: prev[type].filter((_, i) => i !== index) } as typeof prev
      return next
    })
  }

  const handleKeywordAdd = (type: 'positive' | 'weak' | 'negative') => {
    setIsRefined(false)
    setDraftKeywords((prev) => {
      const next = { ...prev, [type]: [...prev[type], ''] } as typeof prev
      return next
    })
  }

  const runCandidateSearch = useCallback(async (seedData: SeedOut, fallbackTopic: string) => {
    const farcasterSeeds = Array.isArray(seedData.seeds?.farcaster)
      ? seedData.seeds.farcaster.filter((handle) => Boolean(handle?.trim()))
      : []
    if (farcasterSeeds.length === 0) {
      setFinalCandidates([])
      setCandidateMetadata(null)
      return
    }

    const response = await fetchTopicCandidates({
      seeds: farcasterSeeds,
      topic: seedData.topic || fallbackTopic,
      negative: seedData.normalized_keywords?.negative ?? [],
      thresholds: seedData.thresholds,
      caps: seedData.caps,
    })

    setFinalCandidates(response.candidates ?? [])
    setCandidateMetadata(response.metadata ?? null)
  }, [])

  const handleConfirm = async () => {
    if (!seeds || isRefining) return
    setIsRefining(true)
    setErrorMessage(null)
    const query = executedQuery || searchQuery
    try {
      if (!isRefined) {
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
        setDraftKeywords({
          positive: [...refined.normalized_keywords.positive],
          weak: [...refined.normalized_keywords.weak],
          negative: [...refined.normalized_keywords.negative],
        })
        setIsRefined(true)
        scrollToTop()
      } else {
        const refinedForSearch: SeedOut = {
          ...seeds,
          normalized_keywords: {
            ...seeds.normalized_keywords,
            negative: draftKeywords.negative.filter(Boolean),
          },
        }
        await runCandidateSearch(refinedForSearch, query)
        scrollToTop()
      }
    } catch (error) {
      console.error('refineSeeds failed', error)
      const message = String((error as Error)?.message ?? '').toLowerCase().includes('candidate search')
        ? resolveCandidateErrorMessage(error, 'Candidate ranking service is unavailable. Ensure the backend is running and retry.')
        : resolveGeminiErrorMessage(error, 'Unable to validate Farcaster seeds right now. Try again shortly.')
      setErrorMessage(message)
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

  const confirmLabel = isRefining ? 'Validating...' : isRefined ? 'Run Search' : 'Confirm Seeds'
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

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <KeywordsEditor
                    title="Positive Keywords"
                    color="from-[#4ade8033]"
                    type="positive"
                    values={draftKeywords.positive}
                    onChange={handleKeywordChange}
                    onRemove={handleKeywordRemove}
                    onAdd={() => handleKeywordAdd('positive')}
                  />
                  <KeywordsEditor
                    title="Weak Keywords"
                    color="from-[#a78bfa33]"
                    type="weak"
                    values={draftKeywords.weak}
                    onChange={handleKeywordChange}
                    onRemove={handleKeywordRemove}
                    onAdd={() => handleKeywordAdd('weak')}
                  />
                  <KeywordsEditor
                    title="Negative Keywords"
                    color="from-[#f8717133]"
                    type="negative"
                    values={draftKeywords.negative}
                    onChange={handleKeywordChange}
                    onRemove={handleKeywordRemove}
                    onAdd={() => handleKeywordAdd('negative')}
                  />
                </div>
                
                {finalCandidates.length > 0 && (
                  <FinalCandidates candidates={finalCandidates} metadata={candidateMetadata} />
                )}

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
