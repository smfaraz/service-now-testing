import React, { useState, useEffect } from 'react';
import { Layout, Radio, History, Settings as SettingsIcon, Zap } from 'lucide-react';
import { InboundTester } from './components/InboundTester';
import { OutboundListener } from './components/OutboundListener';
import { HistoryPanel } from './components/HistoryPanel';
import { Settings } from './components/Settings';
import { AppTab, EnvironmentSettings } from './types';
import { getSettings, saveSettings } from './services/storageService';

function App() {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.INBOUND);
  const [settings, setAppSettings] = useState<EnvironmentSettings | null>(null);

  useEffect(() => {
    setAppSettings(getSettings());
  }, []);

  const handleSaveSettings = (newSettings: EnvironmentSettings) => {
    saveSettings(newSettings);
    setAppSettings(newSettings);
    alert('Settings Saved Successfully');
  };

  if (!settings) return null; // Loading state

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.INBOUND:
        return <InboundTester settings={settings} />;
      case AppTab.OUTBOUND:
        return <OutboundListener />;
      case AppTab.HISTORY:
        return <HistoryPanel />;
      case AppTab.SETTINGS:
        return <Settings settings={settings} onSave={handleSaveSettings} />;
      default:
        return <InboundTester settings={settings} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 font-sans">
      {/* Sidebar Navigation */}
      <nav className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-200">
             <Zap size={24} fill="currentColor" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-slate-800">SnowTest</h1>
            <p className="text-xs text-slate-400 font-medium">ServiceNow Integrator</p>
          </div>
        </div>

        <div className="flex-1 px-3 space-y-1 py-4">
          <NavItem 
            active={activeTab === AppTab.INBOUND} 
            onClick={() => setActiveTab(AppTab.INBOUND)} 
            icon={<Layout size={20} />} 
            label="Inbound Tester" 
          />
          <NavItem 
            active={activeTab === AppTab.OUTBOUND} 
            onClick={() => setActiveTab(AppTab.OUTBOUND)} 
            icon={<Radio size={20} />} 
            label="Outbound Listener" 
          />
          <NavItem 
            active={activeTab === AppTab.HISTORY} 
            onClick={() => setActiveTab(AppTab.HISTORY)} 
            icon={<History size={20} />} 
            label="Request History" 
          />
        </div>

        <div className="p-3 mb-2">
          <NavItem 
            active={activeTab === AppTab.SETTINGS} 
            onClick={() => setActiveTab(AppTab.SETTINGS)} 
            icon={<SettingsIcon size={20} />} 
            label="Environment" 
          />
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center px-8 justify-between shrink-0">
           <h2 className="text-xl font-bold text-slate-700 capitalize">
             {activeTab.replace('_', ' ')}
           </h2>
           <div className="flex items-center gap-4">
             <div className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-500">
               {settings.instanceUrl ? new URL(settings.instanceUrl).hostname : 'No Instance Configured'}
             </div>
             {settings.useMockMode && (
                <div className="px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-xs font-bold text-amber-700">
                  MOCK MODE
                </div>
             )}
           </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-auto p-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto h-full">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

// Nav Item Helper
const NavItem = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
      active 
        ? 'bg-primary-50 text-primary-700 shadow-sm' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
    }`}
  >
    {icon}
    {label}
  </button>
);

export default App;
