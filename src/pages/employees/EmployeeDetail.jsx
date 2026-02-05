import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  PencilSquareIcon,
  ArrowDownTrayIcon,
  CheckBadgeIcon,
  ArrowRightOnRectangleIcon,
  ArrowsRightLeftIcon,
  ArrowTrendingUpIcon,
  UserMinusIcon,
  KeyIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { employeeService } from '@/services';
import {
  PageHeader,
  Button,
  Card,
  Tabs,
  Badge,
  Avatar,
  Alert,
  LoadingScreen,
  ConfirmModal,
  Modal,
} from '@/components/common';
import { STATUS_LABELS, EMPLOYEE_STATUS, ROLE_LABELS } from '@/utils/constants';
import {
  formatDate,
  formatCurrency,
  getErrorMessage,
  getStorageUrl,
} from '@/utils/helpers';
import toast from 'react-hot-toast';

// Tab Components
import PersonalInfoTab from './tabs/PersonalInfoTab';
import FamilyTab from './tabs/FamilyTab';
import AddressTab from './tabs/AddressTab';
import AcademicsTab from './tabs/AcademicsTab';
import EmploymentTab from './tabs/EmploymentTab';
import DocumentsTab from './tabs/DocumentsTab';
import TimelineTab from './tabs/TimelineTab';
import AccountTab from './tabs/AccountTab';

// Modals
import TransferModal from './modals/TransferModal';
import PromotionModal from './modals/PromotionModal';
import ReleaseModal from './modals/ReleaseModal';

const EmployeeDetail = ({
  initialEmployee = null,
  isMyProfilePage = false,
  onRefresh = null,
}) => {
  const { id: paramsId } = useParams();
  const navigate = useNavigate();
  const { user, isSuperAdmin, canManageEmployee } = useAuth();
  const permissions = usePermissions();

  const id =
    initialEmployee?.id != null ? String(initialEmployee.id) : paramsId;

  // State: when used as My Profile, parent passes initialEmployee and controls refresh
  const [employee, setEmployee] = useState(initialEmployee || null);
  const [loading, setLoading] = useState(!initialEmployee);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');

  // Modals
  const [verifyModal, setVerifyModal] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [releaseModal, setReleaseModal] = useState(false);
  const [transferModal, setTransferModal] = useState(false);
  const [promotionModal, setPromotionModal] = useState(false);
  const [retireModal, setRetireModal] = useState(false);
  const [retiring, setRetiring] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (initialEmployee) {
      setEmployee(initialEmployee);
      setLoading(false);
      return;
    }
    if (paramsId) fetchEmployee();
  }, [paramsId, initialEmployee]);

  const fetchEmployee = async () => {
    if (!paramsId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await employeeService.getById(paramsId);
      setEmployee(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const refreshEmployee = onRefresh || fetchEmployee;

  const handleVerify = async () => {
    try {
      setVerifying(true);
      await employeeService.verify(id);
      toast.success('Employee verified successfully');
      refreshEmployee();
      setVerifyModal(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setVerifying(false);
    }
  };

  const handleRetire = async () => {
    try {
      setRetiring(true);
      await employeeService.retire(id);
      toast.success('Employee retired successfully');
      fetchEmployee();
      setRetireModal(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRetiring(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await employeeService.delete(id);
      toast.success('Employee deleted successfully');
      navigate('/employees');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      toast.loading('Generating PDF...');
      await employeeService.downloadProfilePdf(id);
      toast.dismiss();
      toast.success('PDF downloaded');
    } catch (err) {
      toast.dismiss();
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) {
    return <LoadingScreen message='Loading employee details...' />;
  }

  if (error) {
    return (
      <div className='p-8'>
        <Alert variant='error' title='Error loading employee'>
          {error}
        </Alert>
        <Button className='mt-4' onClick={() => navigate('/employees')}>
          Back to Employees
        </Button>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className='p-8'>
        <Alert variant='error' title='Employee not found'>
          The requested employee could not be found.
        </Alert>
        <Button className='mt-4' onClick={() => navigate('/employees')}>
          Back to Employees
        </Button>
      </div>
    );
  }

  const canManage = isMyProfilePage ? false : canManageEmployee(employee);
  const isOwnProfile = user?.employee_id === employee.id;

  const tabs = [
    {
      id: 'personal',
      label: 'Personal Info',
      content: <PersonalInfoTab employee={employee} />,
    },
    {
      id: 'family',
      label: 'Family',
      content: <FamilyTab employee={employee} />,
    },
    {
      id: 'address',
      label: 'Address',
      content: <AddressTab employee={employee} />,
    },
    {
      id: 'academics',
      label: 'Academics',
      content: <AcademicsTab employee={employee} />,
    },
    {
      id: 'employment',
      label: 'Employment',
      content: <EmploymentTab employee={employee} />,
    },
    {
      id: 'documents',
      label: 'Documents',
      content: (
        <DocumentsTab
          employee={employee}
          onUpdate={refreshEmployee}
          canManage={canManage}
          canUpload={canManage || isOwnProfile}
        />
      ),
    },
    {
      id: 'timeline',
      label: 'Timeline',
      content: <TimelineTab employee={employee} />,
    },
    ...(canManage
      ? [
          {
            id: 'account',
            label: 'Account',
            content: (
              <AccountTab employee={employee} onUpdate={refreshEmployee} />
            ),
          },
        ]
      : []),
  ];

  return (
    <div className='min-w-0 overflow-x-hidden'>
      <PageHeader
        title={isMyProfilePage ? 'My Profile' : 'Employee Details'}
        breadcrumbs={
          isMyProfilePage
            ? [{ label: 'My Profile' }]
            : [
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Employees', href: '/employees' },
                { label: `${employee.first_name} ${employee.last_name}` },
              ]
        }
        actions={
          <div className='flex flex-wrap items-center gap-2 w-full sm:w-auto'>
            <Button
              variant='outline'
              size='sm'
              icon={ArrowDownTrayIcon}
              onClick={handleDownloadPdf}
            >
              Download PDF
            </Button>
            {(canManage || isMyProfilePage) && id && (
              <Link to={`/employees/${id}/edit`}>
                <Button variant='outline' size='sm' icon={PencilSquareIcon}>
                  {isMyProfilePage ? 'Edit Profile' : 'Edit'}
                </Button>
              </Link>
            )}
          </div>
        }
      />

      {/* Employee Header Card */}
      <Card className='mb-6 overflow-hidden'>
        <div className='p-4 sm:p-6 min-w-0'>
          <div className='flex flex-col md:flex-row gap-4 sm:gap-6'>
            {/* Avatar & Basic Info */}
            <div className='flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 min-w-0'>
              <Avatar
                src={
                  employee.profile_picture
                    ? getStorageUrl(employee.profile_picture) ||
                      `/storage/${employee.profile_picture}`
                    : null
                }
                name={`${employee.first_name} ${employee.last_name}`}
                size='2xl'
                className='flex-shrink-0'
              />
              <div className='min-w-0'>
                <h2 className='text-xl sm:text-2xl font-bold text-gray-900 break-words'>
                  {employee.first_name} {employee.last_name}
                </h2>
                {employee.name_bn && (
                  <p className='text-lg text-gray-600 font-bangla'>
                    {employee.name_bn}
                  </p>
                )}
                <p className='text-gray-500 mt-1'>
                  {employee.designation?.title || 'No designation'}
                  {employee.designation?.grade &&
                    ` • Grade ${employee.designation.grade}`}
                </p>
                <p className='text-gray-500'>
                  {employee.office?.name || 'No office assigned'}
                </p>
                <div className='flex items-center gap-2 mt-3'>
                  <Badge
                    variant={
                      employee.status === EMPLOYEE_STATUS.ACTIVE
                        ? 'success'
                        : employee.status === EMPLOYEE_STATUS.RELEASED
                        ? 'warning'
                        : 'default'
                    }
                  >
                    {STATUS_LABELS[employee.status] || employee.status}
                  </Badge>
                  {employee.is_verified ? (
                    <Badge variant='success' dot>
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant='warning' dot>
                      Not Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className='md:ml-auto grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 min-w-0'>
              <div className='text-center p-3 sm:p-4 bg-gray-50 rounded-lg min-w-0'>
                <p
                  className='text-lg sm:text-2xl font-bold text-gray-900 truncate'
                  title={formatCurrency(
                    employee.designation?.basic_salary,
                    false
                  )}
                >
                  {formatCurrency(employee.designation?.basic_salary, false)}
                </p>
                <p className='text-xs text-gray-500'>Basic Salary</p>
              </div>
              <div className='text-center p-3 sm:p-4 bg-gray-50 rounded-lg min-w-0'>
                <p className='text-lg sm:text-2xl font-bold text-gray-900'>
                  {employee.transfers?.length || 0}
                </p>
                <p className='text-xs text-gray-500'>Transfers</p>
              </div>
              <div className='text-center p-3 sm:p-4 bg-gray-50 rounded-lg min-w-0'>
                <p className='text-lg sm:text-2xl font-bold text-gray-900'>
                  {employee.promotions?.length || 0}
                </p>
                <p className='text-xs text-gray-500'>Promotions</p>
              </div>
              <div className='text-center p-3 sm:p-4 bg-gray-50 rounded-lg min-w-0'>
                <p
                  className='text-lg sm:text-2xl font-bold text-gray-900 truncate'
                  title={
                    employee.joining_date
                      ? formatDate(employee.joining_date)
                      : ''
                  }
                >
                  {employee.joining_date
                    ? formatDate(employee.joining_date)
                    : '-'}
                </p>
                <p className='text-xs text-gray-500'>Joining Date</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {canManage && employee.status === EMPLOYEE_STATUS.ACTIVE && (
            <div className='mt-6 pt-6 border-t border-gray-200 flex flex-wrap gap-2 sm:gap-3'>
              {!employee.is_verified && (
                <Button
                  variant='success'
                  size='sm'
                  icon={CheckBadgeIcon}
                  onClick={() => setVerifyModal(true)}
                >
                  Verify Employee
                </Button>
              )}
              <Button
                variant='outline'
                size='sm'
                icon={ArrowRightOnRectangleIcon}
                onClick={() => setReleaseModal(true)}
              >
                Release for Transfer
              </Button>
              {isSuperAdmin() && (
                <>
                  <Button
                    variant='outline'
                    size='sm'
                    icon={ArrowTrendingUpIcon}
                    onClick={() => setPromotionModal(true)}
                  >
                    Promote
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    icon={UserMinusIcon}
                    onClick={() => setRetireModal(true)}
                  >
                    Retire
                  </Button>
                  <Button
                    variant='outline-danger'
                    size='sm'
                    icon={TrashIcon}
                    onClick={() => setDeleteModal(true)}
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Released Employee - Transfer Button */}
          {canManage && employee.status === EMPLOYEE_STATUS.RELEASED && (
            <div className='mt-6 pt-6 border-t border-gray-200'>
              <Alert variant='warning' className='mb-4'>
                This employee has been released and is awaiting transfer to a
                new office.
              </Alert>
              <Button
                icon={ArrowsRightLeftIcon}
                onClick={() => setTransferModal(true)}
              >
                Process Transfer
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Tabs */}
      <Card className='min-w-0 overflow-hidden'>
        <Tabs
          tabs={tabs}
          defaultTab={activeTab}
          onChange={setActiveTab}
          variant='underline'
        />
      </Card>

      {/* Modals */}
      <ConfirmModal
        isOpen={verifyModal}
        onClose={() => setVerifyModal(false)}
        onConfirm={handleVerify}
        title='Verify Employee'
        message={`Are you sure you want to verify ${employee.first_name} ${employee.last_name}? This confirms their profile information is accurate.`}
        confirmText='Verify'
        variant='success'
        loading={verifying}
      />

      <ReleaseModal
        isOpen={releaseModal}
        onClose={() => setReleaseModal(false)}
        employee={employee}
        onSuccess={() => {
          refreshEmployee();
          setReleaseModal(false);
        }}
      />

      <TransferModal
        isOpen={transferModal}
        onClose={() => setTransferModal(false)}
        employee={employee}
        onSuccess={() => {
          fetchEmployee();
          setTransferModal(false);
        }}
      />

      <PromotionModal
        isOpen={promotionModal}
        onClose={() => setPromotionModal(false)}
        employee={employee}
        onSuccess={() => {
          refreshEmployee();
          setPromotionModal(false);
        }}
      />

      <ConfirmModal
        isOpen={retireModal}
        onClose={() => setRetireModal(false)}
        onConfirm={handleRetire}
        title='Retire Employee'
        message={`Are you sure you want to retire ${employee.first_name} ${employee.last_name}? This action will deactivate their user account if one exists.`}
        confirmText='Retire'
        variant='warning'
        loading={retiring}
      />

      <ConfirmModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        title='Delete Employee'
        message={`Are you sure you want to delete ${employee.first_name} ${employee.last_name}? This action cannot be undone.`}
        confirmText='Delete'
        variant='danger'
        loading={deleting}
      />
    </div>
  );
};

export default EmployeeDetail;
