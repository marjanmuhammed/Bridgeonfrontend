import React from "react";
import { Calendar } from "lucide-react";

const AttendanceManagement = () => {
  const attendanceData = [
    { name: "Aneesh", date: "2025-10-01", status: "Present" },
    { name: "Rahul", date: "2025-10-01", status: "Late" },
    { name: "Sana", date: "2025-10-01", status: "Excused" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <Calendar className="text-green-600" /> Attendance Management
      </h1>
      <div className="bg-white rounded-xl shadow-md p-4 overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((record, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="p-3">{record.name}</td>
                <td className="p-3">{record.date}</td>
                <td className={`p-3 font-semibold ${
                  record.status === "Present" ? "text-green-600" :
                  record.status === "Late" ? "text-yellow-600" :
                  "text-red-600"
                }`}>
                  {record.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceManagement;
