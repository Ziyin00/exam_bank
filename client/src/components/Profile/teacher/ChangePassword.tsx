'use client';

import {
  FormEvent,
  useEffect,
  useState,
} from 'react'; // Added useEffect

import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react'; // For authentication details
import { toast } from 'react-hot-toast';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiLock,
} from 'react-icons/fi';

// Assuming 'style.input' is a predefined Tailwind class string
// If not, you'll need to define it or replace it with direct Tailwind classes.
// Example: const inputStyle = "appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white";
const style = {
    input: "appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
};


interface TeacherUser { // Define a minimal User interface for props
  id: string | number;
  name: string;
  email: string;
  // token?: string; // Token should come from session, not user prop directly for security
  lastPasswordChange?: string | Date;
}

type Props = {
  user: TeacherUser | null; // User prop should contain current user's info
};

const ChangePassword: React.FC<Props> = ({ user }) => {
  const { data: session } = useSession();

  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    if (user?.lastPasswordChange) {
        setLastUpdated(new Date(user.lastPasswordChange).toLocaleDateString());
    } else {
        // If no lastPasswordChange, try to fetch it or set a default
        // For now, we'll just show a placeholder if not available from user prop
        // A more robust solution would fetch this detail if needed.
    }
  }, [user?.lastPasswordChange]);


  const validatePasswordStrength = (password: string): number => {
    const strengthChecks = [
      password.length >= 8,         // Min 8 chars
      /[A-Z]/.test(password),       // Uppercase
      /[a-z]/.test(password),       // Lowercase (added for completeness)
      /[0-9]/.test(password),       // Number
      /[^A-Za-z0-9]/.test(password),// Special character
    ];
    const strength = strengthChecks.filter(Boolean).length;
    // Cap strength at 4 for the UI meter (or 5 if your meter has 5 bars)
    setPasswordStrength(Math.min(strength, 4));
    return strength;
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!passwords.oldPassword) {
      newErrors.push('Current password is required.');
    }
    if (!passwords.newPassword) {
      newErrors.push('New password is required.');
    } else {
      const strength = validatePasswordStrength(passwords.newPassword);
      if (strength < 3) { // Requiring at least 3 out of 5 checks to pass for "Good"
        newErrors.push('New password is too weak. It must meet complexity requirements.');
      }
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.push('New passwords do not match.');
    }
    if (passwords.oldPassword && passwords.newPassword === passwords.oldPassword) {
      newErrors.push('New password cannot be the same as the old password.');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors([]); // Clear previous errors

    if (!validateForm()) return;

    if (!user || !session?.user?.role || !(session as any)?.accessToken) {
      toast.error("User session not found. Please log in again.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Prepare data for the backend.
    // Your backend's `updateTeacher` expects 'name' and 'email'
    // and uses 'password' for the new password.
    // It does NOT currently verify oldPassword.
    const formData = new FormData();
    formData.append('name', user.name); // Send current name
    formData.append('email', user.email); // Send current email
    formData.append('password', passwords.newPassword); // This is the NEW password for your backend

    // If your backend were to verify oldPassword, you'd send it like:
    // formData.append('oldPassword', passwords.oldPassword);
    // But your current backend doesn't use this.

    try {
      const response = await fetch(`/api/teacher/edit-profile`, { // Aligns with your teacherRouter
        method: 'PUT',
        headers: {
          // Content-Type is set automatically by browser for FormData
          'role': session.user.role,
          [`${session.user.role}-token`]: (session as any).accessToken,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.status === true) {
        toast.success(result.message || 'Password updated successfully!');
        setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordStrength(0);
        setLastUpdated(new Date().toLocaleDateString()); // Update last changed date locally
        // Dispatch event so other components (like sidebar if it showed this) can update
        window.dispatchEvent(new CustomEvent('profileUpdated'));
      } else {
        // Attempt to provide a more specific error from backend if available
        const backendErrorMessage = result?.message || result?.error || 'Password update failed.';
        setErrors(prev => [...prev, backendErrorMessage]); // Show backend error in form
        toast.error(backendErrorMessage);
      }
    } catch (error) {
      console.error("Password update error:", error);
      const generalErrorMessage = 'An unexpected error occurred. Please try again.';
      setErrors(prev => [...prev, generalErrorMessage]);
      toast.error(generalErrorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const strengthMeterColors = [
    'bg-slate-200 dark:bg-slate-700', // Default/Empty
    'bg-red-500',                     // Very Weak (strength 1)
    'bg-orange-500',                  // Weak (strength 2)
    'bg-yellow-500',                  // Fair (strength 3)
    'bg-green-500',                   // Strong (strength 4+)
  ];
  const strengthText = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-xl mx-auto p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"
    >
      <div className="mb-6 sm:mb-8 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
          Change Your Password
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {lastUpdated ? `Last updated: ${lastUpdated}` : "Manage your account security."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="oldPassword" className={`${style.input_label} block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5`}>
            Current Password
          </label>
          <div className="relative">
            <input
              id="oldPassword"
              type="password"
              value={passwords.oldPassword}
              onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
              className={`${style.input} w-full pl-10 pr-4 py-2.5 rounded-lg`}
              placeholder="Enter your current password"
              required
            />
            <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          </div>
        </div>

        <div>
          <label htmlFor="newPassword" className={`${style.input_label} block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5`}>
            New Password
          </label>
          <div className="relative">
            <input
              id="newPassword"
              type="password"
              value={passwords.newPassword}
              onChange={(e) => {
                setPasswords({ ...passwords, newPassword: e.target.value });
                validatePasswordStrength(e.target.value); // Validate on change
              }}
              className={`${style.input} w-full pl-10 pr-4 py-2.5 rounded-lg`}
              placeholder="Enter your new password"
              required
            />
            <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          </div>
          {passwords.newPassword && ( // Show strength meter only when typing new password
            <div className="mt-2">
              <div className="flex gap-1.5 h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600">
                {[...Array(4)].map((_, i) => ( // 4 bars for strength display
                  <div
                    key={i}
                    className={`h-full flex-1 transition-all duration-300 ${
                      i < passwordStrength ? strengthMeterColors[passwordStrength] : ''
                    }`}
                    style={{ width: `${(i < passwordStrength ? (passwordStrength / 4) * 100 : 0)}%` }} // Dynamic width for filled part
                  />
                ))}
              </div>
              <p className={`text-xs mt-1 ${passwordStrength < 2 ? 'text-red-500' : passwordStrength < 3 ? 'text-orange-500' : 'text-green-500'} dark:text-gray-400`}>
                Password strength: {strengthText[passwordStrength] || 'Enter password'}
              </p>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className={`${style.input_label} block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5`}>
            Confirm New Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              className={`${style.input} w-full pl-10 pr-4 py-2.5 rounded-lg`}
              placeholder="Confirm your new password"
              required
            />
            <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          </div>
        </div>

        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg text-red-700 dark:text-red-300 text-sm"
          >
            <ul className="space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="flex items-start gap-1.5">
                  <FiAlertCircle className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0px 5px 15px rgba(99, 102, 241, 0.4)" }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold
                    text-base hover:bg-indigo-700 focus:outline-none focus:ring-2
                    focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800
                    transition-all duration-150 ease-in-out disabled:opacity-60
                    disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin" />
              Updating Password...
            </>
          ) : (
            <>
              <FiCheckCircle className="text-lg" />
              Update Password
            </>
          )}
        </motion.button>

        <div className="text-center pt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            For strong security, ensure your password includes:
            <span className="block mt-1">• At least 8 characters</span>
            <span className="block">• A mix of uppercase & lowercase letters</span>
            <span className="block">• At least one number</span>
            <span className="block">• At least one special character (e.g., !@#$%^&*)</span>
          </p>
        </div>
      </form>
    </motion.div>
  );
};

export default ChangePassword;