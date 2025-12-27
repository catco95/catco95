import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

const MarketInsights = ({ valuation, watchData, currency, currencies }) => {
  if (!valuation || !watchData.brand) return null;

  const formatCurrency = (value) => {
    if (!value) return '-';
    const rate = currencies[currency]?.rate || 1;
    const symbol = currencies[currency]?.symbol || '$';
    const convertedValue = Math.round(value * rate);
    
    if (convertedValue >= 1000) {
      return `${symbol}${(convertedValue / 1000).toFixed(0)}k`;
    }
    return `${symbol}${convertedValue.toLocaleString()}`;
  };

  const formatFullCurrency = (value) => {
    if (!value) return '-';
    const rate = currencies[currency]?.rate || 1;
    const symbol = currencies[currency]?.symbol || '$';
    const convertedValue = Math.round(value * rate);
    return `${symbol}${convertedValue.toLocaleString()}`;
  };

  // Price band data for chart
  const priceData = [
    {
      name: 'Low',
      value: valuation.low_estimate * (currencies[currency]?.rate || 1),
      fill: '#38b2ac',
      label: 'Quick Sale'
    },
    {
      name: 'Fair',
      value: valuation.fair_estimate * (currencies[currency]?.rate || 1),
      fill: '#d4af37',
      label: 'Market Value'
    },
    {
      name: 'High',
      value: valuation.high_estimate * (currencies[currency]?.rate || 1),
      fill: '#48bb78',
      label: 'Patient Sale'
    }
  ];

  // Calculate market position metrics
  const spread = valuation.high_estimate - valuation.low_estimate;
  const spreadPercentage = ((spread / valuation.fair_estimate) * 100).toFixed(1);
  const midpoint = (valuation.high_estimate + valuation.low_estimate) / 2;
  const fairVsMidpoint = ((valuation.fair_estimate - midpoint) / midpoint * 100).toFixed(1);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-emerald-950 border border-gold/30 rounded-lg p-3 shadow-lg">
          <p className="text-gold font-medium">{payload[0].payload.name} Estimate</p>
          <p className="text-emerald-100 text-lg font-bold">
            {formatFullCurrency(payload[0].value / (currencies[currency]?.rate || 1))}
          </p>
          <p className="text-emerald-100/50 text-xs">{payload[0].payload.label}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card rounded-2xl p-6 space-y-6" data-testid="market-insights">
      <div className="flex items-center justify-between border-b border-emerald-800/50 pb-3">
        <h2 className="text-lg font-serif text-gold">Market Insights</h2>
        <span className="text-xs text-emerald-100/40">
          {watchData.brand} {watchData.model_family}
        </span>
      </div>

      {/* Price Bands Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={priceData} layout="vertical" margin={{ left: 10, right: 30 }}>
            <XAxis 
              type="number" 
              tickFormatter={formatCurrency}
              stroke="#6b7280"
              fontSize={10}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              stroke="#6b7280"
              fontSize={12}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {priceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
            <ReferenceLine 
              x={valuation.fair_estimate * (currencies[currency]?.rate || 1)} 
              stroke="#d4af37" 
              strokeDasharray="3 3"
              strokeWidth={2}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Market Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-900/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-emerald-100/60 text-sm">Price Spread</span>
          </div>
          <p className="text-xl font-bold text-gold">{formatFullCurrency(spread)}</p>
          <p className="text-emerald-100/40 text-xs">±{spreadPercentage}% range</p>
        </div>

        <div className="bg-emerald-900/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-emerald-100/60 text-sm">Market Position</span>
          </div>
          <p className="text-xl font-bold text-teal-400">
            {parseFloat(fairVsMidpoint) >= 0 ? 'Above' : 'Below'} Mid
          </p>
          <p className="text-emerald-100/40 text-xs">
            {Math.abs(parseFloat(fairVsMidpoint))}% from midpoint
          </p>
        </div>
      </div>

      {/* Liquidity Indicator */}
      <div className="bg-emerald-900/30 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-emerald-100/60 text-sm">Liquidity Estimate</span>
          <span className={`text-xs px-2 py-1 rounded ${
            spreadPercentage < 15 ? 'bg-teal-500/20 text-teal-400' :
            spreadPercentage < 25 ? 'bg-gold/20 text-gold' :
            'bg-orange-500/20 text-orange-400'
          }`}>
            {spreadPercentage < 15 ? 'High' : spreadPercentage < 25 ? 'Medium' : 'Lower'}
          </span>
        </div>
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className={`h-2 flex-1 rounded ${
                i < (spreadPercentage < 15 ? 5 : spreadPercentage < 20 ? 4 : spreadPercentage < 25 ? 3 : 2)
                  ? 'bg-gold'
                  : 'bg-emerald-800'
              }`}
            />
          ))}
        </div>
        <p className="text-emerald-100/40 text-xs mt-2">
          {spreadPercentage < 15 
            ? 'Strong market demand, quick sale expected'
            : spreadPercentage < 25
            ? 'Moderate demand, standard selling timeline'
            : 'Wider price variance, patience recommended'
          }
        </p>
      </div>

      {/* Price Context */}
      <div className="bg-gradient-to-r from-gold/5 to-transparent rounded-xl p-4 border-l-2 border-gold">
        <p className="text-emerald-100/70 text-sm">
          <span className="text-gold font-medium">Trade Insight:</span>{' '}
          {valuation.fair_estimate < 10000
            ? 'Entry-level luxury segment with active secondary market.'
            : valuation.fair_estimate < 30000
            ? 'Mid-luxury segment with established collector demand.'
            : valuation.fair_estimate < 100000
            ? 'High-end segment favored by serious collectors.'
            : 'Ultra-luxury segment with selective buyer pool.'
          }
        </p>
      </div>
    </div>
  );
};

export default MarketInsights;
