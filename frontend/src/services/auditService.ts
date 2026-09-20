import { apiClient } from './api/client';

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  auth: string;
  result: string;
}

export const auditService = {
  getAuditLogs: async (): Promise<AuditLogItem[]> => {
    try {
      const response = await apiClient.get<any>('/audit');
      const logs = response.audit_logs || [];
      
      return logs.map((log: any) => ({
        id: log.AuditId || `AL-${Math.floor(Math.random() * 10000)}`,
        timestamp: log.Timestamp ? new Date(log.Timestamp).toLocaleString() : 'Unknown Time',
        actor: log.Executor || 'Unknown User',
        action: log.ActionTaken || 'Unknown Action',
        auth: log.AuthorizationSource || 'Unknown Source',
        result: log.ApprovalSource === 'Human Workflow' && log.ActionTaken.includes('revocation') ? 'APPROVED' : 'SUCCESS'
      }));
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
      return [];
    }
  }
};
