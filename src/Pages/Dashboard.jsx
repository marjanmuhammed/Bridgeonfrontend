import React, { useState } from 'react';
import { User, Calendar, DollarSign, TrendingUp, Award, Users } from 'lucide-react';

const Dashboard = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const reviewerData = {
    status: "Assigned",
    nextReview: "13 Oct 2025"
  };

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

  const leaderboard = [
    { name: "MOHAMMED RINSHAD", score: 330, rank: 2, avatar: "MR", color: "#3b82f6" },
    { name: "Aflah km", score: 334, rank: 1, avatar: "AK", color: "#8b5cf6" },
    { name: "Sreehari Rajesh", score: 326, rank: 3, avatar: "SR", color: "#10b981" }
  ];

  const statistics = {
    week: "Week 11 - Week 16",
    reviews: 10,
    attendance: 52
  };

  const pendingFees = [
    { 
      title: "Weekback Charge", 
      amount: 500, 
      dueDate: "13 Sep 2025",
      bgColor: "#ef4444"
    },
    { 
      title: "Training Facility Charge", 
      amount: 3500, 
      dueDate: "03 Oct 2025",
      fine: 200,
      bgColor: "#f87171"
    }
  ];

  const totalBalance = pendingFees.reduce((sum, fee) => sum + fee.amount + (fee.fine || 0), 0);

  // Calculate donut segments
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
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
            <div className="text-3xl font-bold text-gray-900 mt-2">{reviewerData.status}</div>
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
            <div className="text-3xl font-bold text-gray-900 mt-2">{reviewerData.nextReview}</div>
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
              </div>

              <div className="space-y-4">
                {leaderboard.map((leader, idx) => (
                  <div 
                    key={idx}
                    className={`bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-5 transform transition-all duration-300 hover:scale-105 hover:bg-opacity-20 ${
                      leader.rank === 1 ? 'ring-2 ring-yellow-300' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg"
                          style={{ backgroundColor: leader.color }}
                        >
                          {leader.avatar}
                        </div>
                        <div>
                          <div className="font-bold text-sm">{leader.name}</div>
                          <div className="flex items-center mt-1">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            <span className="text-xl font-bold">{leader.score}</span>
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
                    {fee.fine && (
                      <div className="text-sm font-semibold">Fine: ₹{fee.fine}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;