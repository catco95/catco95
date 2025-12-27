import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const CALIBRATION_MODES = [
  {
    id: 'ultra_conservative',
    name: 'Ultra-Conservative',
    description: 'Maximum safety margin for quick liquidity',
    icon: '🛡️',
    color: 'text-teal-400'
  },
  {
    id: 'market_neutral',
    name: 'Market-Neutral',
    description: 'Balanced approach reflecting current market',
    icon: '⚖️',
    color: 'text-gold'
  },
  {
    id: 'patient_retail',
    name: 'Patient Retail',
    description: 'Optimistic pricing for patient sellers',
    icon: '📈',
    color: 'text-emerald-400'
  }
];

const CalibrationSelector = ({ selectedMode, onModeChange }) => {
  return (
    <div className="glass-card rounded-2xl p-6" data-testid="calibration-selector">
      <h2 className="text-lg font-serif text-gold border-b border-emerald-800/50 pb-3 mb-4">
        Dealer Calibration Mode
      </h2>
      
      <RadioGroup value={selectedMode} onValueChange={onModeChange} className="space-y-3">
        {CALIBRATION_MODES.map(mode => (
          <div
            key={mode.id}
            className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
              selectedMode === mode.id
                ? 'bg-emerald-800/30 border-gold/40'
                : 'bg-emerald-900/20 border-emerald-800/30 hover:border-emerald-700/50'
            }`}
            onClick={() => onModeChange(mode.id)}
            data-testid={`calibration-${mode.id}`}
          >
            <RadioGroupItem
              value={mode.id}
              id={mode.id}
              className="mt-1 border-emerald-700 data-[state=checked]:border-gold data-[state=checked]:bg-gold"
            />
            <div className="flex-1">
              <Label 
                htmlFor={mode.id} 
                className={`text-sm font-medium cursor-pointer ${mode.color}`}
              >
                <span className="mr-2">{mode.icon}</span>
                {mode.name}
              </Label>
              <p className="text-xs text-emerald-100/40 mt-1">{mode.description}</p>
            </div>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default CalibrationSelector;
