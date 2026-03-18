/* eslint-disable no-unused-vars */
import { EyeIcon, Heart, ShoppingCart } from "lucide-react";
import ViewDetail from "./ViewDetail";
import { Button } from "./Button";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchProductById } from "../../redux/products/producSlice";

export function ProductCard({ product }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleViewDetail = () => {
    dispatch(fetchProductById(product.id));
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
      <div className="relative group h-48 bg-gray-100 overflow-hidden">
        <img
          src={product.image || "/placeholder.jpg"}
          alt={product.name}
          className="
            w-full h-full object-cover
            transition-transform duration-500
            group-hover:scale-110
          "
        />

        {/* Overlay ViewDetail */}
        {/* <ViewDetail onClick={handleViewDetail} /> */}
      </div>

      {/* Product Details */}
      <div className="p-6 flex flex-col grow">
        {/* Product Name */}
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {product.name}
        </h3>

        {/* Price + Stock */}
        <div className="flex items-center justify-between mb-4 grow">
          {/* Price */}
          <span className="text-xl font-bold ">
            {product.basePrice?.toLocaleString("vi-VN")} ₫
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-teal-600 text-white hover:bg-teal-700 gap-2 cursor-pointer"
            onClick={handleViewDetail}
          >
            <EyeIcon className="w-4 h-4 text-white" />
            <span className="font-medium text-white">Xem Chi tiết</span>
          </Button>

          <Button size="sm" variant="danger">
            <Heart className="w-4 h-4 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
}
