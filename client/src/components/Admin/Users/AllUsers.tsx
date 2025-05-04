"use client";

import React, { FC, useEffect, useState } from "react";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { Box, Button, Modal, TextField, Typography, Skeleton, Avatar, FormControl, InputLabel, Select, MenuItem, Chip } from "@mui/material";
import { AiOutlineDelete, AiOutlineMail, AiOutlineUserAdd, AiOutlineEdit } from "react-icons/ai";
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
  avatar?: string;
  createdAt: string;
}

interface Department {
  id: string;
  department_name: string;
}

const AllUsers: FC<{ isTeam: boolean }> = ({ isTeam }) => {
  const { theme } = useTheme();
  const [openModal, setOpenModal] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [formData, setFormData] = useState({
    email: "",
    role: "teacher",
    department: "",
  });
  const [departments, setDepartments] = useState<Department[]>([]);




  // Fetch users and departments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, departmentsRes] = await Promise.all([
          axios.get(process.env.NEXT_PUBLIC_ADMIN_GET_ACCOUNTS_API || "", {
            params: {
              page: paginationModel.page + 1,
              limit: paginationModel.pageSize,
              role: isTeam ? "admin" : undefined,
            },
          }),
          axios.get(process.env.NEXT_PUBLIC_ADMIN_GET_DEPARTMENTS_API || ""),
        ]);

        setUsers(usersRes.data.users);
        setTotalUsers(usersRes.data.total);
        setDepartments(departmentsRes.data);
      } catch (error) {
        toast.error("Error loading data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [paginationModel, isTeam]);


  // Handle user creation
  const handleCreateUser = async () => {
    try {
      const endpoint = formData.role === "admin" 
        ? process.env.NEXT_PUBLIC_ADMIN_ADD_ACCOUNT_API
        : process.env.NEXT_PUBLIC_ADMIN_ADD_TEACHERS_API;

      const response = await axios.post(endpoint!, {
        ...formData,
        sendInvitation: true,
      });

      if (response.status === 201) {
        toast.success("Invitation sent successfully");
        setOpenModal(false);
        setFormData({ email: "", role: "teacher", department: "" });
        const res = await axios.get(process.env.NEXT_PUBLIC_ADMIN_GET_ACCOUNTS_API || "");
        setUsers(res.data.users);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create user");
    }
  };

  // Handle user deletion

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const endpoint = selectedUser.role === "teacher"
        ? process.env.NEXT_PUBLIC_ADMIN_DELETE_TEACHER_API
        : process.env.NEXT_PUBLIC_ADMIN_DELETE_STUDENT_API;

      await axios.delete(`${endpoint}/${selectedUser.id}`);
      setUsers(users.filter(user => user.id !== selectedUser.id));
      toast.success("User deleted successfully");
      setDeleteOpen(false);
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };


  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const user = users.find(u => u.id === userId);
      const endpoint = user?.role === "teacher"
        ? process.env.NEXT_PUBLIC_ADMIN_UPDATE_TEACHER_API
        : process.env.NEXT_PUBLIC_ADMIN_UPDATE_STUDENT_API;

      await axios.put(`${endpoint}/${userId}`, { status: newStatus });
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      toast.success("Status updated successfully");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // Table columns configuration
  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      flex: 0.3,
      renderCell: params => <span className="font-mono">#{params.value}</span>,
    },
    {
      field: "name",
      headerName: "User",
      flex: 0.5,
      renderCell: params => (
        <div className="flex items-center gap-3">
          <Avatar src={params.row.avatar} className="bg-blue-500">
            {params.row.name[0]}
          </Avatar>
          <div>
            <p>{params.row.name}</p>
            <p className="text-xs text-gray-500">{params.row.email}</p>
          </div>
        </div>
      ),
    },
    {
      field: "role",
      headerName: "Role",
      flex: 0.3,
      renderCell: params => (
        <Chip
          label={params.value}
          color={params.value === "admin" ? "primary" : "default"}
          className="capitalize"
        />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.3,
      renderCell: params => (
        <Select
          value={params.value}
          onChange={e => handleStatusChange(params.row.id, e.target.value)}
          className="w-32"
          size="small"
        >
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
          <MenuItem value="suspended">Suspended</MenuItem>
        </Select>
      ),
    },
    {
      field: "createdAt",
      headerName: "Joined",
      flex: 0.4,
      valueFormatter: params => format(params.value),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.4,
      renderCell: params => (
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setDeleteOpen(true);
              setSelectedUser(params.row.id);
            }}
            color="error"
          >
            <AiOutlineDelete />
          </Button>
          <Button color="primary">
            <AiOutlineEdit />
          </Button>
          <Button 
            href={`mailto:${params.row.email}`}
            color="info"
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
          {isTeam ? "Team Management" : "User Management"}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AiOutlineUserAdd />}
          onClick={() => setOpenModal(true)}
        >
          Add {isTeam ? "Team Member" : "User"}
        </Button>
      </div>

      <Box height="75vh" sx={{
        "& .MuiDataGrid-root": { border: "none" },
        "& .MuiDataGrid-columnHeaders": {
          backgroundColor: theme === "dark" ? "#374151" : "#E5E7EB",
          color: theme === "dark" ? "#FFF" : "#1F2937",
        },
        "& .MuiDataGrid-row": {
          color: theme === "dark" ? "#FFF" : "#1F2937",
          '&:hover': {
            backgroundColor: theme === "dark" ? '#1F2937' : '#F3F4F6',
          }
        },
      }}>
        <DataGrid
          rows={users}
          columns={columns}
          loading={loading}
          pageSizeOptions={[5, 10, 25]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rowCount={totalUsers}
          paginationMode="server"
          disableRowSelectionOnClick
        />
      </Box>

      {/* Add User Modal */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-6 rounded-xl w-[90%] max-w-md">
          <Typography variant="h5" className="text-center !mb-6 font-bold dark:text-white">
            Invite New User
          </Typography>
          
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            className="mb-4"
          />

          <FormControl fullWidth className="!my-4">
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              label="Role"
              onChange={e => setFormData({ ...formData, role: e.target.value })}
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="teacher">Teacher</MenuItem>
              <MenuItem value="student">Student</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth className="mb-6">
            <InputLabel>Department</InputLabel>
            <Select
              value={formData.department}
              label="Department"
              onChange={e => setFormData({ ...formData, department: e.target.value })}
            >
              {departments && departments.map(dept => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <div className="flex justify-end gap-3 !mt-5">
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleCreateUser}
              disabled={!formData.email}
            >
              Send Invitation
            </Button>
          </div>
        </Box>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <Box className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-6 rounded-xl w-[90%] max-w-md">
          <Typography variant="h5" className="text-center mb-6 font-bold dark:text-white">
            Confirm Deletion
          </Typography>
          <Typography className="text-center mb-6">
            Are you sure you want to delete this user? This action cannot be undone.
          </Typography>
          <div className="flex justify-center gap-4">
            <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
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