import React, { useRef } from "react";
import {
  AlertCircle,
  Eye,
  FileImage,
  Info,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";
import { Button, Form, Input, Segmented } from "antd";
import { appToast } from "../../utils/appToast";

const MANUAL_PRESCRIPTION_FIELDS = [
  "sphereOd",
  "sphereOs",
  "cylinderOd",
  "cylinderOs",
  "axisOd",
  "axisOs",
  "pd",
];

const PRESCRIPTION_METHOD_OPTIONS = [
  { label: "Tải ảnh toa", value: "image" },
  { label: "Nhập tay", value: "manual" },
  { label: "Dùng cả hai", value: "both" },
];

function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Khong doc duoc file"));
    reader.readAsDataURL(file);
  });
}

function buildSignedNumberRules(fieldLabel, required) {
  const rules = [];

  if (required) {
    rules.push({
      required: true,
      message: `Vui lòng nhập ${fieldLabel.toLowerCase()}`,
    });
  }

  rules.push({
    validator: async (_, value) => {
      if (value === undefined || value === null || value === "") {
        return Promise.resolve();
      }

      if (!/^[+-]?\d+(\.\d{1,2})?$/.test(String(value).trim())) {
        return Promise.reject(
          new Error("Giá trị chưa đúng định dạng, ví dụ: -2.50")
        );
      }

      return Promise.resolve();
    },
  });

  return rules;
}

function buildAxisRules(label, dependencyField) {
  return [
    ({ getFieldValue }) => ({
      validator(_, value) {
        const cylinderValue = getFieldValue(["prescription", dependencyField]);
        const hasCylinder = cylinderValue !== undefined && cylinderValue !== null && cylinderValue !== "";

        if (!hasCylinder && (value === undefined || value === null || value === "")) {
          return Promise.resolve();
        }

        if (value === undefined || value === null || value === "") {
          return Promise.reject(
            new Error(`Bạn đã nhập độ loạn, vui lòng nhập thêm ${label.toLowerCase()}`)
          );
        }

        const axis = Number(value);
        if (!Number.isFinite(axis) || axis < 0 || axis > 180 || !Number.isInteger(axis)) {
          return Promise.reject(
            new Error("Trục loạn cần nằm trong khoảng từ 0 đến 180")
          );
        }

        return Promise.resolve();
      },
    }),
  ];
}

function buildPdRules(required) {
  const rules = [];

  if (required) {
    rules.push({
      required: true,
      message: "Vui lòng nhập khoảng cách đồng tử",
    });
  }

  rules.push({
    validator: async (_, value) => {
      if (value === undefined || value === null || value === "") {
        return Promise.resolve();
      }

      const numericValue = Number(value);
      if (!Number.isFinite(numericValue) || numericValue < 40 || numericValue > 80) {
        return Promise.reject(
          new Error("Khoảng cách đồng tử thường nằm trong khoảng 40 đến 80 mm")
        );
      }

      return Promise.resolve();
    },
  });

  return rules;
}

function PrescriptionField({
  label,
  technicalName,
  name,
  placeholder,
  helperText,
  example,
  rules,
  dependencies,
}) {
  return (
    <Form.Item
      label={
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-900">{label}</span>
          <span className="text-xs font-medium text-slate-500">{technicalName}</span>
        </div>
      }
      name={name}
      rules={rules}
      dependencies={dependencies}
      className="mb-0"
      extra={
        <div className="pt-1 text-xs leading-5 text-slate-500">
          <span>{helperText}</span>
          {example ? <span className="ml-1 font-medium text-slate-600">Ví dụ: {example}</span> : null}
        </div>
      }
    >
      <Input
        placeholder={placeholder}
        size="large"
        className="rounded-2xl"
        inputMode="decimal"
      />
    </Form.Item>
  );
}

function EyePrescriptionCard({ title, subtitle, toneClass, children }) {
  return (
    <div className={`rounded-[28px] border p-5 sm:p-6 ${toneClass}`}>
      <div className="mb-5">
        <h4 className="text-lg font-semibold text-slate-900">{title}</h4>
        <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
      </div>
      <div className="grid grid-cols-1 gap-5">{children}</div>
    </div>
  );
}

export default function PrescriptionSection({ form }) {
  const fileInputRef = useRef(null);
  const method = Form.useWatch("prescriptionMethod", form) || "image";
  const imageUrl = Form.useWatch(["prescription", "prescriptionImageUrl"], form);

  const requiresImage = method === "image" || method === "both";
  const requiresManual = method === "manual";
  const showsManual = method === "manual" || method === "both";
  const hasManualPrescriptionData = MANUAL_PRESCRIPTION_FIELDS.some((field) => {
    const value = form.getFieldValue(["prescription", field]);
    return value !== undefined && value !== null && String(value).trim() !== "";
  });

  async function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const isAccepted = ["image/jpeg", "image/png", "image/heic", "image/heif"].includes(
      file.type
    );

    if (!isAccepted) {
      appToast.warning("Vui lòng chọn ảnh JPG, PNG hoặc HEIC");
      event.target.value = "";
      return;
    }

    const maxFileSizeInBytes = 8 * 1024 * 1024;
    if (file.size > maxFileSizeInBytes) {
      appToast.warning("Ảnh toa thuốc không nên lớn hơn 8MB");
      event.target.value = "";
      return;
    }

    try {
      const dataUrl = await toDataUrl(file);
      form.setFieldValue(["prescription", "prescriptionImageUrl"], dataUrl);
      form.validateFields([["prescription", "prescriptionImageUrl"]]);
    } catch {
      appToast.error("Không thể đọc ảnh toa thuốc, bạn thử lại giúp mình nhé");
    } finally {
      event.target.value = "";
    }
  }

  function handleChooseImage() {
    fileInputRef.current?.click();
  }

  function handleRemoveImage() {
    form.setFieldValue(["prescription", "prescriptionImageUrl"], undefined);
    form.validateFields([["prescription", "prescriptionImageUrl"]]);
  }

  return (
    <section className="mt-8 rounded-[32px] border border-teal-100 bg-[linear-gradient(180deg,rgba(240,253,250,0.95)_0%,rgba(255,255,255,0.98)_38%,rgba(248,250,252,0.98)_100%)] p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700 shadow-sm">
            <Eye className="h-3.5 w-3.5" />
            Dễ điền và dễ kiểm tra
          </span>
          <h3 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-[30px]">
            Cung cấp toa thuốc
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
            Bạn có thể tải ảnh toa thuốc hoặc tự nhập thông số mắt. Nếu chưa chắc
            cách điền, hãy tải ảnh toa trước để EyeCare hỗ trợ đối chiếu.
          </p>
        </div>

        <div className="rounded-3xl border border-sky-100 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm sm:max-w-xs">
          <p className="font-semibold text-slate-900">OD là mắt phải, OS là mắt trái</p>
          <p className="mt-1">
            Các ô đã có ví dụ sẵn. Nếu bạn không chắc thông số, chỉ cần tải ảnh toa
            rõ nét là được.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <Form.Item name="prescriptionMethod" className="mb-0" initialValue="image">
          <Segmented
            block
            size="large"
            options={PRESCRIPTION_METHOD_OPTIONS}
            className="rounded-2xl bg-white p-1 shadow-sm"
          />
        </Form.Item>
      </div>

      <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-sm leading-6 text-slate-600">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
          <div>
            <p className="font-medium text-slate-900">
              Gợi ý nhanh: tải ảnh toa trước nếu bạn không chắc cách đọc thông số.
            </p>
            <p>
              Chọn “Dùng cả hai” nếu bạn muốn nhập thêm để nhân viên đối chiếu nhanh
              hơn.
            </p>
          </div>
        </div>

        {(method === "image" || method === "both") && (
          <div className="mt-6">
            <Form.Item
              name={["prescription", "prescriptionImageUrl"]}
              className="mb-0"
              rules={[
                {
                  validator: async (_, value) => {
                    if (!requiresImage || value) {
                      return Promise.resolve();
                    }
                    if (hasManualPrescriptionData) {
                      return Promise.resolve();
                    }

                    return Promise.reject(
                      new Error("Vui lòng tải ảnh toa thuốc rõ nét")
                    );
                  },
                },
              ]}
            >
              <div>
                {!imageUrl ? (
                  <button
                    type="button"
                    onClick={handleChooseImage}
                    className="flex w-full cursor-pointer flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-teal-200 bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.08),_transparent_48%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-6 py-10 text-center transition hover:border-teal-300 hover:bg-teal-50/40"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-teal-100 text-teal-700">
                      <Upload className="h-7 w-7" />
                    </div>
                    <p className="mt-4 text-lg font-semibold text-slate-900">
                      Kéo thả ảnh toa vào đây hoặc chọn ảnh
                    </p>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                      Hỗ trợ JPG, PNG, HEIC. Ảnh nên chụp đủ sáng, rõ chữ và không bị
                      cắt góc.
                    </p>
                    <span className="mt-5 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                      Chọn ảnh toa
                    </span>
                  </button>
                ) : (
                  <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50">
                    <div className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-[180px_1fr] sm:p-5">
                      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
                        <img
                          src={imageUrl}
                          alt="Ảnh toa thuốc đã tải lên"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-between gap-4">
                        <div>
                          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            <FileImage className="h-3.5 w-3.5" />
                            Ảnh toa đã sẵn sàng
                          </span>
                          <p className="mt-3 text-lg font-semibold text-slate-900">
                            EyeCare sẽ dùng ảnh này để đối chiếu thông số mắt của bạn.
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            Nếu ảnh chưa rõ, bạn có thể thay ảnh khác để nhân viên kiểm
                            tra chính xác hơn.
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Button
                            type="default"
                            size="large"
                            icon={<RefreshCw className="h-4 w-4" />}
                            onClick={handleChooseImage}
                          >
                            Thay ảnh
                          </Button>
                          <Button
                            danger
                            size="large"
                            icon={<Trash2 className="h-4 w-4" />}
                            onClick={handleRemoveImage}
                          >
                            Xóa ảnh
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/heic,image/heif"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </Form.Item>

            <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                Chụp toàn bộ toa thuốc, không cắt góc.
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                Tránh bóng lóa hoặc chữ bị mờ.
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                Đặt toa trên nền phẳng, đủ sáng.
              </div>
            </div>
          </div>
        )}

        {showsManual && (
          <div className="mt-6">
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">
                  Nhập tay giúp đối chiếu nhanh hơn, nhưng nếu bạn không chắc thì cứ
                  để EyeCare đọc từ ảnh toa.
                </p>
                {method === "both" ? (
                  <p>Trong chế độ này, phần nhập tay là tùy chọn nhưng nếu đã nhập thì cần đúng định dạng.</p>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <EyePrescriptionCard
                title="Mắt phải (OD)"
                subtitle="OD là mắt phải. Hãy nhập theo đúng thông số trên toa."
                toneClass="border-teal-100 bg-teal-50/60"
              >
                <PrescriptionField
                  label="Độ cầu mắt phải"
                  technicalName="Sphere OD"
                  name={["prescription", "sphereOd"]}
                  placeholder="Ví dụ: -2.50"
                  helperText="Thường là số có dấu + hoặc -."
                  example="-2.50"
                  rules={buildSignedNumberRules("độ cầu mắt phải", requiresManual)}
                />
                <PrescriptionField
                  label="Độ loạn mắt phải"
                  technicalName="Cylinder OD"
                  name={["prescription", "cylinderOd"]}
                  placeholder="Ví dụ: -0.75"
                  helperText="Nếu toa không có loạn, bạn có thể để trống."
                  example="-0.75"
                  rules={buildSignedNumberRules("độ loạn mắt phải", false)}
                />
                <PrescriptionField
                  label="Trục loạn mắt phải"
                  technicalName="Axis OD"
                  name={["prescription", "axisOd"]}
                  placeholder="Ví dụ: 180"
                  helperText="Chỉ nhập khi mắt phải có độ loạn."
                  example="180"
                  rules={buildAxisRules("trục loạn mắt phải", "cylinderOd")}
                  dependencies={[["prescription", "cylinderOd"]]}
                />
              </EyePrescriptionCard>

              <EyePrescriptionCard
                title="Mắt trái (OS)"
                subtitle="OS là mắt trái. Bạn có thể đối chiếu trực tiếp với toa."
                toneClass="border-sky-100 bg-sky-50/60"
              >
                <PrescriptionField
                  label="Độ cầu mắt trái"
                  technicalName="Sphere OS"
                  name={["prescription", "sphereOs"]}
                  placeholder="Ví dụ: -2.00"
                  helperText="Thường là số có dấu + hoặc -."
                  example="-2.00"
                  rules={buildSignedNumberRules("độ cầu mắt trái", requiresManual)}
                />
                <PrescriptionField
                  label="Độ loạn mắt trái"
                  technicalName="Cylinder OS"
                  name={["prescription", "cylinderOs"]}
                  placeholder="Ví dụ: -1.00"
                  helperText="Nếu toa không có loạn, bạn có thể để trống."
                  example="-1.00"
                  rules={buildSignedNumberRules("độ loạn mắt trái", false)}
                />
                <PrescriptionField
                  label="Trục loạn mắt trái"
                  technicalName="Axis OS"
                  name={["prescription", "axisOs"]}
                  placeholder="Ví dụ: 10"
                  helperText="Chỉ nhập khi mắt trái có độ loạn."
                  example="10"
                  rules={buildAxisRules("trục loạn mắt trái", "cylinderOs")}
                  dependencies={[["prescription", "cylinderOs"]]}
                />
              </EyePrescriptionCard>
            </div>

            <div className="mt-5 rounded-[28px] border border-slate-200 bg-slate-50 p-5 sm:p-6">
              <div className="max-w-lg">
                <PrescriptionField
                  label="Khoảng cách đồng tử"
                  technicalName="PD"
                  name={["prescription", "pd"]}
                  placeholder="Ví dụ: 62"
                  helperText="Thông số này thường nằm trên toa hoặc được đo tại cửa hàng."
                  example="62"
                  rules={buildPdRules(true)}
                />
              </div>
            </div>
          </div>
        )}

        {!showsManual ? (
          <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50 p-5 sm:p-6">
            <div className="max-w-lg">
              <PrescriptionField
                label="Khoáº£ng cĂ¡ch Ä‘á»“ng tá»­"
                technicalName="PD"
                name={["prescription", "pd"]}
                placeholder="VĂ­ dá»¥: 62"
                helperText="ThĂ´ng sá»‘ nĂ y thÆ°á»ng náº±m trĂªn toa hoáº·c Ä‘Æ°á»£c Ä‘o táº¡i cá»­a hĂ ng."
                example="62"
                rules={buildPdRules(true)}
              />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
