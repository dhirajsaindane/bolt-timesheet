import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  LogOut,
  Clock,
  Users,
  BarChart3,
  FolderKanban,
  CheckSquare,
  User
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  title: string;
}

export default function Layout({ children, title }: LayoutProps) {
  const { profile, signOut } = useAuth();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <BarChart3 className="w-4 h-4" />;
      case 'manager':
        return <Users className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-slate-900 p-2 rounded-lg">
                {profile?.role === 'admin' && <BarChart3 className="w-5 h-5 text-white" />}
                {profile?.role === 'manager' && <CheckSquare className="w-5 h-5 text-white" />}
                {profile?.role === 'employee' && <Clock className="w-5 h-5 text-white" />}
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">HRMS</h1>
                <p className="text-xs text-slate-500">Timesheet Management</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">{profile?.full_name}</p>
                  <div className="flex items-center justify-end space-x-1">
                    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(profile?.role || '')}`}>
                      {getRoleIcon(profile?.role || '')}
                      <span className="capitalize">{profile?.role}</span>
                    </span>
                  </div>
                </div>
                <div className="bg-slate-200 p-2 rounded-full">
                  <User className="w-4 h-4 text-slate-600" />
                </div>
              </div>

              <button
                onClick={() => signOut()}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        </div>
        {children}
      </main>
    </div>
  );
}
