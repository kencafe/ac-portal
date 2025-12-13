import React from 'react';

interface OpsInsightProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function OpsInsight({ 
  title = "SRE / Ops Insight", 
  children, 
  className = '' 
}: OpsInsightProps) {
  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-6 my-6 ${className}`}>
      <div className="flex items-center mb-3">
        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
        <h4 className="font-semibold text-blue-900">{title}</h4>
      </div>
      <div className="text-blue-800 leading-relaxed">
        {children}
      </div>
    </div>
  );
}

export default OpsInsight;