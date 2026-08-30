import React from "react";
import { FileText, Download, Printer, Share2, X, Shield, BarChart2, AlertTriangle, TrendingUp, Target, Brain } from "lucide-react";
import { downloadReportFile } from "./ReportList";
import { useTranslation } from "../../../i18n";

export default function ReportPreview({ report, onClose, role = "analyst" }) {
  const { t } = useTranslation();
  const officerInfo = {
    analyst: { name: "Inspector Patil", role: "Intelligence Analyst" },
    officer: { name: "Insp. R. Kumar", role: "Field Officer" },
    admin:   { name: "Super Admin S. Kumar", role: "System Administrator" },
  }[role] || { name: "Officer in Charge", role: "Departmental Admin" };

  const handlePrint    = () => window.print();
  const handleShare    = () => { const url = `${window.location.origin}/reports/secure-view/${report?.id}`; navigator.clipboard.writeText(url).then(() => alert(`Secure link copied: ${url}`)); };
  const handleExportCSV   = () => downloadReportFile(report, "csv", officerInfo);
  const handleExportExcel = () => downloadReportFile(report, "excel", officerInfo);
  const handleExportPDF   = () => downloadReportFile(report, "pdf", officerInfo);

  if (!report) {
    return (
      <div className="bg-white border border-[#E7ECF3] rounded-[20px] shadow-sm flex flex-col items-center justify-center text-[#94A3B8] min-h-[500px]">
        <div className="w-16 h-16 rounded-[20px] bg-[#F8F9FB] flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-[#CBD5E1]" />
        </div>
        <p className="text-sm font-black text-[#0B1F4D] uppercase tracking-wider">{t('hotspots.selectZoneTitle', 'No Report Selected')}</p>
        <p className="text-xs text-[#64748B] mt-1 font-semibold">{t('hotspots.selectZoneDesc', 'Select a report from the library to preview it here.')}</p>
      </div>
    );
  }

  const recommendations = [
    { title: "Increase Patrol Presence", desc: "Property crimes increased 18% in Tech Corridor; increased patrol presence recommended.", priority: "High" },
    { title: "Transit Node Monitoring", desc: "Narcotics-related arrests show strong correlation with international-transit nodes.", priority: "Medium" },
    { title: "Festival Season Preparedness", desc: "AI model predicts 12% increase in incidents in the upcoming festival period.", priority: "High" },
  ];

  const priorityStyle = { High: "bg-red-50 text-red-700 border-red-200", Medium: "bg-[#C79A2B]/10 text-[#B45309] border-[#C79A2B]/30", Low: "bg-emerald-50 text-emerald-700 border-emerald-200" };

  return (
    <div className="bg-white border border-[#E7ECF3] rounded-[20px] shadow-sm flex flex-col overflow-hidden">

      {/* Preview Header */}
      <div className="p-4 bg-[#F8F9FB] border-b border-[#E7ECF3] flex items-center justify-between flex-wrap gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#0B1F4D] flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-[#C79A2B]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-[#0B1F4D] uppercase tracking-wider truncate">{report.title}</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 uppercase tracking-wider">{t('reports.classification', 'CONFIDENTIAL')}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { label: t('district.print', 'Print'),   icon: Printer, handler: handlePrint },
            { label: t('network.mappedLinks', 'Share'),   icon: Share2,  handler: handleShare },
            { label: "CSV",     icon: Download, handler: handleExportCSV },
            { label: "Excel",   icon: Download, handler: handleExportExcel },
          ].map(({ label, icon: Icon, handler }) => (
            <button key={label} onClick={handler} className="flex items-center gap-1.5 h-7 px-2.5 bg-white hover:bg-[#F1F5F9] border border-[#E7ECF3] text-[#64748B] hover:text-[#0B1F4D] rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer">
              <Icon className="w-3 h-3" />{label}
            </button>
          ))}
          <button onClick={handleExportPDF} className="flex items-center gap-1.5 h-7 px-2.5 bg-[#0B1F4D] hover:bg-[#0B1F4D]/90 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer">
            <Download className="w-3 h-3 text-[#C79A2B]" /> {t('reports.exportPDF', 'Export PDF')}
          </button>
          {onClose && (
            <button onClick={onClose} className="p-1.5 text-[#94A3B8] hover:text-[#0B1F4D] hover:bg-[#E7ECF3] rounded-lg transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Report Document */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#F8F9FB]">

        {/* Metadata Card */}
        <div className="bg-white border border-[#E7ECF3] rounded-[16px] p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#0B1F4D]" />
              <div>
                <p className="text-xs font-black text-[#0B1F4D] uppercase tracking-widest">Karnataka Police Department</p>
                <p className="text-[10px] text-[#94A3B8] uppercase tracking-widest">{t('nav.intelligencePlatform', 'Intelligence Platform')}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-[#0B1F4D]">{report.id}</p>
              <p className="text-[10px] text-[#94A3B8] font-mono">{report.generated}</p>
            </div>
          </div>

          <h1 className="text-base font-black text-[#0B1F4D] uppercase tracking-wide leading-snug mb-4">{report.title}</h1>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: t('common.district', 'District'),    val: report.district },
              { label: t('reports.reportingOfficer', 'Officer'),     val: officerInfo.name },
              { label: t('network.allRoles', 'Role'),        val: officerInfo.role },
              { label: t('reports.generatedOn', 'Generated'),   val: `${report.generated} 09:30` },
              { label: t('reports.classification', 'Classification'), val: "CONFIDENTIAL", highlight: true },
              { label: t('common.status', 'Version'),     val: "v1.0" },
            ].map(({ label, val, highlight }) => (
              <div key={label}>
                <span className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-0.5">{label}</span>
                <span className={`text-xs font-black ${highlight ? "text-red-600" : "text-[#0B1F4D]"} font-mono`}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-[#0B1F4D]/5 border border-[#0B1F4D]/10 rounded-[16px] p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse" />
            <h3 className="text-xs font-black text-[#0B1F4D] uppercase tracking-wider">{t('reports.executiveSummary', 'Executive Summary')}</h3>
          </div>
          <p className="text-sm text-[#334155] leading-relaxed">
            This report presents a comprehensive analysis of crime data for <strong className="text-[#0B1F4D]">{report.district}</strong> for the reporting period.
            The analysis integrates AI-driven risk scoring, historical trend modeling, and geospatial hotspot detection to provide actionable intelligence
            for law enforcement decision-making.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="bg-white border border-[#E7ECF3] rounded-[16px] p-5 shadow-sm">
          <h3 className="text-xs font-black text-[#0B1F4D] uppercase tracking-wider mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#C79A2B]" /> {t('district.stationPerformance', 'Key Metrics')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: AlertTriangle, label: t('hotspots.incidentCount', 'Total Incidents'), val: "1,248",  valColor: "text-[#0B1F4D]",   bg: "bg-[#F8F9FB]" },
              { icon: TrendingUp,    label: t('dashboard.clearanceRate', 'Clearance Rate'),  val: "+12%",   valColor: "text-emerald-600",  bg: "bg-emerald-50/50" },
              { icon: Brain,         label: t('district.aiRiskScore', 'AI Risk Score'),   val: "84",     valColor: "text-red-600",      bg: "bg-red-50/50" },
              { icon: Target,        label: t('analytics.forecastConfidence', 'AI Confidence'),   val: "91%",    valColor: "text-blue-600",     bg: "bg-blue-50/50" },
            ].map(({ icon: Icon, label, val, valColor, bg }) => (
              <div key={label} className={`${bg} border border-[#E7ECF3] rounded-xl p-3 text-center`}>
                <Icon className="w-4 h-4 text-[#64748B] mx-auto mb-1.5" />
                <p className={`text-2xl font-black font-mono ${valColor}`}>{val}</p>
                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>


        {/* Recommendations */}
        <div className="bg-white border border-[#E7ECF3] rounded-[16px] p-5 shadow-sm">
          <h3 className="text-xs font-black text-[#0B1F4D] uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#C79A2B]" /> {t('hotspots.strategicRecommendations', 'Key Findings & Recommendations')}
          </h3>
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex gap-3 p-3 bg-[#F8F9FB] border border-[#E7ECF3] rounded-xl">
                <div className="w-7 h-7 rounded-xl bg-[#0B1F4D] flex items-center justify-center shrink-0">
                  <span className="text-xs font-black text-[#C79A2B]">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-black text-[#0B1F4D]">{rec.title}</p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border uppercase tracking-wider ${priorityStyle[rec.priority]}`}>{rec.priority}</span>
                  </div>
                  <p className="text-xs text-[#64748B] leading-relaxed">{rec.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
