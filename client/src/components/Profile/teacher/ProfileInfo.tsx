"use client";

import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
// Assuming you have a way to get session data, e.g., next-auth
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { AiOutlineCamera } from 'react-icons/ai';
import { FaChalkboardTeacher } from 'react-icons/fa';

import avatarDefault from '../../../../public/assets/avatar.jpg';

interface TeacherUser {
  id: string | number;
  name: string;
  email: string;
  avatar?: { // Assuming avatar from GET /me might be an object
    public_id?: string;
    url: string;
  } | string; // Or just a URL string
  image?: string; // Backend uses 'image' field for the filename
  role?: string;
  coursesCreated?: Array<{ id: string; title: string }>;
  department?: string;
  lastLogin?: string | Date;
}

type Props = {
  initialUser?: TeacherUser | null; // Optional, component will fetch
};

const TeacherProfileInfo: React.FC<Props> = ({ initialUser }) => {
  const { data: session } = useSession(); // Get session for token and role

  const [currentUser, setCurrentUser] = useState<TeacherUser | null>(initialUser || null);
  const [name, setName] = useState(initialUser?.name || "");
  const [currentAvatarDisplayUrl, setCurrentAvatarDisplayUrl] = useState<string | null>(null);
  const [newAvatarFileObject, setNewAvatarFileObject] = useState<File | null>(null); // Store the actual File object
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getAvatarUrlToDisplay = useCallback((user: TeacherUser | null): string => {
    if (!user) return avatarDefault.src;
    // If backend 'image' field stores filename, construct URL.
    // Otherwise, use avatar.url or avatar string.
    if (user.image) {
      // **IMPORTANT:** Construct the correct public URL for your images.
      // This assumes images are served from '/public/image/' relative to your domain.
      // If NEXT_PUBLIC_API_URL is your backend and it serves static files, use that.
      // Or, if you store full URLs in the DB for 'user.avatar.url', use that.
      return `${process.env.NEXT_PUBLIC_BASE_URL || ''}/image/${user.image}`;
    }
    if (user.avatar) {
      if (typeof user.avatar === 'string') return user.avatar;
      if (user.avatar.url) return user.avatar.url;
    }
    return avatarDefault.src;
  }, []);

  const fetchTeacherProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      // API endpoint for fetching authenticated teacher's profile
      // Your teacherRouter has GET /get-profile, assuming it's mounted at /api/teacher
      const response = await fetch('/api/teacher/get-profile', {
        method: 'GET',
        headers: {
          // Send auth headers if your GET /get-profile endpoint requires them
          // (Based on updateTeacher, it seems likely)
          // 'Content-Type': 'application/json', // Not needed for GET without body
          'role': session?.user?.role || 'teacher', // Get role from session
          [`${session?.user?.role || 'teacher'}-token`]: session?.accessToken || '', // Get token from session
        },
        credentials: 'include', // If using cookies and not header tokens
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to load profile.');
      }
      const data = await response.json();
      // **Adjust based on your /api/teacher/get-profile response structure**
      // It might be data.teacher, data.profile, or data directly
      const fetchedUser: TeacherUser = data.teacher || data.profile || data.user || data;

      if (fetchedUser && typeof fetchedUser.name === 'string') {
        setCurrentUser(fetchedUser);
        setName(fetchedUser.name);
        setCurrentAvatarDisplayUrl(getAvatarUrlToDisplay(fetchedUser));
        setNewAvatarFileObject(null);
      } else {
        throw new Error("Profile data from server is not valid.");
      }
    } catch (err: any) {
      console.error("Error fetching teacher profile:", err.message);
      toast.error(err.message || "Could not load profile.");
    } finally {
      setIsLoading(false);
    }
  }, [session, getAvatarUrlToDisplay]); // Depend on session for token/role

  useEffect(() => {
    if (session) { // Fetch only if session is available
        fetchTeacherProfile();
    } else {
        setIsLoading(false); // No session, so not loading profile
    }
  }, [session, fetchTeacherProfile]); // Re-fetch if session changes

  useEffect(() => {
    const handleExternalProfileUpdate = () => fetchTeacherProfile();
    window.addEventListener('profileUpdated', handleExternalProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleExternalProfileUpdate);
  }, [fetchTeacherProfile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size should be less than 2MB");
      return;
    }
    setNewAvatarFileObject(file); // Store the File object
    setCurrentAvatarDisplayUrl(URL.createObjectURL(file)); // Create a temporary URL for preview
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !session?.user?.role || !session?.accessToken) {
      toast.error("Authentication details missing. Cannot update profile.");
      return;
    }
    if (!name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }
    setIsUpdating(true);

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('email', currentUser.email); // Backend needs email, even if not changed by user
    // Password field is not in this form, but if it were:
    // if (password) formData.append('password', password);

    if (newAvatarFileObject) {
      formData.append('image', newAvatarFileObject); // Backend expects 'image' field for the file
    }

    try {
      // **API Endpoint for updating teacher profile from your router**
      const response = await fetch("/api/teacher/edit-profile", {
        method: "PUT",
        headers: {
          // Multer handles Content-Type for FormData automatically.
          // Do NOT set 'Content-Type': 'application/json' when sending FormData.
          'role': session.user.role,
          [`${session.user.role}-token`]: session.accessToken,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.status === true) {
        toast.success(result.message || "Profile updated successfully!");
        // Backend doesn't return updated user, so we re-fetch
        await fetchTeacherProfile(); // Re-fetch to get updated data (especially new image URL)

        // Dispatch event after re-fetch ensures sidebar gets the very latest
        // (though fetchTeacherProfile already updates currentUser which might trigger sidebar if it uses that)
        // window.dispatchEvent(new CustomEvent('profileUpdated'));
      } else {
        toast.error(result.message || result.error || "Error updating profile.");
      }
    } catch (error) {
      console.error("Profile update submission error:", error);
      toast.error("An unexpected error occurred. Failed to update profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return ( /* ... Skeleton UI ... */
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 flex flex-col items-center justify-center min-h-[400px]"
      >
        <div className="flex items-center justify-center mb-4">
             <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-200 dark:bg-gray-700 mb-6 animate-pulse"></div>
        <div className="w-full max-w-md space-y-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mt-6"></div>
        </div>
      </motion.div>
    );
  }

  if (!currentUser && !isLoading) { // Added !isLoading to show error only after attempting to load
    return ( /* ... Error UI ... */
       <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 text-center"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-red-600 dark:text-red-400 mb-4">
            Profile Error
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          Could not load your profile information. Please ensure you are logged in and try refreshing the page.
        </p>
      </motion.div>
    );
  }
  // Fallback if currentUser is still null after loading (should ideally be caught by the above)
  if (!currentUser) return <p>Error: Profile data unavailable.</p>;


  const displayAvatarFinal = currentAvatarDisplayUrl || avatarDefault.src;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8"
    >
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 md:mb-8 text-center md:text-left">
        My Profile Settings
      </h2>
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Avatar & Stats Section */}
        <div className="lg:w-1/3 flex flex-col items-center lg:items-start">
          <div className="relative group mb-6">
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-indigo-500 dark:border-indigo-400 shadow-lg">
              <Image
                key={displayAvatarFinal}
                src={displayAvatarFinal}
                alt={`${currentUser.name || 'Teacher'}'s Profile Avatar`}
                fill
                sizes="(max-width: 768px) 128px, 160px"
                className="object-cover"
                priority
                onError={(e) => { (e.target as HTMLImageElement).src = avatarDefault.src; }}
              />
            </div>
            <label
              htmlFor="avatarUpload"
              className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4 md:bottom-1 md:right-1 bg-indigo-600 p-2 md:p-3 rounded-full cursor-pointer hover:bg-indigo-700 transition-all duration-150 ease-in-out shadow-lg ring-2 ring-white dark:ring-gray-800"
              title="Change profile picture"
            >
              <AiOutlineCamera className="text-white text-lg md:text-xl" />
              <input id="avatarUpload" type="file" className="hidden" onChange={handleImageChange} accept="image/png, image/jpeg, image/webp, image/gif" />
            </label>
          </div>

          <div className="space-y-3 w-full max-w-xs lg:max-w-none text-center lg:text-left">
            <div className="p-3 bg-indigo-50 dark:bg-gray-700/60 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center lg:justify-start gap-2 text-indigo-600 dark:text-indigo-300 mb-0.5">
                <FaChalkboardTeacher size={16}/>
                <p className="text-sm font-medium">Courses Managed</p>
              </div>
              <p className="font-semibold text-xl text-gray-800 dark:text-white">
                {currentUser.coursesCreated?.length || 0}
              </p>
            </div>
            {currentUser.department && (
              <div className="p-3 bg-indigo-50 dark:bg-gray-700/60 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <p className="text-sm font-medium text-indigo-600 dark:text-indigo-300">Department</p>
                <p className="font-semibold text-xl text-gray-800 dark:text-white mt-0.5">
                  {currentUser.department}
                </p>
              </div>
            )}
            <div className="p-3 bg-indigo-50 dark:bg-gray-700/60 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-300">Last Login</p>
              <p className="font-semibold text-xl text-gray-800 dark:text-white mt-0.5">
                {currentUser.lastLogin ? new Date(currentUser.lastLogin).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric'}) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Form Section */}
        <form onSubmit={handleSubmit} className="lg:w-2/3 space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Full Name
            </label>
            <input id="fullName" type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:border-indigo-500 outline-none transition-colors placeholder-gray-400 dark:placeholder-gray-500"
              required placeholder="Enter your full name"
            />
          </div>
          <div>
            <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Email Address
            </label>
            <input id="emailAddress" type="email" value={currentUser.email || ""} readOnly
              className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 cursor-not-allowed opacity-70"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed for security reasons.</p>
          </div>
          <button type="submit" disabled={isUpdating || isLoading}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold text-base hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-all duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 transform active:scale-95"
          >
            {isUpdating ? (
              <> <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin" /> Saving Changes... </>
            ) : ( 'Save Profile Changes' )}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default TeacherProfileInfo;