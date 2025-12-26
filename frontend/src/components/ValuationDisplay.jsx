import React from 'react';
import { Progress } from '@/components/ui/progress';

const ValuationDisplay = ({ valuation, confirmedFields, totalFields }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getConfidenceColor = (level) => {
    switch (level) {
      case 'high': return 'text-emerald-400';
      case 'medium': return 'text-amber-400';
      case 'low': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getConfidenceProgressColor = (level) => {
    switch (level) {
      case 'high': return 'bg-emerald-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  if (!valuation) {
    return (
      <div className="glass-card rounded-2xl p-8 h-full flex flex-col items-center justify-center text-center" data-testid="valuation-placeholder">
        <div className="w-24 h-24 mb-6 rounded-full bg-slate-800/50 flex items-center justify-center">
          <svg className="w-12 h-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-serif text-amber-100/60 mb-2">Valuation Results</h3>
        <p className="text-slate-500 text-sm max-w-xs">
          Enter watch details or scan with camera, then click "Get Valuation" to see market estimates.
        </p>
        
        {/* Confirmation status */}
        <div className="mt-8 w-full max-w-xs">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>Fields Confirmed</span>
            <span>{confirmedFields?.length || 0} / {totalFields}</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-slate-600 rounded-full transition-all duration-500"
              style={{ width: `${((confirmedFields?.length || 0) / totalFields) * 100}%` }}
            ></div>
          </div>
          <p className="text-slate-600 text-xs mt-2">
            Confirm detected fields to increase valuation confidence
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 space-y-6" data-testid="valuation-display">
      {/* Header */}
      <div className="text-center border-b border-slate-800 pb-4">
        <h2 className="text-lg font-serif text-amber-100">Market Valuation</h2>
        <p className="text-slate-500 text-sm">{valuation.calibration_mode} Mode</p>
      </div>

      {/* Confidence Indicator */}
      <div className="bg-slate-900/50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400 text-sm">Confidence Level</span>
          <span className={`font-medium capitalize ${getConfidenceColor(valuation.confidence_level)}`} data-testid="confidence-level">
            {valuation.confidence_level}
          </span>
        </div>
        <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${getConfidenceProgressColor(valuation.confidence_level)}`}
            style={{ width: `${valuation.confidence_percentage}%` }}
            data-testid="confidence-progress"
          ></div>
        </div>
        <p className="text-xs text-slate-600 mt-2">
          {valuation.confidence_percentage}% - Based on {confirmedFields?.length || 0} confirmed fields
        </p>
      </div>

      {/* Price Bands */}
      <div className="space-y-4">
        {/* Low */}
        <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl border border-slate-800">
          <div>
            <p className="text-blue-400 text-sm font-medium">Low Estimate</p>
            <p className="text-slate-500 text-xs">Quick sale / wholesale</p>
          </div>
          <p className="text-2xl font-light text-blue-300" data-testid="low-estimate">
            {formatCurrency(valuation.low_estimate)}
          </p>
        </div>

        {/* Fair - Highlighted */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-amber-500/10 to-amber-600/10 rounded-xl border border-amber-500/30">
          <div>
            <p className="text-amber-400 font-medium">Fair Market Value</p>
            <p className="text-amber-500/60 text-xs">Realistic trade expectation</p>
          </div>
          <p className="text-3xl font-semibold text-amber-300" data-testid="fair-estimate">
            {formatCurrency(valuation.fair_estimate)}
          </p>
        </div>

        {/* High */}
        <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl border border-slate-800">
          <div>
            <p className="text-emerald-400 text-sm font-medium">High Estimate</p>
            <p className="text-slate-500 text-xs">Patient retail sale</p>
          </div>
          <p className="text-2xl font-light text-emerald-300" data-testid="high-estimate">
            {formatCurrency(valuation.high_estimate)}
          </p>
        </div>
      </div>

      {/* Notes */}
      {valuation.notes && valuation.notes.length > 0 && (
        <div className="bg-slate-900/30 rounded-xl p-4">
          <h4 className="text-slate-400 text-sm font-medium mb-2">Notes</h4>
          <ul className="space-y-1">
            {valuation.notes.map((note, index) => (
              <li key={index} className="text-slate-500 text-xs flex items-start gap-2">
                <span className="text-amber-500/60">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Breakdown Toggle */}
      {valuation.breakdown && Object.keys(valuation.breakdown).length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-slate-500 text-sm hover:text-slate-400 transition-colors list-none flex items-center gap-2">
            <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            View Calculation Breakdown
          </summary>
          <div className="mt-3 bg-slate-900/30 rounded-lg p-4 space-y-2">
            {Object.entries(valuation.breakdown).map(([key, value]) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="text-slate-500">{key.replace(/_/g, ' ')}</span>
                <span className="text-slate-400 font-mono">
                  {typeof value === 'number' ? 
                    (value > 100 ? formatCurrency(value) : value.toFixed(2)) : 
                    value
                  }
                </span>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Disclaimer */}
      <div className="pt-4 border-t border-slate-800">
        <p className="text-slate-600 text-xs text-center">
          ⚠️ This is market intelligence, not an appraisal. 
          Values reflect trade-level expectations and may vary.
        </p>
      </div>
    </div>
  );
};

export default ValuationDisplay;
