import type { TopicCandidate, TopicSearchResponsePayload } from '@/lib/topicSearchClient';

type FinalCandidatesProps = {
  candidates: TopicCandidate[];
  metadata?: TopicSearchResponsePayload['metadata'] | null;
};

const FinalCandidates = ({ candidates, metadata }: FinalCandidatesProps) => {
  if (!candidates.length) return null;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-6 backdrop-blur">
      <div className="flex flex-col gap-2 border-b border-white/10 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">Final candidates</p>
            <h3 className="text-xl font-semibold text-white">Ranked matches</h3>
          </div>
          {metadata?.totalCandidates != null && (
            <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/70">
              {metadata.totalCandidates} in pool
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-white/60">
          {metadata?.seedsUsed?.length ? (
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
              Seeds: {metadata.seedsUsed.map((seed) => `@${seed}`).join(', ')}
            </span>
          ) : null}
          {metadata?.topicKeywords?.length ? (
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
              Keywords: {metadata.topicKeywords.join(', ')}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {candidates.map((candidate, index) => (
          <div
            key={`${candidate.fid}-${candidate.username}-${index}`}
            className="rounded-2xl border border-white/10 bg-black/30 px-4 py-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/5 text-base font-semibold text-white/70">
                  #{index + 1}
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-white/50">Farcaster</p>
                  <p className="text-xl font-semibold text-white">@{candidate.username}</p>
                  {candidate.displayName && (
                    <p className="text-sm text-white/70">{candidate.displayName}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.35em] text-white/50">Score</p>
                <p className="text-3xl font-semibold text-emerald-300">
                  {candidate.score.toFixed(2)}
                </p>
              </div>
            </div>
            {candidate.bio && (
              <p className="mt-3 text-sm text-white/70">{candidate.bio}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-white/60">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Seeds matched: <span className="text-white">{candidate.why.seeds}</span>
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Keyword signal: <span className="text-white">{candidate.why.keywordScore.toFixed(2)}</span>
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Credibility: <span className="text-white">{candidate.why.credibility.toFixed(2)}</span>
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                FC followers: <span className="text-white">{candidate.why.followers}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FinalCandidates;
