import React from 'react';

interface AircraftCarrierLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textClassName?: string;
}

const sizeClasses = {
  sm: 'w-6 h-4',
  md: 'w-10 h-8', 
  lg: 'w-16 h-12',
  xl: 'w-24 h-18'
};

export function AircraftCarrierLogo({ 
  className = 'text-blue-600', 
  size = 'md',
  showText = true,
  textClassName = 'text-xl font-bold text-gray-900'
}: AircraftCarrierLogoProps) {
  return (
    <div className="flex items-center space-x-3">
      <div className={`relative ${sizeClasses[size]}`}>
        <svg viewBox="0 0 120 80" className={`w-full h-full ${className}`}>
          <g fill="currentColor">
            {/* Carrier Hull - Main Body */}
            <path d="M15 45 L95 45 L105 40 L105 55 L95 50 L15 50 Z" strokeWidth="0.5" />
            
            {/* Flight Deck */}
            <rect x="20" y="35" width="75" height="12" rx="2" />
            
            {/* Aircraft Carrier Island/Tower */}
            <rect x="70" y="20" width="12" height="20" rx="2" />
            <rect x="75" y="15" width="4" height="8" rx="1" />
            
            {/* Radar/Antenna */}
            <line x1="77" y1="15" x2="77" y2="10" strokeWidth="1" stroke="currentColor" />
            <circle cx="77" cy="12" r="1.5" />
            
            {/* Aircraft on Deck */}
            {/* Aircraft 1 */}
            <g>
              <path d="M30 38 L42 38 L40 36 L38 36 L36 34 L34 36 L32 36 Z" />
              <line x1="36" y1="34" x2="36" y2="32" strokeWidth="0.5" stroke="red" />
              <line x1="34" y1="32" x2="38" y2="32" strokeWidth="0.5" stroke="red" />
            </g>
            
            {/* Aircraft 2 */}
            <g>
              <path d="M50 40 L62 40 L60 38 L58 38 L56 36 L54 38 L52 38 Z" />
              <line x1="56" y1="36" x2="56" y2="34" strokeWidth="0.5" stroke="red" />
              <line x1="54" y1="34" x2="58" y2="34" strokeWidth="0.5" stroke="red" />
            </g>
            
            {/* Deck Lines */}
            <line x1="25" y1="39" x2="65" y2="39" strokeWidth="0.3" stroke="currentColor" opacity="0.6" strokeDasharray="2,1" />
            <line x1="25" y1="43" x2="65" y2="43" strokeWidth="0.3" stroke="currentColor" opacity="0.6" strokeDasharray="2,1" />
            
            {/* Deck Markings */}
            <circle cx="85" cy="41" r="3" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.7" />
            <circle cx="45" cy="41" r="3" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.7" />
          </g>
        </svg>
      </div>
      {showText && (
        <span className={textClassName}>AC Portal</span>
      )}
    </div>
  );
}

export default AircraftCarrierLogo;