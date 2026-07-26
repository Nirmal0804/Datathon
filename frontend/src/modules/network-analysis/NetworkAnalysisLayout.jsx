import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GraphCanvas from './components/GraphCanvas';
import NodeInfoPanel from './components/NodeInfoPanel';
import {
  Users, Share2, AlertTriangle, Network, ShieldAlert,
  Compass, Brain, Search, Filter, BarChart2, TrendingUp,
  TrendingDown, X, Activity, Link2, ChevronDown
} from 'lucide-react';

// ─── DATA ────────────────────────────────────────────────────────────────────

const INITIAL_NODES = [
  { id: 'Ramesh Kumar',  type: 'Accused', label: 'Ramesh Kumar',  risk: 'Critical', x: 150, y: 120, cases: 12, arrests: 6, district: 'Bengaluru City',    station: 'Cubbon Park PS' },
  { id: 'Suresh Gowda',  type: 'Accused', label: 'Suresh Gowda',  risk: 'Critical', x: 260, y: 120, cases: 9,  arrests: 5, district: 'Mysuru',             station: 'Devaraja PS' },
  { id: 'Anand Shekar',  type: 'Accused', label: 'Anand Shekar',  risk: 'High',     x: 100, y: 220, cases: 7,  arrests: 2, district: 'Bengaluru City',    station: 'Indiranagar PS' },
  { id: 'Mohammad Ali',  type: 'Accused', label: 'Mohammad Ali',  risk: 'Medium',   x: 380, y: 160, cases: 6,  arrests: 4, district: 'Hubballi-Dharwad', station: 'Gokul Road PS' },
  { id: 'Priya Nair',    type: 'Accused', label: 'Priya Nair',    risk: 'Low',      x: 70,  y: 80,  cases: 4,  arrests: 1, district: 'Bengaluru City',    station: 'Whitefield PS' },
  { id: 'Vikram Singh',  type: 'Accused', label: 'Vikram Singh',  risk: 'Low',      x: 420, y: 260, cases: 3,  arrests: 2, district: 'Hubballi-Dharwad', station: 'Vidyanagar PS' },
  { id: 'FIR-2026-1022', type: 'Case',   label: 'FIR-2026-1022', category: 'Theft',   date: '2026-07-22', officer: 'Inspector Patil',      x: 200, y: 60  },
  { id: 'FIR-2026-0810', type: 'Case',   label: 'FIR-2026-0810', category: 'Assault',  date: '2026-05-14', officer: 'Sub-Inspector Gowda', x: 200, y: 190 },
  { id: 'FIR-2026-1011', type: 'Case',   label: 'FIR-2026-1011', category: 'Drug',     date: '2026-07-20', officer: 'Inspector Patil',      x: 320, y: 80  },
  { id: 'FIR-2026-0985', type: 'Case',   label: 'FIR-2026-0985', category: 'Cyber',    date: '2026-07-18', officer: 'Sub-Inspector Rao',   x: 50,  y: 170 },
  { id: 'Cubbon Park PS',   type: 'Police Station', label: 'Cubbon Park PS',   district: 'Bengaluru City', x: 110, y: 30  },
  { id: 'Devaraja PS',      type: 'Police Station', label: 'Devaraja PS',      district: 'Mysuru',         x: 310, y: 180 },
  { id: 'Indiranagar PS',   type: 'Police Station', label: 'Indiranagar PS',   district: 'Bengaluru City', x: 160, y: 270 },
  { id: 'Bengaluru City',   type: 'District',       label: 'Bengaluru City',   x: 50,  y: 300 },
  { id: 'Mysuru',           type: 'District',       label: 'Mysuru',           x: 320, y: 280 },
  { id: 'Theft',            type: 'Crime Category', label: 'Theft',            x: 250, y: 260 },
  { id: 'Drug',             type: 'Crime Category', label: 'Drug',             x: 370, y: 50  },
];

const INITIAL_EDGES = [
  { source: 'Ramesh Kumar',  target: 'FIR-2026-1022',  label: 'Appeared in Same FIR' },
  { source: 'Ramesh Kumar',  target: 'FIR-2026-0810',  label: 'Appeared in Same FIR' },
  { source: 'Suresh Gowda',  target: 'FIR-2026-0810',  label: 'Appeared in Same FIR' },
  { source: 'Suresh Gowda',  target: 'FIR-2026-1011',  label: 'Appeared in Same FIR' },
  { source: 'Anand Shekar',  target: 'FIR-2026-0985',  label: 'Appeared in Same FIR' },
  { source: 'Ramesh Kumar',  target: 'Suresh Gowda',   label: 'Repeat Co-Offender' },
  { source: 'Ramesh Kumar',  target: 'Cubbon Park PS', label: 'Same Police Station' },
  { source: 'Suresh Gowda',  target: 'Devaraja PS',    label: 'Same Police Station' },
  { source: 'Anand Shekar',  target: 'Indiranagar PS', label: 'Same Police Station' },
  { source: 'Cubbon Park PS',  target: 'Bengaluru City', label: 'Same District' },
  { source: 'Indiranagar PS',  target: 'Bengaluru City', label: 'Same District' },
  { source: 'Devaraja PS',     target: 'Mysuru',          label: 'Same District' },
  { source: 'Ramesh Kumar',  target: 'Theft', label: 'Shared Crime Category' },
  { source: 'Suresh Gowda',  target: 'Drug',  label: 'Shared Crime Category' },
];

// ─── KPI DATA ─────────────────────────────────────────────────────────────────

const KPI_DATA = [
  { label: 'Total Nodes',      value: '27', icon: Network,    color: '#0B1F4D', bg: 'bg-[#0B1F4D]/10', trend: '+3',   up: true  },
  { label: 'Relationships',    value: '42', icon: Share2,     color: '#C79A2B', bg: 'bg-[#C79A2B]/10', trend: '+8',   up: true  },
  { label: 'Groups Identified',value: '3',  icon: Users,      color: '#7C3AED', bg: 'bg-violet-500/10',trend: 'Stable',up: null },
  { label: 'High-Risk Networks',value: '2', icon: ShieldAlert,color: '#EF4444', bg: 'bg-rose-500/10',  trend: '+1',   up: false },
  { label: 'Co-Offenders',     value: '4',  icon: AlertTriangle,color:'#F97316',bg: 'bg-orange-500/10',trend: '+2',  up: false },
  { label: 'Cross-District',   value: '2',  icon: Compass,    color: '#10B981', bg: 'bg-emerald-500/10',trend: 'Stable',up: null},
];

// ─── AI OBSERVATIONS ──────────────────────────────────────────────────────────

const AI_OBSERVATIONS = [
  { id: 1, priority: 'High',   text: 'High-frequency cooperation identified between Ramesh Kumar and Suresh Gowda across 3 shared FIR cases.' },
  { id: 2, priority: 'Medium', text: 'Emerging cyber fraud clusters localized in Bengaluru City sector, specifically Tech Corridors.' },
  { id: 3, priority: 'Low',    text: 'Territorial transit warnings flagged between Mysuru and Mandya checking divisions.' },
];

// ─── NETWORK STATS ────────────────────────────────────────────────────────────

const NETWORK_STATS = [
  { label: 'Avg Links / Node',   value: '1.56', bar: 52, color: '#0B1F4D' },
  { label: 'Largest Cluster',    value: '6 nodes', bar: 60, color: '#C79A2B' },
  { label: 'Isolated Nodes',     value: '3',     bar: 11, color: '#EF4444' },
  { label: 'Active Syndicates',  value: '2',     bar: 40, color: '#7C3AED' },
];

// ─── PRIORITY BADGE ───────────────────────────────────────────────────────────

function PriorityBadge({ priority }) {
  const map = {
    High:   'bg-rose-50 text-rose-600 border-rose-200',
    Medium: 'bg-amber-50 text-amber-600 border-amber-200',
    Low:    'bg-emerald-50 text-emerald-600 border-emerald-200',
  };
  return (
    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${map[priority] || map.Low}`}>
      {priority}
    </span>
  );
}

// ─── SELECT DROPDOWN ──────────────────────────────────────────────────────────

function FilterSelect({ value, onChange, children }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none bg-[#F8F9FB] border border-[#E7ECF3] hover:border-[#1A2F63]/30 rounded-[10px] py-2 pl-3 pr-8 text-xs font-semibold text-[#0B1F4D] focus:outline-none transition-all cursor-pointer shadow-sm"
      >
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-[#64748B] pointer-events-none" />
    </div>
  );
}

// ─── MAIN LAYOUT ──────────────────────────────────────────────────────────────

export default function NetworkAnalysisLayout() {
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [relTypeFilter, setRelTypeFilter] = useState('All');

  const filteredNodes = useMemo(() => {
    return nodes.filter(n => {
      if (districtFilter !== 'All' && n.district && n.district !== districtFilter) return false;
      if (categoryFilter !== 'All' && n.category && n.category !== categoryFilter) return false;
      if (riskFilter !== 'All' && n.risk && n.risk !== riskFilter) return false;
      return true;
    });
  }, [nodes, districtFilter, categoryFilter, riskFilter]);

  const activeNode = useMemo(() => {
    if (!selectedNode) return null;
    return nodes.find(n => n.id === selectedNode.id) || selectedNode;
  }, [selectedNode, nodes]);

  const handleNodeDrag = (nodeId, newX, newY) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, x: newX, y: newY } : n));
  };

  const resetFilters = () => {
    setDistrictFilter('All');
    setCategoryFilter('All');
    setRiskFilter('All');
    setRelTypeFilter('All');
    setSearchQuery('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full space-y-6 pb-12 px-6 sm:px-8"
    >

      {/* ── 1. HERO SECTION ─────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E7ECF3] rounded-[22px] p-5 sm:p-6 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#0B1F4D] rounded-[14px] flex items-center justify-center shrink-0 shadow-sm">
            <Network className="w-6 h-6 text-[#C79A2B]" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl sm:text-2xl font-black text-[#0B1F4D] tracking-tight">Criminal Network Analysis</h1>
              <div className="px-3 py-1 rounded-full bg-[#F1F5F9] border border-[#E7ECF3] flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-[#0B1F4D]" />
                <span className="text-[11px] font-bold text-[#0B1F4D] uppercase tracking-widest whitespace-nowrap">Live Graph</span>
              </div>
            </div>
            <p className="text-xs font-semibold text-[#64748B]">Uncover syndicate connections, repeat co-offenders, and cross-district crime networks.</p>
          </div>
        </div>

        {/* Hero Search */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search offender, FIR, district..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F8F9FB] border border-[#E7ECF3] rounded-[12px] text-xs font-semibold text-[#0B1F4D] placeholder-[#94A3B8] focus:outline-none focus:border-[#1A2F63]/40 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* ── 2. KPI ROW ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
        {KPI_DATA.map((kpi, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
            className="bg-white border border-[#E7ECF3] rounded-[20px] p-4 shadow-sm flex flex-col gap-3 hover:border-[#1A2F63]/30 transition-all group"
          >
            <div className="flex justify-between items-start">
              <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center ${kpi.bg} group-hover:scale-110 transition-transform`}>
                <kpi.icon className="w-4.5 h-4.5" style={{ color: kpi.color }} />
              </div>
              {kpi.up !== null && (
                <span className={`text-[9px] font-bold flex items-center gap-0.5 ${kpi.up ? 'text-rose-500' : 'text-emerald-600'}`}>
                  {kpi.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {kpi.trend}
                </span>
              )}
              {kpi.up === null && (
                <span className="text-[9px] font-bold text-slate-400">{kpi.trend}</span>
              )}
            </div>
            <div>
              <div className="text-2xl font-black text-[#0B1F4D] tracking-tight leading-none">{kpi.value}</div>
              <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mt-1">{kpi.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── 3. FILTER TOOLBAR ───────────────────────────────────────────── */}
      <div className="bg-white border border-[#E7ECF3] rounded-[18px] px-5 py-3.5 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-[11px] font-bold text-[#0B1F4D] uppercase tracking-widest shrink-0">
          <Filter className="w-3.5 h-3.5 text-[#C79A2B]" />
          Filters
        </div>
        <div className="w-px h-5 bg-[#E7ECF3] shrink-0" />

        <FilterSelect value={districtFilter} onChange={setDistrictFilter}>
          <option value="All">District ▾</option>
          <option value="Bengaluru City">Bengaluru City</option>
          <option value="Mysuru">Mysuru</option>
          <option value="Hubballi-Dharwad">Hubballi-Dharwad</option>
        </FilterSelect>

        <FilterSelect value={categoryFilter} onChange={setCategoryFilter}>
          <option value="All">Crime Category ▾</option>
          <option value="Theft">Theft</option>
          <option value="Drug">Drug</option>
          <option value="Cyber">Cyber</option>
          <option value="Assault">Assault</option>
        </FilterSelect>

        <FilterSelect value={riskFilter} onChange={setRiskFilter}>
          <option value="All">Risk Level ▾</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </FilterSelect>

        <FilterSelect value={relTypeFilter} onChange={setRelTypeFilter}>
          <option value="All">Relationship Type ▾</option>
          <option value="co-offender">Co-Offender</option>
          <option value="same-case">Same Case</option>
          <option value="same-station">Same Station</option>
          <option value="cross-district">Cross-District</option>
        </FilterSelect>

        <button
          onClick={resetFilters}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-[#F8F9FB] border border-[#E7ECF3] rounded-[10px] text-[11px] font-bold text-[#64748B] hover:text-[#0B1F4D] hover:border-[#1A2F63]/30 transition-all cursor-pointer"
        >
          <X className="w-3 h-3" />
          Reset Filters
        </button>
      </div>

      {/* ── 4. MAIN WORKSPACE: 70% / 30% ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">

        {/* LEFT — Criminal Relationship Canvas (70%) */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-5 shadow-sm flex flex-col gap-4">
            {/* Canvas Header */}
            <div className="flex justify-between items-center pb-4 border-b border-[#F1F5F9]">
              <div>
                <h2 className="text-sm font-black text-[#0B1F4D] uppercase tracking-wider">Criminal Relationship Canvas</h2>
                <p className="text-[11px] font-semibold text-[#64748B] mt-0.5">Drag nodes · Click to inspect · Ctrl+scroll to zoom</p>
              </div>
              <div className="flex items-center gap-2 bg-[#F8F9FB] border border-[#E7ECF3] rounded-[10px] px-3 py-1.5">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-[#0B1F4D] uppercase tracking-widest">Sociocentric Network Active</span>
              </div>
            </div>

            {/* Graph Canvas — fixed height, scroll-isolated */}
            <GraphCanvas
              nodes={filteredNodes}
              edges={INITIAL_EDGES}
              selectedNode={activeNode}
              onSelectNode={setSelectedNode}
              searchQuery={searchQuery}
              onNodeDrag={handleNodeDrag}
            />

            {/* Node Legend */}
            <div className="flex flex-wrap gap-4 pt-4 border-t border-[#F1F5F9]">
              {[
                { label: 'Critical Accused', color: '#EF4444' },
                { label: 'High Risk',        color: '#F97316' },
                { label: 'Medium Risk',      color: '#F59E0B' },
                { label: 'Low Risk',         color: '#10B981' },
                { label: 'Case / FIR',       color: '#818CF8' },
                { label: 'Police Station',   color: '#60A5FA' },
                { label: 'District',         color: '#A78BFA' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: item.color, background: item.color + '20' }} />
                  <span className="text-[10px] font-semibold text-[#64748B]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — Network Intelligence Panel (30%) */}
        <div className="lg:col-span-3 flex flex-col gap-5">

          {/* Node Details (when selected) */}
          <AnimatePresence mode="wait">
            {activeNode && (
              <motion.div
                key={activeNode.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <NodeInfoPanel
                  node={activeNode}
                  onClose={() => setSelectedNode(null)}
                  onSelectNode={setSelectedNode}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Card 1 — Network Overview */}
          <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-5 shadow-sm">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#F1F5F9]">
              <div className="w-7 h-7 bg-[#0B1F4D]/10 rounded-[8px] flex items-center justify-center">
                <Link2 className="w-3.5 h-3.5 text-[#C79A2B]" />
              </div>
              <h3 className="text-xs font-black text-[#0B1F4D] uppercase tracking-wider">Network Overview</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Most Connected Offender', value: 'Ramesh Kumar (8 links)', highlight: 'text-rose-600' },
                { label: 'Largest Syndicate',       value: 'Bengaluru-Mysuru Axis',  highlight: 'text-[#0B1F4D]' },
                { label: 'Highest Risk Cluster',    value: 'Bengaluru South',         highlight: 'text-rose-500' },
                { label: 'Cross-District Network',  value: 'Ramesh / Suresh Axis',    highlight: 'text-emerald-600' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center text-xs py-2 border-b border-[#F8F9FB] last:border-0">
                  <span className="font-semibold text-[#64748B]">{item.label}</span>
                  <span className={`font-bold text-right max-w-[55%] ${item.highlight}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2 — AI Observations */}
          <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-5 shadow-sm">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#F1F5F9]">
              <div className="w-7 h-7 bg-violet-500/10 rounded-[8px] flex items-center justify-center">
                <Brain className="w-3.5 h-3.5 text-violet-600" />
              </div>
              <h3 className="text-xs font-black text-[#0B1F4D] uppercase tracking-wider">AI Observations</h3>
            </div>
            <div className="space-y-3">
              {AI_OBSERVATIONS.map(obs => (
                <div key={obs.id} className="flex gap-3 p-3 bg-[#F8F9FB] border border-[#E7ECF3] rounded-[12px]">
                  <PriorityBadge priority={obs.priority} />
                  <p className="text-[11px] font-semibold text-[#374151] leading-relaxed">{obs.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3 — Network Statistics */}
          <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-5 shadow-sm">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#F1F5F9]">
              <div className="w-7 h-7 bg-[#C79A2B]/10 rounded-[8px] flex items-center justify-center">
                <BarChart2 className="w-3.5 h-3.5 text-[#C79A2B]" />
              </div>
              <h3 className="text-xs font-black text-[#0B1F4D] uppercase tracking-wider">Network Statistics</h3>
            </div>
            <div className="space-y-4">
              {NETWORK_STATS.map((stat, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[11px] font-semibold text-[#64748B]">{stat.label}</span>
                    <span className="text-[11px] font-black text-[#0B1F4D]">{stat.value}</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.bar}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: stat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </motion.div>
  );
}
