import dayjs from "dayjs";
import React from "react";

export function ProductInfo({
  brand,
  name,
  price,
  description,
  material,
  createdAt,
  gender,
}) {
  return (
    <div className="flex flex-col gap-6 pb-8 border-b border-gray-100">
      {/* Brand */}
      <div className="text-sm font-medium text-gray-500 tracking-widest uppercase">
        {brand}
      </div>

      {/* Product Name */}
      <h1 className="text-4xl font-light tracking-tight text-balance">
        {name}
      </h1>

      {/* Price */}
      <div className="text-3xl font-light text-black">
        {price?.toLocaleString("vi-VN")}Đ
      </div>

      {/* Description */}
      <p className="text-base text-gray-600 leading-relaxed text-pretty">
        {description}
      </p>

      {/* Quick Stats */}
      <div className="flex gap-8 py-6 border-t border-gray-100">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 uppercase tracking-widest">
            Nguyên liệu
          </span>
          <span className="text-sm font-medium text-gray-900">{material}</span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 uppercase tracking-widest">
            Ngày sản xuất
          </span>
          <span className="text-sm font-medium text-gray-900">
            {dayjs(createdAt).format("DD/MM/YYYY")}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 uppercase tracking-widest">
            Giới tính
          </span>
          <span className="text-sm font-medium text-gray-900">
            {gender === "Male" ? <span> Nam</span> : <span>Nữ</span>}
          </span>
        </div>
      </div>
    </div>
  );
}
