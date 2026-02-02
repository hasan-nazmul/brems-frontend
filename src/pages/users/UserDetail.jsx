import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  UserCircleIcon,
  ArrowLeftIcon,
  KeyIcon,
  NoSymbolIcon,
  LinkIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { userService, employeeService } from '@/services';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  Avatar,
  Alert,
  LoadingScreen,
  Modal,
  SearchInput,
  ConfirmModal,
} from '@/components/common';
import { ROLE_LABELS, ROLE_COLORS } from '@/utils/constants';
import { getFullName, formatDate, getErrorMessage } from '@/utils/helpers';
import toast from 'react-hot-toast';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const permissions = usePermissions();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [unlinkModalOpen, setUnlinkModalOpen] = useState(false);
  const [employeesWithoutUser, setEmployeesWithoutUser] = useState([]);
  const [linkEmployeeId, setLinkEmployeeId] = useState('');
  const [linkSearch, setLinkSearch] = useState('');
  const [linkSearchLoading, setLinkSearchLoading] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const [unlinkLoading, setUnlinkLoading] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getById(id);
      setUser(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = () => {
    const newPass = prompt('Enter new password (min 6 characters):');
    if (newPass && newPass.length >= 6) {
      setActionLoading(true);
      userService
        .resetPassword(id, newPass)
        .then(() => {
          toast.success('Password reset successfully');
        })
        .catch((err) => toast.error(getErrorMessage(err)))
        .finally(() => setActionLoading(false));
    } else if (newPass !== null) {
      toast.error('Password must be at least 6 characters');
    }
  };

  const handleToggleActive = async () => {
    try {
      setActionLoading(true);
      await userService.toggleActive(id);
      toast.success(user?.is_active ? 'User deactivated' : 'User activated');
      fetchUser();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const fetchEmployeesForLink = async (search = '') => {
    setLinkSearchLoading(true);
    try {
      const list = await employeeService.getAll({
        without_user: true,
        ...(search.trim() ? { search: search.trim() } : {}),
      });
      setEmployeesWithoutUser(list);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setEmployeesWithoutUser([]);
    } finally {
      setLinkSearchLoading(false);
    }
  };

  const openLinkModal = () => {
    setLinkModalOpen(true);
    setLinkEmployeeId('');
    setLinkSearch('');
  };

  // When link modal opens or search changes, fetch employees (debounced)
  useEffect(() => {
    if (!linkModalOpen) return;
    const timer = setTimeout(() => {
      fetchEmployeesForLink(linkSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [linkModalOpen, linkSearch]);

  const handleLinkEmployee = async () => {
    if (!linkEmployeeId) {
      toast.error('Select an employee');
      return;
    }
    try {
      setLinkLoading(true);
      await userService.update(id, {
        employee_id: parseInt(linkEmployeeId, 10),
      });
      toast.success('Employee linked successfully');
      setLinkModalOpen(false);
      fetchUser();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLinkLoading(false);
    }
  };

  const handleUnlinkEmployee = async () => {
    try {
      setUnlinkLoading(true);
      await userService.update(id, { employee_id: null });
      toast.success('Employee unlinked');
      setUnlinkModalOpen(false);
      fetchUser();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUnlinkLoading(false);
    }
  };

  const isSelf = currentUser?.id === parseInt(id, 10);
  const canLinkEmployee = !isSelf && permissions.canEditUser;

  if (loading) {
    return <LoadingScreen message='Loading user...' />;
  }

  if (error || !user) {
    return (
      <div className='p-8'>
        <Alert variant='error' title='Error'>
          {error || 'User not found'}
        </Alert>
        <Button
          className='mt-4'
          onClick={() => navigate('/users')}
          icon={ArrowLeftIcon}
        >
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <PageHeader
        title={user.name}
        subtitle={user.email}
        breadcrumbs={[{ label: 'Users', href: '/users' }, { label: user.name }]}
        actions={
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              onClick={() => navigate('/users')}
              icon={ArrowLeftIcon}
            >
              Back
            </Button>
            {!isSelf && permissions.canEditUser && (
              <>
                <Button
                  variant='outline'
                  icon={KeyIcon}
                  onClick={handleResetPassword}
                  loading={actionLoading}
                >
                  Reset Password
                </Button>
                <Button
                  variant={user.is_active ? 'error' : 'primary'}
                  icon={NoSymbolIcon}
                  onClick={handleToggleActive}
                  loading={actionLoading}
                >
                  {user.is_active ? 'Deactivate' : 'Activate'}
                </Button>
              </>
            )}
          </div>
        }
      />

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
            <Badge
              variant={user.is_active ? 'success' : 'error'}
              className='mt-2'
            >
              {user.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </Card>

        <div className='lg:col-span-2 space-y-6'>
          <Card>
            <h3 className='text-sm font-medium text-gray-500 mb-4'>Details</h3>
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
              <div>
                <dt className='text-sm text-gray-500'>Office</dt>
                <dd className='mt-1 text-gray-900'>
                  {user.office ? (
                    <Link
                      to={`/offices/${user.office.id}`}
                      className='text-primary-600 hover:underline'
                    >
                      {user.office.name}
                    </Link>
                  ) : (
                    '-'
                  )}
                </dd>
              </div>
              <div>
                <dt className='text-sm text-gray-500'>Linked Employee</dt>
                <dd className='mt-1 flex items-center gap-2'>
                  {user.employee ? (
                    <>
                      <Link
                        to={`/employees/${user.employee.id}`}
                        className='text-primary-600 hover:underline'
                      >
                        {getFullName(
                          user.employee.first_name,
                          user.employee.last_name
                        )}
                        {user.employee.designation &&
                          ` (${user.employee.designation.title})`}
                      </Link>
                      {canLinkEmployee && (
                        <Button
                          variant='ghost'
                          size='sm'
                          icon={XCircleIcon}
                          onClick={() => setUnlinkModalOpen(true)}
                          className='text-gray-500 hover:text-red-600'
                        >
                          Unlink
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <span className='text-gray-500'>-</span>
                      {canLinkEmployee && (
                        <Button
                          variant='outline'
                          size='sm'
                          icon={LinkIcon}
                          onClick={openLinkModal}
                        >
                          Link employee
                        </Button>
                      )}
                    </>
                  )}
                </dd>
              </div>
              <div>
                <dt className='text-sm text-gray-500'>Status</dt>
                <dd className='mt-1'>
                  <Badge variant={user.is_active ? 'success' : 'error'}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>

      {/* Link employee modal */}
      <Modal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        title='Link employee to this user'
        size='lg'
      >
        <div className='space-y-4'>
          <p className='text-sm text-gray-600'>
            Search by name or NID to find an employee who does not yet have a
            user account. Select one to link so they can log in with this
            profile.
          </p>
          <SearchInput
            value={linkSearch}
            onChange={(e) => setLinkSearch(e.target.value)}
            placeholder='Search by name or NID...'
            className='w-full'
          />
          <div className='min-h-[200px] max-h-[320px] overflow-y-auto rounded-lg border border-gray-200 bg-gray-50/50'>
            {linkSearchLoading ? (
              <div className='flex items-center justify-center py-12'>
                <div className='animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full' />
              </div>
            ) : employeesWithoutUser.length === 0 ? (
              <div className='py-12 text-center text-sm text-gray-500'>
                {linkSearch.trim()
                  ? 'No employees found. Try a different name or NID.'
                  : 'Type a name or NID above to search for employees without a linked account.'}
              </div>
            ) : (
              <ul className='divide-y divide-gray-200'>
                {employeesWithoutUser.map((emp) => (
                  <li key={emp.id}>
                    <button
                      type='button'
                      onClick={() =>
                        setLinkEmployeeId(
                          linkEmployeeId === String(emp.id)
                            ? ''
                            : String(emp.id)
                        )
                      }
                      className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-100 transition-colors ${
                        linkEmployeeId === String(emp.id)
                          ? 'bg-primary-50 border-l-4 border-primary-600'
                          : ''
                      }`}
                    >
                      <div>
                        <p className='font-medium text-gray-900'>
                          {getFullName(emp.first_name, emp.last_name)}
                        </p>
                        <p className='text-sm text-gray-500'>
                          NID: {emp.nid_number || '—'}
                          {emp.designation ? ` · ${emp.designation.title}` : ''}
                        </p>
                      </div>
                      {linkEmployeeId === String(emp.id) && (
                        <span className='text-sm font-medium text-primary-600'>
                          Selected
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {linkEmployeeId &&
            (() => {
              const selected = employeesWithoutUser.find(
                (e) => String(e.id) === linkEmployeeId
              );
              return selected ? (
                <p className='text-sm text-gray-500'>
                  Selected:{' '}
                  {getFullName(selected.first_name, selected.last_name)}
                </p>
              ) : null;
            })()}
        </div>
        <div className='mt-6 flex justify-end gap-2'>
          <Button variant='outline' onClick={() => setLinkModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant='primary'
            onClick={handleLinkEmployee}
            loading={linkLoading}
            disabled={!linkEmployeeId}
          >
            Link
          </Button>
        </div>
      </Modal>

      {/* Unlink employee confirm */}
      <ConfirmModal
        isOpen={unlinkModalOpen}
        onClose={() => setUnlinkModalOpen(false)}
        onConfirm={handleUnlinkEmployee}
        title='Unlink employee'
        message='This user will no longer be associated with the employee profile. The employee record is not affected.'
        confirmText='Unlink'
        variant='danger'
        loading={unlinkLoading}
      />
    </div>
  );
};

export default UserDetail;
