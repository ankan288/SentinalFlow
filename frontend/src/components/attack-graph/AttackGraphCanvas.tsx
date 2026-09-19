import React, { useState, useCallback } from 'react';
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

const nodeTypes = {
  attackNode: ReactFlowAttackNode,
};

const initialNodes: Node[] = [
  { id: 'n1', type: 'attackNode', position: { x: 50, y: 100 }, data: { id: 'n1', type: 'IP', name: '192.168.1.45', status: 'suspicious', eventCount: 27 } },
  { id: 'n2', type: 'attackNode', position: { x: 250, y: 100 }, data: { id: 'n2', type: 'User', name: 'admin@acme.com', status: 'compromised', eventCount: 3 } },
  { id: 'n3', type: 'attackNode', position: { x: 450, y: 100 }, data: { id: 'n3', type: 'Device', name: 'MacBook Pro', status: 'suspicious', eventCount: 1 } },
  { id: 'n4', type: 'attackNode', position: { x: 650, y: 100 }, data: { id: 'n4', type: 'Privilege', name: 'SuperAdmin', status: 'compromised', eventCount: 1 } },
  { id: 'n5', type: 'attackNode', position: { x: 850, y: 100 }, data: { id: 'n5', type: 'Resource', name: 'Customer DB', status: 'targeted', eventCount: 4 } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'n1', target: 'n2', animated: true, style: { stroke: 'var(--color-high)' } },
  { id: 'e2-3', source: 'n2', target: 'n3', animated: true, style: { stroke: 'var(--color-critical)' } },
  { id: 'e3-4', source: 'n3', target: 'n4', animated: true, style: { stroke: 'var(--color-critical)' } },
  { id: 'e4-5', source: 'n4', target: 'n5', animated: true, style: { stroke: 'var(--color-high)' } },
];

export const AttackGraphCanvas: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<AttackNodeData | null>(null);

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
