import React from 'react';

export default function GlobalFilterPanel({ title, onApply, onReset, children, layout = 'grid', compact = false }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onApply && onApply(); }} className={`bg-white border border-[#E7ECF3] rounded-[24px] shadow-sm w-full ${compact ? 'p-6 mb-6' : 'p-7 sm:p-8 mb-8'}`}>
      {title && (
        <div className={`flex items-center gap-2 border-b border-[#E7ECF3] ${compact ? 'pb-3 mb-4' : 'pb-4 mb-5'}`}>
          <h3 className="text-lg font-bold text-[#0F172A] tracking-tight">{title}</h3>
        </div>
      )}
      <div className="flex flex-col gap-5">
        {layout === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {children}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-4">
            {children}
          </div>
        )}
        
        {(onApply || onReset) && (
          <div className="flex justify-end gap-3 mt-2">
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="h-11 px-6 text-xs font-bold rounded-[16px] bg-white border border-[#E5E7EB] text-[#0F172A] hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center cursor-pointer"
              >
                Reset
              </button>
            )}
            {onApply && (
              <button
                type="submit"
                className="h-11 px-6 text-xs font-bold rounded-[16px] bg-[#0B1F4D] text-white hover:bg-[#0A192F] transition-colors shadow-sm flex items-center justify-center cursor-pointer"
              >
                Apply Filters
              </button>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
