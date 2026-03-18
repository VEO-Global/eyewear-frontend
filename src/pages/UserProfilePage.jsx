import { UserCircle, CheckCircle } from "lucide-react";
import { useSelector } from "react-redux";

export default function UserProfilePage() {
  const user = useSelector((state) => state.auth.user);

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center py-10">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Cover */}
        <div className="h-40 bg-gradient-to-r from-teal-200 to-blue-300"></div>

        {/* Profile Header */}
        <div className="px-8 pb-6">
          <div className="flex items-end justify-between -mt-14">
            {/* Avatar + Info */}
            <div className="flex items-center gap-4">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  className="w-24 h-24 rounded-full border-4 border-white object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center">
                  <UserCircle size={40} className="text-gray-400" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{user?.fullName}</h2>
                  <CheckCircle className="text-blue-500" size={18} />
                </div>

                <p className="text-gray-500 text-sm">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-6 mt-8 text-sm border-t pt-6">
            <div>
              <p className="text-gray-400">ID</p>
              <p className="font-semibold">{user?.id}</p>
            </div>

            <div>
              <p className="text-gray-400">Vai trò</p>
              <p className="font-semibold">
                {user?.role === "CUSTOMER" ? "Khách hàng" : "Admin"}
              </p>
            </div>

            <div>
              <p className="text-gray-400">Số điện thoại</p>
              <p className="font-semibold">{user?.phone}</p>
            </div>

            <div>
              <p className="text-gray-400">Trạng thái</p>
              <p
                className={`font-semibold ${
                  user?.isActive ? "text-green-600" : "text-red-500"
                }`}
              >
                {user?.isActive ? "Hoạt Động" : "Ngưng hoạt động"}
              </p>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="px-8 pb-8 border-t pt-6 space-y-6">
          {/* Public profile */}
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Họ và tên</p>
              <p className="text-sm text-gray-500">{user?.fullName}</p>
            </div>
          </div>

          {/* Username */}
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Địa chỉ nhà</p>
              <p className="text-sm text-gray-500">Your public username</p>
            </div>
          </div>

          {/* Logout */}
          <div className="flex justify-between items-center">
            <button className="bg-green-300 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm cursor-pointer">
              Cập nhập thông tin cá nhân
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
