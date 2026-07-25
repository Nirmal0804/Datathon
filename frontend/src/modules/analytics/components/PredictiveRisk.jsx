import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FORECAST_DATA } from '../../../mock/analyticsData';
import { Target, TrendingUp, Sparkles, Brain } from 'lucide-react';
import GlobalKPICard from '../../../components/shared/ui/GlobalKPICard';

export default function PredictiveRisk({ timeFilter }) {
  const [forecastPeriod, setForecastPeriod] = useState('Next 30 Days');

  const periods = ['Next 7 Days', 'Next 30 Days', 'Next 90 Days'];

  const forecast = useMemo(() => {
    return FORECAST_DATA[forecastPeriod] || FORECAST_DATA['Next 30 Days'];
  }, [forecastPeriod]);

  // Compute SVG line points for historical and predicted lines
  const points = useMemo(() => {
    const width = 500;
    const height = 150;
    const padding = 20;
    const { historical, predicted, maxVal } = forecast;

    const histPoints = historical.map((val, i) => {
      const x = (i / (historical.length + predicted.length - 1)) * (width - padding * 2) + padding;
      const y = height - (val / maxVal) * (height - padding * 2) - padding;
      return { x, y, val };
    });

    const predPoints = predicted.map((val, i) => {
      const idx = historical.length - 1 + i;
      const x = (idx / (historical.length + predicted.length - 1)) * (width - padding * 2) + padding;
      const y = height - (val / maxVal) * (height - padding * 2) - padding;
      return { x, y, val };
    });

    return {
      histPoints,
      predPoints
    };
  }, [forecast]);

  // Generate SVG path for historical line
  const histPath = useMemo(() => {
    const { histPoints } = points;
    if (histPoints.length === 0) return '';
    return histPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }, [points]);

  // Generate SVG path for predicted line
  const predPath = useMemo(() => {
    const { predPoints } = points;
    if (predPoints.length === 0) return '';
    return predPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }, [points]);

  // Generate shaded confidence bounds path
  const boundsPath = useMemo(() => {
    const { predPoints } = points;
    if (predPoints.length === 0) return '';
    
    // Create upper and lower offsets for shading
    const upperPoints = predPoints.map(p => ({ x: p.x, y: p.y - 12 }));
    const lowerPoints = [...predPoints].reverse().map(p => ({ x: p.x, y: p.y + 12 }));

    const topPath = upperPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const bottomPath = lowerPoints.map(p => `L ${p.x} ${p.y}`).join(' ');

    return `${topPath} ${bottomPath} Z`;
  }, [points]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-400 animate-pulse-soft" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Crime Forecast</h3>
            <p className="text-4xs text-slate-400 mt-0.5">Predictive forecasting models simulating seasonal offsets and boundaries.</p>
          </div>
        </div>

        {/* Period tabs */}
        <div className="flex bg-slate-950/45 p-1 rounded-lg border border-slate-850 shrink-0">
          {periods.map(p => (
            <button
              key={p}
              onClick={() => setForecastPeriod(p)}
              className={`px-3 py-1 text-3xs font-bold uppercase tracking-wider rounded cursor-pointer transition-all ${
                forecastPeriod === p
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
        
        {/* Left Side: Confidence score */}
        <div className="md:col-span-1">
          <GlobalKPICard
            title="Forecast Confidence"
            value={`${forecast.confidence}%`}
            trend="up"
            trendValue="High Accuracy"
            positive={true}
            description="Prophet regression model"
            type="success"
          />
        </div>

        {/* Right Side: Area chart with prediction shading */}
        <div className="md:col-span-3 p-4 bg-slate-950/30 border border-slate-850/60 rounded-xl relative overflow-hidden">
          
          {/* Legend */}
          <div className="absolute top-4 right-4 flex gap-4 text-[9px] font-mono text-slate-400 select-none">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-slate-500" /> Historical</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 border-t border-dashed border-indigo-400" /> Predicted</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2 bg-indigo-500/10 border border-indigo-500/20" /> Confidence bounds</div>
          </div>

          <div className="h-44 w-full relative pt-6">
            <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
              
              {/* Confidence Interval Shading Area */}
              <path d={boundsPath} fill="#6366f1" fillOpacity="0.08" stroke="#6366f1" strokeWidth="0.5" strokeDasharray="2 2" />

              {/* Historical solid line */}
              <path d={histPath} fill="none" stroke="#94a3b8" strokeWidth="2.0" />

              {/* Predicted dashed line */}
              <path d={predPath} fill="none" stroke="#6366f1" strokeWidth="2.0" strokeDasharray="4 4" />

              {/* Separator divider dot */}
              {points.histPoints.length > 0 && (
                <circle 
                  cx={points.histPoints[points.histPoints.length - 1].x} 
                  cy={points.histPoints[points.histPoints.length - 1].y} 
                  r="4" 
                  fill="#ffffff" 
                  stroke="#6366f1" 
                  strokeWidth="1.5"
                />
              )}

            </svg>
          </div>

          {/* X Axis labels */}
          <div className="flex justify-between px-3 text-[10px] text-slate-500 font-mono select-none">
            {forecast.labels.map(l => (
              <span key={l}>{l}</span>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
