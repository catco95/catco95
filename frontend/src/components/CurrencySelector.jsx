import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CurrencySelector = ({ currencies, selectedCurrency, onCurrencyChange }) => {
  if (!currencies || Object.keys(currencies).length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3" data-testid="currency-selector">
      <span className="text-emerald-100/60 text-sm">Currency:</span>
      <Select value={selectedCurrency} onValueChange={onCurrencyChange}>
        <SelectTrigger 
          className="w-32 bg-emerald-900/30 border-emerald-700/50 text-gold h-9"
          data-testid="currency-select"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-emerald-950 border-emerald-800">
          {Object.entries(currencies).map(([code, data]) => (
            <SelectItem 
              key={code} 
              value={code}
              className="text-emerald-100 focus:bg-gold/20 focus:text-gold"
            >
              <span className="flex items-center gap-2">
                <span className="font-mono">{data.symbol}</span>
                <span>{code}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CurrencySelector;
