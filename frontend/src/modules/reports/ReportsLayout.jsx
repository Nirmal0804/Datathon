import React, { useState } from "react";
import ReportList, { INITIAL_REPORTS, downloadReportFile } from "./components/ReportList";
import ReportPreview from "./components/ReportPreview";
import { useToast } from "../../components/ui/Toast";
import { useDateTimeFormatter } from "../../utils/dateTime";
import { useTranslation } from "../../i18n";
import {
  Plus, History, FileText, BarChart2, Clock, Activity,
  Search, Filter, Calendar, Download, ChevronDown,
  CheckCircle2, Loader2, AlertCircle, Timer, Zap,
  TrendingUp, HardDrive, X, RotateCcw, FileOutput, Layers,
  CheckCircle
} from "lucide-react";

const ACTIVITY_LOG = [
  { action: "Generated", report: "Statewide Monthly Crime Summary", by: "Analyst J. Doe", time: "09:14", status: "success" },
  { action: "Exported PDF", report: "Bengaluru South District Intelligence", by: "Insp. R. Kumar", time: "09:25", status: "success" },
  { action: "Shared", report: "Q3 Hotspot Migration Analysis", by: "Analyst S. Patil", time: "10:42", status: "success" },
  { action: "Failed", report: "Cyber Syndicate Network Map", by: "System", time: "11:07", status: "error" },
  { action: "Exported Excel", report: "Festival Season Risk Model", by: "DCP M. Gowda", time: "13:15", status: "success" },
];

function StatusPill({ status }) {
  const map = {
    Ready:      { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
    Processing: { bg: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500 animate-pulse" },
    Failed:     { bg: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
    Scheduled:  { bg: "bg-[#C79A2B]/10 text-[#B45309] border-[#C79A2B]/30", dot: "bg-[#C79A2B]" },
    Generating: { bg: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500 animate-pulse" },
  };
  const s = map[status] || map.Ready;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${s.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

function GenerateModal({ onClose, onGenerate }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    type: "Crime Summary", district: "Bengaluru City",
    dateRange: "This Month", classification: "Confidential",
    format: "PDF", aiInsights: true, includeMaps: true, includeCharts: true
  });
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-[20px] shadow-2xl w-full max-w-lg border border-[#E7ECF3]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-[#E7ECF3] bg-[#F8F9FB] rounded-t-[20px]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0B1F4D] rounded-xl flex items-center justify-center">
              <FileOutput className="w-4 h-4 text-[#C79A2B]" />
            </div>
            <div>
              <h2 className="text-sm font-black text-[#0B1F4D] uppercase tracking-wider">{t('reports.generateReport', 'Generate New Report')}</h2>
              <p className="text-xs text-[#64748B] font-semibold">{t('reports.subtitle', 'Configure intelligence report parameters')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#E7ECF3] text-[#64748B] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">{t('reports.reportType', 'Report Type')}</label>
              <select value={form.type} onChange={e => set("type", e.target.value)} className="w-full appearance-none bg-[#F8F9FB] border border-[#E7ECF3] rounded-xl py-2 px-3 text-xs font-bold text-[#0B1F4D] focus:outline-none cursor-pointer">
                {["Crime Summary","District Report","Hotspot Analysis","Network Analysis","Predictive Risk"].map(tItem => <option key={tItem}>{tItem}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">{t('common.district', 'District')}</label>
              <select value={form.district} onChange={e => set("district", e.target.value)} className="w-full appearance-none bg-[#F8F9FB] border border-[#E7ECF3] rounded-xl py-2 px-3 text-xs font-bold text-[#0B1F4D] focus:outline-none cursor-pointer">
                {["Bengaluru City","Mysuru","Hubballi-Dharwad","Mangaluru","Belagavi","All Karnataka"].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">{t('reports.dateRange', 'Date Range')}</label>
              <select value={form.dateRange} onChange={e => set("dateRange", e.target.value)} className="w-full appearance-none bg-[#F8F9FB] border border-[#E7ECF3] rounded-xl py-2 px-3 text-xs font-bold text-[#0B1F4D] focus:outline-none cursor-pointer">
                {["This Month","Last 30 Days","Last 90 Days","This Year","Custom"].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">{t('reports.classification', 'Classification')}</label>
              <select value={form.classification} onChange={e => set("classification", e.target.value)} className="w-full appearance-none bg-[#F8F9FB] border border-[#E7ECF3] rounded-xl py-2 px-3 text-xs font-bold text-[#0B1F4D] focus:outline-none cursor-pointer">
                {["Confidential","Internal","Restricted","Top Secret"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">{t('reports.exportPDF', 'Export Format')}</label>
            <div className="flex gap-2">
              {["PDF","Excel","CSV"].map(fmt => (
                <button key={fmt} onClick={() => set("format", fmt)} className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${form.format === fmt ? "bg-[#0B1F4D] text-white border-[#0B1F4D]" : "bg-[#F8F9FB] text-[#64748B] border-[#E7ECF3] hover:border-[#0B1F4D]/30"}`}>{fmt}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[{label: t('district.aiGeneratedInsights', 'AI Insights'),key:"aiInsights"},{label: t('nav.crimeMap', 'Maps'),key:"includeMaps"},{label: t('nav.crimeAnalytics', 'Charts'),key:"includeCharts"}].map(({label,key}) => (
              <button key={key} onClick={() => set(key, !form[key])} className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${form[key] ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-[#F8F9FB] text-[#94A3B8] border-[#E7ECF3]"}`}>
                <span className={`w-2 h-2 rounded-full ${form[key] ? "bg-emerald-500" : "bg-[#94A3B8]"}`} />
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3 p-5 pt-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#E7ECF3] text-xs font-bold text-[#64748B] uppercase tracking-wider hover:bg-[#F8F9FB] transition-colors">{t('common.cancel', 'Cancel')}</button>
          <button onClick={() => { onGenerate(form); onClose(); }} className="flex-1 py-2.5 rounded-xl bg-[#0B1F4D] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#0B1F4D]/90 transition-colors flex items-center justify-center gap-2">
            <Zap className="w-3.5 h-3.5 text-[#C79A2B]" /> {t('reports.generateReport', 'Generate Report')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReportsLayout({ role = "analyst" }) {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const { formatDate } = useDateTimeFormatter();
  const [reportsList, setReportsList]     = useState(INITIAL_REPORTS);
  const [selectedReport, setSelectedReport] = useState(INITIAL_REPORTS[0]);
  const [showModal, setShowModal]         = useState(false);
  const [showHistory, setShowHistory]     = useState(false);
  const [searchQuery, setSearchQuery]     = useState("");
  const [filterType, setFilterType]       = useState("All");
  const [filterStatus, setFilterStatus]   = useState("All");

  const officerInfo = {
    analyst: { name: "Inspector Patil", role: "Intelligence Analyst" },
    officer: { name: "Insp. R. Kumar", role: "Field Officer" },
    admin:   { name: "Super Admin S. Kumar", role: "System Administrator" },
  }[role] || { name: "Officer in Charge", role: "Departmental Admin" };

  const handleGenerateReport = (form = {}) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const newId = `RPT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReport = { id: newId, title: `Ad-hoc ${form.type || "Intelligence"} Briefing - ${newId}`, type: form.type || "Crime Summary", district: form.district || "Bengaluru City", generated: todayStr, size: "1.4 MB", status: "Ready", pages: 18 };
    setReportsList([newReport, ...reportsList]);
    setSelectedReport(newReport);
    addToast({ title: "Report Compiled Successfully", message: `${newId} generated for ${newReport.district} by ${officerInfo.name}.`, type: "success" });
  };

  const kpis = {
    total: reportsList.length,
    ready: reportsList.filter(r => r.status === "Ready").length,
    processing: reportsList.filter(r => r.status === "Processing").length,
    storage: "18.4 MB",
  };

  const filtered = reportsList.filter(r => {
    const q = searchQuery.toLowerCase();
    const matchSearch  = !q || r.title.toLowerCase().includes(q) || r.type.toLowerCase().includes(q) || r.district.toLowerCase().includes(q);
    const matchType    = filterType   === "All" || r.type   === filterType;
    const matchStatus  = filterStatus === "All" || r.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const iconMap = { "Crime Summary": FileText, "District Report": BarChart2, "Hotspot Analysis": Layers, "Network Analysis": Activity, "Predictive Risk": TrendingUp };

  return (
    <div className="w-full space-y-6 pb-10 px-6 sm:px-8">

      {/* Hero */}
      <div className="bg-white border border-[#E7ECF3] rounded-[22px] p-5 sm:p-6 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
          <div className="w-12 h-12 bg-[#0B1F4D] rounded-[14px] flex items-center justify-center shrink-0 shadow-sm">
            <FileText className="w-6 h-6 text-[#C79A2B]" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl sm:text-2xl font-black text-[#0B1F4D] tracking-tight">{t('nav.reports', 'Reports Center')}</h1>
              <div className="px-3 py-1 rounded-full bg-[#F1F5F9] border border-[#E7ECF3]">
                <span className="text-[11px] font-bold text-[#0B1F4D] uppercase tracking-widest whitespace-nowrap">{t('admin.active', 'AI Active')}</span>
              </div>
            </div>
            <p className="text-xs font-semibold text-[#64748B]">{t('reports.subtitle', 'Generate, preview, and export intelligence reports.')}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-semibold bg-[#F8F9FB] border border-[#E7ECF3] px-3 py-2 rounded-[12px]">
            <Clock className="w-3.5 h-3.5" />
            <span>{t('common.date', 'Last updated')}: {formatDate(new Date())}</span>
          </div>
          <button onClick={() => setShowHistory(!showHistory)} className={`flex items-center gap-2 px-4 py-2 rounded-[12px] text-xs font-bold uppercase tracking-wider border transition-colors cursor-pointer ${showHistory ? "bg-[#0B1F4D] text-white border-[#0B1F4D]" : "bg-[#F8F9FB] text-[#0B1F4D] border-[#E7ECF3] hover:bg-[#F1F5F9]"}`}>
            <History className="w-3.5 h-3.5" /> {t('admin.auditLogs', 'Activity Log')}
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#0B1F4D] hover:bg-[#0B1F4D]/90 text-white rounded-[12px] text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer">
            <Plus className="w-3.5 h-3.5 text-[#C79A2B]" /> {t('reports.generateReport', 'Generate New Report')}
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { icon: FileText,    label: t('reports.totalReports', 'Total Reports'),  val: kpis.total,      badge: "All time",    badgeColor: "bg-[#0B1F4D]/5 text-[#0B1F4D]",  valColor: "text-[#0B1F4D]" },
          { icon: CheckCircle2,label: t('reports.readyToExport', 'Ready to Export'),val: kpis.ready,      badge: "Available",   badgeColor: "bg-emerald-50 text-emerald-700",   valColor: "text-emerald-600" },
          { icon: Loader2,     label: t('reports.processing', 'Processing'),     val: kpis.processing, badge: "In progress", badgeColor: "bg-blue-50 text-blue-700",         valColor: "text-blue-600" },
          { icon: HardDrive,   label: t('admin.diskUsage', 'Storage Used'),   val: kpis.storage,    badge: "Secure vault",badgeColor: "bg-[#C79A2B]/10 text-[#B45309]",  valColor: "text-[#0B1F4D]" },
        ].map((k, i) => {
          const Icon = k.icon;
          return (
            <div key={i} className="bg-white border border-[#E7ECF3] rounded-[20px] p-5 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl bg-[#F8F9FB] flex items-center justify-center">
                  <Icon className="w-4 h-4 text-[#0B1F4D]" />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${k.badgeColor}`}>{k.badge}</span>
              </div>
              <span className={`text-3xl font-black font-mono ${k.valColor}`}>{k.val}</span>
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider mt-1">{k.label}</span>
            </div>
          );
        })}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-[#E7ECF3] rounded-[16px] p-3 shadow-sm flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t('dashboard.searchPlaceholder', 'Search reports...')} className="w-full pl-9 pr-3 h-8 bg-[#F8F9FB] border border-[#E7ECF3] rounded-lg text-xs font-bold text-[#0B1F4D] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#0B1F4D]/20" />
        </div>
        <div className="relative">
          <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#94A3B8]" />
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="h-8 pl-7 pr-7 bg-[#F8F9FB] border border-[#E7ECF3] rounded-lg text-xs font-bold text-[#0B1F4D] focus:outline-none cursor-pointer appearance-none">
            <option value="All">{t('dashboard.allCategories', 'All Types')}</option>
            {["Crime Summary","District Report","Hotspot Analysis","Network Analysis","Predictive Risk"].map(t => <option key={t}>{t}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#94A3B8] pointer-events-none" />
        </div>
        <div className="relative">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-8 px-3 pr-7 bg-[#F8F9FB] border border-[#E7ECF3] rounded-lg text-xs font-bold text-[#0B1F4D] focus:outline-none cursor-pointer appearance-none">
            <option value="All">{t('common.status', 'All Status')}</option>
            {["Ready","Processing","Failed","Scheduled"].map(s => <option key={s}>{s}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#94A3B8] pointer-events-none" />
        </div>
        <div className="relative">
          <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#94A3B8]" />
          <select className="h-8 pl-7 pr-7 bg-[#F8F9FB] border border-[#E7ECF3] rounded-lg text-xs font-bold text-[#0B1F4D] focus:outline-none cursor-pointer appearance-none">
            <option>{t('dashboard.monthly', 'This Month')}</option><option>Last 30 Days</option><option>Last 90 Days</option><option>{t('dashboard.yearly', 'This Year')}</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#94A3B8] pointer-events-none" />
        </div>
        <div className="w-px h-5 bg-[#E7ECF3] mx-1" />
        <button onClick={() => { setSearchQuery(""); setFilterType("All"); setFilterStatus("All"); }} className="h-8 px-3 rounded-lg bg-[#F8F9FB] border border-[#E7ECF3] text-xs font-bold text-[#64748B] uppercase tracking-wider hover:bg-[#F1F5F9] flex items-center gap-1.5 transition-colors cursor-pointer">
          <RotateCcw className="w-3 h-3" /> {t('dashboard.clearFilters', 'Reset')}
        </button>
        <button onClick={() => setShowModal(true)} className="h-8 px-3 rounded-lg bg-[#0B1F4D] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#0B1F4D]/90 transition-colors cursor-pointer">
          <Plus className="w-3 h-3 text-[#C79A2B]" /> {t('reports.generateReport', 'Generate')}
        </button>
      </div>

      {/* 40/60 Master-Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* Report Library 5/12 */}
        <div className="lg:col-span-5 bg-white border border-[#E7ECF3] rounded-[20px] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E7ECF3] bg-[#F8F9FB] flex justify-between items-center">
            <div>
              <h2 className="text-sm font-black text-[#0B1F4D] uppercase tracking-wider">Report Library</h2>
              <p className="text-xs font-bold text-[#64748B] mt-0.5">{filtered.length} report{filtered.length !== 1 ? "s" : ""} found</p>
            </div>
            <span className="text-xs font-bold font-mono bg-white border border-[#E7ECF3] text-[#0B1F4D] px-2.5 py-1 rounded-lg uppercase tracking-wider">{reportsList.length} Total</span>
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {filtered.length === 0 && (
              <div className="py-16 text-center">
                <FileText className="w-10 h-10 text-[#94A3B8] mx-auto mb-3" />
                <p className="text-sm font-bold text-[#0B1F4D]">No reports found</p>
                <p className="text-xs text-[#64748B] mt-1">Try adjusting your search or filters</p>
              </div>
            )}
            {filtered.map(report => {
              const Icon = iconMap[report.type] || FileText;
              const isSelected = report.id === selectedReport?.id;
              return (
                <div key={report.id} onClick={() => setSelectedReport(report)} className={`px-5 py-4 cursor-pointer transition-all group relative ${isSelected ? "bg-[#0B1F4D]/5 border-l-4 border-l-[#0B1F4D]" : "hover:bg-[#F8F9FB] border-l-4 border-l-transparent"}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? "bg-[#0B1F4D]" : "bg-[#F1F5F9]"}`}>
                      <Icon className={`w-5 h-5 ${isSelected ? "text-[#C79A2B]" : "text-[#64748B]"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-xs font-black leading-snug ${isSelected ? "text-[#0B1F4D]" : "text-[#0F172A]"}`}>{report.title}</h4>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                        <span className="text-xs font-bold text-[#64748B]">{report.type}</span>
                        <span className="text-[#CBD5E1]">•</span>
                        <span className="text-xs text-[#64748B]">{report.district}</span>
                        <span className="text-[#CBD5E1]">•</span>
                        <span className="text-xs text-[#94A3B8] flex items-center gap-1 font-mono"><Clock className="w-3 h-3" />{report.generated}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <StatusPill status={report.status} />
                          {report.pages && <span className="text-xs text-[#94A3B8]">{report.pages}pp</span>}
                          <span className="text-xs text-[#94A3B8]">{report.size}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={e => { e.stopPropagation(); setSelectedReport(report); }} className="p-1.5 rounded-lg bg-[#F1F5F9] hover:bg-[#0B1F4D] hover:text-white text-[#64748B] transition-colors" title="Preview">
                            <FileText className="w-3 h-3" />
                          </button>
                          <button onClick={e => { e.stopPropagation(); downloadReportFile(report, "pdf"); }} className="p-1.5 rounded-lg bg-[#F1F5F9] hover:bg-[#0B1F4D] hover:text-white text-[#64748B] transition-colors" title="Download PDF">
                            <Download className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Report Preview 7/12 */}
        <div className="lg:col-span-7">
          <ReportPreview report={selectedReport} onClose={() => setSelectedReport(null)} role={role} />
        </div>
      </div>

      {/* Activity Timeline */}
      {showHistory && (
        <div className="bg-white border border-[#E7ECF3] rounded-[20px] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E7ECF3] bg-[#F8F9FB] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#0B1F4D]" />
              <h3 className="text-sm font-black text-[#0B1F4D] uppercase tracking-wider">Recent Activity</h3>
            </div>
            <button onClick={() => setShowHistory(false)} className="p-1.5 rounded-lg hover:bg-[#E7ECF3] text-[#64748B]"><X className="w-3.5 h-3.5" /></button>
          </div>
          <div className="p-5">
            <div className="space-y-0">
              {ACTIVITY_LOG.map((item, idx) => (
                <div key={idx} className="flex gap-4 pb-4 last:pb-0 relative">
                  {idx < ACTIVITY_LOG.length - 1 && <div className="absolute left-[19px] top-8 bottom-0 w-px bg-[#E7ECF3]" />}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 z-10 ${item.status === "success" ? "bg-emerald-50" : "bg-red-50"}`}>
                    {item.status === "success" ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                  </div>
                  <div className="flex-1 min-w-0 pt-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-black text-[#0B1F4D] uppercase tracking-wider">{item.action}</p>
                      <span className="text-xs font-mono text-[#94A3B8] shrink-0">{item.time}</span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-0.5 truncate">{item.report}</p>
                    <p className="text-xs text-[#94A3B8]">by {item.by}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && <GenerateModal onClose={() => setShowModal(false)} onGenerate={handleGenerateReport} />}
    </div>
  );
}
