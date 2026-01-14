# Berean Toolkit

A suite of Scripture study tools designed to help Christians grow in knowledge, wisdom, and spiritual maturity through deeper engagement with God's Word.

> _"Now the Bereans were more noble-minded than the Thessalonians, for they received the message with great eagerness and **examined the Scriptures daily** to see if these teachings were true."_ — Acts 17:11 (BSB)

This project is inspired by [Basil Tech](https://www.basiltech.org/), a Christian faith-based technology nonprofit. Like Bezalel, whom God filled with His Spirit and skill to build the Tabernacle, we want to use the skills God has given us to serve the Church.

## Features

### Scripture Deep Dive

Look up any Bible verse and explore the original Hebrew (OT) or Greek (NT) with Strong's Concordance numbers and definitions.

- Verse lookup with ESV and BSB translations
- Strong's Concordance integration (~350 entries)
- Word-level Greek/Hebrew definitions

### Berean Challenge

A gamified way to grow in Scripture knowledge with three game modes:

- **Verse Detective** — Guess the reference from a verse quote
- **Context Clues** — Answer questions about surrounding context
- **Word Connections** — Identify verses containing Greek/Hebrew words

54 curated questions across difficulty levels.

### Sermon Companion

Prepare for sermons with AI-generated outlines and study aids.

- Passage-based outline generation via Claude API
- Key themes and cross-references
- Suggested reflection questions

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- API keys (see below)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/berean-toolkit.git
cd berean-toolkit

# Install dependencies
bun install

# Copy environment variables
cp .env.example .env.local

# Start development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

Add your API keys to `.env.local`:

```bash
# Required for verse lookup (Scripture Deep Dive)
ESV_API_KEY=your_esv_api_key          # Get from api.esv.org

# Required for sermon outlines (Sermon Companion)
ANTHROPIC_API_KEY=your_anthropic_key  # Get from console.anthropic.com

# Optional - for NIV support
BIBLE_API_KEY=your_bible_api_key      # Get from scripture.api.bible
```

**What works without API keys:**

- Berean Challenge (all game modes)
- Home page navigation

## Tech Stack

- **Runtime:** [Bun](https://bun.sh/)
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **AI:** Claude API (Anthropic)
- **Testing:** Vitest + React Testing Library
- **Linting:** ESLint + Prettier
- **Git Hooks:** Husky + lint-staged

## Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Write tests first** (TDD encouraged)

   ```bash
   bun test:watch
   ```

3. **Run all checks before committing**

   ```bash
   bun run check-all
   ```

4. **Commit using conventional commits**
   ```bash
   git commit -m "feat: add new feature"
   ```

### Commit Message Convention

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation only
- `style:` — Formatting, no code change
- `refactor:` — Code restructuring
- `test:` — Adding or updating tests
- `chore:` — Maintenance tasks

### Pull Request Checklist

- [ ] All tests pass (`bun test`)
- [ ] No linting errors (`bun lint`)
- [ ] No type errors (`bun run type-check`)
- [ ] Code is formatted (`bun run format`)
- [ ] Test coverage meets threshold (80%)
- [ ] New features have tests

### Available Commands

```bash
bun dev           # Start development server
bun test          # Run tests
bun test:watch    # Run tests in watch mode
bun lint          # Run linting
bun run type-check    # Check TypeScript types
bun run format    # Format code with Prettier
bun run check-all # Run all checks
bun run build     # Build for production
```

## Roadmap

### Phase 1 — Core Functionality (Current)

- [x] Project scaffolding (Next.js, TypeScript, ESLint, Vitest, Husky)
- [x] Berean Challenge game (all 3 modes)
- [x] Sermon outline generator
- [x] Verse lookup (ESV, BSB)
- [x] Verse reference parsing (all 66 books)
- [x] Question bank (54 curated questions)
- [x] Strong's Concordance API
- [x] BSB Bible API
- [ ] Full interlinear display (word-level Greek/Hebrew in verse text)
- [ ] BSB Translation Tables for word-by-word Strong's mapping

### Phase 2 — Enhancement

- [ ] User accounts and progress tracking (Supabase auth)
- [ ] Multiple translation support (NIV, KJV full implementation)
- [ ] Daily challenge mode with shareable results
- [ ] Reflection question generation UI
- [ ] Game progress persistence

### Phase 3 — Polish

- [ ] Mobile optimization
- [ ] Notes export (PDF/Markdown)
- [ ] Community question contribution
- [ ] NASB/LSB support (requires licensing)

## Design Principles

1. **Accuracy over speed** — Better to show "I'm not sure" than hallucinate
2. **Scripture-centered** — Tools point to the Word, not away from it
3. **Accessible** — No seminary degree required
4. **Joyful** — Learning Scripture should be delightful
5. **Humble** — Tools support study, don't replace the Holy Spirit's work

## Sustainability Model

- **Core tools remain free** — Individual believers should never hit a paywall for personal Bible study
- **Sustainability, not profit** — Revenue covers operating costs only
- **Surplus goes to missions** — Any profit beyond costs is donated to missionaries

## License

[MIT](LICENSE)

---

_Built with love for the Church._
