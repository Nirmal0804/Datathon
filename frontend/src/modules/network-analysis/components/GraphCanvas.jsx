import React, { useState, useRef, useEffect, useCallback } from 'react';

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
      if (risk === 'Critical') return '#EF4444';
      if (risk === 'High')     return '#F97316';
      if (risk === 'Medium')   return '#F59E0B';
      return '#10B981';
    }
    if (type === 'Case')           return '#818CF8';
    if (type === 'Police Station') return '#60A5FA';
    if (type === 'District')       return '#A78BFA';
    return '#94A3B8';
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
      className="w-full bg-[#F8F9FB] border border-[#E7ECF3] rounded-[14px] relative overflow-hidden select-none cursor-grab active:cursor-grabbing"
      style={{ height: '520px' }}
    >
      {/* Zoom Controls */}
      <div className="absolute bottom-4 left-4 flex gap-2 z-10">
        <button
          onClick={() => setZoom(z => Math.min(z + 0.15, 3.0))}
          className="w-8 h-8 rounded-[8px] bg-white border border-[#E7ECF3] text-[#0B1F4D] hover:border-[#1A2F63]/40 font-bold text-sm cursor-pointer flex items-center justify-center shadow-sm transition-all"
        >+</button>
        <button
          onClick={() => setZoom(z => Math.max(z - 0.15, 0.4))}
          className="w-8 h-8 rounded-[8px] bg-white border border-[#E7ECF3] text-[#0B1F4D] hover:border-[#1A2F63]/40 font-bold text-sm cursor-pointer flex items-center justify-center shadow-sm transition-all"
        >−</button>
        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          className="px-3 h-8 rounded-[8px] bg-white border border-[#E7ECF3] text-[#0B1F4D] hover:border-[#1A2F63]/40 text-[11px] font-bold cursor-pointer flex items-center justify-center shadow-sm transition-all"
        >Reset View</button>
      </div>

      {/* Hint */}
      <div className="absolute top-3 right-3 z-10 bg-white/80 border border-[#E7ECF3] rounded-[8px] px-2.5 py-1 text-[10px] font-semibold text-[#64748B] pointer-events-none">
        Ctrl + scroll to zoom
      </div>

      <svg className="w-full h-full">
        {/* Dot Grid Pattern */}
        <defs>
          <pattern id="ksp-grid-dots" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1" fill="#CBD5E1" opacity="0.5" />
          </pattern>
        </defs>
        <rect id="bg-grid" width="100%" height="100%" fill="url(#ksp-grid-dots)" />

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>

          {/* Edges */}
          {edges.map((edge, i) => {
            const src = nodes.find(n => n.id === edge.source);
            const tgt = nodes.find(n => n.id === edge.target);
            if (!src || !tgt) return null;
            const mx = (src.x + tgt.x) / 2;
            const my = (src.y + tgt.y) / 2;
            return (
              <g key={i}>
                <line
                  x1={src.x} y1={src.y}
                  x2={tgt.x} y2={tgt.y}
                  stroke="#CBD5E1"
                  strokeWidth="1.2"
                  strokeDasharray={edge.label === 'Repeat Co-Offender' ? '4,3' : undefined}
                />
                <text
                  x={mx} y={my - 4}
                  fill="#94A3B8"
                  fontSize="5"
                  textAnchor="middle"
                  className="font-mono pointer-events-none"
                >
                  {edge.label}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedNode?.id === node.id;
            const isMatch    = matchesSearch(node.label);
            const color      = getNodeColor(node.type, node.risk);

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
                  <circle cx={node.x} cy={node.y} r="20"
                    fill="transparent" stroke="#818CF8" strokeWidth="2"
                    className="animate-pulse"
                  />
                )}

                {/* Selected Ring */}
                {isSelected && (
                  <circle cx={node.x} cy={node.y} r="16"
                    fill="transparent" stroke={color} strokeWidth="2" opacity="0.5"
                  />
                )}

                {/* White drop shadow behind node */}
                <circle cx={node.x} cy={node.y + 1} r="11"
                  fill="rgba(0,0,0,0.08)" />

                {/* Node circle */}
                <circle cx={node.x} cy={node.y} r="11"
                  fill="white"
                  stroke={color}
                  strokeWidth="2.5"
                  className="group-hover/node:stroke-[3px] transition-all duration-150"
                />

                {/* Initials */}
                <text
                  x={node.x} y={node.y + 3}
                  fill={color}
                  fontSize="7"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="select-none pointer-events-none"
                >
                  {node.label.substring(0, 2).toUpperCase()}
                </text>

                {/* Label */}
                <text
                  x={node.x} y={node.y + 22}
                  fill="#374151"
                  fontSize="6.5"
                  fontWeight="600"
                  textAnchor="middle"
                  className="select-none pointer-events-none opacity-80 group-hover/node:opacity-100 transition-opacity"
                >
                  {node.label}
                </text>

                {/* Hover Tooltip */}
                <g className="opacity-0 group-hover/node:opacity-100 pointer-events-none transition-opacity duration-150">
                  <rect
                    x={node.x - 40} y={node.y - 34}
                    width="80" height="16"
                    rx="4"
                    fill="#0B1F4D"
                    opacity="0.9"
                  />
                  <text
                    x={node.x} y={node.y - 22}
                    fill="#E2E8F0"
                    fontSize="5.5"
                    textAnchor="middle"
                    className="font-mono"
                  >
                    {node.type}{node.risk ? ` · ${node.risk}` : ''}
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
