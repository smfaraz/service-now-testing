import { KeyValue } from './types';

export const DEFAULT_HEADERS: KeyValue[] = [
  { id: '1', key: 'Content-Type', value: 'application/json', active: true },
  { id: '2', key: 'Accept', value: 'application/json', active: true },
];

export const MOCK_WEBHOOK_PAYLOADS = [
  {
    short_description: "Email server is down",
    priority: "1",
    caller_id: "admin",
    category: "Network",
    state: "New"
  },
  {
    short_description: "Laptop request for new hire",
    priority: "3",
    caller_id: "abel.tuter",
    category: "Hardware",
    state: "In Progress"
  },
  {
    event: "record.updated",
    table: "incident",
    sys_id: "sys_id_placeholder_123",
    changes: ["state", "assigned_to"]
  }
];

export const STATUS_COLORS = {
  success: 'text-emerald-500 bg-emerald-50 border-emerald-200',
  error: 'text-rose-500 bg-rose-50 border-rose-200',
  warning: 'text-amber-500 bg-amber-50 border-amber-200',
  neutral: 'text-slate-500 bg-slate-50 border-slate-200',
};
