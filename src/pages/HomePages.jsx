import React, { useEffect } from "react";
import { ServiceCards } from "../components/homepage/ServiceCard";
import { Header } from "../components/common/Header";
import { HeroSection } from "../components/homepage/HeroSection";
import { CustomGlassesProcess } from "../components/homepage/CustomGlassesProcess";
import { WhyChooseUs } from "../components/homepage/WhyChooseUs";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllCategories } from "../redux/category/categorySlice";
import { isManagerRole, isOperationsRole, isStaffRole } from "../utils/authRole";
import { useNavigate } from "react-router-dom";
// import ProductionGrid from "../components/homepage/ProductionGrid";

export default function HomePages() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userRole = useSelector((state) => state.auth.user?.role);
  const staffOnly = isStaffRole(userRole);
  const managerOnly = isManagerRole(userRole);
  const operationsOnly = isOperationsRole(userRole);

  useEffect(() => {
    dispatch(fetchAllCategories());
  }, [dispatch]);

  useEffect(() => {
    if (managerOnly) {
      navigate("/manager/dashboard", { replace: true });
      return;
    }

    if (operationsOnly) {
      navigate("/operation", { replace: true });
    }
  }, [managerOnly, navigate, operationsOnly]);

  if (managerOnly || operationsOnly) {
    return null;
  }

  return (
    <div>
      <HeroSection />
      {!staffOnly && <ServiceCards staffOnly={staffOnly} />}
      {!staffOnly && <CustomGlassesProcess />}
      {!staffOnly && <WhyChooseUs />}
    </div>
  );
}
