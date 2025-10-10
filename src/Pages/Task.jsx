import React from 'react';

const Task = () => {
  const tasks = [
    { id: 1, title: 'Complete React Project', dueDate: '2024-01-20', status: 'In Progress', priority: 'High' },
    { id: 2, title: 'Learn Node.js Basics', dueDate: '2024-01-25', status: 'Pending', priority: 'Medium' },
    { id: 3, title: 'Database Design', dueDate: '2024-01-18', status: 'Completed', priority: 'High' },
    { id: 4, title: 'API Documentation', dueDate: '2024-01-22', status: 'In Progress', priority: 'Low' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-orange-100 text-orange-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Tasks</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800">Total Tasks</h3>
            <p className="text-2xl font-bold text-blue-600">12</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800">Completed</h3>
            <p className="text-2xl font-bold text-green-600">8</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800">In Progress</h3>
            <p className="text-2xl font-bold text-yellow-600">3</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-red-800">Pending</h3>
            <p className="text-2xl font-bold text-red-600">1</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Task</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Due Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{task.title}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{task.dueDate}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Task;