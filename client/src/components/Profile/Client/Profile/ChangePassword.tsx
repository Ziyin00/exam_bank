import { motion } from 'framer-motion';
import { useState } from 'react';
import { FiLock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { style } from "@/src/styles/style";

type Props = {
  user: any;
}

const ChangePassword: React.FC<Props> = ({ user }) => {
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const validatePassword = (password: string) => {
    const strength = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password)
    ].filter(Boolean).length;
    
    setPasswordStrength(strength);
    return strength >= 3;
  };

  const validateForm = () => {
    const newErrors = [];
    
    if (!passwords.oldPassword) {
      newErrors.push('Current password is required');
    }
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.push('Passwords do not match');
    }
    
    if (!validatePassword(passwords.newPassword)) {
      newErrors.push('Password must contain at least 8 characters, including uppercase, number, and special character');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Password updated successfully!');
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Password update failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const strengthColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-green-600'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Security Settings
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Last updated: {new Date(user?.lastPasswordChange || Date.now()).toLocaleDateString()}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Current Password
          </label>
          <div className="relative">
            <input
              type="password"
              value={passwords.oldPassword}
              onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
              className={`${style.input} w-full pl-10 pr-4 py-3 rounded-lg`}
              placeholder="Enter current password"
            />
            <FiLock className="absolute left-3 top-3.5 text-gray-400" />
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type="password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
              className={`${style.input} w-full pl-10 pr-4 py-3 rounded-lg`}
              placeholder="Enter new password"
            />
            <FiLock className="absolute left-3 top-3.5 text-gray-400" />
          </div>
          <div className="mt-2">
            <div className="flex gap-1 h-1.5 mb-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-all ${
                    i < passwordStrength ? strengthColors[passwordStrength] : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Password strength: {['Weak', 'Fair', 'Good', 'Strong'][passwordStrength - 1] || 'Very Weak'}
            </p>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
              className={`${style.input} w-full pl-10 pr-4 py-3 rounded-lg`}
              placeholder="Confirm new password"
            />
            <FiLock className="absolute left-3 top-3.5 text-gray-400" />
          </div>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400"
          >
            {errors.map((error, index) => (
              <div key={index} className="flex items-center gap-2 mb-1">
                <FiAlertCircle className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            ))}
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="w-full bg-emerald-500 text-white py-3 px-6 rounded-lg font-medium
                    hover:bg-emerald-600 transition-colors disabled:opacity-70
                    disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <FiCheckCircle className="text-lg" />
              Update Password
            </>
          )}
        </motion.button>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Password requirements:
            <span className="block">• Minimum 8 characters</span>
            <span className="block">• At least one uppercase letter</span>
            <span className="block">• At least one number</span>
            <span className="block">• At least one special character</span>
          </p>
        </div>
      </form>
    </motion.div>
  );
};

export default ChangePassword;