export type EventSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
export type EventStatus = 'CORRELATED' | 'OBSERVED' | 'SUSPICIOUS';
export type EventType = 'Authentication' | 'Authorization' | 'Privilege' | 'Device' | 'Network' | 'Resource Access' | 'System';

export interface SecurityEvent {
  id: string;
  timestamp: string;
  type: EventType;
  source: string;
  user: string;
  resource: string;
  severity: EventSeverity;
  status: EventStatus;
  description: string;
  device?: string;
  previousRole?: string;
  newRole?: string;
  relatedIncidentId?: string;
  relatedIncidentName?: string;
}

// Generate the specific demo sequence plus some noise
const mockEvents: SecurityEvent[] = [
  ...Array.from({ length: 27 }).map((_, i) => ({
    id: `EVT-${(1000 + i).toString()}`,
    timestamp: `11:38:${(10 + i).toString().padStart(2, '0')}`,
    type: 'Authentication' as EventType,
    source: '192.168.1.45',
    user: 'john.doe',
    resource: 'Auth Service',
    severity: 'MEDIUM' as EventSeverity,
    status: 'OBSERVED' as EventStatus,
    description: 'Failed Login',
  })),
  {
    id: 'EVT-1027',
    timestamp: '11:39:02',
    type: 'Authentication',
    source: '192.168.1.45',
    user: 'john.doe',
    resource: 'Auth Service',
    severity: 'HIGH',
    status: 'CORRELATED',
    description: 'Successful Login',
    relatedIncidentId: 'INC-047',
    relatedIncidentName: 'Credential Compromise'
  },
  {
    id: 'EVT-1028',
    timestamp: '11:39:15',
    type: 'Device',
    source: '192.168.1.45',
    user: 'john.doe',
    resource: 'Auth Service',
    severity: 'HIGH',
    status: 'SUSPICIOUS',
    description: 'New Device',
    device: 'DEV-8821'
  },
  {
    id: 'EVT-1029',
    timestamp: '11:40:11',
    type: 'Privilege',
    source: '192.168.1.45',
    user: 'john.doe',
    resource: 'IAM Service',
    severity: 'CRITICAL',
    status: 'CORRELATED',
    description: 'Privilege Escalation',
    previousRole: 'User',
    newRole: 'SuperAdmin',
    relatedIncidentId: 'INC-047',
    relatedIncidentName: 'Credential Compromise'
  },
  {
    id: 'EVT-1030',
    timestamp: '11:41:03',
    type: 'Resource Access',
    source: '192.168.1.45',
    user: 'john.doe',
    resource: 'Customer DB',
    severity: 'CRITICAL',
    status: 'CORRELATED',
    description: 'Database Access',
    relatedIncidentId: 'INC-047',
    relatedIncidentName: 'Credential Compromise'
  },
  // Add some background noise
  {
    id: 'EVT-1031',
    timestamp: '11:42:10',
    type: 'Network',
    source: '10.0.4.55',
    user: 'system',
    resource: 'Internal Gateway',
    severity: 'INFO',
    status: 'OBSERVED',
    description: 'Routine Health Check'
  },
  {
    id: 'EVT-1032',
    timestamp: '11:43:05',
    type: 'Authentication',
    source: '10.0.5.12',
    user: 'sarah.smith',
    resource: 'Auth Service',
    severity: 'LOW',
    status: 'OBSERVED',
    description: 'Successful Login'
  }
].reverse(); // Most recent first for the table

export const eventsService = {
  getEvents: async (): Promise<SecurityEvent[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(mockEvents), 600));
  },
  
  getEventById: async (id: string): Promise<SecurityEvent | undefined> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockEvents.find(e => e.id === id));
      }, 300);
    });
  }
};
