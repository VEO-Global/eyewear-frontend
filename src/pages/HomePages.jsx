import React, { useEffect } from "react";
import { ServiceCards } from "../components/homepage/ServiceCard";
import { Header } from "../components/common/Header";
import { HeroSection } from "../components/homepage/HeroSection";
import { CustomGlassesProcess } from "../components/homepage/CustomGlassesProcess";
import { WhyChooseUs } from "../components/homepage/WhyChooseUs";
import { useDispatch } from "react-redux";
import { fetchAllCategories } from "../redux/category/categorySlice";
// import ProductionGrid from "../components/homepage/ProductionGrid";

export default function HomePages() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAllCategories());
  }, [dispatch]);

  return (
    <div>
      <HeroSection />
      <ServiceCards />
      <CustomGlassesProcess />
      <WhyChooseUs />
    </div>
  );
}
