import React, { useState, useEffect } from "react";
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Loader, 
  AlertCircle, 
  User, 
  Calendar, 
  Clock, 
  Users,
  Eye,
  Download,
  RefreshCw,
  Info
} from "lucide-react";
import { leaveRequestApi } from "../MentorApi/MentorLeave";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HomePage from "../Auth/Home";

const MentorLeaveManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [mentees, setMentees] = useState([]);

  // Check user role and load data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        const userInfo = await leaveRequestApi.getUserInfo();
        
        console.log('🟡 User Info:', userInfo);
        
        if (userInfo && userInfo.hasAccess) {
          setUserRole(userInfo.role);
          setUserName(userInfo.userName || userInfo.fullName || 'Mentor');
          
          if (userInfo.role === 'Mentor') {
            // Load both mentees and mentor-specific pending requests
            await Promise.all([
              fetchMentees(),
              fetchMentorPendingRequests()
            ]);
          } else {
            setError('Access Denied. Only Mentors can view this page.');
          }
        } else {
          setError('Access Denied. Only Mentors can view this page.');
        }
      } catch (err) {
        console.error('❌ Error initializing data:', err);
        if (err.response?.status === 401) {
          setError('Please login to access this page.');
        } else {
          setError('Failed to load user information. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
  }, []);

  // Fetch mentor's mentees
  const fetchMentees = async () => {
    try {
      console.log('🟡 Fetching mentees...');
      const menteesData = await leaveRequestApi.getMyMentees();
      console.log('🟢 Mentees loaded:', menteesData);
      
      if (menteesData && Array.isArray(menteesData)) {
        setMentees(menteesData);
      } else {
        console.log('🟡 No mentees data or invalid format:', menteesData);
        setMentees([]);
        toast.info('No mentees assigned to you yet.');
      }
    } catch (err) {
      console.error('❌ Error fetching mentees:', err);
      toast.error('Failed to load mentees list');
    }
  };

  // ✅ UPDATED: Fetch mentor-specific pending leave requests
  const fetchMentorPendingRequests = async () => {
    try {
      setError(null);
      console.log('🟡 Fetching mentor-specific pending requests...');
      
      // Use the new dedicated endpoint
      const mentorRequests = await leaveRequestApi.getMentorPendingRequests();
      console.log('🟢 Mentor pending requests:', mentorRequests);
      
      if (!mentorRequests || mentorRequests.length === 0) {
        setRequests([]);
        toast.info('No pending leave requests from your mentees.');
        return;
      }
      
      setRequests(mentorRequests);
      toast.success(`Loaded ${mentorRequests.length} pending requests from your mentees`);
      
    } catch (err) {
      console.error('❌ Error fetching mentor pending requests:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load leave requests. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Refresh all data
  const handleRefresh = async () => {
    try {
      setLoading(true);
      toast.info('Refreshing data...');
      await Promise.all([
        fetchMentees(),
        fetchMentorPendingRequests()
      ]);
      toast.success('Data refreshed successfully!');
    } catch (err) {
      console.error('❌ Error refreshing data:', err);
      toast.error('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  // Handle approve/reject action
  const handleAction = async (requestId, approve) => {
    try {
      setActionLoading(requestId);
      setError(null);

      const reviewData = {
        requestId: requestId,
        approve: approve,
        notes: ''
      };

      console.log('🟡 Processing leave request:', reviewData);
      await leaveRequestApi.reviewRequest(reviewData);
      
      // Remove the processed request from the list
      setRequests(prev => prev.filter(req => req.id !== requestId));

      // Show success toast
      toast.success(`Leave request ${approve ? 'approved' : 'rejected'} successfully!`);
    } catch (err) {
      console.error('❌ Error processing leave request:', err);
      const errorMessage = err.response?.data?.message || 'Failed to process the request. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  // View request details
  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  // View reason
  const handleViewReason = (request) => {
    setSelectedRequest(request);
    setShowReasonModal(true);
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Format datetime for display
  const formatDateTime = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    const statusMap = {
      0: 'text-yellow-600 bg-yellow-50 border-yellow-200', // Pending
      1: 'text-green-600 bg-green-50 border-green-200',   // Approved
      2: 'text-red-600 bg-red-50 border-red-200',         // Rejected
      3: 'text-gray-600 bg-gray-50 border-gray-200'       // Cancelled
    };
    return statusMap[status] || 'text-yellow-600 bg-yellow-50 border-yellow-200';
  };

  // Get status text
  const getStatusText = (status) => {
    const statusMap = {
      0: 'Pending',
      1: 'Approved',
      2: 'Rejected',
      3: 'Cancelled'
    };
    return statusMap[status] || 'Pending';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const statusMap = {
      0: <Clock size={16} />,      // Pending
      1: <CheckCircle size={16} />, // Approved
      2: <XCircle size={16} />,     // Rejected
      3: <XCircle size={16} />      // Cancelled
    };
    return statusMap[status] || <Clock size={16} />;
  };

  // Get leave type color
  const getLeaveTypeColor = (type) => {
    const colors = {
      'Sick Leave': 'bg-red-100 text-red-800 border-red-200',
      'sick': 'bg-red-100 text-red-800 border-red-200',
      'Casual Leave': 'bg-blue-100 text-blue-800 border-blue-200',
      'Emergency Leave': 'bg-orange-100 text-orange-800 border-orange-200',
      'Vacation Leave': 'bg-green-100 text-green-800 border-green-200',
      'Personal Leave': 'bg-purple-100 text-purple-800 border-purple-200',
      'Other': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
        <div className="max-w-full mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 flex items-center justify-center">
            <div className="flex items-center gap-4">
              <Loader className="animate-spin text-purple-600" size={24} />
              <span className="text-gray-700">Loading mentor dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || userRole !== 'Mentor') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
        <div className="max-w-full mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
            <div className="text-red-500 text-lg mb-4">
              {error || 'Access Denied. Only Mentors can view this page.'}
            </div>
            <button 
              onClick={() => window.location.href = '/login'} 
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
      <div className="max-w-full mx-auto">

          <div className="bg-white shadow-sm border-b border-gray-200/60 sticky top-0 z-40">
                      <div className="max-w-7xl mx-auto">
                        <HomePage />
                      </div>
                    </div>
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="text-purple-600" size={32} />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Mentor Leave Management</h1>
                <p className="text-gray-600">
                  Review and manage leave requests from your mentees
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">{requests.length}</div>
                <div className="text-sm text-gray-600">Pending Requests</div>
              </div>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-all duration-300 border border-purple-200 shadow-sm hover:shadow-md disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-lg text-white shadow-lg">
              <div className="flex items-center gap-3">
                <Users className="text-white" size={24} />
                <div>
                  <div className="text-2xl font-bold">{mentees.length}</div>
                  <div className="text-purple-100">Total Mentees</div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-4 rounded-lg text-white shadow-lg">
              <div className="flex items-center gap-3">
                <Clock className="text-white" size={24} />
                <div>
                  <div className="text-2xl font-bold">{requests.length}</div>
                  <div className="text-yellow-100">Pending Reviews</div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-lg text-white shadow-lg">
              <div className="flex items-center gap-3">
                <User className="text-white" size={24} />
                <div>
                  <div className="text-lg font-bold">Mentor</div>
                  <div className="text-blue-100">{userName}</div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-lg text-white shadow-lg">
              <div className="flex items-center gap-3">
                <Calendar className="text-white" size={24} />
                <div>
                  <div className="text-lg font-bold">Today</div>
                  <div className="text-green-100">{new Date().toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Role Information */}
          <div className="p-4 rounded-lg border bg-purple-50 border-purple-300">
            <div className="flex items-center gap-2 mb-2">
              <Users className="text-purple-600" size={20} />
              <span className="font-bold text-purple-800">
                Mentor Access Level
              </span>
            </div>
            <p className="text-sm text-purple-700">
              You can review and manage leave requests from your {mentees.length} assigned mentees only.
              The system automatically filters requests to show only those from your mentees.
            </p>
          </div>

          {/* Mentees List */}
          {mentees.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                <Users size={18} />
                Your Mentees ({mentees.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {mentees.map((mentee, index) => (
                  <div key={mentee.id || mentee.userId || `mentee-${index}`} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-blue-100">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="text-white" size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate text-sm">
                        {mentee.fullName || mentee.name || mentee.userName || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {mentee.email || mentee.userEmail || 'No email'}
                      </div>
                      <div className="text-xs text-gray-400">
                        ID: {mentee.id || mentee.userId || 'N/A'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-300 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
            <div className="text-red-700 font-medium">{error}</div>
            <button 
              onClick={() => setError(null)} 
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <XCircle size={20} />
            </button>
          </div>
        )}

        {/* Leave Requests Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead className="bg-gradient-to-r from-purple-800 to-purple-900 text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-sm">Mentee Details</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Leave Date</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Leave Type</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Reason</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Status</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-500">
                        <CheckCircle size={48} className="text-green-500" />
                        <div>
                          <p className="text-lg font-medium">No Pending Requests</p>
                          <p className="text-sm">
                            {mentees.length === 0 
                              ? 'No mentees assigned to you yet' 
                              : 'No pending leave requests from your mentees'}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr 
                      key={request.id} 
                      className="hover:bg-gray-50 transition-all duration-200 group border-b border-gray-100"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center group-hover:from-purple-600 group-hover:to-purple-700 transition-all duration-300 shadow-md">
                            <User className="text-white" size={18} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-gray-900 truncate">{request.userName}</div>
                            <div className="text-sm text-gray-600 truncate">{request.userEmail}</div>
                            <div className="text-xs text-gray-400 font-medium">ID: {request.userId}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-purple-500 flex-shrink-0" />
                          <span className="font-bold text-gray-900 whitespace-nowrap">
                            {formatDate(request.date)}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border ${getLeaveTypeColor(request.leaveType)}`}>
                          {request.leaveType}
                        </span>
                      </td>
                      
                      <td className="px-4 py-3">
                        <div className="max-w-xs">
                          <div className="flex items-center gap-2">
                            <p className="text-gray-700 line-clamp-1 text-sm">
                              {request.reason && request.reason.length > 50 ? `${request.reason.substring(0, 50)}...` : request.reason}
                            </p>
                            {request.reason && request.reason.length > 50 && (
                              <button
                                onClick={() => handleViewReason(request)}
                                className="flex items-center gap-1 text-purple-600 hover:text-purple-700 transition-colors p-1 hover:bg-purple-50 rounded"
                                title="View full reason"
                              >
                                <Info size={14} />
                              </button>
                            )}
                          </div>
                          {request.proofImageUrl && request.proofImageUrl !== "" && request.proofImageUrl !== "string" && (
                            <button
                              onClick={() => handleViewDetails(request)}
                              className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 transition-colors mt-1 font-medium"
                            >
                              <Eye size={14} />
                              View Proof
                            </button>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          {getStatusText(request.status)}
                        </span>
                      </td>
                      
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(request.id, true)}
                            disabled={actionLoading === request.id || request.status !== 0}
                            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex-1 justify-center font-bold text-sm"
                          >
                            {actionLoading === request.id ? (
                              <Loader className="animate-spin" size={14} />
                            ) : (
                              <CheckCircle size={14} />
                            )}
                            Approve
                          </button>
                          
                          <button
                            onClick={() => handleAction(request.id, false)}
                            disabled={actionLoading === request.id || request.status !== 0}
                            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex-1 justify-center font-bold text-sm"
                          >
                            {actionLoading === request.id ? (
                              <Loader className="animate-spin" size={14} />
                            ) : (
                              <XCircle size={14} />
                            )}
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Instructions */}
        {requests.length > 0 && (
          <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4">
            <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
              <AlertCircle size={18} />
              Mentor Review Instructions
            </h3>
            <ul className="text-purple-700 list-disc list-inside space-y-2 text-sm">
              <li>Review each leave request carefully before making a decision</li>
              <li>Approved leaves will be automatically marked as "Excused" in attendance records</li>
              <li>Rejected leaves will remain as "Unexcused" absence</li>
              <li className="font-bold">You are only reviewing requests from your assigned mentees</li>
            </ul>
          </div>
        )}
      </div>

      {/* Request Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-purple-300">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Leave Request Details</h3>
              <button 
                onClick={() => setShowDetailModal(false)} 
                className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* User Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-bold text-purple-800 mb-3">Mentee Information</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-purple-600 font-medium">Name:</span>
                      <p className="font-bold text-gray-900">{selectedRequest.userName}</p>
                    </div>
                    <div>
                      <span className="text-sm text-purple-600 font-medium">Email:</span>
                      <p className="font-bold text-gray-900">{selectedRequest.userEmail}</p>
                    </div>
                    <div>
                      <span className="text-sm text-purple-600 font-medium">User ID:</span>
                      <p className="font-bold text-gray-900">{selectedRequest.userId}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <h4 className="font-bold text-green-800 mb-3">Leave Information</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-green-600 font-medium">Leave Date:</span>
                      <p className="font-bold text-gray-900">{formatDate(selectedRequest.date)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-green-600 font-medium">Leave Type:</span>
                      <p className="font-medium">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getLeaveTypeColor(selectedRequest.leaveType)}`}>
                          {selectedRequest.leaveType}
                        </span>
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-green-600 font-medium">Status:</span>
                      <p className="font-medium">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(selectedRequest.status)}`}>
                          {getStatusText(selectedRequest.status)}
                        </span>
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-green-600 font-medium">Requested On:</span>
                      <p className="font-bold text-gray-900">{formatDateTime(selectedRequest.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <h4 className="font-bold text-gray-700 mb-3">Reason for Leave</h4>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{selectedRequest.reason}</p>
                </div>
              </div>

              {/* Proof Document */}
              {selectedRequest.proofImageUrl && selectedRequest.proofImageUrl !== "" && selectedRequest.proofImageUrl !== "string" && (
                <div>
                  <h4 className="font-bold text-gray-700 mb-3">Proof Document</h4>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="text-purple-600" size={24} />
                        <div>
                          <p className="font-bold text-gray-800">Proof document attached</p>
                          <p className="text-sm text-gray-600">Click to view or download</p>
                        </div>
                      </div>
                      <a 
                        href={selectedRequest.proofImageUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg font-bold"
                      >
                        <Download size={16} />
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    handleAction(selectedRequest.id, true);
                    setShowDetailModal(false);
                  }}
                  disabled={actionLoading === selectedRequest.id || selectedRequest.status !== 0}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-bold"
                >
                  {actionLoading === selectedRequest.id ? (
                    <Loader className="animate-spin" size={18} />
                  ) : (
                    <CheckCircle size={18} />
                  )}
                  Approve Request
                </button>
                
                <button
                  onClick={() => {
                    handleAction(selectedRequest.id, false);
                    setShowDetailModal(false);
                  }}
                  disabled={actionLoading === selectedRequest.id || selectedRequest.status !== 0}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-bold"
                >
                  {actionLoading === selectedRequest.id ? (
                    <Loader className="animate-spin" size={18} />
                  ) : (
                    <XCircle size={18} />
                  )}
                  Reject Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reason Modal */}
      {showReasonModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl border border-purple-300">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Leave Reason</h3>
              <button 
                onClick={() => setShowReasonModal(false)} 
                className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <h4 className="font-bold text-purple-800 mb-2">From: {selectedRequest.userName}</h4>
                <p className="text-sm text-purple-600">Requested on: {formatDateTime(selectedRequest.createdAt)}</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {selectedRequest.reason}
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setShowReasonModal(false)}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorLeaveManagement;