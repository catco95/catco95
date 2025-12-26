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
          <Label className="text-slate-300 text-sm font-medium">{label}</Label>
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
              className="flex-1 py-1.5 px-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs rounded-lg hover:bg-emerald-500/30 transition-colors"
              data-testid={`confirm-${fieldName}-btn`}
            >
              ✓ Confirm
            </button>
            <button
              onClick={() => onRejectField(fieldName)}
              className="flex-1 py-1.5 px-3 bg-red-500/20 border border-red-500/40 text-red-400 text-xs rounded-lg hover:bg-red-500/30 transition-colors"
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
      <h2 className="text-lg font-serif text-amber-100 border-b border-slate-800 pb-3">
        Watch Details
      </h2>

      {/* Brand */}
      {renderFieldWithStatus('brand', 'Brand *',
        <Select
          value={watchData.brand}
          onValueChange={(value) => onFieldChange('brand', value)}
        >
          <SelectTrigger 
            className="bg-slate-900/50 border-slate-700 text-slate-100 h-12"
            data-testid="brand-select"
          >
            <SelectValue placeholder="Select brand" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700">
            {referenceData.brands.map(brand => (
              <SelectItem 
                key={brand} 
                value={brand}
                className="text-slate-100 focus:bg-amber-500/20 focus:text-amber-100"
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
            className="bg-slate-900/50 border-slate-700 text-slate-100 h-12 disabled:opacity-50"
            data-testid="model-select"
          >
            <SelectValue placeholder={watchData.brand ? "Select model" : "Select brand first"} />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700">
            {referenceData.models.map(model => (
              <SelectItem 
                key={model} 
                value={model}
                className="text-slate-100 focus:bg-amber-500/20 focus:text-amber-100"
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
            className="bg-slate-900/50 border-slate-700 text-slate-100 h-12 disabled:opacity-50"
            data-testid="dial-color-select"
          >
            <SelectValue placeholder="Select dial color" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700">
            {(referenceData.attributes?.dial_colors || []).map(color => (
              <SelectItem 
                key={color} 
                value={color}
                className="text-slate-100 focus:bg-amber-500/20 focus:text-amber-100"
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
            className="bg-slate-900/50 border-slate-700 text-slate-100 h-12 disabled:opacity-50"
            data-testid="bezel-type-select"
          >
            <SelectValue placeholder="Select bezel type" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700">
            {(referenceData.attributes?.bezel_types || []).map(type => (
              <SelectItem 
                key={type} 
                value={type}
                className="text-slate-100 focus:bg-amber-500/20 focus:text-amber-100"
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
            className="bg-slate-900/50 border-slate-700 text-slate-100 h-12 disabled:opacity-50"
            data-testid="bracelet-type-select"
          >
            <SelectValue placeholder="Select bracelet type" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700">
            {(referenceData.attributes?.bracelet_types || []).map(type => (
              <SelectItem 
                key={type} 
                value={type}
                className="text-slate-100 focus:bg-amber-500/20 focus:text-amber-100"
              >
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Reference Number (Optional) */}
      <div className="space-y-2">
        <Label className="text-slate-300 text-sm font-medium">Reference Number (Optional)</Label>
        <Input
          value={watchData.reference_number}
          onChange={(e) => onFieldChange('reference_number', e.target.value)}
          placeholder="e.g., 126610LN"
          className="bg-slate-900/50 border-slate-700 text-slate-100 h-12 placeholder:text-slate-600"
          data-testid="reference-number-input"
        />
      </div>

      {/* Condition */}
      <div className="space-y-2">
        <Label className="text-slate-300 text-sm font-medium">Condition</Label>
        <Select
          value={watchData.condition}
          onValueChange={(value) => onFieldChange('condition', value)}
        >
          <SelectTrigger 
            className="bg-slate-900/50 border-slate-700 text-slate-100 h-12"
            data-testid="condition-select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700">
            {referenceData.conditions.map(condition => (
              <SelectItem 
                key={condition} 
                value={condition}
                className="text-slate-100 focus:bg-amber-500/20 focus:text-amber-100"
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
          className="border-slate-600 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
          data-testid="box-papers-checkbox"
        />
        <Label htmlFor="box_papers" className="text-slate-300 cursor-pointer">
          Includes Box & Papers
        </Label>
      </div>
    </div>
  );
};

export default WatchForm;
