import { Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Switch, Table, Tag } from "antd";
import { Boxes, PackagePlus, Pencil, Plus, RefreshCcw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { extractErrorMessage, managerApi } from "../../../services/managerApi";
import { appToast } from "../../../utils/appToast";
import { SectionCard, SectionEmpty, SectionError, SectionLoading } from "../SectionCard";

function ProductModal({ open, mode, initialValues, onCancel, onSubmit, submitting }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        name: initialValues?.name ?? "",
        description: initialValues?.description ?? "",
        categoryId: initialValues?.categoryId ?? undefined,
        status: initialValues?.status ?? "",
        catalogType: initialValues?.catalogType ?? "",
        price: initialValues?.price ?? 0,
        imageUrl: initialValues?.imageUrl ?? "",
        active: initialValues?.active ?? true,
      });
    } else {
      form.resetFields();
    }
  }, [form, initialValues, open]);

  return (
    <Modal
      title={mode === "create" ? "Tạo sản phẩm" : "Chỉnh sửa sản phẩm"}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={mode === "create" ? "Tạo mới" : "Lưu"}
      confirmLoading={submitting}
      width={720}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: "Bắt buộc" }]}>
            <Input placeholder="Gọng chống ánh sáng xanh" />
          </Form.Item>
          <Form.Item name="categoryId" label="Mã danh mục" rules={[{ required: true, message: "Bắt buộc" }]}>
            <InputNumber className="w-full" min={1} placeholder="1" />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái">
            <Input placeholder="AVAILABLE" />
          </Form.Item>
          <Form.Item name="catalogType" label="Loại danh mục">
            <Input placeholder="REGULAR" />
          </Form.Item>
          <Form.Item name="price" label="Giá cơ bản">
            <InputNumber className="w-full" min={0} />
          </Form.Item>
          <Form.Item name="imageUrl" label="Đường dẫn ảnh">
            <Input placeholder="https://..." />
          </Form.Item>
        </div>
        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={4} placeholder="Mô tả ngắn..." />
        </Form.Item>
        <Form.Item name="active" label="Đang hoạt động" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}

function VariantModal({ open, initialValues, onCancel, onSubmit, submitting, productName }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        color: initialValues?.color ?? "",
        size: initialValues?.size ?? "",
        sku: initialValues?.sku ?? "",
        price: initialValues?.price ?? 0,
        stockQuantity: initialValues?.stockQuantity ?? 0,
        active: initialValues?.active ?? true,
      });
    } else {
      form.resetFields();
    }
  }, [form, initialValues, open]);

  return (
    <Modal
      title={initialValues?.id ? `Chỉnh sửa biến thể cho ${productName}` : `Tạo biến thể cho ${productName}`}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Form.Item name="color" label="Màu sắc" rules={[{ required: true, message: "Bắt buộc" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="size" label="Kích thước" rules={[{ required: true, message: "Bắt buộc" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="sku" label="SKU" rules={[{ required: true, message: "Bắt buộc" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Giá bán" rules={[{ required: true, message: "Bắt buộc" }]}>
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item name="stockQuantity" label="Tồn kho">
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item name="active" label="Đang hoạt động" valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}

function BulkStockModal({ open, onCancel, onSubmit, submitting, variants }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        items: variants.map((item) => ({
          id: item.id,
          sku: item.sku,
          stockQuantity: item.stockQuantity,
        })),
      });
    } else {
      form.resetFields();
    }
  }, [form, open, variants]);

  return (
    <Modal
      title="Cập nhật tồn kho hàng loạt"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      width={760}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.List name="items">
          {(fields) => (
            <div className="space-y-4">
              {fields.map((field) => (
                <div
                  key={field.key}
                  className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 md:grid-cols-[1.2fr_1fr]"
                >
                  <Form.Item name={[field.name, "sku"]} label="SKU" className="mb-0">
                    <Input disabled />
                  </Form.Item>
                  <Form.Item name={[field.name, "stockQuantity"]} label="Số lượng tồn kho" className="mb-0">
                    <InputNumber min={0} className="w-full" />
                  </Form.Item>
                  <Form.Item name={[field.name, "id"]} hidden>
                    <Input />
                  </Form.Item>
                </div>
              ))}
            </div>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
}

async function fetchOrderedProducts(nextFilters) {
  if (nextFilters.active !== undefined) {
    return managerApi.fetchProducts({
      ...nextFilters,
      page: Math.max((nextFilters.page || 1) - 1, 0),
    });
  }

  const baseFilters = {
    ...nextFilters,
    page: 0,
    size: 1,
  };

  const [activeSummary, inactiveSummary] = await Promise.all([
    managerApi.fetchProducts({ ...baseFilters, active: true }),
    managerApi.fetchProducts({ ...baseFilters, active: false }),
  ]);

  const [activeProducts, inactiveProducts] = await Promise.all([
    activeSummary.total
      ? managerApi.fetchProducts({
          ...nextFilters,
          active: true,
          page: 0,
          size: activeSummary.total,
        })
      : Promise.resolve({ items: [] }),
    inactiveSummary.total
      ? managerApi.fetchProducts({
          ...nextFilters,
          active: false,
          page: 0,
          size: inactiveSummary.total,
        })
      : Promise.resolve({ items: [] }),
  ]);

  const mergedItems = [...activeProducts.items, ...inactiveProducts.items];
  const currentPage = nextFilters.page || 1;
  const currentSize = nextFilters.size || 10;
  const startIndex = (currentPage - 1) * currentSize;
  const pagedItems = mergedItems.slice(startIndex, startIndex + currentSize);

  return {
    items: pagedItems,
    page: currentPage,
    size: currentSize,
    total: mergedItems.length,
    totalPages: Math.max(1, Math.ceil(mergedItems.length / currentSize)),
  };
}

export default function ProductConfigurationSection({ enabled }) {
  const navigate = useNavigate();
  const [bootstrapped, setBootstrapped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tableData, setTableData] = useState({ items: [], page: 1, size: 10, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({
    keyword: "",
    categoryId: "",
    status: "",
    catalogType: "",
    active: undefined,
    page: 1,
    size: 10,
  });
  const [productModal, setProductModal] = useState({ open: false, mode: "create", record: null });
  const [variantModal, setVariantModal] = useState({ open: false, product: null, record: null });
  const [bulkStockModal, setBulkStockModal] = useState({ open: false, productId: null });
  const [submitting, setSubmitting] = useState(false);
  const [variantSubmitting, setVariantSubmitting] = useState(false);
  const [variantCache, setVariantCache] = useState({});
  const [variantLoading, setVariantLoading] = useState({});

  useEffect(() => {
    if (!enabled || bootstrapped) {
      return;
    }

    const initialFilters = {
      keyword: "",
      categoryId: "",
      status: "",
      catalogType: "",
      active: undefined,
      page: 1,
      size: 10,
    };

    setLoading(true);
    setError("");

    fetchOrderedProducts(initialFilters)
      .then((response) => {
        setTableData(response);
        setBootstrapped(true);
      })
      .catch((loadError) => {
        setError(extractErrorMessage(loadError, "Không thể tải danh sách sản phẩm."));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [bootstrapped, enabled]);

  async function loadProducts(nextFilters = filters) {
    setLoading(true);
    setError("");

    try {
      const response = await fetchOrderedProducts(nextFilters);

      setTableData(response);
      setBootstrapped(true);
    } catch (loadError) {
      setError(extractErrorMessage(loadError, "Không thể tải danh sách sản phẩm."));
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadVariants(productId) {
    if (variantCache[productId]) {
      return;
    }

    setVariantLoading((current) => ({ ...current, [productId]: true }));

    try {
      const variants = await managerApi.fetchVariants(productId);
      setVariantCache((current) => ({ ...current, [productId]: variants }));
    } catch (loadError) {
      appToast.error(extractErrorMessage(loadError, "Không thể tải danh sách biến thể."));
    } finally {
      setVariantLoading((current) => ({ ...current, [productId]: false }));
    }
  }

  async function handleProductSubmit(values) {
    setSubmitting(true);

    try {
      if (productModal.mode === "create") {
        await managerApi.createProduct(values);
        appToast.success("Đã tạo sản phẩm thành công.");
      } else {
        await managerApi.updateProduct(productModal.record.id, values);
        appToast.success("Đã cập nhật sản phẩm thành công.");
      }

      setProductModal({ open: false, mode: "create", record: null });
      loadProducts(filters);
    } catch (submitError) {
      appToast.error(extractErrorMessage(submitError, "Không thể lưu sản phẩm."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteProduct(id) {
    try {
      await managerApi.deleteProduct(id);
      appToast.success("Đã xóa sản phẩm.");
      loadProducts(filters);
    } catch (deleteError) {
      appToast.error(extractErrorMessage(deleteError, "Không thể xóa sản phẩm."));
    }
  }

  async function handleVariantSubmit(values) {
    setVariantSubmitting(true);

    try {
      if (variantModal.record?.id) {
        await managerApi.updateVariant(variantModal.record.id, {
          ...variantModal.record,
          ...values,
        });
        appToast.success("Đã cập nhật biến thể.");
      } else {
        await managerApi.createVariant({
          productId: variantModal.product.id,
          ...values,
        });
        appToast.success("Đã tạo biến thể.");
      }

      const variants = await managerApi.fetchVariants(variantModal.product.id);
      setVariantCache((current) => ({ ...current, [variantModal.product.id]: variants }));
      setVariantModal({ open: false, product: null, record: null });
    } catch (submitError) {
      appToast.error(extractErrorMessage(submitError, "Không thể lưu biến thể."));
    } finally {
      setVariantSubmitting(false);
    }
  }

  async function handleBulkStockSubmit(values) {
    setVariantSubmitting(true);

    try {
      await managerApi.bulkUpdateVariantStock(values);
      const variants = await managerApi.fetchVariants(bulkStockModal.productId);
      setVariantCache((current) => ({ ...current, [bulkStockModal.productId]: variants }));
      setBulkStockModal({ open: false, productId: null });
      appToast.success("Đã cập nhật tồn kho biến thể.");
    } catch (submitError) {
      appToast.error(extractErrorMessage(submitError, "Không thể cập nhật tồn kho."));
    } finally {
      setVariantSubmitting(false);
    }
  }

  function renderVariantTable(product) {
    const variants = variantCache[product.id] || [];

    if (variantLoading[product.id]) {
      return <SectionLoading label="Đang tải biến thể..." />;
    }

    if (!variants.length) {
      return (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              type="primary"
              icon={<Plus size={16} />}
              onClick={() => setVariantModal({ open: true, product, record: null })}
            >
              Thêm biến thể
            </Button>
          </div>
          <SectionEmpty description="Sản phẩm này chưa có biến thể nào." />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={() => setVariantModal({ open: true, product, record: null })}
          >
            Thêm biến thể
          </Button>
          <Button icon={<RefreshCcw size={16} />} onClick={() => setBulkStockModal({ open: true, productId: product.id })}>
            Cập nhật tồn kho hàng loạt
          </Button>
        </div>

        <Table
          rowKey="id"
          pagination={false}
          dataSource={variants}
          columns={[
            { title: "SKU", dataIndex: "sku" },
            { title: "Màu sắc", dataIndex: "color" },
            { title: "Kích thước", dataIndex: "size" },
            {
              title: "Giá bán",
              dataIndex: "price",
              render: (value) => new Intl.NumberFormat("vi-VN").format(value || 0),
            },
            { title: "Tồn kho", dataIndex: "stockQuantity" },
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
                  <Button icon={<Pencil size={14} />} onClick={() => setVariantModal({ open: true, product, record })}>
                    Chỉnh sửa
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      </div>
    );
  }

  const columns = [
    { title: "Sản phẩm", dataIndex: "name" },
    { title: "Danh mục", dataIndex: "categoryName", render: (value, record) => value || record.categoryId || "-" },
    { title: "Loại danh mục", dataIndex: "catalogType", render: (value) => value || "-" },
    { title: "Trạng thái", dataIndex: "status", render: (value) => value || "-" },
    {
      title: "Giá cơ bản",
      dataIndex: "price",
      render: (value) => new Intl.NumberFormat("vi-VN").format(value || 0),
    },
    {
      title: "Đang hoạt động",
      dataIndex: "active",
      render: (value) => <Tag color={value ? "green" : "default"}>{value ? "Đang hoạt động" : "Ngừng hoạt động"}</Tag>,
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<Pencil size={14} />} onClick={() => navigate(`/manager/products/${record.id}/edit`)}>
            Chỉnh sửa
          </Button>
          <Popconfirm title="Xóa sản phẩm này?" onConfirm={() => handleDeleteProduct(record.id)}>
            <Button danger icon={<Trash2 size={14} />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!enabled) {
    return null;
  }

  return (
    <SectionCard
      title="Cấu hình sản phẩm"
      extra={
        <Button type="primary" icon={<PackagePlus size={16} />} onClick={() => navigate("/manager/products/new")}>
          Thêm sản phẩm
        </Button>
      }
    >
      <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <Input
          placeholder="Tìm theo từ khóa"
          value={filters.keyword}
          onChange={(event) => setFilters((current) => ({ ...current, keyword: event.target.value }))}
        />
        <Input
          placeholder="Mã danh mục"
          value={filters.categoryId}
          onChange={(event) => setFilters((current) => ({ ...current, categoryId: event.target.value }))}
        />
        <Input
          placeholder="Trạng thái"
          value={filters.status}
          onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
        />
        <Input
          placeholder="Loại danh mục"
          value={filters.catalogType}
          onChange={(event) => setFilters((current) => ({ ...current, catalogType: event.target.value }))}
        />
        <Select
          allowClear
          placeholder="Đang hoạt động"
          value={filters.active}
          onChange={(value) => setFilters((current) => ({ ...current, active: value }))}
          options={[
            { label: "Đang hoạt động", value: true },
            { label: "Ngừng hoạt động", value: false },
          ]}
        />
      </div>

      <div className="mb-5 flex flex-wrap gap-3">
        <Button type="primary" onClick={() => loadProducts({ ...filters, page: 1 })}>
          Áp dụng bộ lọc
        </Button>
        <Button
          onClick={() => {
            const resetFilters = {
              keyword: "",
              categoryId: "",
              status: "",
              catalogType: "",
              active: undefined,
              page: 1,
              size: 10,
            };
            setFilters(resetFilters);
            loadProducts(resetFilters);
          }}
        >
          Đặt lại
        </Button>
      </div>

      {loading && !tableData.items.length ? <SectionLoading label="Đang tải danh sách sản phẩm..." /> : null}
      {!loading && error ? <SectionError message={error} onRetry={() => loadProducts(filters)} /> : null}
      {!loading && !error && !tableData.items.length ? <SectionEmpty description="Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại." /> : null}

      {tableData.items.length ? (
        <Table
          rowKey="id"
          dataSource={tableData.items}
          columns={columns}
          loading={loading}
          onRow={(record) => ({
            onDoubleClick: () => navigate(`/manager/products/${record.id}/edit`),
          })}
          expandable={{
            expandedRowRender: renderVariantTable,
            onExpand: (expanded, record) => {
              if (expanded) {
                handleLoadVariants(record.id);
              }
            },
            expandIcon: ({ expanded, onExpand, record }) => (
              <button type="button" onClick={(event) => onExpand(record, event)} className="text-slate-500 hover:text-teal-700">
                <Boxes size={16} className={expanded ? "rotate-90 transition" : "transition"} />
              </button>
            ),
          }}
          pagination={{
            current: filters.page,
            pageSize: filters.size,
            total: tableData.total,
            onChange: (page, size) => {
              const nextFilters = { ...filters, page, size };
              setFilters(nextFilters);
              loadProducts(nextFilters);
            },
          }}
        />
      ) : null}

      <ProductModal
        open={productModal.open}
        mode={productModal.mode}
        initialValues={productModal.record}
        onCancel={() => setProductModal({ open: false, mode: "create", record: null })}
        onSubmit={handleProductSubmit}
        submitting={submitting}
      />

      <VariantModal
        open={variantModal.open}
        initialValues={variantModal.record}
        onCancel={() => setVariantModal({ open: false, product: null, record: null })}
        onSubmit={handleVariantSubmit}
        submitting={variantSubmitting}
        productName={variantModal.product?.name}
      />

      <BulkStockModal
        open={bulkStockModal.open}
        variants={variantCache[bulkStockModal.productId] || []}
        onCancel={() => setBulkStockModal({ open: false, productId: null })}
        onSubmit={handleBulkStockSubmit}
        submitting={variantSubmitting}
      />
    </SectionCard>
  );
}
