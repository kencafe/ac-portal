import React from 'react';

interface ContextBoxProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function ContextBox({ 
  title = "Production Context", 
  children, 
  className = '' 
}: ContextBoxProps) {
  return (
    <div className={`bg-gray-50 border-l-4 border-indigo-500 p-6 mb-8 ${className}`}>
      <h3 className="font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="text-gray-700 leading-relaxed">
        {children}
      </div>
    </div>
  );
}

export default ContextBox;