import { useState } from 'react';
import { Input, Select, Button, FileUpload } from '@/components/common';
import { PlusIcon, TrashIcon, DocumentIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { EXAM_NAMES } from '@/utils/constants';
import { fileService } from '@/services';
import { getErrorMessage, getStorageUrl } from '@/utils/helpers';
import toast from 'react-hot-toast';

const AcademicsSection = ({
  data = [],
  onChange,
  employeeId,
  onDocumentChange,
  isVerifiedUser = false,
  onPendingDocumentUpload,
  getPendingDocumentFor,
}) => {
  const [uploading, setUploading] = useState({});

  const addRecord = () => {
    onChange([
      ...(Array.isArray(data) ? data : []),
      { exam_name: '', institute: '', passing_year: '', result: '' },
    ]);
  };

  const updateRecord = (index, field, value) => {
    const list = [...(Array.isArray(data) ? data : [])];
    list[index] = { ...(list[index] || {}), [field]: value };
    onChange(list);
  };

  const removeRecord = (index) => {
    const list = [...(Array.isArray(data) ? data : [])];
    list.splice(index, 1);
    onChange(list);
  };

  const handleUploadCertificate = async (index, file) => {
    const record = (Array.isArray(data) ? data : [])[index];
    if (!record?.id || !employeeId) {
      toast.error('Save this academic record first to upload a certificate.');
      return;
    }
    
    const key = `${index}`;
    setUploading((u) => ({ ...u, [key]: true }));
    
    try {
      const response = await fileService.uploadAcademicCertificate(employeeId, record.id, file);
      
      if (response.pending && isVerifiedUser) {
        // Track as pending document
        onPendingDocumentUpload?.({
          path: response.path,
          url: response.url,
          academic_id: record.id,
          document_type: `Academic Certificate: ${record.exam_name || 'Certificate'}`,
        });
        toast.success('Certificate uploaded. Will be submitted with your profile changes.');
      } else if (response.applied) {
        toast.success('Certificate uploaded successfully');
        onDocumentChange?.();
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading((u) => ({ ...u, [key]: false }));
    }
  };

  const handleDeleteCertificate = async (index) => {
    const record = (Array.isArray(data) ? data : [])[index];
    if (!record?.id || !employeeId) return;
    
    if (isVerifiedUser) {
      toast.error('Only admins can delete certificates directly');
      return;
    }
    
    try {
      await fileService.deleteAcademicCertificate(employeeId, record.id);
      toast.success('Certificate removed');
      onDocumentChange?.();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const list = Array.isArray(data) ? data : [];

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-gray-900'>
          Academic Qualifications
        </h3>
        <Button
          type='button'
          variant='outline'
          size='sm'
          icon={PlusIcon}
          onClick={addRecord}
        >
          Add
        </Button>
      </div>
      
      <div className='space-y-4'>
        {list.map((record, index) => {
          const pendingDoc = getPendingDocumentFor?.(null, record.id);
          const hasCurrentCert = !!record.certificate_path;
          const hasPendingCert = !!pendingDoc;

          return (
            <div
              key={record.id ?? `new-${index}`}
              className='p-4 border border-gray-200 rounded-lg space-y-4'
            >
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <Select
                  label='Exam'
                  value={record.exam_name}
                  onChange={(e) => updateRecord(index, 'exam_name', e.target.value)}
                  options={EXAM_NAMES}
                  placeholder='Select exam'
                />
                <Input
                  label='Institute'
                  value={record.institute}
                  onChange={(e) => updateRecord(index, 'institute', e.target.value)}
                  placeholder='Institute name'
                />
                <Input
                  label='Passing Year'
                  value={record.passing_year}
                  onChange={(e) => updateRecord(index, 'passing_year', e.target.value)}
                  placeholder='e.g., 2010'
                />
                <Input
                  label='Result'
                  value={record.result}
                  onChange={(e) => updateRecord(index, 'result', e.target.value)}
                  placeholder='e.g., GPA 5.00'
                />
              </div>

              {/* Certificate upload for existing academic records */}
              {employeeId && record.id && (
                <div className='pt-2 border-t border-gray-100'>
                  <div className='flex items-center justify-between mb-2'>
                    <h4 className='text-sm font-medium text-gray-700'>
                      Certificate Document
                    </h4>
                    {hasPendingCert && (
                      <span className='inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full'>
                        <ClockIcon className='w-3 h-3' />
                        Pending
                      </span>
                    )}
                    {hasCurrentCert && !hasPendingCert && (
                      <span className='inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full'>
                        <CheckCircleIcon className='w-3 h-3' />
                        Uploaded
                      </span>
                    )}
                  </div>

                  {/* Show pending upload */}
                  {hasPendingCert && (
                    <div className='mb-2 p-2 bg-amber-50 border border-amber-200 rounded'>
                      <a
                        href={pendingDoc.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-sm text-primary-600 hover:underline flex items-center gap-1'
                      >
                        <DocumentIcon className='w-4 h-4' />
                        View pending certificate
                      </a>
                    </div>
                  )}

                  {/* Show current certificate */}
                  {hasCurrentCert && (
                    <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2'>
                      <div className='flex items-center gap-2'>
                        <DocumentIcon className='w-5 h-5 text-gray-500' />
                        <a
                          href={getStorageUrl(record.certificate_path)}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-sm text-primary-600 hover:underline'
                        >
                          View current certificate
                        </a>
                      </div>
                      {!isVerifiedUser && (
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => handleDeleteCertificate(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Upload new certificate */}
                  <FileUpload
                    accept='application/pdf,image/jpeg,image/jpg,image/png'
                    maxSize={5 * 1024 * 1024}
                    onChange={(file) => handleUploadCertificate(index, file)}
                    uploading={uploading[`${index}`]}
                    hint='PDF, JPG, PNG up to 5MB'
                    label={hasPendingCert || hasCurrentCert ? 'Replace certificate' : 'Upload certificate'}
                  />
                </div>
              )}
              
              {!record.id && (
                <p className='text-xs text-gray-500'>
                  Save your profile to upload a certificate for new entries.
                </p>
              )}

              <Button
                type='button'
                variant='ghost'
                size='sm'
                icon={TrashIcon}
                onClick={() => removeRecord(index)}
                className='text-red-500'
              >
                Remove Record
              </Button>
            </div>
          );
        })}
        
        {list.length === 0 && (
          <div className='text-center py-8 bg-gray-50 rounded-lg'>
            <p className='text-gray-500 mb-2'>No academic records added</p>
            <Button
              type='button'
              variant='outline'
              size='sm'
              icon={PlusIcon}
              onClick={addRecord}
            >
              Add Academic Record
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademicsSection;