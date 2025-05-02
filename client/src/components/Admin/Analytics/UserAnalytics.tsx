'use client'

import { useTheme } from "@mui/material";
import { style } from "@/src/styles/style";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  AreaChart,
  Area,
  Tooltip,
  CartesianGrid
} from "recharts";
import { Box, Typography, Skeleton, useMediaQuery } from "@mui/material";

// Demo data for fallback
const demoData = [
  { month: 'Jan', users: 2400 },
  { month: 'Feb', users: 3200 },
  { month: 'Mar', users: 2900 },
  { month: 'Apr', users: 4100 },
  { month: 'May', users: 3750 },
  { month: 'Jun', users: 4300 },
  { month: 'Jul', users: 5200 },
  { month: 'Aug', users: 4800 },
  { month: 'Sep', users: 3900 },
  { month: 'Oct', users: 6100 },
  { month: 'Nov', users: 5400 },
  { month: 'Dec', users: 6800 },
];

interface UserAnalyticsProps {
  isDashboard?: boolean;
}

const UserAnalytics: FC<UserAnalyticsProps> = ({ isDashboard }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isLoading = false; // Set to true to see loading state
  const isError = false;   // Set to true to see error state

  // Format mobile ticks
  const formatTick = (value: string) => {
    return isMobile ? value.slice(0, 3) : value;
  };

  return (
    <Box
      sx={{
        height: isDashboard ? '100%' : '100vh',
        p: isDashboard ? 0 : 4,
        backgroundColor: theme.palette.background.default,
        borderRadius: theme.shape.borderRadius,
        boxShadow: theme.shadows[isDashboard ? 0 : 3]
      }}
    >
      <Box mb={2} px={isDashboard ? 2 : 0}>
        <Typography
          variant={isDashboard ? "h6" : "h4"}
          className={style.title}
          sx={{ color: theme.palette.text.primary }}
        >
          User Analytics
        </Typography>
        {!isDashboard && (
          <Typography variant="body2" color="textSecondary">
            Monthly user growth trends with 12-month overview
          </Typography>
        )}
      </Box>

      {isLoading ? (
        <Skeleton
          variant="rectangular"
          width="100%"
          height={isDashboard ? "200px" : "70vh"}
          animation="wave"
        />
      ) : isError ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <Typography color="error">
            Failed to load user analytics
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            height: isDashboard ? "200px" : "70vh",
            width: "100%",
            position: "relative"
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={demoData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: isMobile ? 30 : 0,
              }}
            >
              <defs>
                <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={theme.palette.primary.main}
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor={theme.palette.primary.main}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke={theme.palette.divider}
              />

              <XAxis
                dataKey="month"
                tickFormatter={formatTick}
                tick={{ fill: theme.palette.text.secondary }}
                angle={isMobile ? -45 : 0}
                tickMargin={isMobile ? 15 : 0}
              />

              <YAxis
                tick={{ fill: theme.palette.text.secondary }}
                tickFormatter={(value) => `${value / 1000}k`}
              />

              <Tooltip
                contentStyle={{
                  background: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: theme.shape.borderRadius,
                }}
                formatter={(value: number) => [
                  value.toLocaleString(),
                  'Users',
                ]}
              />

              <Area
                type="monotone"
                dataKey="users"
                stroke={theme.palette.primary.main}
                strokeWidth={2}
                fill="url(#usersGradient)"
                activeDot={{
                  r: 6,
                  fill: theme.palette.primary.main,
                  stroke: theme.palette.background.paper,
                  strokeWidth: 2
                }}
              />
            </AreaChart>
          </ResponsiveContainer>

          {!isDashboard && (
            <Box textAlign="center" mt={1}>
              <Typography variant="caption" color="textSecondary">
                Hover over the graph to view detailed monthly user counts
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default UserAnalytics;