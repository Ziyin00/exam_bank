"use client";

import React, { FC, useEffect, useState } from 'react';
import UserAnalytics from '../Analytics/UserAnalytics';
import { BiBorderLeft } from 'react-icons/bi';
import { PiUsersFourLight } from "react-icons/pi";
import { Box, CircularProgress, Skeleton } from '@mui/material';
import OrdersAnalytics from '../Analytics/OrdersAnalytics';
import AllInvoices from "../Order/AllInvoices";

// Demo data generators
const generateDemoData = (length: number) => {
  const data = [];
  const currentDate = new Date();
  
  for (let i = 0; i < length; i++) {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() - i);
    data.push({
      month: date.toLocaleString('default', { month: 'short' }),
      count: Math.floor(Math.random() * 1000) + 500
    });
  }
  
  return data.reverse();
};

const demoUsersData = {
  users: {
    last12Months: generateDemoData(12)
  }
};

const demoOrdersData = {
  orders: {
    last12Months: generateDemoData(12)
  }
};

type Props = {
  open?: boolean;
}

const CircularProgressWithLabel: FC<{ value?: number; open?: boolean }> = ({ open, value = 0 }) => {
  const absoluteValue = Math.abs(value);
  const progressValue = absoluteValue > 100 ? 100 : absoluteValue;
  const color = value >= 0 ? "success" : "error";

  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <CircularProgress
        variant='determinate'
        value={progressValue}
        size={45}
        color={color}
        thickness={4}
        style={{ zIndex: open ? -1 : 1 }}
      />
      <Box sx={{
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%'
      }}>
        <span className='text-[12px] font-medium'>
          {value >= 0 ? '↑' : '↓'} {Math.abs(value).toFixed(0)}%
        </span>
      </Box>
    </Box>
  );
};

const DashboardWidgets: FC<Props> = ({ open }) => {
  const [loading, setLoading] = useState(true);
  const [ordersComparePercentage, setOrdersComparePercentage] = useState({
    currentMonth: 0,
    previousMonth: 0,
    percentageChange: 0,
  });
  
  const [userComparePercentage, setUserComparePercentage] = useState({
    currentMonth: 0,
    previousMonth: 0,
    percentageChange: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      const calculatePercentage = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      const usersLastTwoMonths = demoUsersData.users.last12Months.slice(-2);
      const ordersLastTwoMonths = demoOrdersData.orders.last12Months.slice(-2);

      if (usersLastTwoMonths.length >= 2) {
        const usersCurrent = usersLastTwoMonths[1].count;
        const usersPrevious = usersLastTwoMonths[0].count;
        
        setUserComparePercentage({
          currentMonth: usersCurrent,
          previousMonth: usersPrevious,
          percentageChange: calculatePercentage(usersCurrent, usersPrevious)
        });
      }

      if (ordersLastTwoMonths.length >= 2) {
        const ordersCurrent = ordersLastTwoMonths[1].count;
        const ordersPrevious = ordersLastTwoMonths[0].count;
        
        setOrdersComparePercentage({
          currentMonth: ordersCurrent,
          previousMonth: ordersPrevious,
          percentageChange: calculatePercentage(ordersCurrent, ordersPrevious)
        });
      }

      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className='mt-[30px] min-h-screen'>
      <div className="grid grid-cols-1 lg:grid-cols-[70%,30%] gap-8">
        <div className='p-4 lg:p-8'>
          {loading ? (
            <Skeleton variant="rectangular" height={400} className="rounded-xl" />
          ) : (
            <UserAnalytics isDashboard={true} data={demoUsersData.users.last12Months} />
          )}
        </div>
        
        <div className='flex flex-col gap-8 pr-0 lg:pr-8'>
          {/* Sales Widget */}
          <div className='dark:bg-[#111C43] bg-white rounded-xl shadow-lg p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <BiBorderLeft className='dark:text-[#45cba0] text-[#6366f1] text-3xl' />
                  <h5 className='text-xl font-semibold dark:text-white text-gray-800'>
                    Questions Analytics
                  </h5>
                </div>
                {loading ? (
                  <Skeleton variant="text" width={100} height={40} />
                ) : (
                  <div>
                    <h3 className="text-2xl font-bold dark:text-white text-gray-800">
                      {ordersComparePercentage.currentMonth}
                    </h3>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>
                      Current Month Questions
                    </p>
                  </div>
                )}
              </div>
              <div className='text-center'>
                {loading ? (
                  <CircularProgress size={45} thickness={4} />
                ) : (
                  <div className="flex flex-col items-center">
                    <CircularProgressWithLabel 
                      value={ordersComparePercentage.percentageChange} 
                      open={open} 
                    />
                    <p className='text-sm mt-2 text-gray-500 dark:text-gray-400'>
                      vs previous month
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Users Widget */}
          <div className='dark:bg-[#111C43] bg-white rounded-xl shadow-lg p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <PiUsersFourLight className='dark:text-[#45cba0] text-[#6366f1] text-3xl' />
                  <h5 className='text-xl font-semibold dark:text-white text-gray-800'>
                    User Analytics
                  </h5>
                </div>
                {loading ? (
                  <Skeleton variant="text" width={100} height={40} />
                ) : (
                  <div>
                    <h3 className="text-2xl font-bold dark:text-white text-gray-800">
                      {userComparePercentage.currentMonth}
                    </h3>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>
                      New Users This Month
                    </p>
                  </div>
                )}
              </div>
              <div className='text-center'>
                {loading ? (
                  <CircularProgress size={45} thickness={4} />
                ) : (
                  <div className="flex flex-col items-center">
                    <CircularProgressWithLabel 
                      value={userComparePercentage.percentageChange} 
                      open={open} 
                    />
                    <p className='text-sm mt-2 text-gray-500 dark:text-gray-400'>
                      vs previous month
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-[65%,35%] gap-8 mt-8'>
        <div className='dark:bg-[#111c43] bg-white shadow-xl rounded-xl p-6'>
          {loading ? (
            <Skeleton variant="rectangular" height={400} className="rounded-xl" />
          ) : (
            <OrdersAnalytics isDashboard={true} data={demoOrdersData.orders.last12Months} />
          )}
        </div>
        
      </div>
    </div>
  );
};

export default DashboardWidgets;