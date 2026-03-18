import { Select } from "antd";
import { useEffect, useState } from "react";
import axios from "axios";

export default function AddressSelector({ onChange }) {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [province, setProvince] = useState(null);
  const [district, setDistrict] = useState(null);
  const [ward, setWard] = useState(null);

  // load provinces
  useEffect(() => {
    const fetchAllProvinces = async () => {
      try {
        const response = await axios.get("https://provinces.open-api.vn", {
          baseURL: "",
        });
        console.log(response.data);
        setProvinces(response.data);
      } catch (error) {
        console.log("Lỗi lấy tỉnh: ", error);
      }
    };

    fetchAllProvinces();
  }, []);

  console.log(provinces);

  const handleProvinceChange = async (value) => {
    setProvince(value);
    setDistrict(null);
    setWard(null);
    setWards([]);

    const res = await axios.get(
      `https://provinces.open-api.vn/api/p/${value}?depth=2`
    );

    setDistricts(res.data.districts);
  };

  const handleDistrictChange = async (value) => {
    setDistrict(value);
    setWard(null);

    const res = await axios.get(
      `https://provinces.open-api.vn/api/d/${value}?depth=2`
    );

    setWards(res.data.wards);
  };

  const handleWardChange = (value) => {
    const wardName = wards.find((w) => w.code === value)?.name;
    const districtName = districts.find((d) => d.code === district)?.name;
    const provinceName = provinces.find((p) => p.code === province)?.name;

    onChange({
      province: provinceName,
      district: districtName,
      ward: wardName,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Province */}
      <Select
        placeholder="Chọn tỉnh"
        value={province}
        onChange={handleProvinceChange}
        options={provinces.map((p) => ({
          value: p.code,
          label: p.name,
        }))}
      />

      {/* District */}
      <Select
        placeholder="Chọn quận"
        value={district}
        onChange={handleDistrictChange}
        disabled={!province}
        options={districts.map((d) => ({
          value: d.code,
          label: d.name,
        }))}
      />

      {/* Ward */}
      <Select
        placeholder="Chọn phường"
        value={ward}
        onChange={handleWardChange}
        disabled={!district}
        options={wards.map((w) => ({
          value: w.code,
          label: w.name,
        }))}
      />
    </div>
  );
}
