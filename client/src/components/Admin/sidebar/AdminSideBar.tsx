"use client";
import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Import usePathname
// React Icons
import { PiExam } from 'react-icons/pi';
import {
  SiAnswer,
  SiCoursera,
} from 'react-icons/si';
import {
  Menu,
  MenuItem,
  Sidebar,
} from 'react-pro-sidebar';

// MUI Icons
import {
  ArrowBackIos,
  ArrowForwardIos,
  BarChartOutlined,
  Close as GridCloseIcon,
  Edit,
  ExitToApp,
  HomeOutlined,
  Menu as GridMenuIcon,
  OndemandVideo,
  Quiz,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Modal,
  Skeleton,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import avatarDefault from '../../../../public/assets/avatar.jpg';

interface UserProfile {
  name: string;
  email?: string;
  avatar?: {
    public_id?: string;
    url: string;
  } | string;
  role?: string;
}

interface ItemProps {
  title: string;
  to: string;
  icon: React.ReactNode;
  selected: string;
  setSelected: (title: string) => void;
}

const menuItemsConfig = [
  { title: "Dashboard", to: "/teacher/dashboard", icon: <HomeOutlined /> },
  { type: "header", title: "Management" },
  { title: "My Courses", to: "/teacher/courses", icon: <OndemandVideo /> },
  { title: "Analytics", to: "/teacher/analytics", icon: <BarChartOutlined /> },
  { type: "header", title: "Content" },
  { title: "Create Course", to: "/teacher/create-course", icon: <SiCoursera /> },
  { title: "Create Exam", to: "/teacher/create-exam", icon: <PiExam /> },
  { title: "Answer Questions", to: "/teacher/answer", icon: <SiAnswer /> },
  { title: "Manage FAQ", to: "/teacher/faq", icon: <Quiz /> },
];


const TeacherSideBar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [selected, setSelected] = useState("Dashboard"); // Default selected item
  const [mounted, setMounted] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const muiTheme = useTheme();
  const isMobile = useMediaQuery("(max-width: 900px)");
  const sidebarRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname(); // Get current pathname

  const profileSettingsRoute = "/teacher/profile";

  // Effect to set the selected item based on the current route
  useEffect(() => {
    const currentItem = menuItemsConfig.find(item => item.to === pathname);
    if (currentItem && currentItem.type !== 'header') {
      setSelected(currentItem.title);
    } else if (pathname === profileSettingsRoute) {
      setSelected("Profile Settings"); // Special case for profile page
    } else {
      // Fallback or set to a default if no match (e.g., if on a sub-route not in menu)
      // setSelected("Dashboard"); // Or keep the previous selected state
    }
  }, [pathname, profileSettingsRoute]);


  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const response = await fetch('/api/teacher/me', {
          credentials: 'include',
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to fetch user profile' }));
          throw new Error(errorData.message || 'Failed to fetch user profile');
        }
        const data = await response.json();
        const profileData: UserProfile = data.user || data;

        if (profileData && typeof profileData.name === 'string') {
          setUserProfile(profileData);
        } else {
          console.warn("Fetched user profile data is not in the expected format:", profileData);
          setUserProfile({ name: "Teacher" });
        }
      } catch (err: any) {
        console.error("Error fetching user profile:", err.message);
        setUserProfile({ name: "Teacher" });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    setMounted(true);
    fetchUserProfile();

    const handleProfileUpdate = () => { fetchUserProfile(); };
    window.addEventListener('profileUpdated', handleProfileUpdate);

    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [isMobileOpen]); // Added isMobileOpen to re-attach listener if it changes

  // Collapse sidebar on mobile if it was collapsed on desktop and then screen resizes
   useEffect(() => {
    if (!isMobile && isCollapsed) {
      // Desktop and collapsed
    } else if (isMobile) {
      setIsCollapsed(false); // Always uncollapse on mobile view by default
    }
  }, [isMobile]);


  const logoutHandler = () => setShowLogoutModal(true);
  const confirmLogout = async () => {
    // ... (logout logic remains the same)
    try {
        const response = await fetch('/api/teacher/logout', {
          method: 'POST',
          credentials: 'include'
        });
        if (response.ok) {
          window.location.href = '/Login';
        } else {
            console.error("Logout failed:", await response.text());
        }
      } catch (err) {
        console.error("Logout exception:", err);
      } finally {
        setShowLogoutModal(false);
        setIsMobileOpen(false);
      }
  };

  const Item = ({ title, to, icon, selected, setSelected }: ItemProps) => (
    <MenuItem
      key={title} // Add key for list items
      active={selected === title}
      onClick={() => {
        setSelected(title); // This updates the visual selection
        if(isMobile) setIsMobileOpen(false); // Navigation is handled by Link
      }}
      icon={icon}
      component={<Link href={to} passHref />} // Link handles navigation
      // style prop can be removed if menuItemStyles handles it sufficiently
    >
      <Typography variant="body2" className="font-Poppins">
        {title}
      </Typography>
    </MenuItem>
  );


  if (!mounted) return null;

  let avatarUrl = avatarDefault.src;
  if (userProfile?.avatar) {
    if (typeof userProfile.avatar === 'string') {
      avatarUrl = userProfile.avatar;
    } else if (userProfile.avatar.url) {
      avatarUrl = userProfile.avatar.url;
    }
  }

  const userName = userProfile?.name || "Teacher";
  const userRole = userProfile?.role || "Teacher";

  const handleProfileClick = () => {
    setSelected("Profile Settings");
    if(isMobile) setIsMobileOpen(false);
  };

  return (
    <>
      {isMobile && (
        <IconButton
          onClick={() => setIsMobileOpen(prev => !prev)} // Use functional update for toggling
          sx={{
            position: "fixed", top: 16, left: 16, zIndex: 1300, // Increased zIndex for menu button
            backgroundColor: muiTheme.palette.background.paper, boxShadow: muiTheme.shadows[3],
            color: muiTheme.palette.text.primary,
            transition: 'transform 0.3s ease-in-out',
            // transform: isMobileOpen ? 'rotate(90deg)' : 'none', // Example animation for open/close
          }}
        >
          {isMobileOpen ? <GridCloseIcon /> : <GridMenuIcon />}
        </IconButton>
      )}

      <Box
        ref={sidebarRef}
        sx={{
          // ... (existing sx styles for sidebar container)
          "& .ps-sidebar-container": {
            background: `${muiTheme.palette.mode === "dark" ? "#1F2A40" : "#FFFFFF"} !important`,
            borderRight: `1px solid ${muiTheme.palette.divider}`,
            overflowY: 'auto', // Ensure sidebar content is scrollable if it exceeds height
          },
          "& .ps-menu-button": {
             "&:hover": {
                backgroundColor: `${muiTheme.palette.action.hover} !important`,
                color: `${muiTheme.palette.primary.main} !important`,
             },
          },
          "& .ps-menu-button.ps-active": {
             color: `${muiTheme.palette.primary.main} !important`,
             backgroundColor: `${muiTheme.palette.mode === 'dark' ? muiTheme.palette.action.selected : muiTheme.palette.grey[100]} !important`, // Adjusted active background
             borderLeft: `4px solid ${muiTheme.palette.primary.main} !important`,
             marginLeft: "-4px !important", // Important to override default
             paddingLeft: `calc(20px + 4px - 4px) !important` // menuItemStyles padding + border - offset
          },
          position: "fixed", // Always fixed for mobile-first approach, adjust for desktop in media query if needed
          left: 0,
          top: 0,
          height: "100vh",
          zIndex: 1200, // Sidebar zIndex below menu button
          transform: isMobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease-in-out, width 0.3s ease-in-out",
          width: "280px", // Fixed width for mobile, override for desktop
          flexShrink: 0,
          // Desktop styles
          [muiTheme.breakpoints.up('md')]: { // Using 'md' (900px) as breakpoint
            transform: 'translateX(0)', // Always visible on desktop
            width: isCollapsed ? "80px" : "280px",
            position: "relative", // Change to relative for desktop layout flow
          },
        }}
      >
        <Sidebar
            collapsed={!isMobile && isCollapsed} // Only consider isCollapsed on non-mobile
            backgroundColor='transparent'
            width={isMobile ? "280px" : (isCollapsed ? "80px" : "280px")} // Dynamic width
            style={{ height: '100%' }} // Ensure sidebar takes full height
        >
          <Menu iconShape="square"
            menuItemStyles={{
                root: { fontSize: '0.875rem' },
                button: ({ active }) => ({ // active state is handled by ps-active class via sx
                    color: muiTheme.palette.text.secondary, // Default color
                    padding: "10px 20px",
                    [`&:hover`]: { // Hover styles still apply
                        backgroundColor: muiTheme.palette.action.hover,
                        color: muiTheme.palette.primary.main,
                    },
                }),
                icon: {
                    marginRight: (isMobile || !isCollapsed) ? '10px' : '0', // Center icon when collapsed on desktop
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: (isMobile || !isCollapsed) ? 'flex-start' : 'center', // Center icon when collapsed
                    width: (isMobile || !isCollapsed) ? 'auto' : '100%', // Ensure icon wrapper takes full width when collapsed
                },
                label: { // Ensure label (Typography) is hidden when collapsed
                    display: (isMobile || !isCollapsed) ? 'block' : 'none',
                }
            }}
          >
            {/* Header */}
            <MenuItem
              onClick={() => !isMobile && setIsCollapsed(!isCollapsed)} // Only allow collapse on desktop
              icon={(!isMobile && isCollapsed) ? <ArrowForwardIos sx={{fontSize: '1.2rem'}} /> : <ArrowBackIos sx={{fontSize: '1.2rem'}} />}
              style={{
                margin: "10px 0 20px 0",
                color: muiTheme.palette.text.secondary,
                justifyContent: (!isMobile && isCollapsed) ? 'center' : 'flex-start',
                paddingLeft: (!isMobile && isCollapsed) ? '0px' : '20px',
                display: 'flex', alignItems: 'center' // Ensure icon and text align
              }}
            >
              {(!isMobile && !isCollapsed || isMobile) && ( // Show text if not desktop-collapsed OR on mobile
                <Typography variant="h6" className="font-Poppins font-bold uppercase" color="text.primary" noWrap>
                  Exam Bank
                </Typography>
              )}
            </MenuItem>

            {/* Profile Section */}
            {(!isMobile && !isCollapsed || isMobile) && (
              <Tooltip title="View/Edit Profile" placement="right" arrow disableHoverListener={!isMobile && isCollapsed}>
                <Box
                  component={Link}
                  href={profileSettingsRoute}
                  passHref
                  onClick={handleProfileClick}
                  sx={{
                    mb: 4, px: 2, textAlign: 'center', textDecoration: 'none', display: 'block',
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: muiTheme.palette.action.hover, borderRadius: '8px' },
                    border: selected === "Profile Settings" ? `2px solid ${muiTheme.palette.primary.main}` : '2px solid transparent',
                    paddingBottom: '16px', paddingTop: '8px'
                  }}
                >
                  {isLoadingProfile ? ( /* ... Skeleton ... */
                    <>
                      <Skeleton variant="circular" width={isMobile ? 70 : 100} height={isMobile ? 70 : 100} sx={{ margin: '8px auto', border: `3px solid ${muiTheme.palette.primary.main}` }} />
                      <Skeleton variant="text" sx={{ fontSize: '1rem', mt: 1.5, width: '70%', margin: '12px auto 0' }} />
                      <Skeleton variant="text" sx={{ fontSize: '0.8rem', width: '50%', margin: '4px auto 0' }} />
                    </>
                  ) : ( /* ... Profile Data ... */
                    <>
                      <Box position="relative" display="inline-block">
                        <Avatar alt={userName} src={avatarUrl}
                          sx={{ width: isMobile ? 70 : 100, height: isMobile ? 70 : 100, margin: '0 auto', border: `3px solid ${muiTheme.palette.primary.main}`, '& img': { objectFit: 'cover' } }}
                        > {userName.charAt(0).toUpperCase()} </Avatar>
                         <IconButton size="small" component={Link} href={profileSettingsRoute} sx={{ position: 'absolute', bottom: 0, right: isMobile ? 10 : 20, backgroundColor: muiTheme.palette.background.paper, '&:hover': { backgroundColor: muiTheme.palette.grey[200] }, boxShadow: muiTheme.shadows[2]}} aria-label="edit profile" >
                            <Edit fontSize="small" color="primary" />
                        </IconButton>
                      </Box>
                      <Typography variant="h6" mt={1.5} color="text.primary" className='font-Poppins font-semibold' noWrap> {userName} </Typography>
                      <Typography variant="body2" color="text.secondary" className='font-Poppins' noWrap> {userRole} </Typography>
                    </>
                  )}
                </Box>
              </Tooltip>
            )}

            {/* Menu Items from Config */}
            <Box pl={(!isMobile && isCollapsed) ? "0px" : "0px"}>
              {menuItemsConfig.map((item) =>
                item.type === 'header' ? (
                  <Typography
                    key={item.title}
                    variant="caption"
                    color="text.secondary"
                    sx={{ m: "15px 0 5px 20px", display: (isMobile || !isCollapsed) ? 'block' : 'none', fontWeight: 600 }}
                    className='font-Poppins'
                  >
                    {item.title}
                  </Typography>
                ) : (
                  <Item
                    key={item.title} // Ensure key is on the direct child of map
                    title={item.title}
                    to={item.to!} // Assert to is defined for non-header items
                    icon={item.icon}
                    selected={selected}
                    setSelected={setSelected}
                  />
                )
              )}

              {/* Logout Item */}
              <Box mt={(!isMobile && isCollapsed) ? 2 : 4} sx={{textAlign: (!isMobile && isCollapsed) ? 'center' : 'left', paddingLeft: (!isMobile && isCollapsed) ? '0px' : '0px' }}>
                 <MenuItem onClick={logoutHandler} icon={<ExitToApp />} style={{ color: muiTheme.palette.error.main, justifyContent: (!isMobile && isCollapsed) ? 'center' : 'flex-start'  }}>
                   {(!isMobile && !isCollapsed || isMobile) && (
                      <Typography variant="body1" className="font-Poppins -mt-10">
                          Logout
                      </Typography>
                   )}
                 </MenuItem>
              </Box>
            </Box>
          </Menu>
        </Sidebar>
      </Box>

      {/* Logout Modal */}
      <Modal open={showLogoutModal} onClose={() => setShowLogoutModal(false)} aria-labelledby="logout-modal-title" aria-describedby="logout-modal-description">
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 400 }, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2, textAlign: 'center'
        }}>
          <Typography id="logout-modal-title" variant="h6" gutterBottom className='font-Poppins'> Confirm Logout </Typography>
          <Typography id="logout-modal-description" variant="body1" color="text.secondary" mb={3} className='font-Poppins'> Are you sure you want to log out? </Typography>
          <Box display="flex" justifyContent="center" gap={2}>
            <Button variant="outlined" color="error" onClick={confirmLogout}>
              <a href="/Login" >
              Logout
              </a>
              
            </Button>
              <Button variant="outlined" onClick={() => setShowLogoutModal(false)}> Cancel </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default TeacherSideBar;