import React from 'react';
import { FileText, Download, Printer, Share2, X, Shield, BarChart2, Map, AlertTriangle } from 'lucide-react';
import { downloadReportFile } from './ReportList';

export default function ReportPreview({ report, onClose, role = 'analyst' }) {
  if (!report) {
    return (
      <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-600 h-full">
        <FileText className="w-16 h-16 mb-4 opacity-30" />
        <p className="text-base font-medium">No Report Selected</p>
        <p className="text-sm mt-1 opacity-70">Select a report from the list to preview</p>
      </div>
    );
  }

  // Resolve dynamic officer identity from current authenticated session
  const officerInfo = {
    analyst: { name: 'Inspector Patil', role: 'Intelligence Analyst' },
    officer: { name: 'Insp. R. Kumar', role: 'Field Officer' },
    admin: { name: 'Super Admin S. Kumar', role: 'System Administrator' },
  }[role] || { name: 'Officer in Charge', role: 'Departmental Admin' };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const secureUrl = `${window.location.origin}/reports/secure-view/${report.id}`;
    navigator.clipboard.writeText(secureUrl).then(() => {
      alert(`CONFIDENTIAL secure link copied to clipboard: ${secureUrl}`);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  const handleExportCSV = () => {
    downloadReportFile(report, 'csv', officerInfo);
  };

  const handleExportExcel = () => {
    downloadReportFile(report, 'excel', officerInfo);
  };

  const handleExportPDF = () => {
    downloadReportFile(report, 'pdf', officerInfo);
  };

  return (
    <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl flex flex-col h-full overflow-hidden">
      {/* Preview Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900 shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-white truncate max-w-xs">{report.title}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-md transition-colors cursor-pointer">
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
          <button onClick={handleShare} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-md transition-colors cursor-pointer">
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
          <button onClick={handleExportCSV} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-md transition-colors cursor-pointer">
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button onClick={handleExportExcel} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-md transition-colors cursor-pointer">
            <Download className="w-3.5 h-3.5" /> Excel
          </button>
          <button onClick={handleExportPDF} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-primary hover:bg-indigo-500 text-white rounded-md transition-colors font-medium cursor-pointer">
            <Download className="w-3.5 h-3.5" /> Export PDF
          </button>
          <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded-md transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Report Document */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Cover Page / Enhanced Report Header Metadata */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <div>
                <p className="text-white font-bold text-[10px] uppercase tracking-widest leading-none">Karnataka Police Department</p>
                <p className="text-slate-550 text-[7px] uppercase tracking-widest">Confidential Security Document</p>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-[8px] font-bold text-red-400 uppercase tracking-wider rounded">
              INTERNAL USE ONLY
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[10px] font-mono text-slate-400">
            <div><span className="block text-slate-500 font-bold uppercase text-[8px]">Report ID</span><span className="text-slate-200 font-bold">{report.id}</span></div>
            <div><span className="block text-slate-500 font-bold uppercase text-[8px]">District Jurisdiction</span><span className="text-slate-200 font-bold">{report.district}</span></div>
            <div><span className="block text-slate-500 font-bold uppercase text-[8px]">Date & Time Generated</span><span className="text-slate-200 font-bold">{report.generated} 09:30 AM</span></div>
            <div><span className="block text-slate-500 font-bold uppercase text-[8px]">Reporting Officer</span><span className="text-slate-200 font-bold">{officerInfo.name}</span></div>
            <div><span className="block text-slate-500 font-bold uppercase text-[8px]">Officer Role</span><span className="text-slate-200 font-bold">{officerInfo.role}</span></div>
            <div><span className="block text-slate-500 font-bold uppercase text-[8px]">Classification</span><span className="text-red-400 font-bold">CONFIDENTIAL</span></div>
          </div>

          <div className="border-t border-slate-800 pt-3 mt-1">
            <h1 className="text-sm font-bold text-white leading-tight uppercase tracking-wider">{report.title}</h1>
          </div>
        </div>

        {/* Section 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary" /> 1. Executive Summary
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            This report presents a comprehensive analysis of crime data for <strong className="text-white">{report.district}</strong> for the reporting period. 
            The analysis integrates AI-driven risk scoring, historical trend modeling, and geospatial hotspot detection to provide actionable intelligence.
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-slate-700">
              <p className="text-2xl font-bold text-white">1,248</p>
              <p className="text-xs text-slate-400 mt-1">Total Incidents</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-slate-700">
              <p className="text-2xl font-bold text-emerald-400">+12%</p>
              <p className="text-xs text-slate-400 mt-1">Clearance Rate</p>
            </div>
            <div className="bg-red-500/5 rounded-lg p-4 text-center border border-red-500/20">
              <p className="text-2xl font-bold text-red-400">84</p>
              <p className="text-xs text-slate-400 mt-1">AI Risk Score</p>
            </div>
          </div>
        </div>

        {/* Section 2 – Chart Placeholder */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Map className="w-5 h-5 text-primary" /> 2. Spatial Distribution
          </h3>
          <div className="h-48 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center text-slate-500">
            <Map className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-sm">Choropleth Map — Crime Density by Area</p>
          </div>
        </div>

        {/* Section 3 – Findings */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> 3. Key Findings & Recommendations
          </h3>
          <ul className="space-y-3">
            {[
              'Property crimes increased 18% in Tech Corridor; increased patrol presence recommended.',
              'Narcotics-related arrests show strong correlation with international-transit nodes.',
              'AI model predicts 12% increase in incidents in the upcoming festival period.',
            ].map((finding, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                {finding}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
