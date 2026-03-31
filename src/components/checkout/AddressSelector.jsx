import { Form, Input, Select } from "antd";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  fetchProvinces,
  fetchDistricts,
  fetchWards,
} from "../../redux/location/locationSlice";

export default function AddressSelector({
  provinces,
  districts,
  wards,
  form,
  disabled = false,
}) {
  const dispatch = useDispatch();

  const provinceCode = Form.useWatch(["shippingAddress", "provinceCode"], form);
  const districtCode = Form.useWatch(["shippingAddress", "districtCode"], form);

  useEffect(() => {
    dispatch(fetchProvinces());
  }, [dispatch]);

  useEffect(() => {
    if (provinceCode) {
      dispatch(fetchDistricts(provinceCode));
      form.setFieldsValue({
        shippingAddress: {
          districtCode: undefined,
          wardCode: undefined,
        },
      });
    }
  }, [provinceCode, dispatch, form]);

  useEffect(() => {
    if (districtCode) {
      dispatch(fetchWards(districtCode));
      form.setFieldsValue({
        wardCode: undefined,
      });
    }
  }, [districtCode, dispatch, form]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Form.Item
        name={["shippingAddress", "provinceCode"]}
        rules={[{ required: true, message: "Chọn tỉnh" }]}
      >
        <Select
          placeholder="Chọn tỉnh/thành"
          options={provinces.map((p) => ({
            value: p.code,
            label: p.name,
          }))}
          disabled={disabled}
        />
      </Form.Item>

      <Form.Item
        name={["shippingAddress", "districtCode"]}
        rules={[{ required: true, message: "Chọn quận" }]}
      >
        <Select
          placeholder="Chọn quận/huyện"
          options={districts.map((d) => ({
            value: d.code,
            label: d.name,
          }))}
          disabled={!provinceCode}
        />
      </Form.Item>

      <Form.Item
        name={["shippingAddress", "wardCode"]}
        rules={[{ required: true, message: "Chọn phường" }]}
      >
        <Select
          placeholder="Chọn phường/xã"
          options={wards.map((w) => ({
            value: w.code,
            label: w.name,
          }))}
          disabled={!districtCode}
        />
      </Form.Item>

      <Form.Item
        name={["shippingAddress", "addressDetail"]}
        rules={[{ required: true, message: "Vui lòng nhập địa chỉ chi tiết" }]}
        className="col-span-1 md:col-span-3"
        label="Địa chỉ chi tiết"
      >
        <Input.TextArea
          placeholder="Nhập địa chỉ chi tiết"
          className="w-full"
        />
      </Form.Item>
    </div>
  );
}
