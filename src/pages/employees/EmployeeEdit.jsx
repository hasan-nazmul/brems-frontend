import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  employeeService,
  profileRequestService,
  fileService,
} from '@/services';
import {
  PageHeader,
  Card,
  Button,
  Alert,
  LoadingScreen,
  Tabs,
  Badge,
} from '@/components/common';
import { ROLES } from '@/utils/constants';
import { getErrorMessage, getStorageUrl } from '@/utils/helpers';
import { buildProposedChangesOnlyChanged } from '@/utils/profileRequestChanges';
import toast from 'react-hot-toast';
import { TrashIcon, DocumentIcon, PhotoIcon } from '@heroicons/react/24/outline';

// Form sections
import BasicInfoSection from './forms/BasicInfoSection';
import FamilySection from './forms/FamilySection';
import AddressSection from './forms/AddressSection';
import AcademicsSection from './forms/AcademicsSection';
import DocumentsSection from './forms/DocumentsSection';

const EmployeeEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isVerifiedUser = user?.role === ROLES.VERIFIED_USER;

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');

  // Form data
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    name_bn: '',
    nid_number: '',
    phone: '',
    gender: '',
    dob: '',
    religion: '',
    blood_group: '',
    marital_status: '',
    place_of_birth: '',
    height: '',
    passport: '',
    birth_reg: '',
    family: {
      father: { name: '', name_bn: '', nid: '', dob: '', occupation: '', is_alive: true },
      mother: { name: '', name_bn: '', nid: '', dob: '', occupation: '', is_alive: true },
      spouses: [],
      children: [],
    },
    addresses: {
      present: { division: '', district: '', upazila: '', post_office: '', house_no: '', village_road: '' },
      permanent: { division: '', district: '', upazila: '', post_office: '', house_no: '', village_road: '' },
    },
    academics: [],
  });

  // **NEW: Track pending document uploads for verified users**
  const [pendingDocuments, setPendingDocuments] = useState([]);
  // Structure: [{ path, url, field?, academic_id?, family_member_id?, document_type, uploaded_at }]

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await employeeService.getById(id);
      setEmployee(data);
      initializeFormData(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const refreshEmployeeDocuments = async () => {
    if (!id) return;
    try {
      const data = await employeeService.getById(id);
      setEmployee(data);
      // Sync academics certificate_path into formData
      setFormData((prev) => {
        const next = { ...prev };
        if (data.academics && Array.isArray(prev.academics)) {
          next.academics = prev.academics.map((p, i) => {
            const fromApi = data.academics[i] ?? data.academics.find((a) => a.id === p?.id);
            const base = p && typeof p === 'object' ? p : {};
            return fromApi
              ? { ...base, id: fromApi.id, certificate_path: fromApi.certificate_path ?? base.certificate_path }
              : { ...base };
          });
        }
        return next;
      });
    } catch (_) {}
  };

  const initializeFormData = (emp) => {
    const basicInfo = {
      first_name: emp.first_name || '',
      last_name: emp.last_name || '',
      name_bn: emp.name_bn || '',
      nid_number: emp.nid_number || '',
      phone: emp.phone || '',
      gender: emp.gender || '',
      dob: emp.dob ? emp.dob.split('T')[0] : '',
      religion: emp.religion || '',
      blood_group: emp.blood_group || '',
      marital_status: emp.marital_status || '',
      place_of_birth: emp.place_of_birth || '',
      height: emp.height || '',
      passport: emp.passport || '',
      birth_reg: emp.birth_reg || '',
    };

    const family = emp.family || [];
    const father = family.find((f) => f.relation === 'father') || {};
    const mother = family.find((f) => f.relation === 'mother') || {};
    const spouses = family
      .filter((f) => f.relation === 'spouse')
      .map((s) => ({
        id: s.id,
        name: s.name || '',
        name_bn: s.name_bn || '',
        nid: s.nid || '',
        dob: s.dob ? s.dob.split('T')[0] : '',
        occupation: s.occupation || '',
        is_alive: s.is_alive ?? true,
        is_active_marriage: s.is_active_marriage ?? true,
      }));
    const children = family
      .filter((f) => f.relation === 'child')
      .map((c) => ({
        id: c.id,
        name: c.name || '',
        name_bn: c.name_bn || '',
        gender: c.gender || '',
        dob: c.dob ? c.dob.split('T')[0] : '',
        is_alive: c.is_alive ?? true,
        birth_certificate_path: c.birth_certificate_path || null,
      }));

    const addresses = emp.addresses || [];
    const present = addresses.find((a) => a.type === 'present') || {};
    const permanent = addresses.find((a) => a.type === 'permanent') || {};

    const academics = (emp.academics || []).map((a) => ({
      id: a.id,
      exam_name: a.exam_name || '',
      institute: a.institute || '',
      passing_year: a.passing_year || '',
      result: a.result || '',
      certificate_path: a.certificate_path || null,
    }));

    setFormData({
      ...basicInfo,
      family: {
        father: {
          name: father.name || '',
          name_bn: father.name_bn || '',
          nid: father.nid || '',
          dob: father.dob ? father.dob.split('T')[0] : '',
          occupation: father.occupation || '',
          is_alive: father.is_alive ?? true,
        },
        mother: {
          name: mother.name || '',
          name_bn: mother.name_bn || '',
          nid: mother.nid || '',
          dob: mother.dob ? mother.dob.split('T')[0] : '',
          occupation: mother.occupation || '',
          is_alive: mother.is_alive ?? true,
        },
        spouses,
        children,
      },
      addresses: {
        present: {
          division: present.division || '',
          district: present.district || '',
          upazila: present.upazila || '',
          post_office: present.post_office || '',
          house_no: present.house_no || '',
          village_road: present.village_road || '',
        },
        permanent: {
          division: permanent.division || '',
          district: permanent.district || '',
          upazila: permanent.upazila || '',
          post_office: permanent.post_office || '',
          house_no: permanent.house_no || '',
          village_road: permanent.village_road || '',
        },
      },
      academics,
    });
  };

  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFamilyChange = (familyData) => {
    setFormData((prev) => ({ ...prev, family: familyData }));
  };

  const handleAddressChange = (addressData) => {
    setFormData((prev) => ({ ...prev, addresses: addressData }));
  };

  const handleAcademicsChange = (academicsData) => {
    setFormData((prev) => ({ ...prev, academics: academicsData }));
  };

  // **NEW: Handle pending document upload for verified users**
  const handlePendingDocumentUpload = (docInfo) => {
    // docInfo: { path, url, field?, academic_id?, family_member_id?, document_type }
    setPendingDocuments((prev) => {
      // Remove existing document for same field/academic/family if re-uploading
      const filtered = prev.filter((d) => {
        if (docInfo.field && d.field === docInfo.field) return false;
        if (docInfo.academic_id && d.academic_id === docInfo.academic_id) return false;
        if (docInfo.family_member_id && d.family_member_id === docInfo.family_member_id) return false;
        return true;
      });
      return [...filtered, { ...docInfo, uploaded_at: new Date().toISOString() }];
    });
  };

  // **NEW: Remove a pending document**
  const handleRemovePendingDocument = async (index) => {
    const doc = pendingDocuments[index];
    if (!doc) return;

    // Delete from server
    try {
      await fileService.deletePendingFile(id, doc.path);
    } catch (err) {
      console.warn('Failed to delete pending file:', err);
    }

    setPendingDocuments((prev) => prev.filter((_, i) => i !== index));
    toast.success('Pending document removed');
  };

  // Check if there's a pending upload for a specific field
  const getPendingDocumentFor = (field, academicId = null, familyMemberId = null) => {
    return pendingDocuments.find((d) => {
      if (field && d.field === field) return true;
      if (academicId && d.academic_id === academicId) return true;
      if (familyMemberId && d.family_member_id === familyMemberId) return true;
      return false;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      if (isVerifiedUser) {
        // Build proposed changes with only changed fields
        const proposedChanges = buildProposedChangesOnlyChanged(employee, formData);

        // **NEW: Add pending documents to proposed changes**
        if (pendingDocuments.length > 0) {
          proposedChanges.pending_documents = pendingDocuments.map((doc) => ({
            path: doc.path,
            field: doc.field || undefined,
            academic_id: doc.academic_id || undefined,
            family_member_id: doc.family_member_id || undefined,
            document_type: doc.document_type,
          }));
        }

        // Check if there are any changes
        const hasFieldChanges = Object.keys(proposedChanges).filter(k => k !== 'pending_documents').length > 0;
        const hasDocumentChanges = pendingDocuments.length > 0;

        if (!hasFieldChanges && !hasDocumentChanges) {
          toast.error('No changes to submit. Edit at least one field or upload a document.');
          return;
        }

        // Determine request type based on what changed
        let requestType = 'Profile Update';
        if (!hasFieldChanges && hasDocumentChanges) {
          requestType = 'Document Update';
        } else if (hasFieldChanges && hasDocumentChanges) {
          requestType = 'Profile Update'; // Combined
        }

        // Build details message
        const detailParts = [];
        if (hasFieldChanges) {
          detailParts.push('Profile field changes');
        }
        if (hasDocumentChanges) {
          const docTypes = pendingDocuments.map(d => d.document_type).join(', ');
          detailParts.push(`Document uploads: ${docTypes}`);
        }

        await profileRequestService.submit({
          request_type: requestType,
          details: detailParts.join('. ') + '.',
          proposed_changes: proposedChanges,
        });

        toast.success(
          'Your changes have been submitted for admin review. You can track the request under My Requests.'
        );
        navigate('/my-requests');
      } else {
        // Admin: direct update
        await employeeService.updateFullProfile(id, formData);
        toast.success('Employee updated successfully');
        navigate(`/employees/${id}`);
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);

      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingScreen message='Loading employee data...' />;
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

  const tabs = [
    {
      id: 'basic',
      label: 'Basic Info',
      content: (
        <BasicInfoSection
          data={formData}
          onChange={handleBasicChange}
          errors={errors}
        />
      ),
    },
    {
      id: 'family',
      label: 'Family',
      content: (
        <FamilySection
          data={formData.family}
          onChange={handleFamilyChange}
          employeeGender={formData.gender}
          maxSpouses={employee?.max_spouses || 1}
          // **NEW: Pass pending document handling for child certificates**
          employeeId={id}
          isVerifiedUser={isVerifiedUser}
          onPendingDocumentUpload={handlePendingDocumentUpload}
          getPendingDocumentFor={getPendingDocumentFor}
        />
      ),
    },
    {
      id: 'address',
      label: 'Address',
      content: (
        <AddressSection
          data={formData.addresses}
          onChange={handleAddressChange}
        />
      ),
    },
    {
      id: 'academics',
      label: 'Academics',
      content: (
        <AcademicsSection
          data={formData.academics}
          onChange={handleAcademicsChange}
          employeeId={id}
          onDocumentChange={refreshEmployeeDocuments}
          // **NEW: Pass pending document handling**
          isVerifiedUser={isVerifiedUser}
          onPendingDocumentUpload={handlePendingDocumentUpload}
          getPendingDocumentFor={getPendingDocumentFor}
        />
      ),
    },
    ...(employee
      ? [
          {
            id: 'documents',
            label: 'Documents',
            content: (
              <DocumentsSection
                employee={employee}
                employeeId={id}
                onUpdate={refreshEmployeeDocuments}
                canManage={!isVerifiedUser}
                // **NEW: Pending document handling**
                isVerifiedUser={isVerifiedUser}
                onPendingDocumentUpload={handlePendingDocumentUpload}
                getPendingDocumentFor={getPendingDocumentFor}
              />
            ),
          },
        ]
      : []),
  ];

  const pageTitle = isVerifiedUser ? 'Request Profile Update' : 'Edit Employee';
  const submitLabel = isVerifiedUser ? 'Submit for Review' : 'Save Changes';
  const breadcrumbs = isVerifiedUser
    ? [
        { label: 'My Profile', href: '/my-profile' },
        { label: 'Request Profile Update' },
      ]
    : [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Employees', href: '/employees' },
        {
          label: `${employee?.first_name} ${employee?.last_name}`,
          href: `/employees/${id}`,
        },
        { label: 'Edit' },
      ];

  return (
    <div>
      <PageHeader
        title={pageTitle}
        subtitle={
          isVerifiedUser
            ? 'Changes will be sent to admin for verification'
            : `${employee?.first_name} ${employee?.last_name}`
        }
        breadcrumbs={breadcrumbs}
      />

      <form onSubmit={handleSubmit}>
        <Card className='mb-6'>
          <Tabs
            tabs={tabs}
            defaultTab={activeTab}
            onChange={setActiveTab}
            variant='underline'
          />
        </Card>

        {/* **NEW: Pending Documents Summary for Verified Users** */}
        {isVerifiedUser && pendingDocuments.length > 0 && (
          <Card className='mb-6'>
            <div className='p-4'>
              <h3 className='text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2'>
                <DocumentIcon className='w-5 h-5' />
                Pending Document Uploads ({pendingDocuments.length})
              </h3>
              <p className='text-xs text-gray-500 mb-3'>
                These documents will be submitted for review along with your profile changes.
              </p>
              <div className='space-y-2'>
                {pendingDocuments.map((doc, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg'
                  >
                    <div className='flex items-center gap-3'>
                      {doc.url && (doc.path?.match(/\.(jpg|jpeg|png|gif)$/i)) ? (
                        <img
                          src={doc.url}
                          alt={doc.document_type}
                          className='w-10 h-10 object-cover rounded'
                        />
                      ) : (
                        <DocumentIcon className='w-10 h-10 text-gray-400' />
                      )}
                      <div>
                        <p className='text-sm font-medium text-gray-900'>
                          {doc.document_type}
                        </p>
                        <p className='text-xs text-gray-500'>
                          {doc.path?.split('/').pop()}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Badge variant='warning'>Pending</Badge>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        icon={TrashIcon}
                        onClick={() => handleRemovePendingDocument(index)}
                        className='text-red-500 hover:text-red-700'
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Form Actions */}
        <div className='flex justify-end gap-4'>
          <Button
            variant='outline'
            onClick={() =>
              navigate(isVerifiedUser ? '/my-profile' : `/employees/${id}`)
            }
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type='submit' loading={saving}>
            {submitLabel}
            {isVerifiedUser && pendingDocuments.length > 0 && (
              <span className='ml-1'>({pendingDocuments.length} documents)</span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeEdit;