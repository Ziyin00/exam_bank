import { FC } from 'react';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { AiOutlineLogout } from 'react-icons/ai';
import { MdOutlineAdminPanelSettings } from 'react-icons/md';
import { RiLockPasswordLine } from 'react-icons/ri';
import { SiCoursera } from 'react-icons/si';

import avatarDefault from '../../../../public/assets/avatar.jpg';

type Props = {
  user: any;
  active: number;
  avatar: string;
  setActive: (active: number) => void;
  logoutHandler: () => void;
  isLoggingOut?: boolean;
}

const SideBarProfile: FC<Props> = ({
  user,
  active,
  avatar,
  setActive,
  logoutHandler,
  isLoggingOut
}) => {
  const menuItems = [
    {
      id: 1,
      icon: (
        <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-indigo-500">
          <Image
            src={avatar || avatarDefault}
            alt="avatar"
            fill
            className="object-cover"
          />
        </div>
      ),
      label: "My Account",
    },
    {
      id: 2,
      icon: <RiLockPasswordLine className="text-xl" />,
      label: "Change Password",
    },
    {
      id: 3,
      icon: <SiCoursera className="text-xl" />,
      label: `Enrolled Courses (${user?.courses?.length || 0})`,
    },
    ...(user?.role === "admin" ? [{
      id: 4,
      icon: <MdOutlineAdminPanelSettings className="text-xl" />,
      label: "Admin Dashboard",
      href: "/admin"
    }] : []),
    {
      id: 5,
      icon: <AiOutlineLogout className="text-xl" />,
      label: "Log Out",
      action: logoutHandler
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 z-50"
    >
      <div className="flex items-center gap-3 mb-6 p-2">
        <div className="relative w-12 h-12 rounded-full border-2 border-indigo-500">
          <Image
            src={avatar || avatarDefault}
            alt={user?.name || "User avatar"}
            fill
            className="rounded-full object-cover"
          />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-white truncate">
            {user?.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {user?.email}
          </p>
        </div>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {item.href ? (
              <Link
                href={item.href}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  active === item.id
                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-100'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ) : (
              <button
                onClick={item.action || (() => setActive(item.id))}
                className={`w-full flex items-center gap-3 p-3 rounded-lg ${
                  active === item.id
                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-100'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                disabled={item.id === 5 && isLoggingOut}
              >
                {item.icon}
                <span className="text-sm font-medium">
                  {item.label}
                  {isLoggingOut && item.id === 5 && (
                    <span className="ml-2 animate-pulse">...</span>
                  )}
                </span>
              </button>
            )}
          </motion.div>
        ))}
      </nav>
    </motion.div>
  );
};

export default SideBarProfile;