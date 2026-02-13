/**
 * Canonical Bible book name <-> code mapping.
 *
 * Codes match the BSB JSON/API datasets (3-letter with some numeric prefixes).
 */

export const BOOK_NAME_TO_CODE: Record<string, string> = {
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
  Proverbs: 'PRO',
  Ecclesiastes: 'ECC',
  'Song of Solomon': 'SNG',
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

export const BOOK_CODE_TO_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(BOOK_NAME_TO_CODE).map(([name, code]) => [code, name])
);

export function getBookNameFromCode(bookCode: string): string | null {
  const upper = bookCode.toUpperCase();
  return BOOK_CODE_TO_NAME[upper] ?? null;
}

export function isValidBookCode(bookCode: string): boolean {
  return getBookNameFromCode(bookCode) != null;
}

/**
 * Get the 3-letter book code from a book name.
 *
 * Accepts common variations/abbreviations to keep the UI forgiving.
 */
export function getBookCodeFromName(bookName: string): string | null {
  // Direct match
  if (BOOK_NAME_TO_CODE[bookName]) {
    return BOOK_NAME_TO_CODE[bookName];
  }

  // Try case-insensitive match
  const lowerBookName = bookName.toLowerCase();
  for (const [name, code] of Object.entries(BOOK_NAME_TO_CODE)) {
    if (name.toLowerCase() === lowerBookName) {
      return code;
    }
  }

  // Handle common variations
  const variations: Record<string, string> = {
    'song of songs': 'SNG',
    songs: 'SNG',
    psalm: 'PSA',
    '1sam': '1SA',
    '2sam': '2SA',
    '1kgs': '1KI',
    '2kgs': '2KI',
    '1chr': '1CH',
    '2chr': '2CH',
    '1cor': '1CO',
    '2cor': '2CO',
    '1thess': '1TH',
    '2thess': '2TH',
    '1tim': '1TI',
    '2tim': '2TI',
    '1pet': '1PE',
    '2pet': '2PE',
    '1jn': '1JN',
    '2jn': '2JN',
    '3jn': '3JN',
  };

  return variations[lowerBookName] ?? null;
}
