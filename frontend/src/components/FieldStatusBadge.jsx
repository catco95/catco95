import React from 'react';

const FieldStatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'detected':
        return {
          label: 'Detected',
          className: 'status-detected',
          icon: '🔍'
        };
      case 'suggested':
        return {
          label: 'Suggested',
          className: 'status-suggested',
          icon: '💡'
        };
      case 'confirmed':
        return {
          label: 'Confirmed',
          className: 'status-confirmed',
          icon: '✓'
        };
      case 'unconfirmed':
        return {
          label: 'Unconfirmed',
          className: 'status-unconfirmed',
          icon: '⚠'
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  return (
    <span 
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}
      data-testid={`status-badge-${status}`}
    >
      <span className="text-[10px]">{config.icon}</span>
      {config.label}
    </span>
  );
};

export default FieldStatusBadge;
