# Trophify — Context

## What is Trophify?

Trophify is a lightweight awards app for groups of friends, teammates, or colleagues. Think Tricount for awards: no account required, share a link, pick your name, vote.

An organizer creates an event, shares a link, and controls when voting opens and when results are revealed. Participants join by clicking the link, selecting their name from the list, and voting once per category.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| Backend | Fastify 5, TypeScript, Node.js |
| Database | Supabase (Postgres) |
| Monorepo | npm workspaces + concurrently |

**Ports (dev):** API on `:3001`, frontend on `:3000`.

---

## Repository Structure

```
trophify/
├── apps/
│   ├── api/          Fastify REST API
│   └── front/        Next.js frontend
└── package.json      Monorepo root (npm workspaces)
```

### API (`apps/api`)

```
src/
├── index.ts          Entry point — registers all route plugins
├── lib/
│   ├── supabase.ts   Supabase client (service_role)
│   ├── code.ts       Unique slug generator (adjective-noun-2digits)
│   └── admin.ts      requireOrganizer() — validates x-organizer-token header
└── routes/
    ├── events.ts     POST /events, GET /events/:code, PATCH /events/:code/phase
    ├── participants.ts POST/DELETE /events/:code/participants
    ├── categories.ts  POST/DELETE /events/:code/categories
    └── votes.ts      POST /events/:code/votes, GET /events/:code/votes/mine
```

### Frontend (`apps/front/src`)

```
app/
├── layout.tsx              Root layout (no global providers)
├── page.tsx                Landing — create or join by link/code
├── create/page.tsx         Create event form
└── e/[code]/
    ├── page.tsx            Event hub — dispatches by phase
    └── _components/
        ├── SetupView.tsx       Admin: add participants/categories, open vote
        ├── ParticipantPicker.tsx  "Who are you?" selector
        ├── VotingView.tsx      Ballot — one card per category
        └── ResultsView.tsx     Top 3 + winner per category
hooks/
└── useEventIdentity.ts    Per-event localStorage identity (participant + admin token)
lib/
├── types.ts               Shared TypeScript types
└── api.ts                 Typed fetch wrappers for all API calls
```

---

## Data Model

```sql
events        id, code (slug), name, phase, organizer_token, created_at
participants  id, event_id, name, image_url, created_at
categories    id, event_id, name, description, position, created_at
votes         id, event_id, category_id, voter_id, candidate_id, created_at
              UNIQUE(category_id, voter_id)  -- one vote per (category, voter)
```

---

## Core Concepts

### Event Phases

Events move forward only — no rollback:

```
setup → voting → revealed
```

- **setup** — organizer configures participants and categories
- **voting** — participants select their name and vote once per category
- **revealed** — results are locked and shown to everyone

### Identity (no accounts)

Identity is event-scoped and stored in `localStorage`:

| Key | Value |
|---|---|
| `trophify_participant_{code}` | `{ id, name, image_url }` — selected participant |
| `trophify_admin_{code}` | `organizerToken` — written at creation, read for admin actions |

The organizer token is returned once at event creation and never exposed again via the API.

### Admin Authentication

Admin routes require the `x-organizer-token` header. The `requireOrganizer()` helper in `apps/api/src/lib/admin.ts` validates it against `events.organizer_token` in the database.

### Voting Rules

- Participants vote for **other participants only** (self-vote blocked server-side)
- One vote per participant per category (enforced by DB unique constraint)
- Votes can be updated while the event is in `voting` phase (upsert)
- Results show **top 3** per category; rank 1 is the winner

---

## Environment Variables

**`apps/api/.env`**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
PORT=3001
```

**`apps/front/.env.local`**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Running Locally

```bash
npm run dev          # starts both api and front in parallel
npm run dev:api      # api only
npm run dev:front    # front only
```

---

## Key Design Decisions

- **RLS enabled, no policies** — every table has Row Level Security turned on with no policies attached (see `supabase/migrations`), so the `anon`/`authenticated` roles get zero direct access via PostgREST. The API talks to Supabase with the `service_role` key, which bypasses RLS, so all real access control is still enforced in route logic.
- **No real-time** — results don't update live while voting is open (intentional for the reveal effect).
- **Full client-side** — all `/e/[code]` pages are `"use client"` components fetching via `useEffect`. No server components or revalidation for now.
- **No UI library** — components are written by hand with Tailwind utilities.
- **Upsert votes** — participants can change their vote as long as the event is in `voting` phase.
