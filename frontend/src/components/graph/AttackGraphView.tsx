import React, { useState, useMemo } from 'react';
import { ReactFlow, Background, Controls, Node, Edge, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Network, Database, ShieldAlert, ArrowRight, Info } from 'lucide-react';
import { CaseDetail, GraphNode, GraphEdge } from '../../types';

interface AttackGraphViewProps {
  caseDetail: CaseDetail;
}

export const AttackGraphView: React.FC<AttackGraphViewProps> = ({ caseDetail }) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const graphData = caseDetail.attack_graph;

  // Convert case attack graph data into React Flow nodes
  const initialNodes: Node[] = useMemo(() => {
    return graphData.nodes.map((n, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      
      let borderClr = 'border-cyan-500/40 text-cyan-300';
      if (n.severity === 'CRITICAL') borderClr = 'border-red-500 text-red-300 bg-red-950/40';
      else if (n.severity === 'HIGH') borderClr = 'border-amber-500 text-amber-300 bg-amber-950/40';
      else if (n.severity === 'WARNING') borderClr = 'border-yellow-500 text-yellow-300 bg-yellow-950/40';

      return {
        id: n.id,
        position: { x: 50 + col * 280, y: 50 + row * 140 },
        data: {
          label: (
            <div className={`p-3 rounded-lg border bg-slate-900 shadow-lg font-mono text-xs cursor-pointer ${borderClr}`}>
              <div className="text-[10px] opacity-75 font-bold uppercase">{n.type}</div>
              <div className="font-semibold truncate max-w-[200px] mt-0.5">{n.label}</div>
            </div>
          )
        }
      };
    });
  }, [graphData]);

  // Convert graph edges into React Flow edges
  const initialEdges: Edge[] = useMemo(() => {
    return graphData.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.relationship,
      animated: true,
      style: { stroke: '#06b6d4', strokeWidth: 2 },
      labelStyle: { fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' }
    }));
  }, [graphData]);

  const handleNodeClick = (_: any, node: Node) => {
    const orig = graphData.nodes.find(n => n.id === node.id);
    if (orig) setSelectedNode(orig);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Title Header */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold font-mono text-slate-100 flex items-center space-x-2">
          <Network className="w-5 h-5 text-cyan-400" />
          <span>ATTACK GRAPH — THREAT ENTITY RECONSTRUCTION</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Interactive graph mapping observable email entities, infrastructure relays, redirect URLs, IFSC bank branches, and historical campaign memory.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[650px]">
        {/* Interactive Graph Canvas (Left 2 columns) */}
        <div className="lg:col-span-2 forensic-card h-full relative overflow-hidden">
          <ReactFlow
            nodes={initialNodes}
            edges={initialEdges}
            onNodeClick={handleNodeClick}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            className="bg-slate-950 forensic-grid-bg"
          >
            <Background color="#1e293b" gap={24} />
            <Controls className="bg-slate-900 border-slate-800 text-slate-200" />
          </ReactFlow>

          {/* Graph Legend Overlay */}
          <div className="absolute top-4 left-4 bg-slate-900/90 border border-slate-800 rounded p-3 font-mono text-[10px] space-y-1.5 backdrop-blur">
            <div className="font-bold text-slate-300 uppercase">NODE LEGEND</div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded bg-red-500"></span>
              <span className="text-slate-300">CRITICAL / SPOOFED</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
              <span className="text-slate-300">HIGH RISK RELAY / URL</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded bg-cyan-500"></span>
              <span className="text-slate-300">AUTHENTIC / TECHNICAL HOP</span>
            </div>
          </div>
        </div>

        {/* Selected Node Evidence Inspector (Right column) */}
        <div className="forensic-card p-6 h-full flex flex-col justify-between font-mono text-xs overflow-y-auto">
          <div>
            <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center space-x-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>GRAPH ENTITY INSPECTOR</span>
            </h3>

            {selectedNode ? (
              <div className="space-y-4 mt-4">
                <div>
                  <span className="text-slate-400 text-[11px]">NODE TYPE:</span>
                  <div className="px-2 py-0.5 rounded bg-slate-950 text-cyan-400 font-bold border border-cyan-800 w-max mt-0.5">
                    {selectedNode.type}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px]">LABEL / ENTITY:</span>
                  <p className="text-slate-100 font-bold text-sm mt-0.5">{selectedNode.label}</p>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px]">ENTITY ATTRIBUTES:</span>
                  <div className="mt-1 p-3 rounded bg-slate-950 border border-slate-800 space-y-1.5">
                    {Object.entries(selectedNode.details).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">{k}:</span>
                        <span className="text-slate-200 font-semibold">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <Info className="w-8 h-8 text-slate-600 mx-auto" />
                <p>Click any node on the graph canvas to inspect attributes and connected evidence.</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400">
            <span>Every graph connection is backed by an append-only evidence hash in the Chain of Custody.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
