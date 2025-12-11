import { useState } from 'react';
import { Timesheet } from '../../lib/supabase';
import { CheckCircle, XCircle, User, Calendar, Clock as ClockIcon, FileText, X } from 'lucide-react';

interface TimesheetApprovalProps {
  timesheets: Timesheet[];
  onApprove: (id: string) => void;
  onReject: (id: string, comment: string) => void;
}

export default function TimesheetApproval({ timesheets, onApprove, onReject }: TimesheetApprovalProps) {
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState('');

  const handleReject = () => {
    if (rejectingId && rejectComment.trim()) {
      onReject(rejectingId, rejectComment);
      setRejectingId(null);
      setRejectComment('');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };

    const icons = {
      draft: <FileText className="w-3 h-3" />,
      submitted: <ClockIcon className="w-3 h-3" />,
      approved: <CheckCircle className="w-3 h-3" />,
      rejected: <XCircle className="w-3 h-3" />,
    };

    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {icons[status as keyof typeof icons]}
        <span className="capitalize">{status}</span>
      </span>
    );
  };

  if (timesheets.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <ClockIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-600 text-lg font-medium mb-2">No timesheets found</p>
        <p className="text-slate-500 text-sm">Try adjusting your filters to see more results</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {timesheets.map((timesheet) => (
        <div key={timesheet.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-slate-100 p-2 rounded-lg">
                  <User className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {timesheet.employee?.full_name}
                  </h3>
                  <p className="text-sm text-slate-500">{timesheet.employee?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Date</p>
                  <p className="text-sm font-medium text-slate-900">
                    {new Date(timesheet.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Project</p>
                  <p className="text-sm font-medium text-slate-900">{timesheet.project?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Hours</p>
                  <p className="text-sm font-medium text-slate-900">{timesheet.hours_worked} hrs</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  {getStatusBadge(timesheet.status)}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <p className="text-sm font-medium text-slate-700 mb-2">Task Description:</p>
            <p className="text-sm text-slate-600 mb-3">{timesheet.task_description}</p>

            {timesheet.notes && (
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Notes:</p>
                <p className="text-sm text-slate-600">{timesheet.notes}</p>
              </div>
            )}
          </div>

          {timesheet.status === 'submitted' && (
            <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-slate-200">
              <button
                onClick={() => onApprove(timesheet.id)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approve</span>
              </button>
              <button
                onClick={() => setRejectingId(timesheet.id)}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>
            </div>
          )}

          {timesheet.status === 'approved' && timesheet.reviewed_at && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-600">
                Approved on {new Date(timesheet.reviewed_at).toLocaleDateString()}
              </p>
            </div>
          )}

          {timesheet.status === 'rejected' && timesheet.reviewed_at && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-600">
                Rejected on {new Date(timesheet.reviewed_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      ))}

      {rejectingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Reject Timesheet</h3>
              <button
                onClick={() => {
                  setRejectingId(null);
                  setRejectComment('');
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-slate-600 mb-4">
                Please provide a reason for rejecting this timesheet. This will be visible to the employee.
              </p>

              <textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                rows={4}
                placeholder="Enter rejection reason..."
                autoFocus
              />

              <div className="flex space-x-3 mt-4">
                <button
                  onClick={handleReject}
                  disabled={!rejectComment.trim()}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Rejection
                </button>
                <button
                  onClick={() => {
                    setRejectingId(null);
                    setRejectComment('');
                  }}
                  className="flex-1 bg-white text-slate-700 py-2 rounded-lg font-medium border border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
