import React, { useState, useMemo } from 'react';
import { ReactFlow, Background, Controls, Node, Edge, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Network, Database, Mail, Server, Globe, Link as LinkIcon, Crosshair, ShieldAlert, DollarSign } from 'lucide-react';
import { CaseDetail, GraphNode } from '../../types';
import { PageHeader } from '../common/PageHeader';

interface AttackGraphViewProps {
  caseDetail: CaseDetail;
}

export const AttackGraphView: React.FC<AttackGraphViewProps> = ({ caseDetail }) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const graphData = caseDetail.attack_graph;

  const getNodeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'EMAIL': return <Mail className="w-3.5 h-3.5 text-[var(--blue-primary)]" />;
      case 'IP':
      case 'SERVER': return <Server className="w-3.5 h-3.5 text-[var(--blue-primary)]" />;
      case 'DOMAIN': return <Globe className="w-3.5 h-3.5 text-[var(--blue-primary)]" />;
      case 'URL': return <LinkIcon className="w-3.5 h-3.5 text-[var(--blue-primary)]" />;
      case 'CAMPAIGN': return <Crosshair className="w-3.5 h-3.5 text-[var(--blue-primary)]" />;
      case 'BANK':
      case 'FINANCIAL': return <DollarSign className="w-3.5 h-3.5 text-[var(--blue-primary)]" />;
      default: return <ShieldAlert className="w-3.5 h-3.5 text-[var(--blue-primary)]" />;
    }
  };

  const initialNodes: Node[] = useMemo(() => {
    return graphData.nodes.map((n, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);

      let badgeStyle = 'badge-safe';
      if (n.severity === 'CRITICAL') {
        badgeStyle = 'badge-critical';
      } else if (n.severity === 'HIGH' || n.severity === 'WARNING') {
        badgeStyle = 'badge-high';
      }

      const icon = getNodeIcon(n.type);

      return {
        id: n.id,
        position: { x: 40 + col * 270, y: 40 + row * 135 },
        data: {
          label: (
            <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] font-sans text-xs cursor-pointer transition-all hover:border-[var(--blue-primary)] shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] text-[var(--text-primary)]">
                  {icon}
                  <span>{n.type}</span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${badgeStyle}`}>
                  {n.severity}
                </span>
              </div>
              <div className="font-semibold text-[var(--text-primary)] truncate max-w-[180px]">{n.label}</div>
            </div>
          )
        }
      };
    });
  }, [graphData.nodes]);

  const initialEdges: Edge[] = useMemo(() => {
    return graphData.edges.map((e, idx) => ({
      id: `e-${idx}`,
      source: e.source,
      target: e.target,
      label: e.relationship,
      animated: true,
      style: { stroke: '#0284C7', strokeWidth: 1.75 },
      labelStyle: { fill: 'var(--text-secondary)', fontWeight: 600, fontSize: 10 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#0284C7' }
    }));
  }, [graphData.edges]);

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* ── Page Header ── */}
      <PageHeader
        breadcrumbs={['ANVESHAK', caseDetail.case_id, 'Correlation', 'Attack Graph']}
        title="Attack Graph Correlator"
        description="Visualise actor-infrastructure relationships across cases to surface campaign patterns, shared domain nodes, and threat infrastructure."
        metadata={
          <>
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] font-medium text-[var(--text-secondary)]">
              {graphData.nodes.length} Infrastructure Nodes
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] font-medium text-[var(--text-secondary)]">
              {graphData.edges.length} Correlated Links
            </span>
          </>
        }
      />

      {/* ── ReactFlow Graph Canvas ── */}
      <div className="tracex-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 text-xs">
          <span className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Network className="w-4 h-4 text-[var(--blue-primary)]" />
            Infrastructure Topology Diagram
          </span>
          <span className="text-[var(--text-muted)] text-[11px]">Click any node to inspect relationship details</span>
        </div>

        <div className="w-full h-[520px] rounded-lg bg-[var(--surface-2)] border border-[var(--border)] overflow-hidden relative">
          <ReactFlow
            nodes={initialNodes}
            edges={initialEdges}
            onNodeClick={(_, node) => {
              const matched = graphData.nodes.find(n => n.id === node.id);
              if (matched) setSelectedNode(matched);
            }}
            fitView
          >
            <Background color="var(--border)" gap={20} size={1} />
            <Controls className="!bg-[var(--surface)] !border-[var(--border)] !text-[var(--text-primary)]" />
          </ReactFlow>
        </div>
      </div>

      {/* ── Selected Node Details Inspector ── */}
      {selectedNode && (
        <div className="tracex-card p-5 space-y-3 text-xs animate-fade-in border-t-2 border-t-[var(--blue-primary)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
            <h3 className="font-bold text-[var(--text-primary)] text-sm">Node Telemetry: {selectedNode.label}</h3>
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
              selectedNode.severity === 'CRITICAL' ? 'badge-critical' : selectedNode.severity === 'HIGH' ? 'badge-high' : 'badge-safe'
            }`}>
              {selectedNode.severity}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded bg-[var(--surface-2)] border border-[var(--border)]">
              <span className="text-[var(--text-muted)] text-[10px] uppercase font-semibold">Node Type</span>
              <p className="font-bold text-[var(--text-primary)] mt-0.5">{selectedNode.type}</p>
            </div>
            <div className="p-3 rounded bg-[var(--surface-2)] border border-[var(--border)]">
              <span className="text-[var(--text-muted)] text-[10px] uppercase font-semibold">Identifier</span>
              <p className="code-mono font-bold text-[var(--blue-primary)] mt-0.5 truncate">{selectedNode.label}</p>
            </div>
            <div className="p-3 rounded bg-[var(--surface-2)] border border-[var(--border)]">
              <span className="text-[var(--text-muted)] text-[10px] uppercase font-semibold">Threat Score</span>
              <p className="font-bold text-rose-600 dark:text-rose-400 mt-0.5">High Exposure</p>
            </div>
            <div className="p-3 rounded bg-[var(--surface-2)] border border-[var(--border)]">
              <span className="text-[var(--text-muted)] text-[10px] uppercase font-semibold">Linked Campaigns</span>
              <p className="font-bold text-[var(--text-primary)] mt-0.5">2 Correlated Cases</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
