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

## API Usage

### Endpoint

- **`POST /api/topic/search`**

### Example Request

When you want to find candidates related to a specific topic, you send a `POST` request with a body like this:

```json
{
  "seeds": {
    "farcaster": ["zksync", "starkware"]
  },
  "topic": "zk developers in farcaster",
  "negative": ["airdrops", "marketing"],
  "thresholds": {
    "minSeedFollows": 1,
    "minScore": 0.2
  },
  "caps": {
    "maxSeedFollowersPerSeed": 2000,
    "hydrateTopK": 300
  }
}
```

### Request Parameters Explained

- **`seeds.farcaster`**: The starting point for your search. These are Farcaster users you already know are relevant to your topic.
- **`topic`**: The subject you are interested in. The API will find users whose profiles are related to this topic.
- **`negative`**: A list of keywords to exclude. If a user's bio contains any of these words, they will be filtered out. If you don't provide this, Gemini will generate a list for you.
- **`thresholds`**:
  - `minSeedFollows`: How many of your seed users a candidate must follow. A lower number (like `1`) will give you a wider, more diverse pool of candidates.
  - `minScore`: The minimum relevance score a candidate needs to be included in the results. This is a value between `0` and `1`. A lower score will return more candidates.
- **`caps`**:
  - `maxSeedFollowersPerSeed`: Limits how many followers are fetched from each seed user to keep the process fast.
  - `hydrateTopK`: The number of top candidates to send to Gemini for detailed analysis.

### Example Response

After processing your request, you will get a response like this:

```json
{
    "success": true,
    "message": "Found 33 candidates matching topic",
    "candidates": [
        {
            "fid": 326438,
            "username": "mrmosby",
            "displayName": "MrMosby.base.eth",
            "bio": "https://github.com/Mozzy59...",
            "pfpUrl": "...",
            "score": 0.339,
            "why": {
                "seeds": 1,
                "keywordScore": 0,
                "credibility": 1,
                "followers": 1905
            }
        }
    ],
    "metadata": {
        "totalCandidates": 1947,
        "seedsUsed": ["zksync", "starkware"],
        "topicKeywords": ["developers", "farcaster"]
    }
}
```

### Response Explained

- **`candidates`**: An array of users who meet your criteria. Each candidate includes their profile information and a `score`.
- **`score`**: The relevance score, calculated based on a weighted average of seed overlap (20%), keyword matches (50%), and credibility (30%).
- **`why`**: A breakdown of the scoring, showing how many seeds the user follows, their keyword score, their credibility score (based on follower count), and their total number of followers.

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
