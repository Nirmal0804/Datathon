/**
 * Centralized Internationalization (i18n) Engine for CrimeIntel.
 * Supports: English (en) and Kannada (kn).
 * Falls back safely to English for missing keys without breaking the UI.
 * Does NOT translate dynamic crime/police data (e.g. FIR IDs, district names, officer names).
 */

import { useState, useEffect, useCallback } from 'react';
import en from './locales/en';
import kn from './locales/kn';
import { getSavedPreferences } from '../utils/dateTime';

const TRANSLATIONS = {
  en,
  kn,
};

/**
 * Retrieve current active language code ('en' | 'kn').
 */
export function getCurrentLanguage() {
  try {
    const prefs = getSavedPreferences();
    return prefs.language === 'kn' ? 'kn' : 'en';
  } catch {
    return 'en';
  }
}

/**
 * Safely lookup a translation key using dot notation with fallback to English and raw key.
 */
export function translate(key, languageOverride, fallback) {
  if (!key || typeof key !== 'string') return fallback || '';

  const lang = languageOverride || getCurrentLanguage();
  const keys = key.split('.');

  // 1. Try target language
  let val = TRANSLATIONS[lang];
  for (const k of keys) {
    if (val && typeof val === 'object' && k in val) {
      val = val[k];
    } else {
      val = null;
      break;
    }
  }

  if (typeof val === 'string' && val.trim().length > 0) {
    return val;
  }

  // 2. Safe Fallback to English (if target was not English)
  if (lang !== 'en') {
    let fallbackVal = TRANSLATIONS.en;
    for (const k of keys) {
      if (fallbackVal && typeof fallbackVal === 'object' && k in fallbackVal) {
        fallbackVal = fallbackVal[k];
      } else {
        fallbackVal = null;
        break;
      }
    }
    if (typeof fallbackVal === 'string' && fallbackVal.trim().length > 0) {
      return fallbackVal;
    }
  }

  // 3. Final fallback
  if (typeof fallback === 'string') return fallback;
  return keys[keys.length - 1] || key;
}

/**
 * React Hook for component translation with real-time preference reactivity.
 */
export function useTranslation() {
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage);

  useEffect(() => {
    const handleUpdate = () => {
      setCurrentLang(getCurrentLanguage());
    };

    window.addEventListener('ksp_preferences_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('ksp_preferences_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const t = useCallback(
    (key, fallback) => translate(key, currentLang, fallback),
    [currentLang]
  );

  return {
    t,
    language: currentLang,
    isKannada: currentLang === 'kn',
  };
}

export default translate;
