import React, { createContext, useContext, useState } from 'react';

interface ActionData {
  id: string;
  title: string;
  type: 'session' | 'mfa' | 'network';
  reason: string;
  risk: 'Low' | 'Medium' | 'High';
  authStatus: 'Cedar Authorized' | 'Pending Admin' | 'Blocked';
  approved: boolean;
}

interface ResponseContextType {
  actions: ActionData[];
  approveAction: (id: string) => Promise<void>;
}

const defaultActions: ActionData[] = [
  {
    id: 'a1',
    title: 'Revoke Session',
    type: 'session',
    reason: 'Immediately terminates access for the compromised admin account.',
    risk: 'High',
    authStatus: 'Cedar Authorized',
    approved: false
  },
  {
    id: 'a2',
    title: 'Force MFA on Re-login',
    type: 'mfa',
    reason: 'Ensures the attacker cannot log back in with just compromised credentials.',
    risk: 'Low',
    authStatus: 'Cedar Authorized',
    approved: false
  },
  {
    id: 'a3',
    title: 'Block Source IP',
    type: 'network',
    reason: 'Prevents further brute force attempts from 192.168.1.45 at the firewall level.',
    risk: 'Medium',
    authStatus: 'Pending Admin',
    approved: false
  }
];

const ResponseContext = createContext<ResponseContextType>({
  actions: defaultActions,
  approveAction: async () => {},
});

export const useResponse = () => useContext(ResponseContext);

export const ResponseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [actions, setActions] = useState<ActionData[]>(defaultActions);

  const approveAction = async (id: string) => {
    // Simulate an API call to the backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    setActions(prev => prev.map(a => a.id === id ? { ...a, approved: true } : a));
  };

  return (
    <ResponseContext.Provider value={{ actions, approveAction }}>
      {children}
    </ResponseContext.Provider>
  );
};
