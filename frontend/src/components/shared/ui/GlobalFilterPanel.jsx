import React from 'react';

export default function GlobalFilterPanel({ title, onApply, onReset, children, layout = 'grid', compact = false }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onApply && onApply(); }} className={`bg-white border border-[#E5E7EB] rounded-[24px] shadow-sm w-full ${compact ? 'p-4 mb-4' : 'p-5 mb-6'}`}>
      {title && (
        <div className={`flex items-center gap-2 border-b border-[#E5E7EB] ${compact ? 'pb-3 mb-3' : 'pb-4 mb-4'}`}>
          <h3 className={`${compact ? 'text-[16px]' : 'text-[18px]'} font-semibold text-[#0B1F4D] tracking-tight`}>{title}</h3>
        </div>
      )}
      <div className={`flex flex-col ${compact ? 'gap-3' : 'gap-4'}`}>
        {layout === 'grid' ? (
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 ${compact ? 'gap-3' : 'gap-4'}`}>
            {children}
          </div>
        ) : (
          <div className={`flex flex-wrap items-center ${compact ? 'gap-3' : 'gap-4'}`}>
            {children}
          </div>
        )}
        
        {(onApply || onReset) && (
          <div className={`flex justify-end ${compact ? 'gap-2' : 'gap-3 mt-2'}`}>
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className={`${compact ? 'h-[42px] px-4 text-[13px] rounded-[10px]' : 'h-[44px] px-6 text-[14px] rounded-[14px]'} bg-white border border-[#E5E7EB] text-[#0B1F4D] font-semibold hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center`}
              >
                Reset
              </button>
            )}
            {onApply && (
              <button
                type="submit"
                className={`${compact ? 'h-[42px] px-4 text-[13px] rounded-[10px]' : 'h-[44px] px-6 text-[14px] rounded-[14px]'} bg-[#0B1F4D] text-white font-semibold hover:bg-[#0A192F] transition-colors shadow-sm flex items-center justify-center`}
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
