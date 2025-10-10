import React from "react";
import { BarChart3 } from "lucide-react";

const DashboardManagement = () => {
  const data = [
    { course: "React", students: 35 },
    { course: "Node.js", students: 28 },
    { course: "Python", students: 22 },
    { course: "C#", students: 18 },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <BarChart3 className="text-purple-600" /> Course Dashboard
      </h1>
      <div className="overflow-x-auto bg-white p-4 shadow-md rounded-xl">
        <table className="w-full text-left">
          <thead className="border-b">
            <tr>
              <th className="p-3">Course</th>
              <th className="p-3">Enrolled Students</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="p-3">{d.course}</td>
                <td className="p-3">{d.students}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardManagement;
