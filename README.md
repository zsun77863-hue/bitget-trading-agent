# Bitget Trading Agent

> Natural-language crypto trading agent powered by **Bitget Agent Hub** — built with Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Recharts and Zustand.

Type a strategy in plain English (or 中文), and the agent will:

1. **Parse** the intent via Bitget Playbook (or a local heuristic fallback).
2. **Perceive** the market through the Bitget Skill Hub (macro / sentiment / technical / news / market-intel).
3. **Reason** step-by-step, reconciling user intent with aggregated market signals.
4. **Execute** against a **simulated sub-account** by default — or a real Bitget account in `Live` mode (with explicit confirmation).
5. **Manage risk** with auto stop-loss, take-profit and position sizing.

Bilingual UI (EN / 中文), dark-mode-first, PWA-installable, fully responsive for mobile.

---

## Features

- Natural-language **chat input** with multi-line editing & 6 example presets
- Deep integration with the **Bitget Agent Hub** (Skill Hub + Playbook), with REST / MCP / CLI-style facade
- Full **agent decision flow**: Perception → Analysis → Execution → Risk
- **Simulated mode** by default; **Live mode** requires confirmation dialog
- **Asset overview** (balance, derived positions)
- **Performance dashboard**: Win-rate, total PnL, max drawdown, Sharpe ratio, equity curve, trades-per-day
- **Multi-symbol price chart** (BTC / ETH / SOL / BNB / XRP / DOGE) via Bitget v2 spot API
- **Strategy history** with delete & re-run, persisted via `localStorage`
- **CSV export** of simulated trade log
- Bilingual (English / 中文), dark/light theme, PWA + offline shell
- Toasts, loading states, error boundaries, help dialog

## Tech Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** + custom shadcn/ui primitives (Radix-based)
- **Recharts** for charts
- **Zustand** (with `persist`) for state
- **next-themes** for dark/light
- Deploy target: **Netlify** (`@netlify/plugin-nextjs`)

---

## Quick Start

```bash
git clone <this-repo>
cd bitget-trading-agent
cp .env.example .env.local      # fill in keys (all optional for demo mode)
npm install
npm run dev
# -> open http://localhost:3000
```

The app is fully functional **without any API keys** — Skill Hub responses, Playbook
parsing and prices all fall back to a deterministic synthetic source so the demo
remains screenshot-stable.

## Environment Variables

| Key | Purpose |
|---|---|
| `BITGET_API_KEY` / `BITGET_SECRET_KEY` / `BITGET_PASSPHRASE` | Bitget REST credentials (Live mode trading) |
| `PLAYBOOK_API_KEY` | Bitget **Playbook** key for natural-language → strategy translation |
| `AGENT_HUB_BASE_URL` | Override base URL of Agent Hub (defaults to `https://api.bitget.com`) |
| `SKILL_HUB_BASE_URL` | Override base URL of Skill Hub |
| `BITGET_SUBACCOUNT_ID` | Sub-account ID used to isolate simulated/live trading |
| `OPENAI_API_KEY` | Optional — server-side LLM for advanced reasoning |

Users can also paste their Playbook API key directly in the chat panel; it is
stored locally in the browser only (not sent to any server other than Bitget).

## Bitget Agent Hub Integration

Code lives under `src/lib/`:

- `skills.ts` — unified `fetchSkill(name, symbol, prompt)` facade. Calls
  `POST {SKILL_HUB_BASE_URL}/v1/skills/{name}/invoke` and degrades gracefully
  to a deterministic mock if the network is unavailable. Five skills are
  wired in: `macro-analyst`, `sentiment-analyst`, `technical-analysis`,
  `news-briefing`, `market-intel`.
- `playbook.ts` — `callPlaybook(prompt, apiKey)` posts to
  `POST {AGENT_HUB_BASE_URL}/v1/playbook/translate` to get a structured
  strategy. Falls back to a tolerant heuristic parser when no key is set.
- `bitget.ts` — Spot market data wrapper around
  `GET /api/v2/spot/market/candles` and `tickers`. Multi-symbol & multi-TF.

The orchestration lives in `src/app/api/trade/route.ts`, which runs the full
Perception → Analysis → Execution → Risk pipeline and returns a typed
`StrategyResult`. The UI renders the result in `components/panels/agent-flow.tsx`.

## Creating a Bitget Sub-account (for simulated isolation)

1. Open Bitget → Account → Sub-accounts → **Create**.
2. Enable spot trading; turn off withdrawals.
3. Generate API key, secret, and passphrase.
4. Paste them into `.env.local` (or Netlify env vars).
5. Set `BITGET_SUBACCOUNT_ID` so live orders only hit the sub-account.

## Deploying to Netlify

```bash
npm i -g netlify-cli
netlify init   # link a new site
netlify env:set PLAYBOOK_API_KEY ...
netlify env:set BITGET_API_KEY ...
# ...etc
netlify deploy --build --prod
```

`netlify.toml` already includes the official `@netlify/plugin-nextjs` plugin.
Set Node version 20 in your Netlify project settings to match.

You can also click-deploy:

1. Push this repo to GitHub.
2. In Netlify → **Add new site → Import from GitHub** → pick the repo.
3. Build command `npm run build`, publish directory `.next` (auto-detected).
4. Add environment variables under Site settings → Environment.

## Hackathon Submission Guide

- **Demo URL**: paste your Netlify URL.
- **Source**: link this GitHub repo.
- **Bitget Agent Hub usage**: reference `src/lib/skills.ts`, `src/lib/playbook.ts`,
  and `src/app/api/trade/route.ts`.
- **Sub-account ID**: used for isolated simulated trading (env var).
- **Required screenshots**:
  - Chat / strategy input (multilingual)
  - Agent decision-flow timeline
  - Performance dashboard with charts
  - Mobile screenshot showing responsive nav

## Project Structure

```
src/
├── app/
│   ├── api/{skills,playbook,market,trade}/route.ts   # Backend routes
│   ├── dashboard/page.tsx   ├── history/page.tsx
│   ├── settings/page.tsx    └── page.tsx             # Home (chat)
├── components/
│   ├── ui/                  # shadcn/ui primitives
│   ├── panels/              # Feature panels
│   ├── nav.tsx, theme-toggle.tsx, language-toggle.tsx, mode-switch.tsx, help-dialog.tsx
├── i18n/index.tsx           # EN/中文 dict + provider
├── lib/
│   ├── skills.ts, playbook.ts, bitget.ts            # Agent Hub clients
│   ├── csv.ts, utils.ts, use-toast.ts
├── store/                   # Zustand stores
└── types/index.ts
```

## License

MIT.

## Acknowledgements

- [Bitget Agent Hub](https://github.com/Bitget-AI/agent_hub) — Skill Hub, Playbook
- [shadcn/ui](https://ui.shadcn.com) — design primitives
- [Recharts](https://recharts.org), [Radix UI](https://www.radix-ui.com), [Zustand](https://github.com/pmndrs/zustand)
