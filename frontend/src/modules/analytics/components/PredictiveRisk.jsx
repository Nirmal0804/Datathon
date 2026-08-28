import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FORECAST_DATA } from '../../../mock/analyticsData';
import { Brain, TrendingUp, Info, Sparkles, CheckCircle2 } from 'lucide-react';

export default function PredictiveRisk({ timeFilter }) {
  const [forecastPeriod, setForecastPeriod] = useState('Next 7 Days');
  const periods = ['Next 7 Days', 'Next 30 Days', 'Next 90 Days'];

  const forecast = useMemo(() => {
    return FORECAST_DATA[forecastPeriod] || FORECAST_DATA['Next 7 Days'];
  }, [forecastPeriod]);

  // Compute dynamic X-Axis labels for both historical and predicted ranges
  const timeLabels = useMemo(() => {
    if (forecastPeriod === 'Next 7 Days') {
      return {
        historical: ['Day -3', 'Day -2', 'Day -1', 'Day 0'],
        predicted: ['Day +1', 'Day +2', 'Day +3', 'Day +4', 'Day +5', 'Day +6', 'Day +7']
      };
    }
    if (forecastPeriod === 'Next 30 Days') {
      return {
        historical: ['Wk -3', 'Wk -2', 'Wk -1', 'Current'],
        predicted: ['Wk +1', 'Wk +2', 'Wk +3', 'Wk +4']
      };
    }
    return {
      historical: ['Mo -2', 'Mo -1', 'Current'],
      predicted: ['Mo +1', 'Mo +2', 'Mo +3']
    };
  }, [forecastPeriod]);

  // Compute SVG coordinates and paths
  const chartGeometry = useMemo(() => {
    const width = 640;
    const height = 230;
    const marginLeft = 50;
    const marginRight = 30;
    const marginTop = 36;
    const marginBottom = 44;

    const usableW = width - marginLeft - marginRight;
    const usableH = height - marginTop - marginBottom;

    const { historical, predicted, maxVal } = forecast;
    const totalCount = historical.length + predicted.length;
    const safeMax = maxVal || 100;

    // Historical Points
    const histPoints = historical.map((val, i) => {
      const x = marginLeft + (i / (totalCount - 1)) * usableW;
      const y = (marginTop + usableH) - (val / safeMax) * usableH;
      return { x, y, val };
    });

    // Predicted Points
    const predPoints = predicted.map((val, i) => {
      const idx = historical.length + i;
      const x = marginLeft + (idx / (totalCount - 1)) * usableW;
      const y = (marginTop + usableH) - (val / safeMax) * usableH;
      return { x, y, val };
    });

    // Transition Divider X position (midway between last historical and first predicted point)
    const lastHist = histPoints[histPoints.length - 1];
    const firstPred = predPoints[0];
    const dividerX = lastHist && firstPred ? (lastHist.x + firstPred.x) / 2 : marginLeft + usableW / 2;

    // Historical Solid Line Path
    const histPath = histPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    // Predicted Dashed Line Path (connecting seamlessly from last historical point)
    const fullPredPoints = lastHist ? [lastHist, ...predPoints] : predPoints;
    const predPath = fullPredPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    // 95% Confidence Band Polygon Path (expanding outward slightly over time)
    let boundsPath = '';
    if (fullPredPoints.length > 0) {
      const upperPoints = fullPredPoints.map((p, i) => {
        const spread = i === 0 ? 4 : 14 + (i / fullPredPoints.length) * 8;
        return { x: p.x, y: Math.max(marginTop - 4, p.y - spread) };
      });
      const lowerPoints = [...fullPredPoints].reverse().map((p, i) => {
        const revIdx = fullPredPoints.length - 1 - i;
        const spread = revIdx === 0 ? 4 : 14 + (revIdx / fullPredPoints.length) * 8;
        return { x: p.x, y: Math.min(marginTop + usableH + 4, p.y + spread) };
      });

      const topStr = upperPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
      const botStr = lowerPoints.map(p => `L ${p.x} ${p.y}`).join(' ');
      boundsPath = `${topStr} ${botStr} Z`;
    }

    // Grid ticks (0%, 25%, 50%, 75%, 100%)
    const ticks = [0, 0.25, 0.5, 0.75, 1].map(pct => {
      const val = Math.round(pct * safeMax);
      const y = (marginTop + usableH) - pct * usableH;
      return { val, y };
    });

    return {
      width,
      height,
      marginLeft,
      marginRight,
      marginTop,
      marginBottom,
      usableW,
      usableH,
      histPoints,
      predPoints,
      dividerX,
      histPath,
      predPath,
      boundsPath,
      ticks
    };
  }, [forecast]);

  return (
    <div className="bg-white border border-[#E7ECF3] rounded-[22px] p-6 sm:p-7 shadow-sm flex flex-col space-y-6">
      
      {/* ── 1. MODULE HEADER ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#F1F5F9]">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[12px] bg-[#0B1F4D] flex items-center justify-center shrink-0 shadow-xs">
            <Brain className="w-5 h-5 text-[#C79A2B]" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-[#0B1F4D] uppercase tracking-wider">
              AI Crime Forecast
            </h2>
            <p className="text-xs text-[#64748B] font-medium mt-0.5">
              Predictive forecasting models simulating seasonal offsets and boundaries.
            </p>
          </div>
        </div>

        {/* Period selection controls */}
        <div className="flex bg-[#F8F9FB] p-1 rounded-xl border border-[#E7ECF3] shrink-0">
          {periods.map(p => (
            <button
              key={p}
              onClick={() => setForecastPeriod(p)}
              className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-all ${
                forecastPeriod === p
                  ? 'bg-[#0B1F4D] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0B1F4D] hover:bg-slate-200/50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── 2. FORECAST ACCURACY & MAIN FORECAST CHART ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT: Forecast Accuracy Card (Span 4) */}
        <div className="lg:col-span-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[18px] p-5 sm:p-6 flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-black text-[#0B1F4D] uppercase tracking-wider block">
                Forecast Accuracy
              </span>
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest block mt-0.5">
                (Historical)
              </span>
            </div>

            {/* Large Accuracy Percentage */}
            <div className="pt-2">
              <div className="text-4xl sm:text-5xl font-black text-[#0B1F4D] tracking-tight font-sans">
                {forecast.confidence}%
              </div>
              
              <div className="mt-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  forecast.confidence >= 90
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  <TrendingUp className="w-3.5 h-3.5" />
                  {forecast.confidence >= 90 ? 'High Accuracy' : 'Moderate Accuracy'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#E2E8F0]/80 mt-6">
            <p className="text-[11px] text-[#64748B] font-medium leading-relaxed">
              Calculated using MAPE on last 90 days of data.
            </p>
          </div>
        </div>

        {/* RIGHT: Main Forecast Chart (Span 8) */}
        <div className="lg:col-span-8 bg-white border border-[#E2E8F0] rounded-[18px] p-5 sm:p-6 flex flex-col justify-between shadow-xs relative overflow-hidden">
          
          {/* Chart Header & Legend Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 mb-2">
            <h3 className="text-xs font-black text-[#0B1F4D] uppercase tracking-wider">
              Predicted Incident Count
            </h3>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-[10px] font-semibold text-[#64748B] select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-0.5 bg-[#0B1F4D] rounded-full" />
                <span className="text-[#334155]">Historical</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-0.5 border-t-2 border-dashed border-[#C79A2B]" />
                <span className="text-[#334155]">Predicted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-2.5 bg-[#C79A2B]/15 border border-[#C79A2B]/40 rounded-[2px]" />
                <span className="text-[#334155]">95% Prediction Interval</span>
              </div>
            </div>
          </div>

          {/* SVG Forecast Visualization */}
          <div className="w-full flex-1 relative min-h-[220px] flex items-center justify-center">
            <svg viewBox={`0 0 ${chartGeometry.width} ${chartGeometry.height}`} className="w-full h-full overflow-visible">
              
              {/* Y-Axis Grid Lines & Tick Labels */}
              {chartGeometry.ticks.map(t => (
                <g key={t.val}>
                  <line
                    x1={chartGeometry.marginLeft}
                    y1={t.y}
                    x2={chartGeometry.width - chartGeometry.marginRight}
                    y2={t.y}
                    stroke="#F1F5F9"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={chartGeometry.marginLeft - 8}
                    y={t.y + 3}
                    fill="#94A3B8"
                    fontSize="8.5"
                    fontWeight="600"
                    textAnchor="end"
                    className="font-mono select-none"
                  >
                    {t.val}
                  </text>
                </g>
              ))}

              {/* Y-Axis Title */}
              <text
                x={chartGeometry.marginLeft - 8}
                y={chartGeometry.marginTop - 16}
                fill="#64748B"
                fontSize="8"
                fontWeight="700"
                textAnchor="start"
                className="font-sans uppercase tracking-wider select-none"
              >
                Incidents
              </text>

              {/* 95% Confidence Interval Shaded Area */}
              {chartGeometry.boundsPath && (
                <path
                  d={chartGeometry.boundsPath}
                  fill="#C79A2B"
                  fillOpacity="0.10"
                  stroke="#C79A2B"
                  strokeWidth="0.8"
                  strokeDasharray="3 3"
                />
              )}

              {/* Vertical Transition Divider ("Forecast begins here") */}
              <line
                x1={chartGeometry.dividerX}
                y1={chartGeometry.marginTop - 10}
                x2={chartGeometry.dividerX}
                y2={chartGeometry.marginTop + chartGeometry.usableH}
                stroke="#94A3B8"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />
              <text
                x={chartGeometry.dividerX}
                y={chartGeometry.marginTop - 16}
                fill="#64748B"
                fontSize="7.5"
                fontWeight="700"
                textAnchor="middle"
                className="font-sans uppercase tracking-widest select-none"
              >
                Forecast begins here
              </text>

              {/* Historical Solid Line */}
              <path
                d={chartGeometry.histPath}
                fill="none"
                stroke="#0B1F4D"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Predicted Dashed Line */}
              <path
                d={chartGeometry.predPath}
                fill="none"
                stroke="#C79A2B"
                strokeWidth="2.5"
                strokeDasharray="5 4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Historical Circular Points + Values Above */}
              {chartGeometry.histPoints.map((p, i) => (
                <g key={`hist-${i}`}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="#FFFFFF"
                    stroke="#0B1F4D"
                    strokeWidth="2.2"
                  />
                  <text
                    x={p.x}
                    y={p.y - 8}
                    fill="#0B1F4D"
                    fontSize="8"
                    fontWeight="700"
                    textAnchor="middle"
                    className="font-mono select-none"
                  >
                    {p.val}
                  </text>
                  {/* X Axis Label */}
                  <text
                    x={p.x}
                    y={chartGeometry.marginTop + chartGeometry.usableH + 16}
                    fill="#64748B"
                    fontSize="8"
                    fontWeight="600"
                    textAnchor="middle"
                    className="font-mono select-none"
                  >
                    {timeLabels.historical[i] || `Day -${chartGeometry.histPoints.length - i}`}
                  </text>
                </g>
              ))}

              {/* Predicted Circular Points + Values Above */}
              {chartGeometry.predPoints.map((p, i) => (
                <g key={`pred-${i}`}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="#FFFFFF"
                    stroke="#C79A2B"
                    strokeWidth="2.2"
                  />
                  <text
                    x={p.x}
                    y={p.y - 8}
                    fill="#B45309"
                    fontSize="8"
                    fontWeight="700"
                    textAnchor="middle"
                    className="font-mono select-none"
                  >
                    {p.val}
                  </text>
                  {/* X Axis Label */}
                  <text
                    x={p.x}
                    y={chartGeometry.marginTop + chartGeometry.usableH + 16}
                    fill="#B45309"
                    fontSize="8"
                    fontWeight="700"
                    textAnchor="middle"
                    className="font-mono select-none"
                  >
                    {forecast.labels[i] || timeLabels.predicted[i] || `Day +${i + 1}`}
                  </text>
                </g>
              ))}

            </svg>
          </div>

        </div>

      </div>

      {/* ── 3. FOOTNOTE & SUMMARY ROW ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-[#F1F5F9] text-xs text-[#64748B]">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#C79A2B] shrink-0" />
          <span className="font-medium text-[11px]">
            Shaded area represents the 95% prediction interval (upper &amp; lower bound).
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-semibold text-[#0B1F4D]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Regression Confidence Active</span>
        </div>
      </div>

    </div>
  );
}
