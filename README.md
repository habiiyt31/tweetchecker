# TweetChecker

> Onchain Tweet Authenticity Verification on GenLayer Studio Network.

```
tweetchecker/
├── contracts/tweeter.py        # Intelligent Contract (Python on GenVM)
├── deploy/deployScript.ts      # genlayer-js deployment script
└── frontend/                   # Next.js + TypeScript + Tailwind dApp
```

## Pre-configured

This project ships pre-configured with:

- Contract address: `0xAddress`
- Network: GenLayer Studio Network (`studionet`)
- Twitter data source: `twitterapi.io` (proxied through Next.js API route — key never reaches the browser)

## Run the frontend

```bash
cd frontend
cp .env.example .env       # the .env already has the values pre-filled
npm install
npm run dev
```

Open <http://localhost:3000>. Make sure MetaMask is installed and pointed at the Studio Network.

## Re-deploy the contract (optional)

```bash
genlayer network studionet
genlayer deploy
```

## How it flows

```
User pastes URL ──► /api/twitter (server, holds API key)
                            │
                            ▼
                    twitterapi.io  (3 calls)
                            │
                            ▼
                    JSON payload returned to browser
                            │
                            ▼
            client.writeContract({ analyze, [url, json] })
                            │
                            ▼
         GenLayer validators run the LLM and reach consensus
                            │
                            ▼
             client.readContract({ get_result, [url] })
                            │
                            ▼
                   Verdict rendered onchain
```
