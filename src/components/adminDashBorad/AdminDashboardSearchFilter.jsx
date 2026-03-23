import React, { useState } from "react";
import { Button, Input, Modal, Select } from "antd";
import {
  FilterIcon,
  RefreshCwIcon,
  SearchIcon,
  UserPlusIcon,
} from "lucide-react";
import { useSelector } from "react-redux";
import CreateUserFrom from "../../form/admin/CreateUserFrom";
// import { debounce } from "lodash";

export default function AdminDashboardSearchFilter({
  searchUserQuerry,
  setSearchUserQuerry,
  roleFilterQuerry,
  setRoleFilterQuerry,
  ROLE_MAP,
}) {
  const { loading } = useSelector((state) => state.admin);

  const [modalIsOpen, setModalIsOpen] = useState(false);

  console.log(roleFilterQuerry);

  function onReset() {
    setRoleFilterQuerry("");
    setSearchUserQuerry("");
  }

  const handleSearchUserQuery = (value) => {
    setSearchUserQuerry(value);
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
        <Input
          placeholder="Tìm theo tên hoặc email..."
          value={searchUserQuerry}
          onChange={(e) => handleSearchUserQuery(e.target.value)}
          prefix={<SearchIcon className="w-4 h-4 text-slate-400 mr-1" />}
          className="w-full sm:w-72 rounded-lg py-2"
          allowClear
        />

        <div className="flex items-center w-full sm:w-auto">
          <div className="bg-slate-50 border border-slate-200 border-r-0 rounded-l-lg px-3 py-2 flex items-center h-10">
            <FilterIcon className="w-4 h-4 text-slate-500" />
          </div>
          <Select
            value={roleFilterQuerry}
            onChange={(value) => setRoleFilterQuerry(value)}
            placeholder="Lọc theo vai trò"
            className="w-full sm:w-40 h-10"
            options={Object.values(ROLE_MAP).map((r) => ({
              label: r.label,
              value: r.value,
            }))}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        <Button
          icon={
            <RefreshCwIcon
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
          }
          onClick={onReset}
          className="flex items-center justify-center h-10 w-10px rounded-lg border-slate-200 text-slate-600 hover:text-indigo-600"
        />
        <Button
          type="primary"
          icon={<UserPlusIcon className="w-4 h-4" />}
          className="flex items-center h-10 rounded-lg font-medium px-5"
          onClick={() => setModalIsOpen((prev) => !prev)}
        >
          Thêm người dùng
        </Button>

        <Modal
          open={modalIsOpen}
          onCancel={() => setModalIsOpen(false)}
          footer={null}
        >
          <CreateUserFrom ROLE_MAP={ROLE_MAP} toogleModal={setModalIsOpen} />
        </Modal>
      </div>
    </div>
  );
}
