import React, { useState, useEffect } from 'react';
import { User, Calendar, DollarSign, TrendingUp, Award, Users, AlertCircle } from 'lucide-react';
import { userReviewApi } from '../Api/userReviewApi';
import leaderboardApi from '../Api/leaderboardApi';

const Dashboard = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiErrors, setApiErrors] = useState({
    review: false,
    leaderboard: false
  });

  // Mock data for sections that don't have APIs yet
  const attendanceData = {
    recorded: 2,
    categories: [
      { label: "Present", value: 20, color: "#10b981" },
      { label: "Late", value: 15, color: "#f59e0b" },
      { label: "Half Day", value: 10, color: "#fb923c" },
      { label: "Excused", value: 45, color: "#ef4444" },
      { label: "Unexcused", value: 5, color: "#dc2626" },
      { label: "No Status", value: 5, color: "#6b7280" }
    ],
    total: 100
  };

  const statistics = {
    week: "Week 11 - Week 16",
    reviews: 10,
    attendance: 52
  };

  // Fallback leaderboard data
  const fallbackLeaderboard = [
    { id: 1, name: "MOHAMMED RINSHAD", score: 330, rank: 1, color: "#fbbf24" },
    { id: 2, name: "Aflah km", score: 334, rank: 2, color: "#9ca3af" },
    { id: 3, name: "Sreehari Rajesh", score: 326, rank: 3, color: "#f97316" }
  ];

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        setApiErrors({ review: false, leaderboard: false });

        // Fetch review data first
        await fetchReviewData();

        // Fetch leaderboard data
        await fetchLeaderboardData();

      } catch (err) {
        console.error('Error in dashboard data fetch:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch review data
  const fetchReviewData = async () => {
    try {
      const reviewResponse = await userReviewApi.getMyReviews();
      
      if (reviewResponse.data && reviewResponse.data.length > 0) {
        setReviewData(reviewResponse.data[0]);
      } else {
        setReviewData({
          reviewStatus: "Not Assigned",
          reviewDate: "No review scheduled",
          pendingAmount: 0,
          feeCategory: "No fees",
          dueDate: "No due date",
          feeStatus: "No fees"
        });
      }
    } catch (reviewError) {
      console.error('Error fetching review data:', reviewError);
      setApiErrors(prev => ({ ...prev, review: true }));
      setReviewData({
        reviewStatus: "Not Assigned",
        reviewDate: "No review scheduled",
        pendingAmount: 0,
        feeCategory: "No fees",
        dueDate: "No due date",
        feeStatus: "No fees"
      });
    }
  };

  // Fetch leaderboard data
  const fetchLeaderboardData = async () => {
    try {
      console.log('Fetching leaderboard data...');
      const response = await leaderboardApi.getTopUsers(3); // Get top 3 users
      
      if (response && response.data && Array.isArray(response.data)) {
        console.log('Leaderboard data received:', response.data);
        
        const leaderboardData = response.data.map((user) => ({
          id: user.userId,
          name: user.fullName,
          score: user.totalScore || 0,
          rank: user.rank,
          userId: user.userId,
          profileImageUrl: user.profileImageUrl,
          color: getRankColor(user.rank)
        }));
        
        setLeaderboardData(leaderboardData);
      } else {
        throw new Error('Invalid leaderboard data format');
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setApiErrors(prev => ({ ...prev, leaderboard: true }));
      
      // Use fallback data
      setLeaderboardData(fallbackLeaderboard);
    }
  };

  // Helper function to get rank colors
  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return "#fbbf24"; // Gold
      case 2: return "#9ca3af"; // Silver
      case 3: return "#f97316"; // Bronze
      default: return "#3b82f6"; // Blue
    }
  };

  // Get user avatar - either profile image or initials
  const getUserAvatar = (leader) => {
    // Use profile image if available
    if (leader.profileImageUrl) {
      return (
        <img 
          src={leader.profileImageUrl} 
          alt={leader.name}
          className="w-12 h-12 rounded-full object-cover shadow-lg"
          onError={(e) => {
            // If image fails to load, fall back to initials
            e.target.style.display = 'none';
            const fallback = e.target.nextSibling;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
      );
    }

    // Fallback to initials
    const initials = leader.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <div 
        className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg"
        style={{ backgroundColor: leader.color }}
      >
        {initials}
      </div>
    );
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString || dateString === "No review scheduled") return dateString;
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Calculate pending fees data from API
  const getPendingFees = () => {
    if (!reviewData || !reviewData.pendingAmount || reviewData.pendingAmount === 0) {
      return [];
    }

    return [
      { 
        title: reviewData.feeCategory || "Fee Charge", 
        amount: reviewData.pendingAmount, 
        dueDate: formatDate(reviewData.dueDate) || "No due date",
        bgColor: "#ef4444"
      }
    ];
  };

  const pendingFees = getPendingFees();
  const totalBalance = pendingFees.reduce((sum, fee) => sum + fee.amount, 0);

  // Calculate donut segments for attendance
  const calculateDonutSegments = () => {
    let currentAngle = -90;
    return attendanceData.categories.map(cat => {
      const angle = (cat.value / attendanceData.total) * 360;
      const segment = {
        ...cat,
        startAngle: currentAngle,
        endAngle: currentAngle + angle
      };
      currentAngle += angle;
      return segment;
    });
  };

  const donutSegments = calculateDonutSegments();

  const DonutChart = () => (
    <div className="relative w-64 h-64 mx-auto">
      <svg viewBox="0 0 200 200" className="transform -rotate-90">
        {donutSegments.map((segment, index) => {
          const radius = 70;
          const innerRadius = 50;
          const startRad = (segment.startAngle * Math.PI) / 180;
          const endRad = (segment.endAngle * Math.PI) / 180;
          
          const x1 = 100 + radius * Math.cos(startRad);
          const y1 = 100 + radius * Math.sin(startRad);
          const x2 = 100 + radius * Math.cos(endRad);
          const y2 = 100 + radius * Math.sin(endRad);
          const x3 = 100 + innerRadius * Math.cos(endRad);
          const y3 = 100 + innerRadius * Math.sin(endRad);
          const x4 = 100 + innerRadius * Math.cos(startRad);
          const y4 = 100 + innerRadius * Math.sin(startRad);
          
          const largeArc = segment.endAngle - segment.startAngle > 180 ? 1 : 0;
          
          const path = `
            M ${x1} ${y1}
            A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
            L ${x3} ${y3}
            A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
            Z
          `;
          
          return (
            <path
              key={index}
              d={path}
              fill={segment.color}
              className="transition-all duration-300 hover:opacity-80"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-sm text-gray-500 font-medium">Data recorded:</div>
        <div className="text-3xl font-bold text-gray-800">{attendanceData.recorded}</div>
      </div>
    </div>
  );

  const StatisticsGauge = ({ percentage }) => {
    const radius = 60;
    const circumference = Math.PI * radius;
    const progress = (percentage / 100) * circumference;

    return (
      <div className="relative w-32 h-20 mx-auto">
        <svg viewBox="0 0 140 80" className="w-full h-full">
          <path
            d="M 10 70 A 60 60 0 0 1 130 70"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 10 70 A 60 60 0 0 1 130 70"
            fill="none"
            stroke="#f97316"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-2xl font-bold text-gray-800 mt-4">{percentage}%</div>
        </div>
      </div>
    );
  };

  // Error display component
  const ErrorAlert = ({ message, onRetry }) => (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
          <div className="text-yellow-700 text-sm">{message}</div>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-yellow-600 hover:text-yellow-800 text-sm font-medium ml-4"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Error Display */}
        {(error || Object.values(apiErrors).some(Boolean)) && (
          <div className="space-y-2">
            {error && <ErrorAlert message={error} />}
            {apiErrors.review && <ErrorAlert message="Review data loaded with fallback values" />}
            {apiErrors.leaderboard && (
              <ErrorAlert 
                message="Leaderboard data loaded with fallback values" 
                onRetry={fetchLeaderboardData} 
              />
            )}
          </div>
        )}

        {/* Top Row - Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reviewer Status */}
          <div 
            className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 transform hover:-translate-y-1"
            onMouseEnter={() => setHoveredCard('reviewer')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-gray-500 text-sm font-medium">Reviewer</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {reviewData?.reviewStatus || "Not Assigned"}
            </div>
          </div>

          {/* Next Review */}
          <div 
            className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 transform hover:-translate-y-1"
            onMouseEnter={() => setHoveredCard('review')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-gray-500 text-sm font-medium">Next Review</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {formatDate(reviewData?.reviewDate) || "No review scheduled"}
            </div>
          </div>
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Chart */}
          <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Attendance</h2>
              <p className="text-gray-500 text-sm mt-1">Last Seven Days</p>
            </div>
            
            <DonutChart />
            
            <div className="mt-8 space-y-3">
              {attendanceData.categories.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between group hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-sm text-gray-700 font-medium">{cat.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{cat.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold flex items-center">
                  LeaderBoard <Award className="ml-2 w-6 h-6 text-yellow-300" />
                </h2>
                {apiErrors.leaderboard && (
                  <span className="text-yellow-300 text-sm bg-yellow-900 bg-opacity-50 px-2 py-1 rounded">
                    Using Fallback Data
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {leaderboardData.map((leader, idx) => (
                  <div 
                    key={leader.id || idx}
                    className={`bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-5 transform transition-all duration-300 hover:scale-105 hover:bg-opacity-20 ${
                      leader.rank === 1 ? 'ring-2 ring-yellow-300' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          {getUserAvatar(leader)}
                          {/* Fallback initials - hidden by default, shown only if image fails */}
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg absolute top-0 left-0"
                            style={{ 
                              backgroundColor: leader.color,
                              display: 'none' // Hidden by default, shown via onError
                            }}
                          >
                            {leader.name
                              .split(' ')
                              .map(word => word[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                        </div>
                     <div>
  <div className="font-bold text-sm text-black">{leader.name}</div>

  <div className="flex items-center mt-1">
    <TrendingUp className="w-4 h-4 mr-1 text-purple-500" />

    <span className="text-sm text-gray-600 mr-2 font-medium">
      Latest Achieved Review Score:
    </span>

    <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
      {leader.score.toFixed(1)}
    </span>
  </div>
</div>

                      </div>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        leader.rank === 1 ? 'bg-yellow-400 text-yellow-900' : 
                        leader.rank === 2 ? 'bg-gray-300 text-gray-700' : 
                        'bg-orange-400 text-orange-900'
                      }`}>
                        {leader.rank}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Statistics */}
          <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Statistics</h2>
            <p className="text-gray-500 text-sm mb-1">{statistics.week}</p>
            <p className="text-gray-500 text-sm mb-8">No of Reviews {statistics.reviews}</p>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Attendance</div>
                <div className="text-xl font-bold text-gray-900">{statistics.attendance}%</div>
              </div>
            </div>

            <StatisticsGauge percentage={statistics.attendance} />
          </div>

          {/* Pending Fees */}
          <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Pending Fees</h2>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-red-400"></div>
                <div className="w-4 h-4 rounded bg-red-300"></div>
              </div>
            </div>
            
            <div className="mb-6 text-right">
              <div className="text-sm text-gray-500">Total Balance Amount</div>
              <div className="text-3xl font-bold text-gray-900">₹{totalBalance}</div>
            </div>

            {pendingFees.length > 0 ? (
              <div className="space-y-4">
                {pendingFees.map((fee, idx) => (
                  <div 
                    key={idx}
                    className="rounded-2xl p-5 text-white transform transition-all duration-300 hover:scale-105"
                    style={{ backgroundColor: fee.bgColor }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-lg">{fee.title}</div>
                      <div className="text-right">
                        <div className="text-sm opacity-90">Due Date: {fee.dueDate}</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm">Pending Amount: <span className="font-bold">₹{fee.amount}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No pending fees</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;