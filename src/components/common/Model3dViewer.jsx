import React from "react";
import "@google/model-viewer";

const Model3dViewer = ({ src, poster, height = "500px" }) => {
  if (!src) return null; // Không có link thì không hiện gì cả

  return (
    <div
      className={`w-full bg-gray-50 rounded-xl overflow-hidden relative`}
      style={{ height: height }}
    >
      <model-viewer
        src={src}
        poster={poster || "https://via.placeholder.com/400x300?text=Loading..."}
        alt="Mô hình kính 3D"
        loading="eager"
        camera-controls
        auto-rotate
        shadow-intensity="1"
        ar
        crossOrigin="anonymous"
        style={{ width: "100%", height: "100%" }}
      >
        <div
          slot="poster"
          className="flex items-center justify-center w-full h-full text-gray-400"
        >
          <span className="animate-pulse">Đang tải 3D...</span>
        </div>
      </model-viewer>
    </div>
  );
};

export default Model3dViewer;
