import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  PlusIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  BuildingOfficeIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { officeService } from '@/services';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  Alert,
  EmptyState,
  Modal,
  Input,
  Select,
  ConfirmModal,
  SearchInput,
} from '@/components/common';
import { getErrorMessage } from '@/utils/helpers';
import toast from 'react-hot-toast';

// Office Tree Item Component
const OfficeTreeItem = ({
  office,
  level = 0,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}) => {
  const [expanded, setExpanded] = useState(level < 2);
  const hasChildren = office.children && office.children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-3 py-3 px-4 hover:bg-gray-50 transition-colors ${
          level > 0 ? 'border-l-2 border-gray-200' : ''
        }`}
        style={{ paddingLeft: `${level * 24 + 16}px` }}
      >
        {/* Expand/Collapse Button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={`p-1 rounded hover:bg-gray-200 transition-colors ${
            !hasChildren ? 'invisible' : ''
          }`}
        >
          {expanded ? (
            <ChevronDownIcon className='w-4 h-4 text-gray-500' />
          ) : (
            <ChevronRightIcon className='w-4 h-4 text-gray-500' />
          )}
        </button>

        {/* Office Icon */}
        <div
          className={`p-2 rounded-lg ${
            office.has_admin ? 'bg-primary-100' : 'bg-gray-100'
          }`}
        >
          <BuildingOfficeIcon
            className={`w-5 h-5 ${
              office.has_admin ? 'text-primary-600' : 'text-gray-500'
            }`}
          />
        </div>

        {/* Office Info */}
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2'>
            <Link
              to={`/offices/${office.id}`}
              className='font-medium text-gray-900 hover:text-primary-600'
            >
              {office.name}
            </Link>
            <span className='text-sm text-gray-500'>({office.code})</span>
          </div>
          <p className='text-sm text-gray-500'>{office.location}</p>
        </div>

        {/* Stats */}
        <div className='flex items-center gap-4'>
          <div className='text-center'>
            <p className='text-lg font-semibold text-gray-900'>
              {office.employee_count || 0}
            </p>
            <p className='text-xs text-gray-500'>Employees</p>
          </div>
          <Badge variant={office.has_admin ? 'success' : 'warning'}>
            {office.has_admin ? 'Has Admin' : 'No Admin'}
          </Badge>
        </div>

        {/* Actions */}
        <div className='flex items-center gap-1'>
          <Link to={`/offices/${office.id}`}>
            <Button variant='ghost' size='sm' iconOnly icon={EyeIcon} />
          </Link>
          {canEdit && (
            <Button
              variant='ghost'
              size='sm'
              iconOnly
              icon={PencilSquareIcon}
              onClick={() => onEdit(office)}
            />
          )}
          {canDelete && (
            <Button
              variant='ghost'
              size='sm'
              iconOnly
              icon={TrashIcon}
              onClick={() => onDelete(office)}
              className='text-red-500 hover:text-red-700'
            />
          )}
        </div>
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div>
          {office.children.map((child) => (
            <OfficeTreeItem
              key={child.id}
              office={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const OfficeList = () => {
  const { isSuperAdmin } = useAuth();
  const permissions = usePermissions();
  const [searchParams] = useSearchParams();

  const [offices, setOffices] = useState([]);
  const [officeTree, setOfficeTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'list'
  const [search, setSearch] = useState('');
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 1024
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Modal states
  const [editModal, setEditModal] = useState({ open: false, office: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, office: null });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location: '',
    parent_id: '',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchOffices();
    fetchOfficeTree();

    // Check if we should open create modal
    if (searchParams.get('action') === 'create') {
      setEditModal({ open: true, office: null });
    }
  }, [searchParams]);

  const fetchOffices = async () => {
    try {
      const data = await officeService.getAll();
      setOffices(data);
    } catch (err) {
      console.error('Failed to fetch offices:', err);
    }
  };

  const fetchOfficeTree = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await officeService.getTree();
      setOfficeTree(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (office) => {
    setFormData({
      name: office?.name || '',
      code: office?.code || '',
      location: office?.location || '',
      parent_id: office?.parent_id || '',
    });
    setFormErrors({});
    setEditModal({ open: true, office });
  };

  const handleDelete = (office) => {
    setDeleteModal({ open: true, office });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Validate
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.code.trim()) errors.code = 'Code is required';
    if (!formData.location.trim()) errors.location = 'Location is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSaving(true);
      if (editModal.office) {
        await officeService.update(editModal.office.id, formData);
        toast.success('Office updated successfully');
      } else {
        await officeService.create(formData);
        toast.success('Office created successfully');
      }
      setEditModal({ open: false, office: null });
      fetchOffices();
      fetchOfficeTree();
    } catch (err) {
      toast.error(getErrorMessage(err));
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true);
      await officeService.delete(deleteModal.office.id);
      toast.success('Office deleted successfully');
      setDeleteModal({ open: false, office: null });
      fetchOffices();
      fetchOfficeTree();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const filteredTree = search
    ? officeTree.filter(
        (office) =>
          office.name.toLowerCase().includes(search.toLowerCase()) ||
          office.code.toLowerCase().includes(search.toLowerCase())
      )
    : officeTree;

  return (
    <div>
      <PageHeader
        title='Offices'
        subtitle={`${offices.length} offices in the organization`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Offices' },
        ]}
        actions={
          permissions.canCreateOffice && (
            <Button icon={PlusIcon} onClick={() => handleEdit(null)}>
              Add Office
            </Button>
          )
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
        {/* Toolbar */}
        <div className='p-4 border-b border-gray-200 flex items-center justify-between gap-4'>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder='Search offices...'
            className='w-64'
          />
          {!isMobile && (
            <div className='flex items-center gap-2'>
              <Button
                variant={viewMode === 'tree' ? 'primary' : 'outline'}
                size='sm'
                onClick={() => setViewMode('tree')}
              >
                Tree View
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size='sm'
                onClick={() => setViewMode('list')}
              >
                List View
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className='p-8 text-center'>
            <div className='animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto' />
            <p className='mt-4 text-gray-500'>Loading offices...</p>
          </div>
        ) : filteredTree.length === 0 ? (
          <div className='p-8'>
            <EmptyState
              icon={BuildingOfficeIcon}
              title='No offices found'
              description={
                search
                  ? 'Try a different search term'
                  : 'Get started by creating your first office'
              }
              actionLabel={
                permissions.canCreateOffice ? 'Add Office' : undefined
              }
              onAction={
                permissions.canCreateOffice ? () => handleEdit(null) : undefined
              }
            />
          </div>
        ) : !isMobile && viewMode === 'tree' ? (
          <div className='divide-y divide-gray-200'>
            {filteredTree.map((office) => (
              <OfficeTreeItem
                key={office.id}
                office={office}
                onEdit={handleEdit}
                onDelete={handleDelete}
                canEdit={permissions.canEditOffice}
                canDelete={permissions.canDeleteOffice}
              />
            ))}
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>
                    Office
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>
                    Code
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>
                    Location
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>
                    Parent
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>
                    Employees
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>
                    Admin
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {offices.map((office) => (
                  <tr key={office.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4'>
                      <Link
                        to={`/offices/${office.id}`}
                        className='font-medium text-gray-900 hover:text-primary-600'
                      >
                        {office.name}
                      </Link>
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-500'>
                      {office.code}
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-500'>
                      {office.location}
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-500'>
                      {office.parent?.name || '-'}
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-900'>
                      {office.employees_count || 0}
                    </td>
                    <td className='px-6 py-4'>
                      <Badge variant={office.has_admin ? 'success' : 'warning'}>
                        {office.has_admin ? 'Yes' : 'No'}
                      </Badge>
                    </td>
                    <td className='px-6 py-4 text-right'>
                      <div className='flex items-center justify-end gap-1'>
                        <Link to={`/offices/${office.id}`}>
                          <Button
                            variant='ghost'
                            size='sm'
                            iconOnly
                            icon={EyeIcon}
                          />
                        </Link>
                        {permissions.canEditOffice && (
                          <Button
                            variant='ghost'
                            size='sm'
                            iconOnly
                            icon={PencilSquareIcon}
                            onClick={() => handleEdit(office)}
                          />
                        )}
                        {permissions.canDeleteOffice && (
                          <Button
                            variant='ghost'
                            size='sm'
                            iconOnly
                            icon={TrashIcon}
                            onClick={() => handleDelete(office)}
                            className='text-red-500 hover:text-red-700'
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false, office: null })}
        title={editModal.office ? 'Edit Office' : 'Create Office'}
        size='md'
      >
        <form onSubmit={handleSave} className='space-y-4'>
          <Input
            label='Office Name'
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
            required
            placeholder='e.g., Dhaka Division'
          />
          <Input
            label='Office Code'
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            error={formErrors.code}
            required
            placeholder='e.g., DHK-DIV'
          />
          <Input
            label='Location'
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            error={formErrors.location}
            required
            placeholder='e.g., Dhaka, Bangladesh'
          />
          <Select
            label='Parent Office'
            value={formData.parent_id}
            onChange={(e) =>
              setFormData({ ...formData, parent_id: e.target.value })
            }
            options={offices
              .filter((o) => o.id !== editModal.office?.id)
              .map((o) => ({ value: o.id, label: `${o.name} (${o.code})` }))}
            placeholder='Select parent office (optional)'
          />
          <div className='flex justify-end gap-3 pt-4'>
            <Button
              variant='outline'
              onClick={() => setEditModal({ open: false, office: null })}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type='submit' loading={saving}>
              {editModal.office ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, office: null })}
        onConfirm={handleConfirmDelete}
        title='Delete Office'
        message={`Are you sure you want to delete "${deleteModal.office?.name}"? This action cannot be undone.`}
        confirmText='Delete'
        variant='danger'
        loading={deleting}
      />
    </div>
  );
};

export default OfficeList;
