import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { DATE_FORMATS, STORAGE_BASE_URL } from './constants';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

/**
 * Full URL for a storage file. Handles Cloudinary (public_id with brems/) and local backend /storage/ paths.
 * @param {string} path - File path or Cloudinary public_id
 * @param {{ forDocument?: boolean, resourceType?: 'image'|'raw' }} options - Use forDocument: true for NID/birth/certs (so PDFs get correct raw URL when path has no extension)
 */
export const getStorageUrl = (path, options = {}) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  if (cloudName && path.includes('brems/')) {
    let resource = options.resourceType;
    if (!resource) {
      const ext = path.split('.').pop()?.toLowerCase() || '';
      const hasImageExt = IMAGE_EXTENSIONS.includes(ext);
      const explicitPdf = path.toLowerCase().endsWith('.pdf') || path.includes('/raw/');
      if (explicitPdf || (options.forDocument && !hasImageExt)) {
        resource = 'raw';
      } else {
        resource = 'image';
      }
    }
    const cleanPath = path.replace(/^\//, '');
    return `https://res.cloudinary.com/${cloudName}/${resource}/upload/${cleanPath}`;
  }
  const base = (STORAGE_BASE_URL || '').replace(/\/$/, '');
  return `${base}/storage/${path.replace(/^\//, '')}`;
};

/** True if path looks like an image (by extension). Cloudinary public_ids often have no extension. */
export const isImageFile = (path) => {
  if (!path) return false;
  const ext = path.split('.').pop()?.toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
};

/** True if path looks like a PDF. */
export const isPdfFile = (path) => {
  if (!path) return false;
  return path.toLowerCase().endsWith('.pdf');
};

/**
 * Format date for display
 */
export const formatDate = (date, formatStr = DATE_FORMATS.DISPLAY) => {
  if (!date) return '-';
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return format(parsedDate, formatStr);
  } catch {
    return '-';
  }
};

/**
 * Format date with time
 */
export const formatDateTime = (date) => {
  return formatDate(date, DATE_FORMATS.DISPLAY_WITH_TIME);
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (date) => {
  if (!date) return '-';
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(parsedDate, { addSuffix: true });
  } catch {
    return '-';
  }
};

/**
 * Format currency (BDT)
 */
export const formatCurrency = (amount, showSymbol = true) => {
  if (amount === null || amount === undefined) return '-';
  const formatted = new Intl.NumberFormat('en-BD', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return showSymbol ? `৳${formatted}` : formatted;
};

/**
 * Format phone number
 */
export const formatPhone = (phone) => {
  if (!phone) return '-';
  // Remove non-digits
  const cleaned = phone.replace(/\D/g, '');
  // Format as Bangladesh phone
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Truncate text
 */
export const truncate = (str, length = 50) => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
};

/**
 * Get full name from first and last name
 */
export const getFullName = (firstName, lastName) => {
  return [firstName, lastName].filter(Boolean).join(' ') || '-';
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Check if file type is valid
 */
export const isValidFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};

/**
 * Check if file size is valid
 */
export const isValidFileSize = (file, maxSize) => {
  return file.size <= maxSize;
};

/**
 * Generate random color for avatar
 */
export const getAvatarColor = (name) => {
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
  ];

  if (!name) return colors[0];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 */
export const isEmpty = (obj) => {
  if (!obj) return true;
  return Object.keys(obj).length === 0;
};

/**
 * Remove empty values from object
 */
export const removeEmptyValues = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([_, v]) => v !== null && v !== undefined && v !== ''
    )
  );
};

/**
 * Build query string from object
 */
export const buildQueryString = (params) => {
  const cleaned = removeEmptyValues(params);
  if (isEmpty(cleaned)) return '';
  return '?' + new URLSearchParams(cleaned).toString();
};

/**
 * Download file from blob
 */
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get error message from API error
 */
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.errors) {
    const errors = error.response.data.errors;
    return Object.values(errors).flat().join(', ');
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

/**
 * Sleep/delay function
 */
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generate unique ID
 */
export const generateId = () => {
  return Math.random().toString(36).substring(2, 15);
};

/**
 * Check if user has permission based on role
 */
export const hasPermission = (userRole, allowedRoles) => {
  if (!userRole || !allowedRoles) return false;
  if (typeof allowedRoles === 'string') {
    return userRole === allowedRoles;
  }
  return allowedRoles.includes(userRole);
};

/**
 * Sort array of objects by key
 */
export const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    if (a[key] < b[key]) return order === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Group array by key
 */
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const value = item[key];
    groups[value] = groups[value] || [];
    groups[value].push(item);
    return groups;
  }, {});
};
