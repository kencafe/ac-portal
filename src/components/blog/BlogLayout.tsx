import React from 'react';

interface BlogLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function BlogLayout({ children, className = '' }: BlogLayoutProps) {
  return (
    <div className={`min-h-screen bg-white ${className}`}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="max-w-[760px] mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export default BlogLayout;