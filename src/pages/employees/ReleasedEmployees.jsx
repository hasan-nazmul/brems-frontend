import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowsRightLeftIcon, EyeIcon } from '@heroicons/react/24/outline';
import { employeeService } from '@/services';
import {
  PageHeader,
  Card,
  Table,
  Button,
  Badge,
  Avatar,
  Alert,
  EmptyState,
} from '@/components/common';
import { formatDate, getErrorMessage, getStorageUrl } from '@/utils/helpers';
import TransferModal from './modals/TransferModal';

const ReleasedEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transferModal, setTransferModal] = useState({
    open: false,
    employee: null,
  });

  useEffect(() => {
    fetchReleasedEmployees();
  }, []);

  const fetchReleasedEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await employeeService.getReleased();
      setEmployees(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Employee',
      render: (_, employee) => (
        <div className='flex items-center gap-3'>
          <Avatar
            src={
              employee.profile_picture
                ? getStorageUrl(employee.profile_picture) ||
                  `/storage/${employee.profile_picture}`
                : null
            }
            name={`${employee.first_name} ${employee.last_name}`}
            size='sm'
          />
          <div>
            <Link
              to={`/employees/${employee.id}`}
              className='font-medium text-gray-900 hover:text-primary-600'
            >
              {employee.first_name} {employee.last_name}
            </Link>
            <p className='text-xs text-gray-500'>{employee.nid_number}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'designation',
      header: 'Designation',
      render: (_, employee) => (
        <span className='text-sm'>{employee.designation?.title || '-'}</span>
      ),
    },
    {
      key: 'office',
      header: 'Current Office',
      render: (_, employee) => (
        <span className='text-sm'>{employee.office?.name || '-'}</span>
      ),
    },
    {
      key: 'released_at',
      header: 'Released Date',
      render: (value) => <span className='text-sm'>{formatDate(value)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: () => <Badge variant='warning'>Released</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (_, employee) => (
        <div className='flex items-center justify-end gap-2'>
          <Link to={`/employees/${employee.id}`}>
            <Button variant='ghost' size='sm' iconOnly icon={EyeIcon} />
          </Link>
          <Button
            variant='primary'
            size='sm'
            icon={ArrowsRightLeftIcon}
            onClick={() => setTransferModal({ open: true, employee })}
          >
            Transfer
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title='Released Employees'
        subtitle='Employees released and awaiting transfer to new offices'
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Employees', href: '/employees' },
          { label: 'Released' },
        ]}
      />

      {error && (
        <Alert
          variant='error'
          className='mb-6'
          dismissible
          onDismiss={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <Card>
        {employees.length === 0 && !loading ? (
          <div className='p-8'>
            <EmptyState
              icon={ArrowsRightLeftIcon}
              title='No released employees'
              description='There are no employees currently released for transfer'
              actionLabel='View All Employees'
              onAction={() => (window.location.href = '/employees')}
            />
          </div>
        ) : (
          <Table
            columns={columns}
            data={employees}
            loading={loading}
            emptyMessage='No released employees'
          />
        )}
      </Card>

      {/* Transfer Modal */}
      <TransferModal
        isOpen={transferModal.open}
        onClose={() => setTransferModal({ open: false, employee: null })}
        employee={transferModal.employee}
        onSuccess={() => {
          fetchReleasedEmployees();
          setTransferModal({ open: false, employee: null });
        }}
      />
    </div>
  );
};

export default ReleasedEmployees;
