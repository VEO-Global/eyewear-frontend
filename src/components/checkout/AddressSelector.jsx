import { Input, Select } from "antd";
import { useEffect, useRef, useState } from "react";
import api from "../../configs/config-axios";

const emptyAddress = {
  provinceCode: undefined,
  provinceName: "",
  districtCode: undefined,
  districtName: "",
  wardCode: undefined,
  wardName: "",
  shippingAddress: "",
};

export default function AddressSelector({ value, onChange }) {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [provinceLoading, setProvinceLoading] = useState(false);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [wardLoading, setWardLoading] = useState(false);

  const [provinceError, setProvinceError] = useState("");
  const [districtError, setDistrictError] = useState("");
  const [wardError, setWardError] = useState("");

  const didHydrateFromValue = useRef(false);
  const selectedAddress = value || emptyAddress;

  const emitChange = (patch) => {
    onChange?.({
      ...emptyAddress,
      ...selectedAddress,
      ...patch,
    });
  };

  const provinceOptions = provinces.map((item) => ({
    value: item.code,
    label: item.name,
  }));

  const districtOptions = districts.map((item) => ({
    value: item.code,
    label: item.name,
  }));

  const wardOptions = wards.map((item) => ({
    value: item.code,
    label: item.name,
  }));

  const fetchProvinces = async () => {
    setProvinceLoading(true);
    setProvinceError("");

    try {
      const response = await api.get("/locations/provinces");
      setProvinces(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Khong tai duoc danh sach tinh/thanh:", error);
      setProvinces([]);
      setProvinceError("Không tải được danh sách tỉnh/thành");
    } finally {
      setProvinceLoading(false);
    }
  };

  const fetchDistricts = async (provinceCode) => {
    if (typeof provinceCode !== "number") {
      setDistricts([]);
      return;
    }

    setDistrictLoading(true);
    setDistrictError("");

    try {
      const response = await api.get(
        `/locations/districts?provinceCode=${provinceCode}`
      );
      setDistricts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Khong tai duoc danh sach quan/huyen:", error);
      setDistricts([]);
      setDistrictError("Không tải được danh sách quận/huyện");
    } finally {
      setDistrictLoading(false);
    }
  };

  const fetchWards = async (districtCode) => {
    if (typeof districtCode !== "number") {
      setWards([]);
      return;
    }

    setWardLoading(true);
    setWardError("");

    try {
      const response = await api.get(`/locations/wards?districtCode=${districtCode}`);
      setWards(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Khong tai duoc danh sach phuong/xa:", error);
      setWards([]);
      setWardError("Không tải được danh sách phường/xã");
    } finally {
      setWardLoading(false);
    }
  };

  useEffect(() => {
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (
      didHydrateFromValue.current ||
      typeof selectedAddress.provinceCode !== "number"
    ) {
      return;
    }

    didHydrateFromValue.current = true;
    fetchDistricts(selectedAddress.provinceCode);

    if (typeof selectedAddress.districtCode === "number") {
      fetchWards(selectedAddress.districtCode);
    }
  }, [selectedAddress.provinceCode, selectedAddress.districtCode]);

  const handleProvinceChange = (provinceCode, option) => {
    setDistricts([]);
    setWards([]);
    setDistrictError("");
    setWardError("");

    emitChange({
      provinceCode,
      provinceName: option?.label || "",
      districtCode: undefined,
      districtName: "",
      wardCode: undefined,
      wardName: "",
    });

    fetchDistricts(provinceCode);
  };

  const handleDistrictChange = (districtCode, option) => {
    setWards([]);
    setWardError("");

    emitChange({
      districtCode,
      districtName: option?.label || "",
      wardCode: undefined,
      wardName: "",
    });

    fetchWards(districtCode);
  };

  const handleWardChange = (wardCode, option) => {
    emitChange({
      wardCode,
      wardName: option?.label || "",
    });
  };

  const handleAddressDetailChange = (event) => {
    emitChange({
      shippingAddress: event.target.value,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <Select
            placeholder="Chọn tỉnh/thành"
            value={selectedAddress.provinceCode}
            onChange={handleProvinceChange}
            options={provinceOptions}
            loading={provinceLoading}
            notFoundContent={
              provinceError || (provinceLoading ? "Đang tải..." : "Không có dữ liệu")
            }
          />
          {provinceError ? (
            <p className="mt-2 text-sm text-red-500">{provinceError}</p>
          ) : null}
        </div>

        <div>
          <Select
            placeholder="Chọn quận/huyện"
            value={selectedAddress.districtCode}
            onChange={handleDistrictChange}
            options={districtOptions}
            disabled={typeof selectedAddress.provinceCode !== "number"}
            loading={districtLoading}
            notFoundContent={
              districtError || (districtLoading ? "Đang tải..." : "Không có dữ liệu")
            }
          />
          {districtError ? (
            <p className="mt-2 text-sm text-red-500">{districtError}</p>
          ) : null}
        </div>

        <div>
          <Select
            placeholder="Chọn phường/xã"
            value={selectedAddress.wardCode}
            onChange={handleWardChange}
            options={wardOptions}
            disabled={typeof selectedAddress.districtCode !== "number"}
            loading={wardLoading}
            notFoundContent={
              wardError || (wardLoading ? "Đang tải..." : "Không có dữ liệu")
            }
          />
          {wardError ? (
            <p className="mt-2 text-sm text-red-500">{wardError}</p>
          ) : null}
        </div>
      </div>

      <Input
        placeholder="Số nhà, tên đường..."
        value={selectedAddress.shippingAddress}
        onChange={handleAddressDetailChange}
        size="large"
      />
    </div>
  );
}
