import React from 'react';

interface ServiceIconProps {
  type: 'consulting' | 'implementation' | 'operations' | 'security';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-12 h-12',
  lg: 'w-16 h-16'
};

export function ServiceIcon({ type, className = '', size = 'md' }: ServiceIconProps) {
  const iconClass = `${sizeClasses[size]} ${className}`;

  switch (type) {
    case 'consulting':
      return (
        <svg viewBox="0 0 100 100" className={iconClass}>
          <g fill="currentColor">
            {/* Radar Dish */}
            <circle cx="50" cy="60" r="35" fill="none" stroke="currentColor" strokeWidth="3" />
            <circle cx="50" cy="60" r="25" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.6" />
            <circle cx="50" cy="60" r="15" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
            {/* Radar Sweep */}
            <line x1="50" y1="60" x2="75" y2="35" stroke="currentColor" strokeWidth="2" />
            <path d="M50 60 L75 35 A35 35 0 0 0 65 30 Z" fill="currentColor" opacity="0.3" />
            {/* Base */}
            <rect x="45" y="85" width="10" height="15" rx="2" />
          </g>
        </svg>
      );

    case 'implementation':
      return (
        <svg viewBox="0 0 100 100" className={iconClass}>
          <g fill="currentColor">
            {/* Aircraft taking off */}
            <path d="M20 60 L70 50 L65 45 L60 45 L55 40 L50 45 L45 45 Z" />
            <line x1="55" y1="40" x2="55" y2="35" strokeWidth="2" stroke="currentColor" />
            <line x1="50" y1="35" x2="60" y2="35" strokeWidth="2" stroke="currentColor" />
            {/* Launch trajectory */}
            <path d="M70 50 Q80 35 85 20" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3,2" />
            {/* Carrier deck section */}
            <rect x="15" y="65" width="60" height="8" rx="2" />
            <line x1="20" y1="68" x2="70" y2="68" stroke="currentColor" strokeWidth="1" opacity="0.6" />
          </g>
        </svg>
      );

    case 'operations':
      return (
        <svg viewBox="0 0 100 100" className={iconClass}>
          <g fill="currentColor">
            {/* Control Tower */}
            <rect x="40" y="30" width="20" height="40" rx="3" />
            <rect x="35" y="65" width="30" height="25" rx="2" />
            {/* Windows */}
            <rect x="43" y="35" width="4" height="6" rx="1" fill="white" />
            <rect x="53" y="35" width="4" height="6" rx="1" fill="white" />
            <rect x="43" y="45" width="4" height="6" rx="1" fill="white" />
            <rect x="53" y="45" width="4" height="6" rx="1" fill="white" />
            {/* Antenna */}
            <line x1="50" y1="30" x2="50" y2="20" strokeWidth="2" stroke="currentColor" />
            <circle cx="50" cy="22" r="2" />
            {/* Signal waves */}
            <path d="M35 25 Q50 15 65 25" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
            <path d="M30 30 Q50 10 70 30" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          </g>
        </svg>
      );

    case 'security':
      return (
        <svg viewBox="0 0 100 100" className={iconClass}>
          <g fill="currentColor">
            {/* Shield shape */}
            <path d="M50 15 L70 25 L70 55 Q70 75 50 85 Q30 75 30 55 L30 25 Z" />
            {/* Aircraft silhouette in shield */}
            <g fill="white">
              <path d="M40 45 L60 45 L58 43 L56 43 L54 41 L52 43 L50 43 Z" />
              <line x1="54" y1="41" x2="54" y2="39" strokeWidth="1" stroke="white" />
              <line x1="52" y1="39" x2="56" y2="39" strokeWidth="1" stroke="white" />
            </g>
            {/* Lock symbol */}
            <rect x="47" y="55" width="6" height="8" rx="1" fill="white" />
            <path d="M47 55 Q47 50 50 50 Q53 50 53 55" fill="none" stroke="white" strokeWidth="1.5" />
          </g>
        </svg>
      );

    default:
      return null;
  }
}

export default ServiceIcon;