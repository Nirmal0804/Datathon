import React from 'react';
import { FileText, BarChart2, Map, Network, Download, Eye, MoreHorizontal, Clock } from 'lucide-react';
import { jsPDF } from 'jspdf';

const iconMap = {
  'Crime Summary': FileText,
  'District Report': BarChart2,
  'Hotspot Analysis': Map,
  'Network Analysis': Network,
  'Predictive Risk': BarChart2,
};

const reports = [
  { id: 'RPT-2023-0042', title: 'Statewide Monthly Crime Summary', type: 'Crime Summary', district: 'All Karnataka', generated: '2023-10-24', size: '2.4 MB', status: 'Ready', pages: 48 },
  { id: 'RPT-2023-0041', title: 'Bengaluru South District Intelligence', type: 'District Report', district: 'Bengaluru South', generated: '2023-10-22', size: '1.1 MB', status: 'Ready', pages: 24 },
  { id: 'RPT-2023-0040', title: 'Q3 Hotspot Migration Analysis', type: 'Hotspot Analysis', district: 'Hubballi-Dharwad', generated: '2023-10-20', size: '3.8 MB', status: 'Ready', pages: 62 },
  { id: 'RPT-2023-0039', title: 'Cyber Syndicate Network Map', type: 'Network Analysis', district: 'Bengaluru City', generated: '2023-10-18', size: '890 KB', status: 'Processing', pages: null },
  { id: 'RPT-2023-0038', title: 'Festival Season Predictive Risk Model', type: 'Predictive Risk', district: 'All Karnataka', generated: '2023-10-15', size: '1.6 MB', status: 'Ready', pages: 31 },
  { id: 'RPT-2023-0037', title: 'Mysuru District Q3 Summary', type: 'District Report', district: 'Mysuru', generated: '2023-10-10', size: '980 KB', status: 'Ready', pages: 19 },
];

export const downloadReportFile = (report, format, officerInfo = { name: 'Inspector Patil', role: 'Intelligence Analyst' }) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const filename = `Crime_Report_${todayStr}.${format === 'excel' ? 'xlsx' : format}`;
  
  const reportTitle = report.title || 'Jurisdictional Crime Intelligence Brief';
  const reportId = report.id || 'RPT-2026';
  const district = report.district || 'All Karnataka';
  const generatedDate = report.generated || todayStr;
  const officerName = officerInfo.name;
  const officerRole = officerInfo.role;

  if (format === 'csv') {
    const headers = 'Metadata Field,Value\n';
    const content = [
      `"Report ID","${reportId}"`,
      `"Report Title","${reportTitle}"`,
      `"District Jurisdiction","${district}"`,
      `"Classification","CONFIDENTIAL - INTERNAL USE ONLY"`,
      `"Date Generated","${generatedDate} 09:30 AM"`,
      `"Reporting Officer","${officerName}"`,
      `"Officer Role","${officerRole}"`,
      `"Total Incidents","1248"`,
      `"Clearance Rate","+12%"`,
      `"AI Risk Score","84"`,
      `"Key Findings","1. Property crimes increased 18% in Tech Corridor; increased patrol presence recommended. 2. Narcotics-related arrests show strong correlation with international-transit nodes. 3. AI model predicts 12% increase in incidents in the upcoming festival period."`
    ].join('\n');
    
    const blob = new Blob([headers + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } 
  else if (format === 'excel') {
    const headers = 'Metadata Field\tValue\n';
    const content = [
      `"Report ID"\t"${reportId}"`,
      `"Report Title"\t"${reportTitle}"`,
      `"District Jurisdiction"\t"${district}"`,
      `"Classification"\t"CONFIDENTIAL - INTERNAL USE ONLY"`,
      `"Date Generated"\t"${generatedDate} 09:30 AM"`,
      `"Reporting Officer"\t"${officerName}"`,
      `"Officer Role"\t"${officerRole}"`,
      `"Total Incidents"\t"1248"`,
      `"Clearance Rate"\t"+12%"`,
      `"AI Risk Score"\t"84"`,
      `"Key Findings"\t"1. Property crimes increased 18% in Tech Corridor. 2. Narcotics arrests correlate with international transit nodes. 3. AI predicts 12% increase in holiday season."`
    ].join('\n');
    
    const blob = new Blob([headers + content], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } 
  else {
    // Generate valid PDF document using jsPDF
    const doc = new jsPDF();
    doc.setFont('Courier');
    doc.setFontSize(14);
    
    doc.text('CONFIDENTIAL - INTERNAL USE ONLY', 10, 15);
    doc.text('===================================================', 10, 22);
    
    doc.setFontSize(10);
    doc.text(`Report ID:             ${reportId}`, 10, 30);
    doc.text(`Report Title:          ${reportTitle}`, 10, 37);
    doc.text(`District Jurisdiction: ${district}`, 10, 44);
    doc.text(`Date & Time Generated: ${generatedDate} 09:30 AM`, 10, 51);
    doc.text(`Reporting Officer:     ${officerName}`, 10, 58);
    doc.text(`Officer Role:          ${officerRole}`, 10, 65);
    doc.text(`Classification:        CONFIDENTIAL - INTERNAL USE ONLY`, 10, 72);
    doc.text('---------------------------------------------------', 10, 79);
    
    doc.setFontSize(12);
    doc.text('1. EXECUTIVE SUMMARY', 10, 88);
    doc.text('--------------------', 10, 93);
    doc.setFontSize(10);
    doc.text('Total Incidents: 1,248', 10, 100);
    doc.text('Clearance Rate:  +12%', 10, 107);
    doc.text('AI Risk Score:   84', 10, 114);
    
    const summaryText = 'This report presents a comprehensive analysis of crime data for the district. The analysis integrates AI-driven risk scoring, historical trend modeling, and geospatial hotspot detection to provide actionable intelligence.';
    const splitSummary = doc.splitTextToSize(summaryText, 180);
    doc.text(splitSummary, 10, 122);
    
    doc.setFontSize(12);
    doc.text('2. SPATIAL DISTRIBUTION', 10, 142);
    doc.text('-----------------------', 10, 147);
    doc.setFontSize(10);
    doc.text('Choropleth Map - Crime Density by Area', 10, 154);
    doc.text('Expected weekly averages, crime counts, and category shifts compiled for analysis.', 10, 161);
    
    doc.setFontSize(12);
    doc.text('3. KEY FINDINGS & RECOMMENDATIONS', 10, 175);
    doc.text('---------------------------------', 10, 180);
    doc.setFontSize(10);
    doc.text('1. Property crimes increased 18% in Tech Corridor; patrols recommended.', 10, 187);
    doc.text('2. Narcotics-related arrests show correlation with transit nodes.', 10, 194);
    doc.text('3. AI model predicts 12% increase in incidents in festival period.', 10, 201);
    
    doc.text('CONFIDENTIAL REPORT DOCUMENT END', 10, 215);
    
    doc.save(filename);
  }
};

export const INITIAL_REPORTS = reports;

export default function ReportList({ searchQuery, onSelect, selectedId, reports: propsReports }) {
  const activeReports = propsReports || reports;
  const filtered = activeReports.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-3">
      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No reports found matching your search.</p>
        </div>
      )}
      {filtered.map((report) => {
        const Icon = iconMap[report.type] || FileText;
        const isSelected = report.id === selectedId;
        return (
          <div
            key={report.id}
            onClick={() => onSelect(report)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              isSelected
                ? 'bg-primary/5 border-primary/40 shadow-[0_0_0_1px_rgba(99,102,241,0.2)]'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-2.5 rounded-lg shrink-0 ${isSelected ? 'bg-primary/20 text-primary' : 'bg-slate-800 text-slate-400'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-white truncate">{report.title}</h4>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="text-slate-500 hover:text-white shrink-0 p-1 rounded hover:bg-slate-700"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span className="text-slate-400">{report.type}</span>
                  <span>•</span>
                  <span>{report.district}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{report.generated}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  report.status === 'Ready' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {report.status}
                </span>
                {report.pages && <span className="text-xs text-slate-500">{report.pages} pages</span>}
                <span className="text-xs text-slate-500">{report.size}</span>
              </div>
              {report.status === 'Ready' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); onSelect(report); }}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-700 transition-colors"
                  >
                    <Eye className="w-3 h-3" /> Preview
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); downloadReportFile(report, 'pdf'); }}
                    className="flex items-center gap-1 text-xs text-primary hover:text-white px-2 py-1 rounded hover:bg-slate-700 transition-colors"
                  >
                    <Download className="w-3 h-3" /> PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
