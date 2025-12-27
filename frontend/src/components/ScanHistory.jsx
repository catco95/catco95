import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const ScanHistory = ({ history, onSelectScan, onDeleteScan, onClearHistory, currency = 'USD', currencies = {} }) => {
  const formatCurrency = (value) => {
    if (!value) return '-';
    
    const rate = currencies[currency]?.rate || 1;
    const symbol = currencies[currency]?.symbol || '$';
    const convertedValue = Math.round(value * rate);
    
    if (currency === 'JPY') {
      return `${symbol}${convertedValue.toLocaleString()}`;
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      maximumFractionDigits: 0
    }).format(convertedValue).replace(/^/, symbol);
  };

  if (!history || history.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6" data-testid="scan-history-empty">
        <h2 className="text-lg font-serif text-gold border-b border-emerald-800/50 pb-3 mb-4">
          Recent Scans
        </h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-800/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-emerald-100/50 text-sm">No scans yet</p>
          <p className="text-emerald-100/30 text-xs mt-1">Your scan history will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6" data-testid="scan-history">
      <div className="flex items-center justify-between border-b border-emerald-800/50 pb-3 mb-4">
        <h2 className="text-lg font-serif text-gold">
          Recent Scans
        </h2>
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-xs text-emerald-100/40 hover:text-orange-400 transition-colors"
            data-testid="clear-history-btn"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {history.map((scan) => (
          <div
            key={scan.id}
            className="group relative bg-emerald-900/30 rounded-xl p-4 border border-emerald-800/30 hover:border-gold/30 transition-all cursor-pointer"
            onClick={() => onSelectScan(scan)}
            data-testid={`scan-item-${scan.id}`}
          >
            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteScan(scan.id);
              }}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-emerald-900 text-emerald-100/40 opacity-0 group-hover:opacity-100 hover:bg-orange-500/20 hover:text-orange-400 transition-all"
              data-testid={`delete-scan-${scan.id}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-start gap-3">
              {/* Thumbnail or placeholder */}
              <div className="w-14 h-14 rounded-lg bg-emerald-800/50 flex-shrink-0 overflow-hidden">
                {scan.image_thumbnail ? (
                  <img 
                    src={scan.image_thumbnail} 
                    alt={`${scan.brand} ${scan.model_family}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-gold font-medium text-sm truncate">
                    {scan.brand || 'Unknown'} {scan.model_family || ''}
                  </h4>
                </div>
                
                <div className="flex items-center gap-2 mt-1 text-xs text-emerald-100/40">
                  {scan.dial_color && <span>{scan.dial_color}</span>}
                  {scan.dial_color && scan.bezel_type && <span>•</span>}
                  {scan.bezel_type && <span>{scan.bezel_type}</span>}
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-gold text-sm font-medium">
                    {formatCurrency(scan.valuation_fair)}
                  </span>
                  <span className="text-emerald-100/30 text-xs">
                    {scan.timestamp && formatDistanceToNow(new Date(scan.timestamp), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScanHistory;
