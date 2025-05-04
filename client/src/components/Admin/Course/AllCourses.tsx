"use client"

import React, { useEffect, useState } from 'react'
import { 
  DataGrid, 
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid"
import { 
  Box, 
  Button, 
  Modal, 
  IconButton, 
  LinearProgress,
  TextField,
  Typography,
  useTheme,
  Chip,
  Avatar,
  Tooltip,
  Skeleton
} from '@mui/material'
import { 
  AiOutlineDelete, 
  AiOutlinePlus,
  AiOutlineEye 
} from 'react-icons/ai'
import { FiEdit2 } from "react-icons/fi"
import { format } from 'date-fns'
import { BsSearch, BsSortDown } from 'react-icons/bs'
import { styled } from '@mui/material/styles'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: theme.palette.mode === 'dark' ? '#2a3eb1' : '#3f51b5',
    color: theme.palette.common.white,
    fontSize: 16,
    borderRadius: '12px 12px 0 0',
  },
  '& .MuiDataGrid-cell': {
    borderBottom: `1px solid ${theme.palette.mode === 'dark' ? '#ffffff30' : '#00000030'}`,
  },
  '& .MuiDataGrid-row': {
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'scale(1.005)',
      boxShadow: theme.shadows[2],
      backgroundColor: theme.palette.mode === 'dark' ? '#1f2a40' : '#f5f5f5',
    }
  },
}))

const demoCourses = [
  {
    id: '1',
    title: 'Advanced React Development',
    ratings: 4.8,
    purchased: 2345,
    createdAt: new Date(2023, 0, 15),
    status: 'Published',
    thumbnail: '/react-course.jpg',
    category: 'Frontend',
    price: 199,
    students: [
      { avatar: '/user1.jpg', name: 'John' },
      { avatar: '/user2.jpg', name: 'Sarah' },
      { avatar: '/user3.jpg', name: 'Mike' }
    ]
  },
  // Add more demo courses...
]

const AllCourses = () => {
  const theme = useTheme()
  const [open, setOpen] = useState(false)
  const [courseId, setCourseId] = useState("")
  const [courses, setCourses] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setCourses(demoCourses)
      setLoading(false)
    }, 1500)
  }, [])

  const columns = [
    { 
      field: 'thumbnail', 
      headerName: '', 
      flex: 0.3,
      renderCell: (params: any) => (
        <Avatar
          variant="rounded"
          src={params.value}
          sx={{ width: 60, height: 60 }}
        />
      )
    },
    { 
      field: 'title', 
      headerName: 'Course Title', 
      flex: 2,
      renderCell: (params: any) => (
        <div >
          <Typography fontWeight="600">{params.value}</Typography>
          <Chip 
            label={params.row.category}
            size="small" 
            sx={{ 
              backgroundColor: theme.palette.mode === 'dark' ? '#ffffff20' : '#00000010',
              mt: 1
            }}
          />
        </div>
      )
    },

    { 
      field: 'students', 
      headerName: 'Students', 
      flex: 1,
      renderCell: (params: any) => (
        <div className="flex items-center">
          {params.value.map((student: any, index: number) => (
            <Tooltip key={index} title={student.name}>
              <Avatar
                src={student.avatar}
                sx={{ 
                  width: 32, 
                  height: 32, 
                  marginLeft: index > 0 ? -1.5 : 0,
                  border: `2px solid ${theme.palette.background.paper}`
                }}
              />
            </Tooltip>
          ))}
          <Typography sx={{ ml: 1 }}>{params.row.purchased}+ enrolled</Typography>
        </div>
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      flex: 0.5,
      renderCell: (params: any) => (
        <Chip 
          label={params.value}
          color={params.value === 'Published' ? 'success' : 'warning'}
          sx={{ 
            fontWeight: 500,
            borderRadius: '6px'
          }}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.8,
      renderCell: (params: any) => (
        <div className="flex items-center gap-20">
          
          <Tooltip title="Delete">
            <IconButton
              color="error"
              onClick={() => {
                setOpen(true)
                setCourseId(params.row.id)
              }}
            >
              <AiOutlineDelete />
            </IconButton>
          </Tooltip>
        </div>
      )
    },
  ]

  const CustomToolbar = () => (
    <GridToolbarContainer sx={{ p: 2, gap: 2, flexWrap: 'wrap' }}>
      <TextField
        variant="outlined"
        placeholder="Search courses..."
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: <BsSearch className="mr-2" />,
          sx: { borderRadius: '8px' }
        }}
        sx={{ width: { xs: '100%', sm: 300 } }}
      />
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outlined"
          startIcon={<BsSortDown />}
          sx={{ borderRadius: '8px' }}
        >
          Sort
        </Button>
        <GridToolbarColumnsButton sx={{ borderRadius: '8px' }} />
        <GridToolbarFilterButton sx={{ borderRadius: '8px' }} />
        <GridToolbarExport sx={{ borderRadius: '8px' }} />
        <Button
          variant="contained"
          startIcon={<AiOutlinePlus />}
          href="/admin/create-course"
          sx={{ 
            borderRadius: '8px',
            ml: { xs: 0, sm: 'auto' },
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          New Course
        </Button>
      </div>
    </GridToolbarContainer>
  )

  const handleDelete = async () => {
    try {
      setCourses(prev => prev.filter(course => course.id !== courseId))
      toast.success('Course deleted successfully')
      setOpen(false)
    } catch (error) {
      toast.error('Error deleting course')
    }
  }

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(search.toLowerCase()) ||
    course.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6">
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Course Management
        <Typography variant="body1" color="textSecondary">
          {courses.length} courses found
        </Typography>
      </Typography>
      
      <Box sx={{ 
        height: 900, 
        width: '100%',
        '& .MuiDataGrid-root': {
          border: 'none',
          borderRadius: '12px',
          overflow: 'hidden'
        }
      }}>
        <StyledDataGrid
          rows={filteredCourses}
          columns={columns}
          loading={loading}
          components={{
            Toolbar: CustomToolbar,
            LoadingOverlay: LinearProgress,
            NoRowsOverlay: () => (
              <div className="h-full flex items-center justify-center text-gray-500">
                No courses found
              </div>
            )
          }}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell:focus': { outline: 'none' },
            '& .MuiDataGrid-columnSeparator': { display: 'none' }
          }}
          
        />
      </Box>

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 400 },
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 4
        }}>
          <Typography variant="h6" gutterBottom>
            🚨 Confirm Deletion
          </Typography>
          <Typography variant="body1" color="textSecondary" mb={3}>
            You're about to permanently delete this course and all its contents. This action cannot be undone.
          </Typography>
          <div className="flex justify-end gap-3">
            <Button 
              variant="outlined" 
              onClick={() => setOpen(false)}
              sx={{ borderRadius: '8px' }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color="error"
              onClick={handleDelete}
              sx={{ borderRadius: '8px' }}
            >
              Confirm Delete
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  )
}

export default AllCourses