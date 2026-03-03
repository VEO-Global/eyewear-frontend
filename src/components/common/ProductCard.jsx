import { Heart, ShoppingCart } from "lucide-react";
import ViewDetail from "./ViewDetail";
import { Button } from "./Button";
import { useNavigate } from "react-router-dom";

export function ProductCard({ product }) {
  const navigate = useNavigate();

  const handleViewDetail = () => {
    console.log(`Xem chi tiết sản phẩm: ${product.name}`);

    navigate(`/products/${product.id}`);
  };

  return (
    <div
      className="
        overflow-hidden flex flex-col rounded-xl bg-white border border-gray-200
        transition-all duration-300
        hover:shadow-2xl hover:border-teal-500 hover:-translate-y-1
      "
    >
      {/* Product Image */}
      <div className="relative group h-48 bg-background overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="
            w-full h-full object-cover
            transition-transform duration-500
            group-hover:scale-110
          "
        />

        {/* Overlay ViewDetail */}
        <ViewDetail onClick={handleViewDetail} />
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
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-2 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4 text-white" />
            <span className="text-white font-medium"> Thêm vào giỏ hàng</span>
          </Button>

          <Button size="sm" variant="danger">
            <Heart className="w-4 h-4 text-white fon" />
          </Button>
        </div>
      </div>
    </div>
  );
}
