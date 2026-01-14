/**
 * Strong's Concordance utilities
 * Hebrew: H1-H8674
 * Greek: G1-G5624
 */

import type { StrongsEntry } from '@/types';

/**
 * Check if a Strong's number is valid
 */
export function isValidStrongsNumber(number: string): boolean {
  const pattern = /^[HG]\d{1,4}$/i;
  return pattern.test(number);
}

/**
 * Determine if Strong's number is Hebrew or Greek
 */
export function getStrongsLanguage(number: string): 'hebrew' | 'greek' | null {
  if (!isValidStrongsNumber(number)) {
    return null;
  }
  return number.toUpperCase().startsWith('H') ? 'hebrew' : 'greek';
}

/**
 * Format Strong's number consistently (uppercase, zero-padded)
 */
export function formatStrongsNumber(number: string): string | null {
  if (!isValidStrongsNumber(number)) {
    return null;
  }
  const prefix = number[0]?.toUpperCase() ?? '';
  const numPart = number.slice(1);
  return `${prefix}${numPart.padStart(4, '0')}`;
}

/**
 * Fetch Strong's entry from local API
 */
export async function fetchStrongsEntry(number: string): Promise<StrongsEntry | null> {
  const formatted = formatStrongsNumber(number);
  if (formatted == null) {
    return null;
  }

  try {
    const response = await fetch(`/api/strongs/${formatted}`);
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as StrongsEntry;
    return data;
  } catch (error) {
    console.error("Failed to fetch Strong's entry:", error);
    return null;
  }
}

/**
 * Search for verses containing a specific Strong's number
 * TODO: Implement actual search
 */
export async function searchByStrongsNumber(number: string): Promise<string[]> {
  const formatted = formatStrongsNumber(number);
  if (formatted == null) {
    return [];
  }

  // Placeholder - implement actual search
  console.warn('searchByStrongsNumber not yet implemented:', formatted);
  return [];
}
