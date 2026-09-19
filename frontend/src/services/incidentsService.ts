import { apiClient } from './api/client';

export interface Incident {
  id: string;
  type: string;
  severity: string;
  user: string;
  source: string;
  detected: string;
  status: string;
  // Based on IncidentId, Status, CreatedAt in DynamoDB, it might have more fields.
  IncidentId?: string;
  Status?: string;
  CreatedAt?: string;
}

export interface GetIncidentsResponse {
  incidents: Incident[];
  next_token?: string | null;
}

export const incidentsService = {
  getIncidents: async (limit: number = 50, nextToken?: string): Promise<GetIncidentsResponse> => {
    let url = `/incidents?limit=${limit}`;
    if (nextToken) {
      url += `&next_token=${encodeURIComponent(nextToken)}`;
    }
    
    // The backend returns { "incidents": [...], "next_token": ... }
    const response = await apiClient.get<any>(url);
    
    // Map backend DynamoDB fields to frontend fields
    const mappedIncidents: Incident[] = (response.incidents || []).map((inc: any) => ({
      id: inc.IncidentId || 'UNKNOWN',
      type: inc.Type || 'Security Incident',
      severity: inc.Severity || 'Medium',
      user: inc.User || 'Unknown User',
      source: inc.Source || 'Unknown Source',
      detected: inc.CreatedAt || new Date().toISOString(),
      status: inc.Status === 'ANALYZED' ? 'Investigating' : (inc.Status || 'Active'),
      ...inc
    }));

    return {
      incidents: mappedIncidents,
      next_token: response.next_token
    };
  },

  getIncidentById: async (id: string): Promise<Incident> => {
    const response = await apiClient.get<any>(`/incidents/${id}`);
    
    return {
      id: response.IncidentId || id,
      type: response.Type || 'Security Incident',
      severity: response.Severity || 'Medium',
      user: response.User || 'Unknown User',
      source: response.Source || 'Unknown Source',
      detected: response.CreatedAt || new Date().toISOString(),
      status: response.Status === 'ANALYZED' ? 'Investigating' : (response.Status || 'Active'),
      ...response
    };
  }
};
