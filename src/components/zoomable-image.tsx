/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useRef, useState } from "react";

interface ZoomableImageProps {
  src: string;
  alt: string;
}

export function ZoomableImage({ src, alt }: ZoomableImageProps) {
  const [transformOrigin, setTransformOrigin] =
    useState<string>("center center");
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100; // Percentage of X
    const y = ((e.clientY - top) / height) * 100; // Percentage of Y

    // Set the transform origin dynamically based on cursor position
    if (imgRef.current) {
      imgRef.current.style.transformOrigin = `${x}% ${y}%`;
    }

    setIsZoomed(true); // Activate zoom
  };

  const handleMouseLeave = () => {
    setIsZoomed(false); // Reset zoom
    setTransformOrigin("center center"); // Reset position to center
  };
  return (
    <div
      className="relative w-full h-full overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="w-full h-full object-contain transition-transform duration-300 ease-in-out"
        style={{
          transform: isZoomed ? "scale(2)" : "scale(1)",
          transformOrigin: transformOrigin,
        }}
      />
    </div>
  );
}
