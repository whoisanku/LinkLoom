import Page from '@/components/ui/Page';
import { useEffect, useMemo, useState } from 'react';
import Search from './components/Search';
import VoyageLoading from './components/VoyageLoading';
import SeedEditor from './components/SeedEditor';
import { ICONS } from '@/assets/icons/Icon';
import Button from '@/components/ui/Button';
import { autoSeed } from '@/lib/autoSeedClient';
import type { SeedOut } from '@/lib/seed-schema';

export default function LinkLoomApp() {

  const [searchQuery, setSearchQuery] = useState('')
  const [executedQuery, setExecutedQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false);
  const [seeds, setSeeds] = useState<SeedOut | null>(null)
  const [draftSeeds, setDraftSeeds] = useState<{ farcaster: string[]; twitter: string[] }>({
    farcaster: [],
    twitter: [],
  })
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
        }
      } catch (error) {
        console.error('autoSeed failed', error)
        if (!isCancelled) {
          setErrorMessage('We lost the trail. Try charting again.')
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
  }

  const setBodyOverflow = (lock: boolean) => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = lock ? 'hidden' : ''
  }

  useEffect(() => {
    setBodyOverflow(isLoading)
    return () => {
      setBodyOverflow(false)
    }
  }, [isLoading])

  const handleDraftChange = (type: 'farcaster' | 'twitter', index: number, value: string) => {
    setDraftSeeds((prev) => {
      const next = { ...prev, [type]: [...prev[type]] }
      next[type][index] = value
      return next
    })
  }

  const handleDraftRemove = (type: 'farcaster' | 'twitter', index: number) => {
    setDraftSeeds((prev) => {
      const next = { ...prev, [type]: prev[type].filter((_, i) => i !== index) }
      return next
    })
  }

  const handleDraftAdd = (type: 'farcaster' | 'twitter') => {
    setDraftSeeds((prev) => {
      const next = { ...prev, [type]: [...prev[type], ''] }
      return next
    })
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

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 top-[48px] z-50 bg-background overflow-hidden">
          <VoyageLoading query={executedQuery || searchQuery} />
        </div>
      )}
      
      <Page>
        <div className='relative flex h-full w-full flex-col items-center justify-center'>

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
                      className="fixed bottom-6 right-6 z-50 rounded-full bg-secondary px-5 py-3 text-black hover:bg-secondary/80"
                    >
                      Confirm
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
