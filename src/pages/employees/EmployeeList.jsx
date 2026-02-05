import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  PlusIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilSquareIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useDebounce } from '@/hooks/useDebounce';
import { employeeService, officeService, designationService } from '@/services';
import {
  PageHeader,
  Button,
  Card,
  Table,
  Badge,
  Avatar,
  SearchInput,
  Select,
  Alert,
  EmptyState,
  ConfirmModal,
} from '@/components/common';
import {
  STATUS_COLORS,
  STATUS_LABELS,
  EMPLOYEE_STATUS,
} from '@/utils/constants';
import { formatDate, getErrorMessage, getStorageUrl } from '@/utils/helpers';
import toast from 'react-hot-toast';

const EmployeeList = () => {
  const { isSuperAdmin } = useAuth();
  const permissions = usePermissions();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [employees, setEmployees] = useState([]);
  const [offices, setOffices] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [officeFilter, setOfficeFilter] = useState(
    searchParams.get('office_id') || ''
  );
  const [designationFilter, setDesignationFilter] = useState(
    searchParams.get('designation_id') || ''
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get('status') || ''
  );
  const [verifiedFilter, setVerifiedFilter] = useState(
    searchParams.get('is_verified') || ''
  );
  const [showFilters, setShowFilters] = useState(false);

  // Verification modal
  const [verifyModal, setVerifyModal] = useState({
    open: false,
    employee: null,
  });
  const [verifying, setVerifying] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  // Fetch initial data
  useEffect(() => {
    fetchOffices();
    fetchDesignations();
  }, []);

  // Fetch employees when filters change
  useEffect(() => {
    fetchEmployees();
  }, [
    debouncedSearch,
    officeFilter,
    designationFilter,
    statusFilter,
    verifiedFilter,
  ]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (officeFilter) params.office_id = officeFilter;
      if (designationFilter) params.designation_id = designationFilter;
      if (statusFilter) params.status = statusFilter;
      if (verifiedFilter !== '') params.is_verified = verifiedFilter;

      const data = await employeeService.getAll(params);
      setEmployees(data);

      // Update URL params
      const newParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) newParams.set(key, value);
      });
      setSearchParams(newParams);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchOffices = async () => {
    try {
      const data = await officeService.getManaged();
      setOffices(data);
    } catch (err) {
      console.error('Failed to fetch offices:', err);
    }
  };

  const fetchDesignations = async () => {
    try {
      const data = await designationService.getAll();
      setDesignations(data);
    } catch (err) {
      console.error('Failed to fetch designations:', err);
    }
  };

  const handleVerify = async () => {
    if (!verifyModal.employee) return;

    try {
      setVerifying(true);
      await employeeService.verify(verifyModal.employee.id);
      toast.success('Employee verified successfully');
      fetchEmployees();
      setVerifyModal({ open: false, employee: null });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setVerifying(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      toast.loading('Exporting CSV...');
      await employeeService.exportCSV({
        office_id: officeFilter || undefined,
        designation_id: designationFilter || undefined,
        status: statusFilter || undefined,
        is_verified:
          verifiedFilter === '' ? undefined : verifiedFilter === 'true',
      });
      toast.dismiss();
      toast.success('Export completed');
    } catch (err) {
      toast.dismiss();
      toast.error(getErrorMessage(err));
    }
  };

  const handleExportPDF = async () => {
    try {
      toast.loading('Generating PDF...');
      await employeeService.exportPDF({
        office_id: officeFilter || undefined,
        designation_id: designationFilter || undefined,
        status: statusFilter || undefined,
        is_verified:
          verifiedFilter === '' ? undefined : verifiedFilter === 'true',
      });
      toast.dismiss();
      toast.success('PDF generated');
    } catch (err) {
      toast.dismiss();
      toast.error(getErrorMessage(err));
    }
  };

  const clearFilters = () => {
    setSearch('');
    setOfficeFilter('');
    setDesignationFilter('');
    setStatusFilter('');
    setVerifiedFilter('');
  };

  const hasActiveFilters =
    officeFilter || designationFilter || statusFilter || verifiedFilter !== '';

  // Table columns
  const columns = [
    {
      key: 'name',
      header: 'Employee',
      sortable: true,
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
            {employee.name_bn && (
              <p className='text-xs text-gray-500 font-bangla'>
                {employee.name_bn}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'nid_number',
      header: 'NID',
      sortable: true,
      render: (value) => <span className='font-mono text-sm'>{value}</span>,
    },
    {
      key: 'designation',
      header: 'Designation',
      sortable: true,
      render: (_, employee) => (
        <div>
          <p className='text-sm text-gray-900'>
            {employee.designation?.title || '-'}
          </p>
          {employee.designation?.grade && (
            <p className='text-xs text-gray-500'>
              Grade: {employee.designation.grade}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'office',
      header: 'Office',
      sortable: true,
      render: (_, employee) => (
        <span className='text-sm'>{employee.office?.name || '-'}</span>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (value) => value || '-',
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => (
        <Badge
          variant={
            value === EMPLOYEE_STATUS.ACTIVE
              ? 'success'
              : value === EMPLOYEE_STATUS.RELEASED
              ? 'warning'
              : 'default'
          }
        >
          {STATUS_LABELS[value] || value}
        </Badge>
      ),
    },
    {
      key: 'is_verified',
      header: 'Verified',
      render: (value) =>
        value ? (
          <Badge variant='success' dot>
            Verified
          </Badge>
        ) : (
          <Badge variant='warning' dot>
            Pending
          </Badge>
        ),
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
          {permissions.canEditEmployee && (
            <Link to={`/employees/${employee.id}/edit`}>
              <Button
                variant='ghost'
                size='sm'
                iconOnly
                icon={PencilSquareIcon}
              />
            </Link>
          )}
          {permissions.canVerifyEmployee &&
            !employee.is_verified &&
            employee.status === 'active' && (
              <Button
                variant='ghost'
                size='sm'
                iconOnly
                icon={CheckBadgeIcon}
                onClick={() => setVerifyModal({ open: true, employee })}
              />
            )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title='Employees'
        subtitle={`Total ${employees.length} employees`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Employees' },
        ]}
        actions={
          <div className='flex items-center gap-3'>
            {permissions.canExportEmployees && (
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  icon={ArrowDownTrayIcon}
                  onClick={handleExportCSV}
                >
                  CSV
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  icon={ArrowDownTrayIcon}
                  onClick={handleExportPDF}
                >
                  PDF
                </Button>
              </div>
            )}
            {permissions.canCreateEmployee && (
              <Link to='/employees/create'>
                <Button icon={PlusIcon}>Add Employee</Button>
              </Link>
            )}
          </div>
        }
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
        {/* Search and Filter Bar */}
        <div className='p-4 border-b border-gray-200'>
          <div className='flex flex-col sm:flex-row gap-4'>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder='Search by name, NID, phone...'
              className='sm:w-80'
            />
            <div className='flex items-center gap-2 ml-auto'>
              <Button
                variant={showFilters ? 'primary' : 'outline'}
                size='sm'
                icon={FunnelIcon}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
                {hasActiveFilters && (
                  <span className='ml-1 px-1.5 py-0.5 text-xs bg-primary-100 text-primary-700 rounded-full'>
                    {
                      [
                        officeFilter,
                        designationFilter,
                        statusFilter,
                        verifiedFilter,
                      ].filter(Boolean).length
                    }
                  </span>
                )}
              </Button>
              {hasActiveFilters && (
                <Button variant='ghost' size='sm' onClick={clearFilters}>
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className='mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
              <Select
                label='Office'
                value={officeFilter}
                onChange={(e) => setOfficeFilter(e.target.value)}
                options={offices.map((o) => ({ value: o.id, label: o.name }))}
                placeholder='All Offices'
              />
              <Select
                label='Designation'
                value={designationFilter}
                onChange={(e) => setDesignationFilter(e.target.value)}
                options={designations.map((d) => ({
                  value: d.id,
                  label: d.title,
                }))}
                placeholder='All Designations'
              />
              <Select
                label='Status'
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'released', label: 'Released' },
                  { value: 'retired', label: 'Retired' },
                ]}
                placeholder='All Status'
              />
              <Select
                label='Verification'
                value={verifiedFilter}
                onChange={(e) => setVerifiedFilter(e.target.value)}
                options={[
                  { value: 'true', label: 'Verified' },
                  { value: 'false', label: 'Not Verified' },
                ]}
                placeholder='All'
              />
            </div>
          )}
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={employees}
          loading={loading}
          emptyMessage='No employees found'
          emptyDescription='Try adjusting your search or filters'
          onRowClick={(employee) =>
            (window.location.href = `/employees/${employee.id}`)
          }
        />
      </Card>

      {/* Verify Modal */}
      <ConfirmModal
        isOpen={verifyModal.open}
        onClose={() => setVerifyModal({ open: false, employee: null })}
        onConfirm={handleVerify}
        title='Verify Employee'
        message={`Are you sure you want to verify ${verifyModal.employee?.first_name} ${verifyModal.employee?.last_name}? This confirms their profile information is accurate.`}
        confirmText='Verify'
        variant='success'
        loading={verifying}
      />
    </div>
  );
};

export default EmployeeList;
