import React, { useState, useEffect } from 'react';
import { MapPin, FileWarning, Radio, Calendar } from 'lucide-react';
import { getDistricts } from '../../../api/endpoints';

function AnimatedNumber({ value }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const numericStr = value.toString().replace(/,/g, '');
    const end = parseInt(numericStr, 10);
    if (isNaN(end)) {
      setCurrent(value);
      return;
    }

    const duration = 1200;
    const startTime = performance.now();

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress * (2 - progress);
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

export default function CrimeStatistics() {
  const [stats, setStats] = useState([
    { label: 'Total Districts', value: '—', icon: MapPin, color: 'text-blue-500' },
    { label: 'Total FIRs', value: '—', icon: FileWarning, color: 'text-amber-500' },
    { label: 'Stations Reporting', value: '—', icon: Radio, color: 'text-emerald-500' },
    { label: 'Data Period', value: '—', icon: Calendar, color: 'text-red-500' },
  ]);

  useEffect(() => {
    getDistricts()
      .then((res) => {
        const districts = res?.data?.districts ?? res?.districts ?? res?.data ?? res ?? [];
        const districtList = Array.isArray(districts) ? districts : [];

        const totalDistricts = districtList.length;
        const totalFirs = districtList.reduce((sum, d) => sum + (d.fir_count ?? 0), 0);
        const stationsReporting = districtList.reduce((sum, d) => sum + (d.station_count ?? 0), 0);

        const periods = districtList
          .map((d) => d.last_updated ?? d.updated_at)
          .filter(Boolean)
          .sort();
        const dataPeriod = periods.length > 0
          ? `${periods[0]} \u2013 ${periods[periods.length - 1]}`
          : '\u2014';

        setStats([
          { label: 'Total Districts', value: totalDistricts.toLocaleString('en-US'), icon: MapPin, color: 'text-blue-500' },
          { label: 'Total FIRs', value: totalFirs.toLocaleString('en-US'), icon: FileWarning, color: 'text-amber-500' },
          { label: 'Stations Reporting', value: stationsReporting.toLocaleString('en-US'), icon: Radio, color: 'text-emerald-500' },
          { label: 'Data Period', value: dataPeriod, icon: Calendar, color: 'text-red-500' },
        ]);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4 hover:border-slate-700 hover:shadow-elevation-1 transition-all duration-300 cursor-default"
        >
          <div className={`p-3 bg-slate-800/50 rounded-lg shrink-0 ${stat.color}`}>
            <stat.icon className="w-6 h-6 animate-pulse-soft" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400 mb-1">{stat.label}</p>
            <h4 className="text-2xl font-bold text-white font-mono">
              <AnimatedNumber value={stat.value} />
            </h4>
          </div>
        </div>
      ))}
    </div>
  );
}
