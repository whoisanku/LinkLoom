const FARCASTER_SUFFIXES = [
  ".base.eth",
  ".eth",
  ".farcaster",
  ".warpcast",
];

function stripAtPrefix(handle: string): string {
  return handle.replace(/^@+/, "");
}

function stripWhitespace(handle: string): string {
  return handle.replace(/\s+/g, "");
}

function stripTrailingDots(handle: string): string {
  return handle.replace(/\.+$/, "");
}

export function normalizeHandle(raw: string): string {
  if (!raw) return "";
  const base = stripWhitespace(stripAtPrefix(String(raw).trim()));
  return base.toLowerCase();
}

export function normalizeFarcasterHandle(raw: string): string {
  let handle = normalizeHandle(raw);
  for (const suffix of FARCASTER_SUFFIXES) {
    if (handle.endsWith(suffix)) {
      handle = handle.slice(0, -suffix.length);
      break;
    }
  }
  return stripTrailingDots(handle);
}

