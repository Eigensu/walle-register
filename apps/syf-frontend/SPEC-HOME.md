# SYF Website: Home Page Build Spec

**Version:** 1.0 draft · **Date:** 24 Oct 2026
**Site:** Silver Youth Forum (SYF), separate domain, not connected to WALL-E Arena
**Source brief:** `SYF_Website_Blueprint.pdf` (WALL-E Events, 22 Oct 2026), pages 2–4 and 11–12
**Scope of this spec:** the Home page plus the global shell (header, footer, sticky mobile bar) that every page will reuse.

---

## 0. Decisions already made

| Topic | Decision |
|---|---|
| Build approach | Custom build on our existing stack (PDF Option A), not WordPress |
| Location | `walle-register/apps/syf-frontend`, a new Next.js app. `apps/frontend` and `apps/backend` (JMCL) stay untouched |
| Visual direction | **Hallmark hybrid**: the SYF/forum layer uses an editorial serif and silver; the NSPL layer uses condensed sport type and royal blue. A ring + seam motif (from the PDF cover) ties them together |
| Hero headline | "Uniting the *Silver* Fraternity" |
| Colour mode | Navy + mist rhythm: navy hero, NSPL band and footer, light sections between. No dark-mode toggle |
| Countdown | Switches automatically by phase (to registration close, then season start, then "Live now") |
| Registration status source | SYF's own backend instance (same FastAPI code, separate deploy, DB and gateway keys). Falls back to config |
| Reusability | Config-driven sections. Every word, date, logo, colour and section toggle lives in config/content, never in components |
| Assets on hand | SYF logo ✔ · Sponsor logos ✔ · NSPL photos ✘ · Committee headshots ✘ |

---

## 1. Goals for the home page

From the PDF's "What the site has to achieve", the home page carries three of the four goals:

1. **Credibility.** A polished face in front of the silver industry and sponsors, like a jewellery brand.
2. **NSPL showcase.** Season info, sponsors, a path to teams, live stream and results.
3. **Registrations.** "Register for NSPL" is the main action, one tap away on every screen. Most visitors arrive from WhatsApp links on phones.

**Success criteria**

- A Register CTA is visible without scrolling on every viewport (header button on desktop, hero CTA plus sticky bar on mobile).
- LCP < 2.5 s and CLS < 0.05 on a mid-range Android over 4G. Lighthouse mobile performance ≥ 90.
- Sharing the URL on WhatsApp shows the right image, title and description.
- No fake numbers or stock photos ever reach production (§9).
- The next event's site can be produced by replacing `site.config.ts`, `content/` and `public/brand/`, without touching components (§11).

---

## 2. Scope

**In scope:** the `/` page, header, mobile menu, footer, sticky mobile register bar, phase engine, status fetch, SEO/OG/JSON-LD, analytics events, `.ics` calendar route, design tokens and fonts.

**Out of scope (later specs):** the other 7 pages, the registration form and payment, the admin dashboard, and the SYF backend deployment. The home page still **links** to their final routes:

| Route | Page |
|---|---|
| `/about` | About Us |
| `/nspl` | NSPL (anchors used: `#fixtures`, `#teams`, `#results`, `#live`) |
| `/sponsors` | Our Sponsors (anchor `#enquire` for "Become a sponsor") |
| `/committee` | Committee Members |
| `/gallery` | Gallery |
| `/contact` | Contact |
| `/register` | Player Registration |
| `/privacy-policy`, `/terms`, `/refund-policy` | Footer policy pages |

Until those pages exist, each route renders a shared "Coming soon" stub that uses the same shell, so there are no 404s.

---

## 3. Tech and folder

**Stack:** same as `apps/frontend`: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, shadcn/ui (new-york), lucide-react. No animation or carousel libraries.

**Copy, don't import.** The SYF app deploys separately, so it never imports from `apps/frontend`. Copy only `lib/utils.ts` (`cn`), `components/ui/button.tsx`, `components.json`, `postcss.config.mjs`, `eslint.config.mjs` and `tsconfig.json`. Do **not** copy `theme-toggle`, `sponsor-strip` or anything containing JMCL strings.

```
apps/syf-frontend/
├─ SPEC-HOME.md                  ← this file
├─ site.config.ts                ← single source of truth (§10)
├─ content/
│  ├─ committee.ts               ← 12 members
│  ├─ sponsors.ts                ← tiers, logos, URLs
│  ├─ stats.ts                   ← numbers strip
│  └─ gallery.ts                 ← 6 highlights
├─ public/brand/                 ← syf-logo.svg, nspl-logo.svg, sponsor logos, og fallback
├─ public/photos/                ← real photos only (hero, about, nspl, gallery, committee)
├─ app/
│  ├─ layout.tsx                 ← fonts, tokens → CSS vars, header, footer, sticky bar
│  ├─ page.tsx                   ← renders config.home.sections in order
│  ├─ opengraph-image.tsx        ← generated OG card
│  ├─ calendar/[slug]/route.ts   ← .ics download
│  ├─ sitemap.ts · robots.ts
│  └─ (stubs)/…                  ← coming-soon stubs for the 7 other routes + policies
├─ components/
│  ├─ shell/  header.tsx · mobile-menu.tsx · footer.tsx · sticky-register-bar.tsx
│  ├─ sections/  hero.tsx · stats-strip.tsx · about-snippet.tsx · featured-event.tsx
│  │             sponsor-strip.tsx · people-teaser.tsx · gallery-highlights.tsx
│  ├─ brand/  seam-rings.tsx · silver-text.tsx · photo-placeholder.tsx · monogram.tsx
│  ├─ countdown.tsx (client) · count-up.tsx (client) · reveal.tsx (client)
│  └─ ui/  button.tsx
└─ lib/
   ├─ phase.ts                   ← phase engine (§5)
   ├─ status.ts                  ← backend fetch + fallback (§6)
   ├─ content.ts                 ← `isPublishable()` filter (§9)
   ├─ analytics.ts               ← event helper (§13)
   └─ utils.ts
```

**Workspace:** add `apps/syf-frontend` to `pnpm-workspace.yaml`. Dev port **3001** (JMCL uses 3000), via `"dev": "next dev -p 3001"`. Run it alone with `pnpm --filter syf-frontend dev`.

**Env** (`apps/syf-frontend/.env.local`). Unlike JMCL, this app does **not** read the repo-root `.env`.

```
NEXT_PUBLIC_SITE_URL=http://localhost:3001     # prod: https://<syf-domain>
NEXT_PUBLIC_SITE_ENV=development               # development | preview | production
REGISTRATION_API_URL=http://127.0.0.1:8001              # SYF backend instance; server-only
NEXT_PUBLIC_FAKE_NOW=                          # optional ISO date for testing phases (ignored in production)
```

**Rendering:** `page.tsx` is a Server Component with `export const revalidate = 60`. The only client components are the countdown, count-up numerals, header scroll state, mobile menu, the sticky bar's visibility and scroll reveals.

---

## 4. Design system

### 4.1 Colour tokens

The base comes from the PDF palette. **When the SYF logo files arrive, the logo's own colours override `--royal` (and `--navy` if it has one).** Confirm this with the committee (§16). *Update 2026-10-25: logos received. The NSPL shield's blue already sits close to `--royal`, and the SYF letters are a multi-colour gradient with no single colour to adopt, so the proposal is to keep the palette as is.*

| Token | Hex | Use |
|---|---|---|
| `--navy` | `#0E1A2B` | Base: hero, NSPL band, footer, text on light backgrounds |
| `--navy-raised` | `#16243A` | Cards and the countdown panel on navy |
| `--navy-line` | `#24324A` | Hairlines and borders on navy |
| `--silver` | `#C0C6CF` | Accents, eyebrows, hairlines, secondary text on navy |
| `--silver-bright` | `#EEF1F5` | Primary text on navy |
| `--silver-dim` | `#8C95A3` | Muted text on navy (5.8:1 on navy ✔) |
| `--mist` | `#F3F5F8` | Light section background |
| `--paper` | `#FFFFFF` | Light section background |
| `--ink-muted` | `#4A5568` | Body text on light backgrounds |
| `--royal` | `#2457E6` | Buttons, links on light backgrounds (5.9:1 on white ✔) |
| `--royal-hover` | `#1C46C2` | Button hover |
| `--live` | `#E5484D` | "Live now" dot only |

**Contrast rule:** `--royal` is **never** used as text on navy (only 3:1). On navy, buttons are royal fills with white text, and links are silver-bright with an underline.

**Silver gradient** (numerals, the hero's italic word):
`linear-gradient(180deg, #F7F9FB 0%, #C0C6CF 48%, #8C95A3 100%)` with `background-clip: text`. On light sections use `linear-gradient(180deg, #4A5568 0%, #0E1A2B 100%)`. Always provide `color` as a fallback.

### 4.2 Typography

Three families, each with one job. Load them all through `next/font/google`, Latin subset, `display: swap`.

| Role | Family | Use |
|---|---|---|
| Display serif (SYF layer) | **Instrument Serif** 400 + italic | H1, H2 on forum sections; the italic accent word |
| Sport condensed (NSPL layer) | **Barlow Condensed** 600/700 | Eyebrows, numerals, countdown digits, NSPL headings, stat labels |
| Sans (body/UI) | **Geist** 400/500/600 | Body, nav, buttons, forms |

Scale (fluid with `clamp`):

| Token | Size | Font |
|---|---|---|
| `display-xl` (hero H1) | `clamp(2.75rem, 6vw + 1rem, 6rem)` / 0.95 lh | Instrument Serif |
| `display-l` (section H2) | `clamp(2rem, 3vw + 1rem, 3.5rem)` / 1.05 | Instrument Serif |
| `sport-xl` (NSPL H2, countdown digits) | `clamp(2.25rem, 4vw + 1rem, 4.5rem)` / 0.95, uppercase | Barlow Condensed 700 |
| `stat` (numbers strip) | `clamp(2.5rem, 3vw + 1.5rem, 4rem)`, `tabular-nums` | Barlow Condensed 600 |
| `eyebrow` | 0.8125rem, uppercase, tracking 0.22em | Barlow Condensed 600 |
| `body-l` | 1.125–1.25rem / 1.6 | Geist |
| `body` | 1rem / 1.6 | Geist |

Body text maximum width is 60ch.

### 4.3 Shape, space and depth

- **Radius:** 4 px (chips, small cards), 8 px (buttons, cards), 16 px (photo frames). Jewellery-sharp, not bubbly.
- **Section padding:** `py-20 md:py-28 lg:py-32`. Container `max-w-[1240px] px-4 sm:px-6 lg:px-8`, so there's a 16 px gutter on phones.
- **Hairlines** instead of shadows. On navy: 1 px `--navy-line`. On light: 1 px `#E3E7ED`. One soft shadow only, for floating elements (sticky bar, scrolled header): `0 8px 30px rgb(14 26 43 / 0.18)`.
- **Buttons:** primary = royal fill, white text, 8 px radius, height 48 px (52 px on mobile), trailing `▸`/arrow icon. Secondary on navy = 1 px silver outline, silver-bright text. Secondary on light = 1 px navy outline. Tap target ≥ 44 px.

### 4.4 Signature motif: "Seam rings"

The PDF cover shows three concentric rings with two dashed arcs, a cricket ball's seam inside a jeweller's ring. Build it as `components/brand/seam-rings.tsx`: an inline SVG, stroke-only, `currentColor`, `vector-effect: non-scaling-stroke`.

| Where | Size | Treatment |
|---|---|---|
| Hero, right edge, partly off-canvas | 720–900 px | silver at 18% opacity, rotates 360° over 120 s |
| Hero placeholder (no photo yet) | full bleed | silver at 10% on a navy radial gradient plus a fine grain |
| Countdown panel corner | 96 px | silver at 25% |
| Section dividers (optional) | 40 px | centred on a hairline |
| Photo placeholders | 50% of frame | silver at 20% on `--navy-raised` |
| Favicon fallback (until the logo is supplied) | 32 px | silver on navy |

### 4.5 Imagery

- Real photos only. **No stock images** (PDF p11).
- **Hero and NSPL photos:** a navy overlay `linear-gradient(90deg, navy 0% → navy/85% 40% → navy/20% 100%)` keeps text readable on any photo.
- **Committee:** greyscale plus a 12% navy multiply. This makes uneven headshots look like a set (it addresses the PDF p6 note about matching crops). Show colour on hover (desktop only).
- **Until photos arrive:** `photo-placeholder.tsx` (navy-raised, seam rings and a small caption such as "NSPL Season 1 photo"). It shows only in development and preview. In production a section without its photo either uses its no-photo layout or is hidden (§9).

### 4.6 Motion

The goal is subtle and premium. Everything is off under `prefers-reduced-motion: reduce`.

- **Reveal:** fade plus 12 px rise, 450 ms `cubic-bezier(.2,.7,.2,1)`, 60 ms stagger between children. It triggers once at 15% visibility (IntersectionObserver).
- **Count-up on stats:** 900 ms ease-out, once.
- **Seam rings:** a slow rotation (CSS `animation`, `will-change: transform`).
- **Header:** background and blur transition 200 ms.
- No parallax, no autoplay carousels, no scroll-jacking.

---

## 5. Phase engine (`lib/phase.ts`)

One pure function decides everything that changes over the season: the hero badge, countdown target, primary CTA, header CTA and sticky bar. The input is the dates in config plus the live status from the backend. It's tested with unit tests and previewable with `NEXT_PUBLIC_FAKE_NOW`.

```ts
type Phase = "coming_soon" | "open" | "full" | "closed" | "live" | "between_matches" | "complete";

function getPhase(now: Date, cfg: EventConfig, status: RegistrationStatus | null): PhaseState
// PhaseState = { phase, badge, countdown: { label, target } | null, primaryCta, headerCta, showStickyBar }
```

Rules are evaluated top-down and the first match wins. Dates decide first; the backend only matters inside the registration window (order as built in `lib/phase.ts`: complete → live → between_matches → closed by date → coming_soon → kill switch → full → open):

| # | Phase | Condition | Hero badge | Countdown | Primary CTA (hero, NSPL band) | Header CTA | Sticky bar |
|---|---|---|---|---|---|---|---|
| 1 | `complete` | `now > season.endsAt` | "Season 2 complete" | hidden | "Relive Season 2" → `/nspl#results` | "NSPL" → `/nspl` | no |
| 2 | `live` | today is in `season.matchDays` | ● "Live now" | replaced by a **Live card** (match label + "Watch on YouTube") | "Watch NSPL live" → `liveStreamUrl` | "Watch live" | no |
| 3 | `between_matches` | `season.startsAt ≤ now ≤ season.endsAt` | "Season 2 underway" | "Next match in" → next match day | "See fixtures" → `/nspl#fixtures` | "Fixtures" | no |
| 4 | `closed` | `now ≥ registration.closesAt` **or** backend `registration_open === false` | "Registrations closed" | "Season 2 starts in" → `season.startsAt` | `teamsPublished` ? "See the teams" → `/nspl#teams` : "Explore NSPL" → `/nspl` | same as primary | no |
| 5 | `full` | backend `registration_cap_reached === true` | "Registrations full" | "Season 2 starts in" | `waitlist.enabled` ? "Join the waitlist" → `/register?waitlist=1` : "Explore NSPL" | same | only if waitlist |
| 6 | `open` | `registration.opensAt ≤ now < registration.closesAt` | ● "Registrations open" | "Registrations close in" → `closesAt` | "Register for NSPL" → `/register` | "Register" | yes |
| 7 | `coming_soon` | `now < registration.opensAt` | "Registrations open {d MMM}" | "Registrations open in" → `opensAt` | "Explore NSPL" → `/nspl` | "Register" → `/register` (season info page) | no |

Notes:

- Backend `registration_open: false` acts as a **manual kill switch**. It wins over dates during the open window only; it cannot open registrations early or push a closed window into `full`.
- All dates are ISO strings with an IST offset (`2026-12-20T23:59:00+05:30`). Display them as `20 Dec 2026, 11:59 PM IST`.
- If a required date is unconfirmed (§9), that phase's countdown is hidden and the badge falls back to the no-date wording ("Registrations opening soon").
- The PDF's "After registrations close" rule (p4) is covered by phases 2–5.

---

## 6. Live status (`lib/status.ts`)

- Server-side `fetch(`${REGISTRATION_API_URL}/api/config`, { next: { revalidate: 60 }, signal: AbortSignal.timeout(2000) })`.
- Its response shape already exists in `apps/backend` (`PublicConfigResponse`): `{ registration_open, registration_cap_reached, current_registrations, registration_cap }`.
- On error or timeout it returns `null`, and the phase engine uses dates only. The page must render correctly with the backend down.
- `current_registrations` is shown **only** if `home.hero.showSpotsLeft` is true (default `false`, see §16): "142 of 174 spots taken".
- **Later (backend phase):** move `opensAt`, `closesAt`, fee, cap and season dates into the backend's `AppConfig`, so the committee can change them without a redeploy. The frontend config keeps them as a fallback.

---

## 7. Global shell

### 7.1 Header

- **Desktop (≥ 1024 px):** SYF logo left: the compact lockup without the tagline, 40 px tall (the tagline is unreadable at header size). Menu centred: About Us · NSPL · Our Sponsors · Committee · Gallery · Contact. **Header CTA** on the right (royal button, label from the phase engine). Height 76.
- **Behaviour:** fixed. Transparent over the hero. After 24 px of scroll it becomes `navy/85` with `backdrop-blur-md`, a hairline and the soft shadow. The active route gets a 1 px silver underline offset 6 px.
- **Mobile (< 1024 px):** logo plus a menu icon (44×44). Height 60. The header CTA is hidden on mobile because the sticky bar and hero CTA do that job.
- **Mobile menu:** a full-screen navy sheet. Links are in display serif at 2rem, staggered in. The phase primary CTA is a full-width button at the bottom, with social icons under it. It closes on route change and on Esc. Focus is trapped and returns to the trigger.
- A skip link ("Skip to content") is the first focusable element.

### 7.2 Sticky mobile register bar

- `< 768 px` only, and only when `phaseState.showStickyBar`.
- Fixed bottom. Navy-raised background with a top hairline and `padding-bottom: env(safe-area-inset-bottom)`.
- Content: left shows "NSPL Season 2" (eyebrow) and "Closes 20 Dec" (or "₹{fee}" when confirmed). Right is the royal button "Register ▸" (height 48).
- It appears once the hero CTA scrolls out of view (IntersectionObserver) and hides while the footer is in view.
- Add `padding-bottom` to `<main>` equal to the bar's height so it never covers content.

### 7.3 Footer (navy)

Four columns on desktop, stacked on mobile:

1. The full SYF logo with its "Connect • Collaborate • Celebrate" tagline (72 px tall), a one-line description and social icons (Instagram, YouTube; others from config).
2. **Explore:** the 6 menu pages plus Register.
3. **Policies:** Privacy Policy · Terms & Conditions · Refund & Cancellation Policy (PDF p3 and p10).
4. **Contact:** official email, phone/WhatsApp (`wa.me` link) and address, all from config. Each row shows only once confirmed; with none confirmed the whole column is dropped in production rather than leaving an empty heading.

Bottom row: `© {year} Silver Youth Forum`. An optional credit line ("Website by …") renders only if `footer.credit` is set (§16).

---

## 8. Home page sections

Default order (`home.sections` in config):

`hero` → `stats` → `about` → `featuredEvent` → `sponsors` → `people` → `gallery`

Background rhythm: **navy** (hero and stats) → **paper** (about) → **navy** (NSPL) → **mist** (sponsors) → **paper** (committee) → **mist** (gallery) → **navy** (footer).

### Wireframes

```
DESKTOP 1440                                                         MOBILE 390
┌──────────────────────────────────────────────────────────────┐   ┌────────────────────┐
│ [SYF]  About  NSPL  Sponsors  Committee  Gallery  Contact [Register▸]│ [SYF]           ≡  │
├──────────────────────────────────────────────────────────────┤   ├────────────────────┤
│░ photo, navy fade ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   ◯ ◯ ◯ rings │   │░ photo / rings ░░░░│
│ SILVER YOUTH FORUM ───                                        │   │ SILVER YOUTH FORUM │
│ Uniting the                                                   │   │ Uniting the        │
│ *Silver* Fraternity                                           │   │ *Silver* Fraternity│
│ Sub copy, two lines max.                                      │   │ Sub copy.          │
│ [Register for NSPL ▸] [About SYF]   ┌REGISTRATIONS CLOSE IN──┐│   │[Register for NSPL▸]│
│ ● Registrations open                │ 27 : 14 : 08 : 51      ││   │[About SYF]         │
│                                     │ DAYS HRS MIN SEC       ││   │┌CLOSES IN─────────┐│
│                                     │ 20 Dec · Add to cal.   ││   ││27d 14h 08m 51s   ││
│ ─────────────────────────────────────┴────────────────────────┘│   │└──────────────────┘│
│  48+ FIRMS  │  12 EVENTS  │  8 TEAMS  │  200+ PLAYERS          │   │ 48+     │ 12       │
├──────────────────────────────────────────────────────────────┤   │ 8       │ 200+     │
│ ABOUT THE FORUM                    ┌──────────────────────────┐│   ├────────────────────┤
│ The next generation of             │ group photo 4:3          ││   │ About (stacked)    │
│ *Indian silver*                    │                          ││   ├────────────────────┤
│ Two-line write-up…                 └──────────────────────────┘│   │ NSPL band (stacked)│
│ Knowledge sharing · Networking · Industry development          │   ├────────────────────┤
│ Read more about SYF →                                          │   │ Title sponsor      │
├──────────────────────────────────────────────────────────────┤   │ logo logo logo     │
│▓▓ NAVY ▓▓ ┌──────────────────┐ NSPL · SEASON 2                 │   ├────────────────────┤
│           │ action photo 5:4 │ YOUNG LEADERS. ONE INDUSTRY.    │   │ ◯ ◯ ◯ → swipe      │
│           │ [NSPL badge]     │ ONE PITCH.                      │   ├────────────────────┤
│           └──────────────────┘ One-sentence description.       │   │ ▢ ▢ ▢ → swipe      │
│                FEB 2027 │ TITLE SPONSOR: SSI │ FORMAT TBC       │   ├────────────────────┤
│                [Register for NSPL ▸]   Explore NSPL →           │   │ Footer             │
├──────────────────────────────────────────────────────────────┤   ├────────────────────┤
│ OUR SPONSORS                                                   │   │NSPL S2 · Closes   │
│ ┌──────────────── TITLE SPONSOR ────────────────┐              │   │20 Dec  [Register▸]│ ← sticky
│ │            Silver Show of India               │              │   └────────────────────┘
│ └───────────────────────────────────────────────┘              │
│ [logo] [logo] [logo] [logo] [logo]        Become a sponsor →   │
├──────────────────────────────────────────────────────────────┤
│ THE PEOPLE BEHIND SYF                    Meet the committee →  │
│ (JR) (AJ) (RD) (SM) (AS) (AM)                                  │
├──────────────────────────────────────────────────────────────┤
│ GALLERY   ┌───┬───────┬───┐                                    │
│           ├───┴┬────┬─┴───┤                 View gallery →     │
│           └────┴────┴─────┘                                    │
├──────────────────────────────────────────────────────────────┤
│ FOOTER (navy): brand · explore · policies · contact · © SYF    │
└──────────────────────────────────────────────────────────────┘
```

### 8.1 Hero (`sections/hero.tsx`), PDF item 2

- **Layout:** full-bleed. `min-height: 88svh` desktop, `auto` mobile with `pt-28 pb-12`. Content sits left on a 7/12 column and is bottom-aligned. The countdown panel sits on the right 4/12, bottom-aligned with the CTAs. Seam rings bleed off the right edge.
- **Background:** `hero.photo` with the navy overlay (§4.5) and `next/image` `priority`, `sizes="100vw"`. **Without a photo:** a navy radial gradient (`#16243A` at 70% 30% → `#0E1A2B`), large seam rings at 10% and an SVG grain at 4% opacity. This is designed to look finished, so we can launch before NSPL photos arrive.
- **Content:**
  - Eyebrow: "SILVER YOUTH FORUM" plus a 48 px silver hairline.
  - H1 (the only H1 on the page): `Uniting the *Silver* Fraternity`. The `*…*` word is rendered italic with the silver gradient. Break the line after "the" on desktop.
  - Sub copy: `hero.subcopy`, max 2 lines, 56ch, silver. **Draft (needs SYF approval):** "Young entrepreneurs and leaders of India's silver jewellery industry, building what comes next, on and off the pitch."
  - CTAs: phase primary (royal) plus "About SYF" (silver outline) → `/about`.
  - Status badge under the CTAs: dot plus phase badge text. In `open` and `live` the dot pulses (2 s; static under reduced motion).
- **Countdown panel** (`countdown.tsx`, client): navy-raised, 1 px navy-line border, 8 px radius, seam-rings corner mark.
  - Label (eyebrow) from the phase. Four cells DD:HH:MM:SS in `sport-xl`, `tabular-nums`, silver gradient. Unit labels underneath.
  - Footer line: the formatted target date plus "Add to calendar" → `/calendar/{slug}.ics` (§12).
  - **Hydration:** the server passes `target` and the remaining days and hours (computed at render) as props. The client's first render uses those props unchanged, with minutes and seconds as `--`. Ticking starts in `useEffect` after mount, so there's no hydration mismatch.
  - **A11y:** the visible digits are `aria-hidden`. A sibling `sr-only` text reads "Registrations close on 20 December 2026 at 11:59 PM IST". No live-region ticking.
  - At zero it calls `router.refresh()`: the server re-runs the phase engine and the hero, header CTA and sticky bar all switch together, without a full reload.
  - **Live variant** (phase `live`): "● LIVE NOW", `match.label` ("Match 7 · Team A vs Team B"), a "Watch on YouTube" button. No digits.
- **Mobile:** stack in this order: eyebrow, H1, sub, CTAs (full width, primary first), countdown panel (the same four-cell DD:HH:MM:SS grid, scaled down; it fits at 320 px and reads better than a one-line string). Rings scale to 140% of width at 8% opacity behind the text.

### 8.2 Numbers strip (`sections/stats-strip.tsx`), PDF item 3

- Sits on navy directly under the hero, separated by a hairline, as part of the same visual block.
- 4 stats in a row (desktop) or a 2×2 grid (mobile), with vertical hairline dividers between them.
- Each stat: value (`stat` style, silver gradient, count-up) plus label (eyebrow, silver-dim). Suffixes like `+` are part of the config value.
- **Content:** `content/stats.ts`. The PDF suggests member firms, events held, NSPL teams and players. **SYF must supply the real figures.** Unconfirmed stats are hidden in production. If fewer than 3 are confirmed, the whole strip is hidden. Never show placeholder numbers to sponsors.

### 8.3 About snippet (`sections/about-snippet.tsx`), PDF item 4

- Paper background. Two columns: text (6/12) and photo (6/12, 4:3, 16 px radius).
- Eyebrow "ABOUT THE FORUM". H2 (display-l): `The next generation of *Indian silver*` (the PDF's third headline option, reused here).
- Body: the first two sentences of SYF's own write-up (PDF p5): "Silver Youth Forum is a vibrant and forward-thinking collective of young entrepreneurs and leaders from the Silver Jewellery Industry of India. Committed to innovation, collaboration and growth, the forum serves as a platform for knowledge sharing, networking, and industry development."
- Three pillars as an inline row with silver dot separators: Knowledge sharing · Networking · Industry development.
- Link "Read more about SYF →" → `/about` (royal, underline on hover).
- **No group photo yet:** the text spans 7/12 and the right side shows a navy-raised panel with large seam rings and the three pillars stacked in serif. This is a deliberate layout, not a placeholder box.
- **Mobile:** text first, then the photo.

### 8.4 NSPL feature (`sections/featured-event.tsx`), PDF item 5

The "matchday" register: navy band, condensed type, royal energy.

- Two columns: photo (5/12, 5:4, NSPL logo badge pinned bottom-left) and content (7/12).
- Eyebrow "NSPL · SEASON 2". H2 in `sport-xl` uppercase: "YOUNG LEADERS. ONE INDUSTRY. ONE PITCH."
- Description: the first sentence of the NSPL write-up (PDF p5): "National Silver Premier League (NSPL) is a flagship cricketing extravaganza organized by Silver Youth Forum."
- **Key facts row** (PDF p4 "Season 2 · February 2027 · title sponsor · format in one line"): 3–4 fact chips separated by hairlines. Each has a label (eyebrow) and a value (Geist 600):
  - When: February 2027 · Title sponsor: Silver Show of India · Format: TBC · Fee: TBC
  - Unconfirmed facts are hidden in production (§9).
- CTAs: phase primary (royal) plus "Explore NSPL →" (silver-bright link) → `/nspl`.
- **Without a photo:** the photo column shows the NSPL logo large on navy-raised with seam rings.
- **Mobile:** photo on top (16:10), then content. CTAs go full width.

### 8.5 Sponsor strip (`sections/sponsor-strip.tsx`), PDF item 6 and p6

- Mist background. Eyebrow "OUR SPONSORS". Optional H2 "Backed by the industry" (display-l, short).
- **Title sponsor:** its own tile, full container width up to 880 px, paper background, 1 px border. Label "TITLE SPONSOR" sits above it. Logo max height 96 px (desktop) or 64 px (mobile).
- **Other sponsors:** one row (wrapping) of equal tiles, logo max height 48 px. Grouped by tier with a small tier eyebrow if more than one tier exists. Desktop: greyscale at 70% opacity → full colour on hover/focus. Mobile: always full colour.
- **Every logo links out** to the sponsor's site with `target="_blank" rel="sponsored noopener"` and UTM tags `?utm_source=silveryouthforum&utm_medium=website&utm_campaign=nspl_s2&utm_content=home_{tier}`. It also fires `sponsor_click` (§13), so SYF can report click-throughs to each sponsor (PDF p6).
- Footer of section: "Become a sponsor →" → `/sponsors#enquire`.
- `alt` = sponsor name. Logos are SVG or transparent PNG in `public/brand/sponsors/`.
- With only the title sponsor confirmed, the "other sponsors" row is hidden.

### 8.6 Committee teaser (`sections/people-teaser.tsx`), PDF item 7

- Paper background. Eyebrow "THE PEOPLE BEHIND SYF". H2 (display-l): "Led by the industry's next generation" (draft). Link "Meet the committee →" → `/committee`, right-aligned on desktop.
- Shows `teaserCount` (default 6) members, sorted by `order`. Desktop: a 6-column row. Mobile: horizontal scroll-snap with 2.3 cards visible.
- **Card:** 1:1 portrait (greyscale plus navy tint, 8 px radius), name (Geist 600), firm (ink-muted, small) and designation (eyebrow) **only if confirmed**.
- **No headshots yet:** a monogram (initials in Barlow Condensed, silver gradient on navy-raised, inside a thin seam ring), as in the PDF p6 mock-up.
- Data: `content/committee.ts`, pre-filled with the 12 names and firms from PDF p6. Open items: designations, display order and the "Silbells" spelling (§16).

### 8.7 Gallery highlights (`sections/gallery-highlights.tsx`), PDF item 8

- Mist background. Eyebrow "GALLERY". H2 "Moments from NSPL and our conclaves" (draft). Link "View gallery →" → `/gallery`.
- **6 photos** on a 12-column grid. Row 1: 3 / 6 / 3, row 2: 4 / 4 / 4. All `object-cover` with a 16 px radius. Captions appear on hover (desktop) and always below on mobile.
- **Mobile:** horizontal scroll-snap, 1.2 photos visible.
- `next/image` lazy, `sizes` per tile. Every photo needs alt text and an event tag (NSPL S1 or conclave).
- **No photos yet:** the whole section is hidden in production and shows placeholders in dev/preview.

### 8.8 Footer, PDF item 9

See §7.3.

---

## 9. Content rules: no fake data in production

Every content item and every config value that SYF must supply carries a status:

```ts
type Field<T> = { value: T; confirmed: boolean; note?: string };   // note = what's pending, e.g. "SYF to supply"
const field = <T,>(value: T, confirmed: boolean, note?: string): Field<T> => ({ value, confirmed, note });
```

- `lib/content.ts → isPublishable(item)` returns `confirmed || NEXT_PUBLIC_SITE_ENV !== "production"`.
- In **development and preview**, unconfirmed items render with a small amber "TBC" badge, so the committee can review the layout with drafts.
- In **production**, unconfirmed items are hidden, and sections fall back as described in §8.
- **Required fields** (hero headline, logo, siteUrl, contact email; the org name is plain config) fail the production build if unconfirmed, as does a confirmed logo path whose file is missing. `scripts/check-content.ts` (run in `prebuild`) lists everything that is still pending, so it doubles as the "What we need from SYF" checklist.

---

## 10. Config model (`site.config.ts`)

Typed, with no SYF strings anywhere in `components/`. Below is the shape with SYF values. ✔ marks values confirmed in the PDF; everything else starts `confirmed: false`.

```ts
export const site = {
  org: {
    name: "Silver Youth Forum",            // ✔
    shortName: "SYF",                      // ✔
    description: field("Young entrepreneurs and leaders from the silver jewellery industry of India.", false),
    logo: { onDark: "/brand/syf-logo-light.svg", onLight: "/brand/syf-logo-dark.svg" },  // files on hand → confirm paths
  },
  siteUrl: field("https://silveryouthforum.in", false),   // domain TBC (PDF p11)
  locale: "en-IN",
  timezone: "Asia/Kolkata",

  theme: {
    colors: { navy: "#0E1A2B", royal: "#2457E6", silver: "#C0C6CF", mist: "#F3F5F8" /* … §4.1 */ },
    fonts: { display: "Instrument Serif", sport: "Barlow Condensed", sans: "Geist" },
  },

  nav: [
    { label: "About Us", href: "/about" }, { label: "NSPL", href: "/nspl" },
    { label: "Our Sponsors", href: "/sponsors" }, { label: "Committee", href: "/committee" },
    { label: "Gallery", href: "/gallery" }, { label: "Contact", href: "/contact" },
  ],

  event: {
    slug: "nspl-s2",
    code: "NSPL", name: "National Silver Premier League",   // ✔
    seasonLabel: "Season 2",                                // ✔
    logo: "/brand/nspl-logo.svg",                           // needed
    registration: {
      opensAt: field("2026-12-01T10:00:00+05:30", false),   // PDF: "early December"
      closesAt: field("2026-12-20T23:59:00+05:30", false),
      fee: field<number | null>(null, false),               // ₹, PDF: "to be decided"
      cap: field<number | null>(null, false),
      waitlist: { enabled: false },
      registerHref: "/register",
    },
    season: {
      startsAt: field("2027-02-01T09:00:00+05:30", false),  // PDF: "February 2027"
      endsAt: field("2027-02-28T21:00:00+05:30", false),
      matchDays: field<string[]>([], false),                // ["2027-02-06", …]
      venue: field("", false),
      format: field("", false),
    },
    titleSponsor: "silver-show-of-india",                   // ✔, key into content/sponsors.ts
    liveStreamUrl: field("", false),                        // YouTube
    teamsPublished: false,                                  // flip after auction
  },

  home: {
    sections: ["hero", "stats", "about", "featuredEvent", "sponsors", "people", "gallery"],
    hero: {
      eyebrow: "Silver Youth Forum",
      headline: "Uniting the *Silver* Fraternity",          // ✔ chosen
      subcopy: field("Young entrepreneurs and leaders of India's silver jewellery industry, building what comes next, on and off the pitch.", false),
      photo: field<string | null>(null, false),
      secondaryCta: { label: "About SYF", href: "/about" },
      showSpotsLeft: false,
    },
    about: { eyebrow: "About the forum", heading: "The next generation of *Indian silver*", body: "…PDF p5, first two sentences…", pillars: ["Knowledge sharing", "Networking", "Industry development"], photo: field(null, false), href: "/about" },
    featuredEvent: { eyebrow: "NSPL · Season 2", heading: "Young leaders. One industry. One pitch.", body: "…PDF p5, first sentence…", photo: field(null, false), href: "/nspl" },
    people: { eyebrow: "The people behind SYF", heading: field("Led by the industry's next generation", false), teaserCount: 6, href: "/committee" },
    gallery: { eyebrow: "Gallery", heading: field("Moments from NSPL and our conclaves", false), href: "/gallery" },
  },

  contact: { email: field("", false), phone: field("", false), whatsapp: field("", false), address: field("", false) },
  social: { instagram: field("", false), youtube: field("", false) },
  footer: { credit: null as null | { label: string; href: string } },
  analytics: { provider: null as null | "vercel" | "ga4" | "plausible", id: "" },
};
```

`content/committee.ts` (from PDF p6; designations all pending):

| Name | Firm (as supplied) |
|---|---|
| Jayesh Rathod | Silbells Jewellery Pvt. Ltd. |
| Anil Jain | Queens & Kings |
| Ritesh Doshi | Richezza Royal 925 Sterling Silver Jewellery |
| Suraj Mehta | RS Bullion |
| Aman Singhvi | Arihant 925 Jewellery Pvt. Ltd. (AJPL) |
| Akshay Mehta | Mehta Properties |
| Akshay Navlakha | Divine Silver |
| Vivek Kabra | JewelBuzz |
| Sumit Jain | Silbells |
| Kartik Jain | Tresorie |
| Chetan Rajawat | J'Riti Riwaaz |
| Pavan Jain | Antraa Silver |

Each member: `{ name, firm, designation: field("", false), photo: field(null, false), order }`.

`content/sponsors.ts`: `{ key, name, tier: "title" | "associate" | "team" | "partner", logo, url, confirmed }`. Silver Show of India is the title sponsor ✔. The logo is on hand, but its URL is still needed.

---

## 11. Blueprint rules (for future registration sites)

1. **No event strings in components.** CI check: `grep -rniE "silver youth|nspl|syf|season 2" components/` must return nothing. (Plain "silver" can't be in the pattern: it is part of the colour token names like `text-silver`.)
2. **Sections are a registry.** `home.sections` controls order and visibility. A new event can drop `people` or `gallery` without touching code.
3. **Brand is tokens.** Colours and fonts come from `site.theme`, injected as CSS variables in `layout.tsx`. A new event changes the config, not the CSS.
4. **The phase engine is generic.** It knows "registration window", "season window" and "match days", nothing cricket-specific.
5. **Unconfirmed content never ships** (§9). `check-content` is the per-event "what we need from the client" list.
6. **Spinning up the next event:** copy `apps/syf-frontend` → `apps/<event>-frontend`, replace `site.config.ts`, `content/` and `public/brand|photos/`, run `check-content`, deploy. No find-and-replace scripts like `replace_jypl.ps1`.
7. **Later:** once a second event exists, pull `components/` and `lib/` into `packages/event-site` and keep only config, content and assets per app. Don't do this before there are two consumers.

---

## 12. SEO, sharing and calendar

- **Metadata** from config: `title` "Silver Youth Forum · NSPL Season 2 registrations open" (follows the phase), `description` ≤ 155 chars, `metadataBase = siteUrl`, canonical `/`.
- **OG / WhatsApp preview:** `app/opengraph-image.tsx` (next/og, 1200×630). Navy, seam rings, the compact SYF logo top-left, the headline in serif, a "Register for NSPL Season 2" pill and the NSPL shield on the right. Keep it under 300 KB: next/og only renders PNG (≈445 KB with the shield), so the route converts it to JPEG with `sharp` (≈80 KB). WhatsApp caches previews hard, so finalise the image before sharing the link widely.
- **Favicon and apple-touch-icon** (`app/icon.tsx`, `app/apple-icon.tsx`): the logo's `mark` (the coloured SYF letters) on navy, with the seam rings as fallback when no mark is configured. `theme-color` is `#0E1A2B`.
- **JSON-LD:** `Organization` (SYF: name, logo, url, sameAs socials) plus `SportsEvent` (NSPL Season 2: startDate, endDate, eventStatus, location, organizer, `offers` with fee, INR, url `/register` and availability from the phase). Emit only confirmed fields.
- **`sitemap.ts`** (all 8 pages plus policies) and **`robots.ts`** (production allows all; preview disallows all).
- **`/calendar/[slug].ics?target=…`:** generates a VEVENT from config for `registration_open`, `registration_close`, `season_start` or `next_match` (whichever the countdown shows). An unconfirmed date returns 404 in production. Fires `calendar_add`.
- **OG fonts:** the image loads Instrument Serif and Barlow Condensed as TTF from Google Fonts at build time and falls back to the default font if offline.

---

## 13. Analytics

The PDF (p11) needs visitor analytics "so SYF and sponsors can see reach". **The tool is not decided** (§16). `lib/analytics.ts` exposes `track(event, props)` and stays a no-op until a provider is set.

| Event | Props | Fired from |
|---|---|---|
| `register_cta_click` | `location: header | hero | event_band | sticky_bar | mobile_menu`, `phase` | every Register CTA |
| `sponsor_click` | `sponsor`, `tier`, `location: home` | sponsor logos |
| `live_stream_click` | `location` | live card, phase CTA |
| `calendar_add` | `target: registration_close | season_start` | countdown panel |
| `nav_click` | `href` | header and footer |

UTM parameters from incoming WhatsApp links (`?utm_source=whatsapp`) must be kept when the user clicks through to `/register`.

---

## 14. Performance and accessibility

**Performance budget**
- Hero image: AVIF/WebP via `next/image`, `priority`, ≤ 180 KB at 1440 w and ≤ 90 KB at 390 w. No video in the hero for v1.
- Fonts: 3 families through `next/font`, preloaded, Latin subset only, ≤ 120 KB total.
- Client JS beyond the framework: ≤ 60 KB gzipped (countdown, menu, reveal, count-up).
- Below-the-fold images lazy-load. No third-party scripts except the chosen analytics.

**Accessibility (WCAG 2.2 AA)**
- One H1. Section H2s follow in order. Landmarks: `header`, `nav`, `main`, `footer`.
- Contrast meets the rules in §4.1. Focus is a visible 2 px ring (`--silver-bright` on navy, `--royal` on light) with a 2 px offset.
- Tap targets ≥ 44×44. The countdown is screen-reader friendly (§8.1). The mobile menu traps focus.
- All motion respects `prefers-reduced-motion`. Text has no images-of-text except logos (with alt).
- Works at 320 px width without horizontal scroll, and at 200% zoom.

---

## 15. Build order and acceptance

**Tasks**
1. Scaffold `apps/syf-frontend` (Next 16, Tailwind 4, shadcn button, copied configs), add it to the workspace, port 3001.
2. Tokens, fonts and `layout.tsx`. `seam-rings`, `silver-text`, `photo-placeholder` and `monogram` brand primitives.
3. `site.config.ts`, `content/*`, `Field<T>`, `isPublishable` and `check-content`.
4. `lib/phase.ts` with unit tests covering all 7 phases, the kill switch, a missing backend and unconfirmed dates. Then `lib/status.ts`.
5. Shell: header, mobile menu, footer, sticky bar, route stubs.
6. Sections in page order: hero + countdown → stats → about → featured event → sponsors → people → gallery.
7. SEO: metadata, OG image, JSON-LD, sitemap/robots, `.ics` route, analytics helper.
8. QA pass (below), then a preview deploy for committee sign-off (PDF timeline: "Week 2 · Design").

**Acceptance checklist**
- [ ] Every PDF p4 item (1–9) is present and wired to config (see the trace table below).
- [ ] `NEXT_PUBLIC_FAKE_NOW` previews each phase correctly: badge, countdown, CTAs, sticky bar.
- [ ] Backend off → the page renders and the phase comes from dates. Backend `registration_open:false` → `closed`.
- [x] Production build hides every unconfirmed item, and `check-content` lists them.
- [ ] Lighthouse mobile ≥ 90 performance, ≥ 95 accessibility, 100 SEO. CLS < 0.05.
- [ ] Tested at 320, 375, 390, 768, 1024, 1440 and 1920 widths. iOS Safari and Android Chrome checked by hand.
- [ ] The WhatsApp share preview shows the image and title (test with a real share).
- [ ] Sponsor links carry UTM and fire `sponsor_click`.
- [x] `grep -rniE "silver youth|nspl|syf|season 2" components/` is empty.

**PDF trace (home page)**

| PDF ref | Requirement | Where |
|---|---|---|
| p2 rec 2 | "Register for NSPL" is the main button on every page, plus a sticky bar on mobile | §7.1, §7.2, §5 |
| p3 | Desktop header: logo left, menu centre, Register right, fixed | §7.1 |
| p3 | Mobile: logo + menu icon, sticky "Register for NSPL" bar while registrations are open | §7.1, §7.2 |
| p3 | Footer: Privacy, Terms, Refund & Cancellation, Contact, Instagram/YouTube, © | §7.3 |
| p4 #1–#9 | Header, hero + countdown, numbers, about, NSPL, sponsors, committee, gallery, footer | §8.1–§8.8 |
| p4 | Swap the hero CTA after registrations close ("Watch NSPL live", "See the teams") | §5 |
| p6 | Title sponsor shown larger, every logo links out, sponsor links tagged | §8.5, §13 |
| p6 | Uniform committee headshots | §4.5, §8.6 |
| p11 | Own domain + SSL, mobile-first, fast on 4G, WhatsApp link preview, visitor analytics | §10, §14, §12, §13 |
| p11 | Look and feel: navy/silver/mist/royal, elegant serif + clean sans, real photos only | §4 |
| p12 | QR codes / WhatsApp button / live on match days (ideas) | §5 (live), §17 |

---

## 16. Open questions

**Assets and content (SYF to supply)**
1. **SYF logo and sponsor logos:** where are the files? They go into `public/brand/`. Should the logo's colours override the PDF palette?
2. **NSPL logo** (a separate mark?), **NSPL Season 1 photos** (hero, NSPL band, gallery), **group photo** (about), **committee headshots**.
3. **Dates:** registration opens and closes, season start and end, match days, venue, format.
4. **Fee, player cap and waitlist** (on or off).
5. **Numbers strip:** real figures for member firms, events held, NSPL teams and players.
6. **Committee:** designations, display order, and the "Silbells" vs "Silbells Jewellery Pvt Ltd" spelling.
7. **Sponsors:** tier and website URL for each.
8. **Contact:** official email, phone/WhatsApp, address. Social handles.
9. **Hero sub copy** and the two draft section headings: approve or replace.

**Decisions (ours or the committee's)**
10. **Domain:** `silveryouthforum.in` or `.com`? Who registers it (PDF: registered to SYF)?
11. **Hosting** for the SYF frontend and SYF backend (Vercel and Railway are both connected here). It must be on SYF-owned accounts per PDF p11.
12. **Analytics provider:** Vercel Analytics, GA4 or Plausible.
13. **`coming_soon` phase:** is "Explore NSPL" enough, or do you want a "Get notified on WhatsApp" opt-in?
14. **`showSpotsLeft`:** show "142 of 174 spots taken" in the hero? (Default off.)
15. **Footer credit:** show "Website by WALL-E Events"? (Default off.)
16. **Language:** English only for v1? (Default yes.)

---

## 17. Ideas not in v1 (need approval)

- **WhatsApp chat button** (PDF p12). On mobile it would clash with the sticky bar, so put it in the footer and Contact page instead of floating.
- **`/r` short link for QR codes** (PDF p12): redirects to `/register?utm_source=qr&utm_medium=print`.
- **"How registration works"** 3-step strip on Home (it lives on `/register` per the PDF).
- **Hall of Fame / Season 1 champions** band on Home once results exist.

---

## Appendix: design references studied (24 Oct 2026)

- **xpandd.in:** one confident accent colour, a photo-led work grid, greyscale leader portraits (→ the committee treatment).
- **Evenex (xpeedstudio):** an event conversion structure (date and venue in the hero, add-to-calendar, counters, countdown) but a dated look (→ structure kept, style dropped).
- **Dribbble, editorial luxury:** Velori ("Moments That Move People"), Criqet ("Master the Game of Cricket"), Afterglow, Proof of Talk, Elegance Jewellery (→ the serif display with an italic accent word, hairlines, navy-on-photo overlays).
- **Dribbble, matchday:** Cricket League 2025 (dark), Home of the Titans, Crease, Bounce, Cinch Championships (→ condensed numerals, the stat strip, the NSPL band's energy).
