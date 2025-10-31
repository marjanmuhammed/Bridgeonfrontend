// src/Pages/Attendance.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Filter, X, Upload, FileText, Loader, Check, X as XIcon, Clock, AlertCircle, Eye } from 'lucide-react';
import UserAttendenceApi from '../Api/UserAttendenceApi';
import AdminHolidayApi from '../AdminApi/AdminHolidayApi';
import { leaveRequestApi } from '../AdminApi/LeaveRequestApi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Attendance = () => {
  const [selectedFilter, setSelectedFilter] = useState('last-7');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showLeaveRequestsModal, setShowLeaveRequestsModal] = useState(false);
  const [selectedDates, setSelectedDates] = useState({ start: null, end: null });
  const [leaveType, setLeaveType] = useState('');
  const [description, setDescription] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [attendanceData, setAttendanceData] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [myLeaveRequests, setMyLeaveRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [holidaysLoading, setHolidaysLoading] = useState(true);
  const [leaveRequestsLoading, setLeaveRequestsLoading] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [error, setError] = useState(null);
  const [isMentorOrAdmin, setIsMentorOrAdmin] = useState(false);
  const [reviewNotes, setReviewNotes] = useState({});

  // Status mapping from API values to display values
  const statusMap = {
    0: 'Present',
    1: 'Late',
    2: 'Half Day',
    3: 'Excused',
    4: 'Unexcused'
  };

  // Fixed leave status mapping with proper display text
  const leaveStatusMap = {
    0: { display: 'Pending', color: 'bg-yellow-500', icon: Clock },
    1: { display: 'Approved', color: 'bg-green-500', icon: Check },
    2: { display: 'Rejected', color: 'bg-red-500', icon: XIcon },
    3: { display: 'Cancelled', color: 'bg-gray-500', icon: XIcon }
  };

  const statusColors = {
    'Present': 'bg-green-500',
    'Late': 'bg-yellow-500',
    'Half Day': 'bg-orange-500',
    'Excused': 'bg-red-500',
    'Unexcused': 'bg-pink-600',
    'No Status': 'bg-gray-500'
  };

  const statusOrder = ['Present', 'Late', 'Half Day', 'Excused', 'Unexcused', 'No Status'];
  const statusColorArray = ['#10B981', '#F59E0B', '#F97316', '#EF4444', '#EC4899', '#6B7280'];

  // Calendar color scheme
  const calendarColors = {
    today: 'bg-gradient-to-br from-green-400 to-green-600',
    selected: 'bg-gradient-to-br from-blue-500 to-blue-700',
    holiday: 'bg-gradient-to-br from-orange-400 to-orange-600',
    pending: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
    approved: 'bg-gradient-to-br from-green-400 to-green-600',
    rejected: 'bg-gradient-to-br from-red-400 to-red-600',
    past: 'bg-gray-200',
    future: 'bg-white hover:bg-blue-50'
  };

  // Check user role
  useEffect(() => {
    const checkUserRole = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const roles = payload.role || [];
          setIsMentorOrAdmin(roles.includes('Admin') || roles.includes('Mentor'));
        } catch (error) {
          console.error('Error parsing token:', error);
        }
      }
    };
    checkUserRole();
  }, []);

  // Fetch all data
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await UserAttendenceApi.getMyAttendances();
        
        if (response.status === 200 && response.data) {
          const transformedData = response.data.map(record => {
            const dateObj = new Date(record.date);
            const date = dateObj.getFullYear() + "-" + 
                        String(dateObj.getMonth() + 1).padStart(2, "0") + "-" + 
                        String(dateObj.getDate()).padStart(2, "0");

            const checkInTime = record.checkInTime ? formatTime(record.checkInTime) : null;
            const checkOutTime = (record.checkOutTime && 
                                record.checkOutTime !== '00:00:00' && 
                                !record.checkOutTime.startsWith('00:00:00')) 
              ? formatTime(record.checkOutTime) 
              : null;
            
            const workTime = (checkInTime && checkOutTime) ? calculateWorkTime(record.checkInTime, record.checkOutTime) : null;
            const totalTime = (checkInTime && checkOutTime) ? calculateTotalTime(record.checkInTime, record.checkOutTime) : null;
            
            return {
              date: date,
              checkIn: checkInTime || 'Not Checked In',
              checkOut: checkOutTime || 'Not Checked Out',
              workTime: workTime || 'N/A',
              totalTime: totalTime || 'N/A',
              status: statusMap[record.status] || 'No Status',
              originalData: record
            };
          });
          
          setAttendanceData(transformedData);
        }
      } catch (err) {
        console.error('Failed to fetch attendance data:', err);
        setError('Failed to load attendance data. Please try again.');
        toast.error('Failed to load attendance data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const fetchHolidays = async () => {
      try {
        setHolidaysLoading(true);
        const holidaysData = await AdminHolidayApi.getAllHolidays();
        console.log('Holidays data:', holidaysData); // Debug log
        setHolidays(holidaysData);
        toast.success('Holidays loaded successfully!');
      } catch (err) {
        console.error('Failed to fetch holidays:', err);
        toast.error('Failed to load holidays data.');
      } finally {
        setHolidaysLoading(false);
      }
    };

    const fetchMyLeaveRequests = async () => {
      try {
        const data = await leaveRequestApi.getMyLeaveRequests();
        console.log('My leave requests:', data); // Debug log
        setMyLeaveRequests(data);
        toast.success('Leave requests loaded successfully!');
      } catch (err) {
        console.error('Failed to fetch leave requests:', err);
        toast.error('Failed to load leave requests.');
      }
    };

    const fetchPendingRequests = async () => {
      if (isMentorOrAdmin) {
        try {
          const data = await leaveRequestApi.getPendingRequests();
          console.log('Pending requests:', data); // Debug log
          setPendingRequests(data);
          toast.success('Pending requests loaded successfully!');
        } catch (err) {
          console.error('Failed to fetch pending requests:', err);
          toast.error('Failed to load pending requests.');
        }
      }
    };

    fetchAttendanceData();
    fetchHolidays();
    fetchMyLeaveRequests();
    fetchPendingRequests();
  }, [isMentorOrAdmin]);

  // Helper functions
  const formatTime = (timeString) => {
    if (!timeString) return null;
    
    try {
      const timeParts = timeString.split(':');
      const hours = parseInt(timeParts[0]);
      const minutes = timeParts[1];
      
      if (hours === 0 && minutes === '00') {
        return null;
      }
      
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHour = hours % 12 || 12;
      
      return `${formattedHour}:${minutes} ${ampm}`;
    } catch (error) {
      console.error('Error formatting time:', timeString, error);
      return null;
    }
  };

  const calculateWorkTime = (checkInTimeStr, checkOutTimeStr) => {
    if (!checkInTimeStr || !checkOutTimeStr) return null;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const checkIn = new Date(`${today}T${checkInTimeStr}`);
      const checkOut = new Date(`${today}T${checkOutTimeStr}`);
      
      const diffMs = checkOut - checkIn;
      const diffHours = diffMs / (1000 * 60 * 60);
      
      if (diffHours <= 0) return null;
      
      const workHours = diffHours > 4 ? Math.max(0, diffHours - 1) : diffHours;
      const hours = Math.floor(workHours);
      const minutes = Math.round((workHours - hours) * 60);
      
      if (minutes > 0) {
        return `${hours}h ${minutes}m`;
      } else {
        return `${hours}h`;
      }
    } catch (error) {
      console.error('Error calculating work time:', error);
      return null;
    }
  };

  const calculateTotalTime = (checkInTimeStr, checkOutTimeStr) => {
    if (!checkInTimeStr || !checkOutTimeStr) return null;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const checkIn = new Date(`${today}T${checkInTimeStr}`);
      const checkOut = new Date(`${today}T${checkOutTimeStr}`);
      
      const diffMs = checkOut - checkIn;
      const diffHours = diffMs / (1000 * 60 * 60);
      
      if (diffHours <= 0) return null;
      
      const hours = Math.floor(diffHours);
      const minutes = Math.round((diffHours - hours) * 60);
      
      if (minutes > 0) {
        return `${hours}h ${minutes}m`;
      } else {
        return `${hours}h`;
      }
    } catch (error) {
      console.error('Error calculating total time:', error);
      return null;
    }
  };

  // File upload handler
  const handleFileUpload = async (file) => {
    try {
      setUploadingFile(true);
      const mockFileUrl = URL.createObjectURL(file);
      setUploadedFile({
        file: file,
        url: mockFileUrl
      });
      toast.success('File uploaded successfully!');
    } catch (error) {
      console.error('File upload failed:', error);
      toast.error('File upload failed. Please try again.');
    } finally {
      setUploadingFile(false);
    }
  };

  // Submit leave request for multiple dates with enhanced loading and toast
  const handleSubmitLeave = async () => {
    if (!selectedDates.start) {
      toast.error('Please select at least one date for leave request.');
      return;
    }

    if (!leaveType || !description) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      setSubmittingRequest(true);
      
      const submitToast = toast.loading('Submitting leave request...', {
        position: "top-center",
        autoClose: false,
      });

      // Handle single date or date range
      const datesToProcess = [];
      if (selectedDates.end) {
        // Date range
        const current = new Date(selectedDates.start);
        const end = new Date(selectedDates.end);
        
        while (current <= end) {
          datesToProcess.push(new Date(current));
          current.setDate(current.getDate() + 1);
        }
      } else {
        // Single date
        datesToProcess.push(new Date(selectedDates.start));
      }

      let successfulSubmissions = 0;
      let failedSubmissions = 0;

      // Show 5-second loading animation
      await new Promise(resolve => setTimeout(resolve, 5000));

      for (const selectedDate of datesToProcess) {
        try {
          // Set to beginning of day for accurate comparison
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const selectedDateStart = new Date(selectedDate);
          selectedDateStart.setHours(0, 0, 0, 0);

          // Check if date is in past
          if (selectedDateStart < today) {
            failedSubmissions++;
            continue;
          }

          // Format date correctly for comparison
          const year = selectedDate.getFullYear();
          const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
          const day = String(selectedDate.getDate()).padStart(2, '0');
          const dateStr = `${year}-${month}-${day}`;

          console.log('📅 Processing date:', {
            original: selectedDate,
            formatted: dateStr,
            day: selectedDate.getDate(),
            month: selectedDate.getMonth() + 1,
            year: selectedDate.getFullYear()
          });

          // Check if date is holiday
          const isSelectedDateHoliday = holidays.find(h => {
            const holidayDate = new Date(h.date);
            holidayDate.setHours(0, 0, 0, 0);
            const holidayDateStr = holidayDate.toISOString().split('T')[0];
            return holidayDateStr === dateStr;
          });

          if (isSelectedDateHoliday) {
            toast.warning(`Cannot request leave on ${isSelectedDateHoliday.name}. Date skipped.`);
            failedSubmissions++;
            continue;
          }

          // Check if there's already a pending request for this date
          const existingRequest = myLeaveRequests.find(request => {
            const requestDate = new Date(request.date);
            requestDate.setHours(0, 0, 0, 0);
            const requestDateStr = requestDate.toISOString().split('T')[0];
            return requestDateStr === dateStr && request.status === 0; // 0 = Pending
          });

          if (existingRequest) {
            toast.warning(`You already have a pending leave request for ${dateStr}. Date skipped.`);
            failedSubmissions++;
            continue;
          }

          const leaveData = {
            date: dateStr,
            leaveType: leaveType,
            reason: description,
            proofImageUrl: uploadedFile?.url || ""
          };

          console.log('🚀 Submitting leave request:', leaveData);
          await leaveRequestApi.createLeaveRequest(leaveData);
          successfulSubmissions++;
          
          // Show individual success toast for each date
          toast.success(`Leave request submitted for ${dateStr}!`, {
            position: "top-center",
            autoClose: 3000,
          });
        } catch (error) {
          console.error(`Failed to submit leave request for date ${selectedDate}:`, error);
          toast.error(`Failed to submit leave request for ${selectedDate.toLocaleDateString()}. Please try again.`);
          failedSubmissions++;
        }
      }

      // Show final result summary
      if (successfulSubmissions > 0) {
        toast.update(submitToast, {
          render: `🎉 Successfully submitted ${successfulSubmissions} leave request${successfulSubmissions > 1 ? 's' : ''}!${failedSubmissions > 0 ? ` ${failedSubmissions} date${failedSubmissions > 1 ? 's' : ''} skipped.` : ''}`,
          type: 'success',
          isLoading: false,
          autoClose: 5000,
          position: "top-center"
        });
        
        // Refresh leave requests
        const updatedRequests = await leaveRequestApi.getMyLeaveRequests();
        setMyLeaveRequests(updatedRequests);
      } else {
        toast.update(submitToast, {
          render: '❌ No leave requests were submitted. Please check selected dates.',
          type: 'error',
          isLoading: false,
          autoClose: 5000,
          position: "top-center"
        });
      }
      
      // Reset form
      setShowRequestModal(false);
      setLeaveType('');
      setDescription('');
      setUploadedFile(null);
      setSelectedDates({ start: null, end: null });
    } catch (error) {
      console.error('❌ Failed to submit leave request:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to submit leave request. Please try again.';
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setSubmittingRequest(false);
    }
  };

  // Leave request review handler with enhanced toast
  const handleReviewRequest = async (requestId, approve) => {
    try {
      setLeaveRequestsLoading(true);
      
      const reviewToast = toast.loading(`${approve ? 'Approving' : 'Rejecting'} leave request...`, {
        position: "top-center",
        autoClose: false,
      });

      // Show 2-second loading for better UX
      await new Promise(resolve => setTimeout(resolve, 2000));

      const reviewData = {
        requestId: requestId,
        approve: approve,
        notes: reviewNotes[requestId] || ''
      };

      await leaveRequestApi.reviewRequest(reviewData);
      
      toast.update(reviewToast, {
        render: `✅ Leave request ${approve ? 'approved' : 'rejected'} successfully!`,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
        position: "top-center"
      });
      
      const [updatedPending, updatedMyRequests] = await Promise.all([
        leaveRequestApi.getPendingRequests(),
        leaveRequestApi.getMyLeaveRequests()
      ]);
      
      setPendingRequests(updatedPending);
      setMyLeaveRequests(updatedMyRequests);
      
      setReviewNotes(prev => {
        const newNotes = { ...prev };
        delete newNotes[requestId];
        return newNotes;
      });
    } catch (error) {
      console.error('Failed to review request:', error);
      toast.error('❌ Failed to review request. Please try again.', {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setLeaveRequestsLoading(false);
    }
  };

  const handleReviewNotesChange = (requestId, notes) => {
    setReviewNotes(prev => ({
      ...prev,
      [requestId]: notes
    }));
  };

  // Calendar functions
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

    const prevMonthDays = getDaysInMonth(currentMonth - 1, currentYear);
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, isCurrentMonth: false, isPrev: true });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true, isPrev: false });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false, isPrev: false });
    }

    return days;
  };

  // Enhanced date selection handler for range selection
  const handleDateSelect = (day, isCurrentMonth) => {
    if (!isCurrentMonth) return;
    
    // Create date correctly without timezone issues
    const selectedDate = new Date(currentYear, currentMonth, day);
    selectedDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const selectedDateStart = new Date(selectedDate);
    selectedDateStart.setHours(0, 0, 0, 0);
    
    // Check if date is in past
    if (selectedDateStart < today) {
      toast.error('Cannot request leave for past dates.', {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
    
    // Check for existing leave requests
    const dateStr = selectedDate.toISOString().split('T')[0];
    const existingRequest = myLeaveRequests.find(request => {
      const requestDate = new Date(request.date);
      requestDate.setHours(0, 0, 0, 0);
      const requestDateStr = requestDate.toISOString().split('T')[0];
      return requestDateStr === dateStr && request.status === 0; // 0 = Pending
    });

    if (existingRequest) {
      toast.error('You already have a pending leave request for this date.', {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    // Check if date is holiday
    const isSelectedDateHoliday = holidays.find(h => {
      const holidayDate = new Date(h.date);
      holidayDate.setHours(0, 0, 0, 0);
      const holidayDateStr = holidayDate.toISOString().split('T')[0];
      return holidayDateStr === dateStr;
    });

    if (isSelectedDateHoliday) {
      toast.error(`Cannot request leave on ${isSelectedDateHoliday.name}. Please select a different date.`, {
        position: "top-center",
        autoClose: 4000,
      });
      return;
    }

    // Handle range selection
    if (!selectedDates.start) {
      // First selection
      setSelectedDates({ start: selectedDate, end: null });
      toast.info(`Selected ${selectedDate.toLocaleDateString()}`, {
        position: "top-center",
        autoClose: 2000,
      });
    } else if (!selectedDates.end && selectedDate > selectedDates.start) {
      // Second selection for range
      setSelectedDates(prev => ({ ...prev, end: selectedDate }));
      const dayCount = Math.ceil((selectedDate - selectedDates.start) / (1000 * 60 * 60 * 24)) + 1;
      toast.info(`Selected ${dayCount} days from ${selectedDates.start.toLocaleDateString()} to ${selectedDate.toLocaleDateString()}`, {
        position: "top-center",
        autoClose: 3000,
      });
    } else {
      // Reset selection
      setSelectedDates({ start: selectedDate, end: null });
      toast.info(`Selected ${selectedDate.toLocaleDateString()}`, {
        position: "top-center",
        autoClose: 2000,
      });
    }
  };

  const isDateInRange = (day) => {
    if (!selectedDates.start || !day.isCurrentMonth) return false;
    
    // Create date correctly for comparison
    const date = new Date(currentYear, currentMonth, day.day);
    date.setHours(12, 0, 0, 0);
    
    if (selectedDates.end) {
      const start = new Date(selectedDates.start);
      const end = new Date(selectedDates.end);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      
      return date >= start && date <= end;
    }
    
    const start = new Date(selectedDates.start);
    start.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    return date.getTime() === start.getTime();
  };

  const isToday = (day) => {
    const today = new Date();
    return day.isCurrentMonth && 
           day.day === today.getDate() && 
           currentMonth === today.getMonth() && 
           currentYear === today.getFullYear();
  };

  const isPastDate = (day, month, year) => {
    const date = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
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

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Check if a date is a holiday and return holiday object
  const isHoliday = (day) => {
    if (!day.isCurrentMonth) return null;
    
    // Date formatting for holiday comparison
    const date = new Date(currentYear, currentMonth, day.day);
    date.setHours(12, 0, 0, 0);
    const dateStr = date.toISOString().split('T')[0];
    
    const holiday = holidays.find(h => {
      const holidayDate = new Date(h.date);
      holidayDate.setHours(12, 0, 0, 0);
      const holidayDateStr = holidayDate.toISOString().split('T')[0];
      return holidayDateStr === dateStr;
    });
    
    return holiday || null;
  };

  // Check if a date has a leave request
  const getLeaveRequestForDate = (date) => {
    const selectedDate = new Date(currentYear, currentMonth, date.day);
    selectedDate.setHours(12, 0, 0, 0);
    const dateStr = selectedDate.toISOString().split('T')[0];
    
    return myLeaveRequests.find(request => {
      const requestDate = new Date(request.date);
      requestDate.setHours(12, 0, 0, 0);
      const requestDateStr = requestDate.toISOString().split('T')[0];
      return requestDateStr === dateStr;
    });
  };

  // Get calendar cell background based on status
  const getCalendarCellBackground = (day, isCurrentMonth, isSelected, isTodayDate, isPast, leaveRequest, holiday) => {
    if (!isCurrentMonth) return 'bg-gray-100 text-gray-400';
    if (isPast) return 'bg-gray-200 text-gray-500 cursor-not-allowed';
    if (leaveRequest) {
      const statusInfo = leaveStatusMap[leaveRequest.status] || leaveStatusMap[0];
      return `${statusInfo.color} text-white shadow-md`;
    }
    if (holiday) return 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-md';
    if (isSelected) return 'bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg transform scale-105';
    if (isTodayDate) return 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-md';
    return 'bg-white text-gray-800 hover:bg-blue-50 hover:shadow-md border border-gray-200';
  };

  // Filter options and data filtering
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
    { value: 'custom', label: 'Custom Range' }
  ];

  const filteredData = useMemo(() => {
    let filtered = [...attendanceData];
    const now = new Date();
    
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
        startOfLast7.setDate(now.getDate() - 6);
        filtered = filtered.filter(record => isDateInRange(record.date, startOfLast7, now));
        break;
      case 'last-30':
        const startOfLast30 = new Date(now);
        startOfLast30.setDate(now.getDate() - 29);
        filtered = filtered.filter(record => isDateInRange(record.date, startOfLast30, now));
        break;
      default:
        break;
    }
    
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    return filtered;
  }, [attendanceData, selectedFilter, selectedDates]);

  const { statusCounts, chartSegments, totalFilteredRecords } = useMemo(() => {
    const counts = { 'Present': 0, 'Late': 0, 'Half Day': 0, 'Excused': 0, 'Unexcused': 0, 'No Status': 0 };
    filteredData.forEach(record => {
      counts[record.status]++;
    });

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

  const formatDateStraight = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    }).replace(/ /g, '-');
  };

  // Loading and Error states
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 flex items-center gap-4">
          <Loader className="animate-spin text-blue-600" size={24} />
          <span className="text-gray-700">Loading attendance data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-red-500 text-lg mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      {/* Toast Container with custom configuration */}
      <div className="toast-container">
        {/* This will be rendered by react-toastify */}
      </div>
      
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
              
              {isMentorOrAdmin && (
                <button
                  onClick={() => setShowLeaveRequestsModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <Clock size={20} />
                  <span>Review Leaves ({pendingRequests.length})</span>
                </button>
              )}
              
              <button
                onClick={() => {
                  if (!selectedDates.start) {
                    toast.info('Please select dates from the calendar first.', {
                      position: "top-center",
                      autoClose: 3000,
                    });
                  }
                  setShowRequestModal(true);
                }}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                REQUEST LEAVE
              </button>
            </div>
          </div>

          {/* Stats and Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Legend */}
            <div className="space-y-3">
              {statusOrder.map((status) => (
                <div key={status} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg hover:bg-white transition-colors duration-200">
                  <div className={`w-4 h-4 rounded ${statusColors[status]} shadow-sm`}></div>
                  <span className="text-gray-700 font-medium">{status}</span>
                  <span className="ml-auto text-gray-500 font-bold">{statusCounts[status]}</span>
                </div>
              ))}
            </div>

            {/* Pie Chart */}
            <div className="flex items-center justify-center">
              <div className="relative w-64 h-64">
                <svg viewBox="0 0 200 200" className="transform -rotate-90">
                  {chartSegments.map((segment) => (
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

          {/* Selected Dates Info */}
          {selectedDates.start && (
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-blue-600 font-medium">Selected Date Range:</div>
                  <div className="text-lg font-bold text-gray-800">
                    {selectedDates.start.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                    {selectedDates.end && ` - ${selectedDates.end.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}`}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedDates({ start: null, end: null });
                    toast.info('Selection cleared', {
                      position: "top-center",
                      autoClose: 2000,
                    });
                  }}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  Clear
                </button>
              </div>
              <div className="text-xs text-gray-600 mt-2">
                💡 Tip: Click one date for single day leave, or click two dates for a range
              </div>
            </div>
          )}

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
              const holiday = isHoliday(day);
              const leaveRequest = getLeaveRequestForDate(day);
              const isSelected = isDateInRange(day);
              const isTodayDate = isToday(day);
              const isPast = isPastDate(day.day, currentMonth, currentYear);

              const cellBackground = getCalendarCellBackground(
                day, 
                day.isCurrentMonth, 
                isSelected, 
                isTodayDate, 
                isPast, 
                leaveRequest, 
                holiday
              );

              return (
                <div
                  key={idx}
                  onClick={() => handleDateSelect(day.day, day.isCurrentMonth)}
                  className={`
                    relative p-3 text-center rounded-xl transition-all duration-300 border-2 min-h-[80px] flex flex-col justify-between
                    ${cellBackground}
                    ${!day.isCurrentMonth ? "cursor-default" : isPast ? "cursor-not-allowed" : "cursor-pointer hover:scale-105"}
                  `}
                >
                  <div className={`font-bold ${(isSelected || leaveRequest || holiday || isTodayDate) ? "text-white" : ""} ${!day.isCurrentMonth ? "text-gray-400" : ""}`}>
                    {day.day}
                  </div>
              
                  {/* Status indicators */}
                  <div className="flex flex-col gap-1 mt-1">
                    {/* Holiday indicator - Show holiday name */}
                    {holiday && day.isCurrentMonth && !leaveRequest && (
                      <div className="text-xs font-medium text-white bg-orange-500 px-1 py-0.5 rounded truncate" title={holiday.name}>
                        {holiday.name.length > 10 ? holiday.name.substring(0, 10) + '...' : holiday.name}
                      </div>
                    )}
              
                    {/* Leave request indicator */}
                    {leaveRequest && (
                      <div className={`text-xs font-medium text-white px-1 py-0.5 rounded truncate ${
                        leaveRequest.status === 0 ? 'bg-yellow-500' : // Pending
                        leaveRequest.status === 1 ? 'bg-green-500' : // Approved
                        leaveRequest.status === 2 ? 'bg-red-500' : // Rejected
                        'bg-gray-500' // Cancelled or other
                      }`}>
                        {leaveStatusMap[leaveRequest.status]?.display || 'Leave'}
                      </div>
                    )}

                    {/* Today indicator text */}
                    {isTodayDate && !leaveRequest && !holiday && !isSelected && (
                      <div className="text-xs font-medium text-green-700 bg-green-100 px-1 py-0.5 rounded">
                        Today
                      </div>
                    )}

                    {/* Selected indicator text */}
                    {isSelected && !leaveRequest && (
                      <div className="text-xs font-medium text-blue-100 bg-blue-600 bg-opacity-50 px-1 py-0.5 rounded">
                        Selected
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Enhanced Calendar Legend */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm">
              <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow"></div>
              <span className="text-sm font-medium text-gray-700">Today</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm">
              <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full shadow"></div>
              <span className="text-sm font-medium text-gray-700">Selected</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm">
              <div className="w-4 h-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full shadow"></div>
              <span className="text-sm font-medium text-gray-700">Holiday</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm">
              <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow"></div>
              <span className="text-sm font-medium text-gray-700">Pending</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm">
              <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow"></div>
              <span className="text-sm font-medium text-gray-700">Approved</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm">
              <div className="w-4 h-4 bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow"></div>
              <span className="text-sm font-medium text-gray-700">Rejected</span>
            </div>
          </div>
        </div>

        {/* Attendance List with Real Data */}
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No attendance records found for the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((record, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50 hover:bg-gray-100' : 'bg-white hover:bg-gray-100 transition-colors duration-200'}>
                      <td className="px-6 py-4 text-gray-800 font-medium">
                        {formatDateStraight(record.date)}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{record.checkIn}</td>
                      <td className="px-6 py-4 text-gray-600">{record.checkOut}</td>
                      <td className="px-6 py-4 text-gray-600">{record.workTime}</td>
                      <td className="px-6 py-4 text-gray-600">{record.totalTime}</td>
                      <td className="px-6 py-4">
                        <span className={`px-4 py-2 rounded-lg text-white font-medium inline-block min-w-[120px] text-center shadow-sm ${statusColors[record.status]}`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
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
                    if (option.value !== 'custom') {
                      setSelectedDates({ start: null, end: null });
                    }
                    setShowFilterModal(false);
                    toast.success(`Filter applied: ${option.label}`, {
                      position: "top-center",
                      autoClose: 2000,
                    });
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
              <h3 className="text-xl font-bold text-gray-800">
                {selectedDates.start ? 'Request Leave' : 'Select Dates First'}
              </h3>
              <button 
                onClick={() => {
                  setShowRequestModal(false);
                  setSelectedDates({ start: null, end: null });
                }} 
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {!selectedDates.start ? (
              <div className="text-center py-8">
                <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
                <h4 className="text-lg font-semibold text-gray-700 mb-2">No Dates Selected</h4>
                <p className="text-gray-500 mb-4">Please select dates from the calendar first to request leave.</p>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Select Dates
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Selected Date Display */}
                <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <div className="text-sm text-gray-600">Selected Date Range</div>
                  <div className="font-medium text-gray-800">
                    {selectedDates.start.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                    {selectedDates.end && ` - ${selectedDates.end.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}`}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {selectedDates.end 
                      ? `${Math.ceil((selectedDates.end - selectedDates.start) / (1000 * 60 * 60 * 24)) + 1} days selected` 
                      : 'Single day selected'
                    }
                  </div>
                </div>

                {/* Leave Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Leave Type *
                  </label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    required
                  >
                    <option value="">Select leave type</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Emergency Leave">Emergency Leave</option>
                    <option value="Vacation Leave">Vacation Leave</option>
                    <option value="Personal Leave">Personal Leave</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description / Reason *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="4"
                    placeholder="Please provide detailed reason for leave request..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Proof Document (Optional)
                  </label>
                  <label className="w-full flex flex-col items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition-all duration-300 bg-gray-50 hover:bg-white">
                    {uploadingFile ? (
                      <Loader className="animate-spin text-purple-600" size={24} />
                    ) : (
                      <Upload size={24} className="text-gray-500" />
                    )}
                    <span className="text-gray-600 text-center">
                      {uploadedFile ? uploadedFile.file.name : 'Click to upload or drag & drop'}
                    </span>
                    <span className="text-sm text-gray-500">Max file size: 5MB (JPG, PNG, PDF, DOC)</span>
                    <input 
                      type="file" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) handleFileUpload(file);
                      }} 
                      className="hidden" 
                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                      disabled={uploadingFile}
                    />
                  </label>
                  
                  {uploadedFile && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-600 p-2 bg-green-50 rounded">
                      <FileText size={16} />
                      <span className="flex-1">{uploadedFile.file.name}</span>
                      <button 
                        onClick={() => setUploadedFile(null)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmitLeave}
                  disabled={!leaveType || !description || !selectedDates.start || submittingRequest}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  {submittingRequest ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      <span>Submitting Leave Request...</span>
                    </>
                  ) : (
                    `Submit Leave Request${selectedDates.end ? 's' : ''}`
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Review Modal for Admin/Mentor */}
      {showLeaveRequestsModal && isMentorOrAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[800px] max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                Review Leave Requests ({pendingRequests.length})
              </h3>
              <button 
                onClick={() => setShowLeaveRequestsModal(false)} 
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Check size={48} className="mx-auto mb-4 text-green-500" />
                  <p className="text-lg">No pending leave requests</p>
                  <p className="text-sm">All leave requests have been processed</p>
                </div>
              ) : (
                pendingRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-lg">
                          User #{request.userId}
                        </h4>
                        <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                          <div>
                            <span className="text-gray-600">Date: </span>
                            <span className="font-medium">
                              {new Date(request.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Type: </span>
                            <span className="font-medium text-purple-600">{request.leaveType}</span>
                          </div>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-yellow-500 text-white rounded-full text-sm font-medium flex items-center gap-1">
                        <Clock size={16} />
                        Pending
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reason:</label>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{request.reason}</p>
                    </div>

                    {/* Proof Document */}
                    {request.proofImageUrl && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Proof Document:</label>
                        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                          <FileText size={16} className="text-blue-600" />
                          <span className="text-blue-600 flex-1">Proof document attached</span>
                          <a 
                            href={request.proofImageUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            <Eye size={14} />
                            View
                          </a>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <textarea
                        placeholder="Add review notes (optional)"
                        value={reviewNotes[request.id] || ''}
                        onChange={(e) => handleReviewNotesChange(request.id, e.target.value)}
                        rows="2"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleReviewRequest(request.id, true)}
                          disabled={leaveRequestsLoading}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 min-w-[100px] justify-center"
                        >
                          {leaveRequestsLoading ? <Loader size={16} className="animate-spin" /> : <Check size={16} />}
                          Approve
                        </button>
                        <button
                          onClick={() => handleReviewRequest(request.id, false)}
                          disabled={leaveRequestsLoading}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 min-w-[100px] justify-center"
                        >
                          {leaveRequestsLoading ? <Loader size={16} className="animate-spin" /> : <XIcon size={16} />}
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;