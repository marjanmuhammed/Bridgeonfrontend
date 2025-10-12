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
      try {
        await adminReviewApi.deleteReview(user.id);
        showSnackbar('Review deleted');
        loadUserProfiles();
      } catch {
        showSnackbar('Error deleting review', 'error');
      }
    }
  };

  const openViewReview = (user) => {
    setViewDialog({ open: true, data: user.review });
  };

  const openFeeDialog = (user) => {
    setSelectedUser(user);
    if (user.review && user.review.feeCategory) {
      setFeeData({
        feeCategory: user.review.feeCategory,
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
      await adminReviewApi.addOrUpdateFees(selectedUser.id, feeData);
      showSnackbar('Fees updated successfully');
      setFeeDialog({ open: false });
      loadUserProfiles();
    } catch {
      showSnackbar('Error updating fees', 'error');
    }
  };

  const handleDeleteFees = async (user) => {
    if (window.confirm(`Delete fees for ${user.fullName}?`)) {
      try {
        await adminReviewApi.deleteFees(user.id);
        showSnackbar('Fees deleted');
        loadUserProfiles();
      } catch {
        showSnackbar('Error deleting fees', 'error');
      }
    }
  };

  const handleUpdateFeeStatus = async (user, newStatus) => {
    try {
      await adminReviewApi.updateFeeStatus(user.id, newStatus);
      showSnackbar('Fee status updated');
      loadUserProfiles();
    } catch {
      showSnackbar('Error updating fee status', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Assigned': return 'success';
      case 'Completed': return 'success';
      case 'Pending': return 'warning';
      case 'Not Assigned': return 'error';
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

  const filteredUsers = users.filter(
    (user) =>
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box
          sx={{
            background: "linear-gradient(135deg, #2196f3 30%, #21cbf3 90%)",
            p: 3,
            borderRadius: 3,
            boxShadow: "0 4px 20px rgba(33, 203, 243, 0.3)",
            mb: 4
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
            Admin Review Dashboard
          </Typography>
          <Typography sx={{ color: 'white', opacity: 0.9 }}>
            Manage user reviews and fee information easily
          </Typography>
        </Box>

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

            {/* --- 🔍 Search --- */}
            <Box sx={{ mt: 3, mb: 2 }}>
              <TextField
                label="Search by name or email"
                variant="outlined"
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Box>

            {/* --- User Reviews --- */}
            <TabPanel value={tabValue} index={0}>
              <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0 6px 20px rgba(0,0,0,0.08)" }}>
                <Table>
                  <TableHead sx={{ backgroundColor: '#e3f2fd' }}>
                    <TableRow>
                      <TableCell><b>User</b></TableCell>
                      <TableCell><b>Email</b></TableCell>
                      <TableCell><b>Role</b></TableCell>
                      <TableCell><b>Review Status</b></TableCell>
                      <TableCell><b>Review Date</b></TableCell>
                      <TableCell><b>Actions</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} hover>
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
                        <TableCell>
                          <Box display="flex" gap={1}>
                            {!user.hasReview ? (
                              <Button
                                variant="contained"
                                startIcon={<Assignment />}
                                onClick={() => openCreateReview(user)}
                                size="small"
                              >
                                Assign
                              </Button>
                            ) : (
                              <>
                                <IconButton color="primary" onClick={() => openViewReview(user)}>
                                  <Visibility />
                                </IconButton>
                                <IconButton color="secondary" onClick={() => openEditReview(user)}>
                                  <Edit />
                                </IconButton>
                                <IconButton color="error" onClick={() => handleDeleteReview(user)}>
                                  <Delete />
                                </IconButton>
                              <Button
  variant="contained"
  startIcon={<Payment />}
  onClick={() => openFeeDialog(user)}
  size="small"
  sx={{ ml: 1, bgcolor: 'red', '&:hover': { bgcolor: '#c62828' } }}
>
  Add Fees
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

            {/* --- Fee Management --- */}
            <TabPanel value={tabValue} index={1}>
              <TableContainer
                component={Paper}
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
                }}
              >
                <Table>
                  <TableHead sx={{ backgroundColor: '#f1f9ff' }}>
                    <TableRow>
                      <TableCell><b>User</b></TableCell>
                      <TableCell><b>Role</b></TableCell>
                      <TableCell><b>Fee Category</b></TableCell>
                      <TableCell><b>Amount</b></TableCell>
                      <TableCell><b>Due Date</b></TableCell>
                      <TableCell><b>Status</b></TableCell>
                      <TableCell><b>Actions</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.filter(u => u.hasReview && u.review.feeCategory).map((user) => (
                      <TableRow
                        key={user.id}
                        hover
                        sx={{
                          backgroundColor: user.review.feeStatus === 'Pending' ? '#ffebee' : 'inherit'
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
                        <TableCell>{user.review.dueDate ? new Date(user.review.dueDate).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.review.feeStatus}
                            size="small"
                            color={getStatusColor(user.review.feeStatus)}
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <IconButton onClick={() => openFeeDialog(user)} color="primary">
                              <Edit />
                            </IconButton>
                            <IconButton onClick={() => handleDeleteFees(user)} color="error">
                              <Delete />
                            </IconButton>
                            {user.review.feeStatus === 'Pending' && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="success"
                                onClick={() => handleUpdateFeeStatus(user, 'Completed')}
                              >
                                Mark Paid
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

        {/* --- View Review Dialog --- */}
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

        {/* --- Review Dialog --- */}
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

        {/* --- Fee Dialog --- */}
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
                onChange={(e) => setFeeData({ ...feeData, pendingAmount: parseFloat(e.target.value) })}
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
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Overdue">Overdue</MenuItem>
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