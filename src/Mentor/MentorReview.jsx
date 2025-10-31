import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, IconButton, Typography, Box, Alert, Snackbar,
  Card, CardContent, Grid, CircularProgress, Chip, Avatar,
  Tooltip, Fade, Slide, InputAdornment, Divider, alpha, useTheme
} from '@mui/material';
import { 
  Edit, Delete, Add, Person, CalendarToday, Assignment, 
  Grading, Score, TrendingUp, Refresh, Search,
  FilterList, Download, Visibility
} from '@mui/icons-material';
import mentorReviewApi from '../MentorApi/mentorReviewApi';
import HomePage from '../Auth/Home';

const MentorReview = () => {
  const theme = useTheme();
  const [reviewScores, setReviewScores] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingScore, setEditingScore] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWeek, setFilterWeek] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    userId: '',
    week: '',
    reviewDate: new Date().toISOString().split('T')[0],
    reviewerName: '',
    academicScore: '',
    reviewScoreValue: '',
    taskScore: ''
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // First get the mentor's mentees
      const menteesResponse = await mentorReviewApi.getMyMentees();
      setMentees(menteesResponse || []);
      
      // Then get all review scores and filter only those belonging to mentor's mentees
      const scoresResponse = await mentorReviewApi.getAllReviewScores();
      const menteeIds = menteesResponse.map(mentee => mentee.id);
      
      // Filter review scores to only show those for the mentor's mentees
      const mentorReviewScores = (scoresResponse || []).filter(score => 
        menteeIds.includes(score.userId)
      );
      
      setReviewScores(mentorReviewScores);
      
    } catch (error) {
      console.error('Error loading data:', error);
      showSnackbar('Error loading data: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.userId) errors.userId = 'Mentee is required';
    if (!formData.week || formData.week < 1) errors.week = 'Valid week is required';
    if (!formData.reviewDate) errors.reviewDate = 'Review date is required';
    if (!formData.reviewerName?.trim()) errors.reviewerName = 'Reviewer name is required';
    if (formData.academicScore === '' || formData.academicScore < 0) errors.academicScore = 'Valid academic score is required';
    if (formData.reviewScoreValue === '' || formData.reviewScoreValue < 0) errors.reviewScoreValue = 'Valid review score is required';
    if (formData.taskScore === '' || formData.taskScore < 0) errors.taskScore = 'Valid task score is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenDialog = (score = null) => {
    if (score) {
      setEditingScore(score);
      setFormData({
        userId: score.userId.toString(),
        week: score.week.toString(),
        reviewDate: score.reviewDate.split('T')[0],
        reviewerName: score.reviewerName,
        academicScore: score.academicScore.toString(),
        reviewScoreValue: score.reviewScoreValue.toString(),
        taskScore: score.taskScore.toString()
      });
    } else {
      setEditingScore(null);
      setFormData({
        userId: '',
        week: '',
        reviewDate: new Date().toISOString().split('T')[0],
        reviewerName: '',
        academicScore: '',
        reviewScoreValue: '',
        taskScore: ''
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingScore(null);
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showSnackbar('Please fix the form errors', 'error');
      return;
    }

    try {
      setSubmitting(true);
      
      const submitData = {
        userId: parseInt(formData.userId),
        week: parseInt(formData.week),
        reviewDate: new Date(formData.reviewDate).toISOString(),
        reviewerName: formData.reviewerName.trim(),
        academicScore: parseFloat(formData.academicScore),
        reviewScoreValue: parseFloat(formData.reviewScoreValue),
        taskScore: parseFloat(formData.taskScore)
      };

      if (editingScore) {
        await mentorReviewApi.updateReviewScore(editingScore.id, submitData);
        showSnackbar('Review score updated successfully');
      } else {
        await mentorReviewApi.createReviewScore(submitData);
        showSnackbar('Review score created successfully');
      }

      handleCloseDialog();
      await loadData();
      
    } catch (error) {
      console.error('Error saving review score:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data || 
                          'Error saving review score';
      showSnackbar(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this review score?')) {
      try {
        await mentorReviewApi.deleteReviewScore(id);
        showSnackbar('Review score deleted successfully');
        await loadData();
      } catch (error) {
        console.error('Error deleting review score:', error);
        showSnackbar('Error deleting review score', 'error');
      }
    }
  };

  const getMenteeName = (userId) => {
    const mentee = mentees.find(m => m.id === userId);
    return mentee ? mentee.fullName : 'Unknown Mentee';
  };

  const calculateTotal = () => {
    const academic = parseFloat(formData.academicScore) || 0;
    const review = parseFloat(formData.reviewScoreValue) || 0;
    const task = parseFloat(formData.taskScore) || 0;
    return (academic + review + task).toFixed(1);
  };

  const getScoreColor = (score) => {
    if (score >= 85) return theme.palette.success.main;
    if (score >= 70) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Filter data based on search and filter criteria
  const filteredScores = reviewScores.filter(score => {
    const matchesSearch = getMenteeName(score.userId).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         score.reviewerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWeek = !filterWeek || score.week.toString() === filterWeek;
    return matchesSearch && matchesWeek;
  });

  // Get unique weeks for filter
  const uniqueWeeks = [...new Set(reviewScores.map(score => score.week))].sort((a, b) => a - b);

  const StatsCard = ({ title, value, icon, color }) => (
    <Card 
      sx={{ 
        background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
        border: `1px solid ${alpha(color, 0.2)}`,
        borderRadius: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 24px ${alpha(color, 0.2)}`
        }
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" component="div" fontWeight="bold" color={color}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {title}
            </Typography>
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: alpha(color, 0.1),
              color: color,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (

    
    <Box sx={{ p: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh' }}>

         <div className="bg-white shadow-sm border-b border-gray-200/60 sticky top-0 z-40">
                          <div className="max-w-7xl mx-auto">
                            <HomePage />
                          </div>
                        </div>
             
      {/* Header Section */}
      <Slide in={true} direction="down" timeout={500}>
        <Card 
          sx={{ 
            mb: 3, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}
        >

          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
                  Mentor Reviews Management
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Manage and track your {mentees.length} mentees' performance reviews
                </Typography>
              </Box>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Grading sx={{ fontSize: 40 }} />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Slide>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12}>
          <Fade in={!loading} timeout={800}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard
                  title="Total Reviews"
                  value={reviewScores.length}
                  icon={<Assignment sx={{ fontSize: 28 }} />}
                  color={theme.palette.primary.main}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard
                  title="My Mentees"
                  value={mentees.length}
                  icon={<Person sx={{ fontSize: 28 }} />}
                  color={theme.palette.info.main}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard
                  title="Average Score"
                  value={reviewScores.length > 0 ? 
                    (reviewScores.reduce((acc, curr) => acc + curr.totalScore, 0) / reviewScores.length).toFixed(1) : '0.0'
                  }
                  icon={<Score sx={{ fontSize: 28 }} />}
                  color={theme.palette.success.main}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard
                  title="Weeks Tracked"
                  value={uniqueWeeks.length}
                  icon={<CalendarToday sx={{ fontSize: 28 }} />}
                  color={theme.palette.warning.main}
                />
              </Grid>
            </Grid>
          </Fade>
        </Grid>

        {/* Controls Section */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                <TextField
                  placeholder="Search mentees or reviewers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    minWidth: 250,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
                
                <TextField
                  select
                  placeholder="Filter by week"
                  value={filterWeek}
                  onChange={(e) => setFilterWeek(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FilterList color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    minWidth: 150,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                >
                  <MenuItem value="">All Weeks</MenuItem>
                  {uniqueWeeks.map(week => (
                    <MenuItem key={week} value={week.toString()}>
                      Week {week}
                    </MenuItem>
                  ))}
                </TextField>

                <Box sx={{ flexGrow: 1 }} />

                <Tooltip title="Refresh Data">
                  <IconButton 
                    onClick={loadData} 
                    disabled={loading}
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      color: 'white',
                      '&:hover': {
                        bgcolor: theme.palette.primary.dark,
                      }
                    }}
                  >
                    <Refresh />
                  </IconButton>
                </Tooltip>

                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleOpenDialog()}
                  disabled={loading || mentees.length === 0}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    background: mentees.length === 0 ? theme.palette.grey[400] : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: mentees.length === 0 ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.3)',
                    '&:hover': mentees.length === 0 ? {} : {
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                    }
                  }}
                >
                  {mentees.length === 0 ? 'No Mentees Available' : 'Add Review'}
                </Button>
              </Box>
              {mentees.length === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  You don't have any mentees assigned yet. Please contact administration to get mentees assigned.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Main Table */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 0 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
                  <CircularProgress size={60} thickness={4} />
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      }}>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                          Mentee
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                          Week
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                          Review Date
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                          Reviewer
                        </TableCell>
                        <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                          Academic
                        </TableCell>
                        <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                          Review
                        </TableCell>
                        <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                          Task
                        </TableCell>
                        <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                          Total Score
                        </TableCell>
                        <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredScores.map((score, index) => (
                        <Fade in={true} timeout={500} key={score.id}>
                          <TableRow 
                            sx={{ 
                              '&:hover': { 
                                backgroundColor: alpha(theme.palette.primary.main, 0.02),
                                transform: 'scale(1.002)',
                                transition: 'all 0.2s ease'
                              },
                              animation: `fadeIn 0.5s ease ${index * 0.1}s both`
                            }}
                          >
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: getScoreColor(score.totalScore), width: 40, height: 40 }}>
                                  {getMenteeName(score.userId).split(' ').map(n => n[0]).join('')}
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle1" fontWeight="medium">
                                    {getMenteeName(score.userId)}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={`Week ${score.week}`} 
                                variant="outlined"
                                color="primary"
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2">
                                  {score.reviewDate ? new Date(score.reviewDate).toLocaleDateString() : 'N/A'}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {score.reviewerName}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={score.academicScore} 
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={score.reviewScoreValue} 
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={score.taskScore} 
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography 
                                  variant="h6" 
                                  fontWeight="bold"
                                  sx={{ color: getScoreColor(score.totalScore) }}
                                >
                                  {score.totalScore}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                <Tooltip title="Edit Review">
                                  <IconButton
                                    color="primary"
                                    onClick={() => handleOpenDialog(score)}
                                    size="small"
                                    sx={{
                                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                                      '&:hover': {
                                        bgcolor: theme.palette.primary.main,
                                        color: 'white'
                                      }
                                    }}
                                  >
                                    <Edit />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Review">
                                  <IconButton
                                    color="error"
                                    onClick={() => handleDelete(score.id)}
                                    size="small"
                                    sx={{
                                      bgcolor: alpha(theme.palette.error.main, 0.1),
                                      '&:hover': {
                                        bgcolor: theme.palette.error.main,
                                        color: 'white'
                                      }
                                    }}
                                  >
                                    <Delete />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        </Fade>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {filteredScores.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        {mentees.length === 0 ? 'No mentees assigned' : 'No review scores found for your mentees'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchTerm || filterWeek 
                          ? 'Try adjusting your search or filter criteria' 
                          : mentees.length === 0 
                            ? 'Please contact administration to get mentees assigned' 
                            : 'Get started by adding your first review score'
                        }
                      </Typography>
                    </Box>
                  )}
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'white',
            overflow: 'visible'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center',
          py: 3,
          position: 'relative',
          zIndex: 1
        }}>
          <Typography variant="h4" component="div" fontWeight="bold" sx={{ position: 'relative', zIndex: 2 }}>
            {editingScore ? 'Edit Review Score' : 'Add New Review Score'}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mt: 1, position: 'relative', zIndex: 2 }}>
            {editingScore ? 'Update the review score details' : 'Create a new review score entry for your mentee'}
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ p: 4, position: 'relative', zIndex: 0 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Mentee"
                name="userId"
                value={formData.userId}
                onChange={handleInputChange}
                error={!!formErrors.userId}
                helperText={formErrors.userId}
                required
                disabled={submitting}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              >
                <MenuItem value="">Select Mentee</MenuItem>
                {mentees.map((mentee) => (
                  <MenuItem key={mentee.id} value={mentee.id}>
                    <Box>
                      <Typography variant="body1">{mentee.fullName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {mentee.email}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Week Number"
                name="week"
                value={formData.week}
                onChange={handleInputChange}
                error={!!formErrors.week}
                helperText={formErrors.week}
                inputProps={{ min: 1, max: 52 }}
                required
                disabled={submitting}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarToday color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Review Date"
                name="reviewDate"
                value={formData.reviewDate}
                onChange={handleInputChange}
                error={!!formErrors.reviewDate}
                helperText={formErrors.reviewDate}
                InputLabelProps={{ shrink: true }}
                required
                disabled={submitting}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Reviewer Name"
                name="reviewerName"
                value={formData.reviewerName}
                onChange={handleInputChange}
                error={!!formErrors.reviewerName}
                helperText={formErrors.reviewerName}
                required
                disabled={submitting}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Chip label="Score Details" color="primary" />
              </Divider>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Academic Score"
                name="academicScore"
                value={formData.academicScore}
                onChange={handleInputChange}
                error={!!formErrors.academicScore}
                helperText={formErrors.academicScore}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
                required
                disabled={submitting}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Score color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Review Score"
                name="reviewScoreValue"
                value={formData.reviewScoreValue}
                onChange={handleInputChange}
                error={!!formErrors.reviewScoreValue}
                helperText={formErrors.reviewScoreValue}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
                required
                disabled={submitting}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Grading color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Task Score"
                name="taskScore"
                value={formData.taskScore}
                onChange={handleInputChange}
                error={!!formErrors.taskScore}
                helperText={formErrors.taskScore}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
                required
                disabled={submitting}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Assignment color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Card 
                sx={{ 
                  mt: 2,
                  background: `linear-gradient(135deg, ${getScoreColor(calculateTotal())}20 0%, ${alpha(getScoreColor(calculateTotal()), 0.05)} 100%)`,
                  border: `2px solid ${alpha(getScoreColor(calculateTotal()), 0.2)}`
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="h3" fontWeight="bold" color={getScoreColor(calculateTotal())}>
                    Total Score: {calculateTotal()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={handleCloseDialog} 
            disabled={submitting}
            variant="outlined"
            sx={{ borderRadius: 2, px: 4 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
            sx={{ 
              borderRadius: 2, 
              px: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
              }
            }}
          >
            {submitting ? 'Saving...' : (editingScore ? 'Update Score' : 'Create Score')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          sx={{
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Box>
  );
};

export default MentorReview;