import React from "react";
import Sidebar from "../Pages/SideBar";
import HomePage from "../Auth/Home";

const LayoutWrapper = ({ children }) => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-auto">
        <div className="flex-shrink-0">
          <HomePage />
        </div>
        <main className="flex-1 p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default LayoutWrapper;
