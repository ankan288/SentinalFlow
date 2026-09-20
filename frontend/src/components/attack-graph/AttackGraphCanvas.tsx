import React, { useState, useCallback, useEffect } from 'react';
import { 
  ReactFlow, 
  Controls, 
  Background, 
  applyNodeChanges, 
  applyEdgeChanges
} from '@xyflow/react';
import type { NodeChange, EdgeChange, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type { AttackNodeData } from './AttackNode';
import { ReactFlowAttackNode } from './ReactFlowAttackNode';
import { NodeDetails } from './NodeDetails';
import { eventsService } from '../../services/eventsService';

const nodeTypes = {
  attackNode: ReactFlowAttackNode,
};

export const AttackGraphCanvas: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<AttackNodeData | null>(null);

  useEffect(() => {
    const loadGraph = async () => {
      const events = await eventsService.getEvents();
      
      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];
      const nodeMap = new Set<string>();
      
      let xOffset = 50;
      let yOffset = 100;
      
      events.forEach((evt, idx) => {
        // Create source node (IP) if doesn't exist
        const sourceId = `ip-${evt.source}`;
        if (!nodeMap.has(sourceId) && evt.source !== 'Unknown') {
          nodeMap.add(sourceId);
          newNodes.push({
            id: sourceId,
            type: 'attackNode',
            position: { x: xOffset, y: yOffset + (idx * 50) % 200 },
            data: { id: sourceId, type: 'IP', name: evt.source, status: 'suspicious', eventCount: 1 }
          });
          xOffset += 200;
        }

        // Create target node (Resource) if doesn't exist
        const targetId = `res-${evt.resource}`;
        if (!nodeMap.has(targetId) && evt.resource !== 'Unknown System') {
          nodeMap.add(targetId);
          newNodes.push({
            id: targetId,
            type: 'attackNode',
            position: { x: xOffset, y: yOffset + (idx * 50) % 200 },
            data: { id: targetId, type: 'Resource', name: evt.resource, status: evt.status === 'CORRELATED' ? 'compromised' : 'targeted', eventCount: 1 }
          });
        }
        
        // Add edge
        if (evt.source !== 'Unknown' && evt.resource !== 'Unknown System') {
          const edgeId = `e-${sourceId}-${targetId}-${idx}`;
          newEdges.push({
            id: edgeId,
            source: sourceId,
            target: targetId,
            animated: true,
            style: { stroke: evt.severity === 'CRITICAL' || evt.severity === 'HIGH' ? 'var(--color-critical)' : 'var(--color-warning)' }
          });
        }
      });
      
      setNodes(newNodes);
      setEdges(newEdges);
    };
    
    loadGraph();
  }, []);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node.data as unknown as AttackNodeData);
  };

  const onPaneClick = () => {
    setSelectedNode(null);
  };

  return (
    <div style={{
      backgroundColor: 'rgba(8, 13, 23, 0.55)',
      backdropFilter: 'blur(18px) saturate(120%)',
      WebkitBackdropFilter: 'blur(18px) saturate(120%)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 10px 35px rgba(0, 0, 0, 0.28)',
      borderRadius: '16px',
      padding: 'var(--space-6)',
      height: '100%',
      minHeight: '600px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h3 style={{ margin: 0, marginBottom: 'var(--space-6)', color: 'var(--text-primary)', fontSize: '1.125rem' }}>
        Interactive Attack Path
      </h3>

      <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        {nodes.length > 0 ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            colorMode="dark"
          >
            <Background color="#333" gap={16} />
            <Controls />
          </ReactFlow>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
            No attack paths detected in the current incident data.
          </div>
        )}
      </div>

      {selectedNode && (
        <div style={{ marginTop: 'var(--space-4)' }}>
          <NodeDetails 
            data={selectedNode} 
            onClose={() => setSelectedNode(null)} 
          />
        </div>
      )}
    </div>
  );
};
