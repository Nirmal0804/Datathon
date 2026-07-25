import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GraphCanvas from './components/GraphCanvas';
import NodeInfoPanel from './components/NodeInfoPanel';
import NetworkToolbar from './components/NetworkToolbar';
import { getNetworkGraph, searchNetwork } from '../../api/endpoints';
import { 
  Users, Share2, AlertTriangle, Network, ShieldAlert,
  BarChart, Compass, Brain, Search, Filter 
} from 'lucide-react';

export default function NetworkAnalysisLayout() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [metadata, setMetadata] = useState({ node_count: 0, edge_count: 0 });

  const [districtFilter, setDistrictFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');

  const loadGraph = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (districtFilter !== 'All') params.district = districtFilter;
      const res = await getNetworkGraph(params);
      if (res) {
        const mappedNodes = (res.nodes || []).map(n => ({
          id: n.id,
          type: n.node_type === 'person' ? 'Accused' : n.node_type === 'fir' ? 'Case' : n.node_type === 'station' ? 'Police Station' : 'District',
          label: n.label,
          risk: n.properties?.risk_level || 'Medium',
          district: n.properties?.district || '',
          station: n.properties?.station_name || '',
          cases: n.properties?.case_count || 0,
          arrests: n.properties?.arrest_count || 0,
          x: Math.random() * 400 + 50,
          y: Math.random() * 300 + 50,
          category: n.properties?.crime_head || '',
        }));
        const mappedEdges = (res.edges || []).map(e => ({
          source: e.source,
          target: e.target,
          label: e.edge_type?.replace(/_/g, ' ') || '',
        }));
        setNodes(mappedNodes);
        setEdges(mappedEdges);
        setMetadata(res.metadata || { node_count: mappedNodes.length, edge_count: mappedEdges.length });
      }
    } catch (err) {
      console.error('Failed to load network graph:', err);
      setNodes([]);
      setEdges([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGraph();
  }, []);

  const handleSearch = async (val) => {
    setSearchQuery(val);
    if (!val.trim() || val.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await searchNetwork({ q: val.trim(), limit: 10 });
      setSearchResults(res?.results || []);
    } catch {
      setSearchResults([]);
    }
  };

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

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search offender, FIR, district..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="input pl-10 text-xs h-9 bg-slate-950/60 border-slate-850 w-full"
          />
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto">
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedNode({ id: r.id, label: r.label, type: r.node_type || r.type || 'Entity' });
                    setSearchResults([]);
                    setSearchQuery(r.label);
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800 border-b border-slate-800/60 last:border-b-0 transition-colors"
                >
                  <span className="font-mono text-indigo-400 mr-2">{r.id}</span>
                  <span>{r.label}</span>
                  <span className="ml-2 text-[9px] text-slate-500 uppercase">{r.node_type || r.type || ''}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { title: 'Total Nodes', val: String(metadata.node_count), color: 'text-indigo-400', icon: Network },
          { title: 'Relationships', val: String(metadata.edge_count), color: 'text-primary', icon: Share2 },
          { title: 'Groups Identified', val: '—', color: 'text-amber-500', icon: Users },
          { title: 'High-Risk networks', val: nodes.filter(n => n.risk === 'Critical' || n.risk === 'High').length.toString(), color: 'text-rose-500', icon: ShieldAlert },
          { title: 'Co-Offenders', val: edges.filter(e => e.label.includes('co')).length.toString(), color: 'text-red-400', icon: AlertTriangle },
          { title: 'Cross-District', val: '—', color: 'text-emerald-450', icon: Compass }
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

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">Loading network graph...</div>
          ) : nodes.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">No network data available</div>
          ) : (
            <GraphCanvas
              nodes={filteredNodes}
              edges={edges}
              selectedNode={activeNode}
              onSelectNode={setSelectedNode}
              searchQuery={searchQuery}
              onNodeDrag={handleNodeDrag}
            />
          )}
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
              <div className="flex justify-between"><span>Most Connected Offender</span> <span className="text-red-400 font-bold">—</span></div>
              <div className="flex justify-between"><span>Largest Syndicate</span> <span className="text-slate-200">—</span></div>
              <div className="flex justify-between"><span>Highest Risk Cluster</span> <span className="text-rose-500 font-bold">—</span></div>
              <div className="flex justify-between"><span>Cross-District Network</span> <span className="text-emerald-450">—</span></div>
            </div>
          </div>

          {/* AI Insights - BLOCKED_ML */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3.5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-850 flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-indigo-400" /> AI Observations
            </h3>
            <div className="text-3xs text-slate-500 italic">
              AI-powered network insights require ML model artifacts (BLOCKED_ML).
            </div>
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
                  <span>{metadata.node_count > 0 ? Math.round((metadata.edge_count / metadata.node_count) * 100) : 0}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${metadata.node_count > 0 ? Math.min(100, Math.round((metadata.edge_count / metadata.node_count) * 100)) : 0}%` }} />
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
