import React, { useState } from 'react';
import { Wifi, Plus, Trash2, Clock, Check, Copy, AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';
import { WebhookEvent } from '../types';
import { MOCK_WEBHOOK_PAYLOADS } from '../constants';

export const OutboundListener: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  const simulateWebhook = () => {
    if (!isListening) return;
    
    const randomPayload = MOCK_WEBHOOK_PAYLOADS[Math.floor(Math.random() * MOCK_WEBHOOK_PAYLOADS.length)];
    const newEvent: WebhookEvent = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ServiceNow/1.0',
        'X-ServiceNow-Source': 'Instance_123'
      },
      body: randomPayload,
      source: 'ServiceNow'
    };
    
    setEvents(prev => [newEvent, ...prev]);
    if (!selectedEventId) setSelectedEventId(newEvent.id);
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);

  return (
    <div className="flex h-full gap-6">
      {/* Sidebar List */}
      <div className="w-80 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-700">Webhook Listener</h3>
            <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant={isListening ? 'danger' : 'primary'} 
              size="sm" 
              className="flex-1"
              onClick={toggleListening}
              icon={<Wifi size={14} />}
            >
              {isListening ? 'Stop' : 'Start Listening'}
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={simulateWebhook}
              disabled={!isListening}
              title="Simulate an incoming webhook event"
            >
              Simulate
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {events.length === 0 ? (
            <div className="text-center py-10 px-4 text-slate-400 text-sm">
              <Wifi size={32} className="mx-auto mb-3 opacity-20" />
              <p>No events received.</p>
              <p className="mt-2 text-xs">Click "Start Listening" then "Simulate" to test.</p>
            </div>
          ) : (
            events.map(event => (
              <button
                key={event.id}
                onClick={() => setSelectedEventId(event.id)}
                className={`w-full text-left p-3 rounded-xl transition-all border ${
                  selectedEventId === event.id 
                    ? 'bg-primary-50 border-primary-200 shadow-sm' 
                    : 'bg-white border-transparent hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                    event.method === 'POST' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {event.method}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-sm font-medium text-slate-700 truncate">
                  {event.body.short_description || event.body.event || 'Unknown Event'}
                </div>
              </button>
            ))
          )}
        </div>
        
        {events.length > 0 && (
          <div className="p-3 border-t border-slate-100">
            <Button variant="ghost" size="sm" className="w-full text-rose-500" onClick={() => {setEvents([]); setSelectedEventId(null);}}>
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Detail View */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        {selectedEvent ? (
          <>
            <div className="p-6 border-b border-slate-100 bg-slate-50/30">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 mb-1">Incoming Webhook Payload</h2>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><Clock size={14}/> {new Date(selectedEvent.timestamp).toLocaleString()}</span>
                    <span className="flex items-center gap-1 text-primary-600 font-medium">From: {selectedEvent.source}</span>
                  </div>
                </div>
                <Button variant="secondary" size="sm" icon={<Copy size={14}/>} onClick={() => navigator.clipboard.writeText(JSON.stringify(selectedEvent.body))}>
                  Copy JSON
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Headers</h4>
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 text-sm font-mono text-slate-600">
                  {Object.entries(selectedEvent.headers).map(([k, v]) => (
                    <div key={k} className="flex gap-4 mb-1 last:mb-0">
                      <span className="text-slate-400 w-32 shrink-0">{k}:</span>
                      <span className="text-slate-700 break-all">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Payload Body</h4>
                <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto shadow-inner">
                  <pre className="text-sm font-mono text-emerald-300">
                    <code>{JSON.stringify(selectedEvent.body, null, 2)}</code>
                  </pre>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <div className="bg-slate-100 p-6 rounded-full mb-4">
              <Wifi size={40} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-600 mb-2">Waiting for events</h3>
            <p className="max-w-xs text-center text-sm">
              In a real scenario, this would generate a unique webhook URL. For this demo, use the "Simulate" button.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
