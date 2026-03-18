import { ActivityIcon, ShieldIcon, UsersIcon } from "lucide-react";
import React from "react";
// import { useSelector } from "react-redux";
import { mockUsers } from "../../mockdata/useMockData";
export default function AdminDashBoardHeader() {
  // const { totalUsers } = 4;

  // const managerList = totalUsers?.filter((u) => u.role_id === 4);
  // const operationList = totalUsers?.filter((u) => u.role_id === 3);
  // const salesList = totalUsers?.filter((u) => u.role_id === 2);
  const managerList = mockUsers?.filter((u) => u.role.id === 4);
  const operationList = mockUsers?.filter((u) => u.role.id === 3);
  const salesList = mockUsers.filter((u) => u.role.id === 2);
  return (
    <div className="mb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Quản Lý tài khoản</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Quản lý và giám sát tài khoản người dùng trong toàn hệ thống
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <UsersIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">
              Tất cả người dùng
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {mockUsers.length}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <ActivityIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">
              Tài khoản còn hoạt động
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {mockUsers.filter((u) => u.isActive === true).length}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <ShieldIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Quản lý</p>
            <p className="text-2xl font-bold text-slate-900">
              {managerList.length}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
            <UsersIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Sales và Ops</p>
            <p className="text-2xl font-bold text-slate-900">
              {salesList.length + operationList.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
