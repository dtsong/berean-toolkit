# Berean Toolkit

Scripture study tools to help Christians engage deeply with God's Word.

> "Now the Bereans were more noble-minded than the Thessalonians, for they received the message with great eagerness and **examined the Scriptures daily** to see if these teachings were true." — Acts 17:11

Inspired by [Basil Tech](https://www.basiltech.org/), a Christian faith-based technology nonprofit.

## Goals

1. Make original language study (Hebrew/Greek) accessible to everyday believers
2. Gamify Scripture knowledge to make learning joyful
3. Support sermon engagement with note-taking and reflection tools
4. Ground everything in accurate, faithful handling of God's Word

## Design Principles

1. **Accuracy over speed** — Better to show "I'm not sure" than hallucinate
2. **Scripture-centered** — Tools point to the Word, not away from it
3. **Accessible** — No seminary degree required
4. **Joyful** — Learning Scripture should be delightful
5. **Humble** — Tools support study, don't replace the Holy Spirit's work

## The Three Tools

### Scripture Deep Dive

Look up any verse and see the original Hebrew/Greek with Strong's Concordance numbers and definitions. User reads in their preferred translation (ESV, NIV); BSB powers the word-level tagging behind the scenes.

### Berean Challenge

Gamified Scripture knowledge with three modes: Verse Detective (guess the reference), Context Clues (surrounding context questions), and Word Connections (Greek/Hebrew vocabulary).

### Sermon Companion

AI-generated sermon outlines from a passage reference. Outlines are "suggested/probable" — supports active listening, doesn't replace engagement.

## Key Architecture Decisions

### Translation Strategy

Strong's Concordance maps to KJV word order, but users read modern translations. Solution:

- **User-facing**: ESV, NIV (what they read)
- **Technical backbone**: BSB (Berean Standard Bible) — public domain with word-level Greek/Hebrew tagging
- User taps a word → BSB identifies the Greek/Hebrew → app shows Strong's definition

BSB is public domain as of April 30, 2023. Users never "read" BSB; it just powers the original language connections.

### Strong's Number Format

- Hebrew: H1-H8674 (e.g., H430 = אֱלֹהִים, Elohim)
- Greek: G1-G5624 (e.g., G2316 = θεός, theos)

### Sustainability Model

- Core tools remain free for individual believers
- Revenue (if any) covers operating costs; surplus goes to missions
- Church/pastor premium features may fund the free tier

### Future Licensing

For NASB/LSB support, contact:

- **Three Sixteen Publishing** (LSB): info@316publishing.com
- **Lockman Foundation** (NASB): lockman.org

## Finding Information

| What                          | Where                     |
| ----------------------------- | ------------------------- |
| Getting started, contributing | `README.md`               |
| Environment variables         | `.env.example`            |
| Available scripts             | `package.json`            |
| TypeScript types              | `src/types/index.ts`      |
| Database schema               | `supabase/migrations/`    |
| Game questions                | `src/data/questions.json` |
| Strong's lexicons             | `src/data/strongs/`       |
