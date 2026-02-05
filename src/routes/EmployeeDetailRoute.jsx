import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import EmployeeDetail from '@/pages/employees/EmployeeDetail';
import { ROLES } from '@/utils/constants';

/**
 * Renders employee detail for admins only.
 * Verified users are redirected to /my-profile (they see the same info there).
 */
const EmployeeDetailRoute = () => {
  const { id } = useParams();
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole([ROLES.SUPER_ADMIN, ROLES.OFFICE_ADMIN]);
  const isVerifiedUser = user?.role === ROLES.VERIFIED_USER;

  if (isVerifiedUser) {
    return <Navigate to='/my-profile' replace />;
  }

  if (!isAdmin) {
    return <Navigate to='/my-profile' replace />;
  }

  return <EmployeeDetail />;
};

export default EmployeeDetailRoute;
