"use client";
import React, { FC, useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
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
  Chip
} from "@mui/material";
import { AiOutlineDelete, AiOutlineMail, AiOutlineUserAdd } from "react-icons/ai";
import { useTheme } from "next-themes";
import { format } from "timeago.js";
import toast from "react-hot-toast";
import axios from "axios";

interface User {
  id: string;
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
  const { theme } = useTheme();
  const [openModal, setOpenModal] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    email: "",
    role: "teacher",
    department: "",
  });
  const [departments, setDepartments] = useState<Department[]>([]);

  // Get role and token from local storage or context
  const getAuthHeaders = () => {
    const role = localStorage.getItem('role') || 'admin'; // Default to admin if not available
    const token = localStorage.getItem(`${role}-token`);

    return {
      'role': role,
      [`${role}-token`]: token
    };
  };

  const fetchAllUsers = async () => {
    try {
      // Fetch admins/teachers
      const adminRes = await axios.get('http://localhost:3032/admin/get-account', {
        headers: getAuthHeaders(),
        withCredentials: true
      });

      // Fetch students
      const studentsRes = await axios.get('http://localhost:3032/admin/get-student', {
        withCredentials: true
      });

      // Fetch departments
      const departmentsRes = await axios.get('http://localhost:3032/admin/get-departments', {
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

      // Set departments
      setDepartments(departmentsRes.data || []);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

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

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

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
      toast.error("Failed to delete user");
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string, role: string) => {
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
    <Box m="20px">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h4" className="dark:text-white">
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AiOutlineUserAdd />}
          onClick={() => setOpenModal(true)}
          className="dark:bg-primary dark:hover:bg-primary-dark"
        >
          Add User
        </Button>
      </div>

      <Box height="75vh" sx={{
        "& .MuiDataGrid-root": { border: "none" },
        "& .MuiDataGrid-columnHeaders": {
          backgroundColor: theme === "dark" ? "#374151" : "#E5E7EB",
          borderBottom: `1px solid ${theme === "dark" ? "#4B5563" : "#D1D5DB"}`,
        },
        "& .MuiDataGrid-cell": {
          borderBottom: `1px solid ${theme === "dark" ? "#374151" : "#E5E7EB"}`,
        },
      }}>
        <DataGrid
          rows={users}
          columns={columns}
          loading={loading}
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
          getRowId={(row) => row.id}
        />
      </Box>

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
            <Button
              variant="contained"
              onClick={handleCreateUser}
              className="dark:bg-primary dark:hover:bg-primary-dark"
            >
              Create User
            </Button>
          </div>
        </Box>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <Box className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-6 rounded-xl w-[90%] max-w-md">
          <Typography variant="h5" className="text-center mb-6 dark:text-white">
            Confirm Deletion
          </Typography>
          <Typography className="text-center mb-6 dark:text-white">
            Are you sure you want to delete this user?
          </Typography>
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => setDeleteOpen(false)}
              className="dark:text-white"
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteUser}
            >
              Confirm Delete
            </Button>
          </div>
        </Box>
      </Modal>
    </Box>
  );
};

export default AllUsers;