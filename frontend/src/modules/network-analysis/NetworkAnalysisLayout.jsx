import React, { useState } from 'react';
import GraphCanvas from './components/GraphCanvas';
import RelationshipSidebar from './components/RelationshipSidebar';
import NodeInfoPanel from './components/NodeInfoPanel';
import NetworkToolbar from './components/NetworkToolbar';

export default function NetworkAnalysisLayout() {
  const [nodePanelOpen, setNodePanelOpen] = useState(true);

  return (
    <div className="flex h-full w-full relative overflow-hidden bg-slate-950 rounded-xl border border-slate-800 shadow-xl">
      <RelationshipSidebar />
      
      <div className="flex-1 relative h-full flex flex-col">
        <NetworkToolbar />
        <GraphCanvas />
      </div>
      
      {nodePanelOpen && (
        <NodeInfoPanel onClose={() => setNodePanelOpen(false)} />
      )}
    </div>
  );
}
