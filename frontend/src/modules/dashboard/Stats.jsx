import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Users, AlertTriangle, Crosshair } from 'lucide-react';

const stats = [
  { id: 1, name: 'Active Cases Tracked', value: '14,235', icon: Activity, change: '+12%', changeType: 'increase' },
  { id: 2, name: 'Officers Deployed', value: '8,402', icon: Users, change: 'Optimal', changeType: 'neutral' },
  { id: 3, name: 'Hotspots Identified', value: '42', icon: AlertTriangle, change: '-4', changeType: 'decrease' },
  { id: 4, name: 'Prediction Accuracy', value: '94.8%', icon: Crosshair, change: '+2.1%', changeType: 'increase' },
];

export default function Stats() {
  return (
    <section className="py-12 border-y border-slate-800 bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div 
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-6 flex flex-col relative overflow-hidden group"
            >
              <div className="absolute right-0 top-0 opacity-5 group-hover:opacity-10 transition-opacity">
                <stat.icon className="w-32 h-32 -mr-8 -mt-8 text-primary" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-800 rounded-lg">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm font-medium text-slate-400">{stat.name}</p>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <span className={`text-xs font-semibold ${
                  stat.changeType === 'increase' ? 'text-green-500' : 
                  stat.changeType === 'decrease' ? 'text-emerald-500' : 'text-slate-500'
                }`}>
                  {stat.change}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
