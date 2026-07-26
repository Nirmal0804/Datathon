import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FORECAST_DATA } from '../../../mock/analyticsData';
import { Target, TrendingUp, Sparkles, Brain, CheckCircle2 } from 'lucide-react';
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

    return { histPoints, predPoints };
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
    
    const upperPoints = predPoints.map(p => ({ x: p.x, y: p.y - 12 }));
    const lowerPoints = [...predPoints].reverse().map(p => ({ x: p.x, y: p.y + 12 }));
    const topPath = upperPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const bottomPath = lowerPoints.map(p => `L ${p.x} ${p.y}`).join(' ');
    return `${topPath} ${bottomPath} Z`;
  }, [points]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left: AI Crime Forecast (Span 8) */}
      <div className="lg:col-span-8 bg-white border border-[#E7ECF3] rounded-[20px] p-6 shadow-sm flex flex-col space-y-6">
        {/* Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#F8F9FB] border border-[#E7ECF3] flex items-center justify-center">
              <Brain className="w-4 h-4 text-[#C79A2B] animate-pulse-soft" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0B1F4D] uppercase tracking-wider">AI Crime Forecast</h3>
              <p className="text-[10px] text-[#64748B] font-medium mt-0.5">Predictive forecasting models simulating seasonal offsets and boundaries.</p>
            </div>
          </div>

          {/* Period tabs */}
          <div className="flex bg-[#F8F9FB] p-1 rounded-xl border border-[#E7ECF3] shrink-0">
            {periods.map(p => (
              <button
                key={p}
                onClick={() => setForecastPeriod(p)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-all ${
                  forecastPeriod === p
                    ? 'bg-[#0B1F4D] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#0B1F4D]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center flex-1">
          {/* Left Side: Confidence score */}
          <div className="md:col-span-1 h-full flex items-center justify-center w-full min-w-0">
            <div className="w-full">
              <GlobalKPICard
                title="Forecast Confidence"
                value={`${forecast.confidence}%`}
                trend="up"
                trendValue="High Accuracy"
                positive={true}
                description="Prophet regression"
                type="success"
              />
            </div>
          </div>

          {/* Right Side: Area chart with prediction shading */}
          <div className="md:col-span-2 h-full min-h-[220px] p-4 bg-[#F8F9FB] border border-[#E7ECF3] rounded-[16px] relative overflow-hidden flex flex-col shadow-sm">
            {/* Legend */}
            <div className="absolute top-4 right-4 flex gap-4 text-[9px] font-mono font-bold text-[#64748B] select-none">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-[#94A3B8]" /> Historical</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 border-t border-dashed border-[#C79A2B]" /> Predicted</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2 bg-[#C79A2B]/10 border border-[#C79A2B]/20" /> Confidence bounds</div>
            </div>

            <div className="flex-1 w-full relative pt-6">
              <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
                {/* Confidence Interval Shading Area */}
                <path d={boundsPath} fill="#C79A2B" fillOpacity="0.1" stroke="#C79A2B" strokeWidth="0.5" strokeDasharray="2 2" />
                {/* Historical solid line */}
                <path d={histPath} fill="none" stroke="#94A3B8" strokeWidth="2.5" />
                {/* Predicted dashed line */}
                <path d={predPath} fill="none" stroke="#C79A2B" strokeWidth="2.5" strokeDasharray="4 4" />
                {/* Separator divider dot */}
                {points.histPoints.length > 0 && (
                  <circle 
                    cx={points.histPoints[points.histPoints.length - 1].x} 
                    cy={points.histPoints[points.histPoints.length - 1].y} 
                    r="4" 
                    fill="white" 
                    stroke="#0B1F4D" 
                    strokeWidth="1.5"
                  />
                )}
              </svg>
            </div>

            {/* X Axis labels */}
            <div className="flex justify-between px-3 text-[10px] text-[#64748B] font-mono font-bold select-none mt-2">
              {forecast.labels.map(l => (
                <span key={l}>{l}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Intelligence Summary Card (Span 4) */}
      <div className="lg:col-span-4 bg-white border border-[#E7ECF3] rounded-[20px] p-6 shadow-sm flex flex-col space-y-4">
        <h4 className="text-[#0B1F4D] font-bold uppercase text-[11px] tracking-wider flex items-center gap-2 pb-3 border-b border-[#F1F5F9]">
          <div className="w-6 h-6 rounded bg-[#F8F9FB] border border-[#E7ECF3] flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-[#C79A2B]" />
          </div>
          Intelligence Summary
        </h4>
        
        <div className="flex-1 flex flex-col justify-center space-y-4">
          <div className="flex items-start gap-3 p-3 bg-[#F8F9FB] rounded-xl border border-[#E7ECF3]">
            <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
            <p className="text-xs text-[#0B1F4D] font-medium leading-relaxed">Vehicle theft likely to remain elevated over the forecasted period.</p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-[#F8F9FB] rounded-xl border border-[#E7ECF3]">
            <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
            <p className="text-xs text-[#0B1F4D] font-medium leading-relaxed">Cybercrime continues downward trend following targeted operations.</p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-[#F8F9FB] rounded-xl border border-[#E7ECF3]">
            <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
            <p className="text-xs text-[#0B1F4D] font-medium leading-relaxed">Southern districts require increased patrol coverage.</p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-[#F8F9FB] rounded-xl border border-[#E7ECF3]">
            <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
            <p className="text-xs text-[#0B1F4D] font-medium leading-relaxed">Forecast confidence remains high based on regression analysis.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
