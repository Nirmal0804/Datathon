/**
 * Centralized Date, Time, and Preference Formatting Utilities for CrimeIntel.
 *
 * Formats dates and times strictly at the UI presentation layer based on
 * user preferences saved in localStorage (ksp_user_preferences).
 * Does not mutate API payloads, database values, or backend timestamps.
 */

import { useState, useEffect, useCallback } from 'react';

export const DEFAULT_PREFERENCES = {
  theme: 'light',
  language: 'en',
  dateFormat: 'DD-MM-YYYY',
  timeFormat: '24h',
  mapTheme: 'dark',
  defaultDashboard: 'overview',
  fontSize: 'medium',
  autoSave: true,
};

/**
 * Retrieve current user preferences from localStorage with fallback defaults.
 */
export function getSavedPreferences() {
  try {
    const saved = localStorage.getItem('ksp_user_preferences');
    if (saved && saved !== 'undefined' && saved !== 'null') {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        let theme = parsed.theme;
        if (theme === 'dark-navy') theme = 'dark';
        else if (theme === 'system' || (theme !== 'light' && theme !== 'dark')) theme = 'light';

        let dateFormat = parsed.dateFormat || DEFAULT_PREFERENCES.dateFormat;
        let timeFormat = parsed.timeFormat || DEFAULT_PREFERENCES.timeFormat;
        let defaultDashboard = parsed.defaultDashboard || DEFAULT_PREFERENCES.defaultDashboard;

        return {
          ...DEFAULT_PREFERENCES,
          ...parsed,
          theme,
          dateFormat,
          timeFormat,
          defaultDashboard,
        };
      }
    }
  } catch (err) {
    console.warn('Failed to parse ksp_user_preferences:', err);
  }
  return DEFAULT_PREFERENCES;
}

/**
 * Parse any date input into a valid JS Date object.
 */
export function parseDateInput(input) {
  if (!input) return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;

  if (typeof input === 'number') {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    // Check standard YYYY-MM-DD or ISO
    const isoParsed = new Date(trimmed);
    if (!isNaN(isoParsed.getTime())) return isoParsed;

    // Check DD-MM-YYYY or DD/MM/YYYY
    const ddmmyyyy = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (ddmmyyyy) {
      const [, day, month, year] = ddmmyyyy;
      const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
      if (!isNaN(d.getTime())) return d;
    }
  }

  return null;
}

/**
 * Format a date strictly according to user preference (DD-MM-YYYY, MM-DD-YYYY, YYYY-MM-DD).
 */
export function formatDate(input, formatOverride) {
  const d = parseDateInput(input);
  if (!d) return typeof input === 'string' ? input : '';

  const format = formatOverride || getSavedPreferences().dateFormat || 'DD-MM-YYYY';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear());

  if (format === 'MM-DD-YYYY') {
    return `${month}-${day}-${year}`;
  }
  if (format === 'YYYY-MM-DD') {
    return `${year}-${month}-${day}`;
  }
  // Default: DD-MM-YYYY
  return `${day}-${month}-${year}`;
}

/**
 * Format a time strictly according to user preference (24h or 12h with AM/PM).
 */
export function formatTime(input, formatOverride, includeSeconds = false) {
  let d = parseDateInput(input);
  if (!d && typeof input === 'string') {
    // If input is "HH:mm" or "HH:mm:ss"
    const match = input.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (match) {
      const now = new Date();
      now.setHours(parseInt(match[1], 10), parseInt(match[2], 10), match[3] ? parseInt(match[3], 10) : 0);
      d = now;
    }
  }

  if (!d) return typeof input === 'string' ? input : '';

  const format = formatOverride || getSavedPreferences().timeFormat || '24h';
  const hours24 = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  if (format === '12h') {
    const ampm = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 || 12;
    const padded12 = String(hours12).padStart(2, '0');
    return includeSeconds ? `${padded12}:${minutes}:${seconds} ${ampm}` : `${padded12}:${minutes} ${ampm}`;
  }

  // Default: 24h
  const padded24 = String(hours24).padStart(2, '0');
  return includeSeconds ? `${padded24}:${minutes}:${seconds}` : `${padded24}:${minutes}`;
}

/**
 * Format both date and time into a single string.
 */
export function formatDateTime(input, dateFormatOverride, timeFormatOverride, includeSeconds = false) {
  const d = parseDateInput(input);
  if (!d) return typeof input === 'string' ? input : '';

  const dateStr = formatDate(d, dateFormatOverride);
  const timeStr = formatTime(d, timeFormatOverride, includeSeconds);
  return `${dateStr} ${timeStr}`;
}

/**
 * React hook that subscribes to preference changes and provides reactive formatters.
 */
export function useDateTimeFormatter() {
  const [preferences, setPreferences] = useState(getSavedPreferences);

  useEffect(() => {
    const handleUpdate = () => {
      setPreferences(getSavedPreferences());
    };

    window.addEventListener('ksp_preferences_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('ksp_preferences_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const formatD = useCallback((input, override) => formatDate(input, override || preferences.dateFormat), [preferences.dateFormat]);
  const formatT = useCallback((input, override, incSec) => formatTime(input, override || preferences.timeFormat, incSec), [preferences.timeFormat]);
  const formatDT = useCallback((input, dOverride, tOverride, incSec) => formatDateTime(input, dOverride || preferences.dateFormat, tOverride || preferences.timeFormat, incSec), [preferences.dateFormat, preferences.timeFormat]);

  return {
    preferences,
    formatDate: formatD,
    formatTime: formatT,
    formatDateTime: formatDT,
  };
}
