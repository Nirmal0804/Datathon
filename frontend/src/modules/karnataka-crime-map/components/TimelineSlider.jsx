import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Calendar, FastForward } from 'lucide-react';

export default function TimelineSlider({ 
  onTimeChange, 
  startDate, 
  endDate 
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sliderVal, setSliderVal] = useState(12); // range 0 to 12 representing months from July 2025 to July 2026
  const [playbackSpeed, setPlaybackSpeed] = useState(1000); // ms per tick

  const monthsList = [
    'Jul 25', 'Aug 25', 'Sep 25', 'Oct 25', 'Nov 25', 'Dec 25',
    'Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'May 26', 'Jun 26', 'Jul 26'
  ];

  // Trigger filters callback when slider values update
  useEffect(() => {
    // Determine start/end date bounds based on sliderVal
    const baseDate = new Date(2025, 6, 23); // July 23, 2025
    const targetDate = new Date(baseDate.getTime());
    targetDate.setMonth(baseDate.getMonth() + sliderVal);
    
    // We filter cases that occurred up to targetDate
    onTimeChange(targetDate);
  }, [sliderVal, onTimeChange]);

  // Interval timer for playback loop
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setSliderVal(prev => {
          if (prev >= 12) {
            setIsPlaying(false);
            return 12;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  const handleReset = () => {
    setIsPlaying(false);
    setSliderVal(12); // reset to show full dataset
  };

  const toggleSpeed = () => {
    setPlaybackSpeed(prev => (prev === 1000 ? 500 : prev === 500 ? 250 : 1000));
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-4 shadow-2xl flex flex-col md:flex-row items-center gap-4 w-full text-slate-200">
      
      {/* Playback Controls */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`p-2 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
            isPlaying ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
          title={isPlaying ? 'Pause Playback' : 'Play Timeline'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-300" />}
        </button>

        <button
          onClick={toggleSpeed}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 cursor-pointer text-4xs font-bold uppercase tracking-wider"
          title="Change Playback Speed"
        >
          <FastForward className="w-4 h-4" />
          <span>{playbackSpeed === 1000 ? '1x' : playbackSpeed === 500 ? '2x' : '4x'}</span>
        </button>

        <button
          onClick={handleReset}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          title="Reset playback"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Date timeline slider */}
      <div className="flex-1 flex flex-col gap-1 w-full">
        <div className="flex justify-between items-center text-4xs font-bold text-slate-500 uppercase tracking-widest px-1">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            Timeline Sequence
          </span>
          <span className="font-mono text-xs font-bold text-slate-250 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
            {monthsList[sliderVal]}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-500 font-semibold font-mono whitespace-nowrap">Jul 2025</span>
          <input 
            type="range"
            min="0"
            max="12"
            value={sliderVal}
            onChange={(e) => setSliderVal(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-primary border border-slate-850 focus:outline-none"
          />
          <span className="text-[10px] text-slate-500 font-semibold font-mono whitespace-nowrap">Jul 2026</span>
        </div>
      </div>
    </div>
  );
}
