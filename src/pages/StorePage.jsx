import React from "react";
import Title from "../components/storepage/Title";
import ProductList from "../components/storepage/ProductList";
export default function StorePage() {
  return (
    <>
      <div className="min-h-screen font-sans">
        <main className="container mx-auto px-4 py-8 ">
          <Title />
          <ProductList />
        </main>
      </div>
    </>
  );
}
