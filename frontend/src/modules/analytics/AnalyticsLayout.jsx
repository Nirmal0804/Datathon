import React, { useState } from 'react';
import CrimeTrendAnalysis from './components/CrimeTrendAnalysis';
import AnomalyDetection from './components/AnomalyDetection';
import PredictiveRisk from './components/PredictiveRisk';
import HotspotAnalytics from './components/HotspotAnalytics';
import { LineChart, Activity, Target, Flame } from 'lucide-react';

export default function AnalyticsLayout() {
  const [activeTab, setActiveTab] = useState('trends');

  const tabs = [
    { id: 'trends', name: 'Crime Trends', icon: LineChart },
    { id: 'anomalies', name: 'Anomaly Detection', icon: Activity },
    { id: 'predictive', name: 'Predictive Risk', icon: Target },
    { id: 'hotspots', name: 'Hotspot Analytics', icon: Flame },
  ];

  return (
    <div className="max-w-7xl mx-auto flex flex-col h-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Advanced Analytics Suite</h1>
          <p className="text-sm text-slate-400">Deep-dive AI models and historical data processing.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-800 no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab.id 
                ? 'border-primary text-primary bg-primary/5' 
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 pb-8">
        {activeTab === 'trends' && <CrimeTrendAnalysis />}
        {activeTab === 'anomalies' && <AnomalyDetection />}
        {activeTab === 'predictive' && <PredictiveRisk />}
        {activeTab === 'hotspots' && <HotspotAnalytics />}
      </div>
    </div>
  );
}
