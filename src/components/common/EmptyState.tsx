import React from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  className?: string;
}

export function EmptyState({ icon, title, description, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      {icon && <div className="mb-4 text-6xl">{icon}</div>}
      <div className="text-lg font-medium text-text-100">{title}</div>
      <div className="text-sm text-text-200">{description}</div>
    </div>
  );
}
