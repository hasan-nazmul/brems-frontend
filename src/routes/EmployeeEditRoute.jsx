import { useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Alert, LoadingScreen } from '@/components/common';
import { ROLES } from '@/utils/constants';
import EmployeeEdit from '@/pages/employees/EmployeeEdit';

/**
 * Allows access to employee edit when:
 * - User is super_admin or office_admin (edit any employee), or
 * - User is verified_user and the employee id is their own (edit own profile → submitted as request).
 */
const EmployeeEditRoute = () => {
  const { id } = useParams();
  const { user, hasRole, loading, initialized } = useAuth();
  const isAdmin = hasRole([ROLES.SUPER_ADMIN, ROLES.OFFICE_ADMIN]);
  const isOwnProfile =
    user?.role === ROLES.VERIFIED_USER &&
    user?.employee_id != null &&
    String(user.employee_id) === String(id);

  if (!initialized || loading) {
    return <LoadingScreen message='Loading...' />;
  }

  if (isAdmin || isOwnProfile) {
    return <EmployeeEdit />;
  }

  return (
    <div className='p-8'>
      <Alert variant='error' title='Access Denied'>
        You don&apos;t have permission to access this page. You can only edit
        your own profile from My Profile.
      </Alert>
    </div>
  );
};

export default EmployeeEditRoute;
