import { incidentsService } from './incidentsService';

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

export const eventsService = {
  getEvents: async (): Promise<SecurityEvent[]> => {
    try {
      const response = await incidentsService.getIncidents(50);
      const incidents = response.incidents || [];
      
      return incidents.map((inc: any) => {
        let contextData: any = {};
        try {
          if (inc.ContextData) {
            contextData = typeof inc.ContextData === 'string' ? JSON.parse(inc.ContextData) : inc.ContextData;
          }
        } catch (e) {
          console.warn('Failed to parse ContextData for incident', inc.id);
        }
        
        let type: EventType = 'System';
        if (contextData.event_type === 'brute_force') type = 'Authentication';
        if (contextData.event_type === 'unauthorized_access') type = 'Authorization';
        if (contextData.event_type === 'data_exfiltration') type = 'Resource Access';
        
        return {
          id: inc.id || `EVT-${Math.floor(Math.random()*1000)}`,
          timestamp: inc.detected ? new Date(inc.detected).toLocaleTimeString() : new Date().toLocaleTimeString(),
          type: type,
          source: contextData.source_ip || inc.source || 'Unknown',
          user: contextData.user || inc.user || 'Unknown User',
          resource: contextData.target || 'Unknown System',
          severity: (inc.severity?.toUpperCase() as EventSeverity) || 'MEDIUM',
          status: inc.status === 'NEW' ? 'SUSPICIOUS' : 'CORRELATED',
          description: inc.Description || contextData.details || 'Detected Security Event',
          relatedIncidentId: inc.id,
          relatedIncidentName: inc.type
        };
      });
    } catch (err) {
      console.error('Failed to fetch real events:', err);
      return [];
    }
  },
  
  getEventById: async (id: string): Promise<SecurityEvent | undefined> => {
    const events = await eventsService.getEvents();
    return events.find(e => e.id === id);
  }
};

