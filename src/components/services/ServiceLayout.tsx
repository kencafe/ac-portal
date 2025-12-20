import React from 'react';

interface ServiceLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function ServiceLayout({ children, className = '' }: ServiceLayoutProps) {
  return (
    <div className={`min-h-screen bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}

export default ServiceLayout;