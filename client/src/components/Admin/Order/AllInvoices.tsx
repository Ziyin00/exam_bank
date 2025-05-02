import { useTheme } from 'next-themes';
import React, { FC, useEffect, useState } from 'react'
import { Box, Skeleton } from '@mui/material';
import { AiOutlineMail } from 'react-icons/ai';
import { format } from 'timeago.js';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';

type Props = {
    isDashboard: boolean;
}

interface Order {
    _id: string;
    userId: string;
    courseId: string;
    createdAt: string;
}

interface User {
    _id: string;
    name: string;
    email: string;
}

interface Course {
    _id: string;
    name: string;
    price: number;
}

// Demo data setup
const demoUsers: User[] = [
    { _id: '1', name: 'John Doe', email: 'john@example.com' },
    { _id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    { _id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
];

const demoCourses: Course[] = [
    { _id: 'c1', name: 'Web Development Bootcamp', price: 299 },
    { _id: 'c2', name: 'Advanced JavaScript', price: 199 },
    { _id: 'c3', name: 'React Masterclass', price: 249 },
];

const demoOrders: Order[] = [
    { _id: 'o1', userId: '1', courseId: 'c1', createdAt: '2024-03-01' },
    { _id: 'o2', userId: '2', courseId: 'c2', createdAt: '2024-03-05' },
    { _id: 'o3', userId: '3', courseId: 'c3', createdAt: '2024-03-10' },
    { _id: 'o4', userId: '1', courseId: 'c2', createdAt: '2024-03-15' },
    { _id: 'o5', userId: '2', courseId: 'c3', createdAt: '2024-03-20' },
];

const AllInvoices: FC<Props> = ({ isDashboard }) => {
    const { theme } = useTheme();
    const [orderData, setOrderData] = useState<Array<Order & { 
        userName: string; 
        userEmail: string; 
        title: string; 
        price: string;
        status: string;
    }>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            const processedData = demoOrders.map((order) => {
                const user = demoUsers.find(u => u._id === order.userId);
                const course = demoCourses.find(c => c._id === order.courseId);
                
                return {
                    ...order,
                    userName: user?.name || 'Deleted User',
                    userEmail: user?.email || 'deleted@example.com',
                    title: course?.name || 'Deleted Course',
                    price: course?.price ? `$${course.price}` : '$0',
                    status: course ? 'Completed' : 'Refunded'
                };
            });
            
            setOrderData(processedData);
            setLoading(false);
        }, 1500);
    }, []);

    const columns: GridColDef[] = [
        { 
            field: "id", 
            headerName: "ID", 
            flex: 0.3,
            renderCell: (params) => <span className="font-mono">#{params.value}</span>
        },
        { 
            field: "userName", 
            headerName: "User Name", 
            flex: isDashboard ? 0.6 : 0.5,
            renderCell: (params) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        {params.value[0]}
                    </div>
                    {params.value}
                </div>
            )
        },
        ...(!isDashboard ? [
            { 
                field: "userEmail", 
                headerName: "User Email", 
                flex: 1,
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
                field: "title", 
                headerName: "Course Title", 
                flex: 1,
                renderCell: (params) => (
                    <div className="max-w-[300px] truncate hover:underline">
                        {params.value}
                    </div>
                )
            }
        ] : []),
        { 
            field: "price", 
            headerName: "Price", 
            flex: 0.5,
            renderCell: (params) => (
                <span className={`px-2 py-1 rounded-full ${
                    params.value === '$0' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                }`}>
                    {params.value}
                </span>
            )
        },
        { 
            field: "status", 
            headerName: "Status", 
            flex: 0.5,
            renderCell: (params) => (
                <span className={`px-2 py-1 rounded-full ${
                    params.value === 'Completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                }`}>
                    {params.value}
                </span>
            )
        },
        { 
            field: "createdAt", 
            headerName: "Created At", 
            flex: 0.5, 
            valueFormatter: (params) => format(params.value as string),
            renderCell: (params) => (
                <div className="flex flex-col">
                    <span>{new Date(params.value).toLocaleDateString()}</span>
                    <span className="text-xs text-gray-500">
                        {format(params.value)}
                    </span>
                </div>
            )
        },
        ...(!isDashboard ? [
            { 
                field: " ", 
                headerName: "Actions", 
                flex: 0.2, 
                renderCell: (params) => (
                    <div className="flex gap-2">
                        <a 
                            href={`mailto:${params.row.userEmail}`}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            title="Send Email"
                        >
                            <AiOutlineMail 
                                className='dark:text-white text-black' 
                                size={20} 
                            />
                        </a>
                    </div>
                )
            }
        ] : [])
    ];

    const rows = orderData.map((item) => ({
        id: item._id,
        userName: item.userName,
        userEmail: item.userEmail,
        title: item.title,
        price: item.price,
        status: item.status,
        createdAt: item.createdAt,
    }));

    return (
        <div className={!isDashboard ? 'mt-[120px]' : 'mt-[0px]'}>
            <Box m={isDashboard ? '0' : '40px'}>
                <Box
                    m={isDashboard ? '0' : '40px 0 0 0'} 
                    height={isDashboard ? '35vh' : '90vh'}
                    overflow={"hidden"}                    
                    sx={{
                        "& .MuiDataGrid-root": {
                            border: "none",
                            outline: "none",  
                        },
                        "& .MuiDataGrid-cell": {
                            borderBottom: "none!important",
                        },
                        "& .MuiDataGrid-columnHeaders": {
                            backgroundColor: theme === "dark" ? "#374151" : "#E5E7EB",
                            color: theme === "dark" ? "#FFF" : "#1F2937",
                            borderBottom: "none",
                            fontSize: '0.875rem',
                        },
                        "& .MuiDataGrid-virtualScroller": {
                            backgroundColor: theme === "dark" ? "#1F2937" : "#F9FAFB",
                        },
                        "& .MuiDataGrid-footerContainer": {
                            backgroundColor: theme === "dark" ? "#374151" : "#E5E7EB",
                            color: theme === "dark" ? "#FFF" : "#1F2937",
                            borderTop: "none",
                        },
                        "& .MuiDataGrid-toolbarContainer": {
                            padding: '0.5rem',
                            gap: '0.5rem',
                        },
                        "& .MuiButton-root": {
                            color: theme === "dark" ? "#FFF" : "#1F2937!important",
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
                            density="comfortable"
                            checkboxSelection={!isDashboard}
                            slots={!isDashboard ? { 
                                toolbar: GridToolbar,
                                noRowsOverlay: () => (
                                    <div className="h-full flex items-center justify-center text-gray-500">
                                        No invoices found
                                    </div>
                                )
                            } : undefined}
                            disableRowSelectionOnClick
                            pageSizeOptions={[5, 10, 25]}
                            initialState={{
                                pagination: {
                                    paginationModel: { pageSize: 10, page: 0 },
                                },
                            }}
                        />
                    )}
                </Box>
            </Box>
        </div>
    )
}

export default AllInvoices;