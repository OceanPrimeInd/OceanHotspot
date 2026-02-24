"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPlaceholderSvg } from "@/lib/productPlaceholders";

interface ProductImageGalleryProps {
  images: string[];
  title: string;
}
export function ProductImageGallery({ images, title }: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const hasImages = images.length > 0;
  const selectedImage = hasImages ? images[selectedIndex] : null;
  const placeholder = getPlaceholderSvg(title);

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="aspect-square rounded-xl bg-muted flex items-center justify-center overflow-hidden border border-border">
        {selectedImage ? (
          <img
            src={selectedImage}
            alt={title}
            className="w-full h-full object-contain"
          />
        ) : placeholder ? (
          <div className="w-full h-full">
            {placeholder}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <ImageIcon className="h-16 w-16 mb-2" />
            <span className="text-sm">No image</span>
          </div>
        )}
      </div>
      {/* Thumbnail Row */}
      {images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.slice(0, 5).map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={cn(
                "w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-lg border-2 overflow-hidden transition-all",
                selectedIndex === idx
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50"
              )}
            >
              <img
                src={img}
                alt={`${title} - Image ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
          {images.length > 5 && (
            <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-lg border border-border bg-muted flex items-center justify-center text-sm text-muted-foreground">
              +{images.length - 5}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
