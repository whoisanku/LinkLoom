'use client';
import { useState } from "react";
import { autoSeed } from "@/lib/autoSeedClient";

export function UseAutoSeedBox() {
  const [q, setQ] = useState("");
  const [out, setOut] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const run = async () => {
    setLoading(true);
    try {
      const data = await autoSeed(q);
      setOut(data);
    } finally { setLoading(false); }
  };
  return (
    <div className="p-4 space-y-3">
      <input
        value={q}
        onChange={(e)=>setQ(e.target.value)}
        placeholder="i'm looking for a rust developer"
        className="w-full rounded-xl bg-neutral-900 text-white p-3"
      />
      <button onClick={run} className="rounded-xl px-4 py-2 bg-white text-black">
        Generate seeds
      </button>
      {loading && <div>thinking…</div>}
      {out && (
        <pre className="text-xs whitespace-pre-wrap bg-neutral-950 text-neutral-100 p-3 rounded-xl">
          {JSON.stringify(out, null, 2)}
        </pre>
      )}
    </div>
  );
}
