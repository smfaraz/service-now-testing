import { EnvironmentSettings, RequestHistoryItem, KeyValue } from '../types';
import { DEFAULT_HEADERS } from '../constants';

const KEYS = {
  SETTINGS: 'snowtest_settings',
  HISTORY: 'snowtest_history',
  THEME: 'snowtest_theme'
};

export const getSettings = (): EnvironmentSettings => {
  const saved = localStorage.getItem(KEYS.SETTINGS);
  const defaults: EnvironmentSettings = {
    instanceUrl: 'https://dev00000.service-now.com',
    username: 'admin',
    useMockMode: true,
    defaultHeaders: DEFAULT_HEADERS,
    useProxy: false,
    proxyUrl: 'https://corsproxy.io/?'
  };

  if (saved) {
    // Merge defaults with saved settings to ensure new fields (like useProxy) exist for old users
    return { ...defaults, ...JSON.parse(saved) };
  }
  return defaults;
};

export const saveSettings = (settings: EnvironmentSettings) => {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
};

export const getHistory = (): RequestHistoryItem[] => {
  const saved = localStorage.getItem(KEYS.HISTORY);
  return saved ? JSON.parse(saved) : [];
};

export const saveHistoryItem = (item: RequestHistoryItem) => {
  const history = getHistory();
  const newHistory = [item, ...history].slice(0, 50); // Keep last 50
  localStorage.setItem(KEYS.HISTORY, JSON.stringify(newHistory));
};

export const clearHistory = () => {
  localStorage.removeItem(KEYS.HISTORY);
};