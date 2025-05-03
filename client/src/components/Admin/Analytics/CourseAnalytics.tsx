import { useTheme } from "@mui/material";
import { style } from "@/src/styles/style";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { Box, Typography, Skeleton } from "@mui/material";
import { useGetCoursesAnalyticsQuery } from "@/redux/features/analytics/analyticsApi";

const CourseAnalytics = () => {
  const theme = useTheme();
  const { data, isLoading, isError } = useGetCoursesAnalyticsQuery({});
  
  // Demo data for fallback
  const demoData = [
    { name: "Jun 2023", courses: 3 },
    { name: "Jul 2023", courses: 5 },
    { name: "Aug 2023", courses: 7 },
    { name: "Sep 2023", courses: 2 },
    { name: "Oct 2023", courses: 8 },
    { name: "Nov 2023", courses: 4 },
    { name: "Dec 2023", courses: 6 },
  ];

  const analyticsData = data?.courses.last12Months?.map((item: any) => ({
    name: item.month,
    courses: item.count,
  })) || demoData;

  const getPath = (x: number, y: number, width: number, height: number) => {
    return `M${x},${y + height}C${x + width / 3},${y + height} ${x + width / 2},${y + height / 3}
    ${x + width / 2}, ${y}
    C${x + width / 2},${y + height / 3} ${x + (2 * width) / 3},${y + height} ${x + width}, ${y + height}
    Z`;
  };

  const TriangleBar = (props: any) => {
    const { fill, x, y, width, height } = props;
    return <path d={getPath(x, y, width, height)} stroke="none" fill={fill} />;
  };

  return (
    <Box sx={{
      height: "100vh",
      p: 4,
      backgroundColor: theme.palette.background.default,
    }}>
      <Box mb={4}>
        <Typography variant="h4" className={`${style.label} !text-start`}>
          Course Analytics
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Last 12 months course creation statistics
        </Typography>
      </Box>

      {isLoading ? (
        <Skeleton variant="rectangular" width="100%" height="70vh" />
      ) : isError ? (
        <Typography color="error">Error loading analytics data</Typography>
      ) : (
        <Box sx={{ height: "70vh", width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={analyticsData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{ fill: theme.palette.text.primary }}
                angle={-45}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tick={{ fill: theme.palette.text.primary }}
                label={{
                  value: 'Courses Created',
                  angle: -90,
                  position: 'insideLeft',
                  fill: theme.palette.text.primary
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: theme.shape.borderRadius,
                }}
              />
              <Bar
                dataKey="courses"
                name="Courses"
                shape={<TriangleBar />}
                animationDuration={500}
              >
                {analyticsData.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={theme.palette.primary.main}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}

      <Box mt={2} textAlign="center">
        <Typography variant="body2" color="textSecondary">
          Hover over bars to view exact numbers
        </Typography>
      </Box>
    </Box>
  );
};

export default CourseAnalytics;