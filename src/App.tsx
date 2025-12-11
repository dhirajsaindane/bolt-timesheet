import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import LoadingSpinner from './components/LoadingSpinner';
import EmployeeDashboard from './components/employee/EmployeeDashboard';
import ManagerDashboard from './components/manager/ManagerDashboard';
import AdminDashboard from './components/admin/AdminDashboard';

function AppContent() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user || !profile) {
    return <Login />;
  }

  switch (profile.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'manager':
      return <ManagerDashboard />;
    case 'employee':
      return <EmployeeDashboard />;
    default:
      return <Login />;
  }
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
