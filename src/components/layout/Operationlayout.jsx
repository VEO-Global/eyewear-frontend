import React from "react";
import OperationSideBar from "../operation/OperationSideBar";
import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import { Outlet } from "react-router-dom";

export default function Operationlayout() {
  return (
    <Layout className="min-h-screen bg-[#f0f2f5]">
      {/* Sidebar */}
      <OperationSideBar />

      {/* Main content */}
      <Layout className="transition-all duration-300">
        <Content className="p-6 m-0 min-h-screen overflow-auto">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
