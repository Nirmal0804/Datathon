import React, { useState, useRef, useEffect, useCallback } from 'react';

// Renders crisp, professional SVG vector icons centered at (0, 0)
const renderNodeIcon = (type, risk, color) => {
  if (type === 'Accused') {
    return (
      <g stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* User / Suspect Icon */}
        <circle cx="0" cy="-3.5" r="3.2" />
        <path d="M -5.5 5.5 C -5.5 1.5 5.5 1.5 5.5 5.5" />
      </g>
    );
  }
  if (type === 'Case') {
    return (
      <g stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* FIR / Document Icon */}
        <path d="M -4 -5.5 L 1.5 -5.5 L 4.5 -2.5 L 4.5 5.5 L -4 5.5 Z" />
        <path d="M 1.5 -5.5 L 1.5 -2.5 L 4.5 -2.5" />
        <line x1="-2" y1="0.5" x2="2.5" y2="0.5" />
        <line x1="-2" y1="3" x2="1" y2="3" />
      </g>
    );
  }
  if (type === 'Police Station') {
    return (
      <g stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Police Station / Building Icon */}
        <path d="M -5 5.5 L -5 -3 L 0 -6 L 5 -3 L 5 5.5 Z" />
        <rect x="-2" y="1" width="4" height="4.5" fill={color} fillOpacity="0.2" />
        <circle cx="0" cy="-2" r="1.2" fill={color} />
      </g>
    );
  }
  if (type === 'District') {
    return (
      <g stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* District Location Pin Icon */}
        <path d="M 0 -5.5 C -3.2 -5.5 -4.5 -3.2 -4.5 -0.5 C -4.5 2.8 0 5.5 0 5.5 C 0 5.5 4.5 2.8 4.5 -0.5 C 4.5 -3.2 3.2 -5.5 0 -5.5 Z" />
        <circle cx="0" cy="-1" r="1.5" fill={color} />
      </g>
    );
  }
  if (type === 'Crime Category') {
    return (
      <g stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Crime Category Tag Icon */}
        <path d="M -4.5 0.5 L 0 5 L 5 0 L 0.5 -4.5 L -4.5 -4.5 Z" />
        <circle cx="-1.5" cy="-1.5" r="1.2" fill={color} />
      </g>
    );
  }
  return (
    <circle cx="0" cy="0" r="3" fill={color} />
  );
};

export default function GraphCanvas({
  nodes,
  edges,
  selectedNode,
  onSelectNode,
  searchQuery,
  onNodeDrag
}) {
  const containerRef = useRef(null);
  const [draggedNodeId, setDraggedNodeId] = useState(null);

  // Pan & Zoom States
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Scroll fix: only capture wheel when Ctrl/Cmd is held; otherwise let page scroll
  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = 1.08;
      if (e.deltaY < 0) {
        setZoom(z => Math.min(z * zoomFactor, 3.0));
      } else {
        setZoom(z => Math.max(z / zoomFactor, 0.4));
      }
    }
    // else: do nothing — let browser scroll the page naturally
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Pointer events for drag / pan
  const handleMouseDown = (e) => {
    if (e.target.tagName === 'svg' || e.target.id === 'bg-grid') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (draggedNodeId) {
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      onNodeDrag(draggedNodeId, Math.max(15, Math.min(x, 485)), Math.max(15, Math.min(y, 385)));
    } else if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setDraggedNodeId(null);
    setIsPanning(false);
  };

  // Node visual styles
  const getNodeColor = (type, risk) => {
    if (type === 'Accused') {
      if (risk === 'Critical') return '#EF4444'; // Red
      if (risk === 'High')     return '#F97316'; // Orange
      if (risk === 'Medium')   return '#F59E0B'; // Amber
      return '#10B981'; // Green
    }
    if (type === 'Case')           return '#8B5CF6'; // Purple / FIR
    if (type === 'Police Station') return '#3B82F6'; // Blue / Station
    if (type === 'District')       return '#6366F1'; // Indigo / Location
    if (type === 'Crime Category') return '#EC4899'; // Pink-Rose / Category
    return '#64748B'; // Slate neutral
  };

  const matchesSearch = (label) => {
    if (!searchQuery.trim()) return false;
    return label.toLowerCase().includes(searchQuery.toLowerCase());
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="w-full bg-[#FAFBFD] border border-[#E2E8F0] rounded-[18px] relative overflow-hidden select-none cursor-grab active:cursor-grabbing shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
      style={{ height: '530px' }}
    >
      {/* Zoom Controls */}
      <div className="absolute bottom-4 left-4 flex gap-2 z-10">
        <button
          onClick={() => setZoom(z => Math.min(z + 0.15, 3.0))}
          className="w-8 h-8 rounded-[10px] bg-white border border-[#E2E8F0] text-[#0B1F4D] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] font-bold text-sm cursor-pointer flex items-center justify-center shadow-xs transition-all"
          title="Zoom In"
        >+</button>
        <button
          onClick={() => setZoom(z => Math.max(z - 0.15, 0.4))}
          className="w-8 h-8 rounded-[10px] bg-white border border-[#E2E8F0] text-[#0B1F4D] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] font-bold text-sm cursor-pointer flex items-center justify-center shadow-xs transition-all"
          title="Zoom Out"
        >−</button>
        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          className="px-3 h-8 rounded-[10px] bg-white border border-[#E2E8F0] text-[#0B1F4D] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] text-[11px] font-bold cursor-pointer flex items-center justify-center shadow-xs transition-all"
        >Reset View</button>
      </div>

      {/* Navigation Hint */}
      <div className="absolute top-3.5 right-3.5 z-10 bg-white/90 border border-[#E2E8F0] rounded-[10px] px-3 py-1.5 text-[10px] font-semibold text-[#64748B] shadow-xs pointer-events-none backdrop-blur-xs flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#0B1F4D]" />
        Ctrl + scroll to zoom · Drag nodes to reposition
      </div>

      <svg className="w-full h-full">
        {/* SVG Definitions */}
        <defs>
          {/* Dotted Grid Pattern */}
          <pattern id="ksp-grid-dots" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1" fill="#94A3B8" opacity="0.30" />
          </pattern>
          {/* Subtle Drop Shadows */}
          <filter id="node-shadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#0F172A" floodOpacity="0.08" />
          </filter>
          <filter id="node-shadow-selected" x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow dx="0" dy="3" stdDeviation="4.5" floodColor="#0F172A" floodOpacity="0.16" />
          </filter>
        </defs>

        <rect id="bg-grid" width="100%" height="100%" fill="url(#ksp-grid-dots)" />

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>

          {/* 1. RELATIONSHIP EDGES */}
          {edges.map((edge, i) => {
            const src = nodes.find(n => n.id === edge.source);
            const tgt = nodes.find(n => n.id === edge.target);
            if (!src || !tgt) return null;
            const mx = (src.x + tgt.x) / 2;
            const my = (src.y + tgt.y) / 2;
            const isCoOffender = edge.label === 'Repeat Co-Offender';
            const labelWidth = Math.max(edge.label.length * 3.8 + 10, 36);

            return (
              <g key={i}>
                {/* Edge line */}
                <line
                  x1={src.x} y1={src.y}
                  x2={tgt.x} y2={tgt.y}
                  stroke={isCoOffender ? '#EF4444' : '#CBD5E1'}
                  strokeWidth={isCoOffender ? '1.8' : '1.3'}
                  strokeDasharray={isCoOffender ? '4,3' : undefined}
                  strokeOpacity={isCoOffender ? '0.85' : '0.75'}
                />

                {/* Relationship Label Pill */}
                <g className="pointer-events-none">
                  <rect
                    x={mx - labelWidth / 2}
                    y={my - 6.5}
                    width={labelWidth}
                    height="13"
                    rx="4"
                    fill="#FFFFFF"
                    stroke={isCoOffender ? '#FECACA' : '#E2E8F0'}
                    strokeWidth="0.8"
                    filter="drop-shadow(0 1px 2px rgba(0,0,0,0.04))"
                  />
                  <text
                    x={mx}
                    y={my + 2.5}
                    fill={isCoOffender ? '#DC2626' : '#475569'}
                    fontSize="5"
                    fontWeight="600"
                    textAnchor="middle"
                    className="font-sans select-none"
                  >
                    {edge.label}
                  </text>
                </g>
              </g>
            );
          })}

          {/* 2. ENTITY NODES */}
          {nodes.map((node) => {
            const isSelected = selectedNode?.id === node.id;
            const isMatch    = matchesSearch(node.label);
            const color      = getNodeColor(node.type, node.risk);
            const isHighRisk = node.risk === 'Critical' || node.risk === 'High';
            const radius     = isHighRisk ? 13.5 : 11.5;

            return (
              <g
                key={node.id}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setDraggedNodeId(node.id);
                  onSelectNode(node);
                }}
                className="cursor-pointer group/node"
              >
                {/* Search Highlight Halo */}
                {isMatch && (
                  <circle
                    cx={node.x} cy={node.y} r={radius + 9}
                    fill="none" stroke="#6366F1" strokeWidth="2"
                    strokeDasharray="3,3"
                    className="animate-pulse"
                  />
                )}

                {/* High-Risk Ambient Pulse Ring */}
                {isHighRisk && !isSelected && (
                  <circle
                    cx={node.x} cy={node.y} r={radius + 6}
                    fill="none" stroke={color} strokeWidth="1.2"
                    strokeDasharray="2,2" opacity="0.4"
                  />
                )}

                {/* Selected Halo Ring */}
                {isSelected && (
                  <circle
                    cx={node.x} cy={node.y} r={radius + 7}
                    fill={color} fillOpacity="0.10"
                    stroke={color} strokeWidth="2"
                    strokeDasharray="3,2"
                  />
                )}

                {/* Node Body Circle (Clean White Fill with Colored Border & Shadow) */}
                <circle
                  cx={node.x} cy={node.y} r={radius}
                  fill="#FFFFFF"
                  stroke={color}
                  strokeWidth={isSelected ? '3' : isHighRisk ? '2.5' : '2'}
                  filter={isSelected ? 'url(#node-shadow-selected)' : 'url(#node-shadow)'}
                  className="group-hover/node:stroke-[3.2px] transition-all duration-150"
                />

                {/* Node Icon */}
                <g transform={`translate(${node.x}, ${node.y}) scale(${isHighRisk ? 1.05 : 0.95})`}>
                  {renderNodeIcon(node.type, node.risk, color)}
                </g>

                {/* Node Primary Label */}
                <text
                  x={node.x} y={node.y + radius + 11}
                  fill="#0F172A"
                  fontSize="7"
                  fontWeight="700"
                  textAnchor="middle"
                  className="select-none pointer-events-none font-sans"
                >
                  {node.label}
                </text>

                {/* Node Subtitle / Risk Tag */}
                <text
                  x={node.x} y={node.y + radius + 19}
                  fill={node.risk ? color : '#64748B'}
                  fontSize="5.2"
                  fontWeight="600"
                  textAnchor="middle"
                  className="select-none pointer-events-none font-sans uppercase tracking-wider"
                >
                  {node.risk ? `${node.risk} Risk` : node.type}
                </text>

                {/* Hover Tooltip Card */}
                <g className="opacity-0 group-hover/node:opacity-100 pointer-events-none transition-opacity duration-150">
                  <rect
                    x={node.x - 45} y={node.y - radius - 24}
                    width="90" height="18"
                    rx="5"
                    fill="#0B1F4D"
                    opacity="0.95"
                    filter="drop-shadow(0 2px 5px rgba(0,0,0,0.2))"
                  />
                  <text
                    x={node.x} y={node.y - radius - 12.5}
                    fill="#F8FAFC"
                    fontSize="5.8"
                    fontWeight="600"
                    textAnchor="middle"
                    className="font-sans"
                  >
                    {node.type}{node.risk ? ` · ${node.risk} Risk` : ''}
                  </text>
                </g>

              </g>
            );
          })}

        </g>
      </svg>
    </div>
  );
}
