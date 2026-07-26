import React from 'react';
import { Activity, Users, AlertTriangle, Crosshair } from 'lucide-react';
import GlobalKPICard from '../../components/shared/ui/GlobalKPICard';

const stats = [
  { id: 1, name: 'Active Cases Tracked', value: '14,235', icon: Activity, change: '+12%', changeType: 'increase', positive: false, type: 'warning' },
  { id: 2, name: 'Officers Deployed', value: '8,402', icon: Users, change: 'Optimal', changeType: 'neutral', positive: true, type: 'info' },
  { id: 3, name: 'Hotspots Identified', value: '42', icon: AlertTriangle, change: '-4', changeType: 'decrease', positive: true, type: 'critical' },
  { id: 4, name: 'Prediction Accuracy', value: '94.8%', icon: Crosshair, change: '+2.1%', changeType: 'increase', positive: true, type: 'success' },
];

export default function Stats() {
  return (
    <section className="py-16 md:py-20 border-y border-[#E6E8EC]/80 bg-[#F8F9FB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            let trend = 'neutral';
            if (stat.changeType === 'increase') trend = 'up';
            if (stat.changeType === 'decrease') trend = 'down';
            
            return (
              <GlobalKPICard
                key={stat.id}
                delay={index * 0.08}
                title={stat.name}
                value={stat.value}
                icon={stat.icon}
                type={stat.type}
                trend={trend}
                trendValue={stat.change}
                positive={stat.positive}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
