import React from "react";
import { Heart, ShoppingBag, ShoppingCart } from "lucide-react";
import { Button } from "../common/Button";

export function ProductCard({ product }) {
  return (
    <div
      className="group overflow-hidden flex flex-col rounded-xl bg-white border border-gray-200
                transition-all duration-300
                hover:shadow-2xl hover:border-teal-500 hover:-translate-y-1"
    >
      {" "}
      {/* Product Image */}
      <div className="h-48 bg-background flex items-center justify-center">
        <img
          src={product.image}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        ></img>
      </div>
      {/* Product Details */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {product.name}
        </h3>

        <div className="flex items-center justify-between mb-4 flex-grow">
          <span className="text-2xl font-bold text-accent">
            {product.price}
          </span>

          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              product.status === "available"
                ? "bg-green-100 text-green-700"
                : product.status === "preorder"
                ? "bg-amber-100 text-amber-700"
                : "bg-indigo-100 text-indigo-700"
            }`}
          >
            {product.status === "available"
              ? "Có sẵn"
              : product.status === "preorder"
              ? "Đặt trước"
              : "Theo yêu cầu"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Thêm vào giỏ hàng
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="px-3 border-border text-foreground hover:bg-secondary bg-transparent"
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
