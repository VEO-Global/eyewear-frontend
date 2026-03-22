import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import { useLocation } from "react-router-dom";
import PreorderForm from "../form/PreorderForm";
import {
  clearSelectedProduct,
  fetchProductById,
  fetchProducts,
} from "../redux/products/producSlice";

function FeaturePill({ title, description }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

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
      <div className="w-full max-w-4xl">
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-700">
            <Sparkles className="h-4 w-4" />
            Bộ sưu tập mở đặt trước
          </span>
          <h2 className="mt-5 text-4xl font-bold tracking-tight text-slate-900">
            Chọn mẫu kính bạn muốn giữ chỗ sớm
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            Chọn một mẫu kính bên dưới để xem chi tiết. Sau đó bạn có thể điền
            thông tin nhận hàng, chọn màu sắc và kích thước để giữ chỗ sớm.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {preorderProducts.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => handleSelectProduct(product.id)}
              className="group overflow-hidden rounded-[28px] border border-white/80 bg-white/95 text-left shadow-[0_18px_40px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:border-teal-300 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
            >
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img
                  src={product.imageUrl || product.image || "/placeholder.png"}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/45 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                  {product.brand}
                </span>
              </div>

              <div className="flex min-h-[250px] flex-col p-5">
                <h3 className="text-xl font-semibold text-slate-900 line-clamp-2">
                  {product.name}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-500 line-clamp-3">
                  {product.description || "Mẫu kính mới đang mở đặt trước."}
                </p>
                <div className="mt-auto flex items-end justify-between gap-4 pt-8">
                  <span className="shrink-0 pb-2 text-xl font-bold leading-none text-slate-900">
                    {product.basePrice?.toLocaleString("vi-VN")}đ
                  </span>
                  <span className="inline-flex min-h-[72px] items-center rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-center text-xs font-semibold leading-5 text-teal-700">
                    Chọn mẫu này
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
        <div className="w-full max-w-lg rounded-[32px] border border-white/80 bg-white/90 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="animate-pulse space-y-4">
            <div className="h-64 rounded-3xl bg-gray-200"></div>
            <div className="h-8 w-2/3 rounded bg-gray-200"></div>
            <div className="h-5 w-1/3 rounded bg-gray-200"></div>
            <div className="h-6 w-1/2 rounded bg-gray-200"></div>
            <div className="h-24 rounded bg-gray-200"></div>
          </div>
        </div>
      );
    }

    if (!selectedProduct) {
      return renderProductGrid();
    }

    return (
      <div className="flex w-full max-w-lg flex-col gap-6">
        <button
          type="button"
          onClick={() => {
            dispatch(clearSelectedProduct());
            setShowProductDetail(false);
          }}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-teal-300 hover:text-teal-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách sản phẩm
        </button>

        <div className="overflow-hidden rounded-[32px] border border-white/80 bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
          <div className="relative h-80 overflow-hidden bg-slate-100">
            <img
              src={
                selectedProduct.imageUrl ||
                selectedProduct.image ||
                "/placeholder.png"
              }
              alt={selectedProduct.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
                {selectedProduct.brand}
              </p>
              <h2 className="mt-2 text-3xl font-bold">{selectedProduct.name}</h2>
            </div>
          </div>

          <div className="space-y-6 p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700">
                Giá dự kiến: {selectedProduct.basePrice?.toLocaleString("vi-VN")}đ
              </span>
              <span className="rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-sm font-semibold text-sky-700">
                Chọn màu và size linh hoạt
              </span>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                Chi tiết sản phẩm
              </p>
              <p className="mt-3 text-base leading-7 text-slate-600">
              {selectedProduct.description || "Sản phẩm sắp ra mắt."}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <FeaturePill
                title="Giữ chỗ sớm"
                description="EyeCare ưu tiên xác nhận cho khách đã đặt trước."
              />
              <FeaturePill
                title="Điền nhanh"
                description="Form bên phải đã tách sẵn các bước quan trọng để dễ thao tác."
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#fefce8_0%,#ffffff_30%,#ecfeff_100%)]">
      <div className="grid min-h-screen grid-cols-1 xl:grid-cols-[1.02fr_0.98fr]">
        <div className="flex items-center justify-center px-5 py-12 xl:px-10">
          {showProductDetail ? renderSelectedProduct() : renderProductGrid()}
        </div>

        <div className="flex items-center justify-center border-t border-white/70 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.14),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(248,250,252,0.96)_100%)] px-4 py-12 sm:px-6 xl:border-l xl:border-t-0 xl:px-10">
          <div className="w-full max-w-4xl rounded-[36px] border border-white/80 bg-white/90 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.10)] backdrop-blur sm:p-8 lg:p-10">
            <div className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-8">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-sm font-semibold text-teal-700">
                <ShieldCheck className="h-4 w-4" />
                Quy trình đặt trước rõ ràng
              </span>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Đặt trước tại EyeCare Store
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  Điền thông tin nhận hàng, chọn màu sắc, kích thước và số lượng để
                  giữ chỗ mẫu kính bạn thích. Toàn bộ form đã được tối ưu để dễ thao
                  tác trên cả desktop lẫn mobile.
                </p>
              </div>
            </div>

            <PreorderForm selectedProduct={selectedProduct} />
          </div>
        </div>
      </div>
    </div>
  );
}
