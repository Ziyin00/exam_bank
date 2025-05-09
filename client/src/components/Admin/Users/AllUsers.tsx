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

interface User {
  id: string | number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  department_id?: string;
  department_name?: string;
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
  const [formData, setFormData] = useState({
    email: "",
    role: "teacher",
    department: "",
  });
  // const [departments, setDepartments] = useState<Department[]>([]); // Departments state removed
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

  const fetchAllUsers = async () => {
    try {
      // Fetch admins/teachers
      const adminRes = await axios.get('http://localhost:3032/admin/get-account', {
        headers: getAuthHeaders(),
        withCredentials: true
      });

      // Fetch students
      const studentsRes = await axios.get('http://localhost:3032/admin/get-students', {
        headers: getAuthHeaders(),
        withCredentials: true
      });

      // Fetch departments
      const departmentsRes = await axios.get('http://localhost:3032/admin/get-department', {
        headers: getAuthHeaders(),
        withCredentials: true
      });

      // Format admin/teacher data
      const adminUser = adminRes.data.status && adminRes.data.data ? {
        id: adminRes.data.data.id,
        name: adminRes.data.data.name,
        email: adminRes.data.data.email,
        role: 'admin', // Or get from response if available
        status: 'active', // Default value as it's not in the response
        created_at: new Date().toISOString(), // Default as it's not in the response
      } : [];

      // Format student data
      const studentUsers = studentsRes.data?.results?.map((student) => ({
        id: student.id,
        name: student.name,
        email: student.email,
        role: 'student',
        status: student.status || 'active', // Use status if available, otherwise default
        created_at: student.created_at,
        department_id: student.department_id,
        department_name: student.department_name
      })) || [];

      // Combine users
      setUsers([adminUser, ...studentUsers].filter(Boolean));

      // setDepartments removed

      const uniqueUsers = Array.from(new Map(combinedUsersList.map(user => [user.id, user])).values());
      setUsers(uniqueUsers);
      console.log("[DEBUG] Displayed users (after processing):", uniqueUsers);

    } catch (error) {
      const axiosError = error as AxiosError;
      let errorDetail = axiosError.message;
      if (axiosError.response) {
        errorDetail = `Status ${axiosError.response.status}: ${(axiosError.response.data as any)?.message || axiosError.response.statusText}`;
      } else if (axiosError.request) {
        errorDetail = "No response from server. Check network or if backend is running.";
      }
      console.error(`[DEBUG] Fetch All Users Error (URL: ${axiosError.config?.url}):`, errorDetail, axiosError);
      toast.error(`Load failed: ${errorDetail.substring(0, 100)}`);
      setUsers([]);
    } finally {
      setLoading(false);
      console.log('[DEBUG] fetchAllUsers: Fetch finished.');
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    console.log('[DEBUG] useEffect[]: Component mounted, calling fetchAllUsers.');
    fetchAllUsers();
  }, [fetchAllUsers]);


  const handleCreateUser = async () => {
    try {
      const endpoint = formData.role === 'student'
        ? 'http://localhost:3032/admin/add-students'
        : 'http://localhost:3032/admin/add-account';

      await axios.post(endpoint, {
        email: formData.email,
        role: formData.role,
        department_id: formData.department
      }, {
        headers: getAuthHeaders(),
        withCredentials: true
      });

      await fetchAllUsers(); // Refresh all users
      setOpenModal(false);
      setFormData({ email: "", role: "teacher", department: "" });
      toast.success("User created successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create user");
    }
  };

  // handleDeleteUser and handleStatusChange remain the same as they don't directly use the 'departments' state
  // or the department form field. They operate on user.id and user.role.
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      const endpoint = selectedUser.role === 'student'
        ? `http://localhost:3032/admin/delete-student/${selectedUser.id}`
        : `http://localhost:3032/admin/delete-teacher/${selectedUser.id}`;

      await axios.delete(endpoint, {
        headers: getAuthHeaders(),
        withCredentials: true
      });

      await fetchAllUsers(); // Refresh all users
      setDeleteOpen(false);
      toast.success("User deleted successfully");
    } catch (error) {
      const axiosError = error as AxiosError;
      toast.error((axiosError.response?.data as any)?.message || "Failed to delete user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (userId: User['id'], newStatus: string, role: User['role']) => {
    const originalUsers = [...users];
    setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, status: newStatus as User['status'] } : u));
    try {
      const endpoint = role === 'student'
        ? `http://localhost:3032/admin/edit-student/${userId}`
        : `http://localhost:3032/admin/edit-teacher/${userId}`;

      await axios.put(endpoint,
        { status: newStatus },
        { headers: getAuthHeaders(), withCredentials: true }
      );

      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      toast.success("Status updated successfully");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", flex: 0.3 },
    {
      field: "name",
      headerName: "Name",
      flex: 0.5,
      renderCell: (params) => (
        <div className="flex items-center gap-3">
          <Avatar>{params.value?.[0] || 'U'}</Avatar>
          <div>
            <p className="font-medium">{params.value}</p>
            <p className="text-xs text-gray-500">{params.row.email}</p>
          </div>
        </div>
      ),
    },
    {
      field: "role",
      headerName: "Role",
      flex: 0.3,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === "admin" ? "primary" :
            params.value === "teacher" ? "secondary" : "default"}
          className="capitalize"
        />
      ),
    },
    {
      field: "department_name",
      headerName: "Department",
      flex: 0.4,
      valueGetter: (params) => params.row.department_name || "N/A",
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.3,
      renderCell: (params) => (
        <Select
          value={params.value || "active"}
          onChange={(e) => handleStatusChange(params.row.id, e.target.value, params.row.role)}
          size="small"
          className="w-32"
        >
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </Select>
      ),
    },
    {
      field: "created_at",
      headerName: "Joined",
      flex: 0.4,
      valueFormatter: (params) => params.value ? format(new Date(params.value)) : "N/A",
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.4,
      renderCell: (params) => (
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setDeleteOpen(true);
              setSelectedUser(params.row);
            }}
            color="error"
          >
            <AiOutlineDelete />
          </Button>
          <Button
            href={`mailto:${params.row.email}`}
            color="info"
            className="dark:text-blue-400"
          >
            <AiOutlineMail />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Box m={{xs: "10px", md: "20px"}}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h5" component="h1" fontWeight="bold" color="text.primary">User Management</Typography>
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap" sx={{width: {xs: '100%', md: 'auto'}}}>
            <TextField
                variant="outlined" placeholder="Search name, email, role..." size="small" value={searchText}
                onChange={(e) => { setSearchText(e.target.value); setPage(0);}}
                sx={{ width: { xs: '100%', sm: 250, md: 300 } }}
                InputProps={{ startAdornment: (<InputAdornment position="start"><AiOutlineSearch /></InputAdornment>)}}
            />
            <Button variant="contained" color="primary" startIcon={<AiOutlineUserAdd />}
              onClick={() => { setFormData({ email: "", name: "", role: "teacher" /* department removed */ }); setOpenModal(true); }}
              sx={{ width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}
            > Add New User </Button>
        </Box>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2,
          boxShadow: nextThemeMode === 'dark' ? '0 4px 20px 0 rgba(0,0,0,0.35)' : '0 4px 20px 0 rgba(0,0,0,0.08)'
      }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 280px)' }}>
          <Table stickyHeader aria-label="users table">
            <TableHead sx={{ "& .MuiTableCell-head": {
                    backgroundColor: nextThemeMode === "dark" ? "rgba(255, 255, 255, 0.05)" : "grey.100",
                    color: "text.primary", fontWeight: 600,
                    borderBottom: `1px solid ${nextThemeMode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'grey.300'}`
            }}}>
              <TableRow>
                <TableCell sx={{ minWidth: 230, width: '35%' }}>User</TableCell> {/* Adjusted width */}
                <TableCell sx={{ minWidth: 110, width: '20%' }}>Role</TableCell> {/* Adjusted width */}
                {/* Department Column Removed */}
                <TableCell sx={{ minWidth: 140, width: '20%' }}>Status</TableCell> {/* Adjusted width */}
                <TableCell sx={{ minWidth: 140, width: '15%' }}>Joined</TableCell> {/* Adjusted width */}
                <TableCell align="center" sx={{ minWidth: 100, width: '10%' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody sx={{ "& .MuiTableCell-body": { borderColor: nextThemeMode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'grey.200' }}}>
              {loading && paginatedUsers.length === 0 && users.length > 0 ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{py: 3}}><CircularProgress size={24} /></TableCell></TableRow> // Adjusted colSpan
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
                    {/* Department Cell Removed */}
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
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}> {/* Adjusted colSpan */}
                    <Typography variant="subtitle1" color="text.secondary">{searchText ? "No users match your search criteria." : "No users found."}</Typography>
                   {!searchText && !loading && <Typography variant="body2" color="text.secondary" sx={{mt:1}}>Try adding a new user!</Typography>}
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

      {/* Create User Modal */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-6 rounded-xl w-[90%] max-w-md">
          <Typography variant="h5" className="text-center mb-6 dark:text-white">
            Add New User
          </Typography>
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="mb-4 dark:text-white"
          />
          <FormControl fullWidth className="mb-4">
            <InputLabel className="dark:text-white">Role</InputLabel>
            <Select
              value={formData.role}
              label="Role"
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="dark:text-white"
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="teacher">Teacher</MenuItem>
              <MenuItem value="student">Student</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth className="mb-6">
            <InputLabel className="dark:text-white">Department</InputLabel>
            <Select
              value={formData.department}
              label="Department"
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="dark:text-white"
            >
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.department_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <div className="flex justify-end gap-3">
            <Button
              onClick={() => setOpenModal(false)}
              className="dark:text-white"
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Delete Confirmation Modal (remains the same) */}
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