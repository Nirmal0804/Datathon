import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

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

  // Handle wheel events for zooming
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = 1.05;
    if (e.deltaY < 0) {
      setZoom(z => Math.min(z * zoomFactor, 3.0));
    } else {
      setZoom(z => Math.max(z / zoomFactor, 0.5));
    }
  };

  // Attach non-passive wheel event listener
  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.addEventListener('wheel', handleWheel, { passive: false });
      return () => el.removeEventListener('wheel', handleWheel);
    }
  }, []);

  // Handle Drag / Pan Mouse Actions
  const handleMouseDown = (e) => {
    // If clicking background canvas, initiate panning
    if (e.target.tagName === 'svg' || e.target.id === 'bg-grid') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    const rect = containerRef.current.getBoundingClientRect();

    if (draggedNodeId) {
      // Calculate coordinates relative to canvas taking pan and zoom into consideration
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      // boundary controls
      onNodeDrag(draggedNodeId, Math.max(10, Math.min(x, 490)), Math.max(10, Math.min(y, 390)));
    } else if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setDraggedNodeId(null);
    setIsPanning(false);
  };

  // Node styles configuration
  const getNodeColor = (type, risk) => {
    if (type === 'Accused') {
      if (risk === 'Critical') return '#ef4444'; // red
      if (risk === 'High') return '#f97316'; // orange
      if (risk === 'Medium') return '#f59e0b'; // amber
      return '#10b981'; // green
    }
    if (type === 'Case') return '#818cf8'; // indigo
    if (type === 'Police Station') return '#60a5fa'; // light blue
    if (type === 'District') return '#a78bfa'; // violet
    return '#64748b'; // slate
  };

  // Search highlighting match
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
      className="flex-1 w-full h-full bg-slate-950 relative overflow-hidden select-none cursor-grab active:cursor-grabbing border border-slate-850/60 rounded-xl mt-3"
    >
      
      {/* Interactive controls overlay */}
      <div className="absolute bottom-4 left-4 flex gap-2 z-10">
        <button 
          onClick={() => setZoom(z => Math.min(z + 0.1, 3.0))}
          className="w-7 h-7 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-bold text-xs cursor-pointer flex items-center justify-center"
        >
          +
        </button>
        <button 
          onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))}
          className="w-7 h-7 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-bold text-xs cursor-pointer flex items-center justify-center"
        >
          -
        </button>
        <button 
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          className="px-2 h-7 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-3xs font-semibold cursor-pointer flex items-center justify-center"
        >
          Reset View
        </button>
      </div>

      <svg className="w-full h-full">
        {/* Background Grid Pattern */}
        <defs>
          <pattern id="bg-grid-pattern" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.5" fill="#1e293b" />
          </pattern>
        </defs>
        <rect 
          id="bg-grid"
          width="100%" 
          height="100%" 
          fill="url(#bg-grid-pattern)" 
          x={pan.x}
          y={pan.y}
        />

        {/* Translation Transform Wrapper */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          
          {/* Connection Edges lines */}
          {edges.map((edge, i) => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;

            return (
              <g key={i}>
                <line
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke="#334155"
                  strokeWidth="1.5"
                />
                {/* Edge Label */}
                <text
                  x={(sourceNode.x + targetNode.x) / 2}
                  y={(sourceNode.y + targetNode.y) / 2 - 4}
                  fill="#475569"
                  fontSize="5"
                  textAnchor="middle"
                  className="font-mono bg-slate-950 px-1"
                >
                  {edge.label}
                </text>
              </g>
            );
          })}

          {/* Node items circles */}
          {nodes.map((node) => {
            const isSelected = selectedNode?.id === node.id;
            const isMatch = matchesSearch(node.label);
            const color = getNodeColor(node.type, node.risk);

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
                {/* Search Match Halo */}
                {isMatch && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="18"
                    fill="transparent"
                    stroke="#818cf8"
                    strokeWidth="2.5"
                    className="animate-pulse"
                  />
                )}

                {/* Selected Node Halo */}
                {isSelected && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="15"
                    fill="transparent"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                )}

                {/* Main Node circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="10"
                  fill="#090d16"
                  stroke={color}
                  strokeWidth="2.5"
                  className="group-hover/node:stroke-white transition-colors duration-200"
                />

                {/* Initials Text */}
                <text
                  x={node.x}
                  y={node.y + 2.5}
                  fill="#ffffff"
                  fontSize="7"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="select-none pointer-events-none"
                >
                  {node.label.substring(0, 2)}
                </text>

                {/* Name Label */}
                <text
                  x={node.x}
                  y={node.y + 18}
                  fill="#e2e8f0"
                  fontSize="6.5"
                  textAnchor="middle"
                  className="font-sans font-semibold opacity-80 group-hover/node:opacity-100 transition-opacity"
                >
                  {node.label}
                </text>

                {/* Hover Tooltip Overlay Box */}
                <g className="opacity-0 group-hover/node:opacity-100 pointer-events-none transition-opacity duration-200">
                  <rect
                    x={node.x - 45}
                    y={node.y - 32}
                    width="90"
                    height="18"
                    rx="3"
                    fill="#0f172a"
                    stroke="#334155"
                    strokeWidth="1"
                  />
                  <text
                    x={node.x}
                    y={node.y - 20}
                    fill="#94a3b8"
                    fontSize="5.5"
                    textAnchor="middle"
                    className="font-mono"
                  >
                    Type: {node.type}
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
