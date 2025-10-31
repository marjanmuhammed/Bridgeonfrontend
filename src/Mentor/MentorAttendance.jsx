import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Filter, X, Plus, Edit2, Trash2, Search, Users, Download, User, Mail, Briefcase, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { mentorAttendanceApi } from '../MentorApi/MentorAttendance';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HomePage from '../Auth/Home';

const MentorAttendanceDashboard = () => {
  // State management
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState('all');
  const [editingRecord, setEditingRecord] = useState(null);
  const [mentees, setMentees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('attendance');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    userId: '',
    date: new Date().toISOString().split('T')[0],
    checkIn: '',
    checkOut: '',
    status: 'Unexcused'
  });

  // Status colors configuration
  const statusColors = {
    'Present': 'bg-green-500',
    'Late': 'bg-yellow-500',
    'Half Day': 'bg-orange-500',
    'Excused': 'bg-blue-500',
    'Unexcused': 'bg-pink-600',
  };

  const statusIcons = {
    'Present': CheckCircle,
    'Late': Clock,
    'Half Day': AlertCircle,
    'Excused': User,
    'Unexcused': AlertCircle,
  };

  const filterOptions = [
    { value: 'all', label: 'Show All' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'this-week', label: 'This Week' },
    { value: 'last-week', label: 'Last Week' },
    { value: 'this-month', label: 'This Month' },
    { value: 'last-month', label: 'Last Month' },
  ];

  // FIXED: Fetch mentees and attendance data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🟡 Starting data fetch...');
      
      // Fetch mentor's mentees FIRST
      const menteesResponse = await mentorAttendanceApi.getMyMentees();
      console.log('🟢 Mentees API Response:', menteesResponse);
      
      let menteesData = [];
      if (menteesResponse.status === 200) {
        menteesData = Array.isArray(menteesResponse.data) ? menteesResponse.data : [];
        setMentees(menteesData);
        console.log(`🟢 Set ${menteesData.length} mentees`);
      } else {
        throw new Error(menteesResponse.message || 'Failed to fetch mentees');
      }

      // Then fetch attendance records
      const attendanceResponse = await mentorAttendanceApi.getAllAttendances();
      console.log('🟢 Attendance API Response:', attendanceResponse);
      
      if (attendanceResponse.status === 200) {
        const allRecords = Array.isArray(attendanceResponse.data) ? attendanceResponse.data : [];
        
        // Filter records to only show mentor's mentees
        const menteeIds = menteesData.map(mentee => mentee.id);
        console.log('🟡 Mentee IDs for filtering:', menteeIds);
        
        const filteredRecords = allRecords.filter(record => 
          menteeIds.includes(record.userId)
        );
        
        console.log(`🟢 Filtered ${filteredRecords.length} attendance records out of ${allRecords.length} total`);
        setAttendanceRecords(filteredRecords);
      } else {
        throw new Error(attendanceResponse.message || 'Failed to fetch attendance records');
      }
      
    } catch (err) {
      console.error('🔴 Error fetching data:', err);
      setError(err.message || 'An unexpected error occurred');
      toast.error(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const stringToColor = (str) => {
    if (!str) return '#6b7280';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      '#d13438', '#ca5010', '#fce100', '#0b6a0b', '#00ad56',
      '#00b7c3', '#0078d4', '#5c2e91', '#881798', '#e3008c', '#69797e'
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  const getUserInitials = (fullName) => {
    if (!fullName) return 'U';
    return fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserAvatar = (user) => {
    if (user?.profileImageUrl) {
      return (
        <div className="relative">
          <img 
            src={user.profileImageUrl} 
            alt={user.fullName}
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 shadow-sm"
            onError={(e) => {
              e.target.style.display = 'none';
              const fallback = e.target.nextSibling;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-md border-2 border-white absolute top-0 left-0"
            style={{ 
              display: 'none',
              backgroundColor: stringToColor(user.fullName)
            }}
          >
            {getUserInitials(user.fullName)}
          </div>
        </div>
      );
    }
    
    return (
      <div 
        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-md border-2 border-white"
        style={{ backgroundColor: stringToColor(user?.fullName) }}
      >
        {getUserInitials(user?.fullName)}
      </div>
    );
  };

  const getUserInfo = (userId) => {
    return mentees.find(u => u.id === userId);
  };

  const formatTimeForDisplay = (timeString) => {
    if (!timeString) return null;
    try {
      let time;
      if (typeof timeString === 'string') {
        if (timeString.includes('T')) {
          time = new Date(timeString);
        } else {
          const [hours, minutes, seconds] = timeString.split(':');
          time = new Date();
          time.setHours(parseInt(hours), parseInt(minutes || 0), parseInt(seconds || 0), 0);
        }
      } else {
        return 'Invalid Time';
      }
      
      return time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting time:', error, timeString);
      return timeString;
    }
  };

  const formatDisplayDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Filter mentees based on search and department
  const filteredMentees = useMemo(() => {
    return mentees.filter(mentee => {
      const matchesSearch = 
        mentee.fullName?.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
        mentee.email?.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
        mentee.role?.toLowerCase().includes(employeeSearchTerm.toLowerCase());
      
      const matchesDept = selectedDepartment === 'all' || mentee.department === selectedDepartment;
      
      return matchesSearch && matchesDept;
    });
  }, [mentees, employeeSearchTerm, selectedDepartment]);

  // Get unique departments for filter
  const departments = useMemo(() => {
    const depts = [...new Set(mentees.map(mentee => mentee.department).filter(Boolean))];
    return depts;
  }, [mentees]);

  // Mentee Details Section Component
  const MenteeDetailsSection = () => (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            My Mentees Directory
          </h2>
          <p className="text-gray-600 mt-1">Manage and view all your mentee details</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users size={18} />
          <span>{filteredMentees.length} of {mentees.length} Mentees</span>
        </div>
      </div>

      {/* Mentee Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search mentees by name, email, or role..."
              value={employeeSearchTerm}
              onChange={(e) => setEmployeeSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>
        
        {departments.length > 0 && (
          <div className="md:w-64">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Mentee Grid */}
      {filteredMentees.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Users size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg">No mentees found</p>
          <p className="text-sm">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMentees.map((mentee) => (
            <div
              key={mentee.id}
              className="group bg-gradient-to-br from-gray-50 to-white hover:from-white hover:to-purple-50 transition-all duration-300 shadow-sm hover:shadow-lg p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-3">
                {getUserAvatar(mentee)}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 truncate group-hover:text-purple-700 transition-colors">
                    {mentee.fullName}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">{mentee.role}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={14} className="text-gray-400" />
                  <span className="truncate">{mentee.email}</span>
                </div>
                
                {mentee.department && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Briefcase size={14} className="text-gray-400" />
                    <span>{mentee.department}</span>
                  </div>
                )}
                
                {mentee.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User size={14} className="text-gray-400" />
                    <span>{mentee.phone}</span>
                  </div>
                )}
              </div>
              
              {/* Status Indicator */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Status:</span>
                  <span className={`px-2 py-1 rounded-full ${
                    mentee.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {mentee.status || 'Active'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Group attendance records by user to show multiple records per user
  const userAttendanceMap = useMemo(() => {
    const map = new Map();
    
    attendanceRecords.forEach(record => {
      if (!map.has(record.userId)) {
        map.set(record.userId, []);
      }
      map.get(record.userId).push(record);
    });
    
    return map;
  }, [attendanceRecords]);

  // Flatten all attendance records for table display
  const allAttendanceRecords = useMemo(() => {
    const records = [];
    userAttendanceMap.forEach((userRecords, userId) => {
      records.push(...userRecords);
    });
    return records.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [userAttendanceMap]);

  // Filter attendance records
  const filteredRecords = useMemo(() => {
    const now = new Date();
    let filtered = [...allAttendanceRecords];
    
    // Apply date filters
    switch (selectedFilter) {
      case 'today':
        const todayStr = now.toISOString().split('T')[0];
        filtered = filtered.filter(record => {
          try {
            if (!record.date) return false;
            const recordDate = new Date(record.date).toISOString().split('T')[0];
            return recordDate === todayStr;
          } catch {
            return false;
          }
        });
        break;
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        filtered = filtered.filter(record => {
          try {
            if (!record.date) return false;
            const recordDate = new Date(record.date).toISOString().split('T')[0];
            return recordDate === yesterdayStr;
          } catch {
            return false;
          }
        });
        break;
      case 'this-week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const endOfWeek = new Date(now);
        endOfWeek.setDate(now.getDate() + (6 - now.getDay()));
        
        filtered = filtered.filter(record => {
          try {
            if (!record.date) return false;
            const recordDate = new Date(record.date);
            return recordDate >= startOfWeek && recordDate <= endOfWeek;
          } catch {
            return false;
          }
        });
        break;
      default:
        break;
    }

    if (selectedUser !== 'all') {
      filtered = filtered.filter(record => record.userId.toString() === selectedUser);
    }

    if (searchTerm) {
      filtered = filtered.filter(record => {
        const user = getUserInfo(record.userId);
        return user && (
          user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    return filtered;
  }, [allAttendanceRecords, selectedFilter, selectedUser, searchTerm]);

  // Statistics calculation
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = attendanceRecords.filter(r => {
      try {
        const recordDate = new Date(r.date).toISOString().split('T')[0];
        return recordDate === today;
      } catch (error) {
        return false;
      }
    });
    
    return {
      totalMentees: mentees.length,
      present: todayRecords.filter(r => mentorAttendanceApi.mapStatusToFrontend(r.status) === 'Present').length,
      late: todayRecords.filter(r => mentorAttendanceApi.mapStatusToFrontend(r.status) === 'Late').length,
      unexcused: todayRecords.filter(r => mentorAttendanceApi.mapStatusToFrontend(r.status) === 'Unexcused').length,
    };
  }, [attendanceRecords, mentees]);

  // FIXED: Attendance handlers with better error handling
  const handleAddAttendance = async () => {
    if (!formData.userId || !formData.date) {
      toast.error('Please select a mentee and date');
      return;
    }

    try {
      const attendanceData = {
        userId: formData.userId,
        date: formData.date,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        status: formData.status
      };

      console.log('🟡 Creating attendance for mentee:', attendanceData);
      
      await mentorAttendanceApi.createAttendance(attendanceData);
      await fetchData();
      setShowAddModal(false);
      resetForm();
      setError(null);
      toast.success('Attendance record added successfully!');
      
    } catch (err) {
      console.error('🔴 Error adding attendance:', err);
      const errorMessage = err.message || 'Failed to add attendance record';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleEditAttendance = async () => {
    if (!editingRecord) {
      toast.error("No attendance record selected for editing");
      return;
    }

    try {
      console.log("🟡 Starting attendance update...");
      
      const updateData = {
        userId: parseInt(formData.userId),
        date: editingRecord.date,
        checkInTime: formData.checkIn || "00:00:00",
        checkOutTime: formData.checkOut || "00:00:00",
        status: formData.status
      };

      console.log("🟡 Update data:", updateData);

      await mentorAttendanceApi.updateAttendance(updateData);
      await fetchData();
      setShowEditModal(false);
      setEditingRecord(null);
      resetForm();
      
      console.log("🟢 Attendance update completed successfully");
      toast.success('Attendance record updated successfully!');
      
    } catch (error) {
      console.error("🔴 Error in handleEditAttendance:", error);
      const errorMessage = error.message || 'Failed to update attendance record';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleDeleteAttendance = async (attendance) => {
    if (!window.confirm('Are you sure you want to delete this attendance record?')) {
      return;
    }

    try {
      console.log('🟡 Deleting attendance:', attendance);
      await mentorAttendanceApi.deleteAttendance(attendance.userId, attendance.date);
      await fetchData();
      toast.success('Attendance record deleted successfully!');
    } catch (error) {
      console.error('🔴 Error deleting attendance:', error);
      toast.error(error.message || 'Failed to delete attendance record');
    }
  };

  const openEditModal = async (record) => {
    try {
      setEditingRecord(record);
      
      const recordDate = new Date(record.date);
      const formattedDate = recordDate.toISOString().split('T')[0];
      
      console.log('Editing record date:', {
        original: record.date,
        parsed: recordDate,
        formatted: formattedDate
      });
      
      setFormData({
        userId: record.userId.toString(),
        date: formattedDate,
        checkIn: formatTimeForInput(record.checkInTime),
        checkOut: record.checkOutTime ? formatTimeForInput(record.checkOutTime) : '',
        status: mentorAttendanceApi.mapStatusToFrontend(record.status)
      });
      
      setShowEditModal(true);
    } catch (error) {
      setError('Error loading attendance record for editing');
      console.error('Error opening edit modal:', error);
    }
  };

  const formatTimeForInput = (timeString) => {
    if (!timeString) return '';
    
    try {
      let time;
      if (typeof timeString === 'string') {
        if (timeString.includes('T')) {
          time = new Date(timeString);
        } else {
          const [hours, minutes] = timeString.split(':');
          time = new Date();
          time.setHours(parseInt(hours), parseInt(minutes || 0), 0, 0);
        }
      } else {
        return '';
      }
      
      return time.toTimeString().slice(0, 5);
    } catch (error) {
      console.error('Error formatting time for input:', error, timeString);
      return '';
    }
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      date: new Date().toISOString().split('T')[0],
      checkIn: '',
      checkOut: '',
      status: 'Unexcused'
    });
  };

  // FIXED: Add retry mechanism for failed fetches
  const retryFetch = () => {
    setError(null);
    fetchData();
  };

  // Render table row for attendance records
  const renderMenteeTableRow = (record, idx) => {
    const user = getUserInfo(record.userId);
    
    const displayStatus = mentorAttendanceApi.mapStatusToFrontend(record.status);
    console.log(`Record ${record.id}: backend status ${record.status} -> frontend: ${displayStatus}`);
    
    const StatusIcon = statusIcons[displayStatus] || User;
    
    return (
      <tr key={record.id} className={idx % 2 === 0 ? 'bg-gray-50 hover:bg-gray-100' : 'bg-white hover:bg-gray-100 transition-colors duration-200'}>
        <td className="px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={user?.profileImageUrl} 
                alt={user?.fullName}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallback = e.target.nextSibling;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md border-2 border-white absolute top-0 left-0"
                style={{ 
                  display: 'none',
                  backgroundColor: stringToColor(user?.fullName)
                }}
              >
                {getUserInitials(user?.fullName)}
              </div>
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-gray-900 truncate">
                {user?.fullName || 'Unknown Mentee'}
              </div>
              <div className="text-sm text-gray-600 truncate flex items-center gap-1">
                <Mail size={12} />
                {user?.email || 'No email'}
              </div>
              <div className="text-xs text-gray-500 font-medium mt-1 flex items-center gap-1">
                <Briefcase size={12} />
                {user?.role || 'No role'}
                {user?.department && ` • ${user.department}`}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 text-gray-800 font-medium whitespace-nowrap">
          {record.date ? formatDisplayDate(record.date) : 'No date'}
        </td>
        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
          {record.checkInTime ? formatTimeForDisplay(record.checkInTime) : 
            <span className="text-gray-400 italic">Not checked in</span>}
        </td>
        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
          {record.checkOutTime ? formatTimeForDisplay(record.checkOutTime) : 
            <span className="text-gray-400 italic">Not checked out</span>}
        </td>
        <td className="px-6 py-4">
          <span className={`px-3 py-2 rounded-full text-white text-sm font-semibold inline-block min-w-[100px] text-center shadow-sm flex items-center justify-center gap-1 ${
            statusColors[displayStatus] || 'bg-gray-500'
          }`}>
            <StatusIcon size={14} />
            {displayStatus}
          </span>
        </td>
        <td className="px-6 py-4">
          <div className="flex gap-2">
            <button
              onClick={() => openEditModal(record)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 border border-blue-200 hover:border-blue-300"
              title="Edit"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={() => handleDeleteAttendance(record)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 border border-red-200 hover:border-red-300"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading mentee attendance data...</p>
        </div>
      </div>
    );
  }

  return (

    
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6">
        
      <div className="max-w-7xl mx-auto">
      
        {/* FIXED: Enhanced Error Message with retry option */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-semibold">Error: </span>
                <span>{error}</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={retryFetch}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                >
                  Retry
                </button>
                <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

            <div className="bg-white shadow-sm border-b border-gray-200/60 sticky top-0 z-40">
              <div className="max-w-7xl mx-auto">
                <HomePage />
              </div>
            </div>

        {/* Header with Section Toggle */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Mentor Attendance Dashboard
              </h1>
              <p className="text-gray-600">Manage and track your mentee attendance</p>
            </div>
            <div className="flex gap-3">
              {/* Section Toggle Buttons */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveSection('attendance')}
                  className={`px-4 py-2 rounded-md transition-all duration-300 ${
                    activeSection === 'attendance'
                      ? 'bg-white shadow-sm text-purple-600 font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Attendance
                </button>
                <button
                  onClick={() => setActiveSection('mentees')}
                  className={`px-4 py-2 rounded-md transition-all duration-300 ${
                    activeSection === 'mentees'
                      ? 'bg-white shadow-sm text-purple-600 font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  My Mentees
                </button>
              </div>
              
              <button
                onClick={() => setShowFilterModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-all duration-300 border border-purple-200 shadow-sm hover:shadow-md"
              >
                <Filter size={20} />
                <span>Filter</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <Plus size={20} />
                <span>Add Attendance</span>
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Mentees */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Users size={24} />
                <span className="text-3xl font-bold">{stats.totalMentees}</span>
              </div>
              <p className="text-blue-100">Total Mentees</p>
            </div>

            {/* Present */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle size={24} />
                <span className="text-3xl font-bold">{stats.present}</span>
              </div>
              <p className="text-green-100">Present Today</p>
            </div>

            {/* Late */}
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Clock size={24} />
                <span className="text-3xl font-bold">{stats.late}</span>
              </div>
              <p className="text-yellow-100">Late Arrivals</p>
            </div>

            {/* Unexcused */}
            <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle size={24} />
                <span className="text-3xl font-bold">{stats.unexcused}</span>
              </div>
              <p className="text-pink-100">Unexcused Absences</p>
            </div>
          </div>
        </div>

        {/* Conditional Rendering based on Active Section */}
        {activeSection === 'mentees' ? (
          <MenteeDetailsSection />
        ) : (
          <>
            {/* Filters and Search */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search mentees by name, email, or role..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="md:w-64">
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="all">All Mentees</option>
                    {mentees.map(mentee => (
                      <option key={mentee.id} value={mentee.id}>
                        {mentee.fullName} ({mentee.role})
                      </option>
                    ))}
                  </select>
                </div>

                <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg">
                  <Download size={20} />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-medium">Mentee Details</th>
                      <th className="px-6 py-4 text-left font-medium">Date</th>
                      <th className="px-6 py-4 text-left font-medium">Check In</th>
                      <th className="px-6 py-4 text-left font-medium">Check Out</th>
                      <th className="px-6 py-4 text-left font-medium">Status</th>
                      <th className="px-6 py-4 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                          <Users size={48} className="mx-auto mb-4 text-gray-300" />
                          <p className="text-lg">No attendance records found</p>
                          <p className="text-sm">Try adjusting your filters or add new attendance records</p>
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((record, idx) => renderMenteeTableRow(record, idx))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
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
                    setShowFilterModal(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 ${
                    selectedFilter === option.value
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md'
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

      {/* Add Attendance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[500px] max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Add Attendance Record</h3>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="text-gray-500 hover:text-gray-700 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mentee *</label>
                <select
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="">Select mentee</option>
                  {mentees.map(mentee => (
                    <option key={mentee.id} value={mentee.id}>
                      {mentee.fullName} - {mentee.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Check In</label>
                  <input
                    type="time"
                    value={formData.checkIn}
                    onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Check Out</label>
                  <input
                    type="time"
                    value={formData.checkOut}
                    onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Excused">Excused</option>
                  <option value="Unexcused">Unexcused</option>
                </select>
              </div>

              <button
                onClick={handleAddAttendance}
                disabled={!formData.userId || !formData.date}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Add Attendance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Attendance Modal */}
      {showEditModal && editingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[500px] max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Edit Attendance Record</h3>
              <button onClick={() => { setShowEditModal(false); setEditingRecord(null); resetForm(); }} className="text-gray-500 hover:text-gray-700 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mentee</label>
                <input
                  type="text"
                  value={getUserInfo(parseInt(formData.userId))?.fullName || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="text"
                  value={editingRecord.date ? formatDisplayDate(editingRecord.date) : 'No date'}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Date cannot be changed for existing records</p>
                <input type="hidden" value={formData.date} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Check In</label>
                  <input
                    type="time"
                    value={formData.checkIn}
                    onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Check Out</label>
                  <input
                    type="time"
                    value={formData.checkOut}
                    onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Excused">Excused</option>
                  <option value="Unexcused">Unexcused</option>
                </select>
              </div>

              <button
                onClick={handleEditAttendance}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Update Attendance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorAttendanceDashboard;