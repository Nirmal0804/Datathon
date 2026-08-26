import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, FileText, Target, Bell } from 'lucide-react';

const metricItems = [
  {
    id: 1,
    value: '250+',
    valueColor: 'text-[#E00000]',
    title: 'POLICE STATIONS',
    subtitle: 'MONITORED',
    icon: ShieldCheck,
    iconBg: 'bg-[#FFF1F1] text-[#E00000]',
  },
  {
    id: 2,
    value: '14,235+',
    valueColor: 'text-[#D49A00]',
    title: 'ACTIVE CASES',
    subtitle: 'RECORDED',
    icon: FileText,
    iconBg: 'bg-[#F5E7C1]/50 text-[#D49A00]',
  },
  {
    id: 3,
    value: '49',
    valueColor: 'text-[#E00000]',
    title: 'HOTSPOTS',
    subtitle: 'DETECTED',
    icon: Target,
    iconBg: 'bg-[#FFF1F1] text-[#E00000]',
  },
  {
    id: 4,
    value: '07',
    valueColor: 'text-[#E00000]',
    title: 'ACTIVE ALERTS',
    subtitle: 'HIGH PRIORITY',
    icon: Bell,
    iconBg: 'bg-[#FFF1F1] text-[#E00000]',
  },
];

export default function Stats() {
  return (
    <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 lg:-mt-10 pt-2 pb-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 md:p-9 shadow-[0_12px_40px_rgba(0,0,0,0.07)] border border-slate-100/90"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 lg:divide-x divide-slate-100">
          {metricItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.id} 
                className={`flex items-center gap-4 ${idx !== 0 ? 'pt-6 sm:pt-0 lg:pl-6' : ''}`}
              >
                <div className={`w-14 h-14 rounded-full ${item.iconBg} flex items-center justify-center shrink-0 border border-black/5`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${item.valueColor}`}>
                    {item.value}
                  </div>
                  <div className="text-xs font-extrabold text-[#142B45] tracking-wider uppercase mt-0.5">
                    {item.title}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
                    {item.subtitle}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
