'use client';

import React, {
  FC,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  usePathname,
  useRouter,
} from 'next/navigation';
import { toast } from 'react-hot-toast';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import {
  FiBookOpen,
  FiEdit3,
} from 'react-icons/fi';

import CourseCard from '@/src/components/Course/CourseCard';

import ChangePassword from './ChangePassword';
import TeacherProfileInfo from './ProfileInfo';
import SideBarProfile from './SideBarProfile';

// --- INTERFACES (Keep as previously defined) ---
interface TeacherUser {
  id: string | number;
  name: string;
  email: string;
  image?: string; // Filename from your 'teachers' table
  avatar?: { public_id?: string; url: string; } | string;
  role?: string;
  coursesCreated?: Array<{ id: string; title: string }>;
  department?: string;
  lastLogin?: string | Date;
}

interface TeacherCourse {
  _id: string;
  name: string;
  thumbnail?: { url: string } | string;
  status?: 'published' | 'draft' | 'pending_review';
  studentCount?: number;
}

interface PageProps {}

const TeacherProfilePage: FC<PageProps> = () => {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [active, setActive] = useState(1);
  const [detailedTeacherProfile, setDetailedTeacherProfile] = useState<TeacherUser | null>(null);
  const [managedCourses, setManagedCourses] = useState<TeacherCourse[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [profileFetchError, setProfileFetchError] = useState<string | null>(null);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const fetchTeacherProfileData = useCallback(async () => {
    console.log("STEP 1: fetchTeacherProfileData called. Session status:", sessionStatus);

    if (sessionStatus !== 'authenticated') {
      console.log("STEP 2: Aborting fetch - Session not authenticated.");
      setIsPageLoading(false); // If not authenticated, we're done loading for profile
      if (sessionStatus === 'unauthenticated') router.push('/Login'); // Redirect if definitely unauth
      return;
    }

    if (!session?.user) {
      console.error("STEP 2: Aborting fetch - Session authenticated, but session.user is missing!");
      toast.error("Session data is incomplete. Please try re-logging in.");
      setIsPageLoading(false);
      setProfileFetchError("Session data incomplete.");
      return;
    }

    console.log("STEP 2: Session authenticated, user object:", JSON.stringify(session.user, null, 2));
    setIsPageLoading(true); // Explicitly set loading for this fetch attempt
    setProfileFetchError(null);

    // --- Extract Auth Details ---
    // **CRITICAL DEBUG AREA 1: Check how role and token are stored in your session object**
    // Common patterns for NextAuth.js:
    // - Role might be on `session.user.role` if you added it in session callback
    // - Token might be on `session.accessToken` or `session.jwt` or `session.user.token`
    //   or `session.id_token` (for OIDC) or `session.jti` (default JWT id)
    //   It HIGHLY depends on your NextAuth [..nextauth].ts jwt and session callbacks.

    const userRole = (session.user as any)?.role || 'teacher'; // Provide a default for logging if undefined
    const accessToken = (session as any)?.accessToken || // Common custom name
                        (session as any)?.serverToken || // Another custom name
                        (session as any)?.apiToken ||    // Another custom name
                        (session.user as any)?.token ||  // If nested under user
                        (session as any)?.jti;           // Default JWT ID, might not be your API token

    console.log(`STEP 3: Extracted auth details - Role: '${userRole}', AccessToken found: ${accessToken ? 'YES' : 'NO (This is likely the problem!)'}`);
    if (accessToken) {
        console.log(`STEP 3.1: AccessToken (first 10 chars): ${accessToken.substring(0,10)}...`);
    }


    if (!userRole || !accessToken) {
      const errorMessage = "Authentication credentials (role or token) are not available in the current session. Please check NextAuth configuration (jwt and session callbacks).";
      console.error("STEP 4: CRITICAL ERROR - " + errorMessage);
      toast.error("Authentication error. Please re-login.");
      setIsPageLoading(false);
      setProfileFetchError(errorMessage);
      return;
    }

    console.log("STEP 4: Proceeding with API call to /api/teacher/get-profile");
    try {
      const response = await fetch('/api/teacher/get-profile', {
        method: 'GET',
        headers: {
          'role': userRole,
          [`${userRole}-token`]: accessToken, // e.g., "teacher-token"
        },
      });

      console.log(`STEP 5: API Response - Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        let errorMsg = `API Error: ${response.status} ${response.statusText}`;
        try {
          const errData = await response.json();
          errorMsg = errData.message || errorMsg;
          console.error("STEP 5.1: API Error Data:", errData);
        } catch (e) {
          const textError = await response.text();
          console.error("STEP 5.1: API Error Text (not JSON):", textError);
          if(textError && textError.length < 200) errorMsg = textError; // Show short text errors
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      console.log("STEP 6: Raw JSON data from API:", data);

      // Your backend returns { status: true, teacher: result[0] }
      if (data.status === true && data.teacher) {
        const fetchedUser: TeacherUser = data.teacher;
        if (typeof fetchedUser.name === 'string' && (fetchedUser.id || fetchedUser.email)) { // Check for name and an identifier
          console.log("STEP 7: Successfully fetched and parsed teacher profile:", fetchedUser);
          setDetailedTeacherProfile(fetchedUser);
        } else {
          console.warn("STEP 7: API returned 'teacher' object, but it's not in the expected TeacherUser format or lacks essential fields (name/id/email):", fetchedUser);
          throw new Error("Received invalid profile data structure from the server.");
        }
      } else {
        console.warn("STEP 7: API response 'status' was not true or 'teacher' object was missing:", data);
        throw new Error(data.message || "Failed to retrieve valid profile data from server.");
      }
    } catch (error: any) {
      console.error("STEP 8: CATCH BLOCK - Error during profile fetch or processing:", error);
      toast.error(error.message || 'Could not load your profile details.');
      setDetailedTeacherProfile(null);
      setProfileFetchError(error.message || 'Could not load your profile details.');
    } finally {
      console.log("STEP 9: fetchTeacherProfileData finished.");
      setIsPageLoading(false);
    }
  }, [session, sessionStatus, router]); // Added router to deps for redirect

  // --- Other useEffects and functions (fetchManagedCourses, handleLogout etc.) remain the same for now ---
  // Main effect for handling session status and initiating fetches
  const pathname = usePathname();

  useEffect(() => {
    // This effect now primarily decides IF a fetch should happen based on session status.
    // fetchTeacherProfileData handles its own loading state and error reporting.
    if (sessionStatus === 'loading') {
      setIsPageLoading(true); // Global page loading true
    } else if (sessionStatus === 'authenticated') {
      fetchTeacherProfileData(); // This will set isPageLoading internally
    } else if (sessionStatus === 'unauthenticated') {
      setIsPageLoading(false); // Not loading if unauth
      if (pathname !== '/Login') { // Avoid redirect loop if already on login
         toast("Please log in to access your profile.");
         router.push('/Login'); // **Ensure this is your correct teacher login route**
      }
    }
  }, [sessionStatus, fetchTeacherProfileData, router, pathname]); // Added pathname

  const fetchManagedCourses = useCallback(async () => { /* ... unchanged ... */ }, [detailedTeacherProfile, session]);
  useEffect(() => { /* ... unchanged ... */ }, [detailedTeacherProfile, fetchManagedCourses, isPageLoading]);
  useEffect(() => { /* ... unchanged ... */ }, [fetchTeacherProfileData, sessionStatus]);
  const handleLogout = async () => { /* ... unchanged ... */ };
  const sectionVariants = { /* ... unchanged ... */ };


  // --- RENDER LOGIC ---
  if (isPageLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-100 to-purple-100 dark:from-gray-900 dark:to-slate-800 p-4">
        <AiOutlineLoading3Quarters className="text-5xl text-indigo-600 dark:text-indigo-400 animate-spin mb-4" />
        <p className="text-lg text-gray-700 dark:text-gray-300">Loading Your Profile...</p>
      </div>
    );
  }

  // After loading, if session is unauthenticated (should have been redirected, but as a safeguard)
  if (sessionStatus === 'unauthenticated') {
     return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-100 to-purple-100 dark:from-gray-900 dark:to-slate-800 p-4 text-center">
        <h1 className="text-2xl font-semibold text-red-600 dark:text-red-400 mb-4">Access Denied</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">You are not logged in. Please log in to continue.</p>
        <Link href="/Login" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-md">
            Go to Login
        </Link>
      </div>
    );
  }

  // If authenticated, but profile fetch specifically failed (detailedTeacherProfile is null AND profileFetchError has a message)
  if (!detailedTeacherProfile && profileFetchError) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-100 to-purple-100 dark:from-gray-900 dark:to-slate-800 p-4 text-center">
            <h1 className="text-2xl font-semibold text-red-600 dark:text-red-400 mb-4">Profile Loading Error</h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">{profileFetchError}</p>
            <button
                onClick={() => fetchTeacherProfileData()} // Allow retry
                className="bg-indigo-500 text-white px-6 py-2 rounded hover:bg-indigo-600 transition-colors"
            >
                Try Again
            </button>
            <Link href="/" className="mt-4 text-sm text-indigo-600 hover:underline">Go to Homepage</Link>
        </div>
    );
  }

  // If authenticated and no error, but profile is still inexplicably null (should be rare after above checks)
  if (!detailedTeacherProfile) {
      return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-xl text-red-500 dark:text-red-400 p-8 text-center">
                A critical error occurred: We are authenticated, but your profile data could not be prepared for display. Please try refreshing or contact support.
            </p>
        </div>
      );
  }

  // --- If we reach here, detailedTeacherProfile IS populated ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-purple-100 dark:from-gray-900 dark:to-slate-800">
      <div className="w-[90%] md:w-[85%] flex flex-col lg:flex-row mx-auto gap-6 lg:gap-8 pt-20 pb-12 md:pt-24">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full lg:w-[300px] xl:w-[320px] flex-shrink-0 bg-white dark:bg-gray-800/70 backdrop-blur-md rounded-xl lg:rounded-2xl p-5 lg:p-6 shadow-xl border border-gray-200 dark:border-gray-700 sticky top-20 h-fit"
        >
          <SideBarProfile
            user={detailedTeacherProfile}
            active={active}
            setActive={setActive}
            logoutHandler={handleLogout}
            isLoggingOut={isLoggingOut}
          />
        </motion.div>

        <div className="flex-1 min-w-0">
          <motion.div
            key={active}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            {active === 1 && (
              <TeacherProfileInfo initialUser={detailedTeacherProfile} />
            )}
            {active === 2 && <ChangePassword user={detailedTeacherProfile} />}
            {active === 3 && (
              <div className="bg-white dark:bg-gray-800/70 backdrop-blur-md rounded-xl lg:rounded-2xl p-5 lg:p-8 shadow-xl border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-6 md:mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    My Created Courses
                  </h2>
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mt-3 sm:mt-0">
                    <FiBookOpen className="text-xl" />
                    <span className="font-medium">{managedCourses.length} Course{managedCourses.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                {isLoadingCourses ? (
                  <div className="flex justify-center items-center py-12"> <AiOutlineLoading3Quarters className="text-4xl text-indigo-600 dark:text-indigo-400 animate-spin" /> </div>
                ) : managedCourses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {managedCourses.map((course) => ( <CourseCard key={course._id} course={course} isProfile={true} /> ))}
                  </div>
                ) : (
                  <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} className="col-span-full text-center py-10 lg:py-16 space-y-4">
                    <div className="text-5xl lg:text-6xl mb-4 text-indigo-500 dark:text-indigo-400"> <FiEdit3 /> </div>
                    <h3 className="text-xl lg:text-2xl font-semibold text-gray-700 dark:text-gray-300"> You haven't created any courses yet. </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto"> Share your expertise with the world by creating your first course. </p>
                    <Link href="/teacher/create-course" className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-base font-medium hover:bg-indigo-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"> Create New Course </Link>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfilePage;