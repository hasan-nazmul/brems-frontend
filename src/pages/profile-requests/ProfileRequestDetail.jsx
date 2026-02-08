import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
  DocumentIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { profileRequestService } from '@/services';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  Alert,
  LoadingScreen,
  ConfirmModal,
} from '@/components/common';
import { formatDate, getFullName, getErrorMessage } from '@/utils/helpers';
import {
  getProposedChangesSections,
  getDocumentUpdateFallbackSection,
  getStorageUrl,
  isImageFile,
} from '@/utils/profileRequestChanges';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

// File Preview Component
function FilePreview({ url, isImage, fileName, label }) {
  const [imageError, setImageError] = useState(false);

  if (!url || url === '—') {
    return <span className="text-gray-400 italic">No file</span>;
  }

  if (isImage && !imageError) {
    return (
      <div className="space-y-2">
        <img
          src={url}
          alt={label || fileName || 'Preview'}
          className="max-w-[200px] max-h-[200px] object-contain rounded-lg border border-gray-200 shadow-sm"
          onError={() => setImageError(true)}
        />
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary-600 hover:underline flex items-center gap-1"
        >
          <PhotoIcon className="w-3 h-3" />
          View full size
        </a>
      </div>
    );
  }

  // Non-image file or image failed to load
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
    >
      <DocumentIcon className="w-5 h-5 text-gray-500" />
      <span className="text-sm text-primary-600 hover:underline">
        {fileName || 'View Document'}
      </span>
    </a>
  );
}

function ProposedChangesDisplay({
  currentData,
  proposedChanges,
  requestType,
  details,
}) {
  console.log('ProposedChangesDisplay - proposedChanges:', proposedChanges);
  
  let sections = getProposedChangesSections(currentData, proposedChanges);

  console.log('ProposedChangesDisplay - sections:', sections);

  // Fallback for Document Update with no sections
  if (!sections.length && requestType === 'Document Update' && details) {
    const fallback = getDocumentUpdateFallbackSection(details);
    if (fallback) sections = [fallback];
  }

  if (!sections.length) {
    return (
      <p className="text-sm text-gray-500 italic">
        No field-level changes to display (e.g. file-only or metadata update).
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.title}>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            {section.title}
          </h4>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 w-40">
                    Field
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Current
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Proposed
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {section.rows.map((row, idx) => (
                  <tr key={`${section.title}-${idx}`}>
                    <td className="px-4 py-3 font-medium text-gray-900 align-top">
                      {row.label}
                    </td>
                    <td className="px-4 py-3 text-gray-600 align-top">
                      {row.isFile ? (
                        <FilePreview
                          url={row.previous}
                          isImage={row.isImage}
                          fileName={row.currentFileName}
                          label="Current"
                        />
                      ) : (
                        <span>{row.previous}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      {row.isFile ? (
                        <div className="space-y-2">
                          <FilePreview
                            url={row.proposed}
                            isImage={row.isImage}
                            fileName={row.fileName}
                            label="Proposed"
                          />
                          <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">
                            Pending Approval
                          </span>
                        </div>
                      ) : (
                        <span className="text-primary-600 font-medium">
                          {row.proposed}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

const ProfileRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const permissions = usePermissions();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [processModal, setProcessModal] = useState({
    open: false,
    approve: null,
  });

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileRequestService.getById(id);
      console.log('Fetched request data:', data);
      console.log('proposed_changes:', data.proposed_changes);
      setRequest(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (approve) => {
    try {
      setProcessing(true);
      await profileRequestService.process(id, {
        is_approved: approve,
        admin_note: adminNote,
      });
      toast.success(approve ? 'Request approved' : 'Request rejected');
      setProcessModal({ open: false, approve: null });
      setAdminNote('');
      fetchRequest();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      await profileRequestService.downloadReport(id);
      toast.success('Report downloaded');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const canProcess =
    permissions.canProcessRequests &&
    request?.status === 'pending' &&
    request?.employee_id !== currentUser?.employee_id;

  if (loading) {
    return <LoadingScreen message="Loading request..." />;
  }

  if (error || !request) {
    return (
      <div className="p-8">
        <Alert variant="error" title="Error">
          {error || 'Request not found'}
        </Alert>
        <Button
          className="mt-4"
          onClick={() => navigate('/profile-requests')}
          icon={ArrowLeftIcon}
        >
          Back to Requests
        </Button>
      </div>
    );
  }

  const isApproved = request.status === 'processed' && request.is_approved;
  const isRejected = request.status === 'processed' && request.is_approved === false;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Request #${request.id}`}
        subtitle={request.request_type}
        breadcrumbs={[
          { label: 'Profile Requests', href: '/profile-requests' },
          { label: `#${request.id}` },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/profile-requests')}
              icon={ArrowLeftIcon}
            >
              Back
            </Button>
            {request.status === 'processed' && (
              <Button
                variant="outline"
                icon={ArrowDownTrayIcon}
                onClick={handleDownloadReport}
              >
                Download Report
              </Button>
            )}
            {canProcess && (
              <>
                <Button
                  variant="success"
                  icon={CheckIcon}
                  onClick={() => setProcessModal({ open: true, approve: true })}
                >
                  Approve
                </Button>
                <Button
                  variant="error"
                  icon={XMarkIcon}
                  onClick={() => setProcessModal({ open: true, approve: false })}
                >
                  Reject
                </Button>
              </>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6">
        {/* Request Info Card */}
        <Card>
          <h3 className="text-sm font-medium text-gray-500 mb-4">
            Request Details
          </h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <dt className="text-sm text-gray-500">Employee</dt>
              <dd className="mt-1 font-medium text-gray-900">
                {request.employee
                  ? getFullName(request.employee.first_name, request.employee.last_name)
                  : '-'}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Office</dt>
              <dd className="mt-1 text-gray-900">
                {request.employee?.office?.name || '-'}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Type</dt>
              <dd className="mt-1">
                <Badge variant="info">{request.request_type || '-'}</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Status</dt>
              <dd className="mt-1">
                <Badge
                  variant={
                    request.status === 'pending'
                      ? 'warning'
                      : isApproved
                      ? 'success'
                      : 'error'
                  }
                >
                  {request.status === 'pending'
                    ? 'Pending Review'
                    : isApproved
                    ? 'Approved'
                    : 'Rejected'}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Submitted</dt>
              <dd className="mt-1 text-gray-900">
                {formatDate(request.created_at)}
              </dd>
            </div>
            {request.reviewed_at && (
              <>
                <div>
                  <dt className="text-sm text-gray-500">Reviewed</dt>
                  <dd className="mt-1 text-gray-900">
                    {formatDate(request.reviewed_at)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Reviewed by</dt>
                  <dd className="mt-1 text-gray-900">
                    {request.reviewed_by_user?.name || request.reviewedBy?.name || '-'}
                  </dd>
                </div>
              </>
            )}
          </dl>

          {request.details && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <dt className="text-sm text-gray-500">Additional Details</dt>
              <dd className="mt-1 text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                {request.details}
              </dd>
            </div>
          )}

          {request.admin_note && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <dt className="text-sm text-gray-500">Admin Note</dt>
              <dd
                className={`mt-1 whitespace-pre-wrap p-3 rounded-lg ${
                  isApproved ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}
              >
                {request.admin_note}
              </dd>
            </div>
          )}

          {canProcess && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Note (optional)
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Add a note for the employee explaining your decision..."
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          )}
        </Card>

        {/* Proposed Changes Card */}
        <Card>
          <h3 className="text-sm font-medium text-gray-500 mb-4">
            Proposed Changes
          </h3>
          <ProposedChangesDisplay
            currentData={request.current_data}
            proposedChanges={request.proposed_changes}
            requestType={request.request_type}
            details={request.details}
          />
        </Card>
      </div>

      <ConfirmModal
        isOpen={processModal.open}
        onClose={() => setProcessModal({ open: false, approve: null })}
        title={processModal.approve ? 'Approve Request?' : 'Reject Request?'}
        message={
          processModal.approve
            ? 'The proposed changes (including any uploaded files) will be applied to the employee profile.'
            : 'The request will be marked as rejected and any pending files will be deleted.'
        }
        confirmText={processModal.approve ? 'Approve' : 'Reject'}
        variant={processModal.approve ? 'success' : 'danger'}
        onConfirm={() => handleProcess(processModal.approve)}
        loading={processing}
      />
    </div>
  );
};

export default ProfileRequestDetail;