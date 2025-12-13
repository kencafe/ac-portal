import React from 'react';

interface AntiPatternProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function AntiPattern({ 
  title = "❌ Anti-Pattern", 
  children, 
  className = '' 
}: AntiPatternProps) {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-6 my-6 ${className}`}>
      <div className="flex items-center mb-3">
        <h4 className="font-semibold text-red-900">{title}</h4>
      </div>
      <div className="text-red-800 leading-relaxed">
        {children}
      </div>
    </div>
  );
}

export default AntiPattern;