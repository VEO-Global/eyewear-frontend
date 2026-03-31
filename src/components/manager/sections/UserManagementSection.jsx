import { Button, Form, Input, Modal, Select, Space, Switch, Table, Tag } from "antd";
import { Pencil, Plus, UserCog } from "lucide-react";
import { useEffect, useState } from "react";
import { extractErrorMessage, managerApi } from "../../../services/managerApi";
import { appToast } from "../../../utils/appToast";
import { SectionCard, SectionEmpty, SectionError, SectionLoading } from "../SectionCard";

function StaffModal({ open, initialValues, roles, onCancel, onSubmit, submitting }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        fullName: initialValues?.fullName ?? "",
        email: initialValues?.email ?? "",
        phone: initialValues?.phone ?? "",
        role: initialValues?.role ?? undefined,
        password: "",
        active: initialValues?.active ?? true,
      });
    } else {
      form.resetFields();
    }
  }, [form, initialValues, open]);

  return (
    <Modal
      title={initialValues?.id ? "Chỉnh sửa tài khoản nhân viên" : "Tạo tài khoản nhân viên"}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, message: "Vui lòng nhập email" }]}>
          <Input />
        </Form.Item>
        <Form.Item name="phone" label="Số điện thoại">
          <Input />
        </Form.Item>
        <Form.Item name="role" label="Vai trò" rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}>
          <Select options={roles.map((role) => ({ label: role, value: role }))} />
        </Form.Item>
        <Form.Item
          name="password"
          label={initialValues?.id ? "Mật khẩu mới (không bắt buộc)" : "Mật khẩu"}
          rules={initialValues?.id ? [] : [{ required: true, message: "Vui lòng nhập mật khẩu" }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item name="active" label="Đang hoạt động" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default function UserManagementSection({ enabled }) {
  const [bootstrapped, setBootstrapped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tableData, setTableData] = useState({ items: [], page: 1, size: 10, total: 0 });
  const [filters, setFilters] = useState({ keyword: "", role: undefined, active: undefined, page: 1, size: 10 });
  const [roles, setRoles] = useState([]);
  const [modalState, setModalState] = useState({ open: false, record: null });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!enabled || bootstrapped) {
      return;
    }

    setLoading(true);
    setError("");

    Promise.all([
      managerApi.fetchRoles(),
      managerApi.fetchStaffUsers({ keyword: "", role: undefined, active: undefined, page: 0, size: 10 }),
    ])
      .then(([roleOptions, staffResponse]) => {
        setRoles(roleOptions);
        setTableData(staffResponse);
        setBootstrapped(true);
      })
      .catch((loadError) => {
        setError(extractErrorMessage(loadError, "Không thể tải danh sách nhân viên."));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [bootstrapped, enabled]);

  async function loadUsers(nextFilters = filters) {
    setLoading(true);
    setError("");

    try {
      const response = await managerApi.fetchStaffUsers({
        ...nextFilters,
        page: Math.max((nextFilters.page || 1) - 1, 0),
      });
      setTableData(response);
    } catch (loadError) {
      setError(extractErrorMessage(loadError, "Không thể tải danh sách nhân viên."));
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(record, checked) {
    try {
      await managerApi.updateStaffStatus(record.id, checked);
      appToast.success("Đã cập nhật trạng thái nhân viên.");
      loadUsers(filters);
    } catch (toggleError) {
      appToast.error(extractErrorMessage(toggleError, "Không thể cập nhật trạng thái nhân viên."));
    }
  }

  async function handleEditStaff(record) {
    try {
      const detail = await managerApi.fetchStaffUserDetail(record.id);
      setModalState({ open: true, record: detail });
    } catch (detailError) {
      appToast.error(extractErrorMessage(detailError, "Không thể tải chi tiết nhân viên."));
    }
  }

  async function handleSubmit(values) {
    setSubmitting(true);

    try {
      if (modalState.record?.id) {
        await managerApi.updateStaffUser(modalState.record.id, {
          ...modalState.record,
          ...values,
          password: values.password || undefined,
        });
        appToast.success("Đã cập nhật nhân viên thành công.");
      } else {
        await managerApi.createStaffUser(values);
        appToast.success("Đã tạo nhân viên thành công.");
      }

      setModalState({ open: false, record: null });
      loadUsers(filters);
    } catch (submitError) {
      appToast.error(extractErrorMessage(submitError, "Không thể lưu thông tin nhân viên."));
    } finally {
      setSubmitting(false);
    }
  }

  if (!enabled) {
    return null;
  }

  return (
    <SectionCard
      title="Quản lý người dùng"
      description="Lọc nhân viên theo từ khóa, vai trò và trạng thái hoạt động, sau đó mở modal để tạo mới hoặc chỉnh sửa."
      extra={
        <Button type="primary" icon={<Plus size={16} />} onClick={() => setModalState({ open: true, record: null })}>
          Thêm nhân viên
        </Button>
      }
    >
      <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Input
          placeholder="Từ khóa"
          value={filters.keyword}
          onChange={(event) => setFilters((current) => ({ ...current, keyword: event.target.value }))}
        />
        <Select
          allowClear
          placeholder="Vai trò"
          value={filters.role}
          options={roles.map((role) => ({ label: role, value: role }))}
          onChange={(value) => setFilters((current) => ({ ...current, role: value }))}
        />
        <Select
          allowClear
          placeholder="Trạng thái"
          value={filters.active}
          options={[
            { label: "Đang hoạt động", value: true },
            { label: "Ngừng hoạt động", value: false },
          ]}
          onChange={(value) => setFilters((current) => ({ ...current, active: value }))}
        />
        <Button type="primary" onClick={() => loadUsers({ ...filters, page: 1 })}>
          Áp dụng bộ lọc
        </Button>
      </div>

      {loading && !tableData.items.length ? <SectionLoading label="Đang tải danh sách nhân viên..." /> : null}
      {!loading && error ? <SectionError message={error} onRetry={() => loadUsers(filters)} /> : null}
      {!loading && !error && !tableData.items.length ? <SectionEmpty description="Không tìm thấy nhân viên phù hợp." /> : null}

      {tableData.items.length ? (
        <Table
          rowKey="id"
          loading={loading}
          dataSource={tableData.items}
          columns={[
            {
              title: "Nhân sự",
              dataIndex: "fullName",
              render: (value, record) => (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                    <UserCog size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{value || "-"}</p>
                    <p className="text-sm text-slate-500">{record.email}</p>
                  </div>
                </div>
              ),
            },
            { title: "Số điện thoại", dataIndex: "phone", render: (value) => value || "-" },
            { title: "Vai trò", dataIndex: "role", render: (value) => <Tag color="blue">{value}</Tag> },
            {
              title: "Đang hoạt động",
              dataIndex: "active",
              render: (value, record) => <Switch checked={value} onChange={(checked) => handleToggleStatus(record, checked)} />,
            },
            {
              title: "Thao tác",
              key: "actions",
              render: (_, record) => (
                <Space>
                  <Button icon={<Pencil size={14} />} onClick={() => handleEditStaff(record)}>
                    Chỉnh sửa
                  </Button>
                </Space>
              ),
            },
          ]}
          pagination={{
            current: filters.page,
            pageSize: filters.size,
            total: tableData.total,
            onChange: (page, size) => {
              const nextFilters = { ...filters, page, size };
              setFilters(nextFilters);
              loadUsers(nextFilters);
            },
          }}
        />
      ) : null}

      <StaffModal
        open={modalState.open}
        initialValues={modalState.record}
        roles={roles}
        onCancel={() => setModalState({ open: false, record: null })}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </SectionCard>
  );
}
