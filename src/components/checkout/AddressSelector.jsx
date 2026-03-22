import { Input, Select } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import api from "../../configs/config-axios";

const emptyAddress = {
  provinceCode: undefined,
  provinceName: "",
  districtCode: undefined,
  districtName: "",
  wardCode: undefined,
  wardName: "",
  addressDetail: "",
};

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function findOptionByCodeOrName(items, code, name) {
  if (!Array.isArray(items) || !items.length) {
    return null;
  }

  if (typeof code === "number") {
    const matchedByCode = items.find((item) => item.code === code);
    if (matchedByCode) {
      return matchedByCode;
    }
  }

  const normalizedName = normalizeText(name);
  if (!normalizedName) {
    return null;
  }

  return (
    items.find((item) => normalizeText(item.name) === normalizedName) || null
  );
}

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

  const fetchedProvinceCodeRef = useRef();
  const fetchedDistrictCodeRef = useRef();
  const selectedAddress = useMemo(
    () => ({
      ...emptyAddress,
      ...(value || {}),
      addressDetail: value?.addressDetail ?? value?.shippingAddress ?? "",
    }),
    [value]
  );

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
      fetchedProvinceCodeRef.current = undefined;
      return;
    }

    if (fetchedProvinceCodeRef.current === provinceCode) {
      return;
    }

    fetchedProvinceCodeRef.current = provinceCode;
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
      fetchedDistrictCodeRef.current = undefined;
      return;
    }

    if (fetchedDistrictCodeRef.current === districtCode) {
      return;
    }

    fetchedDistrictCodeRef.current = districtCode;
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
    const matchedProvince = findOptionByCodeOrName(
      provinces,
      selectedAddress.provinceCode,
      selectedAddress.provinceName
    );

    if (!matchedProvince) {
      return;
    }

    if (
      matchedProvince.code !== selectedAddress.provinceCode ||
      matchedProvince.name !== selectedAddress.provinceName
    ) {
      emitChange({
        provinceCode: matchedProvince.code,
        provinceName: matchedProvince.name,
      });
      return;
    }

    fetchDistricts(matchedProvince.code);
  }, [
    provinces,
    selectedAddress.provinceCode,
    selectedAddress.provinceName,
  ]);

  useEffect(() => {
    const matchedDistrict = findOptionByCodeOrName(
      districts,
      selectedAddress.districtCode,
      selectedAddress.districtName
    );

    if (!matchedDistrict) {
      return;
    }

    if (
      matchedDistrict.code !== selectedAddress.districtCode ||
      matchedDistrict.name !== selectedAddress.districtName
    ) {
      emitChange({
        districtCode: matchedDistrict.code,
        districtName: matchedDistrict.name,
      });
      return;
    }

    fetchWards(matchedDistrict.code);
  }, [
    districts,
    selectedAddress.districtCode,
    selectedAddress.districtName,
  ]);

  useEffect(() => {
    const matchedWard = findOptionByCodeOrName(
      wards,
      selectedAddress.wardCode,
      selectedAddress.wardName
    );

    if (!matchedWard) {
      return;
    }

    if (
      matchedWard.code !== selectedAddress.wardCode ||
      matchedWard.name !== selectedAddress.wardName
    ) {
      emitChange({
        wardCode: matchedWard.code,
        wardName: matchedWard.name,
      });
    }
  }, [wards, selectedAddress.wardCode, selectedAddress.wardName]);

  const handleProvinceChange = (provinceCode, option) => {
    fetchedProvinceCodeRef.current = undefined;
    fetchedDistrictCodeRef.current = undefined;
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
  };

  const handleDistrictChange = (districtCode, option) => {
    fetchedDistrictCodeRef.current = undefined;
    setWards([]);
    setWardError("");

    emitChange({
      districtCode,
      districtName: option?.label || "",
      wardCode: undefined,
      wardName: "",
    });
  };

  const handleWardChange = (wardCode, option) => {
    emitChange({
      wardCode,
      wardName: option?.label || "",
    });
  };

  const handleAddressDetailChange = (event) => {
    emitChange({
      addressDetail: event.target.value,
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
        value={selectedAddress.addressDetail}
        onChange={handleAddressDetailChange}
        size="large"
      />
    </div>
  );
}
