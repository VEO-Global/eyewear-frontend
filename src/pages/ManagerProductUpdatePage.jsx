import { Alert, Button, Card, Form, Image, Input, InputNumber, Modal, Popconfirm, Select, Space, Spin, Switch, Table, Tag } from "antd";
import { ArrowLeft, ImagePlus, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ManagerDashboardLayout from "../components/manager/ManagerDashboardLayout";
import { extractErrorMessage, managerApi } from "../services/managerApi";
import { appToast } from "../utils/appToast";

function normalizeImageUrls(product) {
  const imageUrls = Array.isArray(product?.imageUrls) ? product.imageUrls : [];

  if (imageUrls.length) {
    return imageUrls.map((item) => String(item || "").trim()).filter(Boolean);
  }

  return [product?.imageUrl].filter(Boolean);
}

function buildInitialProductValues(product) {
  return {
    name: product?.name ?? "",
    brand: product?.brand ?? "",
    description: product?.description ?? "",
    basePrice: product?.basePrice ?? product?.price ?? 0,
    material: product?.material ?? "",
    gender: product?.gender ?? "",
    model3dUrl: product?.model3dUrl ?? "",
    categoryId: product?.categoryId || undefined,
    status: product?.status ?? "",
    catalogType: product?.catalogType ?? "",
    isActive: product?.isActive ?? product?.active ?? true,
    imageUrls: normalizeImageUrls(product).length ? normalizeImageUrls(product) : [""],
  };
}

function sanitizeImageUrls(items = []) {
  return items.map((item) => String(item || "").trim()).filter(Boolean);
}

function makeBrandCode(brand) {
  const normalized = String(brand || "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();

  return (normalized || "XX").slice(0, 2).padEnd(2, "X");
}

function makeSizeCode(size) {
  return String(size || "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 1) || "X";
}

function makeColorCode(color) {
  return String(color || "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 1) || "X";
}

function makeProductIdCode(productId) {
  const normalized = String(productId ?? "")
    .replace(/\D/g, "")
    .slice(-2);

  return normalized.padStart(2, "0");
}

function makeRandomCode(length = 4) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

function generateVariantSku({ brand, size, color, productId }) {
  return `${makeBrandCode(brand)}${makeSizeCode(size)}${makeColorCode(color)}${makeProductIdCode(productId)}${makeRandomCode(4)}`;
}

function normalizeVariantValues(variant) {
  return {
    sku: variant?.sku ?? "",
    color: variant?.color ?? "",
    size: variant?.size ?? "",
    price: variant?.price ?? 0,
    stockQuantity: variant?.stockQuantity ?? 0,
    active: variant?.active ?? true,
  };
}

function VariantModal({ open, mode, initialValues, onCancel, onSubmit, submitting, variants }) {
  const [form] = Form.useForm();
  const isEditMode = mode === "edit";

  useEffect(() => {
    if (open) {
      form.setFieldsValue(normalizeVariantValues(initialValues));
      return;
    }

    form.resetFields();
  }, [form, initialValues, open]);

  function handleFinish(values) {
    const normalizedColor = values.color.trim().toLowerCase();
    const normalizedSize = values.size.trim().toLowerCase();
    const duplicateVariant = variants.find((item) => {
      if (isEditMode && Number(item.id) === Number(initialValues?.id)) {
        return false;
      }

      return item.color.trim().toLowerCase() === normalizedColor && item.size.trim().toLowerCase() === normalizedSize;
    });

    if (duplicateVariant) {
      form.setFields([
        { name: "color", errors: ["Màu sắc và kích thước này đã tồn tại."] },
        { name: "size", errors: ["Màu sắc và kích thước này đã tồn tại."] },
      ]);
      return;
    }

    onSubmit({
      ...values,
      color: values.color.trim(),
      size: values.size.trim(),
    });
  }

  return (
    <Modal
      open={open}
      title={isEditMode ? "Chỉnh sửa biến thể" : "Thêm biến thể"}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      okText={isEditMode ? "Lưu biến thể" : "Tạo biến thể"}
      width={680}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <div className="grid gap-4 md:grid-cols-2">
          {isEditMode ? (
            <Form.Item label="SKU hiện tại">
              <Input value={initialValues?.sku || ""} disabled />
            </Form.Item>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              SKU sẽ được tạo tự động sau khi lưu biến thể.
            </div>
          )}

          <Form.Item name="active" label="Trạng thái" valuePropName="checked">
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Ẩn" />
          </Form.Item>

          <Form.Item
            name="color"
            label="Màu sắc"
            rules={[{ required: true, whitespace: true, message: "Vui lòng nhập màu sắc." }]}
          >
            <Input placeholder="Đen" />
          </Form.Item>

          <Form.Item
            name="size"
            label="Kích thước"
            rules={[{ required: true, whitespace: true, message: "Vui lòng nhập kích thước." }]}
          >
            <Select
              options={[
                { label: "S", value: "S" },
                { label: "M", value: "M" },
                { label: "L", value: "L" },
              ]}
              placeholder="Chọn kích thước"
            />
          </Form.Item>

          <Form.Item
            name="price"
            label="Giá bán"
            rules={[{ required: true, message: "Vui lòng nhập giá bán." }]}
          >
            <InputNumber className="w-full" min={0} precision={0} />
          </Form.Item>

          <Form.Item
            name="stockQuantity"
            label="Tồn kho"
            rules={[{ required: true, message: "Vui lòng nhập tồn kho." }]}
          >
            <InputNumber className="w-full" min={0} precision={0} />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}

export default function ManagerProductUpdatePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isCreateMode = !id;
  const [form] = Form.useForm();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);
  const [variantSubmitting, setVariantSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [variantModal, setVariantModal] = useState({ open: false, mode: "create", record: null });

  const categoryOptions = useMemo(
    () => categories.map((item) => ({ label: item.name || `Danh mục #${item.id}`, value: item.id })),
    [categories]
  );

  useEffect(() => {
    let mounted = true;

    async function loadPage() {
      setLoading(true);
      setError("");

      try {
        if (isCreateMode) {
          const categoriesResponse = await managerApi.fetchCategories();

          if (!mounted) {
            return;
          }

          setProduct(null);
          setCategories(categoriesResponse);
          setVariants([]);
          form.setFieldsValue(buildInitialProductValues(null));
          return;
        }

        const [productResponse, categoriesResponse, variantsResponse] = await Promise.all([
          managerApi.fetchProductDetail(id),
          managerApi.fetchCategories(),
          managerApi.fetchProductVariants(id),
        ]);

        if (!mounted) {
          return;
        }

        setProduct(productResponse);
        setCategories(categoriesResponse);
        setVariants(variantsResponse);
        form.setFieldsValue(buildInitialProductValues(productResponse));
      } catch (loadError) {
        if (!mounted) {
          return;
        }

        setError(extractErrorMessage(loadError, "Không thể tải dữ liệu sản phẩm."));
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadPage();

    return () => {
      mounted = false;
    };
  }, [form, id, isCreateMode]);

  async function reloadVariants() {
    if (isCreateMode) {
      setVariants([]);
      return;
    }

    const variantResponse = await managerApi.fetchProductVariants(id);
    setVariants(variantResponse);
  }

  async function handleSaveProduct(values) {
    const imageUrls = sanitizeImageUrls(values.imageUrls);
    const payload = {
      ...values,
      imageUrls,
      imageUrl: imageUrls[0] || "",
      basePrice: values.basePrice ?? 0,
      isActive: values.isActive,
      active: values.isActive,
    };

    setSavingProduct(true);

    try {
      if (isCreateMode) {
        const createdProduct = await managerApi.createProduct(payload);
        const mergedProduct = {
          ...createdProduct,
          imageUrls,
        };

        appToast.success("Tạo sản phẩm thành công.");
        navigate(`/manager/products/${mergedProduct.id}/edit`, { replace: true });
        return;
      }

      const updatedProduct = await managerApi.updateProduct(id, payload);
      const mergedProduct = {
        ...updatedProduct,
        imageUrls,
      };

      setProduct(mergedProduct);
      form.setFieldsValue(buildInitialProductValues(mergedProduct));
      appToast.success("Cập nhật sản phẩm thành công.");
    } catch (saveError) {
      appToast.error(
        extractErrorMessage(saveError, isCreateMode ? "Không thể tạo sản phẩm." : "Không thể cập nhật sản phẩm.")
      );
    } finally {
      setSavingProduct(false);
    }
  }

  async function handleSubmitVariant(values) {
    if (isCreateMode) {
      appToast.warning("Vui lòng lưu sản phẩm trước khi thêm biến thể.");
      return;
    }

    const isEditMode = variantModal.mode === "edit";
    setVariantSubmitting(true);

    try {
      if (isEditMode) {
        await managerApi.updateVariant(variantModal.record.id, {
          ...variantModal.record,
          color: values.color,
          size: values.size,
          price: values.price,
          stockQuantity: values.stockQuantity,
          active: values.active,
        });
        appToast.success("Cập nhật biến thể thành công.");
      } else {
        const generatedSku = generateVariantSku({
          brand: product?.brand || form.getFieldValue("brand"),
          size: values.size,
          color: values.color,
          productId: id,
        });

        await managerApi.createVariant({
          productId: Number(id),
          sku: generatedSku,
          color: values.color,
          size: values.size,
          price: values.price,
          stockQuantity: values.stockQuantity,
          active: values.active,
        });
        appToast.success("Thêm biến thể thành công.");
      }

      await reloadVariants();
      setVariantModal({ open: false, mode: "create", record: null });
    } catch (submitError) {
      appToast.error(extractErrorMessage(submitError, "Không thể lưu biến thể."));
    } finally {
      setVariantSubmitting(false);
    }
  }

  async function handleDeleteVariant(record) {
    try {
      await managerApi.deleteVariant(record.id);
      await reloadVariants();
      appToast.success("Xóa biến thể thành công.");
    } catch (deleteError) {
      appToast.error(extractErrorMessage(deleteError, "Không thể xóa biến thể."));
    }
  }

  const imagePreviewUrls = sanitizeImageUrls(Form.useWatch("imageUrls", form) || []);

  const variantColumns = [
    { title: "SKU", dataIndex: "sku" },
    { title: "Màu", dataIndex: "color" },
    { title: "Size", dataIndex: "size" },
    {
      title: "Giá",
      dataIndex: "price",
      render: (value) => new Intl.NumberFormat("vi-VN").format(value || 0),
    },
    { title: "Tồn kho", dataIndex: "stockQuantity" },
    {
      title: "Trạng thái",
      dataIndex: "active",
      render: (value) => <Tag color={value ? "green" : "default"}>{value ? "Hoạt động" : "Tạm ẩn"}</Tag>,
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<Pencil size={14} />} onClick={() => setVariantModal({ open: true, mode: "edit", record })}>
            Sửa
          </Button>
          <Popconfirm
            title="Xóa biến thể này?"
            onConfirm={() => handleDeleteVariant(record)}
          >
            <Button danger icon={<Trash2 size={14} />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <ManagerDashboardLayout>
        <div className="rounded-[28px] border border-slate-200 bg-white p-10 shadow-sm">
          <div className="flex min-h-80 items-center justify-center gap-3 text-slate-500">
            <Spin size="large" />
            Đang tải dữ liệu sản phẩm...
          </div>
        </div>
      </ManagerDashboardLayout>
    );
  }

  if (error) {
    return (
      <ManagerDashboardLayout>
        <Alert
          type="error"
          showIcon
          message="Không thể tải trang chỉnh sửa sản phẩm"
          description={error}
        />
      </ManagerDashboardLayout>
    );
  }

  return (
    <ManagerDashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button icon={<ArrowLeft size={16} />} onClick={() => navigate("/manager/workspace")}>
            Quay lại danh sách
          </Button>
          <div className="text-sm text-slate-500">
            {isCreateMode ? "Đang tạo sản phẩm mới" : `Mã sản phẩm: #${product?.id}`}
          </div>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSaveProduct}>
          <div className="space-y-6">
            <Card className="rounded-[28px] border-slate-200 shadow-sm">
              <div className="mb-6 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {isCreateMode ? "Tạo sản phẩm mới" : "Thông tin sản phẩm"}
                  </h2>
                </div>
                <Button type="primary" htmlType="submit" icon={<Save size={16} />} loading={savingProduct}>
                  {isCreateMode ? "Tạo sản phẩm" : "Lưu sản phẩm"}
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm." }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="brand" label="Thương hiệu">
                  <Input />
                </Form.Item>
                <Form.Item
                  name="categoryId"
                  label="Danh mục"
                  rules={[{ required: true, message: "Vui lòng chọn danh mục." }]}
                >
                  <Select options={categoryOptions} placeholder="Chọn danh mục" />
                </Form.Item>
                <Form.Item name="basePrice" label="Giá cơ bản" rules={[{ required: true, message: "Vui lòng nhập giá cơ bản." }]}>
                  <InputNumber min={0} precision={0} className="w-full" />
                </Form.Item>
                <Form.Item name="material" label="Chất liệu">
                  <Input />
                </Form.Item>
                <Form.Item name="gender" label="Giới tính">
                  <Select
                    allowClear
                    options={[
                      { label: "Nam", value: "Male" },
                      { label: "Nữ", value: "Female" },
                      { label: "Unisex", value: "Unisex" },
                    ]}
                  />
                </Form.Item>
                <Form.Item name="status" label="Trạng thái">
                  <Select
                    options={[
                      { label: "Available", value: "AVAILABLE" },
                      { label: "Unavailable", value: "UNAVAILABLE" },
                    ]}
                    placeholder="Chọn trạng thái"
                  />
                </Form.Item>
                <Form.Item name="catalogType" label="Loại catalog">
                  <Select
                    options={[
                      { label: "New", value: "NEW" },
                      { label: "Old", value: "OLD" },
                    ]}
                    placeholder="Chọn loại catalog"
                  />
                </Form.Item>
                <Form.Item name="model3dUrl" label="Model 3D URL">
                  <Input placeholder="https://..." />
                </Form.Item>
              </div>

              <Form.Item name="description" label="Mô tả">
                <Input.TextArea rows={5} />
              </Form.Item>

              <Form.Item name="isActive" label="Kích hoạt" valuePropName="checked">
                <Switch checkedChildren="Đang bán" unCheckedChildren="Tạm ẩn" />
              </Form.Item>
            </Card>

            <Card className="rounded-[28px] border-slate-200 shadow-sm">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Hình ảnh sản phẩm</h2>
              </div>

              <Form.List name="imageUrls">
                {(fields, { add, remove }) => (
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={field.key} className="flex gap-3">
                        <Form.Item
                          className="mb-0 flex-1"
                          name={field.name}
                          label={index === 0 ? "Danh sách URL ảnh" : undefined}
                          rules={[
                            {
                              validator: (_, value) => {
                                if (!value || !String(value).trim()) {
                                  return Promise.resolve();
                                }

                                try {
                                  // eslint-disable-next-line no-new
                                  new URL(String(value).trim());
                                  return Promise.resolve();
                                } catch {
                                  return Promise.reject(new Error("URL ảnh không hợp lệ."));
                                }
                              },
                            },
                          ]}
                        >
                          <Input placeholder="https://example.com/image.jpg" />
                        </Form.Item>

                        <div className={`flex items-end ${index === 0 ? "pb-0" : ""}`}>
                          <Button danger onClick={() => remove(field.name)} disabled={fields.length === 1}>
                            Xóa
                          </Button>
                        </div>
                      </div>
                    ))}

                    <Button icon={<ImagePlus size={16} />} onClick={() => add("")}>
                      Thêm URL ảnh
                    </Button>
                  </div>
                )}
              </Form.List>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {imagePreviewUrls.length ? (
                  imagePreviewUrls.map((url, index) => (
                    <div key={`${url}-${index}`} className="overflow-hidden rounded-[20px] border border-slate-200 bg-slate-50">
                      <Image
                        src={url}
                        alt={`Ảnh sản phẩm ${index + 1}`}
                        className="h-52 w-full object-cover"
                        fallback="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                      />
                      <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
                        {index === 0 ? "Ảnh chính" : `Ảnh phụ ${index}`}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[20px] border border-dashed border-slate-200 px-5 py-8 text-sm text-slate-500">
                    Chưa có URL ảnh hợp lệ để xem trước.
                  </div>
                )}
              </div>
            </Card>
          </div>
        </Form>

        <Card className="rounded-[28px] border-slate-200 shadow-sm">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Biến thể sản phẩm</h2>
            </div>
            <Button
              type="primary"
              icon={<Plus size={16} />}
              onClick={() => setVariantModal({ open: true, mode: "create", record: null })}
              disabled={isCreateMode}
            >
              Thêm biến thể
            </Button>
          </div>

          {isCreateMode ? (
            <Alert
              className="mb-4"
              type="info"
              showIcon
              message="Lưu sản phẩm trước để quản lý biến thể"
              description="Backend cần có productId trước khi tạo biến thể mới, nên bạn hãy lưu thông tin sản phẩm trước."
            />
          ) : null}

          <Table
            rowKey="id"
            dataSource={variants}
            columns={variantColumns}
            pagination={false}
            locale={{
              emptyText: isCreateMode ? "Chưa có biến thể cho sản phẩm mới." : "Sản phẩm này chưa có biến thể nào.",
            }}
          />
        </Card>
      </div>

      <VariantModal
        open={variantModal.open}
        mode={variantModal.mode}
        initialValues={variantModal.record}
        onCancel={() => setVariantModal({ open: false, mode: "create", record: null })}
        onSubmit={handleSubmitVariant}
        submitting={variantSubmitting}
        variants={variants}
      />
    </ManagerDashboardLayout>
  );
}
