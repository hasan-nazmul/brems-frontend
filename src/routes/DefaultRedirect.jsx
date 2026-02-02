import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@/utils/constants';

/**
 * Redirects authenticated users to their role-appropriate default page:
 * - Super Admin / Office Admin → /dashboard
 * - Verified User (employee) → /my-profile (approved info)
 */
const DefaultRedirect = () => {
  const { user, hasRole } = useAuth();

  if (!user) {
    return <Navigate to='/login' replace />;
  }

  const isAdmin = hasRole([ROLES.SUPER_ADMIN, ROLES.OFFICE_ADMIN]);
  const to = isAdmin ? '/dashboard' : '/my-profile';

  return <Navigate to={to} replace />;
};

export default DefaultRedirect;
