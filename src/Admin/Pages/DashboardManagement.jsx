import React, { useState, useEffect, useRef } from 'react';
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
import adminReviewApi from '../../AdminApi/adminReviewApi';

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

const DashboardManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);

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

  // New state variables for counts and filters
  const [dateFilter, setDateFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);

  useEffect(() => {
    loadUserProfiles();
  }, []);

  const loadUserProfiles = async () => {
    try {
      setLoading(true);
      const response = await adminReviewApi.getAllUserProfiles();
      if (response.status === 200) {
        const usersWithReviews = await Promise.all(
          response.data.map(async (user) => {
            try {
              const reviewResponse = await adminReviewApi.getReviewByUserId(user.id);
              return {
                ...user,
                hasReview: true,
                review: reviewResponse.data
              };
            } catch {
              return {
                ...user,
                hasReview: false,
                review: null
              };
            }
          })
        );
        const onlyUsers = usersWithReviews.filter((u) => u.role === "User");
        setUsers(onlyUsers);
      }
    } catch (error) {
      console.error('Error loading user profiles:', error);
      showSnackbar('Error loading user profiles', 'error');
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

  const openCreateReview = (user) => {
    setSelectedUser(user);
    setReviewData({
      reviewStatus: 'Not Assigned',
      reviewDate: new Date()
    });
    setReviewDialog({ open: true, mode: 'create' });
  };

  const openEditReview = (user) => {
    setSelectedUser(user);
    if (user.review) {
      setReviewData({
        reviewStatus: user.review.reviewStatus,
        reviewDate: new Date(user.review.reviewDate)
      });
    }
    setReviewDialog({ open: true, mode: 'edit' });
  };

  const handleCreateReview = async () => {
    try {
      await adminReviewApi.createReview(selectedUser.id, reviewData);
      showSnackbar('Review created successfully');
      setReviewDialog({ open: false, mode: 'create' });
      loadUserProfiles();
    } catch {
      showSnackbar('Error creating review', 'error');
    }
  };

  const handleUpdateReview = async () => {
    try {
      await adminReviewApi.updateReviewStatus(selectedUser.id, reviewData.reviewStatus, reviewData.reviewDate);
      showSnackbar('Review updated successfully');
      setReviewDialog({ open: false, mode: 'edit' });
      loadUserProfiles();
    } catch {
      showSnackbar('Error updating review', 'error');
    }
  };

  const handleDeleteReview = async (user) => {
    if (window.confirm(`Delete review for ${user.fullName}?`)) {
      setDeletingUserId(user.id);
      setTimeout(async () => {
        try {
          await adminReviewApi.deleteReview(user.id);
          showSnackbar('Review deleted');
          loadUserProfiles();
        } catch {
          showSnackbar('Error deleting review', 'error');
        } finally {
          setDeletingUserId(null);
        }
      }, 400);
    }
  };

  const openViewReview = (user) => {
    setViewDialog({ open: true, data: user.review });
  };

  const openFeeDialog = (user) => {
    setSelectedUser(user);
    if (user.review && user.review.feeCategory) {
      setFeeData({
        feeCategory: user.review.feeCategory || 'Weekback',
        pendingAmount: user.review.pendingAmount || 0,
        dueDate: user.review.dueDate ? new Date(user.review.dueDate) : new Date(),
        feeStatus: user.review.feeStatus || 'Pending'
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
      console.log('Saving fees for user:', selectedUser.id, 'with data:', feeData);

      if (Object.keys(feeData).length === 1 || 
          (feeData.feeCategory === selectedUser.review?.feeCategory &&
           feeData.pendingAmount === selectedUser.review?.pendingAmount &&
           new Date(feeData.dueDate).toDateString() === new Date(selectedUser.review?.dueDate).toDateString() &&
           feeData.feeStatus !== selectedUser.review?.feeStatus)) {
        
        await adminReviewApi.updateFeeStatus(selectedUser.id, feeData.feeStatus);
        showSnackbar('Fee status updated successfully');
      } 
      else {
        await adminReviewApi.addOrUpdateFees(selectedUser.id, feeData);
        showSnackbar('Fees updated successfully');
      }

      setFeeDialog({ open: false });
      loadUserProfiles();

    } catch (error) {
      console.error('Error in handleSaveFees:', error);
      showSnackbar('Error updating fees', 'error');
    }
  };

  const handleUpdateFeeStatus = async (user, newStatus) => {
    try {
      console.log('Updating fee status for user:', user.id, 'to:', newStatus);
      await adminReviewApi.updateFeeStatus(user.id, newStatus);
      showSnackbar(`Fee status updated to ${newStatus}`);
      loadUserProfiles();
    } catch (error) {
      console.error('Error updating fee status:', error);
      showSnackbar('Error updating fee status', 'error');
    }
  };

  const handleDeleteFees = async (user) => {
    if (window.confirm(`Are you sure you want to delete fees for ${user.fullName}?`)) {
      try {
        await adminReviewApi.deleteFees(user.id);
        showSnackbar('Fees deleted successfully');
        loadUserProfiles();
      } catch (error) {
        console.error('Error deleting fees:', error);
        showSnackbar('Error deleting fees', 'error');
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

  // Calculate counts
  const totalAssignedReviews = users.filter(user => user.hasReview && user.review.reviewStatus !== 'Not Assigned').length;
  const pendingFeesCount = users.filter(user => user.hasReview && user.review.feeStatus === 'Pending').length;
  
  // Date filtering logic
  const getFilteredUsers = () => {
    let filtered = users.filter(
      (user) =>
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (dateFilter === 'today') {
      const today = new Date().toDateString();
      filtered = filtered.filter(user => 
        user.hasReview && user.review.reviewDate && 
        new Date(user.review.reviewDate).toDateString() === today
      );
    } else if (dateFilter === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toDateString();
      filtered = filtered.filter(user => 
        user.hasReview && user.review.reviewDate && 
        new Date(user.review.reviewDate).toDateString() === tomorrowStr
      );
    } else if (dateFilter === 'custom' && customStartDate && customEndDate) {
      filtered = filtered.filter(user => 
        user.hasReview && user.review.reviewDate && 
        new Date(user.review.reviewDate) >= customStartDate &&
        new Date(user.review.reviewDate) <= customEndDate
      );
    }

    return filtered;
  };

  const filteredUsers = getFilteredUsers();

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography variant="h6" sx={{ mb: 2 }}>Loading data...</Typography>
        <LinearProgress sx={{ width: '60%', borderRadius: 2 }} />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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
            Admin Review Dashboard
          </Typography>
          <Typography sx={{ color: 'white', opacity: 0.9 }}>
            Manage user reviews and fee information easily
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
                  {users.length}
                </Typography>
                <Typography variant="h6">Total Users</Typography>
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
                  {users.filter(user => user.hasReview && user.review.feeStatus === 'Completed').length}
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
              <Tab label="User Reviews" />
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
                      <TableCell><b>User</b></TableCell>
                      <TableCell><b>Email</b></TableCell>
                      <TableCell><b>Role</b></TableCell>
                      <TableCell><b>Review Status</b></TableCell>
                      <TableCell><b>Review Date</b></TableCell>
                      <TableCell sx={{ width: '220px' }}><b>Actions</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow
                        key={user.id}
                        hover
                        sx={{
                          transition: 'all 0.4s ease',
                          opacity: deletingUserId === user.id ? 0 : 1,
                          transform: deletingUserId === user.id ? 'scale(0.95)' : 'scale(1)',
                          backgroundColor:
                            user.review?.feeStatus === 'Pending'
                              ? '#ffebee'
                              : 'inherit',
                        }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar src={user.profileImageUrl} sx={{ width: 40, height: 40, mr: 2 }}>
                              <Person />
                            </Avatar>
                            <Typography variant="subtitle2">{user.fullName}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip label={user.role} size="small" color={getRoleColor(user.role)} />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.hasReview ? user.review.reviewStatus : 'No Review'}
                            color={getStatusColor(user.hasReview ? user.review.reviewStatus : 'No Review')}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {user.hasReview && user.review.reviewDate
                            ? new Date(user.review.reviewDate).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell sx={{ width: '220px' }}>
                          <Box display="flex" gap={1} flexWrap="wrap">
                            {!user.hasReview ? (
                              <Button
                                variant="contained"
                                startIcon={<Assignment />}
                                onClick={() => openCreateReview(user)}
                                size="small"
                                sx={{ minWidth: '100px' }}
                              >
                                Assign
                              </Button>
                            ) : (
                              <>
                                <IconButton color="primary" onClick={() => openViewReview(user)} size="small">
                                  <Visibility fontSize="small" />
                                </IconButton>
                                <IconButton color="secondary" onClick={() => openEditReview(user)} size="small">
                                  <Edit fontSize="small" />
                                </IconButton>
                                <IconButton color="error" onClick={() => handleDeleteReview(user)} size="small">
                                  <Delete fontSize="small" />
                                </IconButton>
                                <Button
                                  variant="contained"
                                  startIcon={<Payment />}
                                  onClick={() => openFeeDialog(user)}
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
                                  {user.review?.feeCategory ? 'Edit Fees' : 'Add Fees'}
                                </Button>
                              </>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
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
                      <TableCell><b>User</b></TableCell>
                      <TableCell><b>Role</b></TableCell>
                      <TableCell><b>Fee Category</b></TableCell>
                      <TableCell><b>Amount</b></TableCell>
                      <TableCell><b>Due Date</b></TableCell>
                      <TableCell><b>Status</b></TableCell>
                      <TableCell sx={{ width: '180px' }}><b>Actions</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.filter(u => u.hasReview && u.review.feeCategory).map((user) => (
                      <TableRow
                        key={user.id}
                        hover
                        sx={{
                          transition: 'all 0.4s ease',
                          opacity: deletingUserId === user.id ? 0 : 1,
                          transform: deletingUserId === user.id ? 'scale(0.95)' : 'scale(1)',
                          backgroundColor:
                            user.review?.feeStatus === 'Pending'
                              ? '#ffebee'
                              : user.review?.feeStatus === 'Overdued'
                              ? '#fff3e0'
                              : user.review?.feeStatus === 'Completed'
                              ? '#e8f5e8'
                              : 'inherit',
                        }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar src={user.profileImageUrl} sx={{ width: 40, height: 40, mr: 2 }}>
                              <Person />
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2">{user.fullName}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={user.role} size="small" color={getRoleColor(user.role)} />
                        </TableCell>
                        <TableCell>{user.review.feeCategory}</TableCell>
                        <TableCell>₹{user.review.pendingAmount}</TableCell>
                        <TableCell>
                          {user.review.dueDate ? new Date(user.review.dueDate).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={user.review.feeStatus || 'Pending'}
                              onChange={(e) => handleUpdateFeeStatus(user, e.target.value)}
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
                            <IconButton onClick={() => openFeeDialog(user)} color="primary" size="small">
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton onClick={() => handleDeleteFees(user)} color="error" size="small">
                              <Delete fontSize="small" />
                            </IconButton>
                            {user.review.feeStatus === 'Pending' && (
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                onClick={() => handleUpdateFeeStatus(user, 'Completed')}
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
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>
          </CardContent>
        </Card>

        {/* Dialogs remain the same */}
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
                <Typography><b>Status:</b> {viewDialog.data.reviewStatus}</Typography>
                <Typography>
                  <b>Date:</b> {new Date(viewDialog.data.reviewDate).toLocaleDateString()}
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
            {reviewDialog.mode === 'create' ? 'Assign Review' : 'Edit Review'} - {selectedUser?.fullName}
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

        <Dialog open={feeDialog.open} onClose={() => setFeeDialog({ open: false })} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ background: 'linear-gradient(90deg, #1976d2, #64b5f6)', color: 'white' }}>
            Manage Fees - {selectedUser?.fullName}
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

export default DashboardManagement;