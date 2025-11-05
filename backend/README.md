# LinkLoom Backend

A Bun + TypeScript backend API for finding and ranking Farcaster candidates based on topic relevance using the Memory Protocol API.

## Features

- 🔍 **Smart Topic Search**: Find Farcaster users relevant to any topic
- 🎯 **Seed-Based Discovery**: Expand from known accounts (seeds) to discover similar users
- 📊 **Multi-Factor Scoring**: Rank candidates by seed overlap, bio keywords, and credibility
- ⚡ **Fast & Efficient**: Built with Bun for optimal performance
- 🔒 **Type-Safe**: Full TypeScript support

## Prerequisites

- [Bun](https://bun.sh/) installed on your system
- Memory Protocol API token ([Get one here](https://memoryproto.co))

## Installation

1. Install dependencies:
```bash
cd backend
bun install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Add your Memory Protocol API token to `.env`:
```env
MEMORY_PROTOCOL_API_TOKEN=your_token_here
PORT=3001
```

## Development

```bash
bun run dev
```

The server will start on `http://localhost:3001` with hot reload enabled.

## Production

```bash
bun run start
```

## API Endpoints

### Health Check
- **GET** `/health`
- Returns server status

```bash
curl http://localhost:3001/health
```

### Topic Search
- **POST** `/api/topic/search`
- Find and rank Farcaster candidates by topic relevance

#### How It Works

1. **Seed Expansion**: Fetches followers from each Farcaster seed account
2. **Pool Building**: Creates a candidate pool with seed overlap counts
3. **Hydration**: Fetches full profiles for top candidates
4. **Scoring**: Ranks by:
   - **Seed Overlap** (50%): How many seeds follow this candidate
   - **Keyword Match** (35%): Bio relevance to topic keywords
   - **Credibility** (15%): Follower count (log scale)
5. **Filtering**: Returns top 50 candidates passing thresholds

#### Request Body:
```json
{
  "seeds": {
    "farcaster": ["zksync", "starkware"]
  },
  "topic": "zk developers in farcaster",
  "negative": ["airdrops", "marketing"],
  "thresholds": {
    "minSeedFollows": 2,
    "minScore": 0.6
  },
  "caps": {
    "maxSeedFollowersPerSeed": 2000,
    "hydrateTopK": 300
  }
}
```

**Parameters:**
- `seeds.farcaster` (required): Array of Farcaster usernames to expand from
- `topic` (required): Topic description (keywords extracted automatically)
- `negative` (optional): Keywords to filter out (e.g., spam terms)
- `thresholds` (optional): Minimum requirements
  - `minSeedFollows`: Minimum number of seeds that must follow candidate (default: 2)
  - `minScore`: Minimum relevance score 0-1 (default: 0.6)
- `caps` (optional): Performance limits
  - `maxSeedFollowersPerSeed`: Max followers to fetch per seed (default: 2000)
  - `hydrateTopK`: Max candidates to score (default: 300)

#### Response Example:
```json
{
  "success": true,
  "message": "Found 25 candidates matching topic",
  "candidates": [
    {
      "fid": 12345,
      "username": "zkdev.eth",
      "displayName": "ZK Developer",
      "bio": "Building zk-rollups on Ethereum. Interested in zero-knowledge proofs.",
      "pfpUrl": "https://...",
      "score": 0.85,
      "why": {
        "seeds": 3,
        "keywordScore": 0.8,
        "credibility": 0.75,
        "followers": 1250
      }
    }
  ],
  "metadata": {
    "totalCandidates": 1543,
    "seedsUsed": ["zksync", "starkware"],
    "topicKeywords": ["zk", "developers", "farcaster"]
  }
}
```

#### Test the API:
```bash
curl -X POST http://localhost:3001/api/topic/search \
  -H "Content-Type: application/json" \
  -d @example-request.json
```

## Project Structure

```
backend/
├── src/
│   ├── index.ts              # Main server & routes
│   ├── routes/
│   │   └── topic.ts          # Topic search endpoint
│   ├── lib/
│   │   ├── memory.ts         # Memory Protocol API client
│   │   └── scoring.ts        # Ranking algorithms
│   └── types/
│       ├── index.ts          # Request/response types
│       └── memory.ts         # Memory API types
├── .env.example              # Environment template
├── example-request.json      # Sample request
├── package.json
├── tsconfig.json
└── README.md
```

## Scoring Algorithm

The scoring system uses a weighted combination of factors:

```typescript
score = 0.5 * seedOverlap + 0.35 * keywordMatch + 0.15 * credibility

where:
- seedOverlap = min(1, seedCount / 5)
- keywordMatch = matches / totalKeywords (0 if negative keywords found)
- credibility = min(1, log10(followers + 10) / 3)
```

Candidates must pass both thresholds to be included in results.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MEMORY_PROTOCOL_API_TOKEN` | Your Memory Protocol API token | Yes |
| `PORT` | Server port (default: 3001) | No |

## Error Handling

The API handles errors gracefully:
- Invalid seeds: Skips and continues with valid ones
- API failures: Returns partial results when possible
- Missing profiles: Continues with available data

## Performance Notes

- Pagination is automatic for large follower lists
- Caps prevent excessive API calls
- Top-K filtering reduces AI validation costs
- AI-powered bio filtering ensures high-quality results

### API Usage Calculation

For a typical search with 2 seeds, each having 2,000 followers:

**Memory Protocol API Calls:**
- Followers per seed: 2,000
- API limit per request: 100
- Requests per seed: 2,000 / 100 = 20 requests
- **Total for 2 seeds: 40 API calls**

**Gemini AI API Calls:**
- Top candidates for AI filtering: 300 (hydrateTopK)
- Batch size: 10
- **Total batches: 30 API calls**

**Overall:**
- Memory Protocol: ~40 calls (scales with seeds × followers)
- Gemini AI: ~30 calls (fixed by hydrateTopK)
- **Total: ~70 API calls per search**

**Cost Optimization:**
- Profile data comes directly from followers endpoint (no extra hydration calls)
- AI filtering only applied to top-K candidates (not entire pool)
- Batch processing reduces Gemini API overhead
