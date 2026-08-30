import React, { useState, useMemo } from 'react';
import { Database, Download, AlertTriangle, ShieldAlert, TrendingUp, RotateCcw, Sliders, MapPin, Tag, Calendar, Activity, Info } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { SOCIO_ECONOMIC_DATA } from '../../mock/socioEconomicData';
import { CRIME_CORRELATION_MATRIX, CORRELATION_INDICATORS, CORRELATION_CATEGORIES } from '../../mock/crimeCorrelationData';
import { useTranslation } from '../../i18n';

export default function SocioEconomicCorrelation({ role }) {
  const { t } = useTranslation();
  // Role Access Guard: Expose only to Intelligence Analyst
  if (role !== 'analyst') {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white border border-[#E7ECF3] rounded-[24px] text-center shadow-sm">
        <div className="w-12 h-12 rounded-[16px] bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-base font-black text-[#0F172A] tracking-tight">{t('common.unauthorized', 'Access Restricted')}</h3>
        <p className="text-xs font-semibold text-[#64748B] mt-1">
          {t('common.unauthorizedDesc', 'This strategic socio-economic correlation analysis module is restricted to authorized Intelligence Analysts only.')}
        </p>
      </div>
    );
  }

  // State Management
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedIndicator, setSelectedIndicator] = useState('urbanization');
  const [correlationThreshold, setCorrelationThreshold] = useState(0.2);
  const [hoveredDistrict, setHoveredDistrict] = useState(null);

  // Reset filters handler
  const handleResetFilters = () => {
    setSelectedDistrict('All');
    setSelectedCategory('All');
    setSelectedYear('2026');
    setSelectedIndicator('urbanization');
    setCorrelationThreshold(0.2);
  };

  // Indicators mapping labels
  const indicatorConfig = useMemo(() => {
    return CORRELATION_INDICATORS.reduce((acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    }, {});
  }, []);

  // Filter district data
  const filteredDistrictData = useMemo(() => {
    if (selectedDistrict === 'All') return SOCIO_ECONOMIC_DATA;
    return SOCIO_ECONOMIC_DATA.filter(d => d.district === selectedDistrict);
  }, [selectedDistrict]);

  // Rankings calculation
  const rankedDistricts = useMemo(() => {
    return [...SOCIO_ECONOMIC_DATA].sort((a, b) => b[selectedIndicator] - a[selectedIndicator]);
  }, [selectedIndicator]);

  // AI Insights generator mapping
  const activeInsights = useMemo(() => {
    return [
      {
        type: 'urbanization',
        title: 'Urbanization & Property Theft',
        text: 'Higher urbanization shows a strong positive correlation (r = +0.78) with property theft across tech corridor sectors.'
      },
      {
        type: 'literacyRate',
        title: 'Literacy Rate & Violent Offenses',
        text: 'Literacy demonstrates an inverse correlation (r = -0.58) with violent offenses and assault reports.'
      },
      {
        type: 'income',
        title: 'Per-Capita Income & Cyber Fraud',
        text: 'Cybercrime and digital financial fraud demonstrate peak correlation (r = +0.89) in high-income urban districts.'
      },
      {
        type: 'employmentRate',
        title: 'Employment & Corporate Fraud',
        text: 'Employment rates display low statistical correlation (r = -0.12) with corporate fraud trends.'
      }
    ];
  }, []);

  // CSV Matrix Exporter
  const handleExportCSV = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    let csv = 'Indicator,Property Theft,Assault,Cybercrime,Fraud\n';
    
    CORRELATION_INDICATORS.forEach(ind => {
      const row = CRIME_CORRELATION_MATRIX[ind.id] || {};
      csv += `"${ind.name}",${row['Property Theft'] || 0},${row['Assault'] || 0},${row['Cybercrime'] || 0},${row['Fraud'] || 0}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SocioEconomic_Correlation_Matrix_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Exporter using jsPDF
  const handleExportPDF = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const doc = new jsPDF();
    doc.setFont('Courier');
    doc.setFontSize(14);

    doc.text('CONFIDENTIAL - INTERNAL USE ONLY', 10, 15);
    doc.text('===================================================', 10, 22);
    doc.text('REPORT TYPE: SOCIO-ECONOMIC CRIME CORRELATION REPORT', 10, 29);

    doc.setFontSize(10);
    doc.text(`REPORT ID:             CR-COR-${todayStr}`, 10, 38);
    doc.text(`GENERATION DATE & TIME: ${todayStr} 09:30 AM`, 10, 45);
    doc.text(`REPORTING OFFICERS:    Inspector Patil (Intelligence Analyst)`, 10, 52);
    doc.text(`ACTIVE DISTRICT FILTERS: ${selectedDistrict}`, 10, 59);
    doc.text(`CLASSIFICATION:        CONFIDENTIAL - INTERNAL USE ONLY`, 10, 66);
    doc.text('---------------------------------------------------', 10, 73);

    doc.setFontSize(12);
    doc.text('1. PEARSON CORRELATION COEFFICIENTS MATRIX', 10, 82);
    doc.text('------------------------------------------', 10, 87);
    doc.setFontSize(9);
    
    let yPos = 95;
    doc.text('Indicator       | Property Theft | Assault | Cybercrime | Fraud', 10, yPos);
    doc.text('----------------------------------------------------------------', 10, yPos + 5);
    yPos += 12;

    CORRELATION_INDICATORS.forEach(ind => {
      const row = CRIME_CORRELATION_MATRIX[ind.id] || {};
      const nameCol = ind.name.padEnd(15);
      const theft = (row['Property Theft'] >= 0 ? '+' : '') + (row['Property Theft'] || 0.0).toFixed(2);
      const assault = (row['Assault'] >= 0 ? '+' : '') + (row['Assault'] || 0.0).toFixed(2);
      const cyber = (row['Cybercrime'] >= 0 ? '+' : '') + (row['Cybercrime'] || 0.0).toFixed(2);
      const fraud = (row['Fraud'] >= 0 ? '+' : '') + (row['Fraud'] || 0.0).toFixed(2);
      
      doc.text(`${nameCol} | ${theft}          | ${assault}    | ${cyber}      | ${fraud}`, 10, yPos);
      yPos += 7;
    });

    doc.setFontSize(12);
    yPos += 10;
    doc.text('2. STRATEGIC ANALYTICAL FINDINGS (CORRELATIONS)', 10, yPos);
    doc.text('-----------------------------------------------', 10, yPos + 5);
    doc.setFontSize(9);
    yPos += 12;

    activeInsights.forEach(ins => {
      const split = doc.splitTextToSize(`• ${ins.text}`, 180);
      doc.text(split, 10, yPos);
      yPos += split.length * 6;
    });

    yPos += 8;
    doc.setFontSize(8);
    doc.setTextColor(239, 68, 68);
    doc.text('DISCLAIMER: Correlation indicates statistical association only and does not imply causation.', 10, yPos);
    
    doc.save(`SocioEconomic_Correlation_Report_${todayStr}.pdf`);
  };

  // Resolve heat grid color representation
  const getHeatColorClass = (val) => {
    if (Math.abs(val) < correlationThreshold) {
      return 'bg-slate-50 text-slate-400 border border-slate-200 font-semibold';
    }
    if (val > 0) {
      if (val > 0.7) return 'bg-rose-100 text-rose-800 border border-rose-200 font-extrabold shadow-xs';
      return 'bg-rose-50 text-rose-700 border border-rose-100 font-bold';
    } else {
      if (val < -0.5) return 'bg-sky-100 text-sky-800 border border-sky-200 font-extrabold shadow-xs';
      return 'bg-sky-50 text-sky-700 border border-sky-100 font-bold';
    }
  };

  const selectedIndName = indicatorConfig[selectedIndicator]?.name || 'Urbanization';

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 pb-16 px-4 sm:px-8">
      
      {/* 1. Header Banner */}
      <div className="bg-white border border-[#E7ECF3] rounded-[22px] p-5 sm:p-6 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
          <div className="w-12 h-12 bg-[#0B1F4D] rounded-[14px] flex items-center justify-center shrink-0 shadow-sm">
            <Database className="w-6 h-6 text-[#C79A2B]" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl sm:text-2xl font-black text-[#0B1F4D] tracking-tight">{t('socio.title', 'Socio-economic Crime Correlation')}</h1>
              <div className="px-3 py-1 rounded-full bg-[#F1F5F9] border border-[#E7ECF3] flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-[#0B1F4D] uppercase tracking-widest whitespace-nowrap">{t('admin.active', 'AI ACTIVE')}</span>
              </div>
            </div>
            <p className="text-xs font-semibold text-[#64748B]">{t('socio.subtitle', 'Strategic analytics suite correlating crime trends with district-level socio-economic indicators.')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-[12px] text-xs font-bold text-[#0B1F4D] uppercase tracking-wider transition-colors shrink-0 cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-[#0B1F4D]" />
            <span>CSV</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 rounded-[12px] transition-colors shrink-0 cursor-pointer shadow-sm group"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest">{t('reports.generateReport', 'Export Report')}</span>
          </button>
        </div>
      </div>

      {/* 2. Organized KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Card 1 */}
        <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-4 shadow-sm h-[88px] flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider block truncate">{t('reports.selectDistrict', 'Target District')}</span>
          <span className="text-base sm:text-lg font-black text-[#0B1F4D] tracking-tight truncate block">{selectedDistrict}</span>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-4 shadow-sm h-[88px] flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider block truncate">{t('socio.selectedIndicator', 'Active Indicator')}</span>
          <span className="text-base sm:text-lg font-black text-[#0B1F4D] tracking-tight truncate block">{selectedIndName}</span>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-4 shadow-sm h-[88px] flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider block truncate">{t('socio.correlationIndex', 'Peak Positive (r)')}</span>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-base sm:text-lg font-black text-rose-600 tracking-tight shrink-0">+0.89</span>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100 truncate">{t('categories.cybercrime', 'Cybercrime')}</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-4 shadow-sm h-[88px] flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider block truncate">{t('socio.correlationIndex', 'Peak Negative (r)')}</span>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-base sm:text-lg font-black text-sky-600 tracking-tight shrink-0">-0.58</span>
            <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100 truncate">{t('categories.assault', 'Assault')}</span>
          </div>
        </div>

        {/* Card 5 */}
        <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-4 shadow-sm h-[88px] flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider block truncate">{t('common.filter', 'Evaluated Parameters')}</span>
          <span className="text-base sm:text-lg font-black text-[#0B1F4D] tracking-tight truncate block">5 {t('socio.selectedIndicator', 'Indicators')}</span>
        </div>

        {/* Card 6 */}
        <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-4 shadow-sm h-[88px] flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider block truncate">{t('hotspots.criticalPriorityZones', 'High Impact Zone')}</span>
          <span className="text-base sm:text-lg font-black text-[#0B1F4D] tracking-tight truncate block">Bengaluru City</span>
        </div>

      </div>

      {/* 3. Organized Filter Toolbar */}
      <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-3.5 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 flex-1">
          {/* District Select */}
          <div className="relative">
            <MapPin className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full h-9 bg-[#F8F9FB] border border-[#E7ECF3] text-[#0F172A] text-[11px] font-bold rounded-lg pl-9 pr-3 focus:outline-none focus:ring-1 focus:ring-[#0B1F4D] cursor-pointer uppercase tracking-wider"
            >
              <option value="All">{t('dashboard.allDistricts', 'All Districts')}</option>
              {SOCIO_ECONOMIC_DATA.map(d => (
                <option key={d.district} value={d.district}>{d.district}</option>
              ))}
            </select>
          </div>

          {/* Category Select */}
          <div className="relative">
            <Tag className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-9 bg-[#F8F9FB] border border-[#E7ECF3] text-[#0F172A] text-[11px] font-bold rounded-lg pl-9 pr-3 focus:outline-none focus:ring-1 focus:ring-[#0B1F4D] cursor-pointer uppercase tracking-wider"
            >
              <option value="All">{t('categories.allCategories', 'All Categories')}</option>
              {CORRELATION_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Year Select */}
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full h-9 bg-[#F8F9FB] border border-[#E7ECF3] text-[#0F172A] text-[11px] font-bold rounded-lg pl-9 pr-3 focus:outline-none focus:ring-1 focus:ring-[#0B1F4D] cursor-pointer uppercase tracking-wider"
            >
              <option value="2026">2026 ({t('analytics.predictedRisk', 'Forecasted')})</option>
              <option value="2025">2025 ({t('analytics.historicalVsPredicted', 'Historical')})</option>
              <option value="2024">2024 ({t('analytics.historicalVsPredicted', 'Historical')})</option>
            </select>
          </div>

          {/* Indicator Select */}
          <div className="relative">
            <Activity className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedIndicator}
              onChange={(e) => setSelectedIndicator(e.target.value)}
              className="w-full h-9 bg-[#F8F9FB] border border-[#E7ECF3] text-[#0F172A] text-[11px] font-bold rounded-lg pl-9 pr-3 focus:outline-none focus:ring-1 focus:ring-[#0B1F4D] cursor-pointer uppercase tracking-wider"
            >
              {CORRELATION_INDICATORS.map(ind => (
                <option key={ind.id} value={ind.id}>{ind.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Threshold Control & Reset Button */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#E7ECF3]">
          <div className="flex items-center gap-2.5 bg-[#F8F9FB] border border-[#E7ECF3] px-3 py-1.5 rounded-lg h-9">
            <Sliders className="w-3.5 h-3.5 text-[#0B1F4D]" />
            <span className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider whitespace-nowrap">
              {t('analytics.triggerThreshold', 'Threshold')}: <span className="font-mono text-[#0B1F4D] font-black">{correlationThreshold}</span>
            </span>
            <input
              type="range"
              min="0"
              max="0.8"
              step="0.1"
              value={correlationThreshold}
              onChange={(e) => setCorrelationThreshold(parseFloat(e.target.value))}
              className="w-20 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0B1F4D]"
            />
          </div>

          <button
            onClick={handleResetFilters}
            className="h-9 px-3.5 rounded-lg bg-[#F8F9FB] border border-[#E7ECF3] text-[#0B1F4D] hover:bg-[#0B1F4D] hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 font-bold text-[10px] uppercase tracking-wider"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            {t('dashboard.clearFilters', 'Reset')}
          </button>
        </div>

      </div>

      {/* 4. Main Split Grid - 12 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (8 cols = 66.6% width) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Strategic Observations Banner */}
          <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2 text-[#0B1F4D] font-black text-xs uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-[#C79A2B]" />
                <span>{t('socio.districtComparison', 'Strategic Correlation Findings')}</span>
              </div>
              <span className="text-[10px] bg-emerald-50 border border-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                {t('analytics.hotspotAnalytics', 'AI Correlation Telemetry')}
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeInsights.slice(0, 2).map((ins, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3.5 bg-[#F8F9FB] rounded-xl border border-[#E7ECF3] border-l-4 border-l-[#0B1F4D]">
                  <div className="w-2 h-2 rounded-full bg-[#0B1F4D] mt-1.5 shrink-0" />
                  <div>
                    <h4 className="text-[11px] font-black text-[#0F172A] uppercase tracking-wider">{ins.title}</h4>
                    <p className="text-xs font-semibold text-[#64748B] leading-relaxed mt-0.5">{ins.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pearson Correlation Heatmap Card */}
          <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#E7ECF3]">
              <div>
                <h3 className="text-base font-black text-[#0F172A] tracking-tight">{t('socio.districtComparison', 'Pearson Correlation Heatmap')}</h3>
                <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mt-0.5">{t('socio.rSquaredValue', 'Statistical r-coefficients (-1.00 to +1.00)')}</p>
              </div>
              <span className="bg-[#0B1F4D]/5 text-[#0B1F4D] border border-[#0B1F4D]/10 px-3 py-1 rounded-full font-extrabold text-xs font-mono">
                r-matrix
              </span>
            </div>

            <div className="overflow-x-auto min-w-0">
              <div className="grid grid-cols-6 gap-2 text-center text-[10px] font-black tracking-wider uppercase text-[#64748B] pb-2 border-b border-[#E7ECF3]">
                <div className="text-left">{t('common.category', 'Crime Category')}</div>
                {CORRELATION_INDICATORS.map(ind => (
                  <div key={ind.id} className="truncate" title={ind.name}>{ind.name}</div>
                ))}
              </div>
              
              <div className="space-y-2 pt-3">
                {CORRELATION_CATEGORIES.map(cat => {
                  const matchesCategory = selectedCategory === 'All' || selectedCategory === cat;
                  if (!matchesCategory) return null;
                  
                  return (
                    <div key={cat} className="grid grid-cols-6 gap-2 items-center text-xs font-mono">
                      <div className="text-left font-sans font-bold text-[#0F172A] truncate" title={cat}>{cat}</div>
                      {CORRELATION_INDICATORS.map(ind => {
                        const val = CRIME_CORRELATION_MATRIX[ind.id]?.[cat] || 0.0;
                        const isUnderThreshold = Math.abs(val) < correlationThreshold;
                        
                        return (
                          <div 
                            key={ind.id} 
                            className={`py-3 rounded-xl flex flex-col justify-center items-center transition-all ${getHeatColorClass(val)}`}
                          >
                            <span className="text-xs font-extrabold">{val >= 0 ? '+' : ''}{val.toFixed(2)}</span>
                            {isUnderThreshold && <span className="text-[8px] text-slate-400 block font-sans font-medium mt-0.5">Filtered</span>}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Heatmap Legend */}
            <div className="pt-3 border-t border-[#E7ECF3] flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold text-[#64748B]">
              <span className="uppercase tracking-wider">Correlation Intensity Scale:</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-rose-100 border border-rose-200" />
                  <span>Strong Positive (+0.7+)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-rose-50 border border-rose-100" />
                  <span>Positive (+0.3 to +0.7)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-sky-100 border border-sky-200" />
                  <span>Inverse (-0.5+)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-slate-50 border border-slate-200" />
                  <span>Filtered (&lt; {correlationThreshold})</span>
                </div>
              </div>
            </div>
          </div>          {/* Correlation Matrix Table */}
          <div className="bg-white border border-[#E7ECF3] rounded-[20px] overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-[#E7ECF3] flex justify-between items-center bg-[#F8F9FB]">
              <div>
                <h3 className="text-base font-black text-[#0F172A] tracking-tight">{t('socio.districtComparison', 'Correlation Coefficients Matrix')}</h3>
                <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mt-0.5">{t('socio.rSquaredValue', 'Cross-category Pearson correlation table')}</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8F9FB] border-b border-[#E7ECF3] text-[#0F172A] uppercase font-extrabold text-[10px] tracking-wider">
                    <th className="py-3.5 px-6">{t('socio.selectedIndicator', 'Socio-economic Indicator')}</th>
                    <th className="py-3.5 px-6 text-center font-mono">{t('categories.propertyTheft', 'Property Theft')}</th>
                    <th className="py-3.5 px-6 text-center font-mono">{t('categories.assault', 'Assault')}</th>
                    <th className="py-3.5 px-6 text-center font-mono">{t('categories.cybercrime', 'Cybercrime')}</th>
                    <th className="py-3.5 px-6 text-center font-mono">{t('categories.financialFraud', 'Fraud')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7ECF3]/60 font-mono">
                  {CORRELATION_INDICATORS.map(ind => (
                    <tr key={ind.id} className="hover:bg-[#F8F9FB]/80 transition-colors h-12">
                      <td className="px-6 py-3.5 font-sans font-bold text-[#0F172A]">{ind.name}</td>
                      <td className="px-6 py-3.5 text-center font-extrabold text-rose-600">{(CRIME_CORRELATION_MATRIX[ind.id]?.['Property Theft'] || 0).toFixed(2)}</td>
                      <td className="px-6 py-3.5 text-center font-extrabold text-sky-600">{(CRIME_CORRELATION_MATRIX[ind.id]?.['Assault'] || 0).toFixed(2)}</td>
                      <td className="px-6 py-3.5 text-center font-extrabold text-rose-600">{(CRIME_CORRELATION_MATRIX[ind.id]?.['Cybercrime'] || 0).toFixed(2)}</td>
                      <td className="px-6 py-3.5 text-center font-extrabold text-rose-600">{(CRIME_CORRELATION_MATRIX[ind.id]?.['Fraud'] || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* District Rankings Table */}
          <div className="bg-white border border-[#E7ECF3] rounded-[20px] overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-[#E7ECF3] flex justify-between items-center bg-[#F8F9FB]">
              <div>
                <h3 className="text-base font-black text-[#0F172A] tracking-tight">{t('district.stationPerformance', 'District Rankings Index')}</h3>
                <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mt-0.5">{t('district.stationPerformanceDesc', 'District ordering based on active socio-economic indicator')}</p>
              </div>
              <span className="bg-[#0B1F4D]/5 text-[#0B1F4D] border border-[#0B1F4D]/10 px-3 py-1 rounded-full font-extrabold text-xs">
                {t('cases.sortBy', 'Sorted')}: {selectedIndName}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8F9FB] border-b border-[#E7ECF3] text-[#0F172A] uppercase font-extrabold text-[10px] tracking-wider">
                    <th className="py-3.5 px-6 text-center w-16">{t('hotspots.rank', 'Rank')}</th>
                    <th className="py-3.5 px-6">{t('common.district', 'District')}</th>
                    <th className="py-3.5 px-6 text-right">{t('socio.selectedIndicator', 'Indicator Value')}</th>
                    <th className="py-3.5 px-6 text-right">{t('socio.urbanizationCorrelation', 'Crime Rate (per 1k)')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7ECF3]/60">
                  {rankedDistricts.map((d, index) => {
                    const isDistrictMatch = selectedDistrict === 'All' || selectedDistrict === d.district;
                    const val = d[selectedIndicator];
                    
                    return (
                      <tr 
                        key={d.district} 
                        className={`h-12 transition-colors ${
                          isDistrictMatch ? 'hover:bg-[#F8F9FB]' : 'opacity-40'
                        }`}
                      >
                        <td className="px-6 py-3 text-center font-mono font-extrabold text-[#0B1F4D]">
                          #{index + 1}
                        </td>
                        <td className="px-6 py-3 font-bold text-[#0F172A]">{d.district}</td>
                        <td className="px-6 py-3 text-right font-mono font-bold text-[#0F172A]">
                          {selectedIndicator === 'averageIncome' 
                            ? `Rs. ${val.toLocaleString()}` 
                            : `${val.toLocaleString()}${selectedIndicator !== 'population' ? '%' : ''}`}
                        </td>
                        <td className="px-6 py-3 text-right font-mono font-extrabold text-rose-600">{d.crimeRate}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column (4 cols = 33.3% width) */}
        <div className="lg:col-span-4 space-y-6 sticky top-6">
          
          {/* Interactive Scatter Plot */}
          <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-start border-b border-[#E7ECF3] pb-3">
              <div>
                <h3 className="text-base font-black text-[#0F172A]">{t('socio.regressionModel', 'Interactive Scatter Plot')}</h3>
                <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mt-0.5">X: {selectedIndName} vs Y: {t('socio.urbanizationCorrelation', 'Crime Rate')}</p>
              </div>
              <span className="text-[10px] font-mono font-extrabold text-[#0B1F4D] bg-[#0B1F4D]/5 px-2.5 py-1 rounded-full border border-[#0B1F4D]/10 uppercase">
                SCATTER-2D
              </span>
            </div>
            
            <div className="relative bg-[#F8F9FB] border border-[#E7ECF3] rounded-[16px] p-4 flex flex-col justify-center items-center">
              <svg viewBox="0 0 220 140" className="w-full h-52 overflow-visible">
                {/* Horizontal grid lines */}
                <line x1="20" y1="110" x2="200" y2="110" stroke="#E7ECF3" strokeWidth="1" />
                <line x1="20" y1="75" x2="200" y2="75" stroke="#E7ECF3" strokeWidth="1" strokeDasharray="3" />
                <line x1="20" y1="20" x2="200" y2="20" stroke="#E7ECF3" strokeWidth="1" />

                {/* Vertical grid lines */}
                <line x1="20" y1="20" x2="200" y2="20" stroke="#E7ECF3" strokeWidth="1" />
                <line x1="110" y1="20" x2="110" y2="110" stroke="#E7ECF3" strokeWidth="1" strokeDasharray="3" />
                <line x1="200" y1="20" x2="200" y2="110" stroke="#E7ECF3" strokeWidth="1" />

                {/* Axes annotations */}
                <text x="200" y="122" fill="#64748B" fontSize="7" fontWeight="bold" textAnchor="end">X: {selectedIndName}</text>
                <text x="12" y="16" fill="#64748B" fontSize="7" fontWeight="bold" transform="rotate(-90 12 16)" textAnchor="end">Y: {t('socio.urbanizationCorrelation', 'Crime Rate')}</text>

                {/* Plotting dots */}
                {SOCIO_ECONOMIC_DATA.map((d) => {
                  const maxInd = Math.max(...SOCIO_ECONOMIC_DATA.map(x => x[selectedIndicator])) || 1.0;
                  const minInd = Math.min(...SOCIO_ECONOMIC_DATA.map(x => x[selectedIndicator])) || 0.0;
                  
                  const xPct = (d[selectedIndicator] - minInd) / (maxInd - minInd || 1.0);
                  const yPct = d.crimeRate / 20.0;
                  
                  const cx = 25 + xPct * 165;
                  const cy = 105 - yPct * 80;
                  
                  const isHovered = hoveredDistrict?.district === d.district;
                  const isMatch = selectedDistrict === 'All' || selectedDistrict === d.district;

                  return (
                    <circle
                      key={d.district}
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 5.5 : 4}
                      className={`cursor-pointer transition-all ${
                        isHovered 
                          ? 'fill-[#0B1F4D] stroke-[#C79A2B] stroke-2' 
                          : isMatch 
                          ? 'fill-rose-500 hover:fill-[#0B1F4D]' 
                          : 'fill-slate-300 opacity-30'
                      }`}
                      onMouseEnter={() => setHoveredDistrict(d)}
                      onMouseLeave={() => setHoveredDistrict(null)}
                    />
                  );
                })}
              </svg>

              {/* Tooltip Overlay */}
              {hoveredDistrict && (
                <div className="absolute top-3 right-3 bg-white border border-[#E7ECF3] p-3 rounded-[12px] shadow-md text-[10px] font-mono leading-relaxed max-w-44 z-10">
                  <p className="font-bold text-[#0F172A] font-sans">{hoveredDistrict.district}</p>
                  <p className="text-[#64748B] pt-0.5">Val: {hoveredDistrict[selectedIndicator]?.toLocaleString()}</p>
                  <p className="text-rose-600 font-extrabold">{t('socio.urbanizationCorrelation', 'Crime Rate')}: {hoveredDistrict.crimeRate}</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Insights Observations */}
          <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-5 sm:p-6 shadow-sm space-y-3">
            <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-wider flex items-center gap-2 border-b border-[#E7ECF3] pb-2.5">
              <TrendingUp className="w-4 h-4 text-[#0B1F4D]" />
              <span>{t('district.aiGeneratedInsights', 'AI Analytical Insights')}</span>
            </h3>
            <div className="space-y-2.5 pt-1">
              {activeInsights.map((ins, index) => (
                <div key={index} className="p-3.5 bg-[#F8F9FB] border border-[#E7ECF3] rounded-xl space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C79A2B]" />
                    <h4 className="text-[11px] font-black text-[#0F172A] uppercase tracking-wider">{ins.title}</h4>
                  </div>
                  <p className="text-xs font-semibold text-[#64748B] leading-relaxed pl-3.5">{ins.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Correlation Disclaimer Banner */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-[20px] p-4.5 flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="block text-amber-900 font-black uppercase tracking-wider mb-0.5">{t('socio.pValue', 'Correlation Caution')}</span>
              <p className="text-amber-800 font-medium leading-relaxed">
                Statistical correlation indicates association only and <strong className="font-black text-amber-950">does not imply direct causation</strong>.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
