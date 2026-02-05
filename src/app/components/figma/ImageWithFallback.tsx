import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, AlertCircle, RefreshCw } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string; // Optional: A secondary image to try (e.g., a default avatar)
  fallbackComponent?: React.ReactNode; // Optional: A custom icon/component to show on error
  showLoadingSkeleton?: boolean;
}

export function ImageWithFallback({
  src,
  alt,
  className = '',
  style,
  fallbackSrc,
  fallbackComponent,
  showLoadingSkeleton = true,
  ...props
}: ImageWithFallbackProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [imgSrc, setImgSrc] = useState<string | undefined>(src);

  useEffect(() => {
    setImgSrc(src);
    setStatus('loading');
  }, [src]);

  const handleError = () => {
    if (fallbackSrc && imgSrc !== fallbackSrc) {
      // Try the fallback source first
      setImgSrc(fallbackSrc);
      // Keep status as loading while fallback fetches
    } else {
      setStatus('error');
    }
  };

  const handleLoad = () => {
    setStatus('success');
  };

  // Common wrapper class to ensure dimensions match the passed className
  // We filter out bg-colors from the passed className to apply them to the wrapper
  const containerClass = `relative overflow-hidden ${className}`;

  return (
    <div className={containerClass} style={style}>
      
      {/* 1. Loading Skeleton */}
      {status === 'loading' && showLoadingSkeleton && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10">
          <ImageIcon className="w-8 h-8 text-gray-300 opacity-50" />
        </div>
      )}

      {/* 2. Error State */}
      {status === 'error' && (
        <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center text-gray-400 z-10 p-2 text-center border border-gray-200">
          {fallbackComponent ? (
            fallbackComponent
          ) : (
            <>
              <AlertCircle className="w-6 h-6 mb-1" />
              <span className="text-[10px] uppercase font-bold tracking-wider">Failed to Load</span>
            </>
          )}
        </div>
      )}

      {/* 3. The Image */}
      {/* We keep the image in the DOM even if loading to trigger the onLoad event */}
      {imgSrc && (
        <img
          src={imgSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-500 ease-in-out ${
            status === 'success' ? 'opacity-100' : 'opacity-0'
          }`}
          {...props}
        />
      )}
    </div>
  );
}