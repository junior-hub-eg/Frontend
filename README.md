# Junior Hub — Frontend

Next.js 16 (App Router) + TypeScript + Tailwind v4 scaffold for Junior Hub — the Sprint 1 "Repo Scaffold + Auth screens" deliverable. See `/Users/AyshaKassem/Downloads/junior_hub_prd.pdf` for the product spec and the sprint plan spreadsheet for the full 6-sprint build order.

## Getting started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Demo accounts (one per role, password `demo`) are seeded automatically into `localStorage` on first load — see the login page.

## What's here (Sprint 1)

- **Routing** for every screen in the Sprint 1 UI/UX wireframe list, split by role prefix: `/learner/*`, `/guardian/*`, `/mentor/*`, `/admin/*`, plus `/login`, `/register`, `/guardian-consent`.
- **Design system** — provisional color/typography tokens in [`app/globals.css`](app/globals.css) and primitives in [`components/ui`](components/ui) (Button, Input, Card, Badge, Alert…). Swap the tokens once real designs land; component APIs shouldn't need to change.
- **Auth screens, working end-to-end** against a mock, localStorage-backed auth layer ([`lib/auth/mock-auth.ts`](lib/auth/mock-auth.ts)) — register → guardian consent → login, exactly as PRD §8 requires (no learner is usable without guardian consent). This is intentionally **not secure** and exists only so the screens are demoable before the real Auth API ships (Sprint 1 backend deliverable).
- **Role-based route guarding** in [`proxy.ts`](proxy.ts) (Next 16 renamed `middleware.ts` → `proxy.ts`) — redirects to `/login` or the right role home if the session cookie doesn't match the route.
- **Types** for every entity in PRD §10 in [`lib/types.ts`](lib/types.ts), and a typed [`lib/api-client.ts`](lib/api-client.ts) fetch wrapper pointed at `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_AI_SERVICE_URL` (see `.env.example`) — ready to swap in once the .NET and FastAPI services are live.
- **Placeholder screens** ([`components/shared/placeholder-page.tsx`](components/shared/placeholder-page.tsx)) for anything that needs real UI/UX designs or a backend contract that isn't ready yet (courses, AI Interview, projects, guardian/mentor/admin dashboards). Each names exactly what it's waiting on and the relevant PRD section, so routing/permissions can be exercised now and swapped for real screens later without touching the URL structure.

## Swapping mock auth for the real backend

Everything under `lib/auth/mock-auth.ts` is dev-only. Once the Sprint 1 backend Auth API ships:

1. Replace `login`/`registerLearner`/`decideConsent` with calls through `lib/api-client.ts`.
2. Replace the client-writable `jh_session` cookie in `proxy.ts` with real JWT/session verification.
3. Delete `lib/auth/mock-auth.ts` and the demo-account seeding in `lib/auth/auth-context.tsx`.

## Stack notes

- This Next.js version has real breaking changes vs. older docs/training data (e.g. `middleware` → `proxy`). Check `node_modules/next/dist/docs/` before assuming an API — see `AGENTS.md`.
- `typedRoutes` is on — `next/link` and `router.push`/`replace` are statically checked against real routes.
- RTL Arabic (`lang="ar" dir="rtl"`) is the default locale; layout uses logical properties (`border-e`, etc.) rather than left/right.
