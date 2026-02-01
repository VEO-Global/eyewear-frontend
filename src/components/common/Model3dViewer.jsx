import React from "react";
import "@google/model-viewer";

const Model3dViewer = ({ src, poster }) => {
  return (
    <div className="w-full h-[500px] bg-gray-50 rounded-xl overflow-hidden shadow-inner">
      <model-viewer
        src={src} // Link file 3D
        poster={poster} // Ảnh hiển thị lúc đang tải 3D (UX)
        alt="Mô hình kính 3D"
        loading="eager" // Tải ngay lập tức
        camera-controls // Cho phép user xoay/phóng to
        auto-rotate // Tự động xoay cho đẹp
        shadow-intensity="1" // Đổ bóng cho thật
        ar // Bật chế độ AR (nếu dùng điện thoại)
        style={{ width: "100%", height: "100%" }} // Full khung
      >
        {/* Nút hiển thị khi tải xong (Optional) */}
        <div
          slot="poster"
          className="flex items-center justify-center w-full h-full text-gray-400"
        >
          Đang tải mô hình 3D...
        </div>
      </model-viewer>
    </div>
  );
};

export default Model3dViewer;
