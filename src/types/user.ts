/**
 * User profile types
 */

import type { Translation } from './verse';

export interface UserProfile {
  id: string;
  username?: string;
  displayName?: string;
  preferredTranslation: Translation;
  createdAt: Date;
  updatedAt: Date;
}
