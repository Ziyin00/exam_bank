"use client";
import React, { FC, useEffect, useState, useRef } from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme, useMediaQuery, Modal } from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import { useTheme as useNextTheme } from "next-themes";
import avatarDefault from "../../../../public/assets/avatar.jpg";
import { 
  ArrowBackIosIcon, 
  ArrowForwardIosIcon, 
  BarChartOutlinedIcon, 
  ExitToAppIcon, 
  GroupsIcon, 
  HomeOutlinedIcon, 
  OndemandVideoIcon, 
  QuizIcon, 
  SettingsIcon, 
  VideoCallIcon,
  
} from "./Icons";
import { Button } from "../../ui/button";
import { GridCloseIcon, GridMenuIcon } from "@mui/x-data-grid";

interface ItemProps {
  title: string;
  to: string;
  icon: JSX.Element;
  selected: string;
  setSelected: (title: string) => void;
}

const Item: FC<ItemProps> = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  
  return (
    <MenuItem
      component={<Link href={to} />}
      active={selected === title}
      onClick={() => setSelected(title)}
      icon={icon}
      style={{
        color: selected === title 
          ? theme.palette.primary.main 
          : theme.palette.text.primary,
      }}
    >
      <Typography variant="body1" className="font-Poppins">
        {title}
      </Typography>
    </MenuItem>
  );
};

const AdminSideBar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const [mounted, setMounted] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { theme: appTheme, setTheme } = useNextTheme();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery("(max-width: 900px)");
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logoutHandler = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    // Add your logout logic here
    console.log("Logging out...");
    setShowLogoutModal(false);
    setIsMobileOpen(false);
  };

  if (!mounted) return null;

  return (
    <>
      {/* Mobile Menu Toggle */}
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
          "& .pro-menu-item": {
            color: `${appTheme !== "dark" ? muiTheme.palette.text.primary : "#fff"}`,
            "&:hover": {
              color: `${muiTheme.palette.primary.main} !important`,
            },
          },
          "& .pro-menu-item.active": {
            color: `${muiTheme.palette.primary.main} !important`,
          },
          position: isMobile ? "fixed" : "relative",
          zIndex: 1100,
          left: 0,
          top: 0,
          height: "100vh",
          transform: isMobile 
            ? `translateX(${isMobileOpen ? "0" : "-100%"})`
            : "none",
          transition: "transform 0.3s ease-in-out",
          width: isMobile ? "280px" : isCollapsed ? "80px" : "280px",
        }}
      >
        <Sidebar collapsed={!isMobile && isCollapsed}>
          <Menu iconShape="square" menuItemStyles={{ button: { padding: "8px 24px" } }}>
            {/* Collapse Toggle */}
            <MenuItem 
              onClick={() => !isMobile && setIsCollapsed(!isCollapsed)}
              icon={(!isMobile && isCollapsed) ? <ArrowForwardIosIcon /> : <ArrowBackIosIcon />}
              style={{ margin: "16px 0", justifyContent: "center" }}
            >
              {(!isCollapsed || isMobile) && (
                <Link href="/" className="no-underline">
                  <Typography variant="p" className="font-Poppins font-extrabold uppercase text-2xl " 
                    color="primary">
                    Exam Bank
                  </Typography>
                </Link>
              )}
            </MenuItem>

            {/* Profile Section */}
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
                    <SettingsIcon fontSize="small" sx={{ color: "white" }} />
                  </Box>
                </Box>
                <Typography variant="h6" mt={2} color="text.primary">
                  Khalid Sherefa
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Administrator
                </Typography>
              </Box>
            )}

            {/* Navigation Items */}
            <Box pl={isCollapsed && !isMobile ? 0 : 2}>
              <Item
                title="Dashboard"
                to="/admin"
                icon={<HomeOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />

              <Box my={2}>
                <Typography variant="overline" color="text.secondary">
                  {(!isCollapsed || isMobile) && "Management"}
                </Typography>
              </Box>

              <Item
                title="Users"
                to="/admin/users"
                icon={<GroupsIcon />}
                selected={selected}
                setSelected={setSelected}
              />

              <Item
                title="Courses"
                to="/admin/courses"
                icon={<OndemandVideoIcon />}
                selected={selected}
                setSelected={setSelected}
              />

              <Item
                title="Analytics"
                to="/admin/analytics"
                icon={<BarChartOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />

              <Box my={2}>
                <Typography variant="overline" color="text.secondary">
                  {(!isCollapsed || isMobile) && "Content"}
                </Typography>
              </Box>

              <Item
                title="Create Course"
                to="/admin/create-course"
                icon={<VideoCallIcon />}
                selected={selected}
                setSelected={setSelected}
              />

              <Item
                title="FAQ"
                to="/admin/faq"
                icon={<QuizIcon />}
                selected={selected}
                setSelected={setSelected}
              />

              {/* Settings Section */}
              <Box mt={4}>
                <Item
                  title="Settings"
                  to="/admin/settings"
                  icon={<SettingsIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />

                <MenuItem
                  onClick={logoutHandler}
                  icon={<ExitToAppIcon />}
                  style={{ color: muiTheme.palette.error.main }}
                >
                  <Typography variant="body1" className="font-Poppins">
                    Logout
                  </Typography>
                </MenuItem>
              </Box>
            </Box>
          </Menu>
        </Sidebar>
      </Box>

      {/* Logout Confirmation Modal */}
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
          <Box display="flex" justifyContent="center" gap={2}>
            <Button 
              variant="outlined" 
              onClick={() => setShowLogoutModal(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color="error"
              onClick={confirmLogout}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default AdminSideBar;