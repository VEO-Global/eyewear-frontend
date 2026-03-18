import React from "react";
import { mockUsers } from "../../mockdata/useMockData";
import { Button, Table, Tooltip } from "antd";
import { Badge, MailIcon, PhoneIcon, Tag } from "lucide-react";

export default function UsersTable() {
  const columns = [
    {
      title: "User",
      key: "user",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm border border-indigo-200">
            {record.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900">
              {record.fullName}
            </span>
            <span className="text-xs text-slate-500">ID: #{record.id}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Contact Info",
      key: "contact",
      render: (_, record) => (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center text-sm text-slate-600">
            <MailIcon className="w-3.5 h-3.5 mr-2 text-slate-400" />
            {record.email}
          </div>
          <div className="flex items-center text-sm text-slate-600">
            <PhoneIcon className="w-3.5 h-3.5 mr-2 text-slate-400" />
            {record.phone}
          </div>
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        let color = "blue";
        if (role === "OPERATIONS") color = "green";
        if (role === "SALES") color = "orange";

        return (
          <Tag
            className={`rounded-md px-2 py-0.5 font-medium border-0 bg-${color}-100 text-${color}-600`}
          >
            {role}
          </Tag>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Badge
          status={status === "Active" ? "success" : "default"}
          text={
            <span
              className={
                status === "Active" ? "text-slate-700" : "text-slate-500"
              }
            >
              {status}
            </span>
          }
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <div className="flex items-center justify-end gap-2">
          <Tooltip title="Edit User">
            <Button
              type="text"
              icon={<EditIcon className="w-4 h-4 text-slate-500" />}
              onClick={() => onEdit(record)}
              className="hover:bg-slate-100 flex items-center justify-center rounded-md"
            />
          </Tooltip>

          <Tooltip title="Delete User">
            <Button
              type="text"
              danger
              icon={<TrashIcon className="w-4 h-4 text-red-400" />}
              onClick={() => onDelete(record)}
              className="hover:bg-red-50 flex items-center justify-center rounded-md"
            />
          </Tooltip>
        </div>
      ),
    },
  ];
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <Table
        columns={columns}
        dataSource={mockUsers}
        rowKey="id"
        // loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          className: "px-4 pb-4",
        }}
        scroll={{
          x: 800,
        }}
        className="w-full"
      />
    </div>
  );
}
