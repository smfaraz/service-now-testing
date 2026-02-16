import React, { useEffect, useState } from 'react';
import { RequestHistoryItem } from '../types';
import { getHistory, clearHistory } from '../services/storageService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from './ui/Button';

export const HistoryPanel: React.FC = () => {
  const [history, setHistory] = useState<RequestHistoryItem[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleClear = () => {
    if(confirm('Clear all history?')) {
        clearHistory();
        setHistory([]);
    }
  };

  const chartData = history.slice().reverse().map((item, idx) => ({
    name: idx + 1,
    time: item.duration,
    status: item.status
  }));

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Analytics Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">Response Time Analysis</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line type="monotone" dataKey="time" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table Card */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-semibold text-slate-700">Request Log</h3>
          <Button variant="ghost" size="sm" onClick={handleClear} className="text-rose-500 hover:text-rose-600">
             <Trash2 size={16} className="mr-2" /> Clear Log
          </Button>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Method</th>
                <th className="px-6 py-3">Endpoint</th>
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.success ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.success ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-mono font-bold text-slate-600">{item.method}</td>
                  <td className="px-6 py-3 text-slate-600 font-mono truncate max-w-xs" title={item.url}>{item.url}</td>
                  <td className="px-6 py-3 text-slate-500">{item.duration}ms</td>
                  <td className="px-6 py-3 text-slate-400 text-xs">
                    {new Date(item.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      No requests yet. Go to Inbound Tester to start.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
