import { useSelector } from "react-redux";
import PreorderForm from "../form/PreorderForm";

export default function PreorderPage() {
  const { selectedProduct } = useSelector((state) => state.products);

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* LEFT: Product Info */}
      <div className="flex items-center justify-center bg-gray-50 px-10 py-12 border-r">
        {selectedProduct && (
          <div className="max-w-md w-full flex flex-col gap-6">
            {/* Product Image */}
            <div className="w-full rounded-xl overflow-hidden bg-white shadow">
              <img
                src={selectedProduct.imageUrl || "/placeholder.png"}
                alt={selectedProduct.name}
                className="w-full object-cover"
              />
            </div>

            {/* Product Info */}
            <div className="flex flex-col gap-3">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedProduct.name}
              </h2>

              <p className="text-gray-500">{selectedProduct.brand}</p>

              <p className="text-lg font-semibold text-black">
                {selectedProduct.basePrice?.toLocaleString()}₫
              </p>

              <p className="text-gray-600 text-sm leading-relaxed">
                {selectedProduct.description}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT: Preorder Form */}
      <div className="flex items-center justify-center px-6 py-12 bg-gradient-to-bl from-teal-50 via-white to-blue-50">
        <div className="w-full max-w-md bg-white/80 backdrop-blur rounded-2xl p-10 shadow-xl">
          {/* Header */}
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-6">
            Đặt trước sản phẩm
          </h1>

          <PreorderForm />
        </div>
      </div>
    </div>
  );
}
