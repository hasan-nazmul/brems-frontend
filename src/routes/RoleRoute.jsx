import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Alert } from '@/components/common';

const RoleRoute = ({
  children,
  allowedRoles = [],
  fallback = null,
  /** When set, verified users without allowed role are redirected here (e.g. /my-profile for dashboard) */
  redirectVerifiedTo = null,
}) => {
  const { user, hasRole, isVerifiedUser } = useAuth();

  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    if (redirectVerifiedTo && user && isVerifiedUser()) {
      return <Navigate to={redirectVerifiedTo} replace />;
    }
    if (fallback) {
      return fallback;
    }
    return (
      <div className='p-8'>
        <Alert variant='error' title='Access Denied'>
          You don't have permission to access this page. Please contact your
          administrator if you believe this is an error.
        </Alert>
      </div>
    );
  }

  return children;
};

export default RoleRoute;
