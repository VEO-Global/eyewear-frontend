import { UserCircle, CheckCircle } from "lucide-react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loading } from "../components/common/Loading";

export default function UserProfilePage() {
  const { id } = useParams();
  const { totalUser } = useSelector((state) => state.admin);

  const [loading, setLoading] = useState(true);

  const selectedUser = totalUser.find((u) => String(u?.id) === id);

  // Fake loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // 1.2s loading
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    // Spinner hoặc placeholder
    <Loading>
      <p>Đang tải thông tin người dùng...</p>
    </Loading>;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center py-10">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Cover */}
        <div className="h-40 bg-linear-to-r from-teal-200 to-blue-300"></div>

        {/* Profile Header */}
        <div className="px-8 pb-6">
          <div className="flex items-end justify-between -mt-14">
            {/* Avatar + Info */}
            <div className="flex items-center gap-4">
              {selectedUser?.avatarUrl ? (
                <img
                  src={selectedUser.avatarUrl}
                  className="w-24 h-24 rounded-full border-4 border-white object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center">
                  <UserCircle size={40} className="text-gray-400" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">
                    {selectedUser?.fullName}
                  </h2>
                  <CheckCircle className="text-blue-500" size={18} />
                </div>
                <p className="text-gray-500 text-sm">{selectedUser?.email}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-6 mt-8 text-sm border-t pt-6">
            <div>
              <p className="text-gray-400">ID</p>
              <p className="font-semibold">{selectedUser?.id}</p>
            </div>

            <div>
              <p className="text-gray-400">Vai trò</p>
              <p className="font-semibold">
                {{
                  CUSTOMER: "Khách hàng",
                  ADMIN: "Quản trị viên",
                  TEACHER: "Giáo viên",
                  STAFF: "Nhân viên",
                }[selectedUser?.role] || "Không xác định"}
              </p>
            </div>

            <div>
              <p className="text-gray-400">Số điện thoại</p>
              <p className="font-semibold">{selectedUser?.phone}</p>
            </div>

            <div>
              <p className="text-gray-400">Trạng thái</p>
              <p
                className={`font-semibold ${
                  selectedUser?.isActive ? "text-green-600" : "text-red-500"
                }`}
              >
                {selectedUser?.isActive ? "Hoạt Động" : "Ngưng hoạt động"}
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
              <p className="text-sm text-gray-500">{selectedUser?.fullName}</p>
            </div>
          </div>

          {/* Username */}
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Địa chỉ nhà</p>
              <p className="text-sm text-gray-500">Your public username</p>
            </div>
          </div>

          {/* Logout / Update */}
          {/* <div className="flex justify-between items-center">
            <button className="bg-green-300 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm cursor-pointer">
              Cập nhập thông tin cá nhân
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
}
