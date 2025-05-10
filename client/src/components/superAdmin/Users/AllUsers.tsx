"use client";
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import axios, { AxiosError } from 'axios';
import { useTheme as useNextTheme } from 'next-themes';
import toast from 'react-hot-toast';
import {
  AiOutlineDelete,
  AiOutlineMail,
  AiOutlineSearch,
  AiOutlineUserAdd,
} from 'react-icons/ai';
import { format } from 'timeago.js';

import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Modal,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

interface User {
  id: string | number;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student' | string;
  status: 'active' | 'inactive' | string;
  created_at?: string;
  image?: string;
  department_id?: string | number; // For student creation and data
  department_name?: string;      // For student data
}

interface Department { // Reinstated for the modal's dropdown
  id: string | number;
  department_name: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3032";
const IMAGE_PUBLIC_PATH = "/image/"; // Adjust if your images are served from /public/image/

const AllUsers: FC = () => {
  const { theme: nextThemeMode } = useNextTheme();
  const [openModal, setOpenModal] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({ // department field reinstated
    email: "",
    name: "",
    role: "teacher",
    department: "", // Department ID for student creation
  });
  const [departments, setDepartments] = useState<Department[]>([]); // Reinstated
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchText, setSearchText] = useState("");

  const getAuthHeaders = useCallback(() => {
    const role = typeof window !== "undefined" ? localStorage.getItem('role') : 'admin';
    const token = typeof window !== "undefined" ? localStorage.getItem(`${role}-token`) : null;
    if (!token && typeof window !== "undefined") {
      console.warn("Auth token not found. API requests might fail or be unauthorized.");
    }
    return { 'role': role || 'admin', [`${role}-token`]: token || '' };
  }, []);

  const fetchAllUsers = useCallback(async () => {
    console.log('[DEBUG] fetchAllUsers: Starting fetch...');
    setLoading(true);
    let combinedUsersList: User[] = [];
    try {
      const headers = getAuthHeaders();
      if (!headers[`${headers.role}-token`]) {
        toast.error("Authentication missing. Cannot fetch user data.");
        console.error('[DEBUG] fetchAllUsers: Authentication token missing, exiting fetch.');
        setLoading(false); setUsers([]); return;
      }
      console.log('[DEBUG] fetchAllUsers: Proceeding to make API calls with headers:', headers);

      // --- API URLS: Assuming all routes in supperAdminRouter are prefixed with /admin ---
      const loggedInAccountApiUrl = `${API_BASE_URL}/admin/get-account`;
      const studentsApiUrl = `${API_BASE_URL}/admin/get-student`;
      const departmentsApiUrl = `${API_BASE_URL}/admin/get-departments`;
      // ---

      console.log(`[DEBUG] LoggedInAccount API URL: ${loggedInAccountApiUrl}`);
      console.log(`[DEBUG] Students API URL: ${studentsApiUrl}`);
      console.log(`[DEBUG] Departments API URL: ${departmentsApiUrl}`);

      const loggedInAccountPromise = axios.get(loggedInAccountApiUrl, { headers, withCredentials: true });
      const studentsPromise = axios.get(studentsApiUrl, { headers, withCredentials: true });
      const departmentsPromise = axios.get(departmentsApiUrl, { headers, withCredentials: true }); // Reinstated

      const [loggedInAccountRes, studentsRes, departmentsRes] = await Promise.all([ // Reinstated departmentsRes
        loggedInAccountPromise, studentsPromise, departmentsPromise
      ]);
      console.log('[DEBUG] All API calls completed.');

      if (loggedInAccountRes.data?.status && loggedInAccountRes.data?.data) {
        const accountData = loggedInAccountRes.data.data;
        combinedUsersList.push({
          id: accountData.id, name: accountData.name, email: accountData.email,
          role: headers.role as User['role'], status: 'active',
          created_at: accountData.created_at || new Date().toISOString(), image: accountData.image,
        });
      } else {
        console.warn("[DEBUG] /admin/get-account response issue:", loggedInAccountRes.data);
      }

      const studentDataArray = Array.isArray(studentsRes.data) ? studentsRes.data : [];
      const studentUsers: User[] = studentDataArray.map((student: any) => ({
        id: student.id, name: student.name, email: student.email, role: 'student',
        status: student.status || 'active', created_at: student.created_at,
        department_id: student.department_id, // From backend
        department_name: student.department_name, // From backend JOIN
        image: student.image,
      }));
      combinedUsersList.push(...studentUsers);

      // Process Departments for the modal
      setDepartments(Array.isArray(departmentsRes.data) ? departmentsRes.data : (departmentsRes.data?.departments || []));
      console.log("[DEBUG] Fetched Departments:", departmentsRes.data);


      const uniqueUsers = Array.from(new Map(combinedUsersList.map(user => [user.id, user])).values());
      setUsers(uniqueUsers);
      console.log("[DEBUG] Displayed users:", uniqueUsers);

    } catch (error) {
      const axiosError = error as AxiosError;
      let errorDetail = axiosError.message;
      if (axiosError.response) { errorDetail = `Status ${axiosError.response.status}: ${(axiosError.response.data as any)?.message || axiosError.response.statusText}`; }
      else if (axiosError.request) { errorDetail = "No response from server."; }
      console.error(`[DEBUG] Fetch All Users Error (URL: ${axiosError.config?.url}):`, errorDetail, axiosError);
      toast.error(`Load users failed: ${errorDetail.substring(0,100)}`);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);


  const handleCreateUser = async () => {
    if (!formData.email.trim() || !formData.name.trim()) {
        toast.error("Name and Email are required."); return;
    }
    if (formData.role === 'student' && !formData.department) { // Department is required for students
        toast.error("Department is required for students."); return;
    }
    setIsSubmitting(true);
    try {
      // All these routes are under /admin as per your app.js
      const endpoint = formData.role === 'student' ? `${API_BASE_URL}/admin/add-students` : `${API_BASE_URL}/admin/add-account`;
      const payload: any = { email: formData.email, name: formData.name, role: formData.role };

      if (formData.role === 'student' && formData.department) {
        payload.department_id = formData.department;
      }
      // Note: /admin/add-account (for teachers) might not use department_id.
      // If it can, and you want to send it for teachers:
      // else if (formData.role === 'teacher' && formData.department) {
      //   payload.department_id = formData.department;
      // }

      await axios.post(endpoint, payload, { headers: getAuthHeaders(), withCredentials: true });
      await fetchAllUsers();
      setOpenModal(false);
      setFormData({ email: "", name: "", role: "teacher", department: "" }); // Reset form
      toast.success("User created successfully!");
    } catch (error) {
      const axiosError = error as AxiosError;
      toast.error((axiosError.response?.data as any)?.message || "Failed to create user.");
      console.error("Create user error:", axiosError.response?.data || axiosError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return; setIsSubmitting(true);
    try {
      let endpoint = '';
      if (selectedUser.role === 'student') endpoint = `${API_BASE_URL}/admin/delete-student/${selectedUser.id}`;
      else if (selectedUser.role === 'teacher' || selectedUser.role === 'admin') endpoint = `${API_BASE_URL}/admin/delete-teacher/${selectedUser.id}`;
      else { toast.error("Unknown user role for deletion."); setIsSubmitting(false); return; }
      await axios.delete(endpoint, { headers: getAuthHeaders(), withCredentials: true });
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      setDeleteOpen(false); setSelectedUser(null);
      toast.success("User deleted successfully!");
    } catch (error) {
      const axiosError = error as AxiosError;
      toast.error((axiosError.response?.data as any)?.message || "Failed to delete user.");
    } finally { setIsSubmitting(false); }
  };

  const handleStatusChange = async (userId: User['id'], newStatus: string, role: User['role']) => {
    const originalUsers = [...users];
    setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, status: newStatus as User['status'] } : u));
    try {
      let endpoint = '';
      if (role === 'student') endpoint = `${API_BASE_URL}/admin/edit-student/${userId}`;
      else if (role === 'teacher' || role === 'admin') endpoint = `${API_BASE_URL}/admin/edit-teacher/${userId}`;
      else { toast.error("Unknown user role for status update."); setUsers(originalUsers); return; }
      await axios.put(endpoint, { status: newStatus }, { headers: getAuthHeaders(), withCredentials: true });
      toast.success("Status updated successfully!");
    } catch (error) {
      const axiosError = error as AxiosError;
      toast.error((axiosError.response?.data as any)?.message || "Failed to update status.");
      setUsers(originalUsers);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!users) return []; if (!searchText) return users;
    const lowerSearchText = searchText.toLowerCase();
    return users.filter(user =>
      user.name?.toLowerCase().includes(lowerSearchText) ||
      user.email?.toLowerCase().includes(lowerSearchText) ||
      user.role?.toLowerCase().includes(lowerSearchText) ||
      user.department_name?.toLowerCase().includes(lowerSearchText) // Students have department_name
    );
  }, [users, searchText]);

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10)); setPage(0);
  };
  const paginatedUsers = useMemo(() => {
    if (!filteredUsers) return [];
    return filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredUsers, page, rowsPerPage]);


  if (loading && users.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 100px)', p:3 }}>
        <CircularProgress size={50} /><Typography sx={{ml: 2, color: 'text.secondary'}}>Loading users...</Typography>
      </Box>
    );
  }

  return (
    <Box m={{xs: "10px", md: "20px"}}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h5" component="h1" fontWeight="bold" color="text.primary">User Management</Typography>
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap" sx={{width: {xs: '100%', md: 'auto'}}}>
            <TextField
                variant="outlined" placeholder="Search users..." size="small" value={searchText}
                onChange={(e) => { setSearchText(e.target.value); setPage(0);}}
                sx={{ width: { xs: '100%', sm: 250, md: 300 } }}
                InputProps={{ startAdornment: (<InputAdornment position="start"><AiOutlineSearch /></InputAdornment>)}}
            />
            <Button variant="contained" color="primary" startIcon={<AiOutlineUserAdd />}
              onClick={() => { setFormData({ email: "", name: "", role: "teacher", department: "" }); setOpenModal(true); }}
              sx={{ width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}
            > Add New User </Button>
        </Box>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2, boxShadow: nextThemeMode === 'dark' ? '0 4px 20px 0 rgba(0,0,0,0.35)' : '0 4px 20px 0 rgba(0,0,0,0.08)' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 280px)' }}>
          <Table stickyHeader aria-label="users table">
            <TableHead sx={{ "& .MuiTableCell-head": { backgroundColor: nextThemeMode === "dark" ? "rgba(255, 255, 255, 0.05)" : "grey.100", color: "text.primary", fontWeight: 600, borderBottom: `1px solid ${nextThemeMode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'grey.300'}` }}}>
              <TableRow>
                <TableCell sx={{ minWidth: 230, width: '30%' }}>User</TableCell>
                <TableCell sx={{ minWidth: 110, width: '15%' }}>Role</TableCell>
                <TableCell sx={{ minWidth: 160, width: '20%' }}>Department</TableCell>
                <TableCell sx={{ minWidth: 140, width: '15%' }}>Status</TableCell>
                <TableCell sx={{ minWidth: 140, width: '15%' }}>Joined</TableCell>
                <TableCell align="center" sx={{ minWidth: 100, width: '10%' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody sx={{ "& .MuiTableCell-body": { borderColor: nextThemeMode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'grey.200' }}}>
              {loading && paginatedUsers.length === 0 && users.length > 0 ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{py: 3}}><CircularProgress size={24} /></TableCell></TableRow>
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
                          <Typography variant="caption" color="text.secondary" component="div" noWrap title={user.email}> {user.email} </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "N/A"}
                        size="small"
                        color={ user.role === "admin" ? "error" : user.role === "teacher" ? "primary" : user.role === "student" ? "secondary" : "default"}
                        sx={{ fontWeight: 500, borderRadius: '6px' }}
                      />
                    </TableCell>
                    {/* Department cell - shows department_name for students, N/A for others from /get-account */}
                    <TableCell>{user.department_name || "N/A"}</TableCell>
                    <TableCell>
                      <FormControl fullWidth size="small" variant="outlined" sx={{minWidth: 120}}>
                        <Select value={user.status || "active"}
                          onChange={(e) => handleStatusChange(user.id, e.target.value, user.role)}
                          sx={{ fontSize: '0.875rem', '.MuiSelect-select': { py: '6px', pr: '24px !important' } }}
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
                   {!searchText && !loading && <Typography variant="body2" color="text.secondary" sx={{mt:1}}>Try adding new users or check active filters.</Typography>}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {filteredUsers.length > rowsPerPage && (
          <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]} component="div" count={filteredUsers.length}
              rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ borderTop: `1px solid ${nextThemeMode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'grey.300'}`}}
          />
        )}
      </Paper>

      {/* Create User Modal - Department field is now conditional */}
      <Modal open={openModal} onClose={() => setOpenModal(false)} aria-labelledby="add-user-modal-title">
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', boxShadow: 24, p: {xs: 2.5, sm: 3.5}, borderRadius: 2, width: { xs: '90%', sm: 450 }, outline: 'none' }}>
          <Typography id="add-user-modal-title" variant="h6" component="h2" textAlign="center" mb={3} fontWeight="bold"> Add New User </Typography>
          <TextField fullWidth label="Full Name" variant="outlined" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} sx={{ mb: 2 }} required autoFocus />
          <TextField fullWidth label="Email Address" type="email" variant="outlined" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} sx={{ mb: 2 }} required />
          <FormControl fullWidth sx={{ mb: (formData.role === 'student' ? 2 : 3) }}> {/* Adjust margin based on department visibility */}
            <InputLabel id="role-select-label">Role *</InputLabel>
            <Select labelId="role-select-label" value={formData.role} label="Role *"
              onChange={(e) => {
                const newRole = e.target.value;
                // Clear department if role is not student, otherwise keep current selection (if any)
                setFormData({ ...formData, role: newRole, department: newRole === 'student' ? formData.department : "" });
              }}
              required
            >
              <MenuItem value="teacher">Teacher</MenuItem>
              <MenuItem value="student">Student</MenuItem>
            </Select>
          </FormControl>
          {/* Department select is only shown AND required for 'student' role */}
          {formData.role === 'student' && (
            <FormControl fullWidth sx={{ mb: 3 }} required>
              <InputLabel id="department-select-label">Department *</InputLabel>
              <Select labelId="department-select-label" value={formData.department} label="Department *"
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                <MenuItem value=""><em>Select Department</em></MenuItem>
                {departments.map((dept) => (<MenuItem key={dept.id} value={dept.id}>{dept.department_name}</MenuItem>))}
              </Select>
            </FormControl>
          )}
          <Box display="flex" justifyContent="flex-end" gap={1.5}>
            <Button onClick={() => setOpenModal(false)} color="inherit" sx={{textTransform: 'none'}}>Cancel</Button>
            <Button variant="contained" onClick={handleCreateUser} disabled={isSubmitting} sx={{textTransform: 'none'}}>
              {isSubmitting ? <CircularProgress size={24} color="inherit"/> : "Create User"}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} aria-labelledby="delete-user-modal-title">
         <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', boxShadow: 24, p: {xs: 2.5, sm: 3.5}, borderRadius: 2, width: { xs: '90%', sm: 400 }, outline: 'none' }}>
          <Typography id="delete-user-modal-title" variant="h6" component="h2" textAlign="center" mb={2} fontWeight="bold"> 🚨 Confirm Deletion </Typography>
          <Typography textAlign="center" mb={3} color="text.secondary"> Are you sure you want to delete {selectedUser?.name ? `${selectedUser.name} (${selectedUser.email})` : 'this user'}? This action cannot be undone. </Typography>
          <Box display="flex" justifyContent="center" gap={2}>
            <Button onClick={() => setDeleteOpen(false)} color="inherit" sx={{textTransform: 'none'}}>Cancel</Button>
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