import React from "react";
import AdminDashBoardHeader from "../components/adminDashBorad/AdminDashBoardHeader";
import AdminDashboardSearchFilter from "../components/adminDashBorad/AdminDashboardSearchFilter";
import UsersTable from "../components/adminDashBorad/UsersTable";

export default function AdminDashBoard() {
  return (
    <div className="min-h-screen w-full bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <AdminDashBoardHeader />
      <AdminDashboardSearchFilter />
      <UsersTable />
    </div>
  );
}
