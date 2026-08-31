import React, { useState, useMemo } from 'react';
import { ReactFlow, Background, Controls, Node, Edge, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Network, Database, Info, Mail, Server, Globe, Link as LinkIcon, Crosshair, ShieldAlert, DollarSign } from 'lucide-react';
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
      case 'EMAIL': return <Mail className="w-3.5 h-3.5" />;
      case 'IP':
      case 'SERVER': return <Server className="w-3.5 h-3.5" />;
      case 'DOMAIN': return <Globe className="w-3.5 h-3.5" />;
      case 'URL': return <LinkIcon className="w-3.5 h-3.5" />;
      case 'CAMPAIGN': return <Crosshair className="w-3.5 h-3.5" />;
      case 'BANK':
      case 'FINANCIAL': return <DollarSign className="w-3.5 h-3.5" />;
      default: return <ShieldAlert className="w-3.5 h-3.5" />;
    }
  };

  const initialNodes: Node[] = useMemo(() => {
    return graphData.nodes.map((n, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      
      let borderStyle = 'border-[#2A2E33] text-gray-200 bg-[#121518]';
      let badgeStyle = 'text-gray-400 bg-[#181C20]';
      
      if (n.severity === 'CRITICAL') {
        borderStyle = 'border-red-500/80 text-red-300 bg-[#121518] shadow-sm';
        badgeStyle = 'text-red-400 bg-red-950/40 border border-red-500/30';
      } else if (n.severity === 'HIGH' || n.severity === 'WARNING') {
        borderStyle = 'border-amber-500/80 text-amber-300 bg-[#121518] shadow-sm';
        badgeStyle = 'text-amber-400 bg-amber-950/40 border border-amber-500/30';
      }

      const icon = getNodeIcon(n.type);

      return {
        id: n.id,
        position: { x: 40 + col * 270, y: 40 + row * 135 },
        data: {
          label: (
            <div className={`p-3 rounded border font-mono text-xs cursor-pointer transition-all hover:scale-105 ${borderStyle}`}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 font-bold uppercase text-[10px]">
                  {icon}
                  <span>{n.type}</span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${badgeStyle}`}>
                  {n.severity}
                </span>
              </div>
              <div className="font-bold truncate max-w-[190px] text-white text-xs">{n.label}</div>
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
      style: { stroke: '#40464E', strokeWidth: 1.5 },
      labelStyle: { fill: '#9CA3AF', fontSize: 10, fontFamily: 'monospace' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#40464E' }
    }));
  }, [graphData]);

  const handleNodeClick = (_: any, node: Node) => {
    const orig = graphData.nodes.find(n => n.id === node.id);
    if (orig) setSelectedNode(orig);
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="border-b border-[#2A2E33] pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-mono text-white flex items-center space-x-2">
            <Network className="w-5 h-5 text-gray-300" />
            <span>Attack Map — Threat Entity Reconstruction</span>
          </h2>
          <p className="text-xs text-gray-400 font-mono mt-1">
            Interactive visual graph mapping observable email entities, infrastructure relays, redirect URLs, and threat campaigns.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-gray-400">
          <span className="px-2.5 py-1 rounded bg-[#121518] border border-[#2A2E33]">
            NODES: <strong className="text-white">{graphData.nodes.length}</strong>
          </span>
          <span className="px-2.5 py-1 rounded bg-[#121518] border border-[#2A2E33]">
            EDGES: <strong className="text-white">{graphData.edges.length}</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[640px]">
        {/* Interactive Graph Canvas */}
        <div className="lg:col-span-2 rounded border border-[#2A2E33] bg-[#0B0D0F] h-full relative overflow-hidden">
          <RisingLines
            color="#FFFFFF"
            horizonColor="#6B7280"
            riseSpeed={0.5}
            flowDensity={30}
            horizonHeight={0.9}
            horizonIntensity={0.2}
          />
          <ReactFlow
            nodes={initialNodes}
            edges={initialEdges}
            onNodeClick={handleNodeClick}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            className="bg-transparent z-10 relative"
          >
            <Background color="#181C20" gap={24} />
            <Controls className="bg-[#121518] border-[#2A2E33] text-gray-300" />
          </ReactFlow>

          {/* Graph Legend Overlay */}
          <div className="absolute top-4 left-4 bg-[#121518]/90 border border-[#2A2E33] rounded p-3 font-mono text-[10px] space-y-1.5 backdrop-blur z-20">
            <div className="font-semibold text-gray-300 uppercase">ENTITY SEVERITY</div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded bg-red-500"></span>
              <span className="text-gray-300">CONFIRMED MALICIOUS</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
              <span className="text-gray-300">SUSPICIOUS RELAY / URL</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded bg-gray-400"></span>
              <span className="text-gray-300">AUTHENTIC / TECHNICAL HOP</span>
            </div>
          </div>
        </div>

        {/* Selected Node Inspector */}
        <div className="rounded border border-[#2A2E33] bg-[#121518] p-5 h-full flex flex-col justify-between font-mono text-xs overflow-y-auto">
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider border-b border-[#2A2E33] pb-2 flex items-center space-x-2">
              <Database className="w-4 h-4 text-gray-400" />
              <span>Entity Inspector</span>
            </h3>

            {selectedNode ? (
              <div className="space-y-4 mt-4 animate-fade-in">
                <div>
                  <span className="text-gray-400 text-[11px]">ENTITY TYPE:</span>
                  <div className="px-2.5 py-1 rounded bg-[#181C20] text-white font-bold border border-[#2A2E33] w-max mt-0.5 flex items-center gap-1.5">
                    {getNodeIcon(selectedNode.type)}
                    <span>{selectedNode.type}</span>
                  </div>
                </div>

                <div>
                  <span className="text-gray-400 text-[11px]">IDENTIFIER / VALUE:</span>
                  <p className="text-white font-bold text-sm mt-0.5 break-all">{selectedNode.label}</p>
                </div>

                <div>
                  <span className="text-gray-400 text-[11px]">FORENSIC ATTRIBUTES:</span>
                  <div className="mt-1.5 p-3 rounded bg-[#0B0D0F] border border-[#2A2E33] space-y-2">
                    {Object.entries(selectedNode.details).map(([k, v]) => (
                      <div key={k} className="flex items-start justify-between text-[11px] border-b last:border-0 border-[#181C20] pb-1">
                        <span className="text-gray-400 font-semibold">{k}:</span>
                        <span className="text-gray-200 text-right max-w-[180px] break-all">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-gray-500 font-sans">
                <Info className="w-6 h-6 mx-auto mb-2 opacity-50 text-gray-400" />
                <span>Click any entity node on the graph to inspect its forensic attributes.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
