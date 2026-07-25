import React, { useState, useMemo } from 'react';
import { Database, Download, AlertTriangle, ShieldAlert, BarChart2, TrendingUp, Info, HelpCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { SOCIO_ECONOMIC_DATA } from '../../mock/socioEconomicData';
import { CRIME_CORRELATION_MATRIX, CORRELATION_INDICATORS, CORRELATION_CATEGORIES } from '../../mock/crimeCorrelationData';

export default function SocioEconomicCorrelation({ role }) {
  // Role Access Guard: Expose only to Intelligence Analyst
  if (role !== 'analyst') {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-slate-900 border border-slate-800 rounded-xl text-center shadow-lg">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white uppercase tracking-wider">Access Denied</h3>
        <p className="text-2xs text-slate-400 mt-2">
          This strategic correlation analysis module is restricted to authorized Intelligence Analysts only.
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
    const list = [];
    const indName = indicatorConfig[selectedIndicator]?.name || 'Indicator';

    list.push({
      type: 'urbanization',
      text: 'Higher urbanization shows a moderate positive correlation (r = +0.78) with property crime across Tech corridors.'
    });
    list.push({
      type: 'literacyRate',
      text: 'Literacy demonstrates a weak negative correlation (r = -0.58) with violent offenses and assault reports.'
    });
    list.push({
      type: 'income',
      text: 'Cybercrime and digital financial fraud appear more common (r = +0.89) in highly urbanized, high-income districts.'
    });
    list.push({
      type: 'employmentRate',
      text: 'Employment rate currently shows minimal statistical association (r = -0.12) with corporate and fraud crime patterns.'
    });

    return list;
  }, [selectedIndicator, indicatorConfig]);

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
    link.setAttribute('download', `Crime_Report_${todayStr}.csv`);
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
    
    doc.save(`Crime_Report_${todayStr}.pdf`);
  };

  // Resolve heat grid color representation
  const getHeatColorClass = (val) => {
    if (Math.abs(val) < correlationThreshold) return 'bg-slate-800/40 text-slate-400 border border-slate-700/50';
    if (val > 0) {
      if (val > 0.7) return 'bg-red-500/25 text-red-300 border border-red-500/40 font-bold';
      return 'bg-red-500/10 text-red-400 border border-red-500/20';
    } else {
      if (val < -0.5) return 'bg-blue-500/25 text-blue-300 border border-blue-500/40 font-bold';
      return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      
      {/* 1. Page Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-5 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            <span>Socio-economic Crime Correlation</span>
          </h1>
          <p className="text-2xs text-slate-400 font-sans">
            Analyze statistical relationships between crime trends and district socio-economic indicators.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 rounded-lg cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 bg-primary hover:bg-indigo-500 text-white rounded-lg cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export Correlation Report (PDF)
          </button>
        </div>
      </div>

      {/* 2. Filters Wrapper */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
        <div>
          <label className="block text-4xs text-slate-450 font-bold uppercase mb-1.5">District Jurisdiction</label>
          <select 
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-3xs font-semibold rounded-lg p-2 focus:outline-none focus:border-slate-700 cursor-pointer"
          >
            <option value="All">All Districts</option>
            {SOCIO_ECONOMIC_DATA.map(d => (
              <option key={d.district} value={d.district}>{d.district}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-4xs text-slate-450 font-bold uppercase mb-1.5">Crime Category</label>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-3xs font-semibold rounded-lg p-2 focus:outline-none focus:border-slate-700 cursor-pointer"
          >
            <option value="All">All Categories</option>
            {CORRELATION_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-4xs text-slate-450 font-bold uppercase mb-1.5">Reporting Year</label>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-3xs font-semibold rounded-lg p-2 focus:outline-none focus:border-slate-700 cursor-pointer"
          >
            <option value="2026">2026 (Forecasted)</option>
            <option value="2025">2025 (Historical)</option>
            <option value="2024">2024 (Historical)</option>
          </select>
        </div>
        <div>
          <label className="block text-4xs text-slate-450 font-bold uppercase mb-1.5">Socio-economic Indicator</label>
          <select 
            value={selectedIndicator}
            onChange={(e) => setSelectedIndicator(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-3xs font-semibold rounded-lg p-2 focus:outline-none focus:border-slate-700 cursor-pointer"
          >
            {CORRELATION_INDICATORS.map(ind => (
              <option key={ind.id} value={ind.id}>{ind.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-4xs text-slate-450 font-bold uppercase mb-1">
            Correlation Threshold: <span className="font-mono text-slate-200">{correlationThreshold}</span>
          </label>
          <input 
            type="range"
            min="0"
            max="0.8"
            step="0.1"
            value={correlationThreshold}
            onChange={(e) => setCorrelationThreshold(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary mt-2"
          />
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
        
        {/* Left Column: Heatmap, Matrix, Rankings (65%) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Heatmap Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Pearson Correlation Heatmap</h3>
              <span className="text-[9px] text-slate-500 font-mono">r-values (-1.0 to +1.0)</span>
            </div>
            
            <div className="overflow-x-auto min-w-0">
              <div className="grid grid-cols-6 gap-2 text-center text-4xs font-semibold tracking-wider uppercase text-slate-450 pb-2">
                <div>Crime Type</div>
                {CORRELATION_INDICATORS.map(ind => (
                  <div key={ind.id} className="truncate" title={ind.name}>{ind.name}</div>
                ))}
              </div>
              
              <div className="space-y-2">
                {CORRELATION_CATEGORIES.map(cat => {
                  const matchesCategory = selectedCategory === 'All' || selectedCategory === cat;
                  if (!matchesCategory) return null;
                  
                  return (
                    <div key={cat} className="grid grid-cols-6 gap-2 items-center text-3xs font-semibold font-mono">
                      <div className="text-left font-sans text-slate-300 truncate" title={cat}>{cat}</div>
                      {CORRELATION_INDICATORS.map(ind => {
                        const val = CRIME_CORRELATION_MATRIX[ind.id]?.[cat] || 0.0;
                        const isUnderThreshold = Math.abs(val) < correlationThreshold;
                        
                        return (
                          <div 
                            key={ind.id} 
                            className={`py-3 rounded-lg flex flex-col justify-center items-center ${getHeatColorClass(val)}`}
                          >
                            <span className="text-2xs font-bold">{val >= 0 ? '+' : ''}{val.toFixed(2)}</span>
                            {isUnderThreshold && <span className="text-[7px] text-slate-550 block font-normal mt-0.5">Filter Out</span>}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Correlation Matrix Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Correlation Matrix Coefficients</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-3xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider font-sans">
                    <th className="px-5 py-3">Socio-economic Indicator</th>
                    <th className="px-5 py-3 text-center">Property Theft</th>
                    <th className="px-5 py-3 text-center">Assault</th>
                    <th className="px-5 py-3 text-center">Cybercrime</th>
                    <th className="px-5 py-3 text-center">Fraud</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/40 text-slate-300">
                  {CORRELATION_INDICATORS.map(ind => (
                    <tr key={ind.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-5 py-3 font-sans font-semibold text-slate-200">{ind.name}</td>
                      <td className="px-5 py-3 text-center font-bold text-red-400 bg-slate-950/5">{(CRIME_CORRELATION_MATRIX[ind.id]?.['Property Theft'] || 0).toFixed(2)}</td>
                      <td className="px-5 py-3 text-center font-bold text-blue-400 bg-slate-950/5">{(CRIME_CORRELATION_MATRIX[ind.id]?.['Assault'] || 0).toFixed(2)}</td>
                      <td className="px-5 py-3 text-center font-bold text-red-400 bg-slate-950/5">{(CRIME_CORRELATION_MATRIX[ind.id]?.['Cybercrime'] || 0).toFixed(2)}</td>
                      <td className="px-5 py-3 text-center font-bold text-red-400 bg-slate-950/5">{(CRIME_CORRELATION_MATRIX[ind.id]?.['Fraud'] || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* District Rankings Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">District rankings index</h3>
              <span className="text-[8px] bg-slate-800 border border-slate-700 text-slate-400 font-mono px-2 py-0.5 rounded uppercase font-bold">
                Sorted by {indicatorConfig[selectedIndicator]?.name}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-3xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3 text-center font-mono w-16">Rank</th>
                    <th className="px-5 py-3">District</th>
                    <th className="px-5 py-3 text-right">Indicator Value</th>
                    <th className="px-5 py-3 text-right">Crime Rate (per 1k)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/40 text-slate-350">
                  {rankedDistricts.map((d, index) => {
                    const isDistrictMatch = selectedDistrict === 'All' || selectedDistrict === d.district;
                    const val = d[selectedIndicator];
                    
                    return (
                      <tr 
                        key={d.district} 
                        className={`transition-colors hover:bg-slate-800/20 ${
                          isDistrictMatch ? 'bg-primary/5' : 'opacity-40'
                        }`}
                      >
                        <td className="px-5 py-3 text-center font-mono font-bold text-indigo-400 bg-slate-950/10">
                          #{index + 1}
                        </td>
                        <td className="px-5 py-3 font-semibold text-slate-200">{d.district}</td>
                        <td className="px-5 py-3 text-right font-mono font-semibold">
                          {selectedIndicator === 'averageIncome' 
                            ? `Rs. ${val.toLocaleString()}` 
                            : `${val.toLocaleString()}${selectedIndicator !== 'population' ? '%' : ''}`}
                        </td>
                        <td className="px-5 py-3 text-right font-mono font-bold text-rose-450">{d.crimeRate}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Scatter Plot, AI Insights, Disclaimer (35%) */}
        <div className="lg:col-span-4 sticky top-6 space-y-6">
          
          {/* Interactive Scatter Plot */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-md">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Interactive Scatter Plot</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">X: {indicatorConfig[selectedIndicator]?.name} vs Y: Crime Rate</p>
            </div>
            
            <div className="relative bg-slate-950/60 border border-slate-850 rounded-xl p-4 flex flex-col justify-center items-center">
              {/* Responsive SVG Scatter Plot */}
              <svg viewBox="0 0 220 140" className="w-full h-48 overflow-visible">
                {/* Horizontal grid lines */}
                <line x1="20" y1="110" x2="200" y2="110" stroke="#1f2937" strokeWidth="1" />
                <line x1="20" y1="75" x2="200" y2="75" stroke="#1f2937" strokeWidth="1" strokeDasharray="3" />
                <line x1="20" y1="20" x2="200" y2="20" stroke="#1f2937" strokeWidth="1" />

                {/* Vertical grid lines */}
                <line x1="20" y1="20" x2="20" y2="110" stroke="#1f2937" strokeWidth="1" />
                <line x1="110" y1="20" x2="110" y2="110" stroke="#1f2937" strokeWidth="1" strokeDasharray="3" />
                <line x1="200" y1="20" x2="200" y2="110" stroke="#1f2937" strokeWidth="1" />

                {/* Axes label annotations */}
                <text x="200" y="122" fill="#64748b" fontSize="7" textAnchor="end">X: {indicatorConfig[selectedIndicator]?.name}</text>
                <text x="12" y="16" fill="#64748b" fontSize="7" transform="rotate(-90 12 16)" textAnchor="end">Y: Crime Rate</text>

                {/* Plotting mock districts dots */}
                {SOCIO_ECONOMIC_DATA.map((d) => {
                  // Resolve mapped X, Y coordinates
                  // Max limits: crimeRate ~ 20.0, indicators are scaled by max value in dataset
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
                      r={isHovered ? 4.5 : 3}
                      className={`cursor-pointer transition-all ${
                        isHovered 
                          ? 'fill-indigo-400 stroke-white stroke-1 animate-pulse-soft' 
                          : isMatch 
                          ? 'fill-rose-500 hover:fill-indigo-400' 
                          : 'fill-slate-750 opacity-20'
                      }`}
                      onMouseEnter={() => setHoveredDistrict(d)}
                      onMouseLeave={() => setHoveredDistrict(null)}
                    />
                  );
                })}
              </svg>

              {/* Tooltip Overlay */}
              {hoveredDistrict && (
                <div className="absolute top-2 right-2 bg-slate-900 border border-slate-750 p-2 rounded shadow-lg text-[9px] font-mono leading-relaxed max-w-40 z-10">
                  <p className="font-bold text-white uppercase">{hoveredDistrict.district}</p>
                  <p className="text-slate-400 pt-0.5">Val: {hoveredDistrict[selectedIndicator]?.toLocaleString()}</p>
                  <p className="text-rose-400 font-bold">Crime Rate: {hoveredDistrict.crimeRate}</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Insights Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-md">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>AI Analytical Observations</span>
            </h3>
            <div className="space-y-2.5 pt-1.5">
              {activeInsights.map((ins, index) => (
                <div key={index} className="flex gap-2 text-3xs text-slate-350 bg-slate-950/40 p-2.5 rounded-lg border border-slate-850">
                  <span className="text-indigo-400 shrink-0 font-bold">💡</span>
                  <p className="leading-relaxed">{ins.text}</p>
                </div>
              ))}
            </div>
            <span className="block text-[8px] text-slate-500 font-mono text-center uppercase tracking-wider pt-1.5 border-t border-slate-850">
              * Demonstration Insights (API Replaceable Schema)
            </span>
          </div>

          {/* Disclaimer Banner */}
          <div className="bg-red-500/5 border border-red-500/25 rounded-xl p-4 flex gap-3 shadow-md">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-3xs leading-normal">
              <span className="block text-white font-bold uppercase tracking-wider mb-0.5">Correlation Caution Summary</span>
              <p className="text-slate-400">
                Correlation indicates statistical association only and <strong className="text-red-400">does NOT imply causation</strong>. These visualizations are intended to support strategic analysis and policy planning.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
