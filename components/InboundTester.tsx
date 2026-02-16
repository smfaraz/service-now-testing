import React, { useState, useEffect } from 'react';
import { Send, Plus, Trash2, Play, AlertCircle, Copy, Terminal, ExternalLink } from 'lucide-react';
import { Button } from './ui/Button';
import { EnvironmentSettings, HttpMethod, KeyValue, RequestHistoryItem } from '../types';
import { saveHistoryItem } from '../services/storageService';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';

interface InboundTesterProps {
  settings: EnvironmentSettings;
}

export const InboundTester: React.FC<InboundTesterProps> = ({ settings }) => {
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [endpoint, setEndpoint] = useState('/api/now/table/incident');
  const [headers, setHeaders] = useState<KeyValue[]>(settings.defaultHeaders);
  const [body, setBody] = useState('{\n  "short_description": "Test Incident from SnowTest",\n  "urgency": "2"\n}');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'params' | 'auth' | 'headers' | 'body'>('params');

  // Prism highlight effect for the response code block
  useEffect(() => {
    if (response && !response.error) {
      Prism.highlightAll();
    }
  }, [response]);

  const handleAddHeader = () => {
    setHeaders([...headers, { id: Date.now().toString(), key: '', value: '', active: true }]);
  };

  const handleRemoveHeader = (id: string) => {
    setHeaders(headers.filter(h => h.id !== id));
  };

  const handleHeaderChange = (id: string, field: 'key' | 'value', val: string) => {
    setHeaders(headers.map(h => h.id === id ? { ...h, [field]: val } : h));
  };

  const generateCurl = () => {
    const headerStr = headers
      .filter(h => h.active && h.key)
      .map(h => `-H "${h.key}: ${h.value}"`)
      .join(' ');
    
    const url = endpoint.startsWith('http') ? endpoint : `${settings.instanceUrl}${endpoint}`;
    const auth = settings.username ? `-u "${settings.username}:******"` : '';
    const data = (method !== 'GET' && method !== 'DELETE') ? `-d '${body.replace(/\n/g, '')}'` : '';
    
    return `curl -X ${method} "${url}" ${headerStr} ${auth} ${data}`;
  };

  const handleSend = async () => {
    setLoading(true);
    setResponse(null);
    const startTime = Date.now();

    const targetUrl = endpoint.startsWith('http') ? endpoint : `${settings.instanceUrl}${endpoint}`;
    
    try {
      const activeHeaders = headers.reduce((acc, h) => {
        if (h.active && h.key) acc[h.key] = h.value;
        return acc;
      }, {} as Record<string, string>);

      // Add Basic Auth Header
      if (settings.username && settings.password) {
        activeHeaders['Authorization'] = 'Basic ' + btoa(`${settings.username}:${settings.password}`);
      }

      let fetchResponse;
      
      if (settings.useMockMode) {
        // Mock Mode Simulation
        await new Promise(r => setTimeout(r, 800));
        fetchResponse = {
          status: 201,
          ok: true,
          json: async () => ({
            result: {
              sys_id: "mock_sys_id_" + Date.now(),
              number: "INC0010002",
              short_description: JSON.parse(body).short_description || "Mock Incident",
              state: "New",
              opened_at: new Date().toISOString()
            }
          })
        };
      } else {
        // Real-time Fetch with Proxy Support
        let fetchUrl = targetUrl;
        if (settings.useProxy && settings.proxyUrl) {
          // Properly encode targetUrl when appending to a proxy
          fetchUrl = settings.proxyUrl + encodeURIComponent(targetUrl);
        }

        fetchResponse = await fetch(fetchUrl, {
          method,
          headers: activeHeaders,
          body: (method !== 'GET' && method !== 'DELETE') ? body : undefined
        });
      }

      const responseData = await fetchResponse.json();
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Save to local storage history
      const historyItem: RequestHistoryItem = {
        id: Date.now().toString(),
        timestamp: startTime,
        method,
        url: targetUrl,
        status: fetchResponse.status || 200,
        duration,
        success: fetchResponse.ok || (fetchResponse.status >= 200 && fetchResponse.status < 300),
        requestBody: body,
        responseBody: JSON.stringify(responseData)
      };
      saveHistoryItem(historyItem);

      setResponse({
        status: fetchResponse.status || 200,
        statusText: fetchResponse.ok ? 'OK' : 'Error',
        data: responseData,
        time: duration,
        size: JSON.stringify(responseData).length
      });

    } catch (error: any) {
      setResponse({
        error: true,
        message: error.message,
        status: 0,
        statusText: 'Network Error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Request Composer */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <select 
            value={method}
            onChange={(e) => setMethod(e.target.value as HttpMethod)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary-500 block p-2.5 font-mono font-bold"
          >
            {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <div className="flex-1 relative">
             <input
              type="text"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="Enter endpoint (e.g. /api/now/table/incident)"
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary-500 block w-full p-2.5 font-mono"
            />
          </div>
          <Button onClick={handleSend} isLoading={loading} icon={<Send size={16} />}>
            Send
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          {[
            { id: 'params', label: 'Params' },
            { id: 'auth', label: 'Auth' },
            { id: 'headers', label: `Headers (${headers.length})` },
            { id: 'body', label: 'Body' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-white' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4 min-h-[200px]">
          {activeTab === 'headers' && (
            <div className="space-y-2">
              {headers.map((h) => (
                <div key={h.id} className="flex gap-2">
                  <input
                    type="checkbox"
                    checked={h.active}
                    onChange={(e) => setHeaders(headers.map(header => header.id === h.id ? {...header, active: e.target.checked} : header))}
                    className="mt-2.5 rounded border-slate-300 text-primary-600"
                  />
                  <input
                    placeholder="Key"
                    value={h.key}
                    onChange={(e) => handleHeaderChange(h.id, 'key', e.target.value)}
                    className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 font-mono"
                  />
                  <input
                    placeholder="Value"
                    value={h.value}
                    onChange={(e) => handleHeaderChange(h.id, 'value', e.target.value)}
                    className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 font-mono"
                  />
                  <button onClick={() => handleRemoveHeader(h.id)} className="p-2 text-slate-400 hover:text-rose-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <Button variant="secondary" size="sm" onClick={handleAddHeader} icon={<Plus size={14} />}>
                Add Header
              </Button>
            </div>
          )}

          {activeTab === 'auth' && (
            <div className="max-w-md space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg text-blue-700 text-sm flex gap-2">
                <AlertCircle size={16} />
                <p>Credentials managed in <strong>Environment</strong> settings.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500">Username</label>
                  <input disabled value={settings.username} className="w-full bg-slate-100 border rounded-lg px-3 py-2 text-sm text-slate-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Type</label>
                  <input disabled value="Basic Auth" className="w-full bg-slate-100 border rounded-lg px-3 py-2 text-sm text-slate-500" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'body' && (
            <div className="relative">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full h-48 font-mono text-sm p-4 border rounded-lg bg-slate-900 text-slate-50 resize-y"
              />
              <button 
                onClick={() => { try { setBody(JSON.stringify(JSON.parse(body), null, 2)); } catch (e) {} }}
                className="absolute top-2 right-2 text-xs bg-white/10 text-white px-2 py-1 rounded"
              >
                Prettify
              </button>
            </div>
          )}
          
          {activeTab === 'params' && (
            <div className="text-center py-8 text-slate-400">
               <p>Edit URL parameters directly in the endpoint field above.</p>
            </div>
          )}
        </div>
      </div>

      {/* Response Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 flex flex-col min-h-[300px]">
        <div className="p-3 border-b flex justify-between items-center bg-slate-50/50">
          <h3 className="font-semibold text-slate-700 flex items-center gap-2">
            <Terminal size={18} /> Response
          </h3>
          {response && (
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className={`px-2 py-1 rounded ${response.status >= 200 && response.status < 300 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {response.status} {response.statusText}
              </span>
              <span className="text-slate-500">{response.time}ms</span>
            </div>
          )}
        </div>
        
        <div className="relative flex-1 bg-slate-900 overflow-auto group">
           {response ? (
             <>
                <button 
                  onClick={() => navigator.clipboard.writeText(JSON.stringify(response.data, null, 2))}
                  className="absolute top-4 right-4 p-2 bg-white/10 text-slate-300 rounded hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Copy size={16} />
                </button>
               {response.error ? (
                 <div className="p-6">
                   <div className="text-rose-400 font-mono mb-4">Error: {response.message}</div>
                   {!settings.useProxy && (
                     <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-slate-300 text-sm">
                       <div className="flex items-center gap-2 font-bold text-amber-400 mb-2">
                         <AlertCircle size={16} /> CORS Error Detected
                       </div>
                       <p className="mb-3">Browser security blocked this request. ServiceNow does not allow direct cross-origin requests from browsers.</p>
                       <button onClick={() => alert("Enable 'Use CORS Proxy' in Environment settings")} className="text-primary-400 underline">
                         How to fix?
                       </button>
                     </div>
                   )}
                 </div>
               ) : (
                 <pre className="language-json p-4 text-sm"><code className="language-json">{JSON.stringify(response.data, null, 2)}</code></pre>
               )}
             </>
           ) : (
             <div className="flex flex-col items-center justify-center h-full text-slate-600">
               <Play size={32} className="mb-2 opacity-20" />
               <p>Send a request to see the response</p>
             </div>
           )}
        </div>
        
        <div className="p-3 bg-slate-50 border-t text-xs font-mono text-slate-500 flex justify-between items-center">
          <div className="truncate opacity-75">{generateCurl()}</div>
          <button onClick={() => navigator.clipboard.writeText(generateCurl())} className="text-primary-600 font-medium">
            Copy cURL
          </button>
        </div>
      </div>
    </div>
  );
};