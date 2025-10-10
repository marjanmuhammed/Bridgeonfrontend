import React, { useState } from "react";
import { FileText, CheckCircle, XCircle } from "lucide-react";

const LeaveRequestManagement = () => {
  const [requests, setRequests] = useState([
    { id: 1, name: "Aneesh", date: "2025-10-05", reason: "Medical", status: "Pending" },
    { id: 2, name: "Rahul", date: "2025-10-07", reason: "Family Function", status: "Pending" },
  ]);

  const handleAction = (id, action) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: action } : req
      )
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <FileText className="text-blue-600" /> Leave Requests
      </h1>
      <div className="bg-white shadow-md p-4 rounded-xl overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Date</th>
              <th className="p-3">Reason</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{r.name}</td>
                <td className="p-3">{r.date}</td>
                <td className="p-3">{r.reason}</td>
                <td className={`p-3 font-semibold ${
                  r.status === "Approved" ? "text-green-600" :
                  r.status === "Rejected" ? "text-red-600" :
                  "text-yellow-600"
                }`}>{r.status}</td>
                <td className="p-3 flex gap-3">
                  <button onClick={() => handleAction(r.id, "Approved")} className="text-green-600 hover:text-green-800">
                    <CheckCircle />
                  </button>
                  <button onClick={() => handleAction(r.id, "Rejected")} className="text-red-600 hover:text-red-800">
                    <XCircle />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveRequestManagement;
