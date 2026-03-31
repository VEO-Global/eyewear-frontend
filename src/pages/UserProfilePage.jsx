import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  EyeIcon,
  Heart,
  Phone,
  ShieldCheck,
  ShoppingCart,
  UserCircle,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AddressSelector from "../components/checkout/AddressSelector";
import { appToast } from "../utils/appToast";
import { fetchProfile, updateProfile } from "../redux/auth/authSlice";
import { fetchProductById } from "../redux/products/producSlice";
import { toggleFavorite } from "../redux/favorites/favoriteSlice";
import {
  extractLatestCheckoutAddress,
  formatCheckoutAddress,
} from "../utils/userAddress";
import { isPreorderProduct } from "../utils/productCatalog";
import { getPrimaryProductImage } from "../utils/productImages";
import { getRoleDisplayLabel } from "../utils/authRole";

const emptyShippingAddress = {
  provinceCode: undefined,
  provinceName: "",
  districtCode: undefined,
  districtName: "",
  wardCode: undefined,
  wardName: "",
  addressDetail: "",
};

function getUserPhone(user) {
  return user?.phone ?? user?.phoneNumber ?? user?.phone_number ?? "";
}

function getUserId(user) {
  return user?.id ?? user?.userId ?? user?.user_id ?? user?.userID ?? null;
}

function getUserIdLabel(role) {
  if (role === "ADMIN") {
    return "Mã quản trị viên";
  }

  if (role === "SALES") {
    return "Mã nhân viên";
  }

  if (role === "OPERATIONS") {
    return "Mã nhân viên gia công";
  }
  if (role === "MANAGER") {
    return "Mã quản lý";
  }

  return "Mã khách hàng";
}

function getAccountStatusLabel(user) {
  if (user?.isActive === true) {
    return "Tài khoản đang hoạt động";
  }

  if (user?.isActive === false) {
    return "Tài khoản đang tạm khóa";
  }

  return "Chưa đồng bộ trạng thái tài khoản";
}

function canViewFavoriteSection(role) {
  return role === "CUSTOMER";
}

function buildProfileFormState(user) {
  const latestAddress = extractLatestCheckoutAddress(user);
  const fallbackAddress = latestAddress
    ? {
        ...emptyShippingAddress,
        ...latestAddress,
        addressDetail: latestAddress.addressDetail?.trim() || "",
      }
    : { ...emptyShippingAddress };

  const directAddress = typeof user?.address === "string" ? user.address.trim() : "";

  return {
    fullName: user?.fullName || "",
    phone: getUserPhone(user),
    shippingAddress: {
      ...fallbackAddress,
      addressDetail: fallbackAddress.addressDetail || directAddress,
    },
  };
}

function isValidShippingAddress(address) {
  return Boolean(
    typeof address?.provinceCode === "number" &&
      address?.provinceName &&
      typeof address?.districtCode === "number" &&
      address?.districtName &&
      typeof address?.wardCode === "number" &&
      address?.wardName &&
      address?.addressDetail?.trim()
  );
}

function SummaryCard({ label, value, compact = false }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p
        className={`mt-3 font-semibold text-slate-900 ${
          compact ? "text-base leading-7" : "text-2xl"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default function UserProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);
  const favoriteItems = useSelector((state) => state.favorites.items);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    shippingAddress: { ...emptyShippingAddress },
  });

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      dispatch(fetchProfile());
    }
  }, [dispatch]);

  useEffect(() => {
    setFormData(buildProfileFormState(user));
  }, [user]);

  const fullAddress = useMemo(
    () => formatCheckoutAddress(formData.shippingAddress),
    [formData.shippingAddress]
  );
  const userRole = user?.role;
  const canViewFavorites = canViewFavoriteSection(userRole);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleAddressChange(nextAddress) {
    setFormData((prev) => ({
      ...prev,
      shippingAddress: {
        ...emptyShippingAddress,
        ...(nextAddress || {}),
      },
    }));
  }

  function handleCancel() {
    setFormData(buildProfileFormState(user));
    setIsEditing(false);
  }

  function handleOpenFavoriteProduct(product) {
    dispatch(fetchProductById(product.id));

    if (isPreorderProduct(product)) {
      navigate("/user/preorder", {
        state: { preserveSelection: true },
      });
      return;
    }

    navigate(`/products/${product.id}`);
  }

  async function handleRemoveFavorite(product) {
    const result = await dispatch(toggleFavorite(product));

    if (toggleFavorite.fulfilled.match(result)) {
      appToast.success("Đã xóa sản phẩm khỏi danh sách yêu thích.");
      return;
    }

    appToast.error(result.payload || "Không thể cập nhật danh sách yêu thích.");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const profileUserId = getUserId(user);

    if (!profileUserId) {
      appToast.error("Không tìm thấy mã người dùng để cập nhật hồ sơ.");
      return;
    }

    if (!isValidShippingAddress(formData.shippingAddress)) {
      appToast.warning(
        "Vui lòng chọn đầy đủ tỉnh/thành, quận/huyện, phường/xã và địa chỉ chi tiết."
      );
      return;
    }

    const addressDetail = formData.shippingAddress.addressDetail.trim();

    const result = await dispatch(
      updateProfile({
        id: profileUserId,
        data: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          address: addressDetail,
          addressDetail,
          provinceCode: formData.shippingAddress.provinceCode,
          provinceName: formData.shippingAddress.provinceName.trim(),
          districtCode: formData.shippingAddress.districtCode,
          districtName: formData.shippingAddress.districtName.trim(),
          wardCode: formData.shippingAddress.wardCode,
          wardName: formData.shippingAddress.wardName.trim(),
        },
      })
    );

    if (updateProfile.fulfilled.match(result)) {
      appToast.success("Cập nhật thông tin cá nhân thành công.");
      setIsEditing(false);
      return;
    }

    appToast.error(result.payload || "Cập nhật thông tin thất bại. Vui lòng thử lại.");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(153,246,228,0.35),_transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef6ff_100%)] px-4 py-10">
      <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/70 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur">
        <div className="h-44 bg-[linear-gradient(135deg,#99f6e4_0%,#dbeafe_48%,#93c5fd_100%)]" />

        <div className="px-6 pb-8 sm:px-8">
          <div className="-mt-16 flex flex-col gap-6 border-b border-slate-200/80 pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user?.fullName || "Avatar"}
                  className="h-28 w-28 shrink-0 rounded-full border-4 border-white object-cover shadow-[0_12px_30px_rgba(15,23,42,0.14)]"
                />
              ) : (
                <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-4 border-white bg-slate-100 shadow-[0_12px_30px_rgba(15,23,42,0.14)]">
                  <UserCircle size={46} className="text-slate-400" />
                </div>
              )}

              <div className="flex min-w-0 flex-col justify-end sm:pb-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 leading-tight">
                  <h1 className="text-3xl font-bold leading-none tracking-tight text-slate-900">
                    {user?.fullName || "Chưa cập nhật"}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-600">
                    <CheckCircle size={16} />
                    Đã xác thực
                  </span>
                </div>

                <p className="mt-1.5 break-all text-base leading-snug text-slate-500">
                  {user?.email || "Chưa cập nhật email"}
                </p>
              </div>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              <ShieldCheck size={16} />
              {getAccountStatusLabel(user)}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <SummaryCard label={getUserIdLabel(userRole)} value={getUserId(user) || "--"} />
            <SummaryCard label="Họ và tên" value={user?.fullName || "Chưa cập nhật"} />
            <SummaryCard label="Số điện thoại" value={getUserPhone(user) || "Chưa cập nhật"} />
            <SummaryCard label="Vai trò" value={getRoleDisplayLabel(userRole)} />
            <SummaryCard label="Email" value={user?.email || "Chưa cập nhật"} compact />
          </div>

          <div className="mt-8 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                  Thông tin cá nhân
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Cập nhật họ tên, số điện thoại và địa chỉ để hệ thống hỗ trợ nhanh hơn.
                  Tất cả role dùng chung một trang profile, chỉ khác một vài nội dung hiển thị
                  theo quyền.
                </p>
              </div>

              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex w-fit items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
                >
                  Cập nhật thông tin
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-5">
                  <label
                    htmlFor="fullName"
                    className="mb-3 block text-sm font-semibold text-slate-700"
                  >
                    Họ và tên
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  />
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-5">
                  <label
                    htmlFor="phone"
                    className="mb-3 block text-sm font-semibold text-slate-700"
                  >
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <Phone
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-slate-900 outline-none transition disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
                <div className="mb-4">
                  <p className="text-sm font-semibold text-slate-700">Địa chỉ</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {fullAddress
                      ? `Địa chỉ đầy đủ: ${fullAddress}`
                      : "Chưa có địa chỉ đầy đủ."}
                  </p>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] sm:p-5">
                  <AddressSelector
                    value={formData.shippingAddress}
                    onChange={handleAddressChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex flex-wrap justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              )}
            </form>
          </div>

          {canViewFavorites && (
            <div className="mt-8 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                    Sản phẩm bạn đã yêu thích
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    Danh sách này lưu các mẫu kính bạn đã bấm tim để quay lại xem nhanh sau
                    này.
                  </p>
                </div>

                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600">
                  <Heart size={16} fill="currentColor" />
                  {favoriteItems.length} sản phẩm
                </span>
              </div>

              {favoriteItems.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {favoriteItems.map((product) => {
                    const isPreorder = isPreorderProduct(product);

                    return (
                      <div
                        key={product.id}
                        className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                      >
                        <div
                          className="relative h-48 cursor-pointer overflow-hidden bg-slate-100"
                          onClick={() => handleOpenFavoriteProduct(product)}
                        >
                          <img
                            src={getPrimaryProductImage(product)}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleRemoveFavorite(product);
                            }}
                            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-rose-500 shadow-sm transition hover:bg-white"
                          >
                            <Heart size={18} fill="currentColor" />
                          </button>
                          {isPreorder ? (
                            <span className="absolute left-4 top-4 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 shadow-sm">
                              Đặt trước
                            </span>
                          ) : null}
                        </div>

                        <div className="space-y-4 p-5">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                              {product.brand || "EyeCare"}
                            </p>
                            <h3 className="mt-2 line-clamp-2 text-xl font-semibold text-slate-900">
                              {product.name}
                            </h3>
                            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                              {product.description ||
                                "Sản phẩm bạn đã đánh dấu yêu thích."}
                            </p>
                          </div>

                          <div className="flex items-center justify-between gap-4">
                            <span className="text-xl font-bold text-slate-900">
                              {Number(product.basePrice || 0).toLocaleString("vi-VN")}đ
                            </span>

                            <button
                              type="button"
                              onClick={() => handleOpenFavoriteProduct(product)}
                              className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
                            >
                              {isPreorder ? (
                                <ShoppingCart size={16} />
                              ) : (
                                <EyeIcon size={16} />
                              )}
                              {isPreorder ? "Đặt trước" : "Xem chi tiết"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm leading-7 text-slate-500">
                  Bạn chưa có sản phẩm yêu thích nào. Bấm vào nút tim ở trang sản phẩm để lưu
                  lại.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
