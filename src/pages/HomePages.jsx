import React, { useEffect } from "react";
import { ServiceCards } from "../components/homepage/ServiceCard";
import { Header } from "../components/common/Header";
import { HeroSection } from "../components/homepage/HeroSection";
import { CustomGlassesProcess } from "../components/homepage/CustomGlassesProcess";
import { WhyChooseUs } from "../components/homepage/WhyChooseUs";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllCategories } from "../redux/category/categorySlice";
import { isStaffRole } from "../utils/authRole";
// import ProductionGrid from "../components/homepage/ProductionGrid";

export default function HomePages() {
  const dispatch = useDispatch();
  const userRole = useSelector((state) => state.auth.user?.role);
  const staffOnly = isStaffRole(userRole);

  useEffect(() => {
    dispatch(fetchAllCategories());
  }, [dispatch]);

  return (
    <div>
      <HeroSection />
      {!staffOnly && <ServiceCards staffOnly={staffOnly} />}
      {!staffOnly && <CustomGlassesProcess />}
      {!staffOnly && <WhyChooseUs />}
    </div>
  );
}
