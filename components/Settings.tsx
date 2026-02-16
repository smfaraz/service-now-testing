import React, { useState } from 'react';
import { EnvironmentSettings } from '../types';
import { Button } from './ui/Button';
import { Save, Server, Shield, Globe, Network } from 'lucide-react';

interface SettingsProps {
  settings: EnvironmentSettings;
  onSave: (s: EnvironmentSettings) => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onSave }) => {
  const [formData, setFormData] = useState<EnvironmentSettings>(settings);

  const handleChange = (field: keyof EnvironmentSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
           <h2 className="text-xl font-bold text-slate-800">Environment Configuration</h2>
           <p className="text-slate-500 text-sm mt-1">Manage connection details for your ServiceNow instance.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Instance Section */}
          <div className="space-y-4">
             <h3 className="text-sm font-bold text-primary-600 uppercase tracking-wide flex items-center gap-2">
                <Server size={16} /> Instance Details
             </h3>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Instance URL</label>
                <div className="relative">
                   <Globe className="absolute left-3 top-2.5 text-slate-400" size={18} />
                   <input
                    type="url"
                    required
                    value={formData.instanceUrl}
                    onChange={(e) => handleChange('instanceUrl', e.target.value)}
                    className="pl-10 w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="https://dev00000.service-now.com"
                  />
                </div>
             </div>
             
             <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <input
                  type="checkbox"
                  id="mockMode"
                  checked={formData.useMockMode}
                  onChange={(e) => handleChange('useMockMode', e.target.checked)}
                  className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4"
                />
                <label htmlFor="mockMode" className="text-sm text-slate-700 font-medium cursor-pointer select-none">
                   Enable Mock Mode
                   <p className="text-xs text-slate-500 font-normal">Simulate responses without connecting to a real instance (Bypasses CORS)</p>
                </label>
             </div>
          </div>

          <hr className="border-slate-100" />

          {/* Network / Proxy Section */}
          <div className="space-y-4">
             <h3 className="text-sm font-bold text-primary-600 uppercase tracking-wide flex items-center gap-2">
                <Network size={16} /> Connection Settings
             </h3>
             
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="useProxy"
                    checked={formData.useProxy || false}
                    onChange={(e) => handleChange('useProxy', e.target.checked)}
                    className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4"
                  />
                  <label htmlFor="useProxy" className="text-sm text-slate-700 font-medium cursor-pointer select-none">
                     Use CORS Proxy
                     <p className="text-xs text-slate-500 font-normal">Route requests through a proxy to avoid CORS errors when connecting from browser</p>
                  </label>
                </div>

                {formData.useProxy && (
                  <div className="pl-7 animate-in fade-in slide-in-from-top-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Proxy URL (Prefix)</label>
                    <input
                      type="text"
                      value={formData.proxyUrl || ''}
                      onChange={(e) => handleChange('proxyUrl', e.target.value)}
                      placeholder="https://corsproxy.io/?"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 transition-all font-mono"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Note: Using public proxies sends your data through a third-party. Use with caution for sensitive data.
                    </p>
                  </div>
                )}
             </div>
          </div>

          <hr className="border-slate-100" />

          {/* Auth Section */}
          <div className="space-y-4">
             <h3 className="text-sm font-bold text-primary-600 uppercase tracking-wide flex items-center gap-2">
                <Shield size={16} /> Authentication
             </h3>
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={formData.password || ''}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 transition-all"
                    placeholder="••••••••"
                  />
                </div>
             </div>
          </div>

          <div className="pt-4">
            <Button type="submit" size="lg" className="w-full" icon={<Save size={18} />}>
              Save Configuration
            </Button>
            <p className="text-center text-xs text-slate-400 mt-3">
              Settings are saved locally in your browser.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};