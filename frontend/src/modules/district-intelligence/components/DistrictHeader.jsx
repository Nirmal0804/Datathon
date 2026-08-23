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
    doc.text('2. OPERATIONAL STATISTICS (MOCK DATA)', 10, 95);
    doc.setFontSize(10);
    doc.text('• Active Investigations: 42 cases', 10, 102);
    doc.text('• Monthly Trend Shift:  +14.5%', 10, 109);
    doc.text('• Assigned Police officers: 250 active personnel', 10, 116);
    doc.text('• Threat Risk Level:    HIGH RISK INDEX', 10, 123);
    
    doc.text('CONFIDENTIAL DISTRICT INTELLIGENCE PROFILE END', 10, 140);
    doc.save(`Crime_Report_${todayStr}.pdf`);
  };

  return (
    <div className="bg-white border border-[#E7ECF3] rounded-[22px] p-5 sm:p-6 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
        <div className="w-12 h-12 bg-[#0B1F4D] rounded-[14px] flex items-center justify-center shrink-0 shadow-sm">
          <MapPin className="w-6 h-6 text-[#C79A2B]" />
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl sm:text-2xl font-black text-[#0B1F4D] tracking-tight">District Intelligence</h1>
            <div className="px-3 py-1 rounded-full bg-[#F1F5F9] border border-[#E7ECF3] flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-[#0B1F4D] uppercase tracking-widest whitespace-nowrap">AI Active</span>
            </div>
          </div>
          <p className="text-xs font-semibold text-[#64748B]">Command center for district-level crime intelligence.</p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
        <div className="relative w-full sm:w-48">
          <select 
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full appearance-none bg-[#F8F9FB] border border-[#E7ECF3] hover:border-[#1A2F63]/30 rounded-[12px] py-2 pl-4 pr-10 text-xs font-bold text-[#0B1F4D] focus:outline-none transition-all cursor-pointer shadow-sm"
          >
            <option>Bengaluru City</option>
            <option>Mysuru</option>
            <option>Hubballi-Dharwad</option>
            <option>Mangaluru</option>
            <option>Belagavi</option>
          </select>
          <ChevronDown className="absolute right-3 top-2 w-4 h-4 text-[#64748B] pointer-events-none" />
        </div>
        
        <button 
          onClick={handleExportReport}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 rounded-[12px] transition-colors shrink-0 cursor-pointer shadow-sm group"
        >
          <Download className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest">Export Report</span>
        </button>
      </div>
    </div>
  );
}
