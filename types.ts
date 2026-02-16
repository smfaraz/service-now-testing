export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface KeyValue {
  id: string;
  key: string;
  value: string;
  active: boolean;
}

export interface RequestHistoryItem {
  id: string;
  timestamp: number;
  method: HttpMethod;
  url: string;
  status: number;
  duration: number;
  success: boolean;
  requestBody?: string;
  responseBody?: string;
}

export interface EnvironmentSettings {
  instanceUrl: string;
  username: string;
  password?: string; // Optional for security (often not stored in full plain text in real apps)
  token?: string;
  useMockMode: boolean;
  defaultHeaders: KeyValue[];
}

export interface WebhookEvent {
  id: string;
  timestamp: number;
  method: HttpMethod;
  headers: Record<string, string>;
  body: any;
  source: string;
}

export enum AppTab {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
  HISTORY = 'history',
  SETTINGS = 'settings',
  DASHBOARD = 'dashboard'
}
