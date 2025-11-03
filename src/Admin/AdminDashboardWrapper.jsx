import React from "react";
import AdminSidebar from  "../Admin/AdminSideBar"

import HomePage from "../Auth/Home";

const AdminWrapper = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      
      {/* Sidebar full height on left */}
      <div className="h-screen sticky top-0">
        <AdminSidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        
        {/* Navbar always visible */}
        <div className="w-full sticky top-0 z-20">
          < HomePage/> {/* Or you can reuse your HomePage header */}
        </div>

        {/* Page content scrollable */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminWrapper;
