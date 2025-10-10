import React, { useState, useMemo } from 'react';
import { Calendar, Filter, X, Upload, FileText } from 'lucide-react';

const Attendance = () => {
  const [selectedFilter, setSelectedFilter] = useState('last-week');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedDates, setSelectedDates] = useState({ start: null, end: null });
  const [leaveType, setLeaveType] = useState('');
  const [description, setDescription] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Sample attendance data
  const attendanceData = [
    { date: '2025-10-04', checkIn: null, checkOut: null, workTime: null, totalTime: null, status: 'Excused' },
    { date: '2025-10-03', checkIn: null, checkOut: null, workTime: null, totalTime: null, status: 'Excused' },
    { date: '2025-10-02', checkIn: '09:00 AM', checkOut: '06:00 PM', workTime: '8h', totalTime: '9h', status: 'Present' },
    { date: '2025-10-01', checkIn: '10:30 AM', checkOut: '06:00 PM', workTime: '6.5h', totalTime: '7.5h', status: 'Late' },
    { date: '2025-09-30', checkIn: null, checkOut: null, workTime: null, totalTime: null, status: 'Unexcused' },
    { date: '2025-09-29', checkIn: null, checkOut: null, workTime: null, totalTime: null, status: 'Unexcused' },
    { date: '2025-09-28', checkIn: '09:00 AM', checkOut: '01:00 PM', workTime: '4h', totalTime: '4h', status: 'Half Day' },
    // Added more sample data for different months
    { date: '2025-09-27', checkIn: '09:00 AM', checkOut: '05:00 PM', workTime: '7h', totalTime: '8h', status: 'Present' },
    { date: '2025-09-26', checkIn: null, checkOut: null, workTime: null, totalTime: null, status: 'Excused' },
    { date: '2025-08-15', checkIn: '08:45 AM', checkOut: '05:15 PM', workTime: '7.5h', totalTime: '8.5h', status: 'Present' },
  ];

  const statusColors = {
    Present: 'bg-green-500',
    Late: 'bg-yellow-500',
    'Half Day': 'bg-orange-500',
    Excused: 'bg-red-500',
    Unexcused: 'bg-pink-600',
    'No Status': 'bg-gray-500'
  };

  const statusOrder = ['Present', 'Late', 'Half Day', 'Excused', 'Unexcused', 'No Status'];
  const statusColorArray = ['#10B981', '#F59E0B', '#F97316', '#EF4444', '#EC4899', '#6B7280']; // Matching colors for the chart

  const filterOptions = [
    { value: 'all', label: 'Show All' },
    { value: 'last-7', label: 'Last 7 Days' },
    { value: 'last-30', label: 'Last 30 Days' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'this-week', label: 'This Week' },
    { value: 'last-week', label: 'Last Week' },
    { value: 'this-month', label: 'This Month' },
    { value: 'last-month', label: 'Last Month' },
    { value: 'custom', label: 'Custom Range' } // Added custom range option
  ];

  const holidays = [
    { date: '2025-10-01', name: 'MAHANAVAMI' },
    { date: '2025-10-02', name: 'Vijayadashami, Gandhijayandhi' }
  ];

  // --- NEW: Get current date for highlighting
  const getCurrentDate = () => {
    const now = new Date();
    return {
      day: now.getDate(),
      month: now.getMonth(),
      year: now.getFullYear()
    };
  };

  const currentDateInfo = getCurrentDate();

  // --- Check if a date is in the past
  const isPastDate = (day, month, year) => {
    const date = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // --- CORE NEW LOGIC: Filtering attendance data ---
  const filteredData = useMemo(() => {
    let filtered = [...attendanceData];
    const now = new Date();
    
    // Helper to check if a date string is between two Date objects
    const isDateInRange = (dateStr, start, end) => {
      const date = new Date(dateStr);
      return date >= start && date <= end;
    };

    switch (selectedFilter) {
      case 'today':
        const todayStr = now.toISOString().split('T')[0];
        filtered = filtered.filter(record => record.date === todayStr);
        break;
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        filtered = filtered.filter(record => record.date === yesterdayStr);
        break;
      case 'last-7':
        const startOfLast7 = new Date(now);
        startOfLast7.setDate(now.getDate() - 7);
        filtered = filtered.filter(record => isDateInRange(record.date, startOfLast7, now));
        break;
      case 'last-30':
        const startOfLast30 = new Date(now);
        startOfLast30.setDate(now.getDate() - 30);
        filtered = filtered.filter(record => isDateInRange(record.date, startOfLast30, now));
        break;
      case 'this-week':
        const startOfThisWeek = new Date(now);
        startOfThisWeek.setDate(now.getDate() - now.getDay()); // Sunday as start of week
        filtered = filtered.filter(record => isDateInRange(record.date, startOfThisWeek, now));
        break;
      case 'last-week':
        const startOfLastWeek = new Date(now);
        startOfLastWeek.setDate(now.getDate() - now.getDay() - 7);
        const endOfLastWeek = new Date(now);
        endOfLastWeek.setDate(now.getDate() - now.getDay() - 1);
        filtered = filtered.filter(record => isDateInRange(record.date, startOfLastWeek, endOfLastWeek));
        break;
      case 'this-month':
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        filtered = filtered.filter(record => isDateInRange(record.date, startOfThisMonth, now));
        break;
      case 'last-month':
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        filtered = filtered.filter(record => isDateInRange(record.date, startOfLastMonth, endOfLastMonth));
        break;
      case 'custom':
        // Filter based on the selectedDates state
        if (selectedDates.start && selectedDates.end) {
          filtered = filtered.filter(record => isDateInRange(record.date, selectedDates.start, selectedDates.end));
        }
        break;
      // 'all' and any other case returns all data
      default:
        break;
    }
    return filtered;
  }, [attendanceData, selectedFilter, selectedDates]); // Re-run when filter or custom dates change

  // --- CORE NEW LOGIC: Dynamic Pie Chart Data ---
  const { statusCounts, chartSegments, totalFilteredRecords } = useMemo(() => {
    // 1. Calculate counts for each status from the FILTERED data
    const counts = { 'Present': 0, 'Late': 0, 'Half Day': 0, 'Excused': 0, 'Unexcused': 0, 'No Status': 0 };
    filteredData.forEach(record => {
      counts[record.status]++;
    });

    // 2. Calculate segments for the SVG pie chart
    const total = filteredData.length;
    let accumulatedLength = 0;
    const segments = statusOrder.map(status => {
      if (counts[status] === 0) return null;
      const segmentFraction = counts[status] / total;
      const dashArray = `${segmentFraction * 377} ${377 - (segmentFraction * 377)}`;
      const dashOffset = -accumulatedLength * 377;
      accumulatedLength += segmentFraction;

      return {
        status,
        count: counts[status],
        color: statusColors[status],
        svgColor: statusColorArray[statusOrder.indexOf(status)],
        dashArray,
        dashOffset
      };
    }).filter(segment => segment !== null);

    return { statusCounts: counts, chartSegments: segments, totalFilteredRecords: total };
  }, [filteredData]);

  // --- Existing Calendar Functions (getDaysInMonth, etc.) ---
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Previous month days
    const prevMonthDays = getDaysInMonth(currentMonth - 1, currentYear);
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, isCurrentMonth: false, isPrev: true });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true, isPrev: false });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false, isPrev: false });
    }

    return days;
  };

  // --- MODIFIED: Date Selection Handler with past date validation ---
  const handleDateSelect = (day, isCurrentMonth) => {
    if (!isCurrentMonth) return;
    
    const selectedDate = new Date(currentYear, currentMonth, day);
    
    // Prevent selection of past dates
    if (isPastDate(day, currentMonth, currentYear)) {
      return;
    }
    
    // If selecting custom filter or first date, set custom mode
    if (selectedFilter !== 'custom') {
      setSelectedFilter('custom');
    }
    
    if (!selectedDates.start || (selectedDates.start && selectedDates.end)) {
      setSelectedDates({ start: selectedDate, end: null });
    } else {
      if (selectedDate < selectedDates.start) {
        setSelectedDates({ start: selectedDate, end: selectedDates.start });
      } else {
        setSelectedDates({ ...selectedDates, end: selectedDate });
      }
    }
  };

  const isDateInRange = (day) => {
    if (!selectedDates.start || !day.isCurrentMonth) return false;
    const date = new Date(currentYear, currentMonth, day.day);
    if (selectedDates.end) {
      return date >= selectedDates.start && date <= selectedDates.end;
    }
    return date.getTime() === selectedDates.start.getTime();
  };

  // --- NEW: Check if a day is today
  const isToday = (day) => {
    return day.isCurrentMonth && 
           day.day === currentDateInfo.day && 
           currentMonth === currentDateInfo.month && 
           currentYear === currentDateInfo.year;
  };

  const formatDateRange = () => {
    if (!selectedDates.start) return '';
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };
    if (selectedDates.end) {
      return `${formatDate(selectedDates.start)} - ${formatDate(selectedDates.end)}`;
    }
    return formatDate(selectedDates.start);
  };

  // --- Existing Handlers (handleFileUpload, handleSubmitLeave) ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSubmitLeave = () => {
    if (leaveType && description) {
      alert(`Leave request submitted!\nType: ${leaveType}\nDates: ${formatDateRange()}\nDescription: ${description}\nFile: ${uploadedFile ? uploadedFile.name : 'None'}`);
      setShowRequestModal(false);
      setLeaveType('');
      setDescription('');
      setUploadedFile(null);
      setSelectedDates({ start: null, end: null });
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // --- JSX Return ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Attendance Report</h1>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilterModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-300 border border-blue-200 shadow-sm hover:shadow-md"
              >
                <Filter size={20} />
                <span>Filter</span>
              </button>
              <button
                onClick={() => setShowRequestModal(true)}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                REQUEST LEAVE
              </button>
            </div>
          </div>

          {/* Stats and Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Legend - Now shows dynamic counts */}
            <div className="space-y-3">
              {statusOrder.map((status) => (
                <div key={status} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg hover:bg-white transition-colors duration-200">
                  <div className={`w-4 h-4 rounded ${statusColors[status]} shadow-sm`}></div>
                  <span className="text-gray-700 font-medium">{status}</span>
                  <span className="ml-auto text-gray-500 font-bold">{statusCounts[status]}</span>
                </div>
              ))}
            </div>

            {/* Pie Chart - Now dynamic */}
            <div className="flex items-center justify-center">
              <div className="relative w-64 h-64">
                <svg viewBox="0 0 200 200" className="transform -rotate-90">
                  {chartSegments.map((segment, index) => (
                    <circle
                      key={segment.status}
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke={segment.svgColor}
                      strokeWidth="40"
                      strokeDasharray={segment.dashArray}
                      strokeDashoffset={segment.dashOffset}
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Data recorded:</div>
                    <div className="text-2xl font-bold text-gray-800">{totalFilteredRecords}</div>
                    <div className="text-xs text-gray-500">of {filteredData.length}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Display the active filter range */}
          <div className="mt-6 text-right text-purple-600 font-medium">
            {selectedFilter === 'custom' && formatDateRange() ? formatDateRange() : selectedFilter.toUpperCase()}
          </div>
        </div>

        {/* Enhanced Calendar Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="text-blue-500" size={24} />
            Request Leave & Select Date Range
          </h2>

          {/* Calendar Header */}
          <div className="flex justify-between items-center mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
            <button
              onClick={() => {
                let newMonth = currentMonth - 1;
                let newYear = currentYear;
                if (newMonth < 0) {
                  newMonth = 11;
                  newYear -= 1;
                }
                setCurrentMonth(newMonth);
                setCurrentYear(newYear);
              }}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-300 border border-blue-200 shadow-sm hover:shadow-md font-medium"
            >
              ← Previous
            </button>

            <div className="text-xl font-bold text-gray-800 bg-white px-4 py-2 rounded-lg shadow-sm">
              {monthNames[currentMonth]} {currentYear}
            </div>

            <button
              onClick={() => {
                let newMonth = currentMonth + 1;
                let newYear = currentYear;
                if (newMonth > 11) {
                  newMonth = 0;
                  newYear += 1;
                }
                setCurrentMonth(newMonth);
                setCurrentYear(newYear);
              }}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-300 border border-blue-200 shadow-sm hover:shadow-md font-medium"
            >
              Next →
            </button>
          </div>

          {/* Weekday Header */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
              <div key={day} className="text-center font-semibold text-gray-600 py-2 bg-gray-50 rounded-lg">
                {day}
              </div>
            ))}
          </div>

          {/* Enhanced Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {generateCalendarDays().map((day, idx) => {
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
                "2",
                "0"
              )}-${String(day.day).padStart(2, "0")}`;
              const holiday = holidays.find((h) => h.date === dateStr);
              const isSelected = isDateInRange(day);
              const isTodayDate = isToday(day);
              const isPast = isPastDate(day.day, currentMonth, currentYear);

              return (
                <div
                  key={idx}
                  onClick={() => handleDateSelect(day.day, day.isCurrentMonth)}
                  className={`
                    relative p-3 text-center rounded-xl cursor-pointer transition-all duration-300 border-2
                    ${!day.isCurrentMonth
                      ? "text-gray-300 border-transparent"
                      : isPast
                      ? "text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed"
                      : "text-gray-800 border-transparent hover:border-blue-200 hover:bg-blue-50 hover:shadow-md"
                    }
                    ${isSelected ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600 hover:border-blue-600 shadow-md" : ""}
                    ${holiday && day.isCurrentMonth ? "bg-orange-50 border-orange-200" : ""}
                    ${isTodayDate && !isSelected ? "border-2 border-green-500 bg-green-50 shadow-md" : ""}
                    transform hover:scale-105
                  `}
                >
                  <div className={`font-medium ${isSelected ? "text-white" : ""} ${isTodayDate && !isSelected ? "text-green-600 font-bold" : ""}`}>
                    {day.day}
                  </div>
              
                  {/* Today indicator */}
                  {isTodayDate && (
                    <div className="absolute -top-1 -right-1">
                      <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                    </div>
                  )}
              
                  {/* Holiday indicator */}
                  {holiday && day.isCurrentMonth && !isTodayDate && (
                    <div className="absolute -top-1 -right-1">
                      <div className="w-3 h-3 bg-orange-500 rounded-full shadow-sm"></div>
                    </div>
                  )}
              
                  {holiday && day.isCurrentMonth && (
                    <div className="text-xs mt-1 font-medium text-orange-700 truncate">
                      {holiday.name.split(",")[0]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Holiday</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span className="text-sm text-gray-600">Past Date</span>
            </div>
          </div>
        </div>

        {/* Attendance List - Now shows filtered data */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-medium">Date</th>
                  <th className="px-6 py-4 text-left font-medium">Check In</th>
                  <th className="px-6 py-4 text-left font-medium">Check Out</th>
                  <th className="px-6 py-4 text-left font-medium">Work Time</th>
                  <th className="px-6 py-4 text-left font-medium">Total Time</th>
                  <th className="px-6 py-4 text-left font-medium">Status</th>
                  <th className="px-6 py-4 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.map((record, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50 hover:bg-gray-100' : 'bg-white hover:bg-gray-100 transition-colors duration-200'}>
                    <td className="px-6 py-4 text-gray-800 font-medium">
                      {new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{record.checkIn || 'Nil'}</td>
                    <td className="px-6 py-4 text-gray-600">{record.checkOut || 'Nil'}</td>
                    <td className="px-6 py-4 text-gray-600">{record.workTime || 'Nil'}</td>
                    <td className="px-6 py-4 text-gray-600">{record.totalTime || 'Nil'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-4 py-2 rounded-lg text-white font-medium inline-block min-w-[120px] text-center shadow-sm ${statusColors[record.status]}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Filter Attendance</h3>
              <button onClick={() => setShowFilterModal(false)} className="text-gray-500 hover:text-gray-700 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-2">
              {filterOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSelectedFilter(option.value);
                    // If not selecting custom, clear the custom dates
                    if (option.value !== 'custom') {
                      setSelectedDates({ start: null, end: null });
                    }
                    setShowFilterModal(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 ${
                    selectedFilter === option.value
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-sm'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Leave Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[500px] max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Request Leave</h3>
              <button onClick={() => setShowRequestModal(false)} className="text-gray-500 hover:text-gray-700 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Selected Dates Display */}
              {formatDateRange() && (
                <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <div className="text-sm text-gray-600">Selected Dates</div>
                  <div className="font-medium text-gray-800">{formatDateRange()}</div>
                </div>
              )}

              {/* Leave Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type *</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="">Select leave type</option>
                  <option value="sick">Sick Leave</option>
                  <option value="casual">Casual Leave</option>
                  <option value="emergency">Emergency Leave</option>
                  <option value="vacation">Vacation Leave</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4"
                  placeholder="Please provide reason for leave..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                ></textarea>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Document (Optional)</label>
                <label className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition-all duration-300 bg-gray-50 hover:bg-white">
                  <Upload size={20} className="text-gray-500" />
                  <span className="text-gray-600">
                    {uploadedFile ? uploadedFile.name : 'Choose file or drag here'}
                  </span>
                  <input type="file" onChange={handleFileUpload} className="hidden" />
                </label>
                {uploadedFile && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                    <FileText size={16} />
                    <span>File uploaded successfully</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitLeave}
                disabled={!leaveType || !description || !formatDateRange()}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Submit Leave Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;