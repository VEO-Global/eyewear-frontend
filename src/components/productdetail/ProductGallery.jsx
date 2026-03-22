/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { ZoomIn } from "lucide-react";
import { PRODUCT_PLACEHOLDER_IMAGE } from "../../utils/productImages";

export function ProductGallery({ images, selectedImage, onImageSelect }) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const galleryImages = Array.isArray(images) && images.length
    ? images
    : [PRODUCT_PLACEHOLDER_IMAGE];
  const activeImage = selectedImage || galleryImages[0] || PRODUCT_PLACEHOLDER_IMAGE;

  const handleMouseMove = (e) => {
    if (!isZoomed) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({ x, y });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Main Image */}
      <div
        className="relative w-full aspect-square bg-gray-50 rounded-2xl overflow-hidden group cursor-zoom-in"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={activeImage}
          alt="Product"
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isZoomed ? "scale-150" : "scale-100"
          }`}
          style={
            isZoomed
              ? {
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                }
              : undefined
          }
        />

        {/* Zoom Indicator */}
        <div className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn size={18} />
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {galleryImages.map((image, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onImageSelect?.(image)}
            className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
              activeImage === image
                ? "border-black ring-2 ring-black/10"
                : "border-gray-200 hover:border-gray-400"
            }`}
          >
            <img
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
