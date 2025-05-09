"use client";
import React, { FC, useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Tooltip,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { AiOutlineDelete, AiOutlineMail, AiOutlineUserAdd, AiOutlineSearch } from "react-icons/ai";
import { useTheme as useNextTheme } from "next-themes";
import { format } from "timeago.js";
import toast from "react-hot-toast";
import axios, { AxiosError } from "axios";

// Constants
const API_BASE_URL = "http://localhost:3032"; // Your backend API base URL
const IMAGE_PUBLIC_PATH = "/uploads/"; // Path where user images are served if not full URL

interface User {
  id: string | number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string; // Should be an ISO string or parsable by new Date()
  department_id?: string;
  department_name?: string;
  image?: string; // Optional user image URL
}

interface Department {
  id: string;
  department_name: string;
}

const AllUsers: FC = () => {
  const { theme: nextThemeMode } = useNextTheme();
  const [openModal, setOpenModal] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]); // Reinstated for modal
  const [formData, setFormData] = useState({
    email: "",
    name: "", // Added name field based on common user creation forms
    role: "teacher", // Default role
    department: "", // Will hold department_id
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchText, setSearchText] = useState("");

  const getAuthHeaders = useCallback(() => {
    const role = typeof window !== "undefined" ? localStorage.getItem('role') : 'admin';
    const token = typeof window !== "undefined" ? localStorage.getItem(`${role}-token`) : null; // Use role-specific token
    if (!token && typeof window !== "undefined") {
      console.warn(`Auth token for role '${role}' not found. API requests might fail or be unauthorized.`);
    }
    return { 
      'role': role || 'admin', // Send role in headers
      'Authorization': `Bearer ${token}` // Assuming Bearer token authentication
    };
  }, []);

  const fetchAllUsers = useCallback(async () => {
    setLoading(true);
    console.log('[DEBUG] fetchAllUsers: Fetch initiated.');
    try {
      const headers = getAuthHeaders();
      
      // Fetch admins/teachers - Assuming this endpoint gets both or just admins/teachers
      // If it's just admin, and teachers are separate, adjust accordingly.
      const staffResPromise = axios.get(`${API_BASE_URL}/admin/get-account`, { headers, withCredentials: true });

      // Fetch students
      const studentsResPromise = axios.get(`${API_BASE_URL}/admin/get-students`, { headers, withCredentials: true });

      // Fetch departments
      const departmentsResPromise = axios.get(`${API_BASE_URL}/admin/get-department`, { headers, withCredentials: true });
      
      const [staffRes, studentsRes, departmentsRes] = await Promise.allSettled([
          staffResPromise, studentsResPromise, departmentsResPromise
      ]);

      let combinedUsersList: User[] = [];

      // Process Staff (Admins/Teachers)
      if (staffRes.status === 'fulfilled' && staffRes.value.data?.status && staffRes.value.data.data) {
        // Assuming get-account returns a single admin or an array of staff
        const staffData = Array.isArray(staffRes.value.data.data) ? staffRes.value.data.data : [staffRes.value.data.data];
        const formattedStaff = staffData.map((staff: any) => ({
          id: staff.id,
          name: staff.name || "N/A",
          email: staff.email,
          role: staff.role || 'teacher', // Default or determine from 'type' or similar field
          status: staff.status || 'active',
          created_at: staff.created_at || new Date().toISOString(),
          image: staff.image, // Assuming image field exists
          department_id: staff.department_id,
          department_name: staff.department_name
        }));
        combinedUsersList.push(...formattedStaff);
        console.log("[DEBUG] Fetched staff users:", formattedStaff);
      } else if (staffRes.status === 'rejected') {
        console.error("[DEBUG] Fetch Staff Error:", (staffRes.reason as AxiosError).message);
        toast.error("Failed to load staff accounts.");
      }


      // Process Students
      if (studentsRes.status === 'fulfilled' && studentsRes.value.data?.status && studentsRes.value.data.results) {
        const studentUsers = studentsRes.value.data.results.map((student: any) => ({
          id: student.id,
          name: student.name || "N/A",
          email: student.email,
          role: 'student',
          status: student.status || 'active',
          created_at: student.created_at || new Date().toISOString(),
          department_id: student.department_id,
          department_name: student.department_name,
          image: student.image, // Assuming image field exists
        }));
        combinedUsersList.push(...studentUsers);
        console.log("[DEBUG] Fetched student users:", studentUsers);
      } else if (studentsRes.status === 'rejected') {
        console.error("[DEBUG] Fetch Students Error:", (studentsRes.reason as AxiosError).message);
        toast.error("Failed to load student accounts.");
      }


      // Process Departments
      if (departmentsRes.status === 'fulfilled' && departmentsRes.value.data?.status && departmentsRes.value.data.data) {
        const fetchedDepartments = departmentsRes.value.data.data.map((dept: any) => ({
            id: dept.department_id, // Assuming backend sends department_id as id
            department_name: dept.department_name
        }));
        setDepartments(fetchedDepartments);
        console.log("[DEBUG] Fetched departments:", fetchedDepartments);
      } else if (departmentsRes.status === 'rejected') {
        console.error("[DEBUG] Fetch Departments Error:", (departmentsRes.reason as AxiosError).message);
        toast.error("Failed to load departments.");
      }

      // Remove duplicates by ID (if any staff member is also listed elsewhere or IDs overlap)
      const uniqueUsers = Array.from(new Map(combinedUsersList.map(user => [user.id, user])).values());
      setUsers(uniqueUsers);
      console.log("[DEBUG] Displayed users (after processing unique):", uniqueUsers);

    } catch (error) { // Catch any unexpected errors not caught by Promise.allSettled rejections
      const axiosError = error as AxiosError;
      let errorDetail = axiosError.message;
      if (axiosError.response) {
        errorDetail = `Status ${axiosError.response.status}: ${(axiosError.response.data as any)?.message || axiosError.response.statusText}`;
      } else if (axiosError.request) {
        errorDetail = "No response from server. Check network or if backend is running.";
      }
      console.error(`[DEBUG] General Fetch All Users Error (URL: ${axiosError.config?.url}):`, errorDetail, axiosError);
      toast.error(`Failed to load all user data: ${errorDetail.substring(0, 100)}`);
      setUsers([]); // Clear users on critical failure
      setDepartments([]);
    } finally {
      setLoading(false);
      console.log('[DEBUG] fetchAllUsers: Fetch finished.');
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    console.log('[DEBUG] useEffect[]: Component mounted, calling fetchAllUsers.');
    fetchAllUsers();
  }, [fetchAllUsers]); // fetchAllUsers is memoized by useCallback

  const handleCreateUser = async () => {
    if (!formData.email || !formData.name || !formData.role) {
        toast.error("Please fill in all required fields (Name, Email, Role).");
        return;
    }
    if (formData.role === 'student' && !formData.department) {
        toast.error("Please select a department for students.");
        return;
    }

    setIsSubmitting(true);
    try {
      // Backend might expect 'name' field as well.
      const payload: any = {
        email: formData.email,
        name: formData.name, 
        role: formData.role,
      };
      if (formData.role === 'student' || formData.role === 'teacher') { // Assuming teachers can also be in departments
        payload.department_id = formData.department;
      }

      // Determine endpoint based on role
      // This logic might need adjustment based on your backend setup
      // For example, if /admin/add-account handles both admin and teacher based on 'role' in payload
      let endpoint = `${API_BASE_URL}/admin/add-account`; // Default for admin/teacher
      if (formData.role === 'student') {
        endpoint = `${API_BASE_URL}/admin/add-students`;
      }
      
      console.log("[DEBUG] Creating user with payload:", payload, "to endpoint:", endpoint);

      await axios.post(endpoint, payload, {
        headers: getAuthHeaders(),
        withCredentials: true
      });

      await fetchAllUsers();
      setOpenModal(false);
      setFormData({ email: "", name: "", role: "teacher", department: "" });
      toast.success("User created successfully!");
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to create user.";
      console.error("[DEBUG] Create User Error:", errorMsg, error);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    console.log("[DEBUG] Deleting user:", selectedUser);
    try {
      // Adjust endpoint logic if your backend differentiates admin/teacher deletion
      let endpoint = `${API_BASE_URL}/admin/delete-account/${selectedUser.id}`; // For admin/teacher
      if (selectedUser.role === 'student') {
        endpoint = `${API_BASE_URL}/admin/delete-student/${selectedUser.id}`;
      } else if (selectedUser.role === 'teacher') {
        // If teachers have a specific delete endpoint, use it. Otherwise, delete-account might handle it.
        // endpoint = `${API_BASE_URL}/admin/delete-teacher/${selectedUser.id}`; // Example
      }


      await axios.delete(endpoint, {
        headers: getAuthHeaders(),
        withCredentials: true
      });

      await fetchAllUsers();
      setDeleteOpen(false);
      setSelectedUser(null);
      toast.success("User deleted successfully!");
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorMsg = (axiosError.response?.data as any)?.message || axiosError.message || "Failed to delete user.";
      console.error("[DEBUG] Delete User Error:", errorMsg, axiosError);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (userId: User['id'], newStatus: string, role: User['role']) => {
    const originalUsers = [...users]; // For potential rollback
    // Optimistically update UI
    setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, status: newStatus as User['status'] } : u));
    
    console.log(`[DEBUG] Changing status for user ${userId} to ${newStatus}`);
    try {
      // Determine endpoint - this might need refinement based on backend
      let endpoint = `${API_BASE_URL}/admin/edit-account/${userId}`; // For admin/teacher
      if (role === 'student') {
        endpoint = `${API_BASE_URL}/admin/edit-student/${userId}`;
      } else if (role === 'teacher') {
        // endpoint = `${API_BASE_URL}/admin/edit-teacher/${userId}`; // If specific
      }

      await axios.put(endpoint,
        { status: newStatus }, // Payload
        { headers: getAuthHeaders(), withCredentials: true }
      );
      // No need to call fetchAllUsers if backend confirms success and data is already updated UI-side
      toast.success("User status updated successfully!");
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorMsg = (axiosError.response?.data as any)?.message || axiosError.message || "Failed to update status.";
      console.error("[DEBUG] Status Change Error:", errorMsg, axiosError);
      toast.error(errorMsg);
      setUsers(originalUsers); // Rollback UI on error
    }
  };

  // Filtering logic
  const filteredUsers = useMemo(() => {
    if (!searchText) return users;
    const lowerSearchText = searchText.toLowerCase();
    return users.filter(user =>
      (user.name?.toLowerCase() || '').includes(lowerSearchText) ||
      (user.email?.toLowerCase() || '').includes(lowerSearchText) ||
      (user.role?.toLowerCase() || '').includes(lowerSearchText) ||
      (user.department_name?.toLowerCase() || '').includes(lowerSearchText)
    );
  }, [users, searchText]);

  // Pagination logic
  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredUsers, page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box m={{xs: "10px", md: "20px"}} sx={{ color: 'text.primary' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h5" component="h1" fontWeight="bold">User Management</Typography>
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap" sx={{width: {xs: '100%', md: 'auto'}}}>
            <TextField
                variant="outlined" placeholder="Search users..." size="small" value={searchText}
                onChange={(e) => { setSearchText(e.target.value); setPage(0);}}
                sx={{ width: { xs: '100%', sm: 250, md: 300 }, 
                      '& .MuiOutlinedInput-root': { bgcolor: nextThemeMode === 'dark' ? 'grey.800' : 'common.white' } 
                }}
                InputProps={{ startAdornment: (<InputAdornment position="start"><AiOutlineSearch /></InputAdornment>)}}
            />
            <Button variant="contained" color="primary" startIcon={<AiOutlineUserAdd />}
              onClick={() => { 
                  setFormData({ email: "", name: "", role: "teacher", department: "" }); 
                  setOpenModal(true); 
              }}
              sx={{ width: { xs: '100%', sm: 'auto' }, textTransform: 'none', py: 1.1 }}
            > Add New User </Button>
        </Box>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2,
          boxShadow: nextThemeMode === 'dark' ? '0 4px 20px 0 rgba(0,0,0,0.35)' : '0 4px 20px 0 rgba(0,0,0,0.08)',
          bgcolor: nextThemeMode === 'dark' ? 'grey.900' : 'common.white'
      }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 280px)' }}> {/* Adjust maxHeight as needed */}
          <Table stickyHeader aria-label="users table">
            <TableHead sx={{ "& .MuiTableCell-head": {
                    backgroundColor: nextThemeMode === "dark" ? "rgba(255, 255, 255, 0.08)" : "grey.100", // Darker header for dark mode
                    color: "text.primary", fontWeight: 600,
                    borderBottom: `1px solid ${nextThemeMode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'grey.300'}`
            }}}>
              <TableRow>
                <TableCell sx={{ minWidth: 230, width: '30%' }}>User</TableCell>
                <TableCell sx={{ minWidth: 110, width: '15%' }}>Role</TableCell>
                <TableCell sx={{ minWidth: 150, width: '20%' }}>Department</TableCell>
                <TableCell sx={{ minWidth: 140, width: '15%' }}>Status</TableCell>
                <TableCell sx={{ minWidth: 140, width: '10%' }}>Joined</TableCell>
                <TableCell align="center" sx={{ minWidth: 100, width: '10%' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody sx={{ "& .MuiTableCell-body": { borderColor: nextThemeMode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'grey.200' }}}>
              {loading ? ( // Show loader if loading is true
                <TableRow><TableCell colSpan={6} align="center" sx={{py: 5}}><CircularProgress /></TableCell></TableRow>
              ) : paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <TableRow hover key={user.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={user.image ? (user.image.startsWith('http') ? user.image : `${API_BASE_URL}${IMAGE_PUBLIC_PATH}${user.image}`) : undefined}
                          sx={{ bgcolor: user.image ? 'transparent' : 'primary.light', width: 38, height: 38, fontSize: '1rem', border: user.image ? '1px solid rgba(0,0,0,0.1)' : 'none' }}
                        > {user.name?.[0]?.toUpperCase() || 'U'} </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="500" component="div" noWrap title={user.name}> {user.name || "N/A"} </Typography>
                          <Typography variant="caption" color="text.secondary" component="div" noWrap title={user.email}> {user.email || "N/A"} </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "N/A"}
                        size="small"
                        color={ user.role === "admin" ? "error" : user.role === "teacher" ? "primary" : user.role === "student" ? "secondary" : "default"}
                        sx={{ fontWeight: 500, borderRadius: '6px', textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>{user.department_name || "N/A"}</TableCell>
                    <TableCell>
                      <FormControl fullWidth size="small" variant="outlined" sx={{minWidth: 120}}>
                        <Select value={user.status || "active"}
                          onChange={(e) => handleStatusChange(user.id, e.target.value, user.role)}
                          sx={{ fontSize: '0.875rem', '.MuiSelect-select': { py: '6px', pr: '24px !important' },
                                bgcolor: nextThemeMode === 'dark' ? 'grey.800' : 'common.white'
                          }}
                        >
                          <MenuItem value="active" sx={{fontSize: '0.875rem'}}>Active</MenuItem>
                          <MenuItem value="inactive" sx={{fontSize: '0.875rem'}}>Inactive</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>{user.created_at ? format(new Date(user.created_at)) : "N/A"}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Send Email"><IconButton component="a" href={`mailto:${user.email}`} color="primary" size="small" sx={{mr:0.5}}><AiOutlineMail /></IconButton></Tooltip>
                      <Tooltip title="Delete User"><IconButton onClick={() => { setDeleteOpen(true); setSelectedUser(user);}} color="error" size="small"><AiOutlineDelete /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography variant="subtitle1" color="text.secondary">{searchText ? "No users match your search criteria." : "No users found."}</Typography>
                   {!searchText && !loading && <Typography variant="body2" color="text.secondary" sx={{mt:1}}>Try adding a new user!</Typography>}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {filteredUsers.length > 0 && ( // Only show pagination if there are users to paginate
          <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]} component="div" count={filteredUsers.length}
              rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ borderTop: `1px solid ${nextThemeMode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'grey.300'}`}}
          />
        )}
      </Paper>

      {/* Create User Modal */}
      <Modal open={openModal} onClose={() => setOpenModal(false)} aria-labelledby="add-user-modal-title">
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
                   bgcolor: 'background.paper', boxShadow: 24, p: {xs: 2.5, sm: 4}, borderRadius: 2, 
                   width: { xs: '90%', sm: 450 }, outline: 'none' }}>
          <Typography id="add-user-modal-title" variant="h6" component="h2" textAlign="center" mb={3} fontWeight="bold">
            Add New User
          </Typography>
          <TextField fullWidth label="Full Name" variant="outlined" value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }} required />
          <TextField fullWidth label="Email Address" variant="outlined" value={formData.email} type="email"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            sx={{ mb: 2 }} required />
          <FormControl fullWidth sx={{ mb: 2 }} required>
            <InputLabel>Role</InputLabel>
            <Select value={formData.role} label="Role"
              onChange={(e) => setFormData({ ...formData, role: e.target.value, department: "" })} // Reset department if role changes
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="teacher">Teacher</MenuItem>
              <MenuItem value="student">Student</MenuItem>
            </Select>
          </FormControl>
          { (formData.role === 'student' || formData.role === 'teacher') && departments.length > 0 && ( // Show department only if needed and available
            <FormControl fullWidth sx={{ mb: 3 }} required={formData.role === 'student'}>
              <InputLabel>Department</InputLabel>
              <Select value={formData.department} label="Department"
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.department_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          { (formData.role === 'student' || formData.role === 'teacher') && departments.length === 0 && (
              <Typography color="text.secondary" sx={{mb: 3}}>No departments available to assign.</Typography>
          )}
          <Box display="flex" justifyContent="flex-end" gap={2} mt={1}>
            <Button onClick={() => setOpenModal(false)} color="inherit" sx={{textTransform: 'none'}}>Cancel</Button>
            <Button variant="contained" color="primary" onClick={handleCreateUser} disabled={isSubmitting} sx={{textTransform: 'none'}}>
              {isSubmitting ? <CircularProgress size={24} color="inherit"/> : "Create User"}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={deleteOpen} onClose={() => { setDeleteOpen(false); setSelectedUser(null);}} aria-labelledby="delete-user-modal-title">
         <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
                    bgcolor: 'background.paper', boxShadow: 24, p: {xs: 2.5, sm: 3.5}, borderRadius: 2, 
                    width: { xs: '90%', sm: 400 }, outline: 'none' }}>
          <Typography id="delete-user-modal-title" variant="h6" component="h2" textAlign="center" mb={2} fontWeight="bold"> 🚨 Confirm Deletion </Typography>
          <Typography textAlign="center" mb={3} color="text.secondary"> Are you sure you want to delete {selectedUser?.name ? `${selectedUser.name} (${selectedUser.email})` : 'this user'}? This action cannot be undone. </Typography>
          <Box display="flex" justifyContent="center" gap={2}>
            <Button onClick={() => { setDeleteOpen(false); setSelectedUser(null);}} color="inherit" sx={{textTransform: 'none'}}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleDeleteUser} disabled={isSubmitting} sx={{textTransform: 'none'}}>
             {isSubmitting ? <CircularProgress size={24} color="inherit"/> : "Confirm Delete"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default AllUsers;