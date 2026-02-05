import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { employeeService } from '@/services';
import { Alert, LoadingScreen } from '@/components/common';
import { getErrorMessage } from '@/utils/helpers';
import EmployeeDetail from '@/pages/employees/EmployeeDetail';

/**
 * My Profile shows the same full employee view as employees/{id},
 * for the logged-in user's linked employee. Verified users use only this page
 * (they cannot access /employees/:id).
 */
const MyProfile = () => {
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(!!user?.employee_id);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.employee_id) {
      fetchEmployee();
    } else {
      setLoading(false);
    }
  }, [user?.employee_id]);

  const fetchEmployee = async () => {
    if (!user?.employee_id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await employeeService.getById(user.employee_id);
      setEmployee(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className='p-8'>
        <Alert variant='warning' title='Not logged in'>
          Please log in to view your profile.
        </Alert>
      </div>
    );
  }

  if (!user.employee_id) {
    return (
      <div className='p-8'>
        <Alert variant='warning' title='No employee linked'>
          Your account is not linked to an employee profile. Contact your
          administrator to link your account.
        </Alert>
      </div>
    );
  }

  if (loading && !employee) {
    return <LoadingScreen message='Loading profile...' />;
  }

  if (error && !employee) {
    return (
      <div className='p-8'>
        <Alert variant='error' onDismiss={() => setError(null)}>
          {error}
        </Alert>
      </div>
    );
  }

  if (!employee) {
    return null;
  }

  return (
    <EmployeeDetail
      initialEmployee={employee}
      isMyProfilePage
      onRefresh={fetchEmployee}
    />
  );
};

export default MyProfile;
