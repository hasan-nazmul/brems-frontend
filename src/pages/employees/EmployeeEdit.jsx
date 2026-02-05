import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  employeeService,
  officeService,
  designationService,
  profileRequestService,
} from '@/services';
import {
  PageHeader,
  Card,
  Button,
  Input,
  Select,
  Textarea,
  DatePicker,
  Alert,
  LoadingScreen,
  Tabs,
} from '@/components/common';
import {
  GENDER_OPTIONS,
  RELIGION_OPTIONS,
  BLOOD_GROUP_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  EXAM_NAMES,
  ROLES,
} from '@/utils/constants';
import { getErrorMessage } from '@/utils/helpers';
import { buildProposedChangesOnlyChanged } from '@/utils/profileRequestChanges';
import toast from 'react-hot-toast';

// Form sections
import BasicInfoSection from './forms/BasicInfoSection';
import FamilySection from './forms/FamilySection';
import AddressSection from './forms/AddressSection';
import AcademicsSection from './forms/AcademicsSection';
import DocumentsTab from './tabs/DocumentsTab';

const PERSONAL_INFO_KEYS = [
  'first_name',
  'last_name',
  'name_bn',
  'nid_number',
  'phone',
  'gender',
  'dob',
  'religion',
  'blood_group',
  'marital_status',
  'place_of_birth',
  'height',
  'passport',
  'birth_reg',
];

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
    // Basic info
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
    // Family
    family: {
      father: {
        name: '',
        name_bn: '',
        nid: '',
        dob: '',
        occupation: '',
        is_alive: true,
      },
      mother: {
        name: '',
        name_bn: '',
        nid: '',
        dob: '',
        occupation: '',
        is_alive: true,
      },
      spouses: [],
      children: [],
    },
    // Addresses
    addresses: {
      present: {
        division: '',
        district: '',
        upazila: '',
        post_office: '',
        house_no: '',
        village_road: '',
      },
      permanent: {
        division: '',
        district: '',
        upazila: '',
        post_office: '',
        house_no: '',
        village_road: '',
      },
    },
    // Academics
    academics: [],
  });

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
      // Sync academics certificate_path into formData so uploads show without re-load
      setFormData((prev) => {
        const next = { ...prev };
        if (data.academics && Array.isArray(prev.academics)) {
          next.academics = prev.academics.map((p, i) => {
            const fromApi =
              data.academics[i] ?? data.academics.find((a) => a.id === p?.id);
            const base = p && typeof p === 'object' ? p : {};
            return fromApi
              ? {
                  ...base,
                  id: fromApi.id,
                  certificate_path:
                    fromApi.certificate_path ?? base.certificate_path,
                }
              : { ...base };
          });
        }
        return next;
      });
    } catch (_) {}
  };

  const initializeFormData = (emp) => {
    // Initialize basic info
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

    // Initialize family
    const family = emp.family || [];
    const father = family.find((f) => f.relation === 'father') || {};
    const mother = family.find((f) => f.relation === 'mother') || {};
    const spouses = family
      .filter((f) => f.relation === 'spouse')
      .map((s) => ({
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
        name: c.name || '',
        name_bn: c.name_bn || '',
        gender: c.gender || '',
        dob: c.dob ? c.dob.split('T')[0] : '',
        is_alive: c.is_alive ?? true,
      }));

    // Initialize addresses
    const addresses = emp.addresses || [];
    const present = addresses.find((a) => a.type === 'present') || {};
    const permanent = addresses.find((a) => a.type === 'permanent') || {};

    // Initialize academics (keep id and certificate_path for uploads)
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      if (isVerifiedUser) {
        // Only include sections/fields that actually changed (avoids Father/Mother is_alive etc. when not toggled)
        const proposedChanges = buildProposedChangesOnlyChanged(
          employee,
          formData
        );
        if (Object.keys(proposedChanges).length === 0) {
          toast.error('No changes to submit. Edit at least one field.');
          return;
        }
        // Normalize dob for any included personal_info
        if (
          proposedChanges.personal_info &&
          formData.dob &&
          typeof formData.dob !== 'string'
        ) {
          proposedChanges.personal_info.dob =
            formData.dob instanceof Date
              ? formData.dob.toISOString().slice(0, 10)
              : formData.dob;
        }

        await profileRequestService.submit({
          request_type: 'Profile Update',
          details: 'Requested profile changes from My Profile edit.',
          proposed_changes: proposedChanges,
        });
        toast.success(
          'Your changes have been submitted for admin review. You can track the request under My Requests.'
        );
        navigate('/my-requests');
      } else {
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
        />
      ),
    },
    ...(employee
      ? [
          {
            id: 'documents',
            label: 'Documents',
            content: (
              <DocumentsTab
                employee={employee}
                onUpdate={refreshEmployeeDocuments}
                canManage={true}
              />
            ),
          },
        ]
      : []),
  ];

  const pageTitle = isVerifiedUser ? 'Request profile update' : 'Edit Employee';
  const submitLabel = isVerifiedUser ? 'Submit for review' : 'Save Changes';
  const breadcrumbs = isVerifiedUser
    ? [
        { label: 'My Profile', href: '/my-profile' },
        { label: 'Request profile update' },
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
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeEdit;
