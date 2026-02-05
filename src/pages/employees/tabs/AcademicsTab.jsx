import { AcademicCapIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { Badge, EmptyState } from '@/components/common';
import { getStorageUrl } from '@/utils/helpers';

const AcademicsTab = ({ employee }) => {
  const { academics = [] } = employee;

  if (academics.length === 0) {
    return (
      <div className='p-6'>
        <EmptyState
          icon={AcademicCapIcon}
          title='No academic records'
          description='Academic qualifications have not been added yet'
        />
      </div>
    );
  }

  const examOrder = [
    'SSC / Dakhil',
    'HSC / Alim',
    'Diploma',
    'Bachelor (Honors)',
    'Masters',
  ];

  const sortedAcademics = [...academics].sort((a, b) => {
    return examOrder.indexOf(a.exam_name) - examOrder.indexOf(b.exam_name);
  });

  return (
    <div className='p-6'>
      <h3 className='text-lg font-semibold text-gray-900 mb-6'>
        Academic Qualifications
      </h3>

      <div className='space-y-4'>
        {sortedAcademics.map((record, index) => (
          <div
            key={index}
            className='p-4 bg-gray-50 rounded-lg border border-gray-200'
          >
            <div className='flex items-start justify-between'>
              <div className='flex items-start gap-3'>
                <div className='p-2 bg-primary-100 rounded-lg'>
                  <AcademicCapIcon className='w-5 h-5 text-primary-600' />
                </div>
                <div>
                  <h4 className='font-medium text-gray-900'>
                    {record.exam_name}
                  </h4>
                  <p className='text-sm text-gray-600'>{record.institute}</p>
                </div>
              </div>
              <Badge variant='info'>{record.passing_year}</Badge>
            </div>

            <div className='mt-3 flex items-center justify-between'>
              <div className='text-sm'>
                <span className='text-gray-500'>Result: </span>
                <span className='font-medium text-gray-900'>
                  {record.result}
                </span>
              </div>

              {record.certificate_path && (
                <a
                  href={getStorageUrl(record.certificate_path) || '#'}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700'
                >
                  <DocumentIcon className='w-4 h-4' />
                  View Certificate
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AcademicsTab;
