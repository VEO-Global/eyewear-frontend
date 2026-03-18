import React, { useEffect } from "react";
import { ServiceCards } from "../components/homepage/ServiceCard";
import { Header } from "../components/common/Header";
import { HeroSection } from "../components/homepage/HeroSection";
import { CustomGlassesProcess } from "../components/homepage/CustomGlassesProcess";
import { WhyChooseUs } from "../components/homepage/WhyChooseUs";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllCategories } from "../redux/category/categorySlice";
import { fetchProducts } from "../redux/products/producSlice";
// import ProductionGrid from "../components/homepage/ProductionGrid";

export default function HomePages() {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
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
