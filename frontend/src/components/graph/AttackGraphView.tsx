import React, { useState, useMemo } from 'react';
import { ReactFlow, Background, Controls, Node, Edge, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Network, Database, Mail, Server, Globe, Link as LinkIcon, Crosshair, ShieldAlert, DollarSign } from 'lucide-react';
import { CaseDetail, GraphNode } from '../../types';
import { RisingLines } from '../ui/RisingLines';

interface AttackGraphViewProps {
  caseDetail: CaseDetail;
}

export const AttackGraphView: React.FC<AttackGraphViewProps> = ({ caseDetail }) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const graphData = caseDetail.attack_graph;

  const getNodeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'EMAIL': return <Mail className="w-3.5 h-3.5 text-teal-400" />;
      case 'IP':
      case 'SERVER': return <Server className="w-3.5 h-3.5 text-teal-400" />;
      case 'DOMAIN': return <Globe className="w-3.5 h-3.5 text-teal-400" />;
      case 'URL': return <LinkIcon className="w-3.5 h-3.5 text-teal-400" />;
      case 'CAMPAIGN': return <Crosshair className="w-3.5 h-3.5 text-teal-400" />;
      case 'BANK':
      case 'FINANCIAL': return <DollarSign className="w-3.5 h-3.5 text-teal-400" />;
      default: return <ShieldAlert className="w-3.5 h-3.5 text-teal-400" />;
    }
  };

  const initialNodes: Node[] = useMemo(() => {
    return graphData.nodes.map((n, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      
      let borderStyle = 'border-slate-700 text-slate-200 bg-slate-900';
      let badgeStyle = 'text-slate-400 bg-slate-800';
      
      if (n.severity === 'CRITICAL') {
        borderStyle = 'border-red-500/80 text-red-300 bg-slate-900 shadow-sm';
        badgeStyle = 'text-red-400 bg-red-950/40 border border-red-500/30';
      } else if (n.severity === 'HIGH' || n.severity === 'WARNING') {
        borderStyle = 'border-amber-500/80 text-amber-300 bg-slate-900 shadow-sm';
        badgeStyle = 'text-amber-400 bg-amber-950/40 border border-amber-500/30';
      }

      const icon = getNodeIcon(n.type);

      return {
        id: n.id,
        position: { x: 40 + col * 270, y: 40 + row * 135 },
        data: {
          label: (
            <div className={`p-3 rounded-lg border font-mono text-xs cursor-pointer transition-all hover:scale-105 ${borderStyle}`}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 font-bold uppercase text-[10px]">
                  {icon}
                  <span>{n.type}</span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${badgeStyle}`}>
                  {n.severity}
                </span>
              </div>
              <div className="font-bold truncate max-w-[190px] text-slate-100 text-xs">{n.label}</div>
            </div>
          )
        }
      };
    });
  }, [graphData]);

  const initialEdges: Edge[] = useMemo(() => {
    return graphData.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.relationship,
      animated: true,
      style: { stroke: '#0E7063', strokeWidth: 1.5 },
      labelStyle: { fill: '#14B8A6', fontSize: 10, fontFamily: 'monospace' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#14B8A6' }
    }));
  }, [graphData]);

  const handleNodeClick = (_: any, node: Node) => {
    const orig = graphData.nodes.find(n => n.id === node.id);
    if (orig) setSelectedNode(orig);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Title Header */}
      <div className="tracex-card p-5 flex items-center justify-between border-l-4 border-l-teal-500">
        <div>
          <h2 className="text-base font-bold font-mono text-slate-100 flex items-center space-x-2">
            <Network className="w-5 h-5 text-teal-400" />
            <span>ATTACK GRAPH — THREAT ENTITY RECONSTRUCTION</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Interactive visual graph mapping email entities, infrastructure relays, redirect URLs, and threat campaigns.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-slate-400">
          <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
            NODES: <strong className="text-teal-300">{graphData.nodes.length}</strong>
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
            EDGES: <strong className="text-teal-300">{graphData.edges.length}</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[640px]">
        {/* Interactive Graph Canvas */}
        <div className="lg:col-span-2 tracex-card h-full relative overflow-hidden p-0">
          <RisingLines
            color="#0E7063"
            horizonColor="#050B17"
            riseSpeed={0.4}
            flowDensity={25}
            horizonHeight={0.9}
            horizonIntensity={0.15}
          />
          <ReactFlow
            nodes={initialNodes}
            edges={initialEdges}
            onNodeClick={handleNodeClick}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            className="bg-transparent z-10 relative"
          >
            <Background color="rgba(255,255,255,0.05)" gap={24} />
            <Controls className="bg-slate-900 border-slate-800 text-slate-300" />
          </ReactFlow>

          {/* Graph Legend Overlay */}
          <div className="absolute top-4 left-4 bg-slate-950/90 border border-slate-800 rounded-lg p-3 font-mono text-[10px] space-y-1.5 backdrop-blur z-20">
            <div className="font-semibold text-slate-300 uppercase">ENTITY SEVERITY</div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span className="text-slate-300">CONFIRMED MALICIOUS</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-slate-300">SUSPICIOUS RELAY / URL</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
              <span className="text-slate-300">AUTHENTIC / TECHNICAL HOP</span>
            </div>
          </div>
        </div>

        {/* Selected Node Inspector */}
        <div className="tracex-card p-5 h-full flex flex-col justify-between font-mono text-xs overflow-y-auto">
          <div>
            <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider border-b border-white/5 pb-2 flex items-center space-x-2">
              <Database className="w-4 h-4 text-teal-400" />
              <span>Entity Inspector</span>
            </h3>

            {selectedNode ? (
              <div className="space-y-4 mt-4 animate-fade-in">
                <div>
                  <span className="text-slate-400 text-[11px]">ENTITY TYPE:</span>
                  <div className="px-2.5 py-1 rounded bg-slate-900 text-slate-100 font-bold border border-slate-800 w-max mt-0.5 flex items-center gap-1.5">
                    {getNodeIcon(selectedNode.type)}
                    <span>{selectedNode.type}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px]">IDENTIFIER / VALUE:</span>
                  <p className="text-slate-100 font-bold text-sm mt-0.5 break-all">{selectedNode.label}</p>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px]">FORENSIC ATTRIBUTES:</span>
                  <div className="mt-1.5 p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                    {Object.entries(selectedNode.details).map(([k, v]) => (
                      <div key={k} className="flex justify-between border-b border-slate-900 pb-1">
                        <span className="text-slate-500 uppercase text-[10px]">{k}:</span>
                        <span className="text-teal-300 font-bold text-[11px] truncate max-w-[150px]">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-center text-slate-500 text-xs font-sans">
                Click any node in the attack graph to inspect details.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
