import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineCamera } from 'react-icons/ai';
import { toast } from 'react-hot-toast';
import avatarDefault from '../../../../../public/assets/avatar.jpg';

type Props = {
  user: any;
  avatar: string;
  onAvatarChange: (newAvatar: string) => void;
}

const ProfileInfo: React.FC<Props> = ({ user, avatar, onAvatarChange }) => {
  const [name, setName] = useState(user?.name || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size should be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        const newAvatar = reader.result as string;
        onAvatarChange(newAvatar);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Profile updated successfully!");
      setIsUpdating(false);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
    >
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Profile Settings</h2>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Avatar Section */}
        <div className="lg:w-1/3">
          <div className="relative group mb-4 z-0">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-500">
              <Image
                src={avatar || avatarDefault}
                alt="Profile"
                fill
                className="object-cover"
              />
            </div>
            <label className="absolute bottom-0 right-0 bg-indigo-500 p-2 rounded-full cursor-pointer hover:bg-indigo-600 transition-colors">
              <AiOutlineCamera className="text-white text-xl" />
              <input
                type="file"
                className="hidden"
                onChange={handleImageChange}
                accept="image/*"
              />
            </label>
          </div>

          <div className="space-y-2">
            <div className="p-3 bg-indigo-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-indigo-600 dark:text-indigo-300">Enrolled Courses</p>
              <p className="font-medium text-gray-800 dark:text-white">
                {user?.courses?.length || 0}
              </p>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-indigo-600 dark:text-indigo-300">Last Login</p>
              <p className="font-medium text-gray-800 dark:text-white">
                {new Date(user?.lastLogin || Date.now()).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="lg:w-2/3 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-indigo-50 dark:bg-gray-700 border border-indigo-100 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={user?.email || ""}
              readOnly
              className="w-full px-4 py-3 rounded-lg bg-indigo-50 dark:bg-gray-600 cursor-not-allowed opacity-80 -z-0"
            />
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isUpdating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              'Update Profile'
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default ProfileInfo;