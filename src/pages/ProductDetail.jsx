import React from "react";
import { useParams } from "react-router-dom";

export default function ProductDetail() {
  const { id } = useParams();
  return <h1>ProductDetail: {id}</h1>;
}
