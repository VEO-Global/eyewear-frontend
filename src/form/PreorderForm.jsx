import { useEffect } from "react";
import { Button, Form, Input, InputNumber, Radio } from "antd";
import { useForm } from "antd/es/form/Form";
import { useDispatch, useSelector } from "react-redux";
import api from "../configs/config-axios";
import AddressSelector from "../components/checkout/AddressSelector";
import PrescriptionSection from "../components/prescription/PrescriptionSection";
import { fetchProfile } from "../redux/auth/authSlice";
import { appToast } from "../utils/appToast";
import {
  extractLatestCheckoutAddress,
  hasCheckoutAddress,
} from "../utils/userAddress";

const validateShippingAddress = (_, value) => {
  if (!value || typeof value !== "object") {
    return Promise.reject(new Error("Vui lòng nhập địa chỉ giao hàng"));
  }

  if (typeof value.provinceCode !== "number" || !value.provinceName) {
    return Promise.reject(new Error("Vui lòng chọn tỉnh/thành"));
  }

  if (typeof value.districtCode !== "number" || !value.districtName) {
    return Promise.reject(new Error("Vui lòng chọn quận/huyện"));
  }

  if (typeof value.wardCode !== "number" || !value.wardName) {
    return Promise.reject(new Error("Vui lòng chọn phường/xã"));
  }

  if (!value.addressDetail?.trim()) {
    return Promise.reject(new Error("Vui lòng nhập địa chỉ chi tiết"));
  }

  return Promise.resolve();
};

export default function PreorderForm({ selectedProduct }) {
  const [form] = useForm();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const orderType = Form.useWatch("orderType", form);
  const currentVariant = selectedProduct?.variants?.[0];

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token && !user) {
      dispatch(fetchProfile());
    }
  }, [dispatch, user]);

  useEffect(() => {
    const currentValues = form.getFieldsValue([
      "receiverName",
      "phoneNumber",
      "shippingAddress",
    ]);

    const nextValues = {};

    if (!currentValues.receiverName?.trim() && user?.fullName) {
      nextValues.receiverName = user.fullName;
    }

    if (!currentValues.phoneNumber?.trim() && user?.phone) {
      nextValues.phoneNumber = user.phone;
    }

    if (!hasCheckoutAddress(currentValues.shippingAddress)) {
      const latestAddress = extractLatestCheckoutAddress(user);

      if (latestAddress) {
        nextValues.shippingAddress = latestAddress;
      }
    }

    if (Object.keys(nextValues).length) {
      form.setFieldsValue(nextValues);
    }
  }, [form, user]);

  const handleSubmit = async (values) => {
    if (!currentVariant) {
      appToast.warning("Vui lòng chọn sản phẩm trước khi đặt đơn");
      return;
    }

    const selectedAddress = values.shippingAddress || {};
    const requestBody = {
      orderType: values.orderType,
      receiverName: values.receiverName,
      phoneNumber: values.phoneNumber,
      province: selectedAddress.provinceName || "",
      district: selectedAddress.districtName || "",
      ward: selectedAddress.wardName || "",
      addressDetail: selectedAddress.addressDetail?.trim() || "",
      note: values.note,
      items: [
        {
          variantId: currentVariant.id,
          quantity: values.quantity,
        },
      ],
    };

    if (values.orderType === "PRESCRIPTION") {
      requestBody.prescription = {
        prescriptionImageUrl:
          values.prescription?.prescriptionImageUrl || undefined,
        sphereOd: values.prescription?.sphereOd || undefined,
        sphereOs: values.prescription?.sphereOs || undefined,
        cylinderOd: values.prescription?.cylinderOd || undefined,
        cylinderOs: values.prescription?.cylinderOs || undefined,
        axisOd: values.prescription?.axisOd || undefined,
        axisOs: values.prescription?.axisOs || undefined,
        pd: values.prescription?.pd || undefined,
      };
    }

    await api.post("/orders", requestBody);
    await dispatch(fetchProfile());

    appToast.success(
      values.orderType === "PRESCRIPTION"
        ? "Đã gửi đơn kính có độ thành công!"
        : "Đặt trước thành công!"
    );

    form.setFieldsValue({
      orderType: values.orderType,
      prescriptionMethod: values.orderType === "PRESCRIPTION" ? "image" : undefined,
      quantity: 1,
      receiverName: undefined,
      phoneNumber: undefined,
      shippingAddress: undefined,
      note: undefined,
      prescription: undefined,
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      {!selectedProduct && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Hãy chọn một sản phẩm ở cột bên trái trước khi điền form đặt đơn.
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          orderType: "PREORDER_NORMAL",
          prescriptionMethod: "image",
          quantity: 1,
        }}
      >
        <Form.Item
          label="Loại đơn hàng"
          name="orderType"
          rules={[{ required: true }]}
        >
          <Radio.Group
            optionType="button"
            buttonStyle="solid"
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            <Radio.Button
              value="PREORDER_NORMAL"
              className="!h-auto !rounded-2xl !border !border-slate-200 !bg-white !px-5 !py-4 !text-left !shadow-sm before:!hidden"
            >
              <div>
                <p className="text-base font-semibold text-slate-900">Kính không độ</p>
                <p className="mt-1 text-sm text-slate-500">
                  Đặt trước mẫu kính và hoàn tất đơn hàng như bình thường.
                </p>
              </div>
            </Radio.Button>

            <Radio.Button
              value="PRESCRIPTION"
              className="!h-auto !rounded-2xl !border !border-slate-200 !bg-white !px-5 !py-4 !text-left !shadow-sm before:!hidden"
            >
              <div>
                <p className="text-base font-semibold text-slate-900">Kính có độ</p>
                <p className="mt-1 text-sm text-slate-500">
                  Cung cấp toa thuốc để EyeCare cắt lắp kính theo thông số mắt.
                </p>
              </div>
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="Họ và tên"
          name="receiverName"
          rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
        >
          <Input size="large" placeholder="Nguyễn Văn A" />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phoneNumber"
          rules={[
            { required: true, message: "Vui lòng nhập số điện thoại" },
            {
              pattern: /^[0-9]{10,11}$/,
              message: "Số điện thoại chưa đúng định dạng",
            },
          ]}
        >
          <Input size="large" placeholder="0901234567" />
        </Form.Item>

        <Form.Item
          label="Địa chỉ giao hàng"
          name="shippingAddress"
          rules={[{ validator: validateShippingAddress }]}
        >
          <AddressSelector />
        </Form.Item>

        <Form.Item label="Số lượng" name="quantity">
          <InputNumber min={1} className="w-full" />
        </Form.Item>

        <Form.Item label="Ghi chú" name="note">
          <Input.TextArea
            rows={3}
            placeholder="Ví dụ: Gọi trước khi giao hàng, giao giờ hành chính..."
          />
        </Form.Item>

        {orderType === "PRESCRIPTION" ? <PrescriptionSection form={form} /> : null}

        <Form.Item className="mb-0 mt-8">
          <Button
            type="primary"
            htmlType="submit"
            disabled={!currentVariant}
            size="large"
            className="h-12 rounded-2xl px-6"
          >
            {orderType === "PRESCRIPTION"
              ? "Tiếp tục đặt kính có độ"
              : "Xác nhận đặt trước"}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
