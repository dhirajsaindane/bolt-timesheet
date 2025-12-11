import { useState, useEffect } from 'react';
import { supabase, Timesheet, Profile, Project } from '../../lib/supabase';
import Layout from '../Layout';
import { Users, FolderKanban, BarChart3, FileText } from 'lucide-react';
import AnalyticsView from './AnalyticsView';
import UserManagement from './UserManagement';
import ProjectManagement from './ProjectManagement';

type Tab = 'analytics' | 'users' | 'projects';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('analytics');
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const [timesheetsResult, usersResult, projectsResult] = await Promise.all([
      supabase
        .from('timesheets')
        .select('*, project:projects(*), employee:profiles!employee_id(*)')
        .order('date', { ascending: false }),
      supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('projects')
        .select('*')
        .order('name'),
    ]);

    if (timesheetsResult.data) setTimesheets(timesheetsResult.data);
    if (usersResult.data) setUsers(usersResult.data);
    if (projectsResult.data) setProjects(projectsResult.data);

    setLoading(false);
  };

  const stats = {
    totalUsers: users.length,
    employees: users.filter(u => u.role === 'employee').length,
    managers: users.filter(u => u.role === 'manager').length,
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    totalTimesheets: timesheets.length,
    pendingTimesheets: timesheets.filter(t => t.status === 'submitted').length,
    totalHours: timesheets
      .filter(t => t.status === 'approved')
      .reduce((sum, t) => sum + Number(t.hours_worked), 0),
  };

  if (loading) {
    return (
      <Layout title="Admin Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalUsers}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {stats.employees} employees, {stats.managers} managers
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Projects</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalProjects}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {stats.activeProjects} active
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <FolderKanban className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Hours</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalHours.toFixed(1)}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Approved hours
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Timesheets</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalTimesheets}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {stats.pendingTimesheets} pending
                </p>
              </div>
              <div className="bg-slate-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200">
          <div className="border-b border-slate-200">
            <div className="flex space-x-1 p-2">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'users'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>User Management</span>
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'projects'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FolderKanban className="w-4 h-4" />
                <span>Project Management</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'analytics' && (
              <AnalyticsView
                timesheets={timesheets}
                users={users}
                projects={projects}
              />
            )}
            {activeTab === 'users' && (
              <UserManagement
                users={users}
                onUpdate={fetchData}
              />
            )}
            {activeTab === 'projects' && (
              <ProjectManagement
                projects={projects}
                onUpdate={fetchData}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
