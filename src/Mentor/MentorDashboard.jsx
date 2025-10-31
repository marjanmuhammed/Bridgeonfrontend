import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  LinearProgress
} from '@mui/material';
import {
  Edit,
  Delete,
  Assignment,
  Payment,
  Person,
  Visibility
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import MentorDashboardApi from '../MentorApi/MentorDashboardApi';
import HomePage from '../Auth/Home';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`tabpanel-${index}`}
    aria-labelledby={`tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const MentorDashboardManagement = () => {
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [deletingMenteeId, setDeletingMenteeId] = useState(null);

  const [reviewDialog, setReviewDialog] = useState({ open: false, mode: 'create' });
  const [reviewData, setReviewData] = useState({
    reviewStatus: 'Not Assigned',
    reviewDate: new Date()
  });

  const [feeDialog, setFeeDialog] = useState({ open: false });
  const [feeData, setFeeData] = useState({
    feeCategory: 'Weekback',
    pendingAmount: 0,
    dueDate: new Date(),
    feeStatus: 'Pending'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [viewDialog, setViewDialog] = useState({ open: false, data: null });

  // Filter states
  const [dateFilter, setDateFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);

  useEffect(() => {
    loadMyMentees();
  }, []);

  const loadMyMentees = async () => {
    try {
      setLoading(true);
      const response = await MentorDashboardApi.getMyMentees();
      console.log('Mentees response:', response);
      
      // FIXED: Handle the response data structure correctly
      let menteesData = [];
      
      if (response.data && Array.isArray(response.data)) {
        // If response has data array (from getMyMentees)
        menteesData = response.data;
      } else if (Array.isArray(response)) {
        // If response is directly the array
        menteesData = response;
      } else if (response && response.data) {
        // If response has nested data
        menteesData = response.data;
      }
      
      console.log('Processed mentees data:', menteesData);

      // Fetch reviews for each mentee
      const menteesWithReviews = await Promise.all(
        menteesData.map(async (mentee) => {
          try {
            console.log('Fetching review for mentee:', mentee.id);
            const reviewResponse = await MentorDashboardApi.getReviewByUserId(mentee.id);
            console.log('Review response for mentee', mentee.id, ':', reviewResponse);
            
            // FIXED: Handle different response structures for reviews
            let reviewData = null;
            if (reviewResponse.data) {
              reviewData = reviewResponse.data;
            } else if (reviewResponse) {
              reviewData = reviewResponse;
            }
            
            return {
              ...mentee,
              hasReview: !!reviewData,
              review: reviewData
            };
          } catch (error) {
            console.log('No review found for mentee:', mentee.id, error);
            return {
              ...mentee,
              hasReview: false,
              review: null
            };
          }
        })
      );
      
      console.log('Final mentees with reviews:', menteesWithReviews);
      setMentees(menteesWithReviews);
      
    } catch (error) {
      console.error('Error loading mentees:', error);
      showSnackbar('Error loading mentees: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const openCreateReview = (mentee) => {
    setSelectedMentee(mentee);
    setReviewData({
      reviewStatus: 'Not Assigned',
      reviewDate: new Date()
    });
    setReviewDialog({ open: true, mode: 'create' });
  };

  const openEditReview = (mentee) => {
    setSelectedMentee(mentee);
    if (mentee.review) {
      setReviewData({
        reviewStatus: mentee.review.reviewStatus || 'Not Assigned',
        reviewDate: mentee.review.reviewDate ? new Date(mentee.review.reviewDate) : new Date()
      });
    }
    setReviewDialog({ open: true, mode: 'edit' });
  };

  const handleCreateReview = async () => {
    try {
      console.log('Creating review for mentee:', selectedMentee.id, 'with data:', reviewData);
      await MentorDashboardApi.createReview(selectedMentee.id, reviewData);
      showSnackbar('Review created successfully');
      setReviewDialog({ open: false, mode: 'create' });
      loadMyMentees();
    } catch (error) {
      console.error('Error creating review:', error);
      showSnackbar('Error creating review: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleUpdateReview = async () => {
    try {
      console.log('Updating review for mentee:', selectedMentee.id, 'with data:', reviewData);
      await MentorDashboardApi.updateReviewStatus(selectedMentee.id, reviewData.reviewStatus, reviewData.reviewDate);
      showSnackbar('Review updated successfully');
      setReviewDialog({ open: false, mode: 'edit' });
      loadMyMentees();
    } catch (error) {
      console.error('Error updating review:', error);
      showSnackbar('Error updating review: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleDeleteReview = async (mentee) => {
    if (window.confirm(`Delete review for ${mentee.fullName}?`)) {
      setDeletingMenteeId(mentee.id);
      try {
        console.log('Deleting review for mentee:', mentee.id);
        await MentorDashboardApi.deleteReview(mentee.id);
        showSnackbar('Review deleted');
        loadMyMentees();
      } catch (error) {
        console.error('Error deleting review:', error);
        showSnackbar('Error deleting review: ' + (error.response?.data?.message || error.message), 'error');
      } finally {
        setDeletingMenteeId(null);
      }
    }
  };

  const openViewReview = (mentee) => {
    setViewDialog({ open: true, data: mentee.review });
  };

  const openFeeDialog = (mentee) => {
    setSelectedMentee(mentee);
    if (mentee.review && mentee.review.feeCategory) {
      setFeeData({
        feeCategory: mentee.review.feeCategory || 'Weekback',
        pendingAmount: mentee.review.pendingAmount || 0,
        dueDate: mentee.review.dueDate ? new Date(mentee.review.dueDate) : new Date(),
        feeStatus: mentee.review.feeStatus || 'Pending'
      });
    } else {
      setFeeData({
        feeCategory: 'Weekback',
        pendingAmount: 0,
        dueDate: new Date(),
        feeStatus: 'Pending'
      });
    }
    setFeeDialog({ open: true });
  };

  const handleSaveFees = async () => {
    try {
      console.log('Saving fees for mentee:', selectedMentee.id, 'with data:', feeData);

      if (selectedMentee.hasReview && selectedMentee.review && 
          (feeData.feeCategory === selectedMentee.review.feeCategory &&
           feeData.pendingAmount === selectedMentee.review.pendingAmount &&
           new Date(feeData.dueDate).toDateString() === new Date(selectedMentee.review.dueDate).toDateString() &&
           feeData.feeStatus !== selectedMentee.review.feeStatus)) {
        
        await MentorDashboardApi.updateFeeStatus(selectedMentee.id, feeData.feeStatus);
        showSnackbar('Fee status updated successfully');
      } 
      else {
        await MentorDashboardApi.addOrUpdateFees(selectedMentee.id, feeData);
        showSnackbar('Fees updated successfully');
      }

      setFeeDialog({ open: false });
      loadMyMentees();

    } catch (error) {
      console.error('Error in handleSaveFees:', error);
      showSnackbar('Error updating fees: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleUpdateFeeStatus = async (mentee, newStatus) => {
    try {
      console.log('Updating fee status for mentee:', mentee.id, 'to:', newStatus);
      await MentorDashboardApi.updateFeeStatus(mentee.id, newStatus);
      showSnackbar(`Fee status updated to ${newStatus}`);
      loadMyMentees();
    } catch (error) {
      console.error('Error updating fee status:', error);
      showSnackbar('Error updating fee status: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleDeleteFees = async (mentee) => {
    if (window.confirm(`Are you sure you want to delete fees for ${mentee.fullName}?`)) {
      try {
        await MentorDashboardApi.deleteFees(mentee.id);
        showSnackbar('Fees deleted successfully');
        loadMyMentees();
      } catch (error) {
        console.error('Error deleting fees:', error);
        showSnackbar('Error deleting fees: ' + (error.response?.data?.message || error.message), 'error');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Assigned': return 'success';
      case 'Completed': return 'success';
      case 'Pending': return 'warning';
      case 'Not Assigned': return 'error';
      case 'Overdued': return 'error';
      case 'Overdue': return 'error';
      default: return 'default';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return 'error';
      case 'Mentor': return 'warning';
      case 'User': return 'primary';
      default: return 'default';
    }
  };

  // Calculate counts for mentor's dashboard
  const totalAssignedReviews = mentees.filter(mentee => mentee.hasReview && mentee.review && mentee.review.reviewStatus !== 'Not Assigned').length;
  const pendingFeesCount = mentees.filter(mentee => mentee.hasReview && mentee.review && mentee.review.feeStatus === 'Pending').length;
  
  // Date filtering logic
  const getFilteredMentees = () => {
    let filtered = mentees.filter(
      (mentee) =>
        mentee.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentee.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (dateFilter === 'today') {
      const today = new Date().toDateString();
      filtered = filtered.filter(mentee => 
        mentee.hasReview && mentee.review && mentee.review.reviewDate && 
        new Date(mentee.review.reviewDate).toDateString() === today
      );
    } else if (dateFilter === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toDateString();
      filtered = filtered.filter(mentee => 
        mentee.hasReview && mentee.review && mentee.review.reviewDate && 
        new Date(mentee.review.reviewDate).toDateString() === tomorrowStr
      );
    } else if (dateFilter === 'custom' && customStartDate && customEndDate) {
      filtered = filtered.filter(mentee => 
        mentee.hasReview && mentee.review && mentee.review.reviewDate && 
        new Date(mentee.review.reviewDate) >= customStartDate &&
        new Date(mentee.review.reviewDate) <= customEndDate
      );
    }

    return filtered;
  };

  const filteredMentees = getFilteredMentees();

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography variant="h6" sx={{ mb: 2 }}>Loading mentees data...</Typography>
        <LinearProgress sx={{ width: '60%', borderRadius: 2 }} />
      </Box>
    );
  }

  return (
  

    <LocalizationProvider dateAdapter={AdapterDateFns}>
          <div className="bg-white shadow-sm border-b border-gray-200/60 sticky top-0 z-40">
              <div className="max-w-7xl mx-auto">
                <HomePage />
              </div>
            </div>
      <Container
        maxWidth="lg"
        sx={{
          mt: 4,
          mb: 4,
        }}
      >
        {/* Header Section */}
         
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 'bold', 
              color: 'white',
              fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              mb: 1
            }}
          >
            Dashboard Management
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white', mb: 1 }}>
            Mentor Dashboard
          </Typography>
          <Typography sx={{ color: 'white', opacity: 0.9 }}>
            Manage your mentees reviews and fee information
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
            }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {mentees.length}
                </Typography>
                <Typography variant="h6">Total Mentees</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
            }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {totalAssignedReviews}
                </Typography>
                <Typography variant="h6">Assigned Reviews</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
            }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {pendingFeesCount}
                </Typography>
                <Typography variant="h6">Pending Fees</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
            }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {mentees.filter(mentee => mentee.hasReview && mentee.review && mentee.review.feeStatus === 'Completed').length}
                </Typography>
                <Typography variant="h6">Paid Fees</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card
          sx={{
            borderRadius: 4,
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            backdropFilter: "blur(10px)",
            background: "rgba(255,255,255,0.9)"
          }}
        >
          <CardContent>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              textColor="primary"
              indicatorColor="primary"
              variant="fullWidth"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTab-root': { fontWeight: 'bold', fontSize: '1rem' }
              }}
            >
              <Tab label="Mentee Reviews" />
              <Tab label="Fee Management" />
            </Tabs>

            {/* Search and Filter Section */}
            <Box sx={{ mt: 3, mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Search by name or email"
                    variant="outlined"
                    fullWidth
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Date Filter</InputLabel>
                        <Select
                          value={dateFilter}
                          label="Date Filter"
                          onChange={(e) => setDateFilter(e.target.value)}
                        >
                          <MenuItem value="all">All Dates</MenuItem>
                          <MenuItem value="today">Today</MenuItem>
                          <MenuItem value="tomorrow">Tomorrow</MenuItem>
                          <MenuItem value="custom">Custom Range</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    {dateFilter === 'custom' && (
                      <>
                        <Grid item xs={12} sm={4}>
                          <DatePicker
                            label="Start Date"
                            value={customStartDate}
                            onChange={setCustomStartDate}
                            renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <DatePicker
                            label="End Date"
                            value={customEndDate}
                            onChange={setCustomEndDate}
                            renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0 6px 20px rgba(0,0,0,0.08)" }}>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead sx={{ backgroundColor: '#e3f2fd' }}>
                    <TableRow>
                      <TableCell><b>Mentee</b></TableCell>
                      <TableCell><b>Email</b></TableCell>
                      <TableCell><b>Role</b></TableCell>
                      <TableCell><b>Review Status</b></TableCell>
                      <TableCell><b>Review Date</b></TableCell>
                      <TableCell sx={{ width: '220px' }}><b>Actions</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredMentees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body1" sx={{ py: 3 }}>
                            {mentees.length === 0 ? 'No mentees assigned to you yet.' : 'No mentees found matching your criteria.'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMentees.map((mentee) => (
                        <TableRow
                          key={mentee.id}
                          hover
                          sx={{
                            transition: 'all 0.4s ease',
                            opacity: deletingMenteeId === mentee.id ? 0 : 1,
                            transform: deletingMenteeId === mentee.id ? 'scale(0.95)' : 'scale(1)',
                            backgroundColor:
                              mentee.review?.feeStatus === 'Pending'
                                ? '#ffebee'
                                : 'inherit',
                          }}
                        >
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar src={mentee.profileImageUrl} sx={{ width: 40, height: 40, mr: 2 }}>
                                <Person />
                              </Avatar>
                              <Typography variant="subtitle2">{mentee.fullName || 'Unknown Student'}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{mentee.email}</TableCell>
                          <TableCell>
                            <Chip label={mentee.role || 'User'} size="small" color={getRoleColor(mentee.role)} />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={mentee.hasReview ? (mentee.review?.reviewStatus || 'No Status') : 'No Review'}
                              color={getStatusColor(mentee.hasReview ? (mentee.review?.reviewStatus || 'No Status') : 'No Review')}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {mentee.hasReview && mentee.review && mentee.review.reviewDate
                              ? new Date(mentee.review.reviewDate).toLocaleDateString()
                              : '-'}
                          </TableCell>
                          <TableCell sx={{ width: '220px' }}>
                            <Box display="flex" gap={1} flexWrap="wrap">
                              {!mentee.hasReview ? (
                                <Button
                                  variant="contained"
                                  startIcon={<Assignment />}
                                  onClick={() => openCreateReview(mentee)}
                                  size="small"
                                  sx={{ minWidth: '100px' }}
                                >
                                  Assign
                                </Button>
                              ) : (
                                <>
                                  <IconButton color="primary" onClick={() => openViewReview(mentee)} size="small">
                                    <Visibility fontSize="small" />
                                  </IconButton>
                                  <IconButton color="secondary" onClick={() => openEditReview(mentee)} size="small">
                                    <Edit fontSize="small" />
                                  </IconButton>
                                  <IconButton color="error" onClick={() => handleDeleteReview(mentee)} size="small">
                                    <Delete fontSize="small" />
                                  </IconButton>
                                  <Button
                                    variant="contained"
                                    startIcon={<Payment />}
                                    onClick={() => openFeeDialog(mentee)}
                                    size="small"
                                    sx={{
                                      fontSize: '0.65rem',
                                      textTransform: 'none',
                                      fontWeight: 600,
                                      borderRadius: '6px',
                                      background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                                      color: '#fff',
                                      px: 1,
                                      py: 0.35,
                                      minWidth: '78px',
                                      boxShadow: '0 2px 4px rgba(25,118,210,0.25)',
                                      transition: 'all 0.25s ease-in-out',
                                      whiteSpace: 'nowrap',
                                      '&:hover': {
                                        background: 'linear-gradient(90deg, #1565c0 0%, #1e88e5 100%)',
                                        boxShadow: '0 4px 8px rgba(25,118,210,0.3)',
                                        transform: 'translateY(-1px)',
                                      },
                                    }}
                                  >
                                    {mentee.review?.feeCategory ? 'Edit Fees' : 'Add Fees'}
                                  </Button>
                                </>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <TableContainer
                component={Paper}
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
                }}
              >
                <Table sx={{ minWidth: 650 }}>
                  <TableHead sx={{ backgroundColor: '#f1f9ff' }}>
                    <TableRow>
                      <TableCell><b>Mentee</b></TableCell>
                      <TableCell><b>Role</b></TableCell>
                      <TableCell><b>Fee Category</b></TableCell>
                      <TableCell><b>Amount</b></TableCell>
                      <TableCell><b>Due Date</b></TableCell>
                      <TableCell><b>Status</b></TableCell>
                      <TableCell sx={{ width: '180px' }}><b>Actions</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mentees.filter(mentee => mentee.hasReview && mentee.review && mentee.review.feeCategory).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography variant="body1" sx={{ py: 3 }}>
                            No fee records found for your mentees.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      mentees
                        .filter(mentee => mentee.hasReview && mentee.review && mentee.review.feeCategory)
                        .map((mentee) => (
                        <TableRow
                          key={mentee.id}
                          hover
                          sx={{
                            transition: 'all 0.4s ease',
                            opacity: deletingMenteeId === mentee.id ? 0 : 1,
                            transform: deletingMenteeId === mentee.id ? 'scale(0.95)' : 'scale(1)',
                            backgroundColor:
                              mentee.review?.feeStatus === 'Pending'
                                ? '#ffebee'
                                : mentee.review?.feeStatus === 'Overdued'
                                ? '#fff3e0'
                                : mentee.review?.feeStatus === 'Completed'
                                ? '#e8f5e8'
                                : 'inherit',
                          }}
                        >
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar src={mentee.profileImageUrl} sx={{ width: 40, height: 40, mr: 2 }}>
                                <Person />
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2">{mentee.fullName || 'Unknown Student'}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {mentee.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip label={mentee.role || 'User'} size="small" color={getRoleColor(mentee.role)} />
                          </TableCell>
                          <TableCell>{mentee.review.feeCategory}</TableCell>
                          <TableCell>₹{mentee.review.pendingAmount}</TableCell>
                          <TableCell>
                            {mentee.review.dueDate ? new Date(mentee.review.dueDate).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                              <Select
                                value={mentee.review.feeStatus || 'Pending'}
                                onChange={(e) => handleUpdateFeeStatus(mentee, e.target.value)}
                                size="small"
                              >
                                <MenuItem value="Pending">Pending</MenuItem>
                                <MenuItem value="Completed">Paid</MenuItem>
                                <MenuItem value="Overdued">Overdue</MenuItem>
                              </Select>
                            </FormControl>
                          </TableCell>
                          <TableCell sx={{ width: '180px' }}>
                            <Box display="flex" gap={1} flexWrap="wrap">
                              <IconButton onClick={() => openFeeDialog(mentee)} color="primary" size="small">
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton onClick={() => handleDeleteFees(mentee)} color="error" size="small">
                                <Delete fontSize="small" />
                              </IconButton>
                              {mentee.review.feeStatus === 'Pending' && (
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  onClick={() => handleUpdateFeeStatus(mentee, 'Completed')}
                                  sx={{
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    borderRadius: '6px',
                                    minWidth: '70px',
                                    px: 1,
                                    py: 0.2,
                                    lineHeight: 1.1,
                                    background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                                    boxShadow: '0 1px 4px rgba(34, 197, 94, 0.3)',
                                    transition: 'all 0.3s ease',
                                    whiteSpace: 'nowrap',
                                    '&:hover': {
                                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                      boxShadow: '0 3px 8px rgba(34, 197, 94, 0.4)',
                                      transform: 'translateY(-1px)',
                                    },
                                  }}
                                >
                                  ✓ Paid
                                </Button>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>
          </CardContent>
        </Card>

        {/* View Review Dialog */}
        <Dialog
          open={viewDialog.open}
          onClose={() => setViewDialog({ open: false, data: null })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ background: 'linear-gradient(90deg, #2196f3, #21cbf3)', color: 'white' }}>
            Review Details
          </DialogTitle>
          <DialogContent>
            {viewDialog.data ? (
              <Box sx={{ p: 2 }}>
                <Typography><b>Status:</b> {viewDialog.data.reviewStatus || 'No Status'}</Typography>
                <Typography>
                  <b>Date:</b> {viewDialog.data.reviewDate ? new Date(viewDialog.data.reviewDate).toLocaleDateString() : 'No Date'}
                </Typography>
                {viewDialog.data.feeCategory && (
                  <>
                    <Typography><b>Fee Category:</b> {viewDialog.data.feeCategory}</Typography>
                    <Typography><b>Pending Amount:</b> ₹{viewDialog.data.pendingAmount}</Typography>
                    <Typography><b>Fee Status:</b> {viewDialog.data.feeStatus}</Typography>
                    {viewDialog.data.dueDate && (
                      <Typography><b>Due Date:</b> {new Date(viewDialog.data.dueDate).toLocaleDateString()}</Typography>
                    )}
                  </>
                )}
              </Box>
            ) : (
              <Typography>No Review Data Found</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialog({ open: false, data: null })}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Review Dialog */}
        <Dialog
          open={reviewDialog.open}
          onClose={() => setReviewDialog({ open: false, mode: 'create' })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle
            sx={{
              background: 'linear-gradient(90deg, #1565c0, #2196f3)',
              color: 'white'
            }}
          >
            {reviewDialog.mode === 'create' ? 'Assign Review' : 'Edit Review'} - {selectedMentee?.fullName}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Review Status</InputLabel>
                <Select
                  value={reviewData.reviewStatus}
                  label="Review Status"
                  onChange={(e) => setReviewData({ ...reviewData, reviewStatus: e.target.value })}
                >
                  <MenuItem value="Not Assigned">Not Assigned</MenuItem>
                  <MenuItem value="Assigned">Assigned</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                </Select>
              </FormControl>
              <DatePicker
                label="Review Date"
                value={reviewData.reviewDate}
                onChange={(date) => setReviewData({ ...reviewData, reviewDate: date })}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReviewDialog({ open: false, mode: 'create' })}>Cancel</Button>
            <Button
              variant="contained"
              onClick={reviewDialog.mode === 'create' ? handleCreateReview : handleUpdateReview}
            >
              {reviewDialog.mode === 'create' ? 'Assign Review' : 'Update Review'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Fee Dialog */}
        <Dialog open={feeDialog.open} onClose={() => setFeeDialog({ open: false })} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ background: 'linear-gradient(90deg, #1976d2, #64b5f6)', color: 'white' }}>
            Manage Fees - {selectedMentee?.fullName}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Fee Category</InputLabel>
                <Select
                  value={feeData.feeCategory}
                  label="Fee Category"
                  onChange={(e) => setFeeData({ ...feeData, feeCategory: e.target.value })}
                >
                  <MenuItem value="Weekback">Weekback</MenuItem>
                  <MenuItem value="Training Facilities">Training Facilities</MenuItem>
                  <MenuItem value="Course Fee">Course Fee</MenuItem>
                  <MenuItem value="Exam Fee">Exam Fee</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Pending Amount"
                type="number"
                fullWidth
                sx={{ mb: 2 }}
                value={feeData.pendingAmount}
                onChange={(e) => setFeeData({ ...feeData, pendingAmount: parseFloat(e.target.value) || 0 })}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                }}
              />
              <DatePicker
                label="Due Date"
                value={feeData.dueDate}
                onChange={(date) => setFeeData({ ...feeData, dueDate: date })}
                renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
              />
              <FormControl fullWidth>
                <InputLabel>Fee Status</InputLabel>
                <Select
                  value={feeData.feeStatus}
                  label="Fee Status"
                  onChange={(e) => setFeeData({ ...feeData, feeStatus: e.target.value })}
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Completed">Paid</MenuItem>
                  <MenuItem value="Overdued">Overdue</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFeeDialog({ open: false })}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveFees}>Save Fees</Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
};

export default MentorDashboardManagement;