import { EyeIcon, Heart, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Button } from "./Button";
import { fetchProductById } from "../../redux/products/producSlice";
import { getProductAvailability, isPreorderProduct } from "../../utils/productCatalog";

export function ProductCard({ product }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isPreorder = isPreorderProduct(product);
  const availability = getProductAvailability(product);

  function openProductDetail() {
    dispatch(fetchProductById(product.id));
    navigate(`/products/${product.id}`);
  }

  function handlePrimaryAction() {
    dispatch(fetchProductById(product.id));

    if (isPreorder) {
      navigate("/user/preorder", {
        state: { preserveSelection: true },
      });
      return;
    }

    navigate(`/products/${product.id}`);
  }

  return (
    <div
      className="
        overflow-hidden flex flex-col rounded-xl bg-white border border-gray-200
        transition-all duration-300
        hover:shadow-2xl hover:border-teal-500 hover:-translate-y-1
      "
    >
      <div
        className="relative group h-48 cursor-pointer overflow-hidden bg-gray-100"
        onClick={openProductDetail}
      >
        <img
          src={product.imageUrl || product.image || "/placeholder.jpg"}
          alt={product.name}
          className="
            w-full h-full object-cover
            transition-transform duration-500
            group-hover:scale-110
          "
        />

        {isPreorder ? (
          <span className="absolute left-3 top-3 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 shadow-sm">
            Đặt trước
          </span>
        ) : null}
      </div>

      <div className="flex grow flex-col p-6">
        <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-800">
          {product.name}
        </h3>

        <div className="mb-4 grow">
          <span className="text-xl font-bold">
            {Number(product.basePrice || 0).toLocaleString("vi-VN")} ₫
          </span>
          <p className="mt-2 text-sm text-gray-500">
            {availability === "preorder"
              ? "Nhận đặt trước"
              : availability === "out_of_stock"
                ? "Tạm hết hàng"
                : "Có sẵn"}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 cursor-pointer gap-2 bg-teal-600 text-white hover:bg-teal-700"
            onClick={handlePrimaryAction}
          >
            {isPreorder ? (
              <ShoppingCart className="h-4 w-4 text-white" />
            ) : (
              <EyeIcon className="h-4 w-4 text-white" />
            )}
            <span className="font-medium text-white">
              {isPreorder ? "Đặt trước" : "Xem chi tiết"}
            </span>
          </Button>

          <Button size="sm" variant="danger">
            <Heart className="h-4 w-4 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
}
