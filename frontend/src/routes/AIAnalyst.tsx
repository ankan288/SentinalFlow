import React, { useState, useEffect } from 'react';
import { InvestigationContext } from '../components/ai/InvestigationContext';
import { AnalystQuery } from '../components/ai/AnalystQuery';
import { AIAnalysis } from '../components/ai/AIAnalysis';
import { RecommendedResponse } from '../components/ai/RecommendedResponse';
import { ResponseReviewModal } from '../components/ai/ResponseReviewModal';
import { aiAnalystService } from '../services/aiAnalystService';
import type { AIAnalysisResult, RecommendedAction } from '../services/aiAnalystService';
import { Loader2 } from 'lucide-react';

export const AIAnalyst: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [currentQuery, setCurrentQuery] = useState<string | null>(null);
  
  // Review Modal State
  const [reviewAction, setReviewAction] = useState<RecommendedAction | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  // Auto-scroll to bottom when new content appears
  useEffect(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }, [analysisResult, reviewAction]);

  const handleQuerySubmit = async (query: string) => {
    setIsAnalyzing(true);
    setAnalysisResult(null); // Clear previous
    setCurrentQuery(query);
    
    try {
      const result = await aiAnalystService.askAnalyst(query);
      setAnalysisResult(result);
    } catch (error) {
      console.error("Failed to analyze query", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReviewAction = (action: RecommendedAction) => {
    setReviewAction(action);
  };

  const handleApproveAction = async (actionId: string) => {
    if (!analysisResult) return;
    
    setIsApproving(true);
    
    try {
      await aiAnalystService.approveAction(actionId);
      
      // Update local state to reflect approval
      setAnalysisResult(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          recommendations: prev.recommendations.map(rec => 
            rec.id === actionId ? { ...rec, status: 'SUCCESS' } : rec
          )
        };
      });
      
      setReviewAction(null);
    } catch (error) {
      console.error("Failed to approve action", error);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: 'var(--space-8)' }}>
      <header style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-1)', color: '#ffffff' }}>AI Security Analyst</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Investigate incidents, correlate evidence, and understand attack activity.</p>
      </header>
      
      <div style={{ flex: 1, maxWidth: '800px', display: 'flex', flexDirection: 'column' }}>
        {currentQuery && <InvestigationContext incidentId={currentQuery} />}
        
        <AnalystQuery onQuerySubmit={handleQuerySubmit} isLoading={isAnalyzing} />

        {isAnalyzing && (
          <div style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)', 
            padding: 'var(--space-8)', color: 'var(--color-action)' 
          }}>
            <Loader2 className="animate-spin" /> Analyzing security telemetry...
          </div>
        )}

        {analysisResult && !isAnalyzing && (
          <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            <AIAnalysis result={analysisResult} />
            <RecommendedResponse 
              recommendations={analysisResult.recommendations} 
              onReviewAction={handleReviewAction} 
            />
          </div>
        )}
        
        {!analysisResult && !isAnalyzing && (
          <div style={{ 
            marginTop: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)', 
            fontSize: '0.875rem', padding: 'var(--space-8)', border: '1px dashed var(--border-medium)', borderRadius: 'var(--radius-lg)' 
          }}>
            Ask the analyst about an incident, user, IP address, device, or event.
          </div>
        )}
      </div>

      {reviewAction && (
        <ResponseReviewModal 
          action={reviewAction} 
          onClose={() => setReviewAction(null)}
          onApprove={handleApproveAction}
          isApproving={isApproving}
        />
      )}
    </div>
  );
};
