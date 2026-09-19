import { apiClient } from './api/client';

export type ActionApprovalStatus = 'PENDING' | 'APPROVED' | 'SUCCESS';

export interface RecommendedAction {
  id: string;
  title: string;
  reason: string;
  risk: string;
  authorization: string;
  status: ActionApprovalStatus;
}

export interface AIAnalysisResult {
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  confidenceScore: number;
  explanation: string;
  attackChain: {
    ip: string;
    user: string;
    device: string;
    privilege: string;
    resource: string;
  };
  evidence: Array<{
    id: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    metadata?: string;
    type: 'event' | 'device';
  }>;
  recommendations: RecommendedAction[];
  mitreTags: string[];
}

export const aiAnalystService = {
  askAnalyst: async (query: string): Promise<AIAnalysisResult> => {
    try {
      const response = await apiClient.post<any>(`/incidents/${query}/analyze`);
      const analysis = response.analysis || {};
      
      return {
        riskLevel: 'HIGH', // Placeholder since backend doesn't return risk level yet
        confidenceScore: (analysis.confidence_score || 0.94) * 100, // Backend returns decimal
        explanation: analysis.attack_story || "Analysis complete.",
        attackChain: {
          ip: "10.0.0.50",
          user: "Unknown",
          device: "Unknown Device",
          privilege: "Unknown",
          resource: "Unknown Resource"
        }, // Placeholders for missing backend fields
        evidence: [
          { id: 'ev-1', description: 'Anomaly Detected', severity: 'high', type: 'event' }
        ], // Placeholder for missing backend fields
        recommendations: (analysis.recommended_actions || []).map((action: any, index: number) => ({
          id: action.action_id || `rec-${index}`,
          title: action.type || 'Unknown Action',
          reason: action.description || 'Recommended by AI Analyst',
          risk: 'HIGH',
          authorization: 'PENDING HUMAN APPROVAL',
          status: 'PENDING'
        })),
        mitreTags: analysis.mitre_tags || []
      };
    } catch (error) {
      console.error("AI Analysis failed:", error);
      throw error;
    }
  },

  approveAction: async (actionId: string): Promise<void> => {
    console.log(`[SentinelFlow] Triggering Step Functions workflow for action: ${actionId}`);
    // In a fully deployed environment, this would hit the API Gateway:
    // await apiClient.post(`/actions/${actionId}/approve`);
    
    // For the hackathon demo, simulate the network delay of Step Functions execution
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`[SentinelFlow] Action ${actionId} successfully executed.`);
        resolve();
      }, 1500);
    });
  }
};
