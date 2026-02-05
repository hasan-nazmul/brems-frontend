import { useState } from 'react';
import { Input, Select, Button, FileUpload } from '@/components/common';
import { PlusIcon, TrashIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { EXAM_NAMES } from '@/utils/constants';
import { fileService } from '@/services';
import { getErrorMessage, getStorageUrl } from '@/utils/helpers';
import toast from 'react-hot-toast';

const AcademicsSection = ({
  data = [],
  onChange,
  employeeId,
  onDocumentChange,
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
      await fileService.uploadAcademicCertificate(employeeId, record.id, file);
      toast.success('Certificate uploaded');
      onDocumentChange?.();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading((u) => ({ ...u, [key]: false }));
    }
  };

  const handleDeleteCertificate = async (index) => {
    const record = (Array.isArray(data) ? data : [])[index];
    if (!record?.id || !employeeId) return;
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
        {list.map((record, index) => (
          <div
            key={record.id ?? `new-${index}`}
            className='p-4 border border-gray-200 rounded-lg space-y-4'
          >
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <Select
                label='Exam'
                value={record.exam_name}
                onChange={(e) =>
                  updateRecord(index, 'exam_name', e.target.value)
                }
                options={EXAM_NAMES}
                placeholder='Select exam'
              />
              <Input
                label='Institute'
                value={record.institute}
                onChange={(e) =>
                  updateRecord(index, 'institute', e.target.value)
                }
                placeholder='Institute name'
              />
              <Input
                label='Passing Year'
                value={record.passing_year}
                onChange={(e) =>
                  updateRecord(index, 'passing_year', e.target.value)
                }
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
                <h4 className='text-sm font-medium text-gray-700 mb-2'>
                  Certificate document
                </h4>
                {record.certificate_path ? (
                  <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                    <div className='flex items-center gap-2'>
                      <DocumentIcon className='w-5 h-5 text-gray-500' />
                      <a
                        href={getStorageUrl(record.certificate_path) || '#'}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-sm text-primary-600 hover:underline'
                      >
                        View certificate
                      </a>
                    </div>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => handleDeleteCertificate(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <FileUpload
                    accept='application/pdf,image/jpeg,image/jpg,image/png'
                    maxSize={5 * 1024 * 1024}
                    onChange={(file) => handleUploadCertificate(index, file)}
                    uploading={uploading[`${index}`]}
                    hint='PDF, JPG, PNG up to 5MB'
                  />
                )}
              </div>
            )}
            {record.id == null && (
              <p className='text-xs text-gray-500'>
                Save your profile (submit for review) to add a certificate for
                new entries.
              </p>
            )}

            <Button
              type='button'
              variant='ghost'
              size='sm'
              icon={TrashIcon}
              onClick={() => removeRecord(index)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AcademicsSection;
