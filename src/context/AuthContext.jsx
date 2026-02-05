import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '@/services/authService';
import { ROLES } from '@/utils/constants';
import { getErrorMessage } from '@/utils/helpers';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          // Try to get fresh user data from server
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } else {
          // Try to restore from local storage
          const storedUser = authService.getStoredUser();
          if (storedUser) {
            setUser(storedUser);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid auth data
        authService.clearAuth();
        setUser(null);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initAuth();
  }, []);

  // Login
  const login = useCallback(
    async (email, password) => {
      try {
        const { user: userData } = await authService.login(email, password);
        setUser(userData);

        toast.success(`Welcome back, ${userData.name}!`);

        // Verified users always go to my-profile; admins go to intended page or dashboard
        const isVerified = userData.role === ROLES.VERIFIED_USER;
        const defaultPath = [ROLES.SUPER_ADMIN, ROLES.OFFICE_ADMIN].includes(
          userData.role
        )
          ? '/dashboard'
          : '/my-profile';
        const target = isVerified
          ? '/my-profile'
          : location.state?.from?.pathname || defaultPath;
        navigate(target, { replace: true });

        return { success: true };
      } catch (error) {
        const message = getErrorMessage(error) || 'Login failed';
        if (error.code === 'ERR_NETWORK' || !error.response) {
          const networkError =
            'Cannot reach server. Is the backend running? Set VITE_API_URL in .env to your API URL (e.g. http://localhost:8000/api).';
          toast.error(networkError);
          return { success: false, error: networkError };
        }
        toast.error(message);
        return { success: false, error: message };
      }
    },
    [navigate, location]
  );

  // Logout
  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
      toast.success('Logged out successfully');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout anyway
      authService.clearAuth();
      setUser(null);
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Refresh user error:', error);
      throw error;
    }
  }, []);

  // Change password
  const changePassword = useCallback(
    async (currentPassword, newPassword, confirmPassword) => {
      try {
        await authService.changePassword(
          currentPassword,
          newPassword,
          confirmPassword
        );
        toast.success('Password changed successfully');
        return { success: true };
      } catch (error) {
        const message =
          error.response?.data?.message || 'Failed to change password';
        toast.error(message);
        return { success: false, error: message };
      }
    },
    []
  );

  // Role checks
  const isSuperAdmin = useCallback(() => {
    return user?.role === ROLES.SUPER_ADMIN;
  }, [user]);

  const isOfficeAdmin = useCallback(() => {
    return user?.role === ROLES.OFFICE_ADMIN;
  }, [user]);

  const isVerifiedUser = useCallback(() => {
    return user?.role === ROLES.VERIFIED_USER;
  }, [user]);

  const isAdmin = useCallback(() => {
    return isSuperAdmin() || isOfficeAdmin();
  }, [isSuperAdmin, isOfficeAdmin]);

  // Permission checks
  const hasRole = useCallback(
    (roles) => {
      if (!user?.role) return false;
      if (typeof roles === 'string') {
        return user.role === roles;
      }
      return roles.includes(user.role);
    },
    [user]
  );

  const canManageOffice = useCallback(
    (officeId) => {
      if (!user) return false;
      if (isSuperAdmin()) return true;
      return user.managed_office_ids?.includes(officeId) || false;
    },
    [user, isSuperAdmin]
  );

  const canManageEmployee = useCallback(
    (employee) => {
      if (!user) return false;
      if (isSuperAdmin()) return true;
      if (isOfficeAdmin()) {
        return canManageOffice(employee.current_office_id);
      }
      return false;
    },
    [user, isSuperAdmin, isOfficeAdmin, canManageOffice]
  );

  const canViewEmployee = useCallback(
    (employee) => {
      if (!user) return false;
      if (isAdmin()) return canManageEmployee(employee);
      // Verified user can only view self
      return user.employee_id === employee.id;
    },
    [user, isAdmin, canManageEmployee]
  );

  // Get managed office IDs
  const getManagedOfficeIds = useCallback(() => {
    return user?.managed_office_ids || [];
  }, [user]);

  const value = {
    user,
    loading,
    initialized,
    isAuthenticated: !!user,

    // Actions
    login,
    logout,
    refreshUser,
    changePassword,

    // Role checks
    isSuperAdmin,
    isOfficeAdmin,
    isVerifiedUser,
    isAdmin,
    hasRole,

    // Permission checks
    canManageOffice,
    canManageEmployee,
    canViewEmployee,
    getManagedOfficeIds,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
