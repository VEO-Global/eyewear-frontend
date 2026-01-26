import React from "react";
import { ServiceCards } from "../components/homepage/ServiceCard";
import { Header } from "../components/common/Header";
import { HeroSection } from "../components/homepage/HeroSection";
import { CustomGlassesProcess } from "../components/homepage/CustomGlassesProcess";
import { WhyChooseUs } from "../components/homepage/WhyChooseUs";
import { ProductGrid } from "../components/homepage/ProductionGrid";

export default function HomePages() {
  return (
    <div>
      <HeroSection />
      <ServiceCards />
      <ProductGrid />
      <CustomGlassesProcess />
      <WhyChooseUs />
    </div>
  );
}
