"use client";

import { useEffect, useMemo, useState } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPlaceholderSvg } from "@/lib/productPlaceholders";

interface ProductImageGalleryProps {
  images: string[];
  title: string;
}

function normalizeImageUrl(url: string) {
  const trimmed = url.trim();
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return trimmed;
}

export function ProductImageGallery({ images, title }: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState<Set<string>>(() => new Set());

  const galleryImages = useMemo(
    () => [...new Set(images.map(normalizeImageUrl).filter(Boolean))],
    [images],
  );

  const loadableImages = useMemo(
    () => galleryImages.filter((url) => !failedUrls.has(url)),
    [galleryImages, failedUrls],
  );

  useEffect(() => {
    setSelectedIndex(0);
    setFailedUrls(new Set());
  }, [galleryImages.join("|")]);

  useEffect(() => {
    if (selectedIndex >= loadableImages.length) {
      setSelectedIndex(Math.max(0, loadableImages.length - 1));
    }
  }, [loadableImages.length, selectedIndex]);

  const selectedImage = loadableImages[selectedIndex] ?? null;
  const placeholder = getPlaceholderSvg(title);

  const markFailed = (url: string) => {
    setFailedUrls((prev) => {
      const next = new Set(prev);
      next.add(url);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="aspect-square rounded-xl bg-[#f8f9fa] flex items-center justify-center overflow-hidden border border-border">
        {selectedImage ? (
          <img
            src={selectedImage}
            alt={title}
            className="w-full h-full object-contain p-2"
            referrerPolicy="no-referrer"
            onError={() => markFailed(selectedImage)}
          />
        ) : placeholder ? (
          <div className="w-full h-full">{placeholder}</div>
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <ImageIcon className="h-16 w-16 mb-2" />
            <span className="text-sm">No image</span>
          </div>
        )}
      </div>

      {loadableImages.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {loadableImages.slice(0, 5).map((img, idx) => (
            <button
              key={img}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={cn(
                "w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-lg border-2 overflow-hidden transition-all bg-white",
                selectedIndex === idx
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50",
              )}
            >
              <img
                src={img}
                alt={`${title} - Image ${idx + 1}`}
                className="w-full h-full object-contain p-0.5"
                referrerPolicy="no-referrer"
                onError={() => markFailed(img)}
              />
            </button>
          ))}
          {loadableImages.length > 5 && (
            <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-lg border border-border bg-muted flex items-center justify-center text-sm text-muted-foreground">
              +{loadableImages.length - 5}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
