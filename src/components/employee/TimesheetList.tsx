import { Timesheet, TimesheetComment } from '../../lib/supabase';
import { Edit2, Trash2, Send, Clock, CheckCircle, XCircle, FileText, MessageSquare } from 'lucide-react';

interface TimesheetListProps {
  timesheets: Timesheet[];
  comments: TimesheetComment[];
  onEdit: (timesheet: Timesheet) => void;
  onDelete: (id: string) => void;
  onSubmit: (id: string) => void;
}

export default function TimesheetList({ timesheets, comments, onEdit, onDelete, onSubmit }: TimesheetListProps) {
  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };

    const icons = {
      draft: <FileText className="w-3 h-3" />,
      submitted: <Clock className="w-3 h-3" />,
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

  const getCommentsForTimesheet = (timesheetId: string) => {
    return comments.filter(c => c.timesheet_id === timesheetId);
  };

  if (timesheets.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-600 text-lg font-medium mb-2">No timesheets found</p>
        <p className="text-slate-500 text-sm">Click "New Timesheet" to create your first entry</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {timesheets.map((timesheet) => {
        const timesheetComments = getCommentsForTimesheet(timesheet.id);
        return (
          <div key={timesheet.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {new Date(timesheet.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </h3>
                  {getStatusBadge(timesheet.status)}
                </div>
                <p className="text-sm text-slate-600 mb-1">
                  <span className="font-medium">Project:</span> {timesheet.project?.name}
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Hours:</span> {timesheet.hours_worked}
                </p>
              </div>

              {timesheet.status === 'draft' && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEdit(timesheet)}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(timesheet.id)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onSubmit(timesheet.id)}
                    className="flex items-center space-x-1 px-3 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit</span>
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 pt-4 mt-4">
              <p className="text-sm text-slate-700 mb-2">
                <span className="font-medium">Task Description:</span>
              </p>
              <p className="text-sm text-slate-600">{timesheet.task_description}</p>

              {timesheet.notes && (
                <div className="mt-3">
                  <p className="text-sm text-slate-700 mb-1">
                    <span className="font-medium">Notes:</span>
                  </p>
                  <p className="text-sm text-slate-600">{timesheet.notes}</p>
                </div>
              )}
            </div>

            {timesheetComments.length > 0 && (
              <div className="border-t border-slate-200 pt-4 mt-4">
                <div className="flex items-center space-x-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-slate-600" />
                  <p className="text-sm font-medium text-slate-700">Manager Feedback</p>
                </div>
                <div className="space-y-2">
                  {timesheetComments.map((comment) => (
                    <div key={comment.id} className="bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium text-slate-700">
                          {comment.commenter?.full_name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-sm text-slate-600">{comment.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
