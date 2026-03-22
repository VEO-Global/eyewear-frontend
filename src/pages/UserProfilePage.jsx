import { useEffect, useMemo, useState } from "react";
import { UserCircle, CheckCircle, Phone, ShieldCheck } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import AddressSelector from "../components/checkout/AddressSelector";
import { appToast } from "../utils/appToast";
import { fetchProfile, updateProfile } from "../redux/auth/authSlice";
import {
  extractLatestCheckoutAddress,
  formatCheckoutAddress,
} from "../utils/userAddress";

const emptyShippingAddress = {
  provinceCode: undefined,
  provinceName: "",
  districtCode: undefined,
  districtName: "",
  wardCode: undefined,
  wardName: "",
  addressDetail: "",
};

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
    phone: user?.phone || "",
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

export default function UserProfilePage() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
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

  async function handleSubmit(event) {
    event.preventDefault();

    if (!user?.id) {
      appToast.error("Không tìm thấy thông tin người dùng.");
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
        id: user.id,
        data: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          // Backend hiện đang reject chuỗi có dấu phẩy ở field address,
          // nên chỉ gửi phần địa chỉ chi tiết để lưu an toàn.
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
              {user?.isActive ? "Tài khoản đang hoạt động" : "Tài khoản đang tạm khóa"}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Mã khách hàng</p>
              <p className="mt-3 text-3xl font-bold text-slate-900">{user?.id || "--"}</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Vai trò</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">
                {user?.role === "CUSTOMER" ? "Khách hàng" : "Quản trị viên"}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Email</p>
              <p className="mt-3 break-all text-lg font-semibold text-slate-900">
                {user?.email || "Chưa cập nhật"}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                  Thông tin cá nhân
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Cập nhật họ tên, số điện thoại và địa chỉ để hệ thống hỗ trợ bạn nhanh hơn
                  trong quá trình mua hàng và đặt trước.
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
                  <p className="text-sm font-semibold text-slate-700">Địa chỉ nhận hàng</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {fullAddress
                      ? `Địa chỉ nhận hàng đầy đủ: ${fullAddress}`
                      : "Chưa có địa chỉ nhận hàng đầy đủ."}
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
        </div>
      </div>
    </div>
  );
}
