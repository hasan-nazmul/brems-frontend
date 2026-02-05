// API Base URL: use VITE_API_URL from .env for local run (e.g. http://localhost:8000/api)
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'https://brems-backend.onrender.com/api';

// Backend origin for storage URLs (avoids /storage/... hitting the SPA router and 404)
export const STORAGE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

// Application Info
export const APP_NAME = 'BREMS';
export const APP_FULL_NAME = 'Bangladesh Railway Employee Management System';
export const APP_VERSION = '1.0.0';

// User Roles
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  OFFICE_ADMIN: 'office_admin',
  VERIFIED_USER: 'verified_user',
};

// Role Labels
export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.OFFICE_ADMIN]: 'Office Admin',
  [ROLES.VERIFIED_USER]: 'Verified User',
};

// Role Colors
export const ROLE_COLORS = {
  [ROLES.SUPER_ADMIN]: 'bg-purple-100 text-purple-800',
  [ROLES.OFFICE_ADMIN]: 'bg-blue-100 text-blue-800',
  [ROLES.VERIFIED_USER]: 'bg-green-100 text-green-800',
};

// Employee Status
export const EMPLOYEE_STATUS = {
  ACTIVE: 'active',
  RELEASED: 'released',
  RETIRED: 'retired',
};

// Status Labels
export const STATUS_LABELS = {
  [EMPLOYEE_STATUS.ACTIVE]: 'Active',
  [EMPLOYEE_STATUS.RELEASED]: 'Released',
  [EMPLOYEE_STATUS.RETIRED]: 'Retired',
};

// Status Colors
export const STATUS_COLORS = {
  [EMPLOYEE_STATUS.ACTIVE]: 'bg-green-100 text-green-800',
  [EMPLOYEE_STATUS.RELEASED]: 'bg-yellow-100 text-yellow-800',
  [EMPLOYEE_STATUS.RETIRED]: 'bg-gray-100 text-gray-800',
};

// Profile Request Status
export const REQUEST_STATUS = {
  PENDING: 'pending',
  PROCESSED: 'processed',
};

// Form Submission Status
export const SUBMISSION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// Submission Status Colors
export const SUBMISSION_STATUS_COLORS = {
  [SUBMISSION_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [SUBMISSION_STATUS.APPROVED]: 'bg-green-100 text-green-800',
  [SUBMISSION_STATUS.REJECTED]: 'bg-red-100 text-red-800',
};

// Gender Options
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

// Religion Options
export const RELIGION_OPTIONS = [
  { value: 'Islam', label: 'Islam' },
  { value: 'Hinduism', label: 'Hinduism' },
  { value: 'Buddhism', label: 'Buddhism' },
  { value: 'Christianity', label: 'Christianity' },
  { value: 'Other', label: 'Other' },
];

// Blood Group Options
export const BLOOD_GROUP_OPTIONS = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];

// Marital Status Options
export const MARITAL_STATUS_OPTIONS = [
  { value: 'Single', label: 'Single' },
  { value: 'Married', label: 'Married' },
  { value: 'Divorced', label: 'Divorced' },
  { value: 'Widowed', label: 'Widowed' },
];

// Academic Exam Names
export const EXAM_NAMES = [
  { value: 'SSC / Dakhil', label: 'SSC / Dakhil' },
  { value: 'HSC / Alim', label: 'HSC / Alim' },
  { value: 'Bachelor (Honors)', label: 'Bachelor (Honors)' },
  { value: 'Masters', label: 'Masters' },
  { value: 'Diploma', label: 'Diploma' },
];

// Family Relations
export const FAMILY_RELATIONS = {
  FATHER: 'father',
  MOTHER: 'mother',
  SPOUSE: 'spouse',
  CHILD: 'child',
};

// Form Field Types
export const FORM_FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Dropdown' },
  { value: 'file', label: 'File Upload' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio Buttons' },
];

// Bangladesh Divisions
export const DIVISIONS = [
  'Dhaka',
  'Chittagong',
  'Rajshahi',
  'Khulna',
  'Barisal',
  'Sylhet',
  'Rangpur',
  'Mymensingh',
];

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// File Upload Limits
export const FILE_LIMITS = {
  PHOTO_MAX_SIZE: 2 * 1024 * 1024, // 2MB
  DOCUMENT_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
  ],
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'dd MMM yyyy',
  INPUT: 'yyyy-MM-dd',
  DISPLAY_WITH_TIME: 'dd MMM yyyy, hh:mm a',
  API: 'yyyy-MM-dd',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'brems_auth_token',
  USER_DATA: 'brems_user_data',
  THEME: 'brems_theme',
  SIDEBAR_COLLAPSED: 'brems_sidebar_collapsed',
};
