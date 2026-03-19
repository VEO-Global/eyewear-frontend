import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import PreorderForm from "../form/PreorderForm";

export default function PreorderPage() {
  const { selectedProduct } = useSelector((state) => state.products);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="flex items-center justify-center bg-gray-50 px-10 py-12 border-r">
        {selectedProduct ? (
          <div className="max-w-md w-full flex flex-col gap-6">
            <div className="w-full rounded-xl overflow-hidden bg-white shadow">
              <img
                src={selectedProduct.imageUrl || "/placeholder.png"}
                alt={selectedProduct.name}
                className="w-full object-cover"
              />
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedProduct.name}
              </h2>
              <p className="text-gray-500">{selectedProduct.brand}</p>
              <p className="text-lg font-semibold text-black">
                {selectedProduct.basePrice?.toLocaleString("vi-VN")}đ
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                {selectedProduct.description}
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
            <span className="inline-flex px-4 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
              Chưa chọn sản phẩm
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mt-4">
              Đặt trước sản phẩm
            </h2>
            <p className="text-gray-600 mt-4 leading-relaxed">
              Bạn có thể vào danh sách sản phẩm, chọn mẫu kính mong muốn rồi bấm
              nút <strong>Đặt trước</strong> để điền form nhanh hơn.
            </p>
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="mt-6 px-5 py-3 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors cursor-pointer"
            >
              Đi tới danh sách sản phẩm
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center px-6 py-12 bg-gradient-to-bl from-teal-50 via-white to-blue-50">
        <div className="w-full max-w-md bg-white/80 backdrop-blur rounded-2xl p-10 shadow-xl">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-6">
            Đặt trước sản phẩm
          </h1>
          <PreorderForm />
        </div>
      </div>
    </div>
  );
}
