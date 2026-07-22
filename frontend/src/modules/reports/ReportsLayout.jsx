import React, { useState } from 'react';
import ReportFilters from './components/ReportFilters';
import ReportList from './components/ReportList';
import ReportPreview from './components/ReportPreview';
import ReportHistory from './components/ReportHistory';
import { Plus, History } from 'lucide-react';

export default function ReportsLayout() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="max-w-7xl mx-auto space-y-6 h-full flex flex-col">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports Center</h1>
          <p className="text-sm text-slate-400 mt-1">Generate, preview, and export intelligence reports.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium transition-colors ${showHistory ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}
          >
            <History className="w-4 h-4" /> Activity Log
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-indigo-500 text-white rounded-md text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Generate New Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <ReportFilters searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Main Content */}
      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left: Report List */}
        <div className={`flex flex-col gap-4 overflow-y-auto ${selectedReport ? 'w-full lg:w-96 shrink-0' : 'w-full'}`}>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Showing recent reports</p>
          </div>
          <ReportList
            searchQuery={searchQuery}
            onSelect={setSelectedReport}
            selectedId={selectedReport?.id}
          />
        </div>

        {/* Right: Preview Panel */}
        {selectedReport && (
          <div className="hidden lg:flex flex-1 min-h-[600px]">
            <ReportPreview
              report={selectedReport}
              onClose={() => setSelectedReport(null)}
            />
          </div>
        )}
      </div>

      {/* Activity History */}
      {showHistory && <ReportHistory />}
    </div>
  );
}
