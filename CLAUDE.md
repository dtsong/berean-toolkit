# CLAUDE.md — Berean Toolkit

## Project Overview

**Berean Toolkit** is a suite of Scripture study tools designed to help Christians grow in knowledge, wisdom, and spiritual maturity through deeper engagement with God's Word.

The name comes from Acts 17:11:

> "Now the Bereans were more noble-minded than the Thessalonians, for they received the message with great eagerness and **examined the Scriptures daily** to see if these teachings were true."

This project is **inspired by Basil Tech** (https://www.basiltech.org/), a Christian faith-based technology nonprofit made up of people who want to use their skills in tech for Jesus. Like Bezalel (designer of the Tabernacle), whom God filled with His Holy Spirit and all kinds of wisdom and skill, we want to be called by God and used for His work in the world.

This is an independent project built in that same spirit — using the skills, education, and experiences that God has given to build technology that serves the Church and helps believers grow.

## Goals

1. Make original language study (Hebrew/Greek) accessible to everyday believers
2. Gamify Scripture knowledge to make learning joyful
3. Support sermon engagement with note-taking and reflection tools
4. Ground everything in accurate, faithful handling of God's Word

---

## Current Status

### Completed Infrastructure

- Next.js 14+ with App Router, TypeScript, Tailwind CSS
- ESLint + Prettier with strict TypeScript rules
- Vitest testing setup with 80% coverage thresholds
- Husky + lint-staged pre-commit hooks
- GitHub Actions CI workflow
- Supabase database schema (migration ready, not yet connected)

### Functional Features

- **Home page** — Landing with navigation to all three tools
- **Berean Challenge** — All 3 game modes with 54 curated questions (18 per mode)
- **Sermon Companion** — Claude-powered outline generation from passage reference
- **Scripture Deep Dive** — Verse lookup with ESV translation
- **Verse reference parsing** — Supports all 66 books with common abbreviations
- **Supabase** — Local instance configured with full database schema

### Placeholder/Partial Implementation

- **Original language display** — UI component exists, BSB data integration pending
- **Strong's Concordance** — Validation utilities work, lookup functions stubbed
- **NIV translation** — Partially configured via api.bible
- **KJV, NASB, LSB, BSB** — Types defined, not implemented
- **Supabase auth/data** — Schema ready, not yet connected to app features

---

## Getting Started

### Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun dev
```

The app will be available at http://localhost:3000

### Environment Variables

Copy `.env.example` to `.env.local` and add your API keys:

```bash
# Required for verse lookup (Scripture Deep Dive)
ESV_API_KEY=your_esv_api_key          # Get from api.esv.org

# Required for sermon outlines (Sermon Companion)
ANTHROPIC_API_KEY=your_anthropic_key  # Get from console.anthropic.com

# Optional - for NIV support
BIBLE_API_KEY=your_bible_api_key      # Get from scripture.api.bible

# Optional - for user accounts (not yet integrated)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### What Works Without API Keys

- **Berean Challenge** — Fully functional with seed questions
- **Home page** — Navigation to all tools

### What Requires API Keys

- **Scripture Deep Dive** — Needs `ESV_API_KEY` for verse lookup
- **Sermon Companion** — Needs `ANTHROPIC_API_KEY` for outline generation

---

## Sustainability Model

### Guiding Principles

1. **Core tools remain free** — Individual believers should never hit a paywall for personal Bible study
2. **Sustainability, not profit** — Revenue covers operating costs (hosting, APIs, development)
3. **Surplus goes to missions** — Any profit beyond costs is donated to missionaries
4. **Church/pastor tools may have a cost** — Premium features for ministry use can fund the free tier

### Potential Revenue Streams (Church/Pastor Tier)

These are ideas for sustainable funding, not an MVP requirement:

| Feature                   | Description                                                    |
| ------------------------- | -------------------------------------------------------------- |
| **Team Sermon Companion** | Shared notes, discussion prompts for small group leaders       |
| **Custom Question Banks** | Generate Berean Challenge questions for specific sermon series |
| **Church Analytics**      | Engagement metrics for pastoral care (opt-in)                  |
| **Bulk Export**           | PDF/print-ready study guides for congregations                 |
| **Priority Support**      | Direct access for church staff                                 |
| **White-Label Option**    | Embed tools on church website with custom branding             |

### Cost Structure to Cover

- Vercel hosting (free tier may suffice for MVP)
- Supabase database (free tier: 500MB, 2GB bandwidth)
- Bible API costs (ESV: free 500/day; may need paid tier at scale)
- Claude API usage (pay-per-token for LLM features)
- Domain registration (~$12-15/year)

### Missionary Giving

If/when revenue exceeds costs, surplus is donated to:

- [To be determined — specific missionaries or organizations]
- Transparent reporting to users (optional: public dashboard)

### Licensing Implications

This model is **ministry-focused with potential nominal revenue**, not purely commercial. When reaching out to publishers (LSB, NASB), we can honestly say:

- Individual use is free
- Any revenue funds sustainability + missionary support
- No investor returns or profit extraction

This may actually be viewed _favorably_ by Christian publishers.

---

## Domain

**Primary:** bereantoolkit.com
**Secondary (optional):** bereantoolkit.org (redirect to .com)

---

## Projects to Build

### Project 1: Scripture Deep Dive (Original Language Study Tool)

**Purpose:** Allow users to look up any Bible verse and see the original Hebrew (OT) or Greek (NT) with Strong's Concordance numbers, definitions, and word studies. This is the core feature of Berean Toolkit.

**Key Challenge:** Strong's Concordance maps to the KJV translation, but most modern readers use ESV, NIV, NASB, LSB. We need to bridge this gap. See **Translation Strategy** section below for the full solution.

**Approach:** Hybrid Architecture

- User reads in their preferred translation (ESV, NASB, NIV, LSB)
- BSB (public domain) powers the Greek/Hebrew word tagging behind the scenes
- User taps any word → sees original language, Strong's number, definition
- LLM explains theological significance and word connections

**Data Sources:**

- Berean Standard Bible — Word-level Greek/Hebrew tagging (public domain, self-hosted)
- ESV API (https://api.esv.org/) — ESV text, free tier available
- Bible API (https://api.bible/) — NIV and other translations
- Blue Letter Bible (https://www.blueletterbible.org/) — Strong's lexicon data
- Future: NASB1995, LSB (pending licensing agreements)

**Features:**

- Input any verse reference (e.g., "John 3:16")
- Display verse in user's preferred translation
- Display KJV with Strong's number annotations
- Display original Greek/Hebrew with transliteration
- Show word-by-word definitions from Strong's/lexicons
- List other verses where the same word appears
- LLM-generated explanation of theological significance

**Technical Notes:**

- Parse verse references (handle "John 3:16", "Jn 3:16", "John 3:16-18", etc.)
- Cache API responses to reduce load
- Consider rate limiting for external APIs

### Project 2: The Berean Challenge (Scripture Knowledge Game)

**Purpose:** A gamified way to grow in Scripture knowledge, inspired by Wordle and Lordle (https://www.lordle.com/).

**Game Modes:**

**Mode 1: Verse Detective**

- Display a verse quote without the reference
- Player guesses: Book → Chapter → Verse
- Progressive hints narrow down the answer
- Scoring based on attempts needed

**Mode 2: Context Clues**

- Display a verse with its reference
- Ask multiple-choice questions about surrounding context
- "What happens next?" / "What came before?" / "Who is speaking?"
- Tests actual Bible reading, not just memorization

**Mode 3: Word Connections**

- Show a Greek/Hebrew word with its definition
- Player identifies which verses contain this word
- Or: Given multiple verses, identify the common original word
- Builds vocabulary of key biblical terms

**Question Generation:**

- Start with a curated question bank (JSON) for quality control
- LLM can generate new questions with constraints:
  - Must have one clearly correct answer from the text
  - Plausible but incorrect distractors
  - Answerable by someone who has read the passage
- Human review before questions enter the verified bank

**Features:**

- Daily challenge mode (one puzzle per day, shareable results)
- Difficulty levels (Easy/Medium/Hard)
- Progress tracking
- Streak bonuses

### Project 3: Sermon Companion

**Purpose:** Help listeners engage more deeply with sermons by generating probable outlines, surfacing verse references, and suggesting reflection questions.

**Use Cases:**

**Before the Sermon:**

- Input: Passage reference (e.g., "Romans 8:28-39") and optional sermon title
- Output: Probable expository outline, key themes, likely cross-references
- User can pre-populate a notes template

**During the Sermon:**

- User types key phrases or partial verse quotes
- Tool identifies and suggests full verse references
- Fuzzy matching for paraphrases

**After the Sermon:**

- Generate reflection questions based on the passage
- Suggest related verses for further study
- Export notes in clean format (Markdown/PDF)

**Important Guardrails:**

- Outlines are "suggested/probable" — the actual sermon may differ
- Tool supports active listening, does not replace engagement
- Reflection questions should be open-ended and application-focused

**Features:**

- Passage-based outline generation
- Verse reference detection from partial quotes
- Reflection question generation
- Notes export

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React/Next.js)             │
│  - Scripture lookup interface                           │
│  - Game interface (Berean Challenge)                    │
│  - Sermon companion interface                           │
│  - Responsive design (mobile-friendly)                  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    Backend / API Layer                  │
│  - Route requests                                       │
│  - Cache Bible text and Strong's data                   │
│  - Manage game state and questions                      │
│  - Handle LLM requests                                  │
└─────────────────────────────────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│   External Data         │   │   LLM Integration       │
│   - Bible APIs          │   │   - Claude API          │
│   - Blue Letter Bible   │   │   - Synthesis           │
│   - Strong's data       │   │   - Question generation │
└─────────────────────────┘   └─────────────────────────┘
```

## Tech Stack

- **Runtime:** Bun (https://bun.sh/) — Fast JavaScript runtime, bundler, and package manager
- **Frontend:** React with Next.js 14+ (App Router)
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL with real-time, auth, and edge functions)
- **LLM:** Claude API (Anthropic)
- **Hosting:** Vercel (optimized for Next.js)
- **Testing:** Vitest + React Testing Library
- **Linting/Formatting:** ESLint + Prettier + strict TypeScript
- **Git Hooks:** Husky + lint-staged
- **CI/CD:** GitHub Actions (lint, test, type-check on every PR)

---

## File Structure

Status legend: `[x]` = functional, `[~]` = partial/placeholder, `[ ]` = not started

```
berean-toolkit/
├── .github/
│   └── workflows/
│       └── ci.yml              # [x] GitHub Actions CI
├── .husky/
│   └── pre-commit              # [x] Pre-commit hook (lint-staged)
├── supabase/
│   ├── config.toml             # [x] Supabase local config
│   └── migrations/
│       └── 00001_initial.sql   # [x] Database schema (not yet applied)
├── src/
│   ├── app/
│   │   ├── layout.tsx          # [x] Root layout with dark mode
│   │   ├── page.tsx            # [x] Home page with tool cards
│   │   ├── study/
│   │   │   └── page.tsx        # [~] Verse lookup works, original language pending
│   │   ├── berean/
│   │   │   └── page.tsx        # [x] All 3 game modes functional
│   │   ├── sermon/
│   │   │   └── page.tsx        # [x] Outline generation via Claude
│   │   └── api/
│   │       ├── verse/
│   │       │   └── route.ts    # [x] ESV working, NIV partial
│   │       ├── game/
│   │       │   └── route.ts    # [x] Returns questions from JSON
│   │       └── sermon/
│   │           └── route.ts    # [x] Claude-powered outline generation
│   ├── components/
│   │   ├── ui/                 # [ ] Empty - for shared UI components
│   │   ├── VerseDisplay.tsx    # [x] Shows verse with loading/error states
│   │   ├── OriginalLanguage.tsx# [~] UI ready, awaiting BSB data
│   │   ├── GameBoard.tsx       # [x] Full game interface with answer reveal
│   │   └── SermonOutline.tsx   # [x] Displays outline with themes/references
│   ├── lib/
│   │   ├── bible-api.ts        # [~] ESV full, NIV partial, others TODO
│   │   ├── strongs.ts          # [~] Validation works, lookup stubbed
│   │   ├── verse-parser.ts     # [x] All 66 books + abbreviations
│   │   ├── llm.ts              # [~] sermonOutline works, wordStudy/reflection unused
│   │   └── supabase/
│   │       ├── client.ts       # [~] Configured, not integrated
│   │       ├── server.ts       # [~] Configured, not integrated
│   │       └── middleware.ts   # [~] Stub for auth
│   ├── hooks/
│   │   └── useVerse.ts         # [x] Verse fetching with loading/error
│   ├── data/
│   │   └── questions.json      # [~] 4 seed questions (needs 50+)
│   ├── types/
│   │   ├── index.ts            # [x] All app types defined
│   │   └── database.ts         # [~] Placeholder for generated types
│   └── test/
│       └── setup.ts            # [x] Vitest/jest-dom setup
├── .env.example                # [x] All env vars documented
├── .prettierrc                 # [x] Code formatting rules
├── .lintstagedrc.json          # [x] Pre-commit lint config
├── vitest.config.ts            # [x] Test configuration
├── eslint.config.mjs           # [x] ESLint with TypeScript rules
├── next.config.ts              # [x] Next.js configuration
├── tailwind.config.ts          # [x] Tailwind with dark mode
├── tsconfig.json               # [x] Strict TypeScript settings
├── package.json                # [x] All scripts configured
├── bun.lock                    # [x] Dependency lockfile
└── CLAUDE.md                   # [x] This file
```

---

## Environment Variables

Store in `.env.local` for development:

```bash
# Bible APIs
BIBLE_API_KEY=your_key_here
ESV_API_KEY=your_key_here

# Anthropic Claude API
ANTHROPIC_API_KEY=your_key_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Server-side only, never expose
```

For Vercel deployment, add these in the Vercel dashboard under Project Settings → Environment Variables.

---

## Development Workflow

### Before Starting Any Feature

```bash
# Pull latest changes
git pull origin main

# Install any new dependencies
bun install

# Start local Supabase (if using database)
supabase start

# Start dev server
bun dev
```

### Writing Code

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Write tests first (TDD encouraged)**

   ```bash
   bun test:watch
   ```

3. **Implement the feature**

4. **Run all checks before committing**

   ```bash
   bun run check-all
   ```

5. **Commit (pre-commit hooks will run automatically)**
   ```bash
   git add .
   git commit -m "feat: description of feature"
   ```

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation only
- `style:` — Formatting, no code change
- `refactor:` — Code change that neither fixes nor adds
- `test:` — Adding or updating tests
- `chore:` — Maintenance tasks

### Pull Request Checklist

Before opening a PR, ensure:

- [ ] All tests pass (`bun test`)
- [ ] No linting errors (`bun lint`)
- [ ] No type errors (`bun run type-check`)
- [ ] Code is formatted (`bun run format`)
- [ ] Test coverage meets threshold (80%)
- [ ] New features have tests
- [ ] Documentation updated if needed

---

## Key Implementation Notes

### Verse Reference Parsing

Handle various formats:

- "John 3:16" → { book: "John", chapter: 3, verse: 16 }
- "Jn 3:16" → same
- "John 3:16-18" → { book: "John", chapter: 3, startVerse: 16, endVerse: 18 }
- "1 Corinthians 13:4-7" → handle books starting with numbers

### Strong's Number Format

- Hebrew: H1-H8674 (e.g., H430 = אֱלֹהִים, Elohim)
- Greek: G1-G5624 (e.g., G2316 = θεός, theos)

### Translation Mapping Challenge

Since Strong's maps to KJV word order, and modern translations may use different words or word order:

1. Always show KJV as reference alongside user's translation
2. Use LLM to explain mapping: "The ESV's 'only' translates the same Greek word (monogenēs, G3439) that KJV renders 'only begotten'"
3. Future: Build word-level alignment database

### Game Question Quality

For Berean Challenge, prioritize accuracy over volume:

- Start with hand-curated questions
- LLM-generated questions should be reviewed before publishing
- Flag questions by difficulty based on verse familiarity

### Sermon Outline Generation

Prompt engineering for outlines:

- Request expository structure (follows the passage's flow)
- Ask for key theological themes
- Request likely cross-references
- Emphasize this is "probable/suggested" not authoritative

---

## MVP Priorities

### Phase 1 — Core Functionality

**Completed:**

- [x] Project scaffolding and tooling (Next.js, TypeScript, ESLint, Vitest, Husky)
- [x] Berean Challenge game with all 3 modes (Verse Detective, Context Clues, Word Connections)
- [x] Sermon outline generator (passage → outline via Claude API)
- [x] Verse lookup with ESV translation
- [x] Verse reference parsing for all 66 books
- [x] Question bank populated (54 curated questions across modes/difficulties)
- [x] Supabase local setup with database schema

**Remaining:**

- [ ] Integrate BSB data for Greek/Hebrew word tagging
- [ ] Implement Strong's Concordance lookup (`fetchStrongsEntry`, `searchByStrongsNumber`)
- [ ] Wire up original language display in Scripture Deep Dive

### Phase 2 — Enhancement

- [ ] User accounts and progress tracking (Supabase auth integration)
- [ ] Multiple translation support (NIV, KJV full implementation)
- [ ] Daily challenge mode with shareable results
- [ ] Reflection question generation (LLM function exists in `llm.ts`, needs UI)
- [ ] Game progress persistence to Supabase

### Phase 3 — Polish

- [ ] Mobile optimization
- [ ] Notes export (PDF/Markdown)
- [ ] Community question contribution
- [ ] NASB/LSB support (requires licensing agreements)

---

## Design Principles

1. **Accuracy over speed** — Better to show "I'm not sure" than hallucinate
2. **Scripture-centered** — Tools point to the Word, not away from it
3. **Accessible** — No seminary degree required to use these tools
4. **Joyful** — Learning Scripture should be delightful, not dry
5. **Humble** — Tools support study, don't replace the Holy Spirit's work

---

## Future Considerations (Not for MVP)

- **Catechesis AI:** Interactive doctrinal learning — requires pastoral consultation on catechism selection and theological guardrails
- **Audio transcription:** Real-time sermon transcription for verse detection
- **Church integration:** Small group discussion guides, church-wide challenges
- **API for other ministries:** Let other Christian developers build on this foundation

---

## Translation Strategy

### Target Translations (What Users Actually Read)

| Translation  | Audience                                   | Licensing                                               |
| ------------ | ------------------------------------------ | ------------------------------------------------------- |
| **ESV**      | Reformed, TGC, Acts 29 churches            | API available (api.esv.org), free 500 req/day           |
| **NASB1995** | Serious Bible students, older evangelicals | Lockman Foundation, 1,000 verse limit without agreement |
| **NIV**      | Broad evangelical, most popular overall    | Biblica, available via api.bible                        |
| **LSB**      | MacArthur/Master's Seminary circles        | Three Sixteen Publishing, agreement required            |

### The Core Challenge

Strong's Concordance maps Greek/Hebrew words to **KJV** word order. But our users read ESV, NASB, NIV, LSB. We need to bridge this gap.

### Hybrid Architecture Solution

```
┌─────────────────────────────────────────────────────────┐
│           USER'S PREFERRED TRANSLATION          │
│       (ESV, NASB, NIV, LSB — what they read)    │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│            BSB AS TECHNICAL BACKBONE            │
│    (Public domain Greek/Hebrew word tagging)    │
│         Powers the original language features   │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│         GREEK/HEBREW + STRONG'S DATA            │
│      (Definitions, word studies, cross-refs)    │
└─────────────────────────────────────────────────────────┘
```

**How it works:**

1. User reads John 3:16 in **ESV** (their preferred translation)
2. They tap a word to see the Greek
3. Behind the scenes, BSB's word-level tagging identifies the Greek word and Strong's number
4. App displays: Greek word, transliteration, Strong's definition, other occurrences
5. User never needs to "read" BSB — it just powers the Greek/Hebrew connections

### Berean Standard Bible (BSB) — Technical Backbone

The BSB is a **public domain** translation with word-level Greek/Hebrew tagging already complete.

**Why BSB for the backend:**

- Modern English translation (completed 2020)
- Word-level Greek/Hebrew tagging already done
- **Public domain** as of April 30, 2023 — no licensing needed
- Can be self-hosted and integrated freely

**Resources:**

- berean.bible — Official site with terms
- interlinearbible.com — Berean Interlinear Bible
- bereanbibles.com/ministry-resources/ — Ministry licensing

**Usage Rights (from berean.bible/terms.htm):**

> "The Berean Bible and Majority Bible texts are officially dedicated to the public domain as of April 30, 2023. All uses are freely permitted."

### API Sources

| Translation  | API Source                       | Notes                             |
| ------------ | -------------------------------- | --------------------------------- |
| **ESV**      | api.esv.org                      | Free tier: 500 requests/day       |
| **NIV**      | api.bible                        | Free tier available, key required |
| **NASB1995** | api.bible or Lockman agreement   | Verify availability               |
| **LSB**      | Three Sixteen Publishing         | Requires licensing agreement      |
| **BSB**      | Self-hosted (public domain)      | Free, no API limits               |
| **KJV**      | Multiple sources (public domain) | Free                              |

### Implementation Phases

**MVP (Phase 1):**

- ESV via api.esv.org (most Reformed users covered)
- NIV via api.bible (broadest evangelical reach)
- BSB as Greek/Hebrew engine (public domain, self-hosted)
- KJV as fallback/reference (public domain)

**Phase 2 (After Licensing Conversations):**

- Add NASB1995 (Lockman Foundation agreement)
- Add LSB (Three Sixteen Publishing agreement)
- These are "power user" translations

### Licensing Outreach Required

Before Phase 2, contact:

1. **Three Sixteen Publishing** (LSB) — info@316publishing.com
2. **Lockman Foundation** (NASB) — permissions via lockman.org

---

## Development Commands

### Development

```bash
# Run development server
bun dev

# Run tests
bun test

# Run tests in watch mode
bun test:watch

# Run linting
bun lint

# Run type checking
bun run type-check

# Format code
bun run format

# Run all checks (pre-commit simulation)
bun run check-all

# Build for production
bun run build

# Start production server
bun start
```

### Supabase

**Note:** Supabase local development requires Docker Desktop to be running.

```bash
# Initialize Supabase locally (already done)
supabase init

# Start local Supabase
# Requires: Docker Desktop running
supabase start

# After starting, apply the migration
supabase db reset

# Generate TypeScript types from database schema
supabase gen types typescript --local > src/types/database.ts

# Push migrations to production
supabase db push
```

---

_"Now the Bereans were more noble-minded than the Thessalonians, for they received the message with great eagerness and examined the Scriptures every day to see if these teachings were true."_ — Acts 17:11 (BSB)
