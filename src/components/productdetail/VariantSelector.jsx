import React from "react";

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
}) {
  const colors = [...new Set(variants.map((v) => v.color))];
  const sizes = [...new Set(variants.map((v) => v.size))];

  const mockColors = [
    "Matte Black",
    "Silver",
    "Gold",
    "Tortoise",
    "Brown",
    "Black",
  ];
  return (
    <div className="flex flex-col gap-8 py-8">
      <div className="flex flex-col gap-4">
        <label className="text-sm font-medium text-gray-900 uppercase tracking-wider">
          Size
        </label>

        <div className="flex gap-3">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => onSizeChange(size)}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all border cursor-pointer ${
                selectedSize === size
                  ? "bg-black"
                  : "bg-white text-black border-gray-300 hover:border-black"
              }`}
            >
              <span
                className={`${
                  selectedSize === size
                    ? "text-white"
                    : "bg-white text-black border-gray-300 hover:border-black"
                }`}
              >
                {" "}
                {size}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Color Selection */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-900 uppercase tracking-wider">
            Color
          </label>
          <span className="text-sm text-gray-500">{selectedColor}</span>
        </div>

        <div className="flex gap-4">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => onColorChange(color)}
              className={`relative w-12 h-12 rounded-full border-2 transition-all duration-200 cursor-pointer ${
                selectedColor === color
                  ? "border-black scale-125"
                  : "border-gray-300 hover:border-gray-500 hover:scale-110"
              }`}
              style={{
                backgroundColor: colorMap[color] || "#cccccc",
              }}
              title={color}
            >
              {selectedColor === color && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full border-2 border-white pointer-events-none" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
