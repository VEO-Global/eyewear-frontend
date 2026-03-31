import dayjs from "dayjs";
import React from "react";
import { isPreorderProduct } from "../../utils/productCatalog";

export function ProductInfo({
  brand,
  name,
  price,
  description,
  material,
  createdAt,
  gender,
  catalogType,
  lens,
  setSelectedLens,
}) {
  const showPreorderBadge = isPreorderProduct({ catalogType });
  const lensOptions = lens.map((item) => ({
    value: item.id,
    label: item.name,
  }));
  return (
    <div className="flex flex-col gap-6 border-b border-gray-100 pb-8">
      <div className="text-sm font-medium uppercase tracking-widest text-gray-500">
        {brand}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-4xl font-light tracking-tight text-balance">
          {name}
        </h1>
        {showPreorderBadge ? (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            Đặt trước
          </span>
        ) : null}
      </div>

      <div className="text-3xl font-light text-black">
        {Number(price || 0).toLocaleString("vi-VN")}₫
      </div>

      <p className="text-base leading-relaxed text-gray-600 text-pretty">
        {description}
      </p>

      <div className="flex flex-col">
        <div className="flex gap-8 border-t border-gray-100 py-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest text-gray-500">
              Nguyên liệu
            </span>
            <span className="text-sm font-medium text-gray-900">
              {material}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest text-gray-500">
              Ngày sản xuất
            </span>
            <span className="text-sm font-medium text-gray-900">
              {dayjs(createdAt).format("DD/MM/YYYY")}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest text-gray-500">
              Giới tính
            </span>
            <span className="text-sm font-medium text-gray-900">
              {gender === "Male" ? <span>Nam</span> : <span>Nữ</span>}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1 ">
          <span className="text-xs uppercase tracking-widest text-gray-500">
            Tròng kính
          </span>
          <select
            className="border rounded px-2 py-1 cursor-pointer"
            onChange={(e) => setSelectedLens(e.target.value)}
          >
            <option value="">Chọn tròng kính</option>
            {lensOptions.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
