import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const ScanHistory = ({ history, onSelectScan, onDeleteScan, onClearHistory }) => {
  const formatCurrency = (value) => {
    if (!value) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (!history || history.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6" data-testid="scan-history-empty">
        <h2 className="text-lg font-serif text-amber-100 border-b border-slate-800 pb-3 mb-4">
          Recent Scans
        </h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-slate-500 text-sm">No scans yet</p>
          <p className="text-slate-600 text-xs mt-1">Your scan history will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6" data-testid="scan-history">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <h2 className="text-lg font-serif text-amber-100">
          Recent Scans
        </h2>
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-xs text-slate-500 hover:text-red-400 transition-colors"
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
            className="group relative bg-slate-900/50 rounded-xl p-4 border border-slate-800 hover:border-amber-500/30 transition-all cursor-pointer"
            onClick={() => onSelectScan(scan)}
            data-testid={`scan-item-${scan.id}`}
          >
            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteScan(scan.id);
              }}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-800 text-slate-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 transition-all"
              data-testid={`delete-scan-${scan.id}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-start gap-3">
              {/* Thumbnail or placeholder */}
              <div className="w-14 h-14 rounded-lg bg-slate-800 flex-shrink-0 overflow-hidden">
                {scan.image_thumbnail ? (
                  <img 
                    src={scan.image_thumbnail} 
                    alt={`${scan.brand} ${scan.model_family}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-amber-100 font-medium text-sm truncate">
                    {scan.brand || 'Unknown'} {scan.model_family || ''}
                  </h4>
                </div>
                
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  {scan.dial_color && <span>{scan.dial_color}</span>}
                  {scan.dial_color && scan.bezel_type && <span>•</span>}
                  {scan.bezel_type && <span>{scan.bezel_type}</span>}
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-amber-400 text-sm font-medium">
                    {formatCurrency(scan.valuation_fair)}
                  </span>
                  <span className="text-slate-600 text-xs">
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
