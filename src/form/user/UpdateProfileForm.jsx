import React, { useEffect } from "react";
import { Form, Input, Button } from "antd";
import { useForm } from "antd/es/form/Form";
import { useDispatch, useSelector } from "react-redux";
import AddressSelector from "../../components/checkout/AddressSelector";
import { updateProfile } from "../../redux/auth/authSlice";
import { toast } from "react-toastify";

export default function UpdateProfileForm({ isEditing, setIsEditing }) {
  const [form] = useForm();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  async function handleSubmitForm(values) {
    const payload = {
      ...values,
      fullName: values.fullName,
      phone: values.phone,
      address: `${values.address?.provinceName || ""} ${values.address?.districtName || ""} ${values.address?.wardName || ""} ${values.address?.addressDetail || ""}`,
    };
    try {
      await dispatch(updateProfile(payload)).unwrap();

      toast.success("Cập nhập thông tin thành công");
      setIsEditing(false);
    } catch (err) {
      toast.error("Cập nhật thất bại");
    }
  }

  useEffect(() => {
    user &&
      form.setFieldsValue({
        fullName: user.fullName,
        phone: user.phone,
        address: user.addressLine,
      });
  }, [user, form]);

  return (
    <Form
      layout="vertical"
      onFinish={handleSubmitForm}
      autoComplete="off"
      form={form}
    >
      <Form.Item
        label="Họ và tên"
        name="fullName"
        rules={[
          { required: true, message: "Họ tên không được để trống." },
          {
            pattern: /^[\p{L}\s]+$/u,
            message: "Họ tên không được chứa số hoặc ký tự đặc biệt.",
          },
        ]}
      >
        <Input placeholder="Nhập họ và tên" />
      </Form.Item>

      <Form.Item
        label="Số điện thoại"
        name="phone"
        rules={[
          { required: true, message: "Số điện thoại không được để trống." },
          {
            pattern: /^\d{10}$/,
            message: "Số điện thoại phải gồm đúng 10 chữ số.",
          },
        ]}
      >
        <Input placeholder="Nhập số điện thoại" maxLength={10} />
      </Form.Item>

      {isEditing && (
        <Form.Item
          label="Địa chỉ"
          name="address"
          rules={[
            { required: true, message: "Địa chỉ không được để trống." },
            // {
            //   pattern: /^[\p{L}\d\s,./-]+$/u,
            //   message: "Địa chỉ không được chứa ký tự đặc biệt.",
            // },
          ]}
        >
          <AddressSelector />
        </Form.Item>
      )}
      {!isEditing && user?.addressLine && (
        <Form.Item
          label="Địa chỉ"
          name="address"
          rules={[
            { required: true, message: "Địa chỉ không được để trống." },
            // {
            //   pattern: /^[\p{L}\d\s,./-]+$/u,
            //   message: "Địa chỉ không được chứa ký tự đặc biệt.",
            // },
          ]}
        >
          <Input placeholder="Nhập địa chỉ" />
        </Form.Item>
      )}

      {isEditing && (
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Cập nhật thông tin
          </Button>

          <Button type="primary" onClick={() => setIsEditing(false)} block>
            Hủy
          </Button>
        </Form.Item>
      )}
    </Form>
  );
}
