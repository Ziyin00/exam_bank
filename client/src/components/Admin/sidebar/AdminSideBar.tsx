"use client";
import React, { useEffect, useState, useRef } from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme, useMediaQuery, Modal, Button } from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import { useTheme as useNextTheme } from "next-themes";
import avatarDefault from "../../../../public/assets/avatar.jpg";

// MUI Icons
import {
  ArrowBackIos,
  ArrowForwardIos,
  BarChartOutlined,
  Groups,
  HomeOutlined,
  OndemandVideo,
  Quiz,
  Settings,
  ExitToApp,
  Close as GridCloseIcon,
  Menu as GridMenuIcon,
} from "@mui/icons-material";

// React Icons
import { SiAnswer, SiCoursera } from "react-icons/si";
import { PiExam } from "react-icons/pi";

interface ItemProps {
  title: string;
  to: string;
  icon: React.ReactNode;
  selected: string;
  setSelected: (title: string) => void;
}

const AdminSideBar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const [mounted, setMounted] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [courses, setCourses] = useState<Array<any>>([]);
  const { theme: appTheme } = useNextTheme();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery("(max-width: 900px)");
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    fetchCourses();
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/admin/get-all-course', {
        credentials: 'include'
      });
      // if (!response.ok) throw new Error('Failed to fetch courses');
      const data = await response.json();
      setCourses(data);
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  const logoutHandler = () => setShowLogoutModal(true);
  
  const confirmLogout = async () => {
    try {
      const response = await fetch('/admin/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        window.location.href = '/admin/login';
      }
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setShowLogoutModal(false);
      setIsMobileOpen(false);
    }
  };

  const Item = ({ title, to, icon, selected, setSelected }: ItemProps) => (
    <MenuItem
      active={selected === title}
      onClick={() => setSelected(title)}
      icon={icon}
      // component={Link}
      href={to}
      sx={{ display: "flex", alignItems: "center" }}
    >
      <Typography variant="body2" className="font-Poppins" color="text.primary">
        {title}
      </Typography>
    </MenuItem>
  );

  if (!mounted) return null;

  return (
    <>
      {isMobile && (
        <IconButton
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          sx={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 1200,
            backgroundColor: muiTheme.palette.background.paper,
            boxShadow: muiTheme.shadows[3],
          }}
        >
          {isMobileOpen ? <GridCloseIcon /> : <GridMenuIcon />}
        </IconButton>
      )}

      <Box
        ref={sidebarRef}
        sx={{
          "& .pro-sidebar-inner": {
            background: `${appTheme === "dark" ? "#111C43" : "#fff"} !important`,
            borderRight: `1px solid ${muiTheme.palette.divider}`,
          },
          position: isMobile ? "fixed" : "relative",
          zIndex: 1100,
          left: 0,
          top: 0,
          height: "100vh",
          transform: isMobile ? `translateX(${isMobileOpen ? "0" : "-100%"})` : "none",
          transition: "transform 0.3s ease-in-out",
          width: isMobile ? "280px" : isCollapsed ? "80px" : "280px",
        }}
      >
        <Sidebar collapsed={!isMobile && isCollapsed}>
          <Menu iconShape="square" menuItemStyles={{ button: { padding: "8px 24px" } }}>
            <MenuItem
              onClick={() => !isMobile && setIsCollapsed(!isCollapsed)}
              icon={(!isMobile && isCollapsed) ? <ArrowForwardIos /> : <ArrowBackIos />}
              style={{ margin: "16px 0", justifyContent: "center" }}
            >
              {(!isCollapsed || isMobile) && (
            
                  <Typography variant="h5" className="font-Poppins font-extrabold uppercase" color="primary">
                    Exam System
                  </Typography>
                
              )}
            </MenuItem>

            {(!isCollapsed || isMobile) && (
              <Box mb={4} textAlign="center" px={2}>
                <Box position="relative" display="inline-block">
                  <Image
                    src={avatarDefault}
                    alt="Admin Avatar"
                    width={isMobile ? 80 : 120}
                    height={isMobile ? 80 : 120}
                    className="rounded-full border-4 border-primary"
                    priority
                  />
                  <Box
                    position="absolute"
                    bottom={0}
                    right={0}
                    bgcolor="primary.main"
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                  >
                    <Settings fontSize="small" sx={{ color: "white" }} />
                  </Box>
                </Box>
                <Typography variant="h6" mt={2} color="text.primary">
                  Admin Name
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Administrator
                </Typography>
              </Box>
            )}

            <Box pl={isCollapsed && !isMobile ? 0 : 2}>
              <Item title="Dashboard" to="/admin" icon={<HomeOutlined />} selected={selected} setSelected={setSelected} />
              
              {/* <Box my={2}>
                <Typography variant="overline" color="text.secondary">
                  {(!isCollapsed || isMobile) && "Management"}
                </Typography>
              </Box>

              <Item title="Users" to="/admin/users" icon={<Groups />} selected={selected} setSelected={setSelected} />
              <Item title="Courses" to="/admin/courses" icon={<OndemandVideo />} selected={selected} setSelected={setSelected} />
              <Item title="Analytics" to="/admin/analytics" icon={<BarChartOutlined />} selected={selected} setSelected={setSelected} /> */}
              
              <Box my={2}>
                <Typography variant="overline" color="text.secondary">
                  {(!isCollapsed || isMobile) && "Content"}
                </Typography>
              </Box>

              <Item title="Create Course" to="/admin/create-course" icon={<SiCoursera />} selected={selected} setSelected={setSelected} />
              <Item title="Exams" to="/admin/create-exam" icon={<PiExam />} selected={selected} setSelected={setSelected} />
              <Item title="Q&A" to="/admin/answers" icon={<SiAnswer />} selected={selected} setSelected={setSelected} />
              <Item title="FAQ" to="/admin/faq" icon={<Quiz />} selected={selected} setSelected={setSelected} />
              
              <Box mt={4}>
                {/* <Item title="Settings" to="/admin/settings" icon={<Settings />} selected={selected} setSelected={setSelected} /> */}
                <MenuItem onClick={logoutHandler} icon={<ExitToApp />} style={{ color: muiTheme.palette.error.main }}>
                  <Typography variant="body1" className="font-Poppins">
                    Logout
                  </Typography>
                </MenuItem>
              </Box>
            </Box>
          </Menu>
        </Sidebar>
      </Box>

      <Modal open={showLogoutModal} onClose={() => setShowLogoutModal(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          textAlign: 'center'
        }}>
          <Typography variant="h6" gutterBottom>
            Confirm Logout
          </Typography>
          <Typography variant="body1" color="textSecondary" mb={3}>
            Are you sure you want to log out?
          </Typography>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={confirmLogout}
            disabled={showLogoutModal}
          >
            {showLogoutModal ? 'Logging out...' : 'Logout'}
          </Button>
          <Button variant="outlined" sx={{ ml: 2 }} onClick={() => setShowLogoutModal(false)}>
            Cancel
          </Button>
        </Box>
      </Modal>
    </>
  );
};

export default AdminSideBar;