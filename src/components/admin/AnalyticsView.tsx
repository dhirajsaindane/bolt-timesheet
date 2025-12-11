import { useState, useMemo } from 'react';
import { Timesheet, Profile, Project } from '../../lib/supabase';
import { Download, Filter } from 'lucide-react';

interface AnalyticsViewProps {
  timesheets: Timesheet[];
  users: Profile[];
  projects: Project[];
}

export default function AnalyticsView({ timesheets, users, projects }: AnalyticsViewProps) {
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const filteredTimesheets = useMemo(() => {
    return timesheets.filter((timesheet) => {
      if (selectedProject !== 'all' && timesheet.project_id !== selectedProject) return false;
      if (selectedEmployee !== 'all' && timesheet.employee_id !== selectedEmployee) return false;
      if (selectedStatus !== 'all' && timesheet.status !== selectedStatus) return false;
      if (dateRange.from && timesheet.date < dateRange.from) return false;
      if (dateRange.to && timesheet.date > dateRange.to) return false;
      return true;
    });
  }, [timesheets, selectedProject, selectedEmployee, selectedStatus, dateRange]);

  const analytics = useMemo(() => {
    const hoursByProject = projects.map(project => ({
      name: project.name,
      hours: filteredTimesheets
        .filter(t => t.project_id === project.id && t.status === 'approved')
        .reduce((sum, t) => sum + Number(t.hours_worked), 0),
    }));

    const hoursByEmployee = users
      .filter(u => u.role === 'employee')
      .map(employee => ({
        name: employee.full_name,
        hours: filteredTimesheets
          .filter(t => t.employee_id === employee.id && t.status === 'approved')
          .reduce((sum, t) => sum + Number(t.hours_worked), 0),
      }))
      .filter(e => e.hours > 0);

    const statusCounts = {
      draft: filteredTimesheets.filter(t => t.status === 'draft').length,
      submitted: filteredTimesheets.filter(t => t.status === 'submitted').length,
      approved: filteredTimesheets.filter(t => t.status === 'approved').length,
      rejected: filteredTimesheets.filter(t => t.status === 'rejected').length,
    };

    const totalHours = filteredTimesheets
      .filter(t => t.status === 'approved')
      .reduce((sum, t) => sum + Number(t.hours_worked), 0);

    return {
      hoursByProject: hoursByProject.filter(p => p.hours > 0),
      hoursByEmployee,
      statusCounts,
      totalHours,
    };
  }, [filteredTimesheets, projects, users]);

  const maxProjectHours = Math.max(...analytics.hoursByProject.map(p => p.hours), 1);
  const maxEmployeeHours = Math.max(...analytics.hoursByEmployee.map(e => e.hours), 1);

  const exportToCSV = () => {
    const headers = ['Date', 'Employee', 'Project', 'Task', 'Hours', 'Status'];
    const rows = filteredTimesheets.map(t => [
      t.date,
      t.employee?.full_name || '',
      t.project?.name || '',
      t.task_description,
      t.hours_worked,
      t.status,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timesheets_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">Filters</h3>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Project</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white"
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
            <label className="block text-sm font-medium text-slate-700 mb-2">Employee</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white"
            >
              <option value="all">All Employees</option>
              {users
                .filter(u => u.role === 'employee')
                .map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Date From</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Hours by Project</h3>
          <div className="space-y-3">
            {analytics.hoursByProject.length > 0 ? (
              analytics.hoursByProject.map((project, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">{project.name}</span>
                    <span className="text-sm font-semibold text-slate-900">{project.hours.toFixed(1)} hrs</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-slate-900 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(project.hours / maxProjectHours) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm text-center py-4">No data available</p>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Hours by Employee</h3>
          <div className="space-y-3">
            {analytics.hoursByEmployee.length > 0 ? (
              analytics.hoursByEmployee.map((employee, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">{employee.name}</span>
                    <span className="text-sm font-semibold text-slate-900">{employee.hours.toFixed(1)} hrs</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-slate-900 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(employee.hours / maxEmployeeHours) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm text-center py-4">No data available</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Timesheet Status Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-700">{analytics.statusCounts.draft}</p>
            <p className="text-sm text-slate-600 mt-1">Draft</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-700">{analytics.statusCounts.submitted}</p>
            <p className="text-sm text-slate-600 mt-1">Submitted</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-700">{analytics.statusCounts.approved}</p>
            <p className="text-sm text-slate-600 mt-1">Approved</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-700">{analytics.statusCounts.rejected}</p>
            <p className="text-sm text-slate-600 mt-1">Rejected</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Detailed Timesheet Data</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Employee</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Project</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Hours</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTimesheets.slice(0, 50).map((timesheet) => (
                <tr key={timesheet.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-sm text-slate-900">
                    {new Date(timesheet.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-900">
                    {timesheet.employee?.full_name}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-900">
                    {timesheet.project?.name}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-900">
                    {timesheet.hours_worked}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      timesheet.status === 'approved' ? 'bg-green-100 text-green-800' :
                      timesheet.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      timesheet.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {timesheet.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTimesheets.length > 50 && (
            <p className="text-sm text-slate-500 text-center mt-4">
              Showing first 50 of {filteredTimesheets.length} timesheets
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
