import React from 'react';

interface ServiceHeroProps {
  serviceName: string;
  valueProposition: string;
  scope: string[];
  className?: string;
}

export function ServiceHero({ 
  serviceName, 
  valueProposition, 
  scope, 
  className = '' 
}: ServiceHeroProps) {
  return (
    <div className={`bg-navy-900 text-white py-16 ${className}`}>
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          {serviceName}
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
          {valueProposition}
        </p>
        <div className="flex flex-wrap gap-3">
          {scope.map((item, index) => (
            <span 
              key={index}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ServiceHero;