import { useState } from 'react';
import {
  DocumentIcon,
  PhotoIcon,
  ArrowUpTrayIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { Button, FileUpload, Alert } from '@/components/common';
import { fileService } from '@/services';
import { getErrorMessage, getStorageUrl } from '@/utils/helpers';
import toast from 'react-hot-toast';

const DocumentsSection = ({
  employee,
  employeeId,
  onUpdate,
  canManage,
  isVerifiedUser,
  onPendingDocumentUpload,
  getPendingDocumentFor,
}) => {
  const [uploading, setUploading] = useState({});

  const handleUpload = async (type, file) => {
    if (!file) return;

    const uploadKey = type;
    setUploading((prev) => ({ ...prev, [uploadKey]: true }));

    try {
      let response;
      
      if (type === 'profile_picture') {
        response = await fileService.uploadProfilePicture(employeeId, file);
      } else if (type === 'nid') {
        response = await fileService.uploadNidDocument(employeeId, file);
      } else if (type === 'birth') {
        response = await fileService.uploadBirthCertificate(employeeId, file);
      }

      if (response.pending && isVerifiedUser) {
        // Document uploaded to pending - track it
        onPendingDocumentUpload({
          path: response.path,
          url: response.url,
          field: response.field,
          document_type: response.document_type || getDocumentTypeLabel(type),
        });
        toast.success(response.message || 'Document uploaded. Will be submitted with your profile changes.');
      } else if (response.applied) {
        // Admin upload - applied immediately
        toast.success('Document uploaded successfully');
        onUpdate?.();
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading((prev) => ({ ...prev, [uploadKey]: false }));
    }
  };

  const handleDelete = async (type) => {
    if (!canManage) {
      toast.error('Only admins can delete documents directly');
      return;
    }

    try {
      if (type === 'profile_picture') {
        await fileService.deleteProfilePicture(employeeId);
      } else {
        await fileService.deleteDocument(employeeId, type);
      }
      toast.success('Document deleted successfully');
      onUpdate?.();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const getDocumentTypeLabel = (type) => {
    const labels = {
      profile_picture: 'Profile Picture',
      nid: 'NID Document',
      birth: 'Birth Certificate',
    };
    return labels[type] || type;
  };

  const renderDocumentCard = (type, label, currentPath, fieldName) => {
    const pendingDoc = getPendingDocumentFor?.(fieldName);
    const hasCurrentDoc = !!currentPath;
    const hasPendingDoc = !!pendingDoc;

    return (
      <div className='p-4 border border-gray-200 rounded-lg'>
        <div className='flex items-center justify-between mb-3'>
          <h4 className='font-medium text-gray-900 flex items-center gap-2'>
            {type === 'profile_picture' ? (
              <PhotoIcon className='w-5 h-5 text-gray-500' />
            ) : (
              <DocumentIcon className='w-5 h-5 text-gray-500' />
            )}
            {label}
          </h4>
          {hasPendingDoc && (
            <span className='inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full'>
              <ClockIcon className='w-3 h-3' />
              Pending Upload
            </span>
          )}
          {hasCurrentDoc && !hasPendingDoc && (
            <span className='inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full'>
              <CheckCircleIcon className='w-3 h-3' />
              Uploaded
            </span>
          )}
        </div>

        {/* Show pending document preview */}
        {hasPendingDoc && (
          <div className='mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg'>
            <p className='text-xs text-amber-700 mb-2'>New upload (pending approval):</p>
            {pendingDoc.url && type === 'profile_picture' ? (
              <img
                src={pendingDoc.url}
                alt='Pending upload'
                className='w-20 h-20 object-cover rounded-lg border-2 border-amber-300'
              />
            ) : (
              <a
                href={pendingDoc.url}
                target='_blank'
                rel='noopener noreferrer'
                className='text-sm text-primary-600 hover:underline flex items-center gap-1'
              >
                <DocumentIcon className='w-4 h-4' />
                View pending document
              </a>
            )}
          </div>
        )}

        {/* Show current document */}
        {hasCurrentDoc && (
          <div className='mb-3'>
            {type === 'profile_picture' ? (
              <img
                src={getStorageUrl(currentPath)}
                alt={label}
                className='w-24 h-24 object-cover rounded-lg border border-gray-200'
              />
            ) : (
              <a
                href={getStorageUrl(currentPath)}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors'
              >
                <DocumentIcon className='w-5 h-5 text-gray-500' />
                <span className='text-sm text-primary-600 hover:underline'>
                  View current document
                </span>
              </a>
            )}
          </div>
        )}

        {/* Upload section */}
        <div className='space-y-2'>
          <FileUpload
            accept={
              type === 'profile_picture'
                ? 'image/jpeg,image/jpg,image/png'
                : 'application/pdf,image/jpeg,image/jpg,image/png'
            }
            maxSize={type === 'profile_picture' ? 2 * 1024 * 1024 : 5 * 1024 * 1024}
            onChange={(file) => handleUpload(type, file)}
            uploading={uploading[type]}
            hint={
              type === 'profile_picture'
                ? 'JPG, PNG up to 2MB'
                : 'PDF, JPG, PNG up to 5MB'
            }
            label={hasPendingDoc ? 'Replace pending upload' : hasCurrentDoc ? 'Replace document' : 'Upload document'}
          />

          {/* Delete button for admins */}
          {hasCurrentDoc && canManage && (
            <Button
              type='button'
              variant='outline-danger'
              size='sm'
              icon={TrashIcon}
              onClick={() => handleDelete(type)}
              className='mt-2'
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className='p-6 space-y-6'>
      <div>
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>Documents</h3>
        {isVerifiedUser && (
          <Alert variant='info' className='mb-4'>
            Document uploads will be submitted for admin approval along with your profile changes.
            Click "Submit for Review" when you're done making all changes.
          </Alert>
        )}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {renderDocumentCard(
          'profile_picture',
          'Profile Picture',
          employee.profile_picture,
          'profile_picture'
        )}
        {renderDocumentCard(
          'nid',
          'NID Document',
          employee.nid_file_path,
          'nid_file_path'
        )}
        {renderDocumentCard(
          'birth',
          'Birth Certificate',
          employee.birth_file_path,
          'birth_file_path'
        )}
      </div>
    </div>
  );
};

export default DocumentsSection;