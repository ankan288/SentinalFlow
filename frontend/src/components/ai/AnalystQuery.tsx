import React, { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';

interface AnalystQueryProps {
  onQuerySubmit: (query: string) => void;
  isLoading: boolean;
}

const suggestedPrompts = [
  "Why high risk?",
  "Trace attack",
  "Show suspicious events",
  "What changed?",
  "Explain privilege escalation",
  "What should I do next?"
];

export const AnalystQuery: React.FC<AnalystQueryProps> = ({ onQuerySubmit, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onQuerySubmit(query.trim());
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <div style={{ 
          flex: 1, 
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask the Security Analyst..."
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px 12px 12px 40px',
              backgroundColor: 'rgba(8, 13, 23, 0.62)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid rgba(255, 255, 255, 0.09)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-action)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.09)'}
          />
        </div>
        <Button 
          type="submit" 
          variant="primary" 
          disabled={isLoading || !query.trim()}
          style={{ padding: '0 24px' }}
        >
          {isLoading ? '...' : 'Ask'}
        </Button>
      </form>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        {suggestedPrompts.map(prompt => (
          <button
            key={prompt}
            onClick={() => {
              setQuery(prompt);
              if (!isLoading) onQuerySubmit(prompt);
            }}
            disabled={isLoading}
            style={{
              backgroundColor: 'rgba(15, 22, 35, 0.48)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: 'var(--text-secondary)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = 'rgba(30, 40, 58, 0.60)';
                e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.13)';
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = 'rgba(15, 22, 35, 0.48)';
                e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {prompt} <ArrowRight size={12} />
          </button>
        ))}
      </div>
    </div>
  );
};
