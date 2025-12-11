import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Timesheet, Project, TimesheetComment } from '../../lib/supabase';
import Layout from '../Layout';
import TimesheetForm from './TimesheetForm';
import TimesheetList from './TimesheetList';
import { Plus, X } from 'lucide-react';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [comments, setComments] = useState<TimesheetComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTimesheet, setEditingTimesheet] = useState<Timesheet | null>(null);
  const [filter, setFilter] = useState<'all' | 'draft' | 'submitted' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);

    const [timesheetsResult, projectsResult, commentsResult] = await Promise.all([
      supabase
        .from('timesheets')
        .select('*, project:projects(*), reviewer:profiles!reviewed_by(*)')
        .eq('employee_id', user.id)
        .order('date', { ascending: false }),
      supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .order('name'),
      supabase
        .from('timesheet_comments')
        .select('*, commenter:profiles!commenter_id(*)')
        .in('timesheet_id', []),
    ]);

    if (timesheetsResult.data) {
      setTimesheets(timesheetsResult.data);

      if (timesheetsResult.data.length > 0) {
        const timesheetIds = timesheetsResult.data.map(t => t.id);
        const commentsRefresh = await supabase
          .from('timesheet_comments')
          .select('*, commenter:profiles!commenter_id(*)')
          .in('timesheet_id', timesheetIds);

        if (commentsRefresh.data) {
          setComments(commentsRefresh.data);
        }
      }
    }

    if (projectsResult.data) {
      setProjects(projectsResult.data);
    }

    setLoading(false);
  };

  const handleEdit = (timesheet: Timesheet) => {
    setEditingTimesheet(timesheet);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this timesheet?')) return;

    const { error } = await supabase
      .from('timesheets')
      .delete()
      .eq('id', id);

    if (!error) {
      await fetchData();
    }
  };

  const handleSubmit = async (id: string) => {
    if (!confirm('Submit this timesheet for approval?')) return;

    const { error } = await supabase
      .from('timesheets')
      .update({
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (!error) {
      await fetchData();
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTimesheet(null);
  };

  const handleFormSuccess = async () => {
    await fetchData();
    handleFormClose();
  };

  const filteredTimesheets = filter === 'all'
    ? timesheets
    : timesheets.filter(t => t.status === filter);

  if (loading) {
    return (
      <Layout title="My Timesheets">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="My Timesheets">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              All ({timesheets.length})
            </button>
            <button
              onClick={() => setFilter('draft')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'draft'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              Draft ({timesheets.filter(t => t.status === 'draft').length})
            </button>
            <button
              onClick={() => setFilter('submitted')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'submitted'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              Submitted ({timesheets.filter(t => t.status === 'submitted').length})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'approved'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              Approved ({timesheets.filter(t => t.status === 'approved').length})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'rejected'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              Rejected ({timesheets.filter(t => t.status === 'rejected').length})
            </button>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Timesheet</span>
          </button>
        </div>

        <TimesheetList
          timesheets={filteredTimesheets}
          comments={comments}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSubmit={handleSubmit}
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {editingTimesheet ? 'Edit Timesheet' : 'New Timesheet'}
              </h3>
              <button
                onClick={handleFormClose}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <TimesheetForm
                projects={projects}
                timesheet={editingTimesheet}
                onSuccess={handleFormSuccess}
                onCancel={handleFormClose}
              />
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
