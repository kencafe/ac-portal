import React from 'react';

interface EngineerTakeawaysProps {
  takeaways: {
    toDo?: string[];
    toAvoid?: string[];
    whenNotToUse?: string[];
  };
  className?: string;
}

export function EngineerTakeaways({ takeaways, className = '' }: EngineerTakeawaysProps) {
  return (
    <div className={`bg-gray-900 text-white rounded-lg p-8 my-8 ${className}`}>
      <h3 className="text-xl font-bold mb-6">Key Takeaways for Engineers</h3>
      
      <div className="space-y-6">
        {takeaways.toDo && takeaways.toDo.length > 0 && (
          <div>
            <h4 className="font-semibold text-green-400 mb-3">✅ What to do:</h4>
            <ul className="space-y-2">
              {takeaways.toDo.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  <span className="text-gray-200">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {takeaways.toAvoid && takeaways.toAvoid.length > 0 && (
          <div>
            <h4 className="font-semibold text-red-400 mb-3">❌ What to avoid:</h4>
            <ul className="space-y-2">
              {takeaways.toAvoid.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-400 mr-2">•</span>
                  <span className="text-gray-200">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {takeaways.whenNotToUse && takeaways.whenNotToUse.length > 0 && (
          <div>
            <h4 className="font-semibold text-yellow-400 mb-3">⚠️ When not to use this approach:</h4>
            <ul className="space-y-2">
              {takeaways.whenNotToUse.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-yellow-400 mr-2">•</span>
                  <span className="text-gray-200">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default EngineerTakeaways;