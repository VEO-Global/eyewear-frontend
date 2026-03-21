/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Button, Table, Tooltip, Tag, Modal, Popconfirm, Skeleton } from "antd";
import { Badge, EditIcon, MailIcon, PhoneIcon, TrashIcon } from "lucide-react";
import UpdateUserForm from "../../form/admin/UpdateUserForm";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteUser,
  fetchUsers,
  setSelectedUser,
} from "../../redux/admin/adminSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function UsersTable({ filteredUsers, loading, ROLE_MAP }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { selectedUser } = useSelector((state) => state.admin);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  function handleNavigateUserProfile(user) {
    navigate(`/user/profile/${user.id}`);
  }

  async function handleDeleteUser(userId) {
    try {
      await dispatch(deleteUser(userId)).unwrap();

      toast.success(
        `Đã ngưng hoạt dộng tài khoản ${selectedUser?.fullName} thành công`
      );
      dispatch(fetchUsers());
    } catch (err) {
      toast.error(
        `Đã ngưng hoạt động tài khoản ${selectedUser?.fullName} thất bại`
      );
    }
  }

  const columns = [
    {
      title: "Người dùng",
      key: "user",
      align: "center",
      render: (_, record) => (
        <div className="flex justify-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm border border-indigo-200">
            {record?.fullName?.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900">
              {record?.fullName}
            </span>
            <span className="text-xs text-slate-500">ID: #{record.id}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Thông tin liên lạc",
      key: "contact",
      align: "center",
      render: (_, record) => (
        <div className="flex justify-center items-center flex-col gap-1.5">
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
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      align: "center",
      render: (role) => {
        const ROLE_MAP = {
          OPERATIONS: { label: "Nhân viên vận hành", color: "green" },
          SALES: { label: "Nhân viên kinh doanh", color: "orange" },
          MANAGER: { label: "Quản lý", color: "purple" },
          CUSTOMER: { label: " Khách hàng", color: "blue" },
        };
        const currentRole = ROLE_MAP[role] || {
          label: role,
          color: ROLE_MAP.color,
        };
        return (
          <div className="flex justify-center items-center">
            <Tag
              color={currentRole.color}
              className="rounded-md px-2 py-0.5 font-medium border-0 bg-opacity-10"
            >
              {currentRole.label}
            </Tag>
          </div>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      align: "center",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Hoạt động" : "Ngừng"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      align: "center",

      render: (_, record) => (
        <div className="flex items-center justify-center gap-2">
          <Tooltip title="Xem thông tin người dùng">
            <Button
              type="text"
              icon={<EditIcon className="w-4 h-4 text-slate-500" />}
              onClick={() => handleNavigateUserProfile(record)}
              className="hover:bg-slate-100 flex items-center justify-center rounded-md"
            />
          </Tooltip>

          <Tooltip title="Ngưng hoạt động tài khoản">
            <Popconfirm
              title="Xóa người dùng"
              description={`Bạn có chắc muốn xóa ${record.fullName}?`}
              onConfirm={() => handleDeleteUser(record.id)}
              okText="Xóa"
              cancelText="Hủy"
              onClick={() => dispatch(setSelectedUser(record.id))}
            >
              <Button
                type="text"
                danger
                icon={<TrashIcon className="w-4 h-4" />}
              />
            </Popconfirm>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      {loading ? (
        <div className="p-4">
          <h2 className="text-lg font-medium mb-3 text-gray-600">
            Đang tải danh sách người dùng...
          </h2>

          <Skeleton active paragraph={{ rows: 4 }} />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={filteredUsers
            .filter((u) => u.role != "ADMIN")
            .filter((u) => u.isActive === true)
            .map((u) => u)}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            className: "px-4 pb-4",
          }}
          scroll={{
            x: 800,
          }}
          className="[&_.ant-table-thead>tr>th]:text-center"
          locale={{
            emptyText: filteredUsers && "🧐Không tìm thấy thông tin người dùng",
          }}
        />
      )}

      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <UpdateUserForm ROLE_MAP={ROLE_MAP} selectedUser={selectedUser} />
      </Modal>
    </div>
  );
}
