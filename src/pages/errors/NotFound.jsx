import { useNavigate } from 'react-router-dom';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/common';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
      <div className='text-center'>
        <p className='text-sm font-semibold text-primary-600 uppercase tracking-wide'>
          404 Error
        </p>
        <h1 className='mt-2 text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl'>
          Page not found
        </h1>
        <p className='mt-4 text-lg text-gray-500 max-w-md mx-auto'>
          Sorry, we couldn't find the page you're looking for. Please check the
          URL or navigate back to the homepage.
        </p>
        <div className='mt-8 flex flex-col sm:flex-row items-center justify-center gap-4'>
          <Button
            onClick={() => navigate('/', { replace: true })}
            icon={HomeIcon}
          >
            Go to Homepage
          </Button>
          <Button
            variant='outline'
            onClick={() => navigate(-1)}
            icon={ArrowLeftIcon}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
