// Default to port 5000 (backend default port)
// Port 6000 is blocked by browsers (ERR_UNSAFE_PORT)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  LOGOUT_ALL: '/api/auth/logout-all',
  REFRESH: '/api/auth/refresh',
  ME: '/api/auth/me',
  PROFILE: '/api/profile',
  PROFILE_PREFERENCES: '/api/profile/preferences',
  PROFILE_PASSWORD: '/api/profile/password',
  PROFILE_SESSIONS: '/api/profile/sessions',
  PROFILE_SESSIONS_REVOKE_ALL: '/api/profile/sessions/revoke-all',
  // Account endpoints
  BANK_ACCOUNTS: '/api/accounts/bank',
  CASH_WALLETS: '/api/accounts/cash',
  ALL_ACCOUNTS: '/api/accounts/all',
  // Transaction endpoints
  TRANSACTIONS: '/api/transactions',
  // Statement endpoints
  STATEMENTS: '/api/statements',
  // Cash operation endpoints
  CASH_IN: '/api/cash/in',
  CASH_OUT: '/api/cash/out',
  CASH_TRANSFER: '/api/cash/transfer',
  RECONCILIATION: '/api/cash/reconciliation',
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
};

export const CURRENCIES = [
  { code: 'INR', name: 'Indian Rupee (INR)' },
  { code: 'USD', name: 'US Dollar (USD)' },
  { code: 'EUR', name: 'Euro (EUR)' },
  { code: 'GBP', name: 'British Pound (GBP)' },
  { code: 'JPY', name: 'Japanese Yen (JPY)' },
  { code: 'AUD', name: 'Australian Dollar (AUD)' },
  { code: 'CAD', name: 'Canadian Dollar (CAD)' },
  { code: 'CHF', name: 'Swiss Franc (CHF)' },
  { code: 'CNY', name: 'Chinese Yuan (CNY)' },
  { code: 'SGD', name: 'Singapore Dollar (SGD)' },
];

export const LOCALES = [
  { code: 'en-IN', name: 'English (India)' },
  { code: 'en-US', name: 'English (United States)' },
  { code: 'en-GB', name: 'English (United Kingdom)' },
  { code: 'hi-IN', name: 'Hindi (India)' },
  { code: 'fr-FR', name: 'French (France)' },
  { code: 'de-DE', name: 'German (Germany)' },
  { code: 'es-ES', name: 'Spanish (Spain)' },
  { code: 'ja-JP', name: 'Japanese (Japan)' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
];

export const TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
  { value: 'America/New_York', label: 'America/New_York (EST)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)' },
  { value: 'Europe/London', label: 'Europe/London (GMT)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST)' },
  { value: 'America/Chicago', label: 'America/Chicago (CST)' },
  { value: 'America/Denver', label: 'America/Denver (MST)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT)' },
  { value: 'UTC', label: 'UTC' },
];

export const DEFAULT_START_SCREENS = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'transactions', label: 'Transactions' },
  { value: 'profile', label: 'Profile' },
];

export const WEEK_START_DAYS = [
  { value: 'monday', label: 'Monday' },
  { value: 'sunday', label: 'Sunday' },
];

