import { Handle, Position } from '@xyflow/react';
import { AttackNode } from './AttackNode';
import type { AttackNodeData } from './AttackNode';

export const ReactFlowAttackNode = ({ data, selected }: { data: AttackNodeData, selected?: boolean }) => {
  return (
    <div>
      <Handle type="target" position={Position.Left} style={{ background: '#555' }} />
      
      <AttackNode 
        data={data} 
        isSelected={!!selected} 
        onClick={() => {}} // ReactFlow handles selection natively, so we pass a no-op here
      />
      
      <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
    </div>
  );
};
