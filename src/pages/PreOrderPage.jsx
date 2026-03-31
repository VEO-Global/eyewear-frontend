import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import PreorderForm from "../form/PreorderForm";
import {
  clearSelectedProduct,
  fetchProductById,
} from "../redux/products/producSlice";
import Product3DViewer from "../components/common/Model3dViewer";
import { getPrimaryProductImage } from "../utils/productImages";
import { Button, Tooltip } from "antd";

function FeaturePill({ title, description }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function ProductPreview({ product, className = "" }) {
  if (product?.model3dUrl) {
    return (
      <Product3DViewer modelUrl={product.model3dUrl} className={className} />
    );
  }

  return (
    <img
      src={getPrimaryProductImage(product)}
      alt={product?.name}
      className={`h-full w-full object-cover ${className}`}
    />
  );
}

export default function PreorderPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { preorderProducts, selectedProduct, loading } = useSelector(
    (state) => state.products
  );
  const [showProductDetail, setShowProductDetail] = useState(
    Boolean(selectedProduct)
  );

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

  async function handleViewProductDetail(productId) {
    navigate(`/products/${productId}`);
  }

  function handlePreOrderProduct(productId) {
    dispatch(fetchProductById(productId));
    setShowProductDetail(true);
  }

  function renderProductGrid() {
    console.log(preorderProducts);

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
            Các mẫu dưới đây là sản phẩm mới, chưa có sẵn trong kho và đang mở
            đặt trước. Chọn một mẫu để xem chi tiết rồi điền thông tin nhận
            hàng.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {preorderProducts.map((product) => (
            <div className="flex flex-col flex-1">
              <Tooltip title="Xem thông tin sản phẩm">
                {" "}
                <div
                  onClick={() => handleViewProductDetail(product.id)}
                  className="group cursor-pointer overflow-hidden rounded-[28px] border border-white/80 bg-white/95 text-left shadow-[0_18px_40px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:border-teal-300 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
                >
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <ProductPreview
                      product={product}
                      className="transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/45 to-transparent" />

                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                      {product.brand}
                    </span>

                    <span className="absolute right-4 top-4 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 shadow-sm">
                      Đặt trước
                    </span>
                  </div>

                  <div className="flex min-h-[190px] flex-col p-5">
                    <h3 className="line-clamp-2 text-xl font-semibold text-slate-900">
                      {product.name}
                    </h3>

                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                      {product.description || "Mẫu kính mới đang mở đặt trước."}
                    </p>
                  </div>
                </div>
              </Tooltip>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreOrderProduct(product.id);
                }}
                onMouseEnter={(e) => {
                  e.stopPropagation();
                  e.currentTarget.style.backgroundColor = "#008080"; // darker teal
                  e.currentTarget.style.color = "white"; // yellowish text
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "teal";
                  e.currentTarget.style.color = "white";
                }}
                style={{
                  width: "100%",
                  padding: 20,
                  borderBottom: "none",
                  backgroundColor: "teal",
                  color: "white",
                  fontSize: "18px",
                  fontFamily: "-apple-system",
                  marginTop: 6,
                }}
              >
                Đặt trước ngay
              </Button>
            </div>
          ))}
        </div>

        {!loading && preorderProducts.length === 0 ? (
          <div className="mt-6 rounded-[28px] border border-dashed border-amber-300 bg-amber-50/80 p-6 text-sm leading-7 text-amber-900">
            Hiện chưa có sản phẩm mở đặt trước. Vui lòng kiểm tra lại dữ liệu từ
            hệ thống hoặc cập nhật danh sách sản phẩm đặt trước.
          </div>
        ) : null}
      </div>
    );
  }

  function renderSelectedProduct() {
    if (loading && !selectedProduct) {
      return (
        <div className="w-full max-w-lg rounded-[32px] border border-white/80 bg-white/90 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="animate-pulse space-y-4">
            <div className="h-64 rounded-3xl bg-gray-200" />
            <div className="h-8 w-2/3 rounded bg-gray-200" />
            <div className="h-5 w-1/3 rounded bg-gray-200" />
            <div className="h-6 w-1/2 rounded bg-gray-200" />
            <div className="h-24 rounded bg-gray-200" />
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
            <ProductPreview product={selectedProduct} />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
                {selectedProduct.brand}
              </p>
              <h2 className="mt-2 text-3xl font-bold">
                {selectedProduct.name}
              </h2>
            </div>
          </div>

          <div className="space-y-6 p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700">
                Giá dự kiến:{" "}
                {Number(selectedProduct.basePrice || 0).toLocaleString("vi-VN")}
                đ
              </span>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-700">
                Sắp về hàng
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
                title="Sản phẩm mới"
                description="Mẫu kính này thuộc danh mục mới và hiện chưa có sẵn trong kho."
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
                  Điền thông tin nhận hàng, chọn màu sắc, kích thước và số lượng
                  để giữ chỗ mẫu kính bạn thích. Khu vực này chỉ hiển thị các
                  sản phẩm mới đang mở đặt trước.
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
