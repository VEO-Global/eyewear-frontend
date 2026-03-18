import React, { useState } from "react";
import { mockUsers } from "../../mockdata/useMockData";
import { Input, Select } from "antd";
import { FilterIcon, SearchIcon } from "lucide-react";

export default function AdminDashboardSearchFilter() {
  const [searchUserQuerry, setSearchUserQuerry] = useState("");
  const [roleFilterQuerry, setRoleFilterQuerry] = useState("");

  // function onSearchChange(value) {
  //   setSearchUserQuerry(value);
  // }
  const roleList = [...new Set(mockUsers.map((u) => u.role.name))]
    .filter((role) => role !== "ADMIN")
    .map((role) => ({
      label: role,
      value: role,
    }));

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
        <Input
          placeholder="Search by name or email..."
          value={searchUserQuerry}
          onChange={(e) => setSearchUserQuerry(e.target.value)}
          prefix={<SearchIcon className="w-4 h-4 text-slate-400 mr-1" />}
          className="w-full sm:w-72 rounded-lg py-2"
          allowClear
        />

        <div className="flex items-center w-full sm:w-auto">
          <div className="bg-slate-50 border border-slate-200 border-r-0 rounded-l-lg px-3 py-2 flex items-center h-[40px]">
            <FilterIcon className="w-4 h-4 text-slate-500" />
          </div>
          <Select
            value={roleFilterQuerry}
            onChange={(e) => setRoleFilterQuerry(e.target.vaule)}
            className="w-full sm:w-40 h-[40px]"
            options={roleList}
          />
        </div>
      </div>

      {/* <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        <Button
          icon={
            <RefreshCwIcon
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
          }
          onClick={onRefresh}
          className="flex items-center justify-center h-[40px] w-[40px] rounded-lg border-slate-200 text-slate-600 hover:text-indigo-600"
        />
        <Button
          type="primary"
          icon={<UserPlusIcon className="w-4 h-4" />}
          onClick={onAddUser}
          className="flex items-center h-[40px] rounded-lg font-medium px-5"
        >
          Add User
        </Button>
      </div> */}
    </div>
  );
}
