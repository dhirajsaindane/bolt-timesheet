import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Timesheet, Profile, Project } from '../../lib/supabase';
import Layout from '../Layout';
import TimesheetApproval from './TimesheetApproval';
import { Clock, CheckCircle, XCircle, Users, Filter } from 'lucide-react';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'submitted' | 'approved' | 'rejected'>('submitted');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);

    const [employeesResult, projectsResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('manager_id', user.id)
        .eq('role', 'employee'),
      supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .order('name'),
    ]);

    if (employeesResult.data) {
      setEmployees(employeesResult.data);

      const employeeIds = employeesResult.data.map(e => e.id);
      const timesheetsResult = await supabase
        .from('timesheets')
        .select('*, project:projects(*), employee:profiles!employee_id(*)')
        .in('employee_id', employeeIds)
        .order('date', { ascending: false });

      if (timesheetsResult.data) {
        setTimesheets(timesheetsResult.data);
      }
    }

    if (projectsResult.data) {
      setProjects(projectsResult.data);
    }

    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from('timesheets')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user!.id,
      })
      .eq('id', id);

    if (!error) {
      await fetchData();
    }
  };

  const handleReject = async (id: string, comment: string) => {
    const { error: timesheetError } = await supabase
      .from('timesheets')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user!.id,
      })
      .eq('id', id);

    if (!timesheetError && comment) {
      await supabase
        .from('timesheet_comments')
        .insert([{
          timesheet_id: id,
          commenter_id: user!.id,
          comment,
        }]);
    }

    if (!timesheetError) {
      await fetchData();
    }
  };

  const filteredTimesheets = timesheets.filter((timesheet) => {
    if (selectedStatus !== 'all' && timesheet.status !== selectedStatus) return false;
    if (selectedEmployee !== 'all' && timesheet.employee_id !== selectedEmployee) return false;
    if (selectedProject !== 'all' && timesheet.project_id !== selectedProject) return false;
    if (dateRange.from && timesheet.date < dateRange.from) return false;
    if (dateRange.to && timesheet.date > dateRange.to) return false;
    return true;
  });

  const stats = {
    pending: timesheets.filter(t => t.status === 'submitted').length,
    approved: timesheets.filter(t => t.status === 'approved').length,
    rejected: timesheets.filter(t => t.status === 'rejected').length,
  };

  if (loading) {
    return (
      <Layout title="Team Timesheets">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Team Timesheets">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Pending Approval</p>
                <p className="text-3xl font-bold text-slate-900">{stats.pending}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Approved</p>
                <p className="text-3xl font-bold text-slate-900">{stats.approved}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Rejected</p>
                <p className="text-3xl font-bold text-slate-900">{stats.rejected}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Employee</label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              >
                <option value="all">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              >
                <option value="all">All Projects</option>
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date Range</label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                  placeholder="From"
                />
              </div>
            </div>
          </div>

          {(selectedStatus !== 'submitted' || selectedEmployee !== 'all' || selectedProject !== 'all' || dateRange.from) && (
            <button
              onClick={() => {
                setSelectedStatus('submitted');
                setSelectedEmployee('all');
                setSelectedProject('all');
                setDateRange({ from: '', to: '' });
              }}
              className="mt-4 text-sm text-slate-600 hover:text-slate-900 underline"
            >
              Clear all filters
            </button>
          )}
        </div>

        <TimesheetApproval
          timesheets={filteredTimesheets}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>
    </Layout>
  );
}
