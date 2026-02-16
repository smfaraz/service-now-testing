import React, { useState } from 'react';
import { EnvironmentSettings } from '../types';
import { Button } from './ui/Button';
import { Save, Server, Shield, Globe } from 'lucide-react';

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
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
           <h2 className="text-xl font-bold text-slate-800">Environment Configuration</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
             <h3 className="text-sm font-bold text-primary-600 uppercase flex items-center gap-2">
                <Server size={16} /> Instance Details
             </h3>
             <input
                type="url"
                value={formData.instanceUrl}
                onChange={(e) => handleChange('instanceUrl', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm"
                placeholder="https://dev00000.service-now.com"
              />
             
             {/* New Proxy Toggle */}
             <div className="flex items-center gap-3 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                <input
                  type="checkbox"
                  id="useProxy"
                  checked={formData.useProxy}
                  onChange={(e) => handleChange('useProxy', e.target.checked)}
                  className="rounded text-primary-600 w-4 h-4"
                />
                <label htmlFor="useProxy" className="text-sm text-slate-700 font-medium cursor-pointer">
                   Use CORS Proxy
                   <p className="text-xs text-slate-500 font-normal">Routes requests through a proxy to bypass ServiceNow CORS blocks.</p>
                </label>
             </div>
          </div>

          <div className="pt-4">
            <Button type="submit" size="lg" className="w-full" icon={<Save size={18} />}>
              Save Configuration
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};