import React from "react";
import { isPreorderProduct } from "../../utils/productCatalog";

const colorMap = {
  "Matte Black": "#1a1a1a",
  Silver: "#c0c0c0",
  Gold: "#d4af37",
  Tortoise: "#8b6f47",
  Brown: "#654321",
  Black: "#000000",
};

export function VariantSelector({
  variants,
  selectedColor,
  selectedSize,
  onColorChange,
  onSizeChange,
  selectedProduct,
  selectedVariant,
}) {
  const colors = [...new Set(variants.map((v) => v.color))];
  const sizes = [...new Set(variants.map((v) => v.size))];
  const isPreorder = isPreorderProduct(selectedProduct);

  return (
    <div className="flex flex-col gap-8 py-8">
      <div className="flex justify-between">
        <div className="flex flex-col gap-4">
          <label className="text-sm font-medium uppercase tracking-wider text-gray-900">
            Kích cỡ
          </label>

          <div className="flex gap-3">
            <>
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => onSizeChange(size)}
                  className={`cursor-pointer rounded-lg border px-6 py-3 text-sm font-medium transition-all ${
                    selectedSize === size
                      ? "border-slate-900 bg-slate-100 text-slate-900 shadow-sm"
                      : "border-gray-300 bg-white text-black hover:border-black"
                  }`}
                >
                  {size}
                </button>
              ))}
            </>
          </div>
        </div>

        <div className="flex flex-col">
          <label className="px-5 text-sm font-medium uppercase tracking-wider text-gray-900">
            Số lượng
          </label>
          <span
            className={`mt-6 px-6 ${
              !isPreorder && Number(selectedVariant?.stockQuantity || 0) === 0
                ? "text-red-700"
                : ""
            }`}
          >
            {isPreorder
              ? "Nhận đặt trước"
              : Number(selectedVariant?.stockQuantity || 0) === 0
                ? "Hết hàng"
                : selectedVariant?.stockQuantity}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium uppercase tracking-wider text-gray-900">
            Màu sắc
          </label>
          <span className="text-sm text-gray-500">{selectedColor}</span>
        </div>

        <div className="flex gap-4">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => onColorChange(color)}
              className={`relative h-12 w-12 cursor-pointer rounded-full border-2 transition-all duration-200 ${
                selectedColor === color
                  ? "scale-125 border-black"
                  : "border-gray-300 hover:scale-110 hover:border-gray-500"
              }`}
              style={{
                backgroundColor: colorMap[color] || "#cccccc",
              }}
              title={color}
            >
              {selectedColor === color && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="pointer-events-none h-6 w-6 rounded-full border-2 border-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
