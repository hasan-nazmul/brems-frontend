import { useState } from 'react';
import {
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { employeeService } from '@/services';
import { useAuth } from '@/context/AuthContext';
import {
  Button,
  Input,
  Select,
  Badge,
  Alert,
  Card,
  Switch,
} from '@/components/common';
import { ROLE_LABELS, ROLES } from '@/utils/constants';
import { getErrorMessage, formatDateTime } from '@/utils/helpers';
import toast from 'react-hot-toast';

const AccountTab = ({ employee, onUpdate }) => {
  const { isSuperAdmin } = useAuth();
  const existingUser = employee.user;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: existingUser?.email || '',
    password: '',
    role: existingUser?.role || ROLES.VERIFIED_USER,
    is_active: existingUser?.is_active ?? true,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!existingUser && !formData.password) {
      newErrors.password = 'Password is required for new accounts';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        email: formData.email,
        role: formData.role,
        is_active: formData.is_active,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      await employeeService.manageAccess(employee.id, payload);

      toast.success(
        existingUser
          ? 'Account updated successfully'
          : 'Account created successfully'
      );
      setFormData((prev) => ({ ...prev, password: '' }));
      onUpdate?.();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);

      // Handle validation errors from API
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: ROLES.VERIFIED_USER, label: 'Verified User' },
    { value: ROLES.OFFICE_ADMIN, label: 'Office Admin' },
    ...(isSuperAdmin()
      ? [{ value: ROLES.SUPER_ADMIN, label: 'Super Admin' }]
      : []),
  ];

  return (
    <div className='p-6'>
      <h3 className='text-lg font-semibold text-gray-900 mb-6'>User Account</h3>

      {/* Account Status */}
      {existingUser ? (
        <div className='mb-6 p-4 bg-gray-50 rounded-lg'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-primary-100 rounded-lg'>
                <UserIcon className='w-5 h-5 text-primary-600' />
              </div>
              <div>
                <p className='font-medium text-gray-900'>Account Active</p>
                <p className='text-sm text-gray-500'>{existingUser.email}</p>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Badge variant={existingUser.is_active ? 'success' : 'danger'}>
                {existingUser.is_active ? 'Active' : 'Disabled'}
              </Badge>
              <Badge variant='info'>
                {ROLE_LABELS[existingUser.role] || existingUser.role}
              </Badge>
            </div>
          </div>
        </div>
      ) : (
        <Alert variant='info' className='mb-6'>
          <p>
            This employee does not have a user account yet. Create one to allow
            them to log in to the system.
          </p>
        </Alert>
      )}

      {/* Account Form */}
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <Input
            label='Email Address'
            type='email'
            name='email'
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            leftIcon={EnvelopeIcon}
            required
            placeholder='employee@railway.gov.bd'
          />

          <Input
            label={
              existingUser
                ? 'New Password (leave blank to keep current)'
                : 'Password'
            }
            type='password'
            name='password'
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            leftIcon={KeyIcon}
            required={!existingUser}
            placeholder={existingUser ? '••••••••' : 'Enter password'}
            hint={
              existingUser
                ? 'Only fill if you want to change the password'
                : 'Minimum 6 characters'
            }
          />

          <Select
            label='Role'
            name='role'
            value={formData.role}
            onChange={handleChange}
            options={roleOptions}
            error={errors.role}
            disabled={!isSuperAdmin() && formData.role !== ROLES.VERIFIED_USER}
          />

          {existingUser && (
            <div className='flex items-center pt-7'>
              <Switch
                checked={formData.is_active}
                onChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_active: checked }))
                }
                label='Account Active'
                description={
                  formData.is_active ? 'User can log in' : 'User cannot log in'
                }
              />
            </div>
          )}
        </div>

        <div className='flex items-center gap-4 pt-4 border-t border-gray-200'>
          <Button
            type='submit'
            loading={loading}
            icon={existingUser ? ShieldCheckIcon : UserIcon}
          >
            {existingUser ? 'Update Account' : 'Create Account'}
          </Button>

          {existingUser && (
            <p className='text-sm text-gray-500'>
              Last login:{' '}
              {existingUser.last_login_at
                ? formatDateTime(existingUser.last_login_at)
                : 'Never'}
            </p>
          )}
        </div>
      </form>

      {/* Password Reset Info */}
      {existingUser && (
        <div className='mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200'>
          <h4 className='font-medium text-yellow-800 mb-2'>Password Reset</h4>
          <p className='text-sm text-yellow-700'>
            If the user has forgotten their password, you can set a new one
            using the form above. The user will need to use the new password to
            log in. Consider using a temporary password and asking them to
            change it after logging in.
          </p>
        </div>
      )}
    </div>
  );
};

export default AccountTab;
