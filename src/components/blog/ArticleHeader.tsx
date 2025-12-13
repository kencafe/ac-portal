import React from 'react';

interface ArticleHeaderProps {
  title: string;
  subtitle: string;
  author: string;
  role: string;
  techStack: string[];
  date: string;
  readTime: string;
}

export function ArticleHeader({
  title,
  subtitle,
  author,
  role,
  techStack,
  date,
  readTime
}: ArticleHeaderProps) {
  return (
    <header className="mb-8">
      {/* Minimal Header */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
          {title}
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Author Info */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 pb-6 border-b border-gray-200">
        <span className="font-medium text-gray-700">{author}</span>
        <span>|</span>
        <span>{role}</span>
        <span>|</span>
        <span>{techStack.join(', ')}</span>
        <span>|</span>
        <span>{date}</span>
        <span>|</span>
        <span>{readTime}</span>
      </div>
    </header>
  );
}

export default ArticleHeader;