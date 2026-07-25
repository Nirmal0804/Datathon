import React, { useState } from 'react';
import { MapPin, Download, ChevronDown } from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function DistrictHeader() {
  const [selectedDistrict, setSelectedDistrict] = useState('Bengaluru City');

  const handleExportReport = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const doc = new jsPDF();
    doc.setFont('Courier');
    doc.setFontSize(14);
    
    doc.text('CONFIDENTIAL - INTERNAL USE ONLY', 10, 15);
    doc.text('===================================================', 10, 22);
    doc.text(`REPORT TYPE: DISTRICT INTELLIGENCE PROFILE`, 10, 29);
    
    doc.setFontSize(10);
    doc.text(`REPORT ID:             DIST-INT-${todayStr}`, 10, 38);
    doc.text(`GENERATION DATE & TIME: ${todayStr} 09:30 AM`, 10, 45);
    doc.text(`REPORTING JURISDICTION: ${selectedDistrict}`, 10, 52);
    doc.text(`CLASSIFICATION:        CONFIDENTIAL - INTERNAL USE ONLY`, 10, 59);
    doc.text('---------------------------------------------------', 10, 66);
    
    doc.setFontSize(12);
    doc.text('1. DISTRICT INTELLIGENCE BRIEF', 10, 75);
    doc.setFontSize(10);
    doc.text(`This profile contains active intelligence, spatial metrics, and risk assessment indicators for ${selectedDistrict}.`, 10, 82);
    
    doc.setFontSize(12);
    doc.text('2. OPERATIONAL STATISTICS', 10, 95);
    doc.setFontSize(10);
    doc.text('• Data not available from current API.', 10, 102);
    doc.text('• Data not available from current API.', 10, 109);
    doc.text('• Data not available from current API.', 10, 116);
    doc.text('• Data not available from current API.', 10, 123);
    
    doc.text('CONFIDENTIAL DISTRICT INTELLIGENCE PROFILE END', 10, 140);
    doc.save(`Crime_Report_${todayStr}.pdf`);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold text-white">District Intelligence</h1>
        </div>
        <p className="text-sm text-slate-400">In-depth analytics and AI risk profiling at the district level.</p>
      </div>
      
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="relative flex-1 sm:w-64">
          <select 
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full appearance-none bg-slate-800 border border-slate-700 rounded-md py-2 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-primary transition-colors cursor-pointer font-medium"
          >
            <option>Bengaluru City</option>
            <option>Mysuru</option>
            <option>Hubballi-Dharwad</option>
            <option>Mangaluru</option>
            <option>Belagavi</option>
          </select>
          <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        
        <button 
          onClick={handleExportReport}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-sm text-white transition-colors shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export Report</span>
        </button>
      </div>
    </div>
  );
}
