import { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import { usePermissions } from '@/hooks/usePermissions';
import { designationService } from '@/services';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  Table,
  Alert,
  EmptyState,
  Modal,
  Input,
  ConfirmModal,
  SearchInput,
} from '@/components/common';
import { formatCurrency, getErrorMessage } from '@/utils/helpers';
import toast from 'react-hot-toast';

const DesignationList = () => {
  const permissions = usePermissions();

  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // Modal states
  const [editModal, setEditModal] = useState({
    open: false,
    designation: null,
  });
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    designation: null,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    title_bn: '',
    grade: '',
    basic_salary: '',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchDesignations();
  }, []);

  const fetchDesignations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await designationService.getAll({ sort_by_grade: true });
      setDesignations(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (designation) => {
    setFormData({
      title: designation?.title || '',
      title_bn: designation?.title_bn || '',
      grade: designation?.grade || '',
      basic_salary: designation?.basic_salary || '',
    });
    setFormErrors({});
    setEditModal({ open: true, designation });
  };

  const handleDelete = (designation) => {
    setDeleteModal({ open: true, designation });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Validate
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.grade.trim()) errors.grade = 'Grade is required';
    if (!formData.basic_salary) errors.basic_salary = 'Salary is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Treat numeric-only grade as Grade-{number}
    let grade = formData.grade.trim();
    if (/^\d+$/.test(grade)) {
      grade = `Grade-${grade}`;
    }
    const payload = { ...formData, grade };

    try {
      setSaving(true);
      if (editModal.designation) {
        await designationService.update(editModal.designation.id, payload);
        toast.success('Designation updated successfully');
      } else {
        await designationService.create(payload);
        toast.success('Designation created successfully');
      }
      setEditModal({ open: false, designation: null });
      fetchDesignations();
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
      await designationService.delete(deleteModal.designation.id);
      toast.success('Designation deleted successfully');
      setDeleteModal({ open: false, designation: null });
      fetchDesignations();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const filteredDesignations = search
    ? designations.filter(
        (d) =>
          d.title.toLowerCase().includes(search.toLowerCase()) ||
          d.grade.toLowerCase().includes(search.toLowerCase())
      )
    : designations;

  const columns = [
    {
      key: 'title',
      header: 'Designation',
      sortable: true,
      render: (value, designation) => (
        <div>
          <p className='font-medium text-gray-900'>{value}</p>
          {designation.title_bn && (
            <p className='text-sm text-gray-500 font-bangla'>
              {designation.title_bn}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'grade',
      header: 'Grade',
      sortable: true,
      sortAs: 'number',
      render: (value) => <Badge variant='info'>{value}</Badge>,
    },
    {
      key: 'basic_salary',
      header: 'Basic Salary',
      sortable: true,
      align: 'right',
      render: (value) => (
        <span className='font-medium'>{formatCurrency(value)}</span>
      ),
    },
    {
      key: 'employees_count',
      header: 'Employees',
      sortable: true,
      align: 'center',
      render: (value) => <span className='text-gray-600'>{value || 0}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (_, designation) => (
        <div className='flex items-center justify-end gap-1'>
          {permissions.canEditDesignation && (
            <Button
              variant='ghost'
              size='sm'
              iconOnly
              icon={PencilSquareIcon}
              onClick={() => handleEdit(designation)}
            />
          )}
          {permissions.canDeleteDesignation && (
            <Button
              variant='ghost'
              size='sm'
              iconOnly
              icon={TrashIcon}
              onClick={() => handleDelete(designation)}
              className='text-red-500 hover:text-red-700'
              disabled={designation.employees_count > 0}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title='Designations'
        subtitle={`${designations.length} designations configured`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Designations' },
        ]}
        actions={
          permissions.canCreateDesignation && (
            <Button icon={PlusIcon} onClick={() => handleEdit(null)}>
              Add Designation
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
        {/* Search */}
        <div className='p-4 border-b border-gray-200'>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder='Search designations...'
            className='w-64'
          />
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={filteredDesignations}
          loading={loading}
          emptyMessage='No designations found'
          emptyDescription='Get started by creating your first designation'
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false, designation: null })}
        title={
          editModal.designation ? 'Edit Designation' : 'Create Designation'
        }
        size='md'
      >
        <form onSubmit={handleSave} className='space-y-4'>
          <Input
            label='Title (English)'
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            error={formErrors.title}
            required
            placeholder='e.g., Assistant Station Master'
          />
          <Input
            label='Title (Bangla)'
            value={formData.title_bn}
            onChange={(e) =>
              setFormData({ ...formData, title_bn: e.target.value })
            }
            placeholder='সহকারী স্টেশন মাস্টার'
            className='font-bangla'
          />
          <Input
            label='Grade'
            value={formData.grade}
            onChange={(e) =>
              setFormData({ ...formData, grade: e.target.value })
            }
            error={formErrors.grade}
            required
            placeholder='e.g., Grade-9'
          />
          <Input
            label='Basic Salary (BDT)'
            type='number'
            value={formData.basic_salary}
            onChange={(e) =>
              setFormData({ ...formData, basic_salary: e.target.value })
            }
            error={formErrors.basic_salary}
            required
            placeholder='e.g., 25000'
          />
          <div className='flex justify-end gap-3 pt-4'>
            <Button
              variant='outline'
              onClick={() => setEditModal({ open: false, designation: null })}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type='submit' loading={saving}>
              {editModal.designation ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, designation: null })}
        onConfirm={handleConfirmDelete}
        title='Delete Designation'
        message={
          deleteModal.designation?.employees_count > 0
            ? `Cannot delete "${deleteModal.designation?.title}" because it has ${deleteModal.designation?.employees_count} employees assigned. Please reassign them first.`
            : `Are you sure you want to delete "${deleteModal.designation?.title}"? This action cannot be undone.`
        }
        confirmText='Delete'
        variant='danger'
        loading={deleting}
      />
    </div>
  );
};

export default DesignationList;
