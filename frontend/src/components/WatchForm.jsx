import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import FieldStatusBadge from './FieldStatusBadge';

const WatchForm = ({
  watchData,
  fieldStatus,
  confirmedFields,
  referenceData,
  onFieldChange,
  onConfirmField,
  onRejectField
}) => {
  const renderFieldWithStatus = (fieldName, label, children) => {
    const status = fieldStatus[fieldName];
    const isDetected = status === 'detected' || status === 'suggested';
    const isConfirmed = confirmedFields.includes(fieldName);
    
    return (
      <div className="space-y-2" data-testid={`field-${fieldName}`}>
        <div className="flex items-center justify-between">
          <Label className="text-emerald-100/80 text-sm font-medium">{label}</Label>
          {status !== 'manual' && (
            <FieldStatusBadge status={isConfirmed ? 'confirmed' : status} />
          )}
        </div>
        <div className={`relative ${
          isDetected && !isConfirmed ? 'pulse-detected rounded-lg' : ''
        }`}>
          {children}
        </div>
        {isDetected && !isConfirmed && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => onConfirmField(fieldName)}
              className="flex-1 py-1.5 px-3 bg-teal-500/20 border border-teal-500/40 text-teal-400 text-xs rounded-lg hover:bg-teal-500/30 transition-colors"
              data-testid={`confirm-${fieldName}-btn`}
            >
              ✓ Confirm
            </button>
            <button
              onClick={() => onRejectField(fieldName)}
              className="flex-1 py-1.5 px-3 bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs rounded-lg hover:bg-orange-500/30 transition-colors"
              data-testid={`reject-${fieldName}-btn`}
            >
              ✕ Clear
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="glass-card rounded-2xl p-6 space-y-5" data-testid="watch-form">
      <h2 className="text-lg font-serif text-gold border-b border-emerald-800/50 pb-3">
        Watch Details
      </h2>

      {/* Brand */}
      {renderFieldWithStatus('brand', 'Brand *',
        <Select
          value={watchData.brand}
          onValueChange={(value) => onFieldChange('brand', value)}
        >
          <SelectTrigger 
            className="bg-emerald-900/30 border-emerald-700/50 text-emerald-100 h-12"
            data-testid="brand-select"
          >
            <SelectValue placeholder="Select brand" />
          </SelectTrigger>
          <SelectContent className="bg-emerald-950 border-emerald-800 max-h-80">
            {referenceData.brands.map(brand => (
              <SelectItem 
                key={brand} 
                value={brand}
                className="text-emerald-100 focus:bg-gold/20 focus:text-gold"
              >
                {brand}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Model Family */}
      {renderFieldWithStatus('model_family', 'Model Family *',
        <Select
          value={watchData.model_family}
          onValueChange={(value) => onFieldChange('model_family', value)}
          disabled={!watchData.brand}
        >
          <SelectTrigger 
            className="bg-emerald-900/30 border-emerald-700/50 text-emerald-100 h-12 disabled:opacity-50"
            data-testid="model-select"
          >
            <SelectValue placeholder={watchData.brand ? "Select model" : "Select brand first"} />
          </SelectTrigger>
          <SelectContent className="bg-emerald-950 border-emerald-800 max-h-80">
            {referenceData.models.map(model => (
              <SelectItem 
                key={model} 
                value={model}
                className="text-emerald-100 focus:bg-gold/20 focus:text-gold"
              >
                {model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Dial Color */}
      {renderFieldWithStatus('dial_color', 'Dial Color',
        <Select
          value={watchData.dial_color}
          onValueChange={(value) => onFieldChange('dial_color', value)}
          disabled={!watchData.model_family}
        >
          <SelectTrigger 
            className="bg-emerald-900/30 border-emerald-700/50 text-emerald-100 h-12 disabled:opacity-50"
            data-testid="dial-color-select"
          >
            <SelectValue placeholder="Select dial color" />
          </SelectTrigger>
          <SelectContent className="bg-emerald-950 border-emerald-800">
            {(referenceData.attributes?.dial_colors || []).map(color => (
              <SelectItem 
                key={color} 
                value={color}
                className="text-emerald-100 focus:bg-gold/20 focus:text-gold"
              >
                {color}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Bezel Type */}
      {renderFieldWithStatus('bezel_type', 'Bezel Type',
        <Select
          value={watchData.bezel_type}
          onValueChange={(value) => onFieldChange('bezel_type', value)}
          disabled={!watchData.model_family}
        >
          <SelectTrigger 
            className="bg-emerald-900/30 border-emerald-700/50 text-emerald-100 h-12 disabled:opacity-50"
            data-testid="bezel-type-select"
          >
            <SelectValue placeholder="Select bezel type" />
          </SelectTrigger>
          <SelectContent className="bg-emerald-950 border-emerald-800">
            {(referenceData.attributes?.bezel_types || []).map(type => (
              <SelectItem 
                key={type} 
                value={type}
                className="text-emerald-100 focus:bg-gold/20 focus:text-gold"
              >
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Bracelet Type */}
      {renderFieldWithStatus('bracelet_type', 'Bracelet Type',
        <Select
          value={watchData.bracelet_type}
          onValueChange={(value) => onFieldChange('bracelet_type', value)}
          disabled={!watchData.model_family}
        >
          <SelectTrigger 
            className="bg-emerald-900/30 border-emerald-700/50 text-emerald-100 h-12 disabled:opacity-50"
            data-testid="bracelet-type-select"
          >
            <SelectValue placeholder="Select bracelet type" />
          </SelectTrigger>
          <SelectContent className="bg-emerald-950 border-emerald-800">
            {(referenceData.attributes?.bracelet_types || []).map(type => (
              <SelectItem 
                key={type} 
                value={type}
                className="text-emerald-100 focus:bg-gold/20 focus:text-gold"
              >
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Reference Number (Optional) */}
      <div className="space-y-2">
        <Label className="text-emerald-100/80 text-sm font-medium">Reference Number (Optional)</Label>
        <Input
          value={watchData.reference_number}
          onChange={(e) => onFieldChange('reference_number', e.target.value)}
          placeholder="e.g., 126610LN"
          className="bg-emerald-900/30 border-emerald-700/50 text-emerald-100 h-12 placeholder:text-emerald-100/30"
          data-testid="reference-number-input"
        />
      </div>

      {/* Condition */}
      <div className="space-y-2">
        <Label className="text-emerald-100/80 text-sm font-medium">Condition</Label>
        <Select
          value={watchData.condition}
          onValueChange={(value) => onFieldChange('condition', value)}
        >
          <SelectTrigger 
            className="bg-emerald-900/30 border-emerald-700/50 text-emerald-100 h-12"
            data-testid="condition-select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-emerald-950 border-emerald-800">
            {referenceData.conditions.map(condition => (
              <SelectItem 
                key={condition} 
                value={condition}
                className="text-emerald-100 focus:bg-gold/20 focus:text-gold"
              >
                {condition}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Box & Papers */}
      <div className="flex items-center gap-3 pt-2">
        <Checkbox
          id="box_papers"
          checked={watchData.box_papers}
          onCheckedChange={(checked) => onFieldChange('box_papers', checked)}
          className="border-emerald-700 data-[state=checked]:bg-gold data-[state=checked]:border-gold"
          data-testid="box-papers-checkbox"
        />
        <Label htmlFor="box_papers" className="text-emerald-100/80 cursor-pointer">
          Includes Box & Papers
        </Label>
      </div>
    </div>
  );
};

export default WatchForm;
