/**
 * API Integration Layer for Incidents
 * 
 * This file serves as the contract between the Frontend and Backend teams.
 * Currently uses mock delays to simulate network requests. 
 * The Backend team will replace the implementation of these functions with 
 * actual AWS Amplify API / GraphQL calls in the future.
 */

export interface IncidentSummary {
  id: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Investigating' | 'Resolved';
  timestamp: string;
}

export const getIncidents = async (): Promise<IncidentSummary[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // TODO: Replace with AWS Amplify API call: 
  // const response = await client.graphql({ query: listIncidents });
  
  return [
    { id: 'INC-047', title: 'Multiple failed logins followed by privilege escalation', severity: 'High', status: 'Open', timestamp: '10:32 AM' },
    { id: 'INC-046', title: 'Unusual outbound traffic to known malicious IP', severity: 'Critical', status: 'Investigating', timestamp: '09:15 AM' },
    { id: 'INC-045', title: 'New AWS IAM user created outside standard terraform workflow', severity: 'Medium', status: 'Open', timestamp: 'Yesterday' },
  ];
};

export const getIncidentDetails = async (id: string) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // TODO: Replace with AWS Amplify API call: 
  // const response = await client.graphql({ query: getIncident, variables: { id } });

  return {
    id,
    title: 'Multiple failed logins followed by privilege escalation',
    severity: 'High',
    status: 'Open',
    // ... other full detail properties that the UI would consume
  };
};
