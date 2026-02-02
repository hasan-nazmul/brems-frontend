import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserCircleIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import { employeeService } from '@/services';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  Avatar,
  Alert,
  LoadingScreen,
} from '@/components/common';
import DocumentsTab from '@/pages/employees/tabs/DocumentsTab';
import { ROLE_LABELS, ROLE_COLORS } from '@/utils/constants';
import { getFullName, formatDate, getErrorMessage } from '@/utils/helpers';

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

  if (loading && user.employee_id) {
    return <LoadingScreen message='Loading profile...' />;
  }

  return (
    <div className='space-y-6'>
      <PageHeader
        title='My Profile'
        subtitle={user.email}
        actions={
          user.employee_id && (
            <Link to={`/employees/${user.employee_id}/edit`}>
              <Button variant='outline' icon={PencilSquareIcon}>
                Edit Profile
              </Button>
            </Link>
          )
        }
      />

      {error && (
        <Alert variant='error' onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <Card className='lg:col-span-1'>
          <div className='flex flex-col items-center p-6'>
            <Avatar name={user.name} size='xl' />
            <h2 className='mt-4 text-lg font-semibold text-gray-900'>
              {user.name}
            </h2>
            <p className='text-sm text-gray-500'>{user.email}</p>
            <Badge
              className={`mt-2 ${
                ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-800'
              }`}
            >
              {ROLE_LABELS[user.role] || user.role}
            </Badge>
          </div>
        </Card>

        <div className='lg:col-span-2 space-y-6'>
          <Card className='p-6'>
            <h3 className='text-sm font-medium text-gray-500 mb-4'>Account</h3>
            <dl className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <dt className='text-sm text-gray-500'>Name</dt>
                <dd className='mt-1 font-medium text-gray-900'>{user.name}</dd>
              </div>
              <div>
                <dt className='text-sm text-gray-500'>Email</dt>
                <dd className='mt-1 text-gray-900'>{user.email}</dd>
              </div>
              <div>
                <dt className='text-sm text-gray-500'>Role</dt>
                <dd className='mt-1'>
                  <Badge
                    className={
                      ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-800'
                    }
                  >
                    {ROLE_LABELS[user.role] || user.role}
                  </Badge>
                </dd>
              </div>
              {user.office && (
                <div>
                  <dt className='text-sm text-gray-500'>Office</dt>
                  <dd className='mt-1 text-gray-900'>
                    <Link
                      to={`/offices/${user.office.id}`}
                      className='text-primary-600 hover:underline'
                    >
                      {user.office.name}
                    </Link>
                  </dd>
                </div>
              )}
            </dl>
          </Card>

          {employee && (
            <>
              <Card className='p-6'>
                <h3 className='text-sm font-medium text-gray-500 mb-4'>
                  Employee Profile
                </h3>
                <p className='text-gray-600 mb-4'>
                  Your account is linked to an employee record. You can view and
                  request updates to your profile.
                </p>
                <Link to={`/employees/${employee.id}`}>
                  <Button variant='outline' size='sm'>
                    View Employee Profile
                  </Button>
                </Link>
              </Card>

              <Card className='p-6'>
                <DocumentsTab
                  employee={employee}
                  onUpdate={fetchEmployee}
                  canManage={true}
                />
              </Card>
            </>
          )}

          {!user.employee_id && (
            <Card className='p-6'>
              <p className='text-gray-600'>
                Your account is not linked to an employee profile. Contact your
                administrator to link your account.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
