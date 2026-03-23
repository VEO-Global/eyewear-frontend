import React, { useEffect, useMemo, useState } from "react";
import AdminDashBoardHeader from "../components/adminDashBorad/AdminDashBoardHeader";
import AdminDashboardSearchFilter from "../components/adminDashBorad/AdminDashboardSearchFilter";
import UsersTable from "../components/adminDashBorad/UsersTable";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../redux/admin/adminSlice";

export default function AdminDashBoard() {
  const [searchUserQuerry, setSearchUserQuerry] = useState("");
  const [roleFilterQuerry, setRoleFilterQuerry] = useState("");
  const ROLE_MAP = {
    OPERATIONS: {
      label: "Nhân viên vận hành",
      value: "OPERATIONS",
    },
    SALES: {
      label: "Nhân viên kinh doanh",
      value: "SALES",
    },
    MANAGER: {
      label: "Quản lý",
      value: "MANAGER",
    },
    CUSTOMER: {
      label: "Khách hàng",
      value: "CUSTOMER",
    },
  };

  const dispatch = useDispatch();
  const { totalUser, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const filteredUsers = useMemo(() => {
    return totalUser.filter((u) => {
      const matchSearch =
        u.fullName.toLowerCase().includes(searchUserQuerry.toLowerCase()) ||
        u.email.toLowerCase().includes(searchUserQuerry.toLowerCase());

      const matchRole = !roleFilterQuerry || u.role === roleFilterQuerry;

      return matchSearch && matchRole;
    });
  }, [searchUserQuerry, roleFilterQuerry, totalUser]);

  return (
    <div className="min-h-screen w-full bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <AdminDashBoardHeader />

      <AdminDashboardSearchFilter
        searchUserQuerry={searchUserQuerry}
        setSearchUserQuerry={setSearchUserQuerry}
        roleFilterQuerry={roleFilterQuerry}
        setRoleFilterQuerry={setRoleFilterQuerry}
        ROLE_MAP={ROLE_MAP}
      />

      <UsersTable
        filteredUsers={filteredUsers}
        loading={loading}
        ROLE_MAP={ROLE_MAP}
      />
    </div>
  );
}
