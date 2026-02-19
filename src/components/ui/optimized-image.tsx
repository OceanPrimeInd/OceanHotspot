"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Package } from "lucide-react";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null;
  alt: string;
  fallbackIcon?: React.ReactNode;
  aspectRatio?: "video" | "square" | "auto";
  showPlaceholder?: boolean;
  placeholderColor?: string;
  containerClassName?: string;
  onLoadComplete?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  fallbackIcon,
  aspectRatio = "auto",
  showPlaceholder = true,
  placeholderColor = "from-primary/10 to-secondary/10",
  containerClassName,
  onLoadComplete,
  className,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [isInView, setIsInView] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "100px", // Start loading 100px before entering viewport
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoadComplete?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  const aspectRatioClass = {
    video: "aspect-video",
    square: "aspect-square",
    auto: "",
  }[aspectRatio];

  const showFallback = !src || hasError;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden",
        aspectRatioClass,
        containerClassName
      )}
    >
      {/* Blur placeholder background */}
      {showPlaceholder && !isLoaded && !showFallback && (
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br animate-pulse",
            placeholderColor
          )}
        />
      )}

      {/* Actual image */}
      {src && isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-500",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          {...props}
        />
      )}

      {/* Fallback icon */}
      {showFallback && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-gradient-to-br",
            placeholderColor
          )}
        >
          {fallbackIcon || <Package className="h-12 w-12 text-primary/50" />}
        </div>
      )}

      {/* Loading shimmer overlay */}
      {!isLoaded && !showFallback && isInView && (
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"
            style={{ animationDuration: "1.5s" }}
          />
        </div>
      )}
    </div>
  );
}

// Add shimmer animation to global styles or tailwind config
// @keyframes shimmer { 100% { transform: translateX(100%); } }
