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
}

const deterministicResponse: AIAnalysisResult = {
  riskLevel: 'HIGH',
  confidenceScore: 94,
  explanation: "This incident exhibits a credential compromise and privilege escalation pattern. The attacker successfully gained entry after repeated authentication failures, accessed the account from an unrecognized device, escalated privileges, and accessed a sensitive resource.",
  attackChain: {
    ip: "192.168.1.45",
    user: "john.doe",
    device: "DEV-8821",
    privilege: "SuperAdmin",
    resource: "Customer DB"
  },
  evidence: [
    { id: 'ev-1', description: '27 failed logins', metadata: 'Source: 192.168.1.45', severity: 'medium', type: 'event' },
    { id: 'ev-2', description: 'Successful login', severity: 'medium', type: 'event' },
    { id: 'ev-3', description: 'Unrecognized device', metadata: 'Device: DEV-8821', severity: 'high', type: 'device' },
    { id: 'ev-4', description: 'Privilege escalation', metadata: 'User → SuperAdmin', severity: 'high', type: 'event' },
    { id: 'ev-5', description: 'Sensitive resource access', metadata: 'Customer DB', severity: 'critical', type: 'event' }
  ],
  recommendations: [
    {
      id: 'rec-1',
      title: 'Revoke active session',
      reason: 'Suspicious session originated from an unrecognized device.',
      risk: 'MEDIUM',
      authorization: 'PENDING HUMAN APPROVAL',
      status: 'PENDING'
    },
    {
      id: 'rec-2',
      title: 'Force MFA re-authentication',
      reason: 'Account credentials may be compromised.',
      risk: 'LOW',
      authorization: 'PENDING HUMAN APPROVAL',
      status: 'PENDING'
    },
    {
      id: 'rec-3',
      title: 'Block source IP',
      reason: '192.168.1.45 exhibits malicious brute force behavior.',
      risk: 'HIGH',
      authorization: 'PENDING HUMAN APPROVAL',
      status: 'PENDING'
    }
  ]
};

export const aiAnalystService = {
  askAnalyst: async (_query: string): Promise<AIAnalysisResult> => {
    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(JSON.parse(JSON.stringify(deterministicResponse))); // Return clone
      }, 1500);
    });
  },

  approveAction: async (_actionId: string): Promise<void> => {
    // Simulate approval delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  }
};
