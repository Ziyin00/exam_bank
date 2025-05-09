// AllCourses.tsx
'use client'

import React, { useEffect, useState, useMemo } from 'react'
import {
  Box,
  Button,
  Modal,
  IconButton,
  TextField,
  Typography,
  useTheme,
  Chip,
  Avatar,
  Tooltip,
  InputAdornment,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  CircularProgress,
} from '@mui/material'
import {
  AiOutlineDelete,
  AiOutlinePlus,
  AiOutlineSearch,
} from 'react-icons/ai'
import toast from 'react-hot-toast'
import Link from 'next/link'

// Define your Course type based on ACTUAL fetched data
interface Course {
  id: string | number; // <<<< PAYS ATTENTION TO THIS: Is it 'id', '_id', 'course_id'?
  title: string;
  thumbnail?: string; // This might be 'image' from your backend
  category?: string;  // This might be 'category_name'
  status?: 'Published' | 'Draft' | 'Pending' | string; // Or other statuses
  // Add other fields you expect from the backend
  course_tag?: string;
  year?: string;
}


const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3032';
// Assuming images are served from a specific path on your backend if 'thumbnail'/'image' is just a filename
const IMAGE_BASE_URL = `${BACKEND_URL}/image/`; // Adjust if your image serving path is different

const AllCourses = () => {
  const theme = useTheme();
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [courseIdToDelete, setCourseIdToDelete] = useState<string | number | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchCourses = async () => {
    setLoading(true);
    console.log('Fetching courses from:', `${BACKEND_URL}/teacher/get-all-course`);
    try {
      const response = await fetch(`${BACKEND_URL}/teacher/get-all-course`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch courses response:', response.status, errorText);
        throw new Error(`Failed to fetch courses: ${response.statusText} - ${errorText}`);
      }
      const data = await response.json();
      console.log('Raw data from API:', data); // Log raw data

      // Adjust this based on how your API returns the array of courses
      const coursesArray = Array.isArray(data) ? data : (data.courses || data.data || []);
      console.log('Extracted courses array:', coursesArray);

      if (coursesArray.length > 0) {
        console.log('Sample of first course object:', coursesArray[0]);
      }

      setCourses(coursesArray);
    } catch (error) {
      console.error('Error in fetchCourses:', error);
      toast.error('Could not load courses. Check console for details.');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDeleteCourse = async () => {
    if (!courseIdToDelete) return;
    const toastId = toast.loading('Deleting course...');
    try {
      // Ensure this delete URL and method are correct for your backend
      const response = await fetch(`${BACKEND_URL}/teacher/course/${courseIdToDelete}`, { // Example URL
        method: 'DELETE',
      });
      if (!response.ok) {
        let errorMsg = `Failed to delete: ${response.statusText}`;
        try { const errData = await response.json(); errorMsg = errData.message || errorMsg; } catch (_) {}
        throw new Error(errorMsg);
      }
      // IMPORTANT: Use the correct ID field from your Course type
      setCourses(prev => prev.filter(course => course.id !== courseIdToDelete));
      toast.success('Course deleted successfully', { id: toastId });
      setOpenDeleteModal(false);
      setCourseIdToDelete(null);
    } catch (error: any) {
      toast.error(error.message || 'Error deleting course', { id: toastId });
    }
  };

  const filteredCourses = useMemo(() => {
    if (!courses) return []; // Guard against courses being null/undefined initially
    if (!searchText) {
      return courses;
    }
    return courses.filter(course =>
      (course.title?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
      (course.category?.toLowerCase() || '').includes(searchText.toLowerCase()) // Ensure 'category' exists
    );
  }, [courses, searchText]);

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedCourses = useMemo(() => {
    if (!filteredCourses) return [];
    return filteredCourses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredCourses, page, rowsPerPage]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 200px)', p: 3 }}>
        <CircularProgress size={60} />
        <Typography sx={{ ml: 2 }}>Loading Courses...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" component="h1" fontWeight="bold">Course Management</Typography>
          <Typography variant="body2" color="text.secondary">
             {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
          </Typography>
        </Box>
        <TextField
            variant="outlined" placeholder="Search..." size="small"
            value={searchText} onChange={(e) => { setSearchText(e.target.value); setPage(0); }}
            sx={{ width: { xs: '100%', sm: 300 } }}
            InputProps={{ startAdornment: (<InputAdornment position="start"><AiOutlineSearch /></InputAdornment>)}}
        />
        <Link href="/admin/create-course" passHref>
            <Button variant="contained" startIcon={<AiOutlinePlus />} sx={{ width: { xs: '100%', sm: 'auto' } }}>New Course</Button>
        </Link>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2, boxShadow: `0 4px 12px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'}` }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
          <Table stickyHeader aria-label="courses table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 80, backgroundColor: theme.palette.background.paper }}>Image</TableCell>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 250, backgroundColor: theme.palette.background.paper }}>Title & Category</TableCell>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 120, backgroundColor: theme.palette.background.paper }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 100, backgroundColor: theme.palette.background.paper }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCourses.length > 0 ? (
                paginatedCourses.map((course) => (
                  //  CRITICAL: Change `course.id` to your actual unique identifier field (e.g., course._id, course.course_id)
                  <TableRow hover key={course.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>
                      {/* If 'thumbnail' is just a filename, construct the full URL */}
                      <Avatar
                        variant="rounded"
                        src={course.thumbnail ? (course.thumbnail.startsWith('http') ? course.thumbnail : `${IMAGE_BASE_URL}${image}`) : undefined}
                        
                        alt={course.title}
                        sx={{ width: 50, height: 50 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle1" fontWeight="600" noWrap>{course.title}</Typography>
                      {course.category && (
                        <Chip label={course.category} size="small" sx={{ mt: 0.5, fontSize: '0.75rem' }}/>
                      )}
                    </TableCell>
                    <TableCell>
                      {course.status && (
                        <Chip
                          label={course.status}
                          color={course.status === 'Published' ? 'success' : course.status === 'Draft' ? 'default' : 'warning'}
                          size="small" sx={{ fontWeight: 500, borderRadius: '6px', textTransform: 'capitalize' }}
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Delete Course">
                        <IconButton color="error" size="small" onClick={() => {
                            setOpenDeleteModal(true);
                            // CRITICAL: Use the correct ID field here
                            setCourseIdToDelete(course.id);
                          }}
                        >
                          <AiOutlineDelete size={20} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 10 }}> {/* Increased padding */}
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        {searchText ? "No Courses Match Your Search" : "No Courses Available Yet"}
                    </Typography>
                    {!searchText && (
                        <Typography color="text.secondary">
                            Click "New Course" to add your first one!
                        </Typography>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {filteredCourses.length > 0 && (
          <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredCourses.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </Paper>

      <Modal open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 420 }, bgcolor: 'background.paper', boxShadow: 24,
          p: {xs: 2.5, sm: 3.5}, borderRadius: 2, outline: 'none',
        }}>
          <Typography variant="h6" component="h2" gutterBottom fontWeight="bold">🚨 Confirm Deletion</Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>This action cannot be undone.</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button variant="text" onClick={() => setOpenDeleteModal(false)} sx={{color: 'text.secondary'}}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleDeleteCourse}>Confirm Delete</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  )
}

export default AllCourses;