import React from 'react';

interface ProblemStatementProps {
  title?: string;
  problems: string[];
  scenarios?: string[];
  className?: string;
}

export function ProblemStatement({ 
  title = "When to Use This Service",
  problems,
  scenarios = [],
  className = '' 
}: ProblemStatementProps) {
  return (
    <section className={`py-12 ${className}`}>
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">{title}</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Typical Customer Problems</h3>
            <ul className="space-y-3">
              {problems.map((problem, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-600 mr-3 mt-1">→</span>
                  <span className="text-gray-700">{problem}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {scenarios.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Common Scenarios</h3>
              <ul className="space-y-3">
                {scenarios.map((scenario, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-indigo-600 mr-3 mt-1">→</span>
                    <span className="text-gray-700">{scenario}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ProblemStatement;