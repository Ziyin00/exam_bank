"use client";

import React, { FC, useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Button, Modal, TextField, Typography, Skeleton, Avatar, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { AiOutlineDelete, AiOutlineMail, AiOutlineUserAdd } from "react-icons/ai";
import { useTheme } from "next-themes";
import { format } from "timeago.js";
import toast from "react-hot-toast";

// Demo data
const demoUsers = [
  {
    _id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "admin",
    courses: [
      { _id: "c1", name: "Web Development" },
      { _id: "c2", name: "JavaScript Fundamentals" }
    ],
    createdAt: "2024-01-01"
  },
  {
    _id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "user",
    courses: [{ _id: "c1", name: "Web Development" }],
    createdAt: "2024-02-15"
  },
  {
    _id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "user",
    courses: [],
    createdAt: "2024-03-10"
  }
];

type Props = {
  isTeam: boolean;
};

const AllUsers: FC<Props> = ({ isTeam }) => {
  const { theme } = useTheme();
  const [active, setActive] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin");
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState(demoUsers);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const filteredUsers = isTeam
    ? users.filter(user => user.role === "admin")
    : users;

  const rows = filteredUsers.map(user => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    courses: user.courses.length,
    created_at: format(user.createdAt)
  }));

  const handleSubmit = () => {
    if (!email || !role) {
      toast.error("Please fill all fields");
      return;
    }

    const newUser = {
      _id: String(users.length + 1),
      name: "New User",
      email,
      role,
      courses: [],
      createdAt: new Date().toISOString()
    };

    setUsers([...users, newUser]);
    setActive(false);
    toast.success("User added successfully!");
  };

  const handleDelete = () => {
    setUsers(users.filter(user => user._id !== userId));
    setOpen(false);
    toast.success("User deleted successfully!");
  };

  const columns: GridColDef[] = [
    { 
      field: "id", 
      headerName: "ID", 
      flex: 0.3,
      renderCell: (params) => <span className="font-mono">#{params.value}</span>
    },
    { 
      field: "name", 
      headerName: "Name", 
      flex: 0.5,
      renderCell: (params) => (
        <div className="flex items-center gap-3">
          <Avatar className="bg-blue-500">{params.value[0]}</Avatar>
          {params.value}
        </div>
      )
    },
    { 
      field: "email", 
      headerName: "Email", 
      flex: 0.7,
      renderCell: (params) => (
        <a 
          href={`mailto:${params.value}`}
          className="hover:text-blue-500 transition-colors"
        >
          {params.value}
        </a>
      )
    },
    { 
      field: "role", 
      headerName: "Role", 
      flex: 0.4,
      renderCell: (params) => (
        <span className={`px-3 py-1 rounded-full ${
          params.value === 'admin' 
            ? 'bg-purple-100 text-purple-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {params.value}
        </span>
      )
    },
    { 
      field: "courses", 
      headerName: "Courses", 
      flex: 0.4,
      renderCell: (params) => (
        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
          {params.value}
        </span>
      )
    },
    { 
      field: "created_at", 
      headerName: "Joined", 
      flex: 0.5,
      renderCell: (params) => (
        <div className="flex flex-col">
          <span>{new Date(params.row.createdAt).toLocaleDateString()}</span>
          <span className="text-xs text-gray-500">{params.value}</span>
        </div>
      )
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.3,
      renderCell: (params) => (
        <div className="flex gap-3">
          <Button
            onClick={() => {
              setOpen(true);
              setUserId(params.row.id);
            }}
            className="hover:bg-red-100 dark:hover:bg-gray-700 p-2 rounded-full"
          >
            <AiOutlineDelete className="text-red-500" size={20} />
          </Button>
          <a 
            href={`mailto:${params.row.email}`}
            className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full"
          >
            <AiOutlineMail className="text-blue-500" size={20} />
          </a>
        </div>
      )
    }
  ];

  return (
    <div className="">
      <Box m="20px">
        <div className="w-full flex justify-between items-center mb-6">
          <Typography variant="h4" className="dark:text-white text-black">
            {isTeam ? "Team Members" : "All Users"}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AiOutlineUserAdd />}
            onClick={() => setActive(true)}
            className="!bg-blue-500 !hover:bg-blue-600 !text-white"
          >
            Add New Member
          </Button>
        </div>

        <Box
          height="75vh"
          sx={{
            "& .MuiDataGrid-root": { border: "none" },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: theme === "dark" ? "#374151" : "#E5E7EB",
              color: theme === "dark" ? "#FFF" : "#1F2937",
              fontSize: '0.875rem',
            },
            "& .MuiDataGrid-row": {
              color: theme === "dark" ? "#FFF" : "#1F2937",
              '&:hover': {
                backgroundColor: theme === "dark" ? '#1F2937' : '#F3F4F6',
              }
            },
            "& .MuiDataGrid-virtualScroller": {
              backgroundColor: theme === "dark" ? "#1F2937" : "#F9FAFB",
            },
            "& .MuiDataGrid-footerContainer": {
              backgroundColor: theme === "dark" ? "#374151" : "#E5E7EB",
              color: theme === "dark" ? "#FFF" : "#1F2937",
            },
          }}
        >
          {loading ? (
            <div className="space-y-4 p-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton 
                  key={i}
                  variant="rectangular" 
                  height={60} 
                  className="rounded-lg bg-opacity-20 dark:bg-gray-700 bg-gray-300"
                />
              ))}
            </div>
          ) : (
            <DataGrid
              rows={rows}
              columns={columns}
              pageSizeOptions={[5, 10, 25]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              disableRowSelectionOnClick
            />
          )}
        </Box>

        {/* Add Member Modal */}
        <Modal open={active} onClose={() => setActive(false)}>
          <Box className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-6 rounded-xl w-[90%] max-w-md">
            <Typography variant="h5" className="text-center mb-6 font-bold dark:text-white">
              Add Team Member
            </Typography>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-4"
              InputLabelProps={{ className: "dark:text-gray-300" }}
              InputProps={{ className: "dark:text-white" }}
            />
            <FormControl fullWidth className="!my-6">
              <InputLabel className="dark:text-gray-300">Role</InputLabel>
              <Select
                value={role}
                label="Role"
                onChange={(e) => setRole(e.target.value)}
                className="dark:text-white"
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="user">User</MenuItem>
              </Select>
            </FormControl>
            <div className="flex justify-end gap-3">
              <Button 
                onClick={() => setActive(false)}
                className="!text-gray-600 dark:!text-gray-300"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                className="!bg-blue-500 !hover:bg-blue-600"
              >
                Add Member
              </Button>
            </div>
          </Box>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal open={open} onClose={() => setOpen(false)}>
          <Box className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-6 rounded-xl w-[90%] max-w-md">
            <Typography variant="h5" className="text-center mb-6 font-bold dark:text-white">
              Confirm Deletion
            </Typography>
            <Typography className="text-center mb-6 dark:text-gray-300">
              Are you sure you want to delete this user? This action cannot be undone.
            </Typography>
            <div className="flex justify-center gap-4">
              <Button
                variant="outlined"
                onClick={() => setOpen(false)}
                className="!border-gray-400 !text-gray-600 dark:!text-gray-300"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleDelete}
                className="!bg-red-500 !hover:bg-red-600"
              >
                Delete User
              </Button>
            </div>
          </Box>
        </Modal>
      </Box>
    </div>
  );
};

export default AllUsers;