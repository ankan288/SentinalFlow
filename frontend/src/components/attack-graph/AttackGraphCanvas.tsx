import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { AttackNode } from './AttackNode';
import type { AttackNodeData } from './AttackNode';
import { NodeDetails } from './NodeDetails';

const mockGraphData: AttackNodeData[] = [
  { id: 'n1', type: 'IP', name: '192.168.1.45', status: 'suspicious', eventCount: 27 },
  { id: 'n2', type: 'User', name: 'admin@acme.com', status: 'compromised', eventCount: 3 },
  { id: 'n3', type: 'Device', name: 'MacBook Pro', status: 'suspicious', eventCount: 1 },
  { id: 'n4', type: 'Privilege', name: 'SuperAdmin', status: 'compromised', eventCount: 1 },
  { id: 'n5', type: 'Resource', name: 'Customer DB', status: 'targeted', eventCount: 4 },
];

export const AttackGraphCanvas: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<AttackNodeData | null>(null);

  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-medium)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-6)',
    }}>
      <h3 style={{ margin: 0, marginBottom: 'var(--space-6)', color: 'var(--text-primary)', fontSize: '1.125rem' }}>
        Attack Path
      </h3>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '0 var(--space-4)'
      }}>
        {mockGraphData.map((node, index) => (
          <React.Fragment key={node.id}>
            <AttackNode 
              data={node} 
              isSelected={selectedNode?.id === node.id}
              onClick={setSelectedNode}
            />
            
            {index < mockGraphData.length - 1 && (
              <div style={{ color: 'var(--border-strong)' }}>
                <ArrowRight size={24} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {selectedNode && (
        <NodeDetails 
          data={selectedNode} 
          onClose={() => setSelectedNode(null)} 
        />
      )}
    </div>
  );
};
