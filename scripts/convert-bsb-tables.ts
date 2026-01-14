#!/usr/bin/env bun
/* eslint-disable no-console, @typescript-eslint/explicit-function-return-type */
/**
 * Convert BSB Translation Tables TSV to JSON files per book
 *
 * Usage: bun run scripts/convert-bsb-tables.ts
 *
 * Input: scripts/data/bsb_tables.tsv
 * Output: src/data/bsb/*.json (66 book files)
 */

import * as fs from 'fs';
import * as path from 'path';

interface InterlinearWord {
  position: number;
  text: string;
  original: string;
  transliteration: string;
  strongsNumber: string;
  morphology?: string;
}

interface BookData {
  book: string;
  chapters: Record<string, Record<string, InterlinearWord[]>>;
}

const BOOK_CODE_MAP: Record<string, string> = {
  Genesis: 'GEN',
  Exodus: 'EXO',
  Leviticus: 'LEV',
  Numbers: 'NUM',
  Deuteronomy: 'DEU',
  Joshua: 'JOS',
  Judges: 'JDG',
  Ruth: 'RUT',
  '1 Samuel': '1SA',
  '2 Samuel': '2SA',
  '1 Kings': '1KI',
  '2 Kings': '2KI',
  '1 Chronicles': '1CH',
  '2 Chronicles': '2CH',
  Ezra: 'EZR',
  Nehemiah: 'NEH',
  Esther: 'EST',
  Job: 'JOB',
  Psalms: 'PSA',
  Psalm: 'PSA',
  Proverbs: 'PRO',
  Ecclesiastes: 'ECC',
  'Song of Solomon': 'SNG',
  'Song of Songs': 'SNG',
  Isaiah: 'ISA',
  Jeremiah: 'JER',
  Lamentations: 'LAM',
  Ezekiel: 'EZK',
  Daniel: 'DAN',
  Hosea: 'HOS',
  Joel: 'JOL',
  Amos: 'AMO',
  Obadiah: 'OBA',
  Jonah: 'JON',
  Micah: 'MIC',
  Nahum: 'NAM',
  Habakkuk: 'HAB',
  Zephaniah: 'ZEP',
  Haggai: 'HAG',
  Zechariah: 'ZEC',
  Malachi: 'MAL',
  Matthew: 'MAT',
  Mark: 'MRK',
  Luke: 'LUK',
  John: 'JHN',
  Acts: 'ACT',
  Romans: 'ROM',
  '1 Corinthians': '1CO',
  '2 Corinthians': '2CO',
  Galatians: 'GAL',
  Ephesians: 'EPH',
  Philippians: 'PHP',
  Colossians: 'COL',
  '1 Thessalonians': '1TH',
  '2 Thessalonians': '2TH',
  '1 Timothy': '1TI',
  '2 Timothy': '2TI',
  Titus: 'TIT',
  Philemon: 'PHM',
  Hebrews: 'HEB',
  James: 'JAS',
  '1 Peter': '1PE',
  '2 Peter': '2PE',
  '1 John': '1JN',
  '2 John': '2JN',
  '3 John': '3JN',
  Jude: 'JUD',
  Revelation: 'REV',
};

function parseVerseRef(ref: string): { book: string; chapter: string; verse: string } | null {
  if (!ref || ref === '-') return null;

  // Handle "Book Chapter:Verse" format
  const match = ref.match(/^(.+?)\s+(\d+):(\d+)$/);
  if (!match || !match[1] || !match[2] || !match[3]) return null;

  return {
    book: match[1].trim(),
    chapter: match[2],
    verse: match[3],
  };
}

function formatStrongsNumber(heb: string, grk: string): string {
  if (grk && grk !== '-' && grk.trim()) {
    const num = parseInt(grk.trim(), 10);
    if (!isNaN(num)) return `G${num.toString().padStart(4, '0')}`;
  }
  if (heb && heb !== '-' && heb.trim()) {
    const num = parseInt(heb.trim(), 10);
    if (!isNaN(num)) return `H${num.toString().padStart(4, '0')}`;
  }
  return '';
}

async function main() {
  const inputPath = path.join(__dirname, 'data', 'bsb_tables.tsv');
  const outputDir = path.join(__dirname, '..', 'src', 'data', 'bsb');

  if (!fs.existsSync(inputPath)) {
    console.error('Input file not found:', inputPath);
    console.error('Run the download first or place bsb_tables.tsv in scripts/data/');
    process.exit(1);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  console.log('Reading BSB Translation Tables...');
  const data = fs.readFileSync(inputPath, 'utf8');
  const lines = data.split('\n');

  console.log(`Processing ${lines.length} lines...`);

  const books: Map<string, BookData> = new Map();
  let currentRef: { book: string; chapter: string; verse: string } | null = null;
  let wordPosition = 0;
  let processedWords = 0;
  let skippedWords = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line || !line.trim()) continue;

    const cols = line.split('\t');

    // Column indices (0-indexed):
    // 6: Original text (with variants)
    // 7: Transliteration
    // 8/9: Parsing (morphology)
    // 10: Strong's Hebrew
    // 11: Strong's Greek
    // 12: Verse reference (only on first word of verse)
    // 18: BSB English text

    const verseRef = cols[12]?.trim();
    const original = cols[6]?.trim();
    const transliteration = cols[7]?.trim();
    const morphology = cols[8]?.trim() || cols[9]?.trim();
    const strongsHeb = cols[10]?.trim();
    const strongsGrk = cols[11]?.trim();
    const englishText = cols[18]?.trim();

    // Update current verse reference if a new one appears
    if (verseRef && verseRef !== '-') {
      const parsed = parseVerseRef(verseRef);
      if (parsed) {
        currentRef = parsed;
        wordPosition = 0;
      }
    }

    // Skip empty/placeholder rows
    if (!original || original === '-' || !transliteration || transliteration === '-') {
      continue;
    }

    // Skip if we don't have a current verse reference
    if (!currentRef) {
      skippedWords++;
      continue;
    }

    // Skip placeholder English text
    if (englishText === '-' || englishText === 'vvv' || !englishText) {
      skippedWords++;
      continue;
    }

    const strongsNumber = formatStrongsNumber(strongsHeb || '', strongsGrk || '');

    // Get or create book data
    const bookCode = BOOK_CODE_MAP[currentRef.book];
    if (!bookCode) {
      skippedWords++;
      continue;
    }

    if (!books.has(bookCode)) {
      books.set(bookCode, { book: bookCode, chapters: {} });
    }

    const bookData = books.get(bookCode)!;
    const chapterKey = currentRef.chapter;
    const verseKey = currentRef.verse;

    if (!bookData.chapters[chapterKey]) {
      bookData.chapters[chapterKey] = {};
    }

    const chapterData = bookData.chapters[chapterKey]!;
    if (!chapterData[verseKey]) {
      chapterData[verseKey] = [];
    }

    const word: InterlinearWord = {
      position: wordPosition++,
      text: englishText,
      original: original.replace(/[{}⧼⧽()〈〉\[\]‹›\[\[|\]\]]/g, '').trim(),
      transliteration,
      strongsNumber,
    };

    if (morphology && morphology !== '-') {
      word.morphology = morphology;
    }

    chapterData[verseKey]!.push(word);
    processedWords++;

    if (processedWords % 100000 === 0) {
      process.stdout.write(`\r  Processed ${processedWords} words...`);
    }
  }

  console.log(`\n\nProcessed ${processedWords} words, skipped ${skippedWords}`);
  console.log(`Generated data for ${books.size} books`);

  // Write each book to a separate JSON file
  console.log('\nWriting JSON files...');
  let totalSize = 0;

  for (const [bookCode, bookData] of books) {
    const outputPath = path.join(outputDir, `${bookCode}.json`);
    const json = JSON.stringify(bookData, null, 0); // Compact JSON
    fs.writeFileSync(outputPath, json);
    const size = json.length;
    totalSize += size;
    console.log(`  ${bookCode}.json: ${(size / 1024).toFixed(1)} KB`);
  }

  console.log(`\nTotal output size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log('\nConversion complete!');

  // Show sample data
  const johnData = books.get('JHN');
  if (johnData?.chapters['3']?.['16']) {
    console.log('\nSample - John 3:16:');
    johnData.chapters['3']['16'].slice(0, 5).forEach(w => {
      console.log(
        `  ${w.position}: "${w.text}" = ${w.original} (${w.transliteration}) [${w.strongsNumber}]`
      );
    });
  }
}

main().catch(console.error);
