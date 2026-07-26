import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_OFFENDERS_DOSSIERS } from '../../../mock/offenderData';
import { 
  ArrowLeft, ShieldAlert, FileText, Search, 
  MapPin, User, Compass, Calendar, ChevronRight, Activity, 
  Download, Printer, Map, Link, AlertTriangle
} from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function RepeatOffenderProfile({ offenderName, onBack, onSelectOffender, onNavigate }) {
  // Load dossier from mock registry
  const offender = useMemo(() => {
    return MOCK_OFFENDERS_DOSSIERS[offenderName] || null;
  }, [offenderName]);

  const [arrestSearch, setArrestSearch] = useState('');
  const [caseSearch, setCaseSearch] = useState('');

  if (!offender) {
    return (
      <div className="bg-white border border-[#E7ECF3] rounded-[22px] p-10 text-center text-[#64748B] shadow-sm">
        <h3 className="text-base font-bold text-[#0B1F4D] mb-4">Offender Dossier Not Found</h3>
        <button onClick={onBack} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F8F9FB] border border-[#E7ECF3] rounded-xl text-sm font-bold text-[#0B1F4D] hover:bg-[#F1F5F9] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to District Intelligence
        </button>
      </div>
    );
  }

  // Filtered Arrest History
  const filteredArrests = useMemo(() => {
    let list = offender.arrestHistory || [];
    if (arrestSearch.trim()) {
      const q = arrestSearch.toLowerCase();
      list = list.filter(a => 
        a.charges.toLowerCase().includes(q) ||
        a.officer.toLowerCase().includes(q) ||
        a.station.toLowerCase().includes(q)
      );
    }
    return list;
  }, [offender, arrestSearch]);

  // Filtered Case History
  const filteredCases = useMemo(() => {
    let list = offender.caseHistory || [];
    if (caseSearch.trim()) {
      const q = caseSearch.toLowerCase();
      list = list.filter(c => 
        c.id.toLowerCase().includes(q) ||
        c.fir.toLowerCase().includes(q) ||
        c.officer.toLowerCase().includes(q)
      );
    }
    return list;
  }, [offender, caseSearch]);

  const handleExport = () => {
    const doc = new jsPDF();
    doc.setFont('Courier');
    doc.setFontSize(14);
    doc.text('CONFIDENTIAL - CRIMINAL INTELLIGENCE DOSSIER', 10, 15);
    doc.text('===================================================', 10, 22);
    doc.setFontSize(10);
    doc.text(`SUBJECT: ${offender.name} (${offender.aliases || 'N/A'})`, 10, 32);
    doc.text(`STATUS: ${offender.status}`, 10, 39);
    doc.text(`RISK SCORE: ${offender.riskScore}/100`, 10, 46);
    doc.text(`LAST KNOWN DISTRICT: ${offender.lastKnownDistrict}`, 10, 53);
    doc.text('---------------------------------------------------', 10, 60);
    doc.save(`Dossier_${offender.name.replace(/\s+/g, '_')}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleViewMap = () => {
    const districtCoords = {
      'Bengaluru': [12.9716, 77.5946],
      'Mysuru': [12.2958, 76.6394],
      'Hubballi': [15.3647, 75.1240]
    };
    const coords = districtCoords[offender.lastKnownDistrict] || [15.3173, 75.7139];
    localStorage.setItem('selectedMapPosition', JSON.stringify({ center: coords, zoom: 12 }));
    if (onNavigate) {
      onNavigate('map');
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Wanted') return 'bg-rose-50 text-rose-700 border-rose-200';
    if (status === 'In Custody') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  };

  const getStatusBgColor = (status) => {
    if (status === 'Wanted') return 'bg-rose-500';
    if (status === 'In Custody') return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  // Generate SVG Donut for Categories
  let cumulativePercent = 0;
  const donutSegments = offender.crimeCategories.map((c, i) => {
    const startAngle = (cumulativePercent / 100) * 360;
    cumulativePercent += c.percentage;
    const endAngle = (cumulativePercent / 100) * 360;
    
    // Convert angles to radians
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    
    const r = 40;
    const cx = 50, cy = 50;
    
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    
    const largeArcFlag = c.percentage > 50 ? 1 : 0;
    const pathData = [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    const colors = ['#0B1F4D', '#1A4BB8', '#C79A2B', '#E11D48', '#059669', '#8B5CF6'];
    
    return { pathData, color: colors[i % colors.length], name: c.name, percent: c.percentage };
  });

  return (
    <div className="space-y-6 animate-fade-in w-full pb-10">
      
      {/* ── HERO SECTION ── */}
      <div className="bg-white border border-[#E7ECF3] rounded-[22px] p-5 sm:p-6 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
          <div className="w-12 h-12 bg-[#0B1F4D] rounded-[14px] flex items-center justify-center shrink-0 shadow-sm">
            <User className="w-6 h-6 text-[#C79A2B]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0B1F4D] tracking-tight">Criminal Intelligence Dossier</h1>
            <p className="text-xs font-semibold text-[#64748B] mt-1 max-w-lg">Comprehensive offender intelligence profile including criminal history, movement analysis, AI threat assessment, and surveillance records.</p>
          </div>
        </div>

        <div className="flex flex-col items-start lg:items-end gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Status</span>
            <div className={`px-3 py-1 rounded-full flex items-center gap-2 border font-bold text-xs uppercase tracking-widest ${getStatusColor(offender.status)}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${getStatusBgColor(offender.status)}`} />
              {offender.status}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-2">
            <div className="text-left sm:text-right">
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Case Ref</p>
              <p className="text-xs font-bold text-[#0B1F4D]">#DOS-{Math.floor(Math.random() * 90000) + 10000}</p>
            </div>
            <button onClick={onBack} className="flex items-center justify-center gap-2 px-4 py-2 bg-[#F8F9FB] border border-[#E7ECF3] rounded-[12px] hover:bg-[#F1F5F9] transition-colors text-[11px] font-bold text-[#0B1F4D] uppercase tracking-widest cursor-pointer shadow-sm group shrink-0">
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 rounded-[12px] transition-colors shadow-sm group cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest">Export Dossier</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 12-COLUMN GRID MAIN CONTENT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ROW 1: Identity & AI Risk */}
        
        {/* Criminal Profile Summary (Span 8) */}
        <div className="lg:col-span-8 bg-white border border-[#E7ECF3] rounded-[22px] p-6 shadow-sm flex flex-col justify-between h-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-[#F1F5F9]">
            <div className="w-20 h-20 rounded-full bg-[#F8F9FB] border border-[#E7ECF3] flex items-center justify-center text-3xl font-black text-[#0B1F4D] shadow-inner shrink-0">
              {offender.initials}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-black text-[#0B1F4D] leading-tight">{offender.name}</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs font-semibold text-[#64748B]">
                <p><span className="text-[#0B1F4D] font-bold">Aliases:</span> {offender.aliases || 'None'}</p>
                <p><span className="text-[#0B1F4D] font-bold">Age:</span> {offender.age}</p>
                <p><span className="text-[#0B1F4D] font-bold">Gender:</span> {offender.gender}</p>
                <p className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#C79A2B]"/> <span className="text-[#0B1F4D] font-bold">Last Known:</span> {offender.lastKnownDistrict}</p>
              </div>
            </div>
            <div className="hidden sm:block text-right">
              <span className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Last Updated</span>
              <span className="text-xs font-bold text-[#0B1F4D]">Today, 09:41 AM</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-[#F8F9FB] border border-[#E7ECF3] rounded-xl p-4 flex flex-col justify-center items-center text-center">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Risk Rating</span>
              <span className="text-2xl font-black text-rose-600 font-mono">{offender.riskScore}</span>
            </div>
            <div className="bg-[#F8F9FB] border border-[#E7ECF3] rounded-xl p-4 flex flex-col justify-center items-center text-center">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Total Charges</span>
              <span className="text-2xl font-black text-[#0B1F4D] font-mono">{offender.totalCases}</span>
            </div>
            <div className="bg-[#F8F9FB] border border-[#E7ECF3] rounded-xl p-4 flex flex-col justify-center items-center text-center">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Prior Arrests</span>
              <span className="text-2xl font-black text-[#0B1F4D] font-mono">{offender.totalArrests}</span>
            </div>
            <div className="bg-[#F8F9FB] border border-[#E7ECF3] rounded-xl p-4 flex flex-col justify-center items-center text-center">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Active Warrants</span>
              <span className="text-2xl font-black text-amber-600 font-mono">{offender.activeWarrants}</span>
            </div>
          </div>
        </div>

        {/* AI Risk Assessment (Span 4) */}
        <div className="lg:col-span-4 bg-white border border-[#E7ECF3] rounded-[22px] p-6 shadow-sm flex flex-col justify-between h-full">
          <div className="flex items-center gap-3 border-b border-[#F1F5F9] pb-4 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#0B1F4D] uppercase tracking-wider">AI Threat Assessment</h3>
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mt-0.5">Recidivism Risk Analysis</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 mb-4">
            {/* Simple Circular Progress using SVG */}
            <div className="relative w-24 h-24 shrink-0">
              <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#F1F5F9" strokeWidth="12" />
                <circle 
                  cx="50" cy="50" r="40" 
                  fill="none" 
                  stroke={offender.aiRiskAssessment.confidence > 75 ? "#E11D48" : "#F59E0B"} 
                  strokeWidth="12" 
                  strokeDasharray={`${(offender.aiRiskAssessment.confidence / 100) * 251.2} 251.2`} 
                  strokeLinecap="round" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-[#0B1F4D] font-mono leading-none">{offender.aiRiskAssessment.confidence}%</span>
                <span className="text-[8px] font-bold text-[#64748B] uppercase mt-1">Confidence</span>
              </div>
            </div>
            
            <div className="flex-1">
               <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border mb-2 ${
                  offender.aiRiskAssessment.riskLevel === 'High' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
               }`}>
                 {offender.aiRiskAssessment.riskLevel} Threat
               </span>
               <p className="text-[11px] font-semibold text-[#64748B] leading-snug line-clamp-3">
                 {offender.aiRiskAssessment.reasoning[0] || 'System suggests high risk of transition toward neighboring districts.'}
               </p>
            </div>
          </div>
          
          <div className="bg-[#F8F9FB] border border-[#E7ECF3] rounded-xl p-3">
             <div className="flex items-start gap-2">
               <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
               <p className="text-[11px] font-semibold text-[#0B1F4D] leading-snug">
                 {offender.aiRiskAssessment.reasoning[1] || 'Monitor closely near border checkpoints.'}
               </p>
             </div>
          </div>
        </div>

        {/* ROW 2: Offense Timeline & Category Breakdown */}

        {/* Offense Timeline (Span 7) */}
        <div className="lg:col-span-7 bg-white border border-[#E7ECF3] rounded-[22px] p-6 shadow-sm flex flex-col h-[400px]">
          <h3 className="text-sm font-black text-[#0B1F4D] uppercase tracking-wider pb-4 mb-4 border-b border-[#F1F5F9]">
            Offense Timeline
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#E7ECF3] before:to-transparent">
              {offender.offenseTimeline.map((item, i) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border-4 border-white bg-[#C79A2B] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ml-0 md:ml-0 z-10" />
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-xl border border-[#E7ECF3] bg-[#F8F9FB] shadow-sm ml-4 md:ml-0 transition-all hover:border-[#1A2F63]/30 hover:shadow-md">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-[#64748B] font-mono">{item.date}</span>
                      <span className="text-[10px] font-bold text-[#0B1F4D] bg-white border border-[#E7ECF3] px-2 py-0.5 rounded-md">{item.fir}</span>
                    </div>
                    <h4 className="font-bold text-[#0F172A] text-sm mb-1">{item.type}</h4>
                    <p className="text-[11px] font-semibold text-[#64748B]">{item.station} • <span className="text-indigo-600">{item.status}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Crime Category Breakdown (Span 5) */}
        <div className="lg:col-span-5 bg-white border border-[#E7ECF3] rounded-[22px] p-6 shadow-sm flex flex-col h-[400px]">
          <h3 className="text-sm font-black text-[#0B1F4D] uppercase tracking-wider pb-4 mb-4 border-b border-[#F1F5F9]">
            Crime Category Breakdown
          </h3>
          <div className="flex-1 flex flex-col justify-center items-center gap-6">
            <div className="w-48 h-48 relative">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 drop-shadow-md">
                <circle cx="50" cy="50" r="40" fill="white" />
                {donutSegments.map((seg, i) => (
                  <path key={i} d={seg.pathData} fill={seg.color} className="transition-all duration-300 hover:opacity-80 cursor-pointer" />
                ))}
                <circle cx="50" cy="50" r="28" fill="white" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-[#0B1F4D] font-mono">{offender.totalCases}</span>
                <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-widest mt-1">Cases</span>
              </div>
            </div>
            
            <div className="w-full grid grid-cols-2 gap-3 mt-2">
              {donutSegments.map((seg, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-md shrink-0 shadow-sm" style={{ backgroundColor: seg.color }} />
                  <div className="flex-1 flex justify-between items-center text-[11px]">
                    <span className="font-bold text-[#0B1F4D] truncate mr-2">{seg.name}</span>
                    <span className="font-semibold text-[#64748B] font-mono">{seg.percent.toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ROW 3: District Movement & Associates */}

        {/* District Movement Path (Span 7) */}
        <div className="lg:col-span-7 bg-white border border-[#E7ECF3] rounded-[22px] p-6 shadow-sm flex flex-col">
          <h3 className="text-sm font-black text-[#0B1F4D] uppercase tracking-wider pb-4 mb-2 border-b border-[#F1F5F9]">
            District Movement Path
          </h3>
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex flex-col sm:flex-row items-center justify-around gap-4 overflow-x-auto no-scrollbar">
              {offender.districtMovement.map((mv, i) => {
                const isHighest = mv.district === offender.highestActivityDistrict;
                return (
                  <div key={i} className="flex flex-col sm:flex-row items-center gap-4 shrink-0 mt-3">
                    <div className={`px-4 py-3 rounded-[16px] border text-center min-w-[130px] relative transition-all ${
                      isHighest 
                        ? 'bg-rose-50 border-rose-200 shadow-sm' 
                        : 'bg-[#F8F9FB] border-[#E7ECF3] hover:border-[#1A2F63]/30'
                    }`}>
                      <p className={`font-bold text-xs ${isHighest ? 'text-rose-700' : 'text-[#0B1F4D]'}`}>{mv.district}</p>
                      <p className="text-[9px] font-semibold text-[#64748B] font-mono mt-1">{mv.date}</p>
                      <p className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-wider mt-1">{mv.activity}</p>
                      
                      {isHighest && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rose-500 text-white font-mono text-[8px] font-bold px-2 py-0.5 rounded-md uppercase whitespace-nowrap shadow-sm">
                          Peak Activity
                        </span>
                      )}
                    </div>
                    {i < offender.districtMovement.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-[#94A3B8] rotate-90 sm:rotate-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Known Associates Network (Span 5) */}
        <div className="lg:col-span-5 bg-white border border-[#E7ECF3] rounded-[22px] p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F1F5F9]">
            <h3 className="text-sm font-black text-[#0B1F4D] uppercase tracking-wider">
              Known Associates Network
            </h3>
            <span className="px-2 py-1 bg-[#F8F9FB] border border-[#E7ECF3] rounded-md text-[10px] font-bold text-[#64748B]">{offender.knownAssociates.length} Nodes</span>
          </div>

          <div className="flex-1 flex justify-center items-center py-2 bg-[#F8F9FB] border border-[#E7ECF3] rounded-xl relative overflow-hidden shadow-inner">
            <svg viewBox="0 0 300 140" className="w-full h-full max-w-[280px] drop-shadow-sm">
              {/* Connection lines */}
              {offender.knownAssociates.map((ass, i) => {
                const angle = (i * Math.PI) / 1.5;
                const targetX = 150 + Math.cos(angle) * 65;
                const targetY = 70 + Math.sin(angle) * 45;
                return (
                  <g key={i}>
                    <line 
                      x1="150" y1="70" x2={targetX} y2={targetY} 
                      stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 3"
                    />
                    <text 
                      x={(150 + targetX) / 2} y={(70 + targetY) / 2 - 5} 
                      fill="#64748B" fontSize="6" fontWeight="bold" textAnchor="middle"
                      className="font-mono select-none"
                    >
                      {ass.relationship}
                    </text>
                  </g>
                );
              })}

              {/* Center Node */}
              <circle cx="150" cy="70" r="16" fill="#0B1F4D" stroke="#C79A2B" strokeWidth="2" className="drop-shadow-md" />
              <text x="150" y="73" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle" className="select-none font-mono">
                {offender.initials}
              </text>

              {/* Outer Nodes */}
              {offender.knownAssociates.map((ass, i) => {
                const targetDossier = MOCK_OFFENDERS_DOSSIERS[ass.name];
                const angle = (i * Math.PI) / 1.5;
                const targetX = 150 + Math.cos(angle) * 65;
                const targetY = 70 + Math.sin(angle) * 45;
                return (
                  <g key={i} onClick={() => onSelectOffender(ass.name)} className="cursor-pointer group">
                    <circle cx={targetX} cy={targetY} r="12" fill="white" stroke={ass.riskLevel === 'Critical' ? '#E11D48' : '#F59E0B'} strokeWidth="1.5" className="drop-shadow-sm group-hover:fill-[#F8F9FB] transition-colors" />
                    <text x={targetX} y={targetY + 2} fill="#0B1F4D" fontSize="7" fontWeight="black" textAnchor="middle" className="select-none font-mono">
                      {targetDossier?.initials || 'A'}
                    </text>
                    <rect x={targetX - 25} y={targetY - 20} width="50" height="12" rx="2" fill="#0B1F4D" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    <text x={targetX} y={targetY - 12} fill="white" fontSize="5" textAnchor="middle" className="opacity-0 group-hover:opacity-100 font-bold transition-opacity">
                      {ass.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* ROW 4 & 6 Combinations: Arrest Record & Quick Actions */}
        <div className="lg:col-span-8 bg-white border border-[#E7ECF3] rounded-[22px] p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 mb-4 border-b border-[#F1F5F9]">
            <h3 className="text-sm font-black text-[#0B1F4D] uppercase tracking-wider">Arrest Record</h3>
            <div className="relative w-full sm:w-56">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Search charges..."
                value={arrestSearch}
                onChange={(e) => setArrestSearch(e.target.value)}
                className="w-full bg-[#F8F9FB] border border-[#E7ECF3] hover:border-[#1A2F63]/30 rounded-xl py-2 pl-9 pr-4 text-xs font-bold text-[#0B1F4D] focus:outline-none transition-colors"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredArrests.map((arr, i) => (
              <div key={i} className="p-4 bg-[#F8F9FB] border border-[#E7ECF3] rounded-[16px] hover:border-[#1A2F63]/20 transition-all hover:shadow-md">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[11px] font-bold text-[#0B1F4D] font-mono">{arr.date}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${arr.bailStatus.includes('Denied') ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-100 text-[#64748B] border-slate-200'}`}>
                    {arr.bailStatus}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#0F172A] mb-1 line-clamp-1">{arr.charges}</h4>
                <div className="text-[11px] font-semibold text-[#64748B] space-y-1 mt-2">
                  <p className="flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5 text-[#94A3B8]"/> {arr.station}</p>
                  <p className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-[#94A3B8]"/> {arr.officer}</p>
                </div>
                <div className="mt-3 pt-3 border-t border-[#E7ECF3]">
                   <span className="text-[10px] font-bold text-[#0B1F4D] uppercase tracking-wider">Outcome: </span>
                   <span className="text-[11px] font-semibold text-[#64748B]">{arr.outcome}</span>
                </div>
              </div>
            ))}
            {filteredArrests.length === 0 && (
              <div className="col-span-full py-8 text-center text-[#64748B] text-xs font-semibold">
                No arrest records found.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions (Span 4) moved next to Arrest Records */}
        <div className="lg:col-span-4 bg-white border border-[#E7ECF3] rounded-[22px] p-6 shadow-sm flex flex-col justify-between">
           <h3 className="text-sm font-black text-[#0B1F4D] uppercase tracking-wider pb-4 mb-4 border-b border-[#F1F5F9]">
             Quick Actions
           </h3>
           <div className="grid grid-cols-2 gap-3 flex-1">
             <button onClick={handleViewMap} className="flex flex-col items-center justify-center gap-2 p-4 bg-[#F8F9FB] border border-[#E7ECF3] hover:border-[#1A2F63]/30 rounded-xl transition-all group cursor-pointer">
               <Map className="w-5 h-5 text-[#C79A2B] group-hover:scale-110 transition-transform" />
               <span className="text-[10px] font-bold text-[#0B1F4D] uppercase tracking-wider">View Map</span>
             </button>
             <button onClick={() => onNavigate && onNavigate('case')} className="flex flex-col items-center justify-center gap-2 p-4 bg-[#F8F9FB] border border-[#E7ECF3] hover:border-[#1A2F63]/30 rounded-xl transition-all group cursor-pointer">
               <Link className="w-5 h-5 text-[#C79A2B] group-hover:scale-110 transition-transform" />
               <span className="text-[10px] font-bold text-[#0B1F4D] uppercase tracking-wider text-center">Linked Cases</span>
             </button>
             <button onClick={handleExport} className="flex flex-col items-center justify-center gap-2 p-4 bg-[#F8F9FB] border border-[#E7ECF3] hover:border-[#1A2F63]/30 rounded-xl transition-all group cursor-pointer">
               <Download className="w-5 h-5 text-[#C79A2B] group-hover:scale-110 transition-transform" />
               <span className="text-[10px] font-bold text-[#0B1F4D] uppercase tracking-wider">Export PDF</span>
             </button>
             <button onClick={handlePrint} className="flex flex-col items-center justify-center gap-2 p-4 bg-[#F8F9FB] border border-[#E7ECF3] hover:border-[#1A2F63]/30 rounded-xl transition-all group cursor-pointer">
               <Printer className="w-5 h-5 text-[#C79A2B] group-hover:scale-110 transition-transform" />
               <span className="text-[10px] font-bold text-[#0B1F4D] uppercase tracking-wider">Print</span>
             </button>
           </div>
        </div>

        {/* ROW 5: Case Ledger Table (Span 12) */}
        <div className="lg:col-span-12 bg-white border border-[#E7ECF3] rounded-[22px] p-6 shadow-sm overflow-hidden flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 mb-4 border-b border-[#F1F5F9]">
            <h3 className="text-sm font-black text-[#0B1F4D] uppercase tracking-wider">Case Ledger</h3>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Search cases..."
                value={caseSearch}
                onChange={(e) => setCaseSearch(e.target.value)}
                className="w-full bg-[#F8F9FB] border border-[#E7ECF3] hover:border-[#1A2F63]/30 rounded-xl py-2 pl-9 pr-4 text-xs font-bold text-[#0B1F4D] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-[16px] border border-[#E7ECF3]">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#F8F9FB] border-b border-[#E7ECF3]">
                  <th className="py-3 px-4 text-[10px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">Case ID</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">FIR</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">Category</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">Date</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">Station</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">Court</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7ECF3] bg-white">
                {filteredCases.map((c, i) => (
                  <tr key={i} className="hover:bg-[#F8F9FB] transition-colors group">
                    <td className="py-3 px-4 text-[11px] font-bold text-[#0B1F4D] font-mono whitespace-nowrap">{c.id}</td>
                    <td className="py-3 px-4 text-[11px] font-bold text-[#64748B] font-mono whitespace-nowrap">{c.fir}</td>
                    <td className="py-3 px-4 text-[11px] font-bold text-[#0F172A] whitespace-nowrap">{c.category}</td>
                    <td className="py-3 px-4 text-[11px] font-semibold text-[#64748B] font-mono whitespace-nowrap">{c.date}</td>
                    <td className="py-3 px-4 text-[11px] font-semibold text-[#64748B] whitespace-nowrap truncate max-w-[150px]">{c.station}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        c.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                        c.status === 'Active' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-[#F1F5F9] text-[#64748B] border-[#E7ECF3]'
                      }`}>
                        {c.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] font-semibold text-[#64748B] whitespace-nowrap">{c.courtStatus}</td>
                  </tr>
                ))}
                {filteredCases.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-[#64748B] text-xs font-semibold">
                      No cases found matching search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
