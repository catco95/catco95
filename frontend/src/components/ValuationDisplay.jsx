import React from 'react';

const ValuationDisplay = ({ valuation, confirmedFields, totalFields, currency = 'USD', currencies = {} }) => {
  const formatCurrency = (value) => {
    if (!value) return '-';
    
    // Convert from USD to selected currency
    const rate = currencies[currency]?.rate || 1;
    const symbol = currencies[currency]?.symbol || '$';
    const convertedValue = Math.round(value * rate);
    
    // Format based on currency
    if (currency === 'JPY') {
      return `${symbol}${convertedValue.toLocaleString()}`;
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      maximumFractionDigits: 0
    }).format(convertedValue).replace(/^/, symbol);
  };

  const getConfidenceColor = (level) => {
    switch (level) {
      case 'high': return 'text-teal-400';
      case 'medium': return 'text-gold';
      case 'low': return 'text-orange-400';
      default: return 'text-emerald-100/50';
    }
  };

  const getConfidenceProgressColor = (level) => {
    switch (level) {
      case 'high': return 'bg-teal-500';
      case 'medium': return 'bg-gold';
      case 'low': return 'bg-orange-500';
      default: return 'bg-emerald-700';
    }
  };

  if (!valuation) {
    return (
      <div className="glass-card rounded-2xl p-8 h-full flex flex-col items-center justify-center text-center" data-testid="valuation-placeholder">
        <div className="w-24 h-24 mb-6 rounded-full bg-emerald-800/30 flex items-center justify-center">
          <svg className="w-12 h-12 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-serif text-gold/60 mb-2">Valuation Results</h3>
        <p className="text-emerald-100/40 text-sm max-w-xs">
          Enter watch details or scan with camera, then click &quot;Get Valuation&quot; to see market estimates.
        </p>
        
        {/* Confirmation status */}
        <div className="mt-8 w-full max-w-xs">
          <div className="flex justify-between text-xs text-emerald-100/50 mb-2">
            <span>Fields Confirmed</span>
            <span>{confirmedFields?.length || 0} / {totalFields}</span>
          </div>
          <div className="h-1.5 bg-emerald-800/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-700 rounded-full transition-all duration-500"
              style={{ width: `${((confirmedFields?.length || 0) / totalFields) * 100}%` }}
            ></div>
          </div>
          <p className="text-emerald-100/30 text-xs mt-2">
            Confirm detected fields to increase valuation confidence
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 space-y-6" data-testid="valuation-display">
      {/* Header */}
      <div className="text-center border-b border-emerald-800/50 pb-4">
        <h2 className="text-lg font-serif text-gold">Market Valuation</h2>
        <p className="text-emerald-100/50 text-sm">{valuation.calibration_mode} Mode</p>
      </div>

      {/* Confidence Indicator */}
      <div className="bg-emerald-900/30 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-emerald-100/60 text-sm">Confidence Level</span>
          <span className={`font-medium capitalize ${getConfidenceColor(valuation.confidence_level)}`} data-testid="confidence-level">
            {valuation.confidence_level}
          </span>
        </div>
        <div className="relative h-2 bg-emerald-800/50 rounded-full overflow-hidden">
          <div 
            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${getConfidenceProgressColor(valuation.confidence_level)}`}
            style={{ width: `${valuation.confidence_percentage}%` }}
            data-testid="confidence-progress"
          ></div>
        </div>
        <p className="text-xs text-emerald-100/40 mt-2">
          {valuation.confidence_percentage}% - Based on {confirmedFields?.length || 0} confirmed fields
        </p>
      </div>

      {/* Price Bands */}
      <div className="space-y-4">
        {/* Low */}
        <div className="flex items-center justify-between p-4 bg-emerald-900/20 rounded-xl border border-emerald-800/30">
          <div>
            <p className="text-teal-400 text-sm font-medium">Low Estimate</p>
            <p className="text-emerald-100/40 text-xs">Quick sale / wholesale</p>
          </div>
          <p className="text-2xl font-light text-teal-300" data-testid="low-estimate">
            {formatCurrency(valuation.low_estimate)}
          </p>
        </div>

        {/* Fair - Highlighted */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-gold/10 to-yellow-600/10 rounded-xl border border-gold/30">
          <div>
            <p className="text-gold font-medium">Fair Market Value</p>
            <p className="text-gold/50 text-xs">Realistic trade expectation</p>
          </div>
          <p className="text-3xl font-semibold text-gold" data-testid="fair-estimate">
            {formatCurrency(valuation.fair_estimate)}
          </p>
        </div>

        {/* High */}
        <div className="flex items-center justify-between p-4 bg-emerald-900/20 rounded-xl border border-emerald-800/30">
          <div>
            <p className="text-emerald-400 text-sm font-medium">High Estimate</p>
            <p className="text-emerald-100/40 text-xs">Patient retail sale</p>
          </div>
          <p className="text-2xl font-light text-emerald-300" data-testid="high-estimate">
            {formatCurrency(valuation.high_estimate)}
          </p>
        </div>
      </div>

      {/* Currency indicator */}
      <div className="text-center">
        <span className="text-xs text-emerald-100/40">
          Values shown in {currencies[currency]?.name || 'US Dollars'} ({currency})
        </span>
      </div>

      {/* Notes */}
      {valuation.notes && valuation.notes.length > 0 && (
        <div className="bg-emerald-900/20 rounded-xl p-4">
          <h4 className="text-emerald-100/60 text-sm font-medium mb-2">Notes</h4>
          <ul className="space-y-1">
            {valuation.notes.map((note, index) => (
              <li key={index} className="text-emerald-100/40 text-xs flex items-start gap-2">
                <span className="text-gold/60">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Breakdown Toggle */}
      {valuation.breakdown && Object.keys(valuation.breakdown).length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-emerald-100/50 text-sm hover:text-emerald-100/70 transition-colors list-none flex items-center gap-2">
            <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            View Calculation Breakdown
          </summary>
          <div className="mt-3 bg-emerald-900/20 rounded-lg p-4 space-y-2">
            {Object.entries(valuation.breakdown).map(([key, value]) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="text-emerald-100/40">{key.replace(/_/g, ' ')}</span>
                <span className="text-emerald-100/60 font-mono">
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
      <div className="pt-4 border-t border-emerald-800/30">
        <p className="text-emerald-100/30 text-xs text-center">
          ⚠️ This is market intelligence, not an appraisal. 
          Values reflect trade-level expectations and may vary.
        </p>
      </div>
    </div>
  );
};

export default ValuationDisplay;
