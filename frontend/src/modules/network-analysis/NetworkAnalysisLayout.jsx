import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GraphCanvas from './components/GraphCanvas';
import NodeInfoPanel from './components/NodeInfoPanel';
import NetworkToolbar from './components/NetworkToolbar';
import { 
  Users, Share2, AlertTriangle, Network, ShieldAlert,
  BarChart, Compass, Brain, Search, Filter 
} from 'lucide-react';

// Central nodes and edges data for criminal network analysis
const INITIAL_NODES = [
  // Accused nodes
  { id: 'Ramesh Kumar', type: 'Accused', label: 'Ramesh Kumar', risk: 'Critical', x: 150, y: 120, cases: 12, arrests: 6, district: 'Bengaluru City', station: 'Cubbon Park PS' },
  { id: 'Suresh Gowda', type: 'Accused', label: 'Suresh Gowda', risk: 'Critical', x: 260, y: 120, cases: 9, arrests: 5, district: 'Mysuru', station: 'Devaraja PS' },
  { id: 'Anand Shekar', type: 'Accused', label: 'Anand Shekar', risk: 'High', x: 100, y: 220, cases: 7, arrests: 2, district: 'Bengaluru City', station: 'Indiranagar PS' },
  { id: 'Mohammad Ali', type: 'Accused', label: 'Mohammad Ali', risk: 'Medium', x: 380, y: 160, cases: 6, arrests: 4, district: 'Hubballi-Dharwad', station: 'Gokul Road PS' },
  { id: 'Priya Nair', type: 'Accused', label: 'Priya Nair', risk: 'Low', x: 70, y: 80, cases: 4, arrests: 1, district: 'Bengaluru City', station: 'Whitefield PS' },
  { id: 'Vikram Singh', type: 'Accused', label: 'Vikram Singh', risk: 'Low', x: 420, y: 260, cases: 3, arrests: 2, district: 'Hubballi-Dharwad', station: 'Vidyanagar PS' },

  // Case nodes
  { id: 'FIR-2026-1022', type: 'Case', label: 'FIR-2026-1022', category: 'Theft', date: '2026-07-22', officer: 'Inspector Patil', x: 200, y: 60 },
  { id: 'FIR-2026-0810', type: 'Case', label: 'FIR-2026-0810', category: 'Assault', date: '2026-05-14', officer: 'Sub-Inspector Gowda', x: 200, y: 190 },
  { id: 'FIR-2026-1011', type: 'Case', label: 'FIR-2026-1011', category: 'Drug', date: '2026-07-20', officer: 'Inspector Patil', x: 320, y: 80 },
  { id: 'FIR-2026-0985', type: 'Case', label: 'FIR-2026-0985', category: 'Cyber', date: '2026-07-18', officer: 'Sub-Inspector Rao', x: 50, y: 170 },

  // Police Station nodes
  { id: 'Cubbon Park PS', type: 'Police Station', label: 'Cubbon Park PS', district: 'Bengaluru City', x: 110, y: 30 },
  { id: 'Devaraja PS', type: 'Police Station', label: 'Devaraja PS', district: 'Mysuru', x: 310, y: 180 },
  { id: 'Indiranagar PS', type: 'Police Station', label: 'Indiranagar PS', district: 'Bengaluru City', x: 160, y: 270 },

  // District nodes
  { id: 'Bengaluru City', type: 'District', label: 'Bengaluru City', x: 50, y: 300 },
  { id: 'Mysuru', type: 'District', label: 'Mysuru', x: 320, y: 280 },

  // Crime Category nodes
  { id: 'Theft', type: 'Crime Category', label: 'Theft', x: 250, y: 260 },
  { id: 'Drug', type: 'Crime Category', label: 'Drug', x: 370, y: 50 }
];

const INITIAL_EDGES = [
  // Links between Accused and Cases
  { source: 'Ramesh Kumar', target: 'FIR-2026-1022', label: 'Appeared in Same FIR' },
  { source: 'Ramesh Kumar', target: 'FIR-2026-0810', label: 'Appeared in Same FIR' },
  { source: 'Suresh Gowda', target: 'FIR-2026-0810', label: 'Appeared in Same FIR' },
  { source: 'Suresh Gowda', target: 'FIR-2026-1011', label: 'Appeared in Same FIR' },
  { source: 'Anand Shekar', target: 'FIR-2026-0985', label: 'Appeared in Same FIR' },

  // Co-offender relationships
  { source: 'Ramesh Kumar', target: 'Suresh Gowda', label: 'Repeat Co-Offender' },

  // Links to Police Stations
  { source: 'Ramesh Kumar', target: 'Cubbon Park PS', label: 'Same Police Station' },
  { source: 'Suresh Gowda', target: 'Devaraja PS', label: 'Same Police Station' },
  { source: 'Anand Shekar', target: 'Indiranagar PS', label: 'Same Police Station' },

  // Links to Districts
  { source: 'Cubbon Park PS', target: 'Bengaluru City', label: 'Same District' },
  { source: 'Indiranagar PS', target: 'Bengaluru City', label: 'Same District' },
  { source: 'Devaraja PS', target: 'Mysuru', label: 'Same District' },

  // Links to Crime Categories
  { source: 'Ramesh Kumar', target: 'Theft', label: 'Shared Crime Category' },
  { source: 'Suresh Gowda', target: 'Drug', label: 'Shared Crime Category' }
];

export default function NetworkAnalysisLayout() {
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filters State
  const [districtFilter, setDistrictFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');

  // Filter logic
  const filteredNodes = useMemo(() => {
    return nodes.filter(n => {
      if (districtFilter !== 'All' && n.district && n.district !== districtFilter) return false;
      if (categoryFilter !== 'All' && n.category && n.category !== categoryFilter) return false;
      if (riskFilter !== 'All' && n.risk && n.risk !== riskFilter) return false;
      return true;
    });
  }, [nodes, districtFilter, categoryFilter, riskFilter]);

  // Sync details if selected node details change
  const activeNode = useMemo(() => {
    if (!selectedNode) return null;
    return nodes.find(n => n.id === selectedNode.id) || selectedNode;
  }, [selectedNode, nodes]);

  // Handle node drag positioning update
  const handleNodeDrag = (nodeId, newX, newY) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, x: newX, y: newY } : n));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 animate-fade-in">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-5 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-white uppercase tracking-wider">Criminal Network Analysis</h1>
          <p className="text-2xs text-slate-400 font-sans">
            Uncover syndicate connections, repeat co-offenders, and cross-district crime networks.
          </p>
        </div>

        {/* Global Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search offender, FIR, district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 text-xs h-9 bg-slate-950/60 border-slate-850 w-full"
          />
        </div>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { title: 'Total Nodes', val: '27', color: 'text-indigo-400', icon: Network },
          { title: 'Relationships', val: '42', color: 'text-primary', icon: Share2 },
          { title: 'Groups Identified', val: '3', color: 'text-amber-500', icon: Users },
          { title: 'High-Risk networks', val: '2', color: 'text-rose-500', icon: ShieldAlert },
          { title: 'Co-Offenders', val: '4', color: 'text-red-400', icon: AlertTriangle },
          { title: 'Cross-District', val: '2', color: 'text-emerald-450', icon: Compass }
        ].map((c, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-col justify-between h-20 shadow-sm">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{c.title}</span>
            <div className="flex justify-between items-end mt-1.5">
              <span className={`text-base font-bold font-mono ${c.color}`}>{c.val}</span>
              <c.icon className={`w-3.5 h-3.5 ${c.color} opacity-80`} />
            </div>
          </div>
        ))}
      </div>

      {/* Filter panel */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-3xs font-bold uppercase text-slate-400 tracking-wider">
          <Filter className="w-4 h-4 text-indigo-400" />
          <span>Filters:</span>
        </div>

        {/* District selector */}
        <select 
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          className="select text-3xs h-8 bg-slate-950 border-slate-850 w-32"
        >
          <option value="All">All Districts</option>
          <option value="Bengaluru City">Bengaluru City</option>
          <option value="Mysuru">Mysuru</option>
          <option value="Hubballi-Dharwad">Hubballi-Dharwad</option>
        </select>

        {/* Category selector */}
        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="select text-3xs h-8 bg-slate-950 border-slate-850 w-32"
        >
          <option value="All">All Categories</option>
          <option value="Theft">Theft</option>
          <option value="Drug">Drug</option>
          <option value="Cyber">Cyber</option>
          <option value="Assault">Assault</option>
        </select>

        {/* Risk selector */}
        <select 
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="select text-3xs h-8 bg-slate-950 border-slate-850 w-32"
        >
          <option value="All">All Risk Levels</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Interactive Network Graph */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between h-[950px] relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-center z-15 pb-2 border-b border-slate-850">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Criminal Relationship Canvas</h3>
              <p className="text-4xs text-slate-500 font-mono mt-0.5">Drag nodes to rearrange. Click nodes to inspect. Use search to highlight.</p>
            </div>
            <NetworkToolbar />
          </div>

          <GraphCanvas 
            nodes={filteredNodes}
            edges={INITIAL_EDGES}
            selectedNode={activeNode}
            onSelectNode={setSelectedNode}
            searchQuery={searchQuery}
            onNodeDrag={handleNodeDrag}
          />
        </div>

        {/* Right Side: Details & Analytics Stack */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {activeNode && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
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

          {/* Network Insights */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-850">
              Network Insights
            </h3>
            <div className="space-y-3 text-3xs font-mono">
              <div className="flex justify-between"><span>Most Connected Offender</span> <span className="text-red-400 font-bold">Ramesh Kumar (8 links)</span></div>
              <div className="flex justify-between"><span>Largest Syndicate</span> <span className="text-slate-200">Bengaluru-Mysuru axis</span></div>
              <div className="flex justify-between"><span>Highest Risk Cluster</span> <span className="text-rose-500 font-bold">Bengaluru South</span></div>
              <div className="flex justify-between"><span>Cross-District Network</span> <span className="text-emerald-450">Ramesh/Suresh Axis</span></div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3.5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-850 flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-indigo-400" /> AI Observations
            </h3>
            <ul className="space-y-2 text-3xs text-slate-350 leading-relaxed list-disc pl-4">
              <li>High-frequency cooperation identified between Ramesh Kumar and Suresh Gowda across 3 cases.</li>
              <li>Emerging cyber fraud clusters localized in Bengaluru City sector, specifically Tech Corridors.</li>
              <li>Territorial transit warnings flagged between Mysuru and Mandya checking divisions.</li>
            </ul>
          </div>

          {/* Network Metrics */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-850 flex items-center gap-1.5">
              <BarChart className="w-4 h-4 text-indigo-400" /> Network Metrics
            </h3>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-3xs text-slate-400">
                  <span>Relationship density</span>
                  <span>42%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '42%' }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-3xs text-slate-400">
                  <span>Cross-District Links</span>
                  <span>28%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '28%' }} />
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
