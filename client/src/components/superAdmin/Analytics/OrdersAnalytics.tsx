import { useTheme } from "@mui/material";
import { style } from "@/src/styles/style";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  LineChart,
  Line,
  Tooltip,
  CartesianGrid,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import { Box, Typography, Skeleton, useMediaQuery } from "@mui/material";

const demoData = [
  { month: "Jan", orders: 2400 },
  { month: "Feb", orders: 3200 },
  { month: "Mar", orders: 2900 },
  { month: "Apr", orders: 4100 },
  { month: "May", orders: 3750 },
  { month: "Jun", orders: 4300 },
  { month: "Jul", orders: 5200 },
  { month: "Aug", orders: 4800 },
  { month: "Sep", orders: 3900 },
  { month: "Oct", orders: 6100 },
  { month: "Nov", orders: 5400 },
  { month: "Dec", orders: 6800 },
];

interface ChartProps {
  isDashboard?: boolean;
}

const OrdersAnalytics: FC<ChartProps> = ({ isDashboard }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  // const { data, isLoading, isError } = useGetOrdersAnalyticsQuery({});

  const isLoading = false;
  const isError = false;

  const formatTick = (value: string) => {
    return isMobile ? value.slice(0, 3) : value;
  };

  return (
    <Box
      sx={{
        height: isDashboard ? "100%" : "100vh",
        p: isDashboard ? 0 : 4,
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Box mb={2} px={2}>
        <Typography
          variant={isDashboard ? "h6" : "h4"}
          className={style.title}
          sx={{ color: theme.palette.text.primary }}
        >
          Questions Analytics
        </Typography>
        {!isDashboard && (
          <Typography variant="body2" color="textSecondary">
            Monthly order trends with 12-month overview
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
            Failed to load analytics data
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            height: isDashboard ? "200px" : "70vh",
            width: "100%",
            position: "relative",
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
                <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
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
                  "Orders",
                ]}
              />

              <Area
                type="monotone"
                dataKey="orders"
                stroke={theme.palette.primary.main}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#ordersGradient)"
                activeDot={{ r: 6 }}
              />

              <Line
                type="monotone"
                dataKey="orders"
                stroke={theme.palette.secondary.main}
                strokeWidth={2}
                dot={false}
              />

              {!isMobile && (
                <Legend
                  wrapperStyle={{ paddingTop: 20 }}
                  formatter={(value) => (
                    <span style={{ color: theme.palette.text.primary }}>
                      {value}
                    </span>
                  )}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>

          {!isDashboard && (
            <Box textAlign="center" mt={1}>
              <Typography variant="caption" color="textSecondary">
                Hover over the graph to view detailed monthly order counts
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default OrdersAnalytics;