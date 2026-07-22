import React from 'react';

// Base skeleton block
export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />;
}

// Card skeleton
export function SkeletonCard({ rows = 3 }) {
  return (
    <div className="card p-5 space-y-3 animate-fade-in">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === rows - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}

// KPI card skeleton
export function SkeletonKPI() {
  return (
    <div className="card p-5 animate-fade-in">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-20" />
        </div>
        <Skeleton className="w-9 h-9 rounded-lg" />
      </div>
      <Skeleton className="h-2.5 w-full rounded-full mt-3" />
      <Skeleton className="h-3 w-28 mt-2" />
    </div>
  );
}

// Table row skeleton
export function SkeletonTableRow({ cols = 5 }) {
  return (
    <tr className="border-b border-border/50">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <Skeleton className={`h-3 ${i === 0 ? 'w-28' : i === cols - 1 ? 'w-16' : 'w-full'}`} />
        </td>
      ))}
    </tr>
  );
}

// Chart area skeleton
export function SkeletonChart({ className = 'h-72' }) {
  return (
    <div className={`card p-5 animate-fade-in ${className} flex flex-col`}>
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-4 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-16 rounded-md" />
          <Skeleton className="h-7 w-16 rounded-md" />
        </div>
      </div>
      <div className="flex-1 flex items-end gap-3 pb-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t"
            style={{ height: `${30 + Math.random() * 60}%` }}
          />
        ))}
      </div>
    </div>
  );
}

// Full page skeleton for dashboard
export function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonKPI key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonChart />
        <SkeletonChart />
      </div>
    </div>
  );
}
