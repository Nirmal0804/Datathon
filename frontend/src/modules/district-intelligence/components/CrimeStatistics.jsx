import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, FileWarning } from 'lucide-react';
import GlobalKPICard from '../../../components/shared/ui/GlobalKPICard';

function AnimatedNumber({ value }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    // Strip commas to parse as integer
    const numericStr = value.toString().replace(/,/g, '');
    const end = parseInt(numericStr, 10);
    if (isNaN(end)) {
      setCurrent(value);
      return;
    }

    const duration = 1200; // 1.2s
    const startTime = performance.now();

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress * (2 - progress); // easeOutQuad
      setCurrent(Math.floor(ease * end));

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };
    requestAnimationFrame(update);
  }, [value]);

  const formatted = typeof current === 'number' 
    ? current.toLocaleString('en-US') 
    : current;

  return <span>{formatted}</span>;
}

const stats = [
  { label: 'Total Cases (YTD)', value: '14,289', icon: FileWarning, type: 'info' },
  { label: 'Active Investigations', value: '3,492', icon: Clock, type: 'warning' },
  { label: 'Resolved Cases', value: '10,797', icon: CheckCircle, type: 'success' },
  { label: 'Unregistered Incidents', value: '142', icon: AlertCircle, type: 'critical' },
];

export default function CrimeStatistics() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
      {stats.map((stat, idx) => (
        <GlobalKPICard
          key={idx}
          delay={idx * 0.05}
          title={stat.label}
          value={<AnimatedNumber value={stat.value} />}
          icon={stat.icon}
          type={stat.type}
        />
      ))}
    </div>
  );
}
