import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  DocumentCheckIcon,
  EyeIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { usePermissions } from '@/hooks/usePermissions';
import { useDebounce } from '@/hooks/useDebounce';
import { profileRequestService } from '@/services';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  Table,
  SearchInput,
  Alert,
  EmptyState,
  Pagination,
} from '@/components/common';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { formatDate, getFullName, getErrorMessage } from '@/utils/helpers';

const ProfileRequestList = () => {
  const permissions = usePermissions();
  const [searchParams, setSearchParams] = useSearchParams();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(
    parseInt(searchParams.get('page') || '1', 10)
  );
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: DEFAULT_PAGE_SIZE,
  });

  useEffect(() => {
    fetchRequests();
  }, [page, debouncedSearch]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, per_page: DEFAULT_PAGE_SIZE };
      if (debouncedSearch) params.search = debouncedSearch;
      const data = await profileRequestService.getAll(params);
      const list = data.data ?? data;
      setRequests(Array.isArray(list) ? list : []);
      setPagination({
        total: data.total ?? list?.length ?? 0,
        per_page: data.per_page ?? DEFAULT_PAGE_SIZE,
        current_page: data.current_page ?? 1,
        last_page: data.last_page ?? 1,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v === '' || v == null) next.delete(k);
      else next.set(k, String(v));
    });
    setSearchParams(next);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
    updateParams({ search: value || undefined, page: '1' });
  };

  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (_, row) => (
        <Link
          to={`/profile-requests/${row.id}`}
          className='font-medium text-primary-600 hover:underline'
        >
          #{row.id}
        </Link>
      ),
    },
    {
      key: 'employee',
      header: 'Employee',
      render: (_, row) =>
        row.employee
          ? getFullName(row.employee.first_name, row.employee.last_name)
          : '-',
    },
    {
      key: 'request_type',
      header: 'Type',
      render: (_, row) => row.request_type || '-',
    },
    {
      key: 'status',
      header: 'Status',
      render: (_, row) => (
        <Badge
          variant={
            row.status === 'pending'
              ? 'warning'
              : row.is_approved
              ? 'success'
              : 'error'
          }
        >
          {row.status === 'pending'
            ? 'Pending'
            : row.is_approved
            ? 'Approved'
            : 'Rejected'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Submitted',
      render: (_, row) => formatDate(row.created_at),
    },
    {
      key: 'actions',
      header: '',
      render: (_, row) => (
        <Link to={`/profile-requests/${row.id}`}>
          <Button variant='ghost' size='sm' iconOnly icon={EyeIcon} />
        </Link>
      ),
    },
  ];

  const data = Array.isArray(requests)
    ? requests
    : pagination?.data ?? requests;

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Profile Requests'
        subtitle='Review and process profile update requests'
      />

      <Card>
        <div className='p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center'>
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder='Search by ID, employee name, type, or details...'
            className='max-w-xs'
          />
          <Button
            variant='outline'
            size='sm'
            icon={ArrowPathIcon}
            onClick={fetchRequests}
          >
            Refresh
          </Button>
        </div>

        {error && (
          <div className='p-4'>
            <Alert variant='error' onDismiss={() => setError(null)}>
              {error}
            </Alert>
          </div>
        )}

        {loading ? (
          <div className='p-12 text-center text-gray-500'>
            Loading requests...
          </div>
        ) : !data?.length ? (
          <EmptyState
            icon={DocumentCheckIcon}
            title='No profile requests'
            description='There are no profile requests to display.'
          />
        ) : (
          <>
            <Table columns={columns} data={data} />
            {pagination?.last_page > 1 && (
              <div className='p-4 border-t border-gray-200'>
                <Pagination
                  currentPage={pagination.current_page || page}
                  totalPages={pagination.last_page || 1}
                  onPageChange={(p) => {
                    setPage(p);
                    updateParams({ page: String(p) });
                  }}
                />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default ProfileRequestList;
