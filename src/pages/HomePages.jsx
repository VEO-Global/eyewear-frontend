import React from "react";
import "@google/model-viewer"; // Quan trọng: Phải import thư viện

const HomePages = () => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-5">DEMO KÍNH XOAY 3D</h1>

      {/* KHUNG CHỨA 3D */}
      <div className="w-[800px] h-[500px] bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-200">
        <model-viewer
          // Đường dẫn này trỏ vào file bạn đã copy vào public/models/
          src="/3d-models/black_eyeglasses.glb"
          ios-src=""
          poster="https://via.placeholder.com/800x500?text=Loading+3D..."
          alt="Kính demo"
          shadow-intensity="1"
          camera-controls
          auto-rotate // <--- LỆNH CHO NÓ QUAY
          ar
          style={{ width: "100%", height: "100%" }}
        ></model-viewer>
      </div>

      <p className="mt-4 text-gray-500">
        Dùng chuột để xoay, lăn chuột để phóng to/thu nhỏ
      </p>
    </div>
  );
};

export default HomePages;
