import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  PlusIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  BuildingOfficeIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  FunnelIcon,
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
import { ZONE_OPTIONS, getZoneLabel, getZoneColor } from '@/constants/zones';
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
            <ChevronDownIcon className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRightIcon className="w-4 h-4 text-gray-500" />
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
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={`/offices/${office.id}`}
              className="font-medium text-gray-900 hover:text-primary-600"
            >
              {office.name}
            </Link>
            <span className="text-sm text-gray-500">({office.code})</span>
            {office.zone && (
              <Badge variant={getZoneColor(office.zone)} size="sm">
                {getZoneLabel(office.zone)}
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-500">{office.location}</p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">
              {office.employee_count || 0}
            </p>
            <p className="text-xs text-gray-500">Employees</p>
          </div>
          <Badge variant={office.has_admin ? 'success' : 'warning'}>
            {office.has_admin ? 'Has Admin' : 'No Admin'}
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Link to={`/offices/${office.id}`}>
            <Button variant="ghost" size="sm" iconOnly icon={EyeIcon} />
          </Link>
          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              icon={PencilSquareIcon}
              onClick={() => onEdit(office)}
            />
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              icon={TrashIcon}
              onClick={() => onDelete(office)}
              className="text-red-500 hover:text-red-700"
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

// Helper function to recursively filter tree by zone and search
const filterTree = (offices, zone, search) => {
  if (!offices || offices.length === 0) return [];

  return offices
    .map((office) => {
      // Recursively filter children first
      const filteredChildren = filterTree(office.children || [], zone, search);

      // Check if this office matches the filters
      const matchesZone = !zone || office.zone === zone;
      const matchesSearch =
        !search ||
        office.name.toLowerCase().includes(search.toLowerCase()) ||
        office.code.toLowerCase().includes(search.toLowerCase());

      // Include this office if:
      // 1. It matches both filters, OR
      // 2. It has children that match (to preserve tree structure)
      const hasMatchingChildren = filteredChildren.length > 0;
      const matchesFilters = matchesZone && matchesSearch;

      if (matchesFilters || hasMatchingChildren) {
        return {
          ...office,
          children: filteredChildren,
        };
      }

      return null;
    })
    .filter(Boolean); // Remove null entries
};

// Helper function to count offices by zone (including nested)
const countOfficesByZone = (offices, zone) => {
  let count = 0;

  const countRecursive = (items) => {
    for (const office of items) {
      if (office.zone === zone) {
        count++;
      }
      if (office.children && office.children.length > 0) {
        countRecursive(office.children);
      }
    }
  };

  countRecursive(offices);
  return count;
};

const OfficeList = () => {
  const { isSuperAdmin } = useAuth();
  const permissions = usePermissions();
  const [searchParams] = useSearchParams();

  const [offices, setOffices] = useState([]);
  const [officeTree, setOfficeTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('tree');
  const [search, setSearch] = useState('');
  const [zoneFilter, setZoneFilter] = useState('');
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
    zone: '',
    location: '',
    parent_id: '',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchData();

    if (searchParams.get('action') === 'create') {
      setEditModal({ open: true, office: null });
    }
  }, [searchParams]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch both in parallel
      const [officesData, treeData] = await Promise.all([
        officeService.getAll(),
        officeService.getTree(),
      ]);
      setOffices(officesData);
      setOfficeTree(treeData);
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
      zone: office?.zone || '',
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
      const payload = {
        ...formData,
        zone: formData.zone || null,
        parent_id: formData.parent_id || null,
      };

      if (editModal.office) {
        await officeService.update(editModal.office.id, payload);
        toast.success('Office updated successfully');
      } else {
        await officeService.create(payload);
        toast.success('Office created successfully');
      }
      setEditModal({ open: false, office: null });
      fetchData();
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
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  // Filter tree with memoization for better performance
  const filteredTree = useMemo(() => {
    return filterTree(officeTree, zoneFilter, search);
  }, [officeTree, zoneFilter, search]);

  // Filter flat list for list view
  const filteredOffices = useMemo(() => {
    return offices.filter((office) => {
      const matchesSearch =
        !search ||
        office.name.toLowerCase().includes(search.toLowerCase()) ||
        office.code.toLowerCase().includes(search.toLowerCase());
      const matchesZone = !zoneFilter || office.zone === zoneFilter;
      return matchesSearch && matchesZone;
    });
  }, [offices, zoneFilter, search]);

  // Zone counts from flat list (more accurate)
  const zoneCounts = useMemo(() => {
    const counts = {};
    ZONE_OPTIONS.forEach((zone) => {
      counts[zone.value] = offices.filter((o) => o.zone === zone.value).length;
    });
    return counts;
  }, [offices]);

  return (
    <div>
      <PageHeader
        title="Offices"
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
          variant="error"
          className="mb-6"
          dismissible
          onDismiss={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <Card>
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search offices..."
              className="w-64"
            />
            {/* Zone Filter */}
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <Select
                value={zoneFilter}
                onChange={(e) => setZoneFilter(e.target.value)}
                options={[{ value: '', label: 'All Zones' }, ...ZONE_OPTIONS]}
                className="w-48"
              />
            </div>
          </div>
          {!isMobile && (
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'tree' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('tree')}
              >
                Tree View
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List View
              </Button>
            </div>
          )}
        </div>

        {/* Zone Summary Stats */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap gap-4">
            {ZONE_OPTIONS.map((zone) => (
              <button
                key={zone.value}
                onClick={() =>
                  setZoneFilter(zoneFilter === zone.value ? '' : zone.value)
                }
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                  zoneFilter === zone.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <Badge variant={getZoneColor(zone.value)} size="sm">
                  {zone.label}
                </Badge>
                <span className="text-sm font-medium text-gray-700">
                  {zoneCounts[zone.value] || 0} offices
                </span>
              </button>
            ))}
            {(zoneFilter || search) && (
              <button
                onClick={() => {
                  setZoneFilter('');
                  setSearch('');
                }}
                className="text-sm text-primary-600 hover:text-primary-700 underline"
              >
                Clear all filters
              </button>
            )}
          </div>
          {/* Active filters indicator */}
          {(zoneFilter || search) && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <span>Showing:</span>
              {zoneFilter && (
                <Badge variant={getZoneColor(zoneFilter)} size="sm">
                  {getZoneLabel(zoneFilter)}
                </Badge>
              )}
              {search && (
                <span className="px-2 py-1 bg-gray-200 rounded">
                  Search: "{search}"
                </span>
              )}
              <span className="text-gray-500">
                ({viewMode === 'tree' ? filteredTree.length : filteredOffices.length} results)
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 text-gray-500">Loading offices...</p>
          </div>
        ) : filteredTree.length === 0 && filteredOffices.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={BuildingOfficeIcon}
              title="No offices found"
              description={
                search || zoneFilter
                  ? 'Try a different search term or filter'
                  : 'Get started by creating your first office'
              }
              actionLabel={
                permissions.canCreateOffice
                  ? search || zoneFilter
                    ? 'Clear Filters'
                    : 'Add Office'
                  : undefined
              }
              onAction={
                permissions.canCreateOffice
                  ? search || zoneFilter
                    ? () => {
                        setZoneFilter('');
                        setSearch('');
                      }
                    : () => handleEdit(null)
                  : undefined
              }
            />
          </div>
        ) : !isMobile && viewMode === 'tree' ? (
          <div className="divide-y divide-gray-200">
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Office
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Zone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Parent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Employees
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOffices.map((office) => (
                  <tr key={office.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link
                        to={`/offices/${office.id}`}
                        className="font-medium text-gray-900 hover:text-primary-600"
                      >
                        {office.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {office.code}
                    </td>
                    <td className="px-6 py-4">
                      {office.zone ? (
                        <Badge variant={getZoneColor(office.zone)} size="sm">
                          {getZoneLabel(office.zone)}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {office.location}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {office.parent?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {office.employees_count || 0}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={office.has_admin ? 'success' : 'warning'}>
                        {office.has_admin ? 'Yes' : 'No'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/offices/${office.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            iconOnly
                            icon={EyeIcon}
                          />
                        </Link>
                        {permissions.canEditOffice && (
                          <Button
                            variant="ghost"
                            size="sm"
                            iconOnly
                            icon={PencilSquareIcon}
                            onClick={() => handleEdit(office)}
                          />
                        )}
                        {permissions.canDeleteOffice && (
                          <Button
                            variant="ghost"
                            size="sm"
                            iconOnly
                            icon={TrashIcon}
                            onClick={() => handleDelete(office)}
                            className="text-red-500 hover:text-red-700"
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
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Office Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
            required
            placeholder="e.g., Dhaka Division"
          />
          <Input
            label="Office Code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            error={formErrors.code}
            required
            placeholder="e.g., DHK-DIV"
          />
          <Select
            label="Zone"
            value={formData.zone}
            onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
            options={[{ value: '', label: 'Select Zone' }, ...ZONE_OPTIONS]}
            error={formErrors.zone}
            helperText="If not selected, will inherit from parent office"
          />
          <Input
            label="Location"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            error={formErrors.location}
            required
            placeholder="e.g., Dhaka, Bangladesh"
          />
          <Select
            label="Parent Office"
            value={formData.parent_id}
            onChange={(e) =>
              setFormData({ ...formData, parent_id: e.target.value })
            }
            options={[
              { value: '', label: 'No Parent (Root Office)' },
              ...offices
                .filter((o) => o.id !== editModal.office?.id)
                .map((o) => ({
                  value: o.id,
                  label: `${o.name} (${o.code})${
                    o.zone ? ` - ${getZoneLabel(o.zone)}` : ''
                  }`,
                })),
            ]}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setEditModal({ open: false, office: null })}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
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
        title="Delete Office"
        message={`Are you sure you want to delete "${deleteModal.office?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default OfficeList;