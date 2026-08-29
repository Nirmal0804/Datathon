import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';

/**
 * Reusable, high-performance LazyImage with shimmer skeleton loader & graceful fallback
 */
export default function LazyImage({
  src,
  alt = '',
  className = '',
  containerClassName = '',
  skeletonClassName = '',
  fallbackIcon: FallbackIcon = Shield,
  fallbackText = '',
  loading = 'lazy',
  aspectRatio,
  width,
  height,
  style = {},
  onLoad,
  onError,
  ...props
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Reset state when src changes
    setLoaded(false);
    setError(false);

    if (!src) {
      setError(true);
      return;
    }

    // Check if the image is already cached in browser
    const img = new Image();
    img.src = src;
    if (img.complete && img.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  const handleLoad = (e) => {
    setLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    setError(true);
    setLoaded(true);
    if (onError) onError(e);
  };

  return (
    <div
      className={`relative overflow-hidden inline-flex items-center justify-center ${containerClassName}`}
      style={{
        ...(aspectRatio ? { aspectRatio } : {}),
        ...(width ? { width } : {}),
        ...(height ? { height } : {}),
        ...style,
      }}
    >
      {/* ── Skeleton Shimmer Placeholder (visible only while loading) ── */}
      {!loaded && (
        <div
          className={`absolute inset-0 z-0 bg-[#EBF0F7] animate-pulse flex items-center justify-center ${skeletonClassName}`}
          aria-hidden="true"
        >
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent bg-[length:200%_100%] animate-shimmer" />
        </div>
      )}

      {/* ── Actual Image ── */}
      {!error ? (
        <img
          src={src}
          alt={alt}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          className={`${className} ${
            loaded ? 'opacity-100' : 'opacity-0'
          } transition-opacity duration-300 ease-out`}
          {...props}
        />
      ) : (
        /* ── Graceful Fallback Container ── */
        <div className="flex flex-col items-center justify-center p-2 text-slate-400 bg-slate-100/90 w-full h-full rounded-inherit">
          <FallbackIcon className="w-5 h-5 text-slate-400/80" />
          {fallbackText && (
            <span className="text-[10px] font-semibold text-slate-500 mt-1 uppercase tracking-wider text-center">
              {fallbackText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
