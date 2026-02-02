import { Routes, Route, Navigate } from 'react-router-dom';
import { ROLES } from '@/utils/constants';

// Layouts
import { MainLayout, AuthLayout } from '@/components/layout';

// Route guards
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import GuestRoute from './GuestRoute';
import DefaultRedirect from './DefaultRedirect';

// Auth pages
import Login from '@/pages/auth/Login';

// Dashboard
import Dashboard from '@/pages/dashboard/Dashboard';

// Employees
import EmployeeList from '@/pages/employees/EmployeeList';
import EmployeeDetail from '@/pages/employees/EmployeeDetail';
import EmployeeCreate from '@/pages/employees/EmployeeCreate';
import EmployeeEditRoute from '@/routes/EmployeeEditRoute';
import ReleasedEmployees from '@/pages/employees/ReleasedEmployees';

// Offices
import OfficeList from '@/pages/offices/OfficeList';
import OfficeDetail from '@/pages/offices/OfficeDetail';

// Designations
import DesignationList from '@/pages/designations/DesignationList';

// Users
import UserList from '@/pages/users/UserList';
import UserDetail from '@/pages/users/UserDetail';

// Profile Requests
import ProfileRequestList from '@/pages/profile-requests/ProfileRequestList';
import ProfileRequestDetail from '@/pages/profile-requests/ProfileRequestDetail';
import MyRequests from '@/pages/profile-requests/MyRequests';
import SubmitRequest from '@/pages/profile-requests/SubmitRequest';

// Forms
import FormList from '@/pages/forms/FormList';
import FormBuilder from '@/pages/forms/FormBuilder';
import FormFill from '@/pages/forms/FormFill';
import FormSubmissions from '@/pages/forms/FormSubmissions';
import MySubmissions from '@/pages/forms/MySubmissions';

// Reports
import EmployeeReport from '@/pages/reports/EmployeeReport';
import TransferReport from '@/pages/reports/TransferReport';
import PromotionReport from '@/pages/reports/PromotionReport';
import OfficeReport from '@/pages/reports/OfficeReport';

// Profile & Settings
import MyProfile from '@/pages/profile/MyProfile';
import Settings from '@/pages/settings/Settings';
import ChangePassword from '@/pages/settings/ChangePassword';

// Error pages
import NotFound from '@/pages/errors/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth routes */}
      <Route
        element={
          <GuestRoute>
            <AuthLayout />
          </GuestRoute>
        }
      >
        <Route path='/login' element={<Login />} />
      </Route>

      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard - Admin only */}
        <Route
          path='/dashboard'
          element={
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.OFFICE_ADMIN]}>
              <Dashboard />
            </RoleRoute>
          }
        />

        {/* Employees */}
        <Route path='/employees'>
          <Route
            index
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.OFFICE_ADMIN]}>
                <EmployeeList />
              </RoleRoute>
            }
          />
          <Route
            path='create'
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.OFFICE_ADMIN]}>
                <EmployeeCreate />
              </RoleRoute>
            }
          />
          <Route
            path='released'
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.OFFICE_ADMIN]}>
                <ReleasedEmployees />
              </RoleRoute>
            }
          />
          <Route path=':id' element={<EmployeeDetail />} />
          <Route path=':id/edit' element={<EmployeeEditRoute />} />
        </Route>

        {/* Offices */}
        <Route path='/offices'>
          <Route index element={<OfficeList />} />
          <Route path=':id' element={<OfficeDetail />} />
        </Route>

        {/* Designations */}
        <Route path='/designations' element={<DesignationList />} />

        {/* Users - Admin only */}
        <Route path='/users'>
          <Route
            index
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.OFFICE_ADMIN]}>
                <UserList />
              </RoleRoute>
            }
          />
          <Route
            path=':id'
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.OFFICE_ADMIN]}>
                <UserDetail />
              </RoleRoute>
            }
          />
        </Route>

        {/* Profile Requests */}
        <Route path='/profile-requests'>
          <Route
            index
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.OFFICE_ADMIN]}>
                <ProfileRequestList />
              </RoleRoute>
            }
          />
          <Route path=':id' element={<ProfileRequestDetail />} />
        </Route>
        <Route path='/my-requests' element={<MyRequests />} />
        <Route path='/submit-request' element={<SubmitRequest />} />

        {/* Forms */}
        <Route path='/forms'>
          <Route index element={<FormList />} />
          <Route
            path='create'
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <FormBuilder />
              </RoleRoute>
            }
          />
          <Route
            path=':id/edit'
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <FormBuilder />
              </RoleRoute>
            }
          />
          <Route path=':id/fill' element={<FormFill />} />
          <Route path='my-submissions' element={<MySubmissions />} />
          <Route
            path='submissions'
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.OFFICE_ADMIN]}>
                <FormSubmissions />
              </RoleRoute>
            }
          />
        </Route>

        {/* Reports - Admin only */}
        <Route path='/reports'>
          <Route
            path='employees'
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.OFFICE_ADMIN]}>
                <EmployeeReport />
              </RoleRoute>
            }
          />
          <Route
            path='transfers'
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.OFFICE_ADMIN]}>
                <TransferReport />
              </RoleRoute>
            }
          />
          <Route
            path='promotions'
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.OFFICE_ADMIN]}>
                <PromotionReport />
              </RoleRoute>
            }
          />
          <Route
            path='offices'
            element={
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.OFFICE_ADMIN]}>
                <OfficeReport />
              </RoleRoute>
            }
          />
        </Route>

        {/* Profile & Settings */}
        <Route path='/my-profile' element={<MyProfile />} />
        <Route path='/settings' element={<Settings />} />
        <Route path='/settings/password' element={<ChangePassword />} />

        {/* Default redirect: admins → dashboard, verified users → my-profile */}
        <Route path='/' element={<DefaultRedirect />} />
      </Route>

      {/* 404 */}
      <Route path='*' element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
