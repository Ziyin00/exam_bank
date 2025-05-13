"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useTheme as useNextTheme } from 'next-themes';
import toast from 'react-hot-toast';
import {
  AiOutlineDelete,
  AiOutlineSearch,
} from 'react-icons/ai';

import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  LinearProgress,
  Modal,
  TextField,
  Tooltip,
  Typography,
  useTheme as useMuiTheme,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRowId,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';

// --- IMPORTANT: Define your Course type based on ACTUAL fetched data ---
// Assuming the primary unique ID from your 'courses' table is named 'id'.
interface Course {
  id: string | number;         // <<< THIS MUST MATCH THE PRIMARY KEY NAME (e.g., 'id') FROM YOUR 'courses' TABLE
  title: string;
  image?: string;              // Field name for course image from backend (e.g., 'image', 'thumbnail')
  category_name?: string;    // Field name for category name from backend
  status?: 'Published' | 'Draft' | 'Pending' | string;
  course_tag?: string;
  year?: string;
}
// --- END OF Course Interface Definition ---


const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3032';
// CRITICAL: Adjust if your backend serves images from a different public path
const IMAGE_PUBLIC_PATH = "/public/image/";

const AllCourses = () => {
  const muiTheme = useMuiTheme();
  const { theme: nextThemeMode } = useNextTheme();

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [courseIdToDelete, setCourseIdToDelete] = useState<GridRowId | null>(null); // Will store course.id
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    // All routes from supperAdminRouter are prefixed with /admin
    const fetchUrl = `${API_BASE_URL}/admin/get-all-course`;
    console.log('[DEBUG] AllCourses - Fetching courses from:', fetchUrl);
    try {
      const response = await fetch(fetchUrl);
      if (!response.ok) {
        let errorMsg = `HTTP error ${response.status}: ${response.statusText}`;
        try { const errData = await response.json(); errorMsg = errData.message || errorMsg; } catch (_) {}
        throw new Error(errorMsg);
      }
      const data = await response.json();
      console.log('[DEBUG] AllCourses - Raw data from API:', data);

      const coursesArray: Course[] = Array.isArray(data) ? data : (data.courses || data.data || []);
      console.log('[DEBUG] AllCourses - Extracted courses array:', coursesArray);
      if (coursesArray.length > 0) {
        console.log('[DEBUG] AllCourses - Sample of first course object (VERIFY `id` field!):', coursesArray[0]);
      }
      setCourses(coursesArray);
    } catch (error: any) {
      console.error('[DEBUG] AllCourses - Error in fetchCourses:', error.message);
      toast.error(`Could not load courses: ${error.message.substring(0,100)}`);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleDeleteCourse = async () => {
    if (!courseIdToDelete) {
      toast.error("No course selected for deletion.");
      return;
    }
    setIsDeleting(true);
    const toastId = toast.loading('Deleting course...');

    // --- CORRECTED DELETE URL ---
    const deleteUrl = `${API_BASE_URL}/admin/delete-course/${courseIdToDelete}`;
    console.log('[DEBUG] AllCourses - Deleting course from:', deleteUrl);

    try {
      const response = await fetch(deleteUrl, { method: 'DELETE' });
      if (!response.ok) {
        let errorMsg = `Failed to delete course (Status: ${response.status}): ${response.statusText}`;
        try { const errData = await response.json(); errorMsg = errData.message || errorMsg; } catch (_) {}
        throw new Error(errorMsg);
      }
      // Backend response for successful delete is { status: true, message: 'Course deleted successfully' }
      const result = await response.json(); // Assuming backend sends JSON on success too
      if (result.status === true) {
        // Remove the course from the local state using the `id` field
        setCourses(prevCourses => prevCourses.filter(course => course.id !== courseIdToDelete));
        toast.success('Course deleted successfully', { id: toastId });
      } else {
        // If backend status is false even with HTTP 200 (unlikely for delete but good to handle)
        throw new Error(result.message || "Deletion reported as failed by server.");
      }
      setOpenDeleteModal(false);
      setCourseIdToDelete(null);
    } catch (error: any) {
      console.error('[DEBUG] AllCourses - Error deleting course:', error.message, error);
      toast.error(error.message || 'Error deleting course. See console.', { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  // --- CRITICAL: `getRowId` must return the unique ID field from your Course objects ---
  // This now assumes your unique ID field from the backend (and in the Course interface) is 'id'.
  const getRowId = (row: Course): GridRowId => row.id;

  const columns: GridColDef<Course>[] = [
    {
      field: 'image', // Ensure this matches the field name in your Course objects
      headerName: '',
      flex: 0.3,
      minWidth: 80,
      sortable: false, filterable: false,
      renderCell: (params) => (
        <Avatar
          variant="rounded"
          src={params.value ? (String(params.value).startsWith('http') ? String(params.value) : `${API_BASE_URL}${IMAGE_PUBLIC_PATH}${params.value}`) : undefined}
          alt={params.row.title}
          sx={{ width: 60, height: 45, my: 1, bgcolor: 'grey.200' }}
        />
      ),
    },
    {
      field: 'title',
      headerName: 'Course Title',
      flex: 2,
      minWidth: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', py: 1, justifyContent: 'center', height: '100%' }}>
          <Typography variant="subtitle1" fontWeight="600" noWrap title={params.value as string}>
            {params.value || "N/A"}
          </Typography>
          {params.row.category_name && ( // Ensure this matches field name
            <Chip
              label={params.row.category_name}
              size="small"
              sx={{
                backgroundColor: nextThemeMode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                mt: 0.5, fontSize: '0.75rem',
              }}
            />
          )}
        </Box>
      ),
    },
    {
      field: 'course_tag', // Ensure this matches field name
      headerName: 'Tag & Year',
      flex: 0.7,
      minWidth: 130,
      renderCell: (params) => (
          <Box sx={{py:1}}>
              <Typography variant="body2" noWrap>{params.value || "N/A"}</Typography>
              <Typography variant="caption" color="text.secondary" noWrap>{params.row.year || "N/A"}</Typography> {/* Ensure 'year' field exists */}
          </Box>
      )
    },
    {
      field: 'status', // Ensure this matches field name
      headerName: 'Status',
      flex: 0.5,
      minWidth: 120,
      renderCell: (params) => (
        params.value ? (
            <Chip
              label={String(params.value)}
              color={ params.value === 'Published' ? 'success' : params.value === 'Draft' ? 'info' : 'warning'}
              size="small"
              sx={{ fontWeight: 500, borderRadius: '6px', textTransform: 'capitalize' }}
            />
        ) : <Typography variant="caption" color="text.secondary">N/A</Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      flex: 0.5,
      minWidth: 100,
      align: 'center', headerAlign: 'center',
      getActions: (params) => [
        // params.id here will be the value returned by getRowId (i.e., course.id)
        <Tooltip title="Delete Course" key={`delete-${params.id}`}>
          <IconButton color="error" size="small"
            onClick={() => {
              setOpenDeleteModal(true);
              setCourseIdToDelete(params.id); // This will be course.id
            }}
            disabled={isDeleting}
          >
            <AiOutlineDelete size={20} />
          </IconButton>
        </Tooltip>,
      ],
    },
  ];

  const filteredCourses = useMemo(() => {
    if (!Array.isArray(courses)) return [];
    if (!searchText) return courses;
    const lowerSearchText = searchText.toLowerCase();
    return courses.filter(course =>
      (course.title?.toLowerCase() || '').includes(lowerSearchText) ||
      (course.category_name?.toLowerCase() || '').includes(lowerSearchText) ||
      (course.course_tag?.toLowerCase() || '').includes(lowerSearchText)
    );
  }, [courses, searchText]);

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  // paginatedCourses is not directly used by DataGrid, DataGrid handles its own pagination from 'rows'
  // const paginatedCourses = useMemo(() => { ... });


  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '100vw', overflowX: 'hidden' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" component="h1" fontWeight="bold" color="text.primary">
            Course Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {loading && courses.length === 0 ? 'Loading courses...' : `${filteredCourses.length} of ${courses.length} courses shown`}
          </Typography>
        </Box>
        {/* <Box display="flex" alignItems="center" gap={2} flexWrap="wrap" sx={{width: {xs: '100%', md: 'auto'}}}>
            <Link href="/admin/add-course" passHref>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AiOutlinePlus />}
                    sx={{mt: {xs: 1, sm:0}, width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}
                >
                    New Course
                </Button>
            </Link>
        </Box> */}
      </Box>

      <Box sx={{
        height: 650, width: '100%',
        '& .MuiDataGrid-root': { /* ...styling... */ },
        // ... other DataGrid specific styling from your previous code
      }}>
        <DataGrid
          rows={filteredCourses}
          columns={columns}
          loading={loading}
          getRowId={getRowId} // Uses the updated getRowId
          components={{
            Toolbar: () => (
              <GridToolbarContainer>
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', p: 1 }}>
                  <TextField
                    variant="outlined" placeholder="Search courses..." size="small"
                    value={searchText} onChange={(e) => setSearchText(e.target.value)}
                    sx={{ width: { xs: '100%', sm: 300 } }}
                    InputProps={{ startAdornment: (<InputAdornment position="start"><AiOutlineSearch /></InputAdornment>)}}
                  />
                </Box>
                <GridToolbarColumnsButton /> <GridToolbarFilterButton />
                <GridToolbarDensitySelector /> <GridToolbarExport />
              </GridToolbarContainer>
            ),
            LoadingOverlay: LinearProgress,
            NoRowsOverlay: () => (
              <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'text.secondary', p:2 }}>
                <Typography variant="subtitle1" fontWeight="medium">No courses to display.</Typography>
                {searchText && courses.length > 0 && <Typography variant="body2" sx={{mt:1}}>Try a different search term or clear filters.</Typography>}
                {!searchText && courses.length === 0 && !loading && <Typography variant="body2" sx={{mt:1}}>Click "New Course" to add your first one!</Typography>}
              </Box>
            )
          }}
          initialState={{ pagination: { paginationModel: { pageSize: 10 }}}}
          pageSizeOptions={[5, 10, 20, 50]}
          disableRowSelectionOnClick
          autoHeight={false}
          rowHeight={70}
        />
      </Box>

      <Modal open={openDeleteModal} onClose={() => setOpenDeleteModal(false)} aria-labelledby="delete-course-modal-title">
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 400 }, bgcolor: 'background.paper', boxShadow: 24,
          p: {xs: 2.5, sm: 3.5}, borderRadius: 2, outline: 'none',
        }}>
          <Typography id="delete-course-modal-title" variant="h6" component="h2" gutterBottom fontWeight="bold">
            🚨 Confirm Deletion
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Are you sure you want to permanently delete this course? This action cannot be undone.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button variant="text" onClick={() => setOpenDeleteModal(false)} sx={{color: 'text.secondary', textTransform: 'none'}}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleDeleteCourse} disabled={isDeleting} sx={{textTransform: 'none'}}>
             {isDeleting ? <CircularProgress size={22} color="inherit"/> : "Confirm Delete"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  )
}

export default AllCourses;