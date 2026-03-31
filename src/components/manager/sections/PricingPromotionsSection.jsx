import { Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Switch, Table, Tabs, Tag } from "antd";
import { BadgePercent, FolderPlus, Pencil, SearchCheck, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { extractErrorMessage, managerApi } from "../../../services/managerApi";
import { appToast } from "../../../utils/appToast";
import { SectionCard, SectionEmpty, SectionError, SectionLoading } from "../SectionCard";

function CatalogModal({ open, title, initialValues, onCancel, onSubmit, submitting, showPromotionFields = false }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        name: initialValues?.name ?? "",
        description: initialValues?.description ?? "",
        type: initialValues?.type ?? "",
        code: initialValues?.code ?? "",
        price: initialValues?.price ?? 0,
        active: initialValues?.active ?? true,
        discountType: initialValues?.discountType ?? "",
        discountValue: initialValues?.discountValue ?? 0,
        startDate: initialValues?.startDate ?? "",
        endDate: initialValues?.endDate ?? "",
      });
    } else {
      form.resetFields();
    }
  }, [form, initialValues, open]);

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      destroyOnClose
      width={720}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Form.Item name="name" label="Tên" rules={[{ required: true, message: "Bắt buộc" }]}>
            <Input />
          </Form.Item>
          {showPromotionFields ? (
            <Form.Item name="code" label="Mã khuyến mãi" rules={[{ required: true, message: "Bắt buộc" }]}>
              <Input />
            </Form.Item>
          ) : (
            <Form.Item name="type" label="Loại">
              <Input />
            </Form.Item>
          )}
          {!showPromotionFields ? (
            <Form.Item name="price" label="Giá bán">
              <InputNumber min={0} className="w-full" />
            </Form.Item>
          ) : (
            <Form.Item name="discountType" label="Loại giảm giá">
              <Select
                allowClear
                options={[
                  { label: "Phần trăm", value: "PERCENT" },
                  { label: "Số tiền cố định", value: "FIXED" },
                ]}
              />
            </Form.Item>
          )}
          {showPromotionFields ? (
            <Form.Item name="discountValue" label="Giá trị giảm">
              <InputNumber min={0} className="w-full" />
            </Form.Item>
          ) : null}
          {showPromotionFields ? (
            <Form.Item name="startDate" label="Ngày bắt đầu">
              <Input placeholder="YYYY-MM-DD" />
            </Form.Item>
          ) : null}
          {showPromotionFields ? (
            <Form.Item name="endDate" label="Ngày kết thúc">
              <Input placeholder="YYYY-MM-DD" />
            </Form.Item>
          ) : null}
        </div>
        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item name="active" label="Đang hoạt động" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}

function CrudTabPane({ title, loading, error, data, onRetry, onCreate, onEdit, onDelete, fields }) {
  if (loading && !data.length) {
    return <SectionLoading label={`Đang tải ${title.toLowerCase()}...`} />;
  }

  if (error) {
    return <SectionError message={error} onRetry={onRetry} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="primary" icon={<FolderPlus size={16} />} onClick={onCreate}>
          Thêm mới
        </Button>
      </div>

      {!data.length ? (
        <SectionEmpty description={`Chưa có dữ liệu ${title.toLowerCase()}.`} />
      ) : (
        <Table
          rowKey="id"
          pagination={false}
          dataSource={data}
          columns={[
            ...fields,
            {
              title: "Trạng thái",
              dataIndex: "active",
              render: (value) => <Tag color={value ? "green" : "default"}>{value ? "Đang hoạt động" : "Ngừng hoạt động"}</Tag>,
            },
            {
              title: "Thao tác",
              key: "actions",
              render: (_, record) => (
                <Space>
                  <Button icon={<Pencil size={14} />} onClick={() => onEdit(record)}>
                    Chỉnh sửa
                  </Button>
                  <Popconfirm title="Xóa mục này?" onConfirm={() => onDelete(record.id)}>
                    <Button danger icon={<Trash2 size={14} />}>
                      Xóa
                    </Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}

export default function PricingPromotionsSection({ enabled }) {
  const [bootstrapped, setBootstrapped] = useState(false);
  const [activeTab, setActiveTab] = useState("lens");
  const [state, setState] = useState({
    lens: { loading: false, error: "", data: [] },
    promotions: { loading: false, error: "", data: [] },
  });
  const [modalState, setModalState] = useState({ kind: null, open: false, record: null });
  const [submitting, setSubmitting] = useState(false);
  const [validateCode, setValidateCode] = useState("");
  const [validationResult, setValidationResult] = useState(null);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    if (!enabled || bootstrapped) {
      return;
    }

    Promise.all([loadSingle("lens"), loadSingle("promotions")]).then(() => {
      setBootstrapped(true);
    });
  }, [bootstrapped, enabled]);

  async function loadSingle(kind) {
    setState((current) => ({
      ...current,
      [kind]: { ...current[kind], loading: true, error: "" },
    }));

    try {
      let data = [];

      if (kind === "lens") {
        data = await managerApi.fetchLensProducts();
      }

      if (kind === "promotions") {
        data = await managerApi.fetchPromotions();
      }

      setState((current) => ({
        ...current,
        [kind]: { loading: false, error: "", data },
      }));
    } catch (loadError) {
      const fallbackByKind = {
        lens: "Không thể tải danh sách tròng kính.",
        promotions: "Không thể tải danh sách khuyến mãi.",
      };

      setState((current) => ({
        ...current,
        [kind]: {
          ...current[kind],
          loading: false,
          error: extractErrorMessage(loadError, fallbackByKind[kind]),
        },
      }));
    }
  }

  async function handleSubmit(values) {
    setSubmitting(true);

    try {
      if (modalState.kind === "lens") {
        if (modalState.record?.id) {
          await managerApi.updateLensProduct(modalState.record.id, { ...modalState.record, ...values });
        } else {
          await managerApi.createLensProduct(values);
        }
      }

      if (modalState.kind === "promotions") {
        if (modalState.record?.id) {
          await managerApi.updatePromotion(modalState.record.id, { ...modalState.record, ...values });
        } else {
          await managerApi.createPromotion(values);
        }
      }

      appToast.success("Đã lưu dữ liệu thành công.");
      setModalState({ kind: null, open: false, record: null });
      loadSingle(activeTab);
    } catch (submitError) {
      appToast.error(extractErrorMessage(submitError, "Không thể lưu dữ liệu."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(kind, id) {
    try {
      if (kind === "lens") {
        await managerApi.deleteLensProduct(id);
      }

      if (kind === "promotions") {
        await managerApi.deletePromotion(id);
      }

      appToast.success("Đã xóa dữ liệu.");
      loadSingle(kind);
    } catch (deleteError) {
      appToast.error(extractErrorMessage(deleteError, "Không thể xóa dữ liệu."));
    }
  }

  async function handleValidatePromotionCode() {
    setValidating(true);

    try {
      const result = await managerApi.validatePromotionCode(validateCode);
      setValidationResult(result);
      appToast.success("Đã kiểm tra mã khuyến mãi thành công.");
    } catch (validationError) {
      setValidationResult(null);
      appToast.error(extractErrorMessage(validationError, "Mã khuyến mãi không hợp lệ."));
    } finally {
      setValidating(false);
    }
  }

  if (!enabled) {
    return null;
  }

  return (
    <SectionCard
      title="Giá bán và khuyến mãi"
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "lens",
            label: "Giá tròng kính",
            children: (
              <CrudTabPane
                title="tròng kính"
                loading={state.lens.loading}
                error={state.lens.error}
                data={state.lens.data}
                onRetry={() => loadSingle("lens")}
                onCreate={() => setModalState({ kind: "lens", open: true, record: null })}
                onEdit={(record) => setModalState({ kind: "lens", open: true, record })}
                onDelete={(id) => handleDelete("lens", id)}
                fields={[
                  { title: "Tên", dataIndex: "name" },
                  { title: "Loại", dataIndex: "type", render: (value) => value || "-" },
                  { title: "Giá bán", dataIndex: "price", render: (value) => new Intl.NumberFormat("vi-VN").format(value || 0) },
                  { title: "Mô tả", dataIndex: "description", ellipsis: true },
                ]}
              />
            ),
          },
          {
            key: "promotions",
            label: "Khuyến mãi",
            children: (
              <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
                <CrudTabPane
                  title="khuyến mãi"
                  loading={state.promotions.loading}
                  error={state.promotions.error}
                  data={state.promotions.data}
                  onRetry={() => loadSingle("promotions")}
                  onCreate={() => setModalState({ kind: "promotions", open: true, record: null })}
                  onEdit={(record) => setModalState({ kind: "promotions", open: true, record })}
                  onDelete={(id) => handleDelete("promotions", id)}
                  fields={[
                    { title: "Mã", dataIndex: "code" },
                    { title: "Loại", dataIndex: "discountType", render: (value) => value || "-" },
                    { title: "Giá trị", dataIndex: "discountValue" },
                    { title: "Bắt đầu", dataIndex: "startDate", render: (value) => value || "-" },
                    { title: "Kết thúc", dataIndex: "endDate", render: (value) => value || "-" },
                  ]}
                />

                <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
                  <div className="flex items-center gap-2">
                    <BadgePercent size={18} className="text-teal-700" />
                    <h3 className="text-lg font-semibold text-slate-900">Kiểm tra mã</h3>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Nhập mã để kiểm tra tính hợp lệ theo backend.
                  </p>
                  <Input
                    className="mt-4"
                    placeholder="Nhập mã khuyến mãi"
                    value={validateCode}
                    onChange={(event) => setValidateCode(event.target.value)}
                  />
                  <Button
                    type="primary"
                    className="mt-4"
                    icon={<SearchCheck size={16} />}
                    onClick={handleValidatePromotionCode}
                    loading={validating}
                    disabled={!validateCode.trim()}
                  >
                    Kiểm tra
                  </Button>
                  {validationResult ? (
                    <pre className="mt-4 overflow-auto rounded-2xl border border-slate-200 bg-white px-4 py-4 text-xs text-slate-600">
                      {JSON.stringify(validationResult, null, 2)}
                    </pre>
                  ) : null}
                </div>
              </div>
            ),
          },
        ]}
      />

      <CatalogModal
        open={modalState.open}
        title={
          modalState.kind === "promotions"
            ? modalState.record
              ? "Chỉnh sửa khuyến mãi"
              : "Tạo khuyến mãi"
            : modalState.record
              ? "Chỉnh sửa dữ liệu"
              : "Tạo dữ liệu mới"
        }
        initialValues={modalState.record}
        onCancel={() => setModalState({ kind: null, open: false, record: null })}
        onSubmit={handleSubmit}
        submitting={submitting}
        showPromotionFields={modalState.kind === "promotions"}
      />
    </SectionCard>
  );
}
