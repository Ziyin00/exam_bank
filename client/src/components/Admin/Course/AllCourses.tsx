'use client'

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
  Tooltip
} from '@mui/material'
import { 
  AiOutlineDelete, 
  AiOutlinePlus 
} from 'react-icons/ai'
import { BsSearch, BsSortDown } from 'react-icons/bs'
import toast from 'react-hot-toast'

const AllCourses = () => {
  const theme = useTheme()
  const [open, setOpen] = useState(false)
  const [courseId, setCourseId] = useState('')
  const [courses, setCourses] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('http://localhost3032/teacher/get-all-course')
        const data = await response.json()
        setCourses(data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching courses:', error)
        setLoading(false)
      }
    }

    fetchCourses()
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

  const handleDelete = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/courses/${courseId}`, {
        method: 'DELETE'
      })
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
        <DataGrid
          rows={filteredCourses}
          columns={columns}
          loading={loading}
          components={{
            Toolbar: () => (
              <GridToolbarContainer sx={{ p: 2, gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  variant="outlined"
                  placeholder="Search courses..."
                  size="small"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{ width: { xs: '100%', sm: 300 } }}
                />
                <Button
                  variant="outlined"
                  startIcon={<BsSortDown />}
                >
                  Sort
                </Button>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarExport />
                <Button
                  variant="contained"
                  startIcon={<AiOutlinePlus />}
                  href="/admin/create-course"
                >
                  New Course
                </Button>
              </GridToolbarContainer>
            ),
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
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color="error"
              onClick={handleDelete}
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
