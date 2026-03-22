import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useLocation } from "react-router-dom";
import PreorderForm from "../form/PreorderForm";
import {
  clearSelectedProduct,
  fetchProductById,
  fetchProducts,
} from "../redux/products/producSlice";

export default function PreorderPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { products, selectedProduct, loading } = useSelector(
    (state) => state.products
  );
  const [showProductDetail, setShowProductDetail] = useState(
    Boolean(selectedProduct)
  );

  const preorderProducts = products.slice(0, 6);

  useEffect(() => {
    if (!products.length) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);

  useEffect(() => {
    if (!location.state?.preserveSelection) {
      dispatch(clearSelectedProduct());
      setShowProductDetail(false);
    }
  }, [dispatch, location.key, location.state?.preserveSelection]);

  useEffect(() => {
    if (selectedProduct) {
      setShowProductDetail(true);
    }
  }, [selectedProduct]);

  function handleSelectProduct(productId) {
    dispatch(fetchProductById(productId));
    setShowProductDetail(true);
  }

  function renderProductGrid() {
    return (
      <div className="w-full max-w-3xl">
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1 text-sm font-medium text-amber-700">
            <Sparkles className="h-4 w-4" />
            Sản phẩm sắp ra mắt
          </span>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">
            Chọn sản phẩm để đặt trước
          </h2>
          <p className="mt-3 text-gray-600">
            Chọn một trong các mẫu kính bên dưới. Sau khi bấm vào sản phẩm, phần
            bên phải sẽ hiển thị form để bạn hoàn tất đơn hàng hoặc cung cấp toa
            thuốc nếu đặt kính có độ.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {preorderProducts.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => handleSelectProduct(product.id)}
              className="group overflow-hidden rounded-3xl border border-gray-200 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-400 hover:shadow-xl"
            >
              <div className="h-40 overflow-hidden bg-gray-100">
                <img
                  src={product.imageUrl || product.image || "/placeholder.png"}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="p-5">
                <p className="text-sm font-medium text-teal-600">{product.brand}</p>
                <h3 className="mt-2 text-xl font-semibold text-gray-900 line-clamp-2">
                  {product.name}
                </h3>
                <p className="mt-3 text-sm leading-6 text-gray-500 line-clamp-3">
                  {product.description || "Mẫu kính mới đang mở đặt trước."}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">
                    {product.basePrice?.toLocaleString("vi-VN")}đ
                  </span>
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                    Xem chi tiết
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  function renderSelectedProduct() {
    if (loading && !selectedProduct) {
      return (
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
          <div className="animate-pulse space-y-4">
            <div className="h-56 rounded-2xl bg-gray-200"></div>
            <div className="h-8 w-2/3 rounded bg-gray-200"></div>
            <div className="h-5 w-1/3 rounded bg-gray-200"></div>
            <div className="h-6 w-1/2 rounded bg-gray-200"></div>
            <div className="h-20 rounded bg-gray-200"></div>
          </div>
        </div>
      );
    }

    if (!selectedProduct) {
      return renderProductGrid();
    }

    return (
      <div className="flex w-full max-w-md flex-col gap-6">
        <button
          type="button"
          onClick={() => {
            dispatch(clearSelectedProduct());
            setShowProductDetail(false);
          }}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-teal-500 hover:text-teal-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách sản phẩm
        </button>

        <div className="w-full overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg">
          <img
            src={
              selectedProduct.imageUrl ||
              selectedProduct.image ||
              "/placeholder.png"
            }
            alt={selectedProduct.name}
            className="h-72 w-full object-cover"
          />

          <div className="flex flex-col gap-4 p-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {selectedProduct.name}
            </h2>

            <p className="text-lg text-gray-500">{selectedProduct.brand}</p>

            <p className="text-3xl font-semibold text-gray-950">
              {selectedProduct.basePrice?.toLocaleString("vi-VN")}đ
            </p>

            <p className="text-gray-600 leading-relaxed">
              {selectedProduct.description || "Sản phẩm sắp ra mắt."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="flex items-center justify-center border-r bg-gray-50 px-6 py-12 lg:px-10">
        {showProductDetail ? renderSelectedProduct() : renderProductGrid()}
      </div>

      <div className="flex items-center justify-center bg-gradient-to-bl from-teal-50 via-white to-blue-50 px-4 py-12 sm:px-6 lg:px-10">
        <div className="w-full max-w-4xl rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur sm:p-8 lg:p-10">
          <h1 className="mb-3 text-3xl font-serif font-bold text-gray-900 sm:text-4xl">
            Đặt đơn tại EyeCare Store
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Điền thông tin nhận hàng và cung cấp toa thuốc nếu bạn đang đặt kính
            có độ. Mọi bước đều được trình bày đơn giản để bạn dễ thao tác trên
            cả điện thoại và máy tính.
          </p>
          <PreorderForm selectedProduct={selectedProduct} />
        </div>
      </div>
    </div>
  );
}
