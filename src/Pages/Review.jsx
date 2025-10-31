import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, Typography, Box, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Grid, LinearProgress,
  Chip, Avatar, useTheme
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, LabelList
} from 'recharts';
import {
  TrendingUp,
  School,
  Assignment,
  Reviews,
  EmojiEvents,
  Analytics,
  Timeline
} from '@mui/icons-material';
import reviewScoreApi from '../Api/reviewScoreApi';
import { getCurrentUser } from '../Api/AuthApi';

const PerformanceBarChart = ({ reviewScores }) => {
  const theme = useTheme();

  // Calculate average scores for each category (out of 10)
  const getAverageScore = (scores, key) => {
    if (!scores || scores.length === 0) return 0;
    const total = scores.reduce((acc, s) => acc + (s[key] || 0), 0);
    return parseFloat((total / scores.length).toFixed(1));
  };

  // Calculate overall averages
  const academicAvg = getAverageScore(reviewScores, 'academicScore');
  const reviewAvg = getAverageScore(reviewScores, 'reviewScoreValue');
  const taskAvg = getAverageScore(reviewScores, 'taskScore');
  const totalAvg = parseFloat((academicAvg + reviewAvg + taskAvg).toFixed(1));

  // Get color based on score (adjusted for 30-point scale)
  const getScoreColor = (score, isTotal = false) => {
    if (isTotal) {
      if (score >= 24) return '#4CAF50'; // Green - Excellent
      if (score >= 21) return '#FF9800'; // Orange - Good
      if (score >= 18) return '#FFEB3B'; // Yellow - Average
      return '#F44336'; // Red - Weekback
    } else {
      if (score >= 8) return '#4CAF50'; // Green - Excellent
      if (score >= 7) return '#FF9800'; // Orange - Good
      if (score >= 6) return '#FFEB3B'; // Yellow - Average
      return '#F44336'; // Red - Weekback
    }
  };

  // Get performance status (adjusted for 30-point scale)
  const getPerformanceStatus = (score, isTotal = false) => {
    if (isTotal) {
      if (score >= 24) return 'Excellent';
      if (score >= 21) return 'Good';
      if (score >= 18) return 'Average';
      return 'Weekback';
    } else {
      if (score >= 8) return 'Excellent';
      if (score >= 7) return 'Good';
      if (score >= 6) return 'Average';
      return 'Weekback';
    }
  };

  // Prepare data for summary cards
  const summaryData = [
    {
      category: 'Academic',
      score: academicAvg,
      maxScore: 10,
      icon: <School />,
      color: getScoreColor(academicAvg),
      status: getPerformanceStatus(academicAvg)
    },
    {
      category: 'Review',
      score: reviewAvg,
      maxScore: 10,
      icon: <Reviews />,
      color: getScoreColor(reviewAvg),
      status: getPerformanceStatus(reviewAvg)
    },
    {
      category: 'Task',
      score: taskAvg,
      maxScore: 10,
      icon: <Assignment />,
      color: getScoreColor(taskAvg),
      status: getPerformanceStatus(taskAvg)
    },
    {
      category: 'Total',
      score: totalAvg,
      maxScore: 30,
      icon: <EmojiEvents />,
      color: getScoreColor(totalAvg, true),
      status: getPerformanceStatus(totalAvg, true)
    }
  ];

  // Weekly performance data
  const weeklyData = reviewScores.reduce((acc, score) => {
    const weekKey = `Week ${score.week}`;
    const existingWeek = acc.find(item => item.week === weekKey);
    
    if (!existingWeek) {
      const weekTotalScore = score.academicScore + score.reviewScoreValue + score.taskScore;
      acc.push({
        week: weekKey,
        weekNum: score.week,
        academicScore: score.academicScore,
        reviewScore: score.reviewScoreValue,
        taskScore: score.taskScore,
        totalScore: weekTotalScore,
        color: getScoreColor(weekTotalScore, true),
        status: getPerformanceStatus(weekTotalScore, true)
      });
    }
    return acc;
  }, []).sort((a, b) => a.weekNum - b.weekNum);

  // Custom tooltip for bar chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const weeklyItem = weeklyData.find(item => item.week === label);
      const score = payload[0].value;
      
      return (
        <Box sx={{ 
          bgcolor: 'background.paper', 
          p: 2, 
          border: 1, 
          borderColor: 'divider',
          borderRadius: 2,
          boxShadow: 3
        }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            {label}
          </Typography>
          <Typography variant="body2" sx={{ color: payload[0].color, fontWeight: 'bold' }}>
            Total Score: {score}/30
          </Typography>
          <Typography variant="body2">
            Status: {getPerformanceStatus(score, true)}
          </Typography>
          {weeklyItem && (
            <Box sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="caption" display="block">
                Academic: {weeklyItem.academicScore}/10
              </Typography>
              <Typography variant="caption" display="block">
                Review: {weeklyItem.reviewScore}/10
              </Typography>
              <Typography variant="caption" display="block">
                Task: {weeklyItem.taskScore}/10
              </Typography>
            </Box>
          )}
        </Box>
      );
    }
    return null;
  };

  return (
    <Grid container spacing={3}>
      {/* Performance Summary Cards - Top Section */}
      <Grid item xs={12}>
        <Card sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <CardContent sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  Performance Dashboard
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Overall Score: {totalAvg}/30 • {getPerformanceStatus(totalAvg, true)}
                </Typography>
              </Box>
              <TrendingUp sx={{ fontSize: 60, opacity: 0.2 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Summary Cards */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          {summaryData.map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.category}>
              <Card sx={{ 
                height: '100%',
                borderLeft: `4px solid ${item.color}`,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: `${item.color}20`, color: item.color, mr: 2 }}>
                      {item.icon}
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      {item.category}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center', py: 1 }}>
                    <Typography variant="h3" fontWeight="bold" sx={{ color: item.color }}>
                      {item.score}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      out of {item.maxScore}
                    </Typography>
                  </Box>
                  <Chip 
                    label={item.status}
                    size="small"
                    sx={{ 
                      bgcolor: `${item.color}20`, 
                      color: item.color,
                      fontWeight: 'bold',
                      width: '100%'
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>

      {/* Weekly Performance Chart */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Timeline sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h5" fontWeight="bold">
                Weekly Performance Trend
              </Typography>
            </Box>
            <Box sx={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <BarChart 
                  data={weeklyData} 
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  barSize={60}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.grey[200]} />
                  <XAxis dataKey="week" />
                  <YAxis domain={[0, 30]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="totalScore" 
                    name="Total Score (out of 30)" 
                    radius={[6, 6, 0, 0]}
                  >
                    {weeklyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    <LabelList 
                      dataKey="totalScore" 
                      position="top" 
                      style={{ fontWeight: 'bold', fontSize: '14px' }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Detailed Progress Analysis */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Analytics sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h5" fontWeight="bold">
                Detailed Performance Analysis
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {summaryData.map((item) => (
                <Grid item xs={12} md={6} key={item.category}>
                  <Box sx={{ mb: 3, p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" fontWeight="medium">
                        {item.category}
                      </Typography>
                      <Chip 
                        label={item.status}
                        size="small"
                        sx={{ 
                          bgcolor: `${item.color}20`, 
                          color: item.color,
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Progress
                      </Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ color: item.color }}>
                        {item.score}/{item.maxScore}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(item.score / item.maxScore) * 100}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: theme.palette.grey[200],
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: item.color,
                          borderRadius: 5
                        }
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        0
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.maxScore}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Performance Legend */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Performance Rating System
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary">
                  Individual Categories (out of 10)
                </Typography>
                <Grid container spacing={1}>
                  {[
                    { range: '8-10', label: 'Excellent', color: '#4CAF50' },
                    { range: '7-7.9', label: 'Good', color: '#FF9800' },
                    { range: '6-6.9', label: 'Average', color: '#FFEB3B' },
                    { range: '0-5.9', label: 'Weekback', color: '#F44336' },
                  ].map((item, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5, bgcolor: `${item.color}15`, borderRadius: 2 }}>
                        <Box sx={{ width: 12, height: 12, bgcolor: item.color, mr: 2, borderRadius: 1 }} />
                        <Box>
                          <Typography variant="body2" fontWeight="bold">{item.label}</Typography>
                          <Typography variant="caption" color="text.secondary">{item.range}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary">
                  Total Score (out of 30)
                </Typography>
                <Grid container spacing={1}>
                  {[
                    { range: '24-30', label: 'Excellent', color: '#4CAF50' },
                    { range: '21-23.9', label: 'Good', color: '#FF9800' },
                    { range: '18-20.9', label: 'Average', color: '#FFEB3B' },
                    { range: '0-17.9', label: 'Weekback', color: '#F44336' },
                  ].map((item, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5, bgcolor: `${item.color}15`, borderRadius: 2 }}>
                        <Box sx={{ width: 12, height: 12, bgcolor: item.color, mr: 2, borderRadius: 1 }} />
                        <Box>
                          <Typography variant="body2" fontWeight="bold">{item.label}</Typography>
                          <Typography variant="caption" color="text.secondary">{item.range}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

const Review = () => {
  const [reviewScores, setReviewScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      const userId = user?.userId ?? user?.id;

      if (!userId) {
        console.error('❌ No userId found in user data:', user);
        return;
      }

      const scores = await reviewScoreApi.getReviewScoresByUserId(userId);
      setReviewScores(scores);
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading review scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAverageScore = (scores, key) => {
    if (!scores || scores.length === 0) return 0;
    const total = scores.reduce((acc, s) => acc + (s[key] || 0), 0);
    return (total / scores.length).toFixed(1);
  };

  const getWeeklyProgress = (weekScores) => {
    const academicAvg = getAverageScore(weekScores, 'academicScore');
    const reviewAvg = getAverageScore(weekScores, 'reviewScoreValue');
    const taskAvg = getAverageScore(weekScores, 'taskScore');
    const totalAvg = (
      parseFloat(academicAvg) + parseFloat(reviewAvg) + parseFloat(taskAvg)
    ).toFixed(1);
    return { academicAvg, reviewAvg, taskAvg, totalAvg };
  };

  const weeklyAverages = reviewScores.reduce((acc, score) => {
    if (!acc[score.week]) acc[score.week] = [];
    acc[score.week].push(score);
    return acc;
  }, {});

  if (loading) {
    return (
      <Box sx={{ width: '100%', p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh' }}>
      <Typography 
        variant="h3" 
        gutterBottom 
        fontWeight="bold" 
        sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 4
        }}
      >
        My Performance Review
      </Typography>

      {reviewScores.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No Review Scores Available
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Your performance data will appear here once reviews are completed.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {/* Main Performance Dashboard */}
          <Grid item xs={12}>
            <PerformanceBarChart reviewScores={reviewScores} />
          </Grid>

          {/* Weekly Breakdown Section */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Weekly Performance Breakdown
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(weeklyAverages).map(([week, scores]) => {
                    const { academicAvg, reviewAvg, taskAvg, totalAvg } = getWeeklyProgress(scores);
                    const totalColor = totalAvg >= 21 ? '#4CAF50' : totalAvg >= 18 ? '#FF9800' : totalAvg >= 12 ? '#FFEB3B' : '#F44336';
                    
                    return (
                      <Grid item xs={12} md={6} key={week}>
                        <Card 
                          variant="outlined" 
                          sx={{ 
                            borderLeft: `4px solid ${totalColor}`,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: 2
                            }
                          }}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                              <Typography variant="h6" fontWeight="bold">
                                Week {week}
                              </Typography>
                              <Chip 
                                label={`${totalAvg}/30`} 
                                size="small" 
                                sx={{ 
                                  bgcolor: `${totalColor}20`, 
                                  color: totalColor,
                                  fontWeight: 'bold'
                                }} 
                              />
                            </Box>
                            
                            {/* Academic Progress */}
                            <Box sx={{ mb: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                  <School sx={{ fontSize: 16, mr: 0.5 }} />
                                  Academic
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {academicAvg}/10
                                </Typography>
                              </Box>
                              <LinearProgress 
                                variant="determinate" 
                                value={academicAvg * 10} 
                                sx={{ 
                                  height: 8, 
                                  borderRadius: 4,
                                  bgcolor: theme.palette.grey[200],
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: theme.palette.primary.main,
                                    borderRadius: 4
                                  }
                                }} 
                              />
                            </Box>

                            {/* Review Progress */}
                            <Box sx={{ mb: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Reviews sx={{ fontSize: 16, mr: 0.5 }} />
                                  Review
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {reviewAvg}/10
                                </Typography>
                              </Box>
                              <LinearProgress 
                                variant="determinate" 
                                value={reviewAvg * 10} 
                                sx={{ 
                                  height: 8, 
                                  borderRadius: 4,
                                  bgcolor: theme.palette.grey[200],
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: theme.palette.secondary.main,
                                    borderRadius: 4
                                  }
                                }} 
                              />
                            </Box>

                            {/* Task Progress */}
                            <Box sx={{ mb: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Assignment sx={{ fontSize: 16, mr: 0.5 }} />
                                  Task
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {taskAvg}/10
                                </Typography>
                              </Box>
                              <LinearProgress 
                                variant="determinate" 
                                value={taskAvg * 10} 
                                sx={{ 
                                  height: 8, 
                                  borderRadius: 4,
                                  bgcolor: theme.palette.grey[200],
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: theme.palette.success.main,
                                    borderRadius: 4
                                  }
                                }} 
                              />
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Detailed Scores Table */}
          <Grid item xs={12}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
            }}>
              <CardContent>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Detailed Performance Records
                </Typography>
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead sx={{ bgcolor: theme.palette.primary.main }}>
                      <TableRow>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Week</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Review Date</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Reviewer</TableCell>
                        <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Academic</TableCell>
                        <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Review</TableCell>
                        <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Task</TableCell>
                        <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Total Score</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reviewScores.map((score) => {
                        const totalScore = score.academicScore + score.reviewScoreValue + score.taskScore;
                        const totalColor = totalScore >= 24 ? '#4CAF50' : totalScore >= 21 ? '#FF9800' : totalScore >= 18 ? '#FFEB3B' : '#F44336';
                        
                        return (
                          <TableRow 
                            key={score.id}
                            sx={{ 
                              '&:hover': { bgcolor: theme.palette.action.hover },
                              transition: 'background-color 0.2s'
                            }}
                          >
                            <TableCell>
                              <Chip 
                                label={`Week ${score.week}`} 
                                size="small" 
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              {new Date(score.reviewDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: theme.palette.primary.main, fontSize: '0.875rem' }}>
                                  {score.reviewerName?.charAt(0) || 'R'}
                                </Avatar>
                                <Typography variant="body2">
                                  {score.reviewerName}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Typography fontWeight="medium">
                                {score.academicScore}/10
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography fontWeight="medium">
                                {score.reviewScoreValue}/10
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography fontWeight="medium">
                                {score.taskScore}/10
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Chip 
                                label={`${totalScore}/30`} 
                                size="small"
                                sx={{ 
                                  bgcolor: `${totalColor}20`, 
                                  color: totalColor,
                                  fontWeight: 'bold',
                                  minWidth: 70
                                }} 
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Review;